# OmniKin trajectory export: data description and usage

This guide describes the files written by OmniKin's LeRobot exporter. A copy is
included as `README.md` in every new export folder. The examples below run from
that folder after activating the `lerobot_collector` conda environment.

## Where the gripper is stored

**The gripper is included in the Parquet file.** It is one element of each
`observation.state` vector and each `action` vector. There is no standalone
Parquet column named `gripper`. Find its index using the feature names in
`meta/info.json`; do not assume a fixed arm joint count.

For a five-joint arm, the six-element vector is:

```text
[arm_joint_0, arm_joint_1, arm_joint_2, arm_joint_3, arm_joint_4, gripper]
```

The gripper is an opening fraction: **0.0 means closed, 1.0 means open**.
For example, a dashboard opening of 54.2% becomes `0.542`, not `54.2`.
It represents aperture rather than the motor angle of a URDF gripper joint.
Selected arm joints precede this separate channel in base-to-TCP order.

The exporter uses the episode's `gripper_states` when present, even if cached
joint states contain older gripper values. When that channel is absent, it uses
the cached gripper column; if neither exists, it defaults to fully open.
Newly processed episodes label their source values as percentages. Legacy
unlabelled values use the existing magnitude-based percentage/fraction inference.

## How marker opening is calculated

For valid detections of jaw markers 2 and 3, using the configured 22 mm marker size:

```text
clear_gap_mm = max(marker_center_distance_mm - marker_size_mm, 0)
record_max_gap_mm = max(clear_gap_mm over all detected frames in this record)
opening_fraction = clamp(clear_gap_mm / record_max_gap_mm, 0, 1)
```

The clear gap and stored percentage are rounded to one decimal place. If all
detected clear gaps are zero, opening is zero. When either jaw marker is lost,
the last detected opening is held. Frames before the first detection use the
first detected opening once the entire recording has been processed.
If no marker pair is detected anywhere in the recording, processing uses the
phone's recorded manual percentage when available, otherwise 100% open.
Reprocessing a recording with no detected pair retains its existing gripper
sequence when it has the correct frame count.

The largest observed gap defines 100% for **that recording**. It is not a
calibrated hardware maximum shared by all recordings, and a held value is not a
new measurement. Raw jaw distances, detection flags, and per-record calibration
are retained in the source recording's `episode_meta.json` and diagnostics;
they are not separate features in the exported Parquet table.

## Folder contents

```text
<dataset_name>_<timestamp>/
  README.md                              this guide
  validation_report.json                 export checks and errors
  data/chunk-000/file-000.parquet         all episodes' frame rows
  meta/info.json                         feature names, shapes, FPS, robot setup
  meta/stats.json                        vector statistics
  meta/tasks.jsonl                       task text and task_index mapping
  meta/episodes.jsonl                    length, FPS, task, episode_index
  meta/episodes/file-000.parquet          the same episode summary as a table
  videos/observation.images.phone/chunk-000/
    episode_000000.mp4                    frames for episode_index 0
    episode_000001.mp4                    frames for episode_index 1
```

Export folder names include a timestamp by default. Existing exported folders
are snapshots: changing a recording or recalculating its gripper does not rewrite
an old export. Create a fresh export to obtain updated values.

## Frame table schema

Let `D` be the number of selected movable arm joints plus one gripper channel.
Vector columns are Parquet lists. Their semantic shapes and order come from
`info.json`, not separate columns for each joint.

| Column | Stored value | Meaning |
| --- | --- | --- |
| `index` | int64 | Global row index, contiguous across all exported episodes. |
| `episode_index` | int64 | Zero-based export episode index; it can differ from the source episode ID. |
| `frame_index` | int64 | Zero-based frame index within this exported episode. |
| `timestamp` | float32 | Seconds from this episode's export start: `frame_index / info["fps"]`. |
| `next.done` | bool | True on the final row of the episode only. |
| `task_index` | int64 | Index into the mapping in `meta/tasks.jsonl`. |
| `task` | string | The episode's task description. |
| `observation.state` | list of float32, length D | Inferred arm joint configuration followed by current opening fraction. |
| `observation.ee_pose` | list of float32, length 6 | TCP pose `[x, y, z, roll, pitch, yaw]` in the selected robot base frame. |
| `action` | list of float32, length D | Next-frame target configuration, including next-frame opening fraction. |

