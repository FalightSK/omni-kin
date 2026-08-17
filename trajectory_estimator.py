"""
trajectory_estimator.py
Sensor fusion & 6-DoF Phone Trajectory Estimator (Camera + IMU)
"""

import numpy as np
from scipy.spatial.transform import Rotation as R
from scipy.signal import butter, filtfilt

class TrajectoryEstimator:
    """
    Estimates 6-DoF phone motion trajectory (x, y, z, roll, pitch, yaw)
    from IMU sensor streams (DeviceMotionEvent / DeviceOrientationEvent) or VIO logs.
    """

    def __init__(self, sample_rate=50.0):
        self.sample_rate = sample_rate
        self.dt = 1.0 / sample_rate

    def estimate_trajectory_from_imu(self, imu_samples, num_video_frames, video_fps=30.0):
        """
        Processes a list of IMU samples:
        imu_sample: { 'timestamp': float, 'accel': [ax, ay, az], 'gyro': [gx, gy, gz], 'orientation': [alpha, beta, gamma] }

        Returns:
          poses: Nx6 numpy array of [x, y, z, roll, pitch, yaw] aligned to video frames.
        """
        if not imu_samples:
            # Fallback synthetic smooth trajectory for testing/demo
            return self._generate_synthetic_trajectory(num_video_frames, video_fps)

        n = len(imu_samples)
        timestamps = np.array([s.get('timestamp', i*self.dt) for i, s in enumerate(imu_samples)])

        # Extract accelerations & orientations
        accels = []
        orientations = []

        for s in imu_samples:
            acc = list(s.get('accel', [0.0, 0.0, 9.81]))
            angle = s.get('screen_angle', 0)

            # Re-map axes for horizontal landscape holding
            if angle == 90:
                acc = [-acc[1], acc[0], acc[2]]
            elif angle == 270 or angle == -90:
                acc = [acc[1], -acc[0], acc[2]]
            elif angle == 180:
                acc = [-acc[0], -acc[1], acc[2]]

            accels.append(acc)

            ori = s.get('orientation', None)
            if ori is not None:
                # Phone orientation in deg (alpha, beta, gamma -> yaw, pitch, roll)
                yaw, pitch, roll = np.radians(ori[0]), np.radians(ori[1]), np.radians(ori[2])
            else:
                yaw, pitch, roll = 0.0, 0.0, 0.0
            orientations.append([roll, pitch, yaw])

        accels = np.array(accels)
        orientations = np.array(orientations)

        # 1. Orientation smoothing
        b, a = butter(2, 0.1, btype='low')
        if n > 15:
            orientations[:, 0] = filtfilt(b, a, orientations[:, 0])
            orientations[:, 1] = filtfilt(b, a, orientations[:, 1])
            orientations[:, 2] = filtfilt(b, a, orientations[:, 2])

        # 2. Subtract gravity and integrate acceleration to velocity & position
        positions = np.zeros((n, 3))
        velocities = np.zeros((n, 3))

        for i in range(1, n):
            dt = timestamps[i] - timestamps[i-1]
            if dt <= 0 or dt > 0.5:
                dt = self.dt

            # Rotate body acceleration to world frame
            r = R.from_euler('xyz', orientations[i])
            world_accel = r.apply(accels[i])

            # Gravity removal (assuming gravity along Z axis)
            world_accel[2] -= 9.81

            # High-pass damping to prevent drift
            damping = 0.95
            velocities[i] = (velocities[i-1] + world_accel * dt) * damping
            positions[i] = positions[i-1] + velocities[i] * dt

        # High-pass filter positions to keep within reasonable workspace
        if n > 15:
            b_hp, a_hp = butter(2, 0.05, btype='high')
            positions[:, 0] = filtfilt(b_hp, a_hp, positions[:, 0])
            positions[:, 1] = filtfilt(b_hp, a_hp, positions[:, 1])
            positions[:, 2] = filtfilt(b_hp, a_hp, positions[:, 2])

        # 3. Resample poses to target video frame rate (e.g. 30 FPS)
        video_timestamps = np.linspace(timestamps[0], timestamps[-1], num_video_frames)

        frame_pos_x = np.interp(video_timestamps, timestamps, positions[:, 0])
        frame_pos_y = np.interp(video_timestamps, timestamps, positions[:, 1])
        frame_pos_z = np.interp(video_timestamps, timestamps, positions[:, 2])

        frame_roll = np.interp(video_timestamps, timestamps, orientations[:, 0])
        frame_pitch = np.interp(video_timestamps, timestamps, orientations[:, 1])
        frame_yaw = np.interp(video_timestamps, timestamps, orientations[:, 2])

        frame_poses = np.column_stack([
            frame_pos_x, frame_pos_y, frame_pos_z,
            frame_roll, frame_pitch, frame_yaw
        ])

        return frame_poses

    def _generate_synthetic_trajectory(self, num_frames=150, fps=30.0):
        """
        Generates a realistic reach-and-return smooth curve (e.g. reaching for apple)
        when live IMU is sparse or in preview mode.
        """
        t = np.linspace(0, 1.0, num_frames)

        # Smooth bell-shaped velocity curve (reaching forward and grabbing)
        x = 0.15 * np.sin(np.pi * t)
        y = 0.08 * (1 - np.cos(2 * np.pi * t)) - 0.04
        z = 0.10 * np.sin(np.pi * t)

        roll = 0.1 * np.sin(np.pi * t)
        pitch = -0.2 * np.sin(np.pi * t)
        yaw = 0.1 * np.sin(2 * np.pi * t)

        return np.column_stack([x, y, z, roll, pitch, yaw])

if __name__ == "__main__":
    estimator = TrajectoryEstimator()
    sample_imu = [
        {'timestamp': i*0.02, 'accel': [0.1*np.sin(i*0.1), 0.0, 9.81 + 0.05*np.cos(i*0.1)], 'orientation': [0, i*0.5, i*0.2]}
        for i in range(100)
    ]
    poses = estimator.estimate_trajectory_from_imu(sample_imu, num_video_frames=60)
    print("Estimated Poses Shape:", poses.shape)
    print("First Pose:", poses[0])
    print("Mid Pose:", poses[30])
