"""Camera-to-TCP calibration from the two fully-open gripper ArUco tags."""

import cv2
import numpy as np
from scipy.spatial.transform import Rotation

from robot_kinematics import tcp_marker_object_points


MIN_CALIBRATION_FRAMES = 20
MAX_REPROJECTION_RMS_PX = 2.0
MAX_OPEN_GAP_ERROR_M = 0.005
MAX_MARKER_POSE_POSITION_ERROR_M = 0.010
MAX_MARKER_POSE_ANGLE_ERROR_RAD = np.radians(5.0)
MAX_SESSION_POSITION_SPREAD_M = 0.005
MAX_SESSION_ANGLE_SPREAD_RAD = np.radians(3.0)

# CAD-derived jaw marker poses expressed in the TCP frame. The CAD axes shown
# for TCP, ID2, and ID3 are aligned, so the displayed translations can be
# inverted/composed directly. Values are converted from meters to millimeters.
DEFAULT_ARUCO_TCP_GEOMETRY = {
    "2": {"xyz_mm": [-71.522, 56.205, 21.0], "rpy_deg": [0.0, 0.0, 0.0]},
    "3": {"xyz_mm": [-71.522, -56.205, 21.0], "rpy_deg": [0.0, 0.0, 0.0]},
}

def _marker_transform_tcp(marker_pose):
    xyz = np.asarray(marker_pose["xyz_mm"], dtype=np.float64) / 1000.0
    rotation = Rotation.from_euler("xyz", marker_pose["rpy_deg"], degrees=True).as_matrix()
    result = np.eye(4, dtype=np.float64)
    result[:3, :3] = rotation
    result[:3, 3] = xyz
    return result


def _camera_transform_from_pnp(object_points, image_points, camera_matrix, dist_coeffs, flag):
    ok, rvec, tvec = cv2.solvePnP(
        np.asarray(object_points, dtype=np.float64),
        np.asarray(image_points, dtype=np.float64),
        np.asarray(camera_matrix, dtype=np.float64),
        np.asarray(dist_coeffs, dtype=np.float64),
        flags=flag,
    )
    if not ok:
        return None
    rotation, _ = cv2.Rodrigues(rvec)
    transform = np.eye(4, dtype=np.float64)
    transform[:3, :3] = rotation
    transform[:3, 3] = np.asarray(tvec, dtype=np.float64).reshape(3)
    return transform


def _angle_between(first, second):
    relative = first[:3, :3] @ second[:3, :3].T
    return float(Rotation.from_matrix(relative).magnitude())


def _estimate_observation(observation, marker_poses_tcp, camera_matrix, dist_coeffs,
                          marker_size_mm):
    corners = observation.get("corners", {})
    corners_2d = []
    per_tag_transforms = []
    tag_centers_camera = []
    half = float(marker_size_mm) / 2000.0
    square_tcp = np.array([
        [-half, half, 0.0], [half, half, 0.0],
        [half, -half, 0.0], [-half, -half, 0.0],
    ], dtype=np.float64)

    for marker_id in (2, 3):
        image_corners = np.asarray(corners.get(str(marker_id), corners.get(marker_id)), dtype=np.float64)
        if image_corners.shape != (4, 2) or not np.isfinite(image_corners).all():
            return None
        side_px = float(np.mean([
            np.linalg.norm(image_corners[1] - image_corners[0]),
            np.linalg.norm(image_corners[2] - image_corners[3]),
        ]))
        if side_px < 50.0:
            return None
        corners_2d.append(image_corners)

        marker_pose = marker_poses_tcp.get(str(marker_id), marker_poses_tcp.get(marker_id))
        if not isinstance(marker_pose, dict):
            return None
        tcp_marker = _marker_transform_tcp(marker_pose)
        camera_marker = _camera_transform_from_pnp(
            square_tcp, image_corners, camera_matrix, dist_coeffs, cv2.SOLVEPNP_IPPE_SQUARE
        )
        if camera_marker is None:
            return None
        tag_centers_camera.append(camera_marker[:3, 3])
        # Geometry stores T_tcp_marker, so its inverse gives ArUco→TCP.
        # Position is the requested vector addition, after rotating the
        # ArUco→TCP offset into camera coordinates.
        marker_tcp = np.linalg.inv(tcp_marker)
        camera_tcp = np.eye(4, dtype=np.float64)
        camera_tcp[:3, :3] = camera_marker[:3, :3] @ marker_tcp[:3, :3]
        camera_tcp[:3, 3] = (
            camera_marker[:3, 3]
            + camera_marker[:3, :3] @ marker_tcp[:3, 3]
        )
        per_tag_transforms.append(camera_tcp)

    # The fully-open CAD marker spacing is a physical check that the jaws reached
    # their stop; it must not be inferred from this recording's maximum gap.
    marker_2 = marker_poses_tcp.get("2", marker_poses_tcp.get(2))
    marker_3 = marker_poses_tcp.get("3", marker_poses_tcp.get(3))
    expected_gap = np.linalg.norm(
        np.asarray(marker_2["xyz_mm"], dtype=np.float64)
        - np.asarray(marker_3["xyz_mm"], dtype=np.float64)
    ) / 1000.0
    observed_gap = float(np.linalg.norm(tag_centers_camera[0] - tag_centers_camera[1]))
    if abs(observed_gap - expected_gap) > MAX_OPEN_GAP_ERROR_M:
        return None

    position_agreement = float(np.linalg.norm(
        per_tag_transforms[0][:3, 3] - per_tag_transforms[1][:3, 3]
    ))
    angle_agreement = _angle_between(per_tag_transforms[0], per_tag_transforms[1])
    if position_agreement > MAX_MARKER_POSE_POSITION_ERROR_M or angle_agreement > MAX_MARKER_POSE_ANGLE_ERROR_RAD:
        return None

    tcp_points = tcp_marker_object_points(marker_poses_tcp, marker_size_mm)
    image_points = np.vstack(corners_2d)
    camera_tcp = np.eye(4, dtype=np.float64)
    camera_tcp[:3, :3] = Rotation.from_matrix(
        [transform[:3, :3] for transform in per_tag_transforms]
    ).mean().as_matrix()
    camera_tcp[:3, 3] = np.mean(
        [transform[:3, 3] for transform in per_tag_transforms], axis=0
    )
    if np.any((tcp_points @ camera_tcp[:3, :3].T + camera_tcp[:3, 3])[:, 2] <= 0):
        return None

    projected, _ = cv2.projectPoints(
        tcp_points, cv2.Rodrigues(camera_tcp[:3, :3])[0], camera_tcp[:3, 3],
        camera_matrix, dist_coeffs,
    )
    reprojection_rms = float(np.sqrt(np.mean(np.sum((projected.reshape(-1, 2) - image_points) ** 2, axis=1))))
    if reprojection_rms > MAX_REPROJECTION_RMS_PX:
        return None
    return camera_tcp, reprojection_rms, observed_gap, position_agreement, angle_agreement


