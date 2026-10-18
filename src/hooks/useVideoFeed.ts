import { useState, useRef, useEffect, useCallback } from 'react';
import { VideoSourceMode } from '../types';

export interface VideoFeedState {
  sourceMode: VideoSourceMode;
  setSourceMode: (mode: VideoSourceMode) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isStreamReady: boolean;
  webcamError: string | null;
  uploadedFileName: string | null;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  togglePlayPause: () => void;
  isPlaying: boolean;
}

export function useVideoFeed(): VideoFeedState {
  const [sourceMode, setSourceMode] = useState<VideoSourceMode>('browser_sample');
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const stopActiveStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = '';
    }
  }, []);

  const initWebcam = useCallback(async () => {
    stopActiveStream();
    setWebcamError(null);
    setIsStreamReady(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser context.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 15, max: 30 },
        },
        audio: false,
      });

      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().then(() => {
          setIsStreamReady(true);
          setIsPlaying(true);
        }).catch((err) => {
          setWebcamError(`Webcam playback error: ${err.message}`);
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Webcam permission denied or unavailable';
      setWebcamError(msg);
      // Fallback to sample simulation
      setSourceMode('browser_sample');
    }
  }, [stopActiveStream]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopActiveStream();
    setWebcamError(null);
    setIsStreamReady(false);
    setUploadedFileName(file.name);
    setSourceMode('browser_upload');

    const fileUrl = URL.createObjectURL(file);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = fileUrl;
      videoRef.current.loop = true;
      videoRef.current.muted = true;
      videoRef.current.play().then(() => {
        setIsStreamReady(true);
        setIsPlaying(true);
      }).catch((err) => {
        console.error('Error playing uploaded video:', err);
      });
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    if (sourceMode === 'browser_webcam') {
      initWebcam();
    } else if (sourceMode === 'browser_sample' || sourceMode === 'python_live') {
      stopActiveStream();
      setIsStreamReady(true);
    }
  }, [sourceMode, initWebcam, stopActiveStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopActiveStream();
    };
  }, [stopActiveStream]);

  return {
    sourceMode,
    setSourceMode,
    videoRef,
    isStreamReady,
    webcamError,
    uploadedFileName,
    handleFileUpload,
    togglePlayPause,
    isPlaying,
  };
}
