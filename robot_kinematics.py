"""
robot_kinematics.py
Denavit-Hartenberg (DH) Kinematics Engine for SO-100 and SO-101 Robot Arms
Includes WorkspaceCalibrator for ArUco Table-Plane-to-Robot-Base Coordinate Transformations
"""

import os
import numpy as np
import xml.etree.ElementTree as ET

# ==============================================================================
# 1. Denavit-Hartenberg (DH) Parameter Specifications
# ==============================================================================
# Standard DH Convention:
#   theta_i : Rotation around Z_{i-1} (variable for revolute joint + theta_offset)
#   d_i     : Translation along Z_{i-1} (link offset)
#   a_i     : Translation along X_i     (link length)
#   alpha_i : Rotation around X_i       (link twist)
# ==============================================================================

SO100_DH_TABLE = [
    {
        "joint_idx": 0,
        "name": "q0_base_yaw",
        "type": "revolute",
        "theta_offset_deg": 0.0,
        "d": 0.115,  # Base to shoulder height (meters)
        "a": 0.000,
        "alpha_deg": 90.0,
        "limits_deg": [-180.0, 180.0]
    },
    {
        "joint_idx": 1,
        "name": "q1_shoulder_pitch",
        "type": "revolute",
        "theta_offset_deg": 0.0,
        "d": 0.000,
        "a": 0.135,  # Upper arm length (meters)
        "alpha_deg": 0.0,
        "limits_deg": [-100.0, 100.0]
    },
    {
        "joint_idx": 2,
        "name": "q2_elbow_pitch",
        "type": "revolute",
        "theta_offset_deg": 0.0,
        "d": 0.000,
        "a": 0.140,  # Forearm length (meters)
        "alpha_deg": 0.0,
        "limits_deg": [-150.0, 150.0]
    },
    {
        "joint_idx": 3,
        "name": "q3_wrist_pitch",
        "type": "revolute",
        "theta_offset_deg": 0.0,
        "d": 0.000,
        "a": 0.000,
        "alpha_deg": 90.0,
        "limits_deg": [-100.0, 100.0]
    },
    {
        "joint_idx": 4,
        "name": "q4_wrist_roll",
        "type": "revolute",
        "theta_offset_deg": 0.0,
        "d": 0.105,  # Wrist to gripper tip (meters)
        "a": 0.000,
        "alpha_deg": 0.0,
        "limits_deg": [-180.0, 180.0]
    }
]

SO101_DH_TABLE = [
    {
        "joint_idx": 0,
        "name": "q0_base_yaw",
        "type": "revolute",
        "theta_offset_deg": 0.0,
        "d": 0.118,  # Base to shoulder height (meters) - reinforced base
        "a": 0.000,
        "alpha_deg": 90.0,
        "limits_deg": [-180.0, 180.0]
    },
    {
        "joint_idx": 1,
        "name": "q1_shoulder_pitch",
        "type": "revolute",
        "theta_offset_deg": 0.0,
        "d": 0.000,
        "a": 0.140,  # Upper arm length (meters)
        "alpha_deg": 0.0,
        "limits_deg": [-100.0, 100.0]
    },
    {
        "joint_idx": 2,
        "name": "q2_elbow_pitch",
        "type": "revolute",
        "theta_offset_deg": 0.0,
        "d": 0.000,
        "a": 0.145,  # Forearm length (meters)
        "alpha_deg": 0.0,
        "limits_deg": [-150.0, 150.0]
    },
    {
        "joint_idx": 3,
        "name": "q3_wrist_pitch",
        "type": "revolute",
        "theta_offset_deg": 0.0,
        "d": 0.000,
        "a": 0.000,
        "alpha_deg": 90.0,
        "limits_deg": [-100.0, 100.0]
    },
    {
        "joint_idx": 4,
        "name": "q4_wrist_roll",
        "type": "revolute",
        "theta_offset_deg": 0.0,
        "d": 0.110,  # Wrist to gripper tip (meters)
        "a": 0.000,
        "alpha_deg": 0.0,
        "limits_deg": [-180.0, 180.0]
    }
]

SO101_OMNIKIN_DH_TABLE = [
    {
        "joint_idx": 0,
        "name": "base_yaw_joint",
        "type": "revolute",
        "theta_offset_deg": 0.0,
        "d": 0.119,  # Combined base (6.04cm) + shoulder (5.87cm) height
        "a": 0.000,
        "alpha_deg": 90.0,
        "limits_deg": [-105.0, 105.0]
    },
    {
        "joint_idx": 1,
        "name": "shoulder_pitch_joint",
        "type": "revolute",
        "theta_offset_deg": 0.0,
        "d": 0.000,
        "a": 0.140,  # Upper arm length (meters)
        "alpha_deg": 0.0,
        "limits_deg": [-185.0, 15.0]
    },
    {
        "joint_idx": 2,
        "name": "elbow_joint",
        "type": "revolute",
        "theta_offset_deg": 0.0,
        "d": 0.000,
        "a": 0.135,  # Lower arm length (meters)
        "alpha_deg": 0.0,
        "limits_deg": [0.0, 190.0]
    },
    {
        "joint_idx": 3,
        "name": "wrist_pitch_joint",
        "type": "revolute",
        "theta_offset_deg": 0.0,
        "d": 0.000,
        "a": 0.000,
        "alpha_deg": 90.0,
        "limits_deg": [-100.0, 100.0]
    },
    {
        "joint_idx": 4,
        "name": "wrist_roll_joint",
        "type": "revolute",
        "theta_offset_deg": 0.0,
        "d": 0.110,  # Wrist to gripper tip (5.85cm + 5.15cm)
        "a": 0.000,
        "alpha_deg": 0.0,
        "limits_deg": [-180.0, 180.0]
    }
]


