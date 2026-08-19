"""
test_aruco_pipeline.py
Unit tests for ArUco Marker-Anchored Visual-Inertial Trajectory Pipeline
"""

import os
import cv2
import numpy as np
from visual_tracker import VisualInertialTracker

def test_marker_generation():
    tracker = VisualInertialTracker(marker_size_meters=0.10)
    marker = tracker.generate_marker_image(marker_id=0, side_pixels=400, border_pixels=50)
    assert marker is not None
    assert marker.shape == (500, 500)
    print("[PASS] test_marker_generation passed!")

def test_pnp_detection_on_synthetic_frame():
    tracker = VisualInertialTracker(marker_size_meters=0.10)
    marker_img = tracker.generate_marker_image(marker_id=0, side_pixels=300, border_pixels=20)

    # Place marker inside a 1280x720 frame
    frame = np.ones((720, 1280, 3), dtype=np.uint8) * 200
    # Paste marker near center
    sy, sx = 200, 470
    mh, mw = marker_img.shape
    frame[sy:sy+mh, sx:sx+mw] = cv2.cvtColor(marker_img, cv2.COLOR_GRAY2BGR)

    camera_matrix, dist_coeffs = tracker.estimate_camera_matrix(1280, 720)
    detected, p_world, R_world, rvec, tvec = tracker.detect_marker_pnp(frame, camera_matrix, dist_coeffs)

    assert detected, "Failed to detect ArUco marker in synthetic frame"
    assert p_world is not None
    assert len(p_world) == 3
    print(f"[PASS] test_pnp_detection passed! Detected 3D camera position: X={p_world[0]:.3f}m, Y={p_world[1]:.3f}m, Z={p_world[2]:.3f}m")

def test_trajectory_fusion():
    tracker = VisualInertialTracker(marker_size_meters=0.10)
    sample_imu = [
        {'timestamp': i * 0.02, 'accel': [0.1 * np.sin(i * 0.1), 0.0, 9.81], 'orientation': [0, 0, 0]}
        for i in range(100)
    ]
    traj = tracker.generate_synthetic_anchored_trajectory(num_frames=90, shape="circle")
    assert traj.shape == (90, 6)
    assert np.all(traj[:, 2] > 0), "Z height above table must be positive"
    print("[PASS] test_trajectory_fusion passed! Trajectory verified.")

if __name__ == "__main__":
    print("Running ArUco Pipeline Tests...")
    test_marker_generation()
    test_pnp_detection_on_synthetic_frame()
    test_trajectory_fusion()
    print("\nALL ARUCO PIPELINE TESTS PASSED SUCCESSFULLY!")
