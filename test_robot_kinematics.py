"""
test_robot_kinematics.py
Unit tests for Denavit-Hartenberg (DH) Kinematics Engine and WorkspaceCalibrator
"""

import sys
import numpy as np
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from robot_kinematics import (
    SO101OmniKinKinematics,
    SO100Kinematics,
    SO101Kinematics,
    WorkspaceCalibrator,
    CameraGripperCalibrator,
    get_robot_solver,
    get_robot_specs,
    ROBOT_PRESETS
)

def test_dh_tables_and_specs():
    print('=== Test 1: DH Tables & Robot Specs ===')
    assert 'so_arm101_omni_kin' in ROBOT_PRESETS
    assert 'so101' in ROBOT_PRESETS
    assert 'so100' in ROBOT_PRESETS

    default_solver = get_robot_solver()
    assert isinstance(default_solver, SO101OmniKinKinematics)
    default_specs = get_robot_specs()
    assert default_specs['robot_type'] == 'so_arm101_omni_kin'
    assert 'OMNI-KIN' in default_specs['name']
    assert len(default_specs['urdf']) > 1000

    spec100 = get_robot_specs('so100')
    spec101 = get_robot_specs('so101')

    assert len(spec100['dh_table']) == 5
    assert len(spec101['dh_table']) == 5
    assert len(default_specs['dh_table']) == 5
    assert spec101['reach_meters'] >= 0.39
    assert spec100['reach_meters'] >= 0.38
    assert default_specs['reach_meters'] >= 0.38
    print('[PASS] DH Tables, Default OMNI-KIN & Robot Specs validated!')

def test_omnikin_forward_inverse_consistency():
    print('\n=== Test 2: SO-ARM101-OMNI-KIN (Default) FK/IK Consistency ===')
    solver = get_robot_solver()  # defaults to SO101OmniKinKinematics

    test_targets = [
        [0.22, 0.00, 0.15, 0.0, 0.0, 0.0],
        [0.20, 0.10, 0.18, 0.0, 0.1, 0.2],
        [0.18, -0.08, 0.12, 0.0, -0.1, -0.2],
        [0.25, 0.05, 0.20, 0.0, 0.0, 0.0]
    ]

    for target in test_targets:
        joints = solver.inverse_kinematics(target, gripper_state=60.0)
        assert len(joints) == 6
        assert 0.0 <= joints[5] <= 100.0

        fk_pose = solver.forward_kinematics(np.radians(joints[:5]))
        pos_err = np.linalg.norm(np.array(target[:3]) - fk_pose[:3])
        assert pos_err < 0.005, f"Target {target[:3]} vs FK {fk_pose[:3]} error {pos_err*1000:.2f} mm exceeded 5mm"
        print(f"  Target: {target[:3]} -> FK: {np.round(fk_pose[:3], 3)} (err={pos_err*1000:.2f}mm) [OK]")

    print("[PASS] SO-ARM101-OMNI-KIN FK/IK consistency verified!")

def test_so101_forward_inverse_consistency():
    print('\n=== Test 2: SO-101 FK/IK Consistency ===')
    solver = SO101Kinematics()

    test_targets = [
        [0.22, 0.00, 0.15, 0.0, 0.0, 0.0],
        [0.20, 0.10, 0.18, 0.0, 0.1, 0.2],
        [0.18, -0.08, 0.12, 0.0, -0.1, -0.2],
        [0.25, 0.05, 0.20, 0.0, 0.0, 0.0]
    ]

    for target in test_targets:
        joints = solver.inverse_kinematics(target, gripper_state=60.0)
        assert len(joints) == 6
        assert 0.0 <= joints[5] <= 100.0

        fk_pose = solver.forward_kinematics(np.radians(joints[:5]))
        pos_err = np.linalg.norm(np.array(target[:3]) - fk_pose[:3])
        assert pos_err < 0.005, f"Target {target[:3]} vs FK {fk_pose[:3]} error {pos_err*1000:.2f} mm exceeded 5mm"
        print(f"  Target: {target[:3]} -> FK: {np.round(fk_pose[:3], 3)} (err={pos_err*1000:.2f}mm) [OK]")

    print("[PASS] SO-101 FK/IK consistency verified!")

