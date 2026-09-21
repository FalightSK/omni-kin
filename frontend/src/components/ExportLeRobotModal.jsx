import React, { useState, useEffect } from 'react';
import { X, Package, Sparkles, Scissors, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';

export default function ExportLeRobotModal({
  isOpen,
  onClose,
  episodes = [],
  robotConfig = {},
  trajectoryMode = 'free_form',
  onTrajectoryModeChange = () => {}
}) {
  const [autoTrim, setAutoTrim] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalFrames = episodes.reduce((acc, ep) => acc + (ep.num_frames || (ep.poses ? ep.poses.length : 0)), 0);
  const robotType = (robotConfig?.robot_type || 'so_arm101_omni_kin').toUpperCase();

  const handleExport = async () => {
    setIsExporting(true);
    setErrorMessage(null);
    setExportResult(null);
    try {
      const res = await fetch('/api/export_lerobot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trajectory_mode: trajectoryMode,
          auto_trim: autoTrim
        })
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Export failed');
      }
      setExportResult(data);
    } catch (err) {
      setErrorMessage(err.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800/80 bg-[#0d0d0d] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700/60 flex items-center justify-center text-neutral-200 shadow-sm">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-100 tracking-tight">Export Hugging Face LeRobot Dataset</h3>
              <p className="text-[11px] text-neutral-400 font-mono">LeRobot v2.1 Parquet + MP4 Video Serialization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-5 flex flex-col gap-4 text-left overflow-y-auto">
          {/* Success Banner (when exported) - does NOT hide controls, allows exporting again */}
          {exportResult && (
            <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/50 text-neutral-200 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Dataset Exported Successfully!</span>
                </div>
                {exportResult.export_folder && (
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700/40">
                    {exportResult.export_folder}
                  </span>
                )}
              </div>
              <div className="bg-[#050505]/90 p-2.5 rounded-lg border border-neutral-800/80 text-[11px] font-mono space-y-1 text-neutral-300">
                <div className="truncate"><span className="text-neutral-500">Path:</span> {exportResult.export_path}</div>
                <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-0.5">
                  <span>Episodes: <b className="text-neutral-200">{exportResult.total_episodes}</b></span>
                  <span>Frames: <b className="text-emerald-400">{exportResult.total_frames}</b></span>
                  <span>Trim: <b className="text-neutral-200">{exportResult.auto_trim ? 'Auto' : 'Off'}</b></span>
                  <span>Mode: <b className="text-neutral-200">{exportResult.trajectory_mode}</b></span>
                </div>
              </div>
              <p className="text-[10px] text-neutral-400 leading-tight">
                Ready for training. You can adjust settings below and export again to generate additional versioned datasets.
              </p>
            </div>
          )}

          {/* Dataset Scope Info */}
          <div className="grid grid-cols-3 gap-2 bg-[#050505] p-3 rounded-xl border border-neutral-800/80 text-center font-mono">
            <div>
              <div className="text-[10px] text-neutral-500 uppercase">Embodiment</div>
              <div className="text-xs font-semibold text-neutral-200 mt-0.5 truncate">{robotType}</div>
            </div>
            <div>
              <div className="text-[10px] text-neutral-500 uppercase">Episodes</div>
              <div className="text-xs font-semibold text-white mt-0.5">{episodes.length}</div>
            </div>
            <div>
              <div className="text-[10px] text-neutral-500 uppercase">Est. Frames</div>
              <div className="text-xs font-semibold text-emerald-400 mt-0.5">{totalFrames}</div>
            </div>
          </div>

          {/* Trajectory Mode Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider font-mono">
              Trajectory Alignment Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onTrajectoryModeChange('free_form')}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  trajectoryMode === 'free_form'
                    ? 'bg-neutral-900 border-neutral-600 text-white shadow-sm'
                    : 'bg-[#050505] border-neutral-800/80 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
                  <Package className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Free-Form</span>
                </div>
                <span className="text-[10px] text-neutral-400 leading-tight">
                  Raw start positions. Ideal for broad pretraining across workspace.
                </span>
              </button>

              <button
                type="button"
                onClick={() => onTrajectoryModeChange('initial_aware')}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  trajectoryMode === 'initial_aware'
                    ? 'bg-neutral-900 border-neutral-600 text-white shadow-sm'
                    : 'bg-[#050505] border-neutral-800/80 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
                  <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Initial-Aware</span>
                </div>
                <span className="text-[10px] text-neutral-400 leading-tight">
                  Prepends smooth quintic approach path from Home pose for fine-tuning.
                </span>
              </button>
            </div>
          </div>

          {/* Auto-Trim Boundary Out-of-Reach Frames Toggle */}
          <div className="flex flex-col gap-1.5 bg-[#050505] p-3 rounded-xl border border-neutral-800/80">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoTrim}
                onChange={(e) => setAutoTrim(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-white accent-white focus:ring-0"
              />
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
                  <Scissors className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Auto-Trim Out-of-Reach Boundary Frames</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-neutral-900 border border-neutral-700 text-neutral-300 font-mono font-medium">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Automatically detects and slices leading/trailing frames where the phone was held near the operator's chest (r &lt; 17.6 cm) before or after the task. Maintains 100% video-parquet sync.
                </p>
              </div>
            </label>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Footer Actions - ALWAYS VISIBLE for repeatable exports */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-neutral-800/80 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-medium transition-all"
            >
              {exportResult ? 'Done' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || episodes.length === 0}
              className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Exporting Dataset...</span>
                </>
              ) : (
                <>
                  <span>{exportResult ? 'Export Again (New Version)' : 'Export LeRobot Dataset'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
