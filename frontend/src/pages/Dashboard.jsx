import React, { useState, useEffect, useMemo, useRef } from 'react';
import Viewport3D from '../components/Viewport3D';
import VideoPlayer from '../components/VideoPlayer';
import DevVisionMonitor from '../components/DevVisionMonitor';
import {
  Play,
  Pause,
  Trash2,
  RefreshCw,
  Layers,
  Compass,
  MoveUpRight,
  Bot,
  Columns,
  Rows,
  AppWindow,
  Maximize2,
  Minimize2,
  Minus,
  Video,
  PanelRightClose,
  PanelRightOpen,
  GripHorizontal,
  GripVertical,
  Terminal,
  Activity,
  Anchor,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Eye,
  Info,
  ChevronDown,
  ChevronUp,
  UploadCloud,
  Edit3,
  Check,
  X,
  Sliders,
  RotateCw
} from 'lucide-react';

function previewFilterWindow(windowMs, fps, length) {
  if (length < 3) return 1;
  let frames = Math.max(3, Math.round((windowMs / 1000) * (fps || 30)));
  if (frames % 2 === 0) frames += 1;
  return Math.min(frames, length % 2 === 0 ? length - 1 : length);
}

function isRenderablePoseArray(poses) {
  return Array.isArray(poses)
    && poses.length > 0
    && poses.every((pose) => Array.isArray(pose)
      && pose.length >= 3
      && Number.isFinite(Number(pose[0]))
      && Number.isFinite(Number(pose[1]))
      && Number.isFinite(Number(pose[2])));
}

function filterPreviewPoses(poses, method, windowMs, fps) {
  if (!isRenderablePoseArray(poses) || method === 'raw') return poses || [];
  const frameWindow = previewFilterWindow(windowMs, fps, poses.length);
  if (frameWindow < 3) return poses;
  const half = Math.floor(frameWindow / 2);
  const offsets = Array.from({ length: frameWindow }, (_, i) => i - half);

  // Quadratic Savitzky-Golay weights derived from the symmetric least-squares
  // normal matrix. They preserve local shape without contacting the server.
  const sum2 = offsets.reduce((total, value) => total + value * value, 0);
  const sum4 = offsets.reduce((total, value) => total + value ** 4, 0);
  const determinant = frameWindow * sum4 - sum2 * sum2;
  const weights = method === 'savgol'
    ? offsets.map((value) => (sum4 - sum2 * value * value) / determinant)
    : offsets.map(() => 1 / frameWindow);

  return poses.map((pose, index) => pose.map((value, axis) => {
    if (!Number.isFinite(value)) return value;
    let filtered = 0;
    for (let sample = 0; sample < frameWindow; sample += 1) {
      const sampleIndex = Math.min(poses.length - 1, Math.max(0, index + offsets[sample]));
      const sampleValue = Number(poses[sampleIndex]?.[axis]);
      filtered += (Number.isFinite(sampleValue) ? sampleValue : value) * weights[sample];
    }
    return filtered;
  }));
}

