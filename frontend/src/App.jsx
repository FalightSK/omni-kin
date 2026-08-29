import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import MobileLogger from './pages/MobileLogger';
import EKFTuningModal from './components/EKFTuningModal';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpIdx, setSelectedEpIdx] = useState(-1);
  const [isEkfModalOpen, setIsEkfModalOpen] = useState(false);

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

  useEffect(() => {
    fetchEpisodes();
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
      alert(`LeRobot Dataset Exported Successfully!\n\nPath: ${data.export_path}\nTotal Episodes: ${data.total_episodes}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleIsaacReplay = async () => {
    const targetIdx = selectedEpIdx >= 0 ? selectedEpIdx : 0;
    try {
      const res = await fetch(`/api/isaac_lab/replay?episode_index=${targetIdx}`, { method: 'POST' });
      const data = await res.json();
      alert(data.message || 'Isaac Lab launched!');
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
        onAddSample={handleAddSample}
        onExportLeRobot={handleExportLeRobot}
        onIsaacReplay={handleIsaacReplay}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {currentView === 'dashboard' ? (
          <Dashboard
            episodes={episodes}
            selectedEpIdx={selectedEpIdx}
            setSelectedEpIdx={setSelectedEpIdx}
            onRefreshEpisodes={fetchEpisodes}
            onDeleteEpisode={handleDeleteEpisode}
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
    </div>
  );
}
