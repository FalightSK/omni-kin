"""Mathematical regression tests for direct selected-chain URDF kinematics."""

import numpy as np
import pytest
import json
from scipy.spatial.transform import Rotation

from robot_kinematics import (
    SerialURDFKinematics,
    get_robot_solver,
    rotation_matrix_to_trajectory_euler,
    trajectory_euler_to_rotation_matrix,
)


def urdf(links, joints, name="direct_chain"):
    return f'<robot name="{name}">' + "".join(f'<link name="{link}"/>' for link in links) + joints + "</robot>"


def test_origin_fixed_transform_rotated_joint_axis_and_prismatic_units():
    xml = urdf(
        ["base", "rotor", "fixed_frame", "tcp"],
        '<joint name="turn" type="revolute"><parent link="base"/><child link="rotor"/>'
        '<origin xyz="1 0 0" rpy="0 0 0"/><axis xyz="0 0 7"/><limit lower="-3.14" upper="3.14"/></joint>'
        '<joint name="tool_mount" type="fixed"><parent link="rotor"/><child link="fixed_frame"/>'
        '<axis xyz="0 0 0"/>'
        '<origin xyz="1 0 0" rpy="0 0 1.5707963267948966"/></joint>'
        '<joint name="slide" type="prismatic"><parent link="fixed_frame"/><child link="tcp"/>'
        '<origin xyz="0.5 0 0"/><axis xyz="4 0 0"/><limit lower="0" upper="0.3"/></joint>'
    )
    solver = SerialURDFKinematics(xml, base_link="base", tcp_link="tcp")
    fk = solver.forward_kinematics([np.pi / 2.0, 0.2])
    # T = origin(turn) Rz(pi/2) · fixed(Tx(1), Rz(pi/2)) · slide(Tx(0.5), Tx(0.2)).
    assert np.allclose(fk[:3], [0.3, 1.0, 0.0], atol=1e-9)
    assert np.allclose(trajectory_euler_to_rotation_matrix(fk[3:]), Rotation.from_euler("z", 180, degrees=True).as_matrix(), atol=1e-9)
    assert np.allclose(rotation_matrix_to_trajectory_euler(trajectory_euler_to_rotation_matrix(fk[3:])), fk[3:], atol=1e-9)
    assert solver.joint_names == ["turn", "slide"]
    assert solver.joint_types == ["revolute", "prismatic"]
    assert solver.joint_units == ["deg", "m"]
    assert np.allclose(solver.state_to_joint_values([90.0, 0.2]), [np.pi / 2.0, 0.2])
    assert np.allclose(solver.joint_values_to_state([np.pi / 2.0, 0.2]), [90.0, 0.2])
    chain = solver.forward_kinematics_chain([np.pi / 2.0, 0.2])
    assert len(chain) == 4  # base, revolute child, fixed child, TCP child
    assert np.allclose(chain[-1], fk[:3])


def test_prismatic_jacobian_and_rotated_revolute_axis_match_analytic_physics():
    xml = urdf(
        ["base", "rotor", "slider", "tcp"],
        '<joint name="turn" type="revolute"><parent link="base"/><child link="rotor"/>'
        '<origin xyz="0.1 0.2 0.3" rpy="0 0 1.5707963267948966"/><axis xyz="0 1 0"/><limit lower="-2" upper="2"/></joint>'
        '<joint name="mount" type="fixed"><parent link="rotor"/><child link="slider"/>'
        '<origin xyz="0.4 0.1 0" rpy="0.2 0 0.1"/></joint>'
        '<joint name="extend" type="prismatic"><parent link="slider"/><child link="tcp"/>'
        '<origin xyz="0 0.2 0"/><axis xyz="1 2 3"/><limit lower="0" upper="0.4"/></joint>'
    )
    solver = SerialURDFKinematics(xml, "base", "tcp")
    q = np.array([0.35, 0.12])
    h = 1e-6
    numeric_rev = (solver.forward_kinematics(q + [h, 0])[:3] - solver.forward_kinematics(q - [h, 0])[:3]) / (2 * h)
    pivot = np.array([0.1, 0.2, 0.3])
    world_axis = Rotation.from_euler("z", np.pi / 2).as_matrix() @ np.array([0.0, 1.0, 0.0])
    analytic_rev = np.cross(world_axis, solver.forward_kinematics(q)[:3] - pivot)
    assert np.allclose(numeric_rev, analytic_rev, atol=2e-7)

    numeric_prismatic = (solver.forward_kinematics(q + [0, h])[:3] - solver.forward_kinematics(q - [0, h])[:3]) / (2 * h)
    T_base_to_slider = np.eye(4)
    T_base_to_slider[:3, :3] = Rotation.from_euler("z", np.pi / 2).as_matrix() @ Rotation.from_euler("y", q[0]).as_matrix() @ Rotation.from_euler("xyz", [0.2, 0, 0.1]).as_matrix()
    expected_prismatic = T_base_to_slider[:3, :3] @ (np.array([1.0, 2.0, 3.0]) / np.sqrt(14.0))
    assert np.allclose(numeric_prismatic, expected_prismatic, atol=2e-7)


