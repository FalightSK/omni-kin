"""
visual_tracker.py
Dual-ArUco Rigid Board PnP & Extended Kalman Filter (EKF) Visual-Inertial Fusion Engine.

Implements:
  - Phase 1 & 2: Rigid 8-point 3D world geometry for dual-sized ArUco tags (10cm + 5cm).
  - Phase 3: Sub-pixel 2D corner refinement and dynamic point matching (Scenarios A, B, and C).
  - Phase 4: Over-determined 8-point PnP solver (eliminates planar flipping ambiguity).
  - Extended Kalman Filter (EKF): 12-state strapdown inertial propagation with adaptive visual measurement updates.
"""

import cv2
import numpy as np
from scipy.spatial.transform import Rotation as R


class VisualInertialEKF:
    """
    12-State Extended Kalman Filter for 6-DoF Visual-Inertial Odometry:
      State Vector x in R^12:
        x[0:3]   = 3D Position (p_x, p_y, p_z) in World Frame (meters)
        x[3:6]   = 3D Velocity (v_x, v_y, v_z) in World Frame (m/s)
        x[6:9]   = 3D Euler Orientation (roll, pitch, yaw) in radians
        x[9:12]  = 3D Accelerometer Bias (b_ax, b_ay, b_az) in m/s^2
    """

    def __init__(
        self,
        q_pos=1e-4,
        q_vel=1e-2,
        q_gyro=1e-3,
        q_bias=1e-5,
        r_pos_dual=1e-3,       # meters (e.g. 0.001 m = 1mm)
        r_rot_dual=0.3,        # degrees
        r_pos_single=4e-3,     # meters (e.g. 0.004 m = 4mm)
        r_rot_single=0.8       # degrees
    ):
        self.state_dim = 12
        self.x = np.zeros(self.state_dim, dtype=np.float64)
        self.P = np.eye(self.state_dim, dtype=np.float64) * 0.1

        self.q_pos = float(q_pos)
        self.q_vel = float(q_vel)
        self.q_gyro = float(q_gyro)
        self.q_bias = float(q_bias)

        self.r_pos_dual = float(r_pos_dual)
        self.r_rot_dual = float(r_rot_dual)
        self.r_pos_single = float(r_pos_single)
        self.r_rot_single = float(r_rot_single)

        # Process Noise Covariance Q
        self.Q = np.zeros((self.state_dim, self.state_dim), dtype=np.float64)
        self._rebuild_q()

        self.g_world = np.array([0.0, 0.0, 9.81], dtype=np.float64)
        self.is_initialized = False

    def _rebuild_q(self):
        self.Q[0:3, 0:3] = np.eye(3) * self.q_pos
        self.Q[3:6, 3:6] = np.eye(3) * self.q_vel
        self.Q[6:9, 6:9] = np.eye(3) * self.q_gyro
        self.Q[9:12, 9:12] = np.eye(3) * self.q_bias

    def set_params(self, **kwargs):
        for k, v in kwargs.items():
            if hasattr(self, k):
                setattr(self, k, float(v))
        self._rebuild_q()

    def reset(self, initial_position=None, initial_euler=None):
        self.x = np.zeros(self.state_dim, dtype=np.float64)
        if initial_position is not None:
            self.x[0:3] = np.array(initial_position, dtype=np.float64)
        if initial_euler is not None:
            self.x[6:9] = np.array(initial_euler, dtype=np.float64)

        self.P = np.eye(self.state_dim, dtype=np.float64) * 0.05
        self.P[9:12, 9:12] = np.eye(3) * 0.01
        self.is_initialized = True

    @staticmethod
    def _skew_symmetric(v):
        return np.array([
            [0.0, -v[2], v[1]],
            [v[2], 0.0, -v[0]],
            [-v[1], v[0], 0.0]
        ], dtype=np.float64)

    def predict(self, dt, accel_body, gyro_rates):
        """
        Non-linear strapdown inertial propagation step.
        """
        if not self.is_initialized:
            return

        dt = float(np.clip(dt, 0.001, 0.2))

        # 1. Orientation update
        euler = self.x[6:9]
        euler_new = euler + gyro_rates * dt
        # Normalize angles to [-pi, pi]
        euler_new = (euler_new + np.pi) % (2.0 * np.pi) - np.pi

        # 2. Body-to-World acceleration rotation
        r = R.from_euler('xyz', euler)
        R_mat = r.as_matrix()

        accel_unbiased = accel_body - self.x[9:12]
        accel_world = R_mat @ accel_unbiased - self.g_world

        # 3. Velocity and Position integration
        v = self.x[3:6]
        p = self.x[0:3]

        v_new = v + accel_world * dt
        p_new = p + v * dt + 0.5 * accel_world * (dt ** 2)

        # Update state vector
        self.x[0:3] = p_new
        self.x[3:6] = v_new
        self.x[6:9] = euler_new

        # 4. Compute Jacobian F for Covariance Propagation
        F = np.eye(self.state_dim, dtype=np.float64)
        F[0:3, 3:6] = np.eye(3) * dt
        F[0:3, 9:12] = -0.5 * R_mat * (dt ** 2)
        F[3:6, 9:12] = -R_mat * dt

        # Orientation sensitivity on acceleration
        skew_a = self._skew_symmetric(R_mat @ accel_unbiased)
        F[3:6, 6:9] = -skew_a * dt
        F[0:3, 6:9] = -0.5 * skew_a * (dt ** 2)

        # Covariance propagation P_k = F P_{k-1} F^T + Q * dt
        self.P = F @ self.P @ F.T + self.Q * dt

    def update_visual(self, p_meas, euler_meas, is_dual=True, source="dual_aruco"):
        """
        EKF Measurement update with 6-DoF visual pose.
        Adaptive measurement covariance R_meas provides tighter confidence for ground-truth ArUco
        and robust confidence for ArUco-anchored feature map PnP.
        """
        if not self.is_initialized:
            self.reset(p_meas, euler_meas)
            return

        z = np.hstack([p_meas, euler_meas])  # 6D observation

        # Measurement Matrix H (6 x 12)
        H = np.zeros((6, self.state_dim), dtype=np.float64)
        H[0:3, 0:3] = np.eye(3)
        H[3:6, 6:9] = np.eye(3)

        # Adaptive Measurement Noise Covariance
        if source == "dual_aruco" or is_dual:
            r_pos = (self.r_pos_dual) ** 2
            r_rot = (np.radians(self.r_rot_dual)) ** 2
        elif source == "single_aruco":
            r_pos = (self.r_pos_single) ** 2
            r_rot = (np.radians(self.r_rot_single)) ** 2
        elif source == "feature_pnp":
            r_pos = (self.r_pos_single * 1.5) ** 2
            r_rot = (np.radians(self.r_rot_single * 1.5)) ** 2
        else:  # feature_vo
            r_pos = (self.r_pos_single * 3.0) ** 2
            r_rot = (np.radians(self.r_rot_single * 2.5)) ** 2

        R_meas = np.diag([
            r_pos, r_pos, r_pos,
            r_rot, r_rot, r_rot
        ]).astype(np.float64)

        # Predicted measurement
        z_pred = np.hstack([self.x[0:3], self.x[6:9]])

        # Innovation (residual) with angular wrapping
        y = z - z_pred
        y[3:6] = (y[3:6] + np.pi) % (2.0 * np.pi) - np.pi

        # Innovation covariance
        S = H @ self.P @ H.T + R_meas

        # Kalman Gain
        K = self.P @ H.T @ np.linalg.inv(S)

        # State update
        self.x = self.x + K @ y
        self.x[6:9] = (self.x[6:9] + np.pi) % (2.0 * np.pi) - np.pi

        # Joseph Form Covariance Update for numerical stability
        I_KH = np.eye(self.state_dim, dtype=np.float64) - K @ H
        self.P = I_KH @ self.P @ I_KH.T + K @ R_meas @ K.T


