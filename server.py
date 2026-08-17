"""
server.py
FastAPI Server for Mobile Dataset Collector & LeRobot Exporter
Focuses on pure relative 6-DoF End-Effector Trajectory starting at (0, 0, 0).
"""

import os
import sys
import time
import json
import socket
import shutil
import numpy as np
import cv2

# Set stdout/stderr to UTF-8
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

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

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

@app.get("/", response_class=HTMLResponse)
async def index_page(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")

@app.get("/mobile", response_class=HTMLResponse)
async def mobile_page(request: Request):
    return templates.TemplateResponse(request=request, name="mobile.html")

@app.get("/api/episodes")
async def get_episodes():
    return JSONResponse(EPISODES_DB)

@app.delete("/api/episodes/{episode_index}")
async def delete_episode(episode_index: int):
    global EPISODES_DB
    found = False
    new_db = []
    for ep in EPISODES_DB:
        if ep['episode_index'] == episode_index:
            found = True
            if os.path.exists(ep.get('video_path', '')):
                ep_dir = os.path.dirname(ep['video_path'])
                if os.path.exists(ep_dir):
                    shutil.rmtree(ep_dir, ignore_errors=True)
        else:
            new_db.append(ep)
    
    EPISODES_DB = new_db
    if not found:
        return JSONResponse({"status": "error", "message": "Episode not found"}, status_code=404)
    return JSONResponse({"status": "success", "message": f"Episode #{episode_index} deleted", "remaining": len(EPISODES_DB)})

@app.post("/api/episodes/clear")
async def clear_all_episodes():
    global EPISODES_DB
    for ep in EPISODES_DB:
        if os.path.exists(ep.get('video_path', '')):
            ep_dir = os.path.dirname(ep['video_path'])
            shutil.rmtree(ep_dir, ignore_errors=True)
    EPISODES_DB = []
    return JSONResponse({"status": "success", "message": "All episodes cleared"})

@app.post("/api/recordings/save")
async def save_recording(
    video: UploadFile = File(...),
    imu_data: str = Form("[]"),
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
    try:
        parsed_imu = json.loads(imu_data)
    except Exception:
        parsed_imu = []

    # 3. Determine frame count of video accurately
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps <= 0 or fps > 120 or np.isnan(fps):
        fps = 30.0

    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if frame_count <= 0:
        count = 0
        while True:
            ret, _ = cap.read()
            if not ret:
                break
            count += 1
        frame_count = max(count, 1)
    cap.release()

    if frame_count <= 0:
        frame_count = 60

    # 4. Estimate 6-DoF End-Effector Trajectory (Starts at 0, 0, 0)
    ee_poses = trajectory_estimator.estimate_trajectory_from_imu(parsed_imu, num_video_frames=frame_count, video_fps=fps)

    # 5. Append gripper state (100% open early, 10% closed near grasp)
    gripper_states = []
    for i in range(frame_count):
        g = 100.0 if i < (frame_count * 0.7) else 10.0
        gripper_states.append(g)

    # Target actions (next-step Cartesian EEF poses + gripper)
    ee_poses = np.array(ee_poses)
    actions = np.roll(ee_poses, -1, axis=0)
    actions[-1] = ee_poses[-1]

    timestamps = np.linspace(0, frame_count / fps, frame_count)

    episode_data = {
        'episode_index': ep_idx,
        'task': task,
        'video_path': video_path,
        'video_url': f"/recordings/episode_{ep_idx:04d}/recording.mp4",
        'num_frames': frame_count,
        'fps': fps,
        'duration': frame_count / fps,
        'ee_poses': ee_poses.tolist(),
        'poses': ee_poses.tolist(),
        'gripper_states': gripper_states,
        'actions': actions.tolist(),
        'timestamps': timestamps.tolist(),
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
    Generates a synthetic demonstration episode starting at (0, 0, 0) for instant testing.
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

    ee_poses = trajectory_estimator.estimate_trajectory_from_imu([], num_video_frames=frame_count, video_fps=fps)
    gripper_states = []

    for i in range(frame_count):
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.putText(frame, f"Task: {task}", (30, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 2)
        cv2.putText(frame, f"Frame {i+1}/{frame_count}", (30, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (129, 140, 248), 2)
        
        cx = int(320 + 150 * np.sin(i * 0.05))
        cy = int(240 + 80 * np.cos(i * 0.05))
        cv2.circle(frame, (cx, cy), 20, (0, 255, 0) if "apple" in task else (0, 255, 255), -1)
        out.write(frame)

        g = 100.0 if i < 60 else 10.0
        gripper_states.append(g)

    out.release()

    ee_poses = np.array(ee_poses)
    actions = np.roll(ee_poses, -1, axis=0)
    actions[-1] = ee_poses[-1]
    timestamps = np.linspace(0, frame_count / fps, frame_count)

    episode_data = {
        'episode_index': ep_idx,
        'task': task,
        'video_path': video_path,
        'video_url': f"/recordings/episode_{ep_idx:04d}/recording.mp4",
        'num_frames': frame_count,
        'fps': fps,
        'duration': frame_count / fps,
        'ee_poses': ee_poses.tolist(),
        'poses': ee_poses.tolist(),
        'gripper_states': gripper_states,
        'actions': actions.tolist(),
        'timestamps': timestamps.tolist(),
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

    export_path = lerobot_exporter.export_dataset(EPISODES_DB, dataset_name="mobile_eef_trajectory_demo")

    return JSONResponse({
        "status": "success",
        "export_path": export_path,
        "total_episodes": len(EPISODES_DB)
    })

@app.post("/api/isaac_lab/replay")
async def replay_in_isaac_lab(episode_index: int = 0):
    if not EPISODES_DB:
        return JSONResponse({"status": "error", "message": "No episodes to replay."}, status_code=400)

    export_path = lerobot_exporter.export_dataset(EPISODES_DB, dataset_name="mobile_eef_trajectory_demo")
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
    local_ip = get_local_ip()

    print("\n" + "="*60)
    print("LeRobot Mobile End-Effector Trajectory Collector Server Started!")
    print("="*60)
    print(f"Desktop Dashboard: http://localhost:8000")
    print(f"Phone Mobile URL:  http://{local_ip}:8000/mobile")
    print("="*60 + "\n")

    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
