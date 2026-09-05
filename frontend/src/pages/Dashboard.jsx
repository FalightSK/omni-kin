import React, { useState, useEffect, useRef } from 'react';
import Viewport3D from '../components/Viewport3D';
import VideoPlayer from '../components/VideoPlayer';
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
  PanelRightClose,
  PanelRightOpen,
  GripVertical
} from 'lucide-react';

export default function Dashboard({
  episodes,
  selectedEpIdx,
  setSelectedEpIdx,
  onRefreshEpisodes,
  onDeleteEpisode,
  onReprocessActive,
  robotConfig,
  onOpenRobotModal
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

  // Adjustable Panel State
  const [splitRatio, setSplitRatio] = useState(50); // percentage (15 to 85, or 100 / 0)
  const [isDragging, setIsDragging] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const splitContainerRef = useRef(null);

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

  // Handle Dragging Splitter
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
      if (clientX === undefined) return;
      const offset = clientX - rect.left;
      const newRatio = (offset / rect.width) * 100;
      setSplitRatio(Math.min(85, Math.max(15, newRatio)));
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
  }, [isDragging]);

  const currentX = currentPose[0] || 0;
  const currentY = currentPose[1] || 0;
  const currentZ = currentPose[2] || 0;
  const distToOrigin = Math.sqrt(currentX * currentX + currentY * currentY + currentZ * currentZ);

  // Compute Robot-Relative Coordinates from Active Coplanar Calibration
  const ox = robotConfig?.offset_x ?? 0.20;
  const oy = robotConfig?.offset_y ?? 0.00;
  const oz = robotConfig?.offset_z ?? 0.00;
  const yawRad = THREE_to_rad(robotConfig?.yaw_deg ?? 0.0);

  const dx = currentX - ox;
  const dy = currentY - oy;
  const dz = currentZ - oz;

  const cosY = Math.cos(yawRad);
  const sinY = Math.sin(yawRad);
  const robotX = cosY * dx + sinY * dy;
  const robotY = -sinY * dx + cosY * dy;
  const robotZ = dz;
  const distToRobot = Math.sqrt(robotX * robotX + robotY * robotY + robotZ * robotZ);

  function THREE_to_rad(deg) {
    return (deg * Math.PI) / 180;
  }

  const robotName = (robotConfig?.robot_type || 'so101').toUpperCase();

  return (
    <div
      className={`flex-1 p-4 grid gap-4 overflow-hidden h-[calc(100vh-60px)] transition-all ${
        isSidebarOpen ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1'
      } ${isDragging ? 'select-none cursor-col-resize' : ''}`}
    >
      {/* Main Center Area: Adjustable Viewports & Timeline */}
      <div className={`${isSidebarOpen ? 'lg:col-span-3' : 'w-full'} flex flex-col gap-3 h-full min-h-0`}>
        {/* Top Control Bar for Viewport Layout Adjustments */}
        <div className="flex items-center justify-between px-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Columns className="w-3.5 h-3.5 text-indigo-400" />
              <span>Panel Layout:</span>
            </span>
            <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setSplitRatio(50)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  splitRatio === 50
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title="50% 3D / 50% Video"
              >
                50:50
              </button>
              <button
                onClick={() => setSplitRatio(70)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  splitRatio === 70
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title="70% 3D / 30% Video"
              >
                3D Focus
              </button>
              <button
                onClick={() => setSplitRatio(30)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  splitRatio === 30
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title="30% 3D / 70% Video"
              >
                Video Focus
              </button>
              <button
                onClick={() => setSplitRatio(100)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  splitRatio === 100
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title="Full 3D Viewport"
              >
                Max 3D
              </button>
              <button
                onClick={() => setSplitRatio(0)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  splitRatio === 0
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title="Full Video Viewport"
              >
                Max Video
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              Split: {splitRatio}% 3D / {100 - splitRatio}% Video
            </span>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-all"
              title={isSidebarOpen ? 'Collapse Episodes Drawer' : 'Expand Episodes Drawer'}
            >
              {isSidebarOpen ? (
                <>
                  <PanelRightClose className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Collapse Drawer</span>
                </>
              ) : (
                <>
                  <PanelRightOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden md:inline text-indigo-300">Show Episodes ({episodes.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Adjustable Side-by-Side Dual Viewports Container */}
        <div
          ref={splitContainerRef}
          className="flex flex-col md:flex-row gap-0 flex-1 min-h-0 relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/40"
        >
          {/* Left Panel: 3D Viewport */}
          {splitRatio > 0 && (
            <div
              style={{ width: splitRatio === 100 ? '100%' : `${splitRatio}%` }}
              className="h-full relative overflow-hidden transition-[width] duration-75 ease-out"
            >
              <Viewport3D
                trajectoryPoses={poses}
                currentFrameIndex={currentFrameIndex}
                robotConfig={robotConfig}
              />
            </div>
          )}

          {/* Interactive Draggable Splitter Divider */}
          {splitRatio > 0 && splitRatio < 100 && (
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onTouchStart={() => setIsDragging(true)}
              className="hidden md:flex w-2.5 hover:w-3 z-30 cursor-col-resize items-center justify-center bg-slate-900/80 hover:bg-indigo-600/30 border-x border-slate-800/80 transition-all select-none group"
              title="Drag to resize 3D Viewport and Video Player"
            >
              <div className="w-1 h-8 rounded-full bg-slate-600 group-hover:bg-indigo-400 transition-colors flex items-center justify-center">
                <GripVertical className="w-3 h-3 text-slate-400 group-hover:text-white" />
              </div>
            </div>
          )}

          {/* Right Panel: Synchronized Video Player */}
          {splitRatio < 100 && (
            <div
              style={{ width: splitRatio === 0 ? '100%' : `${100 - splitRatio}%` }}
              className="h-full relative overflow-hidden transition-[width] duration-75 ease-out"
            >
              <VideoPlayer
                videoUrl={activeEp?.video_url}
                isPlaying={isPlaying}
                currentFrameIndex={currentFrameIndex}
                totalFrames={totalFrames}
                fps={activeEp?.fps || 30}
              />
            </div>
          )}
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
                <span>
                  {((currentFrameIndex / (activeEp?.fps || 30)) || 0).toFixed(2)}s / {(activeEp?.duration || 0).toFixed(2)}s
                </span>
              </div>
            </div>
          </div>

          {/* Dual-Coordinate Telemetry Strip: ArUco Table Origin & Robot Base Relative */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 text-left font-mono">
            {/* ArUco Table Origin */}
            <div className="border-r border-slate-800/80 pr-2">
              <span className="text-[10px] text-emerald-400 uppercase block font-sans font-semibold">
                ArUco Tag A (0,0,0)
              </span>
              <span className="text-xs font-semibold text-slate-200">
                [{(currentX * 100).toFixed(1)}, {(currentY * 100).toFixed(1)}, {(currentZ * 100).toFixed(1)}] cm
              </span>
            </div>

            {/* Robot Base Relative */}
            <div className="border-r border-slate-800/80 pr-2 col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-indigo-400 uppercase font-sans font-semibold flex items-center gap-1">
                  <Bot className="w-3 h-3" />
                  <span>{robotName} Base Frame</span>
                </span>
                <span className="text-[9px] text-slate-500">
                  @ [{(ox * 100).toFixed(0)}, {(oy * 100).toFixed(0)}] cm
                </span>
              </div>
              <span className="text-xs font-semibold text-indigo-200">
                X:{(robotX * 100).toFixed(1)} Y:{(robotY * 100).toFixed(1)} Z:{(robotZ * 100).toFixed(1)} cm
              </span>
            </div>

            {/* Dist to ArUco Origin */}
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Dist Origin</span>
              <span className="text-xs font-semibold text-sky-400">{(distToOrigin * 100).toFixed(1)} cm</span>
            </div>

            {/* Dist to Robot Base */}
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Dist Robot</span>
              <span className="text-xs font-semibold text-indigo-400">{(distToRobot * 100).toFixed(1)} cm</span>
            </div>

            {/* Gripper */}
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Gripper</span>
              <span className="text-xs font-semibold text-amber-400">
                {activeEp?.gripper_states?.[currentFrameIndex]
                  ? `${activeEp.gripper_states[currentFrameIndex].toFixed(0)}%`
                  : '100%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Episode Storage Drawer (Collapsible) */}
      {isSidebarOpen && (
        <div className="glass-card p-4 rounded-2xl flex flex-col gap-3 h-full overflow-hidden text-left transition-all">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Episodes ({episodes.length})
              </h2>
            </div>
            <button
              onClick={onRefreshEpisodes}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Refresh Episodes"
            >
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
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title="Delete Episode"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MoveUpRight className="w-3 h-3 text-indigo-400" />
                      <span className="truncate">{ep.task}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>
                        {ep.num_frames} frames ({ep.fps} FPS)
                      </span>
                      <span>{(ep.duration || 0).toFixed(1)}s</span>
                    </div>
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
