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
import uuid
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
from robot_kinematics import (
    WorkspaceCalibrator,
    get_robot_specs,
    get_robot_urdf,
    URDFParser,
    ROBOT_PRESETS
)

app = FastAPI(title="ArUco-Anchored 3D Trajectory Collector")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")
RECORDINGS_DIR = os.path.join(BASE_DIR, "recordings")
EXPORT_DIR = os.path.join(BASE_DIR, "lerobot_exports")
ROBOT_CONFIG_FILE = os.path.join(BASE_DIR, "robot_config.json")

os.makedirs(RECORDINGS_DIR, exist_ok=True)
os.makedirs(EXPORT_DIR, exist_ok=True)

def load_robot_config():
    default_cfg = {
        "robot_type": "so101",
        "offset_x": 0.20,
        "offset_y": 0.00,
        "offset_z": 0.00,
        "yaw_deg": 0.0
    }
    if os.path.exists(ROBOT_CONFIG_FILE):
        try:
            with open(ROBOT_CONFIG_FILE, "r", encoding="utf-8") as f:
                saved = json.load(f)
                default_cfg.update(saved)
        except Exception as e:
            print(f"Warning loading {ROBOT_CONFIG_FILE}: {e}")
    return default_cfg

def save_robot_config(cfg):
    try:
        with open(ROBOT_CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(cfg, f, indent=2)
    except Exception as e:
        print(f"Error saving {ROBOT_CONFIG_FILE}: {e}")

ROBOT_CONFIG = load_robot_config()
workspace_calibrator = WorkspaceCalibrator(
    offset_x=ROBOT_CONFIG["offset_x"],
    offset_y=ROBOT_CONFIG["offset_y"],
    offset_z=ROBOT_CONFIG["offset_z"],
    yaw_deg=ROBOT_CONFIG["yaw_deg"]
)

FRONTEND_DIST_DIR = os.path.join(BASE_DIR, "frontend", "dist")
if os.path.exists(os.path.join(FRONTEND_DIST_DIR, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST_DIR, "assets")), name="assets")

templates = Jinja2Templates(directory=TEMPLATES_DIR)
app.mount("/recordings", StaticFiles(directory=RECORDINGS_DIR), name="recordings")

# Global In-Memory Episode Storage & Visual-Inertial Tracker
EPISODES_DB = []
visual_tracker = VisualInertialTracker(
    tag_a_size=0.10,
    tag_b_size=0.05,
    tag_a_id=0,
    tag_b_id=1,
    tag_b_offset=(0.15, 0.0, 0.0)
)
lerobot_exporter = LeRobotExporter(
    output_dir=EXPORT_DIR,
    robot_type=ROBOT_CONFIG["robot_type"],
    workspace_calibrator=workspace_calibrator
)

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
    index_dist = os.path.join(FRONTEND_DIST_DIR, "index.html")
    if os.path.exists(index_dist):
        return FileResponse(index_dist)
    return templates.TemplateResponse(request=request, name="index.html")

@app.get("/mobile", response_class=HTMLResponse)
async def mobile_page(request: Request):
    index_dist = os.path.join(FRONTEND_DIST_DIR, "index.html")
    if os.path.exists(index_dist):
        return FileResponse(index_dist)
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
        <div style="margin-top: 8px;">
            <a href="/api/marker/print_dual" style="font-size: 13px; color: #2563eb; text-decoration: underline;">Switch to Dual-ArUco Rigid Board (10cm + 5cm)</a>
        </div>
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

