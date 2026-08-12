"""
isaac_lab_replay.py
Isaac Lab Simulation Replay for Mobile Dataset Collector Trajectories
Executed via: C:\Users\SK\miniconda3\envs\isaac_lab\python.exe isaac_lab_replay.py
"""

import argparse
import os
import sys
import time
import numpy as np

# Parse launcher args before importing Omniverse / Isaac Lab modules
parser = argparse.ArgumentParser(description="Isaac Lab Replay for Mobile Trajectory Collector")
parser.add_argument("--parquet_path", type=str, default=None, help="Path to LeRobot file-000.parquet")
parser.add_argument("--episode_index", type=int, default=0, help="Episode index to replay")
parser.add_argument("--fps", type=float, default=30.0, help="Replay FPS")
parser.add_argument("--headless", action="store_true", help="Run simulation in headless mode")

# Add Isaac Lab AppLauncher arguments
from isaaclab.app import AppLauncher
AppLauncher.add_app_launcher_args(parser)

args_cli = parser.parse_args()

# Launch Omniverse Simulation App
app_launcher = AppLauncher(args_cli)
simulation_app = app_launcher.app

# Imports after AppLauncher initialization
import pandas as pd
import torch
import isaaclab.sim as sim_utils
from isaaclab.sim import SimulationContext

def load_episode_trajectory(parquet_path, ep_index=0):
    if not parquet_path or not os.path.exists(parquet_path):
        print(f"[Warning] Parquet file '{parquet_path}' not found. Generating synthetic trajectory...")
        # Synthetic reach trajectory
        t = np.linspace(0, 1.0, 90)
        q0 = 20.0 * np.sin(np.pi * t)
        q1 = 45.0 * np.sin(np.pi * t)
        q2 = 60.0 * np.sin(np.pi * t)
        q3 = -30.0 * np.sin(np.pi * t)
        q4 = 10.0 * np.sin(2 * np.pi * t)
        gripper = np.where(t < 0.7, 100.0, 10.0)
        return np.column_stack([q0, q1, q2, q3, q4, gripper])

    df = pd.read_parquet(parquet_path)
    if 'episode_index' in df.columns:
        df = df[df['episode_index'] == ep_index]

    if 'observation.state' in df.columns:
        states = np.array(df['observation.state'].tolist())
        return states

    return np.zeros((60, 6))

def main():
    print("==================================================")
    print("      🚀 ISAAC LAB SIMULATION REPLAY STARTED     ")
    print("==================================================")

    # 1. Setup Simulation Context
    sim_cfg = sim_utils.SimulationCfg(
        dt=1.0 / args_cli.fps,
        render_interval=1,
        device="cuda" if torch.cuda.is_available() else "cpu"
    )
    sim = SimulationContext(sim_cfg)
    sim.set_camera_view(eye=[1.2, 1.2, 0.8], target=[0.0, 0.0, 0.2])

    # 2. Add Ground Plane & Lighting
    cfg_ground = sim_utils.GroundPlaneCfg()
    cfg_ground.func("/World/defaultGroundPlane", cfg_ground)

    cfg_light = sim_utils.DistantLightCfg(intensity=3000.0, color=(1.0, 1.0, 1.0))
    cfg_light.func("/World/defaultLight", cfg_light, translation=(1.0, 1.0, 3.0))

    # 3. Add Target End-Effector Visual Marker Object (e.g. Target Sphere)
    cfg_target = sim_utils.SphereCfg(
        radius=0.03,
        visual_material=sim_utils.PreviewSurfaceCfg(diffuse_color=(0.5, 0.5, 1.0))
    )
    cfg_target.func("/World/TargetObject", cfg_target, translation=(0.25, 0.0, 0.15))

    # 4. Add Robot Base / Arm Link Visualization Cubes (Representing SO-100 Joint Chain)
    base_cfg = sim_utils.CuboidCfg(
        size=(0.12, 0.12, 0.08),
        visual_material=sim_utils.PreviewSurfaceCfg(diffuse_color=(0.2, 0.2, 0.3))
    )
    base_cfg.func("/World/Robot/Base", base_cfg, translation=(0.0, 0.0, 0.04))

    shoulder_cfg = sim_utils.CuboidCfg(
        size=(0.04, 0.04, 0.14),
        visual_material=sim_utils.PreviewSurfaceCfg(diffuse_color=(0.3, 0.5, 0.9))
    )
    shoulder_cfg.func("/World/Robot/Shoulder", shoulder_cfg, translation=(0.0, 0.0, 0.15))

    forearm_cfg = sim_utils.CuboidCfg(
        size=(0.03, 0.03, 0.14),
        visual_material=sim_utils.PreviewSurfaceCfg(diffuse_color=(0.9, 0.4, 0.4))
    )
    forearm_cfg.func("/World/Robot/Forearm", forearm_cfg, translation=(0.12, 0.0, 0.22))

    gripper_cfg = sim_utils.SphereCfg(
        radius=0.025,
        visual_material=sim_utils.PreviewSurfaceCfg(diffuse_color=(0.2, 0.8, 0.3))
    )
    gripper_cfg.func("/World/Robot/Gripper", gripper_cfg, translation=(0.22, 0.0, 0.22))

    # Reset physics simulation
    sim.reset()
    print("✅ Isaac Lab Simulation Scene Initialized.")

    # 5. Load Trajectory
    joint_states = load_episode_trajectory(args_cli.parquet_path, args_cli.episode_index)
    num_frames = len(joint_states)
    print(f"✅ Loaded {num_frames} frames from trajectory.")

    frame_idx = 0
    step_time = 1.0 / args_cli.fps

    while simulation_app.is_running():
        # Step simulation physics
        sim.step()

        # Update simulated robot joint pose position
        if frame_idx < num_frames:
            q = joint_states[frame_idx]
            # Convert SO-100 joints (q0 yaw, q1 pitch, q2 pitch, etc.) to 3D End-Effector visual position
            q0_rad, q1_rad, q2_rad = np.radians(q[0]), np.radians(q[1]), np.radians(q[2])
            
            # Simple Forward Kinematics placement for visual animation in Isaac Sim
            r = 0.135 * np.cos(q1_rad) + 0.140 * np.cos(q1_rad + q2_rad)
            ee_x = r * np.cos(q0_rad)
            ee_y = r * np.sin(q0_rad)
            ee_z = 0.115 + 0.135 * np.sin(q1_rad) + 0.140 * np.sin(q1_rad + q2_rad)

            # Move visual gripper marker in Isaac Sim stage
            sim_utils.find_matching_prim_paths("/World/Robot/Gripper")

            frame_idx = (frame_idx + 1) % num_frames
            time.sleep(step_time)

    # Close App
    simulation_app.close()

if __name__ == "__main__":
    main()
