# Physical Collection Acceptance Protocol

Run this protocol before using a build for training data collection.

1. Print the dual-ArUco board at actual size. Measure Tag A as 100.0 mm and Tag B as 50.0 mm; reject a print outside ±0.5 mm.
2. Start a mobile session and complete its camera-to-TCP calibration with the gripper fully open and all four table/jaw tags visible. Confirm calibration frames are excluded from the demonstration.
3. Place the robot at three known, safely reachable poses. Compare the reconstructed and measured TCP poses; target ≤10 mm position error and ≤5° orientation error. Record errors, calibration version, and operator in the release log.
4. At low, mid, and high reaches, verify the physical camera/forearm and table clearances. Stop if either clearance is below the configured safety margin.
5. Record a short demonstration, wait for processing to finish, and export it. Confirm the export validation report passes and that video frame count, Parquet rows, and frame playback remain synchronized.

Do not train from an episode marked `legacy_unverified`, `failed`, or with a failed export validation report. Reprocess it using the current configuration first.
