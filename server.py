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
import secrets
import hashlib
import copy
import numpy as np
import cv2
import asyncio
import queue
import threading
from concurrent.futures import ThreadPoolExecutor

# Set stdout/stderr to UTF-8
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

from fastapi import FastAPI, Request, File, UploadFile, Form, Response, Body
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from visual_tracker import VisualInertialTracker
from lerobot_exporter import LeRobotExporter, find_feasible_window
from robot_kinematics import (
    WorkspaceCalibrator,
    CameraGripperCalibrator,
    TrajectoryPlanner,
    DEFAULT_INITIAL_POSITION,
    get_robot_specs,
    get_robot_solver,
    get_robot_urdf,
    URDFParser,
    ROBOT_PRESETS
)
from integrity import (
    MAX_JSON_BYTES, MAX_UPLOAD_BYTES, dataset_slug, ensure_finite_number,
    episode_manifest, frame_timestamps, legacy_manifest, reject_unsafe_xml,
    sha256_file,
)

app = FastAPI(title="ArUco-Anchored 3D Trajectory Collector")

# This is intentionally a shared, operator-provided secret for a trusted LAN.
# Set OMNIKIN_PAIRING_TOKEN before starting the service to keep QR pairings stable.
PAIRING_TOKEN = os.environ.get("OMNIKIN_PAIRING_TOKEN") or secrets.token_urlsafe(32)
AUTH_HEADER = "x-omnikin-token"
EPISODE_LOCK = threading.RLock()


@app.middleware("http")
async def require_operator_token(request: Request, call_next):
    """Protect all state-changing API routes after QR pairing.

    Read-only endpoints remain available so a new device can retrieve its pairing
    URL. Pairing itself requires the unguessable QR code value.
    """
    if request.url.path.startswith("/api/") and request.method in {"POST", "PUT", "PATCH", "DELETE"}:
        if request.url.path != "/api/pairing/session":
            supplied = request.headers.get(AUTH_HEADER, "")
            if not supplied or not secrets.compare_digest(supplied, PAIRING_TOKEN):
                return JSONResponse({"status": "error", "message": "Operator pairing required"}, status_code=401)
    return await call_next(request)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")
RECORDINGS_DIR = os.path.join(BASE_DIR, "recordings")
EXPORT_DIR = os.path.join(BASE_DIR, "lerobot_exports")
ROBOT_CONFIG_FILE = os.path.join(BASE_DIR, "robot_config.json")

os.makedirs(RECORDINGS_DIR, exist_ok=True)
EXPORT_DIR = os.path.join(BASE_DIR, "lerobot_exports")
os.makedirs(EXPORT_DIR, exist_ok=True)

def load_robot_config():
    default_cfg = {
        "robot_type": "so_arm101_omni_kin",
        "offset_x": 0.038,
        "offset_y": -0.406,
        "offset_z": 0.00,
        "yaw_deg": 90.0,
        "q3_safe_max_deg": 0.0,
        "gripper_offset": {
            "forward_cm": 12.8,
            "height_cm": 10.9,
            "lateral_cm": 0.0,
            "pitch_deg": 40.4,
            "roll_deg": 0.0,
            "yaw_deg": 0.0,
            "enabled": True
        },
        "initial_position": dict(DEFAULT_INITIAL_POSITION),
        "base_preset": {
            "offset_x": 0.038,
            "offset_y": -0.406,
            "offset_z": 0.00,
            "yaw_deg": 90.0
        }
    }
    if os.path.exists(ROBOT_CONFIG_FILE):
        try:
            with open(ROBOT_CONFIG_FILE, "r", encoding="utf-8") as f:
                saved = json.load(f)
                default_cfg.update(saved)
                # Ensure gripper_offset subkeys exist
                if "gripper_offset" not in saved:
                    saved["gripper_offset"] = default_cfg["gripper_offset"]
                else:
                    default_cfg["gripper_offset"].update(saved["gripper_offset"])
                # Ensure initial_position subkeys exist
                if "initial_position" not in saved:
                    saved["initial_position"] = default_cfg["initial_position"]
                else:
                    default_cfg["initial_position"].update(saved["initial_position"])
                # Ensure base_preset subkeys exist (defaults to recommended layout)
                if "base_preset" not in saved:
                    default_cfg["base_preset"] = {
                        "offset_x": 0.038,
                        "offset_y": -0.406,
                        "offset_z": 0.00,
                        "yaw_deg": 90.0
                    }
                else:
                    default_cfg["base_preset"].update(saved["base_preset"])
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
# A previously uploaded URDF is inert until the operator explicitly applies it.
if not ROBOT_CONFIG.get("custom_urdf_enabled", False):
    ROBOT_CONFIG.pop("custom_dh_table", None)
    ROBOT_CONFIG.pop("custom_specs", None)
    ROBOT_CONFIG.pop("custom_urdf", None)
_init_solver = get_robot_solver(
    ROBOT_CONFIG.get("robot_type", "so_arm101_omni_kin"),
    q3_safe_max_deg=ROBOT_CONFIG.get("q3_safe_max_deg", 0.0),
    custom_dh_table=ROBOT_CONFIG.get("custom_dh_table"),
    custom_urdf=ROBOT_CONFIG.get("custom_urdf")
)
ROBOT_CONFIG["reach_angle_deg"] = getattr(_init_solver, "reach_angle_deg", 0.0)

workspace_calibrator = WorkspaceCalibrator(
    offset_x=ROBOT_CONFIG["offset_x"],
    offset_y=ROBOT_CONFIG["offset_y"],
    offset_z=ROBOT_CONFIG["offset_z"],
    yaw_deg=ROBOT_CONFIG["yaw_deg"],
    reach_angle_rad=getattr(_init_solver, "reach_angle_rad", 0.0)
)

gripper_cfg = ROBOT_CONFIG.get("gripper_offset", {})
camera_gripper_calibrator = CameraGripperCalibrator(
    forward_cm=gripper_cfg.get("forward_cm", 12.8),
    height_cm=gripper_cfg.get("height_cm", 10.9),
    lateral_cm=gripper_cfg.get("lateral_cm", 0.0),
    pitch_deg=gripper_cfg.get("pitch_deg", 40.4),
    roll_deg=gripper_cfg.get("roll_deg", 0.0),
    yaw_deg=gripper_cfg.get("yaw_deg", 0.0),
    enabled=gripper_cfg.get("enabled", True)
)

trajectory_planner = TrajectoryPlanner(
    solver=_init_solver,
    workspace_calibrator=workspace_calibrator,
    camera_gripper_calibrator=camera_gripper_calibrator
)

FRONTEND_DIST_DIR = os.path.join(BASE_DIR, "frontend", "dist")
FRONTEND_ASSETS_DIR = os.path.join(FRONTEND_DIST_DIR, "assets")
os.makedirs(FRONTEND_ASSETS_DIR, exist_ok=True)
app.mount("/assets", StaticFiles(directory=FRONTEND_ASSETS_DIR), name="assets")

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
visual_tracker.configure_gripper_markers(ROBOT_CONFIG.get("gripper_marker_tracking", {}))
lerobot_exporter = LeRobotExporter(
    output_dir=EXPORT_DIR,
    robot_type=ROBOT_CONFIG["robot_type"],
    workspace_calibrator=workspace_calibrator
)

def safe_to_list(arr, fallback=None):
    if arr is None:
        arr = fallback
    if arr is None:
        return []
    if hasattr(arr, 'tolist'):
        return arr.tolist()
    return list(arr)


def _config_snapshot():
    """Capture job inputs once so a concurrent calibration update cannot alter it."""
    return copy.deepcopy(ROBOT_CONFIG)


def _new_tracker(config_snapshot):
    tracker = VisualInertialTracker(
        tag_a_size=0.10, tag_b_size=0.05, tag_a_id=0, tag_b_id=1,
        tag_b_offset=(0.15, 0.0, 0.0),
    )
    tracker.configure_gripper_markers(config_snapshot.get("gripper_marker_tracking", {}))
    return tracker


async def _stream_upload_to_file(video: UploadFile, destination: str):
    """Persist uploads without holding an unbounded video in RAM."""
    total = 0
    digest = hashlib.sha256()
    with open(destination, "wb") as stream:
        while True:
            chunk = await video.read(1024 * 1024)
            if not chunk:
                break
            total += len(chunk)
            if total > MAX_UPLOAD_BYTES:
                stream.close()
                try:
                    os.remove(destination)
                except OSError:
                    pass
                raise ValueError("Video exceeds the 500 MiB upload limit")
            digest.update(chunk)
            stream.write(chunk)
    if total == 0:
        raise ValueError("Uploaded video is empty")
    return total, digest.hexdigest()


def _validate_video(path: str):
    cap = cv2.VideoCapture(path)
    try:
        if not cap.isOpened():
            raise ValueError("Uploaded file is not a readable video container")
        fps = float(cap.get(cv2.CAP_PROP_FPS) or 0)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        if not np.isfinite(fps) or fps <= 0 or fps > 120 or frame_count <= 0:
            raise ValueError("Uploaded video has invalid FPS or no decodable frames")
        ok, _ = cap.read()
        if not ok:
            raise ValueError("Uploaded video contains no decodable frame")
        return frame_count, fps
    finally:
        cap.release()


def _validate_and_mark_reprocessed_episode(ep: dict):
    """Fail closed, then promote a legacy episode only after a complete reprocess."""
    video_path = ep.get("video_path", "")
    frame_count, fps = _validate_video(video_path)
    expected_lengths = {
        "poses": len(ep.get("poses") or []),
        "ee_poses": len(ep.get("ee_poses") or []),
        "actions": len(ep.get("actions") or []),
        "joint_states": len(ep.get("joint_states") or []),
        "robot_ee_poses": len(ep.get("robot_ee_poses") or []),
    }
    errors = [f"{name} has {length} frames; video has {frame_count}"
              for name, length in expected_lengths.items() if length != frame_count]
    if errors:
        raise ValueError("Reprocess validation failed: " + "; ".join(errors))

    ep["num_frames"] = frame_count
    ep["fps"] = fps
    ep["duration"] = frame_count / fps
    ep["timestamps"] = frame_timestamps(frame_count, fps)
    ep["manifest"] = episode_manifest(
        source_sha256=sha256_file(video_path),
        frame_count=frame_count,
        fps=fps,
        imu_samples=len(ep.get("imu_data") or []),
        config_snapshot=_config_snapshot(),
        status="processed",
        validation={"state": "passed", "errors": [], "trajectory_frames": frame_count},
    )


def _ensure_idle(operation: str):
    if PROCESSING_STATUS["is_processing"] or not PROCESSING_QUEUE.empty():
        raise ValueError(f"Cannot {operation} while recording processing is active")


def _save_job_manifest(job, status, errors=None):
    manifest = episode_manifest(
        source_sha256=job["source_sha256"], frame_count=job["source_frame_count"],
        fps=job["source_fps"], imu_samples=len(job.get("parsed_imu", [])),
        config_snapshot=job["config_snapshot"], status=status,
        validation={"state": "failed" if errors else "pending", "errors": errors or []},
    )
    with open(os.path.join(job["ep_dir"], "episode_manifest.json"), "w", encoding="utf-8") as stream:
        json.dump(manifest, stream, indent=2)

def save_episode_meta(ep_data):
    try:
        ep_uid = ep_data.get('episode_id')
        if not ep_uid:
            return
        ep_dir = os.path.join(RECORDINGS_DIR, ep_uid)
        os.makedirs(ep_dir, exist_ok=True)
        meta_path = os.path.join(ep_dir, "episode_meta.json")
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(ep_data, f, indent=2)
    except Exception as e:
        print(f"Error saving episode metadata: {e}")

