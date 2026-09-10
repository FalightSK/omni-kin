# OmniKin Mobile Dataset Collector

A smartphone-powered robot demonstration capture system that records 3D hand trajectories via dual ArUco marker anchoring and exports them as [Hugging Face LeRobot](https://github.com/huggingface/lerobot) datasets — ready for imitation learning.

```
Phone Camera → ArUco PnP + EKF Fusion → Robot IK → LeRobot v2.0 Dataset
```

---

## Features

- **Dual-ArUco rigid-board tracking** — 8-point over-determined PnP + 12-state EKF sensor fusion delivers sub-millimeter trajectory accuracy anchored to a physical table origin
- **Universal robot embodiment** — supports SO-ARM100, SO-ARM101, SO-ARM101-OMNI-KIN, and any custom 5–6 DOF arm via URDF upload
- **Camera crash prevention** — automatic wrist pitch safety clamping with 3D Euclidean forearm clearance invariant, generalized to any arm geometry
- **Two trajectory modes** — `free_form` (pretraining) and `initial_aware` (fine-tuning with auto approach path via quintic C2 spline)
- **LeRobot v2.0 export** — parquet + video + metadata, with joint names from URDF/DH table
- **React + Three.js dashboard** — real-time 3D robot arm preview, IK solver, reachability coloring, episode management

---

## System Requirements

| Component | Requirement |
|-----------|------------|
| OS | Windows 10/11 |
| Python | 3.10+ (conda `lerobot_collector` env) |
| Node.js | 18+ (for frontend dev server) |
| Phone | Any modern smartphone with Chrome/Safari |
| Network | Phone and PC on the same local Wi-Fi |

---

## Installation

### 1. Clone the Repository

```bash
git clone <repo-url>
cd mobile_dataset_collector
```

### 2. Create the Conda Environment

```bash
conda create -n lerobot_collector python=3.10 -y
conda activate lerobot_collector
pip install -r requirements.txt
```

### 3. Build the Frontend (Production)

```bash
cd frontend
npm install
npm run build
cd ..
```

The built assets are served automatically by `server.py` from `frontend/dist/`.

---

## Running the System

### Option A — Production (Recommended)

Start only the backend. The built React app is served from `frontend/dist/`.

```bash
C:\Users\SK\miniconda3\envs\lerobot_collector\python.exe server.py
```

Access:
- **Desktop dashboard**: `http://localhost:8000`
- **Phone mobile logger**: `http://<YOUR_LOCAL_IP>:8000/mobile`
- **Print ArUco board**: `http://localhost:8000/api/marker/print_dual`

### Option B — Development (Hot-reload frontend)

```bash
# Terminal 1 — Backend
C:\Users\SK\miniconda3\envs\lerobot_collector\python.exe server.py

# Terminal 2 — Frontend dev server
cd frontend
npm run dev
```

Access the dashboard at `http://localhost:3000` (the Vite proxy forwards API calls to `:8000`).

---

## Physical Setup

### Print the ArUco Board

1. Open `http://localhost:8000/api/marker/print_dual`
2. Print on **A4 paper**, scale **100% (actual size)**
3. Verify with a ruler:
   - **Tag A** (ID 0): **10.0 cm** square — defines world origin (0,0,0)
   - **Tag B** (ID 1): **5.0 cm** square — placed **5.0 cm to the right** of Tag A
4. Tape the sheet flat onto your workstation table

### Coordinate Frame

```
          +Y (forward, away from you)
           |
 (0,0,0) --+-----------> +X (right, toward Tag B)
   Tag A BL     Tag B BL at (0.15, 0, 0)
           |
        +Z (up, out of table)
```

All trajectories and robot base positions are in this frame.

---

## Robot Configuration

Open the **Robot Setup** modal (gear icon in the navbar) before recording.

### Tab 1 — Robot Embodiment

| Setting | Description |
|---------|-------------|
| **Robot Type** | Preset: `so_arm101_omni_kin` (default), `so101`, `so100` |
| **Upload URDF** | Upload any 5-6 DOF URDF — DH table and joint names auto-parsed |
| **DH Table** | Edit joint limits directly; changes apply immediately |

### Tab 2 — Workspace Calibration

Defines the robot base position relative to the ArUco origin:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `offset_x` | Robot base X offset (m) | 0.091 |
| `offset_y` | Robot base Y offset (m) | -0.41 |
| `offset_z` | Robot base Z offset (m) | 0.00 |
| `yaw_deg` | Robot base rotation around Z (deg) | 90.0 |

Click **"Recommended"** to auto-compute the workspace center based on reachability, or **"Optimal"** for least-squares fit to recorded trajectories.

### Tab 3 — Camera / Gripper Offset

Defines where the phone camera is mounted relative to the gripper TCP:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `forward_cm` | Distance forward from TCP | 12.8 |
| `height_cm` | Height above TCP plane | 10.9 |
| `lateral_cm` | Lateral offset | 0.0 |
| `pitch_deg` | Camera mount pitch angle | 40.4 |

### Tab 4 — Wrist Safety (Camera Crash Prevention)

| Parameter | Description | Default |
|-----------|-------------|---------|
| `q3_safe_max_deg` | Max wrist pitch angle (deg). Prevents camera from crushing into forearm. | 5.0 |

> **Note**: For floor-pickup tasks, the wrist pitch is typically negative (-20 to -60 deg). This limit only prevents upward pitch into the forearm — it does not restrict downward motion.

### Tab 5 — Initial Position (for `initial_aware` mode)

Defines the robot home/standby pose from which the auto approach path starts:

| Parameter | Default |
|-----------|---------|
| `x`, `y`, `z` | 0.15, 0.00, 0.20 m |
| `pitch_deg`, `roll_deg`, `yaw_deg` | 0, 0, 0 deg |
| `gripper` | 100% (fully open) |

---

## Recording Demonstrations

### Step 1 — Connect Phone

1. Navigate to `http://<YOUR_LOCAL_IP>:8000/mobile` on your phone browser
2. Tap **"START CAMERA & IMU"** — grant camera and motion permissions
3. Hold the phone in **landscape** orientation, rear camera pointing at the ArUco board

### Step 2 — Record

1. Make sure both ArUco markers are visible in the viewfinder
2. Tap **"START RECORDING"**
3. Move your hand through the demonstration trajectory
4. Tap **"STOP RECORDING"**

The recording is automatically uploaded and processed (ArUco PnP + EKF fusion → 3D trajectory).

### Step 3 — Review in Dashboard

On the desktop at `http://localhost:8000`:
- **Left pane**: 3D robot arm IK preview over the table, trajectory tube colored green/yellow/red (reachability)
- **Right pane**: Synchronized phone video
- **Timeline slider**: Scrub to any frame — both 3D pose and video stay synchronized
- **Episode list**: All recorded episodes with duration and frame count

---

## Trajectory Modes

### Free-Form (Pretraining)

```
Recording start  -->  demonstration frames  -->  Recording end
```

No approach path prepended. Best for large, diverse pretraining datasets.

### Initial-Position Aware (Fine-Tuning)

```
Home pose  -->  [quintic approach spline, ~45 frames]  -->  Demo start  -->  ...  -->  Demo end
```

A smooth C2 minimum-jerk spline is automatically prepended from the configured home pose to the first demonstration waypoint. Includes a parabolic lift arc (6 cm clearance) to avoid table collisions during approach.

Best for fine-tuning datasets requiring a consistent robot start state.

---

## Exporting to LeRobot Format

### From the Dashboard

1. Select the episodes to export (checkboxes in episode list)
2. Choose **Trajectory Mode**: `free_form` or `initial_aware`
3. Click **"Export LeRobot"**
4. Dataset is saved to `lerobot_exports/<dataset_name>/`

### Output Structure

```
lerobot_exports/<dataset_name>/
├── data/
│   └── chunk-000/
│       └── file-000.parquet          <- all frames (all episodes)
├── meta/
│   ├── info.json                     <- schema, FPS, feature names from DH table
│   ├── stats.json                    <- mean/std/min/max per feature
│   ├── tasks.jsonl
│   ├── episodes.jsonl
│   └── episodes/file-000.parquet
└── videos/
    └── observation.images.phone/
        └── chunk-000/
            └── episode_000000.mp4, ...
```

### Parquet Schema

| Column | Dtype | Description |
|--------|-------|-------------|
| `index` | int64 | Global monotonic frame index |
| `episode_index` | int64 | Episode number (0-based) |
| `frame_index` | int64 | Frame within episode (resets to 0 each episode) |
| `timestamp` | float32 | Seconds from episode start |
| `next.done` | bool | True only at last frame of each episode |
| `task_index` | int64 | Task label index |
| `observation.state` | float32[N] | Joint angles (degrees) + gripper (0-100%) |
| `observation.ee_pose` | float32[6] | End-effector pose [x,y,z,roll,pitch,yaw] in robot base frame |
| `action` | float32[N] | Next-frame joint targets (shifted by 1; last frame = copy) |

N = number of arm joints + 1 gripper column. Joint names match the active URDF/DH table.

### Using the Exported Dataset

```python
from lerobot.common.datasets.lerobot_dataset import LeRobotDataset

dataset = LeRobotDataset("lerobot_exports/my_dataset")
print(dataset[0])   # first frame dict
```

---

## API Reference

### Robot Configuration

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/robot/config` | Full robot config (type, offsets, safety, wrist_pitch_idx) |
| `POST` | `/api/robot/config` | Update robot type, workspace offsets, q3_safe_max_deg |
| `GET` | `/api/robot/initial_position` | Read home pose for initial_aware mode |
| `POST` | `/api/robot/initial_position` | Update home pose |
| `POST` | `/api/robot/gripper_offset` | Update camera extrinsics |
| `POST` | `/api/upload_urdf` | Upload and activate a custom URDF |

### Episodes & Recording

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/episodes` | List all recorded episodes |
| `POST` | `/api/recordings/save` | Process video + IMU -> 3D trajectory |
| `POST` | `/api/recordings/sample` | Generate a synthetic demo trajectory |
| `DELETE` | `/api/episodes/{id}` | Delete an episode |
| `POST` | `/api/episodes/clear` | Clear all episodes |

### Trajectory & Export

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/trajectory/plan_approach` | Compute quintic approach path to episode start |
| `POST` | `/api/export_lerobot` | Export selected episodes to LeRobot v2.0 format |
| `POST` | `/api/robot/solve_ik` | Solve IK for a batch of 6-DOF Cartesian poses |

### Utilities

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Desktop React dashboard |
| `GET` | `/mobile` | Phone data logger |
| `GET` | `/api/marker/print_dual` | Printable dual ArUco board (A4, 1:1 scale) |
| `GET` | `/api/marker/image` | ArUco marker PNG |

---

## Testing

```bash
# ArUco PnP + EKF pipeline
C:\Users\SK\miniconda3\envs\lerobot_collector\python.exe test_aruco_pipeline.py

# Robot kinematics (IK, generalization, wrist safety)
C:\Users\SK\miniconda3\envs\lerobot_collector\python.exe test_robot_kinematics.py

# LeRobot export pipeline
C:\Users\SK\miniconda3\envs\lerobot_collector\python.exe test_pipeline.py

# URDF parsing
C:\Users\SK\miniconda3\envs\lerobot_collector\python.exe test_urdf_converter.py
```

---

## Configuration File

`robot_config.json` is auto-saved on every config change:

```json
{
  "robot_type": "so_arm101_omni_kin",
  "offset_x": 0.091,
  "offset_y": -0.41,
  "offset_z": 0.0,
  "yaw_deg": 90.0,
  "q3_safe_max_deg": 5.0,
  "gripper_offset": {
    "forward_cm": 12.8,
    "height_cm": 10.9,
    "lateral_cm": 0.0,
    "pitch_deg": 40.4,
    "roll_deg": 0.0,
    "yaw_deg": 0.0,
    "enabled": true
  },
  "initial_position": {
    "x": 0.15, "y": 0.0, "z": 0.2,
    "pitch_deg": 0.0, "roll_deg": 0.0, "yaw_deg": 0.0,
    "gripper": 100.0, "enabled": true
  }
}
```

---

## Key Source Files

| File | Role |
|------|------|
| `server.py` | FastAPI backend — all API endpoints, singleton lifecycle |
| `robot_kinematics.py` | DH IK engine, URDF parser, trajectory planner, workspace calibrator |
| `lerobot_exporter.py` | LeRobot v2.0 dataset export |
| `visual_tracker.py` | ArUco PnP + 12-state EKF sensor fusion |
| `robot_config.json` | Persisted robot configuration |
| `frontend/src/pages/Dashboard.jsx` | Main desktop UI |
| `frontend/src/pages/MobileLogger.jsx` | Phone capture interface |
| `frontend/src/components/Viewport3D.jsx` | Three.js 3D robot arm + trajectory preview |
| `frontend/src/components/RobotSetupModal.jsx` | Robot setup UI |
| `SO-ARM101-OMNI-KIN.urdf` | Default robot URDF |

---

## Known Limitations

| Limitation | Details |
|-----------|---------|
| Camera path differs from demo path | Expected: 5-DOF cannot track 6-DOF trajectory; IK targets TCP, camera is on a 17 cm lever arm |
| Video codec | Exported MP4 uses mp4v (OpenCV); re-encode with `ffmpeg -vcodec libx264` for browser playback |
| URDF parsing | 6-DOF URDFs are mapped to a 5-DOF DH structure |
| Table tilt | Workspace calibration assumes a flat table |

---

## License

MIT License.
