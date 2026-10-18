import React, { useState, useEffect, useRef } from 'react';
import MarkerGeometryEditor from './MarkerGeometryEditor';
import {
  Bot,
  X,
  CheckCircle2,
  RotateCcw,
  RotateCw,
  Crosshair,
  Cpu,
  Move,
  Upload,
  Download,
  Copy,
  Sparkles,
  ShieldCheck,
  Bookmark,
  Save
} from 'lucide-react';

export default function RobotSetupModal({ isOpen, onClose, onConfigSaved, initialTab = 'offset' }) {
  const [config, setConfig] = useState({
    robot_type: 'so_arm101_omni_kin',
    offset_x: 0.038,
    offset_y: -0.406,
    offset_z: 0.00,
    yaw_deg: 90.0,
    q3_safe_max_deg: 0.0,
    aruco_tcp_geometry: {
      '2': { xyz_mm: [-71.522, 56.205, 21], rpy_deg: [0, 0, 0] },
      '3': { xyz_mm: [-71.522, -56.205, 21], rpy_deg: [0, 0, 0] },
    },
  });
  const [presets, setPresets] = useState([]);
  const [activeTab, setActiveTab] = useState(initialTab || 'offset'); // 'offset' | 'gripper' | 'initial_pos' | 'kinematics' | 'urdf'
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalcSuccess, setRecalcSuccess] = useState(false);
  const [geometrySaveStatus, setGeometrySaveStatus] = useState('');

  // URDF Editor State
  const [urdfText, setUrdfText] = useState('');
  const [isParsingUrdf, setIsParsingUrdf] = useState(false);
  const [urdfStatus, setUrdfStatus] = useState(null); // { type: 'success'|'error'|'info', message: '' }
  const [customChain, setCustomChain] = useState(null);
  const [customSpecs, setCustomSpecs] = useState(null);
  const [urdfLinks, setUrdfLinks] = useState([]);
  const [urdfBaseLink, setUrdfBaseLink] = useState('');
  const [urdfTcpLink, setUrdfTcpLink] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    if (initialTab) setActiveTab(initialTab);
    fetch('/api/robot/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          setConfig(data.config);
          if (data.config.custom_urdf_enabled && data.config.custom_specs?.chain) setCustomChain(data.config.custom_specs.chain);
          if (data.config.custom_urdf_enabled && data.config.custom_specs) setCustomSpecs(data.config.custom_specs);
          if (data.config.custom_urdf_enabled && data.config.custom_urdf) setUrdfText(data.config.custom_urdf);
          if (data.config.custom_urdf_enabled) {
            setUrdfBaseLink(data.config.custom_urdf_base_link || data.config.custom_specs?.base_link || '');
            setUrdfTcpLink(data.config.custom_urdf_tcp_link || data.config.custom_specs?.tcp_link || '');
            if (data.config.custom_urdf) {
              fetch('/api/robot/urdf/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ urdf_text: data.config.custom_urdf })
              }).then((res) => res.json()).then((description) => setUrdfLinks(description.links || [])).catch(console.error);
            }
          }
        }
        if (data.presets) {
          setPresets(data.presets);
          const activeP = data.presets.find((p) => p.robot_type === data.config?.robot_type) || data.presets[0];
          if (!data.config?.custom_urdf_enabled) {
            setUrdfText('');
            setCustomChain(null);
            setCustomSpecs(null);
            setUrdfLinks([]);
            setUrdfBaseLink('');
            setUrdfTcpLink('');
          }
          if (activeP && activeP.components && !data.config?.custom_specs) {
            setCustomSpecs(activeP);
          }
        }
      })
      .catch(console.error);
  }, [isOpen]);

  if (!isOpen) return null;

  const isCustomUrdf = Boolean(config.custom_urdf_enabled || config.robot_type === 'custom_urdf' || customChain);

  const currentPreset = presets.find((p) => p.robot_type === config.robot_type) || {
    name: isCustomUrdf ? (customSpecs?.robot_name || config.custom_specs?.robot_name || 'CUSTOM URDF').toUpperCase() : (config.robot_type || 'SO101').toUpperCase(),
    description: isCustomUrdf ? 'Custom URDF Kinematics' : 'Robotic Manipulator',
    reach_meters: (customSpecs?.reach_meters || config.custom_specs?.reach_meters || 0.395),
    payload_kg: 0.50,
    chain: []
  };

  const activeSpecs = customSpecs || (isCustomUrdf ? config.custom_specs : null) || currentPreset;
  const activeChain = customChain || activeSpecs?.chain || currentPreset.chain || [];

  const handleFieldChange = (field, val) => {
    setConfig((prev) => ({ ...prev, [field]: val }));
  };

  const handleModelSelect = (rType) => {
    setCustomChain(null);
    setCustomSpecs(null);
    setUrdfBaseLink('');
    setUrdfTcpLink('');
    setUrdfText('');
    setConfig((prev) => ({
      ...prev,
      robot_type: rType,
      custom_urdf_enabled: false,
      custom_specs: null,
      custom_urdf: null,
      reset_to_preset: true
    }));
  };

  const handleSave = async () => {
    if ((config.custom_urdf_enabled || config.robot_type === 'custom_urdf') && (!customChain || !urdfBaseLink || !urdfTcpLink)) {
      setActiveTab('urdf');
      setUrdfStatus({ type: 'error', message: 'Parse the currently selected custom base-to-TCP chain before saving robot settings.' });
      return;
    }
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const payload = {
        ...config,
        robot_type: customChain ? 'custom_urdf' : config.robot_type,
        custom_urdf_base_link: urdfBaseLink,
        custom_urdf_tcp_link: urdfTcpLink,
        custom_specs: customSpecs,
        custom_urdf: urdfText,
        custom_urdf_enabled: !!(customChain && urdfBaseLink && urdfTcpLink),
        apply_to_episodes: true
      };
      const res = await fetch('/api/robot/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
    if ((config.custom_urdf_enabled || config.robot_type === 'custom_urdf') && (!customChain || !urdfBaseLink || !urdfTcpLink)) {
      setActiveTab('urdf');
      setUrdfStatus({ type: 'error', message: 'Parse the currently selected custom base-to-TCP chain before recalculating.' });
      return;
    }
    setIsRecalculating(true);
    setRecalcSuccess(false);
    try {
      const payloadConfig = {
        ...config,
        robot_type: customChain ? 'custom_urdf' : config.robot_type,
        custom_urdf_base_link: urdfBaseLink,
        custom_urdf_tcp_link: urdfTcpLink,
        custom_specs: customSpecs,
        custom_urdf: urdfText,
        custom_urdf_enabled: !!(customChain && urdfBaseLink && urdfTcpLink)
      };
      // 1. Save config first so server persists latest parameters
      const saveRes = await fetch('/api/robot/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadConfig)
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
          robot_config: payloadConfig,
          all_episodes: true
        })
      });
      const recalcData = await recalcRes.json();
      if (recalcData.status === 'success') {
        setRecalcSuccess(true);
        if (onConfigSaved && recalcData.config) {
          onConfigSaved(recalcData.config);
        }
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

  const saveMarkerGeometry = async () => {
    const geometry = config.aruco_tcp_geometry;
    if (!geometry) {
      setGeometrySaveStatus('Fill all XYZ and RPY fields for both tags.');
      return;
    }
    setGeometrySaveStatus('Saving…');
    try {
      const response = await fetch('/api/robot/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aruco_tcp_geometry: geometry }),
      });
      const data = await response.json();
      if (!response.ok || data.status !== 'success') throw new Error(data.message || 'Could not save CAD marker geometry');
      setConfig(data.config);
      onConfigSaved?.(withoutLegacyCameraOffset(data.config));
      setGeometrySaveStatus('CAD geometry saved for future mobile sessions.');
    } catch (error) {
      setGeometrySaveStatus(error.message);
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
        body: JSON.stringify({ urdf_text: urdfText, base_link: urdfBaseLink || undefined, tcp_link: urdfTcpLink || undefined })
      });
      const data = await res.json();
      setUrdfLinks(data.links || []);
      if (data.base_link || data.base_candidates?.length === 1) setUrdfBaseLink(data.base_link || data.base_candidates[0]);
      if (data.tcp_link || data.tcp_candidates?.length === 1) setUrdfTcpLink(data.tcp_link || data.tcp_candidates[0]);
      if (data.status === 'selection_required') {
        setCustomChain(null);
        setUrdfStatus({ type: 'info', message: data.message || 'Select the arm base and TCP links to continue.' });
        return;
      }
      if (data.status === 'success') {
        setCustomSpecs(data.specs);
        setCustomChain(data.chain);
        setUrdfStatus({
          type: 'success',
          message: `Parsed ${data.chain.filter((joint) => joint.type !== 'fixed').length} selected-chain joints from ${data.base_link} to ${data.tcp_link}.`
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
    if (!urdfBaseLink || !urdfTcpLink) {
      setUrdfStatus({ type: 'error', message: 'Select both the arm base and TCP links before applying.' });
      return;
    }
    setIsParsingUrdf(true);
    try {
      const res = await fetch('/api/robot/urdf/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urdf_text: urdfText, base_link: urdfBaseLink, tcp_link: urdfTcpLink })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCustomChain(data.chain);
        setCustomSpecs(data.specs);
        setUrdfLinks(data.specs?.chain?.flatMap((joint) => [joint.parent, joint.child]) || []);
        setUrdfBaseLink(data.specs?.base_link || urdfBaseLink);
        setUrdfTcpLink(data.specs?.tcp_link || urdfTcpLink);
        if (data.config) {
          setConfig(data.config);
          if (onConfigSaved) onConfigSaved(data.config);
        }
        setUrdfStatus({
          type: 'success',
          message: data.message || 'Custom URDF kinematics applied active.'
        });
      } else {
        setUrdfStatus({
          type: 'error',
          message: data.message || 'Failed to apply URDF.'
        });
      }
    } catch (err) {
      console.error(err);
      setUrdfStatus({
        type: 'error',
        message: `Failed to apply URDF: ${err.message}`
      });
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
        setCustomChain(null);
        setCustomSpecs(null);
        setUrdfLinks([]);
        setUrdfBaseLink('');
        setUrdfTcpLink('');
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
  const isKinematicsTab = activeTab === 'kinematics' || activeTab === 'urdf';

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
              {isCustomUrdf ? `Custom URDF (${activeSpecs?.robot_name || 'custom'})` : config.robot_type}
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
              const isSelected = !isCustomUrdf && p.robot_type === config.robot_type;
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
            {isCustomUrdf && (
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-white text-black shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Custom URDF ({activeSpecs?.robot_name || 'custom'})
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
            onClick={() => setActiveTab(activeTab === 'urdf' ? 'urdf' : 'kinematics')}
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
                  onClick={() => applyPresetPosition(
                    config.base_preset?.offset_x ?? 0.038,
                    config.base_preset?.offset_y ?? -0.406,
                    config.base_preset?.yaw_deg ?? 90
                  )}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-neutral-200 text-black text-[11px] font-semibold transition-colors shadow-sm flex items-center gap-1"
                  title="Apply current preset base position"
                >
                  <Bookmark className="w-3 h-3 text-neutral-700" />
                  <span>Preset ({((config.base_preset?.offset_x ?? 0.038) * 100).toFixed(0)}cm, {((config.base_preset?.offset_y ?? -0.406) * 100).toFixed(0)}cm, {(config.base_preset?.yaw_deg ?? 90).toFixed(0)}°)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newPreset = {
                      offset_x: config.offset_x,
                      offset_y: config.offset_y,
                      offset_z: config.offset_z,
                      yaw_deg: config.yaw_deg
                    };
                    setConfig((prev) => ({ ...prev, base_preset: newPreset }));
                  }}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-[11px] border border-neutral-700 transition-colors flex items-center gap-1"
                  title="Save current slider values as the default Preset position"
                >
                  <Save className="w-3 h-3 text-neutral-400" />
                  <span>Set Current as Preset</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const defPreset = { offset_x: 0.038, offset_y: -0.406, offset_z: 0.0, yaw_deg: 90.0 };
                    setConfig((prev) => ({ ...prev, base_preset: defPreset }));
                    applyPresetPosition(0.038, -0.406, 90);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-[11px] border border-neutral-800 transition-colors"
                  title="Reset preset to default front table position (-41cm, 90°)"
                >
                  Reset Default (-41cm, 90°)
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetPosition(0.00, 0.00, 0)}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-[11px] border border-neutral-800 transition-colors flex items-center gap-1"
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
              <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 flex flex-col gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">Jaw ArUco geometry relative to TCP</h3>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                    Enter the CAD pose of each 22 mm marker at the fully open stop. Positions use millimeters; orientations use XYZ Euler angles in degrees.
                  </p>
                </div>
                <MarkerGeometryEditor
                  value={config.aruco_tcp_geometry}
                  onChange={(value) => setConfig((previous) => ({ ...previous, aruco_tcp_geometry: value }))}
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={saveMarkerGeometry}
                    disabled={!config.aruco_tcp_geometry || isSaving}
                    className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black disabled:opacity-40"
                  >
                    Save CAD geometry
                  </button>
                  <span className="text-xs text-neutral-400" role="status">{geometrySaveStatus}</span>
                </div>
              </section>

              {/* Wrist pitch safety limit */}
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

          {/* TAB 4: URDF KINEMATICS */}
          {isKinematicsTab && (
            <div className="flex flex-col gap-3">
              {/* Sub-Tabs: selected URDF chain and importer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 p-0.5 bg-[#050505] border border-neutral-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setActiveTab('kinematics')}
                    className={`px-3 py-1 rounded-md text-xs transition-colors ${
                      activeTab === 'kinematics'
                        ? 'bg-neutral-800 text-white font-medium'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    URDF Joint Chain
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

                {customChain && (
                  <button
                    type="button"
                    onClick={() => handleModelSelect('so_arm101_omni_kin')}
                    className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset to Preset</span>
                  </button>
                )}
              </div>

              {activeTab === 'kinematics' && (
                <div className="bg-[#050505] border border-neutral-800 rounded-xl overflow-hidden">
                  <div className="px-3 py-2 text-xs text-neutral-400 border-b border-neutral-800">
                    {activeSpecs?.base_link || currentPreset.base_link || urdfBaseLink || 'Base'} → {activeSpecs?.tcp_link || currentPreset.tcp_link || urdfTcpLink || 'TCP'} · URDF origins and axes are used directly.
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0a0a0a] text-neutral-400 text-[10px] uppercase border-b border-neutral-800 tracking-wider">
                        <tr><th className="p-2">#</th><th className="p-2">Joint</th><th className="p-2">Type / state unit</th><th className="p-2">Parent → child</th><th className="p-2">Axis</th><th className="p-2">URDF limits (rad / m)</th></tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                        {activeChain.map((joint, index) => (
                          <tr key={joint.name}>
                            <td className="p-2">{index + 1}</td><td className="p-2 text-white">{joint.name}</td>
                            <td className="p-2">{joint.type}{joint.type === 'fixed' ? '' : ` / ${joint.type === 'prismatic' ? 'm' : 'deg'}`}</td>
                            <td className="p-2">{joint.parent} → {joint.child}</td>
                            <td className="p-2">{joint.type === 'fixed' ? '—' : `[${joint.axis.map((v) => Number(v).toFixed(3)).join(', ')}]`}</td>
                            <td className="p-2">{joint.type === 'fixed' ? 'fixed transform' : joint.type === 'continuous' ? 'unbounded' : `[${joint.limits.map((v) => Number(v).toFixed(4)).join(', ')}]`}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-2.5 bg-[#080808] border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span>{activeSpecs?.joint_names?.length || activeChain.filter((joint) => joint.type !== 'fixed').length} movable joints · state uses degrees for revolute joints and meters for prismatic joints, followed by normalized gripper.</span>
                    <span>Reach: {(((activeSpecs && activeSpecs.reach_meters) || currentPreset.reach_meters) * 100).toFixed(1)} cm</span>
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
                    onChange={(e) => {
                      setUrdfText(e.target.value);
                      setCustomChain(null);
                      setCustomSpecs(null);
                      setUrdfLinks([]);
                      setUrdfBaseLink('');
                      setUrdfTcpLink('');
                    }}
                    placeholder="Paste URDF XML here..."
                    className="w-full bg-[#000000] border border-neutral-800 rounded-xl p-3 text-[11px] font-mono text-neutral-200 focus:border-neutral-600 focus:outline-none resize-none"
                    spellCheck={false}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex flex-col gap-1 text-[11px] text-neutral-400">
                      Arm base link
                      <select
                        value={urdfBaseLink}
                        onChange={(e) => { setUrdfBaseLink(e.target.value); setCustomChain(null); setCustomSpecs(null); }}
                        disabled={!urdfLinks.length}
                        className="bg-[#050505] border border-neutral-800 rounded-lg px-2 py-1.5 text-xs text-neutral-200 disabled:opacity-50"
                      >
                        <option value="">Select base link</option>
                        {urdfLinks.map((link) => <option key={`base-${link}`} value={link}>{link}</option>)}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-[11px] text-neutral-400">
                      TCP link
                      <select
                        value={urdfTcpLink}
                        onChange={(e) => { setUrdfTcpLink(e.target.value); setCustomChain(null); setCustomSpecs(null); }}
                        disabled={!urdfLinks.length}
                        className="bg-[#050505] border border-neutral-800 rounded-lg px-2 py-1.5 text-xs text-neutral-200 disabled:opacity-50"
                      >
                        <option value="">Select TCP link</option>
                        {urdfLinks.map((link) => <option key={`tcp-${link}`} value={link}>{link}</option>)}
                      </select>
                    </label>
                  </div>

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
                      disabled={isParsingUrdf || !urdfText.trim() || !urdfBaseLink || !urdfTcpLink}
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
