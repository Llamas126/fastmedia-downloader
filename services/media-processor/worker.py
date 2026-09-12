"""FastMedia Downloader - Media Processor Microservice.

Descarga asincrona con yt-dlp, ensamblaje de alta definicion (merge de
pistas audio/video) y conversion de formatos mediante FFmpeg. Gestiona
el ciclo de vida de archivos temporales (UUIDs) y su limpieza post-descarga.
"""

#  _________________________________________________________________
# /                                                                 \
# |   FastMedia Downloader - High-Performance Engine                |
# |   Architecture & Core Implementation                            |
# |                                                                 |
# |   Author: Juan Camilo Llamas Cárdenas                           |
# |   License: MIT (Free & Open Source Use)                         |
# |   Copyright (c) 2026 Juan Camilo Llamas Cárdenas                |
# \_________________________________________________________________/
#               \
#                \   /\___/\
#                   /       \
#                  |  #   #  |
#                  \  ___  /
#                   |     |
#                   |     |      __
#                   |     \_____/  \
#                   |               |
#                    \______/\_____/
#                    /      /
#                   /      /
#                  /__/   /__/

import asyncio
import logging
import os
import re
import shutil
import sys
import threading
import time
import traceback
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Optional

import yt_dlp
from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, field_validator

try:
    from extractor import DOWNLOAD_OPTIONS_BASE, YOUTUBE_CLIENT_FALLBACKS, is_youtube_url
except ModuleNotFoundError:
    _SHARED_DIR = Path(__file__).resolve().parent.parent / "shared"
    if str(_SHARED_DIR) not in sys.path:
        sys.path.insert(0, str(_SHARED_DIR))
    from extractor import DOWNLOAD_OPTIONS_BASE, YOUTUBE_CLIENT_FALLBACKS, is_youtube_url

logger = logging.getLogger(__name__)

TEMP_STORAGE = Path(os.getenv("TEMP_STORAGE_DIR", "/app/temp_storage"))
FILE_TTL_MINUTES = int(os.getenv("FILE_TTL_MINUTES", "30"))
CLEANUP_INTERVAL_SECONDS = 60

JOB_ID_PATTERN = re.compile(r"^[a-f0-9]{32}$")
FORMAT_ID_PATTERN = re.compile(r"^[A-Za-z0-9_.\-]{1,32}$")

MAX_CONCURRENT_JOBS = int(os.getenv("MAX_CONCURRENT_JOBS", "3"))
MAX_JOB_MINUTES = int(os.getenv("MAX_JOB_MINUTES", "20"))
MAX_FILESIZE_MB = int(os.getenv("MAX_FILESIZE_MB", "2048"))
ALLOW_INSECURE_TLS = os.getenv("YTDLP_ALLOW_INSECURE_TLS", "0").lower() in ("1", "true", "yes")

ACTIVE_STATES = ("queued", "downloading", "processing")

JOBS_LOCK = threading.Lock()
JOBS: dict[str, dict[str, Any]] = {}

MEDIA_TYPES = {
    ".mp4": "video/mp4",
    ".mkv": "video/x-matroska",
    ".webm": "video/webm",
    ".mp3": "audio/mpeg",
    ".m4a": "audio/mp4",
}


async def _cleanup_expired_files() -> None:
    """Janitor: purga trabajos terminados pasados el TTL y corta los atascados."""
    while True:
        await asyncio.sleep(CLEANUP_INTERVAL_SECONDS)
        now = time.time()
        ttl_cutoff = now - FILE_TTL_MINUTES * 60
        stale_cutoff = now - MAX_JOB_MINUTES * 60
        expired: list[str] = []
        stale: list[str] = []
        with JOBS_LOCK:
            for job_id, job in JOBS.items():
                if job["status"] in ("completed", "error"):
                    if job["created_at"] < ttl_cutoff:
                        expired.append(job_id)
                elif job["created_at"] < stale_cutoff:
                    job.update({
                        "status": "error",
                        "progress": 0.0,
                        "stage": "error",
                        "error": f"El trabajo excedio el tiempo maximo de {MAX_JOB_MINUTES} minutos",
                    })
                    stale.append(job_id)
        for job_id in expired + stale:
            shutil.rmtree(TEMP_STORAGE / job_id, ignore_errors=True)
        if expired:
            with JOBS_LOCK:
                for job_id in expired:
                    JOBS.pop(job_id, None)


def _sweep_orphan_dirs() -> None:
    """Los jobs viven en memoria y mueren con el contenedor: su directorio tambien."""
    try:
        entries = list(TEMP_STORAGE.iterdir())
    except OSError:
        return
    for entry in entries:
        if entry.is_dir():
            shutil.rmtree(entry, ignore_errors=True)


