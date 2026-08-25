# Dual-ArUco Rigid Board PnP & EKF Visual-Inertial 3D Trajectory Collector

A high-precision end-to-end framework that captures human manipulation and 3D motion demonstrations using a smartphone (Rear Camera + High-Frequency IMU), anchors the motion relative to a physical table origin via **Dual-ArUco Rigid Board solvePnP**, performs **12-State Extended Kalman Filter (EKF) Sensor Fusion**, visualizes the 3D trajectory in a **Side-by-Side Synchronized Web Dashboard**, and exports demonstrations into Hugging Face **LeRobot** format with **NVIDIA Isaac Lab** simulation replay.

---

## 🌟 Key Features

*   🎯 **Dual-ArUco Rigid Board Anchor (`visual_tracker.py`)**:
    *   **Tag A (Primary Origin Anchor)**: 10.0 cm ArUco marker (`DICT_6X6_250`, ID 0) with Bottom-Left corner defined as the absolute World Origin `(0.0, 0.0, 0.0)`.
    *   **Tag B (Secondary Offset Anchor)**: 5.0 cm ArUco marker (`DICT_6X6_250`, ID 1) with Bottom-Left corner placed at `(0.15, 0.0, 0.0)` (5.0 cm spacing along X, baseline-aligned at $y=0$).
    *   **Over-Determined 8-Point Geometry**: Combines 8 coplanar 3D object corners into a single rigid body, eliminating planar flipping ambiguity and providing sub-millimeter tracking accuracy.
    *   **Dynamic Point Matching**:
        *   **Scenario A (Both tags visible - 8 points)**: Full over-determined 8-point PnP solver (`cv2.SOLVEPNP_ITERATIVE`).
        *   **Scenario B (Tag A visible only - 4 points)**: Far/medium distance tracking using Tag A (`cv2.SOLVEPNP_IPPE_SQUARE`).
        *   **Scenario C (Tag B visible only - 4 points)**: Zoomed-in/close manipulation tracking using Tag B in Tag A's origin space.
    *   **Sub-Pixel Refinement**: Applies `cv2.cornerSubPix` for sub-pixel 2D corner localization.
*   📐 **12-State Extended Kalman Filter (EKF) Sensor Fusion**:
    *   **State Vector $\mathbf{x} \in \mathbb{R}^{12}$**: Tracks 3D Position ($\mathbf{p}$), 3D Velocity ($\mathbf{v}$), 3D Euler Orientation ($\boldsymbol{\theta}$), and 3D Accelerometer Bias ($\mathbf{b}_a$).
    *   **Strapdown Inertial Propagation**: Non-linear kinematics prediction at IMU rate ($100-200\text{ Hz}$) with gravity compensation ($\mathbf{a}_{\text{world}} = \mathbf{R}(\boldsymbol{\theta})(\mathbf{a}_{\text{meas}} - \mathbf{b}_a) - \mathbf{g}$).
    *   **Adaptive Visual Measurement Updates**: Dynamically adapts measurement covariance $\mathbf{R}_{\text{meas}}$ (tighter covariance for 8-point dual tag detection, robust covariance for single tag).
    *   **Zero-Drift Coasting**: Handles temporary marker occlusions and motion blur by dead-reckoning on bias-compensated inertial states.
*   📱 **Mobile Web Data Logger (`templates/mobile.html`)**:
    *   Runs on any smartphone browser (Chrome/Safari) over local Wi-Fi.
    *   Captures 720p 30 FPS rear camera video + 100Hz+ IMU motion telemetry.
    *   High-precision UNIX epoch timestamps (`performance.timeOrigin + performance.now()`) for millisecond-accurate sync.
    *   Built-in ArUco aiming viewfinder reticle and responsive landscape thumb-controls.
*   🖥️ **50/50 Side-by-Side Dual-Pane Dashboard (`templates/index.html`)**:
    *   **Left Pane**: Real-time Three.js 3D WebGL viewport showing the virtual table grid, physical Dual-ArUco Board at $(0, 0, 0)$, floating 3D spline trajectory tube, and end-effector tool.
    *   **Right Pane**: Synchronized recorded camera video feed.
    *   **Master Playback Bar**: Unified frame slider and Play/Pause control advancing both 3D trajectory and video simultaneously.
    *   **Live Cartesian Telemetry**: Real-time readouts for $X$ (lateral on table), $Y$ (forward on table), and $Z$ (height above marker in cm).
*   🖨️ **1:1 Exact Physical Scale Dual-Marker Print Sheet (`/api/marker/print_dual`)**:
    *   Dedicated CSS print template rendering Tag A (10cm) and Tag B (5cm) with exact 5cm physical separation on a single A4 page.
    *   Metric calibration ruler spanning 0 cm to 20 cm for physical ruler verification.
*   📦 **Hugging Face LeRobot Dataset Exporter (`lerobot_exporter.py`)**:
    *   Exports datasets into official LeRobot schema (`.parquet` files, `meta/info.json`, `meta/stats.json`, `meta/episodes/`).
*   🎮 **NVIDIA Isaac Lab Simulation Replay (`isaac_lab_replay.py`)**:
    *   Direct 1-click launch from dashboard or CLI to replay recorded Cartesian trajectories in 3D physics simulation.

---

## 🏗️ System Architecture

