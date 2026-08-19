"""
server.py
FastAPI Server for ArUco-Anchored Mobile Dataset Collector & 3D Trajectory Visualizer
"""

import os
import sys
import time
import json
import socket
import shutil
import io
import numpy as np
import cv2

# Set stdout/stderr to UTF-8
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

from fastapi import FastAPI, Request, File, UploadFile, Form, Response
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from visual_tracker import VisualInertialTracker
from lerobot_exporter import LeRobotExporter

app = FastAPI(title="ArUco-Anchored 3D Trajectory Collector")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")
RECORDINGS_DIR = os.path.join(BASE_DIR, "recordings")
EXPORT_DIR = os.path.join(BASE_DIR, "lerobot_exports")

os.makedirs(RECORDINGS_DIR, exist_ok=True)
os.makedirs(EXPORT_DIR, exist_ok=True)

templates = Jinja2Templates(directory=TEMPLATES_DIR)
app.mount("/recordings", StaticFiles(directory=RECORDINGS_DIR), name="recordings")

# Global In-Memory Episode Storage & Visual-Inertial Tracker
EPISODES_DB = []
visual_tracker = VisualInertialTracker(marker_size_meters=0.10)
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

@app.get("/api/marker/raw")
async def get_raw_marker(marker_id: int = 0, size: int = 800, dict_name: str = "DICT_6X6_250"):
    """
    Returns pure ArUco black/white square with NO extra borders or banners.
    """
    marker_img = visual_tracker.generate_raw_marker(marker_id=marker_id, side_pixels=size, dict_name=dict_name)
    success, buffer = cv2.imencode(".png", marker_img)
    return Response(content=buffer.tobytes(), media_type="image/png")