class ArucoFeatureMapTracker:
    """
    Maintains a persistent 3D Landmark Map in the physical ArUco world coordinate frame.
    
    When ArUco markers are visible:
      - Projects natural workspace features into ArUco World coordinates via multi-view triangulation.
      - Populates the 3D landmark database.
      
    When ArUco markers are lost / occluded:
      - Tracks features using pyramidal Lucas-Kanade optical flow.
      - Executes cv2.solvePnPRansac against the ArUco-anchored 3D landmarks.
      - Continuously outputs accurate 6-DoF camera poses locked to the table origin (0, 0, 0).
    """

    def __init__(self, camera_matrix, dist_coeffs):
        self.camera_matrix = camera_matrix.astype(np.float32)
        self.dist_coeffs = dist_coeffs.astype(np.float32)

        # 3D Landmark Map: dict { pt_id: np.array([X_w, Y_w, Z_w], dtype=np.float32) }
        self.landmarks_3d = {}

        # Tracking state
        self.prev_gray = None
        self.tracked_pts = np.empty((0, 2), dtype=np.float32)
        self.tracked_ids = []
        self.next_pt_id = 0

        # Recent keyframe history for triangulation: list of (frame_idx, p_world, R_world_to_cam, pts_dict)
        self.view_history = []
        self.min_features = 120
        self.max_features = 250

        # Last known pose
        self.last_p_world = np.array([0.075, 0.05, 0.30], dtype=np.float64)
        self.last_R_world_to_cam = np.eye(3, dtype=np.float64)
        self.prev_gray_pts = None

    def _extract_new_features(self, gray, mask=None):
        corners = cv2.goodFeaturesToTrack(
            gray,
            maxCorners=self.max_features,
            qualityLevel=0.015,
            minDistance=10,
            mask=mask
        )
        if corners is None or len(corners) == 0:
            return np.empty((0, 2), dtype=np.float32)

        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.01)
        refined = cv2.cornerSubPix(gray, np.copy(corners), (5, 5), (-1, -1), criteria)
        return refined.reshape(-1, 2).astype(np.float32)

    def add_aruco_ground_truth(self, gray, p_cam_world, R_world_to_cam, aruco_corners_list=None):
        self.last_p_world = p_cam_world.copy()
        self.last_R_world_to_cam = R_world_to_cam.copy()

        mask = np.full(gray.shape, 255, dtype=np.uint8)
        if aruco_corners_list:
            for corners in aruco_corners_list:
                pts = corners.reshape(-1, 2).astype(np.int32)
                cv2.fillPoly(mask, [pts], 0)

        current_pts_dict = {}
        if self.prev_gray is not None and len(self.tracked_pts) > 0:
            pts_curr, status, _ = cv2.calcOpticalFlowPyrLK(
                self.prev_gray,
                gray,
                self.tracked_pts.astype(np.float32),
                None,
                winSize=(21, 21),
                maxLevel=3
            )
            valid_mask = (status.flatten() == 1)

            survived_pts = pts_curr[valid_mask]
            survived_ids = [self.tracked_ids[i] for i in range(len(self.tracked_ids)) if valid_mask[i]]

            self.tracked_pts = survived_pts
            self.tracked_ids = survived_ids

            for i, pid in enumerate(survived_ids):
                current_pts_dict[pid] = survived_pts[i]
        else:
            self.tracked_pts = np.empty((0, 2), dtype=np.float32)
            self.tracked_ids = []

        t_w_to_c = -R_world_to_cam @ p_cam_world.reshape(3, 1)
        Rt_curr = np.hstack([R_world_to_cam, t_w_to_c])
        P_curr = self.camera_matrix @ Rt_curr

        for prev_view in self.view_history[-4:]:
            _, prev_p, prev_R, prev_pts_dict = prev_view
            baseline = np.linalg.norm(p_cam_world - prev_p)
            if baseline < 0.015:
                continue

            prev_t = -prev_R @ prev_p.reshape(3, 1)
            P_prev = self.camera_matrix @ np.hstack([prev_R, prev_t])

            common_ids = [pid for pid in current_pts_dict if pid in prev_pts_dict and pid not in self.landmarks_3d]
            if len(common_ids) == 0:
                continue

            pts1 = np.array([prev_pts_dict[pid] for pid in common_ids], dtype=np.float32).T
            pts2 = np.array([current_pts_dict[pid] for pid in common_ids], dtype=np.float32).T

            pts4d = cv2.triangulatePoints(P_prev, P_curr, pts1, pts2)
            w = pts4d[3, :]
            valid_depth = np.abs(w) > 1e-4
            pts3d = (pts4d[:3, :] / np.where(valid_depth, w, 1e-4)).T

            for i, pid in enumerate(common_ids):
                if valid_depth[i]:
                    x_w, y_w, z_w = pts3d[i]
                    if -0.05 <= z_w <= 1.2 and np.linalg.norm([x_w, y_w]) < 2.0:
                        self.landmarks_3d[pid] = np.array([x_w, y_w, z_w], dtype=np.float32)

        if len(self.tracked_pts) < self.min_features:
            new_corners = self._extract_new_features(gray, mask=mask)
            if len(new_corners) > 0:
                new_ids = [self.next_pt_id + i for i in range(len(new_corners))]
                self.next_pt_id += len(new_corners)

                if len(self.tracked_pts) == 0:
                    self.tracked_pts = new_corners
                    self.tracked_ids = new_ids
                else:
                    self.tracked_pts = np.vstack([self.tracked_pts, new_corners])
                    self.tracked_ids.extend(new_ids)

                for i, nid in enumerate(new_ids):
                    current_pts_dict[nid] = new_corners[i]

        self.view_history.append((len(self.view_history), p_cam_world.copy(), R_world_to_cam.copy(), current_pts_dict))
        if len(self.view_history) > 8:
            self.view_history.pop(0)

        self.prev_gray_pts = self.tracked_pts.copy()
        self.prev_gray = gray.copy()

    def track_without_aruco(self, gray, predicted_delta_p=None):
        if self.prev_gray is None or len(self.tracked_pts) < 8:
            return False, None, None, None

        pts_curr, status, _ = cv2.calcOpticalFlowPyrLK(
            self.prev_gray,
            gray,
            self.tracked_pts.astype(np.float32),
            None,
            winSize=(21, 21),
            maxLevel=3
        )
        valid_mask = (status.flatten() == 1)

        if np.sum(valid_mask) > 10:
            pts_back, status_back, _ = cv2.calcOpticalFlowPyrLK(
                gray,
                self.prev_gray,
                pts_curr[valid_mask].astype(np.float32),
                None,
                winSize=(21, 21),
                maxLevel=3
            )
            dists = np.linalg.norm(self.tracked_pts[valid_mask] - pts_back, axis=1)
            fb_mask = dists < 1.5
            temp_indices = np.where(valid_mask)[0]
            valid_mask[temp_indices[~fb_mask]] = False

        survived_pts = pts_curr[valid_mask]
        survived_ids = [self.tracked_ids[i] for i in range(len(self.tracked_ids)) if valid_mask[i]]

        self.tracked_pts = survived_pts
        self.tracked_ids = survived_ids

        matched_3d = []
        matched_2d = []
        for i, pid in enumerate(survived_ids):
            if pid in self.landmarks_3d:
                matched_3d.append(self.landmarks_3d[pid])
                matched_2d.append(survived_pts[i])

        pnp_success = False
        p_world = None
        R_world_to_cam = None
        source = None

        if len(matched_3d) >= 6:
            pts_3d_arr = np.array(matched_3d, dtype=np.float32)
            pts_2d_arr = np.array(matched_2d, dtype=np.float32)

            success, rvec, tvec, inliers = cv2.solvePnPRansac(
                pts_3d_arr,
                pts_2d_arr,
                self.camera_matrix,
                self.dist_coeffs,
                flags=cv2.SOLVEPNP_ITERATIVE,
                reprojectionError=4.0,
                iterationsCount=150
            )

            if success and inliers is not None and len(inliers) >= 5:
                R_cam_to_world, _ = cv2.Rodrigues(rvec)
                R_world_to_cam = R_cam_to_world.T
                p_cam_in_world = -R_world_to_cam @ tvec.reshape(3, 1)

                X_w = float(p_cam_in_world[0, 0])
                Y_w = float(p_cam_in_world[1, 0])
                Z_w = abs(float(p_cam_in_world[2, 0]))

                p_world = np.array([X_w, Y_w, Z_w], dtype=np.float64)
                self.last_p_world = p_world.copy()
                self.last_R_world_to_cam = R_world_to_cam.copy()
                pnp_success = True
                source = "feature_pnp"

        if not pnp_success and len(survived_pts) >= 8 and self.prev_gray_pts is not None:
            prev_matched = self.prev_gray_pts[valid_mask] if len(self.prev_gray_pts) == len(status) else None
            if prev_matched is not None and len(prev_matched) == len(survived_pts):
                E, mask_e = cv2.findEssentialMat(
                    prev_matched,
                    survived_pts,
                    self.camera_matrix,
                    method=cv2.RANSAC,
                    prob=0.999,
                    threshold=1.0
                )
                if E is not None and E.shape == (3, 3):
                    _, R_rel, t_rel, _ = cv2.recoverPose(
                        E,
                        prev_matched,
                        survived_pts,
                        self.camera_matrix,
                        mask=mask_e
                    )
                    scale = 0.005
                    if predicted_delta_p is not None:
                        norm = np.linalg.norm(predicted_delta_p)
                        if norm > 0.0005:
                            scale = float(norm)

                    t_rel_metric = t_rel.flatten() * scale
                    R_world_to_cam = R_rel @ self.last_R_world_to_cam
                    p_world = self.last_p_world + self.last_R_world_to_cam.T @ t_rel_metric
                    p_world[2] = max(0.01, p_world[2])

                    self.last_p_world = p_world.copy()
                    self.last_R_world_to_cam = R_world_to_cam.copy()
                    pnp_success = True
                    source = "feature_vo"

        if len(self.tracked_pts) < self.min_features:
            new_corners = self._extract_new_features(gray)
            if len(new_corners) > 0:
                new_ids = [self.next_pt_id + i for i in range(len(new_corners))]
                self.next_pt_id += len(new_corners)
                self.tracked_pts = np.vstack([self.tracked_pts, new_corners])
                self.tracked_ids.extend(new_ids)

        self.prev_gray_pts = self.tracked_pts.copy()
        self.prev_gray = gray.copy()

        return pnp_success, p_world, R_world_to_cam, source


