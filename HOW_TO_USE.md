# Practical User Guide — How to Actually Use OmniKin 🦾📱

Welcome to **OmniKin**! This guide walks you through the entire end-to-end workflow: from printing the ArUco marker board to recording 3D manipulation demonstrations on your phone and exporting LeRobot datasets for robot policy training.

---

## 📋 Quick Pre-Flight Checklist

Before you begin, ensure you have:
- [ ] A PC workstation with **Windows 10/11** or **Linux** on your local Wi-Fi.
- [ ] A smartphone (**iOS** with Safari or **Android** with Chrome) connected to the **same Wi-Fi**.
- [ ] A standard printer with standard **A4 paper**.
- [ ] A physical ruler (to verify printed marker dimensions).
- [ ] Clear tape (to secure the paper to your desk).
- [ ] Clean, diffuse lighting over your desk (avoid harsh direct reflections).

---

## 🖨️ Step 1: Print & Prepare the Marker Board

The marker board serves as the physical $(0, 0, 0)$ world origin for all your demonstrations.

```
                  ┌──────────────────────────────────────────────────────────┐
                  │                      WORKSTATION DESK                    │
                  │                                                          │
                  │                [ Robot Arm Base Location ]               │
                  │                                                          │
                  │              ┌─────────────┐       ┌───────┐             │
                  │              │             │  5cm  │       │             │
                  │              │    TAG A    │◄─────►│ TAG B │             │
                  │              │   (10 cm)   │  gap  │ (5 cm)│             │
                  │              │             │       │       │             │
                  │              └─────────────┘       └───────┘             │
                  │              ▲                                           │
                  │              │ (0,0,0) Origin (Bottom-Left)              │
                  └──────────────┴───────────────────────────────────────────┘
```

1. Start the server (see Step 2) or open `http://localhost:8000/api/marker/print_dual` in your desktop browser.
2. In the Print dialog:
   - **Destination:** Your printer
   - **Orientation:** Landscape
   - **Scale:** **100% (Actual Size)** — *Do NOT check "Fit to page"*
3. **Verify with a physical ruler:**
   - **Tag A (left marker):** Exactly $10.0\text{ cm} \times 10.0\text{ cm}$
   - **Tag B (right marker):** Exactly $5.0\text{ cm} \times 5.0\text{ cm}$
   - **Spacing between markers:** Exactly $5.0\text{ cm}$
4. Tape the printed sheet flat onto your table with clear tape so it cannot move during demonstrations.

---

## 💻 Step 2: Start the OmniKin Server

Open a terminal on your PC:

```bash
# 1. Activate conda environment
conda activate lerobot_collector

# 2. Navigate to project root
cd f:\work\mobile_dataset_collector

# 3. Start the server
python server.py
```

The terminal will display your server URLs and local IP address:
```text
=================================================================
 OmniKin 3D Trajectory Dataset Collector Server Started!
=================================================================
 Desktop Dashboard (HTTP):  http://localhost:8000
 📱 Mobile Logger  (HTTPS): https://192.168.1.50:8443/mobile
 📱 Mobile Logger  (HTTP):  http://192.168.1.50:8000/mobile
 Print ArUco Marker:        http://localhost:8000/api/marker/print_dual
 Mobile QR Code:            http://localhost:8000/api/mobile/qr
=================================================================
```

Open **`http://localhost:8000`** in your desktop browser (Chrome, Edge, or Firefox).

---

## 📱 Step 3: Connect Your Smartphone

Modern mobile browsers strictly require **HTTPS** to allow access to the camera and motion sensors over a local network. OmniKin provides an automated HTTPS service on port `8443`.

```
          DESKTOP SCREEN                                SMARTPHONE SCREEN
   ┌───────────────────────────┐                 ┌───────────────────────────┐
   │ Click "Connect Phone"     │                 │ 1. Open Camera & Scan QR  │
   │ ┌───────────────────────┐ │   Scan QR       │ 2. Bypass SSL Warning:    │
   │ │  ████████   ████████  │ │ ─────────────►  │    - Android: Advanced -> │
   │ │  ██ ▄▄ ██   ██ ▄▄ ██  │ │                 │      Proceed to IP        │
   │ │  ████████   ████████  │ │                 │    - iOS: Show Details -> │
   │ └───────────────────────┘ │                 │      visit this website   │
   │ https://192.168.1.50:8443 │                 │ 3. Tap "Allow" Permissions│
   └───────────────────────────┘                 └───────────────────────────┘
```

1. On your desktop dashboard, click the purple **"📱 Connect Phone"** button in the top navigation bar.
2. A modal pops up with a QR code.
3. Open your smartphone's Camera app and point it at the QR code.
4. Tap the link that appears (pointing to `https://<YOUR_IP>:8443/mobile`).
5. **Accept the One-Time Self-Signed SSL Certificate:**
   - **Android (Chrome):** Tap **"Advanced"** ➔ Tap **"Proceed to `<IP>` (unsafe)"**.
   - **iOS (Safari):** Tap **"Show Details"** ➔ Tap **"visit this website"** ➔ Confirm **"Visit Website"**.