export default function Dashboard({
  episodes,
  selectedEpIdx,
  setSelectedEpIdx,
  onRefreshEpisodes,
  onDeleteEpisode,
  onClearAllEpisodes,
  onReprocessActive,
  onUpdateEpisodePoses,
  onUpdateEpisodeTask,
  robotConfig,
  onUpdateRobotConfig,
  onOpenRobotModal,
  onOpenEkfModal,
  trajectoryMode = 'free_form',
  setTrajectoryMode = () => {}
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [combinedSliderIndex, setCombinedSliderIndex] = useState(0);

  // In-place Episode Task Prompt Editing State
  const [editingEpIdx, setEditingEpIdx] = useState(null);
  const [editingTaskText, setEditingTaskText] = useState('');

  const startEditingTask = (epIdx, currentTask) => {
    setEditingEpIdx(epIdx);
    setEditingTaskText(currentTask || '');
  };

  const saveEditingTask = async (epIdx) => {
    if (editingTaskText.trim() && onUpdateEpisodeTask) {
      await onUpdateEpisodeTask(epIdx, editingTaskText.trim());
    }
    setEditingEpIdx(null);
  };

  const cancelEditingTask = () => {
    setEditingEpIdx(null);
  };

  // Auto-calculated Approach Trajectory for Initial-Position Aware Mode
  const [approachData, setApproachData] = useState(null);
  const [isApproachLoading, setIsApproachLoading] = useState(false);

  // Trajectory Smoothing Configuration (Savitzky-Golay / Moving Average)
  const [smoothingMethod, setSmoothingMethod] = useState('savgol');
  const [smoothingWindowMs, setSmoothingWindowMs] = useState(250);
  // A capture is fetched asynchronously.  Advance this once after its points
  // are committed so the imperative WebGL layer performs its initial draw.
  const [previewRevision, setPreviewRevision] = useState(0);

  // Dev View Diagnostic Overlay (ArUco + Virtual SLAM) - Default OFF for clean minimalist view
  const [isDevView, setIsDevView] = useState(false);
  const [showRawTelemetry, setShowRawTelemetry] = useState(false);
  const [showAnchoringGuide, setShowAnchoringGuide] = useState(true);

  // Layout Configuration: Default to 'pip' (Big 3D Trajectory with anchored bottom-right Camera)
  const [layoutMode, setLayoutMode] = useState('pip'); // 'pip' (Default), 'vertical', or 'horizontal'
  const [pipSize, setPipSize] = useState('small'); // 'small', 'medium', 'large'
  const [isPipOpen, setIsPipOpen] = useState(true);

  // Split ratio for alternative split modes
  const [splitRatio, setSplitRatio] = useState(55);
  const [isDragging, setIsDragging] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const splitContainerRef = useRef(null);
  const devPanelRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const [overridePoses, setOverridePoses] = useState(null);
  const [overrideEePoses, setOverrideEePoses] = useState(null);
  const [overrideJointStates, setOverrideJointStates] = useState(null);
  const [overrideRobotEePoses, setOverrideRobotEePoses] = useState(null);
  const [overrideFkTablePoses, setOverrideFkTablePoses] = useState(null);
  const [overrideFkCameraPoses, setOverrideFkCameraPoses] = useState(null);
  const [isRecalculatingTrajectory, setIsRecalculatingTrajectory] = useState(false);
  const [recalcSuccess, setRecalcSuccess] = useState(false);

  const handleRecalculateTrajectory = async () => {
    setIsRecalculatingTrajectory(true);
    setRecalcSuccess(false);
    try {
      const res = await fetch('/api/robot/recalculate_trajectory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          robot_config: robotConfig,
          all_episodes: true
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setRecalcSuccess(true);
        if (onRefreshEpisodes) await onRefreshEpisodes();
        setTimeout(() => setRecalcSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Failed to recalculate trajectory:', err);
    } finally {
      setIsRecalculatingTrajectory(false);
    }
  };

  // Server-side Background Processing Queue Status & Auto-refresh
  const [processingStatus, setProcessingStatus] = useState({
    is_processing: false,
    pending_count: 0,
    completed_count: 0,
    current_job: null
  });
  const prevCompletedCountRef = useRef(null);
  const prevIsProcessingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let timerId = null;

    const pollStatus = async () => {
      // Pause polling if the tab is hidden
      if (document.hidden) {
        timerId = setTimeout(pollStatus, 5000);
        return;
      }

      try {
        const res = await fetch('/api/processing/status');
        const data = await res.json();
        if (!isMounted || data.status !== 'success') return;

        setProcessingStatus(data);

        // Auto-refresh episode list and auto-select newly completed demonstration
        const completedCount = data.completed_count || 0;
        const hasCompletion = prevCompletedCountRef.current !== null && completedCount > prevCompletedCountRef.current;
        const processingFinished = prevIsProcessingRef.current && !data.is_processing;
        if (hasCompletion || processingFinished) {
          prevCompletedCountRef.current = data.completed_count || 0;
          const latestCompleted = data.recent_jobs?.filter((j) => j.status === 'completed').slice(-1)[0];
          const newEpIdx = latestCompleted?.episode_index;
          if (onRefreshEpisodes) {
            onRefreshEpisodes(newEpIdx !== undefined ? newEpIdx : null);
          }
        } else if (prevCompletedCountRef.current === null) {
          prevCompletedCountRef.current = completedCount;
        }
        prevIsProcessingRef.current = data.is_processing;

        // Adaptive polling interval: 2.5s if active/queued, 10s if idle
        const nextInterval = (data.is_processing || data.pending_count > 0) ? 2500 : 10000;
        if (isMounted) {
          timerId = setTimeout(pollStatus, nextInterval);
        }
      } catch (err) {
        if (isMounted) {
          timerId = setTimeout(pollStatus, 10000);
        }
      }
    };

    pollStatus();

    const handleVisibility = () => {
      if (!document.hidden) {
        pollStatus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [onRefreshEpisodes]);

  const activeEp = episodes.find((e) => e.episode_index === selectedEpIdx) || episodes[0] || null;
  const processedPoses = (overridePoses?.length ? overridePoses : null) || activeEp?.poses || [];
  const rawPoses = activeEp?.raw_poses || [];
  const sourcePoses = smoothingMethod === 'raw' && isRenderablePoseArray(rawPoses)
    ? rawPoses
    : (isRenderablePoseArray(processedPoses) ? processedPoses : rawPoses);
  const candidateEePoses = (overrideEePoses?.length ? overrideEePoses : null)
    || activeEp?.ee_poses
    || [];
  const sourceEePoses = isRenderablePoseArray(candidateEePoses) ? candidateEePoses : [];
  const poses = useMemo(
    () => filterPreviewPoses(sourcePoses, smoothingMethod, smoothingWindowMs, activeEp?.fps || 30),
    [sourcePoses, smoothingMethod, smoothingWindowMs, activeEp?.fps]
  );
  const eePoses = useMemo(
    () => filterPreviewPoses(sourceEePoses, smoothingMethod, smoothingWindowMs, activeEp?.fps || 30),
    [sourceEePoses, smoothingMethod, smoothingWindowMs, activeEp?.fps]
  );
  // Recreate the WebGL viewport only when a new reference trajectory arrives
  // (upload, episode switch, or explicit recalculation). Filter changes keep
  // the same renderer and replace only the in-memory display arrays.
  const previewSourceKey = `${activeEp?.episode_id ?? 'empty'}:${processedPoses.length}:${candidateEePoses.length}`;
  useEffect(() => {
    if (!poses.length && !eePoses.length) return undefined;
    const frameId = requestAnimationFrame(() => setPreviewRevision((revision) => revision + 1));
    return () => cancelAnimationFrame(frameId);
  }, [previewSourceKey]);
  const jointStates = overrideJointStates || activeEp?.joint_states || [];
  const robotEePoses = overrideRobotEePoses || activeEp?.robot_ee_poses || [];
  const fkTablePoses = overrideFkTablePoses || activeEp?.fk_table_poses || [];
  const fkCameraPoses = overrideFkCameraPoses || activeEp?.fk_camera_poses || [];
  const totalFrames = activeEp?.num_frames || 0;

  // Dual Trajectory System Phase & Timeline Index Resolution
  const isInitialAware = trajectoryMode === 'initial_aware';
  const approachFramesCount = (isInitialAware && approachData?.num_frames) ? approachData.num_frames : 0;
  const totalCombinedFrames = approachFramesCount + totalFrames;

  let isApproachPhase = false;
  let approachFrameIndex = 0;
  let safeFrameIndex = 0;

  if (isInitialAware && approachFramesCount > 0) {
    if (combinedSliderIndex < approachFramesCount) {
      isApproachPhase = true;
      approachFrameIndex = Math.min(Math.max(0, combinedSliderIndex), approachFramesCount - 1);
      safeFrameIndex = 0;
    } else {
      isApproachPhase = false;
      approachFrameIndex = approachFramesCount - 1;
      safeFrameIndex = Math.min(Math.max(0, combinedSliderIndex - approachFramesCount), Math.max(0, totalFrames - 1));
    }
  } else {
    isApproachPhase = false;
    approachFrameIndex = 0;
    safeFrameIndex = totalFrames > 0 ? Math.min(Math.max(0, combinedSliderIndex), totalFrames - 1) : 0;
  }

  const currentPose = poses[safeFrameIndex] || [0, 0, 0, 0, 0, 0];
  const currTelemetry = activeEp?.dev_telemetry?.[safeFrameIndex] || activeEp?.dev_telemetry?.[0] || null;

  // Fetch approach path whenever Initial-Aware mode is active or episode / initial position changes
  useEffect(() => {
    if (trajectoryMode !== 'initial_aware' || !activeEp) {
      setApproachData(null);
      return;
    }

    let isMounted = true;
    setIsApproachLoading(true);

    fetch('/api/trajectory/approach_path', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        episode_id: activeEp.episode_id,
        initial_position: robotConfig?.initial_position
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.status === 'success' && data.approach) {
          setApproachData(data.approach);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch approach path:', err);
      })
      .finally(() => {
        if (isMounted) setIsApproachLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [trajectoryMode, activeEp?.episode_id, robotConfig?.initial_position, overridePoses]);

  // Sync selectedEpIdx if activeEp resolved to a different episode
  useEffect(() => {
    if (activeEp && selectedEpIdx !== activeEp.episode_index) {
      setSelectedEpIdx(activeEp.episode_index);
    }
  }, [activeEp, selectedEpIdx, setSelectedEpIdx]);

  // Reset override poses when switching active episode
  useEffect(() => {
    setOverridePoses(null);
    setOverrideEePoses(null);
    setOverrideJointStates(null);
    setOverrideRobotEePoses(null);
    setOverrideFkTablePoses(null);
    setOverrideFkCameraPoses(null);
  }, [activeEp?.episode_index]);

  // Ensure dev_video_url and canny_video_url are generated for the active episode only if Dev Mode is ON
  useEffect(() => {
    if (isDevView && activeEp && (!activeEp.dev_video_url || !activeEp.canny_video_url) && activeEp.video_path && onRefreshEpisodes) {
      fetch(`/api/episodes/${activeEp.episode_index}/dev_video`, { method: 'POST' })
        .then((r) => r.json())
        .then((data) => {
          if (data.status === 'success' && (data.dev_video_url || data.canny_video_url)) {
            onRefreshEpisodes();
          }
        })
        .catch(() => {});
    }
  }, [isDevView, activeEp?.episode_index, activeEp?.dev_video_url, activeEp?.canny_video_url, activeEp?.video_path, onRefreshEpisodes]);

  // Reset playback and frame position whenever active episode, video URL, or mode changes
  useEffect(() => {
    setCombinedSliderIndex(0);
    setIsPlaying(false);
  }, [activeEp?.episode_index, activeEp?.video_url, trajectoryMode]);

  const handleApplySmoothing = (newMethod, newWindowMs) => {
    setSmoothingMethod(newMethod);
    const win = newWindowMs !== undefined ? newWindowMs : smoothingWindowMs;
    if (newWindowMs !== undefined) setSmoothingWindowMs(win);
  };

  const handleSliderChange = (newVal) => {
    setSmoothingWindowMs(newVal);
  };

  useEffect(() => {
    let interval = null;
    const maxFrames = isInitialAware ? totalCombinedFrames : totalFrames;
    if (isPlaying && maxFrames > 0) {
      interval = setInterval(() => {
        setCombinedSliderIndex((prev) => {
          if (prev >= maxFrames - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / (activeEp?.fps || 30));
    }
    return () => clearInterval(interval);
  }, [isPlaying, isInitialAware, totalCombinedFrames, totalFrames, activeEp?.fps]);

  // Handle Dragging Splitter in split modes
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();

      if (layoutMode === 'vertical') {
        const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);
        if (clientY === undefined) return;
        const offset = clientY - rect.top;
        const newRatio = (offset / rect.height) * 100;
        setSplitRatio(Math.min(85, Math.max(15, newRatio)));
      } else if (layoutMode === 'horizontal') {
        const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
        if (clientX === undefined) return;
        const offset = clientX - rect.left;
        const newRatio = (offset / rect.width) * 100;
        setSplitRatio(Math.min(85, Math.max(15, newRatio)));
      }
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, layoutMode]);

  const currentEePose = isApproachPhase
    ? (approachData?.aruco_ee_poses?.[approachFrameIndex] || [0.15, 0, 0.20, 0, 0, 0])
    : ((eePoses && eePoses[safeFrameIndex]) ? eePoses[safeFrameIndex] : currentPose);

  // 📷 Raw Camera Optical Center Coordinates (relative to ArUco Tag A (0,0,0))
  const currentCamX = isApproachPhase
    ? (approachData?.aruco_cam_poses?.[approachFrameIndex]?.[0] || 0)
    : (currentPose[0] || 0);
  const currentCamY = isApproachPhase
    ? (approachData?.aruco_cam_poses?.[approachFrameIndex]?.[1] || 0)
    : (currentPose[1] || 0);
  const currentCamZ = isApproachPhase
    ? (approachData?.aruco_cam_poses?.[approachFrameIndex]?.[2] || 0)
    : (currentPose[2] || 0);
  const distCamToOrigin = Math.hypot(currentCamX, currentCamY, currentCamZ);

  // 🎯 True Gripper End-Effector / Tool Center Point (TCP) Coordinates
  const currentTcpX = currentEePose[0] || 0;
  const currentTcpY = currentEePose[1] || 0;
  const currentTcpZ = currentEePose[2] || 0;
  const distTcpToOrigin = Math.hypot(currentTcpX, currentTcpY, currentTcpZ);

  // Compute Robot-Relative Coordinates using true Gripper TCP
  const ox = robotConfig?.offset_x ?? 0.038;
  const oy = robotConfig?.offset_y ?? -0.406;
  const oz = robotConfig?.offset_z ?? 0.00;
  const yawRad = THREE_to_rad(robotConfig?.yaw_deg ?? 90.0);

  const dx = currentTcpX - ox;
  const dy = currentTcpY - oy;
  const dz = currentTcpZ - oz;

  const cosY = Math.cos(yawRad);
  const sinY = Math.sin(yawRad);
  const robotTcpX = cosY * dx + sinY * dy;
  const robotTcpY = -sinY * dx + cosY * dy;
  const robotTcpZ = dz;
  const distToRobot = Math.hypot(robotTcpX, robotTcpY, robotTcpZ);

  function THREE_to_rad(deg) {
    return (deg * Math.PI) / 180;
  }

  const robotName = (robotConfig?.robot_type || 'so_arm101_omni_kin').toUpperCase().replace(/_/g, '-');

  // Anchor status calculation for intuitive Dev View visualization
  const isTagADetected = currTelemetry?.tags_detected?.includes(0);
  const isTagBDetected = currTelemetry?.tags_detected?.includes(1);
  const isArucoActive = isTagADetected || isTagBDetected || currTelemetry?.source === 'dual_aruco' || currTelemetry?.source === 'single_aruco';
  const numLandmarks = currTelemetry?.num_landmarks ?? 0;
  const numFeatures = currTelemetry?.num_features ?? 0;
  const isSlamActive = currTelemetry?.source === 'feature_pnp' || currTelemetry?.source === 'feature_vo';

  let anchorStateTitle = "Scanning for Anchors";
  let anchorStateBadge = "INITIALIZING";
  let anchorBadgeColor = "bg-neutral-800 text-neutral-300 border-neutral-700";
  let anchorExplanation = "OpenCV is scanning the camera feed to find the physical ArUco table marker or trackable scene features.";

  if (isArucoActive) {
    if (currTelemetry?.is_dual) {
      anchorStateTitle = "Primary Anchor: Dual ArUco Board Locked";
      anchorStateBadge = "PHYSICAL ANCHOR (DUAL)";
      anchorBadgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      anchorExplanation = "OpenCV is locked onto Tag A & Tag B on the table. It establishes the physical (0,0,0) world origin and is simultaneously pinning surrounding scene features into 3D space as virtual backup anchors.";
    } else {
      anchorStateTitle = "Primary Anchor: Single ArUco Tag Locked";
      anchorStateBadge = "PHYSICAL ANCHOR";
      anchorBadgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      anchorExplanation = `OpenCV is locked onto Tag ${isTagADetected ? 'A (Origin [0,0,0])' : 'B (Offset)'}. It defines table coordinates and anchors surrounding scene textures into 3D space.`;
    }
  } else if (isSlamActive || numLandmarks > 0) {
    anchorStateTitle = "Virtual Anchor: 3D Scene SLAM Active (Tag Occluded)";
    anchorStateBadge = "SCENE ANCHOR (VIRTUAL SLAM)";
    anchorBadgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
    anchorExplanation = `The physical ArUco tag is covered or out of view. OpenCV seamlessly switched to ${numLandmarks} previously pinned 3D scene features to keep the robot trajectory locked to the table without drift.`;
  } else if (currTelemetry?.source === 'imu') {
    anchorStateTitle = "Motion Continuity: IMU & Optical Dead-Reckoning";
    anchorStateBadge = "DEAD RECKONING";
    anchorBadgeColor = "bg-orange-500/20 text-orange-300 border-orange-500/40";
    anchorExplanation = "Visual anchors temporarily unavailable. The phone's accelerometer and gyroscope are bridging motion until anchors re-enter the camera frame.";
  }

  return (
    <div
      className={`flex-1 p-4 grid gap-4 grid-cols-1 ${
        isSidebarOpen ? 'lg:grid-cols-4' : 'lg:grid-cols-1'
      } transition-all ${isDragging ? 'select-none' : ''}`}
    >
      {/* Main Center Area: Big 3D Preview with Inset Camera, Timeline, & OpenCV Dev Center */}
      <div
        ref={scrollContainerRef}
        className={`${isSidebarOpen ? 'lg:col-span-3' : 'w-full'} flex flex-col gap-4 pb-16`}
      >
        {/* Top Control Bar for Layout Modes */}
        <div className="flex items-center justify-between px-1 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 font-mono flex items-center gap-1.5">
              <span>View:</span>
            </span>

            {/* Layout Mode Selector Pills */}
            <div className="flex items-center gap-1 bg-neutral-950 p-0.5 rounded-lg border border-neutral-800">
              <button
                onClick={() => setLayoutMode('pip')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                  layoutMode === 'pip'
                    ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
                title="Big 3D Workspace with Anchored Camera Inset (PiP)"
              >
                <AppWindow className="w-3.5 h-3.5" />
                <span>3D + Camera Inset</span>
              </button>

              <button
                onClick={() => setLayoutMode('vertical')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                  layoutMode === 'vertical'
                    ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
                title="Stack 3D & Video Vertically (Top / Bottom)"
              >
                <Rows className="w-3.5 h-3.5" />
                <span>Vertical Stack</span>
              </button>

              <button
                onClick={() => setLayoutMode('horizontal')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                  layoutMode === 'horizontal'
                    ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
                title="Side-by-Side Split View"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Side-by-Side</span>
              </button>
            </div>

            {/* Trajectory Mode Switcher (Free-Form Pretrain vs Initial-Aware Fine-Tune) */}
            <div className="flex items-center gap-1 bg-neutral-950 p-0.5 rounded-lg border border-neutral-800 ml-1">
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCombinedSliderIndex(0);
                  setTrajectoryMode('free_form');
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                  trajectoryMode === 'free_form'
                    ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
                title="Mode A: Raw recorded demonstration from first waypoint (standard pretraining)"
              >
                <Zap className="w-3.5 h-3.5 text-neutral-400" />
                <span>Free-Form (Pretrain)</span>
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCombinedSliderIndex(0);
                  setTrajectoryMode('initial_aware');
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                  trajectoryMode === 'initial_aware'
                    ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
                title="Mode B: Standardized initial Home position with collision-safe auto-approach path (fine-tuning & deployment)"
              >
                <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
                <span>Initial-Aware (Fine-Tune)</span>
              </button>
            </div>

            {trajectoryMode === 'initial_aware' && (
              <button
                onClick={() => onOpenRobotModal?.('initial_pos')}
                className="px-2 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 flex items-center gap-1 text-[11px] font-medium transition-all"
                title="Configure Canonical Initial Home / Standby Position"
              >
                <span>🏠 Home Pose</span>
              </button>
            )}

            {/* Recalculate Trajectory Button based on Robot Setup */}
            <button
              onClick={handleRecalculateTrajectory}
              disabled={isRecalculatingTrajectory}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50 ${
                recalcSuccess
                  ? 'bg-neutral-800 text-white border-neutral-600'
                  : 'bg-neutral-900/80 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-white'
              }`}
              title="Recalculate 3D gripper trajectory and reachability based on latest robot setup"
            >
              <RotateCw className={`w-3.5 h-3.5 text-neutral-400 ${isRecalculatingTrajectory ? 'animate-spin' : ''}`} />
              <span>{isRecalculatingTrajectory ? 'Recalculating...' : recalcSuccess ? '✓ Recalculated' : 'Recalculate Trajectory'}</span>
            </button>

            {/* PiP Specific Size Controls when in PiP mode */}
            {layoutMode === 'pip' && isPipOpen && (
              <div className="flex items-center gap-1 bg-neutral-950 p-0.5 rounded-lg border border-neutral-800 text-[11px]">
                <span className="text-neutral-500 px-1.5 text-[10px] uppercase font-mono">Camera:</span>
                <button
                  onClick={() => setPipSize('small')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    pipSize === 'small' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Small
                </button>
                <button
                  onClick={() => setPipSize('medium')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    pipSize === 'medium' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Medium
                </button>
                <button
                  onClick={() => setPipSize('large')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    pipSize === 'large' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Large
                </button>
              </div>
            )}
            {/* Dev View Diagnostic Overlay Toggle */}
            <button
              onClick={() => setIsDevView(!isDevView)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all border ${
                isDevView
                  ? 'bg-neutral-800 text-white border-neutral-600 shadow-sm font-semibold'
                  : 'bg-neutral-900/80 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
              title="Toggle ArUco Marker Detection & Virtual SLAM Diagnostic Overlay"
            >
              <Terminal className={`w-3.5 h-3.5 ${isDevView ? 'text-white' : 'text-neutral-400'}`} />
              <span>Dev View: {isDevView ? 'ON' : 'OFF'}</span>
            </button>

            {/* EKF Tuning Option in Dev Mode */}
            {isDevView && onOpenEkfModal && (
              <button
                onClick={onOpenEkfModal}
                className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 flex items-center gap-1.5 transition-all text-[11px] font-medium shadow-sm"
                title="Open Extended Kalman Filter (EKF) Parameters & Covariance Tuning"
              >
                <Sliders className="w-3.5 h-3.5 text-neutral-400" />
                <span>EKF Tuning</span>
              </button>
            )}

            {/* Direct Jump to Dev View Panel */}
            {isDevView && (
              <button
                onClick={() => {
                  devPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 flex items-center gap-1.5 transition-all text-[11px] font-medium active:scale-95 shadow-sm"
                title="Scroll directly down to OpenCV Scene Anchoring & Dev View"
              >
                <Anchor className="w-3.5 h-3.5 text-neutral-400" />
                <span>Jump to Dev View ↓</span>
              </button>
            )}
          </div>

          {/* Right: Sidebar Collapse/Expand Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="px-2.5 py-1 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 flex items-center gap-1.5 transition-all"
              title={isSidebarOpen ? 'Collapse Episodes Drawer' : 'Expand Episodes Drawer'}
            >
              {isSidebarOpen ? (
                <>
                  <PanelRightClose className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Collapse Drawer</span>
                </>
              ) : (
                <>
                  <PanelRightOpen className="w-3.5 h-3.5 text-neutral-300" />
                  <span className="hidden md:inline text-neutral-200">Episodes ({episodes.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        {layoutMode === 'pip' ? (
          /* ========================================================================= */
          /* BIG 3D TRAJECTORY PREVIEW WITH ANCHORED BOTTOM-RIGHT CAMERA INSET         */
          /* ========================================================================= */
          <div className="flex-1 min-h-[380px] md:min-h-[440px] relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-xl shrink-0">
            {/* Primary Big 3D Workspace */}
            <div className="w-full h-full relative">
              <Viewport3D
                key={previewSourceKey}
                trajectoryPoses={poses}
                eePoses={eePoses}
                trajectoryRevision={previewRevision}
                gripperStates={activeEp?.gripper_states || []}
                currentFrameIndex={safeFrameIndex}
                robotConfig={robotConfig}
                onUpdateRobotConfig={onUpdateRobotConfig}
                episodeId={activeEp?.episode_id}
                trajectoryMode={trajectoryMode}
                approachEePoses={approachData?.aruco_ee_poses || []}
                approachGripperStates={approachData?.gripper_states || []}
                approachCamPoses={approachData?.aruco_cam_poses || []}
                isApproachPhase={isApproachPhase}
                approachFrameIndex={approachFrameIndex}
                jointStates={jointStates}
                robotEePoses={robotEePoses}
                fkTablePoses={fkTablePoses}
                fkCameraPoses={fkCameraPoses}
                linkPositions={activeEp?.link_positions || []}
                reachAngleDeg={activeEp?.reach_angle_deg ?? robotConfig?.reach_angle_deg}
              />
            </div>

            {/* Anchored Bottom-Right Camera View Panel */}
            {isPipOpen ? (
              <div
                className={`absolute bottom-3 right-3 z-30 transition-all duration-200 rounded-xl overflow-hidden border border-neutral-700 bg-[#0a0a0a]/95 backdrop-blur-xl shadow-2xl flex flex-col ${
                  pipSize === 'large'
                    ? 'w-96 md:w-[420px]'
                    : pipSize === 'medium'
                    ? 'w-72 md:w-80'
                    : 'w-56'
                }`}
              >
                {/* Inset Header Bar */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 text-[11px] select-none">
                  <div className="flex items-center gap-1.5 font-medium text-neutral-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse" />
                    <span className="tracking-wider uppercase font-mono text-[10px]">{isDevView ? 'Dev View' : 'Camera View'}</span>
                  </div>

                  <div className="flex items-center gap-1 text-neutral-400">
                    {/* Size cycle button */}
                    <button
                      onClick={() =>
                        setPipSize((prev) => (prev === 'small' ? 'medium' : prev === 'medium' ? 'large' : 'small'))
                      }
                      className="p-1 hover:text-white rounded hover:bg-neutral-800 transition-colors"
                      title={`Resize Camera Inset (Current: ${pipSize.toUpperCase()})`}
                    >
                      <Maximize2 className="w-3 h-3" />
                    </button>
                    {/* Minimize button */}
                    <button
                      onClick={() => setIsPipOpen(false)}
                      className="p-1 hover:text-rose-400 rounded hover:bg-neutral-800 transition-colors"
                      title="Minimize Camera Inset"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Video Frame with preserved native aspect ratio */}
                <div className="w-full aspect-video relative bg-black flex items-center justify-center overflow-hidden">
                  <VideoPlayer
                    videoUrl={activeEp?.video_url}
                    devVideoUrl={activeEp?.dev_video_url}
                    isDevView={isDevView}
                    setIsDevView={setIsDevView}
                    devTelemetry={activeEp?.dev_telemetry}
                    isPlaying={isPlaying}
                    isApproachPhase={isApproachPhase}
                    currentFrameIndex={safeFrameIndex}
                    totalFrames={totalFrames}
                    fps={activeEp?.fps || 30}
                    onEnded={() => setIsPlaying(false)}
                    showBadge={false}
                  />
                </div>
              </div>
            ) : (
              /* Minimized Floating Inset Button in Bottom-Right */
              <button
                onClick={() => setIsPipOpen(true)}
                className="absolute bottom-3 right-3 z-30 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 backdrop-blur-md border border-neutral-700 rounded-lg text-xs font-medium text-neutral-300 hover:text-white shadow-xl flex items-center gap-2 transition-all active:scale-95"
                title="Restore Camera View Inset"
              >
                <Video className="w-3.5 h-3.5 text-neutral-400" />
                <span>Show Camera View</span>
              </button>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* ALTERNATIVE SPLIT MODES (VERTICAL STACK OR SIDE-BY-SIDE)                  */
          /* ========================================================================= */
          <div
            ref={splitContainerRef}
            className={`flex ${
              layoutMode === 'vertical' ? 'flex-col' : 'flex-col md:flex-row'
            } gap-0 flex-1 min-h-[380px] md:min-h-[440px] shrink-0 relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950`}
          >
            {/* 3D Trajectory Viewport */}
            <div
              style={
                layoutMode === 'vertical'
                  ? { height: `${splitRatio}%`, width: '100%' }
                  : { width: `${splitRatio}%`, height: '100%' }
              }
              className="relative overflow-hidden transition-[height,width] duration-75 ease-out"
            >
              <Viewport3D
                key={previewSourceKey}
                trajectoryPoses={poses}
                eePoses={eePoses}
                trajectoryRevision={previewRevision}
                gripperStates={activeEp?.gripper_states || []}
                currentFrameIndex={safeFrameIndex}
                robotConfig={robotConfig}
                onUpdateRobotConfig={onUpdateRobotConfig}
                episodeId={activeEp?.episode_id}
                trajectoryMode={trajectoryMode}
                approachEePoses={approachData?.aruco_ee_poses || []}
                approachGripperStates={approachData?.gripper_states || []}
                approachCamPoses={approachData?.aruco_cam_poses || []}
                isApproachPhase={isApproachPhase}
                approachFrameIndex={approachFrameIndex}
                jointStates={jointStates}
                robotEePoses={robotEePoses}
                fkTablePoses={fkTablePoses}
                fkCameraPoses={fkCameraPoses}
                linkPositions={activeEp?.link_positions || []}
                reachAngleDeg={activeEp?.reach_angle_deg ?? robotConfig?.reach_angle_deg}
              />
            </div>

            {/* Draggable Divider */}
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onTouchStart={() => setIsDragging(true)}
              className={`z-30 items-center justify-center bg-neutral-900 hover:bg-neutral-800 transition-all select-none group ${
                layoutMode === 'vertical'
                  ? 'flex h-2.5 hover:h-3.5 w-full cursor-row-resize border-y border-neutral-800'
                  : 'hidden md:flex w-2.5 hover:w-3.5 h-full cursor-col-resize border-x border-neutral-800'
              }`}
            >
              {layoutMode === 'vertical' ? (
                <div className="w-12 h-1 rounded-full bg-neutral-700 group-hover:bg-white transition-colors flex items-center justify-center">
                  <GripHorizontal className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white" />
                </div>
              ) : (
                <div className="w-1 h-8 rounded-full bg-neutral-700 group-hover:bg-white transition-colors flex items-center justify-center">
                  <GripVertical className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white" />
                </div>
              )}
            </div>

            {/* Video Player */}
            <div
              style={
                layoutMode === 'vertical'
                  ? { height: `${100 - splitRatio}%`, width: '100%' }
                  : { width: `${100 - splitRatio}%`, height: '100%' }
              }
              className="relative overflow-hidden transition-[height,width] duration-75 ease-out"
            >
              <VideoPlayer
                videoUrl={activeEp?.video_url}
                devVideoUrl={activeEp?.dev_video_url}
                isDevView={isDevView}
                setIsDevView={setIsDevView}
                devTelemetry={activeEp?.dev_telemetry}
                isPlaying={isPlaying}
                isApproachPhase={isApproachPhase}
                currentFrameIndex={safeFrameIndex}
                totalFrames={totalFrames}
                fps={activeEp?.fps || 30}
                onEnded={() => setIsPlaying(false)}
              />
            </div>
          </div>
        )}

        {/* Timeline & Playback Controller */}
        <div className="glass-card p-4 rounded-xl flex flex-col gap-3.5 shrink-0 border border-neutral-800">
          {/* Active Episode Header & In-Place Task Prompt Editor */}
          <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800/80 text-xs select-none">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="font-mono text-[10px] font-semibold text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded shrink-0 uppercase tracking-wider">
                EPISODE #{activeEp?.episode_index ?? 0}
              </span>

              {editingEpIdx === activeEp?.episode_index ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveEditingTask(activeEp.episode_index);
                  }}
                  className="flex items-center gap-1.5 flex-1 max-w-md"
                >
                  <input
                    type="text"
                    value={editingTaskText}
                    onChange={(e) => setEditingTaskText(e.target.value)}
                    placeholder="Enter task instruction..."
                    autoFocus
                    className="flex-1 bg-neutral-950 border border-neutral-600 rounded px-2 py-0.5 text-xs text-white outline-none font-medium focus:border-white transition-colors"
                  />
                  <button
                    type="submit"
                    className="p-1 rounded bg-white text-black hover:bg-neutral-200 transition-colors"
                    title="Save Task Prompt"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditingTask}
                    className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                    title="Cancel"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </form>
              ) : (
                <div
                  className="flex items-center gap-2 group cursor-pointer"
                  onClick={() => startEditingTask(activeEp?.episode_index, activeEp?.task)}
                  title="Click to edit task prompt"
                >
                  <span className="text-white font-medium truncate max-w-lg">
                    "{activeEp?.task || 'demonstration'}"
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditingTask(activeEp?.episode_index, activeEp?.task);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-white p-0.5 transition-opacity"
                    title="Edit Task Prompt"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-neutral-500 text-[11px] font-mono shrink-0">
              <span>{(activeEp?.duration || 0).toFixed(1)}s</span>
              <span>·</span>
              <span>{totalFrames} frames</span>
              <span>·</span>
              <span>{activeEp?.fps || 30} FPS</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={(isInitialAware ? totalCombinedFrames : totalFrames) === 0}
              className="p-3 rounded-lg bg-white hover:bg-neutral-200 text-black font-bold shadow-sm transition-all disabled:opacity-30 active:scale-95"
              title={isPlaying ? 'Pause Playback' : 'Start Playback'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <div className="flex-1 flex flex-col gap-1">
              <input
                type="range"
                min="0"
                max={Math.max(0, (isInitialAware ? totalCombinedFrames : totalFrames) - 1)}
                value={combinedSliderIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  setCombinedSliderIndex(parseInt(e.target.value) || 0);
                }}
                className="w-full cursor-pointer h-1.5 bg-neutral-800 rounded-lg accent-white"
              />
              <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                {isApproachPhase ? (
                  <span className="text-neutral-300 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse" />
                    <span>Approach: Step {approachFrameIndex + 1} of {approachFramesCount}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>
                      Frame {safeFrameIndex + 1} of {totalFrames}
                      {isInitialAware && <span className="text-neutral-400 ml-1.5 font-sans font-medium">(Demo)</span>}
                    </span>
                    {activeEp?.feasible_window?.is_trimmed && (
                      <span
                        className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-neutral-900 text-neutral-300 border border-neutral-800 flex items-center gap-1"
                        title={`Physically reachable window: Frames ${activeEp.feasible_window.start}–${activeEp.feasible_window.end}.`}
                      >
                        <span className="w-1 h-1 rounded-full bg-neutral-300" />
                        <span>Feasible: {activeEp.feasible_window.start}–{activeEp.feasible_window.end}</span>
                      </span>
                    )}
                  </span>
                )}
                <span>
                  {isApproachPhase
                    ? `${((approachFrameIndex / (activeEp?.fps || 30)) || 0).toFixed(2)}s (Approach)`
                    : `${((safeFrameIndex / (activeEp?.fps || 30)) || 0).toFixed(2)}s / ${(activeEp?.duration || 0).toFixed(2)}s`}
                </span>
              </div>
            </div>
          </div>

          {/* Dual-Coordinate Telemetry Strip: ArUco Table Origin & Robot Base Relative */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 bg-[#0a0a0a] p-2.5 rounded-lg border border-neutral-800 text-left font-mono">
            {/* ArUco Table Origin: Camera & Gripper TCP */}
            <div className="border-r border-neutral-800 pr-2 col-span-2 flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-neutral-400 uppercase font-sans font-semibold">
                  ArUco Origin (0,0,0)
                </span>
                {robotConfig?.gripper_offset?.enabled && (
                  <button
                    onClick={() => onOpenRobotModal?.('gripper')}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 font-sans font-medium transition-all"
                    title="Click to adjust 6-DoF Camera-to-Gripper Offset"
                  >
                    🎯 {robotConfig.gripper_offset.pitch_deg || 40.4}° / {robotConfig.gripper_offset.forward_cm || 12.8}cm
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-0.5 mt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500 text-[10px] font-sans">TCP:</span>
                  <span className="font-semibold text-neutral-200">
                    [{(currentTcpX * 100).toFixed(1)}, {(currentTcpY * 100).toFixed(1)}, {(currentTcpZ * 100).toFixed(1)}] cm
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="text-neutral-500 text-[10px] font-sans">Cam:</span>
                  <span className="text-neutral-400 font-mono">
                    [{(currentCamX * 100).toFixed(1)}, {(currentCamY * 100).toFixed(1)}, {(currentCamZ * 100).toFixed(1)}] cm
                  </span>
                </div>
              </div>
            </div>

            {/* Robot Base Relative */}
            <div className="border-r border-neutral-800 pr-2 col-span-2 flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-neutral-400 uppercase font-sans font-semibold flex items-center gap-1">
                  <Bot className="w-3 h-3 text-neutral-400" />
                  <span>{robotName} Base Frame</span>
                </span>
                <span className="text-[9px] text-neutral-500">
                  @ [{(ox * 100).toFixed(0)}, {(oy * 100).toFixed(0)}] cm
                </span>
              </div>
              <div className="mt-1">
                <span className="text-xs font-semibold text-neutral-200">
                  X:{(robotTcpX * 100).toFixed(1)} Y:{(robotTcpY * 100).toFixed(1)} Z:{(robotTcpZ * 100).toFixed(1)} cm
                </span>
              </div>
            </div>

            {/* Dist to ArUco Origin & Robot Base */}
            <div className="border-r border-neutral-800 pr-2 flex flex-col justify-center">
              <span className="text-[10px] text-neutral-500 uppercase block font-sans">Distance</span>
              <div className="text-[11px] font-semibold text-neutral-300 mt-0.5">
                Origin: {(distTcpToOrigin * 100).toFixed(1)} cm
              </div>
              <div className="text-[11px] font-semibold text-neutral-400">
                Robot: {(distToRobot * 100).toFixed(1)} cm
              </div>
            </div>

            {/* Gripper */}
            <div className="flex flex-col justify-center">
              <span className="text-[10px] text-neutral-500 uppercase block font-sans">Gripper</span>
              <span className="text-sm font-semibold mt-0.5 text-neutral-200">
                {isApproachPhase
                  ? (approachData?.gripper_states?.[approachFrameIndex] !== undefined
                      ? `${approachData.gripper_states[approachFrameIndex].toFixed(0)}%`
                      : '100%')
                  : (activeEp?.gripper_states?.[safeFrameIndex] !== undefined
                      ? `${activeEp.gripper_states[safeFrameIndex].toFixed(0)}%`
                      : '100%')}
              </span>
            </div>
          </div>

          {/* Interactive Trajectory Smoothing Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2 bg-[#0a0a0a] p-2 rounded-lg border border-neutral-800 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
              <span className="font-semibold text-neutral-300 text-[11px] uppercase tracking-wider font-mono">Smoothing:</span>
              <span className="text-[10px] text-neutral-500 font-medium">Live preview · no recording changes</span>
            </div>

            <div className="flex items-center gap-1 bg-neutral-950 p-0.5 rounded-lg border border-neutral-800">
              <button
                onClick={() => handleApplySmoothing('raw')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  smoothingMethod === 'raw'
                    ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                Raw / Unfiltered
              </button>

              <button
                onClick={() => handleApplySmoothing('savgol')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
                  smoothingMethod === 'savgol'
                    ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
                title="Savitzky-Golay Polynomial Filter (Preserves peaks, removes jitter)"
              >
                <span>Savitzky-Golay</span>
                <span className="text-[9px] bg-neutral-700 px-1 rounded text-neutral-200 font-mono">Rec</span>
              </button>

              <button
                onClick={() => handleApplySmoothing('moving_average')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  smoothingMethod === 'moving_average'
                    ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
                title="Centered Gaussian/Moving Average"
              >
                Moving Average
              </button>
            </div>

            {smoothingMethod !== 'raw' && (
              <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-400">
                <span>Window:</span>
                <input
                  type="range"
                  min="100"
                  max="600"
                  step="50"
                  value={smoothingWindowMs}
                  onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                  className="w-24 accent-white cursor-pointer h-1.5 bg-neutral-800 rounded"
                />
                <span className="text-neutral-300 w-12">{smoothingWindowMs}ms</span>
              </div>
            )}
          </div>
        </div>

        {/* Intuitive OpenCV Scene Anchoring, Real Video Bounding Boxes & Canny Dev Diagnostic Panel */}
        {isDevView && (
          <div ref={devPanelRef} className="flex flex-col gap-4">
            {/* Live OpenCV Computer Vision Monitor: Real Video with ArUco Bounding Boxes, Canny View & Keypoint Tracking */}
            <DevVisionMonitor
              videoUrl={activeEp?.video_url}
              devVideoUrl={activeEp?.dev_video_url}
              cannyVideoUrl={activeEp?.canny_video_url}
              devTelemetry={activeEp?.dev_telemetry || []}
              currentFrameIndex={safeFrameIndex}
              totalFrames={totalFrames}
              fps={activeEp?.fps || 30}
              isPlaying={isPlaying}
              isApproachPhase={isApproachPhase}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onSeekFrame={(idx) => {
                setIsPlaying(false);
                const frameOffset = isInitialAware ? approachFramesCount : 0;
                setCombinedSliderIndex(frameOffset + idx);
              }}
              onEnded={() => setIsPlaying(false)}
              onOpenEkfModal={onOpenEkfModal}
            />

            {/* OpenCV Scene Anchoring & Real-World Calibration Details */}
            <div className="bg-[#0a0a0a] p-4 rounded-xl border border-neutral-800 text-left text-xs flex flex-col gap-3 shadow-xl">
              {/* Header: Title, Active Anchor Mode Pill, and Concept Guide Toggle */}
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-neutral-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300">
                    <Anchor className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-200 font-mono">
                        OpenCV Scene Anchoring & Tracking
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide border ${anchorBadgeColor}`}
                      >
                        {anchorStateBadge}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Visualizing table anchoring, feature tracking, and continuous 6-DoF trajectory reconstruction
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (scrollContainerRef.current) {
                        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                      } else {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-all flex items-center gap-1.5 active:scale-95"
                    title="Scroll back up to 3D Viewport"
                  >
                    <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Back to Top ↑</span>
                  </button>

                  <button
                    onClick={() => setShowAnchoringGuide(!showAnchoringGuide)}
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-all flex items-center gap-1.5"
                    title="Toggle Explanation of OpenCV Anchoring"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{showAnchoringGuide ? 'Hide Concept' : 'How It Works'}</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Real-Time Context: Plain English Explanation of Active Frame */}
              <div className="p-3 rounded-lg bg-neutral-900/90 border border-neutral-800 flex items-start gap-3">
                <div className="p-1.5 rounded-md bg-neutral-800 border border-neutral-700 text-neutral-300 shrink-0 mt-0.5">
                  <Eye className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-semibold text-neutral-200 text-xs">
                    <span>Active State: {anchorStateTitle}</span>
                  </div>
                  <p className="text-neutral-300 text-[11px] mt-0.5 leading-relaxed">
                    {anchorExplanation}
                  </p>
                </div>
              </div>

              {/* 3-Stage Visual Anchoring Pipeline Flow */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative">
                {/* Stage 1: Physical ArUco Tag */}
                <div className={`p-3 rounded-lg border flex flex-col gap-2 transition-all ${
                  isArucoActive
                    ? 'bg-neutral-900/90 border-neutral-700 shadow-sm'
                    : 'bg-neutral-950/60 border-neutral-800/80 opacity-75'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5 font-mono">
                      <Anchor className="w-3.5 h-3.5" />
                      <span>1. Physical ArUco Tag</span>
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                      isArucoActive ? 'bg-neutral-800 text-neutral-200 border border-neutral-700' : 'bg-neutral-900 text-neutral-500'
                    }`}>
                      {isArucoActive ? 'Locked' : 'Occluded'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 text-[11px]">
                    <div className="text-neutral-200 font-medium">Table Ground Truth (0,0,0)</div>
                    <div className="text-neutral-400 text-[10px] leading-snug">
                      Printed board on the tabletop. Fixes the absolute millimeter scale and defines the tabletop surface ($Z = 0$).
                    </div>
                  </div>

                  <div className="mt-auto pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-neutral-500">Camera Detection:</span>
                    <span className="font-semibold text-neutral-300">
                      {isTagADetected && isTagBDetected
                        ? 'Dual Tags A & B'
                        : isTagADetected
                        ? 'Tag A (Origin) Visible'
                        : isTagBDetected
                        ? 'Tag B (Offset) Visible'
                        : 'Hidden by Hand / View'}
                    </span>
                  </div>
                </div>

                {/* Stage 2: OpenCV Scene Anchors (Virtual SLAM) */}
                <div className={`p-3 rounded-lg border flex flex-col gap-2 transition-all ${
                  !isArucoActive && (isSlamActive || numLandmarks > 0)
                    ? 'bg-neutral-900/90 border-neutral-700 shadow-sm'
                    : 'bg-neutral-950/60 border-neutral-800/80'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5 font-mono">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>2. Scene Feature Anchors</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-neutral-800 text-neutral-200 border border-neutral-700">
                      {numLandmarks > 0 ? `${numLandmarks} Landmarks` : 'Detecting...'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 text-[11px]">
                    <div className="text-neutral-200 font-medium">Virtual 3D Room Landmarks</div>
                    <div className="text-neutral-400 text-[10px] leading-snug">
                      OpenCV pins table edges, textures, and corners to the ArUco frame. When the marker is covered, these hold position!
                    </div>
                  </div>

                  <div className="mt-auto pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-neutral-500">Anchor Coverage:</span>
                    <span className="font-semibold text-neutral-300">
                      {numLandmarks >= 15 ? 'High (Robust)' : numLandmarks >= 5 ? 'Active Coverage' : 'Building Map'}
                    </span>
                  </div>
                </div>

                {/* Stage 3: Continuous 6-DoF Hand Trajectory */}
                <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5 font-mono">
                      <Bot className="w-3.5 h-3.5" />
                      <span>3. Robot Trajectory</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700">
                      {robotName} Calibrated
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 text-[11px]">
                    <div className="text-neutral-200 font-medium">Drift-Free Actions</div>
                    <div className="text-neutral-400 text-[10px] leading-snug">
                      Seamlessly hands over between the physical marker and scene features for zero coordinate jumps.
                    </div>
                  </div>

                  <div className="mt-auto pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-neutral-500">Trajectory Health:</span>
                    <span className="font-semibold text-neutral-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-neutral-400" />
                      <span>Continuous 6-DoF</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Visual Guide: What OpenCV Draws on the Camera Feed */}
              <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80 flex flex-col gap-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 font-mono">
                  <Eye className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Visual Guide: Camera Feed Diagnostic Symbols</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className="flex items-start gap-2 bg-neutral-900/60 p-2 rounded-lg border border-neutral-800/60">
                    <span className="w-3 h-3 rounded-sm border border-neutral-300 bg-neutral-300/20 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-neutral-200 text-[10px]">Green Box & Red Dot</div>
                      <div className="text-[9px] text-neutral-400">Physical ArUco tag. Origin is (0,0,0).</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-neutral-900/60 p-2 rounded-lg border border-neutral-800/60">
                    <div className="flex items-center gap-0.5 shrink-0 mt-1">
                      <span className="w-1.5 h-2.5 bg-rose-500 rounded-xs" />
                      <span className="w-1.5 h-2.5 bg-emerald-500 rounded-xs" />
                      <span className="w-1.5 h-2.5 bg-sky-500 rounded-xs" />
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-200 text-[10px]">3D RGB Axes</div>
                      <div className="text-[9px] text-neutral-400">+X Red, +Y Green, +Z Blue standing on table.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-neutral-900/60 p-2 rounded-lg border border-neutral-800/60">
                    <span className="w-2.5 h-2.5 rotate-45 border border-neutral-400 bg-neutral-400/30 shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-neutral-200 text-[10px]">Diamonds</div>
                      <div className="text-[9px] text-neutral-400">3D scene landmarks pinned in space.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-neutral-900/60 p-2 rounded-lg border border-neutral-800/60">
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-neutral-200 text-[10px]">Points & Trails</div>
                      <div className="text-[9px] text-neutral-400">2D visual keypoints and motion flow.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsible Educational Guide: How UMI-Style Anchoring Solves Hand Occlusion */}
              {showAnchoringGuide && (
                <div className="p-3.5 rounded-lg bg-neutral-900/90 border border-neutral-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-200 font-mono uppercase">
                    <span className="flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-neutral-400" />
                      <span>How OpenCV Anchoring Solves The "Hand Occlusion" Problem</span>
                    </span>
                    <button
                      onClick={() => setShowAnchoringGuide(false)}
                      className="text-neutral-500 hover:text-neutral-200 text-[10px]"
                    >
                      Dismiss
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    When teaching robots by hand, your arm or the gripper frequently covers the printed ArUco tag. Rather than losing tracking, OpenCV uses a dual-anchor strategy:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-[10px]">
                    <div className="bg-neutral-950 p-2 rounded-md border border-neutral-800">
                      <strong className="text-neutral-200 block mb-1">1. Learn Room Anchors</strong>
                      <span className="text-neutral-400">While ArUco is visible, OpenCV extracts corners across the table and room, triangulating them into fixed 3D space.</span>
                    </div>
                    <div className="bg-neutral-950 p-2 rounded-md border border-neutral-800">
                      <strong className="text-neutral-200 block mb-1">2. Seamless Handover</strong>
                      <span className="text-neutral-400">When your hand covers ArUco, OpenCV switches to tracking those 3D room anchors so position never jumps.</span>
                    </div>
                    <div className="bg-neutral-950 p-2 rounded-md border border-neutral-800">
                      <strong className="text-neutral-200 block mb-1">3. Zero-Drift Re-Lock</strong>
                      <span className="text-neutral-400">As soon as the ArUco tag reappears, OpenCV instantly snaps back to ground truth, eliminating drift.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Collapsible by Default: Raw Numerical Telemetry for Debugging */}
              <div className="pt-1 flex flex-col gap-2 border-t border-neutral-800">
                <button
                  onClick={() => setShowRawTelemetry(!showRawTelemetry)}
                  className="text-[10px] text-neutral-500 hover:text-neutral-300 font-mono flex items-center justify-between w-full py-1 transition-colors"
                >
                  <span>{showRawTelemetry ? '▼ Hide Raw Numerical Coordinates & Solvers' : '▶ Show Raw Numerical Coordinates & Solvers (Advanced Debugging)'}</span>
                  <span className="text-[9px] bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 text-neutral-400">
                    {showRawTelemetry ? 'Expanded' : 'Collapsed'}
                  </span>
                </button>

                {showRawTelemetry && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 font-mono text-[10px] bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                    <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                      <div className="text-neutral-200 font-bold mb-1">SLAM Solver</div>
                      <div>3D Landmarks: {numLandmarks}</div>
                      <div>Tracked Features: {numFeatures}</div>
                      <div>PnP VO: EPnP + RANSAC</div>
                    </div>
                    <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                      <div className="text-neutral-200 font-bold mb-1">ArUco Board</div>
                      <div>Tag A (0,0,0): {isTagADetected ? 'Detected' : 'Occluded'}</div>
                      <div>Tag B (+15cm): {isTagBDetected ? 'Detected' : 'Occluded'}</div>
                      <div>Board Baseline: 15.0 cm (+X)</div>
                    </div>
                    <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                      <div className="text-neutral-200 font-bold mb-1">Coordinates</div>
                      <div>Table: [{(currentTcpX * 100).toFixed(1)}, {(currentTcpY * 100).toFixed(1)}, {(currentTcpZ * 100).toFixed(1)}] cm</div>
                      <div>Robot Base: [{(robotTcpX * 100).toFixed(1)}, {(robotTcpY * 100).toFixed(1)}, {(robotTcpZ * 100).toFixed(1)}] cm</div>
                      <div>Pitch: {((currentPose[4] || 0) * (180 / Math.PI)).toFixed(1)}°</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar: Episode Storage Drawer (Collapsible & Sticky) */}
      {isSidebarOpen && (
        <div className="bg-[#0a0a0a]/95 border border-neutral-800 p-3 rounded-xl flex flex-col gap-2.5 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] overflow-hidden text-left transition-all">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2 px-1">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-neutral-400" />
              <h2 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider font-mono">
                Episodes ({episodes.length})
              </h2>
            </div>
            <div className="flex items-center gap-1">
              {episodes.length > 0 && onClearAllEpisodes && (
                <button
                  onClick={onClearAllEpisodes}
                  className="p-1 rounded-md text-neutral-500 hover:text-rose-400 hover:bg-neutral-900 transition-colors"
                  title="Clear All Episodes"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={onRefreshEpisodes}
                className="p-1 rounded-md text-neutral-500 hover:text-neutral-200 hover:bg-neutral-900 transition-colors"
                title="Refresh Episodes"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Background Processing Queue Monitor Banner */}
          {(processingStatus.is_processing || processingStatus.pending_count > 0 || processingStatus.recent_jobs?.some((job) => job.status === 'failed')) && (
            <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin text-neutral-400" />
                  <span>{processingStatus.is_processing ? 'Processing Demo' : 'Processing Queue'}</span>
                </span>
                <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-mono text-[10px] font-bold">
                  {processingStatus.pending_count + (processingStatus.is_processing ? 1 : 0)} in queue
                </span>
              </div>
              {processingStatus.current_job && (
                <div className="text-[10px] text-neutral-400 truncate font-mono">
                  Active: {processingStatus.current_job.task} · {processingStatus.current_job.phase || 'processing'}
                </div>
              )}
              {processingStatus.recent_jobs?.filter((job) => job.status === 'failed').slice(-1).map((job) => (
                <div key={job.job_id} className="text-[10px] text-rose-400 truncate font-mono">
                  Failed: {job.error || 'processing error'}
                </div>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1 custom-scrollbar">
            {episodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center gap-2 text-neutral-500">
                <Compass className="w-7 h-7 stroke-1 text-neutral-600" />
                <p className="text-xs">No episodes recorded yet.</p>
              </div>
            ) : (
              episodes.map((ep) => {
                const isSelected = ep.episode_index === selectedEpIdx;
                const isEditingThis = editingEpIdx === ep.episode_index;

                return (
                  <div
                    key={ep.episode_index}
                    onClick={() => setSelectedEpIdx(ep.episode_index)}
                    className={`px-2.5 py-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'bg-neutral-900 border-neutral-700 text-white shadow-sm'
                        : 'bg-neutral-950/60 border-neutral-900 hover:bg-neutral-900/60 hover:border-neutral-800 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div
                        className={`w-1 h-5 rounded-full shrink-0 transition-colors ${
                          isSelected ? 'bg-white' : 'bg-transparent'
                        }`}
                      />

                      {isEditingThis ? (
                        <form
                          onSubmit={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            saveEditingTask(ep.episode_index);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 min-w-0 flex-1 my-0.5"
                        >
                          <input
                            type="text"
                            value={editingTaskText}
                            onChange={(e) => setEditingTaskText(e.target.value)}
                            autoFocus
                            className="flex-1 bg-neutral-950 border border-neutral-600 rounded px-1.5 py-0.5 text-xs text-white outline-none focus:border-white font-medium"
                          />
                          <button
                            type="submit"
                            className="p-1 rounded bg-white text-black hover:bg-neutral-200"
                            title="Save"
                          >
                            <Check className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelEditingTask();
                            }}
                            className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white"
                            title="Cancel"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </form>
                      ) : (
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-neutral-200 shrink-0 font-mono">
                              #{ep.episode_index}
                            </span>
                            <span className="text-xs text-neutral-400 truncate">
                              {ep.task || 'demonstration'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 mt-0.5">
                            <span>{(ep.duration || 0).toFixed(1)}s</span>
                            <span>·</span>
                            <span>{ep.num_frames}f</span>
                            {ep.feasible_window?.is_trimmed && (
                              <>
                                <span>·</span>
                                <span className="text-neutral-400 font-mono text-[9px] px-1 py-0.2 rounded bg-neutral-800 border border-neutral-700">
                                  trimmed
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {!isEditingThis && (
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingTask(ep.episode_index, ep.task);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-white p-1 rounded hover:bg-neutral-800 transition-all shrink-0"
                          title="Edit Task Prompt"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteEpisode(ep.episode_index);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-rose-400 p-1 rounded hover:bg-neutral-800 transition-all shrink-0"
                          title="Delete Episode"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
