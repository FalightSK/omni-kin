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
  RefreshCw
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
  onTogglePlay,
  onSeekFrame
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Vision view mode: 'dev' (ArUco + SLAM overlay), 'canny' (OpenCV Canny Edge View), 'raw' (Original Video)
  const [visionMode, setVisionMode] = useState('dev');
  const [cannyThresholdLow, setCannyThresholdLow] = useState(50);
  const [cannyThresholdHigh, setCannyThresholdHigh] = useState(150);
  const [videoDims, setVideoDims] = useState(null);

  // Sync play/pause with parent timeline
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying]);

  // Sync current frame index with parent timeline
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !totalFrames || totalFrames <= 0) return;

    const targetTime = Math.max(0, currentFrameIndex / (fps || 30));
    if (Number.isFinite(targetTime) && Math.abs(video.currentTime - targetTime) > 0.04) {
      video.currentTime = targetTime;
    }
  }, [currentFrameIndex, fps, totalFrames]);

  // Draw ArUco bounding boxes, corner points, tag name badges, and 3D coordinate frame axes
  const drawBoundingBoxes = useCallback((ctx, width, height) => {
    const frameTelem = devTelemetry?.[currentFrameIndex] || devTelemetry?.[0] || null;
    if (!frameTelem) return;

    const bboxes = frameTelem.bounding_boxes || [];
    if (!bboxes.length) return;

    bboxes.forEach((box) => {
      const corners = box.corners;
      if (!corners || corners.length < 4) return;

      // 1. Thick glowing neon green bounding box
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(corners[0][0], corners[0][1]);
      for (let i = 1; i < 4; i++) {
        ctx.lineTo(corners[i][0], corners[i][1]);
      }
      ctx.closePath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#00ff66';
      ctx.shadowColor = '#00ff66';
      ctx.shadowBlur = 10;
      ctx.stroke();

      ctx.fillStyle = 'rgba(0, 255, 102, 0.12)';
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
      const labelText =
        box.id === 0
          ? 'Tag A [Origin 0,0,0]'
          : box.id === 1
          ? 'Tag B [Offset +15cm]'
          : `Tag ${box.id}`;

      ctx.save();
      ctx.font = 'bold 13px ui-monospace, monospace';
      const textWidth = ctx.measureText(labelText).width;
      const boxW = textWidth + 20;
      const boxH = 26;
      const bx = Math.max(8, pt0[0]);
      const by = Math.max(boxH + 6, pt0[1] - 10);

      ctx.fillStyle = 'rgba(10, 15, 25, 0.88)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(bx, by - boxH, boxW, boxH, 6);
      } else {
        ctx.rect(bx, by - boxH, boxW, boxH);
      }
      ctx.fill();

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = box.id === 0 ? '#00ff66' : '#ffaa00';
      ctx.stroke();

      ctx.fillStyle = box.id === 0 ? '#00ff66' : '#ffaa00';
      ctx.fillText(labelText, bx + 10, by - 8);
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

  // Client-side Sobel/Canny gradient edge processor on HTML5 canvas
  const renderClientCanny = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, width, height);

    try {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      const output = ctx.createImageData(width, height);
      const outData = output.data;

      const gray = new Uint8Array(width * height);
      for (let i = 0, j = 0; i < data.length; i += 4, j++) {
        gray[j] = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) | 0;
      }

      const tLow = cannyThresholdLow;
      const tHigh = cannyThresholdHigh;

      for (let y = 1; y < height - 1; y++) {
        const rowOffset = y * width;
        for (let x = 1; x < width - 1; x++) {
          const idx = rowOffset + x;

          const gx =
            -gray[idx - width - 1] +
            gray[idx - width + 1] -
            2 * gray[idx - 1] +
            2 * gray[idx + 1] -
            gray[idx + width - 1] +
            gray[idx + width + 1];

          const gy =
            -gray[idx - width - 1] -
            2 * gray[idx - width] -
            gray[idx - width + 1] +
            gray[idx + width - 1] +
            2 * gray[idx + width] +
            gray[idx + width + 1];

          const mag = Math.abs(gx) + Math.abs(gy);
          const pIdx = idx * 4;

          if (mag >= tHigh) {
            outData[pIdx] = 0;
            outData[pIdx + 1] = 230;
            outData[pIdx + 2] = 255;
            outData[pIdx + 3] = 255;
          } else if (mag >= tLow) {
            outData[pIdx] = 0;
            outData[pIdx + 1] = 160;
            outData[pIdx + 2] = 180;
            outData[pIdx + 3] = 200;
          } else {
            outData[pIdx] = (data[pIdx] * 0.22) | 0;
            outData[pIdx + 1] = (data[pIdx + 1] * 0.22) | 0;
            outData[pIdx + 2] = (data[pIdx + 2] * 0.22) | 0;
            outData[pIdx + 3] = 255;
          }
        }
      }

      ctx.putImageData(output, 0, 0);

      // Top Canny HUD banner
      ctx.save();
      const hudH = 44;
      ctx.fillStyle = 'rgba(12, 16, 24, 0.85)';
      ctx.fillRect(0, 0, width, hudH);
      ctx.strokeStyle = 'rgba(0, 230, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, hudH);
      ctx.lineTo(width, hudH);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(20, 22, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#00e6ff';
      ctx.fill();

      ctx.font = 'bold 12px ui-monospace, monospace';
      ctx.fillStyle = '#00e6ff';
      ctx.fillText('OPENCV CANNY EDGE DETECTION & ARUCO BOUNDING BOXES', 35, 26);

      const cannyInfo = `Frame ${currentFrameIndex + 1}/${Math.max(1, totalFrames)}  |  T1=${tLow}, T2=${tHigh}`;
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px ui-monospace, monospace';
      const cWidth = ctx.measureText(cannyInfo).width;
      ctx.fillText(cannyInfo, width - cWidth - 20, 26);
      ctx.restore();

      // Also overlay ArUco bounding boxes on Canny view
      drawBoundingBoxes(ctx, width, height);
    } catch (err) {}
  }, [cannyThresholdLow, cannyThresholdHigh, currentFrameIndex, totalFrames, drawBoundingBoxes]);

  // Trigger rendering when mode or frame changes
  useEffect(() => {
    if (visionMode === 'canny') {
      renderClientCanny();
    } else if (visionMode === 'dev') {
      renderDevOverlays();
    } else {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [visionMode, currentFrameIndex, renderClientCanny, renderDevOverlays]);

  // Animation loop during playback
  useEffect(() => {
    if (!isPlaying) return;

    let animId;
    const loop = () => {
      if (visionMode === 'canny') {
        renderClientCanny();
      } else if (visionMode === 'dev') {
        renderDevOverlays();
      }
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, visionMode, renderClientCanny, renderDevOverlays]);

  // Handle video metadata
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video && video.videoWidth && video.videoHeight) {
      setVideoDims(`${video.videoWidth}×${video.videoHeight}`);
      if (visionMode === 'canny') {
        renderClientCanny();
      } else if (visionMode === 'dev') {
        renderDevOverlays();
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

  return (
    <div
      ref={containerRef}
      className="bg-slate-950/95 p-4 rounded-2xl border border-indigo-500/30 text-left flex flex-col gap-3 shadow-2xl overflow-hidden transition-all"
    >
      {/* 1. Header Toolbar: Mode Selector Tabs & Diagnostic Badges */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
            <Scan className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-100">
                OpenCV Visual Inspection Monitor
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wide border ${
                  isArucoActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : numLandmarks > 0
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {isArucoActive
                  ? currTelemetry?.is_dual
                    ? '🟢 DUAL ARUCO LOCKED'
                    : '🟢 ARUCO TAG LOCKED'
                  : numLandmarks > 0
                  ? '🟡 VIRTUAL SLAM ANCHOR'
                  : '⚪ SCANNING'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live inspection of ArUco bounding boxes, 3D coordinate axes, and OpenCV Canny feature extraction
            </p>
          </div>
        </div>

        {/* Vision Mode Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setVisionMode('dev')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
              visionMode === 'dev'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Real Video with ArUco Bounding Boxes, 3D Axes, and Feature Trails"
          >
            <Box className="w-3.5 h-3.5 text-emerald-400" />
            <span>ArUco & 3D Bounding Box</span>
          </button>

          <button
            onClick={() => setVisionMode('canny')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
              visionMode === 'canny'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="OpenCV Canny Edge Detection view highlighting contours and table boundaries"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>OpenCV Canny View</span>
          </button>

          <button
            onClick={() => setVisionMode('raw')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
              visionMode === 'raw'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Clean original camera feed without overlays"
          >
            <Video className="w-3.5 h-3.5 text-slate-400" />
            <span>Raw Video</span>
          </button>
        </div>
      </div>

      {/* 2. Video Stage: Displaying Real Video with OpenCV Augmentations */}
      <div className="relative w-full aspect-video max-h-[520px] bg-black rounded-xl overflow-hidden border border-slate-800/80 shadow-2xl flex items-center justify-center group">
        {/* Underlying Authentic Camera Video */}
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          muted
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
          onLoadedData={() => {
            if (visionMode === 'canny') renderClientCanny();
            else if (visionMode === 'dev') renderDevOverlays();
          }}
          onSeeked={() => {
            if (visionMode === 'canny') renderClientCanny();
            else if (visionMode === 'dev') renderDevOverlays();
          }}
          onTimeUpdate={() => {
            if (!isPlaying) {
              if (visionMode === 'canny') renderClientCanny();
              else if (visionMode === 'dev') renderDevOverlays();
            }
          }}
          className={`w-full h-full object-contain ${
            visionMode === 'canny' ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Real-time OpenCV / ArUco Canvas Overlay */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full object-contain pointer-events-none ${
            visionMode === 'raw' ? 'hidden' : 'block'
          }`}
        />

        {/* Top-Left Overlay Pill: Active Stream Info */}
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 text-[11px] font-mono text-slate-200 z-10">
          <span
            className={`w-2 h-2 rounded-full ${
              visionMode === 'canny'
                ? 'bg-cyan-400 animate-pulse'
                : visionMode === 'dev'
                ? 'bg-emerald-400 animate-pulse'
                : 'bg-slate-400'
            }`}
          />
          <span className="font-semibold">
            {visionMode === 'canny'
              ? 'OpenCV Canny Filter (T1=50, T2=150)'
              : visionMode === 'dev'
              ? 'OpenCV ArUco + SLAM Augmented Feed'
              : 'Clean Camera Feed'}
          </span>
          {videoDims && <span className="text-slate-400">| {videoDims}</span>}
        </div>

        {/* Top-Right Overlay Pill: Frame Navigation */}
        <div className="absolute top-3 right-3 flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 text-[11px] font-mono text-slate-300 z-10">
          <span>
            Frame {currentFrameIndex + 1}/{Math.max(1, totalFrames)}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-indigo-300">
            {((currentFrameIndex / (fps || 30)) || 0).toFixed(2)}s
          </span>
        </div>

        {/* Center Play Button Overlay on Hover/Pause */}
        {!isPlaying && onTogglePlay && (
          <button
            onClick={onTogglePlay}
            className="absolute inset-0 m-auto w-14 h-14 rounded-2xl bg-indigo-600/80 hover:bg-indigo-600 backdrop-blur-md text-white flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 z-20"
            title="Play Video"
          >
            <Play className="w-6 h-6 fill-current ml-1" />
          </button>
        )}
      </div>

      {/* 3. Live Bounding Box & Feature Extraction Diagnostic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: Tag A Bounding Box */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col gap-1.5 font-mono text-xs">
          <div className="flex items-center justify-between font-sans">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <Box className="w-3.5 h-3.5" />
              <span>Tag A Bounding Box (Origin)</span>
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                tagA ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tagA ? '🟢 Detected' : '⚪ Occluded'}
            </span>
          </div>

          <div className="text-[11px] text-slate-300 flex flex-col gap-0.5 pt-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Dimensions:</span>
              <span className="font-semibold text-emerald-300">
                {tagA ? `${tagA.width_px} × ${tagA.height_px} px` : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Box Center:</span>
              <span className="text-slate-200">
                {tagA ? `(${tagA.center[0]}, ${tagA.center[1]}) px` : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">World Origin:</span>
              <span className="text-indigo-300 font-semibold">[0.0, 0.0, 0.0] cm</span>
            </div>
          </div>
        </div>

        {/* Card 2: Tag B Bounding Box */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col gap-1.5 font-mono text-xs">
          <div className="flex items-center justify-between font-sans">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Box className="w-3.5 h-3.5" />
              <span>Tag B Bounding Box (Offset)</span>
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                tagB ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tagB ? '🟡 Detected' : '⚪ Occluded'}
            </span>
          </div>

          <div className="text-[11px] text-slate-300 flex flex-col gap-0.5 pt-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Dimensions:</span>
              <span className="font-semibold text-amber-300">
                {tagB ? `${tagB.width_px} × ${tagB.height_px} px` : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Box Center:</span>
              <span className="text-slate-200">
                {tagB ? `(${tagB.center[0]}, ${tagB.center[1]}) px` : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Board Baseline:</span>
              <span className="text-slate-200 font-semibold">+15.0 cm (+X)</span>
            </div>
          </div>
        </div>

        {/* Card 3: OpenCV Feature Extraction & Canny Status */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col gap-1.5 font-mono text-xs">
          <div className="flex items-center justify-between font-sans">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Feature Extraction & Canny</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-cyan-500/20 text-cyan-300">
              Active Filter
            </span>
          </div>

          <div className="text-[11px] text-slate-300 flex flex-col gap-0.5 pt-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Tracked Features:</span>
              <span className="font-semibold text-cyan-300">{numFeatures} Keypoints</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">3D Room Landmarks:</span>
              <span className="font-semibold text-amber-300">{numLandmarks} Points</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Canny Thresholds:</span>
              <span className="text-slate-200">
                T1={cannyThresholdLow}, T2={cannyThresholdHigh}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
