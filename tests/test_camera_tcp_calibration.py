import cv2
import asyncio
import io
import json
import numpy as np
import pytest
from scipy.spatial.transform import Rotation

from camera_tcp_calibration import estimate_camera_tcp
from robot_kinematics import (
    camera_tcp_transform_for_pose,
    tcp_marker_object_points,
    transform_camera_trajectory_to_tcp,
    transform_tcp_trajectory_to_camera,
    trajectory_euler_to_rotation_matrix,
)


def marker_geometry():
    return {
        "2": {"xyz_mm": [-35.0, 0.0, 12.0], "rpy_deg": [7.0, -4.0, 2.0]},
        "3": {"xyz_mm": [35.0, 1.5, 12.5], "rpy_deg": [-5.0, 3.0, -2.0]},
    }


def test_tcp_camera_pose_composition_and_inverse_round_trip():
    camera_tcp = np.eye(4)
    camera_tcp[:3, :3] = Rotation.from_euler("xyz", [0.3, -0.2, 0.1]).as_matrix()
    camera_tcp[:3, 3] = [0.12, -0.04, 0.08]
    camera_pose = np.array([0.3, 0.2, 0.9, 0.2, -0.1, 0.4])
    tcp_pose = camera_tcp_transform_for_pose(camera_pose, camera_tcp)
    expected_rotation = trajectory_euler_to_rotation_matrix(camera_pose[3:]) @ camera_tcp[:3, :3]
    assert np.allclose(tcp_pose[:3], camera_pose[:3] + trajectory_euler_to_rotation_matrix(camera_pose[3:]) @ camera_tcp[:3, 3])
    assert np.allclose(trajectory_euler_to_rotation_matrix(tcp_pose[3:]), expected_rotation)

    path = np.vstack([camera_pose, camera_pose + np.array([0.1, 0.0, 0.0, 0.0, 0.0, 0.2])])
    tcp_path = transform_camera_trajectory_to_tcp(path, camera_tcp)
    recovered = transform_tcp_trajectory_to_camera(tcp_path, camera_tcp)
    assert np.allclose(recovered, path, atol=1e-9)


def test_calibration_recovers_camera_tcp_with_rotated_marker_planes():
    geometry = marker_geometry()
    camera_matrix = np.array([[900.0, 0.0, 640.0], [0.0, 910.0, 360.0], [0.0, 0.0, 1.0]])
    dist_coeffs = np.zeros((5, 1), dtype=np.float64)
    expected = np.eye(4)
    expected[:3, :3] = Rotation.from_euler("xyz", [np.pi - 0.12, 0.08, -0.04]).as_matrix()
    expected[:3, 3] = [0.02, -0.01, 0.35]
    object_points = tcp_marker_object_points(geometry)
    rvec, _ = cv2.Rodrigues(expected[:3, :3])
    projected, _ = cv2.projectPoints(object_points, rvec, expected[:3, 3], camera_matrix, dist_coeffs)
    projected = projected.reshape(2, 4, 2)
    observations = [
        {"frame_index": frame, "corners": {"2": projected[0].tolist(), "3": projected[1].tolist()}}
        for frame in range(24)
    ]

    estimated, quality = estimate_camera_tcp(observations, geometry, camera_matrix, dist_coeffs)
    assert np.allclose(estimated[:3, 3], expected[:3, 3], atol=2e-4)
    assert Rotation.from_matrix(estimated[:3, :3] @ expected[:3, :3].T).magnitude() < np.radians(0.2)
    assert quality["valid_frames"] == 24
    assert quality["reprojection_rms_px"] < 0.1


def test_calibration_rejects_partial_or_missing_jaw_tag_observations():
    geometry = marker_geometry()
    camera_matrix = np.array([[900.0, 0.0, 640.0], [0.0, 900.0, 360.0], [0.0, 0.0, 1.0]])
    malformed = [{"frame_index": index, "corners": {"2": [[0, 0]] * 4}} for index in range(25)]
    with pytest.raises(ValueError, match="Only 0 valid"):
        estimate_camera_tcp(malformed, geometry, camera_matrix, np.zeros((5, 1)))


def test_marker_geometry_requires_both_finite_three_dimensional_poses():
    with pytest.raises(ValueError, match="Missing TCP pose for ArUco marker 3"):
        tcp_marker_object_points({"2": marker_geometry()["2"]})
    malformed = marker_geometry()
    malformed["3"]["rpy_deg"] = [0.0, float("nan"), 0.0]
    with pytest.raises(ValueError, match="finite xyz_mm and rpy_deg"):
        tcp_marker_object_points(malformed)