@asynccontextmanager
async def lifespan(_: FastAPI):
    TEMP_STORAGE.mkdir(parents=True, exist_ok=True)
    _sweep_orphan_dirs()
    janitor = asyncio.create_task(_cleanup_expired_files())
    yield
    janitor.cancel()


app = FastAPI(
    title="FastMedia Downloader - Media Processor",
    description="Descarga y procesamiento de medios con yt-dlp + FFmpeg.",
    version="1.0.0",
    contact={"name": "Juan Camilo Llamas Cárdenas"},
    license_info={"name": "MIT", "url": "https://opensource.org/licenses/MIT"},
    lifespan=lifespan,
)


class ProcessRequest(BaseModel):
    url: str
    format_id: Optional[str] = None
    audio_only: bool = False

    @field_validator("url")
    @classmethod
    def validate_url(cls, value: str) -> str:
        if not value.lower().startswith(("http://", "https://")):
            raise ValueError("La URL debe comenzar con http:// o https://")
        return value

    @field_validator("format_id")
    @classmethod
    def validate_format_id(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and not FORMAT_ID_PATTERN.fullmatch(value):
            raise ValueError("format_id contiene caracteres no permitidos")
        return value


class JobResponse(BaseModel):
    job_id: str
    status: str
    progress: float
    stage: str
    title: Optional[str] = None
    filename: Optional[str] = None
    error: Optional[str] = None


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "media-processor"}


@app.post("/process-media", status_code=202)
def process_media(request: ProcessRequest, background_tasks: BackgroundTasks) -> dict[str, str]:
    """Encola una descarga y responde de inmediato con su identificador."""
    if not request.audio_only and not request.format_id:
        raise HTTPException(status_code=400, detail="Indica un formato (format_id) o audio_only=true")

    job_id = uuid.uuid4().hex
    with JOBS_LOCK:
        active = sum(1 for job in JOBS.values() if job["status"] in ACTIVE_STATES)
        if active >= MAX_CONCURRENT_JOBS:
            raise HTTPException(status_code=429, detail="Servidor ocupado; reintenta en unos momentos")
        JOBS[job_id] = {
            "job_id": job_id,
            "status": "queued",
            "progress": 0.0,
            "stage": "en cola",
            "title": None,
            "filename": None,
            "error": None,
            "created_at": time.time(),
        }

    background_tasks.add_task(_run_job, job_id, request.url, request.format_id, request.audio_only)
    return {"job_id": job_id, "status": "queued"}


