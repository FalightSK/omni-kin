import React from 'react';
import { Sliders, Printer, ChevronDown, Zap, Package, Smartphone, LayoutDashboard, Bot, QrCode } from 'lucide-react';

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
  const isCustomUrdf = Boolean(robotConfig?.custom_urdf_enabled || robotConfig?.robot_type === 'custom_urdf' || robotConfig?.custom_urdf);
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

        {/* Print options */}
        <details className="relative">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 text-xs font-medium text-neutral-300 shadow-sm transition-all hover:border-neutral-700 hover:bg-neutral-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
            <Printer className="h-3.5 w-3.5 text-neutral-400" />
            <span>Print</span>
            <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
          </summary>
          <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-lg border border-neutral-800 bg-neutral-950 p-1.5 shadow-xl">
            <a
              href="/api/marker/print_dual"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-0.5 rounded-md px-3 py-2 text-xs text-neutral-200 transition-colors hover:bg-neutral-800 focus-visible:bg-neutral-800 focus-visible:outline-none"
            >
              <span className="font-medium">Table ArUco board</span>
              <span className="text-[11px] text-neutral-500">Print the 10 cm + 5 cm reference markers</span>
            </a>
            <a
              href="/api/marker/print_gripper"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-0.5 rounded-md px-3 py-2 text-xs text-neutral-200 transition-colors hover:bg-neutral-800 focus-visible:bg-neutral-800 focus-visible:outline-none"
            >
              <span className="font-medium">Gripper markers</span>
              <span className="text-[11px] text-neutral-500">Tags 2 and 3 · 22 mm</span>
            </a>
          </div>
        </details>

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