def dh_transform(theta_rad, d, a, alpha_rad):
    """
    Computes standard 4x4 Denavit-Hartenberg transformation matrix A_i.
    """
    cos_t = np.cos(theta_rad)
    sin_t = np.sin(theta_rad)
    cos_a = np.cos(alpha_rad)
    sin_a = np.sin(alpha_rad)

    return np.array([
        [cos_t, -sin_t * cos_a,  sin_t * sin_a, a * cos_t],
        [sin_t,  cos_t * cos_a, -cos_t * sin_a, a * sin_t],
        [0.0,    sin_a,          cos_a,         d        ],
        [0.0,    0.0,            0.0,           1.0      ]
    ], dtype=np.float64)


# ==============================================================================
# 2. Base DH Kinematics Engine
# ==============================================================================

class DHKinematics:
    """
    Kinematics engine driven directly by a Denavit-Hartenberg (DH) parameter table.
    Supports 5-DOF arms with serial planar pitch joints + wrist roll + gripper.
    """

    def __init__(self, dh_table, model_name="SO-Robot"):
        self.dh_table = dh_table
        self.model_name = model_name

        # Extract link lengths from DH table:
        # d_1: Base height L1
        # a_2: Upper arm L2
        # a_3: Forearm L3
        # d_5: Wrist-to-gripper tip L4
        self.L1 = float(self.dh_table[0]["d"])
        self.L2 = float(self.dh_table[1]["a"])
        self.L3 = float(self.dh_table[2]["a"])
        self.L4 = float(self.dh_table[4]["d"])

        self.max_reach = self.L2 + self.L3 + self.L4

        # Extract joint limits in radians
        self.joint_limits = []
        for row in self.dh_table:
            min_deg, max_deg = row["limits_deg"]
            self.joint_limits.append((np.radians(min_deg), np.radians(max_deg)))
        # Gripper limit (0.0=closed to 100.0=open)
        self.joint_limits.append((0.0, 100.0))

    def get_dh_table(self):
        """Returns the DH parameter table representation."""
        return self.dh_table

    def forward_kinematics(self, joints):
        """
        Computes Forward Kinematics via DH matrix chain.
        joints: array-like of [q0, q1, q2, q3, q4] (in radians).
        Returns: np.array([x, y, z, roll, pitch, yaw])
        """
        q0, q1, q2, q3, q4 = joints[:5]

        # Planar pitch angle sums
        th1 = q1
        th2 = q1 + q2
        th3 = q1 + q2 + q3

        # Planar reach (r) and height (z)
        r = self.L2 * np.cos(th1) + self.L3 * np.cos(th2) + self.L4 * np.cos(th3)
        z = self.L1 + self.L2 * np.sin(th1) + self.L3 * np.sin(th2) + self.L4 * np.sin(th3)

        x = r * np.cos(q0)
        y = r * np.sin(q0)

        roll = q4
        pitch = th3
        yaw = q0

        return np.array([x, y, z, roll, pitch, yaw], dtype=np.float64)

    def forward_kinematics_dh_chain(self, joints):
        """
        Computes the complete homogeneous 4x4 matrix chain T_0^5 = A_1 * A_2 * A_3 * A_4 * A_5.
        Returns 4x4 numpy array.
        """
        q = joints[:5]
        T = np.eye(4, dtype=np.float64)

        for i, row in enumerate(self.dh_table):
            theta = q[i] + np.radians(row["theta_offset_deg"])
            d = row["d"]
            a = row["a"]
            alpha = np.radians(row["alpha_deg"])
            A_i = dh_transform(theta, d, a, alpha)
            T = T @ A_i

        return T

    def solve_feasible_ik(self, target_pose, gripper_state=50.0, prev_joints=None, allow_pitch_adaptation=True):
        """
        Robust Inverse Kinematics solver designed to solve impossible or boundary kinematics
        for serial 5-DOF arms (SO-100 / SO-101).
        
        Handles:
          1. Target out-of-reach: Soft-damps wrist distance to maximum reachable boundary.
          2. Inner singularity: Keeps wrist outside shoulder singularity cylinder.
          3. Table collision: Enforces minimum physical clearance above table surface.
          4. Joint mechanical limits: Explores alternative elbow configurations and performs
             task-priority pitch adaptation (adjusting approach pitch to preserve exact (X, Y, Z)
             Cartesian tip position).
          5. Returns feasibility diagnostics, achieved forward kinematics pose, and error metrics.
        """
        x, y, z, roll, pitch, yaw = target_pose
        clamped_reasons = []

        # 1. Base yaw (q0) is determined by target direction in polar space
        q0 = np.arctan2(y, x)
        r = float(np.hypot(x, y))

        # Table clearance constraint: cannot plunge below table surface
        z_eff = max(0.012, float(z))
        if z < 0.012:
            clamped_reasons.append("TABLE_COLLISION")

        # Maximum & minimum physical reach of arm links
        max_reach_wrist = (self.L2 + self.L3) * 0.995
        min_reach_wrist = max(0.020, abs(self.L2 - self.L3) + 0.010)

        best_q = None
        best_err = 1e9
        best_is_exact = False

        # Generate candidate approach pitch angles
        # Nominal pitch first, followed by angular perturbations if limits are saturated
        pitch_candidates = [pitch]
        if allow_pitch_adaptation:
            for delta_deg in range(5, 75, 5):
                pitch_candidates.append(pitch - np.radians(delta_deg))
                pitch_candidates.append(pitch + np.radians(delta_deg))

        for p_cand in pitch_candidates:
            p_clamped = np.clip(p_cand, -np.radians(85), np.radians(85))

            r_w = r - self.L4 * np.cos(p_clamped)
            z_w = (z_eff - self.L1) - self.L4 * np.sin(p_clamped)

            d_w = np.hypot(r_w, z_w)
            was_clamped = False

            if d_w > max_reach_wrist:
                scale_w = max_reach_wrist / max(1e-6, d_w)
                r_w *= scale_w
                z_w *= scale_w
                d_w = max_reach_wrist
                was_clamped = True
                clamped_reasons.append("OUT_OF_REACH")

            if d_w < min_reach_wrist:
                scale_w = min_reach_wrist / max(1e-6, d_w)
                r_w *= scale_w
                z_w *= scale_w
                d_w = min_reach_wrist
                was_clamped = True

            d2 = d_w**2
            cos_q2 = (d2 - self.L2**2 - self.L3**2) / (2.0 * self.L2 * self.L3)
            cos_q2 = np.clip(cos_q2, -1.0, 1.0)

            configs_to_test = [True, False] if prev_joints is None else [True]

            for elbow_up in configs_to_test:
                q2 = -np.arccos(cos_q2) if elbow_up else np.arccos(cos_q2)
                alpha = np.arctan2(z_w, r_w)
                beta = np.arctan2(self.L3 * np.sin(q2), self.L2 + self.L3 * np.cos(q2))
                q1 = alpha - beta
                q3 = p_clamped - (q1 + q2)
                q4 = roll

                q_rad = [q0, q1, q2, q3, q4]
                in_limits = True
                for j in range(5):
                    lo, hi = self.joint_limits[j]
                    if q_rad[j] < lo - 1e-4 or q_rad[j] > hi + 1e-4:
                        in_limits = False
                        break

                if in_limits:
                    fk = self.forward_kinematics(q_rad)
                    pos_err = float(np.linalg.norm(fk[:3] - np.array([x, y, z])))
                    pitch_diff = abs(p_clamped - pitch)
                    score = pos_err * 100.0 + pitch_diff * 0.1

                    if score < best_err:
                        best_err = score
                        best_q = q_rad
                        if pos_err < 0.005 and not was_clamped:
                            best_is_exact = True
                            break

            if best_is_exact:
                break

        if best_q is None:
            # Fallback: enforce limits by projection
            r_w = r - self.L4 * np.cos(pitch)
            z_w = (z_eff - self.L1) - self.L4 * np.sin(pitch)
            d_w = np.hypot(r_w, z_w)
            if d_w > max_reach_wrist:
                clamped_reasons.append("OUT_OF_REACH")
                r_w *= max_reach_wrist / d_w
                z_w *= max_reach_wrist / d_w
                d_w = max_reach_wrist

            d2 = d_w**2
            cos_q2 = np.clip((d2 - self.L2**2 - self.L3**2) / (2.0 * self.L2 * self.L3), -1.0, 1.0)
            q2 = -np.arccos(cos_q2)
            alpha = np.arctan2(z_w, r_w)
            beta = np.arctan2(self.L3 * np.sin(q2), self.L2 + self.L3 * np.cos(q2))
            q1 = alpha - beta
            q3 = pitch - (q1 + q2)
            q4 = roll
            best_q = [q0, q1, q2, q3, q4]
            for j in range(5):
                lo, hi = self.joint_limits[j]
                if best_q[j] < lo or best_q[j] > hi:
                    clamped_reasons.append(f"JOINT_LIMIT_Q{j}")
                best_q[j] = float(np.clip(best_q[j], lo, hi))

        # Convert to degrees
        joints_deg = np.degrees(best_q)
        full_joints = np.append(joints_deg, float(gripper_state))

        # Compute achieved forward kinematics pose
        achieved_pose = self.forward_kinematics(best_q)
        err_dist_cm = float(np.linalg.norm(achieved_pose[:3] - np.array([x, y, z])) * 100.0)
        is_feasible = (err_dist_cm < 1.5) and (len(clamped_reasons) == 0)

        return {
            "joints": full_joints,
            "achieved_pose": achieved_pose,
            "is_feasible": is_feasible,
            "error_distance_cm": round(err_dist_cm, 2),
            "clamped_reasons": list(set(clamped_reasons))
        }

    def inverse_kinematics(self, target_pose, gripper_state=50.0, prev_joints=None, elbow_up=True, allow_pitch_adaptation=True):
        """
        Compute Inverse Kinematics for target_pose = [x, y, z, roll, pitch, yaw].
        Uses the robust feasible IK solver to ensure zero NaNs, joint limit satisfaction,
        and tabletop clearance. Returns joint array [q0, q1, q2, q3, q4, q5] in degrees.
        """
        res = self.solve_feasible_ik(
            target_pose,
            gripper_state=gripper_state,
            prev_joints=prev_joints,
            allow_pitch_adaptation=allow_pitch_adaptation
        )
        return res["joints"]

    def map_phone_to_workspace(self, phone_pose, workspace_center=[0.25, 0.0, 0.15], scale=0.8):
        """
        Maps phone 6-DoF trajectory coordinates to reachable arm workspace.
        """
        px, py, pz, proll, ppitch, pyaw = phone_pose

        arm_x = workspace_center[0] + px * scale
        arm_y = workspace_center[1] + py * scale
        arm_z = workspace_center[2] + pz * scale

        max_reach = self.max_reach * 0.90
        arm_x = np.clip(arm_x, 0.08, max_reach)
        arm_y = np.clip(arm_y, -max_reach * 0.7, max_reach * 0.7)
        arm_z = np.clip(arm_z, 0.02, max_reach)

        return np.array([arm_x, arm_y, arm_z, proll, ppitch, pyaw])