def test_episode_geometry_update_recalculates_only_the_selected_episode(monkeypatch):
    import server

    snapshot = {
        "calibration_id": "saved-calibration",
        "observations": [{"frame_index": 0}],
        "camera_matrix": np.eye(3).tolist(),
        "dist_coeffs": [0.0] * 5,
        "marker_size_mm": 22.0,
        "marker_poses_tcp": marker_geometry(),
        "T_camera_tcp": np.eye(4).tolist(),
        "quality": {"valid_frames": 20},
    }
    selected = {
        "episode_index": 10,
        "episode_id": "selected",
        "camera_tcp_calibration": snapshot,
        "raw_poses": [[0, 0, 0, 0, 0, 0], [0.1, 0, 0, 0, 0, 0]],
        "active_smoothing": {"method": "raw", "time_window_ms": 250},
    }
    untouched = {"episode_index": 11, "episode_id": "untouched", "poses": [[1, 2, 3]]}
    monkeypatch.setattr(server, "EPISODES_DB", [selected, untouched])
    monkeypatch.setattr(server, "ROBOT_CONFIG", {})
    monkeypatch.setattr(server, "_ensure_idle", lambda _operation: None)
    monkeypatch.setattr(server, "save_robot_config", lambda _config: None)
    monkeypatch.setattr(server, "save_episode_meta", lambda _episode: None)

    def fake_estimate(_observations, geometry, *_args, **_kwargs):
        transform = np.eye(4)
        transform[0, 3] = 0.02
        return transform, {"valid_frames": 24, "reprojection_rms_px": 0.4}

    def fake_sync(candidate, persist=False):
        candidate["joint_states"] = [[0.0, 0.5], [0.1, 0.6]]
        candidate["robot_ee_poses"] = [[0, 0, 0], [0.1, 0, 0]]
        candidate["link_positions"] = [[[0, 0, 0]], [[0.1, 0, 0]]]
        candidate["actions"] = candidate["joint_states"]
        return {"feasible_percent": 100.0}

    monkeypatch.setattr(server, "estimate_camera_tcp", fake_estimate)
    monkeypatch.setattr(server, "sync_episode_kinematics", fake_sync)
    changed_geometry = marker_geometry()
    changed_geometry["2"]["xyz_mm"][0] = -34.0
    response = asyncio.run(server.update_episode_camera_tcp_geometry(
        10, {"marker_poses_tcp": changed_geometry}
    ))

    body = json.loads(response.body)
    assert response.status_code == 200
    assert body["episode"]["camera_tcp_calibration"]["marker_poses_tcp"] == changed_geometry
    assert body["episode"]["ee_poses"][0][0] == pytest.approx(0.02)
    assert selected["joint_states"] == [[0.0, 0.5], [0.1, 0.6]]
    assert untouched == {"episode_index": 11, "episode_id": "untouched", "poses": [[1, 2, 3]]}


def test_upload_refuses_a_take_without_a_session_calibration():
    import server
    from fastapi import UploadFile

    response = asyncio.run(server.upload_recording_async(
        video=UploadFile(filename="take.webm", file=io.BytesIO(b"video")),
        calibration_id=None,
    ))
    assert response.status_code == 400
    assert "calibration session is required" in json.loads(response.body)["message"]


def test_export_blocks_an_episode_with_unanchored_pose_frames(monkeypatch):
    import server

    episode = {
        "episode_id": "unanchored",
        "episode_index": 0,
        "vslam_migration_state": "current",
        "manifest": {
            "vslam_processing_version": server.VSLAM_PROCESSING_VERSION,
            "validation": {"state": "passed"},
        },
        "pose_validity": [
            {"valid": True, "reason": "table_marker"},
            {"valid": False, "reason": "no_table_anchor"},
        ],
        "poses": [[0, 0, 0], [1, 1, 1]],
    }
    monkeypatch.setattr(server, "EPISODES_DB", [episode])

    response = asyncio.run(server.export_lerobot())

    assert response.status_code == 409
    body = json.loads(response.body)
    assert body["episodes"] == ["unanchored"]
    assert "Frame 1" in body["pose_errors"]["unanchored"][0]
