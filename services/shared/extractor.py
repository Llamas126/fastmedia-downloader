"""Capa de normalización y configuración robusta de yt-dlp para multi-plataforma."""

import logging
import os
import re
import traceback
from dataclasses import dataclass
from typing import Any, Optional
from urllib.parse import urlparse

import yt_dlp
from fastapi.concurrency import run_in_threadpool

logger = logging.getLogger(__name__)

# ============================================================
# CONFIGURACIÓN BASE ROBUSTA PARA TODAS LAS PLATAFORMAS
# ============================================================

COOKIES_PATH = os.getenv("FMD_COOKIES_FILE", "").strip() or "/app/cookies.txt"
ALLOW_INSECURE_TLS = os.getenv("YTDLP_ALLOW_INSECURE_TLS", "0").lower() in ("1", "true", "yes")

# Clientes alternativos de YouTube para esquivar fallos transitorios de
# extracción (nsig, player response, throttling). Se prueban en orden.
YOUTUBE_CLIENT_FALLBACKS: list[dict[str, Any]] = [
    {"youtube": {"player_client": ["android"]}},
    {"youtube": {"player_client": ["tv"]}},
    {"youtube": {"player_client": ["web"]}},
    {"youtube": {"player_client": ["android_vr"]}},
]


def merge_extractor_args(
    base: Optional[dict[str, Any]], override: Optional[dict[str, Any]]
) -> dict[str, Any]:
    """Fusiona extractor_args de yt-dlp conservando las claves base.

    Solo reemplaza lo que el override define (p. ej. player_client) y
    mantiene el resto (player_skip) en cada reintento de cliente.
    """
    result: dict[str, Any] = dict(base) if base else {}
    if not override:
        return result
    for key, value in override.items():
        current = result.get(key)
        if isinstance(current, dict) and isinstance(value, dict):
            result[key] = {**current, **value}
        else:
            result[key] = value
    return result


def is_youtube_url(url: str) -> bool:
    host = (urlparse(url).hostname or "").lower()
    return host.endswith("youtube.com") or host.endswith("youtu.be")


def _get_base_options(skip_download: bool = True) -> dict[str, Any]:
    """Construye opciones base con cookies opcionales."""
    options: dict[str, Any] = {
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "extract_flat": "in_playlist",
        "skip_download": skip_download,
        "socket_timeout": 15,
        "nocheckcertificate": ALLOW_INSECURE_TLS,
        "geo_bypass": True,
        "geo_bypass_country": "ES",
        "http_headers": {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/127.0.0.0 Safari/537.36"
            ),
            "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Sec-Fetch-Mode": "navigate",
        },
        "extractor_retries": 3,
        "fragment_retries": 3,
        "skip_unavailable_fragments": True,
        # Selector de formato por defecto robusto: prefiere video+audio
        # separados y cae al mejor formato simple si el streaming no los separa.
        "format": "bestvideo+bestaudio/best",
        # Clientes móviles de YouTube prioritarios desde el primer intento.
        # En redes de datacenter (Oracle Cloud, VPS) el cliente web por
        # defecto dispara "The page needs to be reloaded" (firma NSIG).
        # android/ios no exigen la firma del cliente web; web queda como
        # respaldo ante errores de formatos o geobloqueo.
        "extractor_args": {
            "youtube": {
                "player_client": ["android", "ios", "web"],
                "player_skip": ["configs"],
            }
        },
    }
    if os.path.exists(COOKIES_PATH):
        options["cookiefile"] = COOKIES_PATH
        logger.info("Cookies cargadas desde %s", COOKIES_PATH)
    elif os.getenv("FMD_COOKIES_FILE"):
        logger.warning("FMD_COOKIES_FILE configurado pero el archivo no existe: %s", COOKIES_PATH)
    return options


BASE_EXTRACTOR_OPTIONS = _get_base_options(skip_download=True)

DOWNLOAD_OPTIONS_BASE = _get_base_options(skip_download=False)
DOWNLOAD_OPTIONS_BASE.update({
    "noplaylist": True,
    "socket_timeout": 30,
    "retries": 3,
    "fragment_retries": 10,
    "max_filesize": 2048 * 1024 * 1024,
    "windowsfilenames": True,
})


# ============================================================
# MODELOS DE DATOS NORMALIZADOS
# ============================================================

@dataclass
class NormalizedFormat:
    format_id: str
    label: str
    height: Optional[int] = None
    ext: Optional[str] = None
    filesize_bytes: Optional[int] = None
    filesize_human: Optional[str] = None
    url: Optional[str] = None
    audio_only: bool = False
    vcodec: Optional[str] = None
    acodec: Optional[str] = None


