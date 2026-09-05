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

def test_ekf_params_customization():
    tracker = VisualInertialTracker()
    default_params = tracker.get_ekf_params()
    assert "params" in default_params and "presets" in default_params
    assert "balanced" in default_params["presets"]
    assert "smooth" in default_params["presets"]
    assert "agile" in default_params["presets"]

    # Test setting custom params
    updated = tracker.set_ekf_params({
        "q_vel": 0.05,
        "r_pos_dual": 0.002
    })
    assert updated["q_vel"] == 0.05
    assert updated["r_pos_dual"] == 0.002
    print("[PASS] test_ekf_params_customization passed!")

def test_trajectory_generation():
    tracker = VisualInertialTracker()
    traj = tracker.generate_synthetic_anchored_trajectory(num_frames=60, shape="circle")
    assert traj.shape == (60, 6)
    assert np.all(traj[:, 2] > 0), "Trajectory Z height above table must be positive"
    print("[PASS] test_trajectory_generation passed!")

def test_aruco_tag_loss_and_feature_recovery():
    tracker = VisualInertialTracker(tag_a_size=0.10, tag_b_size=0.05, tag_a_id=0, tag_b_id=1)
    camera_matrix, dist_coeffs = tracker.estimate_camera_matrix(1280, 720, hfov_degrees=78.0)
    
    from visual_tracker import ArucoFeatureMapTracker
    feature_tracker = ArucoFeatureMapTracker(camera_matrix, dist_coeffs)

    tag_a_img = tracker.generate_raw_marker(marker_id=0, side_pixels=120)
    
    # Generate background with dense texture points (simulating table grain & objects)
    np.random.seed(42)
    bg_texture = np.ones((720, 1280, 3), dtype=np.uint8) * 200
    for _ in range(80):
        x = np.random.randint(50, 1200)
        y = np.random.randint(50, 680)
        cv2.circle(bg_texture, (x, y), np.random.randint(3, 8), (30, 40, 50), -1)

    # Frame 1: ArUco visible at known pose
    f1 = bg_texture.copy()
    f1[300:420, 500:620] = cv2.cvtColor(tag_a_img, cv2.COLOR_GRAY2BGR)
    det1, p1, R1, _, _, _, corners1 = tracker.detect_marker_pnp(f1, camera_matrix, dist_coeffs, return_corners=True)
    assert det1, "Frame 1: ArUco should be detected"
    feature_tracker.add_aruco_ground_truth(cv2.cvtColor(f1, cv2.COLOR_BGR2GRAY), p1, R1, corners1)

    # Frame 2: Small camera motion (simulated shift) with ArUco still visible to triangulate
    f2 = np.roll(bg_texture, shift=5, axis=1) # shift 5px horizontally
    f2[300:420, 505:625] = cv2.cvtColor(tag_a_img, cv2.COLOR_GRAY2BGR)
    det2, p2, R2, _, _, _, corners2 = tracker.detect_marker_pnp(f2, camera_matrix, dist_coeffs, return_corners=True)
    feature_tracker.add_aruco_ground_truth(cv2.cvtColor(f2, cv2.COLOR_BGR2GRAY), p2, R2, corners2)

    # Frame 3: Tag Loss! ArUco marker is completely covered/blocked by hand (only background texture remains)
    f3_lost = np.roll(bg_texture, shift=10, axis=1) # further shift
    # Paint hand/cover over ArUco location
    cv2.rectangle(f3_lost, (480, 280), (640, 440), (160, 140, 130), -1)

    # Verify ArUco detector sees NOTHING
    det3, _, _, _, _, _ = tracker.detect_marker_pnp(f3_lost, camera_matrix, dist_coeffs)
    assert not det3, "Frame 3: ArUco must NOT be detected (occluded)"

    # Now verify Feature Tracker takes over and provides valid 3D pose in ArUco space!
    gray3 = cv2.cvtColor(f3_lost, cv2.COLOR_BGR2GRAY)
    f_success, p_feat, R_feat, f_source = feature_tracker.track_without_aruco(gray3)
    assert f_success, "Feature tracker should recover 3D pose in ArUco space during tag loss"
    assert p_feat is not None and len(p_feat) == 3
    assert p_feat[2] > 0, "Recovered camera Z height must be positive"
    print(f"[PASS] test_aruco_tag_loss_and_feature_recovery passed! Source: {f_source}, Camera Z={p_feat[2]:.3f}m")


def test_pitch_accuracy():
    from visual_tracker import rotation_matrix_to_trajectory_euler

    # Nominal looking down at table (R_c2w = diag(1, -1, -1))
    R_down = np.diag([1.0, -1.0, -1.0])
    e_down = rotation_matrix_to_trajectory_euler(R_down)
    assert np.allclose(e_down, [0.0, 0.0, 0.0], atol=1e-5), f"Nominal down orientation should be [0, 0, 0], got {e_down}"

    # Sweep pitch tilts from -30 deg to +30 deg
    prev_pitch = -999.0
    for deg in [-30, -20, -10, 0, 10, 20, 30]:
        th = np.radians(deg)
        R_tilt = R_down @ np.array([
            [1.0, 0.0, 0.0],
            [0.0, np.cos(th), -np.sin(th)],
            [0.0, np.sin(th), np.cos(th)]
        ])
        e = rotation_matrix_to_trajectory_euler(R_tilt)
        measured_pitch_deg = np.degrees(e[1])
        assert np.isclose(measured_pitch_deg, deg, atol=0.01), f"Expected pitch {deg} deg, got {measured_pitch_deg:.2f} deg"
        assert measured_pitch_deg > prev_pitch, "Pitch must be strictly monotonic"
        prev_pitch = measured_pitch_deg

    print("[PASS] test_pitch_accuracy passed! Pitch is monotonic, linear, and gimbal-lock free.")


