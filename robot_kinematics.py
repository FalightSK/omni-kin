"""
robot_kinematics.py
Preset and selected-chain URDF kinematics
Includes WorkspaceCalibrator for ArUco Table-Plane-to-Robot-Base Coordinate Transformations
"""

import os
import numpy as np
import xml.etree.ElementTree as ET
from scipy.spatial.transform import Rotation as R
from scipy.optimize import least_squares
import scipy.signal

KINEMATICS_ENGINE_VERSION = "direct_urdf_chain_v4_omni_body_tcp"

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
# 4. Preset and selected-chain URDF kinematics
# ==============================================================================

def get_robot_urdf(robot_type="so_arm101_omni_kin"):
    """Load a preset robot description from the robots directory."""
    robot_type = normalize_robot_type(robot_type)
    filename = {
        "so_arm101_omni_kin": "SO-ARM101-OMNITEC.urdf",
        "so101": "so101.urdf",
        "so100": "so100.urdf",
    }.get(robot_type, "SO-ARM101-OMNITEC.urdf")
    path = os.path.join(os.path.dirname(__file__), "robots", filename)
    with open(path, "r", encoding="utf-8") as urdf_file:
        return urdf_file.read()


class SerialURDFKinematics:
    """Kinematics for a user-selected URDF base-to-TCP path.

    Joint-state convention at the application boundary is degrees for revolute/
    continuous joints and meters for prismatic joints. FK and IK internals use
    radians and meters, exactly as specified by URDF.
    """

    MOVABLE_TYPES = {"revolute", "continuous", "prismatic"}

    @staticmethod
    def describe_urdf(urdf_content):
        root = SerialURDFKinematics._read_root(urdf_content)
        links = [elem.get("name", "") for elem in root.findall("./link") if elem.get("name")]
        parents = set()
        children = set()
        terminal_parent_links = []
        gripper_parents = []
        for elem in root.findall("./joint"):
            p, c = elem.find("parent"), elem.find("child")
            if p is not None and c is not None:
                parents.add(p.get("link", ""))
                children.add(c.get("link", ""))
                terminal_parent_links.append((p.get("link", ""), c.get("link", "")))
                joint_name = elem.get("name", "").lower()
                joint_type = elem.get("type", "")
                child_name = c.get("link", "").lower()
                # Match actuator names and explicit finger/jaw links. A joint
                # upstream of a link called `gripper_base` is the wrist/tool
                # mount, not the arm TCP candidate.
                if joint_type in SerialURDFKinematics.MOVABLE_TYPES and (
                    any(token in joint_name for token in ("grip", "finger", "jaw"))
                    or any(token in child_name for token in ("finger", "jaw"))
                ):
                    gripper_parents.append(p.get("link", ""))
        leaves = sorted(set(links) - parents)
        # Suggest the gripper mount as TCP when a movable jaw/finger is the
        # only terminal mechanism. The selector remains editable in setup.
        suggested_tcp = sorted(set(gripper_parents))
        tcp_candidates = suggested_tcp if len(suggested_tcp) == 1 else leaves
        if not links or not terminal_parent_links:
            raise ValueError("URDF must define named links and at least one joint.")
        return {
            "robot_name": root.get("name", "custom_robot"),
            "links": links,
            "base_candidates": sorted(parents - children),
            "tcp_candidates": tcp_candidates,
        }

    @staticmethod
    def _read_root(urdf_content):
        if not urdf_content or not str(urdf_content).strip():
            raise ValueError("Empty URDF XML provided.")
        value = str(urdf_content).strip()
        try:
            root = ET.fromstring(value) if value.startswith("<") else ET.parse(value).getroot()
        except (ET.ParseError, OSError) as exc:
            raise ValueError(f"Invalid URDF XML: {exc}") from exc
        if root.tag != "robot":
            raise ValueError("URDF root element must be <robot>.")
        return root

    def __init__(self, urdf_content, base_link=None, tcp_link=None, model_name="Custom URDF", **kwargs):
        self.root = self._read_root(urdf_content)
        self.model_name = self.root.get("name", model_name)
        self.robot_name = self.model_name
        self.base_link = base_link
        self.tcp_link = tcp_link
        self.joints_by_parent = {}
        self.joints_by_child = {}
        self.all_links = {elem.get("name") for elem in self.root.findall("./link") if elem.get("name")}
        if not self.all_links:
            raise ValueError("URDF must define at least one named <link>.")

        joint_names = set()
        for elem in self.root.findall("./joint"):
            name = elem.get("name", "").strip()
            kind = elem.get("type", "").strip()
            parent_elem, child_elem = elem.find("parent"), elem.find("child")
            parent = parent_elem.get("link", "") if parent_elem is not None else ""
            child = child_elem.get("link", "") if child_elem is not None else ""
            if not name or name in joint_names:
                raise ValueError(f"URDF joint names must be present and unique (invalid: {name or '<empty>'}).")
            joint_names.add(name)
            if kind not in self.MOVABLE_TYPES | {"fixed"}:
                raise ValueError(f"Joint '{name}' has unsupported type '{kind}'. Supported types: fixed, revolute, continuous, prismatic.")
            if not parent or not child or parent not in self.all_links or child not in self.all_links:
                raise ValueError(f"Joint '{name}' references a missing or unnamed parent/child link.")
            if child in self.joints_by_child:
                raise ValueError(f"Link '{child}' has more than one parent joint; URDF is not a serial rooted tree.")

            origin = elem.find("origin")
            xyz = self._vector(origin.get("xyz", "0 0 0") if origin is not None else "0 0 0", 3, f"joint '{name}' origin xyz")
            rpy = self._vector(origin.get("rpy", "0 0 0") if origin is not None else "0 0 0", 3, f"joint '{name}' origin rpy")
            axis_elem = elem.find("axis")
            raw_axis = self._vector(axis_elem.get("xyz", "0 0 1") if axis_elem is not None else "0 0 1", 3, f"joint '{name}' axis")
            norm = float(np.linalg.norm(raw_axis))
            if kind in self.MOVABLE_TYPES and norm <= 1e-12:
                raise ValueError(f"Joint '{name}' must have a non-zero 3D axis.")
            axis = raw_axis / norm if norm > 1e-12 else np.array([0.0, 0.0, 1.0])

            limit = elem.find("limit")
            velocity = float(limit.get("velocity")) if limit is not None and limit.get("velocity") is not None else None
            if velocity is not None and (not np.isfinite(velocity) or velocity <= 0.0):
                raise ValueError(f"Joint '{name}' has invalid velocity limit; expected a positive finite value.")
            if kind == "continuous":
                lo, hi = -np.inf, np.inf
            elif kind == "fixed":
                lo, hi = 0.0, 0.0
            else:
                if limit is None or limit.get("lower") is None or limit.get("upper") is None:
                    raise ValueError(f"Joint '{name}' ({kind}) must define finite lower and upper limits.")
                lo, hi = float(limit.get("lower")), float(limit.get("upper"))
                if not np.isfinite([lo, hi]).all() or lo >= hi:
                    raise ValueError(f"Joint '{name}' has invalid limits; lower must be finite and less than upper.")

            transform = np.eye(4, dtype=np.float64)
            transform[:3, :3] = rpy_to_matrix(rpy)
            transform[:3, 3] = xyz
            joint = {
                "name": name, "type": kind, "parent": parent, "child": child,
                "xyz": xyz.tolist(), "rpy": rpy.tolist(), "axis": axis.tolist(),
                "limits": [float(lo), float(hi)], "velocity": velocity,
                "mimic": elem.find("mimic") is not None, "T_origin": transform,
            }
            self.joints_by_parent.setdefault(parent, []).append(joint)
            self.joints_by_child[child] = joint

        if not self.joints_by_child:
            raise ValueError("No <joint> definitions found in URDF.")
        all_parent_links = set(self.joints_by_parent)
        roots = sorted(self.all_links - set(self.joints_by_child))
        leaves = sorted(self.all_links - all_parent_links)
        if self.base_link is None:
            if len(roots) != 1:
                raise ValueError(f"Select a base link; URDF has {len(roots)} root links: {', '.join(roots)}.")
            self.base_link = roots[0]
        if self.tcp_link is None:
            if len(leaves) != 1:
                raise ValueError(f"Select a TCP link; URDF has {len(leaves)} terminal links: {', '.join(leaves)}.")
            self.tcp_link = leaves[0]
        if self.base_link not in self.all_links:
            raise ValueError(f"Selected base link '{self.base_link}' does not exist in the URDF.")
        if self.tcp_link not in self.all_links:
            raise ValueError(f"Selected TCP link '{self.tcp_link}' does not exist in the URDF.")
        if self.base_link == self.tcp_link:
            raise ValueError("Selected base and TCP links must be different.")

        reversed_path = []
        cursor = self.tcp_link
        visited = set()
        while cursor != self.base_link:
            if cursor in visited:
                raise ValueError(f"Cycle detected while finding path from '{self.base_link}' to '{self.tcp_link}'.")
            visited.add(cursor)
            joint = self.joints_by_child.get(cursor)
            if joint is None:
                raise ValueError(f"No URDF joint path connects base '{self.base_link}' to TCP '{self.tcp_link}'.")
            reversed_path.append(joint)
            cursor = joint["parent"]
        self.chain_joints = list(reversed(reversed_path))
        mimic_joints = [joint["name"] for joint in self.chain_joints if joint["mimic"]]
        if mimic_joints:
            raise ValueError(f"Selected chain contains mimic joint(s) {', '.join(mimic_joints)}; select a TCP before the coupled gripper mechanism.")
        self.active_joints = [j for j in self.chain_joints if j["type"] in self.MOVABLE_TYPES]
        if not self.active_joints:
            raise ValueError("Selected base-to-TCP path has no movable joints.")
        self.num_joints = len(self.active_joints)
        self.joint_names = [j["name"] for j in self.active_joints]
        self.joint_types = [j["type"] for j in self.active_joints]
        self.joint_units = ["m" if j["type"] == "prismatic" else "deg" for j in self.active_joints]
        self.joint_limits = [tuple(j["limits"]) for j in self.active_joints]
        self.q3_safe_max_deg = kwargs.get("q3_safe_max_deg")
        self.wrist_pitch_idx = min(3, self.num_joints - 1)
        self.wrist_roll_safe_max_deg = kwargs.get("wrist_roll_safe_max_deg")
        self.tool_roll_tracking = bool(kwargs.get("tool_roll_tracking", False))
        self.max_joint_rate_rad_s = kwargs.get("max_joint_rate_rad_s")
        if self.q3_safe_max_deg is not None and self.num_joints > self.wrist_pitch_idx:
            lo, hi = self.joint_limits[self.wrist_pitch_idx]
            self.joint_limits[self.wrist_pitch_idx] = (lo, min(hi, np.radians(float(self.q3_safe_max_deg))))
        if self.wrist_roll_safe_max_deg is not None and self.num_joints > 4:
            lo, hi = self.joint_limits[4]
            safe = np.radians(abs(float(self.wrist_roll_safe_max_deg)))
            self.joint_limits[4] = (max(lo, -safe), min(hi, safe))
        self.chain_description = []
        for joint in self.chain_joints:
            description = {key: joint[key] for key in ("name", "type", "parent", "child", "xyz", "rpy", "axis", "velocity")}
            description["limits"] = [None, None] if joint["type"] == "continuous" else list(joint["limits"])
            self.chain_description.append(description)
        self.max_reach = float(sum(np.linalg.norm(j["xyz"]) for j in self.chain_joints))
        for j in self.active_joints:
            if j["type"] == "prismatic" and np.isfinite(j["limits"]).all():
                self.max_reach += abs(j["limits"][1] - j["limits"][0])
        self.reach_angle_rad = 0.0
        self.reach_angle_deg = 0.0
        self.specs = {
            "robot_name": self.robot_name,
            "base_link": self.base_link,
            "tcp_link": self.tcp_link,
            "joint_names": self.joint_names,
            "joint_types": self.joint_types,
            "joint_units": self.joint_units,
            "reach_meters": self.max_reach,
            "chain": self.chain_description,
        }
        q_mid = np.asarray([0.0 if not np.isfinite(lo + hi) else (lo + hi) * 0.5 for lo, hi in self.joint_limits])
        p_mid = self.forward_kinematics(q_mid)[:3]
        if np.hypot(p_mid[0], p_mid[1]) > 1e-8:
            self.reach_angle_rad = float(np.arctan2(p_mid[1], p_mid[0]))
            self.reach_angle_deg = float(np.degrees(self.reach_angle_rad))

    @staticmethod
    def _vector(value, length, label):
        try:
            result = np.asarray([float(part) for part in str(value).split()], dtype=np.float64)
        except (TypeError, ValueError) as exc:
            raise ValueError(f"{label} must contain {length} finite numbers.") from exc
        if result.shape != (length,) or not np.isfinite(result).all():
            raise ValueError(f"{label} must contain {length} finite numbers.")
        return result

    def state_to_joint_values(self, joint_state):
        state = np.asarray(joint_state, dtype=np.float64)
        if len(state) != self.num_joints:
            raise ValueError(f"Expected {self.num_joints} arm joint values, received {len(state)}.")
        if not np.isfinite(state).all():
            raise ValueError("Joint state contains a non-finite value.")
        values = state.copy()
        for i, kind in enumerate(self.joint_types):
            if kind in ("revolute", "continuous"):
                values[i] = np.radians(values[i])
        return values

    def joint_values_to_state(self, joint_values):
        values = np.asarray(joint_values, dtype=np.float64).copy()
        if len(values) != self.num_joints:
            raise ValueError(f"Expected {self.num_joints} arm joint values, received {len(values)}.")
        for i, kind in enumerate(self.joint_types):
            if kind in ("revolute", "continuous"):
                values[i] = np.degrees(values[i])
        return values

    def _transform_chain(self, q_values):
        q_values = np.asarray(q_values, dtype=np.float64)
        if q_values.shape != (self.num_joints,) or not np.isfinite(q_values).all():
            raise ValueError(f"Expected {self.num_joints} finite internal joint values.")
        T = np.eye(4, dtype=np.float64)
        positions = [T[:3, 3].copy()]
        q_index = 0
        for joint in self.chain_joints:
            T = T @ joint["T_origin"]
            kind = joint["type"]
            if kind in self.MOVABLE_TYPES:
                value = q_values[q_index]
                q_index += 1
                axis = np.asarray(joint["axis"], dtype=np.float64)
                motion = np.eye(4, dtype=np.float64)
                if kind == "prismatic":
                    motion[:3, 3] = axis * value
                else:
                    motion[:3, :3] = rodrigues_rot(axis, value)
                T = T @ motion
            positions.append(T[:3, 3].copy())
        return T, positions

    def forward_kinematics(self, q_values):
        T, _ = self._transform_chain(q_values)
        # Application poses use the phone/tracker trajectory Euler convention.
        # The Omni TCP is a gripper body frame; trajectory Euler values encode
        # body rotation through a camera-frame X flip. Other selected URDF
        # chains retain their existing pose convention.
        pose_rotation = T[:3, :3] @ R_CAM_TO_PHONE if self.tool_roll_tracking else T[:3, :3]
        return np.concatenate([T[:3, 3], rotation_matrix_to_trajectory_euler(pose_rotation)])

    def forward_kinematics_chain(self, q_values):
        return self._transform_chain(q_values)[1]

    def clip_joint_limits(self, joint_state):
        values = self.state_to_joint_values(joint_state)
        for i, (lo, hi) in enumerate(self.joint_limits):
            if np.isfinite(lo):
                values[i] = max(values[i], lo)
            if np.isfinite(hi):
                values[i] = min(values[i], hi)
        return self.joint_values_to_state(values)

    def solve_feasible_ik(self, target_pose, gripper_state=1.0, prev_joints=None, dt_s=None, **kwargs):
        target = np.asarray(target_pose, dtype=np.float64)
        if target.shape[0] < 6 or not np.isfinite(target[:6]).all():
            raise ValueError("IK target must contain finite [x, y, z, roll, pitch, yaw] values.")
        target_rotation = trajectory_euler_to_rotation_matrix(target[3:6])
        prev = None
        if prev_joints is not None:
            prev_arr = np.asarray(prev_joints, dtype=np.float64)
            if len(prev_arr) >= self.num_joints and np.isfinite(prev_arr[:self.num_joints]).all():
                prev = self.state_to_joint_values(prev_arr[:self.num_joints])

        lower = np.empty(self.num_joints, dtype=np.float64)
        upper = np.empty(self.num_joints, dtype=np.float64)
        seed = np.empty(self.num_joints, dtype=np.float64)
        scales = np.ones(self.num_joints, dtype=np.float64)
        for i, (joint, (lo, hi)) in enumerate(zip(self.active_joints, self.joint_limits)):
            if joint["type"] == "continuous":
                center = prev[i] if prev is not None else 0.0
                lower[i], upper[i] = center - 2.0 * np.pi, center + 2.0 * np.pi
                seed[i] = center
            else:
                lower[i], upper[i] = lo, hi
                seed[i] = (lo + hi) * 0.5
            scales[i] = 0.1 if joint["type"] == "prismatic" else 1.0
            if prev is not None:
                seed[i] = np.clip(prev[i], lower[i] + 1e-10, upper[i] - 1e-10)
        if prev is not None and dt_s is not None:
            dt = float(dt_s)
            if not np.isfinite(dt) or dt <= 0.0:
                raise ValueError("dt_s must be a positive finite frame interval.")
            for i, joint in enumerate(self.active_joints):
                if joint["type"] == "prismatic":
                    rate = joint["velocity"] if joint["velocity"] is not None else 0.15
                elif self.max_joint_rate_rad_s is not None:
                    rate = self.max_joint_rate_rad_s
                else:
                    rate = joint["velocity"] if joint["velocity"] is not None else (2.0 * np.pi / 3.0)
                step = float(rate) * dt
                lower[i] = max(lower[i], prev[i] - step)
                upper[i] = min(upper[i], prev[i] + step)
                if lower[i] > upper[i]:
                    lower[i] = upper[i] = float(np.clip(prev[i], self.joint_limits[i][0], self.joint_limits[i][1]))
                seed[i] = np.clip(seed[i], lower[i] + 1e-10, upper[i] - 1e-10) if upper[i] - lower[i] > 2e-10 else lower[i]
        # scipy requires a strictly interior initial point and finite optimization bounds.
        seed = np.minimum(np.maximum(seed, lower + 1e-9), upper - 1e-9)

        # A five-axis arm cannot independently realize an arbitrary 6-DoF pose.
        # The tracked TCP position is the primary task; trying to fit an
        # incompatible orientation can move the tool several centimeters away.
        orientation_weight = kwargs.get("orientation_weight")
        if orientation_weight is None:
            orientation_weight = 0.0 if self.num_joints < 6 else 0.02
        orientation_weight = float(orientation_weight)
        continuity_weight = float(kwargs.get("continuity_weight", 1e-4))
        scales = np.asarray([0.1 if kind == "prismatic" else 1.0 for kind in self.joint_types], dtype=np.float64)

        def residual(q):
            transform, _ = self._transform_chain(q)
            result = transform[:3, 3] - target[:3]
            if orientation_weight > 0.0:
                rotation_error = R.from_matrix(target_rotation @ transform[:3, :3].T).as_rotvec()
                result = np.concatenate([result, rotation_error * orientation_weight])
            if prev is not None:
                result = np.concatenate([result, continuity_weight * (q - prev) / scales])
            return result

        result = least_squares(residual, seed, bounds=(lower, upper), max_nfev=250, ftol=1e-9, xtol=1e-9, gtol=1e-9)
        if self.tool_roll_tracking:
            # This preset's TCP lies on its final wrist-roll axis. Match the
            # measured gripper dorsal direction with that free joint while
            # leaving the position-optimized arm joints and TCP position intact.
            transform, positions = self._transform_chain(result.x)
            forward = positions[-1] - positions[-2]
            forward_norm = np.linalg.norm(forward)
            if forward_norm > 1e-10:
                forward /= forward_norm
                dorsal = transform[:3, 2]
                wanted = -target_rotation[:3, 2]
                wanted -= forward * np.dot(wanted, forward)
                wanted_norm = np.linalg.norm(wanted)
                if wanted_norm > 1e-10:
                    wanted /= wanted_norm
                    correction = np.arctan2(
                        np.dot(forward, np.cross(dorsal, wanted)),
                        np.dot(dorsal, wanted),
                    )
                    result.x[-1] = np.clip(result.x[-1] + correction, lower[-1], upper[-1])
        achieved_transform, _ = self._transform_chain(result.x)
        achieved_rotation = achieved_transform[:3, :3] @ R_CAM_TO_PHONE if self.tool_roll_tracking else achieved_transform[:3, :3]
        achieved = np.concatenate([achieved_transform[:3, 3], rotation_matrix_to_trajectory_euler(achieved_rotation)])
        position_error = float(np.linalg.norm(achieved_transform[:3, 3] - target[:3]))
        orientation_error = float(np.linalg.norm(R.from_matrix(target_rotation @ achieved_rotation.T).as_rotvec()))
        state = self.joint_values_to_state(result.x)
        joints = np.concatenate([state, [float(gripper_state)]]).astype(np.float32)
        reasons = []
        if not result.success:
            reasons.append("IK_DID_NOT_CONVERGE")
        if position_error > 0.015:
            reasons.append("POSITION_ERROR")
        if position_error > 0.05:
            reasons.append("OUT_OF_REACH")
        if orientation_weight > 0.0 and orientation_error > 0.15:
            reasons.append("ORIENTATION_ERROR")
        if target[2] < 0.012:
            reasons.append("TABLE_COLLISION")
        return {
            "joints": joints,
            "achieved_pose": achieved,
            "is_feasible": not reasons,
            "error_distance_cm": round(position_error * 100.0, 3),
            "orientation_error_rad": orientation_error,
            "clamped_reasons": reasons,
            "link_positions": [point.tolist() for point in self.forward_kinematics_chain(result.x)],
        }

    def inverse_kinematics(self, target_pose, gripper_state=1.0, prev_joints=None, **kwargs):
        return self.solve_feasible_ik(target_pose, gripper_state=gripper_state, prev_joints=prev_joints, **kwargs)["joints"]

    def smooth_joint_trajectory(self, joint_trajectory, fps=30.0, time_window_ms=200, **kwargs):
        data = np.asarray(joint_trajectory, dtype=np.float64).copy()
        if data.ndim != 2 or data.shape[1] < self.num_joints + 1:
            raise ValueError(f"Custom trajectory must have {self.num_joints} arm joints followed by gripper.")
        arm = np.vstack([self.state_to_joint_values(row[:self.num_joints]) for row in data])
        window = max(5, int(round(float(time_window_ms) * max(1.0, float(fps)) / 1000.0)) | 1)
        for joint_idx, joint in enumerate(self.active_joints):
            if len(arm) >= window:
                arm[:, joint_idx] = scipy.signal.savgol_filter(arm[:, joint_idx], window_length=window, polyorder=min(2, window - 2))
            lo, hi = self.joint_limits[joint_idx]
            if joint["type"] != "continuous":
                arm[:, joint_idx] = np.clip(arm[:, joint_idx], lo, hi)
            default_rate = (2.0 * np.pi / 3.0) if joint["type"] != "prismatic" else 0.15
            rate = (
                self.max_joint_rate_rad_s
                if self.max_joint_rate_rad_s is not None and joint["type"] != "prismatic"
                else (joint["velocity"] if joint["velocity"] is not None else default_rate)
            )
            max_step = rate / max(1.0, float(fps))
            for frame in range(1, len(arm)):
                arm[frame, joint_idx] = arm[frame - 1, joint_idx] + np.clip(arm[frame, joint_idx] - arm[frame - 1, joint_idx], -max_step, max_step)
        data[:, :self.num_joints] = np.vstack([self.joint_values_to_state(row) for row in arm])
        return data.astype(np.asarray(joint_trajectory).dtype, copy=False)


