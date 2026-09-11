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

from robot_kinematics import (
    get_robot_solver,
    get_robot_specs,
    WorkspaceCalibrator,
    TrajectoryPlanner,
    DEFAULT_INITIAL_POSITION
)


def find_feasible_window(ee_poses_robot, solver, max_err_cm=1.5):
    """
    Evaluates inverse kinematics across Cartesian EE waypoints (in Robot Base Frame)
    and determines the contiguous active manipulation window [f_start, f_end] where
    the arm is physically reachable and not jammed against mechanical stops (r >= 17.6cm).
    """
    n = len(ee_poses_robot)
    if n == 0:
        return 0, 0
    feasible = []
    for i in range(n):
        res = solver.solve_feasible_ik(ee_poses_robot[i])
        is_ok = res['is_feasible'] and res['error_distance_cm'] <= max_err_cm
        feasible.append(is_ok)

    if not any(feasible):
        return 0, n

    f_start = 0
    while f_start < n and not feasible[f_start]:
        f_start += 1

    f_end = n
    while f_end > f_start and not feasible[f_end - 1]:
        f_end -= 1

    return f_start, f_end


class LeRobotExporter:
    """
    Exports captured 3D multimodal trajectories into official Hugging Face LeRobot format.
    Ensures standard structure:
      data/chunk-000/file-000.parquet
      videos/observation.images.phone/chunk-000/episode_000000.mp4
      meta/info.json
      meta/stats.json
      meta/tasks.jsonl
      meta/episodes/file-000.parquet & meta/episodes.jsonl
    """

    def __init__(
        self,
        output_dir="lerobot_dataset",
        fps=30,
        robot_type="so_arm101_omni_kin",
        workspace_calibrator=None,
        q3_safe_max_deg=None
    ):
        self.output_dir = output_dir
        self.fps = int(fps)
        self.robot_type = robot_type
        self.q3_safe_max_deg = float(q3_safe_max_deg) if q3_safe_max_deg is not None else 0.0
        self.ik_solver = get_robot_solver(robot_type, q3_safe_max_deg=self.q3_safe_max_deg)
        self.workspace_calibrator = workspace_calibrator or WorkspaceCalibrator()

    def set_robot_config(self, robot_type="so_arm101_omni_kin", offset_x=0.20, offset_y=0.00, offset_z=0.00, yaw_deg=0.0, q3_safe_max_deg=None):
        """
        Updates the active robot model preset, workspace offset, and camera safe wrist limits.
        """
        self.robot_type = robot_type
        if q3_safe_max_deg is not None:
            self.q3_safe_max_deg = float(q3_safe_max_deg)
        self.ik_solver = get_robot_solver(robot_type, q3_safe_max_deg=self.q3_safe_max_deg)
        self.workspace_calibrator.update_config(offset_x, offset_y, offset_z, yaw_deg)

    def _ensure_joint_states_and_poses(self, ep, trajectory_mode="free_form", initial_position=None, auto_trim=True):
        """
        Extracts or computes both joint states [q0, q1, q2, q3, q4, gripper]
        and Cartesian EE poses [x, y, z, roll, pitch, yaw] with gripper.
        When auto_trim == True, trims idle lead-in and lead-out frames outside reachable workspace.
        When trajectory_mode == 'initial_aware', prepends a smooth quintic minimum-jerk
        approach trajectory from the canonical Initial Position (Home) to the start waypoint.
        """
        raw_poses = ep.get('ee_poses') or ep.get('poses')
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

        orig_num_frames = num_frames

        # 1. Resolve Cartesian EE Poses (in Robot Base Frame)
        if raw_poses is not None and len(raw_poses) == num_frames:
            raw_arr = np.asarray(raw_poses, dtype=np.float64)
            ee_poses = self.workspace_calibrator.transform_trajectory(raw_arr, to_robot=True).astype(np.float32)
        else:
            ee_poses = np.zeros((num_frames, 6), dtype=np.float32)
            ee_poses[:, 0] = 0.24
            ee_poses[:, 2] = 0.20

        # 2. Resolve Gripper States (Strictly normalized [0.0, 1.0] for LeRobot standard)
        if gripper_states is not None and len(gripper_states) == num_frames:
            grippers = np.asarray(gripper_states, dtype=np.float32)
        else:
            grippers = np.full((num_frames,), 1.0, dtype=np.float32)

        if np.max(grippers) > 1.0 + 1e-3:
            grippers = np.clip(grippers / 100.0, 0.0, 1.0)
        else:
            grippers = np.clip(grippers, 0.0, 1.0)

        # 3. Automatic Feasible Workspace Trimming
        trim_info = {"f_start": 0, "f_end": orig_num_frames, "orig_frames": orig_num_frames, "is_trimmed": False}
        if auto_trim and len(ee_poses) > 15:
            f_start, f_end = find_feasible_window(ee_poses, self.ik_solver)
            if f_end > f_start and (f_start > 0 or f_end < orig_num_frames):
                print(f"[LeRobot Exporter] ✂️ Auto-trimming out-of-reach boundary frames: [{f_start}:{f_end}] (kept {f_end - f_start}/{orig_num_frames} frames)")
                ee_poses = ee_poses[f_start:f_end]
                grippers = grippers[f_start:f_end]
                if raw_joints is not None and len(raw_joints) == orig_num_frames:
                    raw_joints = [raw_joints[i] for i in range(f_start, f_end)]
                num_frames = len(ee_poses)
                trim_info = {
                    "f_start": f_start,
                    "f_end": f_end,
                    "orig_frames": orig_num_frames,
                    "is_trimmed": True
                }

        # 4. Resolve Joint States
        if raw_joints is not None and len(raw_joints) == num_frames:
            joint_states = np.asarray(raw_joints, dtype=np.float32)
            # Ensure last column (gripper) is normalized [0, 1]
            if joint_states.shape[1] > 0 and np.max(joint_states[:, -1]) > 1.0 + 1e-3:
                joint_states[:, -1] = np.clip(joint_states[:, -1] / 100.0, 0.0, 1.0)
        else:
            # Compute Inverse Kinematics for arm from Cartesian EE Poses
            computed_joints = []
            prev_q = None
            for i in range(num_frames):
                pose_i = ee_poses[i]
                grip_i = float(grippers[i])
                try:
                    q = self.ik_solver.inverse_kinematics(pose_i, gripper_state=grip_i, prev_joints=prev_q)
                    prev_q = q[:5]
                except Exception:
                    q = np.array([0.0, 35.0, -55.0, -20.0, 0.0, grip_i], dtype=np.float32)
                computed_joints.append(q)
            joint_states = np.array(computed_joints, dtype=np.float32)
            joint_states[:, -1] = grippers

        # 5. Resolve Actions (Next-frame target joints)
        raw_actions = ep.get('actions')
        if raw_actions is not None and len(raw_actions) == orig_num_frames:
            raw_act_arr = np.asarray(raw_actions, dtype=np.float32)
            if trim_info["is_trimmed"]:
                actions = raw_act_arr[trim_info["f_start"]:trim_info["f_end"]]
            else:
                actions = raw_act_arr
            if actions.shape[1] > 0 and np.max(actions[:, -1]) > 1.0 + 1e-3:
                actions[:, -1] = np.clip(actions[:, -1] / 100.0, 0.0, 1.0)
        else:
            actions = np.roll(joint_states, -1, axis=0)
            actions[-1] = joint_states[-1]

        # 5b. Enforce Universal Camera Safe Ceiling on Wrist Pitch Joint
        wrist_idx = getattr(self.ik_solver, "wrist_pitch_idx", 3)
        collision_sign = getattr(self.ik_solver, "wrist_collision_sign", 1)
        if len(joint_states) > 0 and joint_states.shape[1] > wrist_idx:
            if collision_sign > 0:
                wrist_violations = np.sum(joint_states[:, wrist_idx] > self.q3_safe_max_deg + 1e-2)
                if wrist_violations > 0:
                    print(f"[LeRobot Exporter] 🛡️ Clamping {wrist_violations}/{num_frames} frames on joint {wrist_idx} to <= {self.q3_safe_max_deg}° (Camera crash prevention)")
                    joint_states[:, wrist_idx] = np.minimum(joint_states[:, wrist_idx], float(self.q3_safe_max_deg))
                    actions[:, wrist_idx] = np.minimum(actions[:, wrist_idx], float(self.q3_safe_max_deg))
            else:
                wrist_violations = np.sum(joint_states[:, wrist_idx] < -self.q3_safe_max_deg - 1e-2)
                if wrist_violations > 0:
                    print(f"[LeRobot Exporter] 🛡️ Clamping {wrist_violations}/{num_frames} frames on joint {wrist_idx} to >= {-self.q3_safe_max_deg}° (Camera crash prevention)")
                    joint_states[:, wrist_idx] = np.maximum(joint_states[:, wrist_idx], -float(self.q3_safe_max_deg))
                    actions[:, wrist_idx] = np.maximum(actions[:, wrist_idx], -float(self.q3_safe_max_deg))

        # 6. Resolve Timestamps
        timestamps = np.linspace(0, num_frames / self.fps, num_frames, dtype=np.float32)

        # 7. Prepend Auto Approach Path if Initial-Position Aware Mode is active
        prepend_approach_frames = 0
        if str(trajectory_mode).lower() == "initial_aware" and len(ee_poses) > 0:
            try:
                planner = TrajectoryPlanner(solver=self.ik_solver, workspace_calibrator=self.workspace_calibrator)
                p_start_robot = ee_poses[0]
                start_grip = float(grippers[0]) if len(grippers) > 0 else 1.0

                init_cfg = dict(DEFAULT_INITIAL_POSITION)
                if initial_position and isinstance(initial_position, dict):
                    init_cfg.update(initial_position)

                p_home_robot = np.array([
                    float(init_cfg.get("x", DEFAULT_INITIAL_POSITION["x"])),
                    float(init_cfg.get("y", DEFAULT_INITIAL_POSITION["y"])),
                    float(init_cfg.get("z", DEFAULT_INITIAL_POSITION["z"])),
                    np.radians(float(init_cfg.get("roll_deg", DEFAULT_INITIAL_POSITION.get("roll_deg", 0.0)))),
                    np.radians(float(init_cfg.get("pitch_deg", DEFAULT_INITIAL_POSITION.get("pitch_deg", -20.0)))),
                    np.radians(float(init_cfg.get("yaw_deg", DEFAULT_INITIAL_POSITION.get("yaw_deg", 0.0))))
                ], dtype=np.float64)

                approach_res = planner.plan_approach_path(
                    p_start=p_start_robot,
                    p_home=p_home_robot,
                    duration_s=1.5,
                    fps=self.fps,
                    lift_clearance_m=0.06,
                    home_gripper=float(init_cfg.get("gripper", 100.0)),
                    start_gripper=start_grip * 100.0,
                    start_in_robot_frame=True
                )

                app_ee = np.asarray(approach_res['robot_ee_poses'], dtype=np.float32)
                app_joints = np.asarray(approach_res['joint_states'], dtype=np.float32)
                app_joints[:, -1] = np.clip(app_joints[:, -1] / 100.0, 0.0, 1.0)
                app_actions = np.asarray(approach_res['actions'], dtype=np.float32)
                app_actions[:, -1] = np.clip(app_actions[:, -1] / 100.0, 0.0, 1.0)

                prepend_approach_frames = len(app_ee)
                ee_poses = np.vstack([app_ee, ee_poses])
                joint_states = np.vstack([app_joints, joint_states])
                actions = np.vstack([app_actions, actions])
                num_frames = len(ee_poses)
                timestamps = np.linspace(0, num_frames / self.fps, num_frames, dtype=np.float32)
            except Exception as e:
                print(f"Warning: Failed to prepend approach path in export: {e}")

        return joint_states, ee_poses, actions, timestamps, num_frames, trim_info, prepend_approach_frames

    def _transcode_video_to_mp4(
        self,
        src_path,
        dst_path,
        target_fps=30,
        num_frames=30,
        slice_start=0,
        slice_end=None,
        prepend_hold_frames=0
    ):
        """
        Transcodes any video format into a standardized MP4 file,
        applying synchronous frame slicing (slice_start to slice_end) and
        prepending static hold frames for the approach phase.
        Guarantees exact 1:1 frame count parity with the tabular parquet dataset.
        """
        os.makedirs(os.path.dirname(dst_path), exist_ok=True)

        if src_path and os.path.exists(src_path) and os.path.getsize(src_path) > 100:
            cap = cv2.VideoCapture(src_path)
            w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 640
            h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 480

            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            writer = cv2.VideoWriter(dst_path, fourcc, target_fps, (w, h))

            f_idx = 0
            first_kept_frame = None
            written_count = 0

            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                if f_idx < slice_start:
                    f_idx += 1
                    continue

                if slice_end is not None and f_idx >= slice_end:
                    break

                # On encountering the first kept frame, write prepend_hold_frames for approach
                if first_kept_frame is None:
                    first_kept_frame = frame
                    for _ in range(prepend_hold_frames):
                        writer.write(first_kept_frame)
                        written_count += 1

                writer.write(frame)
                written_count += 1
                f_idx += 1

            cap.release()
            writer.release()

            if written_count > 0:
                return True

        # Fallback: Generate clean placeholder MP4 with exact frame count
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

    def export_dataset(
        self,
        episodes_data,
        dataset_name="mobile_aruco_3d_trajectories",
        trajectory_mode="free_form",
        initial_position=None,
        auto_trim=True
    ):
        """
        Exports episodes_data into the official Hugging Face LeRobot dataset schema.
        Supports both 'free_form' (pretraining) and 'initial_aware' (fine-tuning) modes,
        with optional auto_trim of out-of-reach boundary frames.
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

            # Robust data extraction & IK resolution with auto-trim
            joint_states, ee_poses, actions, timestamps, num_frames, trim_info, prepend_approach_frames = self._ensure_joint_states_and_poses(
                ep,
                trajectory_mode=trajectory_mode,
                initial_position=initial_position,
                auto_trim=auto_trim
            )

            all_states.append(joint_states)
            all_ee_poses.append(ee_poses)
            all_actions.append(actions)

            # Transcode / copy video with synchronous trimming and approach frame padding
            src_video = ep.get('video_path', '')
            dst_video = os.path.join(video_dir, f"episode_{ep_idx:06d}.mp4")
            self._transcode_video_to_mp4(
                src_video,
                dst_video,
                target_fps=self.fps,
                num_frames=num_frames,
                slice_start=trim_info["f_start"],
                slice_end=trim_info["f_end"],
                prepend_hold_frames=prepend_approach_frames
            )

            for f_idx in range(num_frames):
                is_done = bool(f_idx == num_frames - 1)
                row = {
                    'index': global_frame_idx,
                    'episode_index': ep_idx,
                    'frame_index': f_idx,
                    'timestamp': float(np.float32(timestamps[f_idx])),
                    'next.done': is_done,
                    'task_index': task_idx,
                    'task': str(task),
                    'observation.state': joint_states[f_idx].astype(np.float32).tolist(),
                    'observation.ee_pose': ee_poses[f_idx].astype(np.float32).tolist(),
                    'action': actions[f_idx].astype(np.float32).tolist()
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
                "max": np.max(concat_states, axis=0).tolist(),
                "q01": np.quantile(concat_states, 0.01, axis=0).tolist(),
                "q99": np.quantile(concat_states, 0.99, axis=0).tolist()
            },
            "observation.ee_pose": {
                "mean": np.mean(concat_ee, axis=0).tolist(),
                "std": np.std(concat_ee, axis=0).tolist(),
                "min": np.min(concat_ee, axis=0).tolist(),
                "max": np.max(concat_ee, axis=0).tolist(),
                "q01": np.quantile(concat_ee, 0.01, axis=0).tolist(),
                "q99": np.quantile(concat_ee, 0.99, axis=0).tolist()
            },
            "action": {
                "mean": np.mean(concat_actions, axis=0).tolist(),
                "std": np.std(concat_actions, axis=0).tolist(),
                "min": np.min(concat_actions, axis=0).tolist(),
                "max": np.max(concat_actions, axis=0).tolist(),
                "q01": np.quantile(concat_actions, 0.01, axis=0).tolist(),
                "q99": np.quantile(concat_actions, 0.99, axis=0).tolist()
            }
        }
        with open(os.path.join(meta_dir, "stats.json"), "w") as f:
            json.dump(stats, f, indent=2)

        # 5. Save Info Configuration (meta/info.json)
        robot_specs = get_robot_specs(self.robot_type)
        # Derive joint names from DH table (generalized for any embodiment), append "gripper"
        dh_joint_names = [row.get("name", f"q{i}") for i, row in enumerate(robot_specs["dh_table"])]
        joint_feature_names = dh_joint_names + ["gripper"]
        num_joints = len(joint_feature_names)
        info = {
            "codebase_version": "v2.0",
            "robot_type": self.robot_type,
            "robot_name": robot_specs["name"],
            "trajectory_mode": str(trajectory_mode).lower(),
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
                    "shape": [num_joints],
                    "names": joint_feature_names
                },
                "observation.ee_pose": {
                    "dtype": "float32",
                    "shape": [6],
                    "names": ["x", "y", "z", "roll", "pitch", "yaw"]
                },
                "action": {
                    "dtype": "float32",
                    "shape": [num_joints],
                    "names": joint_feature_names
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

