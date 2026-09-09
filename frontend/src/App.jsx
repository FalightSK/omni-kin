import React, { useState, useEffect, Component } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import MobileLogger from './pages/MobileLogger';
import EKFTuningModal from './components/EKFTuningModal';
import RobotSetupModal from './components/RobotSetupModal';
import ConnectPhoneModal from './components/ConnectPhoneModal';
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
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [robotConfig, setRobotConfig] = useState({
    robot_type: 'so_arm101_omni_kin',
    offset_x: 0.038,
    offset_y: -0.406,
    offset_z: 0.00,
    yaw_deg: 90.0
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

  const handleExportLeRobot = async () => {
    try {
      const res = await fetch('/api/export_lerobot', { method: 'POST' });
      const data = await res.json();
      alert(`LeRobot Dataset Exported Successfully!\n\nEmbodiment: ${data.robot_type.toUpperCase()}\nPath: ${data.export_path}\nTotal Episodes: ${data.total_episodes}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReprocessComplete = (newPoses) => {
    setEpisodes((prev) =>
      prev.map((ep) => (ep.episode_index === selectedEpIdx ? { ...ep, poses: newPoses } : ep))
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
            onOpenRobotModal={() => setIsRobotModalOpen(true)}
            onOpenConnectModal={() => setIsConnectModalOpen(true)}
            onAddSample={handleAddSample}
            onExportLeRobot={handleExportLeRobot}
            robotConfig={robotConfig}
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
              onOpenRobotModal={() => setIsRobotModalOpen(true)}
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
            onConfigSaved={(newConfig) => setRobotConfig(newConfig)}
          />

          <ConnectPhoneModal
            isOpen={isConnectModalOpen}
            onClose={() => setIsConnectModalOpen(false)}
          />
        </div>
      )}
    </ErrorBoundary>
  );
}
