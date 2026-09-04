import React from 'react';
import { Sliders, Printer, Zap, Package, Smartphone, LayoutDashboard, Bot } from 'lucide-react';

export default function Navbar({
  currentView,
  setCurrentView,
  onOpenEkfModal,
  onOpenRobotModal,
  onAddSample,
  onExportLeRobot,
  robotConfig
}) {
  const robotName = (robotConfig?.robot_type || 'so101').toUpperCase();

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <div className="w-3 h-3 bg-indigo-400 rounded-full animate-pulse" />
        </div>
        <div>
          <h1 className="text-sm font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            OmniKin 3D Trajectory Manager
          </h1>
          <p className="text-[10px] text-slate-400">ArUco + Feature Extraction + IMU EKF Fusion Engine</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* View Switcher Toggle */}
        <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 flex items-center gap-1 mr-2">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              currentView === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setCurrentView('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              currentView === 'mobile'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Logger</span>
          </button>
        </div>

        {/* Robot Setup Button with Active Model Badge */}
        <button
          onClick={onOpenRobotModal}
          className="px-3 py-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Bot className="w-3.5 h-3.5 text-indigo-400" />
          <span>Robot Setup</span>
          <span className="ml-0.5 px-1.5 py-0.2 rounded bg-indigo-500/30 text-[10px] font-mono font-bold text-indigo-200">
            {robotName}
          </span>
        </button>

        {/* Action Buttons */}
        <button
          onClick={onOpenEkfModal}
          className="px-3 py-1.5 rounded-xl border border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 text-xs font-medium flex items-center gap-1.5 transition-all"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>EKF Tuning</span>
        </button>

        <button
          onClick={() => window.open('/api/marker/print_dual', '_blank')}
          className="px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium flex items-center gap-1.5 transition-all"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Dual-ArUco</span>
        </button>

        <button
          onClick={onAddSample}
          className="px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-medium flex items-center gap-1.5 transition-all"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Sample 3D Circle</span>
        </button>

        <button
          onClick={onExportLeRobot}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all"
        >
          <Package className="w-3.5 h-3.5" />
          <span>Export LeRobot</span>
        </button>
      </div>
    </header>
  );
}