# ==============================================================================
# 3. Model Specializations
# ==============================================================================

class SO100Kinematics(DHKinematics):
    """SO-100 5-DOF Robot Arm Kinematics (LeRobot Original Preset)."""
    def __init__(self):
        super().__init__(SO100_DH_TABLE, model_name="SO-100")


class SO101OmniKinKinematics(DHKinematics):
    """SO-ARM101-OMNI-KIN 5-DOF Robot Arm Kinematics (Default Project Setup)."""
    def __init__(self):
        super().__init__(SO101_OMNIKIN_DH_TABLE, model_name="SO-ARM101-OMNI-KIN")


class SO101Kinematics(DHKinematics):
    """SO-101 5-DOF Robot Arm Kinematics (Refined Open Hardware Preset)."""
    def __init__(self):
        super().__init__(SO101_DH_TABLE, model_name="SO-101")


ROBOT_PRESETS = {
    "so_arm101_omni_kin": {
        "name": "SO-ARM101-OMNI-KIN (Default)",
        "description": "Custom OMNI-KIN 5-DOF Manipulator with URDF-matched kinematic parameters, reinforced brackets, and Feetech STS3215 servos.",
        "class": SO101OmniKinKinematics,
        "dh_table": SO101_OMNIKIN_DH_TABLE,
        "reach_meters": 0.385,
        "payload_kg": 0.50
    },
    "so101": {
        "name": "SO-101 (Refined)",
        "description": "5-DOF Open Manipulator with reinforced structural brackets and Feetech STS3215 servos.",
        "class": SO101Kinematics,
        "dh_table": SO101_DH_TABLE,
        "reach_meters": 0.395,
        "payload_kg": 0.50
    },
    "so100": {
        "name": "SO-100 (Classic)",
        "description": "Original 5-DOF LeRobot open embodiment with Feetech STS3215 servos.",
        "class": SO100Kinematics,
        "dh_table": SO100_DH_TABLE,
        "reach_meters": 0.380,
        "payload_kg": 0.50
    }
}


