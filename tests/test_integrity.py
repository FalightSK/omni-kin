import json

import pandas as pd
import pytest

from integrity import (
    VSLAM_PROCESSING_VERSION,
    dataset_slug,
    episode_manifest,
    episode_needs_vslam_reprocess,
    frame_timestamps,
    reject_unsafe_xml,
)
from lerobot_exporter import validate_export_dataset


def test_dataset_slug_rejects_traversal_and_invalid_names():
    assert dataset_slug("pick_and_place-01") == "pick_and_place-01"
    for unsafe in ("../escape", "a/b", "a\\b", "UPPER", "", "x" * 65):
        with pytest.raises(ValueError):
            dataset_slug(unsafe)


def test_frame_timestamps_are_frame_aligned():
    assert frame_timestamps(3, 30.0) == [0.0, 1 / 30.0, 2 / 30.0]


def test_episode_manifest_marks_masked_vslam_pipeline_and_detects_legacy():
    manifest = episode_manifest(
        source_sha256="abc",
        frame_count=2,
        fps=30.0,
        imu_samples=0,
        config_snapshot={},
        status="processed",
        validation={"state": "passed", "errors": []},
    )
    assert manifest["vslam_processing_version"] == VSLAM_PROCESSING_VERSION
    assert not episode_needs_vslam_reprocess({"manifest": manifest})
    assert episode_needs_vslam_reprocess({"manifest": {"processing_version": "integrity-v1"}})
    pending_manifest = {**manifest, "validation": {"state": "pending"}}
    assert episode_needs_vslam_reprocess({"manifest": pending_manifest})
    assert episode_needs_vslam_reprocess({
        "manifest": manifest,
        "vslam_migration_state": "processing",
    })


def test_saving_episode_metadata_updates_manifest_sidecar(tmp_path, monkeypatch):
    import server

    monkeypatch.setattr(server, "RECORDINGS_DIR", str(tmp_path))
    manifest = episode_manifest(
        source_sha256="abc",
        frame_count=2,
        fps=30.0,
        imu_samples=0,
        config_snapshot={},
        status="processed",
        validation={"state": "passed", "errors": []},
    )
    episode_dir = tmp_path / "episode-1"
    episode_dir.mkdir()
    (episode_dir / "episode_manifest.json").write_text(
        json.dumps({"validation": {"state": "pending"}}), encoding="utf-8"
    )

    server.save_episode_meta({"episode_id": "episode-1", "manifest": manifest})

    saved_manifest = json.loads((episode_dir / "episode_manifest.json").read_text(encoding="utf-8"))
    saved_meta = json.loads((episode_dir / "episode_meta.json").read_text(encoding="utf-8"))
    assert saved_manifest == manifest
    assert saved_meta["manifest"] == manifest


def test_urdf_rejects_entity_declarations():
    with pytest.raises(ValueError):
        reject_unsafe_xml('<!DOCTYPE robot [<!ENTITY x "boom">]><robot/>')


def test_export_validator_rejects_bad_action_alignment(tmp_path):
    root = tmp_path / "dataset"
    data_dir = root / "data" / "chunk-000"
    video_dir = root / "videos" / "observation.images.phone" / "chunk-000"
    data_dir.mkdir(parents=True)
    video_dir.mkdir(parents=True)
    rows = [
        {"index": 0, "episode_index": 0, "frame_index": 0, "timestamp": 0.0, "next.done": False,
         "observation.state": [0.0], "action": [42.0]},
        {"index": 1, "episode_index": 0, "frame_index": 1, "timestamp": 1 / 30, "next.done": True,
         "observation.state": [1.0], "action": [1.0]},
    ]
    pd.DataFrame(rows).to_parquet(data_dir / "file-000.parquet", index=False)
    with pytest.raises(ValueError, match="action alignment"):
        validate_export_dataset(str(root), [2])
    report = json.loads((root / "validation_report.json").read_text())
    assert not report["passed"]
