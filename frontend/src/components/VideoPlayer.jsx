import React, { useRef, useEffect, useState } from 'react';
import { Video, Terminal, Cpu, CheckCircle2, Layers } from 'lucide-react';

export default function VideoPlayer({
  videoUrl,
  devVideoUrl,
  isDevView = false,
  setIsDevView,
  devTelemetry,
  isPlaying,
  isApproachPhase = false,
  currentFrameIndex = 0,
  totalFrames = 0,
  fps = 30,
  onTimeUpdate,
  onEnded,
  showBadge = true
}) {
  const videoRef = useRef(null);
  const pendingSeekRef = useRef(null);
  const [videoDims, setVideoDims] = useState(null);
  const [videoError, setVideoError] = useState(false);

  // Reset error when source URLs or dev view toggles
  useEffect(() => {
    setVideoError(false);
  }, [videoUrl, devVideoUrl, isDevView]);

  // Fallback to raw videoUrl if devVideoUrl fails to load
  const activeVideoUrl = isDevView && devVideoUrl && !videoError ? devVideoUrl : videoUrl;

  // Handle Play / Pause & Approach Phase freezing
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

  // Frame-accurate seeking and drift correction
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
      // When paused, seek accurately. When playing, only re-sync on noticeable drift (>0.35s)
      if (!isPlaying && diff > 0.03) {
        video.currentTime = targetTime;
      } else if (isPlaying && diff > 0.35) {
        video.currentTime = targetTime;
      }
    } else {
      pendingSeekRef.current = targetTime;
    }
  }, [currentFrameIndex, fps, totalFrames, isPlaying, isApproachPhase]);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.videoWidth && video.videoHeight) {
      const w = video.videoWidth;
      const h = video.videoHeight;
      const ratio = (w / h).toFixed(2);
      let aspectLabel = `${w}×${h}`;
      if (Math.abs(w / h - 16 / 9) < 0.05) aspectLabel += ' (16:9)';
      else if (Math.abs(w / h - 4 / 3) < 0.05) aspectLabel += ' (4:3)';
      else if (Math.abs(w / h - 9 / 16) < 0.05) aspectLabel += ' (9:16)';
      else aspectLabel += ` (${ratio}:1)`;
      setVideoDims(aspectLabel);
    }

    // Apply any pending seeks once metadata is available
    if (pendingSeekRef.current !== null) {
      video.currentTime = pendingSeekRef.current;
      pendingSeekRef.current = null;
    } else if (!isApproachPhase && currentFrameIndex > 0) {
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
          onError={() => {
            console.warn('Video failed to load for:', activeVideoUrl);
            setVideoError(true);
          }}
          onEnded={() => {
            if (onEnded) onEnded();
          }}
          className="w-full h-full object-contain max-w-full max-h-full transition-all"
          onTimeUpdate={() => {
            if (videoRef.current && onTimeUpdate) {
              onTimeUpdate(videoRef.current.currentTime);
            }
          }}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-slate-500 py-12">
          <Video className="w-8 h-8 stroke-1 text-slate-600" />
          <span className="text-xs font-medium">No video recording loaded</span>
        </div>
      )}

      {/* Top Left: Stream Badge & Dev View Mode Toggle */}
      {showBadge && (
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-2 py-1 rounded-xl text-[11px] font-medium text-slate-300 flex items-center gap-2 z-20 shadow-lg">
          {devVideoUrl && setIsDevView ? (
            <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800/80">
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

      {/* Top Right: Real-time Anchor Status Badge when in Dev View */}
      {isDevView && currTelemetry && (
        <div className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur-md border border-amber-500/30 px-3 py-1.5 rounded-xl text-[11px] font-sans text-amber-300 flex items-center gap-2 z-20 shadow-xl pointer-events-none">
          <span
            className={`w-2.5 h-2.5 rounded-full animate-pulse ${
              currTelemetry.source === 'dual_aruco' || currTelemetry.source === 'single_aruco'
                ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                : currTelemetry.source === 'feature_pnp' || currTelemetry.source === 'feature_vo'
                ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                : 'bg-orange-400 shadow-sm shadow-orange-400/50'
            }`}
          />
          <span className="font-semibold text-slate-100">
            {currTelemetry.source === 'dual_aruco'
              ? '🏷️ ArUco Dual Board (Table Locked)'
              : currTelemetry.source === 'single_aruco'
              ? '🏷️ ArUco Tag (Table Locked)'
              : currTelemetry.source === 'feature_pnp' || currTelemetry.source === 'feature_vo'
              ? '🌐 Virtual SLAM (Scene Anchors Active)'
              : '⚡ Inertial Continuity'}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 font-mono text-[10px]">
            {currTelemetry.tags_detected?.length > 0 ? 'Tag Visible' : 'Tag Hidden (Anchored to Scene)'}
          </span>
        </div>
      )}
    </div>
  );
}