@dataclass
class NormalizedMediaInfo:
    title: str
    thumbnail: Optional[str]
    duration: int
    uploader: Optional[str]
    webpage_url: str
    formats: list[NormalizedFormat]
    is_live: bool = False
    extractor: Optional[str] = None


# ============================================================
# FUNCIONES DE EXTRACCIÓN ASÍNCRONA (NO BLOQUEANTE)
# ============================================================

async def extract_info_async(url: str, download: bool = False) -> dict[str, Any]:
    """Ejecuta yt-dlp en thread pool para no bloquear el Event Loop de FastAPI.

    Si la extracción de YouTube falla por un motivo transitorio (nsig,
    player response, throttling) se reintenta con player clients
    alternativos antes de propagar el error.
    """
    options = _get_base_options(skip_download=not download)

    def _extract(extra_args: Optional[dict[str, Any]] = None, reset: bool = False) -> dict[str, Any]:
        opts = dict(options)
        if reset:
            opts.pop("extractor_args", None)
        elif extra_args:
            opts["extractor_args"] = merge_extractor_args(options.get("extractor_args"), extra_args)
        with yt_dlp.YoutubeDL(opts) as ydl:
            return ydl.extract_info(url, download=download)

    try:
        return await run_in_threadpool(_extract)
    except (yt_dlp.utils.ExtractorError, yt_dlp.utils.DownloadError) as exc:
        if not is_youtube_url(url):
            raise
        for extra_args in YOUTUBE_CLIENT_FALLBACKS:
            logger.info("Fallback de cliente YouTube (%s) para %s", extra_args, url)
            try:
                return await run_in_threadpool(_extract, extra_args)
            except (yt_dlp.utils.ExtractorError, yt_dlp.utils.DownloadError):
                continue
        # Ultimo respaldo: extraccion por defecto de yt-dlp (sin extractor_args).
        # Algunos videos antiguos/atipicos no exponen formatos con los clientes
        # forzados; la extraccion por defecto los resuelve.
        try:
            logger.info("Fallback extraccion por defecto (sin extractor_args) para %s", url)
            return await run_in_threadpool(_extract, reset=True)
        except (yt_dlp.utils.ExtractorError, yt_dlp.utils.DownloadError):
            pass
        raise exc


# ============================================================
# NORMALIZADOR PRINCIPAL - MANEJA TODAS LAS PLATAFORMAS
# ============================================================

def _to_int(value: Any, default: Optional[int] = None) -> Optional[int]:
    """Convierte a int tolerando strings; None si no es convertible."""
    try:
        if value is None:
            return default
        return int(float(value))
    except (TypeError, ValueError):
        return default


def _to_float(value: Any, default: Optional[float] = None) -> Optional[float]:
    """Convierte a float tolerando strings; None si no es convertible."""
    try:
        if value is None:
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def normalize_info(raw_info: dict[str, Any], original_url: str) -> NormalizedMediaInfo:
    """Normaliza la respuesta cruda de yt-dlp a estructura consistente."""
    info = _resolve_first_entry(raw_info)

    if info is None:
        raise ValueError("No se pudo extraer información válida")

    title = _extract_title(info)
    thumbnail = _extract_thumbnail(info)
    duration = _to_int(info.get("duration")) or 0
    uploader = info.get("uploader") or info.get("channel") or info.get("creator")
    webpage_url = info.get("webpage_url") or info.get("url") or original_url
    is_live = info.get("is_live", False)
    extractor = info.get("extractor_key") or info.get("extractor")

    formats = _normalize_formats(info, duration)

    return NormalizedMediaInfo(
        title=title,
        thumbnail=thumbnail,
        duration=duration,
        uploader=uploader,
        webpage_url=webpage_url,
        formats=formats,
        is_live=is_live,
        extractor=extractor,
    )


def _resolve_first_entry(info: dict[str, Any]) -> Optional[dict[str, Any]]:
    """Resuelve playlists/carruseles al primer elemento válido."""
    if info.get("_type") == "playlist" and info.get("entries"):
        for entry in info["entries"]:
            if entry and entry.get("_type") != "playlist":
                logger.info("Playlist detectada, usando primer entry: %s", entry.get("id"))
                return entry
        return None

    if info.get("entries") and not info.get("_type"):
        for entry in info["entries"]:
            if entry and (entry.get("url") or entry.get("formats")):
                return entry

    return info


