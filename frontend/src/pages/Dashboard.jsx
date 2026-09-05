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
  Rows,
  AppWindow,
  Maximize2,
  Minimize2,
  Minus,
  Video,
  PanelRightClose,
  PanelRightOpen,
  GripHorizontal,
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

  // Layout Configuration: Default to 'pip' (Big 3D Trajectory with anchored bottom-right Camera)
  const [layoutMode, setLayoutMode] = useState('pip'); // 'pip' (Default), 'vertical', or 'horizontal'
  const [pipSize, setPipSize] = useState('medium'); // 'small', 'medium', 'large'
  const [isPipOpen, setIsPipOpen] = useState(true);

  // Split ratio for alternative split modes
  const [splitRatio, setSplitRatio] = useState(55);
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
      } ${isDragging ? 'select-none' : ''}`}
    >
      {/* Main Center Area: Big 3D Preview with Inset Camera & Timeline */}
      <div className={`${isSidebarOpen ? 'lg:col-span-3' : 'w-full'} flex flex-col gap-3 h-full min-h-0`}>
        {/* Top Control Bar for Layout Modes */}
        <div className="flex items-center justify-between px-1 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>View Mode:</span>
            </span>

            {/* Layout Mode Selector Pills */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setLayoutMode('pip')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                  layoutMode === 'pip'
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
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
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
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
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title="Side-by-Side Split View"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Side-by-Side</span>
              </button>
            </div>

            {/* PiP Specific Size Controls when in PiP mode */}
            {layoutMode === 'pip' && isPipOpen && (
              <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                <span className="text-slate-500 px-1.5 text-[10px] uppercase font-mono">Camera:</span>
                <button
                  onClick={() => setPipSize('small')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    pipSize === 'small' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Small
                </button>
                <button
                  onClick={() => setPipSize('medium')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    pipSize === 'medium' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Medium
                </button>
                <button
                  onClick={() => setPipSize('large')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    pipSize === 'large' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Large
                </button>
              </div>
            )}
          </div>

          {/* Right: Sidebar Collapse/Expand Toggle */}
          <div className="flex items-center gap-2">
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
                  <span className="hidden md:inline text-indigo-300">Episodes ({episodes.length})</span>
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
          <div className="flex-1 min-h-0 relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/40 shadow-xl">
            {/* Primary Big 3D Workspace */}
            <div className="w-full h-full relative">
              <Viewport3D
                trajectoryPoses={poses}
                currentFrameIndex={currentFrameIndex}
                robotConfig={robotConfig}
              />
            </div>

            {/* Anchored Bottom-Right Camera View Panel */}
            {isPipOpen ? (
              <div
                className={`absolute bottom-3 right-3 z-30 transition-all duration-200 rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950/95 backdrop-blur-xl shadow-2xl flex flex-col ${
                  pipSize === 'large'
                    ? 'w-96 md:w-[420px] h-60 md:h-64'
                    : pipSize === 'medium'
                    ? 'w-72 md:w-80 h-44 md:h-52'
                    : 'w-56 h-36'
                }`}
              >
                {/* Inset Header Bar */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-[11px] select-none">
                  <div className="flex items-center gap-1.5 font-medium text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="tracking-wide">Camera View</span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    {/* Size cycle button */}
                    <button
                      onClick={() =>
                        setPipSize((prev) => (prev === 'small' ? 'medium' : prev === 'medium' ? 'large' : 'small'))
                      }
                      className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
                      title={`Resize Camera Inset (Current: ${pipSize.toUpperCase()})`}
                    >
                      <Maximize2 className="w-3 h-3" />
                    </button>
                    {/* Minimize button */}
                    <button
                      onClick={() => setIsPipOpen(false)}
                      className="p-1 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                      title="Minimize Camera Inset"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Video Frame with preserved native aspect ratio */}
                <div className="flex-1 min-h-0 relative bg-black flex items-center justify-center overflow-hidden">
                  <VideoPlayer
                    videoUrl={activeEp?.video_url}
                    isPlaying={isPlaying}
                    currentFrameIndex={currentFrameIndex}
                    totalFrames={totalFrames}
                    fps={activeEp?.fps || 30}
                    showBadge={false}
                  />
                </div>
              </div>
            ) : (
              /* Minimized Floating Inset Button in Bottom-Right */
              <button
                onClick={() => setIsPipOpen(true)}
                className="absolute bottom-3 right-3 z-30 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 rounded-xl text-xs font-medium text-slate-300 hover:text-white shadow-xl flex items-center gap-2 transition-all active:scale-95"
                title="Restore Camera View Inset"
              >
                <Video className="w-3.5 h-3.5 text-indigo-400" />
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
            } gap-0 flex-1 min-h-0 relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/40`}
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
                trajectoryPoses={poses}
                currentFrameIndex={currentFrameIndex}
                robotConfig={robotConfig}
              />
            </div>

            {/* Draggable Divider */}
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onTouchStart={() => setIsDragging(true)}
              className={`z-30 items-center justify-center bg-slate-900/90 hover:bg-indigo-600/30 transition-all select-none group ${
                layoutMode === 'vertical'
                  ? 'flex h-2.5 hover:h-3.5 w-full cursor-row-resize border-y border-slate-800/90'
                  : 'hidden md:flex w-2.5 hover:w-3.5 h-full cursor-col-resize border-x border-slate-800/90'
              }`}
            >
              {layoutMode === 'vertical' ? (
                <div className="w-12 h-1 rounded-full bg-slate-600 group-hover:bg-indigo-400 transition-colors flex items-center justify-center">
                  <GripHorizontal className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                </div>
              ) : (
                <div className="w-1 h-8 rounded-full bg-slate-600 group-hover:bg-indigo-400 transition-colors flex items-center justify-center">
                  <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
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
                isPlaying={isPlaying}
                currentFrameIndex={currentFrameIndex}
                totalFrames={totalFrames}
                fps={activeEp?.fps || 30}
              />
            </div>
          </div>
        )}

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