6. When prompted:
   - Tap **"Allow"** for Camera access.
   - Tap **"Allow"** for Motion & Orientation access.
7. Rotate your phone to **Landscape (horizontal)** orientation.

---

## ⚙️ Step 4: Calibrate Robot & Workspace

Before recording, ensure your virtual robot model matches your physical setup. Click **"⚙️ Robot Setup"** in the top navigation bar.

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │ ROBOT CONFIGURATION & CALIBRATION MODAL                                     │
 ├──────────────┬──────────────┬──────────────┬──────────────┬─────────────────┤
 │  Embodiment  │  Workspace   │Camera Offset │ Wrist Safety │ Initial Position│
 ├──────────────┴──────────────┴──────────────┴──────────────┴─────────────────┤
 │                                                                             │
 │  1. Embodiment: Select preset (SO-ARM101-OMNI-KIN) or upload custom .urdf   │
 │  2. Workspace:  Base Offset X = 0.091m, Y = -0.410m, Z = 0.00m, Yaw = 90°   │
 │                 [ Click "Recommended" to auto-align reach envelope ]        │
 │  3. Camera:     Forward = 12.8cm, Height = 10.9cm, Pitch = 40.4°            │
 │  4. Safety:     q3 Safe Max = 5.0° (Prevents camera crashing into forearm)  │
 │  5. Home Pose:  X = 0.15m, Y = 0.00m, Z = 0.20m, Gripper = 100%             │
 │                                                                             │
 │                                                   [ Save Configuration ]    │
 └─────────────────────────────────────────────────────────────────────────────┘
```

1. **Embodiment:** Keep the default `SO-ARM101-OMNI-KIN`, or upload your custom robot URDF.
2. **Workspace Calibration:**
   - This specifies where the physical robot arm base is bolted down relative to the marker board.
   - Default: $X = 0.091\text{ m}, Y = -0.410\text{ m}, Z = 0.000\text{ m}, \text{Yaw} = 90.0^\circ$.
   - **Tip:** Click **"Recommended"** to automatically center the robot base relative to the table reach zone.
3. **Camera Offset:**
   - Enter your phone mount extrinsics relative to the robot gripper tip. If holding the phone by hand to mimic the gripper, keep the defaults ($12.8\text{ cm}$ forward, $10.9\text{ cm}$ height).
4. **Wrist Safety ($q_3$ Ceiling):**
   - Keeps $q_3 \le 5.0^\circ$ to prevent top-mounted cameras from striking the robot's forearm link.
5. Click **"Save Configuration"**. Settings are saved to `robot_config.json`.

---

## 🔴 Step 5: Record Demonstration Trajectories

```
 PHONE SCREEN HUD:
 ┌─────────────────────────────────────────────────────────────┐
 │ [● IMU: 105 Hz]  [Pitch: -12°]                 Battery: 92% │
 │                                                             │
 │                      ┌───────────────┐                      │
 │                      │  VIEWFINDER   │                      │
 │                      │  [TAGS LOCKED]│                      │
 │                      └───────────────┘                      │
 │                                                             │
 │  [ START RECORDING ]                     [ Toggle Gripper ] │
 └─────────────────────────────────────────────────────────────┘
```

1. On your phone, tap the green **"START CAMERA & IMU"** button.
2. Hold your phone horizontally and aim the rear camera at the Dual-ArUco sheet.
3. Ensure both markers are visible inside the on-screen viewfinder box.
4. When ready to perform the manipulation task:
   - Tap the red **"START RECORDING"** button.
   - Move your hand smoothly through the motion path (e.g. reaching down, picking up a pen or cup, moving it across the table, and placing it down).
   - If using gripper states, toggle the gripper button to record open/close events.
5. Tap **"STOP RECORDING"**.
6. The phone automatically uploads the video and IMU telemetry to the server. The server processes the 8-point PnP and 12-state EKF fusion, and the new episode appears on your desktop dashboard in under 3 seconds!

---

## 🔍 Step 6: Review & Refine in the Dashboard

On your desktop dashboard (`http://localhost:8000`):

```
 DESKTOP DASHBOARD LAYOUT (PiP Mode):
 ┌────────────────────────────────────────────────────────┬───────────────────┐
 │ 3D THREE.JS VIEWPORT (Interactive Orbit / Pan / Zoom)   │ EPISODE LIST      │
 │                                                        │ [x] Episode 000   │
 │         🦾 Virtual Robot Arm                           │ [x] Episode 001   │
 │            Following Demo Path                         │ [ ] Episode 002   │
 │                                                        ├───────────────────┤
 │         🟢 Trajectory Tube (Color-Coded Reachability)  │ SMOOTHING SLIDER  │
 │            Green: Reachable  Red: Collision/Limit      │ [===O======] 250ms│
 │                                                        ├───────────────────┤
 │                            ┌────────────────────────┐  │ EXPORT PANEL      │
 │                            │ Live Synced Video PiP  │  │ Mode: Initial-Aware│
 │                            │ [▶ Play] [Scrub Bar]   │  │ [ Export LeRobot] │
 └────────────────────────────┴────────────────────────┴──┴───────────────────┘
```

