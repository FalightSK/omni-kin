"""
test_robot_kinematics.py
Unit tests for URDF-chain kinematics and WorkspaceCalibrator
"""

import sys
import numpy as np
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from robot_kinematics import (
    SO101OmniKinKinematics,
    SO100Kinematics,
    SO101Kinematics,
    universal_soft_saturation,
    WorkspaceCalibrator,
    CameraGripperCalibrator,
    get_robot_solver,
    get_robot_specs,
    ROBOT_PRESETS,
    SerialURDFKinematics,
)

def test_urdf_chain_specs():
    print('=== Test 1: URDF Chain & Robot Specs ===')
    assert 'so_arm101_omni_kin' in ROBOT_PRESETS
    assert 'so101' in ROBOT_PRESETS
    assert 'so100' in ROBOT_PRESETS

    default_solver = get_robot_solver()
    assert isinstance(default_solver, SO101OmniKinKinematics)
    assert isinstance(default_solver, SerialURDFKinematics)
    assert default_solver.base_link == 'base'
    assert default_solver.tcp_link == 'gripper_tcp'
    assert len(default_solver.joint_names) == 5
    assert all(kind == 'revolute' for kind in default_solver.joint_types)
    assert 'dh_table' not in ROBOT_PRESETS['so_arm101_omni_kin']
    default_specs = get_robot_specs()
    assert default_specs['robot_type'] == 'so_arm101_omni_kin'
    assert 'OMNI-KIN' in default_specs['name']
    assert len(default_specs['urdf']) > 1000

    spec100 = get_robot_specs('so100')
    spec101 = get_robot_specs('so101')

    for specs in (spec100, spec101, default_specs):
        assert 'dh_table' not in specs
        assert len(specs['joint_names']) == 5
        assert len(specs['chain']) == (6 if specs is default_specs else 5)
        assert specs['base_link'] and specs['tcp_link']
    assert spec101['reach_meters'] >= 0.39
    assert spec100['reach_meters'] >= 0.38
    assert default_specs['reach_meters'] >= 0.38
    print('[PASS] URDF preset chains and robot specs validated!')

def test_omnikin_forward_inverse_consistency():
    print('\n=== Test 2: SO-ARM101-OMNI-KIN (Default) FK/IK Consistency ===')
    _assert_preset_roundtrip(get_robot_solver())
    print("[PASS] SO-ARM101-OMNI-KIN FK/IK consistency verified!")

def test_so101_forward_inverse_consistency():
    print('\n=== Test 2: SO-101 FK/IK Consistency ===')
    _assert_preset_roundtrip(SO101Kinematics())
    print("[PASS] SO-101 FK/IK consistency verified!")

def test_so100_forward_inverse_consistency():
    print('\n=== Test 3: SO-100 FK/IK Consistency ===')
    _assert_preset_roundtrip(SO100Kinematics())
    print('[PASS] SO-100 FK/IK consistency verified!')


def _assert_preset_roundtrip(solver):
    state = np.array([10.0, -35.0, 45.0, -15.0, 10.0])
    target = solver.forward_kinematics(solver.state_to_joint_values(state))
    result = solver.solve_feasible_ik(target, gripper_state=60.0, prev_joints=np.r_[state, 60.0])
    assert len(result['joints']) == solver.num_joints + 1
    assert result['joints'][-1] == 60.0
    fk_pose = solver.forward_kinematics(solver.state_to_joint_values(result['joints'][:solver.num_joints]))
    assert np.allclose(target, fk_pose, atol=1e-5), f"{solver.robot_name} direct URDF FK/IK roundtrip mismatch"
    print(f"  {solver.robot_name}: {solver.num_joints} URDF joints roundtrip [OK]")

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


