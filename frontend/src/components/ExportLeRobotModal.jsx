import React, { useState } from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-sm">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Export Hugging Face LeRobot Dataset</h3>
              <p className="text-[11px] text-slate-400">LeRobot v2.1 Parquet + MP4 Video Serialization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 flex flex-col gap-4 text-left">
          {exportResult ? (
            /* Success State */
            <div className="flex flex-col gap-3 py-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Dataset Exported Successfully!</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1 text-slate-300">
                <div><span className="text-slate-500">Path:</span> {exportResult.export_path}</div>
                <div><span className="text-slate-500">Embodiment:</span> {exportResult.robot_type.toUpperCase()}</div>
                <div><span className="text-slate-500">Mode:</span> {exportResult.trajectory_mode}</div>
                <div><span className="text-slate-500">Auto-Trim:</span> {exportResult.auto_trim ? 'Enabled (Feasible Only)' : 'Disabled'}</div>
                <div><span className="text-slate-500">Total Episodes:</span> {exportResult.total_episodes}</div>
                <div><span className="text-slate-500">Total Frames:</span> {exportResult.total_frames}</div>
              </div>
              <p className="text-[11px] text-slate-400">
                The dataset is ready for training policies with <code>lerobot-train</code> or inspecting via LeRobot Visualizer.
              </p>
              <div className="flex justify-end pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Dataset Scope Info */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Embodiment</div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5 truncate">{robotType}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Episodes</div>
                  <div className="text-xs font-bold text-indigo-400 mt-0.5">{episodes.length}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Est. Frames</div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">{totalFrames}</div>
                </div>
              </div>

              {/* Trajectory Mode Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  Trajectory Alignment Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onTrajectoryModeChange('free_form')}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                      trajectoryMode === 'free_form'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Package className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Free-Form</span>
                    </div>
                    <span className="text-[10px] text-slate-400 leading-tight">
                      Raw start positions. Ideal for broad pretraining across workspace.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onTrajectoryModeChange('initial_aware')}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                      trajectoryMode === 'initial_aware'
                        ? 'bg-purple-600/20 border-purple-500 text-white shadow-sm'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Initial-Aware</span>
                    </div>
                    <span className="text-[10px] text-slate-400 leading-tight">
                      Prepends smooth quintic approach path from Home pose for fine-tuning.
                    </span>
                  </button>
                </div>
              </div>

              {/* Auto-Trim Boundary Out-of-Reach Frames Toggle */}
              <div className="flex flex-col gap-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoTrim}
                    onChange={(e) => setAutoTrim(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20"
                  />
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                      <Scissors className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Auto-Trim Out-of-Reach Boundary Frames</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                        RECOMMENDED
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Automatically detects and slices leading/trailing frames where the phone was held near the operator's chest (r &lt; 17.6 cm) before or after the task. Maintains 100% video-parquet sync.
                    </p>
                  </div>
                </label>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isExporting}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={isExporting || episodes.length === 0}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Exporting Dataset...</span>
                    </>
                  ) : (
                    <>
                      <span>Export LeRobot Dataset</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