@app.get("/jobs/{job_id}", response_model=JobResponse)
def job_status(job_id: str) -> dict[str, Any]:
    if not JOB_ID_PATTERN.fullmatch(job_id):
        raise HTTPException(status_code=404, detail="Trabajo no encontrado o expirado")
    with JOBS_LOCK:
        job = JOBS.get(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Trabajo no encontrado o expirado")
        return {key: value for key, value in job.items() if key != "created_at"}


@app.get("/jobs/{job_id}/file")
def job_file(job_id: str) -> FileResponse:
    if not JOB_ID_PATTERN.fullmatch(job_id):
        raise HTTPException(status_code=404, detail="Trabajo no encontrado o expirado")
    with JOBS_LOCK:
        job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Trabajo no encontrado o expirado")
    if job["status"] != "completed":
        raise HTTPException(status_code=409, detail="El archivo aun no esta listo")

    filename = job.get("filename")
    if not filename:
        logger.error("Job %s completado sin filename registrado", job_id)
        raise HTTPException(status_code=404, detail="Archivo no encontrado para este trabajo")

    path = TEMP_STORAGE / job_id / filename
    if not path.is_file():
        raise HTTPException(status_code=410, detail="El archivo expiro y fue eliminado")

    return FileResponse(
        path,
        media_type=MEDIA_TYPES.get(path.suffix.lower(), "application/octet-stream"),
        filename=path.name,
    )


def _progress_hook(job_id: str):
    """Fabrica de hooks de progreso que actualizan el registro del job."""

    def hook(download: dict[str, Any]) -> None:
        with JOBS_LOCK:
            job = JOBS.get(job_id)
            if not job or job["status"] == "error":
                return
            status = download.get("status")
            if status == "downloading":
                total = download.get("total_bytes") or download.get("total_bytes_estimate") or 0
                downloaded = download.get("downloaded_bytes") or 0
                if total:
                    job["progress"] = round(min(downloaded / total * 100.0, 99.0), 1)
                job["status"] = "downloading"
                job["stage"] = "descargando"
            elif status == "finished":
                job["status"] = "processing"
                job["stage"] = "ensamblando pistas con FFmpeg"

    return hook


def _largest_output_file(job_dir: Path) -> Path:
    candidates = [
        p
        for p in job_dir.iterdir()
        if p.is_file() and not p.name.endswith((".part", ".ytdl", ".temp", ".json"))
    ]
    if not candidates:
        raise FileNotFoundError("No se genero ningun archivo de salida")
    return max(candidates, key=lambda p: p.stat().st_size)


def _mark_job_error(job_id: str, error: str) -> None:
    with JOBS_LOCK:
        if job_id in JOBS:
            JOBS[job_id].update({
                "status": "error",
                "progress": 0.0,
                "stage": "error",
                "error": error,
            })


def _download_with_fallback(options: dict[str, Any], url: str) -> dict[str, Any]:
    """Descarga con yt-dlp; si YouTube falla por nsig/player response se
    reintenta con player clients alternativos antes de rendirse."""
    try:
        with yt_dlp.YoutubeDL(options) as ydl:
            return ydl.extract_info(url, download=True)
    except (yt_dlp.utils.ExtractorError, yt_dlp.utils.DownloadError) as exc:
        if not is_youtube_url(url):
            raise
        logger.info("Reintentando descarga de YouTube con clientes alternativos: %s", url)
        for extra_args in YOUTUBE_CLIENT_FALLBACKS:
            opts = dict(options)
            opts["extractor_args"] = extra_args
            try:
                with yt_dlp.YoutubeDL(opts) as ydl:
                    return ydl.extract_info(url, download=True)
            except (yt_dlp.utils.ExtractorError, yt_dlp.utils.DownloadError):
                continue
        raise exc


def _run_job(job_id: str, url: str, format_id: Optional[str], audio_only: bool) -> None:
    """Tarea en segundo plano: descarga con yt-dlp + post-proceso FFmpeg."""
    job_dir = TEMP_STORAGE / job_id
    try:
        job_dir.mkdir(parents=True, exist_ok=True)

        # Usar opciones base robustas del módulo compartido
        options: dict[str, Any] = {
            **DOWNLOAD_OPTIONS_BASE,
            "outtmpl": str(job_dir / "%(title).180B.%(ext)s"),
            "max_filesize": MAX_FILESIZE_MB * 1024 * 1024,
            "progress_hooks": [_progress_hook(job_id)],
        }

        if audio_only:
            options.update({
                "format": "bestaudio/best",
                "postprocessors": [{
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "mp3",
                    "preferredquality": "192",
                }],
            })
        else:
            # Para formatos directos (TikTok, IG, X): descarga directa sin merge.
            # format_id sintéticos ("direct"/"audio_direct") se traducen a "best".
            # Para YouTube con tracks separados: merge de video+audio.
            if format_id in ("direct", "audio_direct"):
                options.update({"format": "best"})
            elif format_id:
                options.update({
                    "format": f"{format_id}+bestaudio/best",
                    "merge_output_format": "mp4",
                })
            else:
                options.update({
                    "format": "bestvideo+bestaudio/best",
                    "merge_output_format": "mp4",
                })

        info = _download_with_fallback(options, url)
        title = (info or {}).get("title")

        output_file = _largest_output_file(job_dir)
        logger.info("Job %s completado: %s (%d bytes)", job_id, output_file.name, output_file.stat().st_size)
        with JOBS_LOCK:
            job = JOBS.get(job_id)
            if job is not None:
                job.update({
                    "status": "completed",
                    "progress": 100.0,
                    "stage": "completado",
                    "title": title,
                    "filename": output_file.name,
                })
    except yt_dlp.utils.GeoRestrictedError as exc:
        logger.error("GeoRestrictedError descargando %s: %s", url, traceback.format_exc())
        _mark_job_error(job_id, "El video no está disponible en tu región")
        shutil.rmtree(job_dir, ignore_errors=True)
    except yt_dlp.utils.DownloadError as exc:
        logger.error("Error descargando %s: %s", url, traceback.format_exc())
        _mark_job_error(job_id, "Error de descarga: " + str(exc)[:400])
        shutil.rmtree(job_dir, ignore_errors=True)
    except yt_dlp.utils.ExtractorError as exc:
        logger.error("Error de extracción para %s: %s", url, traceback.format_exc())
        _mark_job_error(job_id, "Error de extracción: " + str(exc)[:400])
        shutil.rmtree(job_dir, ignore_errors=True)
    except Exception as exc:
        logger.exception("Error inesperado en job %s: %s", job_id, exc)
        _mark_job_error(job_id, "Error interno: " + str(exc)[:400])
        shutil.rmtree(job_dir, ignore_errors=True)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
