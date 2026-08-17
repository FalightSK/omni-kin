"""
server.py
FastAPI Server for Mobile Dataset Collector & LeRobot Exporter
Supports HTTPS with self-signed SSL for mobile camera & IMU permissions.
"""

import os
import sys
import time
import json
import socket
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

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def ensure_ssl_certs():
    cert_file = os.path.join(BASE_DIR, "cert.pem")
    key_file = os.path.join(BASE_DIR, "key.pem")
    if not (os.path.exists(cert_file) and os.path.exists(key_file)):
        print("Generating self-signed SSL certificates for mobile camera support...")
        import datetime, ipaddress
        from cryptography import x509
        from cryptography.x509.oid import NameOID
        from cryptography.hazmat.primitives import hashes
        from cryptography.hazmat.primitives.asymmetric import rsa
        from cryptography.hazmat.primitives import serialization

        key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        subject = issuer = x509.Name([
            x509.NameAttribute(NameOID.COMMON_NAME, 'LeRobot Mobile Collector'),
        ])
        cert = (
            x509.CertificateBuilder()
            .subject_name(subject)
            .issuer_name(issuer)
            .public_key(key.public_key())
            .serial_number(x509.random_serial_number())
            .not_valid_before(datetime.datetime.utcnow() - datetime.timedelta(days=1))
            .not_valid_after(datetime.datetime.utcnow() + datetime.timedelta(days=3650))
            .add_extension(
                x509.SubjectAlternativeName([
                    x509.DNSName('localhost'),
                    x509.IPAddress(ipaddress.IPv4Address('127.0.0.1')),
                ]),
                critical=False,
            )
            .sign(key, hashes.SHA256())
        )
        with open(key_file, 'wb') as f:
            f.write(key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.TraditionalOpenSSL,
                encryption_algorithm=serialization.NoEncryption(),
            ))
        with open(cert_file, 'wb') as f:
            f.write(cert.public_bytes(serialization.Encoding.PEM))
    return cert_file, key_file

@app.get("/", response_class=HTMLResponse)
async def index_page(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")

@app.get("/mobile", response_class=HTMLResponse)
async def mobile_page(request: Request):
    return templates.TemplateResponse(request=request, name="mobile.html")

@app.get("/api/episodes")
async def get_episodes():
    return JSONResponse(EPISODES_DB)

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
        'poses': poses.tolist() if isinstance(poses, np.ndarray) else poses,
        'joint_states': joint_states.tolist() if isinstance(joint_states, np.ndarray) else joint_states,
        'actions': actions.tolist() if isinstance(actions, np.ndarray) else actions,
        'timestamps': timestamps.tolist() if isinstance(timestamps, np.ndarray) else timestamps,
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
        'poses': poses.tolist() if isinstance(poses, np.ndarray) else poses,
        'joint_states': joint_states.tolist() if isinstance(joint_states, np.ndarray) else joint_states,
        'actions': actions.tolist() if isinstance(actions, np.ndarray) else actions,
        'timestamps': timestamps.tolist() if isinstance(timestamps, np.ndarray) else timestamps,
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
    cert_path, key_path = ensure_ssl_certs()
    local_ip = get_local_ip()

    print("\n" + "="*60)
    print("🚀 LeRobot Mobile Trajectory Collector Server Started!")
    print("="*60)
    print(f"💻 Desktop Dashboard: https://localhost:8000  (or http://localhost:8000)")
    print(f"📱 Phone Mobile URL:  https://{local_ip}:8000/mobile")
    print("="*60)
    print("📌 NOTE: On mobile browser, accept the self-signed SSL warning")
    print("        (Click 'Advanced' -> 'Proceed to site') to enable Camera & IMU access.")
    print("="*60 + "\n")

    # Serve with SSL enabled for full mobile camera/sensor access
    use_ssl = "--no-ssl" not in sys.argv
    if use_ssl and os.path.exists(cert_path) and os.path.exists(key_path):
        uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True, ssl_certfile=cert_path, ssl_keyfile=key_path)
    else:
        uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