def sync_episode_kinematics(ep, calib=None):
    """
    Computes and stores server-side joint_states, robot_ee_poses, and actions for an episode.
    These are used by the frontend Viewport3D for 1:1 export/preview parity without client-side IK re-solve.
    Dynamically adheres to any loaded URDF data / custom_dh_table and respects each episode's
    independent optimal workspace base position.
    """
    try:
        r_solver = get_robot_solver(
            ROBOT_CONFIG.get("robot_type", "so_arm101_omni_kin"),
            q3_safe_max_deg=ROBOT_CONFIG.get("q3_safe_max_deg", 0.0),
            custom_dh_table=ROBOT_CONFIG.get("custom_dh_table"),
            custom_urdf=ROBOT_CONFIG.get("custom_urdf")
        )
        gripper_cfg = ROBOT_CONFIG.get("gripper_offset", {})
        if hasattr(r_solver, "update_camera_extrinsics"):
            r_solver.update_camera_extrinsics(
                forward_cm=gripper_cfg.get("forward_cm"),
                height_cm=gripper_cfg.get("height_cm"),
                lateral_cm=gripper_cfg.get("lateral_cm")
            )
        reach_rad = getattr(r_solver, "reach_angle_rad", 0.0)
        workspace_calibrator.reach_angle_rad = reach_rad

        # Prioritize active (smoothed/filtered) poses over raw un-filtered poses
        base_poses = ep.get("poses") or ep.get("raw_poses", [])
        if not base_poses or len(base_poses) == 0:
            return

        poses_arr = np.asarray(base_poses, dtype=np.float64)

        # 1. Camera → Gripper TCP in table frame
        ee_table = camera_gripper_calibrator.transform_trajectory(poses_arr, to_gripper=True)
        ep['ee_poses'] = ee_table.tolist()
        ep['gripper_offset_applied'] = camera_gripper_calibrator.get_config()

        # Resolve episode's independent base calibration
        if calib is not None:
            active_calib = dict(calib)
        elif ep.get('workspace_calibration'):
            active_calib = dict(ep['workspace_calibration'])
        else:
            # Default base position is OPTIMAL, computed independently for this episode's trajectory
            temp_calibrator = WorkspaceCalibrator(reach_angle_rad=reach_rad)
            opt = temp_calibrator.auto_align_to_trajectory(ee_table, nominal_reach=0.24, default_yaw=90.0)
            active_calib = dict(opt)

        active_calib["reach_angle_rad"] = reach_rad
        active_calib["reach_angle_deg"] = float(np.degrees(reach_rad))
        ep_calibrator = WorkspaceCalibrator(
            offset_x=float(active_calib.get("offset_x", 0.038)),
            offset_y=float(active_calib.get("offset_y", -0.406)),
            offset_z=float(active_calib.get("offset_z", 0.00)),
            yaw_deg=float(active_calib.get("yaw_deg", 90.0)),
            reach_angle_rad=reach_rad
        )

        # 2. Table frame → Robot base frame (using episode-specific independent calibration)
        ee_robot = ep_calibrator.transform_trajectory(ee_table, to_robot=True)
        ep['workspace_calibration'] = copy.deepcopy(ep_calibrator.get_config())
        ep['robot_type'] = ROBOT_CONFIG.get("robot_type", "so_arm101_omni_kin")

        # 3. Normalize gripper states [0, 1]
        grippers = np.array(ep.get("gripper_states", [100.0] * len(ee_robot)), dtype=np.float32)
        if np.max(grippers) > 1.0 + 1e-3:
            grippers = np.clip(grippers / 100.0, 0.0, 1.0)
        else:
            grippers = np.clip(grippers, 0.0, 1.0)

        # 4. Solve Inverse Kinematics for each waypoint
        joints = []
        link_positions = []
        prev_q = None
        feasible_count = 0
        ik_errors_cm = []
        for i in range(len(ee_robot)):
            try:
                res = r_solver.solve_feasible_ik(ee_robot[i], gripper_state=float(grippers[i]), prev_joints=prev_q)
                q = res["joints"]
                prev_q = q[:5]
                link_positions.append(res.get("link_positions", []))
                feasible_count += int(bool(res.get("is_feasible", False)))
                ik_errors_cm.append(float(res.get("error_distance_cm", 0.0)))
            except Exception as exc:
                raise ValueError(f"IK failed at frame {i}; refusing fabricated fallback joints") from exc
            joints.append(q)
        joints = np.array(joints, dtype=np.float32)
        joints[:, -1] = grippers  # Ensure gripper column stays normalized

        # 5. Smooth joint trajectory (Savitzky-Golay + slew-rate limiter)
        if hasattr(r_solver, "smooth_joint_trajectory"):
            joints = r_solver.smooth_joint_trajectory(joints, fps=float(ep.get("fps", 30.0)))

        ep['joint_states'] = joints.tolist()

        # 6. Forward kinematics → robot_ee_poses (FK-synchronized, in robot base frame)
        fk_robot = []
        fk_links = []
        for i in range(len(joints)):
            q_rad = np.radians(joints[i, :5])
            fk_p = r_solver.forward_kinematics(q_rad)
            fk_robot.append(fk_p)
            if hasattr(r_solver, "forward_kinematics_chain"):
                chain = r_solver.forward_kinematics_chain(q_rad)
                fk_links.append([p.tolist() for p in chain])
        ep['robot_ee_poses'] = np.array(fk_robot, dtype=np.float32).tolist()
        if fk_links:
            ep['link_positions'] = fk_links
        else:
            ep['link_positions'] = link_positions
        ep['reach_angle_deg'] = getattr(r_solver, "reach_angle_deg", 0.0)

        # 6b. Reproject FK robot EE poses to table frame (for exact 3D preview tube parity)
        fk_table = ep_calibrator.transform_trajectory(fk_robot, to_robot=False)
        ep['fk_table_poses'] = np.array(fk_table, dtype=np.float32).tolist()
        # The mounted-camera preview must follow the same calibrated transform as
        # the processed TCP, including after joint smoothing changes the FK pose.
        fk_camera = camera_gripper_calibrator.transform_trajectory(fk_table, to_gripper=False)
        ep['fk_camera_poses'] = np.array(fk_camera, dtype=np.float32).tolist()
        ep['ik_feasibility'] = {
            "feasible_percent": round(feasible_count / max(1, len(ee_robot)) * 100.0, 1),
            "avg_error_cm": round(float(np.mean(ik_errors_cm)) if ik_errors_cm else 0.0, 2),
        }
        ep['kinematics_stale'] = False
        ep.pop('kinematics_stale_reason', None)

        # 7. Actions = next-step joint states (joint space, degrees + normalized gripper)
        actions = np.roll(joints, -1, axis=0)
        actions[-1] = joints[-1]
        ep['actions'] = actions.tolist()

        save_episode_meta(ep)
        print(f"[{time.strftime('%H:%M:%S')}] ✅ Synced kinematics for episode {ep.get('episode_id', '?')} ({len(joints)} frames, reach={ep['reach_angle_deg']}°)")
        return ep['ik_feasibility']
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] ⚠️  sync_episode_kinematics failed for {ep.get('episode_id', '?')}: {e}")
        return None


def load_episodes_from_disk():
    global EPISODES_DB
    loaded = []
    if not os.path.exists(RECORDINGS_DIR):
        return
    for item in sorted(os.listdir(RECORDINGS_DIR)):
        item_path = os.path.join(RECORDINGS_DIR, item)
        if not os.path.isdir(item_path) or item.startswith('.'):
            continue
        meta_path = os.path.join(item_path, "episode_meta.json")
        if os.path.exists(meta_path):
            try:
                with open(meta_path, "r", encoding="utf-8") as f:
                    ep_data = json.load(f)
                    if "manifest" not in ep_data:
                        # Never silently bless data produced before integrity checks.
                        ep_data["manifest"] = legacy_manifest()
                    if 'dev_video_url' not in ep_data and os.path.exists(os.path.join(item_path, "dev_visualization.mp4")):
                        ep_data['dev_video_url'] = f"/recordings/{item}/dev_visualization.mp4"
                    if 'canny_video_url' not in ep_data and os.path.exists(os.path.join(item_path, "canny_visualization.mp4")):
                        ep_data['canny_video_url'] = f"/recordings/{item}/canny_visualization.mp4"
                    if ('ee_poses' not in ep_data or not ep_data['ee_poses'] or 'gripper_offset_applied' not in ep_data) and 'poses' in ep_data:
                        ee_p = camera_gripper_calibrator.transform_trajectory(ep_data['poses'], to_gripper=True)
                        ep_data['ee_poses'] = ee_p.tolist()
                        act = np.roll(ee_p, -1, axis=0)
                        act[-1] = ee_p[-1]
                        ep_data['actions'] = act.tolist()
                        ep_data['gripper_offset_applied'] = camera_gripper_calibrator.get_config()
                    loaded.append(ep_data)
            except Exception as e:
                print(f"Error reading {meta_path}: {e}")
        else:
            video_files = [f for f in os.listdir(item_path) if f.startswith("recording.")]
            if video_files:
                video_filename = video_files[0]
                video_path = os.path.join(item_path, video_filename)
                try:
                    cap = cv2.VideoCapture(video_path)
                    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
                    cap.release()
                    dev_path = os.path.join(item_path, "dev_visualization.mp4")
                    canny_path = os.path.join(item_path, "canny_visualization.mp4")
                    poses, telem = visual_tracker.process_video_and_imu(
                        video_path,
                        [],
                        fps=fps,
                        output_dev_video_path=dev_path,
                        output_canny_video_path=canny_path,
                        return_dev_info=True
                    )
                    actions = np.roll(poses, -1, axis=0)
                    actions[-1] = poses[-1]
                    timestamps = np.linspace(0, len(poses) / fps, len(poses))
                    ep_data = {
                        'episode_index': len(loaded),
                        'episode_id': item,
                        'task': 'demonstration',
                        'video_path': video_path,
                        'video_url': f'/recordings/{item}/{video_filename}',
                        'dev_video_url': f'/recordings/{item}/dev_visualization.mp4',
                        'canny_video_url': f'/recordings/{item}/canny_visualization.mp4',
                        'dev_telemetry': telem,
                        'num_frames': len(poses),
                        'fps': fps,
                        'duration': len(poses) / fps,
                        'anchor': 'aruco_feature_imu_fusion',
                        'marker_size_cm': 10.0,
                        'poses': poses.tolist(),
                        'raw_poses': safe_to_list(getattr(visual_tracker, 'last_raw_trajectory', None), poses),
                        'ee_poses': poses.tolist(),
                        'gripper_states': [100.0] * len(poses),
                        'actions': actions.tolist(),
                        'timestamps': timestamps.tolist(),
                        'imu_data': [],
                        'created_at': time.strftime("%Y-%m-%d %H:%M:%S")
                    }
                    save_episode_meta(ep_data)
                    loaded.append(ep_data)
                except Exception as e:
                    print(f"Error auto-processing {item}: {e}")

    r_solver = None
    for idx, ep in enumerate(loaded):
        ep['episode_index'] = idx
        if 'feasible_window' not in ep or not ep['feasible_window']:
            if r_solver is None:
                r_solver = get_robot_solver(
                    ROBOT_CONFIG.get("robot_type", "so_arm101_omni_kin"),
                    q3_safe_max_deg=ROBOT_CONFIG.get("q3_safe_max_deg", 0.0),
                    custom_dh_table=ROBOT_CONFIG.get("custom_dh_table"),
                    custom_urdf=ROBOT_CONFIG.get("custom_urdf")
                )
            raw_p = ep.get('ee_poses') or ep.get('poses')
            if raw_p and len(raw_p) > 0:
                try:
                    poses_arr = np.asarray(raw_p, dtype=np.float64)
                    robot_poses = workspace_calibrator.transform_trajectory(poses_arr, to_robot=True)
                    f_start, f_end = find_feasible_window(robot_poses, r_solver)
                    ep['feasible_window'] = {
                        "start": int(f_start),
                        "end": int(f_end),
                        "total": len(poses_arr),
                        "is_trimmed": bool(f_start > 0 or f_end < len(poses_arr))
                    }
                except Exception:
                    ep['feasible_window'] = {
                        "start": 0,
                        "end": len(raw_p),
                        "total": len(raw_p),
                        "is_trimmed": False
                    }
            else:
                ep['feasible_window'] = {
                    "start": 0,
                    "end": 0,
                    "total": 0,
                    "is_trimmed": False
                }
    EPISODES_DB = loaded

    # Sync kinematics for episodes that don't have pre-computed joint_states / robot_ee_poses or are missing TCP link positions
    needs_sync = [
        ep for ep in EPISODES_DB
        if not ep.get('joint_states')
        or not ep.get('robot_ee_poses')
        or not ep.get('link_positions')
        or not ep.get('workspace_calibration')
        or (ep.get('link_positions') and len(ep['link_positions'][0]) < 7)
    ]
    if needs_sync:
        print(f"[{time.strftime('%H:%M:%S')}] 🔧 Computing kinematics for {len(needs_sync)} episode(s) needing TCP sync...")
        for ep in needs_sync:
            sync_episode_kinematics(ep)

    print(f"[{time.strftime('%H:%M:%S')}] 📂 Loaded {len(EPISODES_DB)} saved episodes from disk.")

# Load existing recordings on server initialization
load_episodes_from_disk()

# ==============================================================================
# Thread-Safe Background Processing Queue & Worker Thread
# ==============================================================================
PROCESSING_QUEUE = queue.Queue()
PROCESSING_STATUS = {
    "is_processing": False,
    "current_job": None,
    "pending_count": 0,
    "completed_count": 0,
    "failed_count": 0,
    "recent_jobs": []
}