@app.get("/api/marker/image")
async def get_marker_image(marker_id: int = 0, size: int = 600, width_cm: float = 10.0, dict_name: str = "DICT_6X6_250"):
    """
    Generates and returns a high-resolution printable ArUco marker PNG with clean borders and label.
    """
    marker_img = visual_tracker.generate_marker_image(
        marker_id=marker_id,
        side_pixels=size,
        border_pixels=int(size * 0.12),
        dict_name=dict_name
    )
    
    # Add title text banner
    h, w = marker_img.shape
    banner_h = 60
    full_img = np.ones((h + banner_h, w), dtype=np.uint8) * 255
    full_img[banner_h:, :] = marker_img
    cv2.putText(
        full_img,
        f"ArUco {dict_name.replace('DICT_', '')} - ID {marker_id}  [Target Width: {width_cm:.1f} cm]",
        (int(w * 0.05), 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.58,
        0,
        2
    )

    success, buffer = cv2.imencode(".png", full_img)
    return Response(content=buffer.tobytes(), media_type="image/png")

@app.get("/api/marker/print", response_class=HTMLResponse)
async def print_marker_page(marker_id: int = 0, width_cm: float = 10.0, dict_name: str = "DICT_6X6_250"):
    """
    Returns an HTML print template where the BLACK ARUCO SQUARE is scaled to EXACTLY width_cm.
    """
    return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Print ArUco Marker (Exact {width_cm}cm)</title>
    <style>
        @page {{
            size: A4 portrait;
            margin: 15mm;
        }}
        * {{
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }}
        body {{
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            background: #fff;
            color: #000;
        }}
        .no-print {{
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 12px 18px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            max-width: 500px;
        }}
        .print-btn {{
            background: #2563eb;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 14px;
            cursor: pointer;
            margin-top: 8px;
        }}
        @media print {{
            .no-print {{ display: none !important; }}
            body {{ padding: 0; }}
        }}

        /* EXACT PHYSICAL CENTIMETER DIMENSIONS FOR BLACK ARUCO SQUARE */
        .marker-card {{
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 10mm;
        }}

        .marker-black-square {{
            width: {width_cm}cm;
            height: {width_cm}cm;
            display: block;
            image-rendering: pixelated;
        }}

        .marker-info {{
            font-size: 12px;
            font-weight: 600;
            margin-top: 4mm;
            text-align: center;
            width: {width_cm}cm;
        }}

        /* Printed Centimeter Ruler for Calibration Verification */
        .ruler-container {{
            width: {width_cm}cm;
            margin-top: 4mm;
            border-top: 2px solid #000;
            position: relative;
            height: 12mm;
        }}

        .ruler-tick {{
            position: absolute;
            top: 0;
            width: 1px;
            background: #000;
        }}

        .ruler-label {{
            position: absolute;
            top: 6mm;
            font-size: 9px;
            font-family: monospace;
            transform: translateX(-50%);
        }}
    </style>
</head>
<body>
    <div class="no-print">
        <h3 style="margin: 0 0 6px 0; color: #1e293b;">🖨️ Physical Scale Printing Instructions</h3>
        <p style="margin: 0; font-size: 13px; color: #475569;">
            In your printer dialog, select <strong>Scale: 100% (Actual Size)</strong>. The black square and the ruler will both measure exactly {width_cm} cm.
        </p>
        <button class="print-btn" onclick="window.print()">PRINT EXACT {width_cm} CM ARUCO MARKER</button>
    </div>

    <div class="marker-card">
        <!-- PURE BLACK ARUCO SQUARE: Exactly width_cm x width_cm -->
        <img class="marker-black-square" src="/api/marker/raw?marker_id={marker_id}&size=800&dict_name={dict_name}" alt="ArUco Marker">
        
        <div class="marker-info">ArUco {dict_name.replace('DICT_', '')} | ID {marker_id} | Black Square: Exactly {width_cm} cm × {width_cm} cm</div>
        
        <!-- Verification Ruler matching the black square width -->
        <div class="ruler-container">
            <div class="ruler-tick" style="left: 0; height: 6mm;"></div>
            <div class="ruler-label" style="left: 0;">0cm</div>
            
            <div class="ruler-tick" style="left: 25%; height: 3mm;"></div>
            <div class="ruler-label" style="left: 25%;">{width_cm*0.25:.1f}</div>

            <div class="ruler-tick" style="left: 50%; height: 6mm;"></div>
            <div class="ruler-label" style="left: 50%;">{width_cm*0.5:.1f}cm</div>

            <div class="ruler-tick" style="left: 75%; height: 3mm;"></div>
            <div class="ruler-label" style="left: 75%;">{width_cm*0.75:.1f}</div>

            <div class="ruler-tick" style="right: 0; height: 6mm;"></div>
            <div class="ruler-label" style="right: 0;">{width_cm:.1f}cm</div>
        </div>
    </div>
</body>
</html>"""

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

    # 4. ArUco PnP & Visual-Inertial 3D Trajectory Reconstruction (Anchored at (0,0,0) Table Marker)
    anchored_poses = visual_tracker.process_video_and_imu(video_path, parsed_imu, fps=fps)

    # 5. Append gripper state (100% open early, 10% closed near grasp)
    gripper_states = []
    for i in range(len(anchored_poses)):
        g = 100.0 if i < (len(anchored_poses) * 0.7) else 10.0
        gripper_states.append(g)

    # Target actions (next-step Cartesian poses + gripper)
    anchored_poses = np.array(anchored_poses)
    actions = np.roll(anchored_poses, -1, axis=0)
    actions[-1] = anchored_poses[-1]

    timestamps = np.linspace(0, len(anchored_poses) / fps, len(anchored_poses))

    episode_data = {
        'episode_index': ep_idx,
        'task': task,
        'video_path': video_path,
        'video_url': f"/recordings/episode_{ep_idx:04d}/recording.mp4",
        'num_frames': len(anchored_poses),
        'fps': fps,
        'duration': len(anchored_poses) / fps,
        'anchor': 'aruco_dict_6x6_250_id0',
        'marker_size_cm': 10.0,
        'poses': anchored_poses.tolist(),
        'ee_poses': anchored_poses.tolist(),
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
        "num_frames": len(anchored_poses),
        "anchor": "ArUco (0, 0, 0) Table Center"
    })

@app.post("/api/recordings/sample")
async def generate_sample_recording(task: str = "reach to apple", shape: str = "circle"):
    """
    Generates a synthetic 3D shape demonstration (e.g. 3D circle floating 20cm above ArUco marker).
    """
    ep_idx = len(EPISODES_DB)
    ep_dir = os.path.join(RECORDINGS_DIR, f"episode_{ep_idx:04d}")
    os.makedirs(ep_dir, exist_ok=True)

    frame_count = 90
    fps = 30.0
    video_path = os.path.join(ep_dir, "recording.mp4")

    # Generate synthetic video stream showing the table and ArUco marker
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(video_path, fourcc, fps, (640, 480))

    marker_img = visual_tracker.generate_marker_image(marker_id=0, side_pixels=140, border_pixels=10)
    mh, mw = marker_img.shape

    anchored_poses = visual_tracker.generate_synthetic_anchored_trajectory(num_frames=frame_count, shape=shape)
    gripper_states = []

    for i in range(frame_count):
        # Draw wooden table background
        frame = np.full((480, 640, 3), (35, 45, 60), dtype=np.uint8)
        
        # Draw ArUco marker flat on table center
        my, mx = 240, 250
        frame[my:my+mh, mx:mx+mw] = cv2.cvtColor(marker_img, cv2.COLOR_GRAY2BGR)

        # Draw hand trajectory target
        p = anchored_poses[i]
        # Project 3D point (p[0], p[1], p[2]) to 2D image preview
        px = int(320 + p[0] * 800)
        py = int(240 - p[2] * 400 + p[1] * 300)
        cv2.circle(frame, (px, py), 12, (0, 255, 255), -1)
        cv2.putText(frame, f"Task: {task}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        cv2.putText(frame, f"Z (Height above marker): {p[2]*100:.1f} cm", (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (129, 140, 248), 2)
        
        out.write(frame)
        g = 100.0 if i < 60 else 10.0
        gripper_states.append(g)

    out.release()

    anchored_poses = np.array(anchored_poses)
    actions = np.roll(anchored_poses, -1, axis=0)
    actions[-1] = anchored_poses[-1]
    timestamps = np.linspace(0, frame_count / fps, frame_count)

    episode_data = {
        'episode_index': ep_idx,
        'task': task,
        'video_path': video_path,
        'video_url': f"/recordings/episode_{ep_idx:04d}/recording.mp4",
        'num_frames': frame_count,
        'fps': fps,
        'duration': frame_count / fps,
        'anchor': 'aruco_dict_6x6_250_id0',
        'marker_size_cm': 10.0,
        'poses': anchored_poses.tolist(),
        'ee_poses': anchored_poses.tolist(),
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

    export_path = lerobot_exporter.export_dataset(EPISODES_DB, dataset_name="mobile_aruco_3d_trajectories")

    return JSONResponse({
        "status": "success",
        "export_path": export_path,
        "total_episodes": len(EPISODES_DB)
    })

@app.post("/api/isaac_lab/replay")
async def replay_in_isaac_lab(episode_index: int = 0):
    if not EPISODES_DB:
        return JSONResponse({"status": "error", "message": "No episodes to replay."}, status_code=400)

    export_path = lerobot_exporter.export_dataset(EPISODES_DB, dataset_name="mobile_aruco_3d_trajectories")
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
    print("ArUco-Anchored 3D Trajectory Collector Server Started!")
    print("="*60)
    print(f"Desktop Dashboard: http://localhost:8000")
    print(f"Phone Mobile URL:  http://{local_ip}:8000/mobile")
    print(f"Print ArUco Marker: http://localhost:8000/api/marker/image")
    print("="*60 + "\n")

    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