def test_bounded_six_joint_ik_round_trip_and_continuity():
    links = [f"l{i}" for i in range(7)]
    axes = ["0 0 1", "0 1 0", "0 1 0", "1 0 0", "0 1 0", "0 0 1"]
    origins = ["0 0 0.12", "0.08 0 0", "0.08 0 0", "0.06 0 0", "0.05 0 0", "0.04 0 0"]
    joints = "".join(
        f'<joint name="j{i}" type="revolute"><parent link="l{i}"/><child link="l{i + 1}"/>'
        f'<origin xyz="{origins[i]}"/><axis xyz="{axes[i]}"/><limit lower="-2.8" upper="2.8"/></joint>'
        for i in range(6)
    )
    solver = get_robot_solver("custom_urdf", custom_urdf=urdf(links, joints), custom_urdf_base_link="l0", custom_urdf_tcp_link="l6")
    assert isinstance(solver, SerialURDFKinematics)
    assert solver.num_joints == 6
    known = np.array([0.2, -0.3, 0.55, -0.35, 0.25, 0.4])
    target = solver.forward_kinematics(known)
    assert target[2] > 0.012
    previous = solver.joint_values_to_state(known + np.array([0.01, -0.01, 0.01, -0.01, 0.01, -0.01]))
    result = solver.solve_feasible_ik(target, gripper_state=0.42, prev_joints=previous)
    solved_internal = solver.state_to_joint_values(result["joints"][:-1])
    round_trip = solver.forward_kinematics(solved_internal)
    assert result["is_feasible"], result["clamped_reasons"]
    assert result["joints"].shape == (7,)  # six selected joints plus separate gripper channel
    assert np.allclose(round_trip[:3], target[:3], atol=0.015)
    assert (Rotation.from_matrix(trajectory_euler_to_rotation_matrix(round_trip[3:])).inv() * Rotation.from_matrix(trajectory_euler_to_rotation_matrix(target[3:]))).magnitude() < 0.15
    assert np.all(np.abs(solved_internal) <= 2.8 + 1e-6)
    assert abs(result["joints"][-1] - 0.42) < 1e-6
    assert len(result["link_positions"]) == 7


def test_five_axis_ik_tracks_tcp_position_with_an_unreachable_orientation_and_rate_bound():
    solver = get_robot_solver("so_arm101_omni_kin", q3_safe_max_deg=45.0)
    initial_state = np.array([20.0, -80.0, 100.0, -30.0, 0.0])
    previous = initial_state.copy()
    max_position_error_m = 0.0
    max_step_deg = np.zeros(solver.num_joints)

    for frame in range(8):
        state = initial_state + np.array([frame, 0.5 * frame, -0.5 * frame, 0.25 * frame, 0.0])
        target = solver.forward_kinematics(solver.state_to_joint_values(state))
        # The calibrated tracker/tool orientation is intentionally outside this
        # five-axis arm's ability to match; translation must remain the primary task.
        target[3:] = [2.7, -1.2, 2.5]
        result = solver.solve_feasible_ik(
            target,
            prev_joints=previous,
            dt_s=1.0 / 30.0,
        )
        solved = result["joints"][:solver.num_joints]
        solved_internal = solver.state_to_joint_values(solved)
        max_step_deg = np.maximum(max_step_deg, np.abs(solved - previous))
        actual = solver.forward_kinematics(solved_internal)
        max_position_error_m = max(max_position_error_m, float(np.linalg.norm(actual[:3] - target[:3])))
        assert result["is_feasible"], result["clamped_reasons"]
        assert np.all(np.isfinite(solved_internal))
        previous = solved.copy()

    assert max_position_error_m < 0.005
    assert np.max(max_step_deg) <= 4.01  # 120 deg/s at 30 FPS


