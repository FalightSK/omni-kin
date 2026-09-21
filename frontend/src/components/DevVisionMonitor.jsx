import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Video,
  Layers,
  Activity,
  Eye,
  Sparkles,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Scan,
  Cpu,
  CheckCircle2,
  Box,
  Sliders,
  RefreshCw,
  Printer
} from 'lucide-react';

export default function DevVisionMonitor({
  videoUrl,
  devVideoUrl,
  cannyVideoUrl,
  devTelemetry = [],
  currentFrameIndex = 0,
  totalFrames = 0,
  fps = 30,
  isPlaying = false,
  isApproachPhase = false,
  onTogglePlay,
  onSeekFrame,
  onEnded,
  onOpenEkfModal
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const pendingSeekRef = useRef(null);

  // Vision view mode: 'dev' (ArUco + SLAM overlay), 'canny' (OpenCV Canny Edge View), 'raw' (Original Video)
  const [visionMode, setVisionMode] = useState('dev');
  const [useLiveOverlay, setUseLiveOverlay] = useState(false);
  const [cannyThresholdLow, setCannyThresholdLow] = useState(50);
  const [cannyThresholdHigh, setCannyThresholdHigh] = useState(150);
  const [videoDims, setVideoDims] = useState(null);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    setVideoError(false);
  }, [visionMode, devVideoUrl, cannyVideoUrl, useLiveOverlay]);

  let currentVideoSrc = videoUrl;
  let usePreRenderedDev = false;
  let usePreRenderedCanny = false;

  if (visionMode === 'dev' && devVideoUrl && !videoError && !useLiveOverlay) {
    currentVideoSrc = devVideoUrl;
    usePreRenderedDev = true;
  } else if (visionMode === 'canny' && cannyVideoUrl && !videoError) {
    currentVideoSrc = cannyVideoUrl;
    usePreRenderedCanny = true;
  }

  // Sync play/pause with parent timeline & Approach Phase
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isApproachPhase) {
      video.pause();
      if (video.readyState >= 1) {
        video.currentTime = 0;
      } else {
        pendingSeekRef.current = 0;
      }
      return;
    }

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, isApproachPhase]);

  // Sync current frame index with parent timeline
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !totalFrames || totalFrames <= 0) return;

    if (isApproachPhase) {
      if (video.readyState >= 1) {
        video.currentTime = 0;
      } else {
        pendingSeekRef.current = 0;
      }
      return;
    }

    const targetTime = Math.max(0, currentFrameIndex / (fps || 30));
    if (!Number.isFinite(targetTime)) return;

    if (video.readyState >= 1) {
      const diff = Math.abs(video.currentTime - targetTime);
      if (!isPlaying && diff > 0.03) {
        video.currentTime = targetTime;
      } else if (isPlaying && diff > 0.35) {
        video.currentTime = targetTime;
      }
    } else {
      pendingSeekRef.current = targetTime;
    }
  }, [currentFrameIndex, fps, totalFrames, isPlaying, isApproachPhase]);

  // Draw ArUco bounding boxes, corner points, tag name badges, and 3D coordinate frame axes
  const drawBoundingBoxes = useCallback((ctx, width, height) => {
    const frameTelem = devTelemetry?.[currentFrameIndex] || devTelemetry?.[0] || null;
    if (!frameTelem) return;

    const bboxes = frameTelem.bounding_boxes || [];
    if (!bboxes.length) return;

    bboxes.forEach((box) => {
      const corners = box.corners;
      if (!corners || corners.length < 4) return;

      // Determine tag color and label
      let boxColor = '#00ff66';
      let fillColor = 'rgba(0, 255, 102, 0.12)';
      let labelText = `Tag ${box.id}`;

      if (box.id === 0) {
        boxColor = '#00ff66';
        fillColor = 'rgba(0, 255, 102, 0.12)';
        labelText = 'Tag A [Origin 0,0,0]';
      } else if (box.id === 1) {
        boxColor = '#ffaa00';
        fillColor = 'rgba(255, 170, 0, 0.12)';
        labelText = 'Tag B [Offset +15cm]';
      } else if (box.id === 2) {
        boxColor = '#d946ef';
        fillColor = 'rgba(217, 70, 239, 0.12)';
        labelText = 'Tag 2 [Jaw A 22mm]';
      } else if (box.id === 3) {
        boxColor = '#06b6d4';
        fillColor = 'rgba(6, 182, 212, 0.12)';
        labelText = 'Tag 3 [Jaw B 22mm]';
      } else {
        boxColor = '#94a3b8';
        fillColor = 'rgba(148, 163, 184, 0.12)';
      }

      // 1. Glowing bounding box
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(corners[0][0], corners[0][1]);
      for (let i = 1; i < 4; i++) {
        ctx.lineTo(corners[i][0], corners[i][1]);
      }
      ctx.closePath();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = boxColor;
      ctx.shadowColor = boxColor;
      ctx.shadowBlur = 8;
      ctx.stroke();

      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.restore();

      // 2. Corner Points: Red dot for origin corner (Corner 0), yellow dots for Corners 1, 2, 3
      corners.forEach((pt, idx) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(pt[0], pt[1], idx === 0 ? 6.5 : 5, 0, Math.PI * 2);
        if (idx === 0) {
          ctx.fillStyle = '#ff2244';
          ctx.shadowColor = '#ff2244';
          ctx.shadowBlur = 8;
        } else {
          ctx.fillStyle = '#ffdd00';
          ctx.shadowColor = '#ffdd00';
          ctx.shadowBlur = 4;
        }
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.restore();
      });

      // 3. Tag Label Banner Pill
      const pt0 = corners[0];
      ctx.save();
      ctx.font = 'bold 12px ui-monospace, monospace';
      const textWidth = ctx.measureText(labelText).width;
      const boxW = textWidth + 18;
      const boxH = 24;
      const bx = Math.max(8, pt0[0]);
      const by = Math.max(boxH + 6, pt0[1] - 8);

      ctx.fillStyle = 'rgba(10, 15, 25, 0.88)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(bx, by - boxH, boxW, boxH, 6);
      } else {
        ctx.rect(bx, by - boxH, boxW, boxH);
      }
      ctx.fill();

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = boxColor;
      ctx.stroke();

      ctx.fillStyle = boxColor;
      ctx.fillText(labelText, bx + 9, by - 7);
      ctx.restore();

      // 4. 3D Coordinate Frame Axes standing on Tag A Origin
      if (box.id === 0) {
        const c0 = corners[0];
        const c1 = corners[1];
        const c3 = corners[3];

        const ex = [c1[0] - c0[0], c1[1] - c0[1]];
        const ey = [c3[0] - c0[0], c3[1] - c0[1]];
        const lenX = Math.hypot(ex[0], ex[1]) || 1;
        const lenY = Math.hypot(ey[0], ey[1]) || 1;

        const axisLen = Math.max(70, lenX * 0.95);
        const ux = [(ex[0] / lenX) * axisLen, (ex[1] / lenX) * axisLen];
        const uy = [(ey[0] / lenY) * axisLen, (ey[1] / lenY) * axisLen];
        const uz = [0, -axisLen * 0.9];

        const oX = c0[0];
        const oY = c0[1];

        const drawAxisArrow = (tx, ty, color, label) => {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(oX, oY);
          ctx.lineTo(oX + tx, oY + ty);
          ctx.strokeStyle = color;
          ctx.lineWidth = 3.5;
          ctx.shadowColor = color;
          ctx.shadowBlur = 6;
          ctx.stroke();

          const angle = Math.atan2(ty, tx);
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(oX + tx, oY + ty);
          ctx.lineTo(
            oX + tx - 12 * Math.cos(angle - Math.PI / 6),
            oY + ty - 12 * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            oX + tx - 12 * Math.cos(angle + Math.PI / 6),
            oY + ty - 12 * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fill();

          ctx.font = 'bold 12px sans-serif';
          ctx.fillStyle = color;
          ctx.fillText(label, oX + tx + 6, oY + ty + 4);
          ctx.restore();
        };

        drawAxisArrow(ux[0], ux[1], '#ff3b30', '+X');
        drawAxisArrow(uy[0], uy[1], '#34c759', '+Y');
        drawAxisArrow(uz[0], uz[1], '#00b0ff', '+Z (Normal)');
      }
    });

    // 5. Connect Gripper Tag 2 & 3 with span line and real-time distance badge
    const b2 = bboxes.find((b) => b.id === 2);
    const b3 = bboxes.find((b) => b.id === 3);
    if (b2 && b3 && b2.center && b3.center) {
      const c2 = b2.center;
      const c3 = b3.center;
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([6, 4]);
      ctx.moveTo(c2[0], c2[1]);
      ctx.lineTo(c3[0], c3[1]);
      ctx.strokeStyle = '#e879f9';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      const midX = (c2[0] + c3[0]) / 2;
      const midY = (c2[1] + c3[1]) / 2 - 12;
      const grip = frameTelem.gripper;
      const distStr = grip?.dist_mm ? `${grip.dist_mm}mm` : 'Detected';
      const valStr = grip?.value !== undefined ? `${grip.value.toFixed(0)}%` : '100%';
      const badgeText = `Gripper: ${valStr} (${distStr})`;

      ctx.font = 'bold 12px ui-monospace, monospace';
      const bWidth = ctx.measureText(badgeText).width;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.fillRect(midX - bWidth / 2 - 8, midY - 14, bWidth + 16, 22);
      ctx.strokeStyle = '#e879f9';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(midX - bWidth / 2 - 8, midY - 14, bWidth + 16, 22);
      ctx.fillStyle = '#f0abfc';
      ctx.fillText(badgeText, midX - bWidth / 2, midY + 1);
      ctx.restore();
    }
  }, [devTelemetry, currentFrameIndex]);

  // Dedicated renderer for Dev View overlays (HUD banner + bounding boxes over real video)
  const renderDevOverlays = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    if (visionMode !== 'dev') return;

    // Top HUD Banner
    const frameTelem = devTelemetry?.[currentFrameIndex] || devTelemetry?.[0] || null;
    const isDual = frameTelem?.is_dual;
    const isAruco = frameTelem?.source === 'dual_aruco' || frameTelem?.source === 'single_aruco';
    const statusColor = isDual ? '#00ff88' : isAruco ? '#ffcc00' : '#00d0ff';
    const statusLabel = isDual
      ? 'ANCHOR: DUAL ARUCO BOARD (TABLE LOCKED)'
      : isAruco
      ? 'ANCHOR: ARUCO TAG (TABLE LOCKED)'
      : 'ANCHOR: 3D SCENE FEATURES (TAG OCCLUDED)';

    ctx.save();
    const hudH = 50;
    ctx.fillStyle = 'rgba(12, 16, 26, 0.85)';
    ctx.fillRect(0, 0, width, hudH);
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, hudH);
    ctx.lineTo(width, hudH);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(22, 25, 6, 0, Math.PI * 2);
    ctx.fillStyle = statusColor;
    ctx.shadowColor = statusColor;
    ctx.shadowBlur = 8;
    ctx.fill();

    ctx.font = 'bold 13px ui-monospace, monospace';
    ctx.fillStyle = statusColor;
    ctx.fillText(`[${statusLabel}]`, 38, 30);

    const timeSec = (currentFrameIndex / (fps || 30)).toFixed(2);
    const frameText = `Frame ${currentFrameIndex + 1}/${Math.max(1, totalFrames)}  (${timeSec}s)  |  ${fps} FPS`;
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '12px ui-monospace, monospace';
    const fWidth = ctx.measureText(frameText).width;
    ctx.fillText(frameText, width - fWidth - 20, 30);
    ctx.restore();

    // Draw ArUco Bounding Boxes, corner points, and 3D axes
    drawBoundingBoxes(ctx, width, height);
  }, [visionMode, devTelemetry, currentFrameIndex, totalFrames, fps, drawBoundingBoxes]);

  // Trigger rendering when mode or frame changes (only for non-prerendered fallback)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (visionMode === 'dev' && !usePreRenderedDev) {
      renderDevOverlays();
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [visionMode, usePreRenderedDev, currentFrameIndex, renderDevOverlays]);

  // Handle video metadata
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video && video.videoWidth && video.videoHeight) {
      setVideoDims(`${video.videoWidth}×${video.videoHeight}`);
      if (visionMode === 'dev' && !usePreRenderedDev) {
        renderDevOverlays();
      }
    }
    if (pendingSeekRef.current !== null && video) {
      video.currentTime = pendingSeekRef.current;
      pendingSeekRef.current = null;
    } else if (!isApproachPhase && currentFrameIndex > 0 && video) {
      const targetTime = Math.max(0, currentFrameIndex / (fps || 30));
      if (Number.isFinite(targetTime) && targetTime > 0) {
        video.currentTime = targetTime;
      }
    }
  };

  // Extract active frame telemetry
  const currTelemetry = devTelemetry?.[currentFrameIndex] || devTelemetry?.[0] || null;
  const bboxes = currTelemetry?.bounding_boxes || [];
  const numFeatures = currTelemetry?.num_features ?? 0;
  const numLandmarks = currTelemetry?.num_landmarks ?? 0;
  const isArucoActive = currTelemetry?.source === 'dual_aruco' || currTelemetry?.source === 'single_aruco';
  const tagA = bboxes.find((b) => b.id === 0);
  const tagB = bboxes.find((b) => b.id === 1);
  const tag2 = bboxes.find((b) => b.id === 2);
  const tag3 = bboxes.find((b) => b.id === 3);
  const isGripperActive = Boolean(currTelemetry?.gripper?.detected || (tag2 && tag3));

  return (
    <div
      ref={containerRef}
      className="bg-[#0a0a0a] p-4 rounded-xl border border-neutral-800 text-left flex flex-col gap-3 shadow-xl overflow-hidden transition-all"
    >
      {/* 1. Header Toolbar: Mode Selector Tabs & Diagnostic Badges */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-neutral-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300">
            <Scan className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-100 font-mono">
                OpenCV Visual Inspection Monitor
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide border border-neutral-800 bg-neutral-900 text-neutral-300 flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isArucoActive
                      ? 'bg-emerald-400'
                      : numLandmarks > 0
                      ? 'bg-amber-400'
                      : 'bg-neutral-500'
                  }`}
                />
                <span>
                  {isArucoActive
                    ? currTelemetry?.is_dual
                      ? 'DUAL ARUCO LOCKED'
                      : 'ARUCO TAG LOCKED'
                    : numLandmarks > 0
                    ? 'VIRTUAL SLAM ANCHOR'
                    : 'SCANNING'}
                </span>
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5 font-normal">
              Live inspection of ArUco bounding boxes, 3D coordinate axes, and OpenCV Canny feature extraction
            </p>
          </div>
        </div>

        {/* Vision Mode Switcher Tabs */}
        <div className="flex items-center gap-1 bg-[#050505] p-0.5 rounded-lg border border-neutral-800 text-xs">
          <button
            onClick={() => setVisionMode('dev')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-all ${
              visionMode === 'dev'
                ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
            title="Real Video with ArUco Bounding Boxes, 3D Axes, and Feature Trails"
          >
            <Box className="w-3.5 h-3.5 text-neutral-400" />
            <span>ArUco & 3D Bounding Box</span>
          </button>

          <button
            onClick={() => setVisionMode('canny')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-all ${
              visionMode === 'canny'
                ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
            title="OpenCV Canny Edge Detection view highlighting contours and table boundaries"
          >
            <Activity className="w-3.5 h-3.5 text-neutral-400" />
            <span>OpenCV Canny View</span>
          </button>

          <button
            onClick={() => setVisionMode('raw')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-all ${
              visionMode === 'raw'
                ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
            title="Clean original camera feed without overlays"
          >
            <Video className="w-3.5 h-3.5 text-neutral-400" />
            <span>Raw Video</span>
          </button>
        </div>

        {/* EKF Tuning Dev Option */}
        {onOpenEkfModal && (
          <button
            onClick={onOpenEkfModal}
            className="px-3 py-1.5 rounded-lg bg-[#050505] hover:bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
            title="Open Extended Kalman Filter (EKF) Parameters & Covariance Tuning"
          >
            <Sliders className="w-3.5 h-3.5 text-neutral-400" />
            <span>EKF Tuning</span>
          </button>
        )}

        {/* Print Gripper Markers Button */}
        <a
          href="/api/marker/print_gripper"
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1.5 rounded-lg bg-[#050505] hover:bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
          title="Print 22mm ArUco markers for gripper jaws (Tag 2 & 3)"
        >
          <Printer className="w-3.5 h-3.5 text-neutral-400" />
          <span>Print 22mm Markers</span>
        </a>

        {/* Live GPU vs Pre-Rendered MP4 Switcher for Dev View */}
        {visionMode === 'dev' && (
          <div className="flex items-center gap-1 bg-[#050505] p-0.5 rounded-lg border border-neutral-800 text-[11px]">
            <button
              onClick={() => setUseLiveOverlay(false)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                !useLiveOverlay
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Pre-rendered MP4 video with baked-in OpenCV annotations"
            >
              🎞️ OpenCV MP4
            </button>
            <button
              onClick={() => setUseLiveOverlay(true)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                useLiveOverlay
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Smooth native camera video with real-time GPU canvas overlays"
            >
              ⚡ GPU Canvas
            </button>
          </div>
        )}
      </div>

      {/* 2. Video Stage: Displaying Real Video with OpenCV Augmentations */}
      <div className="relative w-full aspect-video max-h-[520px] bg-black rounded-xl overflow-hidden border border-neutral-800 shadow-xl flex items-center justify-center group">
        {/* Underlying Authentic Camera or Pre-Rendered Dev Video */}
        <video
          key={currentVideoSrc}
          ref={videoRef}
          src={currentVideoSrc}
          playsInline
          muted
          preload="auto"
          onError={(e) => {
            console.warn("Dev video decode error, falling back to real-time canvas:", currentVideoSrc, e);
            setVideoError(true);
          }}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => {
            if (onEnded) onEnded();
          }}
          onLoadedData={() => {
            if (visionMode === 'dev' && !usePreRenderedDev) renderDevOverlays();
          }}
          onSeeked={() => {
            if (visionMode === 'dev' && !usePreRenderedDev) renderDevOverlays();
          }}
          className="w-full h-full object-contain opacity-100"
        />

        {/* Real-time OpenCV / ArUco Canvas Overlay (active when not using pre-rendered video) */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full object-contain pointer-events-none ${
            usePreRenderedDev || usePreRenderedCanny || visionMode === 'raw' ? 'hidden' : 'block'
          }`}
        />

        {/* Top-Left Overlay Pill: Active Stream Info */}
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-neutral-800 text-[11px] font-mono text-neutral-200 z-10">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              visionMode === 'canny'
                ? 'bg-neutral-300 animate-pulse'
                : visionMode === 'dev'
                ? 'bg-emerald-400 animate-pulse'
                : 'bg-neutral-400'
            }`}
          />
          <span className="font-semibold">
            {visionMode === 'canny'
              ? 'OpenCV Canny Filter (T1=50, T2=150)'
              : visionMode === 'dev'
              ? 'OpenCV ArUco + SLAM Augmented Feed'
              : 'Clean Camera Feed'}
          </span>
          {videoDims && <span className="text-neutral-500">| {videoDims}</span>}
        </div>

        {/* Top-Right Overlay Pill: Frame Navigation */}
        <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-neutral-800 text-[11px] font-mono text-neutral-300 z-10">
          <span>
            Frame {currentFrameIndex + 1}/{Math.max(1, totalFrames)}
          </span>
          <span className="text-neutral-600">|</span>
          <span className="text-white font-semibold">
            {((currentFrameIndex / (fps || 30)) || 0).toFixed(2)}s
          </span>
        </div>

        {/* Center Play Button Overlay on Hover/Pause */}
        {!isPlaying && onTogglePlay && (
          <button
            onClick={onTogglePlay}
            className="absolute inset-0 m-auto w-12 h-12 rounded-xl bg-white hover:bg-neutral-200 text-black flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 z-20"
            title="Play Video"
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>
        )}
      </div>

      {/* 3. Live Bounding Box & Feature Extraction Diagnostic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Tag A Bounding Box */}
        <div className="p-3 rounded-xl bg-[#050505] border border-neutral-800 flex flex-col gap-1.5 font-mono text-xs">
          <div className="flex items-center justify-between font-sans">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-200 flex items-center gap-1 font-mono">
              <Box className="w-3.5 h-3.5 text-neutral-400" />
              <span>Tag A (Origin 10cm)</span>
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                tagA
                  ? 'bg-neutral-900 text-neutral-200 border-neutral-700'
                  : 'bg-neutral-950 text-neutral-500 border-neutral-800'
              }`}
            >
              {tagA ? '● Detected' : '○ Occluded'}
            </span>
          </div>

          <div className="text-[11px] text-neutral-300 flex flex-col gap-0.5 pt-1">
            <div className="flex justify-between">
              <span className="text-neutral-500">Dimensions:</span>
              <span className="font-semibold text-white">
                {tagA ? `${tagA.width_px} × ${tagA.height_px} px` : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Box Center:</span>
              <span className="text-neutral-300">
                {tagA ? `(${tagA.center[0]}, ${tagA.center[1]}) px` : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">World Origin:</span>
              <span className="text-neutral-200 font-semibold">[0.0, 0.0, 0.0] cm</span>
            </div>
          </div>
        </div>

        {/* Card 2: Tag B Bounding Box */}
        <div className="p-3 rounded-xl bg-[#050505] border border-neutral-800 flex flex-col gap-1.5 font-mono text-xs">
          <div className="flex items-center justify-between font-sans">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-200 flex items-center gap-1 font-mono">
              <Box className="w-3.5 h-3.5 text-neutral-400" />
              <span>Tag B (Offset 5cm)</span>
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                tagB
                  ? 'bg-neutral-900 text-neutral-200 border-neutral-700'
                  : 'bg-neutral-950 text-neutral-500 border-neutral-800'
              }`}
            >
              {tagB ? '● Detected' : '○ Occluded'}
            </span>
          </div>

          <div className="text-[11px] text-neutral-300 flex flex-col gap-0.5 pt-1">
            <div className="flex justify-between">
              <span className="text-neutral-500">Dimensions:</span>
              <span className="font-semibold text-white">
                {tagB ? `${tagB.width_px} × ${tagB.height_px} px` : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Box Center:</span>
              <span className="text-neutral-300">
                {tagB ? `(${tagB.center[0]}, ${tagB.center[1]}) px` : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Board Baseline:</span>
              <span className="text-neutral-200 font-semibold">+15.0 cm (+X)</span>
            </div>
          </div>
        </div>

        {/* Card 3: Gripper Jaw Markers (Tag 2 & 3 - 22mm) */}
        <div className="p-3 rounded-xl bg-[#050505] border border-neutral-800 flex flex-col gap-1.5 font-mono text-xs">
          <div className="flex items-center justify-between font-sans">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-200 flex items-center gap-1 font-mono">
              <Box className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Gripper (Tag 2 & 3 · 22mm)</span>
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                isGripperActive
                  ? 'bg-fuchsia-950/60 text-fuchsia-300 border-fuchsia-800/60'
                  : 'bg-neutral-950 text-neutral-500 border-neutral-800'
              }`}
            >
              {isGripperActive ? '● Tracking' : '○ Default Open'}
            </span>
          </div>

          <div className="text-[11px] text-neutral-300 flex flex-col gap-0.5 pt-1">
            <div className="flex justify-between">
              <span className="text-neutral-500">Jaw Distance:</span>
              <span className="font-semibold text-white">
                {currTelemetry?.gripper?.dist_mm ? `${currTelemetry.gripper.dist_mm} mm` : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Gripper State:</span>
              <span className="text-fuchsia-300 font-semibold">
                {currTelemetry?.gripper?.value !== undefined
                  ? `${currTelemetry.gripper.value.toFixed(0)}% (${currTelemetry.gripper.value > 50 ? 'Open' : 'Closed'})`
                  : '100% (Open)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Jaw Markers:</span>
              <span className="text-neutral-400">
                {tag2 && tag3 ? 'Tag 2 + Tag 3' : tag2 ? 'Tag 2 only' : tag3 ? 'Tag 3 only' : 'Not in view'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: OpenCV Feature Extraction & Canny Status */}
        <div className="p-3 rounded-xl bg-[#050505] border border-neutral-800 flex flex-col gap-1.5 font-mono text-xs">
          <div className="flex items-center justify-between font-sans">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-200 flex items-center gap-1 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
              <span>Feature Extraction & Canny</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-neutral-900 text-neutral-300 border border-neutral-800">
              Active Filter
            </span>
          </div>

          <div className="text-[11px] text-neutral-300 flex flex-col gap-0.5 pt-1">
            <div className="flex justify-between">
              <span className="text-neutral-500">Tracked Features:</span>
              <span className="font-semibold text-white">{numFeatures} Keypoints</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">3D Landmarks:</span>
              <span className="font-semibold text-white">{numLandmarks} Points</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Canny Thresholds:</span>
              <span className="text-neutral-300">
                T1={cannyThresholdLow}, T2={cannyThresholdHigh}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
