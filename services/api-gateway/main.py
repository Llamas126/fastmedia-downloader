"""FastMedia Downloader - API Gateway / Metadata Service.

Enrutamiento, validaciones y CORS. Extrae metadatos ligeros con yt-dlp
(download=False) y delega las descargas pesadas al microservicio
media-processor, actuando como proxy de estado y streaming de archivos.
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

import ipaddress
import logging
import os
import re
import socket
import sys
import threading
import time
from collections import defaultdict, deque
from pathlib import Path
from typing import Any, Optional
from urllib.parse import quote, urlparse

import httpx
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, field_validator

try:
    from extractor import safe_extract_info, ExtractorError
except ModuleNotFoundError:
    _SHARED_DIR = Path(__file__).resolve().parent.parent / "shared"
    if str(_SHARED_DIR) not in sys.path:
        sys.path.insert(0, str(_SHARED_DIR))
    from extractor import safe_extract_info, ExtractorError

logger = logging.getLogger(__name__)

MEDIA_PROCESSOR_URL = os.getenv("MEDIA_PROCESSOR_URL", "http://localhost:8001").rstrip("/")
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]
# Regex adicional de origenes permitidos (p. ej. previews de Cloudflare Pages).
# Starlette aplica fullmatch: el patron debe cubrir la URL completa.
ALLOWED_ORIGIN_REGEX = os.getenv(
    "ALLOWED_ORIGIN_REGEX", r"^http://localhost(:\d+)?$|.*\.pages\.dev$"
)

RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
DOWNLOADS_PER_MINUTE = int(os.getenv("DOWNLOADS_PER_MINUTE", "10"))
MAX_BODY_BYTES = int(os.getenv("MAX_BODY_BYTES", "65536"))
ALLOW_PRIVATE_URLS = os.getenv("ALLOW_PRIVATE_URLS", "0").lower() in ("1", "true", "yes")
ALLOW_INSECURE_TLS = os.getenv("YTDLP_ALLOW_INSECURE_TLS", "0").lower() in ("1", "true", "yes")

JOB_ID_PATTERN = re.compile(r"^[a-f0-9]{32}$")
FORMAT_ID_PATTERN = re.compile(r"^[A-Za-z0-9_.\-]{1,32}$")

HTTP_TIMEOUT = httpx.Timeout(30.0, connect=10.0)
STREAM_TIMEOUT = httpx.Timeout(None, connect=15.0)

_RATE_LOCK = threading.Lock()
_RATE_HITS: dict[tuple[str, str], deque[float]] = defaultdict(deque)


def _rate_limit(key: tuple[str, str], limit: int, window_seconds: float = 60.0) -> bool:
    """Ventana deslizante en memoria; True si la peticion queda dentro del limite."""
    now = time.monotonic()
    with _RATE_LOCK:
        hits = _RATE_HITS[key]
        while hits and hits[0] <= now - window_seconds:
            hits.popleft()
        if len(hits) >= limit:
            return False
        hits.append(now)
        if len(_RATE_HITS) > 10_000:
            for bucket in [k for k, v in _RATE_HITS.items() if not v]:
                _RATE_HITS.pop(bucket, None)
        return True


def _assert_public_url(url: str) -> None:
    """Bloqueo SSRF basico: resuelve el host y rechaza IPs no publicas."""
    if ALLOW_PRIVATE_URLS:
        return
    hostname = urlparse(url).hostname
    if not hostname:
        raise HTTPException(status_code=400, detail="URL invalida")
    try:
        infos = socket.getaddrinfo(hostname, None)
    except socket.gaierror as exc:
        raise HTTPException(status_code=400, detail="No se pudo resolver el host de la URL") from exc
    for info in infos:
        address = info[4][0].split("%")[0]
        try:
            ip = ipaddress.ip_address(address)
        except ValueError:
            continue
        if not ip.is_global:
            raise HTTPException(status_code=400, detail="La URL apunta a una direccion no publica")


app = FastAPI(
    title="FastMedia Downloader - API Gateway",
    description="Extraccion de metadatos y orquestacion de descargas multimedia.",
    version="1.0.0",
    contact={"name": "Juan Camilo Llamas Cárdenas"},
    license_info={"name": "MIT", "url": "https://opensource.org/licenses/MIT"},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=ALLOWED_ORIGIN_REGEX or None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def abuse_guard(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    content_length = request.headers.get("content-length")
    if content_length and content_length.isdigit() and int(content_length) > MAX_BODY_BYTES:
        return JSONResponse(status_code=413, content={"detail": "Cuerpo de la peticion demasiado grande"})
    if not _rate_limit((client_ip, "general"), RATE_LIMIT_PER_MINUTE):
        return JSONResponse(status_code=429, content={"detail": "Demasiadas peticiones; reintenta mas tarde"})
    if request.method == "POST" and request.url.path == "/api/v1/downloads":
        if not _rate_limit((client_ip, "downloads"), DOWNLOADS_PER_MINUTE):
            return JSONResponse(status_code=429, content={"detail": "Limite de descargas por minuto alcanzado"})
    return await call_next(request)


class DownloadRequest(BaseModel):
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


@app.get("/health")
async def health() -> dict[str, Any]:
    """Health check no bloqueante: reporta tambien el estado del media-processor."""
    status = "ok"
    media = "unreachable"
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            response = await client.get(f"{MEDIA_PROCESSOR_URL}/health")
        media = "ok" if response.status_code == 200 else f"http_{response.status_code}"
    except httpx.HTTPError:
        media = "unreachable"
    if media != "ok":
        status = "degraded"
    return {
        "status": status,
        "service": "api-gateway",
        "dependency": {"media_processor": media},
    }


@app.get("/api/v1/info")
async def get_video_info(
    url: str = Query(..., description="URL del video a analizar", min_length=1, max_length=4096)
) -> dict[str, Any]:
    """Invoca yt-dlp en modo download=False para obtener metadatos y formatos."""
    if len(url) < 8:
        logger.warning("URL demasiado corta: %s", url)
        raise HTTPException(status_code=400, detail="La URL es demasiado corta")
    if len(url) > 4096:
        raise HTTPException(status_code=400, detail="La URL es demasiado larga")
    if not url.lower().startswith(("http://", "https://")):
        logger.warning("URL inv\u00e1lida recibida: %s", url)
        raise HTTPException(status_code=400, detail="URL debe comenzar con http:// o https://")
    _assert_public_url(url)

    try:
        normalized = await safe_extract_info(url)
    except ExtractorError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)

    return {
        "title": normalized.title,
        "thumbnail": normalized.thumbnail,
        "duration": normalized.duration,
        "uploader": normalized.uploader,
        "webpage_url": normalized.webpage_url,
        "formats": [
            {
                "format_id": f.format_id,
                "label": f.label,
                "height": f.height,
                "ext": f.ext,
                "filesize_bytes": f.filesize_bytes,
                "filesize_human": f.filesize_human,
                "audio_only": f.audio_only,
                "url": f.url,
                "vcodec": f.vcodec,
                "acodec": f.acodec,
            }
            for f in normalized.formats
        ],
        "extractor": normalized.extractor,
        "is_live": normalized.is_live,
    }


@app.post("/api/v1/downloads", status_code=202)
async def create_download(request: DownloadRequest) -> dict[str, Any]:
    """Valida la solicitud y delega el trabajo pesado al media-processor."""
    if not request.url.lower().startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="URL invalida")
    _assert_public_url(request.url)

    payload: dict[str, Any] = {"url": request.url}
    if request.audio_only:
        payload["audio_only"] = True
    elif request.format_id:
        payload["format_id"] = request.format_id
    else:
        raise HTTPException(status_code=400, detail="Indica un formato (format_id) o audio_only=true")

    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            response = await client.post(f"{MEDIA_PROCESSOR_URL}/process-media", json=payload)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="El servicio de procesamiento no esta disponible") from exc

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=_extract_detail(response))
    return response.json()


@app.get("/api/v1/downloads/{job_id}")
async def get_download_status(job_id: str) -> dict[str, Any]:
    _ensure_valid_job_id(job_id)
    return await _proxy_job_get(job_id)


@app.get("/api/v1/downloads/{job_id}/file")
async def download_file(job_id: str) -> StreamingResponse:
    """Transmite en proxy el archivo generado por el media-processor."""
    _ensure_valid_job_id(job_id)
    job = await _proxy_job_get(job_id)
    if job.get("status") != "completed":
        raise HTTPException(status_code=409, detail="El archivo aun no esta listo")
    filename = job.get("filename")
    if not filename:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    client = httpx.AsyncClient(timeout=STREAM_TIMEOUT)
    try:
        request = client.build_request("GET", f"{MEDIA_PROCESSOR_URL}/jobs/{job_id}/file")
        upstream = await client.send(request, stream=True)
    except httpx.HTTPError as exc:
        await client.aclose()
        raise HTTPException(status_code=502, detail="El servicio de procesamiento no esta disponible") from exc

    if upstream.status_code >= 400:
        detail = _extract_detail(upstream)
        await upstream.aclose()
        await client.aclose()
        raise HTTPException(status_code=upstream.status_code, detail=detail)

    headers: dict[str, str] = {"Content-Disposition": _content_disposition(filename)}
    content_length = upstream.headers.get("content-length")
    if content_length:
        headers["Content-Length"] = content_length

    async def stream_media():
        try:
            async for chunk in upstream.aiter_bytes(chunk_size=256 * 1024):
                yield chunk
        finally:
            await upstream.aclose()
            await client.aclose()

    return StreamingResponse(
        stream_media(),
        media_type=_guess_media_type(filename),
        headers=headers,
    )


def _ensure_valid_job_id(job_id: str) -> None:
    if not JOB_ID_PATTERN.fullmatch(job_id):
        raise HTTPException(status_code=404, detail="Trabajo no encontrado o expirado")


async def _proxy_job_get(job_id: str) -> dict[str, Any]:
    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            response = await client.get(f"{MEDIA_PROCESSOR_URL}/jobs/{job_id}")
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="El servicio de procesamiento no esta disponible") from exc

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=_extract_detail(response))
    return response.json()


def _extract_detail(response: httpx.Response) -> str:
    try:
        return str(response.json().get("detail") or "Error en el servicio de procesamiento")
    except Exception:  # noqa: BLE001
        return "Error en el servicio de procesamiento"


def _content_disposition(filename: str) -> str:
    """RFC 6266/5987: fallback ASCII + version UTF-8 para nombres unicode."""
    ascii_name = filename.encode("ascii", "ignore").decode().replace('"', "").strip()
    return f'attachment; filename="{ascii_name or "download"}"; filename*=UTF-8\'\'{quote(filename, safe="")}'


def _guess_media_type(filename: str) -> str:
    extension = filename.rsplit(".", 1)[-1].lower()
    return {
        "mp4": "video/mp4",
        "mkv": "video/x-matroska",
        "webm": "video/webm",
        "mp3": "audio/mpeg",
        "m4a": "audio/mp4",
    }.get(extension, "application/octet-stream")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