def test_omni_body_tcp_and_roll_are_urdf_rigid_transforms():
    solver = get_robot_solver("so_arm101_omni_kin", q3_safe_max_deg=45.0)
    assert solver.tcp_link == "gripper_frame_link"
    assert solver.chain_joints[-1]["type"] == "fixed"
    assert len(solver.forward_kinematics_chain(np.zeros(5))) == 7

    arm = solver.state_to_joint_values([20, -80, 80, -30, 0])
    rolled = arm.copy()
    rolled[-1] = np.radians(20)
    before = solver.forward_kinematics_chain(arm)
    after = solver.forward_kinematics_chain(rolled)
    assert np.isclose(np.linalg.norm(before[-1] - before[-2]), 0.049882, atol=1e-6)
    assert np.allclose(before[-1], after[-1], atol=1e-7)

    target = solver.forward_kinematics(rolled)
    result = solver.solve_feasible_ik(target, prev_joints=solver.joint_values_to_state(arm))
    actual = solver.state_to_joint_values(result["joints"][:5])
    assert np.linalg.norm(solver.forward_kinematics(actual)[:3] - target[:3]) < 1e-4
    assert abs(np.degrees(actual[-1]) - 20.0) < 0.05
    assert np.allclose(solver.forward_kinematics_chain(actual)[-1], before[-1], atol=1e-4)


def test_planner_handles_custom_chain_for_initial_aware_approach():
    from robot_kinematics import TrajectoryPlanner

    xml = urdf(
        ["base", "x_slide", "tcp"],
        '<joint name="slide_x" type="prismatic"><parent link="base"/><child link="x_slide"/>'
        '<axis xyz="1 0 0"/><limit lower="0" upper="0.2" velocity="0.1"/></joint>'
        '<joint name="slide_z" type="prismatic"><parent link="x_slide"/><child link="tcp"/>'
        '<axis xyz="0 0 1"/><limit lower="0.02" upper="0.2" velocity="0.1"/></joint>'
    )
    solver = SerialURDFKinematics(xml, "base", "tcp")
    planner = TrajectoryPlanner(solver=solver)
    home = np.array([0.05, 0.05])
    start = np.array([0.10, 0.08])
    result = planner.plan_approach_path(
        p_home=solver.forward_kinematics(home),
        p_start=solver.forward_kinematics(start),
        duration_s=0.5,
        fps=20,
        start_in_robot_frame=True,
    )
    states = np.asarray(result["joint_states"])
    assert result["is_feasible"]
    assert states.shape[0] >= 19 and states.shape[1] == 3
    assert np.allclose(states[0, :2], home, atol=1e-4)
    assert np.allclose(states[-1, :2], start, atol=1e-4)
    assert np.all(states[:, 0] >= 0.0) and np.all(states[:, 0] <= 0.2)
    assert np.all(states[:, 1] >= 0.02) and np.all(states[:, 1] <= 0.2)
    dt = result["duration_s"] / (len(states) - 1)
    assert np.max(np.abs(np.diff(states[:, 0]) / dt)) <= 0.1 + 1e-5
    assert np.max(np.abs(np.diff(states[:, 1]) / dt)) <= 0.1 + 1e-5


def test_continuous_joint_is_unbounded_and_ik_keeps_near_previous_turn():
    xml = urdf(
        ["base", "rotor", "tcp"],
        '<joint name="continuous" type="continuous"><parent link="base"/><child link="rotor"/>'
        '<origin xyz="0 0 0.1"/><axis xyz="0 0 1"/></joint>'
        '<joint name="fixed_mount" type="fixed"><parent link="rotor"/><child link="tcp"/><origin xyz="0.2 0 0"/></joint>'
    )
    solver = SerialURDFKinematics(xml, "base", "tcp")
    target = solver.forward_kinematics([4.2])
    result = solver.solve_feasible_ik(target, prev_joints=[np.degrees(4.1)])
    assert result["is_feasible"]
    assert abs(result["joints"][0] - np.degrees(4.2)) < 1e-2
    assert np.isneginf(solver.joint_limits[0][0]) and np.isposinf(solver.joint_limits[0][1])
    json.dumps(solver.specs, allow_nan=False)
    low_target = target.copy()
    low_target[2] = 0.0
    assert "TABLE_COLLISION" in solver.solve_feasible_ik(low_target)["clamped_reasons"]