Older exports may physically store floating-point columns as Parquet doubles
despite declaring float32 in `info.json`. Cast to NumPy float32 when reading
either generation, as in the examples below.

Arm revolute and continuous joint values are in **degrees**; prismatic joint
values are in **meters**. The gripper fraction is unitless. Use
`info["robot_kinematics"]["joint_units"]` and `joint_types` for arm units and types.
That block describes the arm only; `info["gripper_semantics"]` describes the
appended gripper. Some old exports lack these metadata blocks.

TCP translations are in meters. TCP orientation values are in radians and use
the application's tracker Euler convention, which exchanges the usual X/Y
pitch/roll naming and can include the phone-frame flip according to the selected
robot model. They are **not generic URDF roll/pitch/yaw values**: do not pass them
unchanged into `Rotation.from_euler("xyz", ...)`. For conventional TCP transforms,
reconstruct forward kinematics from the joint states and the selected URDF chain.
The project's `robot_kinematics.py` contains the pose conversion functions.

Arm configurations and TCP poses are calculated from phone tracking and IK/FK;
they are not measured robot encoder readings. Actions are derived targets,
not recorded commands issued to a physical robot.

## Actions, timing, and export options

Within each episode, `action[t] = observation.state[t + 1]`. The final action
copies the final state, so it never wraps to the beginning or the next episode.
For openings `[1.0, 0.542, 0.0]`, the action gripper values are
`[0.542, 0.0, 0.0]`. These are absolute target fractions, not opening changes.

The website export applies the current smoothing settings to copies of the
stored trajectories, then recomputes kinematics. Smoothing affects the arm pose
path; the separately recorded gripper opening sequence is retained.
Export currently includes all processed episodes in the server, not a per-request
selection of episode IDs.

With auto-trim enabled, the exporter can retain the longest contiguous reachable
interval. It slices the gripper, arm states, and video using the same frame range.
`free_form` exports the retained demonstration without an approach prefix.
`initial_aware` attempts to prepend a generated home-to-start approach and its
gripper transition. The approach's video frames repeat the first retained image;
they are synthetic trajectory frames. The current exporter logs an approach
generation failure and continues without the prefix, so check its server output
if an approach is expected.

Every table row corresponds to one frame in its episode video. Export rewrites
timestamps and video playback to `info["fps"]` (normally 30), preserving frame
count rather than resampling by source timestamps. If the source video FPS differs,
the exported duration differs from the original recording. Use the export FPS for
training, and retain source metadata if original capture timing matters.

## Read the data and opening percentage

```python
from pathlib import Path
import json
import numpy as np
import pandas as pd

root = Path(".")  # run from the export folder, or set this to its full path
info = json.loads((root / "meta/info.json").read_text(encoding="utf-8"))
df = pd.read_parquet(root / "data/chunk-000/file-000.parquet")
state_names = info["features"]["observation.state"]["names"]
action_names = info["features"]["action"]["names"]
states = np.asarray(df["observation.state"].tolist(), dtype=np.float32)
actions = np.asarray(df["action"].tolist(), dtype=np.float32)
state_gripper = state_names.index("gripper")
action_gripper = action_names.index("gripper")

assert states.shape[1] == len(state_names)
assert np.isfinite(states).all() and np.isfinite(actions).all()
assert np.all((states[:, state_gripper] >= 0) & (states[:, state_gripper] <= 1))
df["opening_percent"] = states[:, state_gripper] * 100
df["target_opening_percent"] = actions[:, action_gripper] * 100
print(df[["episode_index", "frame_index", "opening_percent", "target_opening_percent"]].head())

for _, episode in df.groupby("episode_index", sort=True):
    episode = episode.sort_values("frame_index")
    s = np.asarray(episode["observation.state"].tolist(), dtype=np.float32)
    a = np.asarray(episode["action"].tolist(), dtype=np.float32)
    assert np.allclose(a[:-1], s[1:], atol=1e-5)
    assert np.allclose(a[-1], s[-1], atol=1e-5)
```