### 1. Synchronized Playback
- Press the **Spacebar** or click **"Play"** to watch the virtual robot arm execute the demonstration in exact sync with the recorded phone video.
- Drag the timeline scrubber to inspect critical waypoints frame by frame.

### 2. Reachability Color Codes
- **🟢 Green segments:** The robot arm can reach this position with safe torque margins and clear camera clearance.
- **🟡 Yellow segments:** Near physical joint limits or extreme wrist extension.
- **🔴 Red segments:** Outside physical reach envelope or camera-to-forearm clearance violation ($d < 4.5\text{ cm}$).

### 3. Trajectory Smoothing Slider
- In the right panel, adjust the **Smoothing Window** slider ($50\text{ ms} – 500\text{ ms}$).
- Switch between **Savitzky-Golay** (retains acceleration peaks) and **Moving Average** (smoother).
- Changes reflect immediately in the 3D spline tube and joint telemetry.

### 4. Delete Imperfect Demonstrations
- If a demonstration suffered an accidental drop or marker occlusion, click the trash can icon next to the episode to delete it.

---

## 🔀 Step 7: Select Trajectory Mode

Before exporting, choose how demonstrations should be structured:

### Option A: Free-Form Mode (`free_form`)
- **What it does:** The dataset includes only your raw hand motion from start to finish.
- **Best for:** Pretraining foundation vision-language-action (VLA) models where diverse, unconstrained human motion is desired.

### Option B: Initial-Position Aware Mode (`initial_aware`)
- **What it does:** The system automatically calculates a smooth $C^2$ minimum-jerk approach path connecting the robot's configured standby home pose to your demonstration's first waypoint. Includes a $6\text{ cm}$ parabolic clearance lift arc above the table.
- **Best for:** Fine-tuning policies on physical robots where the arm must reliably start from a standardized standby position without colliding with obstacles on the table.

---

## 📦 Step 8: Export LeRobot Dataset

1. In the episode list on the right, check the boxes for the episodes you want to include in your dataset.
2. Enter your dataset name (e.g., `drawer_opening_v1`).
3. Select your **Trajectory Mode** (`free_form` or `initial_aware`).
4. Click **"📦 Export LeRobot Dataset"**.

The exporter generates the official dataset folder at:
```
lerobot_exports/drawer_opening_v1/
```

You can verify the exported dataset directly using Python:

```python
import pyarrow.parquet as pq
import json

# 1. Inspect tabular data
table = pq.read_table("lerobot_exports/drawer_opening_v1/data/chunk-000/file-000.parquet")
print(f"Total Frames: {len(table)}")
print(f"Columns: {table.column_names}")

# 2. Inspect metadata
with open("lerobot_exports/drawer_opening_v1/meta/info.json") as f:
    info = json.load(f)
print(f"Robot Name: {info['robot_name']}")
print(f"FPS: {info['fps']}")
print(f"Joint Names: {info['features']['observation.state']['names']}")
```

---

## 🚀 Step 9: Train Policies with Hugging Face LeRobot

Install the official LeRobot repository and train an Action Chunking Transformer (ACT) or Diffusion Policy directly on your exported dataset:

```bash
# Clone official LeRobot library
git clone https://github.com/huggingface/lerobot.git
cd lerobot
pip install -e .

# Train an ACT policy on your dataset
python lerobot/scripts/train.py \
    --dataset_path ../mobile_dataset_collector/lerobot_exports/drawer_opening_v1 \
    --policy act \
    --env so100 \
    --batch_size 16 \
    --num_workers 4 \
    --training_steps 100000
```

---

## 🛠️ Common Pitfalls & Solutions

| Issue | Cause | Fix |
| :--- | :--- | :--- |
| **Phone says "Site cannot be reached"** | Phone and PC are on different Wi-Fi networks | Connect both devices to the same Wi-Fi SSID. Check PC firewall for ports 8000 & 8443. |
| **Camera shows black screen on phone** | Opened plain HTTP instead of HTTPS | Ensure you opened the HTTPS link (`https://<IP>:8443/mobile`). Accept the self-signed certificate warning. |
| **IMU stays at 0.0 on iPhone** | Safari motion permission disabled | In iOS Settings, go to **Safari > Motion & Orientation Access** and toggle it **ON**. |
| **ArUco tracking jumps or drifts** | Printed scale is wrong or paper is curved | Verify Tag A is exactly 10.0 cm with a ruler. Tape the sheet completely flat. |
| **Entire trajectory turns Red in 3D viewer** | Robot base is placed too far from marker | Open **Robot Setup > Workspace Calibration** and click **"Recommended"** to auto-center the robot base. |
