import React from 'react';
import { Sliders, Printer, Zap, Package, Smartphone, LayoutDashboard, Bot, QrCode } from 'lucide-react';

export default function Navbar({
  currentView,
  setCurrentView,
  onOpenEkfModal,
  onOpenRobotModal,
  onOpenConnectModal,
  onAddSample,
  onExportLeRobot,
  robotConfig,
  trajectoryMode = 'free_form'
}) {
  const isCustomUrdf = Boolean(robotConfig?.custom_urdf_enabled || robotConfig?.robot_type === 'custom_urdf' || robotConfig?.custom_dh_table);
  const robotName = isCustomUrdf
    ? (robotConfig?.custom_specs?.robot_name || 'CUSTOM-URDF').toUpperCase()
    : (robotConfig?.robot_type || 'so101').toUpperCase().replace(/_/g, '-');

  return (
    <header className="bg-[#0a0a0a]/95 backdrop-blur-md border-b border-neutral-800 px-4 py-2.5 flex items-center justify-between sticky top-0 z-40 select-none">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-sm">
          <div className="w-2 h-2 bg-neutral-300 rounded-full" />
        </div>
        <div>
          <h1 className="text-xs font-semibold tracking-wide text-white uppercase font-mono flex items-center gap-2">
            <span>OmniKin</span>
            <span className="text-[10px] font-mono font-normal text-neutral-400 border border-neutral-800 bg-neutral-900 px-1.5 py-0.2 rounded">
              v2.0
            </span>
          </h1>
          <p className="text-[11px] text-neutral-500 font-normal">Physical Intelligence Data Collector</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* View Switcher Toggle */}
        <div className="bg-neutral-950 p-0.5 rounded-lg border border-neutral-800 flex items-center gap-1 mr-1">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
              currentView === 'dashboard'
                ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setCurrentView('mobile')}
            className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
              currentView === 'mobile'
                ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Logger</span>
          </button>
        </div>

        {/* Connect Phone QR Button */}
        <button
          onClick={onOpenConnectModal}
          className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
          title="Connect Smartphone Camera via QR Code"
        >
          <QrCode className="w-3.5 h-3.5 text-neutral-400" />
          <span>Connect Phone</span>
        </button>

        {/* Robot Setup Button with Active Model Badge */}
        <button
          onClick={onOpenRobotModal}
          className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Bot className="w-3.5 h-3.5 text-neutral-400" />
          <span>Robot Setup</span>
          <span className="ml-0.5 px-1.5 py-0.2 rounded bg-neutral-800 border border-neutral-700 text-[10px] font-mono text-neutral-300 font-semibold">
            {robotName}
          </span>
        </button>

        {/* Action Buttons */}
        <button
          onClick={() => window.open('/api/marker/print_dual', '_blank')}
          className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Printer className="w-3.5 h-3.5 text-neutral-400" />
          <span>Print ArUco</span>
        </button>

        <button
          onClick={onAddSample}
          className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Zap className="w-3.5 h-3.5 text-neutral-400" />
          <span>Sample Demo</span>
        </button>

        {/* Primary Action Button: Stark High-Contrast White */}
        <button
          onClick={onExportLeRobot}
          className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          title={`Export LeRobot dataset in ${trajectoryMode === 'initial_aware' ? 'Initial-Position Aware (Fine-Tuning)' : 'Free-Form (Pretraining)'} mode`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Export LeRobot</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-neutral-200 text-neutral-900">
            {trajectoryMode === 'initial_aware' ? 'Initial-Aware' : 'Free-Form'}
          </span>
        </button>
      </div>
    </header>
  );
}