def _extract_title(info: dict[str, Any]) -> str:
    title = (
        info.get("title")
        or info.get("description", "")[:50]
        or info.get("alt_title")
        or info.get("track")
        or "Video sin título"
    )
    return title.strip()[:200]


def _extract_thumbnail(info: dict[str, Any]) -> Optional[str]:
    if info.get("thumbnail"):
        return info["thumbnail"]
    thumbnails = info.get("thumbnails") or []
    for t in reversed(thumbnails):
        if t.get("url"):
            return t["url"]
    return None


def _normalize_formats(info: dict[str, Any], duration: int) -> list[NormalizedFormat]:
    """Normaliza formatos para TODAS las plataformas."""
    formats: list[NormalizedFormat] = []
    raw_formats = info.get("formats") or []

    if raw_formats:
        formats = _process_format_list(raw_formats, duration)

    if not formats and info.get("url"):
        best_raw = _best_raw_format(info)
        height = _derive_height(best_raw) if best_raw else None
        ext = (best_raw or {}).get("ext") or info.get("ext") or "mp4"
        url = (best_raw or {}).get("url") or info.get("url")
        formats.append(NormalizedFormat(
            format_id="direct",
            label=_height_to_label(height) if height else "Calidad original",
            height=height,
            ext=ext,
            url=url,
            filesize_bytes=_estimate_size(info),
            filesize_human=_human_size(_estimate_size(info)),
            vcodec=(best_raw or info).get("vcodec"),
            acodec=(best_raw or info).get("acodec"),
        ))

    if not formats and info.get("acodec") not in (None, "none"):
        formats.append(NormalizedFormat(
            format_id="audio_direct",
            label="Audio original",
            audio_only=True,
            ext=info.get("ext") or "mp3",
            url=info.get("url"),
            acodec=info.get("acodec"),
        ))

    if duration > 0 and not any(f.audio_only for f in formats):
        mp3_size = int(192 * 1000 / 8 * duration)
        formats.append(NormalizedFormat(
            format_id="bestaudio",
            label="Solo Audio (MP3)",
            audio_only=True,
            ext="mp3",
            filesize_bytes=mp3_size,
            filesize_human=_human_size(mp3_size),
        ))

    return formats


def _derive_height(fmt: dict[str, Any]) -> Optional[int]:
    """Deriva la altura en pixeles del formato si no viene explicita.

    Varios extractores (XNXX, XVideos, Generic) publican formatos sin
    height ni vcodec; la resolucion suele vivir en 'resolution' ("WxH").
    """
    height = _to_int(fmt.get("height"))
    if height:
        return height

    res = fmt.get("resolution")
    if isinstance(res, str) and "x" in res:
        parts = res.lower().split("x")
        if len(parts) == 2:
            h = _to_int(parts[1])
            if h:
                return h

    width = _to_int(fmt.get("width"))
    if width and width >= 320:
        return round(width * 9 / 16)

    note = f"{fmt.get('format_id', '')} {fmt.get('format_note', '')}"
    m = re.search(r"(\d{2,4})p", note)
    if m:
        return int(m.group(1))
    return None


def _format_label(fmt: dict[str, Any], format_id: str) -> str:
    """Etiqueta legible para formatos sin resolucion conocida."""
    note = f"{format_id} {fmt.get('format_note', '')}"
    m = re.search(r"(\d{2,4})p", note)
    if m:
        return f"{m.group(1)}p"
    return "Calidad original"


def _best_raw_format(info: dict[str, Any]) -> Optional[dict[str, Any]]:
    """El mejor formato crudo (max height/tbr) con URL directa."""
    candidates = [f for f in (info.get("formats") or []) if f.get("url")]
    if not candidates:
        return None
    return max(
        candidates,
        key=lambda f: (_inherit_height(f) or 0, _to_float(f.get("tbr")) or 0),
    )


def _inherit_height(fmt: dict[str, Any]) -> int:
    return _derive_height(fmt) or 0


