import React, { useState, useEffect, Component } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import MobileLogger from './pages/MobileLogger';
import EKFTuningModal from './components/EKFTuningModal';
import RobotSetupModal from './components/RobotSetupModal';
import ConnectPhoneModal from './components/ConnectPhoneModal';
import ExportLeRobotModal from './components/ExportLeRobotModal';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center z-50">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold mb-1">Application Error</h2>
          <p className="text-xs text-slate-400 max-w-md mb-4">
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Application</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const isMobilePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/mobile');
  const [currentView, setCurrentView] = useState(isMobilePath ? 'mobile' : 'dashboard');
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpIdx, setSelectedEpIdx] = useState(-1);
  const [isEkfModalOpen, setIsEkfModalOpen] = useState(false);
  const [isRobotModalOpen, setIsRobotModalOpen] = useState(false);
  const [robotModalTab, setRobotModalTab] = useState('offset');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [trajectoryMode, setTrajectoryMode] = useState('free_form'); // 'free_form' | 'initial_aware'
  const [robotConfig, setRobotConfig] = useState({
    robot_type: 'so_arm101_omni_kin',
    offset_x: 0.038,
    offset_y: -0.406,
    offset_z: 0.00,
    yaw_deg: 90.0,
    gripper_offset: {
      forward_cm: 12.8,
      height_cm: 10.9,
      lateral_cm: 0.0,
      pitch_deg: 40.4,
      roll_deg: 0.0,
      yaw_deg: 0.0,
      enabled: true
    },
    initial_position: {
      x: 0.24,
      y: 0.00,
      z: 0.20,
      pitch: -20.0,
      roll: 0.0,
      yaw: 0.0,
      gripper: 100.0
    }
  });

  const fetchEpisodes = async (preferredIndex = null) => {
    try {
      const res = await fetch('/api/episodes');
      const data = await res.json();
      const list = data || [];
      setEpisodes(list);

      if (list.length === 0) {
        setSelectedEpIdx(-1);
        return;
      }

      setSelectedEpIdx((prevIdx) => {
        if (preferredIndex !== null && list.some((e) => e.episode_index === preferredIndex)) {
          return preferredIndex;
        }
        if (prevIdx !== -1 && list.some((e) => e.episode_index === prevIdx)) {
          return prevIdx;
        }
        return list[0].episode_index;
      });
    } catch (err) {
      console.error("Failed to fetch episodes", err);
    }
  };

  const fetchRobotConfig = async () => {
    try {
      const res = await fetch('/api/robot/config');
      const data = await res.json();
      if (data.config) {
        setRobotConfig(data.config);
      }
    } catch (err) {
      console.error("Failed to fetch robot config", err);
    }
  };

  useEffect(() => {
    fetchEpisodes();
    fetchRobotConfig();
  }, []);

  const handleDeleteEpisode = async (index) => {
    if (!window.confirm(`Delete Episode #${index}?`)) return;
    try {
      await fetch(`/api/episodes/${index}`, { method: 'DELETE' });
      await fetchEpisodes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAllEpisodes = async () => {
    if (!window.confirm("Are you sure you want to CLEAR ALL recorded episodes and datasets? This cannot be undone.")) return;
    try {
      await fetch('/api/episodes/clear', { method: 'POST' });
      await fetchEpisodes();
    } catch (err) {
      console.error("Failed to clear episodes", err);
    }
  };

  const handleAddSample = async () => {
    try {
      await fetch('/api/recordings/sample?shape=circle', { method: 'POST' });
      fetchEpisodes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportLeRobot = () => {
    setIsExportModalOpen(true);
  };

  const handleOpenRobotModal = (tab = 'offset') => {
    setRobotModalTab(tab);
    setIsRobotModalOpen(true);
  };

  const handleReprocessComplete = (newPoses, newEePoses) => {
    setEpisodes((prev) =>
      prev.map((ep) =>
        ep.episode_index === selectedEpIdx
          ? { ...ep, poses: newPoses, ...(newEePoses ? { ee_poses: newEePoses } : {}) }
          : ep
      )
    );
  };

  return (
    <ErrorBoundary>
      {currentView === 'mobile' ? (
        <div className="w-screen h-[100dvh] bg-black text-gray-100 font-sans overflow-hidden select-none">
          <MobileLogger
            onUploadSuccess={fetchEpisodes}
            onExit={() => setCurrentView('dashboard')}
          />
        </div>
      ) : (
        <div className="min-h-screen bg-[#060911] text-gray-100 flex flex-col font-sans">
          <Navbar
            currentView={currentView}
            setCurrentView={setCurrentView}
            onOpenEkfModal={() => setIsEkfModalOpen(true)}
            onOpenRobotModal={() => handleOpenRobotModal('offset')}
            onOpenConnectModal={() => setIsConnectModalOpen(true)}
            onAddSample={handleAddSample}
            onExportLeRobot={handleExportLeRobot}
            robotConfig={robotConfig}
            trajectoryMode={trajectoryMode}
          />

          <main className="flex-1 flex flex-col min-h-0">
            <Dashboard
              episodes={episodes}
              selectedEpIdx={selectedEpIdx}
              setSelectedEpIdx={setSelectedEpIdx}
              onRefreshEpisodes={fetchEpisodes}
              onDeleteEpisode={handleDeleteEpisode}
              onClearAllEpisodes={handleClearAllEpisodes}
              onUpdateEpisodePoses={handleReprocessComplete}
              robotConfig={robotConfig}
              onUpdateRobotConfig={(newCfg) => setRobotConfig(newCfg)}
              onOpenRobotModal={handleOpenRobotModal}
              trajectoryMode={trajectoryMode}
              setTrajectoryMode={setTrajectoryMode}
            />
          </main>

          <EKFTuningModal
            isOpen={isEkfModalOpen}
            onClose={() => setIsEkfModalOpen(false)}
            activeEpisodeIndex={selectedEpIdx}
            onReprocessComplete={handleReprocessComplete}
          />

          <RobotSetupModal
            isOpen={isRobotModalOpen}
            onClose={() => setIsRobotModalOpen(false)}
            robotConfig={robotConfig}
            initialTab={robotModalTab}
            onConfigSaved={(newConfig) => setRobotConfig(newConfig)}
          />

          <ConnectPhoneModal
            isOpen={isConnectModalOpen}
            onClose={() => setIsConnectModalOpen(false)}
          />

          <ExportLeRobotModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            episodes={episodes}
            robotConfig={robotConfig}
            trajectoryMode={trajectoryMode}
            onTrajectoryModeChange={setTrajectoryMode}
          />
        </div>
      )}
    </ErrorBoundary>
  );
}
