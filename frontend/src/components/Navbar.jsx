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
  const robotName = (robotConfig?.robot_type || 'so101').toUpperCase();

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shadow-sm">
          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
            <span>OmniKin</span>
            <span className="text-[10px] font-mono font-normal text-slate-400 border border-slate-800 bg-slate-950/60 px-1.5 py-0.2 rounded">
              v2.0
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 font-normal">ArUco + SLAM + IMU EKF Trajectory Collector</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* View Switcher Toggle */}
        <div className="bg-slate-950/60 p-0.5 rounded-xl border border-slate-800/80 flex items-center gap-1 mr-1">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              currentView === 'dashboard'
                ? 'bg-slate-800 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setCurrentView('mobile')}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              currentView === 'mobile'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Logger</span>
          </button>
        </div>

        {/* Connect Phone QR Button */}
        <button
          onClick={onOpenConnectModal}
          className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
          title="Connect Smartphone Camera via QR Code"
        >
          <QrCode className="w-3.5 h-3.5 text-indigo-400" />
          <span>Connect Phone</span>
        </button>

        {/* Robot Setup Button with Active Model Badge */}
        <button
          onClick={onOpenRobotModal}
          className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Bot className="w-3.5 h-3.5 text-slate-400" />
          <span>Robot Setup</span>
          <span className="ml-0.5 px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700/60 text-[10px] font-mono text-slate-300 font-semibold">
            {robotName}
          </span>
        </button>

        {/* Action Buttons */}
        <button
          onClick={onOpenEkfModal}
          className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Sliders className="w-3.5 h-3.5 text-slate-400" />
          <span>EKF Tuning</span>
        </button>

        <button
          onClick={() => window.open('/api/marker/print_dual', '_blank')}
          className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Printer className="w-3.5 h-3.5 text-slate-400" />
          <span>Print ArUco</span>
        </button>

        <button
          onClick={onAddSample}
          className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Sample Circle</span>
        </button>

        <button
          onClick={onExportLeRobot}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 active:scale-95 transition-all"
          title={`Export LeRobot dataset in ${trajectoryMode === 'initial_aware' ? 'Initial-Position Aware (Fine-Tuning)' : 'Free-Form (Pretraining)'} mode`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Export LeRobot</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-indigo-950/80 text-indigo-200 border border-indigo-400/30">
            {trajectoryMode === 'initial_aware' ? 'Initial-Aware' : 'Free-Form'}
          </span>
        </button>
      </div>
    </header>
  );
}