def _process_format_list(raw_formats: list[dict], duration: int) -> list[NormalizedFormat]:
    """Normaliza formatos crudos de yt-dlp por resolucion.

    No descarta entradas sin height/vcodec: XNXX y XVideos publican HLS sin
    vcodec y progressive sin resolucion. Solo se omiten los audios puros
    (vcodec == "none") y los formatos sin URL.
    """
    best_by_height: dict[int, NormalizedFormat] = {}
    best_score: dict[int, float] = {}
    seen_urls: set[str] = set()

    for fmt in raw_formats:
        url = fmt.get("url") or fmt.get("manifest_url")
        format_id = fmt.get("format_id")
        if not url or not format_id:
            continue
        if fmt.get("vcodec") == "none":
            continue
        if url in seen_urls:
            continue
        seen_urls.add(url)

        height = _derive_height(fmt)
        filesize = _to_int(fmt.get("filesize")) or _to_int(fmt.get("filesize_approx"))
        if not filesize and duration > 0:
            tbr = _to_float(fmt.get("tbr"))
            if tbr:
                filesize = int(tbr * 1000 / 8 * duration)

        score = _to_float(fmt.get("tbr")) or filesize or 0

        nf = NormalizedFormat(
            format_id=str(format_id),
            label=_height_to_label(height) if height else _format_label(fmt, str(format_id)),
            height=height,
            ext=fmt.get("ext"),
            filesize_bytes=filesize,
            filesize_human=_human_size(filesize),
            vcodec=fmt.get("vcodec"),
            acodec=fmt.get("acodec"),
        )

        key = height or 0
        current = best_by_height.get(key)
        if current is None or score > best_score.get(key, 0):
            best_by_height[key] = nf
            best_score[key] = score

    return [best_by_height[h] for h in sorted(best_by_height.keys(), reverse=True)]


def _height_to_label(height: int) -> str:
    labels = {
        4320: "8K", 2880: "5K", 2160: "4K", 1440: "1440p",
        1080: "1080p", 720: "720p", 480: "480p", 360: "360p",
        240: "240p", 144: "144p",
    }
    return labels.get(height, f"{height}p")


def _estimate_size(info: dict[str, Any]) -> Optional[int]:
    filesize = _to_int(info.get("filesize")) or _to_int(info.get("filesize_approx"))
    if filesize:
        return int(filesize)
    duration = _to_float(info.get("duration")) or 0
    tbr = _to_float(info.get("tbr"))
    if tbr and duration:
        return int(tbr * 1000 / 8 * duration)
    return None


def _human_size(size_bytes: Optional[int]) -> Optional[str]:
    if not size_bytes or size_bytes <= 0:
        return None
    value = float(size_bytes)
    for unit in ("B", "KB", "MB", "GB"):
        if value < 1024 or unit == "GB":
            decimals = 0 if unit == "B" else 1
            return f"{value:.{decimals}f} {unit}".replace(".0 ", " ")
        value /= 1024
    return None


# ============================================================
# MANEJO DE ERRORES CENTRALIZADO
# ============================================================

class ExtractorError(Exception):
    def __init__(self, message: str, status_code: int = 400, original: Optional[Exception] = None):
        self.message = message
        self.status_code = status_code
        self.original = original
        super().__init__(message)