def normalize_robot_type(robot_type):
    """Normalizes robot type string and resolves aliases."""
    if not robot_type:
        return "so_arm101_omni_kin"
    r = str(robot_type).lower().strip().replace("-", "_")
    if "omni" in r or "arm101" in r:
        return "so_arm101_omni_kin"
    if "100" in r:
        return "so100"
    if "101" in r:
        return "so101"
    return r if r in ROBOT_PRESETS else "so_arm101_omni_kin"


def get_robot_solver(robot_type="so_arm101_omni_kin"):
    """Factory helper to obtain the kinematic solver instance."""
    r_type = normalize_robot_type(robot_type)
    if r_type in ROBOT_PRESETS:
        return ROBOT_PRESETS[r_type]["class"]()
    return SO101OmniKinKinematics()


def get_robot_specs(robot_type="so_arm101_omni_kin"):
    """Returns metadata and DH table for the specified robot preset."""
    r_type = normalize_robot_type(robot_type)
    preset = ROBOT_PRESETS.get(r_type, ROBOT_PRESETS["so_arm101_omni_kin"])
    return {
        "robot_type": r_type,
        "name": preset["name"],
        "description": preset["description"],
        "reach_meters": preset["reach_meters"],
        "payload_kg": preset["payload_kg"],
        "dh_table": preset["dh_table"],
        "urdf": get_robot_urdf(r_type)
    }


# ==============================================================================
# 4. URDF Parser & Converter (URDF XML <-> DH Table)
# ==============================================================================

SO101_URDF_TEMPLATE = """<?xml version="1.0" encoding="utf-8"?>
<robot name="so101">
  <!-- Base Link fixed to table surface (Z=0) -->
  <link name="base_link"/>

  <!-- Joint 0: Base Yaw (-180 to +180 deg) -->
  <joint name="q0_base_yaw" type="revolute">
    <parent link="base_link"/>
    <child link="shoulder_link"/>
    <origin xyz="0 0 0.118" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-3.14159265" upper="3.14159265" effort="5.0" velocity="2.0"/>
  </joint>

  <link name="shoulder_link"/>

  <!-- Joint 1: Shoulder Pitch (-100 to +100 deg) -->
  <joint name="q1_shoulder_pitch" type="revolute">
    <parent link="shoulder_link"/>
    <child link="upper_arm_link"/>
    <origin xyz="0 0 0" rpy="1.5707963 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.745329" upper="1.745329" effort="5.0" velocity="2.0"/>
  </joint>

  <link name="upper_arm_link"/>

  <!-- Joint 2: Elbow Pitch (-150 to +150 deg) -->
  <joint name="q2_elbow_pitch" type="revolute">
    <parent link="upper_arm_link"/>
    <child link="forearm_link"/>
    <origin xyz="0.140 0 0" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-2.61799" upper="2.61799" effort="5.0" velocity="2.0"/>
  </joint>

  <link name="forearm_link"/>

  <!-- Joint 3: Wrist Pitch (-100 to +100 deg) -->
  <joint name="q3_wrist_pitch" type="revolute">
    <parent link="forearm_link"/>
    <child link="wrist_link"/>
    <origin xyz="0.145 0 0" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.745329" upper="1.745329" effort="3.0" velocity="2.5"/>
  </joint>

  <link name="wrist_link"/>

  <!-- Joint 4: Wrist Roll (-180 to +180 deg) -->
  <joint name="q4_wrist_roll" type="revolute">
    <parent link="wrist_link"/>
    <child link="gripper_base"/>
    <origin xyz="0 0 0" rpy="1.5707963 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-3.14159265" upper="3.14159265" effort="2.0" velocity="3.0"/>
  </joint>

  <link name="gripper_base"/>

  <!-- Joint 5: Gripper Jaw (0% closed to 100% open) -->
  <joint name="q5_gripper" type="prismatic">
    <parent link="gripper_base"/>
    <child link="gripper_tip"/>
    <origin xyz="0.110 0 0" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="0.0" upper="100.0" effort="2.0" velocity="1.0"/>
  </joint>

  <link name="gripper_tip"/>
</robot>"""

