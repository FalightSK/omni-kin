"""
lerobot_exporter.py
Exports processed mobile robot trajectories & videos into Hugging Face LeRobot format.
"""

import os
import json
import shutil
import numpy as np
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq

class LeRobotExporter:
    """
    Exports episode datasets into the standard Hugging Face LeRobot directory schema.
    """

    def __init__(self, output_dir="lerobot_dataset", fps=30):
        self.output_dir = output_dir
        self.fps = fps

    def export_dataset(self, episodes_data, dataset_name="mobile_so100_demo"):
        """
        episodes_data: list of dicts:
        [
           {
               'episode_index': 0,
               'task': 'reach to apple',
               'video_path': 'path/to/video.mp4',
               'joint_states': np_array (N x 6),
               'actions': np_array (N x 6),
               'timestamps': np_array (N)
           },
           ...
        ]
        """
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

        # Accummulate stats for meta/stats.json
        all_states = []
        all_actions = []

        for ep in episodes_data:
            ep_idx = ep['episode_index']
            task = ep['task']
            joint_states = ep['joint_states']  # N x 6
            actions = ep['actions']            # N x 6
            timestamps = ep['timestamps']      # N
            num_frames = len(joint_states)

            all_states.append(joint_states)
            all_actions.append(actions)

            # Copy or convert video file to dataset location
            dst_video_path = os.path.join(video_dir, f"episode_{ep_idx:06d}.mp4")
            if os.path.exists(ep['video_path']):
                shutil.copy(ep['video_path'], dst_video_path)

            for f_idx in range(num_frames):
                row = {
                    'index': global_frame_idx,
                    'episode_index': ep_idx,
                    'frame_index': f_idx,
                    'timestamp': float(timestamps[f_idx]),
                    'task': str(task),
                    'observation.state': joint_states[f_idx].tolist(),
                    'action': actions[f_idx].tolist()
                }
                all_rows.append(row)
                global_frame_idx += 1

            episode_meta_rows.append({
                'episode_index': ep_idx,
                'task': task,
                'length': num_frames,
                'fps': self.fps
            })

        # 1. Save Tabular Data (data/chunk-000/file-000.parquet)
        df_data = pd.DataFrame(all_rows)
        parquet_file = os.path.join(data_dir, "file-000.parquet")
        df_data.to_parquet(parquet_file, index=False)

        # 2. Save Episode Metadata (meta/episodes/file-000.parquet)
        df_episodes = pd.DataFrame(episode_meta_rows)
        episodes_parquet = os.path.join(episodes_meta_dir, "file-000.parquet")
        df_episodes.to_parquet(episodes_parquet, index=False)

        # 3. Compute and Save Stats (meta/stats.json)
        concat_states = np.vstack(all_states)
        concat_actions = np.vstack(all_actions)

        stats = {
            "observation.state": {
                "mean": np.mean(concat_states, axis=0).tolist(),
                "std": np.std(concat_states, axis=0).tolist(),
                "min": np.min(concat_states, axis=0).tolist(),
                "max": np.max(concat_states, axis=0).tolist()
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

        # 4. Save Info Config (meta/info.json)
        info = {
            "codebase_version": "v3.0",
            "robot_type": "so100",
            "fps": self.fps,
            "total_episodes": len(episodes_data),
            "total_frames": global_frame_idx,
            "total_tasks": len(set(ep['task'] for ep in episodes_data)),
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
                "action": {
                    "dtype": "float32",
                    "shape": [6],
                    "names": ["q0_base_yaw", "q1_shoulder_pitch", "q2_elbow_pitch", "q3_wrist_pitch", "q4_wrist_roll", "gripper"]
                },
                "episode_index": {"dtype": "int64", "shape": [1]},
                "frame_index": {"dtype": "int64", "shape": [1]},
                "timestamp": {"dtype": "float32", "shape": [1]},
                "index": {"dtype": "int64", "shape": [1]},
                "task": {"dtype": "string", "shape": [1]}
            }
        }
        with open(os.path.join(meta_dir, "info.json"), "w") as f:
            json.dump(info, f, indent=2)

        print(f"Successfully exported LeRobot dataset to: {export_path}")
        return export_path

if __name__ == "__main__":
    exporter = LeRobotExporter(output_dir="sample_export")
    dummy_ep = [{
        'episode_index': 0,
        'task': 'reach to apple',
        'video_path': 'non_existent.mp4',
        'joint_states': np.random.randn(30, 6),
        'actions': np.random.randn(30, 6),
        'timestamps': np.linspace(0, 1, 30)
    }]
    exporter.export_dataset(dummy_ep)
