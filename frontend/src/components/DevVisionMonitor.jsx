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

  // Determine active video source URL based on selected mode
  let activeSrc = videoUrl;
  if (visionMode === 'canny' && cannyVideoUrl) {
    activeSrc = cannyVideoUrl;
  } else if (visionMode === 'dev' && devVideoUrl) {
    activeSrc = devVideoUrl;
  }

  // Reload video element cleanly on URL changes
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const prevTime = video.currentTime;
      video.load();
      video.currentTime = prevTime;
    }
  }, [activeSrc]);

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

  // Client-side Sobel/Canny gradient edge processor on HTML5 canvas (when canny mode is on)
  const renderClientCanny = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

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

      // 1. Grayscale buffer
      const gray = new Uint8Array(width * height);
      for (let i = 0, j = 0; i < data.length; i += 4, j++) {
        gray[j] = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) | 0;
      }

      // 2. Sobel gradient convolution (approximates Canny gradient magnitude)
      const tLow = cannyThresholdLow;
      const tHigh = cannyThresholdHigh;

      for (let y = 1; y < height - 1; y++) {
        const rowOffset = y * width;
        for (let x = 1; x < width - 1; x++) {
          const idx = rowOffset + x;

          // Horizontal Sobel Gx
          const gx =
            -gray[idx - width - 1] +
            gray[idx - width + 1] -
            2 * gray[idx - 1] +
            2 * gray[idx + 1] -
            gray[idx + width - 1] +
            gray[idx + width + 1];

          // Vertical Sobel Gy
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
            // Strong edge -> Vibrant Cyan (#00e6ff)
            outData[pIdx] = 0;
            outData[pIdx + 1] = 230;
            outData[pIdx + 2] = 255;
            outData[pIdx + 3] = 255;
          } else if (mag >= tLow) {
            // Weak edge -> Soft Teal
            outData[pIdx] = 0;
            outData[pIdx + 1] = 160;
            outData[pIdx + 2] = 180;
            outData[pIdx + 3] = 200;
          } else {
            // Background: dimmed real video pixel (25% opacity)
            outData[pIdx] = (data[pIdx] * 0.22) | 0;
            outData[pIdx + 1] = (data[pIdx + 1] * 0.22) | 0;
            outData[pIdx + 2] = (data[pIdx + 2] * 0.22) | 0;
            outData[pIdx + 3] = 255;
          }
        }
      }

      ctx.putImageData(output, 0, 0);
    } catch (err) {
      // In case of cross-origin or canvas read errors, fallback gracefully
    }
  }, [cannyThresholdLow, cannyThresholdHigh]);

  // Animation loop for client-side canny filter when playing
  useEffect(() => {
    if (visionMode !== 'canny' || cannyVideoUrl) return;

    let animId;
    const loop = () => {
      renderClientCanny();
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [visionMode, cannyVideoUrl, renderClientCanny]);

  // Handle video metadata
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video && video.videoWidth && video.videoHeight) {
      setVideoDims(`${video.videoWidth}×${video.videoHeight}`);
      if (visionMode === 'canny' && !cannyVideoUrl) {
        renderClientCanny();
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
        {/* Underlying Video Element */}
        <video
          key={activeSrc}
          ref={videoRef}
          src={activeSrc}
          playsInline
          muted
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
          onSeeked={() => {
            if (visionMode === 'canny' && !cannyVideoUrl) {
              renderClientCanny();
            }
          }}
          className={`w-full h-full object-contain ${
            visionMode === 'canny' && !cannyVideoUrl ? 'hidden' : 'block'
          }`}
        />

        {/* Client-Side Canny Canvas Fallback (Used if pre-rendered canny mp4 is not yet generated) */}
        {visionMode === 'canny' && !cannyVideoUrl && (
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain pointer-events-none"
          />
        )}

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
