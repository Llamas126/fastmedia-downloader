FROM python:3.11-slim

LABEL org.opencontainers.image.title="FastMedia Downloader — Media Processor" \
      org.opencontainers.image.description="Descarga y procesamiento de medios con yt-dlp + FFmpeg" \
      org.opencontainers.image.authors="Juan Camilo Llamas Cárdenas" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.copyright="Copyright (c) 2026 Juan Camilo Llamas Cárdenas" \
      org.opencontainers.image.version="1.0.0"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONPATH=/app/shared

# FFmpeg: imprescindible para el merge de pistas HD y la conversion a MP3
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY services/media-processor/requirements.txt .
RUN pip install -r requirements.txt

COPY services/media-processor/worker.py .
COPY services/media-processor/job_store.py .
COPY services/shared /app/shared

# dir de temporales pre-creado con ownership de appuser: el volumen nombrado
# media-storage copia estos permisos al inicializarse (uid 1001 escribible).
RUN useradd --system --uid 1001 --create-home appuser \
 && mkdir -p /app/temp_storage \
 && chown -R appuser:appuser /app

USER appuser

EXPOSE 8001

HEALTHCHECK --interval=15s --timeout=5s --start-period=60s --retries=5 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/health').read()" || exit 1

CMD ["uvicorn", "worker:app", "--host", "0.0.0.0", "--port", "8001"]