@app.get("/api/marker/print_dual", response_class=HTMLResponse)
async def print_dual_marker_page(
    tag_a_id: int = 0,
    tag_a_cm: float = 10.0,
    tag_b_id: int = 1,
    tag_b_cm: float = 5.0,
    spacing_cm: float = 5.0,
    dict_name: str = "DICT_6X6_250"
):
    """
    Returns an HTML print template rendering the Dual-ArUco Rigid Board
    with Tag A (10cm) and Tag B (5cm) separated by exact spacing on a single page.
    """
    total_span_cm = tag_a_cm + spacing_cm + tag_b_cm
    tag_b_offset_x = tag_a_cm + spacing_cm

    return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Print Dual-ArUco Rigid Board (10cm + 5cm)</title>
    <style>
        @page {{
            size: A4 landscape;
            margin: 10mm;
        }}
        * {{
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }}
        body {{
            margin: 0;
            padding: 15px;
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
            margin-bottom: 15px;
            text-align: center;
            max-width: 650px;
        }}
        .print-btn {{
            background: #2563eb;
            color: white;
            border: none;
            padding: 10px 22px;
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

        /* RIGID BOARD DUAL LAYOUT WITH EXACT CENTIMETER SIZING */
        .board-container {{
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            margin-top: 5mm;
            border: 1px dashed #cbd5e1;
            padding: 10mm;
        }}

        .tags-row {{
            display: flex;
            flex-direction: row;
            align-items: flex-end; /* Baseline-align bottom edges (y=0) */
            height: {tag_a_cm}cm;
        }}

        .tag-wrapper {{
            display: flex;
            flex-direction: column;
            align-items: center;
        }}

        .tag-a-img {{
            width: {tag_a_cm}cm;
            height: {tag_a_cm}cm;
            display: block;
            image-rendering: pixelated;
        }}

        .tag-b-img {{
            width: {tag_b_cm}cm;
            height: {tag_b_cm}cm;
            display: block;
            image-rendering: pixelated;
        }}

        .gap-spacer {{
            width: {spacing_cm}cm;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-bottom: 2px dashed #94a3b8;
            position: relative;
        }}

        .gap-label {{
            font-size: 11px;
            color: #64748b;
            font-weight: 600;
            background: white;
            padding: 0 4px;
        }}

        .origin-marker {{
            position: absolute;
            bottom: -20px;
            left: 0;
            font-size: 11px;
            font-weight: bold;
            color: #dc2626;
        }}

        .tag-title {{
            font-size: 12px;
            font-weight: 600;
            margin-top: 4mm;
            text-align: center;
        }}

        /* Printed Centimeter Ruler for Physical Calibration Verification */
        .ruler-container {{
            width: {total_span_cm}cm;
            margin-top: 8mm;
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
        <h3 style="margin: 0 0 6px 0; color: #1e293b;">🖨️ Dual-ArUco Rigid Board Calibration Sheet</h3>
        <p style="margin: 0; font-size: 13px; color: #475569;">
            In your printer dialog, select <strong>Paper: A4 Landscape</strong> and <strong>Scale: 100% (Actual Size)</strong>.<br>
            Tag A is exactly {tag_a_cm}cm, Tag B is exactly {tag_b_cm}cm, with {spacing_cm}cm physical spacing.
        </p>
        <button class="print-btn" onclick="window.print()">PRINT DUAL-ARUCO RIGID BOARD (1:1 SCALE)</button>
    </div>

    <div class="board-container">
        <!-- Dual ArUco Tags Row -->
        <div class="tags-row" style="position: relative;">
            <!-- Tag A (Primary Origin Anchor at Bottom-Left) -->
            <div class="tag-wrapper">
                <img class="tag-a-img" src="/api/marker/raw?marker_id={tag_a_id}&size=800&dict_name={dict_name}" alt="Tag A (10cm)">
                <div class="tag-title">Tag A (ID {tag_a_id}) - {tag_a_cm:.0f}cm [Origin Anchor (0,0,0)]</div>
            </div>

            <!-- Exact Spacing -->
            <div class="gap-spacer">
                <span class="gap-label">↔ {spacing_cm:.1f} cm</span>
            </div>

            <!-- Tag B (Secondary Offset Anchor) -->
            <div class="tag-wrapper">
                <img class="tag-b-img" src="/api/marker/raw?marker_id={tag_b_id}&size=400&dict_name={dict_name}" alt="Tag B (5cm)">
                <div class="tag-title">Tag B (ID {tag_b_id}) - {tag_b_cm:.0f}cm [Offset X={tag_b_offset_x/100.0:.2f}m]</div>
            </div>
        </div>

        <!-- Metric Calibration Ruler spanning entire board width -->
        <div class="ruler-container">
            <div class="ruler-tick" style="left: 0; height: 8mm; background: #dc2626; width: 2px;"></div>
            <div class="ruler-label" style="left: 0; color: #dc2626; font-weight: bold;">(0,0,0) Origin</div>

            <div class="ruler-tick" style="left: {tag_a_cm/total_span_cm*100}%; height: 6mm;"></div>
            <div class="ruler-label" style="left: {tag_a_cm/total_span_cm*100}%;">{tag_a_cm:.0f}cm</div>

            <div class="ruler-tick" style="left: {tag_b_offset_x/total_span_cm*100}%; height: 6mm;"></div>
            <div class="ruler-label" style="left: {tag_b_offset_x/total_span_cm*100}%;">{tag_b_offset_x:.0f}cm</div>

            <div class="ruler-tick" style="right: 0; height: 8mm;"></div>
            <div class="ruler-label" style="right: 0;">{total_span_cm:.0f}cm</div>
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

    if not found:
        return JSONResponse({"status": "error", "message": "Episode not found"}, status_code=404)

    # Re-index remaining episodes contiguously so episode_index is always 0..N-1
    for idx, ep in enumerate(new_db):
        ep['episode_index'] = idx

    EPISODES_DB = new_db
    return JSONResponse({
        "status": "success",
        "message": f"Episode #{episode_index} deleted",
        "remaining": len(EPISODES_DB),
        "episodes": EPISODES_DB
    })

@app.post("/api/episodes/clear")
async def clear_all_episodes():
    global EPISODES_DB
    if os.path.exists(RECORDINGS_DIR):
        for item in os.listdir(RECORDINGS_DIR):
            p = os.path.join(RECORDINGS_DIR, item)
            if os.path.isdir(p):
                shutil.rmtree(p, ignore_errors=True)
            elif item != '.gitkeep':
                try:
                    os.remove(p)
                except Exception:
                    pass

    if os.path.exists(EXPORT_DIR):
        for item in os.listdir(EXPORT_DIR):
            p = os.path.join(EXPORT_DIR, item)
            if os.path.isdir(p):
                shutil.rmtree(p, ignore_errors=True)
            elif item != '.gitkeep':
                try:
                    os.remove(p)
                except Exception:
                    pass

    EPISODES_DB = []
    return JSONResponse({"status": "success", "message": "All episodes and recordings cleared"})

@app.post("/api/recordings/save")
async def save_recording(
    video: UploadFile = File(...),
    imu_data: str = Form("[]"),
    task: str = Form("reach to apple")
):
    """
    Receives raw sensor recording (video stream + high-frequency IMU telemetry) from mobile phone,
    saves the raw files to disk, and executes the entire 3D Visual-Inertial EKF Reconstruction
    and ArUco solvePnP trajectory calculation SERVER-SIDE.
    """
    try:
        ep_idx = len(EPISODES_DB)
        ep_uid = f"rec_{int(time.time() * 1000)}_{uuid.uuid4().hex[:6]}"
        ep_dir = os.path.join(RECORDINGS_DIR, ep_uid)
        os.makedirs(ep_dir, exist_ok=True)

        # 1. Preserve original video container extension (.webm or .mp4)
        filename = video.filename or "recording.mp4"
        ext = os.path.splitext(filename)[1].lower()
        if not ext or ext == ".":
            ext = ".webm" if "webm" in (video.content_type or "") else ".mp4"

        video_filename = f"recording{ext}"
        video_path = os.path.join(ep_dir, video_filename)
        video_url = f"/recordings/{ep_uid}/{video_filename}"

        print(f"\n[{time.strftime('%H:%M:%S')}] 📥 Server received upload request for Episode #{ep_idx} ({video.filename}, {video.content_type})")

        with open(video_path, "wb") as f:
            content = await video.read()
            f.write(content)

        print(f"[{time.strftime('%H:%M:%S')}] 💾 Raw video payload saved to disk: {video_path} ({len(content)} bytes)")

        # 2. Parse IMU JSON
        try:
            parsed_imu = json.loads(imu_data)
            print(f"[{time.strftime('%H:%M:%S')}] 📊 Parsed IMU telemetry stream: {len(parsed_imu)} samples")
        except Exception as imu_err:
            print(f"[{time.strftime('%H:%M:%S')}] ⚠️ Warning parsing IMU telemetry: {imu_err}")
            parsed_imu = []

        # 3. Inspect video frame count and FPS
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

        print(f"[{time.strftime('%H:%M:%S')}] ⚙️ Executing Server-Side Sensory Fusion (ArUco + Scene Feature Map + 100Hz IMU EKF)...")

        # 4. SERVER-SIDE COMPUTATION: ArUco + Feature Extraction + 12-State EKF Trajectory Reconstruction
        dev_video_filename = "dev_visualization.mp4"
        dev_video_path = os.path.join(ep_dir, dev_video_filename)
        dev_video_url = f"/recordings/{ep_uid}/{dev_video_filename}"

        canny_video_filename = "canny_visualization.mp4"
        canny_video_path = os.path.join(ep_dir, canny_video_filename)
        canny_video_url = f"/recordings/{ep_uid}/{canny_video_filename}"

        anchored_poses, dev_telemetry = visual_tracker.process_video_and_imu(
            video_path,
            parsed_imu,
            fps=fps,
            output_dev_video_path=dev_video_path,
            output_canny_video_path=canny_video_path,
            return_dev_info=True
        )

        # 5. Gripper state heuristic
        gripper_states = []
        for i in range(len(anchored_poses)):
            g = 100.0 if i < (len(anchored_poses) * 0.7) else 10.0
            gripper_states.append(g)

        anchored_poses = np.array(anchored_poses)
        actions = np.roll(anchored_poses, -1, axis=0)
        actions[-1] = anchored_poses[-1]
        timestamps = np.linspace(0, len(anchored_poses) / fps, len(anchored_poses))

        episode_data = {
            'episode_index': ep_idx,
            'episode_id': ep_uid,
            'task': task,
            'video_path': video_path,
            'video_url': video_url,
            'dev_video_url': dev_video_url,
            'canny_video_url': canny_video_url,
            'dev_telemetry': dev_telemetry,
            'num_frames': len(anchored_poses),
            'fps': fps,
            'duration': len(anchored_poses) / fps,
            'anchor': 'aruco_feature_imu_fusion',
            'marker_size_cm': 10.0,
            'poses': anchored_poses.tolist(),
            'ee_poses': anchored_poses.tolist(),
            'gripper_states': gripper_states,
            'actions': actions.tolist(),
            'timestamps': timestamps.tolist(),
            'imu_data': parsed_imu,
            'created_at': time.strftime("%Y-%m-%d %H:%M:%S")
        }

        EPISODES_DB.append(episode_data)
        print(f"[{time.strftime('%H:%M:%S')}] 🎉 Episode #{ep_idx} successfully calculated via ArUco+Feature+IMU fusion ({len(anchored_poses)} frames)!\n")

        return JSONResponse({
            "status": "success",
            "episode_index": ep_idx,
            "task": task,
            "num_frames": len(anchored_poses),
            "anchor": "ArUco + Feature Map + IMU Fusion (0,0,0) Origin"
        })

    except Exception as err:
        import traceback
        traceback.print_exc()
        print(f"[{time.strftime('%H:%M:%S')}] ❌ ERROR during server calculation: {err}")
        return JSONResponse({
            "status": "error",
            "message": f"Server processing error: {str(err)}"
        }, status_code=500)

@app.post("/api/recordings/sample")
async def generate_sample_recording(task: str = "reach to apple", shape: str = "circle"):
    """
    Generates a synthetic 3D shape demonstration (e.g. 3D circle floating 20cm above ArUco marker).
    """
    ep_idx = len(EPISODES_DB)
    sample_uid = f"sample_{int(time.time() * 1000)}_{uuid.uuid4().hex[:6]}"
    ep_dir = os.path.join(RECORDINGS_DIR, sample_uid)
    os.makedirs(ep_dir, exist_ok=True)

    frame_count = 90
    fps = 30.0
    video_path = os.path.join(ep_dir, "recording.mp4")
    video_url = f"/recordings/{sample_uid}/recording.mp4"

    # Generate synthetic video stream showing the table and ArUco marker
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(video_path, fourcc, fps, (640, 480))

    dev_video_filename = "dev_visualization.mp4"
    dev_video_path = os.path.join(ep_dir, dev_video_filename)
    dev_video_url = f"/recordings/{sample_uid}/{dev_video_filename}"
    dev_out = cv2.VideoWriter(dev_video_path, fourcc, fps, (640, 480))

    canny_video_filename = "canny_visualization.mp4"
    canny_video_path = os.path.join(ep_dir, canny_video_filename)
    canny_video_url = f"/recordings/{sample_uid}/{canny_video_filename}"
    canny_out = cv2.VideoWriter(canny_video_path, fourcc, fps, (640, 480))

    marker_img = visual_tracker.generate_marker_image(marker_id=0, side_pixels=140, border_pixels=10)
    mh, mw = marker_img.shape
    my, mx = 240, 250
    marker_corners = [np.array([[[mx, my], [mx + mw, my], [mx + mw, my + mh], [mx, my + mh]]], dtype=np.float32)]

    cam_k, dist = visual_tracker.estimate_camera_matrix(640, 480, hfov_degrees=80.0)
    rvec_sim = np.array([2.1, 0.0, 0.0], dtype=np.float32)
    tvec_sim = np.array([-0.05, 0.06, 0.36], dtype=np.float32)

    anchored_poses = visual_tracker.generate_synthetic_anchored_trajectory(num_frames=frame_count, shape=shape)
    gripper_states = []
    dev_telemetry = []

    for i in range(frame_count):
        # Draw wooden table background
        frame = np.full((480, 640, 3), (35, 45, 60), dtype=np.uint8)
        
        # Draw ArUco marker flat on table center
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

        # Render simulated Dev View frame
        synth_pts = np.array([
            [80 + (j * 52 + i * 2) % 480, 120 + (j * 34 + i) % 280]
            for j in range(24)
        ], dtype=np.float32)
        synth_prev = synth_pts - np.array([1.2 * np.cos(i * 0.08), 0.8 * np.sin(i * 0.08)], dtype=np.float32)
        synth_lms = {
            j: np.array([0.05 * np.cos(j * 0.5), 0.05 * np.sin(j * 0.5), 0.0], dtype=np.float32)
            for j in range(12)
        }
        mode_src = "dual_aruco" if i < 60 else "feature_pnp"

        dev_frame = visual_tracker.render_dev_frame(
            frame=frame,
            camera_matrix=cam_k,
            dist_coeffs=dist,
            frame_idx=i,
            total_frames=frame_count,
            fps=fps,
            p_world=np.array([p[0], p[1], p[2]]),
            euler=np.array([p[3], p[4], p[5]]),
            rvec=rvec_sim,
            tvec=tvec_sim,
            source=mode_src,
            corners=marker_corners if mode_src == "dual_aruco" else None,
            ids_list=[0],
            tracked_pts=synth_pts,
            prev_pts=synth_prev,
            landmarks_3d=synth_lms
        )
        dev_out.write(dev_frame)

        # Render Canny Edge + ArUco bounding frame
        canny_frame = visual_tracker.render_canny_frame(
            frame=frame,
            camera_matrix=cam_k,
            dist_coeffs=dist,
            frame_idx=i,
            total_frames=frame_count,
            fps=fps,
            p_world=np.array([p[0], p[1], p[2]]),
            euler=np.array([p[3], p[4], p[5]]),
            rvec=rvec_sim,
            tvec=tvec_sim,
            corners=marker_corners if mode_src == "dual_aruco" else None,
            ids_list=[0],
            tracked_pts=synth_pts
        )
        canny_out.write(canny_frame)

        # Compute synthetic bounding box
        sample_bboxes = []
        if mode_src == "dual_aruco":
            c_pts = marker_corners[0][0]
            sample_bboxes.append({
                'id': 0,
                'name': 'Tag A (Origin)',
                'corners': c_pts.tolist(),
                'center': [round(float(c_pts[:, 0].mean()), 1), round(float(c_pts[:, 1].mean()), 1)],
                'width_px': 140.0,
                'height_px': 140.0
            })

        dev_telemetry.append({
            'frame_idx': i,
            'source': mode_src,
            'num_landmarks': len(synth_lms),
            'num_features': len(synth_pts),
            'is_dual': True if mode_src == "dual_aruco" else False,
            'tags_detected': [0] if mode_src == "dual_aruco" else [],
            'bounding_boxes': sample_bboxes,
            'pose': [float(p[0]), float(p[1]), float(p[2])],
            'euler': [float(p[3]), float(p[4]), float(p[5])]
        })

        g = 100.0 if i < 60 else 10.0
        gripper_states.append(g)

    out.release()
    dev_out.release()
    canny_out.release()

    anchored_poses = np.array(anchored_poses)
    actions = np.roll(anchored_poses, -1, axis=0)
    actions[-1] = anchored_poses[-1]
    timestamps = np.linspace(0, frame_count / fps, frame_count)

    episode_data = {
        'episode_index': ep_idx,
        'episode_id': sample_uid,
        'task': task,
        'video_path': video_path,
        'video_url': video_url,
        'dev_video_url': dev_video_url,
        'canny_video_url': canny_video_url,
        'dev_telemetry': dev_telemetry,
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
        'imu_data': [],
        'created_at': time.strftime("%Y-%m-%d %H:%M:%S")
    }

    EPISODES_DB.append(episode_data)

    return JSONResponse({
        "status": "success",
        "episode_index": ep_idx,
        "task": task
    })

@app.get("/api/ekf/params")
async def get_ekf_parameters():
    """
    Returns current Extended Kalman Filter parameters and tuning presets.
    """
    return JSONResponse(visual_tracker.get_ekf_params())

@app.post("/api/ekf/params")
async def update_ekf_parameters(request: Request):
    """
    Updates Extended Kalman Filter process and measurement noise covariances.
    """
    payload = await request.json()
    updated = visual_tracker.set_ekf_params(payload)
    return JSONResponse({"status": "success", "params": updated})

@app.post("/api/episodes/{episode_index}/reprocess")
async def reprocess_episode(episode_index: int):
    """
    Re-filters an existing recorded episode with the current EKF parameters.
    """
    global EPISODES_DB
    target_ep = None
    for ep in EPISODES_DB:
        if ep['episode_index'] == episode_index:
            target_ep = ep
            break

    if not target_ep:
        return JSONResponse({"status": "error", "message": "Episode not found"}, status_code=404)

    video_path = target_ep.get('video_path', '')
    imu_data = target_ep.get('imu_data', [])

    if not os.path.exists(video_path):
        return JSONResponse({"status": "error", "message": "Episode video file missing"}, status_code=400)

    fps = target_ep.get('fps', 30.0)
    ep_dir = os.path.dirname(video_path)
    dev_video_path = os.path.join(ep_dir, "dev_visualization.mp4")
    canny_video_path = os.path.join(ep_dir, "canny_visualization.mp4")
    ep_uid = target_ep.get('episode_id', f"episode_{episode_index}")
    dev_video_url = f"/recordings/{ep_uid}/dev_visualization.mp4"
    canny_video_url = f"/recordings/{ep_uid}/canny_visualization.mp4"

    new_poses, dev_telemetry = visual_tracker.reprocess_episode_trajectory(
        video_path,
        imu_data,
        fps=fps,
        output_dev_video_path=dev_video_path,
        output_canny_video_path=canny_video_path,
        return_dev_info=True
    )
    new_poses = np.array(new_poses)

    target_ep['poses'] = new_poses.tolist()
    target_ep['ee_poses'] = new_poses.tolist()
    actions = np.roll(new_poses, -1, axis=0)
    actions[-1] = new_poses[-1]
    target_ep['actions'] = actions.tolist()
    target_ep['dev_video_url'] = dev_video_url
    target_ep['canny_video_url'] = canny_video_url
    target_ep['dev_telemetry'] = dev_telemetry

    return JSONResponse({
        "status": "success",
        "episode_index": episode_index,
        "num_frames": len(new_poses),
        "poses": new_poses.tolist(),
        "dev_video_url": dev_video_url,
        "canny_video_url": canny_video_url
    })

@app.post("/api/episodes/{episode_index}/dev_video")
async def generate_episode_dev_video(episode_index: int):
    """
    Ensures that a developer diagnostic video (dev_visualization.mp4) exists for an episode,
    generating it on-demand if it does not already exist.
    """
    global EPISODES_DB
    target_ep = next((e for e in EPISODES_DB if e['episode_index'] == episode_index), None)
    if not target_ep:
        return JSONResponse({"status": "error", "message": "Episode not found"}, status_code=404)

    video_path = target_ep.get('video_path', '')
    if not os.path.exists(video_path):
        return JSONResponse({"status": "error", "message": "Video recording missing"}, status_code=400)

    ep_dir = os.path.dirname(video_path)
    dev_video_path = os.path.join(ep_dir, "dev_visualization.mp4")
    canny_video_path = os.path.join(ep_dir, "canny_visualization.mp4")
    ep_uid = target_ep.get('episode_id', f"episode_{episode_index}")
    dev_video_url = f"/recordings/{ep_uid}/dev_visualization.mp4"
    canny_video_url = f"/recordings/{ep_uid}/canny_visualization.mp4"

    if not os.path.exists(dev_video_path) or target_ep.get('dev_telemetry') is None:
        fps = target_ep.get('fps', 30.0)
        _, dev_telemetry = visual_tracker.process_video_and_imu(
            video_path,
            target_ep.get('imu_data', []),
            fps=fps,
            output_dev_video_path=dev_video_path,
            output_canny_video_path=canny_video_path,
            return_dev_info=True
        )
        target_ep['dev_telemetry'] = dev_telemetry

    target_ep['dev_video_url'] = dev_video_url
    target_ep['canny_video_url'] = canny_video_url
    return JSONResponse({
        "status": "success",
        "dev_video_url": dev_video_url,
        "canny_video_url": canny_video_url,
        "dev_telemetry": target_ep.get('dev_telemetry', [])
    })

@app.get("/api/robot/config")
async def get_robot_config():
    """
    Returns the current active robot preset, workspace offset calibration (table plane Z=0),
    and Denavit-Hartenberg (DH) parameter specifications for all available presets.
    """
    presets = [
        get_robot_specs("so101"),
        get_robot_specs("so100")
    ]
    return JSONResponse({
        "status": "success",
        "config": ROBOT_CONFIG,
        "presets": presets
    })

@app.post("/api/robot/config")
async def update_robot_config(request: Request):
    """
    Updates the active robot model (SO-101 / SO-100) and ArUco table-plane starting coordinate offset (X, Y, Yaw).
    Persists configuration to robot_config.json on disk.
    """
    global ROBOT_CONFIG
    try:
        payload = await request.json()
        if "robot_type" in payload:
            r_type = str(payload["robot_type"]).lower()
            if r_type in ROBOT_PRESETS:
                ROBOT_CONFIG["robot_type"] = r_type
        if "offset_x" in payload:
            ROBOT_CONFIG["offset_x"] = float(payload["offset_x"])
        if "offset_y" in payload:
            ROBOT_CONFIG["offset_y"] = float(payload["offset_y"])
        if "offset_z" in payload:
            ROBOT_CONFIG["offset_z"] = float(payload["offset_z"])
        if "yaw_deg" in payload:
            ROBOT_CONFIG["yaw_deg"] = float(payload["yaw_deg"])

        save_robot_config(ROBOT_CONFIG)

        workspace_calibrator.update_config(
            offset_x=ROBOT_CONFIG["offset_x"],
            offset_y=ROBOT_CONFIG["offset_y"],
            offset_z=ROBOT_CONFIG["offset_z"],
            yaw_deg=ROBOT_CONFIG["yaw_deg"]
        )

        lerobot_exporter.set_robot_config(
            robot_type=ROBOT_CONFIG["robot_type"],
            offset_x=ROBOT_CONFIG["offset_x"],
            offset_y=ROBOT_CONFIG["offset_y"],
            offset_z=ROBOT_CONFIG["offset_z"],
            yaw_deg=ROBOT_CONFIG["yaw_deg"]
        )

        print(f"[{time.strftime('%H:%M:%S')}] 🤖 Robot Config Updated: Model={ROBOT_CONFIG['robot_type']}, Offset=({ROBOT_CONFIG['offset_x']:.2f}m, {ROBOT_CONFIG['offset_y']:.2f}m, Yaw={ROBOT_CONFIG['yaw_deg']:.1f}°)")

        return JSONResponse({
            "status": "success",
            "message": "Robot configuration updated successfully",
            "config": ROBOT_CONFIG
        })
    except Exception as err:
        return JSONResponse({
            "status": "error",
            "message": f"Failed to update robot configuration: {str(err)}"
        }, status_code=400)

@app.get("/api/robot/urdf")
async def get_robot_urdf_endpoint(robot_type: str = None):
    """
    Returns the URDF XML description for the requested or currently active robot preset.
    """
    r_type = (robot_type or ROBOT_CONFIG.get("robot_type", "so101")).lower()
    urdf_content = get_robot_urdf(r_type)
    return Response(content=urdf_content, media_type="application/xml")

@app.post("/api/robot/urdf/parse")
async def parse_urdf_endpoint(request: Request):
    """
    Parses an arbitrary input URDF XML string, extracts the serial kinematic joint chain,
    and returns the corresponding Denavit-Hartenberg (DH) parameter table and kinematic specs.
    """
    try:
        payload = await request.json()
        urdf_text = payload.get("urdf_text", "")
        if not urdf_text or not urdf_text.strip():
            return JSONResponse({"status": "error", "message": "No URDF XML provided"}, status_code=400)

        dh_table, specs = URDFParser.parse_urdf(urdf_text)
        return JSONResponse({
            "status": "success",
            "dh_table": dh_table,
            "specs": specs
        })
    except Exception as err:
        return JSONResponse({
            "status": "error",
            "message": f"URDF Parsing Error: {str(err)}"
        }, status_code=400)

@app.post("/api/robot/urdf/apply")
async def apply_urdf_endpoint(request: Request):
    """
    Parses an input URDF and applies the resulting DH table directly to the active robot configuration.
    """
    global ROBOT_CONFIG
    try:
        payload = await request.json()
        urdf_text = payload.get("urdf_text", "")
        dh_table, specs = URDFParser.parse_urdf(urdf_text)
        robot_name = specs.get("robot_name", "custom_robot").lower()

        ROBOT_CONFIG["custom_dh_table"] = dh_table
        ROBOT_CONFIG["custom_specs"] = specs
        save_robot_config(ROBOT_CONFIG)

        print(f"[{time.strftime('%H:%M:%S')}] ⚙️ Applied custom URDF kinematics: {robot_name} ({specs['reach_meters']}m reach)")

        return JSONResponse({
            "status": "success",
            "message": f"Custom URDF '{robot_name}' applied successfully",
            "dh_table": dh_table,
            "specs": specs
        })
    except Exception as err:
        return JSONResponse({
            "status": "error",
            "message": f"Failed to apply URDF: {str(err)}"
        }, status_code=400)

@app.post("/api/export_lerobot")
async def export_lerobot():
    if not EPISODES_DB:
        return JSONResponse({"status": "error", "message": "No episodes recorded yet. Please record or sample an episode first."}, status_code=400)

    try:
        # Sync latest configuration
        lerobot_exporter.set_robot_config(
            robot_type=ROBOT_CONFIG["robot_type"],
            offset_x=ROBOT_CONFIG["offset_x"],
            offset_y=ROBOT_CONFIG["offset_y"],
            offset_z=ROBOT_CONFIG["offset_z"],
            yaw_deg=ROBOT_CONFIG["yaw_deg"]
        )
        export_path = lerobot_exporter.export_dataset(EPISODES_DB, dataset_name="mobile_aruco_3d_trajectories")
        total_frames = sum(ep.get('num_frames', len(ep.get('poses', []))) for ep in EPISODES_DB)
        return JSONResponse({
            "status": "success",
            "export_path": export_path,
            "robot_type": ROBOT_CONFIG["robot_type"],
            "workspace_calibration": ROBOT_CONFIG,
            "total_episodes": len(EPISODES_DB),
            "total_frames": total_frames,
            "message": f"LeRobot dataset ({ROBOT_CONFIG['robot_type'].upper()}) exported successfully with {len(EPISODES_DB)} episodes ({total_frames} frames)!"
        })
    except Exception as err:
        import traceback
        traceback.print_exc()
        return JSONResponse({
            "status": "error",
            "message": f"LeRobot export failed: {str(err)}"
        }, status_code=500)

@app.get("/api/server/info")
async def get_server_info():
    """
    Returns server network configuration, local IP, and mobile URLs.
    """
    local_ip = get_local_ip()
    ssl_cert = os.path.join(BASE_DIR, "cert.pem")
    ssl_key = os.path.join(BASE_DIR, "key.pem")
    has_ssl = os.path.exists(ssl_cert) and os.path.exists(ssl_key)
    return JSONResponse({
        "local_ip": local_ip,
        "http_port": 8000,
        "https_port": 8443 if has_ssl else 8000,
        "has_ssl": has_ssl,
        "mobile_url": f"https://{local_ip}:8443/mobile" if has_ssl else f"http://{local_ip}:8000/mobile"
    })

@app.get("/api/mobile/qr")
async def get_mobile_qr():
    """
    Generates an SVG QR code pointing directly to the mobile camera URL.
    """
    try:
        import qrcode
        import qrcode.image.svg
        from fastapi.responses import Response

        local_ip = get_local_ip()
        ssl_cert = os.path.join(BASE_DIR, "cert.pem")
        ssl_key = os.path.join(BASE_DIR, "key.pem")
        has_ssl = os.path.exists(ssl_cert) and os.path.exists(ssl_key)
        mobile_url = f"https://{local_ip}:8443/mobile" if has_ssl else f"http://{local_ip}:8000/mobile"

        factory = qrcode.image.svg.SvgImage
        img = qrcode.make(mobile_url, image_factory=factory)
        svg_content = img.to_string()
        return Response(content=svg_content, media_type="image/svg+xml")
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    import sys
    import threading

    local_ip = get_local_ip()

    ssl_cert = os.path.join(BASE_DIR, "cert.pem")
    ssl_key = os.path.join(BASE_DIR, "key.pem")
    has_certs = os.path.exists(ssl_cert) and os.path.exists(ssl_key)
    use_ssl = ("--ssl" in sys.argv or "-s" in sys.argv or has_certs) and ("--no-ssl" not in sys.argv)

    http_port = 8000
    https_port = 8443

    print("\n" + "="*65)
    print(" OmniKin 3D Trajectory Dataset Collector Server Started!")
    print("="*65)
    print(f" Desktop Dashboard (HTTP):  http://localhost:{http_port}")
    if use_ssl and has_certs:
        print(f" 📱 Mobile Logger  (HTTPS): https://{local_ip}:{https_port}/mobile")
        print(f" 📱 Mobile Logger  (HTTP):  http://{local_ip}:{http_port}/mobile (auto-redirect)")
        print(f" Print ArUco Marker:        http://localhost:{http_port}/api/marker/image")
        print(f" Mobile QR Code:            http://localhost:{http_port}/api/mobile/qr")
        print("\n [!] HTTPS Active on Port 8443 (Self-Signed SSL for Camera/IMU):")
        print("     When opening on your mobile browser, tap:")
        print(f"     - Android Chrome: 'Advanced' -> 'Proceed to {local_ip} (unsafe)'")
        print("     - iOS Safari:     'Show Details' -> 'visit this website' -> 'Visit Website'")
    else:
        print(f" 📱 Phone Mobile URL:        http://{local_ip}:{http_port}/mobile")
        print(f" Print ArUco Marker:        http://localhost:{http_port}/api/marker/image")
    print("="*65 + "\n")

    if use_ssl and has_certs:
        # Start HTTPS server on port 8443 in a background daemon thread
        def run_https():
            config_ssl = uvicorn.Config(
                app,
                host="0.0.0.0",
                port=https_port,
                ssl_keyfile=ssl_key,
                ssl_certfile=ssl_cert,
                log_level="warning"
            )
            server_ssl = uvicorn.Server(config_ssl)
            server_ssl.run()

        ssl_thread = threading.Thread(target=run_https, daemon=True)
        ssl_thread.start()

        # Run HTTP on port 8000 in the main thread
        uvicorn.run(app, host="0.0.0.0", port=http_port, log_level="info")
    else:
        uvicorn.run(app, host="0.0.0.0", port=http_port, log_level="info")


