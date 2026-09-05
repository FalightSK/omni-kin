import React, { useRef, useEffect, useState } from 'react';
import { Video } from 'lucide-react';

export default function VideoPlayer({
  videoUrl,
  isPlaying,
  currentFrameIndex,
  totalFrames,
  fps = 30,
  onTimeUpdate
}) {
  const videoRef = useRef(null);
  const [videoDims, setVideoDims] = useState(null);

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

    const targetTime = currentFrameIndex / fps;
    if (Math.abs(video.currentTime - targetTime) > 0.15) {
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
    }
  };

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden glass-card flex items-center justify-center bg-black/95">
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          muted
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

      {/* Top Left: Viewfinder Stream & Aspect Ratio Pill */}
      <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-300 flex items-center gap-2 pointer-events-none z-10">
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
        <span>Camera Stream</span>
        {videoDims && (
          <>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-mono text-[10px]">{videoDims}</span>
          </>
        )}
      </div>
    </div>
  );
}
