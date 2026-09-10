# CONTINUITY.md — Mobile Dataset Collector
**Last updated**: 2026-09-10

This document records the current system state, architectural decisions, and next steps for contributors or future sessions.

---

## Current State

All core phases are implemented and verified. The system is production-ready for data collection and LeRobot export.

### Implemented

| Phase | Status | Description |
|-------|--------|-------------|
| ArUco tracking + EKF | Done | Dual-tag 8-point PnP, 12-state EKF, UMI occlusion spline |
| Mobile capture UI | Done | 720p 30fps, 100Hz IMU, adaptive codec (H.264 priority) |
| Robot IK engine | Done | DH chain, 5-DOF solver, workspace + camera calibration |
| Universal generalization | Done | Dynamic wrist pitch index, 3D Euclidean clearance, auto collision sign |
| Camera crash prevention | Done | `q3_safe_max_deg` limits + asymmetric penalty + 3D clearance penalty |
| Two trajectory modes | Done | `free_form` (pretraining) and `initial_aware` (fine-tuning, approach spline) |
| 3D visualization | Done | Three.js arm preview, no box meshes, focal sphere camera node |
| LeRobot export | Done | Audited and fixed: dynamic joint names, float32 precision, all invariants verified |
| URDF parsing | Done | Any 5-6 DOF URDF -> DH table + joint names auto-extracted |

---

## Architecture Summary

```
Phone (browser)
  MobileLogger.jsx  --(WebSocket/HTTP)-->  server.py (FastAPI :8000)
                                           |-- VisualInertialTracker  (visual_tracker.py)
                                           |-- WorkspaceCalibrator    (robot_kinematics.py)
                                           |-- CameraGripperCalibrator
                                           |-- TrajectoryPlanner
                                           |-- LeRobotExporter        (lerobot_exporter.py)
                                           `-- EPISODES_DB

Desktop (browser)
  Dashboard.jsx      -- episode manager, export controls
  Viewport3D.jsx     -- Three.js 3D preview, JS IK solver
  RobotSetupModal    -- URDF upload, workspace offsets, wrist safety, initial position
```

Config is persisted in `robot_config.json` and reloaded on server restart.

---

## Key Invariants (Verified)

- `action[i] == joint_states[i+1]` for all frames except last
- `action[-1] == joint_states[-1]` (terminal copy)
- `next.done=True` exactly once per episode (last frame only)
- `episode_index` sequential 0-based; `frame_index` resets per episode
- `index` globally monotonic across all episodes
- Joint feature names in `info.json` derived from DH table (not hardcoded)
- Wrist pitch clamping uses dynamic `wrist_pitch_idx` (not hardcoded column 3)
- Camera crash prevention correct for both standard (+1) and inverted (-1) axis arms

---

## Open Items

| Item | Priority | Notes |
|------|----------|-------|
| H.264 video re-encode | Medium | Exported MP4 uses `mp4v`; re-encode with `ffmpeg -vcodec libx264` for browser playback |
| 6-DOF URDF support | Low | Currently maps 6-DOF to 5-DOF DH; last DOF is discarded |
| LeRobot policy training integration | Future | Pass exported dataset to ACT/Diffusion Policy trainer |

---

## Environment

| Env | Path | Python | Use |
|-----|------|--------|-----|
| `lerobot_collector` | `C:\Users\SK\miniconda3\envs\lerobot_collector` | 3.10 | Server + exporter |

Key packages: `fastapi`, `uvicorn`, `numpy`, `scipy`, `pandas`, `pyarrow`, `opencv-python`, `jinja2`

Frontend: Node 18+, React 18, Three.js 0.160, Vite 5, Tailwind CSS 3

---

## Running the System

```bash
# Backend (always required)
C:\Users\SK\miniconda3\envs\lerobot_collector\python.exe server.py

# Frontend dev server (optional, for development only)
cd frontend && npm run dev

# Rebuild frontend for production
cd frontend && npm run build
```

URLs:
- Dashboard: `http://localhost:8000` (prod) or `http://localhost:3000` (dev)
- Phone logger: `http://<LAN_IP>:8000/mobile`
- ArUco print sheet: `http://localhost:8000/api/marker/print_dual`

---

## Test Suite

```bash
C:\Users\SK\miniconda3\envs\lerobot_collector\python.exe test_aruco_pipeline.py
C:\Users\SK\miniconda3\envs\lerobot_collector\python.exe test_robot_kinematics.py
C:\Users\SK\miniconda3\envs\lerobot_collector\python.exe test_pipeline.py
C:\Users\SK\miniconda3\envs\lerobot_collector\python.exe test_urdf_converter.py
```
