import React, { useState, useEffect } from 'react';
import Viewport3D from '../components/Viewport3D';
import VideoPlayer from '../components/VideoPlayer';
import { Play, Pause, Trash2, RefreshCw, Layers, Compass, MoveUpRight } from 'lucide-react';

export default function Dashboard({ episodes, selectedEpIdx, setSelectedEpIdx, onRefreshEpisodes, onDeleteEpisode, onReprocessActive }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

  const activeEp = episodes.find((e) => e.episode_index === selectedEpIdx) || episodes[0] || null;
  const poses = activeEp?.poses || [];
  const totalFrames = activeEp?.num_frames || 0;
  const currentPose = poses[currentFrameIndex] || [0, 0, 0, 0, 0, 0];

  useEffect(() => {
    setCurrentFrameIndex(0);
    setIsPlaying(false);
  }, [selectedEpIdx]);

  useEffect(() => {
    let interval = null;
    if (isPlaying && totalFrames > 0) {
      interval = setInterval(() => {
        setCurrentFrameIndex((prev) => {
          if (prev >= totalFrames - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / (activeEp?.fps || 30));
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalFrames, activeEp?.fps]);

  const currentX = currentPose[0] || 0;
  const currentY = currentPose[1] || 0;
  const currentZ = currentPose[2] || 0;
  const distToOrigin = Math.sqrt(currentX * currentX + currentY * currentY + currentZ * currentZ);

  return (
    <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden h-[calc(100vh-60px)]">
      {/* Main Center Area: Side-by-Side Dual Viewports */}
      <div className="lg:col-span-3 flex flex-col gap-3 h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0">
          <Viewport3D trajectoryPoses={poses} currentFrameIndex={currentFrameIndex} />
          <VideoPlayer
            videoUrl={activeEp?.video_url}
            isPlaying={isPlaying}
            currentFrameIndex={currentFrameIndex}
            totalFrames={totalFrames}
            fps={activeEp?.fps || 30}
          />
        </div>

        {/* Timeline & Playback Controller */}
        <div className="glass-card p-4 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={totalFrames === 0}
              className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <div className="flex-1 flex flex-col gap-1">
              <input
                type="range"
                min="0"
                max={Math.max(0, totalFrames - 1)}
                value={currentFrameIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  setCurrentFrameIndex(parseInt(e.target.value) || 0);
                }}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Frame {currentFrameIndex + 1} of {totalFrames}</span>
                <span>{((currentFrameIndex / (activeEp?.fps || 30)) || 0).toFixed(2)}s / {(activeEp?.duration || 0).toFixed(2)}s</span>
              </div>
            </div>
          </div>

          {/* Telemetry Gauge Strip */}
          <div className="grid grid-cols-5 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-left font-mono">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">X (Right)</span>
              <span className="text-xs font-semibold text-slate-200">{(currentX * 100).toFixed(1)} cm</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Y (Forward)</span>
              <span className="text-xs font-semibold text-slate-200">{(currentY * 100).toFixed(1)} cm</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Z (Height)</span>
              <span className="text-xs font-semibold text-emerald-400">{(currentZ * 100).toFixed(1)} cm</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Dist to Origin</span>
              <span className="text-xs font-semibold text-sky-400">{(distToOrigin * 100).toFixed(1)} cm</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Gripper</span>
              <span className="text-xs font-semibold text-amber-400">
                {activeEp?.gripper_states?.[currentFrameIndex] ? `${activeEp.gripper_states[currentFrameIndex].toFixed(0)}%` : '100%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Episode Storage Drawer */}
      <div className="glass-card p-4 rounded-2xl flex flex-col gap-3 h-full overflow-hidden text-left">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">Episodes ({episodes.length})</h2>
          </div>
          <button onClick={onRefreshEpisodes} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
          {episodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center gap-2 text-slate-500">
              <Compass className="w-8 h-8 stroke-1" />
              <p className="text-xs">No episodes recorded yet.</p>
            </div>
          ) : (
            episodes.map((ep) => {
              const isSelected = ep.episode_index === selectedEpIdx;
              return (
                <div
                  key={ep.episode_index}
                  onClick={() => setSelectedEpIdx(ep.episode_index)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500/80 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Episode #{ep.episode_index}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteEpisode(ep.episode_index);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MoveUpRight className="w-3 h-3 text-indigo-400" />
                    <span className="truncate">{ep.task}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{ep.num_frames} frames ({ep.fps} FPS)</span>
                    <span>{(ep.duration || 0).toFixed(1)}s</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