SO100_URDF_TEMPLATE = """<?xml version="1.0" encoding="utf-8"?>
<robot name="so100">
  <link name="base_link"/>

  <joint name="q0_base_yaw" type="revolute">
    <parent link="base_link"/>
    <child link="shoulder_link"/>
    <origin xyz="0 0 0.115" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-3.14159265" upper="3.14159265" effort="5.0" velocity="2.0"/>
  </joint>

  <link name="shoulder_link"/>

  <joint name="q1_shoulder_pitch" type="revolute">
    <parent link="shoulder_link"/>
    <child link="upper_arm_link"/>
    <origin xyz="0 0 0" rpy="1.5707963 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.745329" upper="1.745329" effort="5.0" velocity="2.0"/>
  </joint>

  <link name="upper_arm_link"/>

  <joint name="q2_elbow_pitch" type="revolute">
    <parent link="upper_arm_link"/>
    <child link="forearm_link"/>
    <origin xyz="0.135 0 0" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-2.61799" upper="2.61799" effort="5.0" velocity="2.0"/>
  </joint>

  <link name="forearm_link"/>

  <joint name="q3_wrist_pitch" type="revolute">
    <parent link="forearm_link"/>
    <child link="wrist_link"/>
    <origin xyz="0.140 0 0" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.745329" upper="1.745329" effort="3.0" velocity="2.5"/>
  </joint>

  <link name="wrist_link"/>

  <joint name="q4_wrist_roll" type="revolute">
    <parent link="wrist_link"/>
    <child link="gripper_base"/>
    <origin xyz="0 0 0" rpy="1.5707963 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-3.14159265" upper="3.14159265" effort="2.0" velocity="3.0"/>
  </joint>

  <link name="gripper_base"/>

  <joint name="q5_gripper" type="prismatic">
    <parent link="gripper_base"/>
    <child link="gripper_tip"/>
    <origin xyz="0.105 0 0" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="0.0" upper="100.0" effort="2.0" velocity="1.0"/>
  </joint>

  <link name="gripper_tip"/>
</robot>"""


