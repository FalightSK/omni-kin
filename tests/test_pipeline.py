"""
test_pipeline.py
Automated end-to-end verification script for mobile dataset collector demo.
"""

import os
import json
import cv2
import numpy as np
import pandas as pd
from lerobot_exporter import LeRobotExporter
from visual_tracker import VisualInertialTracker

def test_cartesian_speed_limit():
    """A visual outlier must not become an unsafe one-frame TCP jump."""
    positions = np.array([
        [0.00, 0.00, 0.10],
        [0.005, 0.00, 0.10],
        [0.150, 0.00, 0.10],  # 14.5 cm visual re-acquisition spike
        [0.155, 0.00, 0.10],
    ])
    limited = VisualInertialTracker.limit_cartesian_speed(positions, fps=30.0, max_speed_mps=0.25)
    max_step = np.linalg.norm(np.diff(limited, axis=0), axis=1).max()
    assert max_step <= (0.25 / 30.0) + 1e-9

def _write_test_video(path, frame_count, fps=30):
    """Create a small, decodable MP4 fixture with an exact frame count."""
    size = (64, 48)
    writer = cv2.VideoWriter(str(path), cv2.VideoWriter_fourcc(*"mp4v"), fps, size)
    assert writer.isOpened(), "Could not create video test fixture"
    for frame_index in range(frame_count):
        frame = np.full((size[1], size[0], 3), frame_index % 255, dtype=np.uint8)
        writer.write(frame)
    writer.release()


def test_lerobot_export_uses_current_gripper_channel_over_cached_joint_state(tmp_path):
    video_path = tmp_path / "gripper.mp4"
    _write_test_video(video_path, 3)
    exporter = LeRobotExporter(output_dir=str(tmp_path / "exports"), fps=30)
    cached_states = np.zeros((3, 6), dtype=np.float32)
    cached_states[:, -1] = [1.0, 0.0, 1.0]  # stale binary gripper values
    episode = {
        "episode_index": 0,
        "task": "vary gripper opening",
        "video_path": str(video_path),
        "num_frames": 3,
        "robot_ee_poses": [[0.2, 0.0, 0.2, 0.0, 0.0, 0.0]] * 3,
        "joint_states": cached_states.tolist(),
        "gripper_states": [100.0, 54.2, 0.0],
        "gripper_state_units": "percent",
    }

    output = exporter.export_dataset(
        [episode], dataset_name="gripper_channel", auto_trim=False, use_timestamp=False
    )
    data = pd.read_parquet(os.path.join(output, "data", "chunk-000", "file-000.parquet"))
    states = np.asarray(data["observation.state"].tolist())
    actions = np.asarray(data["action"].tolist())
    with open(os.path.join(output, "meta", "info.json"), encoding="utf-8") as stream:
        info = json.load(stream)

    assert np.allclose(states[:, -1], [1.0, 0.542, 0.0], atol=1e-5)
    assert np.allclose(actions[:-1, -1], states[1:, -1], atol=1e-5)
    assert actions[-1, -1] == states[-1, -1]
    assert info["features"]["observation.state"]["names"][-1] == "gripper"
    assert info["features"]["action"]["names"][-1] == "gripper"
    assert info["features"]["observation.state"]["names"] == info["robot_kinematics"]["joint_names"] + ["gripper"]
    assert info["robot_kinematics"]["source"] == "URDF"
    assert "dh_table" not in info
    assert "workspace_calibration" in info
    assert os.path.isfile(os.path.join(output, "meta", "stats.json"))
    import pyarrow as pa
    import pyarrow.parquet as pq

    schema = pq.read_schema(os.path.join(output, "data", "chunk-000", "file-000.parquet"))
    assert schema.field("timestamp").type == pa.float32()
    for column in ("observation.state", "observation.ee_pose", "action"):
        assert schema.field(column).type == pa.list_(pa.float32())
    with open(os.path.join(output, "README.md"), encoding="utf-8") as stream:
        guide = stream.read()
    assert "state_names.index(\"gripper\")" in guide
    assert "action[t] = observation.state[t + 1]" in guide
    assert info["gripper_semantics"] == {
        "feature_name": "gripper",
        "units": "normalized_aperture",
        "closed": 0.0,
        "open": 1.0,
        "source": "episode.gripper_states; cached joint-state fallback when absent",
    }


def test_initial_aware_approach_converts_gripper_percentage_once(monkeypatch):
    import lerobot_exporter

    def fake_approach(self, **kwargs):
        assert kwargs["home_gripper"] == 100.0
        assert np.isclose(kwargs["start_gripper"], 54.2)
        approach_joints = np.zeros((2, 6), dtype=np.float32)
        approach_joints[:, -1] = [100.0, 54.2]
        return {
            "robot_ee_poses": np.tile([0.2, 0.0, 0.2, 0.0, 0.0, 0.0], (2, 1)),
            "joint_states": approach_joints,
        }

    monkeypatch.setattr(lerobot_exporter.TrajectoryPlanner, "plan_approach_path", fake_approach)
    exporter = LeRobotExporter(fps=30)
    episode = {
        "num_frames": 2,
        "robot_ee_poses": [[0.2, 0.0, 0.2, 0.0, 0.0, 0.0]] * 2,
        "joint_states": np.zeros((2, 6), dtype=np.float32).tolist(),
        "gripper_states": [54.2, 0.0],
        "gripper_state_units": "percent",
    }

    states, _, actions, _, frame_count, _, prepend = exporter._ensure_joint_states_and_poses(
        episode, trajectory_mode="initial_aware", auto_trim=False
    )

    assert frame_count == 4 and prepend == 2
    assert np.allclose(states[:, -1], [1.0, 0.542, 0.542, 0.0], atol=1e-5)
    assert np.allclose(actions[:, -1], [0.542, 0.542, 0.0, 0.0], atol=1e-5)


