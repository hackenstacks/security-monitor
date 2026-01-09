
import React, { useRef } from 'react';
import type { Recording } from '../types';
import { IconBrain, IconClock, IconDelete, IconLoader, IconInfo, IconGoogleDrive, IconCheckCircle, IconCloud } from './Icons';

interface RecordingsGalleryProps {
  recordings: Recording[];
  onDelete: (id: string) => void;
  onAnalyze: (id: string, videoElement: HTMLVideoElement | null) => void;
  onSaveToDrive: (id: string) => void;
  analysisStates: Record<string, boolean>;
}

const RecordingCard: React.FC<{
    recording: Recording;
    onDelete: (id: string) => void;
    onAnalyze: (id: string, videoElement: HTMLVideoElement | null) => void;
    onSaveToDrive: (id: string) => void;
    isAnalyzing: boolean;
}> = ({ recording, onDelete, onAnalyze, onSaveToDrive, isAnalyzing }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:border-cyan-500/50 group">
            <div className="relative group/player">
                <video ref={videoRef} src={recording.blobUrl} controls className="w-full aspect-video bg-black" />
                {recording.cloudStatus === 'saved' && (
                    <div className="absolute top-2 right-2 bg-emerald-600/90 text-white px-2 py-1 rounded-md text-[10px] font-bold flex items-center shadow-lg backdrop-blur-sm">
                        <IconCheckCircle className="h-3 w-3 mr-1" />
                        SYNCED
                    </div>
                )}
            </div>
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-xs text-gray-400">
                        <IconClock className="h-4 w-4 mr-1.5" />
                        <span>{recording.timestamp.toLocaleString()}</span>
                    </div>
                </div>
                
                {recording.analysis && (
                    <div className="bg-gray-900/50 border-l-2 border-cyan-500 p-3 rounded-r-md mb-4 animate-in fade-in slide-in-from-left-2">
                        <p className="text-sm text-gray-300 leading-relaxed italic">
                            <strong className="text-cyan-400 font-bold not-italic mr-2">AI Summary:</strong>
                            {recording.analysis}
                        </p>
                    </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                    <div className="flex space-x-1">
                        <button
                            onClick={() => onDelete(recording.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Purge recording"
                        >
                            <IconDelete className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => onSaveToDrive(recording.id)}
                            disabled={recording.cloudStatus === 'saving' || recording.cloudStatus === 'saved'}
                            className={`p-2 rounded-lg transition-all ${
                                recording.cloudStatus === 'saved' 
                                ? 'text-emerald-500 bg-emerald-500/10 cursor-default'
                                : recording.cloudStatus === 'saving'
                                ? 'text-yellow-500 bg-yellow-500/10'
                                : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10'
                            }`}
                            title={recording.cloudStatus === 'saved' ? "Saved to Cloud" : "Sync to Drive"}
                        >
                            {recording.cloudStatus === 'saving' ? (
                                <IconLoader className="h-5 w-5 animate-spin" />
                            ) : (
                                <IconGoogleDrive className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                    
                    <button
                        onClick={() => onAnalyze(recording.id, videoRef.current)}
                        disabled={isAnalyzing}
                        className="flex items-center px-4 py-2 bg-cyan-600/90 text-white text-xs font-bold rounded-lg hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 transition-all shadow-md active:scale-95"
                    >
                        {isAnalyzing ? (
                            <>
                                <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <IconBrain className="h-4 w-4 mr-2" />
                                Smart Analyze
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const RecordingsGallery: React.FC<RecordingsGalleryProps> = ({ recordings, onDelete, onAnalyze, onSaveToDrive, analysisStates }) => {
  const syncedCount = recordings.filter(r => r.cloudStatus === 'saved').length;

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 border border-gray-700 h-[calc(100vh-12rem)] flex flex-col sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-100 flex items-center">
          <IconCloud className="h-5 w-5 mr-2 text-cyan-400" />
          Event Archive
        </h2>
        <div className="flex items-center space-x-2">
            <span className="text-[10px] bg-emerald-900/40 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20">
                {syncedCount} Synced
            </span>
            <span className="text-[10px] bg-gray-700 text-gray-400 px-2 py-1 rounded-full font-mono">
                {recordings.length} Total
            </span>
        </div>
      </div>
      
      {recordings.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 border-2 border-dashed border-gray-700 rounded-xl bg-gray-900/30 p-8">
          <div className="p-4 bg-gray-800 rounded-full mb-4">
            <IconInfo className="h-10 w-10 text-gray-600" />
          </div>
          <p className="font-bold text-lg text-gray-400">Vault Offline</p>
          <p className="text-sm max-w-[220px] mt-2 italic">Awaiting security triggers to initiate local and cloud capture.</p>
        </div>
      ) : (
        <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          {recordings.map(rec => (
            <RecordingCard 
                key={rec.id} 
                recording={rec}
                onDelete={onDelete}
                onAnalyze={onAnalyze}
                onSaveToDrive={onSaveToDrive}
                isAnalyzing={!!analysisStates[rec.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
};
