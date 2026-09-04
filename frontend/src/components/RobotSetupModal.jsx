import React, { useState, useEffect } from 'react';
import { Bot, X, CheckCircle2, RotateCcw, Crosshair, Compass, Cpu, Move, Info } from 'lucide-react';

export default function RobotSetupModal({ isOpen, onClose, robotConfig, onConfigSaved }) {
  const [config, setConfig] = useState({
    robot_type: 'so101',
    offset_x: 0.20,
    offset_y: 0.00,
    offset_z: 0.00,
    yaw_deg: 0.0
  });
  const [presets, setPresets] = useState([]);
  const [activeTab, setActiveTab] = useState('offset'); // 'offset' | 'dh_table'
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/robot/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.config) setConfig(data.config);
        if (data.presets) setPresets(data.presets);
      })
      .catch(console.error);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPreset = presets.find((p) => p.robot_type === config.robot_type) || {
    name: config.robot_type.toUpperCase(),
    description: 'Robotic Manipulator',
    reach_meters: 0.395,
    payload_kg: 0.50,
    dh_table: []
  };

  const handleFieldChange = (field, val) => {
    setConfig((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/robot/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSaveSuccess(true);
        if (onConfigSaved) onConfigSaved(data.config);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const applyPresetPosition = (ox, oy, yaw = 0) => {
    setConfig((prev) => ({
      ...prev,
      offset_x: ox,
      offset_y: oy,
      yaw_deg: yaw
    }));
  };

  const distToMarker = Math.sqrt(config.offset_x ** 2 + config.offset_y ** 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Robot Spec & Workspace Calibration</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {config.robot_type.toUpperCase()}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Calibrate Robot Starting Coordinate on the ArUco Table Plane (Z = 0)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5 text-left">
          {/* 1. Robot Model Selection Cards */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Robot Embodiment Model
            </label>
            <div className="grid grid-cols-2 gap-3">
              {presets.map((p) => {
                const isSelected = p.robot_type === config.robot_type;
                return (
                  <button
                    key={p.robot_type}
                    type="button"
                    onClick={() => handleFieldChange('robot_type', p.robot_type)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500/80 shadow-lg shadow-indigo-600/10'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-100">{p.name}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                      {p.description}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-1.5">
                      <span>Reach: {(p.reach_meters * 100).toFixed(0)}cm</span>
                      <span>Payload: {(p.payload_kg * 1000).toFixed(0)}g</span>
                      <span className="text-indigo-400">5-DoF + Grip</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Tabs: Offset Calibration vs DH Parameter Table */}
          <div className="flex border-b border-slate-800 gap-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('offset')}
              className={`pb-2.5 flex items-center gap-1.5 transition-colors border-b-2 ${
                activeTab === 'offset'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Table Starting Coordinate (Z = 0 Plane)</span>
            </button>
            <button
              onClick={() => setActiveTab('dh_table')}
              className={`pb-2.5 flex items-center gap-1.5 transition-colors border-b-2 ${
                activeTab === 'dh_table'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>DH Parameter Table</span>
            </button>
          </div>

          {activeTab === 'offset' ? (
            <div className="flex flex-col gap-4">
              {/* Co-planar Status Banner */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    Co-Planar Mode: Robot base is mounted on the table surface (<strong>Z = 0.0 cm</strong>) with Tag A.
                  </span>
                </div>
                <span className="font-mono text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                  Dist: {(distToMarker * 100).toFixed(1)} cm
                </span>
              </div>

              {/* Slider 1: X Offset */}
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Move className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      X Offset (Table Right / Left)
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="1"
                      value={(config.offset_x * 100).toFixed(1)}
                      onChange={(e) => handleFieldChange('offset_x', parseFloat(e.target.value) / 100 || 0)}
                      className="w-16 px-2 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-right text-slate-100"
                    />
                    <span className="text-xs text-slate-400">cm</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={Math.round(config.offset_x * 100)}
                  onChange={(e) => handleFieldChange('offset_x', parseFloat(e.target.value) / 100)}
                  className="w-full accent-sky-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>-50 cm (Left of Tag A)</span>
                  <span>0 cm (At Tag A Origin)</span>
                  <span>+50 cm (Right of Tag A)</span>
                </div>
              </div>

              {/* Slider 2: Y Offset */}
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Move className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      Y Offset (Table Forward / Back)
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="1"
                      value={(config.offset_y * 100).toFixed(1)}
                      onChange={(e) => handleFieldChange('offset_y', parseFloat(e.target.value) / 100 || 0)}
                      className="w-16 px-2 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-right text-slate-100"
                    />
                    <span className="text-xs text-slate-400">cm</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={Math.round(config.offset_y * 100)}
                  onChange={(e) => handleFieldChange('offset_y', parseFloat(e.target.value) / 100)}
                  className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>-50 cm (Toward User)</span>
                  <span>0 cm (Aligned with Tag A)</span>
                  <span>+50 cm (Away / Behind Tag A)</span>
                </div>
              </div>

              {/* Slider 3: Yaw Mounting Heading */}
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      Base Heading Orientation (Yaw Angle)
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="5"
                      value={config.yaw_deg.toFixed(0)}
                      onChange={(e) => handleFieldChange('yaw_deg', parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-right text-slate-100"
                    />
                    <span className="text-xs text-slate-400">°</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="5"
                  value={Math.round(config.yaw_deg)}
                  onChange={(e) => handleFieldChange('yaw_deg', parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>-180° (Facing Left)</span>
                  <span>0° (Facing Right)</span>
                  <span>+180° (Facing Left)</span>
                </div>
              </div>

              {/* Quick Positioning Presets */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[11px] font-semibold text-slate-400 self-center mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPresetPosition(0.20, 0.00, 0)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono border border-slate-700/60"
                >
                  Right (+20cm X)
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetPosition(0.00, 0.20, -90)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono border border-slate-700/60"
                >
                  Behind (+20cm Y, -90°)
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetPosition(0.20, 0.15, 0)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono border border-slate-700/60"
                >
                  Diagonal (+20X, +15Y)
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetPosition(0.00, 0.00, 0)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono border border-slate-700/60 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Origin (0,0)</span>
                </button>
              </div>
            </div>
          ) : (
            /* DH Parameter Table View */
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-3 bg-slate-900/60 border-b border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-400" />
                <span>
                  Standard Denavit-Hartenberg (DH) parameters for {currentPreset.name}:
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900/90 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Joint</th>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">θ Offset</th>
                      <th className="p-2.5">d (Offset)</th>
                      <th className="p-2.5">a (Length)</th>
                      <th className="p-2.5">α (Twist)</th>
                      <th className="p-2.5">Limits</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {currentPreset.dh_table.map((row) => (
                      <tr key={row.joint_idx} className="hover:bg-slate-800/40 text-slate-300">
                        <td className="p-2.5 font-bold text-indigo-400">q{row.joint_idx}</td>
                        <td className="p-2.5 text-slate-200">{row.name.replace(/q\d+_/, '')}</td>
                        <td className="p-2.5">{row.theta_offset_deg.toFixed(1)}°</td>
                        <td className="p-2.5 text-sky-300">{(row.d * 100).toFixed(1)} cm</td>
                        <td className="p-2.5 text-emerald-300">{(row.a * 100).toFixed(1)} cm</td>
                        <td className="p-2.5">{row.alpha_deg.toFixed(0)}°</td>
                        <td className="p-2.5 text-amber-300 text-[11px]">
                          [{row.limits_deg[0]}°, {row.limits_deg[1]}°]
                        </td>
                      </tr>
                    ))}
                    <tr className="hover:bg-slate-800/40 text-slate-300">
                      <td className="p-2.5 font-bold text-indigo-400">q5</td>
                      <td className="p-2.5 text-slate-200">gripper</td>
                      <td className="p-2.5">—</td>
                      <td className="p-2.5 text-slate-500">—</td>
                      <td className="p-2.5 text-slate-500">—</td>
                      <td className="p-2.5">—</td>
                      <td className="p-2.5 text-amber-300 text-[11px]">[0%, 100%]</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            {saveSuccess && (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold animate-pulse">
                <CheckCircle2 className="w-4 h-4" />
                <span>Configuration Saved & Active!</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Apply Calibration</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
