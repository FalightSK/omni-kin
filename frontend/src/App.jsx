import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import MobileLogger from './pages/MobileLogger';
import EKFTuningModal from './components/EKFTuningModal';
import RobotSetupModal from './components/RobotSetupModal';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpIdx, setSelectedEpIdx] = useState(-1);
  const [isEkfModalOpen, setIsEkfModalOpen] = useState(false);
  const [isRobotModalOpen, setIsRobotModalOpen] = useState(false);
  const [robotConfig, setRobotConfig] = useState({
    robot_type: 'so101',
    offset_x: 0.20,
    offset_y: 0.00,
    offset_z: 0.00,
    yaw_deg: 0.0
  });

  const fetchEpisodes = async () => {
    try {
      const res = await fetch('/api/episodes');
      const data = await res.json();
      setEpisodes(data || []);
      if (data && data.length > 0 && selectedEpIdx === -1) {
        setSelectedEpIdx(data[0].episode_index);
      }
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
      fetchEpisodes();
    } catch (err) {
      console.error(err);
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
    <div className="min-h-screen bg-[#060911] text-gray-100 flex flex-col font-sans">
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenEkfModal={() => setIsEkfModalOpen(true)}
        onOpenRobotModal={() => setIsRobotModalOpen(true)}
        onAddSample={handleAddSample}
        onExportLeRobot={handleExportLeRobot}
        robotConfig={robotConfig}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {currentView === 'dashboard' ? (
          <Dashboard
            episodes={episodes}
            selectedEpIdx={selectedEpIdx}
            setSelectedEpIdx={setSelectedEpIdx}
            onRefreshEpisodes={fetchEpisodes}
            onDeleteEpisode={handleDeleteEpisode}
            robotConfig={robotConfig}
            onOpenRobotModal={() => setIsRobotModalOpen(true)}
          />
        ) : (
          <MobileLogger onUploadSuccess={fetchEpisodes} />
        )}
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
    </div>
  );
}