class URDFParser:
    """
    Bidirectional parser converting between ROS/Isaac URDF XML descriptions
    and standard Denavit-Hartenberg (DH) parameter tables.
    """

    @staticmethod
    def parse_urdf(urdf_text):
        """
        Parses a URDF XML string, extracts the serial kinematic joint chain,
        and constructs the corresponding Denavit-Hartenberg (DH) table and robot metadata.
        Returns: (dh_table, specs_dict)
        """
        if not urdf_text or not urdf_text.strip():
            raise ValueError("Empty URDF XML provided.")

        try:
            root = ET.fromstring(urdf_text.strip())
        except Exception as e:
            raise ValueError(f"Invalid XML syntax in URDF: {e}")

        robot_name = root.get("name", "custom_robot")

        joints_by_parent = {}
        joints_by_child = {}
        joints_dict = {}

        for joint_elem in root.findall("joint"):
            j_name = joint_elem.get("name", "joint")
            j_type = joint_elem.get("type", "revolute")
            parent_elem = joint_elem.find("parent")
            child_elem = joint_elem.find("child")
            origin_elem = joint_elem.find("origin")
            limit_elem = joint_elem.find("limit")
            axis_elem = joint_elem.find("axis")

            parent_link = parent_elem.get("link") if parent_elem is not None else ""
            child_link = child_elem.get("link") if child_elem is not None else ""

            xyz = [0.0, 0.0, 0.0]
            rpy = [0.0, 0.0, 0.0]
            if origin_elem is not None:
                if "xyz" in origin_elem.attrib:
                    xyz = [float(v) for v in origin_elem.attrib["xyz"].split()]
                if "rpy" in origin_elem.attrib:
                    rpy = [float(v) for v in origin_elem.attrib["rpy"].split()]

            axis = [0.0, 0.0, 1.0]
            if axis_elem is not None and "xyz" in axis_elem.attrib:
                axis = [float(v) for v in axis_elem.attrib["xyz"].split()]

            limits_deg = [-180.0, 180.0]
            if limit_elem is not None:
                low_val = float(limit_elem.get("lower", -np.pi))
                high_val = float(limit_elem.get("upper", np.pi))
                if j_type == "revolute":
                    limits_deg = [round(float(np.degrees(low_val)), 1), round(float(np.degrees(high_val)), 1)]
                else:
                    limits_deg = [round(float(low_val), 1), round(float(high_val), 1)]

            joint_info = {
                "name": j_name,
                "type": j_type,
                "parent": parent_link,
                "child": child_link,
                "xyz": xyz,
                "rpy": rpy,
                "axis": axis,
                "limits_deg": limits_deg
            }
            joints_dict[j_name] = joint_info
            joints_by_parent[parent_link] = joint_info
            joints_by_child[child_link] = joint_info

        if not joints_dict:
            raise ValueError("No <joint> definitions found in URDF.")

        # Find base link (parent link that is never a child)
        all_parents = set(joints_by_parent.keys())
        all_children = set(joints_by_child.keys())
        base_candidates = list(all_parents - all_children)
        current_link = base_candidates[0] if base_candidates else list(all_parents)[0]

        # Trace ordered joint chain
        ordered_joints = []
        while current_link in joints_by_parent:
            j_info = joints_by_parent[current_link]
            ordered_joints.append(j_info)
            current_link = j_info["child"]

        # Filter arm joints + gripper
        arm_joints = [j for j in ordered_joints if j["type"] in ["revolute", "continuous"]]
        gripper_joint = next((j for j in ordered_joints if j["type"] in ["prismatic", "revolute"] and ("grip" in j["name"].lower() or j["type"] == "prismatic")), None)

        if len(arm_joints) < 3:
            arm_joints = ordered_joints[:5]

        # Extract link lengths
        # L1: Base to shoulder height
        j0 = arm_joints[0] if len(arm_joints) > 0 else None
        j1 = arm_joints[1] if len(arm_joints) > 1 else None
        z0 = abs(j0["xyz"][2]) if j0 else 0.0
        z1 = abs(j1["xyz"][2]) if j1 else 0.0
        if z0 + z1 > 0.08:
            L1 = z0 + z1
        else:
            L1 = abs(j0["xyz"][2]) if j0 and abs(j0["xyz"][2]) > 0.01 else 0.119
            if L1 < 0.01 and j0:
                L1 = float(np.linalg.norm(j0["xyz"]))

        # L2: Upper arm length
        j2 = arm_joints[2] if len(arm_joints) > 2 else None
        if j2:
            norm2 = float(np.linalg.norm(j2["xyz"]))
            L2 = norm2 if norm2 > 0.05 else 0.140
        else:
            L2 = 0.140

        # L3: Forearm length
        j3 = arm_joints[3] if len(arm_joints) > 3 else None
        if j3:
            norm3 = float(np.linalg.norm(j3["xyz"]))
            L3 = norm3 if norm3 > 0.05 else 0.135
        else:
            L3 = 0.135

        # L4: Wrist to gripper tip
        L4 = 0.110
        if gripper_joint:
            norm_grip = float(np.linalg.norm(gripper_joint["xyz"]))
            if norm_grip > 0.03:
                L4 = norm_grip

        # Construct DH Table
        dh_table = [
            {
                "joint_idx": 0,
                "name": arm_joints[0]["name"] if len(arm_joints) > 0 else "q0_base_yaw",
                "type": "revolute",
                "theta_offset_deg": 0.0,
                "d": round(float(L1), 4),
                "a": 0.0,
                "alpha_deg": 90.0,
                "limits_deg": arm_joints[0]["limits_deg"] if len(arm_joints) > 0 else [-180.0, 180.0]
            },
            {
                "joint_idx": 1,
                "name": arm_joints[1]["name"] if len(arm_joints) > 1 else "q1_shoulder_pitch",
                "type": "revolute",
                "theta_offset_deg": 0.0,
                "d": 0.0,
                "a": round(float(L2), 4),
                "alpha_deg": 0.0,
                "limits_deg": arm_joints[1]["limits_deg"] if len(arm_joints) > 1 else [-100.0, 100.0]
            },
            {
                "joint_idx": 2,
                "name": arm_joints[2]["name"] if len(arm_joints) > 2 else "q2_elbow_pitch",
                "type": "revolute",
                "theta_offset_deg": 0.0,
                "d": 0.0,
                "a": round(float(L3), 4),
                "alpha_deg": 0.0,
                "limits_deg": arm_joints[2]["limits_deg"] if len(arm_joints) > 2 else [-150.0, 150.0]
            },
            {
                "joint_idx": 3,
                "name": arm_joints[3]["name"] if len(arm_joints) > 3 else "q3_wrist_pitch",
                "type": "revolute",
                "theta_offset_deg": 0.0,
                "d": 0.0,
                "a": 0.0,
                "alpha_deg": 90.0,
                "limits_deg": arm_joints[3]["limits_deg"] if len(arm_joints) > 3 else [-100.0, 100.0]
            },
            {
                "joint_idx": 4,
                "name": arm_joints[4]["name"] if len(arm_joints) > 4 else "q4_wrist_roll",
                "type": "revolute",
                "theta_offset_deg": 0.0,
                "d": round(float(L4), 4),
                "a": 0.0,
                "alpha_deg": 0.0,
                "limits_deg": arm_joints[4]["limits_deg"] if len(arm_joints) > 4 else [-180.0, 180.0]
            }
        ]

        reach_m = round(float(L2 + L3 + L4), 3)
        specs = {
            "robot_name": robot_name,
            "total_joints_parsed": len(ordered_joints),
            "revolute_joints": len(arm_joints),
            "reach_meters": reach_m,
            "payload_kg": 0.50,
            "dh_table": dh_table
        }

        return dh_table, specs

    @staticmethod
    def dh_to_urdf(dh_table, robot_name="so_robot"):
        """
        Converts a Denavit-Hartenberg (DH) parameter table into a standardized URDF XML string.
        """
        L1 = dh_table[0]["d"]
        L2 = dh_table[1]["a"]
        L3 = dh_table[2]["a"]
        L4 = dh_table[4]["d"]

        q0_lim = [np.radians(v) for v in dh_table[0]["limits_deg"]]
        q1_lim = [np.radians(v) for v in dh_table[1]["limits_deg"]]
        q2_lim = [np.radians(v) for v in dh_table[2]["limits_deg"]]
        q3_lim = [np.radians(v) for v in dh_table[3]["limits_deg"]]
        q4_lim = [np.radians(v) for v in dh_table[4]["limits_deg"]]

        urdf = f"""<?xml version="1.0" encoding="utf-8"?>
<robot name="{robot_name}">
  <link name="base_link"/>

  <joint name="{dh_table[0]['name']}" type="revolute">
    <parent link="base_link"/>
    <child link="shoulder_link"/>
    <origin xyz="0 0 {L1:.4f}" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="{q0_lim[0]:.4f}" upper="{q0_lim[1]:.4f}" effort="5.0" velocity="2.0"/>
  </joint>

  <link name="shoulder_link"/>

  <joint name="{dh_table[1]['name']}" type="revolute">
    <parent link="shoulder_link"/>
    <child link="upper_arm_link"/>
    <origin xyz="0 0 0" rpy="1.5708 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="{q1_lim[0]:.4f}" upper="{q1_lim[1]:.4f}" effort="5.0" velocity="2.0"/>
  </joint>

  <link name="upper_arm_link"/>

  <joint name="{dh_table[2]['name']}" type="revolute">
    <parent link="upper_arm_link"/>
    <child link="forearm_link"/>
    <origin xyz="{L2:.4f} 0 0" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="{q2_lim[0]:.4f}" upper="{q2_lim[1]:.4f}" effort="5.0" velocity="2.0"/>
  </joint>

  <link name="forearm_link"/>

  <joint name="{dh_table[3]['name']}" type="revolute">
    <parent link="forearm_link"/>
    <child link="wrist_link"/>
    <origin xyz="{L3:.4f} 0 0" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="{q3_lim[0]:.4f}" upper="{q3_lim[1]:.4f}" effort="3.0" velocity="2.5"/>
  </joint>

  <link name="wrist_link"/>

  <joint name="{dh_table[4]['name']}" type="revolute">
    <parent link="wrist_link"/>
    <child link="gripper_base"/>
    <origin xyz="0 0 0" rpy="1.5708 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="{q4_lim[0]:.4f}" upper="{q4_lim[1]:.4f}" effort="2.0" velocity="3.0"/>
  </joint>

  <link name="gripper_base"/>

  <joint name="q5_gripper" type="prismatic">
    <parent link="gripper_base"/>
    <child link="gripper_tip"/>
    <origin xyz="{L4:.4f} 0 0" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="0.0" upper="100.0" effort="2.0" velocity="1.0"/>
  </joint>

  <link name="gripper_tip"/>
</robot>"""
        return urdf


