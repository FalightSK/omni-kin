"""
test_pipeline.py
Automated end-to-end verification script for mobile dataset collector demo.
"""

import os
import sys
import json
import cv2
import numpy as np
import pandas as pd
from robot_kinematics import SO100Kinematics
from trajectory_estimator import TrajectoryEstimator
from lerobot_exporter import LeRobotExporter
from visual_tracker import VisualInertialTracker

# Ensure UTF-8 output formatting
sys.stdout.reconfigure(encoding='utf-8')

def test_kinematics():
    print("=== Testing SO-100 Robot Kinematics ===")
    solver = SO100Kinematics()
    target_pose = [0.22, 0.05, 0.15, 0.0, 0.1, 0.0]
    joints = solver.inverse_kinematics(target_pose, gripper_state=80.0)
    assert len(joints) == 6, f"Expected 6 joints, got {len(joints)}"
    print(f"[OK] IK Target: {target_pose}")
    print(f"[OK] IK Joint Output (deg/gripper): {np.round(joints, 2)}")

def test_trajectory_estimator():
    print("\n=== Testing Trajectory & IMU Estimator ===")
    estimator = TrajectoryEstimator()
    dummy_imu = [
        {
            'timestamp': i * 0.02,
            'accel': [0.05 * np.sin(i * 0.1), 0.02 * np.cos(i * 0.1), 9.81 + 0.01 * np.sin(i * 0.1)],
            'gyro': [0.01, 0.02, 0.0],
            'orientation': [0.0, i * 0.2, i * 0.1]
        }
        for i in range(100)
    ]
    poses = estimator.estimate_trajectory_from_imu(dummy_imu, num_video_frames=60, video_fps=30.0)
    assert poses.shape == (60, 6), f"Expected (60, 6), got {poses.shape}"
    print(f"[OK] Estimated Poses Shape: {poses.shape}")
    print(f"[OK] Pose Sample [x,y,z,r,p,y]: {np.round(poses[30], 3)}")


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


def test_lerobot_export(tmp_path):
    print("\n=== Testing LeRobot Dataset Export ===")
    exporter = LeRobotExporter(output_dir=str(tmp_path / "exports"), fps=30)
    first_video = tmp_path / "first.mp4"
    second_video = tmp_path / "second.mp4"
    _write_test_video(first_video, 45)
    _write_test_video(second_video, 60)
    
    dummy_episodes = [
        {
            'episode_index': 0,
            'task': 'reach to apple',
            'video_path': str(first_video),
            'joint_states': np.random.randn(45, 6),
            'actions': np.random.randn(45, 6),
            'timestamps': np.linspace(0, 1.5, 45)
        },
        {
            'episode_index': 1,
            'task': 'reach to banana',
            'video_path': str(second_video),
            'joint_states': np.random.randn(60, 6),
            'actions': np.random.randn(60, 6),
            'timestamps': np.linspace(0, 2.0, 60)
        }
    ]
    
    export_path = exporter.export_dataset(dummy_episodes, dataset_name="test_so100_dataset")

    # Verify Parquet & Info Files
    parquet_path = os.path.join(export_path, "data", "chunk-000", "file-000.parquet")
    info_path = os.path.join(export_path, "meta", "info.json")
    stats_path = os.path.join(export_path, "meta", "stats.json")

    assert os.path.exists(parquet_path), "Parquet data file missing!"
    assert os.path.exists(info_path), "meta/info.json missing!"
    assert os.path.exists(stats_path), "meta/stats.json missing!"

    df = pd.read_parquet(parquet_path)
    print(f"[OK] Exported Parquet Rows: {len(df)}")
    print(f"[OK] Tasks in Dataset: {df['task'].unique().tolist()}")

    with open(info_path, "r", encoding="utf-8") as f:
        info_json = json.load(f)
    assert info_json['robot_type'] in ['so_arm101_omni_kin', 'so100', 'so101']
    assert 'workspace_calibration' in info_json
    assert 'dh_table' in info_json
    assert info_json['total_episodes'] == 2
    print(f"[OK] meta/info.json validated. Robot: {info_json['robot_type']}, Total Episodes: {info_json['total_episodes']}")

if __name__ == "__main__":
    test_kinematics()
    test_trajectory_estimator()
    test_lerobot_export()
    print("\nALL PIPELINE TESTS PASSED SUCCESSFULLY!")
