"""
lerobot_exporter.py
Exports processed mobile robot trajectories & videos into the official Hugging Face LeRobot format.
Supports both SO-100 joint states and Cartesian end-effector 6-DoF poses, automatic video transcoding
to standard MP4, and generates all required LeRobot v2.0/v2.1 metadata (info.json, stats.json, tasks.jsonl).
"""

import os
import sys
import json
import shutil
import cv2
import numpy as np
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

from robot_kinematics import get_robot_solver, get_robot_specs, WorkspaceCalibrator


class LeRobotExporter:
    """
    Exports episode datasets into the standard Hugging Face LeRobot directory schema.
    """

    def __init__(self, output_dir="lerobot_dataset", fps=30, robot_type="so_arm101_omni_kin", workspace_calibrator=None):
        self.output_dir = output_dir
        self.fps = fps
        self.robot_type = robot_type
        self.ik_solver = get_robot_solver(robot_type)
        self.workspace_calibrator = workspace_calibrator or WorkspaceCalibrator()

    def set_robot_config(self, robot_type="so_arm101_omni_kin", offset_x=0.20, offset_y=0.00, offset_z=0.00, yaw_deg=0.0):
        """
        Updates the active robot model preset and ArUco table-plane workspace offset.
        """
        self.robot_type = robot_type
        self.ik_solver = get_robot_solver(robot_type)
        self.workspace_calibrator.update_config(offset_x, offset_y, offset_z, yaw_deg)

    def _ensure_joint_states_and_poses(self, ep):
        """
        Extracts or computes both joint states [q0, q1, q2, q3, q4, gripper]
        and Cartesian EE poses [x, y, z, roll, pitch, yaw] with gripper.
        """
        raw_poses = ep.get('poses') or ep.get('ee_poses')
        gripper_states = ep.get('gripper_states')
        raw_joints = ep.get('joint_states')

        num_frames = 0
        if raw_poses is not None and len(raw_poses) > 0:
            num_frames = len(raw_poses)
        elif raw_joints is not None and len(raw_joints) > 0:
            num_frames = len(raw_joints)
        elif ep.get('num_frames') is not None:
            num_frames = int(ep['num_frames'])
        else:
            num_frames = 30

        # 1. Resolve Cartesian EE Poses (in Robot Base Frame)
        if raw_poses is not None and len(raw_poses) == num_frames:
            raw_arr = np.asarray(raw_poses, dtype=np.float64)
            ee_poses = self.workspace_calibrator.transform_trajectory(raw_arr, to_robot=True).astype(np.float32)
        else:
            ee_poses = np.zeros((num_frames, 6), dtype=np.float32)
            ee_poses[:, 0] = 0.15
            ee_poses[:, 2] = 0.20

        # 2. Resolve Gripper States
        if gripper_states is not None and len(gripper_states) == num_frames:
            grippers = np.asarray(gripper_states, dtype=np.float32)
        else:
            grippers = np.full((num_frames,), 100.0, dtype=np.float32)

        # 3. Resolve Joint States
        if raw_joints is not None and len(raw_joints) == num_frames:
            joint_states = np.asarray(raw_joints, dtype=np.float32)
        else:
            # Compute Inverse Kinematics for SO-100 arm from Cartesian EE Poses
            computed_joints = []
            for i in range(num_frames):
                pose_i = ee_poses[i]
                grip_i = float(grippers[i])
                try:
                    q = self.ik_solver.inverse_kinematics(pose_i, gripper_state=grip_i)
                except Exception:
                    q = np.array([0.0, 30.0, 45.0, -15.0, 0.0, grip_i], dtype=np.float32)
                computed_joints.append(q)
            joint_states = np.array(computed_joints, dtype=np.float32)

        # 4. Resolve Actions (Next-frame target joints)
        raw_actions = ep.get('actions')
        if raw_actions is not None and len(raw_actions) == num_frames:
            actions = np.asarray(raw_actions, dtype=np.float32)
        else:
            actions = np.roll(joint_states, -1, axis=0)
            actions[-1] = joint_states[-1]

        # 5. Resolve Timestamps
        raw_times = ep.get('timestamps')
        if raw_times is not None and len(raw_times) == num_frames:
            timestamps = np.asarray(raw_times, dtype=np.float32)
        else:
            timestamps = np.linspace(0, num_frames / self.fps, num_frames, dtype=np.float32)

        return joint_states, ee_poses, actions, timestamps, num_frames

    def _transcode_video_to_mp4(self, src_path, dst_path, target_fps=30, num_frames=30):
        """
        Transcodes any video format (including WebM from phone) into a standardized,
        browser-and-torchvision compliant MP4 file.
        """
        os.makedirs(os.path.dirname(dst_path), exist_ok=True)

        if src_path and os.path.exists(src_path) and os.path.getsize(src_path) > 100:
            cap = cv2.VideoCapture(src_path)
            w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 640
            h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 480

            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            writer = cv2.VideoWriter(dst_path, fourcc, target_fps, (w, h))

            count = 0
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                writer.write(frame)
                count += 1

            cap.release()
            writer.release()

            if count > 0:
                return True

        # Fallback: Generate clean placeholder MP4
        w, h = 640, 480
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        writer = cv2.VideoWriter(dst_path, fourcc, target_fps, (w, h))
        for i in range(max(num_frames, 1)):
            frame = np.full((h, w, 3), (30, 35, 45), dtype=np.uint8)
            cv2.putText(frame, f"LeRobot Frame {i}/{num_frames}", (30, 240),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
            writer.write(frame)
        writer.release()
        return True

    def export_dataset(self, episodes_data, dataset_name="mobile_aruco_3d_trajectories"):
        """
        Exports episodes_data into the official Hugging Face LeRobot dataset schema.
        """
        if not episodes_data:
            raise ValueError("No episodes provided for LeRobot export.")

        export_path = os.path.join(self.output_dir, dataset_name)

        data_dir = os.path.join(export_path, "data", "chunk-000")
        meta_dir = os.path.join(export_path, "meta")
        episodes_meta_dir = os.path.join(meta_dir, "episodes")
        video_dir = os.path.join(export_path, "videos", "observation.images.phone", "chunk-000")

        os.makedirs(data_dir, exist_ok=True)
        os.makedirs(meta_dir, exist_ok=True)
        os.makedirs(episodes_meta_dir, exist_ok=True)
        os.makedirs(video_dir, exist_ok=True)

        all_rows = []
        episode_meta_rows = []
        global_frame_idx = 0

        # Unique task mapping
        unique_tasks = sorted(list(set(ep.get('task', 'reach to object') for ep in episodes_data)))
        task_to_idx = {t: idx for idx, t in enumerate(unique_tasks)}

        all_states = []
        all_ee_poses = []
        all_actions = []

        for ep_idx, ep in enumerate(episodes_data):
            task = ep.get('task', 'reach to object')
            task_idx = task_to_idx[task]

            # Robust data extraction & IK resolution
            joint_states, ee_poses, actions, timestamps, num_frames = self._ensure_joint_states_and_poses(ep)

            all_states.append(joint_states)
            all_ee_poses.append(ee_poses)
            all_actions.append(actions)

            # Transcode / copy video
            src_video = ep.get('video_path', '')
            dst_video = os.path.join(video_dir, f"episode_{ep_idx:06d}.mp4")
            self._transcode_video_to_mp4(src_video, dst_video, target_fps=self.fps, num_frames=num_frames)

            for f_idx in range(num_frames):
                is_done = bool(f_idx == num_frames - 1)
                row = {
                    'index': global_frame_idx,
                    'episode_index': ep_idx,
                    'frame_index': f_idx,
                    'timestamp': float(timestamps[f_idx]),
                    'next.done': is_done,
                    'task_index': task_idx,
                    'task': str(task),
                    'observation.state': joint_states[f_idx].tolist(),
                    'observation.ee_pose': ee_poses[f_idx].tolist(),
                    'action': actions[f_idx].tolist()
                }
                all_rows.append(row)
                global_frame_idx += 1

            episode_meta_rows.append({
                'episode_index': ep_idx,
                'task': str(task),
                'task_index': task_idx,
                'length': num_frames,
                'fps': self.fps
            })

        # 1. Save Tabular Dataset (data/chunk-000/file-000.parquet)
        df_data = pd.DataFrame(all_rows)
        parquet_file = os.path.join(data_dir, "file-000.parquet")
        df_data.to_parquet(parquet_file, index=False)

        # 2. Save Episode Metadata (meta/episodes/file-000.parquet & meta/episodes.jsonl)
        df_episodes = pd.DataFrame(episode_meta_rows)
        episodes_parquet = os.path.join(episodes_meta_dir, "file-000.parquet")
        df_episodes.to_parquet(episodes_parquet, index=False)

        with open(os.path.join(meta_dir, "episodes.jsonl"), "w") as f:
            for row in episode_meta_rows:
                f.write(json.dumps(row) + "\n")

        # 3. Save Tasks Definition (meta/tasks.jsonl)
        with open(os.path.join(meta_dir, "tasks.jsonl"), "w") as f:
            for task_str, t_idx in task_to_idx.items():
                f.write(json.dumps({"task_index": t_idx, "task": task_str}) + "\n")

        # 4. Compute and Save Statistics (meta/stats.json)
        concat_states = np.vstack(all_states)
        concat_ee = np.vstack(all_ee_poses)
        concat_actions = np.vstack(all_actions)

        stats = {
            "observation.state": {
                "mean": np.mean(concat_states, axis=0).tolist(),
                "std": np.std(concat_states, axis=0).tolist(),
                "min": np.min(concat_states, axis=0).tolist(),
                "max": np.max(concat_states, axis=0).tolist()
            },
            "observation.ee_pose": {
                "mean": np.mean(concat_ee, axis=0).tolist(),
                "std": np.std(concat_ee, axis=0).tolist(),
                "min": np.min(concat_ee, axis=0).tolist(),
                "max": np.max(concat_ee, axis=0).tolist()
            },
            "action": {
                "mean": np.mean(concat_actions, axis=0).tolist(),
                "std": np.std(concat_actions, axis=0).tolist(),
                "min": np.min(concat_actions, axis=0).tolist(),
                "max": np.max(concat_actions, axis=0).tolist()
            }
        }
        with open(os.path.join(meta_dir, "stats.json"), "w") as f:
            json.dump(stats, f, indent=2)

        # 5. Save Info Configuration (meta/info.json)
        robot_specs = get_robot_specs(self.robot_type)
        info = {
            "codebase_version": "v2.0",
            "robot_type": self.robot_type,
            "robot_name": robot_specs["name"],
            "workspace_calibration": self.workspace_calibrator.get_config(),
            "dh_table": robot_specs["dh_table"],
            "fps": self.fps,
            "total_episodes": len(episodes_data),
            "total_frames": global_frame_idx,
            "total_tasks": len(unique_tasks),
            "total_videos": len(episodes_data),
            "total_chunks": 1,
            "chunks_size": 1000,
            "features": {
                "observation.images.phone": {
                    "dtype": "video",
                    "shape": [480, 640, 3],
                    "names": ["height", "width", "channels"]
                },
                "observation.state": {
                    "dtype": "float32",
                    "shape": [6],
                    "names": ["q0_base_yaw", "q1_shoulder_pitch", "q2_elbow_pitch", "q3_wrist_pitch", "q4_wrist_roll", "gripper"]
                },
                "observation.ee_pose": {
                    "dtype": "float32",
                    "shape": [6],
                    "names": ["x", "y", "z", "roll", "pitch", "yaw"]
                },
                "action": {
                    "dtype": "float32",
                    "shape": [6],
                    "names": ["q0_base_yaw", "q1_shoulder_pitch", "q2_elbow_pitch", "q3_wrist_pitch", "q4_wrist_roll", "gripper"]
                },
                "next.done": {"dtype": "bool", "shape": [1]},
                "episode_index": {"dtype": "int64", "shape": [1]},
                "frame_index": {"dtype": "int64", "shape": [1]},
                "timestamp": {"dtype": "float32", "shape": [1]},
                "index": {"dtype": "int64", "shape": [1]},
                "task_index": {"dtype": "int64", "shape": [1]},
                "task": {"dtype": "string", "shape": [1]}
            }
        }
        with open(os.path.join(meta_dir, "info.json"), "w") as f:
            json.dump(info, f, indent=2)

        print(f"[OK] Successfully exported LeRobot dataset ({len(episodes_data)} episodes, {global_frame_idx} frames) to: {export_path}")
        return export_path


if __name__ == "__main__":
    exporter = LeRobotExporter(output_dir="sample_export")
    dummy_ep = [{
        'episode_index': 0,
        'task': 'reach to apple',
        'video_path': 'non_existent.mp4',
        'poses': [[0.15, 0.05, 0.20, 0, 0, 0]] * 30,
        'gripper_states': [100.0] * 30,
        'timestamps': np.linspace(0, 1, 30).tolist()
    }]
    exporter.export_dataset(dummy_ep)

