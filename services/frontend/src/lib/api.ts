//  _________________________________________________________________
// /                                                                 \
// |   FastMedia Downloader - High-Performance Engine                |
// |   Architecture & Core Implementation                            |
// |                                                                 |
// |   Author: Juan Camilo Llamas Cárdenas                           |
// |   License: MIT (Free & Open Source Use)                         |
// |   Copyright (c) 2026 Juan Camilo Llamas Cárdenas                |
// \_________________________________________________________________/
//               \
//                \   /\___/\
//                   /       \
//                  |  #   #  |
//                  \  ___  /
//                   |     |
//                   |     |      __
//                   |     \_____/  \
//                   |               |
//                    \______/\_____/
//                    /      /
//                   /      /
//                  /__/   /__/

// Cliente tipado del API Gateway de FastMedia Downloader.

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const AUDIO_FORMAT_ID = "bestaudio";

export interface VideoFormat {
  format_id: string;
  label: string;
  height?: number;
  ext?: string | null;
  filesize_approx?: number | null;
  filesize_bytes?: number | null;
  filesize_human?: string | null;
  audio_only?: boolean;
  url?: string;           // URL directa para streams sin formatos múltiples (TikTok, IG, X, etc.)
  vcodec?: string | null; // codec de video
  acodec?: string | null; // codec de audio
}

export interface MediaInfo {
  title: string | null;
  thumbnail: string | null;
  duration: number | null;
  uploader: string | null;
  webpage_url: string;
  formats: VideoFormat[];
  extractor?: string;     // nombre del extractor (youtube, tiktok, instagram, etc.)
  is_live?: boolean;      // flag para contenido en vivo
}

export type JobState = "queued" | "downloading" | "processing" | "completed" | "error";

export interface JobStatus {
  job_id: string;
  status: JobState;
  progress: number;
  stage: string;
  title: string | null;
  filename: string | null;
  error: string | null;
}

async function parseResponse<T>(response: Response): Promise<T> {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    /* cuerpo vacio o no JSON */
  }
  if (!response.ok) {
    const detail =
      typeof body === "object" && body !== null && "detail" in body
        ? (body as { detail?: unknown }).detail
        : null;

    // FastAPI 422 validation errors return array of {loc, msg, type}
    let message: string;
    if (Array.isArray(detail)) {
      message = detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(", ");
    } else if (typeof detail === "string") {
      message = detail;
    } else if (detail && typeof detail === "object") {
      const err = detail as { message?: string; msg?: string };
      message = err.message || err.msg || `Error ${response.status}`;
    } else {
      message = `Error ${response.status}`;
    }
    throw new Error(message);
  }
  return body as T;
}

const NETWORK_ERROR_MESSAGE =
  "No se pudo conectar con el servicio. Revisa tu conexión o inténtalo de nuevo.";

async function apiFetch<T>(resource: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(resource, init);
  } catch (error) {
    console.error("FastMedia: fallo de red al consultar la API", error);
    throw new Error(NETWORK_ERROR_MESSAGE);
  }
  return parseResponse<T>(response);
}

export async function analyzeUrl(url: string): Promise<MediaInfo> {
  return apiFetch<MediaInfo>(`${API_BASE}/api/v1/info?url=${encodeURIComponent(url)}`, {
    cache: "no-store",
  });
}

export interface StartDownloadPayload {
  url: string;
  format_id?: string;
  audio_only?: boolean;
}

export async function startDownload(payload: StartDownloadPayload): Promise<{ job_id: string }> {
  return apiFetch<{ job_id: string }>(`${API_BASE}/api/v1/downloads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  return apiFetch<JobStatus>(`${API_BASE}/api/v1/downloads/${jobId}`, { cache: "no-store" });
}

const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_URL ?? API_BASE;

export function getFileUrl(jobId: string): string {
  return `${MEDIA_BASE}/api/v1/downloads/${jobId}/file`;
}

export function formatDuration(totalSeconds: number | null): string {
  if (!totalSeconds || totalSeconds < 0) return "--:--";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 100 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}