```
 ┌─────────────────────────────────────────────────────────────┐
 │            Physical Setup: Dual-ArUco Rigid Board           │
 │   - Tag A (10cm, ID 0) at Origin (0, 0, 0)                  │
 │   - Tag B (5cm, ID 1) at Offset (0.15m, 0.0m, 0.0m)         │
 └──────────────────────────────┬──────────────────────────────┘
                                │
 ┌──────────────────────────────▼──────────────────────────────┐
 │                Mobile Web App (Data Logging)                │
 │   - 720p 30 FPS Rear Camera (HTML5 MediaRecorder)           │
 │   - 100-200 Hz IMU Accelerometer + Gyro (DeviceMotionEvent) │
 │   - Millisecond Epoch Timestamping (performance.timeOrigin) │
 └──────────────────────────────┬──────────────────────────────┘
                                │ Upload over Wi-Fi
 ┌──────────────────────────────▼──────────────────────────────┐
 │         FastAPI Backend & Extended Kalman Filter            │
 │   - Dynamic 8-Point Dual-ArUco solvePnP Pose Estimation    │
 │   - 12-State EKF Strapdown IMU Prediction (100-200Hz)       │
 │   - Adaptive Visual Measurement Correction (~30Hz)          │
 └──────────────────────────────┬──────────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
 ┌──────────────────────────────┐        ┌──────────────────────────────┐
 │  50/50 Side-by-Side Dashboard│        │    LeRobot & Isaac Lab       │
 │  - Dual-ArUco Table Meshes   │        │  - Parquet Dataset Export    │
 │  - 3D Spline Trajectory      │        │  - NVIDIA Isaac Lab Replay   │
 │  - Synchronized Video Stream │        │  - Embodiment Mapping        │
 └──────────────────────────────┘        └──────────────────────────────┘
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites & Conda Environment

```bash
# Main environment for collector & LeRobot exporter
conda activate lerobot_collector

# Install dependencies (if not already installed)
pip install -r requirements.txt
```

---

### 2. Start the Backend Server

```bash
cd F:\work\mobile_dataset_collector
C:\Users\SK\miniconda3\envs\lerobot_collector\python.exe server.py
```

Output:
```text
============================================================
ArUco-Anchored 3D Trajectory Collector Server Started!
============================================================
Desktop Dashboard:  http://localhost:8000
Phone Mobile URL:   http://<YOUR_IP>:8000/mobile
Print Dual Board:   http://localhost:8000/api/marker/print_dual
============================================================
```

---

### 3. Print the Dual-ArUco Board

1. Open **[http://localhost:8000/api/marker/print_dual](http://localhost:8000/api/marker/print_dual)** (or click **"🖨️ Print Dual-ArUco Board"** on the dashboard).
2. In your print dialog, select **Paper: A4 Landscape** and **Scale: 100% (Actual Size)**.
3. Verify with a physical ruler that Tag A is 10.0 cm, Tag B is 5.0 cm, and the spacing is 5.0 cm.
4. Tape the printed sheet flat onto your workstation table.

---

### 4. Record a 3D Trajectory on Your Phone

1. On your smartphone browser (Chrome/Safari), navigate to `http://<YOUR_LOCAL_IP>:8000/mobile`.
2. Hold your phone horizontally (Landscape) and tap **"START CAMERA & IMU"**.
3. Aim at the Dual-ArUco board on your desk.
4. Tap **"START RECORDING"**, draw your 3D motion path in the air (e.g. circle, reaching motion, wave), and tap **"STOP RECORDING"**.

---

### 5. Inspect in Side-by-Side Dashboard & Export

1. Switch back to **[http://localhost:8000](http://localhost:8000)**.
2. The **Left Pane** renders the 3D trajectory hovering over the Dual-ArUco table board, while the **Right Pane** plays the synchronized video feed.
3. Scrub the bottom timeline slider to compare the 3D path with the video frame-by-frame.
4. Click **"📦 Export LeRobot"** to save to Hugging Face LeRobot format.
5. Click **"🎮 Isaac Lab"** to launch simulation replay.

---

## 🧪 Testing

Run the automated test suite for the Dual-ArUco PnP & EKF pipeline:

```bash
C:\Users\SK\miniconda3\envs\lerobot_collector\python.exe test_aruco_pipeline.py
```

Tests verified:
*   `[PASS]` `test_marker_generation`: Generates pure ArUco markers.
*   `[PASS]` `test_dual_board_pnp_scenarios`: Tests Scenario A (8-point dual PnP), Scenario B (Tag A 4-point), and Scenario C (Tag B 4-point).
*   `[PASS]` `test_ekf_fusion`: Verifies 12-state EKF strapdown propagation and measurement update convergence.
*   `[PASS]` `test_trajectory_generation`: Verifies smooth 3D trajectory generation.

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Desktop 50/50 side-by-side 3D comparison dashboard |
| `GET` | `/mobile` | Mobile web data logging interface with IMU HUD |
| `GET` | `/api/marker/image` | Returns high-res ArUco marker PNG with label |
| `GET` | `/api/marker/raw` | Returns pure black/white ArUco square without borders |
| `GET` | `/api/marker/print` | Dedicated HTML page with exact 1:1 physical centimeter scale & calibration ruler |
| `GET` | `/api/episodes` | Retrieves list of recorded episodes |
| `POST` | `/api/recordings/save` | Processes video + IMU JSON through ArUco visual-inertial tracker |
| `POST` | `/api/recordings/sample` | Generates synthetic 3D shape (e.g. 3D circle floating 20cm above marker) |
| `DELETE`| `/api/episodes/{id}` | Deletes a specific recorded episode |
| `POST` | `/api/episodes/clear` | Clears all recorded episodes |
| `POST` | `/api/export_lerobot` | Exports episodes to Hugging Face LeRobot format (`.parquet` + metadata) |
| `POST` | `/api/isaac_lab/replay` | Launches Isaac Lab simulation replay |

---

## 📄 License

MIT License.
