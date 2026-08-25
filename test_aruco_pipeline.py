"""
test_aruco_pipeline.py
Unit tests for Dual-ArUco Rigid Board PnP & EKF Visual-Inertial Fusion Engine
"""

import os
import cv2
import numpy as np
from visual_tracker import VisualInertialTracker, VisualInertialEKF

def test_marker_generation():
    tracker = VisualInertialTracker(tag_a_size=0.10, tag_b_size=0.05, tag_a_id=0, tag_b_id=1)
    tag_a_img = tracker.generate_raw_marker(marker_id=0, side_pixels=400)
    tag_b_img = tracker.generate_raw_marker(marker_id=1, side_pixels=200)
    assert tag_a_img is not None and tag_a_img.shape == (400, 400)
    assert tag_b_img is not None and tag_b_img.shape == (200, 200)
    print("[PASS] test_marker_generation passed!")

def test_dual_board_pnp_scenarios():
    tracker = VisualInertialTracker(
        tag_a_size=0.10,
        tag_b_size=0.05,
        tag_a_id=0,
        tag_b_id=1,
        tag_b_offset=(0.15, 0.0, 0.0)
    )
    camera_matrix, dist_coeffs = tracker.estimate_camera_matrix(1280, 720)

    # 1. Generate synthetic frame containing both markers on the table
    # World: Tag A at [0..0.10, 0..0.10], Tag B at [0.15..0.20, 0..0.05]
    # Let's project corners to image with a true ground truth camera pose
    # True camera: X=0.10m, Y=0.05m, Z=0.40m looking straight down
    tag_a_img = tracker.generate_raw_marker(marker_id=0, side_pixels=160)
    tag_b_img = tracker.generate_raw_marker(marker_id=1, side_pixels=80)

    # Frame with both markers (Scenario A)
    frame_both = np.ones((720, 1280, 3), dtype=np.uint8) * 230
    # Paste Tag A near center-left (px ~ 450, 300)
    frame_both[280:440, 450:610] = cv2.cvtColor(tag_a_img, cv2.COLOR_GRAY2BGR)
    # Paste Tag B near center-right (px ~ 690, 360)
    frame_both[360:440, 690:770] = cv2.cvtColor(tag_b_img, cv2.COLOR_GRAY2BGR)

    det_a, p_a, R_a, rvec_a, tvec_a, is_dual_a = tracker.detect_marker_pnp(frame_both, camera_matrix, dist_coeffs)
    assert det_a, "Scenario A: Failed to detect dual markers"
    assert is_dual_a, "Scenario A: Should trigger 8-point dual mode"
    print(f"[PASS] Scenario A (8-point Dual PnP): Camera at X={p_a[0]:.3f}m, Y={p_a[1]:.3f}m, Z={p_a[2]:.3f}m")

    # Frame with ONLY Tag A (Scenario B)
    frame_tag_a = np.ones((720, 1280, 3), dtype=np.uint8) * 230
    frame_tag_a[280:440, 450:610] = cv2.cvtColor(tag_a_img, cv2.COLOR_GRAY2BGR)

    det_b, p_b, R_b, rvec_b, tvec_b, is_dual_b = tracker.detect_marker_pnp(frame_tag_a, camera_matrix, dist_coeffs)
    assert det_b, "Scenario B: Failed to detect Tag A"
    assert not is_dual_b, "Scenario B: Should trigger 4-point single mode"
    print(f"[PASS] Scenario B (Tag A 4-point PnP): Camera at X={p_b[0]:.3f}m, Y={p_b[1]:.3f}m, Z={p_b[2]:.3f}m")

    # Frame with ONLY Tag B (Scenario C)
    frame_tag_b = np.ones((720, 1280, 3), dtype=np.uint8) * 230
    frame_tag_b[360:440, 690:770] = cv2.cvtColor(tag_b_img, cv2.COLOR_GRAY2BGR)

    det_c, p_c, R_c, rvec_c, tvec_c, is_dual_c = tracker.detect_marker_pnp(frame_tag_b, camera_matrix, dist_coeffs)
    assert det_c, "Scenario C: Failed to detect Tag B"
    assert not is_dual_c, "Scenario C: Should trigger 4-point single mode"
    print(f"[PASS] Scenario C (Tag B 4-point PnP in Tag A origin space): Camera at X={p_c[0]:.3f}m, Y={p_c[1]:.3f}m, Z={p_c[2]:.3f}m")

def test_ekf_fusion():
    ekf = VisualInertialEKF()
    init_p = np.array([0.10, 0.05, 0.35])
    init_e = np.array([0.0, 0.0, 0.0])
    ekf.reset(init_p, init_e)

    # 10 IMU prediction steps (stationary on table)
    for _ in range(10):
        ekf.predict(dt=0.01, accel_body=np.array([0.0, 0.0, 9.81]), gyro_rates=np.zeros(3))

    assert np.allclose(ekf.x[0:3], init_p, atol=0.02), "EKF position should remain stable during static IMU propagation"

    # Visual measurement update (dual marker)
    meas_p = np.array([0.12, 0.06, 0.34])
    meas_e = np.array([0.02, -0.01, 0.0])
    ekf.update_visual(meas_p, meas_e, is_dual=True)

    assert np.allclose(ekf.x[0:3], meas_p, atol=0.005), "EKF state should converge tightly to high-confidence 8-point measurement"
    print("[PASS] test_ekf_fusion passed!")

def test_trajectory_generation():
    tracker = VisualInertialTracker()
    traj = tracker.generate_synthetic_anchored_trajectory(num_frames=60, shape="circle")
    assert traj.shape == (60, 6)
    assert np.all(traj[:, 2] > 0), "Trajectory Z height above table must be positive"
    print("[PASS] test_trajectory_generation passed!")

if __name__ == "__main__":
    print("Running Dual-ArUco Rigid Board PnP & EKF Test Suite...")
    test_marker_generation()
    test_dual_board_pnp_scenarios()
    test_ekf_fusion()
    test_trajectory_generation()
    print("\nALL DUAL-ARUCO & EKF TESTS PASSED SUCCESSFULLY!")
