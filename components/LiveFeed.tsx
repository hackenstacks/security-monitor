
import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Settings } from '../types';

interface LiveFeedProps {
  isMonitoring: boolean;
  settings: Settings;
  onNewRecording: (blob: Blob) => void;
  onError: (message: string) => void;
}

export const LiveFeed: React.FC<LiveFeedProps> = ({ isMonitoring, settings, onNewRecording, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const motionDetectionIntervalRef = useRef<number | null>(null);
  const soundDetectionIntervalRef = useRef<number | null>(null);
  const isRecordingRef = useRef<boolean>(false);
  const [status, setStatus] = useState<string>('Idle. Press "Start Monitoring" to begin.');

  const cleanup = useCallback(() => {
    if (motionDetectionIntervalRef.current) clearInterval(motionDetectionIntervalRef.current);
    if (soundDetectionIntervalRef.current) clearInterval(soundDetectionIntervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
        videoRef.current.srcObject = null;
    }
    mediaRecorderRef.current = null;
    motionDetectionIntervalRef.current = null;
    soundDetectionIntervalRef.current = null;
  }, []);

  const startRecording = useCallback(() => {
    if (isRecordingRef.current || !streamRef.current) return;

    setStatus('Triggered! Recording...');
    isRecordingRef.current = true;
    const recordedChunks: BlobPart[] = [];
    mediaRecorderRef.current = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      onNewRecording(blob);
      isRecordingRef.current = false;
      setStatus('Monitoring for motion and sound...');
    };

    mediaRecorderRef.current.start();

    setTimeout(() => {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    }, settings.recordingDuration * 1000);
  }, [onNewRecording, settings.recordingDuration]);

  const setupDetection = useCallback(() => {
    if (!streamRef.current) return;
    
    // Sound Detection
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(streamRef.current);
    microphone.connect(analyser);
    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    soundDetectionIntervalRef.current = window.setInterval(() => {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (const amplitude of dataArray) {
        sum += amplitude * amplitude;
      }
      const volume = Math.sqrt(sum / dataArray.length);
      if (volume > settings.soundSensitivity) {
        startRecording();
      }
    }, 200);

    // Motion Detection
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    let lastImageData: ImageData | null = null;
    
    motionDetectionIntervalRef.current = window.setInterval(() => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (lastImageData) {
            const diff = pixelDifference(lastImageData.data, currentImageData.data);
            const motionThreshold = (101 - settings.motionSensitivity) * 10000;
            if (diff > motionThreshold) {
                startRecording();
            }
        }
        lastImageData = currentImageData;
    }, 500);

    setStatus('Monitoring for motion and sound...');
  }, [settings.motionSensitivity, settings.soundSensitivity, startRecording]);

  useEffect(() => {
    const startMonitoring = async () => {
      try {
        setStatus('Requesting permissions...');
        streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
                videoRef.current.play();
                setupDetection();
            }
          };
        }
      } catch (err) {
        console.error('Error accessing media devices.', err);
        onError('Could not access camera/microphone. Please check permissions and refresh.');
        setStatus('Permission denied. Please allow camera and microphone access.');
      }
    };

    if (isMonitoring) {
      startMonitoring();
    } else {
      cleanup();
      setStatus('Idle. Press "Start Monitoring" to begin.');
      isRecordingRef.current = false;
    }

    return cleanup;
  }, [isMonitoring, cleanup, onError, setupDetection]);
  
  const pixelDifference = (data1: Uint8ClampedArray, data2: Uint8ClampedArray) => {
    let diff = 0;
    for (let i = 0; i < data1.length; i += 4) {
      diff += Math.abs(data1[i] - data2[i]);
      diff += Math.abs(data1[i + 1] - data2[i + 1]);
      diff += Math.abs(data1[i + 2] - data2[i + 2]);
    }
    return diff / (data1.length / 4);
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 overflow-hidden">
      <h2 className="text-lg font-semibold text-gray-200 mb-4">Live Feed</h2>
      <div className="relative aspect-video bg-black rounded-md overflow-hidden">
        <video ref={videoRef} muted className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-center text-sm font-medium text-white">
          {status}
        </div>
      </div>
    </div>
  );
};