def test_so100_forward_inverse_consistency():
    print('\n=== Test 3: SO-100 FK/IK Consistency ===')
    solver = SO100Kinematics()

    test_targets = [
        [0.20, 0.00, 0.15, 0.0, 0.0, 0.0],
        [0.18, 0.08, 0.16, 0.0, 0.05, 0.1],
        [0.22, -0.05, 0.14, 0.0, -0.05, -0.1]
    ]

    for target in test_targets:
        joints = solver.inverse_kinematics(target, gripper_state=90.0)
        fk_pose = solver.forward_kinematics(np.radians(joints[:5]))
        pos_err = np.linalg.norm(np.array(target[:3]) - fk_pose[:3])
        assert pos_err < 0.005, f"Target {target[:3]} vs FK {fk_pose[:3]} error {pos_err*1000:.2f} mm exceeded 5mm"
        print(f"  Target: {target[:3]} -> FK: {np.round(fk_pose[:3], 3)} (err={pos_err*1000:.2f}mm) [OK]")

    print('[PASS] SO-100 FK/IK consistency verified!')

def test_workspace_calibrator():
    print('\n=== Test 4: Workspace Calibrator Coplanar Transformations ===')
    calib = WorkspaceCalibrator(offset_x=0.25, offset_y=0.10, offset_z=0.0, yaw_deg=30.0)

    p_aruco = np.array([0.05, 0.05, 0.20, 0.0, 0.0, 0.0])
    p_robot = calib.aruco_to_robot(p_aruco)
    p_back = calib.robot_to_aruco(p_robot)

    assert np.allclose(p_aruco, p_back, atol=1e-5), f'Roundtrip mismatch: {p_aruco} vs {p_back}'
    print(f'  ArUco Space: {p_aruco[:3]} -> Robot Base: {np.round(p_robot[:3], 3)} -> Roundtrip: {np.round(p_back[:3], 3)}')

    traj_aruco = np.array([
        [0.05, 0.05, 0.20, 0, 0, 0],
        [0.10, 0.05, 0.22, 0, 0, 0],
        [0.15, 0.08, 0.25, 0, 0, 0]
    ])
    traj_robot = calib.transform_trajectory(traj_aruco, to_robot=True)
    traj_back = calib.transform_trajectory(traj_robot, to_robot=False)
    assert np.allclose(traj_aruco, traj_back, atol=1e-5)
    print(f'  Batch Trajectory ({len(traj_aruco)} points) transformed and verified!')

    print('[PASS] Workspace Calibrator verified!')

def test_feasible_ik_and_auto_align():
    print('\n=== Test 5: Feasible IK & Workspace Auto-Align ===')
    solver = SO101Kinematics()
    calib = WorkspaceCalibrator()

    # Out-of-reach target: distance ~0.70m (well above 0.395m max reach)
    out_reach_target = [0.60, 0.30, 0.20, 0.0, 0.0, 0.0]
    res = solver.solve_feasible_ik(out_reach_target)
    assert not res['is_feasible'], 'Target should be marked not feasible'
    assert 'OUT_OF_REACH' in res['clamped_reasons']
    assert res['error_distance_cm'] > 15.0
    assert not any(np.isnan(res['joints'])), 'Joint angles must not contain NaN'
    print(f"  Out-of-reach target clamped: dist error = {res['error_distance_cm']:.1f}cm (clamped: {res['clamped_reasons']}) [OK]")

    # Table collision target: Z = -0.10m (below table surface)
    table_target = [0.20, 0.05, -0.10, 0.0, 0.0, 0.0]
    res_table = solver.solve_feasible_ik(table_target)
    assert 'TABLE_COLLISION' in res_table['clamped_reasons']
    assert not any(np.isnan(res_table['joints']))
    print(f"  Table-penetrating target clamped: (clamped: {res_table['clamped_reasons']}) [OK]")

    # Trajectory auto-align test
    fake_trajectory = np.array([
        [-0.05, -0.25, 0.15, 0, 0, 0],
        [0.00, -0.22, 0.18, 0, 0, 0],
        [0.10, -0.15, 0.20, 0, 0, 0],
        [0.20, -0.10, 0.18, 0, 0, 0]
    ])

    # Align to start
    start_calib = calib.auto_align_base_to_start(fake_trajectory[0], nominal_reach=0.22, default_yaw=90.0)
    assert 'offset_x' in start_calib and 'offset_y' in start_calib
    print(f"  Auto-align to start computed: base=({start_calib['offset_x']}, {start_calib['offset_y']}, yaw={start_calib['yaw_deg']}°) [OK]")

    # Align to trajectory
    traj_calib = calib.auto_align_to_trajectory(fake_trajectory, nominal_reach=0.24, default_yaw=90.0)
    assert 'offset_x' in traj_calib and 'offset_y' in traj_calib
    print(f"  Auto-align to trajectory computed: base=({traj_calib['offset_x']}, {traj_calib['offset_y']}, yaw={traj_calib['yaw_deg']}°) [OK]")

    print('[PASS] Feasible IK and Auto-Align successfully verified!')

