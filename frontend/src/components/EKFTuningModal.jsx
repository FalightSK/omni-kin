import React, { useState, useEffect } from 'react';
import { Sliders, X, RefreshCw, CheckCircle2, Zap, Target, Scale } from 'lucide-react';

export default function EKFTuningModal({ isOpen, onClose, activeEpisodeIndex, onReprocessComplete }) {
  const [params, setParams] = useState({
    q_vel: 0.01,
    r_pos_dual: 0.001,
    r_pos_single: 0.004,
    q_gyro: 0.001
  });
  const [presets, setPresets] = useState({});
  const [autoReprocess, setAutoReprocess] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/ekf/params')
      .then((res) => res.json())
      .then((data) => {
        if (data.params) setParams(data.params);
        if (data.presets) setPresets(data.presets);
      })
      .catch(console.error);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSliderChange = (key, value) => {
    const newParams = { ...params, [key]: parseFloat(value) };
    setParams(newParams);

    // Save params to server
    fetch('/api/ekf/params', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newParams)
    }).then(() => {
      if (autoReprocess && activeEpisodeIndex >= 0) {
        triggerReprocess();
      }
    });
  };

  const applyPreset = (presetKey) => {
    const target = presets[presetKey];
    if (!target) return;

    setParams(target);
    fetch('/api/ekf/params', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(target)
    }).then(() => {
      if (activeEpisodeIndex >= 0) {
        triggerReprocess();
      }
    });
  };

  const triggerReprocess = async () => {
    if (activeEpisodeIndex < 0) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/episodes/${activeEpisodeIndex}/reprocess`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success' && onReprocessComplete) {
        onReprocessComplete(data.poses);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/70 w-full max-w-xl rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">⚙️ Extended Kalman Filter (EKF) Tuning</h2>
              <p className="text-xs text-slate-400">12-State Visual-Inertial Fusion Parameters</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Grid */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">Tuning Presets</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => applyPreset('balanced')}
              className="py-2 px-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:border-indigo-500 text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 transition-all"
            >
              <Scale className="w-3.5 h-3.5 text-indigo-400" />
              <span>Balanced</span>
            </button>
            <button
              onClick={() => applyPreset('smooth')}
              className="py-2 px-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:border-emerald-500 text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 transition-all"
            >
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>Smooth</span>
            </button>
            <button
              onClick={() => applyPreset('agile')}
              className="py-2 px-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:border-amber-500 text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Agile</span>
            </button>
          </div>
        </div>

        {/* Sliders Container */}
        <div className="flex flex-col gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          {/* Velocity Dynamics Q_vel */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-200">⚡ Velocity Dynamics (Q_vel)</span>
              <span className="font-mono text-sky-400">{params.q_vel.toFixed(4)}</span>
            </div>
            <input
              type="range"
              min="0.0005"
              max="0.08"
              step="0.0005"
              value={params.q_vel}
              onChange={(e) => handleSliderChange('q_vel', e.target.value)}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 mt-0.5">Higher = rapid responsiveness to jerks; Lower = heavy velocity damping.</p>
          </div>

          {/* Dual Tag Error R_pos_dual */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-200">🎯 Dual-Tag Position Error (R_dual)</span>
              <span className="font-mono text-sky-400">{(params.r_pos_dual * 1000).toFixed(1)} mm</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={params.r_pos_dual * 1000}
              onChange={(e) => handleSliderChange('r_pos_dual', e.target.value / 1000.0)}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 mt-0.5">Expected 8-point measurement noise in mm (Lower = tighter camera lock).</p>
          </div>

          {/* Single Tag Error R_pos_single */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-200">📐 Single-Tag Position Error (R_single)</span>
              <span className="font-mono text-sky-400">{(params.r_pos_single * 1000).toFixed(1)} mm</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="15.0"
              step="0.5"
              value={params.r_pos_single * 1000}
              onChange={(e) => handleSliderChange('r_pos_single', e.target.value / 1000.0)}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 mt-0.5">Expected 4-point measurement noise when only 1 marker is visible.</p>
          </div>

          {/* Gyro Trust Q_gyro */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-200">🔄 Gyroscope Trust (Q_gyro)</span>
              <span className="font-mono text-sky-400">{params.q_gyro.toFixed(4)}</span>
            </div>
            <input
              type="range"
              min="0.0001"
              max="0.01"
              step="0.0001"
              value={params.q_gyro}
              onChange={(e) => handleSliderChange('q_gyro', e.target.value)}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 mt-0.5">Controls orientation propagation rate from IMU gyroscope.</p>
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-2">
          <label className="text-xs text-slate-400 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoReprocess}
              onChange={(e) => setAutoReprocess(e.target.checked)}
              className="accent-sky-400 rounded"
            />
            <span>Live Re-Filter active episode on slider change</span>
          </label>

          <div className="flex gap-2">
            <button
              onClick={triggerReprocess}
              disabled={isProcessing || activeEpisodeIndex < 0}
              className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-sky-400 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Filtering...' : 'Re-Filter Now'}</span>
            </button>
            <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
