# FastMedia Downloader

[![CI Pipeline](https://github.com/Llamas126/fastmedia-downloader/actions/workflows/ci.yml/badge.svg)](https://github.com/Llamas126/fastmedia-downloader/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4ba51d.svg)](CODE_OF_CONDUCT.md)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](SECURITY.md)

**Microservices-Based Video & Media Extractor** — Plataforma web escalable y distribuida para analizar y descargar videos/audio en cualquier calidad (hasta **4K** con combinación de pistas vía **FFmpeg**, o **MP3** solo audio).

> ⚠️ **Aviso legal**: utiliza esta herramienta únicamente con contenido del que tengas derechos o autorización explícita. Respeta los Términos de Servicio de las plataformas origen y las leyes de copyright de tu jurisdicción.

---

## 🏗️ Arquitectura de Microservicios

```
                        ┌─────────────────────────────────────────────┐
                        │            Red interna (bridge)             │
                        │               fastmedia-net                 │
                        │                                             │
 ┌──────────┐   :3000   │  ┌──────────────┐   :8001    ┌───────────┐  │
 │ Usuario  │◄──────────┼──┤   Frontend   │            │   Media   │  │
 │ (Web UI) │           │  │  Next.js 14  │            │ Processor │  │
 └──────────┘           │  └──────┬───────┘            │ yt-dlp +  │  │
                        │         │                    │  FFmpeg   │  │
                        │         ▼        :8000       │           │  │
                        │  ┌──────────────┐  HTTP      │  Jobs +   │  │
                        │  │ API Gateway  │────────────┤  TTL      │  │
                        │  │ FastAPI      │  proxy     └─────┬─────┘  │
                        │  └──────────────┘                  │        │
                        │                                    ▼        │
                        │                          temp_storage/      │
                        │                          (volumen montado)  │
                        └─────────────────────────────────────────────┘
```

| Microservicio | Stack | Puerto | Exposición | Responsabilidad |
|---|---|---|---|---|
| **Frontend** | Next.js 14+, TypeScript, Tailwind CSS, Lucide | `3000` | Pública | UI oscura responsiva: análisis de URL, selección de formato, progreso |
| **API Gateway / Metadata** | FastAPI (Python 3.11), yt-dlp, httpx | `8000` | Pública | Validaciones, CORS, metadatos ligeros (`download=False`), proxy de jobs y archivos |
| **Media Processor** | FastAPI, yt-dlp, FFmpeg | `8001` | Solo red interna | Descarga asíncrona, merge audio/video HD, conversión MP3, limpieza con TTL |

### Flujo de una descarga

1. El usuario pega una URL → el Gateway extrae metadatos y formatos con `yt-dlp` (`download=False`).
2. El usuario elige calidad (4K / 1080p / 720p / … / MP3) → el Gateway valida y delega al Media Processor.
3. El Media Processor crea un job con UUID, descarga en segundo plano y ensambla las pistas con FFmpeg.
4. El frontend hace *polling* del estado cada 2 s; al completar, el archivo se transmite vía proxy desde la red interna y se purga tras el TTL.

---

## 🚀 Inicio rápido (Docker)

Requisito: Docker Desktop (o Engine) con Compose v2.

```bash
docker compose up --build
```

- Interfaz web: <http://localhost:3000>
- API Gateway (docs interactivas): <http://localhost:8000/docs>

Para detener y limpiar:

```bash
docker compose down          # detiene contenedores
docker compose down --rmi all --volumes   # además borra imágenes
```

> Si los puertos `3000`/`8000` están ocupados en tu máquina, define `FRONTEND_PORT` / `API_GATEWAY_PORT` en un archivo `.env` (ver `.env.example`). Recuerda alinear también `NEXT_PUBLIC_API_URL` con el puerto público del Gateway.

---

## 🔧 Desarrollo local (sin Docker)

### Frontend

```bash
cd services/frontend
npm install
npm run dev          # http://localhost:3000
```

### API Gateway (terminal 1)

```bash
cd services/api-gateway
python -m venv .venv && .venv\Scripts\activate     # Windows (Linux/macOS: source .venv/bin/activate)
pip install -r requirements.txt
set MEDIA_PROCESSOR_URL=http://localhost:8001      # Windows (Linux/macOS: export MEDIA_PROCESSOR_URL=...)
set ALLOWED_ORIGINS=http://localhost:3000
uvicorn main:app --reload --port 8000
```

### Media Processor (terminal 2)

```bash
cd services/media-processor
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
# Requiere ffmpeg en PATH: winget install Gyan.FFmpeg  (Windows) / apt install ffmpeg (Debian/Ubuntu)
set TEMP_STORAGE_DIR=./temp_storage                # Linux/macOS: export TEMP_STORAGE_DIR=./temp_storage
uvicorn worker:app --port 8001
```

---

## 📡 API Reference

| Método | Endpoint (Gateway :8000) | Descripción |
|---|---|---|
| `GET` | `/api/v1/info?url=` | Metadatos: título, miniatura, duración, creador + formatos con tamaño estimado (`filesize_bytes` / `filesize_human`) |
| `POST` | `/api/v1/downloads` | Body `{ "url", "format_id"?, "audio_only"? }` → `{ job_id }` (HTTP 202) |
| `GET` | `/api/v1/downloads/{job_id}` | Estado del job: `queued/downloading/processing/completed/error`, progreso % |
| `GET` | `/api/v1/downloads/{job_id}/file` | Streaming del archivo terminado (`Content-Disposition: attachment`) |

> **Errores comunes del Gateway:** `400` URL inválida o que apunta a una IP no pública (bloqueo anti-SSRF) · `409` archivo aún no listo · `410` archivo expirado · `413` cuerpo supera `MAX_BODY_BYTES` · `429` rate limit por IP o cupo de jobs concurrentes lleno · `502` media-processor no disponible.

| Método | Endpoint (Media Processor :8001, red interna) |
|---|---|
| `POST` | `/process-media` |
| `GET` | `/jobs/{job_id}` |
| `GET` | `/jobs/{job_id}/file` |
| `GET` | `/health` |

---

## ⚙️ Variables de entorno

| Variable | Servicio | Default | Descripción |
|---|---|---|---|
| `FRONTEND_PORT` / `API_GATEWAY_PORT` | compose | `3000` / `8000` | Puertos publicados en el host |
| `NEXT_PUBLIC_API_URL` | frontend | `http://localhost:8000` | URL pública del Gateway (se compila en el bundle cliente) |
| `MEDIA_PROCESSOR_URL` | api-gateway | `http://localhost:8001` | URL interna del microservicio de procesamiento |
| `ALLOWED_ORIGINS` | api-gateway | `http://localhost:3000` | Orígenes CORS separados por coma |
| `RATE_LIMIT_PER_MINUTE` | api-gateway | `60` | Rate limit general por IP (peticiones/minuto) |
| `DOWNLOADS_PER_MINUTE` | api-gateway | `10` | Límite de `POST /api/v1/downloads` por IP y minuto |
| `MAX_BODY_BYTES` | api-gateway | `65536` | Tamaño máximo del cuerpo de las peticiones (413 al exceder) |
| `ALLOW_PRIVATE_URLS` | api-gateway | `0` | `1` desactiva el bloqueo anti-SSRF de IPs privadas/loopback |
| `YTDLP_ALLOW_INSECURE_TLS` | gateway + processor | `0` | `1` desactiva la verificación TLS de yt-dlp (no recomendado) |
| `TEMP_STORAGE_DIR` | media-processor | `/app/temp_storage` | Directorio de archivos temporales |
| `FILE_TTL_MINUTES` | media-processor | `30` | Minutos antes de purgar trabajos terminados y sus archivos |
| `MAX_CONCURRENT_JOBS` | media-processor | `3` | Descargas simultáneas; exceder responde `429` |
| `MAX_JOB_MINUTES` | media-processor | `20` | TTL duro: aborta y purga jobs atascados |
| `MAX_FILESIZE_MB` | media-processor | `2048` | Tamaño máximo por archivo descargado |

---

## 🍪 Cookies y plataformas con anti-bot

En VPS con **IPs de datacenter** (p. ej. Oracle Cloud) algunas plataformas bloquean la
extracción o devuelven desafíos anti-bot (CAPTCHA/JS). El API Gateway y el Media
Processor cargan cookies automáticamente si el archivo existe (mismo módulo compartido):

- **Ruta**: `./secrets/cookies.txt` (formato Netscape, montado *read-only* como `/app/secrets/cookies.txt`).
- **Cómo exportarlo**: con el navegador iniciado en el sitio que quieras desbloquear, usa
  una extensión tipo *Get cookies.txt LOCALLY* (o `curl -c cookies.txt <url>`).
- **Variable**: `FMD_COOKIES_FILE` permite cambiar la ruta por defecto.

| Plataforma | ¿Cookies? | Notas |
|---|---|---|
| YouTube | Opcional | Útil en IPs de datacenter (firma NSIG) |
| Pornhub (free) | No | Videos privados/premium requieren sesión |
| Pornhub Premium / embeds | Sí | Requiere sesión activa de Pornhub Premium |
| XVideos | A veces | Dan CAPTCHA tras varios intentos seguidos |
| XNXX | No (free) | Dominios regionales (`.es`, `.tv`, …) ya rutados al extractor nativo |
| Twitch | No | Clips/VOD públicos se extraen sin cookies |
| 4chan | No | Plugin propio (threads y archivos de `i.4cdn.org`) |
| TikTok / Instagram | No | Solo contenido público |

> **Advertencia**: `secrets/cookies.txt` contiene sesiones personales del navegador;
> **nunca lo commitees** (está en `.gitignore`). Revisa `secrets/cookies.txt.example`
> para conocer el formato esperado.

---

## 📁 Estructura del monorepo

```
fastmedia-downloader/
├── docker-compose.yml              # Orquestación: red bridge, volúmenes, healthchecks, límites de recursos
├── .env.example                    # Variables de entorno documentadas (copiar a .env)
├── secrets/                        # cookies.txt local del navegador (gitignored; ver cookies.txt.example)
├── LICENSE                         # MIT © 2026 Juan Camilo Llamas Cárdenas
├── services/
│   ├── frontend/                   # Next.js 14+ (App Router, TS, Tailwind)
│   │   ├── Dockerfile              # Build multietapa (deps → builder → runner standalone)
│   │   ├── package.json
│   │   ├── tailwind.config.ts
│   │   └── src/
│   │       ├── app/                # layout, page (máquina de estados), globals.css
│   │       ├── components/         # UrlForm, MetadataCard, FormatSelector
│   │       └── lib/api.ts          # Cliente tipado del Gateway
│   ├── shared/                     # Módulo yt-dlp compartido por ambos backends
│   │   ├── extractor.py            # Config base, normalización y clasificador de errores
│   │   └── yt_dlp_plugins/         # Plugins propios (4chan, XNXX regional)
│   ├── api-gateway/                # FastAPI :8000
│   │   ├── Dockerfile              # python:3.11-slim
│   │   ├── requirements.txt
│   │   └── main.py
│   └── media-processor/            # FastAPI + yt-dlp + FFmpeg :8001
│       ├── Dockerfile              # python:3.11-slim + apt-get ffmpeg
│       ├── requirements.txt
│       ├── worker.py               # Jobs en memoria, merge HD, janitor TTL
│       └── temp_storage/           # Volumen de descargas temporales (.gitkeep)
```

---

## 🧭 Decisiones técnicas y roadmap

- **Jobs en memoria** (`dict` + lock) dentro del Media Processor: simple y sin dependencias externas para v1. Los jobs no sobreviven reinicios del contenedor (los directorios huérfanos de `temp_storage/` se purgan al arrancar). Ruta de escalado: sustituir por **Redis** + cola (RQ/Celery/arq) para múltiples réplicas horizontales del worker.
- **Progreso por pistas**: en descargas DASH (video+audio separados) la barra puede reiniciarse entre pista de video y pista de audio; es el comportamiento esperado del hook de yt-dlp.
- **Plataformas con anti-bot agresivo** (p. ej. YouTube en datacenters): pueden requerir cookies o tokens; se puede extender pasando `cookiefile` en las opciones de yt-dlp.
- **Detección de streams**: si una página con extractor dedicado o Generic existe pero no expone video (bloqueo JS/cookies), `/api/v1/info` responde `422` con mensaje claro en lugar de `200` con formatos vacíos. Los plugins propios (4chan, XNXX regional) amplían las regex de yt-dlp para que dominios regionales no caigan en el Generic.
- Limpieza automática de `temp_storage/` cada 60 s: archivos terminados con más de `FILE_TTL_MINUTES`, jobs atascados con más de `MAX_JOB_MINUTES`.
- **yt-dlp siempre actualizado**: cada contenedor intenta `pip install --upgrade yt-dlp` al arrancar (best-effort: sin red, arranca con la versión incluida). Previene bloqueos por firmas desactualizadas de las plataformas.
- **Tamaños estimados en la UI**: `/api/v1/info` calcula el peso final sumando video + audio del merge DASH; si la plataforma omite el tamaño, se aproxima con `tbr × duración`. La opción MP3 se estima a 192 kbps.
- **Seguridad y límites**: rate limiting en memoria por IP (`RATE_LIMIT_PER_MINUTE` / `DOWNLOADS_PER_MINUTE`), cuerpo máximo `MAX_BODY_BYTES`, bloqueo anti-SSRF de IPs privadas/loopback, whitelist de `format_id`, TLS verificado por defecto, contenedores Python sin root y con `no-new-privileges` + `cap_drop: ALL` + límites de memoria/CPU por servicio.

---

## 🤝 Comunidad y Contribución

¡Las contribuciones son bienvenidas! Antes de empezar, consulta las guías oficiales del proyecto:

| Guía | Propósito |
|---|---|
| 📘 [Guía de Contribución](CONTRIBUTING.md) | Flujo de trabajo Git, validación local y convención de commits |
| 🛡️ [Código de Conducta](CODE_OF_CONDUCT.md) | Contributor Covenant v2.1 que rige nuestra comunidad |
| 🔐 [Política de Seguridad](SECURITY.md) | Reporte privado de vulnerabilidades vía Security Advisories |

### Flujo rápido / Quick workflow

1. **Haz un Fork** del repositorio.
2. **Crea una rama** desde `main`: `feature/<nombre>` o `fix/<descripción>`.
3. **Realiza tus cambios** con commits siguiendo [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, …).
4. **Valida localmente**: `docker compose build` · `npx tsc --noEmit` (frontend) · `flake8` con `--select=E9,F63,F7,F82` (backends).
5. **Abre un Pull Request** hacia `main` completando la plantilla de PR.

> 🐛 Errores y ✨ funciones se reportan mediante las [plantillas de Issues](.github/ISSUE_TEMPLATE/) · Las dudas generales van a [Discussions](https://github.com/Llamas126/fastmedia-downloader/discussions).

---

## 👤 Autor y Licencia

Desarrollado y mantenido por **Juan Camilo Llamas Cárdenas**.

Este proyecto es de código abierto y uso libre bajo la licencia [MIT](LICENSE). Eres libre de usarlo, modificarlo y distribuirlo respetando los créditos de autoría correspondientes.
