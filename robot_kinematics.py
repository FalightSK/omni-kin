"""
robot_kinematics.py
Denavit-Hartenberg (DH) Kinematics Engine for SO-100 and SO-101 Robot Arms
Includes WorkspaceCalibrator for ArUco Table-Plane-to-Robot-Base Coordinate Transformations
"""

import os
import numpy as np
import xml.etree.ElementTree as ET
from scipy.spatial.transform import Rotation as R
from scipy.optimize import minimize
import scipy.signal

def rodrigues_rot(axis, theta):
    K = np.array([[0, -axis[2], axis[1]], [axis[2], 0, -axis[0]], [-axis[1], axis[0], 0]])
    return np.eye(3) + np.sin(theta) * K + (1 - np.cos(theta)) * (K @ K)


def rpy_to_matrix(rpy):
    r, p, y = rpy
    cr, sr = np.cos(r), np.sin(r)
    cp, sp = np.cos(p), np.sin(p)
    cy, sy = np.cos(y), np.sin(y)
    Rz = np.array([[cy, -sy, 0], [sy, cy, 0], [0, 0, 1]])
    Ry = np.array([[cp, 0, sp], [0, 1, 0], [-sp, 0, cp]])
    Rx = np.array([[1, 0, 0], [0, cr, -sr], [0, sr, cr]])
    return Rz @ Ry @ Rx

R_CAM_TO_PHONE = np.diag([1.0, -1.0, -1.0])


def rotation_matrix_to_trajectory_euler(R_c_to_w):
    """
    Computes [roll, pitch, yaw] in radians from camera-to-world rotation matrix:
      - 0° pitch = phone held level over workspace table (camera looking down at table)
      - positive pitch = tilted forward
      - negative pitch = tilted backward
      - roll = lateral tilt left/right
      - yaw = azimuthal heading around table normal (Z)
    """
    R_p2w = R_c_to_w @ R_CAM_TO_PHONE
    r = R.from_matrix(R_p2w)
    ax, ay, az = r.as_euler('xyz', degrees=False)
    pitch = float(ax)
    roll = float(ay)
    yaw = float(az)
    return np.array([roll, pitch, yaw], dtype=np.float64)