def test_smoothing_obeys_urdf_velocity_limits_in_native_joint_units():
    xml = urdf(
        ["base", "rotor", "slider"],
        '<joint name="slow_turn" type="revolute"><parent link="base"/><child link="rotor"/>'
        '<axis xyz="0 0 1"/><limit lower="-1" upper="1" velocity="0.5"/></joint>'
        '<joint name="slow_slide" type="prismatic"><parent link="rotor"/><child link="slider"/>'
        '<axis xyz="1 0 0"/><limit lower="0" upper="0.1" velocity="0.02"/></joint>'
    )
    solver = SerialURDFKinematics(xml, "base", "slider")
    states = np.tile([90.0, 0.1, 0.5], (8, 1))
    smoothed = solver.smooth_joint_trajectory(states, fps=100)
    assert smoothed.shape == states.shape
    assert np.allclose(smoothed[:, -1], states[:, -1])
    assert np.max(np.abs(np.diff(smoothed[:, 0]))) <= np.degrees(0.5 / 100) + 1e-5
    assert np.max(np.abs(np.diff(smoothed[:, 1]))) <= 0.02 / 100 + 1e-7
    assert np.all(smoothed[:, 0] <= np.degrees(1.0) + 1e-6)
    assert np.all((smoothed[:, 1] >= -1e-8) & (smoothed[:, 1] <= 0.1 + 1e-8))


def test_link_selection_rejects_missing_ambiguous_and_branched_parent_paths():
    branched = urdf(
        ["base", "arm", "tcp_a", "tcp_b", "gripper"],
        '<joint name="arm_joint" type="revolute"><parent link="base"/><child link="arm"/><axis xyz="0 0 1"/><limit lower="-1" upper="1"/></joint>'
        '<joint name="tcp_a_joint" type="fixed"><parent link="arm"/><child link="tcp_a"/></joint>'
        '<joint name="tcp_b_joint" type="fixed"><parent link="arm"/><child link="tcp_b"/></joint>'
        '<joint name="grip_joint" type="fixed"><parent link="arm"/><child link="gripper"/></joint>'
    )
    with pytest.raises(ValueError, match="Select a TCP link"):
        SerialURDFKinematics(branched)
    with pytest.raises(ValueError, match="No URDF joint path"):
        SerialURDFKinematics(branched, "tcp_a", "base")
    with pytest.raises(ValueError, match="does not exist"):
        SerialURDFKinematics(branched, "missing", "tcp_a")

    multiply_parented = urdf(
        ["base", "arm", "other", "tcp"],
        '<joint name="a" type="fixed"><parent link="base"/><child link="arm"/></joint>'
        '<joint name="b" type="fixed"><parent link="base"/><child link="other"/></joint>'
        '<joint name="c" type="fixed"><parent link="arm"/><child link="tcp"/></joint>'
        '<joint name="d" type="fixed"><parent link="other"/><child link="tcp"/></joint>'
    )
    with pytest.raises(ValueError, match="more than one parent"):
        SerialURDFKinematics(multiply_parented, "base", "tcp")

    gripper_branch = urdf(
        ["base", "wrist", "gripper_base", "left_finger", "right_finger"],
        '<joint name="wrist_roll" type="revolute"><parent link="base"/><child link="wrist"/><axis xyz="0 0 1"/><limit lower="-1" upper="1"/></joint>'
        '<joint name="wrist_tool_mount" type="fixed"><parent link="wrist"/><child link="gripper_base"/></joint>'
        '<joint name="finger_left" type="revolute"><parent link="gripper_base"/><child link="left_finger"/><axis xyz="0 1 0"/><limit lower="-1" upper="1"/></joint>'
        '<joint name="finger_right" type="revolute"><parent link="gripper_base"/><child link="right_finger"/><axis xyz="0 1 0"/><limit lower="-1" upper="1"/></joint>'
    )
    assert SerialURDFKinematics.describe_urdf(gripper_branch)["tcp_candidates"] == ["gripper_base"]


