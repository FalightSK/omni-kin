# Mobile Smartphone Trajectory Collector & LeRobot Exporter with Isaac Lab Simulation Replay

A complete end-to-end framework that captures human manipulation demonstration trajectories using a smartphone (built-in Camera + high-frequency IMU sensors), computes 6-DoF end-effector motion mapped to a target robot arm (**SO-100**), exports the dataset into Hugging Face **LeRobot** format, and replays demonstrations in **NVIDIA Isaac Lab** 3D physics simulation.

---

## 🌟 Key Features

*   **📱 Mobile Web Capture Interface**: Accessible via any smartphone browser over local Wi-Fi. Captures synchronized video stream + 50–100 Hz IMU sensor data (`DeviceMotionEvent`) along with task instructions (e.g., `"reach to apple"`, `"reach to banana"`).
*   **📐 Robot Kinematics Engine (`robot_kinematics.py`)**: Analytical Forward & Inverse Kinematics (IK) solver tailored for the **SO-100** 5-DoF/6-DoF robot arm (the default embodiment in Hugging Face LeRobot). Maps phone 6-DoF workspace trajectories into target joint angles $(q_0, q_1, q_2, q_3, q_4, \text{gripper})$.
*   **🛰️ Sensor Fusion & Trajectory Estimator (`trajectory_estimator.py`)**: Integrates IMU acceleration & angular velocity with orientation smoothing and gravity removal to output 6-DoF camera/end-effector poses $(x, y, z, \text{roll}, \text{pitch}, \text{yaw})$.
*   **📦 Hugging Face LeRobot Dataset Exporter (`lerobot_exporter.py`)**: Formats collected episodes into the official LeRobot v3.0 / v2.0 schema:
    *   `data/chunk-000/file-000.parquet`: Stores `observation.state`, `action`, `task`, `timestamp`, `frame_index`.
    *   `meta/info.json`: Robot parameters, features schema, total episodes & frames count.
    *   `meta/stats.json`: Normalization statistics (mean, std, min, max).
    *   `meta/episodes/file-000.parquet`: Episode boundary lookup table.
    *   `videos/`: Video feeds encoded per episode.
*   **🖥️ Desktop 3D Web Dashboard (`templates/index.html`)**: Interactive dashboard with Three.js 3D trajectory visualizer, video playback player, sample recording generator, and 1-click dataset exporter.
*   **🎮 NVIDIA Isaac Lab Physics Simulation Replay (`isaac_lab_replay.py`)**: Replays recorded trajectories and joint angles step-by-step inside NVIDIA Isaac Lab 3D physics simulation.

---

## 🏗️ System Architecture

```
 ┌─────────────────────────────────────────────────────────────┐
 │                Mobile Phone Browser / App                   │
 │   - Video Camera Stream (MP4/WebM)                         │
 │   - High-Frequency IMU Sensors (DeviceMotionEvent @ 50-100Hz) │
 │   - Task Prompts ("reach to apple", "reach to banana")     │
 └──────────────────────────────┬──────────────────────────────┘
                                │ Upload over Wi-Fi
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │               Python Backend Server (FastAPI)               │
 ├─────────────────────────────────────────────────────────────┤
 │ 1. Trajectory Estimator (Sensor Fusion & Gravity Removal)   │
 │ 2. Robot Kinematics Solver (SO-100 Arm Inverse Kinematics)  │
 │ 3. LeRobot Exporter (Parquet + MP4 + Metadata JSON)         │
 └──────────────┬──────────────────────────────┬───────────────┘
                │                              │
                ▼                              ▼
 ┌──────────────────────────────┐ ┌───────────────────────────┐
 │ 3D Web Dashboard (Three.js)  │ │ NVIDIA Isaac Lab Replay   │
 │  - Real-time 3D Preview      │ │  - AppLauncher (GUI/GPU)  │
 │  - Episode Manager           │ │  - 3D Articulation Replay │
 └──────────────────────────────┘ └───────────────────────────┘
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites & Miniconda Environments

This project uses two Miniconda virtual environments:
*   `lerobot_collector`: Main web server, kinematics solver, and dataset exporter.
*   `isaac_lab`: Isaac Lab simulation visualizer.

#### Setting up `lerobot_collector` environment:
```bash
# Create conda environment with Python 3.10
conda create -n lerobot_collector python=3.10 -y

# Activate environment & install requirements
conda activate lerobot_collector
pip install -r requirements.txt
```

---

### 2. Start Backend Web Server

Launch the web server using the `lerobot_collector` environment:

```bash
conda activate lerobot_collector
python server.py
```

*   **Desktop Dashboard**: Open [http://localhost:8000](http://localhost:8000) on your PC browser.
*   **Mobile Collector App**: Open `http://<YOUR_LOCAL_IP>:8000/mobile` on your smartphone browser (connected to the same Wi-Fi).

---

### 3. Recording a Demonstration Trajectory

1. Open `http://<YOUR_LOCAL_IP>:8000/mobile` on your mobile device.
2. Grant camera and motion sensor permissions.
3. Select or enter a task prompt (e.g., `"reach to apple"`).
4. Tap **"START RECORDING"**, move the phone towards the target object, and tap **"STOP RECORDING"**.
5. The recording will upload and process automatically.

---

### 4. Exporting to LeRobot Dataset Format

On the Desktop Dashboard ([http://localhost:8000](http://localhost:8000)):
*   Click **"📦 Export LeRobot Dataset"**.
*   The generated dataset will be saved to `lerobot_exports/mobile_so100_demo/` matching the standard Hugging Face LeRobot directory schema.

---

### 5. Replaying Trajectories in NVIDIA Isaac Lab Simulation

You can trigger Isaac Lab replay directly from the Web Dashboard by clicking **"🎮 Replay in Isaac Lab"**, or run it from terminal:

```bash
# Run using isaac_lab conda environment
C:\Users\SK\miniconda3\envs\isaac_lab\python.exe isaac_lab_replay.py --parquet_path lerobot_exports/mobile_so100_demo/data/chunk-000/file-000.parquet --episode_index 0
```

To run in headless mode (no GUI window):
```bash
C:\Users\SK\miniconda3\envs\isaac_lab\python.exe isaac_lab_replay.py --headless
```

---

## 🧪 Testing

Run the automated verification suite:

```bash
python test_pipeline.py
```

This verifies:
1. SO-100 Inverse Kinematics (IK) convergence and joint limit bounds.
2. Trajectory estimation & orientation smoothing.
3. LeRobot parquet export schema and metadata generation (`info.json` & `stats.json`).

---

## 📄 License

MIT License.
