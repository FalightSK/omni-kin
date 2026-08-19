# ArUco-Anchored Visual-Inertial 3D Trajectory Collector & LeRobot Exporter

A high-precision end-to-end framework that captures human manipulation and 3D motion demonstrations using a smartphone (Rear Camera + High-Frequency IMU), anchors the motion relative to a physical table origin via **ArUco solvePnP**, performs **Visual-Inertial Dead-Reckoning Fusion**, visualizes the 3D trajectory in a **Side-by-Side Synchronized Web Dashboard**, and exports demonstrations into Hugging Face **LeRobot** format with **NVIDIA Isaac Lab** simulation replay.

---

## 🌟 Key Features

*   🎯 **Physical Table Anchor (ArUco Marker Origin $(0, 0, 0)$)**:
    *   Uses a standard printed ArUco 6x6 marker (`DICT_6X6_250`, ID 0, 10.0 cm width) placed flat on the table.
    *   Defines the absolute physical origin $(0, 0, 0)$ with $Z=0$ on the tabletop surface and $+Z$ pointing upward.
    *   Persistent across all server restarts — the same printed paper remains valid forever.
*   📐 **Visual-Inertial Sensor Fusion (`visual_tracker.py`)**:
    *   **Algorithm B (ArUco PnP Pose Estimation)**: Uses `cv2.solvePnP` with `SOLVEPNP_IPPE_SQUARE` to compute exact millimeter-accurate 6-DoF camera poses $(\mathbf{p}_{\text{cam}} = -R^T \mathbf{t})$ in real metric space.
    *   **Algorithm A (High-Frequency IMU Dead-Reckoning)**: Integrates 100–200 Hz accelerometer and gyroscope data with tilt orientation correction, gravity compensation, and Butterworth filtering.
    *   **Algorithm C (Matrix Offset Fusion)**: Fuses PnP anchors with relative inertial displacement to bridge temporary marker occlusions or steep tilt angles without scale drift.
*   📱 **Mobile Web Data Logger (`templates/mobile.html`)**:
    *   Runs on any smartphone browser (Chrome/Safari) over local Wi-Fi.
    *   Captures 720p 30 FPS rear camera video + 100Hz+ IMU motion telemetry.
    *   High-precision UNIX epoch timestamps (`performance.timeOrigin + performance.now()`) for millisecond-accurate sync.
    *   Built-in ArUco aiming viewfinder reticle and responsive landscape thumb-controls.
*   🖥️ **50/50 Side-by-Side Dual-Pane Dashboard (`templates/index.html`)**:
    *   **Left Pane**: Real-time Three.js 3D WebGL viewport showing the virtual table grid, physical ArUco marker at $(0, 0, 0)$, floating 3D spline trajectory tube, and end-effector tool.
    *   **Right Pane**: Synchronized recorded camera video feed.
    *   **Master Playback Bar**: Unified frame slider and Play/Pause control advancing both 3D trajectory and video simultaneously.
    *   **Live Cartesian Telemetry**: Real-time readouts for $X$ (lateral on table), $Y$ (forward on table), and $Z$ (height above marker in cm).
*   🖨️ **1:1 Exact Physical Scale Marker Generator (`/api/marker/print`)**:
    *   Interactive generator supporting customizable Marker IDs (0–249), dictionary sizes (4x4, 5x5, 6x6), and physical widths (e.g. 10.0 cm, 5.0 cm).
    *   Dedicated CSS print page scaling the pure black ArUco square to exact physical centimeters with a built-in verification ruler.
*   📦 **Hugging Face LeRobot Dataset Exporter (`lerobot_exporter.py`)**:
    *   Exports datasets into official LeRobot schema (`.parquet` files, `meta/info.json`, `meta/stats.json`, `meta/episodes/`).
*   🎮 **NVIDIA Isaac Lab Simulation Replay (`isaac_lab_replay.py`)**:
    *   Direct 1-click launch from dashboard or CLI to replay recorded Cartesian trajectories in 3D physics simulation.

---

## 🏗️ System Architecture

```
 ┌─────────────────────────────────────────────────────────────┐
 │                Physical Setup (The Anchor)                  │
 │   - 6x6 ArUco Marker (10.0 cm width) taped flat on table    │
 │   - Establishes Absolute World Origin (0, 0, 0) with Z=0    │
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
 │               FastAPI Backend (Visual Tracker)              │
 │   - Algorithm B: ArUco solvePnP 6-DoF Pose Extraction       │
 │   - Algorithm A: High-Frequency IMU Dead-Reckoning          │
 │   - Algorithm C: Matrix Offset Transformation & Fusion      │
 └──────────────────────────────┬──────────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
 ┌──────────────────────────────┐        ┌──────────────────────────────┐
 │  50/50 Side-by-Side Dashboard│        │    LeRobot & Isaac Lab       │
 │  - 3D Spline Trajectory      │        │  - Parquet Dataset Export    │
 │  - Synchronized Video Stream │        │  - NVIDIA Isaac Lab Replay   │
 │  - Cartesian Telemetry (XYZ) │        │  - Embodiment Mapping        │
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
Desktop Dashboard: http://localhost:8000
Phone Mobile URL:  http://192.168.1.178:8000/mobile
Print ArUco Marker: http://localhost:8000/api/marker/image
============================================================
```

---

### 3. Print or Display Your ArUco Marker

1. Open **[http://localhost:8000](http://localhost:8000)** and click **"🖨️ Print ArUco Marker"**.
2. Set **Width (cm)** to `10.0` (or `5.0`) and click **"Print"**:
   * Opens: `http://localhost:8000/api/marker/print?marker_id=0&width_cm=10.0`
3. In your print dialog, select **Scale: 100% (Actual Size)**.
4. Place the printed marker flat on your table.

---

### 4. Record a 3D Trajectory on Your Phone

1. On your smartphone browser (Chrome/Safari), navigate to:
   `http://<YOUR_LOCAL_IP>:8000/mobile` (e.g. `http://192.168.1.178:8000/mobile`).
2. Hold your phone horizontally (Landscape) and tap **"START CAMERA & IMU"**.
3. Aim at the ArUco marker on your desk.
4. Tap **"START RECORDING"**, draw your 3D motion path in the air (e.g. circle, reaching motion, wave), and tap **"STOP RECORDING"**.

---

### 5. Inspect in Side-by-Side Dashboard & Export

1. Switch back to **[http://localhost:8000](http://localhost:8000)**.
2. The **Left Pane** renders the 3D trajectory hovering over the table marker, while the **Right Pane** plays the synchronized video feed.
3. Scrub the bottom timeline slider to compare the 3D path with the video frame-by-frame.
4. Click **"📦 Export LeRobot"** to save to Hugging Face LeRobot format.
5. Click **"🎮 Isaac Lab"** to launch simulation replay.

---

## 🧪 Testing

Run the automated test suite for the ArUco pipeline:

```bash
C:\Users\SK\miniconda3\envs\lerobot_collector\python.exe test_aruco_pipeline.py
```

Tests verified:
*   `[PASS]` `test_marker_generation`: Generates pure and bordered ArUco 6x6 markers.
*   `[PASS]` `test_pnp_detection_on_synthetic_frame`: Tests `cv2.solvePnP` metric recovery $(X, Y, Z)$ on camera frames.
*   `[PASS]` `test_trajectory_fusion`: Verifies smooth visual-inertial trajectory estimation.

---

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