def test_parse_endpoint_returns_direct_chain_without_weakening_pairing():
    from fastapi.testclient import TestClient
    import server

    xml = urdf(
        ["base", "arm", "tcp"],
        '<joint name="spin" type="continuous"><parent link="base"/><child link="arm"/><axis xyz="0 0 1"/></joint>'
        '<joint name="mount" type="fixed"><parent link="arm"/><child link="tcp"/><origin xyz="0.1 0 0"/></joint>'
    )
    client = TestClient(server.app)
    assert client.post("/api/robot/urdf/parse", json={"urdf_text": xml}).status_code == 401
    response = client.post(
        "/api/robot/urdf/parse",
        headers={server.AUTH_HEADER: server.PAIRING_TOKEN},
        json={"urdf_text": xml, "base_link": "base", "tcp_link": "tcp"},
    )
    assert response.status_code == 200, response.text
    payload = response.json()
    assert payload["status"] == "success"
    assert payload["base_link"] == "base" and payload["tcp_link"] == "tcp"
    assert [joint["name"] for joint in payload["chain"]] == ["spin", "mount"]
    assert "dh_table" not in payload
    assert payload["specs"]["joint_units"] == ["deg"]


def test_custom_export_uses_selected_chain_names_units_and_width(tmp_path):
    import cv2
    import pandas as pd
    from lerobot_exporter import LeRobotExporter

    xml = urdf(
        ["base", "rotor", "tcp"],
        '<joint name="turn" type="revolute"><parent link="base"/><child link="rotor"/>'
        '<origin xyz="0 0 0.1"/><axis xyz="0 0 1"/><limit lower="-1" upper="1"/></joint>'
        '<joint name="slide" type="prismatic"><parent link="rotor"/><child link="tcp"/>'
        '<origin xyz="0.2 0 0"/><axis xyz="1 0 0"/><limit lower="0" upper="0.1"/></joint>'
    )
    solver = SerialURDFKinematics(xml, "base", "tcp")
    internal = np.array([0.25, 0.03])
    state = np.r_[solver.joint_values_to_state(internal), 0.4].astype(np.float32)
    pose = solver.forward_kinematics(internal).astype(np.float32)

    video = tmp_path / "custom.mp4"
    writer = cv2.VideoWriter(str(video), cv2.VideoWriter_fourcc(*"mp4v"), 30, (64, 48))
    assert writer.isOpened(), "Could not create custom export video fixture"
    writer.write(np.zeros((48, 64, 3), dtype=np.uint8))
    writer.write(np.full((48, 64, 3), 32, dtype=np.uint8))
    writer.release()

    exporter = LeRobotExporter(
        output_dir=str(tmp_path / "exports"), fps=30, robot_type="custom_urdf",
        custom_urdf=xml, custom_urdf_base_link="base", custom_urdf_tcp_link="tcp",
    )
    episode = {
        "episode_index": 0,
        "task": "custom chain export",
        "video_path": str(video),
        "robot_type": "custom_urdf",
        "selected_base_link": "base",
        "selected_tcp_link": "tcp",
        "kinematics_engine_version": "direct_urdf_chain_v1",
        "robot_ee_poses": [pose.tolist(), pose.tolist()],
        "joint_states": [state.tolist(), state.tolist()],
        "actions": [state.tolist(), state.tolist()],
        "timestamps": [0.0, 1.0 / 30.0],
    }
    output = exporter.export_dataset([episode], dataset_name="custom_chain", use_timestamp=False)

    with open(tmp_path / "exports" / "custom_chain" / "meta" / "info.json", encoding="utf-8") as source:
        info = json.load(source)
    frame_data = pd.read_parquet(tmp_path / "exports" / "custom_chain" / "data" / "chunk-000" / "file-000.parquet")
    feature = info["features"]["observation.state"]
    assert output == str(tmp_path / "exports" / "custom_chain")
    assert feature["shape"] == [3]
    assert feature["names"] == ["turn", "slide", "gripper"]
    assert info["robot_kinematics"]["joint_types"] == ["revolute", "prismatic"]
    assert info["robot_kinematics"]["joint_units"] == ["deg", "m"]
    assert info["robot_kinematics"]["base_link"] == "base"
    assert info["robot_kinematics"]["tcp_link"] == "tcp"
    assert "dh_table" not in info
    assert frame_data["observation.state"].map(len).tolist() == [3, 3]
    assert frame_data["action"].map(len).tolist() == [3, 3]