def test_export_recalculates_on_base_position_change(tmp_path):
    print("\n=== Testing Export Recalculates on Base Position Change ===")
    video_path = tmp_path / "ep.mp4"
    _write_test_video(video_path, 30)

    # 30 frames of Cartesian waypoints in table frame
    poses = np.zeros((30, 6), dtype=np.float64)
    poses[:, 0] = np.linspace(0.0, 0.15, 30)
    poses[:, 1] = np.linspace(0.1, 0.25, 30)
    poses[:, 2] = 0.10

    episode = {
        'episode_index': 0,
        'task': 'reach to marker',
        'video_path': str(video_path),
        'poses': poses.tolist(),
        'gripper_states': [100.0] * 30,
        'timestamps': np.linspace(0, 1.0, 30).tolist()
    }

    exporter = LeRobotExporter(output_dir=str(tmp_path / "exports_base_a"), fps=30)
    exporter.set_robot_config(
        robot_type="so_arm101_omni_kin",
        offset_x=0.038,
        offset_y=-0.406,
        offset_z=0.00,
        yaw_deg=90.0
    )
    export_path_a = exporter.export_dataset([episode], dataset_name="base_a_dataset", use_timestamp=False)
    df_a = pd.read_parquet(os.path.join(export_path_a, "data", "chunk-000", "file-000.parquet"))
    joints_a = np.array(df_a["observation.state"].tolist())
    assert episode.get("workspace_calibration") is not None
    assert episode["workspace_calibration"]["offset_x"] == 0.038

    # Now change base position for this episode to Base B
    episode["workspace_calibration"] = {
        "offset_x": 0.100,
        "offset_y": -0.350,
        "offset_z": 0.02,
        "yaw_deg": 80.0
    }
    episode["kinematics_stale"] = True
    export_path_b = exporter.export_dataset([episode], dataset_name="base_b_dataset", use_timestamp=False)
    df_b = pd.read_parquet(os.path.join(export_path_b, "data", "chunk-000", "file-000.parquet"))
    joints_b = np.array(df_b["observation.state"].tolist())

    # Joint trajectories MUST differ because base position changed
    diff = np.max(np.abs(joints_a[:, :5] - joints_b[:, :5]))
    assert diff > 1.0, f"Expected joint angles to change with base position, but max diff was {diff}°"
    assert episode["workspace_calibration"]["offset_x"] == 0.100
    print(f"[OK] Export successfully recalculated joint states for new base (max delta: {diff:.2f}°)")


def test_multi_episode_independent_base_export(tmp_path):
    print("\n=== Testing Multi-Episode Independent Base Export ===")
    video_a = tmp_path / "ep_a.mp4"
    video_b = tmp_path / "ep_b.mp4"
    _write_test_video(video_a, 30)
    _write_test_video(video_b, 30)

    poses = np.zeros((30, 6), dtype=np.float64)
    poses[:, 0] = np.linspace(0.0, 0.15, 30)
    poses[:, 1] = np.linspace(0.1, 0.25, 30)
    poses[:, 2] = 0.10

    ep_a = {
        'episode_index': 0,
        'task': 'reach A',
        'video_path': str(video_a),
        'poses': poses.tolist(),
        'gripper_states': [100.0] * 30,
        'timestamps': np.linspace(0, 1.0, 30).tolist(),
        'workspace_calibration': {
            'offset_x': 0.038,
            'offset_y': -0.406,
            'offset_z': 0.00,
            'yaw_deg': 90.0
        }
    }

    ep_b = {
        'episode_index': 1,
        'task': 'reach B',
        'video_path': str(video_b),
        'poses': poses.tolist(),
        'gripper_states': [100.0] * 30,
        'timestamps': np.linspace(0, 1.0, 30).tolist(),
        'workspace_calibration': {
            'offset_x': 0.150,
            'offset_y': -0.350,
            'offset_z': 0.05,
            'yaw_deg': 60.0
        }
    }

    exporter = LeRobotExporter(output_dir=str(tmp_path / "exports_multi"), fps=30)
    export_path = exporter.export_dataset([ep_a, ep_b], dataset_name="multi_base_dataset", use_timestamp=False)
    df = pd.read_parquet(os.path.join(export_path, "data", "chunk-000", "file-000.parquet"))

    df_a = df[df["episode_index"] == 0]
    df_b = df[df["episode_index"] == 1]

    joints_a = np.array(df_a["observation.state"].tolist())
    joints_b = np.array(df_b["observation.state"].tolist())

    diff = np.max(np.abs(joints_a[:, :5] - joints_b[:, :5]))
    assert diff > 1.0, f"Expected different joints for different base calibrations, got max diff {diff}°"
    assert ep_a["workspace_calibration"]["offset_x"] == 0.038
    assert ep_b["workspace_calibration"]["offset_x"] == 0.150
    print(f"[OK] Multi-episode export preserved independent base calibrations and distinct joint trajectories (diff: {diff:.2f}°)")


