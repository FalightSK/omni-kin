"""
test_urdf_converter.py
Unit tests for URDF parsing and bidirectional DH table conversion
"""

import sys
import numpy as np
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from robot_kinematics import (
    URDFParser,
    SO101_URDF_TEMPLATE,
    SO100_URDF_TEMPLATE,
    SO101_DH_TABLE,
    SO100_DH_TABLE,
    get_robot_urdf,
    get_robot_specs
)

def test_parse_so101_urdf():
    print("=== Test 1: Parse SO-101 URDF ===")
    dh_table, specs = URDFParser.parse_urdf(SO101_URDF_TEMPLATE)
    assert specs["robot_name"] == "so101"
    assert len(dh_table) == 5
    
    # Check link lengths matching SO-101 specs
    assert np.isclose(dh_table[0]["d"], 0.118, atol=1e-4)
    assert np.isclose(dh_table[1]["a"], 0.140, atol=1e-4)
    assert np.isclose(dh_table[2]["a"], 0.145, atol=1e-4)
    assert np.isclose(dh_table[4]["d"], 0.110, atol=1e-4)
    
    # Check joint limits in degrees
    assert np.isclose(dh_table[0]["limits_deg"][0], -180.0, atol=1.0)
    assert np.isclose(dh_table[0]["limits_deg"][1], 180.0, atol=1.0)
    assert np.isclose(specs["reach_meters"], 0.395, atol=1e-3)
    print("  [OK] SO-101 link lengths, reach & joint limits matched expected DH table values.")

def test_parse_so100_urdf():
    print("\n=== Test 2: Parse SO-100 URDF ===")
    dh_table, specs = URDFParser.parse_urdf(SO100_URDF_TEMPLATE)
    assert specs["robot_name"] == "so100"
    assert len(dh_table) == 5
    
    # Check link lengths matching SO-100 specs
    assert np.isclose(dh_table[0]["d"], 0.115, atol=1e-4)
    assert np.isclose(dh_table[1]["a"], 0.135, atol=1e-4)
    assert np.isclose(dh_table[2]["a"], 0.140, atol=1e-4)
    assert np.isclose(dh_table[4]["d"], 0.105, atol=1e-4)
    assert np.isclose(specs["reach_meters"], 0.380, atol=1e-3)
    print("  [OK] SO-100 link lengths & reach matched expected DH table values.")

def test_bidirectional_roundtrip():
    print("\n=== Test 3: Bidirectional DH <-> URDF Roundtrip ===")
    # 1. Start with SO101 DH table
    urdf_xml = URDFParser.dh_to_urdf(SO101_DH_TABLE, robot_name="so101_roundtrip")
    assert '<robot name="so101_roundtrip">' in urdf_xml
    assert '<joint name="q0_base_yaw"' in urdf_xml
    assert '<joint name="q4_wrist_roll"' in urdf_xml
    
    # 2. Re-parse the generated URDF
    reparsed_dh, reparsed_specs = URDFParser.parse_urdf(urdf_xml)
    assert reparsed_specs["robot_name"] == "so101_roundtrip"
    
    # 3. Compare with original DH table
    for orig, rep in zip(SO101_DH_TABLE, reparsed_dh):
        assert np.isclose(orig["a"], rep["a"], atol=1e-4), f"{orig['name']} a mismatch: {orig['a']} vs {rep['a']}"
        assert np.isclose(orig["alpha_deg"], rep["alpha_deg"], atol=1e-4), f"{orig['name']} alpha mismatch"
        assert np.isclose(orig["d"], rep["d"], atol=1e-4), f"{orig['name']} d mismatch: {orig['d']} vs {rep['d']}"
        assert np.isclose(orig["theta_offset_deg"], rep["theta_offset_deg"], atol=1e-4), f"{orig['name']} theta_offset mismatch"
        assert np.isclose(orig["limits_deg"][0], rep["limits_deg"][0], atol=1.0)
        assert np.isclose(orig["limits_deg"][1], rep["limits_deg"][1], atol=1.0)
    print("  [OK] Perfect DH -> URDF -> DH roundtrip consistency validated.")

def test_urdf_helper_and_error_handling():
    print("\n=== Test 4: Helper & Error Handling ===")
    # Test helper
    xml101 = get_robot_urdf("so101")
    assert "<robot" in xml101 and "so101" in xml101
    xml100 = get_robot_urdf("so100")
    assert "<robot" in xml100 and "so100" in xml100
    
    # Malformed XML
    try:
        URDFParser.parse_urdf("<robot><incomplete>")
        assert False, "Should have raised ValueError on malformed XML"
    except ValueError as e:
        print(f"  [OK] Caught malformed XML error: {e}")
        
    # Incomplete chain (missing joints)
    try:
        URDFParser.parse_urdf("<robot name='empty'><link name='base_link'/></robot>")
        assert False, "Should have raised ValueError on incomplete joint chain"
    except ValueError as e:
        print(f"  [OK] Caught missing joints error: {e}")

