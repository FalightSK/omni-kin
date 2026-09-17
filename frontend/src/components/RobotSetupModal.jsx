import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  X,
  CheckCircle2,
  RotateCcw,
  RotateCw,
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
  ShieldCheck,
  ChevronDown,
  ChevronUp
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
  const [activeTab, setActiveTab] = useState(initialTab || 'offset'); // 'offset' | 'gripper' | 'initial_pos' | 'dh_table' | 'urdf'
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalcSuccess, setRecalcSuccess] = useState(false);
  const [gripperApplySuccess, setGripperApplySuccess] = useState(false);
  const [autoSyncCadAngle, setAutoSyncCadAngle] = useState(true);
  const [showCadSchematic, setShowCadSchematic] = useState(false);

  // URDF Editor State
  const [urdfText, setUrdfText] = useState('');
  const [isParsingUrdf, setIsParsingUrdf] = useState(false);
  const [urdfStatus, setUrdfStatus] = useState(null); // { type: 'success'|'error'|'info', message: '' }
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

  const handleRecalculateAndSave = async () => {
    setIsRecalculating(true);
    setRecalcSuccess(false);
    try {
      // 1. Save config first so server persists latest parameters
      const saveRes = await fetch('/api/robot/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const saveData = await saveRes.json();
      if (saveData.status === 'success' && onConfigSaved) {
        onConfigSaved(saveData.config);
      }

      // 2. Recalculate trajectory for all episodes
      const recalcRes = await fetch('/api/robot/recalculate_trajectory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          robot_config: config,
          all_episodes: true
        })
      });
      const recalcData = await recalcRes.json();
      if (recalcData.status === 'success') {
        setRecalcSuccess(true);
        setTimeout(() => setRecalcSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error recalculating trajectories:', err);
    } finally {
      setIsRecalculating(false);
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
          message: `Parsed "${data.specs.robot_name}" (${data.specs.revolute_joints} joints, Reach: ${(data.specs.reach_meters * 100).toFixed(1)} cm).`
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
        message: `Error parsing URDF: ${err.message}`
      });
    } finally {
      setIsParsingUrdf(false);
    }
  };

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
          message: 'Custom URDF kinematics applied active.'
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
          message: `Loaded ${file.name}. Click Parse URDF below.`
        });
      }
    };
    reader.readAsText(file);
  };

  const handleCopyUrdf = () => {
    navigator.clipboard.writeText(urdfText);
    setUrdfStatus({ type: 'info', message: 'Copied URDF to clipboard.' });
    setTimeout(() => setUrdfStatus(null), 2000);
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
  const isKinematicsTab = activeTab === 'dh_table' || activeTab === 'urdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-[#080808]">
          <div className="flex items-center gap-2.5">
            <Bot className="w-4 h-4 text-white" />
            <h2 className="text-xs font-semibold text-white tracking-wide">
              Robot Configuration
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-300">
              {config.robot_type}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Model Presets Bar */}
        <div className="px-5 py-2.5 bg-[#050505] border-b border-neutral-800/80 flex items-center justify-between text-xs">
          <span className="text-[11px] font-medium text-neutral-400">Model:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {presets.map((p) => {
              const isSelected = p.robot_type === config.robot_type && !customDhTable;
              return (
                <button
                  key={p.robot_type}
                  type="button"
                  onClick={() => handleModelSelect(p.robot_type)}
                  className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                    isSelected
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
            {customDhTable && (
              <span className="px-2 py-0.5 rounded-lg text-[11px] font-mono bg-neutral-800 border border-neutral-700 text-white">
                Custom URDF
              </span>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-2 flex border-b border-neutral-800 gap-6 text-xs bg-[#080808]">
          <button
            onClick={() => setActiveTab('offset')}
            className={`pb-2 transition-colors border-b-2 font-medium flex items-center gap-1.5 ${
              activeTab === 'offset'
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Placement</span>
          </button>

          <button
            onClick={() => setActiveTab('gripper')}
            className={`pb-2 transition-colors border-b-2 font-medium flex items-center gap-1.5 ${
              activeTab === 'gripper'
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Move className="w-3.5 h-3.5" />
            <span>Gripper (TCP)</span>
          </button>

          <button
            onClick={() => setActiveTab('initial_pos')}
            className={`pb-2 transition-colors border-b-2 font-medium flex items-center gap-1.5 ${
              activeTab === 'initial_pos'
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Standby Pose</span>
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'urdf' ? 'urdf' : 'dh_table')}
            className={`pb-2 transition-colors border-b-2 font-medium flex items-center gap-1.5 ${
              isKinematicsTab
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Kinematics</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4 text-left">
          {/* TAB 1: PLACEMENT */}
          {activeTab === 'offset' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-neutral-400 px-0.5">
                <span>Table mounting origin relative to ArUco Tag A:</span>
                <span className="font-mono text-[11px] text-neutral-300">
                  Distance: {(distToMarker * 100).toFixed(1)} cm
                </span>
              </div>

              {/* 3 Column Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Y Offset */}
                <div className="bg-[#050505] p-3 rounded-xl border border-neutral-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-300">Forward (Y)</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        value={(config.offset_y * 100).toFixed(1)}
                        onChange={(e) => handleFieldChange('offset_y', (parseFloat(e.target.value) || 0) / 100)}
                        className="w-14 px-1.5 py-0.5 text-xs font-mono bg-neutral-900 border border-neutral-800 rounded text-right text-white font-medium focus:outline-none"
                      />
                      <span className="text-xs text-neutral-500 font-mono">cm</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="0.5"
                    value={Math.round(config.offset_y * 100)}
                    onChange={(e) => handleFieldChange('offset_y', parseFloat(e.target.value) / 100)}
                    className="w-full accent-white cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                    <span>-50 cm</span>
                    <span>0</span>
                    <span>+50 cm</span>
                  </div>
                </div>

                {/* X Offset */}
                <div className="bg-[#050505] p-3 rounded-xl border border-neutral-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-300">Lateral (X)</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        value={(config.offset_x * 100).toFixed(1)}
                        onChange={(e) => handleFieldChange('offset_x', (parseFloat(e.target.value) || 0) / 100)}
                        className="w-14 px-1.5 py-0.5 text-xs font-mono bg-neutral-900 border border-neutral-800 rounded text-right text-white font-medium focus:outline-none"
                      />
                      <span className="text-xs text-neutral-500 font-mono">cm</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="0.5"
                    value={Math.round(config.offset_x * 100)}
                    onChange={(e) => handleFieldChange('offset_x', parseFloat(e.target.value) / 100)}
                    className="w-full accent-white cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                    <span>-50 cm</span>
                    <span>0</span>
                    <span>+50 cm</span>
                  </div>
                </div>

                {/* Yaw Angle */}
                <div className="bg-[#050505] p-3 rounded-xl border border-neutral-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-300">Heading (Yaw)</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="5"
                        value={config.yaw_deg.toFixed(0)}
                        onChange={(e) => handleFieldChange('yaw_deg', parseFloat(e.target.value) || 0)}
                        className="w-14 px-1.5 py-0.5 text-xs font-mono bg-neutral-900 border border-neutral-800 rounded text-right text-white font-medium focus:outline-none"
                      />
                      <span className="text-xs text-neutral-500 font-mono">°</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="5"
                    value={Math.round(config.yaw_deg)}
                    onChange={(e) => handleFieldChange('yaw_deg', parseFloat(e.target.value))}
                    className="w-full accent-white cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                    <span>-180°</span>
                    <span>0°</span>
                    <span>+180°</span>
                  </div>
                </div>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
                <span className="text-[11px] text-neutral-400 mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPresetPosition(0.038, -0.406, 90)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-neutral-200 text-black text-[11px] font-medium transition-colors shadow-sm"
                >
                  ⭐ Front Table (-41cm, 90°)
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetPosition(0.20, 0.00, 0)}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[11px] border border-neutral-800 transition-colors"
                >
                  Right (+20cm)
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetPosition(0.00, 0.20, -90)}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[11px] border border-neutral-800 transition-colors"
                >
                  Behind (+20cm)
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetPosition(0.00, 0.00, 0)}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[11px] border border-neutral-800 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3 text-neutral-500" />
                  <span>Origin (0,0)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: GRIPPER / TOOL */}
          {activeTab === 'gripper' && (
            <div className="flex flex-col gap-3">
              {/* Top Row: Enable Toggle & Sync */}
              <div className="flex items-center justify-between bg-[#050505] border border-neutral-800 p-2.5 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="gripperActive"
                    checked={config.gripper_offset?.enabled ?? true}
                    onChange={(e) => handleGripperChange('enabled', e.target.checked)}
                    className="w-4 h-4 accent-white cursor-pointer rounded"
                  />
                  <label htmlFor="gripperActive" className="font-medium text-neutral-200 cursor-pointer">
                    Enable 6-DoF TCP Calibration
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoSyncCadAngle(!autoSyncCadAngle)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    autoSyncCadAngle
                      ? 'bg-neutral-900 border border-neutral-700 text-neutral-200'
                      : 'bg-transparent text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {autoSyncCadAngle ? '🔗 Auto-Sync (h = d · tan θ)' : '🔓 Manual Offsets'}
                </button>
              </div>

              {/* 3 Sliders: Forward, Height, Pitch */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Forward Distance */}
                <div className="bg-[#050505] p-3 rounded-xl border border-neutral-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-300">Forward (d)</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        value={config.gripper_offset?.forward_cm ?? 12.8}
                        onChange={(e) => handleGripperChange('forward_cm', parseFloat(e.target.value) || 0)}
                        className="w-14 px-1.5 py-0.5 text-xs font-mono bg-neutral-900 border border-neutral-800 rounded text-right text-white font-medium focus:outline-none"
                      />
                      <span className="text-xs text-neutral-500 font-mono">cm</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="0.1"
                    value={config.gripper_offset?.forward_cm ?? 12.8}
                    onChange={(e) => handleGripperChange('forward_cm', parseFloat(e.target.value))}
                    className="w-full accent-white cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                    <span>0 cm</span>
                    <span>12.8 (Rig)</span>
                    <span>30 cm</span>
                  </div>
                </div>

                {/* Pitch Angle */}
                <div className="bg-[#050505] p-3 rounded-xl border border-neutral-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-300">Tilt Angle (θ)</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        value={config.gripper_offset?.pitch_deg ?? 40.4}
                        onChange={(e) => handleGripperChange('pitch_deg', parseFloat(e.target.value) || 0)}
                        className="w-14 px-1.5 py-0.5 text-xs font-mono bg-neutral-900 border border-neutral-800 rounded text-right text-white font-medium focus:outline-none"
                      />
                      <span className="text-xs text-neutral-500 font-mono">°</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="0.5"
                    value={config.gripper_offset?.pitch_deg ?? 40.4}
                    onChange={(e) => handleGripperChange('pitch_deg', parseFloat(e.target.value))}
                    className="w-full accent-white cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                    <span>0° (Level)</span>
                    <span>40.4°</span>
                    <span>90°</span>
                  </div>
                </div>

                {/* Height Offset */}
                <div className="bg-[#050505] p-3 rounded-xl border border-neutral-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-300">Height (h)</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        value={config.gripper_offset?.height_cm ?? 10.9}
                        onChange={(e) => handleGripperChange('height_cm', parseFloat(e.target.value) || 0)}
                        className="w-14 px-1.5 py-0.5 text-xs font-mono bg-neutral-900 border border-neutral-800 rounded text-right text-white font-medium focus:outline-none"
                      />
                      <span className="text-xs text-neutral-500 font-mono">cm</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="0.1"
                    value={config.gripper_offset?.height_cm ?? 10.9}
                    onChange={(e) => handleGripperChange('height_cm', parseFloat(e.target.value))}
                    className="w-full accent-white cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                    <span>0 cm</span>
                    <span>10.9 (Rig)</span>
                    <span>25 cm</span>
                  </div>
                </div>
              </div>

              {/* Wrist Camera Safety (q3 limit) */}
              <div className="bg-[#050505] p-3 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-300 font-medium">Wrist Pitch Limit (q3):</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleFieldChange('q3_safe_max_deg', 0.0)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                        (config.q3_safe_max_deg ?? 0.0) === 0.0
                          ? 'bg-white text-black font-semibold shadow-sm'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      Strict Level (0°)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('q3_safe_max_deg', -5.0)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                        (config.q3_safe_max_deg ?? 0.0) === -5.0
                          ? 'bg-white text-black font-semibold shadow-sm'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      Floor Pick (-5°)
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1 font-mono text-neutral-400">
                  <input
                    type="number"
                    step="0.5"
                    value={Number(config.q3_safe_max_deg ?? 0.0).toFixed(1)}
                    onChange={(e) => handleFieldChange('q3_safe_max_deg', parseFloat(e.target.value) || 0)}
                    className="w-12 px-1 py-0.5 text-xs font-mono bg-neutral-900 border border-neutral-800 rounded text-right text-white"
                  />
                  <span>°</span>
                </div>
              </div>

              {/* Presets & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span className="text-[11px] text-neutral-400 mr-1">Presets:</span>
                  <button
                    type="button"
                    onClick={() => applyGripperPreset(12.8, 10.9, 0.0, 40.4)}
                    className="px-2 py-0.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-[11px] font-medium transition-colors shadow-sm"
                  >
                    ⭐ OMNI-KIN Rig (12.8cm, 40.4°)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyGripperPreset(10.0, 5.8, 0.0, 30.0)}
                    className="px-2 py-0.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[11px] border border-neutral-800 transition-colors"
                  >
                    Direct Grasp (10cm, 30°)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyGripperPreset(0.0, 0.0, 0.0, 0.0)}
                    className="px-2 py-0.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[11px] border border-neutral-800 transition-colors"
                  >
                    Zero Offset
                  </button>
                </div>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveGripperOffset(true)}
                  className="px-3 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-[11px] font-medium border border-neutral-800 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-neutral-400" />
                  <span>{gripperApplySuccess ? '✓ Applied!' : 'Apply to Recorded Takes'}</span>
                </button>
              </div>

              {/* Collapsible CAD Schematic */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowCadSchematic(!showCadSchematic)}
                  className="text-[11px] font-medium text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  {showCadSchematic ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>{showCadSchematic ? 'Hide CAD Schematic' : 'View CAD Schematic Blueprint'}</span>
                </button>

                {showCadSchematic && (
                  <div className="mt-2 bg-[#050505] rounded-xl border border-neutral-800 p-3 flex flex-col items-center">
                    {(() => {
                      const gCfg = config.gripper_offset || { forward_cm: 12.8, height_cm: 10.9, pitch_deg: 40.4 };
                      const pitch = Number(gCfg.pitch_deg ?? 40.4);
                      const fwd = Number(gCfg.forward_cm ?? 12.8);
                      const hgt = Number(gCfg.height_cm ?? 10.9);
                      const mountX = 380;
                      const mountY = 170;
                      const fwdPx = Math.max(60, Math.min(270, fwd * 18));
                      const hgtPx = Math.max(30, Math.min(130, hgt * 11));
                      const tipX = mountX - fwdPx;
                      const camY = mountY - hgtPx;

                      return (
                        <svg viewBox="0 0 560 250" className="w-full max-w-[500px] h-[190px] select-none">
                          <defs>
                            <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#262626" strokeWidth="0.5" strokeOpacity="0.5" />
                            </pattern>
                          </defs>
                          <rect width="560" height="250" fill="url(#cadGrid)" rx="10" />
                          <line x1="30" y1={mountY} x2="520" y2={mountY} stroke="#737373" strokeWidth="1" strokeDasharray="6,4" />
                          <polygon
                            points={`${tipX},${mountY} ${mountX},${mountY} ${mountX},${camY}`}
                            fill="#ffffff"
                            fillOpacity="0.05"
                            stroke="#737373"
                            strokeWidth="1.2"
                            strokeDasharray="4,2"
                          />
                          <line x1={tipX} y1={mountY} x2={mountX} y2={camY} stroke="#ffffff" strokeWidth="2" />
                          <rect x={tipX + 16} y={mountY - 10} width={Math.max(40, mountX - tipX - 16)} height="20" rx="3" fill="#171717" stroke="#525252" strokeWidth="1" />
                          <rect x={tipX - 10} y={mountY - 14} width="12" height="28" rx="2" fill="#0a0a0a" stroke="#737373" strokeWidth="1" />
                          <circle cx={tipX} cy={mountY} r="4" fill="#ffffff" />
                          <text x={tipX - 10} y={mountY - 10} fill="#ffffff" fontSize="9" fontFamily="monospace" textAnchor="end">
                            TCP (0,0)
                          </text>
                          <circle cx={mountX} cy={camY} r="6" fill="#ffffff" />
                          <text x={mountX + 10} y={camY + 4} fill="#ffffff" fontSize="9" fontFamily="monospace">
                            Camera (d={fwd.toFixed(1)}cm, h={hgt.toFixed(1)}cm)
                          </text>
                        </svg>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: STANDBY / HOME POSE */}
          {activeTab === 'initial_pos' && (
            <div className="flex flex-col gap-3">
              <span className="text-xs text-neutral-400 px-0.5">
                Standby home pose for safe automated approach trajectories:
              </span>

              {/* 3 Columns: X, Y, Z */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* X */}
                <div className="bg-[#050505] p-3 rounded-xl border border-neutral-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-300">Forward (X)</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        value={((config.initial_position?.x ?? 0.15) * 100).toFixed(1)}
                        onChange={(e) => handleInitialPosChange('x', (parseFloat(e.target.value) || 0) / 100)}
                        className="w-14 px-1.5 py-0.5 text-xs font-mono bg-neutral-900 border border-neutral-800 rounded text-right text-white font-medium focus:outline-none"
                      />
                      <span className="text-xs text-neutral-500 font-mono">cm</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    step="0.5"
                    value={(config.initial_position?.x ?? 0.15) * 100}
                    onChange={(e) => handleInitialPosChange('x', parseFloat(e.target.value) / 100)}
                    className="w-full accent-white cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                    <span>5 cm</span>
                    <span>15 cm</span>
                    <span>35 cm</span>
                  </div>
                </div>

                {/* Y */}
                <div className="bg-[#050505] p-3 rounded-xl border border-neutral-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-300">Lateral (Y)</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        value={((config.initial_position?.y ?? 0.00) * 100).toFixed(1)}
                        onChange={(e) => handleInitialPosChange('y', (parseFloat(e.target.value) || 0) / 100)}
                        className="w-14 px-1.5 py-0.5 text-xs font-mono bg-neutral-900 border border-neutral-800 rounded text-right text-white font-medium focus:outline-none"
                      />
                      <span className="text-xs text-neutral-500 font-mono">cm</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    step="0.5"
                    value={(config.initial_position?.y ?? 0.00) * 100}
                    onChange={(e) => handleInitialPosChange('y', parseFloat(e.target.value) / 100)}
                    className="w-full accent-white cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                    <span>-20 cm</span>
                    <span>0 (Center)</span>
                    <span>+20 cm</span>
                  </div>
                </div>

                {/* Z */}
                <div className="bg-[#050505] p-3 rounded-xl border border-neutral-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-300">Elevation (Z)</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        value={((config.initial_position?.z ?? 0.20) * 100).toFixed(1)}
                        onChange={(e) => handleInitialPosChange('z', (parseFloat(e.target.value) || 0) / 100)}
                        className="w-14 px-1.5 py-0.5 text-xs font-mono bg-neutral-900 border border-neutral-800 rounded text-right text-white font-medium focus:outline-none"
                      />
                      <span className="text-xs text-neutral-500 font-mono">cm</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    step="0.5"
                    value={(config.initial_position?.z ?? 0.20) * 100}
                    onChange={(e) => handleInitialPosChange('z', parseFloat(e.target.value) / 100)}
                    className="w-full accent-white cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                    <span>5 cm</span>
                    <span>20 cm</span>
                    <span>35 cm</span>
                  </div>
                </div>
              </div>

              {/* Pitch & Aperture */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[#050505] p-3 rounded-xl border border-neutral-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-300">Wrist Pitch</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="1"
                        value={config.initial_position?.pitch ?? 0}
                        onChange={(e) => handleInitialPosChange('pitch', parseFloat(e.target.value) || 0)}
                        className="w-14 px-1.5 py-0.5 text-xs font-mono bg-neutral-900 border border-neutral-800 rounded text-right text-white font-medium focus:outline-none"
                      />
                      <span className="text-xs text-neutral-500 font-mono">°</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    step="1"
                    value={config.initial_position?.pitch ?? 0}
                    onChange={(e) => handleInitialPosChange('pitch', parseFloat(e.target.value))}
                    className="w-full accent-white cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                    <span>-80° (Down)</span>
                    <span>0° (Level)</span>
                    <span>+80° (Up)</span>
                  </div>
                </div>

                <div className="bg-[#050505] p-3 rounded-xl border border-neutral-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-300">Gripper Aperture</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={config.initial_position?.gripper ?? 100}
                        onChange={(e) => handleInitialPosChange('gripper', parseFloat(e.target.value) || 0)}
                        className="w-14 px-1.5 py-0.5 text-xs font-mono bg-neutral-900 border border-neutral-800 rounded text-right text-white font-medium focus:outline-none"
                      />
                      <span className="text-xs text-neutral-500 font-mono">%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={config.initial_position?.gripper ?? 100}
                    onChange={(e) => handleInitialPosChange('gripper', parseFloat(e.target.value))}
                    className="w-full accent-white cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                    <span>0% (Closed)</span>
                    <span>50%</span>
                    <span>100% (Open)</span>
                  </div>
                </div>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
                <span className="text-[11px] text-neutral-400 mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => applyInitialPosPreset({ x: 0.15, y: 0.00, z: 0.20, pitch: 0.0, roll: 0.0, yaw: 0.0, gripper: 100.0 })}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-neutral-200 text-black text-[11px] font-medium transition-colors shadow-sm"
                >
                  ⭐ High Standby (15cm, 20cm)
                </button>
                <button
                  type="button"
                  onClick={() => applyInitialPosPreset({ x: 0.18, y: 0.00, z: 0.10, pitch: -20.0, roll: 0.0, yaw: 0.0, gripper: 100.0 })}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[11px] border border-neutral-800 transition-colors"
                >
                  Tabletop Hover (18cm, 10cm)
                </button>
                <button
                  type="button"
                  onClick={() => applyInitialPosPreset({ x: 0.12, y: 0.00, z: 0.14, pitch: 40.0, roll: 0.0, yaw: 0.0, gripper: 0.0 })}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[11px] border border-neutral-800 transition-colors"
                >
                  Compact Park
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: KINEMATICS (DH TABLE & URDF CONVERTER) */}
          {isKinematicsTab && (
            <div className="flex flex-col gap-3">
              {/* Sub-Tabs: DH vs URDF */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 p-0.5 bg-[#050505] border border-neutral-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setActiveTab('dh_table')}
                    className={`px-3 py-1 rounded-md text-xs transition-colors ${
                      activeTab === 'dh_table'
                        ? 'bg-neutral-800 text-white font-medium'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    DH Parameters Table
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('urdf')}
                    className={`px-3 py-1 rounded-md text-xs transition-colors ${
                      activeTab === 'urdf'
                        ? 'bg-neutral-800 text-white font-medium'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Custom URDF Importer
                  </button>
                </div>

                {customDhTable && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomDhTable(null);
                      setCustomSpecs(null);
                    }}
                    className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset to Preset</span>
                  </button>
                )}
              </div>

              {/* Subview 1: DH Table */}
              {activeTab === 'dh_table' && (
                <div className="bg-[#050505] border border-neutral-800 rounded-xl overflow-hidden flex flex-col">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0a0a0a] text-neutral-400 text-[10px] uppercase border-b border-neutral-800 tracking-wider">
                        <tr>
                          <th className="p-2">Joint</th>
                          <th className="p-2">Name</th>
                          <th className="p-2">θ Offset</th>
                          <th className="p-2">d (cm)</th>
                          <th className="p-2">a (cm)</th>
                          <th className="p-2">α</th>
                          <th className="p-2">Limits</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                        {activeDhTable.map((row) => (
                          <tr key={row.joint_idx} className="hover:bg-neutral-900/40">
                            <td className="p-2 font-bold text-white">q{row.joint_idx}</td>
                            <td className="p-2 text-neutral-200">{row.name.replace(/q\d+_/, '')}</td>
                            <td className="p-2">{row.theta_offset_deg.toFixed(1)}°</td>
                            <td className="p-2 text-neutral-200">{(row.d * 100).toFixed(1)}</td>
                            <td className="p-2 text-neutral-200">{(row.a * 100).toFixed(1)}</td>
                            <td className="p-2">{row.alpha_deg.toFixed(0)}°</td>
                            <td className="p-2 text-neutral-400 text-[11px]">
                              [{row.limits_deg[0]}°, {row.limits_deg[1]}°]
                            </td>
                          </tr>
                        ))}
                        <tr className="hover:bg-neutral-900/40">
                          <td className="p-2 font-bold text-white">q5</td>
                          <td className="p-2 text-neutral-200">gripper</td>
                          <td className="p-2">—</td>
                          <td className="p-2 text-neutral-500">—</td>
                          <td className="p-2 text-neutral-500">—</td>
                          <td className="p-2">—</td>
                          <td className="p-2 text-neutral-400 text-[11px]">[0%, 100%]</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-2.5 bg-[#080808] border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span>Reach: {(currentPreset.reach_meters * 100).toFixed(1)} cm</span>
                    <span>Payload: {(currentPreset.payload_kg * 1000).toFixed(0)} g</span>
                  </div>
                </div>
              )}

              {/* Subview 2: URDF XML Importer */}
              {activeTab === 'urdf' && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between bg-[#050505] p-2 rounded-xl border border-neutral-800">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-neutral-400">Presets:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const p = presets.find((x) => x.robot_type === 'so_arm101_omni_kin');
                          if (p?.urdf) setUrdfText(p.urdf);
                        }}
                        className="px-2 py-0.5 rounded bg-white hover:bg-neutral-200 text-black text-[11px] font-medium transition-colors"
                      >
                        OMNI-KIN
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const p = presets.find((x) => x.robot_type === 'so101');
                          if (p?.urdf) setUrdfText(p.urdf);
                        }}
                        className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[11px] border border-neutral-800"
                      >
                        SO-101
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const p = presets.find((x) => x.robot_type === 'so100');
                          if (p?.urdf) setUrdfText(p.urdf);
                        }}
                        className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[11px] border border-neutral-800"
                      >
                        SO-100
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
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
                        className="px-2.5 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[11px] border border-neutral-800 flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3 text-neutral-400" />
                        <span>Upload</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyUrdf}
                        className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-900"
                        title="Copy XML"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadUrdf}
                        className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-900"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {urdfStatus && (
                    <div className="p-2 rounded-lg border text-xs bg-neutral-900 border-neutral-800 text-neutral-200">
                      {urdfStatus.message}
                    </div>
                  )}

                  <textarea
                    rows="7"
                    value={urdfText}
                    onChange={(e) => setUrdfText(e.target.value)}
                    placeholder="Paste URDF XML here..."
                    className="w-full bg-[#000000] border border-neutral-800 rounded-xl p-3 text-[11px] font-mono text-neutral-200 focus:border-neutral-600 focus:outline-none resize-none"
                    spellCheck={false}
                  />

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleParseUrdf}
                      disabled={isParsingUrdf || !urdfText.trim()}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-sm disabled:opacity-40 transition-colors"
                    >
                      {isParsingUrdf ? 'Parsing...' : 'Parse URDF'}
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyUrdf}
                      disabled={isParsingUrdf || !urdfText.trim()}
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-medium border border-neutral-800 disabled:opacity-40 transition-colors"
                    >
                      Apply Kinematics
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 flex items-center justify-between bg-[#080808]">
          <div className="text-xs text-neutral-400">
            {saveSuccess && (
              <span className="text-white flex items-center gap-1 font-medium animate-pulse">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Configuration saved & active</span>
              </span>
            )}
            {recalcSuccess && (
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Trajectories recalculated & active</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-neutral-800 text-neutral-300 hover:bg-neutral-900 hover:text-white text-xs font-medium transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleRecalculateAndSave}
              disabled={isSaving || isRecalculating}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-medium border border-neutral-700 shadow-sm transition-colors disabled:opacity-40 flex items-center gap-1.5"
              title="Save config and recompute EE poses and IK reachability for all recorded trajectories"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin text-white' : 'text-neutral-400'}`} />
              <span>{isRecalculating ? 'Recalculating...' : 'Recalculate Trajectories'}</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isRecalculating}
              className="px-4 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-sm transition-colors disabled:opacity-40 flex items-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
