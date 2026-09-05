import React, { useRef, useEffect, useState } from 'react';
import { Video, Terminal, Cpu, CheckCircle2, Layers } from 'lucide-react';

export default function VideoPlayer({
  videoUrl,
  devVideoUrl,
  isDevView = false,
  setIsDevView,
  devTelemetry,
  isPlaying,
  currentFrameIndex = 0,
  totalFrames = 0,
  fps = 30,
  onTimeUpdate,
  showBadge = true
}) {
  const videoRef = useRef(null);
  const [videoDims, setVideoDims] = useState(null);

  const activeVideoUrl = isDevView && devVideoUrl ? devVideoUrl : videoUrl;

  // Reset dimensions and reload video cleanly on URL switch
  useEffect(() => {
    setVideoDims(null);
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.load();
    }
  }, [activeVideoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !totalFrames || totalFrames <= 0) return;

    const targetTime = Math.max(0, currentFrameIndex / (fps || 30));
    if (Number.isFinite(targetTime) && Math.abs(video.currentTime - targetTime) > 0.05) {
      video.currentTime = targetTime;
    }
  }, [currentFrameIndex, fps, totalFrames]);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video && video.videoWidth && video.videoHeight) {
      const w = video.videoWidth;
      const h = video.videoHeight;
      const ratio = (w / h).toFixed(2);
      let aspectLabel = `${w}×${h}`;
      if (Math.abs(w / h - 16 / 9) < 0.05) aspectLabel += ' (16:9)';
      else if (Math.abs(w / h - 4 / 3) < 0.05) aspectLabel += ' (4:3)';
      else if (Math.abs(w / h - 9 / 16) < 0.05) aspectLabel += ' (9:16)';
      else aspectLabel += ` (${ratio}:1)`;
      setVideoDims(aspectLabel);

      // Seek to current frame on initial metadata load if needed
      const targetTime = Math.max(0, currentFrameIndex / (fps || 30));
      if (Number.isFinite(targetTime) && targetTime > 0) {
        video.currentTime = targetTime;
      }
    }
  };

  const currTelemetry = devTelemetry?.[currentFrameIndex] || devTelemetry?.[0] || null;

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden glass-card flex items-center justify-center bg-black/95 select-none">
      {activeVideoUrl ? (
        <video
          key={activeVideoUrl}
          ref={videoRef}
          src={activeVideoUrl}
          playsInline
          muted
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
          className="w-full h-full object-contain max-w-full max-h-full transition-all"
          onTimeUpdate={() => {
            if (videoRef.current && onTimeUpdate) {
              onTimeUpdate(videoRef.current.currentTime);
            }
          }}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <Video className="w-8 h-8 stroke-1" />
          <span className="text-xs">No video recording loaded</span>
        </div>
      )}

      {/* Top Left: Stream Badge & Dev View Mode Toggle */}
      {showBadge && (
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/70 p-1 rounded-xl text-[11px] font-medium text-slate-300 flex items-center gap-2 z-20 shadow-lg">
          {devVideoUrl && setIsDevView ? (
            <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setIsDevView(false)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                  !isDevView
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Raw View
              </button>
              <button
                type="button"
                onClick={() => setIsDevView(true)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition-all ${
                  isDevView
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
                title="View ArUco Marker detection and Virtual SLAM tracking overlays"
              >
                <Terminal className="w-3 h-3" />
                <span>Dev View</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span>Camera Stream</span>
            </div>
          )}

          {videoDims && (
            <span className="text-slate-400 font-mono text-[10px] px-1 hidden sm:inline">
              {videoDims}
            </span>
          )}
        </div>
      )}

      {/* Top Right: Real-time SLAM & ArUco Telemetry Tag when in Dev View */}
      {isDevView && currTelemetry && (
        <div className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur-md border border-amber-500/40 px-2.5 py-1 rounded-xl text-[10px] font-mono text-amber-300 flex items-center gap-2 z-20 shadow-xl pointer-events-none">
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${
              currTelemetry.source === 'dual_aruco'
                ? 'bg-emerald-400'
                : currTelemetry.source === 'single_aruco'
                ? 'bg-sky-400'
                : currTelemetry.source === 'feature_pnp'
                ? 'bg-amber-400'
                : 'bg-orange-400'
            }`}
          />
          <span className="font-bold uppercase tracking-wider">
            {currTelemetry.source?.replace('_', ' ')}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">
            {currTelemetry.num_landmarks} LMs · {currTelemetry.num_features} Fts
          </span>
        </div>
      )}
    </div>
  );
}