def _classify_ytdlp_error(exc: Exception, url: str) -> ExtractorError:
    """Traduce un error de yt-dlp a un ExtractorError con estado HTTP coherente.

    Las categorías aplican para todas las plataformas (bot-check, geo,
    contenido privado/eliminado, login/18+...). Solo se usa 422 cuando la
    plataforma realmente no es soportada o el error es estructural.
    """
    if isinstance(exc, yt_dlp.utils.GeoRestrictedError):
        return ExtractorError("El contenido no está disponible en tu región", 403, original=exc)

    msg = str(exc).lower()
    host = urlparse(url).hostname or url

    if any(t in msg for t in ("geo", "country", "not available in your country")):
        return ExtractorError("El contenido no está disponible en tu región", 403, original=exc)

    if any(t in msg for t in ("try again later", "rate-limit", "rate limited", "too many requests", "429")):
        return ExtractorError("La plataforma limitó las peticiones; inténtalo más tarde", 429, original=exc)

    http_m = re.search(r"http error (?P<code>\d{3})", msg)
    if http_m:
        code = int(http_m.group("code"))
        if code == 429:
            return ExtractorError("La plataforma limitó las peticiones; inténtalo más tarde", 429, original=exc)
        if code in (404, 451):
            return ExtractorError("El contenido fue eliminado o ya no está disponible", 400, original=exc)
        if code == 410:
            return ExtractorError(
                "El enlace está muerto: el video fue eliminado o la URL cambió", 410, original=exc)
        if code == 401:
            return ExtractorError("El contenido requiere autenticación o verificación de edad", 401, original=exc)
        if code in (400, 405):
            return ExtractorError("Solicitud inválida o formato no soportado por la plataforma", 400, original=exc)
        if 500 <= code < 600:
            return ExtractorError(
                "Error temporal en la plataforma; inténtalo de nuevo en unos segundos", 429, original=exc)
        if code == 403:
            return ExtractorError(
                "El contenido no está disponible en tu región, fue removido o la plataforma bloquea el acceso",
                403,
                original=exc,
            )

    if "unsupported url" in msg:
        return ExtractorError(
            "No se detectó un stream de video/audio descargable en la página; "
            "la plataforma puede no estar soportada o estar bloqueada (cookies/captcha)",
            422,
            original=exc,
        )

    if "no video found" in msg:
        return ExtractorError(
            "No se detectó contenido de video/audio en la página; puede estar bloqueada (cookies/captcha) "
            "o requerir iniciar sesión",
            422,
            original=exc,
        )

    if "no video formats" in msg or "no playable sources" in msg or "no contiene video" in msg:
        if is_youtube_url(url):
            return ExtractorError(
                "Error temporal en la plataforma; inténtalo de nuevo en unos segundos", 429, original=exc)
        return ExtractorError("El contenido no expone un stream de video descargable en esta página", 400, original=exc)

    if "redirection" in msg:
        return ExtractorError("El contenido fue eliminado o requiere iniciar sesión", 410, original=exc)

    transient = any(
        t in msg
        for t in (
            "nsig", "player response", "throttl", "timed out", "http error",
            "bad request", "unable to extract", "requested format", "initial player",
            "connection", "timeout", "temporary",
        )
    )
    if transient:
        return ExtractorError("Error temporal en la plataforma; inténtalo de nuevo en unos segundos", 429, original=exc)

    if any(t in msg for t in ("sign in", "confirm you", "verify you", "bot", "captcha")):
        return ExtractorError(
            "La plataforma pide verificación anti-bot o captcha; inténtalo más tarde", 400, original=exc)

    if any(t in msg for t in ("private", "deleted", "removed", "unavailable", "not available", "no longer")):
        return ExtractorError("El contenido es privado, fue eliminado o no está disponible", 400, original=exc)

    if any(t in msg for t in ("age", "18+", "adult content", "mature content", "verify your age", "confirm your age")):
        return ExtractorError("El contenido requiere verificación de edad (18+)", 401, original=exc)

    if any(t in msg for t in ("login", "auth", "cookies", "terminal", "membership", "premium")):
        return ExtractorError("El contenido requiere autenticación o una sesión con cookies", 401, original=exc)

    if is_youtube_url(url):
        return ExtractorError("No se pudo extraer el video de YouTube", 400, original=exc)

    return ExtractorError(
        f"No se pudo extraer el contenido de {host} o la plataforma no es soportada", 422, original=exc)


async def safe_extract_info(url: str) -> NormalizedMediaInfo:
    """Wrapper seguro que captura errores específicos de yt-dlp."""
    try:
        raw_info = await extract_info_async(url, download=False)

        if raw_info is None:
            raise ExtractorError("No se encontró contenido en la URL", 404)

        result = normalize_info(raw_info, url)
        if result.is_live:
            raise ExtractorError(
                "El contenido es una transmisión en vivo y no se puede descargar como archivo; usa un clip o VOD",
                400,
            )
        if not result.formats:
            raise ExtractorError(
                "No se detectó ningún stream de video/audio descargable en la página; "
                "puede estar bloqueada (cookies/captcha) o requerir iniciar sesión",
                422,
            )
        return result

    except yt_dlp.utils.GeoRestrictedError as exc:
        logger.error("GeoRestrictedError procesando %s: %s", url, traceback.format_exc())
        raise ExtractorError("El video no está disponible en tu región", 403, original=exc)

    except (yt_dlp.utils.DownloadError, yt_dlp.utils.ExtractorError) as exc:
        logger.error("%s procesando %s: %s",
                     type(exc).__name__, url, traceback.format_exc())
        raise _classify_ytdlp_error(exc, url)

    except yt_dlp.utils.UnsupportedError as exc:
        logger.error("UnsupportedError procesando %s: %s", url, traceback.format_exc())
        raise ExtractorError(
            "La página no expuso un stream de video/audio detectable; "
            "puede estar bloqueada (cookies/captcha) o requerir iniciar sesión",
            422,
            original=exc,
        )

    except ValueError as exc:
        logger.error("Error de validación para %s: %s", url, traceback.format_exc())
        raise ExtractorError(str(exc), 400)

    except Exception:
        logger.exception("Error inesperado procesando %s", url)
        raise ExtractorError("Error interno del servidor", 500)