# Subclass specializations backed by URDF descriptions
class SO101OmniKinKinematics(SerialURDFKinematics):
    """SO-ARM101-OMNI-KIN kinematics from the selected URDF chain."""
    def __init__(self, q3_safe_max_deg=0.0, **kwargs):
        super().__init__(
            get_robot_urdf("so_arm101_omni_kin"), base_link="base_link", tcp_link="gripper_frame_link",
            model_name="SO-ARM101-OMNI-KIN", q3_safe_max_deg=q3_safe_max_deg,
            wrist_roll_safe_max_deg=35.0, max_joint_rate_rad_s=np.radians(120.0),
            tool_roll_tracking=True, **kwargs,
        )
        self.robot_name = self.model_name = "SO-ARM101-OMNI-KIN"


class SO101Kinematics(SerialURDFKinematics):
    """SO-101 kinematics from the selected URDF chain."""
    def __init__(self, q3_safe_max_deg=0.0, **kwargs):
        super().__init__(
            get_robot_urdf("so101"), base_link="base_link", tcp_link="gripper_base",
            model_name="SO-101", q3_safe_max_deg=q3_safe_max_deg,
            wrist_roll_safe_max_deg=35.0, max_joint_rate_rad_s=np.radians(120.0), **kwargs,
        )
        self.robot_name = self.model_name = "SO-101"


