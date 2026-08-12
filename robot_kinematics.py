"""
robot_kinematics.py
Kinematics Solver for SO-100 Robot Arm (LeRobot Default Embodiment)
"""

import numpy as np

class SO100Kinematics:
    """
    Kinematics engine for the SO-100 (5-DOF + Gripper) Robot Arm.
    Joints:
      q0: Base Yaw (-180° to 180°)
      q1: Shoulder Pitch (-90° to 90°)
      q2: Elbow Pitch (-120° to 120°)
      q3: Wrist Pitch (-90° to 90°)
      q4: Wrist Roll (-180° to 180°)
      q5: Gripper (0.0=closed to 100.0=fully open)
    """

    def __init__(self):
        # Link lengths in meters
        self.L1 = 0.115  # Base to shoulder joint
        self.L2 = 0.135  # Shoulder to elbow joint
        self.L3 = 0.140  # Elbow to wrist joint
        self.L4 = 0.105  # Wrist joint to gripper tip

        # Joint limits in radians
        self.joint_limits = [
            (-np.pi, np.pi),            # q0 Base Yaw
            (-np.pi/2, np.pi/2),        # q1 Shoulder Pitch
            (-2*np.pi/3, 2*np.pi/3),    # q2 Elbow Pitch
            (-np.pi/2, np.pi/2),        # q3 Wrist Pitch
            (-np.pi, np.pi),            # q4 Wrist Roll
            (0.0, 100.0)                # q5 Gripper
        ]

    def forward_kinematics(self, joints):
        """
        Compute Forward Kinematics given joint vector (6 elements, in radians / gripper state).
        Returns (x, y, z, roll, pitch, yaw)
        """
        q0, q1, q2, q3, q4 = joints[:5]

        # Planar 3-link pitch angle sums
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

        return np.array([x, y, z, roll, pitch, yaw])

    def inverse_kinematics(self, target_pose, gripper_state=50.0, prev_joints=None):
        """
        Compute Inverse Kinematics for target_pose = [x, y, z, roll, pitch, yaw]
        Returns joint array [q0, q1, q2, q3, q4, q5] in degrees (matching LeRobot state conventions).
        """
        x, y, z, roll, pitch, yaw = target_pose

        # 1. Base yaw joint (q0)
        q0 = np.arctan2(y, x)

        # Cylindrical reach
        r = np.hypot(x, y)

        # 2. Wrist position relative to shoulder
        r_wrist = r - self.L4 * np.cos(pitch)
        z_wrist = (z - self.L1) - self.L4 * np.sin(pitch)

        # Distance squared from shoulder to wrist
        d2 = r_wrist**2 + z_wrist**2
        d = np.sqrt(d2)

        # Law of Cosines for elbow angle q2
        cos_q2 = (d2 - self.L2**2 - self.L3**2) / (2 * self.L2 * self.L3)
        cos_q2 = np.clip(cos_q2, -1.0, 1.0)
        q2 = np.arccos(cos_q2)

        # Shoulder pitch q1
        alpha = np.arctan2(z_wrist, r_wrist)
        beta = np.arctan2(self.L3 * np.sin(q2), self.L2 + self.L3 * np.cos(q2))
        q1 = alpha + beta

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
        full_joints = np.append(joints_deg, gripper_state)

        return full_joints

    def map_phone_to_workspace(self, phone_pose, workspace_center=[0.25, 0.0, 0.15], scale=0.8):
        """
        Maps phone 6-DoF trajectory coordinates to reachable SO-100 arm workspace.
        """
        px, py, pz, proll, ppitch, pyaw = phone_pose

        # Scale relative motion to arm workspace
        arm_x = workspace_center[0] + px * scale
        arm_y = workspace_center[1] + py * scale
        arm_z = workspace_center[2] + pz * scale

        # Keep within valid bounds
        arm_x = np.clip(arm_x, 0.10, 0.35)
        arm_y = np.clip(arm_y, -0.25, 0.25)
        arm_z = np.clip(arm_z, 0.02, 0.35)

        return np.array([arm_x, arm_y, arm_z, proll, ppitch, pyaw])

if __name__ == "__main__":
    ik_solver = SO100Kinematics()
    target = [0.25, 0.05, 0.15, 0.0, 0.1, 0.0]
    joints = ik_solver.inverse_kinematics(target, gripper_state=80.0)
    fk = ik_solver.forward_kinematics(np.radians(joints[:5]))

    print("Target Pose:", target)
    print("Computed Joints (deg):", joints)
    print("Reconstructed Pose (FK):", np.round(fk, 3))