def test_virtual_slam_landmark_expansion():
    tracker = VisualInertialTracker(tag_a_size=0.10, tag_b_size=0.05, tag_a_id=0, tag_b_id=1)
    camera_matrix, dist_coeffs = tracker.estimate_camera_matrix(1280, 720, hfov_degrees=100.0)

    from visual_tracker import ArucoFeatureMapTracker
    feature_tracker = ArucoFeatureMapTracker(camera_matrix, dist_coeffs)

    tag_a_img = tracker.generate_raw_marker(marker_id=0, side_pixels=120)

    # Generate background with dense texture points
    np.random.seed(123)
    bg_texture = np.ones((720, 1280, 3), dtype=np.uint8) * 200
    for _ in range(120):
        x = np.random.randint(50, 1200)
        y = np.random.randint(50, 680)
        cv2.circle(bg_texture, (x, y), np.random.randint(3, 8), (20, 30, 40), -1)

    # Frame 1: ArUco visible at known pose
    f1 = bg_texture.copy()
    f1[300:420, 500:620] = cv2.cvtColor(tag_a_img, cv2.COLOR_GRAY2BGR)
    det1, p1, R1, _, _, _, corners1 = tracker.detect_marker_pnp(f1, camera_matrix, dist_coeffs, return_corners=True)
    feature_tracker.add_aruco_ground_truth(cv2.cvtColor(f1, cv2.COLOR_BGR2GRAY), p1, R1, corners1)

    # Frame 2: Shift with ArUco still visible
    f2 = np.roll(bg_texture, shift=30, axis=1)
    f2[300:420, 530:650] = cv2.cvtColor(tag_a_img, cv2.COLOR_GRAY2BGR)
    det2, p2, R2, _, _, _, corners2 = tracker.detect_marker_pnp(f2, camera_matrix, dist_coeffs, return_corners=True)
    feature_tracker.add_aruco_ground_truth(cv2.cvtColor(f2, cv2.COLOR_BGR2GRAY), p2, R2, corners2)

    # Frame 3: Tag occluded completely!
    f3_lost = np.roll(bg_texture, shift=60, axis=1)
    cv2.rectangle(f3_lost, (510, 280), (670, 440), (160, 140, 130), -1)

    det3, _, _, _, _, _ = tracker.detect_marker_pnp(f3_lost, camera_matrix, dist_coeffs)
    assert not det3, "Frame 3: ArUco must NOT be detected"

    success3, p3, R3, src3 = feature_tracker.track_without_aruco(cv2.cvtColor(f3_lost, cv2.COLOR_BGR2GRAY))
    assert success3, "Virtual SLAM must track pose during tag loss"
    assert p3 is not None and len(p3) == 3

    # Frame 4: Further motion without tag -> Virtual SLAM continues tracking and expanding map
    f4_lost = np.roll(bg_texture, shift=90, axis=1)
    cv2.rectangle(f4_lost, (540, 280), (700, 440), (160, 140, 130), -1)
    success4, p4, R4, src4 = feature_tracker.track_without_aruco(cv2.cvtColor(f4_lost, cv2.COLOR_BGR2GRAY))
    assert success4, "Virtual SLAM must sustain tracking over multiple markerless frames"
    print(f"[PASS] test_virtual_slam_landmark_expansion passed! Landmarks: {len(feature_tracker.landmarks_3d)}, Frame 3: {src3}, Frame 4: {src4}")


def test_ekf_velocity_leakage_damping():
    ekf = VisualInertialEKF()
    init_p = np.array([0.10, 0.05, 0.35])
    ekf.reset(init_p, np.zeros(3))

    # Simulate 50 steps of sensor dropout (is_visual_active=False) with persistent accelerometer bias
    acc_noisy_bias = np.array([0.15, -0.10, 9.81 + 0.12])
    for _ in range(50):
        ekf.predict(dt=0.02, accel_body=acc_noisy_bias, gyro_rates=np.zeros(3), is_visual_active=False)

    p_final = ekf.x[0:3]
    assert np.all(np.abs(p_final[:2]) < 0.8), f"EKF XY position escaped workspace: {p_final[:2]}"
    assert 0.01 <= p_final[2] <= 0.9, f"EKF Z height escaped workspace: {p_final[2]}"
    print(f"[PASS] test_ekf_velocity_leakage_damping passed! Final Position: {p_final}")


if __name__ == "__main__":
    print("Running ArUco + Feature Extraction + IMU Test Suite...")
    test_marker_generation()
    test_dual_board_pnp_scenarios()
    test_ekf_fusion()
    test_ekf_params_customization()
    test_trajectory_generation()
    test_aruco_tag_loss_and_feature_recovery()
    test_pitch_accuracy()
    test_virtual_slam_landmark_expansion()
    test_ekf_velocity_leakage_damping()
    print("\nALL ARUCO + FEATURE EXTRACTION + IMU TESTS PASSED SUCCESSFULLY!")