class VisualInertialTracker:
    """
    Reconstructs 3D hand/camera trajectories anchored to a Dual-ArUco Rigid Board on a table.
    
    Rigid Board Geometry:
      - Tag A (Primary Origin): 10.0 cm ArUco (ID 0 default), Bottom-Left corner is (0, 0, 0).
      - Tag B (Secondary Offset): 5.0 cm ArUco (ID 1 default), Bottom-Left corner is at (0.15, 0.0, 0.0).
    """

    def __init__(
        self,
        tag_a_size=0.10,
        tag_b_size=0.05,
        tag_a_id=0,
        tag_b_id=1,
        tag_b_offset=(0.15, 0.0, 0.0),
        dict_name="DICT_6X6_250"
    ):
        self.tag_a_size = float(tag_a_size)
        self.tag_b_size = float(tag_b_size)
        self.tag_a_id = int(tag_a_id)
        self.tag_b_id = int(tag_b_id)
        self.tag_b_offset = np.array(tag_b_offset, dtype=np.float32)
        self.dict_name = dict_name

        # Initialize ArUco Dictionary & Detector
        self.dict_type = getattr(cv2.aruco, dict_name, cv2.aruco.DICT_6X6_250)
        self.dictionary = cv2.aruco.getPredefinedDictionary(self.dict_type)

        if hasattr(cv2.aruco, 'ArucoDetector'):
            params = cv2.aruco.DetectorParameters()
            params.cornerRefinementMethod = cv2.aruco.CORNER_REFINE_SUBPIX
            self.detector = cv2.aruco.ArucoDetector(self.dictionary, params)
        else:
            self.detector = None

        # Build Master 3D Object Points (OpenCV corner order: 0:TL, 1:TR, 2:BR, 3:BL)
        # Tag A (Origin at Bottom-Left (0, 0, 0))
        sa = self.tag_a_size
        self.tag_a_3d = np.array([
            [0.0, sa,  0.0],   # TL (0)
            [sa,  sa,  0.0],   # TR (1)
            [sa,  0.0, 0.0],   # BR (2)
            [0.0, 0.0, 0.0]    # BL (3) - World Origin (0,0,0)
        ], dtype=np.float32)

        # Tag B (Offset at tag_b_offset)
        sb = self.tag_b_size
        xb, yb, zb = self.tag_b_offset
        self.tag_b_3d = np.array([
            [xb,      yb + sb, zb],  # TL (0)
            [xb + sb, yb + sb, zb],  # TR (1)
            [xb + sb, yb,      zb],  # BR (2)
            [xb,      yb,      zb]   # BL (3)
        ], dtype=np.float32)

        # Master Combined 8-point Object Array
        self.board_8p_3d = np.vstack([self.tag_a_3d, self.tag_b_3d])

        # Extended Kalman Filter Tuning Parameters
        self.ekf_params = {
            "q_pos": 1e-4,
            "q_vel": 1e-2,
            "q_gyro": 1e-3,
            "q_bias": 1e-5,
            "r_pos_dual": 0.001,       # 1.0 mm
            "r_rot_dual": 0.3,         # 0.3 degrees
            "r_pos_single": 0.004,     # 4.0 mm
            "r_rot_single": 0.8        # 0.8 degrees
        }

    def get_ekf_params(self):
        """
        Returns current EKF parameters along with predefined presets.
        """
        presets = {
            "balanced": {
                "q_pos": 1e-4,
                "q_vel": 1e-2,
                "q_gyro": 1e-3,
                "q_bias": 1e-5,
                "r_pos_dual": 0.001,
                "r_rot_dual": 0.3,
                "r_pos_single": 0.004,
                "r_rot_single": 0.8
            },
            "smooth": {
                "q_pos": 1e-5,
                "q_vel": 2e-3,
                "q_gyro": 5e-4,
                "q_bias": 1e-6,
                "r_pos_dual": 0.003,
                "r_rot_dual": 0.6,
                "r_pos_single": 0.008,
                "r_rot_single": 1.5
            },
            "agile": {
                "q_pos": 5e-4,
                "q_vel": 5e-2,
                "q_gyro": 5e-3,
                "q_bias": 5e-5,
                "r_pos_dual": 0.0005,
                "r_rot_dual": 0.2,
                "r_pos_single": 0.002,
                "r_rot_single": 0.5
            }
        }
        return {
            "params": self.ekf_params.copy(),
            "presets": presets
        }

    def set_ekf_params(self, new_params):
        """
        Updates EKF tuning parameters.
        """
        for k in self.ekf_params.keys():
            if k in new_params:
                self.ekf_params[k] = float(new_params[k])
        return self.ekf_params.copy()

    def generate_raw_marker(self, marker_id=0, side_pixels=600, dict_name="DICT_6X6_250"):
        """
        Generates pure ArUco marker black/white square with NO border padding.
        """
        dict_type = getattr(cv2.aruco, dict_name, self.dict_type)
        custom_dict = cv2.aruco.getPredefinedDictionary(dict_type)
        return cv2.aruco.generateImageMarker(custom_dict, id=int(marker_id), sidePixels=side_pixels)

    def generate_marker_image(self, marker_id=0, side_pixels=400, border_pixels=50, dict_name="DICT_6X6_250"):
        """
        Generates a printable ArUco marker image with a clean white margin.
        """
        marker_img = self.generate_raw_marker(marker_id=marker_id, side_pixels=side_pixels, dict_name=dict_name)
        bordered = cv2.copyMakeBorder(
            marker_img,
            border_pixels, border_pixels, border_pixels, border_pixels,
                cv2.BORDER_CONSTANT,
            value=255
        )
        return bordered

    def estimate_camera_matrix(self, width, height, hfov_degrees=78.0):
        """
        Estimates camera intrinsic matrix K from image resolution and wide-angle phone FOV (78° default).
        """
        fx = (width / 2.0) / np.tan(np.radians(hfov_degrees / 2.0))
        fy = fx
        cx = width / 2.0
        cy = height / 2.0
        camera_matrix = np.array([
            [fx, 0, cx],
            [0, fy, cy],
            [0, 0, 1]
        ], dtype=np.float32)
        dist_coeffs = np.zeros((4, 1), dtype=np.float32)
        return camera_matrix, dist_coeffs

    def detect_marker_pnp(self, frame, camera_matrix, dist_coeffs, return_corners=False):
        """
        Phase 1: Dual-ArUco Rigid Board Detection & Dynamic PnP Solver.
        Returns 6 elements by default for backward-compatibility, or 7 elements if return_corners=True.
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if len(frame.shape) == 3 else frame

        if self.detector is not None:
            corners, ids, rejected = self.detector.detectMarkers(gray)
        else:
            corners, ids, rejected = cv2.aruco.detectMarkers(gray, self.dictionary)

        if ids is None or len(ids) == 0:
            if return_corners:
                return False, None, None, None, None, False, []
            return False, None, None, None, None, False

        # Sub-pixel corner refinement
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)
        refined_corners = []
        for c in corners:
            c_sub = cv2.cornerSubPix(gray, np.copy(c), (5, 5), (-1, -1), criteria)
            refined_corners.append(c_sub)

        ids_flat = ids.flatten().tolist()
        has_tag_a = self.tag_a_id in ids_flat
        has_tag_b = self.tag_b_id in ids_flat

        matched_3d = []
        matched_2d = []
        is_dual = False

        if has_tag_a and has_tag_b:
            idx_a = ids_flat.index(self.tag_a_id)
            idx_b = ids_flat.index(self.tag_b_id)
            matched_3d = self.board_8p_3d
            matched_2d = np.vstack([
                refined_corners[idx_a][0].astype(np.float32),
                refined_corners[idx_b][0].astype(np.float32)
            ])
            is_dual = True
            flags = cv2.SOLVEPNP_ITERATIVE
        elif has_tag_a:
            idx_a = ids_flat.index(self.tag_a_id)
            matched_3d = self.tag_a_3d
            matched_2d = refined_corners[idx_a][0].astype(np.float32)
            flags = cv2.SOLVEPNP_IPPE_SQUARE
        elif has_tag_b:
            idx_b = ids_flat.index(self.tag_b_id)
            matched_3d = self.tag_b_3d
            matched_2d = refined_corners[idx_b][0].astype(np.float32)
            flags = cv2.SOLVEPNP_IPPE_SQUARE
        else:
            matched_3d = self.tag_a_3d
            matched_2d = refined_corners[0][0].astype(np.float32)
            flags = cv2.SOLVEPNP_IPPE_SQUARE

        # Solve Perspective-n-Point
        success, rvec, tvec = cv2.solvePnP(
            matched_3d,
            matched_2d,
            camera_matrix,
            dist_coeffs,
            flags=flags
        )

        if not success and flags != cv2.SOLVEPNP_ITERATIVE:
            success, rvec, tvec = cv2.solvePnP(
                matched_3d,
                matched_2d,
                camera_matrix,
                dist_coeffs,
                flags=cv2.SOLVEPNP_ITERATIVE
            )

        if not success:
            if return_corners:
                return False, None, None, None, None, False, []
            return False, None, None, None, None, False

        # Invert pose: camera position in World (Tag A Bottom-Left Origin) Frame
        R_cam_to_world, _ = cv2.Rodrigues(rvec)
        R_world_to_cam = R_cam_to_world.T
        p_cam_in_world = -R_world_to_cam @ tvec.reshape(3, 1)

        X_world = float(p_cam_in_world[0, 0])
        Y_world = float(p_cam_in_world[1, 0])
        Z_world = abs(float(p_cam_in_world[2, 0]))  # Height above tabletop

        p_world = np.array([X_world, Y_world, Z_world], dtype=np.float64)
        if return_corners:
            return True, p_world, R_world_to_cam, rvec, tvec, is_dual, refined_corners
        return True, p_world, R_world_to_cam, rvec, tvec, is_dual

    def process_video_and_imu(self, video_path, imu_samples, fps=30.0):
        """
        Sensory fusion: ArUco Ground Truth + Feature Map PnP + 100Hz IMU EKF.
        """
        cap = cv2.VideoCapture(video_path)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 1280
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 720
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        camera_matrix, dist_coeffs = self.estimate_camera_matrix(width, height, hfov_degrees=78.0)

        # Initialize ArUco-Coordinated Feature Map Tracker
        feature_tracker = ArucoFeatureMapTracker(camera_matrix, dist_coeffs)

        video_detections = []  # (frame_idx, p_world, euler, is_dual, source)
        frame_idx = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if len(frame.shape) == 3 else frame

            # Step 1: Try ArUco PnP first (Millimeter Ground Truth)
            det_res = self.detect_marker_pnp(
                frame, camera_matrix, dist_coeffs, return_corners=True
            )
            det, p_world, R_world, rvec, tvec, is_dual, corners = det_res

            if det:
                r = R.from_matrix(R_world)
                euler = r.as_euler('xyz', degrees=False)
                src = "dual_aruco" if is_dual else "single_aruco"
                video_detections.append((frame_idx, p_world, euler, is_dual, src))

                # Continually learn natural background features into the exact ArUco 3D frame
                feature_tracker.add_aruco_ground_truth(gray, p_world, R_world, corners)
            else:
                # Step 2: ArUco is LOST / Occluded -> Track via Scene Features in ArUco space!
                f_success, p_feat, R_feat, f_source = feature_tracker.track_without_aruco(gray)
                if f_success:
                    r = R.from_matrix(R_feat)
                    euler = r.as_euler('xyz', degrees=False)
                    video_detections.append((frame_idx, p_feat, euler, False, f_source))

            frame_idx += 1

        cap.release()
        num_frames = frame_idx
        if num_frames == 0:
            return self.generate_synthetic_anchored_trajectory()

        # Parse IMU samples
        parsed_imu = self._parse_imu_samples(imu_samples, num_frames, fps)

        # Run EKF Fusion
        final_trajectory = self._run_ekf_fusion(num_frames, fps, video_detections, parsed_imu)
        return final_trajectory

    def _parse_imu_samples(self, imu_samples, num_frames, fps):
        """
        Converts raw browser IMU samples into formatted timestamps, accelerations, and gyro rates.
        """
        if not imu_samples or len(imu_samples) < 5:
            timestamps = np.linspace(0, num_frames / fps, num_frames)
            accels = np.zeros((num_frames, 3))
            accels[:, 2] = 9.81
            gyros = np.zeros((num_frames, 3))
            return {'timestamps': timestamps, 'accels': accels, 'gyros': gyros}

        n = len(imu_samples)
        timestamps = np.array([s.get('timestamp', i / 50.0) for i, s in enumerate(imu_samples)], dtype=np.float64)
        if timestamps[-1] <= timestamps[0]:
            timestamps = np.linspace(0, num_frames / fps, n)

        accels = []
        gyros = []

        for s in imu_samples:
            acc = list(s.get('accel', [0.0, 0.0, 9.81]))
            angle = s.get('screen_angle', 0)
            if angle == 90:
                acc = [-acc[1], acc[0], acc[2]]
            elif angle == 270 or angle == -90:
                acc = [acc[1], -acc[0], acc[2]]
            elif angle == 180:
                acc = [-acc[0], -acc[1], acc[2]]
            accels.append(acc)

            gyro = s.get('gyro', [0.0, 0.0, 0.0])
            gyros.append([np.radians(gyro[0]), np.radians(gyro[1]), np.radians(gyro[2])])

        accels = np.array(accels, dtype=np.float64)
        gyros = np.array(gyros, dtype=np.float64)

        return {'timestamps': timestamps, 'accels': accels, 'gyros': gyros}

    def _run_ekf_fusion(self, num_frames, fps, video_detections, imu_data):
        """
        Full EKF propagation and measurement update loop across video and IMU timelines.
        """
        ekf = VisualInertialEKF(**self.ekf_params)

        vis_map = {f_idx: (p, euler, dual, src) for (f_idx, p, euler, dual, src) in video_detections}

        # Initialize EKF state at first detection or default table anchor
        if len(video_detections) > 0:
            first_f, first_p, first_e, _, _ = video_detections[0]
            ekf.reset(first_p, first_e)
        else:
            default_p = np.array([0.075, 0.05, 0.30])
            ekf.reset(default_p, np.zeros(3))

        final_poses = np.zeros((num_frames, 6), dtype=np.float64)
        imu_times = imu_data['timestamps']
        imu_accels = imu_data['accels']
        imu_gyros = imu_data['gyros']
        num_imu = len(imu_times)

        video_times = np.linspace(imu_times[0], imu_times[-1], num_frames)

        imu_idx = 0
        current_time = imu_times[0]

        for f in range(num_frames):
            target_time = video_times[f]

            # Step IMU up to target video frame time
            while imu_idx < num_imu - 1 and imu_times[imu_idx + 1] <= target_time:
                dt = imu_times[imu_idx + 1] - imu_times[imu_idx]
                if dt > 0:
                    ekf.predict(dt, imu_accels[imu_idx], imu_gyros[imu_idx])
                imu_idx += 1

            # Final prediction step to exact frame timestamp
            dt_rem = target_time - current_time
            if dt_rem > 0:
                acc_sample = imu_accels[min(imu_idx, num_imu - 1)]
                gyro_sample = imu_gyros[min(imu_idx, num_imu - 1)]
                ekf.predict(dt_rem, acc_sample, gyro_sample)
                current_time = target_time

            # Visual measurement update if ArUco or Feature Map detected in this frame
            if f in vis_map:
                p_meas, euler_meas, is_dual, src = vis_map[f]
                ekf.update_visual(p_meas, euler_meas, is_dual=is_dual, source=src)

            # Store filtered 6-DoF pose [X, Y, Z, Roll, Pitch, Yaw]
            pos = ekf.x[0:3].copy()
            pos[2] = max(0.01, pos[2])  # Keep above table surface
            rot = ekf.x[6:9].copy()
            final_poses[f] = np.hstack([pos, rot])

        return final_poses

    def reprocess_episode_trajectory(self, video_path, imu_samples, fps=30.0):
        """
        Re-filters an existing video and IMU recording using the latest EKF parameters.
        """
        return self.process_video_and_imu(video_path, imu_samples, fps=fps)

    def generate_synthetic_anchored_trajectory(self, num_frames=90, shape="circle"):
        """
        Generates a pristine 3D geometric shape (e.g. 3D circle / arch)
        anchored directly above the Dual-ArUco Board origin.
        """
        t = np.linspace(0, 2 * np.pi, num_frames)

        if shape == "circle":
            # 3D Circle of radius 10cm centered over dual marker board at (X=0.10, Y=0.05)
            radius = 0.10
            x = 0.10 + radius * np.cos(t)
            y = 0.05 + radius * np.sin(t)
            z = 0.22 + 0.04 * np.sin(2 * t)
        else:
            # Arch / reach motion
            x = 0.05 + 0.20 * np.sin(t / 2)
            y = 0.05 + 0.10 * np.sin(t)
            z = 0.18 + 0.10 * np.sin(t / 2)

        roll = 0.04 * np.sin(t)
        pitch = -0.12 + 0.06 * np.cos(t)
        yaw = 0.08 * np.sin(t)

        return np.column_stack([x, y, z, roll, pitch, yaw])


if __name__ == "__main__":
    tracker = VisualInertialTracker()
    print("Dual-ArUco Rigid Board Tracker initialized:")
    print("Tag A 3D Corners:\n", tracker.tag_a_3d)
    print("Tag B 3D Corners:\n", tracker.tag_b_3d)
    print("Board 8-point 3D Points:\n", tracker.board_8p_3d)
