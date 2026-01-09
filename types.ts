
export interface Recording {
  id: string;
  blobUrl: string;
  timestamp: Date;
  analysis: string | null;
  cloudStatus: 'local' | 'saving' | 'saved' | 'error';
}

export interface Settings {
  motionSensitivity: number;
  soundSensitivity: number;
  recordingDuration: number;
  autoSync: boolean;
}
