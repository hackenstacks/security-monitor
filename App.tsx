
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { LiveFeed } from './components/LiveFeed';
import { SettingsPanel } from './components/SettingsPanel';
import { RecordingsGallery } from './components/RecordingsGallery';
import { analyzeFrame } from './services/geminiService';
import type { Recording, Settings } from './types';
import { captureFrameFromVideo } from './utils/imageUtils';

const App: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [settings, setSettings] = useState<Settings>({
    motionSensitivity: 20,
    soundSensitivity: 10,
    recordingDuration: 10,
    autoSync: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [analysisStates, setAnalysisStates] = useState<Record<string, boolean>>({});

  const handleToggleMonitoring = () => {
    setIsMonitoring(prev => !prev);
    setError(null);
  };

  const downloadFile = (blobUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveToDrive = async (id: string) => {
    const recording = recordings.find(r => r.id === id);
    if (!recording) return;

    setRecordings(prev => prev.map(r => r.id === id ? { ...r, cloudStatus: 'saving' } : r));
    
    try {
      // Simulate API call to Google Drive
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Trigger actual download as the "save" mechanism
      const dateStr = recording.timestamp.toISOString().replace(/[:.]/g, '-');
      downloadFile(recording.blobUrl, `security-event-${dateStr}.webm`);
      
      setRecordings(prev => prev.map(r => r.id === id ? { ...r, cloudStatus: 'saved' } : r));
    } catch (err) {
      console.error("Failed to save to Drive:", err);
      setRecordings(prev => prev.map(r => r.id === id ? { ...r, cloudStatus: 'error' } : r));
    }
  };

  const handleNewRecording = useCallback((blob: Blob) => {
    const newId = Date.now().toString();
    const blobUrl = URL.createObjectURL(blob);
    const newRecording: Recording = {
      id: newId,
      blobUrl: blobUrl,
      timestamp: new Date(),
      analysis: null,
      cloudStatus: 'local',
    };
    
    setRecordings(prev => [newRecording, ...prev]);

    // If autoSync is enabled, trigger the save logic immediately
    if (settings.autoSync) {
      handleSaveToDrive(newId);
    }
  }, [settings.autoSync, recordings]);
  
  const handleDeleteRecording = (id: string) => {
    setRecordings(prev => {
      const recordingToDelete = prev.find(r => r.id === id);
      if (recordingToDelete) {
        URL.revokeObjectURL(recordingToDelete.blobUrl);
      }
      return prev.filter(r => r.id !== id);
    });
  };

  const handleAnalyzeRecording = async (id: string, videoElement: HTMLVideoElement | null) => {
    if (!videoElement) {
      setError("Video element not found for analysis.");
      return;
    }

    setAnalysisStates(prev => ({ ...prev, [id]: true }));
    setError(null);
    
    try {
      const base64Image = await captureFrameFromVideo(videoElement);
      if (!base64Image) {
        throw new Error("Could not capture frame from video.");
      }

      const description = await analyzeFrame(base64Image);
      setRecordings(prev => prev.map(r => r.id === id ? { ...r, analysis: description } : r));

    } catch (err) {
      console.error("Analysis failed:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during analysis.";
      setRecordings(prev => prev.map(r => r.id === id ? { ...r, analysis: `Error: ${errorMessage}` } : r));
    } finally {
      setAnalysisStates(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header isMonitoring={isMonitoring} onToggleMonitoring={handleToggleMonitoring} />
      <main className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        {error && (
          <div className="bg-red-900/40 border border-red-600/50 text-red-200 px-4 py-3 rounded-lg relative mb-6 backdrop-blur-sm" role="alert">
            <strong className="font-bold">System Fault: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <LiveFeed
              isMonitoring={isMonitoring}
              settings={settings}
              onNewRecording={handleNewRecording}
              onError={setError}
            />
            <SettingsPanel settings={settings} onSettingsChange={setSettings} disabled={isMonitoring} />
          </div>
          <div className="lg:col-span-4">
            <RecordingsGallery
              recordings={recordings}
              onDelete={handleDeleteRecording}
              onAnalyze={handleAnalyzeRecording}
              onSaveToDrive={handleSaveToDrive}
              analysisStates={analysisStates}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