The derived percentage columns above are for inspection; they are not columns
written by the exporter. Do not shift `action` again when building training pairs.
Form temporal action windows within episode boundaries, and pad at the terminal
frame instead of including another episode. Split training and validation by
whole episodes to avoid adjacent frames leaking into both sets.

## Read the corresponding image

Run this after the preceding example. Use actual decoded video dimensions;
the current export metadata's `[480, 640, 3]` image shape is a nominal value and
can differ from the retained source video's resolution.

```python
import cv2

row = df.iloc[0]
video = root / "videos/observation.images.phone/chunk-000" / f"episode_{int(row['episode_index']):06d}.mp4"
cap = cv2.VideoCapture(str(video))
try:
    cap.set(cv2.CAP_PROP_POS_FRAMES, int(row["frame_index"]))
    ok, bgr = cap.read()
    if not ok:
        raise RuntimeError(f"Cannot decode frame from {video}")
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)  # HWC uint8
    print(rgb.shape, row["opening_percent"])
finally:
    cap.release()
```

For PyTorch vision training, convert RGB HWC to CHW and apply the policy's image
preprocessing. Normalize each numerical feature according to its own units or
the exported statistics; the arm columns and gripper do not share one scale.

## Using the official LeRobot library

The current OmniKin artifact uses LeRobot feature names with a project-specific
Parquet/MP4 layout. Its legacy `codebase_version: "v2.0"` label is not a guarantee
of official loader compatibility: it combines episodes in `file-000.parquet`,
keeps one video per episode, and lacks the full official dataset path/offset metadata.
Do not pass this folder directly to the current `LeRobotDataset` loader or simply
change the version string. Older instructions using `train.py --dataset_path`
were removed because they did not establish compatibility.

For official LeRobot training, port the rows and decoded RGB frames into a new
dataset using the installed release's writer API:

1. Install LeRobot following its installation guide in a suitable training environment.
2. Create a dataset with `LeRobotDataset.create`, defining state/action names and
   shapes from `info.json` and the camera shape from an actual decoded image.
3. For each episode in order, call `add_frame` with its existing state, action,
   decoded RGB image, and task text. Use the original exported action without shifting it.
4. Call `save_episode` at each episode boundary and `finalize` after all episodes.
5. Load the resulting official dataset locally, check opening values, then follow
   that release's policy-training instructions. Map the normalized gripper to the
   actual robot's aperture or motor convention when using predictions.

The collector's conda environment does not require or install LeRobot. Direct
Parquet reading above is supported here; official loader/training compatibility
must be validated in the target LeRobot environment.
See the [official dataset writer API](https://huggingface.co/docs/lerobot/main/api/datasets)
and [LeRobot dataset format guide](https://huggingface.co/docs/lerobot/lerobot-dataset-v3).

## What export validation proves

Read `validation_report.json` and require `passed: true`. The exporter checks
frame counts and indices, terminal flags, state/action vector widths and finite
values, gripper feature names/range, serialized gripper parity with the prepared
sequence, next-state action alignment, and video/table frame-count parity.
Source-to-export gripper mapping is also covered by the project's export regression
test. These checks establish data consistency; they do not establish physical
trajectory accuracy, safe robot execution, or official LeRobot loader compatibility.

If an old export shows a constant `1.0`, it contains an always-open gripper channel.
That may be a fallback or an old snapshot. Inspect the source recording diagnostics
and produce a fresh export after recalculation before treating it as measured jaw motion.
