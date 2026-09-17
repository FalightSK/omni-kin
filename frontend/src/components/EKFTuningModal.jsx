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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#0a0a0a] border border-neutral-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-700/60 text-neutral-200">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-100 tracking-tight">Extended Kalman Filter (EKF) Tuning</h2>
              <p className="text-[11px] text-neutral-400 font-mono">12-State Visual-Inertial Fusion Parameters</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Presets Grid */}
        <div>
          <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2 font-mono">Tuning Presets</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => applyPreset('balanced')}
              className="py-2 px-3 rounded-xl border border-neutral-800 bg-[#050505] hover:border-neutral-600 text-xs font-medium text-neutral-200 flex items-center justify-center gap-1.5 transition-all"
            >
              <Scale className="w-3.5 h-3.5 text-neutral-400" />
              <span>Balanced</span>
            </button>
            <button
              onClick={() => applyPreset('smooth')}
              className="py-2 px-3 rounded-xl border border-neutral-800 bg-[#050505] hover:border-neutral-600 text-xs font-medium text-neutral-200 flex items-center justify-center gap-1.5 transition-all"
            >
              <Target className="w-3.5 h-3.5 text-neutral-400" />
              <span>Smooth</span>
            </button>
            <button
              onClick={() => applyPreset('agile')}
              className="py-2 px-3 rounded-xl border border-neutral-800 bg-[#050505] hover:border-neutral-600 text-xs font-medium text-neutral-200 flex items-center justify-center gap-1.5 transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-neutral-400" />
              <span>Agile</span>
            </button>
          </div>
        </div>

        {/* Sliders Container */}
        <div className="flex flex-col gap-4 bg-[#050505] p-4 rounded-xl border border-neutral-800/80">
          {/* Velocity Dynamics Q_vel */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-neutral-300">⚡ Velocity Dynamics (Q_vel)</span>
              <span className="font-mono text-white">{params.q_vel.toFixed(4)}</span>
            </div>
            <input
              type="range"
              min="0.0005"
              max="0.08"
              step="0.0005"
              value={params.q_vel}
              onChange={(e) => handleSliderChange('q_vel', e.target.value)}
              className="w-full accent-white cursor-pointer"
            />
            <p className="text-[10px] text-neutral-500 mt-0.5 font-mono">Higher = rapid responsiveness to jerks; Lower = heavy velocity damping.</p>
          </div>

          {/* Dual Tag Error R_pos_dual */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-neutral-300">🎯 Dual-Tag Position Error (R_dual)</span>
              <span className="font-mono text-white">{(params.r_pos_dual * 1000).toFixed(1)} mm</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={params.r_pos_dual * 1000}
              onChange={(e) => handleSliderChange('r_pos_dual', e.target.value / 1000.0)}
              className="w-full accent-white cursor-pointer"
            />
            <p className="text-[10px] text-neutral-500 mt-0.5 font-mono">Expected 8-point measurement noise in mm (Lower = tighter camera lock).</p>
          </div>

          {/* Single Tag Error R_pos_single */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-neutral-300">📐 Single-Tag Position Error (R_single)</span>
              <span className="font-mono text-white">{(params.r_pos_single * 1000).toFixed(1)} mm</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="15.0"
              step="0.5"
              value={params.r_pos_single * 1000}
              onChange={(e) => handleSliderChange('r_pos_single', e.target.value / 1000.0)}
              className="w-full accent-white cursor-pointer"
            />
            <p className="text-[10px] text-neutral-500 mt-0.5 font-mono">Expected 4-point measurement noise when only 1 marker is visible.</p>
          </div>

          {/* Gyro Trust Q_gyro */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-neutral-300">🔄 Gyroscope Trust (Q_gyro)</span>
              <span className="font-mono text-white">{params.q_gyro.toFixed(4)}</span>
            </div>
            <input
              type="range"
              min="0.0001"
              max="0.01"
              step="0.0001"
              value={params.q_gyro}
              onChange={(e) => handleSliderChange('q_gyro', e.target.value)}
              className="w-full accent-white cursor-pointer"
            />
            <p className="text-[10px] text-neutral-500 mt-0.5 font-mono">Controls orientation propagation rate from IMU gyroscope.</p>
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-2">
          <label className="text-xs text-neutral-400 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoReprocess}
              onChange={(e) => setAutoReprocess(e.target.checked)}
              className="accent-white rounded"
            />
            <span>Live Re-Filter active episode on slider change</span>
          </label>

          <div className="flex gap-2">
            <button
              onClick={triggerReprocess}
              disabled={isProcessing || activeEpisodeIndex < 0}
              className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Filtering...' : 'Re-Filter Now'}</span>
            </button>
            <button onClick={onClose} className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-medium hover:bg-neutral-800 transition-all">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