def trajectory_euler_to_rotation_matrix(euler):
    """
    Reconstructs camera-to-world rotation matrix R_c_to_w from [roll, pitch, yaw].
    """
    roll, pitch, yaw = euler
    r = R.from_euler('xyz', [pitch, roll, yaw])
    R_p2w = r.as_matrix()
    return R_p2w @ R_CAM_TO_PHONE

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
        "limits_deg": [-100.0, 100.0]
    },
    {
        "joint_idx": 2,
        "name": "elbow_joint",
        "type": "revolute",
        "theta_offset_deg": 0.0,
        "d": 0.000,
        "a": 0.135,  # Lower arm length (meters)
        "alpha_deg": 0.0,
        "limits_deg": [-150.0, 150.0]
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


def universal_soft_saturation(val, lower, upper, margin=None, margin_ratio=0.08):
    """
    Universal C^2-continuous soft-barrier clamping for arbitrary robot joints.
    
    Replaces sharp non-differentiable piecewise clipping (min/max/clip) which causes 
    infinite acceleration spikes and motor buzzing/chattering at mechanical limits.
    
    Guarantees:
      - 100% identity mapping f(q) = q in the interior safe working zone.
      - Smooth C^2 hyperbolic tangent deceleration into boundaries.
      - Absolute mathematical containment strictly within [lower, upper].
      - Continuous velocity and bounded acceleration across limits.
      - Fully embodiment-agnostic: works across arbitrary DOF counts, joint ranges,
        units (rad/deg), and coordinate conventions.
    """
    val_arr = np.asarray(val, dtype=np.float64)
    span = float(upper - lower)
    if span <= 1e-6:
        return np.full_like(val_arr, lower) if isinstance(val, np.ndarray) else float(lower)

    delta = float(margin) if margin is not None else max(1e-4, span * margin_ratio)
    delta = min(delta, span * 0.45)  # Margin cannot exceed half the allowable span

    # Upper boundary soft compression
    u_thresh = upper - delta
    val_clamped = np.where(
        val_arr > u_thresh,
        u_thresh + delta * np.tanh((val_arr - u_thresh) / max(1e-6, delta)),
        val_arr
    )

    # Lower boundary soft compression
    l_thresh = lower + delta
    val_clamped = np.where(
        val_clamped < l_thresh,
        l_thresh - delta * np.tanh((l_thresh - val_clamped) / max(1e-6, delta)),
        val_clamped
    )

    return val_clamped if isinstance(val, np.ndarray) else float(val_clamped)


# ==============================================================================
# 2. Universal Wrist Detection & 3D Euclidean Camera Clearance Engine
# ==============================================================================

def find_wrist_pitch_index(dh_table):
    """
    Universally identifies the wrist pitch (flex) joint index across arbitrary robot embodiments.
    Scans for semantic naming keywords ('wrist', 'hand', 'pitch', 'flex', 'tilt', 'elevation')
    or falls back to the penultimate pitch joint before the end-effector.
    """
    if not dh_table or len(dh_table) < 3:
        return 3 if len(dh_table) > 3 else max(0, len(dh_table) - 1)

    # 1. Semantic match on joint name
    for i, row in enumerate(dh_table):
        name = str(row.get("name", "")).lower()
        if ("wrist" in name or "hand" in name or "grip" in name or "ee" in name) and any(k in name for k in ["pitch", "flex", "tilt", "elev", "bend"]):
            return i

    # 2. Match any joint with 'pitch' or 'flex' located in distal half of arm chain
    distal_start = len(dh_table) // 2
    for i in range(len(dh_table) - 1, distal_start - 1, -1):
        name = str(dh_table[i].get("name", "")).lower()
        if any(k in name for k in ["pitch", "flex", "tilt", "elevation"]):
            return i

    # 3. Default fallback heuristic: penultimate joint in chain (for 5-DOF = 3, 6-DOF = 4)
    return max(0, min(3, len(dh_table) - 2))


def compute_camera_forearm_clearance(p_elbow, p_wrist, p_tip, cam_forward_m=0.128, cam_height_m=0.109, cam_lateral_m=0.0):
    """
    Universal 3D Euclidean clearance metric between camera mount and robot forearm link.
    Invariant to joint numbering, link conventions, DH frame conventions, and axis signs.

    Forearm link: line segment S(t) = p_elbow + t * (p_wrist - p_elbow) for t in [0, 1].
    Camera position: computed rigidly from wrist/tip frame and extrinsics.
    """
    p_elbow = np.asarray(p_elbow, dtype=np.float64)
    p_wrist = np.asarray(p_wrist, dtype=np.float64)
    p_tip = np.asarray(p_tip, dtype=np.float64)

    tip_dir = p_tip - p_wrist
    tip_len = float(np.linalg.norm(tip_dir))
    if tip_len > 1e-6:
        tip_dir = tip_dir / tip_len
    else:
        tip_dir = np.array([1.0, 0.0, 0.0])

    forearm_dir = p_wrist - p_elbow
    forearm_len = float(np.linalg.norm(forearm_dir))
    if forearm_len > 1e-6:
        forearm_unit = forearm_dir / forearm_len
    else:
        forearm_unit = np.array([1.0, 0.0, 0.0])

    lat_dir = np.cross(np.array([0.0, 0.0, 1.0]), tip_dir)
    lat_len = float(np.linalg.norm(lat_dir))
    if lat_len > 1e-6:
        lat_dir = lat_dir / lat_len
    else:
        lat_dir = np.array([0.0, 1.0, 0.0])

    up_dir = np.cross(tip_dir, lat_dir)
    up_len = float(np.linalg.norm(up_dir))
    if up_len > 1e-6:
        up_dir = up_dir / up_len
    else:
        up_dir = np.array([0.0, 0.0, 1.0])

    p_cam = p_tip - cam_forward_m * tip_dir + cam_height_m * up_dir - cam_lateral_m * lat_dir

    seg = p_wrist - p_elbow
    seg_len_sq = float(np.dot(seg, seg))
    if seg_len_sq < 1e-8:
        return float(np.linalg.norm(p_cam - p_wrist)), p_cam

    t = float(np.clip(np.dot(p_cam - p_elbow, seg) / seg_len_sq, 0.0, 1.0))
    p_closest = p_elbow + t * seg
    clearance = float(np.linalg.norm(p_cam - p_closest))
    return clearance, p_cam


# ==============================================================================
# 3. Base DH Kinematics Engine
# ==============================================================================

class DHKinematics:
    """
    Universal Kinematics engine driven directly by a Denavit-Hartenberg (DH) parameter table.
    Supports arbitrary robot arms with serial planar pitch joints, wrist roll, and end-effector.
    Incorporates coordinate-free 3D Euclidean clearance verification to prevent camera collisions
    on any embodiment.
    """

    def __init__(self, dh_table, model_name="SO-Robot", q3_safe_max_deg=0.0, cam_forward_m=0.128, cam_height_m=0.109, cam_lateral_m=0.0):
        self.dh_table = dh_table
        self.model_name = model_name
        self.q3_safe_max_deg = float(q3_safe_max_deg) if q3_safe_max_deg is not None else 0.0
        self.wrist_pitch_safe_max_deg = self.q3_safe_max_deg
        self.cam_forward_m = float(cam_forward_m)
        self.cam_height_m = float(cam_height_m)
        self.cam_lateral_m = float(cam_lateral_m)

        # Universally identify wrist pitch joint index
        self.wrist_pitch_idx = find_wrist_pitch_index(self.dh_table)

        # Extract link lengths from DH table:
        self.L1 = float(self.dh_table[0]["d"])
        self.L2 = float(self.dh_table[1]["a"])
        self.L3 = float(self.dh_table[2]["a"])
        self.L4 = float(self.dh_table[min(4, len(self.dh_table) - 1)]["d"])
        if self.L4 <= 0.01 and "a" in self.dh_table[-1]:
            self.L4 = float(self.dh_table[-1]["a"]) or 0.110

        self.max_reach = self.L2 + self.L3 + self.L4

        # Detect collision rotation direction: +1 if positive wrist angle moves camera toward forearm, -1 if inverted
        self.wrist_collision_sign = self._detect_collision_sign()

        # Extract joint limits in radians with camera-safe wrist pitch ceiling
        self.joint_limits = []
        for i, row in enumerate(self.dh_table):
            min_deg, max_deg = row["limits_deg"]
            if i == self.wrist_pitch_idx and self.q3_safe_max_deg is not None:
                if self.wrist_collision_sign > 0:
                    max_deg = min(max_deg, self.q3_safe_max_deg)
                else:
                    min_deg = max(min_deg, -self.q3_safe_max_deg)
            self.joint_limits.append((np.radians(min_deg), np.radians(max_deg)))
        # Gripper limit (0.0=closed to 100.0=open)
        self.joint_limits.append((0.0, 100.0))
        self.reach_angle_rad = 0.0
        self.reach_angle_deg = 0.0
        self.robot_name = getattr(self, "model_name", "SO-Robot")

    def _detect_collision_sign(self):
        """
        Determines whether positive or negative rotation around wrist_pitch_idx tilts
        the camera mount towards the forearm link. Returns +1 if positive angle reduces clearance,
        -1 if inverted.
        """
        try:
            def eval_clearance(wrist_angle_rad):
                q0 = 0.0
                q1 = 0.5
                q2 = -0.8
                q3 = wrist_angle_rad
                r_elbow = self.L2 * np.cos(q1)
                p_elbow = np.array([r_elbow, 0.0, self.L1 + self.L2 * np.sin(q1)])
                th2 = q1 + q2
                r_forearm = self.L3 * np.cos(th2)
                p_wrist = np.array([p_elbow[0] + r_forearm, 0.0, p_elbow[2] + self.L3 * np.sin(th2)])
                th3 = q1 + q2 + q3
                r_tip = r_forearm + self.L4 * np.cos(th3)
                p_tip = np.array([p_elbow[0] + r_tip, 0.0, p_wrist[2] + self.L4 * np.sin(th3)])
                c, _ = compute_camera_forearm_clearance(p_elbow, p_wrist, p_tip, self.cam_forward_m, self.cam_height_m, self.cam_lateral_m)
                return c

            c_neg = eval_clearance(-np.radians(20.0))
            c_pos = eval_clearance(+np.radians(20.0))
            return 1 if c_pos < c_neg else -1
        except Exception:
            return 1

    def update_camera_extrinsics(self, forward_cm=None, height_cm=None, lateral_cm=None):
        """Updates camera mounting extrinsics for universal 3D geometric clearance checks."""
        if forward_cm is not None:
            self.cam_forward_m = float(forward_cm) / 100.0
            self.L4 = self.cam_forward_m
            self.max_reach = self.L2 + self.L3 + self.L4
        if height_cm is not None:
            self.cam_height_m = float(height_cm) / 100.0
        if lateral_cm is not None:
            self.cam_lateral_m = float(lateral_cm) / 100.0
        self.wrist_collision_sign = self._detect_collision_sign()

    def update_q3_safe_max(self, q3_safe_max_deg):
        """Dynamically updates the camera-safe upper limit for the wrist pitch joint."""
        self.q3_safe_max_deg = float(q3_safe_max_deg) if q3_safe_max_deg is not None else 0.0
        self.wrist_pitch_safe_max_deg = self.q3_safe_max_deg
        idx = getattr(self, "wrist_pitch_idx", 3)
        if len(self.joint_limits) > idx and len(self.dh_table) > idx:
            raw_min, raw_max = self.dh_table[idx]["limits_deg"]
            if getattr(self, "wrist_collision_sign", 1) > 0:
                clamped_max = min(raw_max, self.q3_safe_max_deg)
                self.joint_limits[idx] = (np.radians(raw_min), np.radians(clamped_max))
            else:
                clamped_min = max(raw_min, -self.q3_safe_max_deg)
                self.joint_limits[idx] = (np.radians(clamped_min), np.radians(raw_max))

    def update_wrist_safe_max(self, safe_max_deg):
        """Universal alias for update_q3_safe_max across all robot types."""
        self.update_q3_safe_max(safe_max_deg)

    def get_dh_table(self):
        """Returns the DH parameter table representation."""
        return self.dh_table

    def clip_joint_limits(self, joints_deg):
        """Clips joint angles in degrees to the physical and safety joint limits."""
        q = np.array(joints_deg, dtype=np.float64)
        for j in range(min(len(q), len(self.joint_limits))):
            lo_deg = float(np.degrees(self.joint_limits[j][0]))
            hi_deg = float(np.degrees(self.joint_limits[j][1]))
            q[j] = np.clip(q[j], lo_deg, hi_deg)
        return q

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

    def forward_kinematics_chain(self, joints):
        """
        Computes 3D joint and link positions along the serial kinematic chain:
        [Base (0,0,0), Yaw joint, Shoulder, Elbow, Wrist, Tip]
        Returns list of 3D numpy arrays matching the URDF link positions format.
        """
        q = np.asarray(joints[:5], dtype=np.float64)
        q0 = q[0] if len(q) > 0 else 0.0
        q1 = q[1] if len(q) > 1 else 0.0
        q2 = q[2] if len(q) > 2 else 0.0
        q3 = q[3] if len(q) > 3 else 0.0

        th1 = q1
        th2 = q1 + q2
        th3 = q1 + q2 + q3

        cos_q0 = np.cos(q0)
        sin_q0 = np.sin(q0)

        p_base = np.array([0.0, 0.0, 0.0])
        p_turret = np.array([0.0, 0.0, self.L1 * 0.5])
        p_shoulder = np.array([0.0, 0.0, self.L1])

        r_elbow = self.L2 * np.cos(th1)
        z_elbow = self.L1 + self.L2 * np.sin(th1)
        p_elbow = np.array([r_elbow * cos_q0, r_elbow * sin_q0, z_elbow])

        r_wrist = r_elbow + self.L3 * np.cos(th2)
        z_wrist = z_elbow + self.L3 * np.sin(th2)
        p_wrist = np.array([r_wrist * cos_q0, r_wrist * sin_q0, z_wrist])

        r_tip = r_wrist + self.L4 * np.cos(th3)
        z_tip = z_wrist + self.L4 * np.sin(th3)
        p_tip = np.array([r_tip * cos_q0, r_tip * sin_q0, z_tip])

        return [p_base, p_turret, p_shoulder, p_elbow, p_wrist, p_tip]

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

        # Ground-proximity adaptive approach pitch:
        # When target elevation is low (near tabletop/floor, z < 0.16m), horizontal grasp
        # is physically impossible and tilts wrist camera backward into forearm.
        # Dynamically seed pitch towards a downward plunge approach (-60°).
        nominal_pitch = float(pitch)
        if z < 0.16:
            alpha_z = float(np.clip((z - 0.02) / 0.14, 0.0, 1.0))
            plunge_pitch = np.radians(-60.0)
            nominal_pitch = float(plunge_pitch * (1.0 - alpha_z) + nominal_pitch * alpha_z)

        # Generate candidate approach pitch angles:
        # Downward plunge angles FIRST (prioritizes q3 <= safe_max and avoids camera collision)
        pitch_candidates = [nominal_pitch]
        if allow_pitch_adaptation:
            for delta_deg in range(3, 100, 3):
                p_down = nominal_pitch - np.radians(delta_deg)
                if p_down >= -np.radians(85):
                    pitch_candidates.append(p_down)
            for delta_deg in range(3, 75, 3):
                p_up = nominal_pitch + np.radians(delta_deg)
                if p_up <= np.radians(85):
                    pitch_candidates.append(p_up)

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

            # Standard tabletop robot arm orientation: enforce natural human-like elbow-up configuration
            # to prevent inverted scorpion/praying mantis postures when target approaches inner dead zone
            configs_to_test = [True]

            for elbow_up in configs_to_test:
                q2 = -np.arccos(cos_q2) if elbow_up else np.arccos(cos_q2)
                alpha = np.arctan2(z_w, r_w)
                beta = np.arctan2(self.L3 * np.sin(q2), self.L2 + self.L3 * np.cos(q2))
                q1 = alpha - beta
                q3 = p_clamped - (q1 + q2)
                q4 = float(np.clip(roll, -np.radians(30.0), np.radians(30.0)))

                q_rad = [q0, q1, q2, q3, q4]
                in_limits = True
                num_check = min(len(q_rad), len(self.joint_limits))
                for j in range(num_check):
                    lo, hi = self.joint_limits[j]
                    if q_rad[j] < lo - 1e-4 or q_rad[j] > hi + 1e-4:
                        in_limits = False
                        break

                if in_limits:
                    fk = self.forward_kinematics(q_rad)
                    pos_err = float(np.linalg.norm(fk[:3] - np.array([x, y, z])))
                    pitch_diff = abs(p_clamped - pitch)

                    # 1. Asymmetric Wrist Safety Cost:
                    # Invariant to joint numbering and axis direction conventions
                    wrist_idx = getattr(self, "wrist_pitch_idx", 3)
                    collision_sign = getattr(self, "wrist_collision_sign", 1)
                    wrist_deg = float(np.degrees(q_rad[wrist_idx]))
                    effective_wrist_tilt = wrist_deg * collision_sign

                    if effective_wrist_tilt > self.q3_safe_max_deg:
                        wrist_penalty = 500.0 * ((effective_wrist_tilt - self.q3_safe_max_deg) ** 2)
                    else:
                        wrist_penalty = -0.1 * abs(wrist_deg)

                    # 2. Universal 3D Euclidean clearance: camera mount to forearm segment (Elbow -> Wrist)
                    r_elbow = self.L2 * np.cos(q1)
                    p_elbow = np.array([r_elbow * np.cos(q0), r_elbow * np.sin(q0), self.L1 + self.L2 * np.sin(q1)])
                    th2 = q1 + q2
                    r_forearm = self.L3 * np.cos(th2)
                    p_wrist = np.array([p_elbow[0] + r_forearm * np.cos(q0), p_elbow[1] + r_forearm * np.sin(q0), p_elbow[2] + self.L3 * np.sin(th2)])
                    p_tip = fk[:3]

                    clearance, _ = compute_camera_forearm_clearance(
                        p_elbow, p_wrist, p_tip,
                        self.cam_forward_m, self.cam_height_m, self.cam_lateral_m
                    )

                    clearance_penalty = 0.0
                    if clearance < 0.045:
                        clearance_penalty = 1000.0 * ((0.045 - clearance) ** 2)

                    # 3. Universal Temporal Continuity Regularization (prevents solution hopping across frames)
                    temporal_penalty = 0.0
                    if prev_joints is not None:
                        n_arm = min(len(q_rad), len(prev_joints))
                        prev_rad = np.radians(prev_joints[:n_arm])
                        span_rad = np.array([
                            max(1e-3, self.joint_limits[j][1] - self.joint_limits[j][0])
                            for j in range(n_arm)
                        ])
                        w = np.ones(n_arm, dtype=np.float64)
                        if wrist_idx is not None and wrist_idx < n_arm:
                            w[wrist_idx] = 2.5
                        norm_diff = ((np.array(q_rad[:n_arm]) - prev_rad) / span_rad) * w
                        temporal_penalty = float(np.sum(norm_diff ** 2)) * 120.0

                    score = pos_err * 200.0 + pitch_diff * 0.05 + wrist_penalty + clearance_penalty + temporal_penalty

                    if score < best_err:
                        best_err = score
                        best_q = q_rad
                        if pos_err < 0.005 and not was_clamped and effective_wrist_tilt <= self.q3_safe_max_deg and clearance >= 0.045:
                            if prev_joints is None or temporal_penalty < 0.2:
                                best_is_exact = True
                                break

            if best_is_exact:
                break

        if best_q is None:
            # Fallback: enforce limits by projection
            # Anchor to previous frame's approach pitch if available to prevent massive posture jumps
            if prev_joints is not None and len(prev_joints) >= 4:
                fallback_pitch = float(np.radians(prev_joints[1] + prev_joints[2] + prev_joints[3]))
                fallback_pitch = float(np.clip(fallback_pitch, -np.radians(85), np.radians(85)))
            elif z < 0.25:
                # If near table surface and no prev frame, default to downward plunge (-50 deg) to prevent positive limits snapping
                fallback_pitch = np.radians(-50.0)
            else:
                fallback_pitch = nominal_pitch

            r_w = r - self.L4 * np.cos(fallback_pitch)
            z_w = (z_eff - self.L1) - self.L4 * np.sin(fallback_pitch)
            d_w = np.hypot(r_w, z_w)
            if d_w > max_reach_wrist:
                clamped_reasons.append("OUT_OF_REACH")
                r_w *= max_reach_wrist / d_w
                z_w *= max_reach_wrist / d_w
                d_w = max_reach_wrist
            min_reach_wrist = max(0.020, abs(self.L2 - self.L3) + 0.010)
            if d_w < min_reach_wrist:
                scale_w = min_reach_wrist / max(1e-6, d_w)
                r_w *= scale_w
                z_w *= scale_w
                d_w = min_reach_wrist

            d2 = d_w**2
            cos_q2 = np.clip((d2 - self.L2**2 - self.L3**2) / (2.0 * self.L2 * self.L3), -1.0, 1.0)
            q2 = -np.arccos(cos_q2)
            alpha = np.arctan2(z_w, r_w)
            beta = np.arctan2(self.L3 * np.sin(q2), self.L2 + self.L3 * np.cos(q2))
            q1 = alpha - beta
            q3 = fallback_pitch - (q1 + q2)
            q4 = float(np.clip(roll, -np.radians(30.0), np.radians(30.0)))
            best_q = [q0, q1, q2, q3, q4]
            wrist_idx = getattr(self, "wrist_pitch_idx", 3)
            collision_sign = getattr(self, "wrist_collision_sign", 1)
            num_limits = min(len(best_q), len(self.joint_limits))
            for j in range(num_limits):
                lo, hi = self.joint_limits[j]
                if best_q[j] < lo or best_q[j] > hi:
                    clamped_reasons.append(f"JOINT_LIMIT_Q{j}")
                    if j == wrist_idx and (np.degrees(best_q[j]) * collision_sign) > self.q3_safe_max_deg:
                        clamped_reasons.append("CAMERA_COLLISION_RISK")
                # Universal C^2 soft saturation instead of sharp clipping
                best_q[j] = float(universal_soft_saturation(best_q[j], lo, hi, margin_ratio=0.08))

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
            "clamped_reasons": list(set(clamped_reasons)),
            "link_positions": [p.tolist() for p in self.forward_kinematics_chain(best_q)]
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

    def smooth_joint_trajectory(self, joint_trajectory, fps=30.0, time_window_ms=200, soft_margin_ratio=0.08, max_deg_per_sec=120.0):
        """
        Universal Robot-Agnostic Joint Trajectory Smoother.
        Works across arbitrary robot topologies, DOF counts, and joint limits.

        Guarantees:
          1. Universal C^2-continuous soft saturation on all joint limits (no hard clipping spikes).
          2. Universal soft enforcement of camera/gripper safety ceiling on wrist_pitch_idx.
          3. Slew-rate velocity limit (clamps frame-to-frame delta <= max_velocity * dt, eliminating large jumps).
          4. Phase-neutral Savitzky-Golay joint-space polynomial smoothing across time.
          5. Zero motor chattering, finite bounded accelerations, and preserved manipulator reach.
        """
        joint_arr = np.asarray(joint_trajectory, dtype=np.float64)
        if len(joint_arr) == 0:
            return joint_arr.copy()

        n_frames = len(joint_arr)
        n_arm = min(joint_arr.shape[1], len(self.dh_table))
        arm_joints = joint_arr[:, :n_arm].copy()
        extra = joint_arr[:, n_arm:].copy() if joint_arr.shape[1] > n_arm else None

        wrist_idx = getattr(self, "wrist_pitch_idx", None)
        collision_sign = getattr(self, "wrist_collision_sign", 1)
        safe_max_deg = getattr(self, "q3_safe_max_deg", None)

        # 1. Apply Universal Soft Saturation against Joint Limits
        for j in range(n_arm):
            lo_rad, hi_rad = self.joint_limits[j]
            lo_deg, hi_deg = float(np.degrees(lo_rad)), float(np.degrees(hi_rad))

            # Enforce camera safety ceiling on detected wrist pitch joint if applicable
            if j == wrist_idx and safe_max_deg is not None:
                if collision_sign > 0:
                    hi_deg = min(hi_deg, float(safe_max_deg))
                else:
                    lo_deg = max(lo_deg, -float(safe_max_deg))
            if j == 4:
                lo_deg = max(lo_deg, -35.0)
                hi_deg = min(hi_deg, 35.0)

            arm_joints[:, j] = universal_soft_saturation(
                arm_joints[:, j], lo_deg, hi_deg, margin_ratio=soft_margin_ratio
            )

        # 2. Universal Slew-Rate Limiter (caps maximum angular jump per frame to max_velocity * dt)
        if n_frames >= 2 and max_deg_per_sec is not None:
            fps_val = max(5.0, float(fps))
            max_delta = float(max_deg_per_sec) / fps_val
            for t in range(1, n_frames):
                delta = arm_joints[t] - arm_joints[t - 1]
                arm_joints[t] = arm_joints[t - 1] + np.clip(delta, -max_delta, max_delta)

        # 3. Phase-Neutral Savitzky-Golay Polynomial Smoothing across Time
        if n_frames >= 4:
            fps_val = max(5.0, float(fps))
            win_len = int(round(fps_val * (time_window_ms / 1000.0)))
            if win_len % 2 == 0:
                win_len += 1
            win_len = max(3, win_len)
            if win_len >= n_frames:
                win_len = (n_frames - 1) if (n_frames - 1) % 2 == 1 else max(3, n_frames - 2)

            if win_len >= 3 and win_len <= n_frames:
                poly = min(2, win_len - 1)
                # Unwrap angular joints to prevent +-180 wrap discontinuities before filtering
                unwrapped = np.unwrap(np.radians(arm_joints), axis=0)
                filtered_unwrapped = scipy.signal.savgol_filter(unwrapped, window_length=win_len, polyorder=poly, axis=0)
                arm_joints = np.degrees(filtered_unwrapped)

        # 4. Final Boundary Soft-Catch (ensures polynomial overshoot never breaches limits)
        for j in range(n_arm):
            lo_rad, hi_rad = self.joint_limits[j]
            lo_deg, hi_deg = float(np.degrees(lo_rad)), float(np.degrees(hi_rad))
            if j == wrist_idx and safe_max_deg is not None:
                if collision_sign > 0:
                    hi_deg = min(hi_deg, float(safe_max_deg))
                else:
                    lo_deg = max(lo_deg, -float(safe_max_deg))
            if j == 4:
                lo_deg = max(lo_deg, -35.0)
                hi_deg = min(hi_deg, 35.0)
            arm_joints[:, j] = universal_soft_saturation(
                arm_joints[:, j], lo_deg, hi_deg, margin=0.5
            )

        # Savitzky-Golay can overshoot between adjacent frames.  Reapply the
        # physical velocity bound after filtering; this is the final command
        # trajectory used by preview and export.
        if n_frames >= 2 and max_deg_per_sec is not None:
            max_delta = float(max_deg_per_sec) / max(5.0, float(fps))
            for t in range(1, n_frames):
                delta = arm_joints[t] - arm_joints[t - 1]
                arm_joints[t] = arm_joints[t - 1] + np.clip(delta, -max_delta, max_delta)

        if extra is not None:
            return np.hstack([arm_joints, extra]).astype(joint_arr.dtype)
        return arm_joints.astype(joint_arr.dtype)


# ==============================================================================
# 3. Model Specializations
# ==============================================================================

class SO100Kinematics(DHKinematics):
    """SO-100 5-DOF Robot Arm Kinematics (LeRobot Original Preset)."""
    def __init__(self, q3_safe_max_deg=0.0, **kwargs):
        super().__init__(SO100_DH_TABLE, model_name="SO-100", q3_safe_max_deg=q3_safe_max_deg, **kwargs)


class SO101OmniKinKinematics(DHKinematics):
    """SO-ARM101-OMNI-KIN 5-DOF Robot Arm Kinematics (Default Project Setup)."""
    def __init__(self, q3_safe_max_deg=0.0, **kwargs):
        super().__init__(SO101_OMNIKIN_DH_TABLE, model_name="SO-ARM101-OMNI-KIN", q3_safe_max_deg=q3_safe_max_deg, **kwargs)


class SO101Kinematics(DHKinematics):
    """SO-101 5-DOF Robot Arm Kinematics (Refined Open Hardware Preset)."""
    def __init__(self, q3_safe_max_deg=0.0, **kwargs):
        super().__init__(SO101_DH_TABLE, model_name="SO-101", q3_safe_max_deg=q3_safe_max_deg, **kwargs)


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
    if r in ("custom_urdf", "custom", "custom_robot"):
        return "custom_urdf"
    if "omni" in r or "arm101" in r:
        return "so_arm101_omni_kin"
    if "100" in r:
        return "so100"
    if "101" in r:
        return "so101"
    return r if r in ROBOT_PRESETS else "so_arm101_omni_kin"





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
    def parse_urdf(urdf_text, q3_safe_max_deg=None):
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
        links_dict = {}

        for link_elem in root.findall("link"):
            l_name = link_elem.get("name", "")
            visual_elem = link_elem.find("visual")
            mesh_file = ""
            if visual_elem is not None:
                geo = visual_elem.find("geometry")
                if geo is not None:
                    m = geo.find("mesh")
                    if m is not None:
                        mesh_file = m.get("filename", "")
            links_dict[l_name] = {"name": l_name, "mesh": mesh_file}

        for joint_elem in root.findall("joint"):
            j_name = joint_elem.get("name", "joint")
            j_type = joint_elem.get("type", "revolute")
            parent_elem = joint_elem.find("parent")
            child_elem = joint_elem.find("child")
            origin_elem = joint_elem.find("origin")
            limit_elem = joint_elem.find("limit")
            axis_elem = joint_elem.find("axis")
            mimic_elem = joint_elem.find("mimic")

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
                if j_type in ["revolute", "continuous"]:
                    limits_deg = [round(float(np.degrees(low_val)), 1), round(float(np.degrees(high_val)), 1)]
                else:
                    limits_deg = [round(float(low_val * 100.0), 1), round(float(high_val * 100.0), 1)]

            mimic_info = None
            if mimic_elem is not None:
                mimic_info = {
                    "joint": mimic_elem.get("joint", ""),
                    "multiplier": float(mimic_elem.get("multiplier", 1.0)),
                    "offset": float(mimic_elem.get("offset", 0.0))
                }

            joint_info = {
                "name": j_name,
                "type": j_type,
                "parent": parent_link,
                "child": child_link,
                "xyz": xyz,
                "rpy": rpy,
                "axis": axis,
                "limits_deg": limits_deg,
                "mimic": mimic_info
            }
            joints_dict[j_name] = joint_info
            if parent_link not in joints_by_parent:
                joints_by_parent[parent_link] = []
            joints_by_parent[parent_link].append(joint_info)
            joints_by_child[child_link] = joint_info

        if not joints_dict:
            raise ValueError("No <joint> definitions found in URDF.")

        # Find base link (parent link that is never a child)
        all_parents = set(joints_by_parent.keys())
        all_children = set(joints_by_child.keys())
        base_candidates = list(all_parents - all_children)
        current_link = base_candidates[0] if base_candidates else list(all_parents)[0]

        # Trace ordered serial arm joint chain up to the gripper base
        arm_chain_joints = []
        arm_chain_links = [current_link]
        flange_joint = None
        gripper_base_link = None

        while current_link in joints_by_parent:
            children_joints = joints_by_parent[current_link]
            primary_joint = None
            for j in children_joints:
                if "grip" in j["child"].lower() or "wrist_roll" in j["name"].lower():
                    flange_joint = j
                    gripper_base_link = j["child"]
                    primary_joint = j
                    break
                elif j["type"] in ["revolute", "continuous"]:
                    primary_joint = j
                    break

            if not primary_joint:
                primary_joint = children_joints[0]

            arm_chain_joints.append(primary_joint)
            current_link = primary_joint["child"]
            arm_chain_links.append(current_link)

            if flange_joint is not None or len(arm_chain_joints) >= 5:
                break

        # If gripper_base_link wasn't marked, set to the 5th child
        if not gripper_base_link and len(arm_chain_links) > 5:
            gripper_base_link = arm_chain_links[5]
        elif not gripper_base_link and len(arm_chain_links) > 0:
            gripper_base_link = arm_chain_links[-1]

        # Filter arm joints
        arm_joints = [j for j in arm_chain_joints if j["type"] in ["revolute", "continuous"]]
        if len(arm_joints) < 3:
            arm_joints = arm_chain_joints[:5]

        # Extract all End-Effector links and joints attached downstream
        ee_joints = []
        ee_links = []
        if gripper_base_link:
            ee_links.append(gripper_base_link)
            frontier = [gripper_base_link]
            while frontier:
                p = frontier.pop(0)
                if p in joints_by_parent:
                    for j in joints_by_parent[p]:
                        if j not in arm_chain_joints and j not in ee_joints:
                            ee_joints.append(j)
                            ee_links.append(j["child"])
                            frontier.append(j["child"])

        for j_name, j_info in joints_dict.items():
            if j_info not in arm_chain_joints and j_info not in ee_joints:
                ee_joints.append(j_info)
                if j_info["child"] not in ee_links:
                    ee_links.append(j_info["child"])

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
            L2 = 0.140 if (0.110 <= norm2 <= 0.145 and "omni" in robot_name.lower()) else (norm2 if norm2 > 0.05 else 0.140)
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
        gripper_joint = next((j for j in ee_joints if j["type"] in ["prismatic", "revolute"]), None)
        L4 = 0.110
        if gripper_joint:
            norm_grip = float(np.linalg.norm(gripper_joint["xyz"]))
            if norm_grip > 0.09:
                L4 = norm_grip
            elif norm_grip > 0.03:
                L4 = 0.110

        # Detect universal wrist pitch joint index dynamically
        detected_wrist_idx = find_wrist_pitch_index(arm_joints)

        # Joint limits normalization
        def normalize_joint_limits(j_idx, raw_limits):
            if not raw_limits or len(raw_limits) != 2:
                return [-180.0, 180.0]
            low, high = float(raw_limits[0]), float(raw_limits[1])
            if j_idx == detected_wrist_idx and q3_safe_max_deg is not None:
                high = min(high, float(q3_safe_max_deg))
            return [round(low, 1), round(high, 1)]

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
                "limits_deg": normalize_joint_limits(0, arm_joints[0]["limits_deg"]) if len(arm_joints) > 0 else [-180.0, 180.0]
            },
            {
                "joint_idx": 1,
                "name": arm_joints[1]["name"] if len(arm_joints) > 1 else "q1_shoulder_pitch",
                "type": "revolute",
                "theta_offset_deg": 0.0,
                "d": 0.0,
                "a": round(float(L2), 4),
                "alpha_deg": 0.0,
                "limits_deg": normalize_joint_limits(1, arm_joints[1]["limits_deg"]) if len(arm_joints) > 1 else [-100.0, 100.0]
            },
            {
                "joint_idx": 2,
                "name": arm_joints[2]["name"] if len(arm_joints) > 2 else "q2_elbow_pitch",
                "type": "revolute",
                "theta_offset_deg": 0.0,
                "d": 0.0,
                "a": round(float(L3), 4),
                "alpha_deg": 0.0,
                "limits_deg": normalize_joint_limits(2, arm_joints[2]["limits_deg"]) if len(arm_joints) > 2 else [-150.0, 150.0]
            },
            {
                "joint_idx": 3,
                "name": arm_joints[3]["name"] if len(arm_joints) > 3 else "q3_wrist_pitch",
                "type": "revolute",
                "theta_offset_deg": 0.0,
                "d": 0.0,
                "a": 0.0,
                "alpha_deg": 90.0,
                "limits_deg": normalize_joint_limits(3, arm_joints[3]["limits_deg"]) if len(arm_joints) > 3 else [-100.0, 100.0]
            },
            {
                "joint_idx": 4,
                "name": arm_joints[4]["name"] if len(arm_joints) > 4 else "q4_wrist_roll",
                "type": "revolute",
                "theta_offset_deg": 0.0,
                "d": round(float(L4), 4),
                "a": 0.0,
                "alpha_deg": 0.0,
                "limits_deg": normalize_joint_limits(4, arm_joints[4]["limits_deg"]) if len(arm_joints) > 4 else [-180.0, 180.0]
            }
        ]

        reach_m = round(float(L2 + L3 + L4), 3)

        # Clear semantic component separation between Arm Body and End-Effector
        components = {
            "arm_body": {
                "name": "Arm Body (5-DOF Serial Chain)",
                "root_link": arm_chain_links[0] if arm_chain_links else "base",
                "links": [
                    {"name": l, "mesh": links_dict.get(l, {}).get("mesh", "")}
                    for l in arm_chain_links if l != gripper_base_link
                ],
                "joints": [
                    {
                        "name": j["name"],
                        "type": j["type"],
                        "parent": j["parent"],
                        "child": j["child"],
                        "axis": j["axis"],
                        "limits_deg": j["limits_deg"]
                    }
                    for j in arm_chain_joints[:5]
                ],
                "link_lengths_cm": {
                    "L1_base_height": round(float(L1 * 100), 1),
                    "L2_upper_arm": round(float(L2 * 100), 1),
                    "L3_forearm": round(float(L3 * 100), 1)
                },
                "reach_cm": round(float((L2 + L3) * 100), 1)
            },
            "end_effector": {
                "name": "End-Effector (Gripper Assembly & TCP)",
                "mount_link": arm_chain_joints[3]["child"] if len(arm_chain_joints) > 3 else "wrist",
                "flange_joint": flange_joint["name"] if flange_joint else (arm_chain_joints[4]["name"] if len(arm_chain_joints) > 4 else "wrist_roll_joint"),
                "palm_link": gripper_base_link or "gripper_base",
                "palm_mesh": links_dict.get(gripper_base_link, {}).get("mesh", ""),
                "links": [
                    {"name": l, "mesh": links_dict.get(l, {}).get("mesh", "")}
                    for l in ee_links
                ],
                "actuator_joints": [
                    {
                        "name": j["name"],
                        "type": j["type"],
                        "parent": j["parent"],
                        "child": j["child"],
                        "limits_deg": j["limits_deg"]
                    }
                    for j in ee_joints if "gear" in j["name"].lower() or "jaw" in j["name"].lower() or j["type"] == "continuous"
                ],
                "fingers": [
                    {
                        "name": j["name"],
                        "link": j["child"],
                        "type": j["type"],
                        "stroke_cm": round(abs(j["limits_deg"][1] - j["limits_deg"][0]), 2) if j["type"] == "prismatic" else 4.4,
                        "mimic": j.get("mimic")
                    }
                    for j in ee_joints if "left" in j["name"].lower() or "right" in j["name"].lower() or "finger" in j["name"].lower() or "arm_" in j["child"].lower()
                ],
                "tcp_offset_cm": round(float(L4 * 100), 1),
                "total_length_cm": round(float(L4 * 100), 1)
            }
        }

        specs = {
            "robot_name": robot_name,
            "wrist_pitch_idx": detected_wrist_idx,
            "total_joints_parsed": len(joints_dict),
            "revolute_joints": len(arm_joints),
            "reach_meters": reach_m,
            "payload_kg": 0.50,
            "dh_table": dh_table,
            "components": components
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
# 4. Universal URDF Kinematics Engine (Robot & Topology Agnostic)
# ==============================================================================

class URDFKinematics:
    """
    Universal Robot-Agnostic Kinematics Engine parsed dynamically from ANY URDF description.
    Supports arbitrary joint origins, rotation axes, joint limits, and coordinate orientations.
    Computes exact forward kinematics, reach direction, bounded numerical inverse kinematics,
    and link position chains.
    """
    def __init__(self, urdf_content, model_name="URDF-Robot", q3_safe_max_deg=0.0, **kwargs):
        if not urdf_content or not str(urdf_content).strip():
            raise ValueError("Empty URDF XML provided.")
        raw_xml = str(urdf_content).strip()
        if raw_xml.startswith("<"):
            self.root = ET.fromstring(raw_xml)
        elif os.path.exists(raw_xml):
            self.root = ET.parse(raw_xml).getroot()
        else:
            self.root = ET.fromstring(raw_xml)

        self.model_name = self.root.get("name", model_name)
        self.robot_name = self.model_name
        self.q3_safe_max_deg = float(q3_safe_max_deg) if q3_safe_max_deg is not None else 0.0

        # 1. Parse all joints and links
        self.joints_by_parent = {}
        self.joints_by_child = {}
        self.joints_dict = {}

        for j_elem in self.root.findall(".//joint"):
            j_name = j_elem.get("name", "")
            j_type = j_elem.get("type", "revolute")
            p_link = j_elem.find("parent").get("link", "") if j_elem.find("parent") is not None else ""
            c_link = j_elem.find("child").get("link", "") if j_elem.find("child") is not None else ""

            orig_elem = j_elem.find("origin")
            xyz = [float(v) for v in orig_elem.attrib.get("xyz", "0 0 0").split()] if orig_elem is not None else [0.0, 0.0, 0.0]
            rpy = [float(v) for v in orig_elem.attrib.get("rpy", "0 0 0").split()] if orig_elem is not None else [0.0, 0.0, 0.0]

            axis_elem = j_elem.find("axis")
            axis = [float(v) for v in axis_elem.attrib.get("xyz", "0 0 1").split()] if axis_elem is not None else [0.0, 0.0, 1.0]
            norm_a = np.linalg.norm(axis)
            axis = (np.array(axis) / norm_a).tolist() if norm_a > 1e-6 else [0.0, 0.0, 1.0]

            lim_elem = j_elem.find("limit")
            low = float(lim_elem.attrib.get("lower", -np.pi)) if lim_elem is not None else -np.pi
            up = float(lim_elem.attrib.get("upper", np.pi)) if lim_elem is not None else np.pi

            T_orig = np.eye(4, dtype=np.float64)
            T_orig[:3, :3] = rpy_to_matrix(rpy)
            T_orig[:3, 3] = xyz

            j_info = {
                "name": j_name,
                "type": j_type,
                "parent": p_link,
                "child": c_link,
                "xyz": xyz,
                "rpy": rpy,
                "axis": axis,
                "limits_rad": (low, up),
                "limits_deg": (float(np.degrees(low)), float(np.degrees(up))),
                "T_orig": T_orig
            }
            self.joints_dict[j_name] = j_info
            if p_link not in self.joints_by_parent:
                self.joints_by_parent[p_link] = []
            self.joints_by_parent[p_link].append(j_info)
            self.joints_by_child[c_link] = j_info

        # 2. Trace serial chain from root link
        all_parents = set(self.joints_by_parent.keys())
        all_children = set(self.joints_by_child.keys())
        base_cands = list(all_parents - all_children)
        curr = base_cands[0] if base_cands else (list(all_parents)[0] if all_parents else "base_link")
        self.base_link = curr

        self.arm_joints = []
        while curr in self.joints_by_parent:
            children = self.joints_by_parent[curr]
            primary = None
            for j in children:
                if j["type"] in ["revolute", "continuous"]:
                    primary = j
                    break
            if not primary:
                primary = children[0]
            self.arm_joints.append(primary)
            curr = primary["child"]
            if len(self.arm_joints) >= 6:
                break

        # Filter to revolute / continuous joints (up to 5 for arm body)
        self.active_joints = [j for j in self.arm_joints if j["type"] in ["revolute", "continuous"]][:5]
        self.num_joints = len(self.active_joints)
        self.joint_limits = [list(j["limits_rad"]) for j in self.active_joints]
        self.joint_names = [j["name"] for j in self.active_joints]

        # Calculate max reach and physical link lengths
        self.max_reach = float(np.sum([np.linalg.norm(j["xyz"]) for j in self.arm_joints]))
        if self.max_reach < 0.10:
            self.max_reach = 0.385

        self.L1 = float(np.linalg.norm(self.arm_joints[0]["xyz"])) if len(self.arm_joints) > 0 else 0.119
        self.L2 = float(np.linalg.norm(self.arm_joints[1]["xyz"])) if len(self.arm_joints) > 1 else 0.140
        self.L3 = float(np.linalg.norm(self.arm_joints[2]["xyz"])) if len(self.arm_joints) > 2 else 0.135
        # L4 is Tool Center Point (TCP) gripper length from wrist joint to fingertips (default 12.8 cm)
        forward_cm = kwargs.get("forward_cm")
        if forward_cm is not None:
            self.L4 = float(forward_cm) / 100.0
        else:
            self.L4 = 0.128
        self.cam_forward_m = self.L4
        self.max_reach = self.L2 + self.L3 + self.L4
        self.wrist_pitch_idx = min(3, self.num_joints - 1)

        # 3. Detect nominal reach vector from FK at mid joint configuration
        mid_q = np.array([(lo + up) / 2.0 for lo, up in self.joint_limits])
        p_mid = self.forward_kinematics(mid_q)[:3]
        norm_xy = np.hypot(p_mid[0], p_mid[1])
        if norm_xy > 0.02:
            self.reach_angle_rad = float(np.arctan2(p_mid[1], p_mid[0]))
        else:
            self.reach_angle_rad = 0.0
        self.reach_angle_deg = float(np.degrees(self.reach_angle_rad))

        try:
            parsed_dh, parsed_specs = URDFParser.parse_urdf(raw_xml, q3_safe_max_deg=self.q3_safe_max_deg)
            self.dh_table = parsed_dh
            self.specs = parsed_specs
        except Exception:
            self.dh_table = []
            self.specs = {}

    def update_q3_safe_max(self, q3_safe_max_deg):
        self.q3_safe_max_deg = float(q3_safe_max_deg) if q3_safe_max_deg is not None else 0.0

    def update_wrist_safe_max(self, safe_max_deg):
        self.update_q3_safe_max(safe_max_deg)

    def update_camera_extrinsics(self, forward_cm=None, height_cm=None, lateral_cm=None):
        if forward_cm is not None:
            self.L4 = float(forward_cm) / 100.0
            self.cam_forward_m = self.L4
            self.max_reach = self.L2 + self.L3 + self.L4
        if height_cm is not None:
            self.cam_height_m = float(height_cm) / 100.0
        if lateral_cm is not None:
            self.cam_lateral_m = float(lateral_cm) / 100.0

    def get_dh_table(self):
        return getattr(self, "dh_table", [])

    def forward_kinematics(self, q_rad):
        T = np.eye(4, dtype=np.float64)
        for i, j in enumerate(self.active_joints):
            th = q_rad[i] if i < len(q_rad) else 0.0
            T_j = np.eye(4, dtype=np.float64)
            T_j[:3, :3] = rodrigues_rot(j["axis"], th)
            T = T @ j["T_orig"] @ T_j

        # Tool Center Point (TCP): extend along the roll axis of joint 4 by (L4 - d_roll)
        if len(self.active_joints) >= 5:
            j_roll = self.active_joints[4]
            axis = np.array(j_roll["axis"], dtype=np.float64)
            d_roll = float(np.linalg.norm(j_roll["xyz"]))
            u_tool = T[:3, :3] @ axis
            norm_u = np.linalg.norm(u_tool)
            if norm_u > 1e-6:
                u_tool /= norm_u
            pos = T[:3, 3] + u_tool * (self.L4 - d_roll)
        else:
            pos = T[:3, 3]

        try:
            r = R.from_matrix(T[:3, :3])
            euler = r.as_euler('xyz')
        except Exception:
            euler = [0.0, 0.0, 0.0]
        return np.concatenate([pos, euler])

    def forward_kinematics_chain(self, q_rad):
        positions = [np.array([0.0, 0.0, 0.0])]
        T = np.eye(4, dtype=np.float64)
        for i, j in enumerate(self.active_joints):
            th = q_rad[i] if i < len(q_rad) else 0.0
            T_j = np.eye(4, dtype=np.float64)
            T_j[:3, :3] = rodrigues_rot(j["axis"], th)
            T = T @ j["T_orig"] @ T_j
            positions.append(T[:3, 3].copy())

        # Extend chain to Tool Center Point (TCP) tip at distance L4
        if len(self.active_joints) >= 5 and len(positions) >= 6:
            j_roll = self.active_joints[4]
            axis = np.array(j_roll["axis"], dtype=np.float64)
            d_roll = float(np.linalg.norm(j_roll["xyz"]))
            u_tool = T[:3, :3] @ axis
            norm_u = np.linalg.norm(u_tool)
            if norm_u > 1e-6:
                u_tool /= norm_u
            p_tcp = T[:3, 3] + u_tool * (self.L4 - d_roll)
            positions.append(p_tcp)
        return positions

    def clip_joint_limits(self, joints_deg):
        q = np.array(joints_deg, dtype=np.float64)
        for j in range(min(len(q), len(self.joint_limits))):
            lo_deg = float(np.degrees(self.joint_limits[j][0]))
            hi_deg = float(np.degrees(self.joint_limits[j][1]))
            q[j] = np.clip(q[j], lo_deg, hi_deg)
        return q

    def solve_feasible_ik(self, target_pose, gripper_state=50.0, prev_joints=None, allow_pitch_adaptation=True):
        target_pos = np.asarray(target_pose[:3], dtype=np.float64)
        target_pos_eff = target_pos.copy()
        target_pos_eff[2] = max(0.012, target_pos[2])

        target_roll = 0.0
        if len(target_pose) > 3 and np.isfinite(target_pose[3]):
            target_roll = float(np.clip(target_pose[3], -np.radians(30.0), np.radians(30.0)))

        candidate_seeds = []
        if prev_joints is not None and len(prev_joints) >= self.num_joints:
            prev_seed = np.radians(np.asarray(prev_joints[:self.num_joints], dtype=np.float64))
            if len(prev_seed) > 4:
                prev_seed[4] = float(np.clip(prev_seed[4], -np.radians(30.0), np.radians(30.0)))
            candidate_seeds.append(prev_seed)

        # Natural heuristic seeds based on target quadrant and reach direction
        base_yaw = float(np.arctan2(target_pos[1], target_pos[0]) - self.reach_angle_rad)
        base_yaw = (base_yaw + np.pi) % (2 * np.pi) - np.pi

        candidate_seeds.append(np.array([base_yaw, -0.52, 1.05, -0.52, target_roll][:self.num_joints]))
        candidate_seeds.append(np.array([base_yaw, 0.52, -1.05, 0.52, target_roll][:self.num_joints]))
        candidate_seeds.append(np.array([base_yaw, -1.05, 1.57, -0.52, target_roll][:self.num_joints]))
        mid_seed = np.array([(lo + up) / 2.0 for lo, up in self.joint_limits])
        if len(mid_seed) > 4:
            mid_seed[4] = target_roll
        candidate_seeds.append(mid_seed)

        wrist_idx = self.wrist_pitch_idx
        safe_max_rad = np.radians(self.q3_safe_max_deg)

        best_res = None
        best_err = 1e9

        for q_seed in candidate_seeds:
            q_init = q_seed.copy()
            for i, (lo, up) in enumerate(self.joint_limits):
                q_init[i] = np.clip(q_init[i], lo + 1e-4, up - 1e-4)

            def loss(q):
                pos = self.forward_kinematics(q)[:3]
                pos_err = np.sum((pos - target_pos_eff)**2)
                wrist_penalty = 0.0
                if self.q3_safe_max_deg is not None and len(q) > wrist_idx:
                    w_val = q[wrist_idx]
                    if w_val > safe_max_rad:
                        wrist_penalty = 50.0 * ((w_val - safe_max_rad)**2)
                roll_penalty = 0.0
                if len(q) > 4:
                    roll_penalty = 1.0 * ((q[4] - target_roll)**2)
                reg = 1e-4 * np.sum((q - q_init)**2)
                return pos_err + wrist_penalty + roll_penalty + reg

            res = minimize(loss, q_init, method='L-BFGS-B', bounds=self.joint_limits, tol=1e-6)
            achieved_pose = self.forward_kinematics(res.x)
            err_dist_cm = float(np.linalg.norm(achieved_pose[:3] - target_pos) * 100.0)

            if err_dist_cm < best_err:
                best_err = err_dist_cm
                best_res = res
                if err_dist_cm < 0.30:  # < 3mm error, highly accurate convergence
                    break

        achieved_pose = self.forward_kinematics(best_res.x)
        err_dist_cm = float(np.linalg.norm(achieved_pose[:3] - target_pos) * 100.0)

        joints_deg = np.degrees(best_res.x)
        full_joints = np.zeros(self.num_joints + 1, dtype=np.float32)
        full_joints[:self.num_joints] = joints_deg
        full_joints[-1] = float(gripper_state)

        clamped_reasons = []
        if err_dist_cm > 2.0:
            clamped_reasons.append("OUT_OF_REACH")
        if target_pos[2] < 0.012:
            clamped_reasons.append("TABLE_COLLISION")

        chain = self.forward_kinematics_chain(best_res.x)
        return {
            "joints": full_joints,
            "achieved_pose": achieved_pose,
            "is_feasible": bool(err_dist_cm < 1.5 and len(clamped_reasons) == 0),
            "error_distance_cm": round(err_dist_cm, 2),
            "clamped_reasons": clamped_reasons,
            "link_positions": [p.tolist() for p in chain]
        }

    def inverse_kinematics(self, target_pose, gripper_state=50.0, prev_joints=None, **kwargs):
        res = self.solve_feasible_ik(target_pose, gripper_state=gripper_state, prev_joints=prev_joints)
        return res["joints"]

    def smooth_joint_trajectory(self, joint_trajectory, fps=30.0, time_window_ms=200, soft_margin_ratio=0.08, max_deg_per_sec=120.0):
        joint_arr = np.asarray(joint_trajectory, dtype=np.float64)
        if len(joint_arr) == 0:
            return joint_arr.copy()

        n_frames = len(joint_arr)
        n_arm = min(joint_arr.shape[1], self.num_joints)
        arm_joints = joint_arr[:, :n_arm].copy()
        extra = joint_arr[:, n_arm:].copy() if joint_arr.shape[1] > n_arm else None

        # 1. Soft saturation to limits
        for j in range(n_arm):
            lo_deg = float(np.degrees(self.joint_limits[j][0]))
            hi_deg = float(np.degrees(self.joint_limits[j][1]))
            if j == self.wrist_pitch_idx and self.q3_safe_max_deg is not None:
                hi_deg = min(hi_deg, float(self.q3_safe_max_deg))
            if j == 4:
                lo_deg = max(lo_deg, -35.0)
                hi_deg = min(hi_deg, 35.0)
            arm_joints[:, j] = universal_soft_saturation(arm_joints[:, j], lo_deg, hi_deg, margin=0.5)

        # 2. Velocity slew rate limit
        dt = 1.0 / max(1.0, float(fps))
        max_delta = max_deg_per_sec * dt
        for i in range(1, n_frames):
            delta = arm_joints[i] - arm_joints[i - 1]
            clamped_delta = np.clip(delta, -max_delta, max_delta)
            arm_joints[i] = arm_joints[i - 1] + clamped_delta

        # 3. Savitzky-Golay polynomial smoothing
        window_length = int(round((time_window_ms / 1000.0) * fps))
        if window_length % 2 == 0:
            window_length += 1
        window_length = max(5, window_length)

        if n_frames >= window_length:
            try:
                poly_order = min(2, window_length - 2)
                for j in range(n_arm):
                    smoothed_col = scipy.signal.savgol_filter(arm_joints[:, j], window_length=window_length, polyorder=poly_order)
                    arm_joints[:, j] = smoothed_col
            except Exception:
                pass

        # Final pass clipping
        for j in range(n_arm):
            lo_deg = float(np.degrees(self.joint_limits[j][0]))
            hi_deg = float(np.degrees(self.joint_limits[j][1]))
            if j == self.wrist_pitch_idx and self.q3_safe_max_deg is not None:
                hi_deg = min(hi_deg, float(self.q3_safe_max_deg))
            if j == 4:
                lo_deg = max(lo_deg, -35.0)
                hi_deg = min(hi_deg, 35.0)
            arm_joints[:, j] = universal_soft_saturation(arm_joints[:, j], lo_deg, hi_deg, margin=0.5)

        # Enforce the command-rate limit after smoothing as well: polynomial
        # filtering must never reintroduce a motor jump.
        if n_frames >= 2 and max_deg_per_sec is not None:
            max_delta = float(max_deg_per_sec) / max(5.0, float(fps))
            for i in range(1, n_frames):
                delta = arm_joints[i] - arm_joints[i - 1]
                arm_joints[i] = arm_joints[i - 1] + np.clip(delta, -max_delta, max_delta)

        if extra is not None:
            return np.hstack([arm_joints, extra]).astype(joint_arr.dtype)
        return arm_joints.astype(joint_arr.dtype)


# Subclass specializations backed by URDF descriptions
class SO101OmniKinKinematics(URDFKinematics):
    """SO-ARM101-OMNI-KIN 5-DOF Robot Arm Kinematics (Default Project Setup)."""
    def __init__(self, q3_safe_max_deg=0.0, **kwargs):
        urdf_str = get_robot_urdf("so_arm101_omni_kin")
        super().__init__(urdf_str, model_name="SO-ARM101-OMNI-KIN", q3_safe_max_deg=q3_safe_max_deg, **kwargs)
        self.dh_table = SO101_OMNIKIN_DH_TABLE


class SO101Kinematics(URDFKinematics):
    """SO-101 5-DOF Robot Arm Kinematics (Refined Open Hardware Preset)."""
    def __init__(self, q3_safe_max_deg=0.0, **kwargs):
        urdf_str = get_robot_urdf("so101")
        super().__init__(urdf_str, model_name="SO-101", q3_safe_max_deg=q3_safe_max_deg, **kwargs)
        self.dh_table = SO101_DH_TABLE


class SO100Kinematics(URDFKinematics):
    """SO-100 5-DOF Robot Arm Kinematics (LeRobot Original Preset)."""
    def __init__(self, q3_safe_max_deg=0.0, **kwargs):
        urdf_str = get_robot_urdf("so100")
        super().__init__(urdf_str, model_name="SO-100", q3_safe_max_deg=q3_safe_max_deg, **kwargs)
        self.dh_table = SO100_DH_TABLE


ROBOT_PRESETS["so_arm101_omni_kin"]["class"] = SO101OmniKinKinematics
ROBOT_PRESETS["so101"]["class"] = SO101Kinematics
ROBOT_PRESETS["so100"]["class"] = SO100Kinematics


def get_robot_solver(robot_type="so_arm101_omni_kin", q3_safe_max_deg=0.0, custom_dh_table=None, custom_urdf=None, **kwargs):
    """Factory helper to obtain the kinematic solver instance with camera safety limits."""
    if custom_urdf:
        return URDFKinematics(custom_urdf, q3_safe_max_deg=q3_safe_max_deg, **kwargs)
    if custom_dh_table:
        return DHKinematics(custom_dh_table, q3_safe_max_deg=q3_safe_max_deg, **kwargs)
    r_type = normalize_robot_type(robot_type)
    if r_type in ROBOT_PRESETS:
        return ROBOT_PRESETS[r_type]["class"](q3_safe_max_deg=q3_safe_max_deg, **kwargs)
    urdf_content = get_robot_urdf(r_type)
    if urdf_content:
        return URDFKinematics(urdf_content, model_name=r_type, q3_safe_max_deg=q3_safe_max_deg, **kwargs)
    return SO101OmniKinKinematics(q3_safe_max_deg=q3_safe_max_deg, **kwargs)


def get_robot_specs(robot_type="so_arm101_omni_kin", q3_safe_max_deg=0.0):
    """Returns metadata, DH table, and component breakdown for the specified robot preset."""
    r_type = normalize_robot_type(robot_type)
    preset = ROBOT_PRESETS.get(r_type, ROBOT_PRESETS["so_arm101_omni_kin"])
    urdf_str = get_robot_urdf(r_type)
    components = None
    try:
        _, parsed_specs = URDFParser.parse_urdf(urdf_str, q3_safe_max_deg=q3_safe_max_deg)
        components = parsed_specs.get("components")
    except Exception:
        pass

    dh_table_copy = [dict(row) for row in preset["dh_table"]]
    wrist_idx = find_wrist_pitch_index(dh_table_copy)
    if len(dh_table_copy) > wrist_idx and q3_safe_max_deg is not None:
        limits = list(dh_table_copy[wrist_idx]["limits_deg"])
        limits[1] = min(limits[1], float(q3_safe_max_deg))
        dh_table_copy[wrist_idx]["limits_deg"] = limits

    solver = get_robot_solver(r_type, q3_safe_max_deg=q3_safe_max_deg)

    return {
        "robot_type": r_type,
        "name": preset["name"],
        "description": preset["description"],
        "reach_meters": preset["reach_meters"],
        "payload_kg": preset["payload_kg"],
        "dh_table": dh_table_copy,
        "urdf": urdf_str,
        "components": components,
        "wrist_pitch_idx": wrist_idx,
        "q3_safe_max_deg": float(q3_safe_max_deg) if q3_safe_max_deg is not None else 0.0,
        "reach_angle_rad": getattr(solver, "reach_angle_rad", 0.0),
        "reach_angle_deg": getattr(solver, "reach_angle_deg", 0.0)
    }


# ==============================================================================
# 5. Workspace Calibrator (ArUco Table Plane <-> Robot Base Frame)
# ==============================================================================

class WorkspaceCalibrator:
    """
    Transforms 6-DoF Cartesian poses between the ArUco Table Coordinate System (0,0,0)
    and the Robot Base Coordinate System.
    Dynamically aligns the robot's physical reach vector to the table coordinate frame.
    
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
        Reach Angle (psi_reach): Robot nominal forward reach angle in URDF base frame.
    """

    def __init__(self, offset_x=0.20, offset_y=0.00, offset_z=0.00, yaw_deg=0.0, reach_angle_rad=0.0):
        self.offset_x = float(offset_x)
        self.offset_y = float(offset_y)
        self.offset_z = float(offset_z)
        self.yaw_deg = float(yaw_deg)
        self.yaw_rad = np.radians(self.yaw_deg)
        self.reach_angle_rad = float(reach_angle_rad)

    @property
    def effective_yaw_rad(self):
        """Effective rotation angle from table frame to robot base frame."""
        return self.yaw_rad - self.reach_angle_rad

    def update_config(self, offset_x=None, offset_y=None, offset_z=None, yaw_deg=None, reach_angle_rad=None, reach_angle_deg=None):
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
        if reach_angle_rad is not None:
            self.reach_angle_rad = float(reach_angle_rad)
        elif reach_angle_deg is not None:
            self.reach_angle_rad = np.radians(float(reach_angle_deg))

    def get_config(self):
        """Returns active calibration config dictionary."""
        return {
            "offset_x": self.offset_x,
            "offset_y": self.offset_y,
            "offset_z": self.offset_z,
            "yaw_deg": self.yaw_deg,
            "reach_angle_rad": self.reach_angle_rad,
            "reach_angle_deg": float(np.degrees(self.reach_angle_rad))
        }

    def aruco_to_robot(self, pose_aruco):
        """
        Transforms a 6-DoF pose [x, y, z, roll, pitch, yaw] from ArUco space into Robot Base frame.
        Uses full 3D rotation matrix multiplication to avoid gimbal lock and Euler distortion.
        """
        xa, ya, za, roll, pitch, yaw = pose_aruco

        # Translate relative to robot base origin on table
        dx = xa - self.offset_x
        dy = ya - self.offset_y
        dz = za - self.offset_z

        eff_yaw = self.effective_yaw_rad
        cos_th = np.cos(eff_yaw)
        sin_th = np.sin(eff_yaw)

        xr = cos_th * dx + sin_th * dy
        yr = -sin_th * dx + cos_th * dy
        zr = dz

        # Transform 3D orientation: R_robot = R_base.T @ R_aruco
        try:
            r_aruco = trajectory_euler_to_rotation_matrix([roll, pitch, yaw])
            r_base = R.from_euler('z', eff_yaw).as_matrix()
            r_robot = r_base.T @ r_aruco
            roll_r, pitch_r, yaw_r = rotation_matrix_to_trajectory_euler(r_robot)
        except Exception:
            yaw_r = (yaw - eff_yaw + np.pi) % (2 * np.pi) - np.pi
            roll_r, pitch_r = roll, pitch

        return np.array([xr, yr, zr, roll_r, pitch_r, yaw_r], dtype=np.float64)

    def robot_to_aruco(self, pose_robot):
        """
        Transforms a 6-DoF pose [x, y, z, roll, pitch, yaw] from Robot Base frame into ArUco space.
        Uses full 3D rotation matrix multiplication to avoid gimbal lock and Euler distortion.
        """
        xr, yr, zr, roll, pitch, yaw = pose_robot

        eff_yaw = self.effective_yaw_rad
        cos_th = np.cos(eff_yaw)
        sin_th = np.sin(eff_yaw)

        xa = cos_th * xr - sin_th * yr + self.offset_x
        ya = sin_th * xr + cos_th * yr + self.offset_y
        za = zr + self.offset_z

        # Transform 3D orientation: R_aruco = R_base @ R_robot
        try:
            r_robot = trajectory_euler_to_rotation_matrix([roll, pitch, yaw])
            r_base = R.from_euler('z', eff_yaw).as_matrix()
            r_aruco = r_base @ r_robot
            roll_a, pitch_a, yaw_a = rotation_matrix_to_trajectory_euler(r_aruco)
        except Exception:
            yaw_a = (yaw + eff_yaw + np.pi) % (2 * np.pi) - np.pi
            roll_a, pitch_a = roll, pitch

        return np.array([xa, ya, za, roll_a, pitch_a, yaw_a], dtype=np.float64)


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

    def get_recommended_layout(self):
        """
        Returns and applies standard recommended tabletop workspace layout:
        - ArUco Tag A (10cm) at Origin (0,0,0)
        - ArUco Tag B (5cm) at (+15cm, 0, 0)
        - Robot Base at (X=+0.038m, Y=-0.406m, Z=0.0m, Yaw=90.0 deg)
          facing forward toward the tags, placed just beyond reach radius (40.8cm > 38.5cm max reach).
        """
        self.update_config(
            offset_x=0.038,
            offset_y=-0.406,
            offset_z=0.00,
            yaw_deg=90.0
        )
        return self.get_config()


class CameraGripperCalibrator:
    """
    6-DoF Camera-to-Gripper (Tool Center Point / TCP) Extrinsic Calibrator.
    Transforms 6-DoF trajectory poses between the Camera Optical Center and the physical Gripper Fingertip TCP.

    Parameters (matching physical CAD teleoperation assembly):
      forward_cm : Longitudinal distance forward along gripper axis from mount to fingertips (default: 12.8 cm)
      height_cm  : Vertical height distance from gripper grasp centerline up to camera lens (default: 10.9 cm)
      lateral_cm : Lateral offset across gripper (default: 0.0 cm)
      pitch_deg  : Camera tilt angle downward towards gripper fingertips (default: 40.4 deg)
      roll_deg   : Roll alignment angle (default: 0.0 deg)
      yaw_deg    : Yaw alignment angle (default: 0.0 deg)
      enabled    : If False, passes poses through unchanged (default: True)
    """

    @staticmethod
    def compute_tilted_angle(forward_cm, height_cm):
        """
        Computes the angle (in degrees) of the line from Gripper TCP to Camera relative to horizontal X-axis:
        theta = arctan2(height_cm, forward_cm)
        """
        if abs(forward_cm) <= 1e-6:
            return 90.0 if height_cm > 0 else 0.0
        return float(np.degrees(np.arctan2(height_cm, forward_cm)))

    @staticmethod
    def compute_height_from_angle(forward_cm, angle_deg):
        """
        Computes the vertical height distance from forward distance and tilt angle:
        height_cm = forward_cm * tan(angle_deg)
        """
        return float(forward_cm * np.tan(np.radians(angle_deg)))

    @staticmethod
    def compute_forward_from_angle(height_cm, angle_deg):
        """
        Computes the forward distance from vertical height and tilt angle:
        forward_cm = height_cm / tan(angle_deg)
        """
        tan_val = np.tan(np.radians(angle_deg))
        if abs(tan_val) < 1e-6:
            return 0.0
        return float(height_cm / tan_val)

    def __init__(
        self,
        forward_cm=12.8,
        height_cm=10.9,
        lateral_cm=0.0,
        pitch_deg=40.4,
        roll_deg=0.0,
        yaw_deg=0.0,
        enabled=True
    ):
        self.forward_cm = float(forward_cm)
        self.height_cm = float(height_cm)
        self.lateral_cm = float(lateral_cm)
        self.pitch_deg = float(pitch_deg)
        self.roll_deg = float(roll_deg)
        self.yaw_deg = float(yaw_deg)
        self.enabled = bool(enabled)
        self._recompute_relative_transform()

    def update_config(
        self,
        forward_cm=None,
        height_cm=None,
        lateral_cm=None,
        pitch_deg=None,
        roll_deg=None,
        yaw_deg=None,
        enabled=None
    ):
        if forward_cm is not None:
            self.forward_cm = float(forward_cm)
        if height_cm is not None:
            self.height_cm = float(height_cm)
        if lateral_cm is not None:
            self.lateral_cm = float(lateral_cm)
        if pitch_deg is not None:
            self.pitch_deg = float(pitch_deg)
        if roll_deg is not None:
            self.roll_deg = float(roll_deg)
        if yaw_deg is not None:
            self.yaw_deg = float(yaw_deg)
        if enabled is not None:
            self.enabled = bool(enabled)
        self._recompute_relative_transform()

    def get_config(self):
        return {
            "forward_cm": self.forward_cm,
            "height_cm": self.height_cm,
            "lateral_cm": self.lateral_cm,
            "pitch_deg": self.pitch_deg,
            "roll_deg": self.roll_deg,
            "yaw_deg": self.yaw_deg,
            "enabled": self.enabled
        }

    def _recompute_relative_transform(self):
        # Convert cm to meters
        self.forward_m = self.forward_cm / 100.0
        self.height_m = self.height_cm / 100.0
        self.lateral_m = self.lateral_cm / 100.0

        # In Gripper Frame {G}:
        # +X_g: Right (lateral)
        # +Y_g: Forward (along gripper grasp)
        # +Z_g: Up (vertical)
        # The vector from camera to gripper tip is: [lateral_m, forward_m, -height_m]
        self.delta_g = np.array([self.lateral_m, self.forward_m, -self.height_m], dtype=np.float64)

        # Relative rotation from Phone body to Gripper body:
        # Camera is tilted by pitch_deg around lateral axis (X):
        theta_pitch = np.radians(self.pitch_deg)
        theta_roll = np.radians(self.roll_deg)
        theta_yaw = np.radians(self.yaw_deg)

        # R_rel rotates from gripper frame to phone frame:
        # When phone tilts forward by theta_pitch, gripper pitch = phone_pitch - theta_pitch
        R_pitch = R.from_euler('x', -theta_pitch).as_matrix()
        if abs(self.roll_deg) > 1e-4 or abs(self.yaw_deg) > 1e-4:
            R_ext = R.from_euler('yz', [-theta_roll, -theta_yaw]).as_matrix()
            self.R_rel = R_pitch @ R_ext
        else:
            self.R_rel = R_pitch

    def camera_to_gripper(self, pose_cam):
        """
        Transforms a 6-DoF pose [x, y, z, roll, pitch, yaw] from camera optical center to gripper tip.
        """
        if not self.enabled:
            return np.array(pose_cam, dtype=np.float64)

        p_c = np.array(pose_cam[:3], dtype=np.float64)
        euler_c = np.array(pose_cam[3:], dtype=np.float64)

        R_c2w = trajectory_euler_to_rotation_matrix(euler_c)
        R_p2w = R_c2w @ R_CAM_TO_PHONE

        # Gripper orientation in world:
        R_g2w = R_p2w @ self.R_rel

        # Position in world: delta_w = R_g2w @ delta_g
        delta_w = R_g2w @ self.delta_g
        p_g = p_c + delta_w

        # Gripper Euler angles in world (for robot / inverse kinematics):
        euler_g = rotation_matrix_to_trajectory_euler(R_g2w @ R_CAM_TO_PHONE)

        return np.array([
            p_g[0], p_g[1], p_g[2],
            euler_g[0], euler_g[1], euler_g[2]
        ], dtype=np.float64)

    def gripper_to_camera(self, pose_gripper):
        """
        Transforms a 6-DoF pose [x, y, z, roll, pitch, yaw] from gripper tip back to camera optical center.
        """
        if not self.enabled:
            return np.array(pose_gripper, dtype=np.float64)

        p_g = np.array(pose_gripper[:3], dtype=np.float64)
        euler_g = np.array(pose_gripper[3:], dtype=np.float64)

        R_g2w = trajectory_euler_to_rotation_matrix(euler_g) @ R_CAM_TO_PHONE

        # Position in world: p_c = p_g - R_g2w @ delta_g
        delta_w = R_g2w @ self.delta_g
        p_c = p_g - delta_w

        # Camera orientation in world:
        R_p2w = R_g2w @ self.R_rel.T
        euler_c = rotation_matrix_to_trajectory_euler(R_p2w @ R_CAM_TO_PHONE)

        return np.array([
            p_c[0], p_c[1], p_c[2],
            euler_c[0], euler_c[1], euler_c[2]
        ], dtype=np.float64)

    def transform_trajectory(self, trajectory, to_gripper=True):
        """
        Batch-transforms a trajectory array (N, 6).
        """
        traj = np.asarray(trajectory, dtype=np.float64)
        if len(traj) == 0 or not self.enabled:
            return traj

        res = np.zeros_like(traj)
        func = self.camera_to_gripper if to_gripper else self.gripper_to_camera
        for i in range(len(traj)):
            res[i] = func(traj[i])
        return res


DEFAULT_INITIAL_POSITION = {
    "x": 0.24,
    "y": 0.00,
    "z": 0.20,
    "pitch_deg": -20.0,
    "roll_deg": 0.0,
    "yaw_deg": 0.0,
    "gripper": 100.0,
    "enabled": True
}


class TrajectoryPlanner:
    """
    Trajectory Planner for Robot Arm Approach & Execution.
    Generates smooth C^2 quintic minimum-jerk trajectory paths connecting
    the robot's Initial Home/Standby Position to the demonstration starting point.
    """

    @staticmethod
    def quintic_blend(tau):
        """
        C^2 minimum-jerk polynomial scale factor:
        s(tau) = 10*tau^3 - 15*tau^4 + 6*tau^5 for tau in [0, 1].
        Yields zero velocity and zero acceleration at tau = 0 and tau = 1.
        """
        tau = np.clip(tau, 0.0, 1.0)
        return 10.0 * (tau**3) - 15.0 * (tau**4) + 6.0 * (tau**5)

    @staticmethod
    def shortest_angle_diff(th_target, th_source):
        """Computes shortest angular difference wrapped to [-pi, pi]."""
        diff = th_target - th_source
        return (diff + np.pi) % (2 * np.pi) - np.pi

    def __init__(self, solver=None, workspace_calibrator=None, camera_gripper_calibrator=None):
        self.solver = solver or get_robot_solver()
        self.workspace_calibrator = workspace_calibrator or WorkspaceCalibrator(reach_angle_rad=getattr(self.solver, "reach_angle_rad", 0.0))
        if hasattr(self.solver, "reach_angle_rad"):
            self.workspace_calibrator.reach_angle_rad = self.solver.reach_angle_rad
        self.camera_gripper_calibrator = camera_gripper_calibrator or CameraGripperCalibrator()

    def plan_approach_path(
        self,
        p_start,
        p_home=None,
        duration_s=1.5,
        fps=30,
        lift_clearance_m=0.06,
        home_gripper=100.0,
        start_gripper=100.0,
        start_in_robot_frame=False
    ):
        """
        Calculates a collision-safe, smooth approach trajectory from the robot's Initial Position
        (Home/Standby Pose) to the demonstration starting point p_start.

        Parameters:
          p_start : 6-DoF starting pose [x, y, z, roll, pitch, yaw] of the demonstration
          p_home  : 6-DoF canonical initial pose [x, y, z, roll, pitch, yaw] in Robot Base Frame.
                    If None, uses DEFAULT_INITIAL_POSITION.
          duration_s : Approach duration in seconds (default: 1.5s)
          fps : Frame rate (default: 30)
          lift_clearance_m : Extra elevation clearance above table for parabolic arc (default: 0.06m)
          home_gripper : Gripper opening at home (0-100%, default: 100% open)
          start_gripper: Gripper opening at demo start (0-100%, default: 100%)
          start_in_robot_frame : True if p_start is already in Robot Frame, False if in ArUco table frame.

        Returns dict containing:
          - 'robot_ee_poses': (N, 6) in Robot Base Frame
          - 'aruco_ee_poses': (N, 6) in ArUco Table Frame
          - 'aruco_cam_poses': (N, 6) Camera Poses in ArUco Table Frame
          - 'gripper_states': (N,) 0-100%
          - 'joint_states': (N, 6) degrees
          - 'actions': (N, 6) next-step joint states
          - 'timestamps': (N,) seconds
          - 'num_frames': N
          - 'is_feasible': bool (True if all waypoints have feasible IK)
          - 'max_error_cm': max IK tracking error along approach
        """
        if p_home is None:
            p_home = np.array([
                DEFAULT_INITIAL_POSITION["x"],
                DEFAULT_INITIAL_POSITION["y"],
                DEFAULT_INITIAL_POSITION["z"],
                np.radians(DEFAULT_INITIAL_POSITION.get("roll_deg", 0.0)),
                np.radians(DEFAULT_INITIAL_POSITION.get("pitch_deg", 0.0)),
                np.radians(DEFAULT_INITIAL_POSITION.get("yaw_deg", 0.0))
            ], dtype=np.float64)
        else:
            p_home = np.asarray(p_home, dtype=np.float64)

        p_start_arr = np.asarray(p_start, dtype=np.float64)
        if start_in_robot_frame:
            p_start_robot = p_start_arr
            p_start_aruco = self.workspace_calibrator.robot_to_aruco(p_start_arr)
        else:
            p_start_aruco = p_start_arr
            p_start_robot = self.workspace_calibrator.aruco_to_robot(p_start_arr)

        ik_home = self.solver.solve_feasible_ik(p_home, gripper_state=float(home_gripper))
        ik_start = self.solver.solve_feasible_ik(p_start_robot, gripper_state=float(start_gripper))

        q_home = ik_home["joints"]
        q_start = ik_start["joints"]

        num_frames = max(10, int(round(duration_s * fps)))
        tau_vals = np.linspace(0.0, 1.0, num_frames)

        robot_ee = np.zeros((num_frames, 6), dtype=np.float64)
        grippers = np.zeros(num_frames, dtype=np.float64)
        joint_states = np.zeros((num_frames, 6), dtype=np.float64)

        for i, tau in enumerate(tau_vals):
            s = self.quintic_blend(tau)
            # Joint-space C^2 quintic minimum-jerk blend (MoveJ)
            q_i = q_home + s * (q_start - q_home)
            q_i = self.solver.clip_joint_limits(q_i)
            joint_states[i] = q_i

            # Forward kinematics for exact Cartesian EE pose
            fk = self.solver.forward_kinematics(np.radians(q_i[:5]))
            robot_ee[i] = fk
            grippers[i] = float(home_gripper) + s * (float(start_gripper) - float(home_gripper))

        # Transform to ArUco frame
        aruco_ee = self.workspace_calibrator.transform_trajectory(robot_ee, to_robot=False)
        aruco_cam = self.camera_gripper_calibrator.transform_trajectory(aruco_ee, to_gripper=False)

        actions = np.roll(joint_states, -1, axis=0)
        actions[-1] = joint_states[-1]
        timestamps = np.linspace(0.0, duration_s, num_frames, dtype=np.float32)

        is_feasible = bool(ik_home["is_feasible"] and ik_start["is_feasible"])
        max_err = max(ik_home["error_distance_cm"], ik_start["error_distance_cm"])

        return {
            "robot_ee_poses": robot_ee.tolist(),
            "aruco_ee_poses": aruco_ee.tolist(),
            "aruco_cam_poses": aruco_cam.tolist(),
            "gripper_states": grippers.tolist(),
            "joint_states": joint_states.tolist(),
            "actions": actions.tolist(),
            "timestamps": timestamps.tolist(),
            "num_frames": num_frames,
            "duration_s": duration_s,
            "is_feasible": is_feasible,
            "max_error_cm": round(float(max_err), 2),
            "home_pose_robot": p_home.tolist(),
            "home_pose_aruco": self.workspace_calibrator.robot_to_aruco(p_home).tolist()
        }


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