class SO100Kinematics(SerialURDFKinematics):
    """SO-100 kinematics from the selected URDF chain."""
    def __init__(self, q3_safe_max_deg=0.0, **kwargs):
        super().__init__(
            get_robot_urdf("so100"), base_link="base_link", tcp_link="gripper_base",
            model_name="SO-100", q3_safe_max_deg=q3_safe_max_deg,
            wrist_roll_safe_max_deg=35.0, max_joint_rate_rad_s=np.radians(120.0), **kwargs,
        )
        self.robot_name = self.model_name = "SO-100"


ROBOT_PRESETS = {
    "so_arm101_omni_kin": {
        "name": "SO-ARM101-OMNI-KIN (Default)",
        "description": "SO-ARM101-OMNI-KIN five-joint arm described by its URDF.",
        "class": SO101OmniKinKinematics,
        "reach_meters": 0.385,
        "payload_kg": 0.50,
    },
    "so101": {
        "name": "SO-101 (Refined)",
        "description": "SO-101 five-joint arm described by its URDF.",
        "class": SO101Kinematics,
        "reach_meters": 0.395,
        "payload_kg": 0.50,
    },
    "so100": {
        "name": "SO-100 (Classic)",
        "description": "SO-100 five-joint arm described by its URDF.",
        "class": SO100Kinematics,
        "reach_meters": 0.380,
        "payload_kg": 0.50,
    },
}


