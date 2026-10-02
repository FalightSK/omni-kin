"""Integrity, provenance, and input-safety helpers for OmniKin."""

from __future__ import annotations

import hashlib
import math
import re
import time
from pathlib import Path
from typing import Any

EPISODE_MANIFEST_VERSION = 1
PROCESSING_VERSION = "integrity-v1"
VSLAM_PROCESSING_VERSION = "aruco-feature-exclusion-v2"
MAX_UPLOAD_BYTES = 500 * 1024 * 1024
MAX_JSON_BYTES = 2 * 1024 * 1024
MAX_URDF_BYTES = 1 * 1024 * 1024
_SLUG = re.compile(r"^[a-z0-9][a-z0-9_-]{0,63}$")


def utc_timestamp() -> float:
    return time.time()


def sha256_file(path: str | Path) -> str:
    digest = hashlib.sha256()
    with open(path, "rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def frame_timestamps(frame_count: int, fps: float) -> list[float]:
    if frame_count <= 0 or not math.isfinite(fps) or fps <= 0:
        raise ValueError("frame_count must be positive and fps must be finite and positive")
    return [index / fps for index in range(frame_count)]


def dataset_slug(value: Any) -> str:
    if not isinstance(value, str):
        raise ValueError("dataset_name must be a string")
    slug = value.strip()
    if not _SLUG.fullmatch(slug) or "/" in slug or "\\" in slug or ".." in slug:
        raise ValueError("dataset_name must be a 1-64 character lowercase slug")
    return slug


def ensure_finite_number(value: Any, field: str, minimum: float, maximum: float) -> float:
    try:
        parsed = float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{field} must be numeric") from exc
    if not math.isfinite(parsed) or not minimum <= parsed <= maximum:
        raise ValueError(f"{field} must be between {minimum} and {maximum}")
    return parsed


def reject_unsafe_xml(xml: str) -> None:
    if not isinstance(xml, str) or not xml.strip():
        raise ValueError("No URDF XML provided")
    if len(xml.encode("utf-8")) > MAX_URDF_BYTES:
        raise ValueError("URDF exceeds the 1 MiB limit")
    upper = xml.upper()
    if "<!DOCTYPE" in upper or "<!ENTITY" in upper:
        raise ValueError("URDF must not contain DTD or entity declarations")


def episode_manifest(*, source_sha256: str, frame_count: int, fps: float,
                     imu_samples: int, config_snapshot: dict[str, Any],
                     status: str = "processing", validation: dict[str, Any] | None = None) -> dict[str, Any]:
    return {
        "manifest_version": EPISODE_MANIFEST_VERSION,
        "processing_version": PROCESSING_VERSION,
        "vslam_processing_version": VSLAM_PROCESSING_VERSION,
        "created_at": utc_timestamp(),
        "source": {"sha256": source_sha256, "frame_count": frame_count, "fps": fps},
        "imu": {"sample_count": imu_samples, "timebase": "client_elapsed_seconds"},
        "config_snapshot": config_snapshot,
        "status": status,
        "validation": validation or {"state": "pending", "errors": []},
    }


def legacy_manifest() -> dict[str, Any]:
    return {
        "manifest_version": 0,
        "processing_version": "legacy",
        "status": "legacy_unverified",
        "validation": {"state": "reprocess_required", "errors": ["Episode predates provenance validation"]},
    }


def episode_needs_vslam_reprocess(episode: dict[str, Any]) -> bool:
    """Whether saved pose/video artifacts predate the marker exclusion pipeline."""
    manifest = episode.get("manifest") or {}
    if manifest.get("vslam_processing_version") != VSLAM_PROCESSING_VERSION:
        return True
    if (manifest.get("validation") or {}).get("state") != "passed":
        return True
    migration_state = episode.get("vslam_migration_state")
    return migration_state is not None and migration_state != "current"
