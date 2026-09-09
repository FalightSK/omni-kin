import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  X,
  CheckCircle2,
  RotateCcw,
  Crosshair,
  Compass,
  Cpu,
  Move,
  Info,
  FileCode,
  Upload,
  Download,
  Copy,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export default function RobotSetupModal({ isOpen, onClose, robotConfig, onConfigSaved }) {
  const [config, setConfig] = useState({
    robot_type: 'so_arm101_omni_kin',
    offset_x: 0.038,
    offset_y: -0.406,
    offset_z: 0.00,
    yaw_deg: 90.0
  });
  const [presets, setPresets] = useState([]);
  const [activeTab, setActiveTab] = useState('offset'); // 'offset' | 'dh_table' | 'urdf'
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // URDF Editor State
  const [urdfText, setUrdfText] = useState('');
  const [isParsingUrdf, setIsParsingUrdf] = useState(false);
  const [urdfStatus, setUrdfStatus] = useState(null); // { type: 'success'|'error', message: '' }
  const [customDhTable, setCustomDhTable] = useState(null);
  const [customSpecs, setCustomSpecs] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/robot/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.config) setConfig(data.config);
        if (data.presets) {
          setPresets(data.presets);
          const activeP = data.presets.find((p) => p.robot_type === data.config?.robot_type) || data.presets[0];
          if (activeP && activeP.urdf) {
            setUrdfText(activeP.urdf);
          }
        }
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

  const activeDhTable = customDhTable || currentPreset.dh_table;

  const handleFieldChange = (field, val) => {
    setConfig((prev) => ({ ...prev, [field]: val }));
  };

  const handleModelSelect = (rType) => {
    handleFieldChange('robot_type', rType);
    setCustomDhTable(null);
    setCustomSpecs(null);
    const selectedP = presets.find((p) => p.robot_type === rType);
    if (selectedP && selectedP.urdf) {
      setUrdfText(selectedP.urdf);
    }
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

  // Parse URDF to DH Table
  const handleParseUrdf = async () => {
    if (!urdfText.trim()) return;
    setIsParsingUrdf(true);
    setUrdfStatus(null);
    try {
      const res = await fetch('/api/robot/urdf/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urdf_text: urdfText })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCustomDhTable(data.dh_table);
        setCustomSpecs(data.specs);
        setUrdfStatus({
          type: 'success',
          message: `✓ Successfully parsed URDF "${data.specs.robot_name}" (${data.specs.revolute_joints} revolute joints, Reach: ${(data.specs.reach_meters * 100).toFixed(1)} cm)! Generated DH Parameter Table.`
        });
      } else {
        setUrdfStatus({
          type: 'error',
          message: data.message || 'Failed to parse URDF.'
        });
      }
    } catch (err) {
      setUrdfStatus({
        type: 'error',
        message: `Network error parsing URDF: ${err.message}`
      });
    } finally {
      setIsParsingUrdf(false);
    }
  };

  // Apply parsed URDF to server configuration
  const handleApplyUrdf = async () => {
    if (!urdfText.trim()) return;
    setIsParsingUrdf(true);
    try {
      const res = await fetch('/api/robot/urdf/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urdf_text: urdfText })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCustomDhTable(data.dh_table);
        setCustomSpecs(data.specs);
        setUrdfStatus({
          type: 'success',
          message: `✓ Custom URDF applied as active kinematics model!`
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsingUrdf(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setUrdfText(content);
        setUrdfStatus({
          type: 'info',
          message: `Loaded file "${file.name}" (${(file.size / 1024).toFixed(1)} KB). Click "Parse URDF -> Generate DH Table" below.`
        });
      }
    };
    reader.readAsText(file);
  };

  const handleCopyUrdf = () => {
    navigator.clipboard.writeText(urdfText);
    setUrdfStatus({ type: 'info', message: 'Copied URDF XML to clipboard!' });
    setTimeout(() => setUrdfStatus(null), 2500);
  };

  const handleDownloadUrdf = () => {
    const blob = new Blob([urdfText], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.robot_type}.urdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const distToMarker = Math.sqrt(config.offset_x ** 2 + config.offset_y ** 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Robot Spec, DH Table & URDF Manager</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {config.robot_type.toUpperCase()}
                </span>
                {customDhTable && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    URDF Overridden
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-400">
                Configure Robot Kinematics via URDF, DH Parameter Table, or Table Plane Offset
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
              Robot Embodiment Model Preset
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {presets.map((p) => {
                const isSelected = p.robot_type === config.robot_type && !customDhTable;
                return (
                  <button
                    key={p.robot_type}
                    type="button"
                    onClick={() => handleModelSelect(p.robot_type)}
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

          {/* Navigation Tabs: Offset Calibration vs DH Parameter Table vs URDF Input */}
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
              {customDhTable && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('urdf')}
              className={`pb-2.5 flex items-center gap-1.5 transition-colors border-b-2 ${
                activeTab === 'urdf'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>URDF Input & Converter</span>
            </button>
          </div>

          {/* TAB 1: Starting Coordinate Offset on Table Plane */}
          {activeTab === 'offset' && (
            <div className="flex flex-col gap-4">
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

              {/* Slider 3: Yaw Heading */}
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
                  onClick={() => applyPresetPosition(0.038, -0.406, 90)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-[11px] font-mono border border-indigo-500/60 flex items-center gap-1 font-semibold shadow-sm"
                >
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>⭐ Recommended (Front Y=-41cm, 90°)</span>
                </button>
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
          )}

          {/* TAB 2: DH Parameter Table View */}
          {activeTab === 'dh_table' && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden flex flex-col gap-2">
              <div className="p-3 bg-slate-900/60 border-b border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-400" />
                  <span>
                    Denavit-Hartenberg (DH) parameters for {customSpecs?.robot_name || currentPreset.name}:
                  </span>
                </div>
                {customDhTable && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomDhTable(null);
                      setCustomSpecs(null);
                    }}
                    className="text-[10px] text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset to Preset</span>
                  </button>
                )}
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
                    {activeDhTable.map((row) => (
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

          {/* TAB 3: URDF Input & Converter */}
          {activeTab === 'urdf' && (
            <div className="flex flex-col gap-3">
              {/* URDF Quick Toolbar */}
              <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">Presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const p = presets.find((x) => x.robot_type === 'so101');
                      if (p?.urdf) setUrdfText(p.urdf);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-[11px] font-medium border border-indigo-500/40"
                  >
                    SO-101 URDF
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const p = presets.find((x) => x.robot_type === 'so100');
                      if (p?.urdf) setUrdfText(p.urdf);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700"
                  >
                    SO-100 URDF
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".urdf,.xml"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 flex items-center gap-1.5"
                  >
                    <Upload className="w-3 h-3 text-sky-400" />
                    <span>Upload .urdf</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyUrdf}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    title="Copy URDF XML"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadUrdf}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    title="Download .urdf file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              {urdfStatus && (
                <div
                  className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                    urdfStatus.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : urdfStatus.type === 'error'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : 'bg-sky-500/10 border-sky-500/30 text-sky-300'
                  }`}
                >
                  {urdfStatus.type === 'error' ? (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  )}
                  <span>{urdfStatus.message}</span>
                </div>
              )}

              {/* XML Code Editor Textarea */}
              <div className="relative">
                <textarea
                  rows="11"
                  value={urdfText}
                  onChange={(e) => setUrdfText(e.target.value)}
                  placeholder="Paste or edit robot URDF XML here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-[11px] font-mono text-slate-200 focus:border-indigo-500 focus:outline-none leading-relaxed resize-none"
                  spellCheck={false}
                />
              </div>

              {/* Parse & Convert Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-500">
                  Parses &lt;joint&gt; origins, rotation axes, limits & maps to standard DH table.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleParseUrdf}
                    disabled={isParsingUrdf || !urdfText.trim()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 disabled:opacity-50 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isParsingUrdf ? 'Parsing...' : 'Parse URDF -> Generate DH Table'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyUrdf}
                    disabled={isParsingUrdf || !urdfText.trim()}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 disabled:opacity-50 transition-all"
                  >
                    Apply Kinematics
                  </button>
                </div>
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