def get_robot_urdf(robot_type="so_arm101_omni_kin"):
    """Returns the URDF XML template for the requested robot preset."""
    r_type = normalize_robot_type(robot_type)
    if r_type == "so_arm101_omni_kin":
        omnikin_path = os.path.join(os.path.dirname(__file__), "SO-ARM101-OMNI-KIN.urdf")
        if os.path.exists(omnikin_path):
            try:
                with open(omnikin_path, "r", encoding="utf-8") as f:
                    return f.read()
            except Exception:
                pass
    elif r_type == "so100":
        return SO100_URDF_TEMPLATE
    return SO101_URDF_TEMPLATE



# ==============================================================================
# 4. Workspace Calibrator (ArUco Table Plane <-> Robot Base Frame)
# ==============================================================================

class WorkspaceCalibrator:
    """
    Transforms 6-DoF Cartesian poses between the ArUco Table Coordinate System (0,0,0)
    and the Robot Base Coordinate System.
    
    Coordinate Conventions:
      ArUco Frame:
        Origin: Tag A bottom-left corner on the table surface (Z=0).
        +X: Right along table.
        +Y: Forward along table.
        +Z: Up normal to table.
      Robot Base Frame:
        Origin: Center of robot base mounting plate.
        Offset (x0, y0, z0): Robot base position relative to Tag A.
        Yaw (theta_yaw): Mounting heading angle around table normal Z.
    """

    def __init__(self, offset_x=0.20, offset_y=0.00, offset_z=0.00, yaw_deg=0.0):
        self.offset_x = float(offset_x)
        self.offset_y = float(offset_y)
        self.offset_z = float(offset_z)
        self.yaw_deg = float(yaw_deg)
        self.yaw_rad = np.radians(self.yaw_deg)

    def update_config(self, offset_x=None, offset_y=None, offset_z=None, yaw_deg=None):
        """Updates calibration offset parameters."""
        if offset_x is not None:
            self.offset_x = float(offset_x)
        if offset_y is not None:
            self.offset_y = float(offset_y)
        if offset_z is not None:
            self.offset_z = float(offset_z)
        if yaw_deg is not None:
            self.yaw_deg = float(yaw_deg)
            self.yaw_rad = np.radians(self.yaw_deg)

    def get_config(self):
        """Returns active calibration config dictionary."""
        return {
            "offset_x": self.offset_x,
            "offset_y": self.offset_y,
            "offset_z": self.offset_z,
            "yaw_deg": self.yaw_deg
        }

    def aruco_to_robot(self, pose_aruco):
        """
        Transforms a 6-DoF pose [x, y, z, roll, pitch, yaw] from ArUco space into Robot Base frame.
        """
        xa, ya, za, roll, pitch, yaw = pose_aruco

        # Translate relative to robot base origin on table
        dx = xa - self.offset_x
        dy = ya - self.offset_y
        dz = za - self.offset_z

        # Rotate by -yaw_rad around table normal Z
        cos_th = np.cos(self.yaw_rad)
        sin_th = np.sin(self.yaw_rad)

        xr = cos_th * dx + sin_th * dy
        yr = -sin_th * dx + cos_th * dy
        zr = dz

        # Transform yaw orientation angle
        yaw_r = yaw - self.yaw_rad
        # Normalize to [-pi, pi]
        yaw_r = (yaw_r + np.pi) % (2 * np.pi) - np.pi

        return np.array([xr, yr, zr, roll, pitch, yaw_r], dtype=np.float64)

    def robot_to_aruco(self, pose_robot):
        """
        Transforms a 6-DoF pose [x, y, z, roll, pitch, yaw] from Robot Base frame into ArUco space.
        """
        xr, yr, zr, roll, pitch, yaw = pose_robot

        # Rotate by +yaw_rad around table normal Z
        cos_th = np.cos(self.yaw_rad)
        sin_th = np.sin(self.yaw_rad)

        xa = cos_th * xr - sin_th * yr + self.offset_x
        ya = sin_th * xr + cos_th * yr + self.offset_y
        za = zr + self.offset_z

        yaw_a = yaw + self.yaw_rad
        yaw_a = (yaw_a + np.pi) % (2 * np.pi) - np.pi

        return np.array([xa, ya, za, roll, pitch, yaw_a], dtype=np.float64)

    def transform_trajectory(self, trajectory, to_robot=True):
        """
        Batch-transforms an array of poses (N, 6).
        """
        traj = np.asarray(trajectory, dtype=np.float64)
        if len(traj) == 0:
            return traj

        res = np.zeros_like(traj)
        func = self.aruco_to_robot if to_robot else self.robot_to_aruco
        for i in range(len(traj)):
            res[i] = func(traj[i])
        return res

    def auto_align_base_to_start(self, p0, nominal_reach=0.22, default_yaw=90.0):
        """
        Calculates and applies the optimal robot base position (offset_x, offset_y, offset_z, yaw_deg)
        so that the robot's gripper starts directly at the trajectory's starting point p0
        at a comfortable, nominal forward reach distance.
        """
        x0, y0, z0 = p0[:3]
        yaw_rad = np.radians(default_yaw)

        # Place base nominal_reach behind p0 along robot heading
        base_x = x0 - nominal_reach * np.cos(yaw_rad)
        base_y = y0 - nominal_reach * np.sin(yaw_rad)
        base_z = 0.0

        self.update_config(
            offset_x=round(float(base_x), 3),
            offset_y=round(float(base_y), 3),
            offset_z=0.0,
            yaw_deg=round(float(default_yaw), 1)
        )
        return self.get_config()

    def auto_align_to_trajectory(self, trajectory, nominal_reach=0.24, default_yaw=90.0):
        """
        Calculates and applies the optimal robot base position centered around the entire trajectory,
        maximizing overall episode reachability across the physical workspace.
        """
        traj = np.asarray(trajectory, dtype=np.float64)
        if len(traj) == 0:
            return self.get_config()

        mean_p = np.mean(traj[:, :3], axis=0)
        yaw_rad = np.radians(default_yaw)

        base_x = mean_p[0] - nominal_reach * np.cos(yaw_rad)
        base_y = mean_p[1] - nominal_reach * np.sin(yaw_rad)

        self.update_config(
            offset_x=round(float(base_x), 3),
            offset_y=round(float(base_y), 3),
            offset_z=0.0,
            yaw_deg=round(float(default_yaw), 1)
        )
        return self.get_config()


if __name__ == "__main__":
    solver = SO101Kinematics()
    target = [0.25, 0.05, 0.15, 0.0, 0.1, 0.0]
    joints = solver.inverse_kinematics(target, gripper_state=75.0)
    fk = solver.forward_kinematics(np.radians(joints[:5]))

    print(f"=== {solver.model_name} DH Kinematics Test ===")
    print("Target Pose:        ", target)
    print("Computed Joints:    ", np.round(joints, 2))
    print("Reconstructed (FK): ", np.round(fk, 3))

    calib = WorkspaceCalibrator(offset_x=0.20, offset_y=0.00, yaw_deg=0.0)
    p_aruco = np.array([0.25, 0.05, 0.15, 0.0, 0.1, 0.0])
    p_robot = calib.aruco_to_robot(p_aruco)
    p_back = calib.robot_to_aruco(p_robot)

    print("\n=== Workspace Calibrator Test ===")
    print("ArUco Pose:  ", np.round(p_aruco, 3))
    print("Robot Frame: ", np.round(p_robot, 3))
    print("Roundtrip:   ", np.round(p_back, 3))
    assert np.allclose(p_aruco, p_back, atol=1e-5), "Calibrator roundtrip mismatch!"
    print("Calibrator Roundtrip PASSED!")