def _sync_execute_processing_job(job):
    """
    Synchronously runs visual_tracker.process_video_and_imu and trajectory calculation.
    Executed inside THREAD_POOL via loop.run_in_executor.
    """
    ep_uid = job["job_id"]
    ep_dir = job["ep_dir"]
    video_path = job["video_path"]
    video_url = job["video_url"]
    task = job.get("task", "demonstration")
    parsed_imu = job.get("parsed_imu", [])
    raw_gripper_list = job.get("parsed_gripper", [])
    config_snapshot = job["config_snapshot"]
    job_tracker = _new_tracker(config_snapshot)

    print(f"\n[{time.strftime('%H:%M:%S')}] ⚙️ Executing Server-Side Sensory Fusion for {ep_uid} ('{task}')...")

    # 0. Ensure video is standardized H.264 MP4 for universal HTML5 playback and frame-accurate seeking
    standard_mp4_path = os.path.join(ep_dir, "recording.mp4")
    if not video_path.lower().endswith(".mp4") or not os.path.exists(standard_mp4_path):
        try:
            cap_trans = cv2.VideoCapture(video_path)
            if cap_trans.isOpened():
                trans_w = int(cap_trans.get(cv2.CAP_PROP_FRAME_WIDTH)) or 1280
                trans_h = int(cap_trans.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 720
                trans_fps = cap_trans.get(cv2.CAP_PROP_FPS) or 30.0
                if trans_fps <= 0 or trans_fps > 120 or np.isnan(trans_fps):
                    trans_fps = 30.0

                tmp_trans = standard_mp4_path + ".tmp.mp4"
                fourcc = cv2.VideoWriter_fourcc(*'avc1')
                trans_writer = cv2.VideoWriter(tmp_trans, fourcc, trans_fps, (trans_w, trans_h))
                if not trans_writer.isOpened():
                    trans_writer = cv2.VideoWriter(tmp_trans, cv2.VideoWriter_fourcc(*'mp4v'), trans_fps, (trans_w, trans_h))

                trans_count = 0
                while True:
                    ret_f, f_data = cap_trans.read()
                    if not ret_f:
                        break
                    trans_writer.write(f_data)
                    trans_count += 1

                cap_trans.release()
                trans_writer.release()

                if os.path.exists(tmp_trans) and os.path.getsize(tmp_trans) > 100:
                    if os.path.exists(standard_mp4_path):
                        os.remove(standard_mp4_path)
                    os.replace(tmp_trans, standard_mp4_path)
                    video_path = standard_mp4_path
                    video_url = f"/recordings/{ep_uid}/recording.mp4"
                    print(f"[{time.strftime('%H:%M:%S')}] 🎬 Transcoded {os.path.basename(job['video_path'])} to standard H.264 recording.mp4 ({trans_count} frames)")
        except Exception as trans_err:
            print(f"Warning transcoding uploaded video: {trans_err}")

    # 1. Inspect video frame count and FPS
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

    # 2. Server-Side Visual-Inertial fusion
    dev_video_filename = "dev_visualization.mp4"
    dev_video_path = os.path.join(ep_dir, dev_video_filename)
    dev_video_url = f"/recordings/{ep_uid}/{dev_video_filename}"

    canny_video_filename = "canny_visualization.mp4"
    canny_video_path = os.path.join(ep_dir, canny_video_filename)
    canny_video_url = f"/recordings/{ep_uid}/{canny_video_filename}"

    anchored_poses, dev_telemetry = job_tracker.process_video_and_imu(
        video_path,
        parsed_imu,
        fps=fps,
        output_dev_video_path=dev_video_path,
        output_canny_video_path=canny_video_path,
        return_dev_info=True
    )

    num_pts = len(anchored_poses)
    if num_pts <= 0:
        raise ValueError("Trajectory processing returned no poses")
    timestamps = frame_timestamps(num_pts, fps)

    # 3. Resolve Gripper States (Physical ArUco Jaw Markers -> Touch Events -> Open Default)
    gripper_states = []
    resolved_from_markers = getattr(job_tracker, 'last_resolved_gripper_values', None)
    has_marker_gripper = any(g.get('detected', False) for g in getattr(job_tracker, 'last_gripper_states', []))

    if has_marker_gripper and resolved_from_markers and len(resolved_from_markers) == num_pts:
        gripper_states = [round(float(v), 1) for v in resolved_from_markers]
        print(f"[{time.strftime('%H:%M:%S')}] 🤏 Resolved Gripper Trajectory from Jaw ArUco Tags 2 & 3 (22mm)!")
    elif raw_gripper_list and len(raw_gripper_list) > 0:
        try:
            if isinstance(raw_gripper_list[0], dict) and ('t' in raw_gripper_list[0] or 'timestamp' in raw_gripper_list[0]):
                times = np.array([float(g.get('t', g.get('timestamp', 0.0))) for g in raw_gripper_list])
                vals = np.array([float(g.get('val', g.get('value', 100.0))) for g in raw_gripper_list])
                # Normalize to 0-100 if in 0-1 range
                if np.max(vals) <= 1.0 + 1e-4:
                    vals = vals * 100.0
                interp_grippers = np.interp(timestamps, times, vals)
                gripper_states = interp_grippers.tolist()
            elif len(raw_gripper_list) == num_pts:
                vals = np.array(raw_gripper_list, dtype=np.float32)
                if np.max(vals) <= 1.0 + 1e-4:
                    vals = vals * 100.0
                gripper_states = vals.tolist()
            else:
                gripper_states = [100.0] * num_pts
        except Exception as grip_err:
            print(f"Warning parsing touch gripper trajectory: {grip_err}")
            gripper_states = [100.0] * num_pts
    else:
        # Default rule: If markers not detected, do not fail - default to Open (100.0%)
        gripper_states = [100.0] * num_pts

    anchored_poses = np.array(anchored_poses)
    # Apply 6-DoF Camera-to-Gripper Extrinsic Calibration
    ee_poses = camera_gripper_calibrator.transform_trajectory(anchored_poses, to_gripper=True)
    actions = np.roll(ee_poses, -1, axis=0)
    actions[-1] = ee_poses[-1]

    with EPISODE_LOCK:
        ep_idx = len(EPISODES_DB)
    episode_data = {
        'episode_index': ep_idx,
        'episode_id': ep_uid,
        'task': task,
        'video_path': video_path,
        'video_url': video_url,
        'dev_video_url': dev_video_url,
        'canny_video_url': canny_video_url,
        'dev_telemetry': dev_telemetry,
        'num_frames': num_pts,
        'fps': fps,
        'duration': num_pts / fps,
        'anchor': 'aruco_feature_imu_fusion',
        'marker_size_cm': 10.0,
        'poses': anchored_poses.tolist(),
        'raw_poses': safe_to_list(getattr(job_tracker, 'last_raw_trajectory', None), anchored_poses),
        'ee_poses': ee_poses.tolist(),
        'gripper_states': gripper_states,
        'actions': actions.tolist(),
        'timestamps': timestamps,
        'imu_data': parsed_imu,
        'gripper_offset_applied': camera_gripper_calibrator.get_config(),
        'created_at': time.strftime("%Y-%m-%d %H:%M:%S")
    }
    episode_data['manifest'] = episode_manifest(
        source_sha256=job['source_sha256'], frame_count=job['source_frame_count'],
        fps=job['source_fps'], imu_samples=len(parsed_imu),
        config_snapshot=config_snapshot,
        status="processed",
        validation={"state": "passed", "errors": [], "trajectory_frames": num_pts},
    )

    with EPISODE_LOCK:
        EPISODES_DB.append(episode_data)
    save_episode_meta(episode_data)
    _save_job_manifest(job, "processed")

    # Default base position as optimal for the new episode trajectory
    poses_for_opt = episode_data.get("ee_poses") or episode_data.get("poses")
    if poses_for_opt and len(poses_for_opt) > 0:
        opt_arr = np.asarray(poses_for_opt, dtype=np.float64)
        if opt_arr.ndim == 2 and opt_arr.shape[1] >= 3 and np.isfinite(opt_arr[:, :3]).all():
            opt_calib = workspace_calibrator.auto_align_to_trajectory(opt_arr, nominal_reach=0.24, default_yaw=90.0)
            calibrated = dict(opt_calib)
            r_solver_ep = get_robot_solver(ROBOT_CONFIG.get("robot_type", "so_arm101_omni_kin"))
            calibrated["reach_angle_rad"] = getattr(r_solver_ep, "reach_angle_rad", 0.0)
            ROBOT_CONFIG.update(calibrated)
            workspace_calibrator.update_config(**calibrated)
            save_robot_config(ROBOT_CONFIG)

    sync_episode_kinematics(episode_data)
    if not episode_data.get("joint_states") or not episode_data.get("robot_ee_poses"):
        with EPISODE_LOCK:
            EPISODES_DB.remove(episode_data)
        episode_data["manifest"]["status"] = "failed"
        episode_data["manifest"]["validation"] = {
            "state": "failed", "errors": ["Authoritative IK synchronization failed"]
        }
        save_episode_meta(episode_data)
        raise ValueError("Authoritative kinematics validation failed")
    print(f"[{time.strftime('%H:%M:%S')}] 🎉 Episode #{ep_idx} successfully calculated via ArUco+Feature+IMU fusion ({num_pts} frames)!\n")
    return episode_data

def _background_processing_worker_thread():
    """
    Dedicated background worker thread that continuously consumes jobs from PROCESSING_QUEUE.
    Fully thread-safe and independent of uvicorn HTTP/HTTPS event loops.
    """
    print(f"[{time.strftime('%H:%M:%S')}] 🚀 Started OmniKin Background Processing Worker thread.")
    while True:
        try:
            job = PROCESSING_QUEUE.get()
            PROCESSING_STATUS["is_processing"] = True
            PROCESSING_STATUS["pending_count"] = PROCESSING_QUEUE.qsize()
            PROCESSING_STATUS["current_job"] = {
                "job_id": job["job_id"],
                "task": job["task"],
                "client_take_id": job.get("client_take_id"),
                "started_at": time.time(),
                "phase": "processing"
            }
            print(f"\n[{time.strftime('%H:%M:%S')}] ⚙️ [Worker] Starting background processing for Job {job['job_id']} ('{job['task']}'). Queue remaining: {PROCESSING_QUEUE.qsize()}")

            try:
                episode_data = _sync_execute_processing_job(job)
                PROCESSING_STATUS["completed_count"] += 1
                PROCESSING_STATUS["recent_jobs"].append({
                    "job_id": job["job_id"],
                    "episode_index": episode_data["episode_index"],
                    "task": job["task"],
                    "status": "completed",
                    "frames": episode_data["num_frames"],
                    "completed_at": time.strftime("%Y-%m-%d %H:%M:%S")
                })
                print(f"[{time.strftime('%H:%M:%S')}] ✅ [Worker] Completed Episode #{episode_data['episode_index']} ({episode_data['num_frames']} frames) for Job {job['job_id']}")
            except Exception as e:
                import traceback
                traceback.print_exc()
                PROCESSING_STATUS["failed_count"] += 1
                PROCESSING_STATUS["recent_jobs"].append({
                    "job_id": job["job_id"],
                    "task": job["task"],
                    "status": "failed",
                    "error": str(e),
                    "failed_at": time.strftime("%Y-%m-%d %H:%M:%S")
                })
                try:
                    _save_job_manifest(job, "failed", [str(e)])
                except Exception:
                    pass
                print(f"[{time.strftime('%H:%M:%S')}] ❌ [Worker] Failed processing Job {job['job_id']}: {e}")
            finally:
                if len(PROCESSING_STATUS["recent_jobs"]) > 20:
                    PROCESSING_STATUS["recent_jobs"] = PROCESSING_STATUS["recent_jobs"][-20:]
                PROCESSING_STATUS["is_processing"] = False
                PROCESSING_STATUS["current_job"] = None
                PROCESSING_STATUS["pending_count"] = PROCESSING_QUEUE.qsize()
                PROCESSING_QUEUE.task_done()
        except Exception as loop_err:
            print(f"Worker thread error: {loop_err}")
            time.sleep(0.5)

# Launch worker thread once on server initialization
_worker_thread = threading.Thread(target=_background_processing_worker_thread, daemon=True, name="OmniKinWorker")
_worker_thread.start()

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

@app.get("/manifest.json")
async def manifest_file():
    manifest_path = os.path.join(FRONTEND_DIST_DIR, "manifest.json")
    if os.path.exists(manifest_path):
        return FileResponse(manifest_path, media_type="application/json")
    return JSONResponse({"name": "OmniKin 3D Trajectory Manager"}, status_code=200)

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

@app.get("/api/marker/print_gripper", response_class=HTMLResponse)
@app.get("/api/marker/gripper_sheet", response_class=HTMLResponse)
async def print_gripper_markers_page(
    tag_a_id: int = 2,
    tag_b_id: int = 3,
    size_mm: float = 22.0,
    dict_name: str = "DICT_6X6_250"
):
    """
    Returns an HTML print template for printing the two small gripper jaw ArUco markers
    (Tag 2 & Tag 3) at EXACT 22.0mm physical scale with cutting guides and calibration ruler.
    """
    return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Print Gripper ArUco Markers ({size_mm:.0f}mm - ID {tag_a_id} & {tag_b_id})</title>
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
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            padding: 14px 20px;
            border-radius: 8px;
            margin-bottom: 24px;
            text-align: center;
            max-width: 600px;
        }}
        .print-btn {{
            background: #2563eb;
            color: white;
            border: none;
            padding: 10px 24px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            margin-top: 10px;
        }}
        .print-btn:hover {{
            background: #1d4ed8;
        }}
        @media print {{
            .no-print {{ display: none !important; }}
            body {{ padding: 0; }}
        }}

        .sheet-card {{
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            max-width: 620px;
            width: 100%;
            background: #ffffff;
        }}

        .sheet-title {{
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 4px;
            color: #0f172a;
        }}
        .sheet-desc {{
            font-size: 12px;
            color: #64748b;
            margin-bottom: 20px;
            line-height: 1.5;
        }}

        .markers-flex {{
            display: flex;
            flex-direction: row;
            justify-content: center;
            gap: 25mm;
            margin: 15mm 0;
        }}

        /* Individual Gripper Marker Cutout Box */
        .cutout-box {{
            display: flex;
            flex-direction: column;
            align-items: center;
            border: 1.5px dashed #94a3b8;
            padding: 4mm;
            border-radius: 3mm;
            position: relative;
            background: #fafafa;
        }}

        .cut-label {{
            font-size: 9px;
            font-weight: 600;
            color: #64748b;
            margin-bottom: 2mm;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}

        /* EXACT PHYSICAL MILLIMETER DIMENSIONS FOR BLACK ARUCO SQUARE */
        .gripper-marker-img {{
            width: {size_mm}mm;
            height: {size_mm}mm;
            display: block;
            image-rendering: pixelated;
            border: 1px solid #000;
        }}

        .marker-tag-name {{
            font-size: 11px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 3mm;
            text-align: center;
        }}
        .marker-tag-sub {{
            font-size: 9px;
            color: #64748b;
            margin-top: 1mm;
        }}

        /* Verification Ruler matching the marker size */
        .ruler-box {{
            margin-top: 15mm;
            padding-top: 8mm;
            border-top: 1px solid #e2e8f0;
            display: flex;
            flex-direction: column;
            align-items: center;
        }}
        .ruler-title {{
            font-size: 11px;
            font-weight: 600;
            color: #475569;
            margin-bottom: 3mm;
        }}
        .ruler-bar {{
            width: {size_mm}mm;
            height: 8mm;
            border-top: 2px solid #000;
            position: relative;
        }}
        .r-tick {{
            position: absolute;
            top: 0;
            width: 1px;
            background: #000;
        }}
        .r-lbl {{
            position: absolute;
            top: 4mm;
            font-size: 8px;
            font-family: monospace;
            transform: translateX(-50%);
        }}

        .instructions-box {{
            margin-top: 10mm;
            background: #f1f5f9;
            border-radius: 8px;
            padding: 12px 16px;
            font-size: 11px;
            color: #334155;
            line-height: 1.6;
        }}
        .instructions-box strong {{
            color: #0f172a;
        }}
    </style>
</head>
<body>
    <div class="no-print">
        <h3 style="margin: 0 0 6px 0; color: #0f172a;">🤖 OmniKin Gripper Jaw ArUco Markers</h3>
        <p style="margin: 0; font-size: 13px; color: #475569;">
            Print at <strong>Scale: 100% (Actual Size)</strong> on standard A4 paper.<br>
            Each black marker square is scaled to exactly <strong>{size_mm:.1f} mm</strong>.
        </p>
        <button class="print-btn" onclick="window.print()">PRINT 22MM GRIPPER MARKERS</button>
        <div style="margin-top: 10px; font-size: 12px;">
            <a href="/api/marker/print_dual" style="color: #2563eb; text-decoration: underline;">Switch to Dual-ArUco Table Board (10cm + 5cm)</a>
        </div>
    </div>

    <div class="sheet-card">
        <div class="sheet-title">OmniKin Gripper Jaw Markers ({size_mm:.0f} mm)</div>
        <div class="sheet-desc">
            ArUco Dictionary: <code>{dict_name}</code> &nbsp;|&nbsp; Target Size: <strong>{size_mm:.1f} mm × {size_mm:.1f} mm</strong>
        </div>

        <!-- Two Gripper Markers with scissor cut-lines -->
        <div class="markers-flex">
            <!-- Jaw A: Tag 2 -->
            <div class="cutout-box">
                <span class="cut-label">✂ Cut along dashed line</span>
                <img class="gripper-marker-img" src="/api/marker/raw?marker_id={tag_a_id}&size=400&dict_name={dict_name}" alt="Jaw A (Tag {tag_a_id})">
                <div class="marker-tag-name">Tag {tag_a_id} — Jaw A</div>
                <div class="marker-tag-sub">Left / Fixed Finger ({size_mm:.0f}mm)</div>
            </div>

            <!-- Jaw B: Tag 3 -->
            <div class="cutout-box">
                <span class="cut-label">✂ Cut along dashed line</span>
                <img class="gripper-marker-img" src="/api/marker/raw?marker_id={tag_b_id}&size=400&dict_name={dict_name}" alt="Jaw B (Tag {tag_b_id})">
                <div class="marker-tag-name">Tag {tag_b_id} — Jaw B</div>
                <div class="marker-tag-sub">Right / Moving Finger ({size_mm:.0f}mm)</div>
            </div>
        </div>

        <!-- Calibration Verification Ruler -->
        <div class="ruler-box">
            <div class="ruler-title">Physical Ruler Calibration Check ({size_mm:.0f}mm)</div>
            <div class="ruler-bar">
                <div class="r-tick" style="left: 0; height: 5mm;"></div>
                <div class="r-lbl" style="left: 0;">0</div>

                <div class="r-tick" style="left: 22.7%; height: 3mm;"></div>
                <div class="r-lbl" style="left: 22.7%;">5mm</div>

                <div class="r-tick" style="left: 45.5%; height: 4mm;"></div>
                <div class="r-lbl" style="left: 45.5%;">10mm</div>

                <div class="r-tick" style="left: 68.2%; height: 3mm;"></div>
                <div class="r-lbl" style="left: 68.2%;">15mm</div>

                <div class="r-tick" style="right: 0; height: 5mm;"></div>
                <div class="r-lbl" style="right: 0;">{size_mm:.0f}mm</div>
            </div>
        </div>

        <!-- Mounting Instructions -->
        <div class="instructions-box">
            <strong>Mounting & Tracking Instructions:</strong>
            <ol style="margin: 6px 0 0 0; padding-left: 18px;">
                <li>Verify with a physical caliper or ruler that the black square is <strong>{size_mm:.0f} mm</strong> wide.</li>
                <li>Cut out each marker along the dashed gray lines leaving a small white border.</li>
                <li>Tape <strong>Tag {tag_a_id}</strong> to Jaw A and <strong>Tag {tag_b_id}</strong> to Jaw B facing forward towards the smartphone camera.</li>
                <li><strong>Zero-Failure Guarantee:</strong> If the markers are occluded, out of frame, or not attached, the episode will never fail and the gripper state will safely default to <strong>Open (100%)</strong>.</li>
            </ol>
        </div>
    </div>
</body>
</html>"""

@app.get("/api/episodes")
async def get_episodes():
    load_episodes_from_disk()
    return JSONResponse(EPISODES_DB)

@app.delete("/api/episodes/{episode_index}")
async def delete_episode(episode_index: int):
    global EPISODES_DB
    try:
        _ensure_idle("delete episodes")
    except ValueError as exc:
        return JSONResponse({"status": "error", "message": str(exc)}, status_code=409)
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
        save_episode_meta(ep)

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
    try:
        _ensure_idle("clear episodes")
    except ValueError as exc:
        return JSONResponse({"status": "error", "message": str(exc)}, status_code=409)
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
    gripper_data: str = Form("[]"),
    task: str = Form("demonstration")
):
    """
    Receives raw sensor recording (video stream + high-frequency IMU telemetry) from mobile phone,
    saves the raw files to disk and enqueues 3D Visual-Inertial reconstruction on the
    single background processing worker, matching the high-throughput upload endpoint.
    """
    try:
        ep_uid = f"rec_{int(time.time() * 1000)}_{uuid.uuid4().hex[:6]}"
        ep_dir = os.path.join(RECORDINGS_DIR, ep_uid)
        os.makedirs(ep_dir, exist_ok=True)

        filename = video.filename or "recording.mp4"
        ext = os.path.splitext(filename)[1].lower()
        if not ext or ext == ".":
            ext = ".webm" if "webm" in (video.content_type or "") else ".mp4"

        video_filename = f"recording{ext}"
        video_path = os.path.join(ep_dir, video_filename)
        video_url = f"/recordings/{ep_uid}/{video_filename}"

        print(f"\n[{time.strftime('%H:%M:%S')}] 📥 Server received synchronous upload request ({video.filename}, {video.content_type})")

        byte_count, source_sha256 = await _stream_upload_to_file(video, video_path)
        source_frame_count, source_fps = _validate_video(video_path)

        print(f"[{time.strftime('%H:%M:%S')}] 💾 Raw video payload saved to disk: {video_path} ({byte_count} bytes)")

        if len(imu_data.encode("utf-8")) > MAX_JSON_BYTES or len(gripper_data.encode("utf-8")) > MAX_JSON_BYTES:
            raise ValueError("Telemetry payload exceeds the 2 MiB limit")
        try:
            parsed_imu = json.loads(imu_data)
        except Exception as imu_err:
            print(f"[{time.strftime('%H:%M:%S')}] ⚠️ Warning parsing IMU telemetry: {imu_err}")
            parsed_imu = []

        try:
            parsed_gripper = json.loads(gripper_data)
        except Exception:
            parsed_gripper = []

        job = {
            "job_id": ep_uid,
            "ep_dir": ep_dir,
            "task": task,
            "video_path": video_path,
            "video_filename": video_filename,
            "video_url": video_url,
            "parsed_imu": parsed_imu,
            "parsed_gripper": parsed_gripper,
            "enqueued_at": time.time(),
            "source_sha256": source_sha256,
            "source_frame_count": source_frame_count,
            "source_fps": source_fps,
            "config_snapshot": _config_snapshot(),
        }
        _save_job_manifest(job, "queued")

        PROCESSING_QUEUE.put(job)
        queue_pos = PROCESSING_QUEUE.qsize()
        return JSONResponse({
            "status": "queued",
            "job_id": ep_uid,
            "task": task,
            "queue_position": queue_pos,
            "message": "Recording uploaded and queued for background processing"
        })

    except Exception as err:
        import traceback
        traceback.print_exc()
        print(f"[{time.strftime('%H:%M:%S')}] ❌ ERROR during server calculation: {err}")
        return JSONResponse({
            "status": "error",
            "message": f"Server processing error: {str(err)}"
        }, status_code=500)

@app.post("/api/recordings/upload")
async def upload_recording_async(
    video: UploadFile = File(...),
    imu_data: str = Form("[]"),
    gripper_data: str = Form("[]"),
    task: str = Form("demonstration"),
    client_take_id: str = Form(None)
):
    """
    High-Throughput Non-Blocking Ingestion Endpoint:
    Streams the raw mobile video & telemetry to disk in < 150ms and immediately enqueues
    the take for background visual-inertial processing. Returns 200 OK immediately so the
    mobile camera shutter can reset instantly for the next demonstration.
    """
    try:
        ep_uid = f"rec_{int(time.time() * 1000)}_{uuid.uuid4().hex[:6]}"
        ep_dir = os.path.join(RECORDINGS_DIR, ep_uid)
        os.makedirs(ep_dir, exist_ok=True)

        filename = video.filename or "recording.mp4"
        ext = os.path.splitext(filename)[1].lower()
        if not ext or ext == ".":
            ext = ".webm" if "webm" in (video.content_type or "") else ".mp4"

        video_filename = f"recording{ext}"
        video_path = os.path.join(ep_dir, video_filename)
        video_url = f"/recordings/{ep_uid}/{video_filename}"

        byte_count, source_sha256 = await _stream_upload_to_file(video, video_path)
        source_frame_count, source_fps = _validate_video(video_path)

        if len(imu_data.encode("utf-8")) > MAX_JSON_BYTES or len(gripper_data.encode("utf-8")) > MAX_JSON_BYTES:
            raise ValueError("Telemetry payload exceeds the 2 MiB limit")
        try:
            parsed_imu = json.loads(imu_data)
        except Exception:
            parsed_imu = []

        try:
            parsed_gripper = json.loads(gripper_data)
        except Exception:
            parsed_gripper = []

        # Save upload manifest for persistence
        upload_manifest = {
            "job_id": ep_uid,
            "task": task,
            "video_path": video_path,
            "video_url": video_url,
            "client_take_id": client_take_id,
            "uploaded_at": time.time(),
            "bytes": byte_count,
            "source_sha256": source_sha256,
            "source_frame_count": source_frame_count,
            "source_fps": source_fps,
            "config_snapshot": _config_snapshot(),
        }
        with open(os.path.join(ep_dir, "upload_manifest.json"), "w", encoding="utf-8") as f:
            json.dump(upload_manifest, f, indent=2)

        job = {
            "job_id": ep_uid,
            "ep_dir": ep_dir,
            "task": task,
            "video_path": video_path,
            "video_filename": video_filename,
            "video_url": video_url,
            "parsed_imu": parsed_imu,
            "parsed_gripper": parsed_gripper,
            "client_take_id": client_take_id,
            "enqueued_at": time.time(),
            "source_sha256": source_sha256,
            "source_frame_count": source_frame_count,
            "source_fps": source_fps,
            "config_snapshot": _config_snapshot(),
        }
        _save_job_manifest(job, "queued")

        PROCESSING_QUEUE.put(job)
        queue_pos = PROCESSING_QUEUE.qsize()

        print(f"[{time.strftime('%H:%M:%S')}] 📥 Fast Ingestion: Take '{client_take_id or ep_uid}' ('{task}') enqueued at #{queue_pos} ({byte_count} bytes)")

        return JSONResponse({
            "status": "queued",
            "job_id": ep_uid,
            "client_take_id": client_take_id,
            "task": task,
            "queue_position": queue_pos,
            "message": "Recording uploaded and enqueued for background processing"
        })
    except Exception as err:
        import traceback
        traceback.print_exc()
        return JSONResponse({
            "status": "error",
            "message": f"Upload failed: {str(err)}"
        }, status_code=500)

@app.get("/api/processing/status")
async def get_processing_status():
    """
    Returns the real-time background processing queue status,
    active job details, and recent job completion history.
    """
    queued_jobs = [
        {"job_id": item.get("job_id"), "task": item.get("task"),
         "client_take_id": item.get("client_take_id"), "enqueued_at": item.get("enqueued_at")}
        for item in list(PROCESSING_QUEUE.queue)
    ]
    return JSONResponse({
        "status": "success",
        "is_processing": PROCESSING_STATUS["is_processing"],
        "pending_count": PROCESSING_QUEUE.qsize(),
        "completed_count": PROCESSING_STATUS["completed_count"],
        "failed_count": PROCESSING_STATUS["failed_count"],
        "current_job": PROCESSING_STATUS["current_job"],
        "queued_jobs": queued_jobs,
        "recent_jobs": PROCESSING_STATUS["recent_jobs"][-10:]
    })

@app.post("/api/recordings/sample")
async def generate_sample_recording(task: str = "draw 3d circle", shape: str = "circle"):
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
    fourcc = cv2.VideoWriter_fourcc(*'avc1')
    out = cv2.VideoWriter(video_path, fourcc, fps, (640, 480))
    if not out.isOpened():
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
        'raw_poses': anchored_poses.tolist(),
        'ee_poses': anchored_poses.tolist(),
        'gripper_states': gripper_states,
        'actions': actions.tolist(),
        'timestamps': timestamps.tolist(),
        'imu_data': [],
        'created_at': time.strftime("%Y-%m-%d %H:%M:%S")
    }

    EPISODES_DB.append(episode_data)
    save_episode_meta(episode_data)
    sync_episode_kinematics(episode_data)

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
async def reprocess_episode(episode_index: int, payload: dict = Body(None)):
    """
    Re-filters an existing recorded episode with the current EKF parameters and adaptive calibration.
    """
    global EPISODES_DB
    try:
        _ensure_idle("reprocess episodes")
    except ValueError as exc:
        return JSONResponse({"status": "error", "message": str(exc)}, status_code=409)
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

    smooth_opt = True
    smooth_method = "savgol"
    smooth_window_ms = 250
    if payload:
        smooth_opt = payload.get('smooth', True)
        smooth_method = payload.get('smooth_method', 'savgol')
        smooth_window_ms = int(payload.get('smooth_window_ms', 250))

    new_poses, dev_telemetry = visual_tracker.reprocess_episode_trajectory(
        video_path,
        imu_data,
        fps=fps,
        output_dev_video_path=dev_video_path,
        output_canny_video_path=canny_video_path,
        return_dev_info=True,
        smooth=smooth_opt,
        smooth_method=smooth_method,
        smooth_window_ms=smooth_window_ms
    )
    new_poses = np.array(new_poses)
    ee_poses = camera_gripper_calibrator.transform_trajectory(new_poses, to_gripper=True)

    target_ep['poses'] = new_poses.tolist()
    target_ep['raw_poses'] = safe_to_list(getattr(visual_tracker, 'last_raw_trajectory', None), new_poses)
    target_ep['ee_poses'] = ee_poses.tolist()
    actions = np.roll(ee_poses, -1, axis=0)
    actions[-1] = ee_poses[-1]
    target_ep['actions'] = actions.tolist()
    target_ep['dev_video_url'] = dev_video_url
    target_ep['canny_video_url'] = canny_video_url
    target_ep['dev_telemetry'] = dev_telemetry
    target_ep['gripper_offset_applied'] = camera_gripper_calibrator.get_config()
    target_ep['active_smoothing'] = {'method': smooth_method, 'time_window_ms': smooth_window_ms}

    # Re-sync full kinematics (joint_states, robot_ee_poses, fk_table_poses, actions) on filtered poses
    if sync_episode_kinematics(target_ep) is None:
        raise ValueError("Authoritative kinematics validation failed")
    _validate_and_mark_reprocessed_episode(target_ep)
    save_episode_meta(target_ep)

    return JSONResponse({
        "status": "success",
        "episode_index": episode_index,
        "num_frames": len(new_poses),
        "poses": target_ep['poses'],
        "ee_poses": target_ep['ee_poses'],
        "joint_states": target_ep.get('joint_states', []),
        "robot_ee_poses": target_ep.get('robot_ee_poses', []),
        "fk_table_poses": target_ep.get('fk_table_poses', []),
        "fk_camera_poses": target_ep.get('fk_camera_poses', []),
        "dev_video_url": dev_video_url,
        "canny_video_url": canny_video_url
    })

@app.post("/api/episodes/{episode_index}/smooth")
async def smooth_episode_trajectory(episode_index: int, payload: dict = Body(...)):
    """
    Dynamically re-smooths an episode's 3D trajectory using Savitzky-Golay or Moving Average.
    """
    global EPISODES_DB
    target_ep = None
    for ep in EPISODES_DB:
        if ep['episode_index'] == episode_index:
            target_ep = ep
            break

    if not target_ep:
        return JSONResponse({"status": "error", "message": "Episode not found"}, status_code=404)

    raw_poses = target_ep.get('raw_poses') or target_ep.get('poses', [])
    if not raw_poses or len(raw_poses) < 4:
        return JSONResponse({"status": "error", "message": "Insufficient poses to smooth"}, status_code=400)

    method = payload.get('method', 'savgol')
    time_window_ms = int(payload.get('time_window_ms', 250))
    fps = target_ep.get('fps', 30.0)

    if method == "raw":
        smoothed_poses = np.array(raw_poses)
    else:
        smoothed_poses = visual_tracker.smooth_trajectory(
            raw_poses, fps=fps, method=method, time_window_ms=time_window_ms
        )

    ee_poses = camera_gripper_calibrator.transform_trajectory(smoothed_poses, to_gripper=True)
    target_ep['poses'] = smoothed_poses.tolist()
    target_ep['ee_poses'] = ee_poses.tolist()
    target_ep['active_smoothing'] = {'method': method, 'time_window_ms': time_window_ms}

    # Re-sync full kinematics (joint_states, robot_ee_poses, fk_table_poses, actions) on smoothed poses
    sync_episode_kinematics(target_ep)
    save_episode_meta(target_ep)

    return JSONResponse({
        "status": "success",
        "episode_index": episode_index,
        "poses": target_ep['poses'],
        "ee_poses": target_ep['ee_poses'],
        "joint_states": target_ep.get('joint_states', []),
        "robot_ee_poses": target_ep.get('robot_ee_poses', []),
        "fk_table_poses": target_ep.get('fk_table_poses', []),
        "fk_camera_poses": target_ep.get('fk_camera_poses', []),
        "method": method,
        "time_window_ms": time_window_ms
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
    save_episode_meta(target_ep)
    return JSONResponse({
        "status": "success",
        "dev_video_url": dev_video_url,
        "canny_video_url": canny_video_url,
        "dev_telemetry": target_ep.get('dev_telemetry', [])
    })

@app.patch("/api/episodes/{episode_index}/task")
async def update_episode_task(episode_index: int, payload: dict = Body(...)):
    """
    Updates the natural language task instruction for an episode, saving it to disk
    in episode_meta.json and updating the in-memory database.
    """
    global EPISODES_DB
    new_task = str(payload.get("task", "")).strip()
    if not new_task:
        return JSONResponse({"status": "error", "message": "Task prompt cannot be empty"}, status_code=400)

    target_ep = next((e for e in EPISODES_DB if e['episode_index'] == episode_index), None)
    if not target_ep:
        return JSONResponse({"status": "error", "message": "Episode not found"}, status_code=404)

    target_ep['task'] = new_task
    save_episode_meta(target_ep)
    print(f"[{time.strftime('%H:%M:%S')}] 🏷️ Updated Episode #{episode_index} task prompt to: '{new_task}'")
    return JSONResponse({
        "status": "success",
        "episode_index": episode_index,
        "task": new_task
    })

@app.get("/api/robot/config")
async def get_robot_config():
    """
    Returns the current active robot preset, workspace offset calibration (table plane Z=0),
    and Denavit-Hartenberg (DH) parameter specifications for all available presets.
    """
    q3_safe = ROBOT_CONFIG.get("q3_safe_max_deg", 0.0)
    presets = [
        get_robot_specs("so_arm101_omni_kin", q3_safe_max_deg=q3_safe),
        get_robot_specs("so101", q3_safe_max_deg=q3_safe),
        get_robot_specs("so100", q3_safe_max_deg=q3_safe)
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
        _ensure_idle("change robot configuration")
        payload = await request.json()
        for field, minimum, maximum in (
            ("offset_x", -5.0, 5.0), ("offset_y", -5.0, 5.0),
            ("offset_z", -2.0, 2.0), ("yaw_deg", -360.0, 360.0),
            ("q3_safe_max_deg", -180.0, 180.0),
        ):
            if field in payload:
                payload[field] = ensure_finite_number(payload[field], field, minimum, maximum)
        if "robot_type" in payload:
            from robot_kinematics import normalize_robot_type
            r_type = normalize_robot_type(payload["robot_type"])
            if r_type in ROBOT_PRESETS:
                ROBOT_CONFIG["robot_type"] = r_type
                ROBOT_CONFIG["custom_urdf_enabled"] = False
                ROBOT_CONFIG.pop("custom_dh_table", None)
                ROBOT_CONFIG.pop("custom_specs", None)
                ROBOT_CONFIG.pop("custom_urdf", None)
        if "offset_x" in payload:
            ROBOT_CONFIG["offset_x"] = float(payload["offset_x"])
        if "offset_y" in payload:
            ROBOT_CONFIG["offset_y"] = float(payload["offset_y"])
        if "offset_z" in payload:
            ROBOT_CONFIG["offset_z"] = float(payload["offset_z"])
        if "yaw_deg" in payload:
            ROBOT_CONFIG["yaw_deg"] = float(payload["yaw_deg"])
        if "q3_safe_max_deg" in payload:
            ROBOT_CONFIG["q3_safe_max_deg"] = float(payload["q3_safe_max_deg"])
        if "gripper_offset" in payload and isinstance(payload["gripper_offset"], dict):
            if "gripper_offset" not in ROBOT_CONFIG:
                ROBOT_CONFIG["gripper_offset"] = {}
            ROBOT_CONFIG["gripper_offset"].update(payload["gripper_offset"])
            camera_gripper_calibrator.update_config(**payload["gripper_offset"])
        if "gripper_marker_tracking" in payload and isinstance(payload["gripper_marker_tracking"], dict):
            if "gripper_marker_tracking" not in ROBOT_CONFIG:
                ROBOT_CONFIG["gripper_marker_tracking"] = {}
            ROBOT_CONFIG["gripper_marker_tracking"].update(payload["gripper_marker_tracking"])
            visual_tracker.configure_gripper_markers(ROBOT_CONFIG["gripper_marker_tracking"])
        if "base_preset" in payload and isinstance(payload["base_preset"], dict):
            if "base_preset" not in ROBOT_CONFIG:
                ROBOT_CONFIG["base_preset"] = {}
            for k in ("offset_x", "offset_y", "offset_z", "yaw_deg"):
                if k in payload["base_preset"]:
                    ROBOT_CONFIG["base_preset"][k] = float(payload["base_preset"][k])

        r_solver_up = get_robot_solver(
            ROBOT_CONFIG.get("robot_type", "so_arm101_omni_kin"),
            q3_safe_max_deg=ROBOT_CONFIG.get("q3_safe_max_deg", 0.0),
            custom_dh_table=ROBOT_CONFIG.get("custom_dh_table"),
            custom_urdf=ROBOT_CONFIG.get("custom_urdf")
        )
        reach_rad = getattr(r_solver_up, "reach_angle_rad", 0.0)
        ROBOT_CONFIG["reach_angle_deg"] = getattr(r_solver_up, "reach_angle_deg", 0.0)
        save_robot_config(ROBOT_CONFIG)

        workspace_calibrator.update_config(
            offset_x=ROBOT_CONFIG["offset_x"],
            offset_y=ROBOT_CONFIG["offset_y"],
            offset_z=ROBOT_CONFIG["offset_z"],
            yaw_deg=ROBOT_CONFIG["yaw_deg"],
            reach_angle_rad=reach_rad
        )

        lerobot_exporter.set_robot_config(
            robot_type=ROBOT_CONFIG["robot_type"],
            offset_x=ROBOT_CONFIG["offset_x"],
            offset_y=ROBOT_CONFIG["offset_y"],
            offset_z=ROBOT_CONFIG["offset_z"],
            yaw_deg=ROBOT_CONFIG["yaw_deg"],
            q3_safe_max_deg=ROBOT_CONFIG.get("q3_safe_max_deg", 0.0),
            custom_dh_table=ROBOT_CONFIG.get("custom_dh_table")
        )

        updated_count = 0
        if payload.get("apply_to_episodes", False) or payload.get("recalculate", False):
            for ep in EPISODES_DB:
                poses = ep.get("poses") or ep.get("raw_poses", [])
                if poses and len(poses) > 0:
                    sync_episode_kinematics(ep)
                    updated_count += 1

        print(f"[{time.strftime('%H:%M:%S')}] 🤖 Robot Config Updated: Model={ROBOT_CONFIG['robot_type']}, Offset=({ROBOT_CONFIG['offset_x']:.2f}m, {ROBOT_CONFIG['offset_y']:.2f}m, Yaw={ROBOT_CONFIG['yaw_deg']:.1f}°), q3_safe_max={ROBOT_CONFIG.get('q3_safe_max_deg', 0.0)}° (Synced {updated_count} episodes)")

        return JSONResponse({
            "status": "success",
            "message": "Robot configuration updated successfully",
            "config": ROBOT_CONFIG,
            "episodes_updated": updated_count
        })
    except Exception as err:
        return JSONResponse({
            "status": "error",
            "message": f"Failed to update robot configuration: {str(err)}"
        }, status_code=400)

@app.post("/api/robot/gripper_offset")
async def update_gripper_offset_endpoint(request: Request):
    """
    Updates 6-DoF Camera-to-Gripper Extrinsic Offset (Forward, Height, Lateral, Pitch, Roll, Yaw).
    Recalculates stored episode poses only when explicitly requested with
    apply_to_episodes=true; normal preview calibration remains transient.
    """
    global ROBOT_CONFIG, EPISODES_DB
    try:
        _ensure_idle("change gripper calibration")
        payload = await request.json()
        fwd = float(payload.get("forward_cm", 12.8))
        hgt = float(payload.get("height_cm", 10.9))
        lat = float(payload.get("lateral_cm", 0.0))
        pitch = float(payload.get("pitch_deg", 40.4))
        roll = float(payload.get("roll_deg", 0.0))
        yaw = float(payload.get("yaw_deg", 0.0))
        enabled = bool(payload.get("enabled", True))
        if "q3_safe_max_deg" in payload:
            ROBOT_CONFIG["q3_safe_max_deg"] = float(payload["q3_safe_max_deg"])

        camera_gripper_calibrator.update_config(
            forward_cm=fwd,
            height_cm=hgt,
            lateral_cm=lat,
            pitch_deg=pitch,
            roll_deg=roll,
            yaw_deg=yaw,
            enabled=enabled
        )

        if "gripper_offset" not in ROBOT_CONFIG:
            ROBOT_CONFIG["gripper_offset"] = {}
        ROBOT_CONFIG["gripper_offset"].update(camera_gripper_calibrator.get_config())
        save_robot_config(ROBOT_CONFIG)

        apply_to_episodes = bool(payload.get("apply_to_episodes", False))
        updated_count = 0
        if apply_to_episodes:
            for ep in EPISODES_DB:
                poses = ep.get("poses") or ep.get("raw_poses", [])
                if poses and len(poses) > 0:
                    sync_episode_kinematics(ep)
                    save_episode_meta(ep)
                    updated_count += 1

        print(f"[{time.strftime('%H:%M:%S')}] 🦾 Gripper TCP Offset Updated: Pitch={pitch}°, Fwd={fwd}cm, Hgt={hgt}cm, Enabled={enabled} (Applied to {updated_count} episodes)")

        return JSONResponse({
            "status": "success",
            "message": f"Gripper offset updated and applied to {updated_count} episodes",
            "gripper_offset": camera_gripper_calibrator.get_config(),
            "episodes_updated": updated_count,
            "active_ee_poses": EPISODES_DB[0]['ee_poses'] if len(EPISODES_DB) > 0 and 'ee_poses' in EPISODES_DB[0] else []
        })
    except Exception as err:
        return JSONResponse({
            "status": "error",
            "message": f"Failed to update gripper offset: {str(err)}"
        }, status_code=400)

@app.post("/api/robot/recalculate_trajectory")
async def recalculate_trajectory_endpoint(request: Request):
    """
    Recalculates 3D end-effector TCP trajectories, action vectors, and inverse kinematics
    feasibility for recorded episodes based on the latest active robot setup (placement offset,
    gripper extrinsic calibration, initial standby position, and robot model DH specs).
    """
    global ROBOT_CONFIG, EPISODES_DB
    try:
        payload = await request.json() if request.headers.get("content-type") == "application/json" else {}
    except Exception:
        payload = {}

    try:
        # 1. Optionally apply updated config from payload if provided
        new_config = payload.get("robot_config") or payload.get("config")
        if new_config and isinstance(new_config, dict):
            if "robot_type" in new_config:
                from robot_kinematics import normalize_robot_type
                r_type = normalize_robot_type(new_config["robot_type"])
                if r_type in ROBOT_PRESETS:
                    ROBOT_CONFIG["robot_type"] = r_type
            if "offset_x" in new_config:
                ROBOT_CONFIG["offset_x"] = float(new_config["offset_x"])
            if "offset_y" in new_config:
                ROBOT_CONFIG["offset_y"] = float(new_config["offset_y"])
            if "offset_z" in new_config:
                ROBOT_CONFIG["offset_z"] = float(new_config["offset_z"])
            if "yaw_deg" in new_config:
                ROBOT_CONFIG["yaw_deg"] = float(new_config["yaw_deg"])
            if "q3_safe_max_deg" in new_config:
                ROBOT_CONFIG["q3_safe_max_deg"] = float(new_config["q3_safe_max_deg"])
            if "initial_position" in new_config:
                ROBOT_CONFIG["initial_position"] = new_config["initial_position"]
            if "gripper_offset" in new_config and isinstance(new_config["gripper_offset"], dict):
                if "gripper_offset" not in ROBOT_CONFIG:
                    ROBOT_CONFIG["gripper_offset"] = {}
                ROBOT_CONFIG["gripper_offset"].update(new_config["gripper_offset"])
                camera_gripper_calibrator.update_config(**new_config["gripper_offset"])

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
                yaw_deg=ROBOT_CONFIG["yaw_deg"],
                q3_safe_max_deg=ROBOT_CONFIG.get("q3_safe_max_deg", 0.0)
            )

        # 2. Determine target episodes to recalculate
        ep_idx = payload.get("episode_index")
        target_episodes = []
        if ep_idx is not None and not payload.get("all_episodes", False):
            for ep in EPISODES_DB:
                if ep.get("episode_index") == int(ep_idx):
                    target_episodes.append(ep)
                    break
        if not target_episodes:
            target_episodes = list(EPISODES_DB)

        if not target_episodes:
            return JSONResponse({
                "status": "success",
                "message": "No episodes to recalculate",
                "episodes_updated": 0,
                "config": ROBOT_CONFIG
            })

        # 3. Solver for IK evaluation
        r_solver = get_robot_solver(
            ROBOT_CONFIG.get("robot_type", "so_arm101_omni_kin"),
            q3_safe_max_deg=ROBOT_CONFIG.get("q3_safe_max_deg", 0.0),
            custom_dh_table=ROBOT_CONFIG.get("custom_dh_table"),
            custom_urdf=ROBOT_CONFIG.get("custom_urdf")
        )
        workspace_calibrator.reach_angle_rad = getattr(r_solver, "reach_angle_rad", 0.0)

        updated_count = 0
        for ep in target_episodes:
            base_poses = ep.get("raw_poses") or ep.get("poses", [])
            if not base_poses or len(base_poses) == 0:
                continue

            target_calib = None
            if new_config and isinstance(new_config, dict) and any(k in new_config for k in ("offset_x", "offset_y", "offset_z", "yaw_deg")):
                target_calib = {
                    "offset_x": float(new_config.get("offset_x", ROBOT_CONFIG["offset_x"])),
                    "offset_y": float(new_config.get("offset_y", ROBOT_CONFIG["offset_y"])),
                    "offset_z": float(new_config.get("offset_z", ROBOT_CONFIG["offset_z"])),
                    "yaw_deg": float(new_config.get("yaw_deg", ROBOT_CONFIG["yaw_deg"])),
                    "reach_angle_rad": getattr(r_solver, "reach_angle_rad", 0.0)
                }

            # Full kinematics sync: ee_poses, joint_states, robot_ee_poses, actions (FK-synchronized)
            sync_episode_kinematics(ep, calib=target_calib)
            updated_count += 1

        print(f"[{time.strftime('%H:%M:%S')}] 🔄 Recalculated trajectories for {updated_count} episode(s) based on active robot setup: {ROBOT_CONFIG.get('robot_type')} @ ({ROBOT_CONFIG.get('offset_x')}m, {ROBOT_CONFIG.get('offset_y')}m, Yaw={ROBOT_CONFIG.get('yaw_deg')}°)")

        return JSONResponse({
            "status": "success",
            "message": f"Successfully recalculated trajectory for {updated_count} episode(s)",
            "episodes_updated": updated_count,
            "config": ROBOT_CONFIG,
            "episodes": EPISODES_DB
        })
    except Exception as err:
        print(f"[{time.strftime('%H:%M:%S')}] ❌ Error recalculating trajectory: {err}")
        return JSONResponse({
            "status": "error",
            "message": f"Failed to recalculate trajectory: {str(err)}"
        }, status_code=400)

@app.post("/api/robot/auto_align")
async def auto_align_robot_endpoint(request: Request):
    """
    Automatically aligns the robot base position (offset_x, offset_y, yaw) relative to an episode's trajectory.
    Modes:
      - 'start': Places robot so the gripper begins directly at the first trajectory waypoint.
      - 'optimal': Positions robot centered relative to the whole trajectory to maximize reachability.
    """
    global ROBOT_CONFIG
    try:
        _ensure_idle("auto-align the robot base")
        payload = await request.json()
        mode = str(payload.get("mode", "optimal")).lower()
        ep_id = payload.get("episode_id")

        target_ep = None
        if ep_id is not None and str(ep_id).strip() != "":
            target_ep = next((ep for ep in EPISODES_DB if str(ep.get("episode_id")) == str(ep_id)
                              or str(ep.get("episode_index")) == str(ep_id)), None)
        if not target_ep and EPISODES_DB:
            target_ep = EPISODES_DB[-1]

        # Preset mode: applies user-adjusted preset (defaults to recommended layout: X=0.038, Y=-0.406, Yaw=90)
        if mode in ("preset", "recommended"):
            preset = ROBOT_CONFIG.get("base_preset") or {
                "offset_x": 0.038,
                "offset_y": -0.406,
                "offset_z": 0.00,
                "yaw_deg": 90.0
            }
            workspace_calibrator.update_config(
                offset_x=float(preset.get("offset_x", 0.038)),
                offset_y=float(preset.get("offset_y", -0.406)),
                offset_z=float(preset.get("offset_z", 0.00)),
                yaw_deg=float(preset.get("yaw_deg", 90.0))
            )
            new_calib = workspace_calibrator.get_config()
        elif not target_ep:
            return JSONResponse({"status": "error", "message": "No episodes available to align to."}, status_code=400)
        else:
            # Prioritize Gripper TCP trajectory (ee_poses) so robot base aligns to where the robot must reach.
            poses = target_ep.get("ee_poses") or target_ep.get("poses")
            if not poses or len(poses) == 0:
                return JSONResponse({"status": "error", "message": "Selected episode has no poses."}, status_code=400)
            poses_arr = np.asarray(poses, dtype=np.float64)
            if poses_arr.ndim != 2 or poses_arr.shape[1] < 3 or not np.isfinite(poses_arr[:, :3]).all():
                return JSONResponse({"status": "error", "message": "Selected episode contains invalid pose data."}, status_code=400)

        r_solver = get_robot_solver(
            ROBOT_CONFIG.get("robot_type", "so_arm101_omni_kin"),
            q3_safe_max_deg=ROBOT_CONFIG.get("q3_safe_max_deg", 0.0),
            custom_dh_table=ROBOT_CONFIG.get("custom_dh_table"),
            custom_urdf=ROBOT_CONFIG.get("custom_urdf")
        )
        reach_rad = getattr(r_solver, "reach_angle_rad", 0.0)
        ROBOT_CONFIG["reach_angle_deg"] = getattr(r_solver, "reach_angle_deg", 0.0)

        if mode == "optimal":
            new_calib = workspace_calibrator.auto_align_to_trajectory(poses_arr, nominal_reach=0.24, default_yaw=90.0)
        elif mode == "start":
            new_calib = workspace_calibrator.auto_align_base_to_start(poses_arr[0], nominal_reach=0.22, default_yaw=90.0)
        elif mode not in ("preset", "recommended"):
            return JSONResponse({"status": "error", "message": f"Unsupported auto-align mode: {mode}"}, status_code=400)

        # get_config() includes the previous reach angle. Replace it with the
        # active solver's value before passing the calibration exactly once.
        calibrated_config = dict(new_calib)
        calibrated_config["reach_angle_rad"] = reach_rad
        ROBOT_CONFIG.update(calibrated_config)
        workspace_calibrator.update_config(**calibrated_config)
        save_robot_config(ROBOT_CONFIG)

        lerobot_exporter.set_robot_config(
            robot_type=ROBOT_CONFIG["robot_type"],
            offset_x=ROBOT_CONFIG["offset_x"],
            offset_y=ROBOT_CONFIG["offset_y"],
            offset_z=ROBOT_CONFIG["offset_z"],
            yaw_deg=ROBOT_CONFIG["yaw_deg"],
            q3_safe_max_deg=ROBOT_CONFIG.get("q3_safe_max_deg", 0.0)
        )

        # Recalculate kinematics for target episode (and all episodes if requested)
        feasibility = None
        if target_ep:
            feasibility = sync_episode_kinematics(target_ep, calib=calibrated_config)

        if payload.get("all_episodes", False):
            for ep in EPISODES_DB:
                if ep != target_ep:
                    if mode == "optimal":
                        ep_poses = ep.get("ee_poses") or ep.get("poses")
                        if ep_poses and len(ep_poses) > 0:
                            ep_arr = np.asarray(ep_poses, dtype=np.float64)
                            if ep_arr.ndim == 2 and ep_arr.shape[1] >= 3 and np.isfinite(ep_arr[:, :3]).all():
                                ep_opt = workspace_calibrator.auto_align_to_trajectory(ep_arr, nominal_reach=0.24, default_yaw=90.0)
                                ep_calib = dict(ep_opt)
                                ep_calib["reach_angle_rad"] = reach_rad
                                sync_episode_kinematics(ep, calib=ep_calib)
                                continue
                    sync_episode_kinematics(ep, calib=calibrated_config if mode != "optimal" else None)

        feas_pct = feasibility.get("feasible_percent") if feasibility else None
        avg_err = feasibility.get("avg_error_cm") if feasibility else None
        print(f"[{time.strftime('%H:%M:%S')}] 🎯 Auto-Aligned Robot Base ({mode}): Offset=({ROBOT_CONFIG['offset_x']:.3f}m, {ROBOT_CONFIG['offset_y']:.3f}m, Yaw={ROBOT_CONFIG['yaw_deg']}°) & Synced Kinematics (Feasible={feas_pct}%)")
        return JSONResponse({
            "status": "success",
            "message": f"Robot base calibration applied and kinematics synced ({mode})",
            "config": ROBOT_CONFIG,
            "feasibility_percent": feas_pct,
            "avg_error_cm": avg_err,
            "episode_id": target_ep.get("episode_id") if target_ep else None,
            "episode_index": target_ep.get("episode_index") if target_ep else None
        })
    except Exception as err:
        return JSONResponse({
            "status": "error",
            "message": f"Auto-align failed: {str(err)}"
        }, status_code=400)

@app.post("/api/trajectory/approach_path")
async def get_approach_path_endpoint(request: Request):
    """
    Calculates a collision-safe, C^2 smooth quintic minimum-jerk approach path
    from the robot's canonical Initial Position (Home) to the demonstration starting point.
    """
    global ROBOT_CONFIG, EPISODES_DB
    try:
        payload = await request.json()
        ep_id = payload.get("episode_id")
        duration_s = float(payload.get("duration_s", 1.5))
        fps = float(payload.get("fps", 30.0))

        target_ep = None
        if ep_id:
            target_ep = next((ep for ep in EPISODES_DB if ep.get("episode_id") == ep_id), None)
        if not target_ep and EPISODES_DB:
            target_ep = EPISODES_DB[-1]

        if not target_ep:
            return JSONResponse({"status": "error", "message": "No episodes available to plan approach for."}, status_code=400)

        poses = target_ep.get("ee_poses") or target_ep.get("poses")
        if not poses or len(poses) == 0:
            return JSONResponse({"status": "error", "message": "Selected episode has no poses."}, status_code=400)

        auto_trim = bool(payload.get("auto_trim", True))

        # Synchronize planner instances
        r_solver = get_robot_solver(ROBOT_CONFIG.get("robot_type", "so_arm101_omni_kin"), q3_safe_max_deg=ROBOT_CONFIG.get("q3_safe_max_deg", 0.0))
        trajectory_planner.solver = r_solver
        trajectory_planner.workspace_calibrator = workspace_calibrator
        trajectory_planner.camera_gripper_calibrator = camera_gripper_calibrator

        idx_start = 0
        if auto_trim and len(poses) > 15:
            poses_arr = np.asarray(poses, dtype=np.float64)
            robot_poses = workspace_calibrator.transform_trajectory(poses_arr, to_robot=True)
            f_start, f_end = find_feasible_window(robot_poses, r_solver)
            if f_start < len(poses):
                idx_start = f_start

        p_start_aruco = poses[idx_start]
        start_gripper = target_ep.get("gripper_states", [100.0])[idx_start] if target_ep.get("gripper_states") else 100.0

        # Resolve canonical initial position
        init_cfg = dict(ROBOT_CONFIG.get("initial_position", DEFAULT_INITIAL_POSITION))
        if "initial_position" in payload and isinstance(payload["initial_position"], dict):
            init_cfg.update(payload["initial_position"])

        p_home_robot = np.array([
            float(init_cfg.get("x", DEFAULT_INITIAL_POSITION.get("x", 0.24))),
            float(init_cfg.get("y", DEFAULT_INITIAL_POSITION.get("y", 0.00))),
            float(init_cfg.get("z", DEFAULT_INITIAL_POSITION.get("z", 0.20))),
            np.radians(float(init_cfg.get("roll_deg", DEFAULT_INITIAL_POSITION.get("roll_deg", 0.0)))),
            np.radians(float(init_cfg.get("pitch_deg", DEFAULT_INITIAL_POSITION.get("pitch_deg", -20.0)))),
            np.radians(float(init_cfg.get("yaw_deg", DEFAULT_INITIAL_POSITION.get("yaw_deg", 0.0))))
        ], dtype=np.float64)
        home_gripper = float(init_cfg.get("gripper", 100.0))

        approach_res = trajectory_planner.plan_approach_path(
            p_start=p_start_aruco,
            p_home=p_home_robot,
            duration_s=duration_s,
            fps=fps,
            lift_clearance_m=0.06,
            home_gripper=home_gripper,
            start_gripper=start_gripper,
            start_in_robot_frame=False
        )

        return JSONResponse({
            "status": "success",
            "mode": "initial_aware",
            "approach": approach_res,
            "initial_position": init_cfg,
            "trimmed_start_frame": idx_start
        })
    except Exception as err:
        return JSONResponse({
            "status": "error",
            "message": f"Approach path planning failed: {str(err)}"
        }, status_code=400)

@app.get("/api/robot/initial_position")
async def get_initial_position_endpoint():
    """Returns the canonical Initial Position (Home/Standby Pose) configuration."""
    return JSONResponse({
        "status": "success",
        "initial_position": ROBOT_CONFIG.get("initial_position", DEFAULT_INITIAL_POSITION)
    })

@app.post("/api/robot/initial_position")
async def update_initial_position_endpoint(request: Request):
    """Updates the canonical Initial Position (Home/Standby Pose) configuration."""
    global ROBOT_CONFIG
    try:
        payload = await request.json()
        if "initial_position" not in ROBOT_CONFIG:
            ROBOT_CONFIG["initial_position"] = dict(DEFAULT_INITIAL_POSITION)
        ROBOT_CONFIG["initial_position"].update(payload)
        save_robot_config(ROBOT_CONFIG)
        return JSONResponse({
            "status": "success",
            "message": "Robot initial position updated successfully",
            "initial_position": ROBOT_CONFIG["initial_position"]
        })
    except Exception as err:
        return JSONResponse({
            "status": "error",
            "message": f"Failed to update initial position: {str(err)}"
        }, status_code=400)

@app.post("/api/robot/solve_ik")
async def solve_ik_endpoint(request: Request):
    """
    Solves robust Inverse Kinematics for a 6-DoF target pose or batch trajectory.
    Handles out-of-reach clamping, joint limits, and tabletop collision.
    """
    try:
        payload = await request.json()
        r_solver = get_robot_solver(ROBOT_CONFIG.get("robot_type", "so101"), q3_safe_max_deg=ROBOT_CONFIG.get("q3_safe_max_deg", 0.0))
        in_robot_frame = payload.get("in_robot_frame", False)

        if "pose" in payload:
            pose = np.asarray(payload["pose"], dtype=np.float64)
            if not in_robot_frame:
                pose = workspace_calibrator.aruco_to_robot(pose)
            res = r_solver.solve_feasible_ik(pose)
            achieved_aruco = workspace_calibrator.robot_to_aruco(res["achieved_pose"])
            return JSONResponse({
                "status": "success",
                "joints": [round(float(q), 2) for q in res["joints"]],
                "achieved_pose": [round(float(v), 4) for v in res["achieved_pose"]],
                "achieved_aruco": [round(float(v), 4) for v in achieved_aruco],
                "is_feasible": res["is_feasible"],
                "error_distance_cm": res["error_distance_cm"],
                "clamped_reasons": res["clamped_reasons"]
            })
        elif "trajectory" in payload:
            traj = np.asarray(payload["trajectory"], dtype=np.float64)
            if not in_robot_frame:
                traj = workspace_calibrator.transform_trajectory(traj, to_robot=True)
            results = [r_solver.solve_feasible_ik(p) for p in traj]
            return JSONResponse({
                "status": "success",
                "results": [
                    {
                        "joints": [round(float(q), 2) for q in r["joints"]],
                        "is_feasible": r["is_feasible"],
                        "error_distance_cm": r["error_distance_cm"],
                        "clamped_reasons": r["clamped_reasons"]
                    } for r in results
                ]
            })
        return JSONResponse({"status": "error", "message": "No pose or trajectory provided."}, status_code=400)
    except Exception as err:
        return JSONResponse({"status": "error", "message": f"IK solving failed: {str(err)}"}, status_code=400)

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
        reject_unsafe_xml(urdf_text)

        q3_safe = ROBOT_CONFIG.get("q3_safe_max_deg", 0.0)
        dh_table, specs = URDFParser.parse_urdf(urdf_text, q3_safe_max_deg=q3_safe)
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
        _ensure_idle("apply a URDF")
        payload = await request.json()
        urdf_text = payload.get("urdf_text", "")
        reject_unsafe_xml(urdf_text)
        q3_safe = ROBOT_CONFIG.get("q3_safe_max_deg", 0.0)
        dh_table, specs = URDFParser.parse_urdf(urdf_text, q3_safe_max_deg=q3_safe)
        robot_name = specs.get("robot_name", "custom_robot").lower()

        ROBOT_CONFIG["custom_dh_table"] = dh_table
        ROBOT_CONFIG["custom_specs"] = specs
        ROBOT_CONFIG["custom_urdf"] = urdf_text
        ROBOT_CONFIG["custom_urdf_enabled"] = True
        r_solver_urdf = get_robot_solver(custom_urdf=urdf_text, q3_safe_max_deg=q3_safe)
        reach_rad = getattr(r_solver_urdf, "reach_angle_rad", 0.0)
        ROBOT_CONFIG["reach_angle_deg"] = getattr(r_solver_urdf, "reach_angle_deg", 0.0)
        workspace_calibrator.reach_angle_rad = reach_rad
        save_robot_config(ROBOT_CONFIG)

        print(f"[{time.strftime('%H:%M:%S')}] ⚙️ Applied custom URDF kinematics: {robot_name} ({specs['reach_meters']}m reach, reach_angle={ROBOT_CONFIG['reach_angle_deg']}°)")

        return JSONResponse({
            "status": "success",
            "message": f"Custom URDF '{robot_name}' applied successfully",
            "dh_table": dh_table,
            "specs": specs,
            "config": ROBOT_CONFIG
        })
    except Exception as err:
        return JSONResponse({
            "status": "error",
            "message": f"Failed to apply URDF: {str(err)}"
        }, status_code=400)

@app.post("/api/export_lerobot")
@app.post("/api/export/lerobot")
async def export_lerobot(request: Request = None):
    if not EPISODES_DB:
        return JSONResponse({"status": "error", "message": "No episodes recorded yet. Please record or sample an episode first."}, status_code=400)

    try:
        unverified = [ep.get("episode_id", ep.get("episode_index")) for ep in EPISODES_DB
                      if ep.get("manifest", {}).get("validation", {}).get("state") != "passed"]
        if unverified:
            return JSONResponse({"status": "error", "message": "Reprocess legacy or failed episodes before export", "episodes": unverified}, status_code=409)
        payload = {}
        if request:
            try:
                payload = await request.json()
            except Exception:
                payload = {}
        traj_mode = payload.get("trajectory_mode", "free_form")
        init_pos = payload.get("initial_position", ROBOT_CONFIG.get("initial_position"))
        auto_trim = payload.get("auto_trim", True)

        # Sync latest configuration
        lerobot_exporter.set_robot_config(
            robot_type=ROBOT_CONFIG["robot_type"],
            offset_x=ROBOT_CONFIG["offset_x"],
            offset_y=ROBOT_CONFIG["offset_y"],
            offset_z=ROBOT_CONFIG["offset_z"],
            yaw_deg=ROBOT_CONFIG["yaw_deg"],
            q3_safe_max_deg=ROBOT_CONFIG.get("q3_safe_max_deg", 0.0),
            custom_dh_table=ROBOT_CONFIG.get("custom_dh_table"),
            custom_urdf=ROBOT_CONFIG.get("custom_urdf")
        )
        use_ts = bool(payload.get("use_timestamp", True))
        ds_name = dataset_slug(payload.get("dataset_name", "mobile_aruco_3d_trajectories"))

        # Ensure each episode has its own workspace calibration and synchronized kinematics
        for ep in EPISODES_DB:
            if not ep.get("workspace_calibration") or ep.get("joint_states") is None:
                print(f"[{time.strftime('%H:%M:%S')}] 🔄 Auto-syncing kinematics for episode {ep.get('episode_id', '?')} before export...")
                sync_episode_kinematics(ep)

        export_path = lerobot_exporter.export_dataset(
            EPISODES_DB,
            dataset_name=ds_name,
            trajectory_mode=traj_mode,
            initial_position=init_pos,
            auto_trim=auto_trim,
            use_timestamp=use_ts
        )
        export_folder = os.path.basename(export_path)
        with open(os.path.join(export_path, "validation_report.json"), "r", encoding="utf-8") as report_file:
            validation_report = json.load(report_file)
        total_frames = validation_report["frames"]
        return JSONResponse({
            "status": "success",
            "export_path": export_path,
            "export_folder": export_folder,
            "robot_type": ROBOT_CONFIG["robot_type"],
            "trajectory_mode": traj_mode,
            "auto_trim": auto_trim,
            "workspace_calibration": ROBOT_CONFIG,
            "total_episodes": len(EPISODES_DB),
            "total_frames": total_frames,
            "validation_report": os.path.join(export_path, "validation_report.json"),
            "validation": validation_report,
            "message": f"LeRobot dataset version '{export_folder}' exported successfully with {len(EPISODES_DB)} episodes!"
        })
    except Exception as err:
        import traceback
        traceback.print_exc()
        return JSONResponse({
            "status": "error",
            "message": f"LeRobot export failed: {str(err)}"
        }, status_code=500)

def _resolve_client_host(request: Request, override_host: str = None) -> str:
    """
    Resolves client host preference:
    1. override_host query parameter if supplied.
    2. Incoming Host / X-Forwarded-Host header if valid non-loopback.
    3. Server's detected local LAN IP.
    """
    if override_host and override_host.strip():
        cand = override_host.strip().split(":")[0]
        if cand and cand.lower() not in ("localhost", "127.0.0.1", "0.0.0.0", "::1"):
            return cand

    host_header = request.headers.get("x-forwarded-host") or request.headers.get("host")
    if host_header:
        cand = host_header.strip().split(":")[0]
        if cand and cand.lower() not in ("localhost", "127.0.0.1", "0.0.0.0", "::1"):
            return cand

    return get_local_ip()

@app.get("/api/server/info")
async def get_server_info(request: Request):
    """
    Returns server network configuration, local IP, and mobile URLs.
    """
    local_ip = _resolve_client_host(request)
    ssl_cert = os.path.join(BASE_DIR, "cert.pem")
    ssl_key = os.path.join(BASE_DIR, "key.pem")
    has_ssl = os.path.exists(ssl_cert) and os.path.exists(ssl_key)
    return JSONResponse({
        "local_ip": local_ip,
        "http_port": 8000,
        "https_port": 8443 if has_ssl else 8000,
        "has_ssl": has_ssl,
        "mobile_url": (f"https://{local_ip}:8443/mobile?pair={PAIRING_TOKEN}" if has_ssl
                       else f"http://{local_ip}:8000/mobile?pair={PAIRING_TOKEN}"),
        # The dashboard is an operator surface on a trusted LAN. The value is
        # deliberately supplied only for QR/session bootstrap, never persisted.
        "pairing_code": PAIRING_TOKEN,
    })


@app.get("/api/pairing/session")
async def create_pairing_session(code: str = ""):
    if not code or not secrets.compare_digest(code, PAIRING_TOKEN):
        return JSONResponse({"status": "error", "message": "Invalid pairing code"}, status_code=401)
    return JSONResponse({"status": "success", "operator_token": PAIRING_TOKEN})

@app.get("/api/mobile/qr")
async def get_mobile_qr(request: Request, host: str = None):
    """
    Generates an SVG QR code pointing directly to the mobile camera URL.
    """
    try:
        import qrcode
        import qrcode.image.svg

        local_ip = _resolve_client_host(request, override_host=host)
        ssl_cert = os.path.join(BASE_DIR, "cert.pem")
        ssl_key = os.path.join(BASE_DIR, "key.pem")
        has_ssl = os.path.exists(ssl_cert) and os.path.exists(ssl_key)
        mobile_url = (f"https://{local_ip}:8443/mobile?pair={PAIRING_TOKEN}" if has_ssl
                      else f"http://{local_ip}:8000/mobile?pair={PAIRING_TOKEN}")

        factory = qrcode.image.svg.SvgImage
        img = qrcode.make(mobile_url, image_factory=factory)
        svg_content = img.to_string()
        return Response(content=svg_content, media_type="image/svg+xml")
    except ImportError:
        import traceback
        traceback.print_exc()
        svg_err = (
            '<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220">'
            '<rect width="220" height="220" fill="#f8fafc" rx="12"/>'
            '<text x="110" y="90" font-family="sans-serif" font-size="13" font-weight="bold" fill="#ef4444" text-anchor="middle">qrcode library missing</text>'
            '<text x="110" y="120" font-family="monospace" font-size="11" fill="#475569" text-anchor="middle">pip install qrcode</text>'
            '<text x="110" y="145" font-family="sans-serif" font-size="10" fill="#64748b" text-anchor="middle">Use URL link below to connect</text>'
            '</svg>'
        )
        return Response(content=svg_err, media_type="image/svg+xml", status_code=200)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse({"error": str(e)}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    import sys
    import threading
    import logging
    import copy

    class EndpointLogFilter(logging.Filter):
        """Filter out noisy polling endpoints (e.g. /api/processing/status) from uvicorn access logs."""
        def filter(self, record: logging.LogRecord) -> bool:
            if hasattr(record, "args") and isinstance(record.args, tuple) and len(record.args) >= 3:
                req_path = str(record.args[2])
                if any(noisy in req_path for noisy in [
                    "/api/processing/status",
                    "/api/mobile/qr",
                    "/favicon.ico"
                ]):
                    return False
            msg = record.getMessage()
            if any(noisy in msg for noisy in ["/api/processing/status", "/api/mobile/qr", "/favicon.ico"]):
                return False
            return True

    clean_log_config = copy.deepcopy(uvicorn.config.LOGGING_CONFIG)
    clean_log_config["filters"] = {
        "endpoint_filter": {
            "()": EndpointLogFilter,
        }
    }
    clean_log_config["handlers"]["access"]["filters"] = ["endpoint_filter"]

    local_ip = get_local_ip()

    ssl_cert = os.path.join(BASE_DIR, "cert.pem")
    ssl_key = os.path.join(BASE_DIR, "key.pem")
    has_certs = os.path.exists(ssl_cert) and os.path.exists(ssl_key)

    # Auto-generate SSL certificates if missing to support mobile camera/sensor access
    if not has_certs and ("--no-ssl" not in sys.argv):
        try:
            from generate_cert import generate_ssl_certificate
            print("[*] SSL certificates missing. Auto-generating self-signed cert.pem and key.pem...")
            generate_ssl_certificate(cert_path=ssl_cert, key_path=ssl_key)
            has_certs = os.path.exists(ssl_cert) and os.path.exists(ssl_key)
        except Exception as e:
            print(f"[!] Note: Could not auto-generate SSL certificates ({e}).")
            print("    Run 'python generate_cert.py' or 'pip install cryptography' to enable HTTPS.")

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
        print(f" Print Dual-ArUco Board:    http://localhost:{http_port}/api/marker/print_dual")
        print(f" Print Gripper Markers:     http://localhost:{http_port}/api/marker/print_gripper")
        print(f" Mobile QR Code:            http://localhost:{http_port}/api/mobile/qr")
        print("\n [!] HTTPS Active on Port 8443 (Self-Signed SSL for Camera/IMU):")
        print("     When opening on your mobile browser, tap:")
        print(f"     - Android Chrome: 'Advanced' -> 'Proceed to {local_ip} (unsafe)'")
        print("     - iOS Safari:     'Show Details' -> 'visit this website' -> 'Visit Website'")
    else:
        print(f" 📱 Phone Mobile URL:        http://{local_ip}:{http_port}/mobile")
        print(f" Print Dual-ArUco Board:    http://localhost:{http_port}/api/marker/print_dual")
        print(f" Print Gripper Markers:     http://localhost:{http_port}/api/marker/print_gripper")
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
                log_level="warning",
                log_config=clean_log_config
            )
            server_ssl = uvicorn.Server(config_ssl)
            server_ssl.run()

        ssl_thread = threading.Thread(target=run_https, daemon=True)
        ssl_thread.start()

        # Run HTTP on port 8000 in the main thread
        uvicorn.run(app, host="0.0.0.0", port=http_port, log_level="info", log_config=clean_log_config)
    else:
        uvicorn.run(app, host="0.0.0.0", port=http_port, log_level="info", log_config=clean_log_config)