def estimate_camera_tcp(observations, marker_poses_tcp, camera_matrix, dist_coeffs,
                        marker_size_mm=22.0):
    """Estimate a robust camera→TCP transform from fully-open paired-tag views.

    Observations have ``{"frame_index": int, "corners": {"2": [[x,y]...],
    "3": [[x,y]...]}}``. Returns transform plus quality data or raises ValueError.
    """
    if not isinstance(marker_poses_tcp, dict):
        raise ValueError("TCP marker geometry must contain marker 2 and marker 3")
    # Validate the required values and corner convention before processing frames.
    tcp_marker_object_points(marker_poses_tcp, marker_size_mm)
    candidates = []
    reprojection_errors = []
    gap_errors = []
    marker_position_errors = []
    marker_angle_errors = []
    for observation in observations:
        estimate = _estimate_observation(
            observation, marker_poses_tcp, camera_matrix, dist_coeffs, marker_size_mm
        )
        if estimate is None:
            continue
        transform, rms, gap, position_error, angle_error = estimate
        candidates.append(transform)
        reprojection_errors.append(rms)
        gap_errors.append(gap)
        marker_position_errors.append(position_error)
        marker_angle_errors.append(angle_error)

    if len(candidates) < MIN_CALIBRATION_FRAMES:
        raise ValueError(
            f"Only {len(candidates)} valid fully-open frames; need {MIN_CALIBRATION_FRAMES} "
            "with both jaw tags at least 50 px wide and consistent with the CAD geometry."
        )

    translations = np.asarray([candidate[:3, 3] for candidate in candidates])
    center = np.median(translations, axis=0)
    rotations = Rotation.from_matrix([candidate[:3, :3] for candidate in candidates])
    mean_rotation = rotations.mean()
    position_spread = np.linalg.norm(translations - center, axis=1)
    angle_spread = (mean_rotation.inv() * rotations).magnitude()
    p95_position = float(np.percentile(position_spread, 95))
    p95_angle = float(np.percentile(angle_spread, 95))
    if p95_position > MAX_SESSION_POSITION_SPREAD_M or p95_angle > MAX_SESSION_ANGLE_SPREAD_RAD:
        raise ValueError(
            f"Camera-to-TCP estimate is unstable (95th percentile {p95_position * 1000:.1f} mm, "
            f"{np.degrees(p95_angle):.1f}°). Keep the phone rigid and retry."
        )

    transform = np.eye(4, dtype=np.float64)
    transform[:3, :3] = mean_rotation.as_matrix()
    transform[:3, 3] = center
    return transform, {
        "valid_frames": len(candidates),
        "reprojection_rms_px": float(np.median(reprojection_errors)),
        "open_gap_mm": float(np.median(gap_errors) * 1000.0),
        "tag_pose_disagreement_mm": float(np.median(marker_position_errors) * 1000.0),
        "tag_angle_disagreement_deg": float(np.degrees(np.median(marker_angle_errors))),
        "position_spread_p95_mm": p95_position * 1000.0,
        "angle_spread_p95_deg": float(np.degrees(p95_angle)),
    }