def test_camera_gripper_calibrator():
    print('\n=== Test 6: 6-DoF Camera-to-Gripper (TCP) Extrinsic Calibrator ===')
    # CAD parameters from user drawing (128.084mm forward, 109.075mm height -> 40.4°):
    theta_calc = CameraGripperCalibrator.compute_tilted_angle(12.8, 10.9)
    assert np.isclose(theta_calc, 40.42, atol=0.05), f"Expected ~40.4 deg, got {theta_calc}"
    h_calc = CameraGripperCalibrator.compute_height_from_angle(12.8, 40.4)
    assert np.isclose(h_calc, 10.89, atol=0.05), f"Expected ~10.9 cm, got {h_calc}"
    print(f"  CAD Tilted Angle Calculation: (12.8cm, 10.9cm) -> {theta_calc:.2f}° vs X-axis [OK]")

    calib = CameraGripperCalibrator(
        forward_cm=12.8,
        height_cm=10.9,
        lateral_cm=0.0,
        pitch_deg=40.4,
        roll_deg=0.0,
        yaw_deg=0.0,
        enabled=True
    )

    # 1. Camera looking forward and down at pitch = 40.4 deg
    pitch_cam = np.radians(40.4)
    p_cam = np.array([0.0, -0.20, 0.25, 0.0, pitch_cam, 0.0])
    p_grip = calib.camera_to_gripper(p_cam)

    # In this configuration, gripper should be horizontal (pitch = 0.0 deg)
    assert np.isclose(p_grip[4], 0.0, atol=1e-3), f"Gripper pitch should be 0.0 deg, got {np.degrees(p_grip[4]):.2f}"
    # Gripper should be forward by 12.8cm: Y = -0.20 + 0.128 = -0.072
    assert np.isclose(p_grip[1], -0.072, atol=1e-3), f"Gripper Y should be -0.072m, got {p_grip[1]:.4f}"
    # Gripper height should be down by 10.9cm: Z = 0.25 - 0.109 = 0.141
    assert np.isclose(p_grip[2], 0.141, atol=1e-3), f"Gripper Z should be 0.141m, got {p_grip[2]:.4f}"
    print(f"  CAD Pose Transformation: Cam at Z=0.25m, Pitch=40.4° -> Gripper at Z={p_grip[2]:.3f}m, Pitch={np.degrees(p_grip[4]):.1f}° [OK]")

    # 2. Invertibility / Roundtrip Test
    p_cam_reconstructed = calib.gripper_to_camera(p_grip)
    assert np.allclose(p_cam[:3], p_cam_reconstructed[:3], atol=1e-5), "Position roundtrip mismatch!"
    assert np.allclose(p_cam[3:], p_cam_reconstructed[3:], atol=1e-5), "Orientation roundtrip mismatch!"
    print(f"  Roundtrip Invariance: cam -> gripper -> cam matches within 0.01mm and 0.001° [OK]")

    # 3. Batch Trajectory Transformation
    fake_traj = np.array([
        [0.0, -0.25, 0.25, 0.0, pitch_cam, 0.0],
        [0.05, -0.20, 0.22, 0.05, pitch_cam + 0.1, 0.02],
        [0.10, -0.15, 0.20, 0.0, pitch_cam - 0.05, -0.01]
    ])
    grip_traj = calib.transform_trajectory(fake_traj, to_gripper=True)
    back_traj = calib.transform_trajectory(grip_traj, to_gripper=False)
    assert grip_traj.shape == fake_traj.shape
    assert np.allclose(fake_traj, back_traj, atol=1e-5)
    print(f"  Batch Trajectory Transformation: {len(fake_traj)} frames transformed and inverted successfully [OK]")

    # 4. Disabled mode pass-through
    calib_disabled = CameraGripperCalibrator(enabled=False)
    assert np.allclose(calib_disabled.camera_to_gripper(p_cam), p_cam)
    print(f"  Disabled Mode: Clean pass-through verified [OK]")

    print('[PASS] 6-DoF Camera-to-Gripper Calibrator fully verified!')

if __name__ == '__main__':
    test_dh_tables_and_specs()
    test_omnikin_forward_inverse_consistency()
    test_so101_forward_inverse_consistency()
    test_so100_forward_inverse_consistency()
    test_workspace_calibrator()
    test_feasible_ik_and_auto_align()
    test_camera_gripper_calibrator()
    print('\nALL ROBOT KINEMATICS & WORKSPACE CALIBRATION TESTS PASSED!')


