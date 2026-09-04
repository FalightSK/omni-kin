"""
robot_kinematics.py
Denavit-Hartenberg (DH) Kinematics Engine for SO-100 and SO-101 Robot Arms
Includes WorkspaceCalibrator for ArUco Table-Plane-to-Robot-Base Coordinate Transformations
"""

import numpy as np

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

    def inverse_kinematics(self, target_pose, gripper_state=50.0, prev_joints=None, elbow_up=True):
        """
        Compute Inverse Kinematics for target_pose = [x, y, z, roll, pitch, yaw]
        Returns joint array [q0, q1, q2, q3, q4, q5] in degrees (matching LeRobot convention).
        """
        x, y, z, roll, pitch, yaw = target_pose

        # 1. Base yaw joint (q0)
        q0 = np.arctan2(y, x)

        # Cylindrical radial reach
        r = np.hypot(x, y)

        # 2. Wrist position relative to shoulder (L1 height)
        r_wrist = r - self.L4 * np.cos(pitch)
        z_wrist = (z - self.L1) - self.L4 * np.sin(pitch)

        # Distance squared from shoulder to wrist (clamped to reachable limits)
        max_reach_arm = (self.L2 + self.L3) * 0.999
        d2 = r_wrist**2 + z_wrist**2
        if d2 > max_reach_arm**2:
            scale_reach = max_reach_arm / np.sqrt(d2)
            r_wrist *= scale_reach
            z_wrist *= scale_reach
            d2 = max_reach_arm**2

        # Law of Cosines for elbow angle q2
        cos_q2 = (d2 - self.L2**2 - self.L3**2) / (2 * self.L2 * self.L3)
        cos_q2 = np.clip(cos_q2, -1.0, 1.0)
        
        # Select elbow configuration (default elbow-up)
        if elbow_up:
            q2 = -np.arccos(cos_q2)
        else:
            q2 = np.arccos(cos_q2)

        # Shoulder pitch q1: alpha = angle to wrist, beta = angle between L2 and chord
        alpha = np.arctan2(z_wrist, r_wrist)
        beta = np.arctan2(self.L3 * np.sin(q2), self.L2 + self.L3 * np.cos(q2))
        q1 = alpha - beta

        # Wrist pitch q3
        q3 = pitch - (q1 + q2)

        # Wrist roll q4
        q4 = roll

        # Convert angles to degrees for LeRobot output
        joints_rad = np.array([q0, q1, q2, q3, q4])

        # Enforce joint limits
        for i in range(5):
            low, high = self.joint_limits[i]
            joints_rad[i] = np.clip(joints_rad[i], low, high)

        joints_deg = np.degrees(joints_rad)
        full_joints = np.append(joints_deg, float(gripper_state))

        return full_joints

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


class SO101Kinematics(DHKinematics):
    """SO-101 5-DOF Robot Arm Kinematics (Refined Open Hardware Preset)."""
    def __init__(self):
        super().__init__(SO101_DH_TABLE, model_name="SO-101")


ROBOT_PRESETS = {
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


def get_robot_solver(robot_type="so101"):
    """Factory helper to obtain the kinematic solver instance."""
    r_type = robot_type.lower()
    if r_type in ROBOT_PRESETS:
        return ROBOT_PRESETS[r_type]["class"]()
    return SO101Kinematics()


def get_robot_specs(robot_type="so101"):
    """Returns metadata and DH table for the specified robot preset."""
    r_type = robot_type.lower()
    if r_type in ROBOT_PRESETS:
        preset = ROBOT_PRESETS[r_type]
        return {
            "robot_type": r_type,
            "name": preset["name"],
            "description": preset["description"],
            "reach_meters": preset["reach_meters"],
            "payload_kg": preset["payload_kg"],
            "dh_table": preset["dh_table"]
        }
    return get_robot_specs("so101")


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

