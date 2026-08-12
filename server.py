"""
server.py
FastAPI Server for Mobile Dataset Collector & LeRobot Exporter
"""

import os
import time
import json
import numpy as np
import cv2
from fastapi import FastAPI, Request, File, UploadFile, Form
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from trajectory_estimator import TrajectoryEstimator
from robot_kinematics import SO100Kinematics
from lerobot_exporter import LeRobotExporter

app = FastAPI(title="LeRobot Mobile Trajectory Collector")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")
RECORDINGS_DIR = os.path.join(BASE_DIR, "recordings")
EXPORT_DIR = os.path.join(BASE_DIR, "lerobot_exports")

os.makedirs(RECORDINGS_DIR, exist_ok=True)
os.makedirs(EXPORT_DIR, exist_ok=True)

templates = Jinja2Templates(directory=TEMPLATES_DIR)
app.mount("/recordings", StaticFiles(directory=RECORDINGS_DIR), name="recordings")

# Global In-Memory Episode Storage
EPISODES_DB = []
ik_solver = SO100Kinematics()
trajectory_estimator = TrajectoryEstimator()
lerobot_exporter = LeRobotExporter(output_dir=EXPORT_DIR)

@app.get("/", response_class=HTMLResponse)
async def index_page(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/mobile", response_class=HTMLResponse)
async def mobile_page(request: Request):
    return templates.TemplateResponse("mobile.html", {"request": request})

@app.get("/api/episodes")
async def get_episodes():
    return JSONResponse(EPISODES_DB)

@app.post("/api/recordings/save")
async def save_recording(
    video: UploadFile = File(...),
    imu_data: str = Form(...),
    task: str = Form("reach to apple")
):
    ep_idx = len(EPISODES_DB)
    ep_dir = os.path.join(RECORDINGS_DIR, f"episode_{ep_idx:04d}")
    os.makedirs(ep_dir, exist_ok=True)

    # 1. Save video file
    video_path = os.path.join(ep_dir, "recording.mp4")
    with open(video_path, "wb") as f:
        f.write(await video.read())

    # 2. Parse IMU JSON
    parsed_imu = json.loads(imu_data)

    # 3. Determine frame count of video
    cap = cv2.VideoCapture(video_path)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    cap.release()

    if frame_count <= 0:
        frame_count = 60

    # 4. Estimate 6-DoF phone poses
    poses = trajectory_estimator.estimate_trajectory_from_imu(parsed_imu, num_video_frames=frame_count, video_fps=fps)

    # 5. Compute SO-100 Joint Angles via Inverse Kinematics
    joint_states = []
    actions = []

    for i in range(frame_count):
        phone_pose = poses[i]
        arm_pose = ik_solver.map_phone_to_workspace(phone_pose)
        
        # Simulating gripper closing near end of reach motion
        gripper_state = 100.0 if i < (frame_count * 0.7) else 10.0
        
        joints = ik_solver.inverse_kinematics(arm_pose, gripper_state=gripper_state)
        joint_states.append(joints)

    # Target actions (next step joint positions)
    joint_states = np.array(joint_states)
    actions = np.roll(joint_states, -1, axis=0)
    actions[-1] = joint_states[-1]

    timestamps = np.linspace(0, frame_count / fps, frame_count)

    episode_data = {
        'episode_index': ep_idx,
        'task': task,
        'video_path': video_path,
        'video_url': f"/recordings/episode_{ep_idx:04d}/recording.mp4",
        'num_frames': frame_count,
        'poses': poses.tolist(),
        'joint_states': joint_states,
        'actions': actions,
        'timestamps': timestamps,
        'created_at': time.strftime("%Y-%m-%d %H:%M:%S")
    }

    EPISODES_DB.append(episode_data)

    return JSONResponse({
        "status": "success",
        "episode_index": ep_idx,
        "task": task,
        "num_frames": frame_count
    })

@app.post("/api/recordings/sample")
async def generate_sample_recording(task: str = "reach to apple"):
    """
    Generates a synthetic demonstration episode for instant testing.
    """
    ep_idx = len(EPISODES_DB)
    ep_dir = os.path.join(RECORDINGS_DIR, f"episode_{ep_idx:04d}")
    os.makedirs(ep_dir, exist_ok=True)

    frame_count = 90
    fps = 30.0
    video_path = os.path.join(ep_dir, "recording.mp4")

    # Generate synthetic video stream
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(video_path, fourcc, fps, (640, 480))

    poses = trajectory_estimator.estimate_trajectory_from_imu([], num_video_frames=frame_count, video_fps=fps)
    joint_states = []

    for i in range(frame_count):
        # Draw dynamic frame
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.putText(frame, f"Task: {task}", (30, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 2)
        cv2.putText(frame, f"Frame {i+1}/{frame_count}", (30, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (129, 140, 248), 2)
        
        # Draw moving target point
        cx = int(320 + 150 * np.sin(i * 0.05))
        cy = int(240 + 80 * np.cos(i * 0.05))
        cv2.circle(frame, (cx, cy), 20, (0, 255, 0) if "apple" in task else (0, 255, 255), -1)
        out.write(frame)

        # Compute IK
        phone_pose = poses[i]
        arm_pose = ik_solver.map_phone_to_workspace(phone_pose)
        gripper = 100.0 if i < 60 else 0.0
        joints = ik_solver.inverse_kinematics(arm_pose, gripper_state=gripper)
        joint_states.append(joints)

    out.release()

    joint_states = np.array(joint_states)
    actions = np.roll(joint_states, -1, axis=0)
    actions[-1] = joint_states[-1]
    timestamps = np.linspace(0, frame_count / fps, frame_count)

    episode_data = {
        'episode_index': ep_idx,
        'task': task,
        'video_path': video_path,
        'video_url': f"/recordings/episode_{ep_idx:04d}/recording.mp4",
        'num_frames': frame_count,
        'poses': poses.tolist(),
        'joint_states': joint_states,
        'actions': actions,
        'timestamps': timestamps,
        'created_at': time.strftime("%Y-%m-%d %H:%M:%S")
    }

    EPISODES_DB.append(episode_data)

    return JSONResponse({
        "status": "success",
        "episode_index": ep_idx,
        "task": task
    })

@app.post("/api/export_lerobot")
async def export_lerobot():
    if not EPISODES_DB:
        return JSONResponse({"status": "error", "message": "No episodes recorded yet."}, status_code=400)

    export_path = lerobot_exporter.export_dataset(EPISODES_DB, dataset_name="mobile_so100_demo")

    return JSONResponse({
        "status": "success",
        "export_path": export_path,
        "total_episodes": len(EPISODES_DB)
    })

@app.post("/api/isaac_lab/replay")
async def replay_in_isaac_lab(episode_index: int = 0):
    """
    Triggers Isaac Lab simulation replay using C:\\Users\\SK\\miniconda3\\envs\\isaac_lab\\python.exe
    """
    # First export dataset if not already exported
    if not EPISODES_DB:
        return JSONResponse({"status": "error", "message": "No episodes to replay."}, status_code=400)

    export_path = lerobot_exporter.export_dataset(EPISODES_DB, dataset_name="mobile_so100_demo")
    parquet_path = os.path.join(export_path, "data", "chunk-000", "file-000.parquet")

    isaac_python = r"C:\Users\SK\miniconda3\envs\isaac_lab\python.exe"
    script_path = os.path.join(BASE_DIR, "isaac_lab_replay.py")

    cmd = [
        isaac_python,
        script_path,
        "--parquet_path", parquet_path,
        "--episode_index", str(episode_index)
    ]

    import subprocess
    subprocess.Popen(cmd, cwd=BASE_DIR)

    return JSONResponse({
        "status": "success",
        "message": f"Isaac Lab replay launched for Episode #{episode_index}!",
        "cmd": " ".join(cmd)
    })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
