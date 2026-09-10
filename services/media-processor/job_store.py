"""FastMedia Downloader - Job Registry persistente (SQLite).

Almacena el estado de cada trabajo de descarga en disco para que las
transiciones del servicio (reinicios por deploy, upgrades de yt-dlp o fallos)
no pierdan silenciosamente los jobs en vuelo: un reinicio marca los trabajos
activos como `interrupted_by_restart` con mensaje amigable en vez de devolver
404 mudo, y los completados sobreviven hasta su TTL.

Disenado para un unico proceso escritor (worker) + lectores; WAL.
Cada operacion abre su propia conexion: sqlite3 en Python no comparte la
misma conexion entre hilos (el worker mezcla threadpool sincrona y tasks en
segundo plano), asi que la conexion se crea por llamada y se cierra al final.
Sin dependencias externas: usa la stdlib (sqlite3).
"""

import sqlite3
import time
from pathlib import Path
from typing import Any, Optional

_SCHEMA = """
CREATE TABLE IF NOT EXISTS jobs (
    job_id      TEXT PRIMARY KEY,
    url         TEXT NOT NULL,
    format_id   TEXT,
    audio_only  INTEGER NOT NULL DEFAULT 0,
    status      TEXT NOT NULL,
    progress    REAL NOT NULL DEFAULT 0.0,
    stage       TEXT NOT NULL DEFAULT '',
    title       TEXT,
    filename    TEXT,
    error       TEXT,
    error_code  TEXT,
    created_at  REAL NOT NULL,
    updated_at  REAL NOT NULL
);"""

_IDX_STATUS = "CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);"

_PUBLIC_FIELDS = ("job_id", "status", "progress", "stage", "title", "filename", "error", "error_code")
_ACTIVE_STATES = ("queued", "downloading", "processing")


class JobStore:
    """Registro persistente de jobs de descarga (SQLite en WAL, thread-safe)."""

    def __init__(self, db_path: str | Path) -> None:
        self._db_path = str(db_path)
        conn = self._connect()
        try:
            conn.executescript(_SCHEMA + _IDX_STATUS)
            conn.commit()
        finally:
            conn.close()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self._db_path, timeout=30)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        conn.execute("PRAGMA busy_timeout=30000;")
        return conn

    def _execute(self, sql: str, params: tuple = ()) -> sqlite3.Row | None:
        conn = self._connect()
        try:
            with conn:
                return conn.execute(sql, params).fetchone()
        finally:
            conn.close()

    def _execute_all(self, sql: str, params: tuple = ()) -> list[sqlite3.Row]:
        conn = self._connect()
        try:
            with conn:
                return conn.execute(sql, params).fetchall()
        finally:
            conn.close()

    def _row_to_job(self, row: sqlite3.Row) -> dict[str, Any]:
        job = dict(row)
        job["audio_only"] = bool(job["audio_only"])
        return job

    def insert(self, job_id: str, url: str, format_id: Optional[str], audio_only: bool) -> None:
        now = time.time()
        self._execute(
            "INSERT INTO jobs "
            "(job_id, url, format_id, audio_only, status, progress, stage, title, filename, error, error_code, created_at, updated_at) "
            "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (
                job_id, url, format_id, int(audio_only),
                "queued", 0.0, "en cola", None, None, None, None,
                now, now,
            ),
        )

    def get(self, job_id: str) -> Optional[dict[str, Any]]:
        row = self._execute("SELECT * FROM jobs WHERE job_id=?", (job_id,))
        return self._row_to_job(row) if row else None

    def public(self, job_id: str) -> Optional[dict[str, Any]]:
        job = self.get(job_id)
        if not job:
            return None
        return {field: job.get(field) for field in _PUBLIC_FIELDS}

    def update(self, job_id: str, **fields: Any) -> None:
        if not fields:
            return
        allowed = {"status", "progress", "stage", "title", "filename", "error", "error_code", "updated_at"}
        sets = {key: value for key, value in fields.items() if key in allowed}
        if not sets:
            return
        sets.setdefault("updated_at", time.time())
        assignments = ", ".join(f"{key}=?" for key in sets)
        self._execute(
            f"UPDATE jobs SET {assignments} WHERE job_id=?", (*sets.values(), job_id)
        )

    def active_count(self) -> int:
        row = self._execute("SELECT COUNT(*) AS n FROM jobs WHERE status IN (?,?,?)", _ACTIVE_STATES)
        return int(row["n"]) if row else 0

    def all(self) -> list[dict[str, Any]]:
        rows = self._execute_all("SELECT * FROM jobs")
        return [self._row_to_job(row) for row in rows]

    def delete(self, job_id: str) -> None:
        self._execute("DELETE FROM jobs WHERE job_id=?", (job_id,))

    def mark_interrupted(self, message: str) -> list[str]:
        """Marca todos los jobs activos como error tras un reinicio.

        Devuelve los job_id afectados para poder limpiar sus directorios.
        """
        conn = self._connect()
        try:
            with conn:
                rows = conn.execute(
                    "SELECT job_id FROM jobs WHERE status IN (?,?,?)", _ACTIVE_STATES
                ).fetchall()
                affected = [str(row["job_id"]) for row in rows]
                if affected:
                    status_placeholders = ",".join("?" for _ in _ACTIVE_STATES)
                    conn.execute(
                        "UPDATE jobs SET status='error', progress=0.0, stage='error', "
                        "error=?, error_code='interrupted_by_restart', updated_at=? "
                        f"WHERE status IN ({status_placeholders})",
                        (message, time.time(), *_ACTIVE_STATES),
                    )
                conn.commit()
        finally:
            conn.close()
        return affected

    def remove_expired(self, ttl_seconds: float) -> list[str]:
        """Elimina jobs terminados pasados su TTL; devuelve los job_id purgados."""
        cutoff = time.time() - ttl_seconds
        conn = self._connect()
        try:
            with conn:
                rows = conn.execute(
                    "SELECT job_id FROM jobs WHERE status IN ('completed','error') AND updated_at < ?",
                    (cutoff,),
                ).fetchall()
                expired = [str(row["job_id"]) for row in rows]
                if expired:
                    placeholders = ",".join("?" for _ in expired)
                    conn.execute(
                        f"DELETE FROM jobs WHERE job_id IN ({placeholders})", expired
                    )
                conn.commit()
        finally:
            conn.close()
        return expired

    def stale_active(self, max_seconds: float) -> list[str]:
        """Marca jobs activos congelados (sin actualizar) como error; devuelve los id."""
        cutoff = time.time() - max_seconds
        conn = self._connect()
        try:
            with conn:
                rows = conn.execute(
                    "SELECT job_id FROM jobs WHERE status IN (?,?,?) AND updated_at < ?",
                    (*_ACTIVE_STATES, cutoff),
                ).fetchall()
                affected = [str(row["job_id"]) for row in rows]
                if affected:
                    status_placeholders = ",".join("?" for _ in _ACTIVE_STATES)
                    conn.execute(
                        "UPDATE jobs SET status='error', progress=0.0, stage='error', "
                        "error=?, error_code='stale', updated_at=? "
                        f"WHERE status IN ({status_placeholders})",
                        ("El trabajo excedio el tiempo maximo de procesamiento",
                         time.time(), *_ACTIVE_STATES),
                    )
                conn.commit()
        finally:
            conn.close()
        return affected

    def known_ids(self) -> set[str]:
        rows = self._execute_all("SELECT job_id FROM jobs")
        return {str(row["job_id"]) for row in rows}