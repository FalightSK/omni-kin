import React, { useRef, useEffect } from 'react';
import { Video } from 'lucide-react';

export default function VideoPlayer({ videoUrl, isPlaying, currentFrameIndex, totalFrames, fps = 30, onTimeUpdate }) {
  const videoRef = useRef(null);

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

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden glass-card flex items-center justify-center bg-black">
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          muted
          className="w-full h-full object-cover"
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

      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-300 flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-indigo-400" />
        <span>Camera Viewfinder Stream</span>
      </div>
    </div>
  );
}