def get_robot_solver(robot_type="so_arm101_omni_kin", q3_safe_max_deg=0.0, custom_urdf=None, **kwargs):
    """Build a preset or uploaded solver directly from its URDF chain."""
    if custom_urdf:
        base_link = kwargs.pop("custom_urdf_base_link", kwargs.pop("base_link", None))
        tcp_link = kwargs.pop("custom_urdf_tcp_link", kwargs.pop("tcp_link", None))
        return SerialURDFKinematics(custom_urdf, base_link=base_link, tcp_link=tcp_link, **kwargs)
    r_type = normalize_robot_type(robot_type)
    if r_type == "custom_urdf":
        raise ValueError("Custom URDF kinematics require the original URDF XML and selected base/TCP links.")
    if r_type in ROBOT_PRESETS:
        return ROBOT_PRESETS[r_type]["class"](q3_safe_max_deg=q3_safe_max_deg, **kwargs)
    return SO101OmniKinKinematics(q3_safe_max_deg=q3_safe_max_deg, **kwargs)


def get_robot_specs(robot_type="so_arm101_omni_kin", q3_safe_max_deg=0.0):
    """Return URDF chain metadata for the specified robot preset."""
    r_type = normalize_robot_type(robot_type)
    preset = ROBOT_PRESETS.get(r_type, ROBOT_PRESETS["so_arm101_omni_kin"])
    urdf_str = get_robot_urdf(r_type)
    solver = get_robot_solver(r_type, q3_safe_max_deg=q3_safe_max_deg)

    return {
        "robot_type": r_type,
        "name": preset["name"],
        "description": preset["description"],
        "reach_meters": preset["reach_meters"],
        "payload_kg": preset["payload_kg"],
        "urdf": urdf_str,
        "base_link": solver.base_link,
        "tcp_link": solver.tcp_link,
        "joint_names": solver.joint_names,
        "joint_types": solver.joint_types,
        "joint_units": solver.joint_units,
        "chain": solver.chain_description,
        "wrist_pitch_idx": solver.wrist_pitch_idx,
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
          - 'joint_states': (N, movable joints + gripper), with preset/custom units
          - 'actions': same ordered vector as joint_states
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
        q_home = ik_home["joints"]
        if hasattr(self.solver, "state_to_joint_values"):
            ik_start = self.solver.solve_feasible_ik(
                p_start_robot,
                gripper_state=float(start_gripper),
                prev_joints=q_home[:self.solver.num_joints]
            )
        else:
            ik_start = self.solver.solve_feasible_ik(p_start_robot, gripper_state=float(start_gripper))

        q_start = ik_start["joints"]

        # A quintic blend reaches 1.875 times its average joint speed at its
        # midpoint. Extend custom-chain approach time as needed to respect the
        # URDF velocity limits (or the same conservative defaults as smoothing).
        if hasattr(self.solver, "chain_joints"):
            home_internal = self.solver.state_to_joint_values(q_home[:self.solver.num_joints])
            start_internal = self.solver.state_to_joint_values(q_start[:self.solver.num_joints])
            required_duration = 0.0
            for index, joint in enumerate(self.solver.active_joints):
                default_rate = (2.0 * np.pi / 3.0) if joint["type"] != "prismatic" else 0.15
                rate = joint["velocity"] if joint["velocity"] is not None else default_rate
                required_duration = max(
                    required_duration,
                    1.875 * abs(start_internal[index] - home_internal[index]) / rate,
                )
            duration_s = max(float(duration_s), required_duration)

        num_frames = max(10, int(round(duration_s * fps)))
        tau_vals = np.linspace(0.0, 1.0, num_frames)

        robot_ee = np.zeros((num_frames, 6), dtype=np.float64)
        grippers = np.zeros(num_frames, dtype=np.float64)
        joint_states = np.zeros((num_frames, len(q_home)), dtype=np.float64)
        link_positions = []

        for i, tau in enumerate(tau_vals):
            s = self.quintic_blend(tau)
            # Joint-space C^2 quintic minimum-jerk blend (MoveJ)
            q_i = q_home + s * (q_start - q_home)
            if hasattr(self.solver, "state_to_joint_values"):
                q_i[:self.solver.num_joints] = self.solver.clip_joint_limits(q_i[:self.solver.num_joints])
                fk_values = self.solver.state_to_joint_values(q_i[:self.solver.num_joints])
            else:
                q_i = self.solver.clip_joint_limits(q_i)
                fk_values = np.radians(q_i[:self.solver.num_joints])
            joint_states[i] = q_i

            # Forward kinematics for exact Cartesian EE pose
            fk = self.solver.forward_kinematics(fk_values)
            robot_ee[i] = fk
            if hasattr(self.solver, "forward_kinematics_chain"):
                link_positions.append([point.tolist() for point in self.solver.forward_kinematics_chain(fk_values)])
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
            "link_positions": link_positions,
            "actions": actions.tolist(),
            "timestamps": timestamps.tolist(),
            "num_frames": num_frames,
            "duration_s": duration_s,
            "is_feasible": is_feasible,
            "max_error_cm": round(float(max_err), 2),
            "home_pose_robot": p_home.tolist(),
            "home_pose_aruco": self.workspace_calibrator.robot_to_aruco(p_home).tolist()
        }