def test_universal_soft_barrier_and_multi_robot_smoothing():
    print('\n=== Test 7: Universal Soft-Barrier & Multi-Robot Joint Smoothing ===')

    # 1. Test universal_soft_saturation
    limits = (-90.0, 5.0)
    noisy_angles = np.array([4.2, 4.9, 5.3, 4.8, 5.1, 5.5, 4.7, 5.2])
    soft_angles = universal_soft_saturation(noisy_angles, limits[0], limits[1], margin_ratio=0.08)
    assert np.all(soft_angles <= 5.0), 'Must not exceed 5.0'
    assert np.all(soft_angles >= -90.0), 'Must not be less than -90.0'
    print(f'  Soft saturation test passed! Max value: {np.max(soft_angles):.3f} <= 5.0 [OK]')

    # 2. Test smooth_joint_trajectory on SO101OmniKinKinematics
    solver_omni = get_robot_solver('so_arm101_omni_kin', q3_safe_max_deg=0.0)
    T = 60
    t = np.linspace(0, 2, T)
    clean_q = np.zeros((T, 6))
    clean_q[:, 1] = 20.0 * np.sin(t)
    clean_q[:, 2] = -30.0 + 10.0 * np.cos(t)
    rng = np.random.default_rng(0)
    clean_q[:, 3] = -10.0 + 1.5 * np.sin(20 * t) + rng.normal(0, 0.5, T)
    clean_q[:, 5] = 50.0

    raw_wrist_jerk = np.diff(np.diff(clean_q[:, 3]))
    smoothed_q = solver_omni.smooth_joint_trajectory(clean_q, fps=30.0, time_window_ms=350)
    smooth_wrist_jerk = np.diff(np.diff(smoothed_q[:, 3]))

    assert np.all(smoothed_q[:, 3] <= 0.0 + 1e-4), f'Wrist pitch exceeded ceiling: {np.max(smoothed_q[:, 3])}'
    assert np.std(smooth_wrist_jerk) < np.std(raw_wrist_jerk) * 0.35, 'Smoothing must suppress jerk by >65%'
    jumpy_q = np.zeros((T, 6))
    jumpy_q[T // 2:, 1] = 70.0
    bounded_q = solver_omni.smooth_joint_trajectory(jumpy_q, fps=30.0)
    assert np.max(np.abs(np.diff(bounded_q[:, :5], axis=0))) <= 4.0 + 1e-5, 'Final trajectory must obey 120 deg/s slew cap'
    print(f'  OMNI-KIN Joint Smoothing Passed: Jerk std reduced from {np.std(raw_wrist_jerk):.3f} to {np.std(smooth_wrist_jerk):.3f} [OK]')

    # 3. Six-joint chains retain their width and obey URDF velocity limits.
    links = ''.join(f'<link name="link{i}"/>' for i in range(7))
    joints = ''.join(
        f'<joint name="joint{i}" type="revolute"><parent link="link{i}"/><child link="link{i + 1}"/>'
        '<origin xyz="0.1 0 0"/><axis xyz="0 0 1"/><limit lower="-1.5" upper="1.5" velocity="0.4"/></joint>'
        for i in range(6)
    )
    solver_6dof = SerialURDFKinematics(f'<robot name="six_dof">{links}{joints}</robot>', 'link0', 'link6')
    traj_6dof = np.zeros((T, 7))
    traj_6dof[T // 2:, 4] = 60.0
    traj_6dof[:, -1] = 0.5
    smoothed_6dof = solver_6dof.smooth_joint_trajectory(traj_6dof, fps=30.0)
    assert smoothed_6dof.shape == traj_6dof.shape
    assert np.allclose(smoothed_6dof[:, -1], 0.5)
    assert np.max(np.abs(np.diff(smoothed_6dof[:, 4]))) <= np.degrees(0.4 / 30.0) + 1e-5
    print('  Six-joint URDF trajectory shape and velocity limits passed [OK]')
    print('[PASS] Universal Soft-Barrier & Multi-Robot Joint Smoothing verified!')


def test_wrist_roll_regularization_and_gripper_extrinsics():
    print('\n=== Test 8: Wrist Roll Regularization & Gripper Extrinsics ===')
    solver = get_robot_solver('so_arm101_omni_kin')

    # 1. Target with excessive positive roll (+80 deg) must be damped and clamped to <= 30 deg
    target_high_roll = [0.0, -0.22, 0.15, float(np.radians(80.0)), 0.0, 0.0]
    res_high = solver.solve_feasible_ik(target_high_roll)
    roll_q4_high = res_high['joints'][4]
    assert abs(roll_q4_high) <= 35.5, f'Wrist roll exceeded 35 deg: got {roll_q4_high:.2f} deg'
    print(f'  Target roll=+80.0° -> Solved q4={roll_q4_high:.2f}° (within preset bound) [OK]')

    # 2. Target with excessive negative roll (-75 deg) must be damped and clamped to >= -30 deg
    target_low_roll = [0.0, -0.22, 0.15, float(-np.radians(75.0)), 0.0, 0.0]
    res_low = solver.solve_feasible_ik(target_low_roll)
    roll_q4_low = res_low['joints'][4]
    assert abs(roll_q4_low) <= 35.5, f'Wrist roll exceeded 35 deg: got {roll_q4_low:.2f} deg'
    print(f'  Target roll=-75.0° -> Solved q4={roll_q4_low:.2f}° (within preset bound) [OK]')

    # Camera calibration remains separate and cannot alter the URDF-defined TCP.
    before = solver.forward_kinematics(np.zeros(solver.num_joints))
    solver.update_camera_extrinsics(forward_cm=15.0)
    after = solver.forward_kinematics(np.zeros(solver.num_joints))
    assert np.allclose(after, before)
    print('  Camera calibration does not alter the URDF-defined TCP [OK]')

    # 5. Trajectory smoother bounds wild roll jumps
    wild_traj = np.zeros((30, 6))
    wild_traj[:, 4] = np.linspace(-60.0, 60.0, 30)
    smoothed = solver.smooth_joint_trajectory(wild_traj, fps=30.0)
    assert np.all(np.abs(smoothed[:, 4]) <= 35.5), f'Smoothed roll exceeded 35 deg: {np.max(np.abs(smoothed[:, 4]))}'
    print(f'  Wild roll trajectory (-60° to +60°) smoothed to max {np.max(np.abs(smoothed[:, 4])):.2f}° <= 35° [OK]')

    print('[PASS] Wrist Roll Regularization & Gripper Extrinsics verified!')


if __name__ == '__main__':
    test_urdf_chain_specs()
    test_omnikin_forward_inverse_consistency()
    test_so101_forward_inverse_consistency()
    test_so100_forward_inverse_consistency()
    test_workspace_calibrator()
    test_feasible_ik_and_auto_align()
    test_camera_gripper_calibrator()
    test_universal_soft_barrier_and_multi_robot_smoothing()
    test_wrist_roll_regularization_and_gripper_extrinsics()
    print('\nALL ROBOT KINEMATICS & WORKSPACE CALIBRATION TESTS PASSED!')