def test_custom_urdf_persistence_and_episode_recalculation():
    print("\n=== Test 5: Custom URDF Persistence & Episode Recalculation ===")
    from server import ROBOT_CONFIG, sync_episode_kinematics, lerobot_exporter
    from robot_kinematics import get_robot_solver

    # 1. Baseline episode with default robot setup
    ROBOT_CONFIG["custom_urdf_enabled"] = False
    ROBOT_CONFIG.pop("custom_dh_table", None)
    ROBOT_CONFIG.pop("custom_specs", None)
    ROBOT_CONFIG.pop("custom_urdf", None)
    ROBOT_CONFIG["robot_type"] = "so_arm101_omni_kin"

    poses = [
        [0.05, 0.00, 0.15, 0.0, 0.0, 0.0],
        [0.06, 0.02, 0.16, 0.0, 0.0, 0.0],
        [0.07, 0.04, 0.17, 0.0, 0.0, 0.0]
    ]
    test_ep = {
        "episode_id": "test_ep_urdf_persist",
        "episode_index": 999,
        "raw_poses": [list(p) for p in poses],
        "poses": [list(p) for p in poses],
        "fps": 30.0,
        "gripper_states": [100.0, 100.0, 100.0]
    }

    sync_episode_kinematics(test_ep)
    base_joints = np.array(test_ep["joint_states"])
    base_link_pos = np.array(test_ep["link_positions"])
    assert base_joints.shape == (3, 6)
    assert test_ep["robot_type"] == "so_arm101_omni_kin"

    # 2. Synthesize custom URDF with elongated links
    custom_dh = [dict(row) for row in SO101_DH_TABLE]
    custom_dh[1]["a"] = 0.220  # 22cm instead of 14cm
    custom_dh[2]["a"] = 0.220  # 22cm instead of 14.5cm
    custom_urdf = URDFParser.dh_to_urdf(custom_dh, robot_name="long_arm_robot")

    parsed_dh, parsed_specs = URDFParser.parse_urdf(custom_urdf)
    assert np.isclose(parsed_dh[1]["a"], 0.220, atol=1e-4)
    assert np.isclose(parsed_dh[2]["a"], 0.220, atol=1e-4)

    # 3. Apply custom URDF to server configuration
    ROBOT_CONFIG["custom_dh_table"] = parsed_dh
    ROBOT_CONFIG["custom_specs"] = parsed_specs
    ROBOT_CONFIG["custom_urdf"] = custom_urdf
    ROBOT_CONFIG["custom_urdf_enabled"] = True

    # Recalculate kinematics for the episode
    sync_episode_kinematics(test_ep)
    new_joints = np.array(test_ep["joint_states"])
    new_link_pos = np.array(test_ep["link_positions"])

    # Verify joint states and link positions changed to fit the new embodiment
    joint_diff = np.max(np.abs(new_joints[:, :4] - base_joints[:, :4]))
    print(f"  Max joint difference after new embodiment: {joint_diff:.2f}°")
    assert joint_diff > 1.0, "Joint trajectory should significantly change with new URDF link lengths"
    assert test_ep["robot_type"] == "custom_urdf"
    assert test_ep["custom_urdf_enabled"] is True

    # 4. Verify lerobot_exporter uses custom parameters
    lerobot_exporter.set_robot_config(
        robot_type=ROBOT_CONFIG["robot_type"],
        custom_dh_table=ROBOT_CONFIG["custom_dh_table"],
        custom_urdf=ROBOT_CONFIG["custom_urdf"]
    )
    assert lerobot_exporter.custom_dh_table is not None
    assert lerobot_exporter.custom_urdf is not None

    # 5. Clean reset back to preset
    ROBOT_CONFIG["custom_urdf_enabled"] = False
    ROBOT_CONFIG.pop("custom_dh_table", None)
    ROBOT_CONFIG.pop("custom_specs", None)
    ROBOT_CONFIG.pop("custom_urdf", None)
    lerobot_exporter.set_robot_config(
        robot_type="so_arm101_omni_kin",
        custom_dh_table=None,
        custom_urdf=None
    )
    assert lerobot_exporter.custom_dh_table is None
    import shutil, os
    from server import RECORDINGS_DIR
    test_dir = os.path.join(RECORDINGS_DIR, "test_ep_urdf_persist")
    if os.path.exists(test_dir):
        shutil.rmtree(test_dir, ignore_errors=True)
    print("  [OK] Custom URDF persistence & automatic episode recalculation validated.")

if __name__ == "__main__":
    test_parse_so101_urdf()
    test_parse_so100_urdf()
    test_bidirectional_roundtrip()
    test_urdf_helper_and_error_handling()
    test_custom_urdf_persistence_and_episode_recalculation()
    print("\n[ALL URDF CONVERTER TESTS PASSED SUCCESSFULLY!]")
