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
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';

export default function RobotSetupModal({ isOpen, onClose, robotConfig, onConfigSaved, initialTab = 'offset' }) {
  const [config, setConfig] = useState({
    robot_type: 'so_arm101_omni_kin',
    offset_x: 0.038,
    offset_y: -0.406,
    offset_z: 0.00,
    yaw_deg: 90.0,
    q3_safe_max_deg: 0.0,
    gripper_offset: {
      forward_cm: 12.8,
      height_cm: 10.9,
      lateral_cm: 0.0,
      pitch_deg: 40.4,
      roll_deg: 0.0,
      yaw_deg: 0.0,
      enabled: true
    }
  });
  const [presets, setPresets] = useState([]);
  const [activeTab, setActiveTab] = useState(initialTab || 'offset'); // 'offset' | 'gripper' | 'dh_table' | 'urdf'
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [gripperApplySuccess, setGripperApplySuccess] = useState(false);
  const [autoSyncCadAngle, setAutoSyncCadAngle] = useState(true);

  // URDF Editor State
  const [urdfText, setUrdfText] = useState('');
  const [isParsingUrdf, setIsParsingUrdf] = useState(false);
  const [urdfStatus, setUrdfStatus] = useState(null); // { type: 'success'|'error', message: '' }
  const [customDhTable, setCustomDhTable] = useState(null);
  const [customSpecs, setCustomSpecs] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    if (initialTab) setActiveTab(initialTab);
    fetch('/api/robot/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          setConfig(data.config);
          if (data.config.custom_dh_table) setCustomDhTable(data.config.custom_dh_table);
          if (data.config.custom_specs) setCustomSpecs(data.config.custom_specs);
        }
        if (data.presets) {
          setPresets(data.presets);
          const activeP = data.presets.find((p) => p.robot_type === data.config?.robot_type) || data.presets[0];
          if (activeP && activeP.urdf) {
            setUrdfText(activeP.urdf);
          }
          if (activeP && activeP.components && !data.config?.custom_specs) {
            setCustomSpecs(activeP);
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

  const handleGripperChange = (field, val) => {
    setConfig((prev) => {
      const current = { ...(prev.gripper_offset || {}) };
      let newOffset = { ...current, [field]: val };

      // Two-way CAD sync: theta = arctan(h/d) <=> h = d * tan(theta)
      if (autoSyncCadAngle) {
        const fwd = Number(field === 'forward_cm' ? val : (current.forward_cm ?? 12.8));
        if (field === 'pitch_deg') {
          const rad = (Number(val) * Math.PI) / 180;
          const h = fwd * Math.tan(rad);
          newOffset.height_cm = Math.round(h * 10) / 10;
        } else if (field === 'height_cm') {
          if (fwd > 0.01) {
            const rad = Math.atan2(Number(val), fwd);
            const deg = (rad * 180) / Math.PI;
            newOffset.pitch_deg = Math.round(deg * 10) / 10;
          }
        } else if (field === 'forward_cm') {
          const theta = Number(current.pitch_deg ?? 40.4);
          const rad = (theta * Math.PI) / 180;
          const h = Number(val) * Math.tan(rad);
          newOffset.height_cm = Math.round(h * 10) / 10;
        }
      }

      return {
        ...prev,
        gripper_offset: newOffset
      };
    });
  };

  const applyGripperPreset = (fwd, hgt, lat = 0.0, pitch = 40.4, roll = 0.0, yaw = 0.0) => {
    setConfig((prev) => ({
      ...prev,
      gripper_offset: {
        ...(prev.gripper_offset || {}),
        forward_cm: fwd,
        height_cm: hgt,
        lateral_cm: lat,
        pitch_deg: pitch,
        roll_deg: roll,
        yaw_deg: yaw,
        enabled: true
      }
    }));
  };

  const handleInitialPosChange = (field, val) => {
    setConfig((prev) => ({
      ...prev,
      initial_position: {
        ...(prev.initial_position || {
          x: 0.15,
          y: 0.00,
          z: 0.20,
          pitch: 0.0,
          roll: 0.0,
          yaw: 0.0,
          gripper: 100.0
        }),
        [field]: Number(val)
      }
    }));
  };

  const applyInitialPosPreset = (preset) => {
    setConfig((prev) => ({
      ...prev,
      initial_position: {
        ...(prev.initial_position || {
          x: 0.15,
          y: 0.00,
          z: 0.20,
          pitch: 0.0,
          roll: 0.0,
          yaw: 0.0,
          gripper: 100.0
        }),
        ...preset
      }
    }));
  };

  const handleSaveGripperOffset = async (applyToEpisodes = true) => {
    setIsSaving(true);
    setGripperApplySuccess(false);
    try {
      const payload = {
        ...(config.gripper_offset || {}),
        q3_safe_max_deg: config.q3_safe_max_deg !== undefined ? Number(config.q3_safe_max_deg) : 0.0,
        apply_to_episodes: applyToEpisodes
      };
      const res = await fetch('/api/robot/gripper_offset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status === 'success') {
        setGripperApplySuccess(true);
        if (onConfigSaved) onConfigSaved(config);
        setTimeout(() => setGripperApplySuccess(false), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
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
              onClick={() => setActiveTab('gripper')}
              className={`pb-2.5 flex items-center gap-1.5 transition-colors border-b-2 ${
                activeTab === 'gripper'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Move className="w-3.5 h-3.5 text-cyan-400" />
              <span>Gripper / TCP Offset (6-DoF)</span>
              {config.gripper_offset?.enabled && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('initial_pos')}
              className={`pb-2.5 flex items-center gap-1.5 transition-colors border-b-2 ${
                activeTab === 'initial_pos'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Initial / Home Position</span>
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

          {/* TAB 2: Gripper / TCP Extrinsic Offset Calibration */}
          {activeTab === 'gripper' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between bg-cyan-950/30 border border-cyan-800/40 p-3.5 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                    <Move className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                      <span>Camera-to-Gripper (TCP) Extrinsic Calibration</span>
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/30 text-[9.5px] font-mono font-bold text-cyan-300">
                        6-DoF Rigid Body
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Transforms raw camera tracking into the true physical gripper fingertip trajectory (compensates for camera tilt angle and mount offset).
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700/80">
                  <span className="text-xs font-semibold text-slate-300">Active</span>
                  <input
                    type="checkbox"
                    checked={config.gripper_offset?.enabled ?? true}
                    onChange={(e) => handleGripperChange('enabled', e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 cursor-pointer rounded"
                  />
                </label>
              </div>

              {/* Interactive Side-View CAD Schematic Diagram */}
              {(() => {
                const gCfg = config.gripper_offset || { forward_cm: 12.8, height_cm: 10.9, pitch_deg: 40.4 };
                const pitch = Number(gCfg.pitch_deg ?? 40.4);
                const fwd = Number(gCfg.forward_cm ?? 12.8);
                const hgt = Number(gCfg.height_cm ?? 10.9);

                // Geometric layout coordinates in SVG (560 x 250)
                const mountX = 380;
                const mountY = 170;
                const fwdPx = Math.max(60, Math.min(270, fwd * 18));
                const hgtPx = Math.max(30, Math.min(130, hgt * 11));
                const tipX = mountX - fwdPx;
                const camY = mountY - hgtPx;

                return (
                  <div className="bg-slate-950/90 rounded-2xl border border-slate-800/80 p-3.5 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                    <div className="w-full flex flex-wrap items-center justify-between text-xs text-slate-400 mb-1.5 px-1 gap-2">
                      <span className="font-semibold text-cyan-300 flex items-center gap-1.5 text-[11px]">
                        <Compass className="w-3.5 h-3.5 text-cyan-400" />
                        Handheld Teleoperation Rig CAD Schematic (Side View)
                      </span>
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <button
                          type="button"
                          onClick={() => setAutoSyncCadAngle(!autoSyncCadAngle)}
                          className={`px-2 py-0.5 rounded-lg border text-[10px] font-medium transition-colors flex items-center gap-1 ${
                            autoSyncCadAngle
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                          title="Auto-synchronize angle θ and height h via h = d · tan(θ)"
                        >
                          <span>{autoSyncCadAngle ? '🔗 CAD Auto-Sync: ON' : '🔓 CAD Auto-Sync: OFF'}</span>
                        </button>
                        <span className="text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-800/50">
                          θ = {pitch.toFixed(1)}°
                        </span>
                        <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-800/50">
                          d = {fwd.toFixed(1)}cm
                        </span>
                        <span className="text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded-lg border border-sky-800/50">
                          h = {hgt.toFixed(1)}cm
                        </span>
                      </div>
                    </div>

                    <svg viewBox="0 0 560 250" className="w-full max-w-[560px] h-[215px] select-none">
                      {/* Grid Lines */}
                      <defs>
                        <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.5" />
                        </pattern>
                      </defs>
                      <rect width="560" height="250" fill="url(#cadGrid)" rx="12" />

                      {/* Reference Gripper Centerline (Red Dashed Line, X-Axis Z=0) */}
                      <line x1="30" y1={mountY} x2="520" y2={mountY} stroke="#ef4444" strokeWidth="1.2" strokeDasharray="6,4" strokeOpacity="0.85" />
                      <text x="445" y={mountY - 5} fill="#ef4444" fontSize="8.5" fontFamily="monospace" fontWeight="bold">X-Axis (Centerline)</text>

                      {/* Mount Vertical Reference Line (Green Dashed Line) */}
                      <line x1={mountX} y1="20" x2={mountX} y2="230" stroke="#10b981" strokeWidth="1" strokeDasharray="4,4" strokeOpacity="0.6" />

                      {/* 1. CAD Right Triangle: Gripper TCP -> Camera Drop on Centerline -> Camera Lens */}
                      <polygon
                        points={`${tipX},${mountY} ${mountX},${mountY} ${mountX},${camY}`}
                        fill="#38bdf8"
                        fillOpacity="0.22"
                        stroke="#0284c7"
                        strokeWidth="1.5"
                        strokeDasharray="4,2"
                      />
                      {/* Right Angle Symbol at (mountX, mountY) */}
                      <path
                        d={`M ${mountX - 12} ${mountY} L ${mountX - 12} ${mountY - 12} L ${mountX} ${mountY - 12}`}
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="1.2"
                      />

                      {/* 2. Hypotenuse: Line from Gripper TCP to Camera Lens */}
                      <line x1={tipX} y1={mountY} x2={mountX} y2={camY} stroke="#38bdf8" strokeWidth="2.5" />

                      {/* 3. Tilted Angle Arc θ: Centered at Gripper TCP vs Horizontal X-Axis */}
                      {(() => {
                        const thetaRad = Math.atan2(mountY - camY, mountX - tipX);
                        const arcR = Math.min(54, Math.max(32, (mountX - tipX) * 0.38));
                        const arcEndX = tipX + arcR * Math.cos(thetaRad);
                        const arcEndY = mountY - arcR * Math.sin(thetaRad);
                        const midAngle = thetaRad / 2;
                        const labelX = tipX + (arcR + 18) * Math.cos(midAngle);
                        const labelY = mountY - (arcR + 18) * Math.sin(midAngle) + 4;

                        return (
                          <>
                            <path
                              d={`M ${tipX + arcR} ${mountY} A ${arcR} ${arcR} 0 0 0 ${arcEndX} ${arcEndY}`}
                              fill="none"
                              stroke="#f59e0b"
                              strokeWidth="2.5"
                            />
                            {/* Angle Label with Badge */}
                            <rect
                              x={labelX - 18}
                              y={labelY - 12}
                              width="36"
                              height="16"
                              rx="4"
                              fill="#451a03"
                              stroke="#d97706"
                              strokeWidth="1"
                            />
                            <text
                              x={labelX}
                              y={labelY}
                              fill="#fbbf24"
                              fontSize="9.5"
                              fontWeight="bold"
                              fontFamily="monospace"
                              textAnchor="middle"
                            >
                              ({pitch.toFixed(1)}°)
                            </text>
                          </>
                        );
                      })()}

                      {/* 4. Gripper Pistol Handle (Grey) */}
                      <path
                        d={`M ${mountX - 35} ${mountY + 12} L ${mountX - 45} 242 L ${mountX - 15} 242 L ${mountX - 5} ${mountY + 12} Z`}
                        fill="#334155"
                        stroke="#475569"
                        strokeWidth="1.5"
                      />

                      {/* 5. Gripper Palm Chassis & Jaws (Industrial Cyan & Dark Slate) */}
                      <rect
                        x={tipX + 16}
                        y={mountY - 12}
                        width={Math.max(40, mountX - tipX - 16)}
                        height="24"
                        rx="4"
                        fill="#0369a1"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                      />
                      {/* Jaws Brackets at tipX */}
                      <rect x={tipX - 14} y={mountY - 16} width="16" height="32" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                      {/* Rubber Gripping Pads */}
                      <rect x={tipX - 2} y={mountY - 12} width="4" height="24" rx="1" fill="#10b981" />

                      {/* 6. Orange Mounting Bracket with Pivot Joint */}
                      <path
                        d={`M ${mountX - 16} ${mountY - 12} L ${mountX - 8} ${camY + 26} L ${mountX + 8} ${camY + 26} L ${mountX + 16} ${mountY - 12} Z`}
                        fill="#ea580c"
                        stroke="#c2410c"
                        strokeWidth="1.5"
                      />
                      <circle cx={mountX} cy={camY + 26} r="6" fill="#fb923c" stroke="#ea580c" strokeWidth="1.5" />
                      <circle cx={mountX} cy={camY + 26} r="2.5" fill="#1e293b" />

                      {/* 7. Gripper TCP Crosshair Reticle (Fingertip Origin) */}
                      <circle cx={tipX} cy={mountY} r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
                      <line x1={tipX - 10} y1={mountY} x2={tipX + 10} y2={mountY} stroke="#ffffff" strokeWidth="1" />
                      <line x1={tipX} y1={mountY - 10} x2={tipX} y2={mountY + 10} stroke="#ffffff" strokeWidth="1" />
                      <text x={tipX - 14} y={mountY - 14} fill="#10b981" fontSize="9.5" fontWeight="bold" fontFamily="monospace" textAnchor="end">
                        Gripper TCP (0, 0)
                      </text>

                      {/* 10. Dimension Annotations matching CAD Drawing */}
                      {/* Forward Distance (128.084 mm) */}
                      <line x1={tipX} y1={mountY + 28} x2={mountX} y2={mountY + 28} stroke="#10b981" strokeWidth="1.5" />
                      <line x1={tipX} y1={mountY + 22} x2={tipX} y2={mountY + 34} stroke="#10b981" strokeWidth="1.5" />
                      <line x1={mountX} y1={mountY + 22} x2={mountX} y2={mountY + 34} stroke="#10b981" strokeWidth="1.5" />
                      <text x={(tipX + mountX) / 2} y={mountY + 40} fill="#10b981" fontSize="9.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                        {fwd.toFixed(1)} cm (128.084 mm)
                      </text>

                      {/* Vertical Height (109.075 mm) */}
                      <line x1={mountX + 38} y1={camY} x2={mountX + 38} y2={mountY} stroke="#38bdf8" strokeWidth="1.5" />
                      <line x1={mountX + 32} y1={camY} x2={mountX + 44} y2={camY} stroke="#38bdf8" strokeWidth="1.5" />
                      <line x1={mountX + 32} y1={mountY} x2={mountX + 44} y2={mountY} stroke="#38bdf8" strokeWidth="1.5" />
                      <text x={mountX + 48} y={(camY + mountY) / 2 + 3} fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
                        {hgt.toFixed(1)} cm (109.075 mm)
                      </text>
                    </svg>
                  </div>
                );
              })()}

              {/* Sliders Grid: Pitch Angle, Forward Distance, Height */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Camera Tilt Angle (Pitch) */}
                <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/80 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-semibold text-slate-200">
                        Camera Tilt Angle (Pitch θ vs X-axis)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        value={config.gripper_offset?.pitch_deg ?? 40.4}
                        onChange={(e) => handleGripperChange('pitch_deg', parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-right text-amber-300 font-bold"
                      />
                      <span className="text-xs text-slate-400">°</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    step="0.1"
                    value={config.gripper_offset?.pitch_deg ?? 40.4}
                    onChange={(e) => handleGripperChange('pitch_deg', parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>0° (Level with Gripper)</span>
                    <span className="text-amber-400 font-bold">40.4° (CAD Design)</span>
                    <span>90° (Straight Down)</span>
                  </div>
                </div>

                {/* 2. Forward Distance */}
                <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/80 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Move className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-semibold text-slate-200">
                        Forward Distance (TCP to Cam Drop)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        value={config.gripper_offset?.forward_cm ?? 12.8}
                        onChange={(e) => handleGripperChange('forward_cm', parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-right text-emerald-300 font-bold"
                      />
                      <span className="text-xs text-slate-400">cm</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="0.1"
                    value={config.gripper_offset?.forward_cm ?? 12.8}
                    onChange={(e) => handleGripperChange('forward_cm', parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>0 cm (At Camera)</span>
                    <span className="text-emerald-400 font-bold">12.8 cm (128mm CAD)</span>
                    <span>30 cm</span>
                  </div>
                </div>

                {/* 3. Height Distance */}
                <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/80 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-semibold text-slate-200">
                        Vertical Height (X-axis to Cam Lens)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        value={config.gripper_offset?.height_cm ?? 10.9}
                        onChange={(e) => handleGripperChange('height_cm', parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-right text-sky-300 font-bold"
                      />
                      <span className="text-xs text-slate-400">cm</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="0.1"
                    value={config.gripper_offset?.height_cm ?? 10.9}
                    onChange={(e) => handleGripperChange('height_cm', parseFloat(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>0 cm (Aligned)</span>
                    <span className="text-sky-400 font-bold">10.9 cm (109mm CAD)</span>
                    <span>25 cm</span>
                  </div>
                </div>
              </div>

              {/* 🛡️ Wrist Camera Crash Prevention & Pitch Safety (q3 Limit) */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                        <span>Wrist Camera Crash Prevention (q3 Pitch Ceiling)</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold ${
                          (config.q3_safe_max_deg ?? 0.0) <= 0.0
                            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                            : 'bg-amber-500/20 border border-amber-500/30 text-amber-300'
                        }`}>
                          {(config.q3_safe_max_deg ?? 0.0) <= 0.0 ? '✓ Crash Safe' : '⚠️ Tilt Warning'}
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Enforces joint limit q3 ≤ Max° relative to forearm link. Negative pitch angles point gripper downward for floor pickup, preventing the top-mounted camera bracket from crashing into the forearm link.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.5"
                      value={Number(config.q3_safe_max_deg ?? 0.0).toFixed(1)}
                      onChange={(e) => handleFieldChange('q3_safe_max_deg', parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-right text-emerald-300 font-bold"
                    />
                    <span className="text-xs text-slate-400 font-mono">°</span>
                  </div>
                </div>

                {/* Range Slider */}
                <input
                  type="range"
                  min="-30"
                  max="15"
                  step="0.5"
                  value={Number(config.q3_safe_max_deg ?? 0.0)}
                  onChange={(e) => handleFieldChange('q3_safe_max_deg', parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleFieldChange('q3_safe_max_deg', -5.0)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    >
                      Floor Plunge (-5°)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('q3_safe_max_deg', 0.0)}
                      className="px-2 py-0.5 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/50 font-semibold transition-colors"
                    >
                      Strict Level (0° - Recommended)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('q3_safe_max_deg', 5.0)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    >
                      Relaxed (+5°)
                    </button>
                  </div>
                  <span className={(config.q3_safe_max_deg ?? 0.0) <= 0.0 ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                    {(config.q3_safe_max_deg ?? 0.0) <= 0.0 ? "Zero Camera Collision" : "Allows Upward Wrist Tilt"}
                  </span>
                </div>
              </div>

              {/* Presets Bar */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => applyGripperPreset(12.8, 10.9, 0.0, 40.4)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 text-[11px] font-mono border border-cyan-500/60 flex items-center gap-1 font-semibold shadow-sm"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>⭐ Handheld CAD Rig (40.4° Tilt, 12.8cm Fwd, 10.9cm Hgt)</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyGripperPreset(10.0, 5.8, 0.0, 30.0)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono border border-slate-700/60"
                >
                  🖐️ Direct Hand Grasp (30° Tilt, 10cm Fwd)
                </button>
                <button
                  type="button"
                  onClick={() => applyGripperPreset(0.0, 0.0, 0.0, 0.0)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono border border-slate-700/60 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>🎯 Zero Offset (Direct Camera)</span>
                </button>
              </div>

              {/* Apply to Episodes Action Bar */}
              <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl mt-1">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    Apply offset to existing recorded demonstration trajectories so robot arm and LeRobot export use the true gripper fingertips.
                  </span>
                </div>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveGripperOffset(true)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50 shrink-0 ${
                    gripperApplySuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30'
                  }`}
                >
                  {gripperApplySuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      <span>Applied to Episodes!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                      <span>✨ Apply to Recorded Episodes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB: Initial / Home Position Configuration (Dual-Mode Trajectory System) */}
          {activeTab === 'initial_pos' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between bg-purple-950/30 border border-purple-800/40 p-3.5 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                      <span>Canonical Initial Position (Home / Standby Pose)</span>
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-[9.5px] font-mono font-bold text-purple-300">
                        Fine-Tuning Mode
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      The standardized standby pose for the robot. When Initial-Position Aware mode is active, an automated collision-safe approach trajectory is computed from this Home pose to the first demonstration waypoint.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cartesian Coordinates Card (X, Y, Z in cm) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Initial X */}
                <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Forward (X)</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        value={((config.initial_position?.x ?? 0.15) * 100).toFixed(1)}
                        onChange={(e) => handleInitialPosChange('x', (parseFloat(e.target.value) || 0) / 100)}
                        className="w-16 px-2 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-right text-purple-300 font-bold"
                      />
                      <span className="text-xs text-slate-400">cm</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    step="0.5"
                    value={(config.initial_position?.x ?? 0.15) * 100}
                    onChange={(e) => handleInitialPosChange('x', parseFloat(e.target.value) / 100)}
                    className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>5 cm</span>
                    <span>15 cm (Default)</span>
                    <span>35 cm</span>
                  </div>
                </div>

                {/* Initial Y */}
                <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Lateral (Y)</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        value={((config.initial_position?.y ?? 0.00) * 100).toFixed(1)}
                        onChange={(e) => handleInitialPosChange('y', (parseFloat(e.target.value) || 0) / 100)}
                        className="w-16 px-2 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-right text-purple-300 font-bold"
                      />
                      <span className="text-xs text-slate-400">cm</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    step="0.5"
                    value={(config.initial_position?.y ?? 0.00) * 100}
                    onChange={(e) => handleInitialPosChange('y', parseFloat(e.target.value) / 100)}
                    className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>-20 cm (Left)</span>
                    <span>0 cm (Center)</span>
                    <span>+20 cm (Right)</span>
                  </div>
                </div>

                {/* Initial Z */}
                <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Elevation (Z)</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        value={((config.initial_position?.z ?? 0.20) * 100).toFixed(1)}
                        onChange={(e) => handleInitialPosChange('z', (parseFloat(e.target.value) || 0) / 100)}
                        className="w-16 px-2 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-right text-purple-300 font-bold"
                      />
                      <span className="text-xs text-slate-400">cm</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    step="0.5"
                    value={(config.initial_position?.z ?? 0.20) * 100}
                    onChange={(e) => handleInitialPosChange('z', parseFloat(e.target.value) / 100)}
                    className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>5 cm</span>
                    <span>20 cm (High Standby)</span>
                    <span>35 cm</span>
                  </div>
                </div>
              </div>

              {/* Orientation & Gripper Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Initial Pitch */}
                <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Wrist Pitch</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="1"
                        value={config.initial_position?.pitch ?? 0}
                        onChange={(e) => handleInitialPosChange('pitch', parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-right text-purple-300 font-bold"
                      />
                      <span className="text-xs text-slate-400">°</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    step="1"
                    value={config.initial_position?.pitch ?? 0}
                    onChange={(e) => handleInitialPosChange('pitch', parseFloat(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>-80° (Down)</span>
                    <span>0° (Horizontal)</span>
                    <span>+80° (Up)</span>
                  </div>
                </div>

                {/* Gripper Opening */}
                <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Initial Gripper Aperture</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={config.initial_position?.gripper ?? 100}
                        onChange={(e) => handleInitialPosChange('gripper', parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-right text-purple-300 font-bold"
                      />
                      <span className="text-xs text-slate-400">%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={config.initial_position?.gripper ?? 100}
                    onChange={(e) => handleInitialPosChange('gripper', parseFloat(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>0% (Closed)</span>
                    <span>50% (Neutral)</span>
                    <span>100% (Fully Open)</span>
                  </div>
                </div>
              </div>

              {/* Initial Position Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => applyInitialPosPreset({ x: 0.15, y: 0.00, z: 0.20, pitch: 0.0, roll: 0.0, yaw: 0.0, gripper: 100.0 })}
                  className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-[11px] font-mono border border-purple-500/60 flex items-center gap-1 font-semibold shadow-sm"
                >
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>⭐ High Standby (15cm X, 20cm Z, Open)</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyInitialPosPreset({ x: 0.18, y: 0.00, z: 0.10, pitch: -20.0, roll: 0.0, yaw: 0.0, gripper: 100.0 })}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono border border-slate-700/60"
                >
                  🪂 Tabletop Hover (18cm X, 10cm Z, -20°)
                </button>
                <button
                  type="button"
                  onClick={() => applyInitialPosPreset({ x: 0.12, y: 0.00, z: 0.14, pitch: 40.0, roll: 0.0, yaw: 0.0, gripper: 0.0 })}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono border border-slate-700/60"
                >
                  📦 Compact Park (12cm X, 14cm Z, Closed)
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DH Parameter Table View */}
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

              {/* Kinematic Component Separation Card: Arm Body vs End-Effector */}
              {(() => {
                const compData = customSpecs?.components || currentPreset?.components;
                if (!compData) return null;
                const arm = compData.arm_body;
                const ee = compData.end_effector;

                return (
                  <div className="flex flex-col gap-2 p-3 bg-slate-900/40 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-indigo-300 flex items-center gap-1.5 text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        Component Breakdown: Arm Body vs End-Effector
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        URDF Extracted Hierarchy
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Component A: Arm Body */}
                      <div className="bg-slate-950/70 rounded-xl p-3 border border-indigo-900/50 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                            <span className="text-xs font-bold text-indigo-200">
                              🦾 Arm Body (5-DOF Chain)
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-950/90 border border-indigo-700/60 text-indigo-300">
                            Reach: {arm?.reach_cm ?? '27.5'} cm
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-300 flex flex-col gap-1.5 font-mono">
                          <div className="flex justify-between items-center text-slate-400 text-[10px] bg-slate-900/60 px-2 py-1 rounded">
                            <span>Base / Root Link:</span>
                            <span className="text-indigo-300 font-bold">{arm?.root_link || 'base'}</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-400 text-[10px] bg-slate-900/60 px-2 py-1 rounded">
                            <span>Arm Links ({arm?.links?.length ?? 5}):</span>
                            <span className="text-slate-200">{arm?.links?.map((l) => l.name).join(' → ') || 'base → shoulder → upper_arm → lower_arm → wrist'}</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-400 text-[10px] bg-slate-900/60 px-2 py-1 rounded">
                            <span>Articulated Joints:</span>
                            <span className="text-slate-300">{arm?.joints?.map((j) => j.name.replace('_joint', '')).join(', ') || 'base_yaw, shoulder_pitch, elbow, wrist_pitch'}</span>
                          </div>
                          <div className="flex items-center justify-between pt-1 gap-1 text-[10px]">
                            <span className="px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/40 text-indigo-300">L1 Base: {arm?.link_lengths_cm?.L1_base_height ?? 11.9}cm</span>
                            <span className="px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/40 text-indigo-300">L2 Upper: {arm?.link_lengths_cm?.L2_upper_arm ?? 14.0}cm</span>
                            <span className="px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/40 text-indigo-300">L3 Forearm: {arm?.link_lengths_cm?.L3_forearm ?? 13.5}cm</span>
                          </div>
                        </div>
                      </div>

                      {/* Component B: End-Effector Assembly */}
                      <div className="bg-slate-950/70 rounded-xl p-3 border border-cyan-900/50 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                            <span className="text-xs font-bold text-cyan-200">
                              ✋ End-Effector (Gripper & TCP)
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-700/60 text-cyan-300">
                            TCP Offset: {ee?.tcp_offset_cm ?? '11.0'} cm
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-300 flex flex-col gap-1.5 font-mono">
                          <div className="flex justify-between items-center text-slate-400 text-[10px] bg-slate-900/60 px-2 py-1 rounded">
                            <span>Mounting Flange Joint:</span>
                            <span className="text-amber-300 font-bold">{ee?.flange_joint || 'wrist_roll_joint'} ({ee?.mount_link || 'wrist'} ➔ {ee?.palm_link || 'gripper_base'})</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-400 text-[10px] bg-slate-900/60 px-2 py-1 rounded">
                            <span>Actuation Hub / Gear:</span>
                            <span className="text-sky-300">{ee?.actuator_joints?.[0]?.name || 'gripper_jaw_joint'} ({ee?.actuator_joints?.[0]?.child || 'gripper_gear'})</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-400 text-[10px] bg-slate-900/60 px-2 py-1 rounded">
                            <span>Parallel Finger Jaws:</span>
                            <span className="text-emerald-300 font-bold">{ee?.fingers?.map((f) => f.name.replace('gripper_', '')).join(', ') || 'arm_l, arm_r'} (Stroke: {ee?.fingers?.[0]?.stroke_cm ?? 4.4} cm)</span>
                          </div>
                          <div className="flex items-center justify-between pt-1 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-0.5 rounded text-[10px]">
                            <span className="text-emerald-400 font-semibold">Tool Center Point (TCP):</span>
                            <span className="text-emerald-200 font-mono font-bold">Center of Finger Jaws</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
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
                      const p = presets.find((x) => x.robot_type === 'so_arm101_omni_kin');
                      if (p?.urdf) setUrdfText(p.urdf);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 text-[11px] font-medium border border-cyan-500/50 shadow-sm"
                  >
                    OMNI-KIN URDF (Default)
                  </button>
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

              {/* URDF Extracted Component Breakdown */}
              {(() => {
                const compData = customSpecs?.components || currentPreset?.components;
                if (!compData) return null;
                const arm = compData.arm_body;
                const ee = compData.end_effector;

                return (
                  <div className="flex flex-col gap-2 p-3 bg-slate-950/70 border border-slate-800 rounded-2xl">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-cyan-300 flex items-center gap-1.5 text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        Extracted Assembly Components: Arm Body vs End-Effector
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                        Multi-Branch URDF Parser Active
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Arm Body */}
                      <div className="bg-slate-900/80 rounded-xl p-3 border border-indigo-900/50 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-indigo-400" />
                            🦾 Arm Body (5-DOF Chain)
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-950/90 border border-indigo-700/60 text-indigo-300">
                            Reach: {arm?.reach_cm ?? '27.5'} cm
                          </span>
                        </div>
                        <div className="text-[10.5px] text-slate-300 flex flex-col gap-1 font-mono">
                          <div className="flex justify-between text-slate-400">
                            <span>Root Link:</span>
                            <span className="text-indigo-300 font-bold">{arm?.root_link || 'base'}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Links:</span>
                            <span className="text-slate-200">{arm?.links?.map((l) => l.name).join(' → ') || 'base → shoulder → upper_arm → lower_arm → wrist'}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Joints:</span>
                            <span className="text-slate-300">{arm?.joints?.map((j) => j.name.replace('_joint', '')).join(', ')}</span>
                          </div>
                        </div>
                      </div>

                      {/* End-Effector */}
                      <div className="bg-slate-900/80 rounded-xl p-3 border border-cyan-900/50 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-cyan-200 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-cyan-400" />
                            ✋ End-Effector (Gripper & TCP)
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-700/60 text-cyan-300">
                            TCP: {ee?.tcp_offset_cm ?? '11.0'} cm
                          </span>
                        </div>
                        <div className="text-[10.5px] text-slate-300 flex flex-col gap-1 font-mono">
                          <div className="flex justify-between text-slate-400">
                            <span>Flange Joint:</span>
                            <span className="text-amber-300 font-bold">{ee?.flange_joint || 'wrist_roll_joint'}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Actuator / Drive:</span>
                            <span className="text-sky-300">{ee?.actuator_joints?.[0]?.name || 'gripper_jaw_joint'}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Parallel Fingers:</span>
                            <span className="text-emerald-300 font-bold">{ee?.fingers?.map((f) => f.name.replace('gripper_', '')).join(', ')} (Stroke: {ee?.fingers?.[0]?.stroke_cm ?? 4.4} cm)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
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
