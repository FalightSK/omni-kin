# Continuity Plan & Roadmap - Mobile Trajectory Collector

This document outlines the continuity plan, architectural decisions, and future extension milestones for scaling the **Mobile Smartphone Trajectory Collector & LeRobot Exporter**.

---

## 📌 Current Accomplishments (Phase 1)

*   [x] **Mobile Capture Interface**: HTML5/FastAPI web interface capturing camera video stream + high-frequency IMU sensor events (`DeviceMotionEvent`) over local Wi-Fi.
*   [x] **Target Robot Embodiment**: Kinematics solver for **SO-100** (5-DoF + Gripper arm) with forward/inverse kinematics and workspace mapping (`robot_kinematics.py`).
*   [x] **Trajectory Processing**: IMU sensor fusion, orientation smoothing, gravity removal, and trajectory interpolation (`trajectory_estimator.py`).
*   [x] **LeRobot Dataset Standard Exporter**: Writes Parquet files, `info.json`, `stats.json`, episode lookup tables, and MP4 video streams matching Hugging Face LeRobot v3.0 schema (`lerobot_exporter.py`).
*   [x] **Desktop Dashboard**: Three.js 3D trajectory visualizer and episode manager (`templates/index.html`).
*   [x] **Simulation Replay**: NVIDIA Isaac Lab 3D physics simulation replay bridge (`isaac_lab_replay.py`).

---

## 🛣️ Development Roadmap (Phase 2 & Beyond)

### Phase 2: Hardware Extensions & Precise Scale Calibration
1. **GoPro Wide-Angle / Fisheye Support**:
   - Integrate GoPro Hero video + 200 Hz IMU telemetry logging (via `gpmf-parser` or `telemetry-parser`).
   - Run Visual-Inertial SLAM (ORB-SLAM3 VI-SLAM) to recover exact metric scale (meters) for rapid dynamic human demonstrations.
2. **Gripper Jaw & Finger Width Tracking**:
   - Integrate side-view mirror optical tracking or ArUco/AprilTag markers on physical handheld gripper jaws to measure continuous finger aperture $w_t \in [0, 1]$.
   - Support optional Bluetooth rotary potentiometer / linear encoder logging for analog gripper feedback.

### Phase 3: Multi-Embodiment Kinematics Adapters
1. **Modular Embodiment Architecture**:
   - Refactor `robot_kinematics.py` into abstract `BaseKinematics` class.
   - Implement plugins for additional robot arms:
     - **Koch v1.1** (5-DoF / 6-DoF arm)
     - **Franka Emika Panda** (7-DoF arm)
     - **UR5e / UR10e** (6-DoF industrial arm)
     - **Kuka LBR iiwa**

### Phase 4: Policy Training & Deployment (LeRobot Integration)
1. **Direct Imitation Learning Policy Training**:
   - Train **Diffusion Policy** or **Action Chunking Transformer (ACT)** using the exported LeRobot dataset:
     ```bash
     python lerobot/scripts/train.py \
         --dataset_path lerobot_exports/mobile_so100_demo \
         --policy diffusion \
         --env so100
     ```
2. **Inference-Time Latency Matching**:
   - Implement timestamp-querying at $t + \delta t_{\text{latency}}$ during real-world robot execution to match control loop latencies.

---

## 🔧 Environment Maintenance & Dependencies

*   **Main Collector Environment**:
    *   Miniconda path: `C:\Users\SK\miniconda3\envs\lerobot_collector`
    *   Python Version: `3.10`
    *   Key packages: `fastapi`, `uvicorn`, `numpy`, `scipy`, `pandas`, `pyarrow`, `opencv-python`, `jinja2`.
*   **Isaac Lab Environment**:
    *   Miniconda path: `C:\Users\SK\miniconda3\envs\isaac_lab`
    *   Package: `isaaclab` (Omniverse app launcher + physics simulation).

---

## 🤝 Handover & Continuity Notes

1. **Running the System**:
   - Activate `lerobot_collector` and run `python server.py`.
   - Access `http://localhost:8000` on desktop or `http://<IP>:8000/mobile` on phone.
2. **Replaying Data in Isaac Lab**:
   - Trigger from dashboard button **"🎮 Replay in Isaac Lab"** or execute:
     `C:\Users\SK\miniconda3\envs\isaac_lab\python.exe isaac_lab_replay.py`
3. **Repository Control**:
   - All source code and test files are committed to Git version control.
