import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TelemetryData, VideoSourceMode } from '../types';
import { BrowserEdgePipeline } from '../engine/edgeEngine';
import {
  Camera, Video, Upload, Radio, Play, Pause, Activity,
  ShieldCheck, Zap, Grid2x2, Moon, Sun, Wifi, WifiOff,
} from 'lucide-react';

interface StreamViewerProps {
  sourceMode: VideoSourceMode;
  setSourceMode: (mode: VideoSourceMode) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  telemetry: TelemetryData | null;
  setTelemetry: (t: TelemetryData) => void;
  pythonStream: TelemetryData | null;
  isPythonConnected: boolean;
  isPlaying: boolean;
  togglePlayPause: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedFileName: string | null;
  webcamError: string | null;
}

// Simulated scene data for multi-camera view
const CAMERA_CONFIGS = [
  {
    id: 'cam-01',
    label: 'Loading Dock A',
    cycle: 12,
    activeDuration: 4.5,
    offset: 0,
    objectColor: '#E2E8F0',
    cargoColor: '#F59E0B',
  },
  {
    id: 'cam-02',
    label: 'Corridor B',
    cycle: 8,
    activeDuration: 2.5,
    offset: 3,
    objectColor: '#D1D5DB',
    cargoColor: '#3B82F6',
  },
  {
    id: 'cam-03',
    label: 'Perimeter C',
    cycle: 18,
    activeDuration: 5,
    offset: 7,
    objectColor: '#F3F4F6',
    cargoColor: '#EF4444',
  },
  {
    id: 'cam-04',
    label: 'Entry Gate D',
    cycle: 10,
    activeDuration: 3,
    offset: 2,
    objectColor: '#E5E7EB',
    cargoColor: '#8B5CF6',
  },
];

function drawScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  camIdx: number,
  nightMode: boolean,
) {
  const cam = CAMERA_CONFIGS[camIdx];
  const phase = (t + cam.offset) % cam.cycle;
  const isActive = phase < cam.activeDuration;

  if (nightMode) {
    // Night mode: dark green-tinted IR look
    ctx.fillStyle = '#080F0A';
    ctx.fillRect(0, 0, width, height);
    // Floor
    ctx.fillStyle = '#0D1810';
    ctx.fillRect(0, height * 0.65, width, height * 0.35);
    // Walls / structures
    ctx.fillStyle = '#0A1409';
    ctx.fillRect(width * 0.08, height * 0.2, width * 0.25, height * 0.45);
    ctx.fillRect(width * 0.67, height * 0.2, width * 0.25, height * 0.45);
    // IR scanline noise
    for (let y = 0; y < height; y += 4) {
      ctx.fillStyle = `rgba(0,255,80,${Math.random() * 0.015})`;
      ctx.fillRect(0, y, width, 1);
    }
  } else {
    // Day mode
    ctx.fillStyle = '#1A2932';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#263C47';
    ctx.fillRect(0, height * 0.65, width, height * 0.35);
    ctx.fillStyle = '#132128';
    ctx.fillRect(width * 0.08, height * 0.2, width * 0.25, height * 0.45);
    ctx.fillRect(width * 0.67, height * 0.2, width * 0.25, height * 0.45);
  }

  // Moving object
  if (isActive) {
    const progress = phase / cam.activeDuration;
    const x = -80 + (width + 160) * progress;
    const y = height * 0.58;

    if (nightMode) {
      // IR hot signature
      const grad = ctx.createRadialGradient(x + 35, y + 18, 2, x + 35, y + 18, 50);
      grad.addColorStop(0, 'rgba(180,255,180,0.9)');
      grad.addColorStop(0.4, 'rgba(80,200,80,0.4)');
      grad.addColorStop(1, 'rgba(0,100,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x - 10, y - 30, 90, 80);
      // Object silhouette
      ctx.fillStyle = 'rgba(220,255,220,0.85)';
      ctx.fillRect(x, y, 70, 36);
      ctx.fillRect(x + 10, y - 22, 50, 22);
    } else {
      ctx.fillStyle = cam.objectColor;
      ctx.fillRect(x, y, 70, 36);
      ctx.fillStyle = cam.cargoColor;
      ctx.fillRect(x + 10, y - 22, 50, 22);
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(x + 18, y + 36, 8, 0, Math.PI * 2);
      ctx.arc(x + 52, y + 36, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Timestamp overlay
  const now = new Date();
  const ts = `${now.toLocaleTimeString('en-US', { hour12: false })}`;
  ctx.fillStyle = nightMode ? 'rgba(0,255,80,0.7)' : 'rgba(255,255,255,0.55)';
  ctx.font = `${Math.round(width * 0.025)}px JetBrains Mono, monospace`;
  ctx.textAlign = 'left';
  ctx.fillText(ts, 6, 16);

  // Camera ID
  ctx.textAlign = 'right';
  ctx.fillText(cam.id.toUpperCase(), width - 6, 16);
}

export const StreamViewer: React.FC<StreamViewerProps> = ({
  sourceMode,
  setSourceMode,
  videoRef,
  telemetry,
  setTelemetry,
  pythonStream,
  isPythonConnected,
  isPlaying,
  togglePlayPause,
  handleFileUpload,
  uploadedFileName,
  webcamError,
}) => {
  const rawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const edgeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sampleTimeRef = useRef<number>(0);
  const pipelineRef = useRef<BrowserEdgePipeline>(new BrowserEdgePipeline());
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Multi-cam canvases (4 cameras)
  const multiCamRefs = [
    useRef<HTMLCanvasElement | null>(null),
    useRef<HTMLCanvasElement | null>(null),
    useRef<HTMLCanvasElement | null>(null),
    useRef<HTMLCanvasElement | null>(null),
  ];

  const [activeTab, setActiveTab] = useState<'both' | 'raw' | 'edge' | 'multicam'>('both');
  const [lastPythonB64, setLastPythonB64] = useState<string | null>(null);
  const [nightMode, setNightMode] = useState(false);
  const [rtspUrl, setRtspUrl] = useState('');
  const [showRtspInput, setShowRtspInput] = useState(false);
  // Per-camera activity state for multi-cam
  const [camActivity, setCamActivity] = useState<('ACTIVE' | 'IDLE')[]>(['IDLE', 'IDLE', 'IDLE', 'IDLE']);

  useEffect(() => {
    if (pythonStream?.roiB64) {
      setLastPythonB64(pythonStream.roiB64);
    }
  }, [pythonStream?.roiB64]);

  // Synthetic sample scene simulation (single camera)
  const drawSampleScene = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, t: number) => {
    drawScene(ctx, width, height, t, 0, nightMode);
  }, [nightMode]);

  // Main rendering loop for browser engine (single cam)
  useEffect(() => {
    let animId: number;
    let lastRenderTime = performance.now();
    let lastCvProcessTime = 0;
    const CV_INTERVAL_MS = 1000 / 15;

    const analysisW = 128;
    const analysisH = 72;

    const offCanvas = document.createElement('canvas');
    offCanvas.width = analysisW;
    offCanvas.height = analysisH;
    const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });

    const maskCtx = maskCanvasRef.current?.getContext('2d');
    let latestTelemetry: TelemetryData | null = null;

    const renderLoop = (now: number) => {
      if (sourceMode !== 'python_live' && isPlaying) {
        const dt = Math.min(0.1, (now - lastRenderTime) / 1000);
        lastRenderTime = now;
        sampleTimeRef.current += dt;

        const rawCanvas = rawCanvasRef.current;
        const edgeCanvas = edgeCanvasRef.current;

        if (rawCanvas && edgeCanvas && offCtx) {
          const rawCtx = rawCanvas.getContext('2d');
          const edgeCtx = edgeCanvas.getContext('2d');

          const w = rawCanvas.width || 640;
          const h = rawCanvas.height || 360;

          if (sourceMode === 'browser_sample') {
            drawSampleScene(offCtx, analysisW, analysisH, sampleTimeRef.current);
            if (rawCtx) {
              drawSampleScene(rawCtx, w, h, sampleTimeRef.current);
            }
          } else if ((sourceMode === 'browser_webcam' || sourceMode === 'browser_upload') && videoRef.current) {
            const v = videoRef.current;
            if (v.readyState >= 2) {
              offCtx.drawImage(v, 0, 0, analysisW, analysisH);
              if (rawCtx) {
                rawCtx.drawImage(v, 0, 0, w, h);
              }
            }
          }

          if (now - lastCvProcessTime >= CV_INTERVAL_MS) {
            lastCvProcessTime = now;
            const imgData = offCtx.getImageData(0, 0, analysisW, analysisH);
            const tResult = pipelineRef.current.processFrame(imgData, w, h, maskCtx || undefined);
            latestTelemetry = tResult;
            setTelemetry(tResult);
          }

          if (edgeCtx) {
            edgeCtx.fillStyle = '#0B1318';
            edgeCtx.fillRect(0, 0, w, h);

            const curState = latestTelemetry?.state ?? 'IDLE';
            const curRoi = latestTelemetry?.roiBox;

            if (curState === 'ACTIVE' || curState === 'HEARTBEAT') {
              if (sourceMode === 'browser_sample') {
                drawSampleScene(edgeCtx, w, h, sampleTimeRef.current);
              } else if (videoRef.current && videoRef.current.readyState >= 2) {
                edgeCtx.drawImage(videoRef.current, 0, 0, w, h);
              }

              if (curState === 'ACTIVE' && curRoi) {
                const [rx, ry, rw, rh] = curRoi;
                edgeCtx.fillStyle = 'rgba(11, 19, 24, 0.75)';
                edgeCtx.fillRect(0, 0, w, ry);
                edgeCtx.fillRect(0, ry + rh, w, h - (ry + rh));
                edgeCtx.fillRect(0, ry, rx, rh);
                edgeCtx.fillRect(rx + rw, ry, w - (rx + rw), rh);

                edgeCtx.strokeStyle = '#2DD4BF';
                edgeCtx.lineWidth = 2.5;
                edgeCtx.strokeRect(rx, ry, rw, rh);

                const len = 12;
                edgeCtx.strokeStyle = '#FFFFFF';
                edgeCtx.lineWidth = 3;
                edgeCtx.beginPath();
                edgeCtx.moveTo(rx, ry + len); edgeCtx.lineTo(rx, ry); edgeCtx.lineTo(rx + len, ry);
                edgeCtx.stroke();
                edgeCtx.beginPath();
                edgeCtx.moveTo(rx + rw, ry + rh - len); edgeCtx.lineTo(rx + rw, ry + rh); edgeCtx.lineTo(rx + rw - len, ry + rh);
                edgeCtx.stroke();
              }
            } else {
              if (sourceMode === 'browser_sample') {
                drawSampleScene(edgeCtx, w, h, sampleTimeRef.current);
              } else if (videoRef.current && videoRef.current.readyState >= 2) {
                edgeCtx.drawImage(videoRef.current, 0, 0, w, h);
              }
              edgeCtx.fillStyle = 'rgba(11, 19, 24, 0.85)';
              edgeCtx.fillRect(0, 0, w, h);
              edgeCtx.fillStyle = '#2DD4BF';
              edgeCtx.font = '13px JetBrains Mono, monospace';
              edgeCtx.textAlign = 'center';
              edgeCtx.fillText('IDLE: Scene Unchanged — Uplink Throttled', w / 2, h / 2 - 8);
              edgeCtx.fillStyle = '#64748B';
              edgeCtx.font = '11px JetBrains Mono, monospace';
              edgeCtx.fillText('Zero redundant frames transmitted (48B heartbeat ping)', w / 2, h / 2 + 14);
            }
          }
        }
      } else {
        lastRenderTime = now;
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [sourceMode, isPlaying, drawSampleScene, setTelemetry, videoRef]);

  // Multi-camera rendering loop
  useEffect(() => {
    if (activeTab !== 'multicam') return;

    let animId: number;
    let lastRenderTime = performance.now();
    const FPS = 15;
    const interval = 1000 / FPS;
    let lastFrameTime = 0;

    const renderLoop = (now: number) => {
      const dt = Math.min(0.1, (now - lastRenderTime) / 1000);
      lastRenderTime = now;
      sampleTimeRef.current += dt;

      if (now - lastFrameTime >= interval) {
        lastFrameTime = now;

        const newActivity: ('ACTIVE' | 'IDLE')[] = [];
        CAMERA_CONFIGS.forEach((cam, idx) => {
          const canvas = multiCamRefs[idx].current;
          if (!canvas) { newActivity.push('IDLE'); return; }
          const ctx = canvas.getContext('2d');
          if (!ctx) { newActivity.push('IDLE'); return; }

          const t = sampleTimeRef.current;
          const phase = (t + cam.offset) % cam.cycle;
          const isActive = phase < cam.activeDuration;
          newActivity.push(isActive ? 'ACTIVE' : 'IDLE');

          drawScene(ctx, canvas.width, canvas.height, t, idx, nightMode);

          // Eco-Vision overlay on multi-cam
          if (!isActive) {
            ctx.fillStyle = 'rgba(11,19,24,0.72)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#2DD4BF';
            ctx.font = `${Math.round(canvas.width * 0.032)}px JetBrains Mono, monospace`;
            ctx.textAlign = 'center';
            ctx.fillText('IDLE — Uplink OFF', canvas.width / 2, canvas.height / 2);
          } else {
            // Draw active ROI box simulation
            const roiX = canvas.width * 0.1;
            const roiW = canvas.width * 0.8;
            const roiY = canvas.height * 0.35;
            const roiH = canvas.height * 0.45;
            ctx.strokeStyle = '#2DD4BF';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(roiX, roiY, roiW, roiH);
          }
        });

        setCamActivity(newActivity);
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, nightMode]);

  const activeTelemetry = sourceMode === 'python_live' ? pythonStream : telemetry;

  const activeCamCount = camActivity.filter(s => s === 'ACTIVE').length;
  const totalCams = CAMERA_CONFIGS.length;

  return (
    <div className="space-y-4">
      {/* Source Selector & Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-eco-border bg-eco-card p-3 shadow-lg">
        {/* Source Modes */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setSourceMode('browser_sample')}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              sourceMode === 'browser_sample'
                ? 'bg-eco-teal/20 text-eco-teal border border-eco-teal/40 shadow-sm'
                : 'text-eco-muted hover:bg-eco-surface hover:text-eco-ink'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Sample Footage</span>
          </button>

          <button
            onClick={() => setSourceMode('browser_webcam')}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              sourceMode === 'browser_webcam'
                ? 'bg-eco-teal/20 text-eco-teal border border-eco-teal/40 shadow-sm'
                : 'text-eco-muted hover:bg-eco-surface hover:text-eco-ink'
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>Live Webcam</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              sourceMode === 'browser_upload'
                ? 'bg-eco-teal/20 text-eco-teal border border-eco-teal/40 shadow-sm'
                : 'text-eco-muted hover:bg-eco-surface hover:text-eco-ink'
            }`}
          >
            <Upload className="h-4 w-4" />
            <span>{uploadedFileName ? uploadedFileName.slice(0, 14) + '...' : 'Upload Video'}</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="video/mp4,video/webm"
            className="hidden"
          />

          <button
            onClick={() => setSourceMode('python_live')}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              sourceMode === 'python_live'
                ? 'bg-eco-teal/20 text-eco-teal border border-eco-teal/40 shadow-sm'
                : 'text-eco-muted hover:bg-eco-surface hover:text-eco-ink'
            }`}
          >
            <Radio className={`h-4 w-4 ${isPythonConnected ? 'text-eco-green animate-pulse' : ''}`} />
            <span>Python Edge {isPythonConnected ? '(Live)' : '(ws)'}</span>
          </button>

          {/* RTSP / IP Camera Input */}
          <button
            onClick={() => setShowRtspInput(v => !v)}
            title="Connect real CCTV / RTSP stream"
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              showRtspInput
                ? 'bg-eco-amber/15 text-eco-amber border border-eco-amber/40'
                : 'text-eco-muted hover:bg-eco-surface hover:text-eco-ink'
            }`}
          >
            {isPythonConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span>RTSP / IP Cam</span>
          </button>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Night Mode Toggle */}
          <button
            onClick={() => setNightMode(v => !v)}
            title={nightMode ? 'Switch to Day Mode' : 'Switch to Night/IR Mode'}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
              nightMode
                ? 'border-green-500/40 bg-green-900/20 text-green-400'
                : 'border-eco-border bg-eco-surface text-eco-muted hover:text-eco-ink'
            }`}
          >
            {nightMode ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            <span>{nightMode ? 'IR/Night' : 'Day'}</span>
          </button>

          {sourceMode !== 'python_live' && (
            <button
              onClick={togglePlayPause}
              className="inline-flex items-center gap-1.5 rounded-lg border border-eco-border bg-eco-surface px-3 py-1.5 text-xs font-medium text-eco-ink hover:border-eco-teal/50"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5 text-eco-amber" /> : <Play className="h-3.5 w-3.5 text-eco-teal" />}
              <span>{isPlaying ? 'Pause' : 'Resume'}</span>
            </button>
          )}

          {/* View Toggle */}
          <div className="hidden sm:flex rounded-lg border border-eco-border bg-eco-surface p-0.5 text-xs">
            <button
              onClick={() => setActiveTab('both')}
              className={`rounded-md px-2.5 py-1 ${activeTab === 'both' ? 'bg-eco-card text-eco-teal font-semibold shadow-xs' : 'text-eco-muted'}`}
            >
              Split
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`rounded-md px-2.5 py-1 ${activeTab === 'raw' ? 'bg-eco-card text-eco-teal font-semibold shadow-xs' : 'text-eco-muted'}`}
            >
              Raw
            </button>
            <button
              onClick={() => setActiveTab('edge')}
              className={`rounded-md px-2.5 py-1 ${activeTab === 'edge' ? 'bg-eco-card text-eco-teal font-semibold shadow-xs' : 'text-eco-muted'}`}
            >
              Eco-Vision
            </button>
            <button
              onClick={() => setActiveTab('multicam')}
              className={`rounded-md px-2.5 py-1 inline-flex items-center gap-1 ${activeTab === 'multicam' ? 'bg-eco-card text-eco-teal font-semibold shadow-xs' : 'text-eco-muted'}`}
            >
              <Grid2x2 className="h-3 w-3" />
              4-Cam
            </button>
          </div>
        </div>
      </div>

      {/* RTSP URL Input Panel */}
      {showRtspInput && (
        <div className="rounded-xl border border-eco-amber/30 bg-eco-amber/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-eco-amber" />
            <h3 className="text-xs font-bold font-mono text-eco-amber">RTSP / IP Camera Connection</h3>
            <span className="ml-auto text-[10px] font-mono text-eco-muted rounded-full border border-eco-muted/30 px-2 py-0.5">Requires Python Edge Worker</span>
          </div>
          <p className="text-xs text-eco-muted leading-relaxed">
            Enter your CCTV camera's RTSP stream URL or IP camera HTTP feed. The Python Edge Worker
            will capture frames locally and process them through the Eco-Vision pipeline.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={rtspUrl}
              onChange={e => setRtspUrl(e.target.value)}
              placeholder="rtsp://admin:password@192.168.1.100:554/stream"
              className="flex-1 rounded-lg border border-eco-border bg-eco-surface px-3 py-2 font-mono text-xs text-eco-ink placeholder-eco-muted/60 focus:border-eco-amber/60 focus:outline-none"
            />
            <button
              disabled
              className="rounded-lg border border-eco-amber/40 bg-eco-amber/10 px-4 py-2 text-xs font-semibold text-eco-amber opacity-70 cursor-not-allowed"
              title="Run: python edge/edge_worker.py --source rtsp://... --port 8765"
            >
              Connect
            </button>
          </div>
          <div className="rounded-lg bg-black/40 px-3 py-2 font-mono text-[11px] text-eco-muted border border-eco-border/60">
            <span className="text-eco-amber">$</span>{' '}
            python edge/edge_worker.py --source {rtspUrl || 'rtsp://...'} --port 8765
          </div>
          <p className="text-[11px] text-eco-muted/70">
            ⓘ Browser cannot access RTSP directly (browser security policy). Copy the command above
            and run it in your terminal to stream from a real IP camera.
          </p>
        </div>
      )}

      {webcamError && (
        <div className="rounded-lg border border-eco-coral/30 bg-eco-coral/10 p-3 text-xs text-eco-coral">
          {webcamError} — Switched back to sample video simulation.
        </div>
      )}

      {/* Hidden processing elements */}
      <video ref={videoRef} playsInline muted loop className="hidden" />
      <canvas ref={maskCanvasRef} width={128} height={72} className="hidden" />

      {/* ──── MULTI-CAM GRID VIEW ──── */}
      {activeTab === 'multicam' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid2x2 className="h-4 w-4 text-eco-teal" />
              <span className="font-mono text-xs font-semibold text-eco-teal uppercase tracking-wider">
                Multi-Camera Eco-Vision Grid
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-eco-muted">
                Active: <span className="text-eco-teal font-bold">{activeCamCount}/{totalCams}</span>
              </span>
              <span className="text-eco-muted">
                Bandwidth saved: <span className="text-eco-teal font-bold">
                  {Math.round(((totalCams - activeCamCount) / totalCams) * 100)}%
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {CAMERA_CONFIGS.map((cam, idx) => (
              <div
                key={cam.id}
                className={`relative overflow-hidden rounded-xl border shadow-lg transition-all ${
                  camActivity[idx] === 'ACTIVE'
                    ? 'border-eco-teal/50 shadow-eco-teal/10'
                    : 'border-eco-border'
                }`}
              >
                {/* Camera header */}
                <div className="flex items-center justify-between border-b border-eco-border/60 bg-eco-surface/90 px-3 py-1.5">
                  <span className="font-mono text-[11px] font-semibold text-eco-ink">{cam.label}</span>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold ${
                    camActivity[idx] === 'ACTIVE'
                      ? 'border-eco-teal/40 bg-eco-teal/10 text-eco-teal'
                      : 'border-eco-amber/30 bg-eco-amber/10 text-eco-amber'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      camActivity[idx] === 'ACTIVE' ? 'bg-eco-teal animate-ping' : 'bg-eco-amber'
                    }`} />
                    {camActivity[idx] === 'ACTIVE' ? 'ACTIVE' : 'IDLE'}
                  </span>
                </div>

                {/* Canvas */}
                <div className="relative aspect-video bg-black">
                  <canvas
                    ref={multiCamRefs[idx]}
                    width={320}
                    height={180}
                    className="h-full w-full object-cover"
                  />
                  {/* HUD overlay */}
                  <div className="pointer-events-none absolute bottom-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-eco-teal">
                    {cam.id.toUpperCase()} {nightMode ? '| IR' : '| DAY'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Multi-cam summary bar */}
          <div className="rounded-lg border border-eco-border bg-eco-card px-4 py-2.5 flex flex-wrap items-center gap-6 text-xs font-mono text-eco-muted">
            <span>
              <span className="text-eco-ink font-semibold">{activeCamCount}</span> cameras sending ROI crops
            </span>
            <span>
              <span className="text-eco-ink font-semibold">{totalCams - activeCamCount}</span> cameras in IDLE (uplink OFF)
            </span>
            <span className="text-eco-teal font-semibold ml-auto">
              ~{Math.round(((totalCams - activeCamCount) / totalCams) * 4000)} Kbps bandwidth freed
            </span>
          </div>
        </div>
      )}

      {/* ──── DUAL VIEW (both / raw / edge) ──── */}
      {activeTab !== 'multicam' && (
        <div className={`grid gap-4 ${activeTab === 'both' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Left: Raw Centralised Stream */}
          {(activeTab === 'both' || activeTab === 'raw') && (
            <div className="relative overflow-hidden rounded-xl border border-eco-border bg-eco-card shadow-xl">
              <div className="flex items-center justify-between border-b border-eco-border/80 bg-eco-surface/90 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-eco-muted" />
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-eco-ink">
                    Centralised Raw Stream
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-eco-amber/30 bg-eco-amber/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-eco-amber">
                  <span className="h-1.5 w-1.5 rounded-full bg-eco-amber animate-pulse"></span>
                  4.0 Mbps Unthrottled
                </span>
              </div>

              <div className="relative aspect-video bg-black flex items-center justify-center">
                {sourceMode === 'python_live' ? (
                  <div className="p-6 text-center">
                    <Activity className="mx-auto h-8 w-8 text-eco-muted animate-spin mb-2" />
                    <p className="text-xs font-mono text-eco-muted">
                      Raw stream bypassed. Python edge worker captures locally.
                    </p>
                  </div>
                ) : (
                  <canvas ref={rawCanvasRef} width={640} height={360} className="h-full w-full object-cover" />
                )}

                {nightMode && sourceMode !== 'python_live' && (
                  <div className="pointer-events-none absolute top-2 right-2 rounded bg-green-900/80 border border-green-500/40 px-2 py-0.5 font-mono text-[10px] text-green-400">
                    IR / NIGHT MODE
                  </div>
                )}
                <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-black/70 px-2 py-1 font-mono text-[10px] text-eco-muted backdrop-blur-xs">
                  1080p @ 15fps | 100% Frames Sent to Cloud
                </div>
              </div>

              <div className="border-t border-eco-border/60 bg-eco-surface/40 p-2.5 text-xs text-eco-muted">
                Sends every frame without evaluation. Cloud GPU wastes computation analyzing static pixels.
              </div>
            </div>
          )}

          {/* Right: Eco-Vision Edge Pipeline Output */}
          {(activeTab === 'both' || activeTab === 'edge') && (
            <div className="relative overflow-hidden rounded-xl border border-eco-teal/40 bg-eco-card shadow-xl shadow-eco-teal/5">
              <div className="flex items-center justify-between border-b border-eco-teal/20 bg-eco-surface/90 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-eco-teal" />
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-eco-teal">
                    Eco-Vision Edge Stream
                  </span>
                </div>

                {activeTelemetry && (
                  <div className="flex items-center gap-2">
                    {activeTelemetry.state === 'ACTIVE' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-eco-teal/40 bg-eco-teal/15 px-2.5 py-0.5 font-mono text-[11px] font-bold text-eco-teal shadow-xs">
                        <span className="h-2 w-2 rounded-full bg-eco-teal animate-ping"></span>
                        ACTIVE: Sending ROI Crop
                      </span>
                    )}
                    {activeTelemetry.state === 'HEARTBEAT' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-eco-ink/30 bg-eco-ink/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-eco-ink">
                        <span className="h-2 w-2 rounded-full bg-eco-ink animate-pulse"></span>
                        Heartbeat Keyframe (3s)
                      </span>
                    )}
                    {activeTelemetry.state === 'IDLE' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-eco-amber/30 bg-eco-amber/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-eco-amber">
                        <span className="h-2 w-2 rounded-full bg-eco-amber"></span>
                        IDLE: Skipping Empty Frames
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="relative aspect-video bg-[#070D10] flex items-center justify-center overflow-hidden">
                {sourceMode === 'python_live' ? (
                  (activeTelemetry?.roiB64 || lastPythonB64) ? (
                    <div className="relative h-full w-full flex items-center justify-center">
                      <img
                        src={activeTelemetry?.roiB64 || lastPythonB64 || ''}
                        alt="Eco-Vision ROI Feed"
                        className="max-h-full max-w-full object-contain"
                      />
                      {activeTelemetry?.state === 'IDLE' && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
                          <div className="rounded-lg bg-eco-card/90 border border-eco-teal/30 p-3 max-w-xs shadow-lg">
                            <p className="font-mono text-xs font-bold text-eco-teal">
                              IDLE: Scene Unchanged
                            </p>
                            <p className="text-[11px] text-eco-muted mt-1 font-mono">
                              Uplink throttled. 48B heartbeat ping active.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <Radio className="mx-auto h-8 w-8 text-eco-teal animate-pulse mb-2" />
                      <p className="text-xs font-mono text-eco-muted">
                        {isPythonConnected
                          ? 'Connected to Python Edge Worker. Awaiting motion...'
                          : 'Waiting for edge_worker.py on ws://localhost:8765...'}
                      </p>
                    </div>
                  )
                ) : (
                  <canvas ref={edgeCanvasRef} width={640} height={360} className="h-full w-full object-cover" />
                )}

                <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2">
                  <div className="rounded-md bg-black/80 px-2.5 py-1 font-mono text-[11px] text-eco-teal backdrop-blur-xs border border-eco-teal/30">
                    <Zap className="inline h-3 w-3 mr-1 text-eco-teal" />
                    {activeTelemetry ? `${activeTelemetry.currentKbps} Kbps` : '0 Kbps'}
                    <span className="text-eco-muted ml-1.5">
                      ({activeTelemetry ? `${activeTelemetry.compressionRatioPct}% saved` : '0%'})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-eco-teal/20 bg-eco-surface/40 px-3 py-2 text-xs">
                <span className="text-eco-muted">
                  {activeTelemetry?.state === 'ACTIVE'
                    ? 'Motion detected: Cropping foreground bounding box and forwarding at full fidelity.'
                    : 'Zero motion: Uplink silenced, saving ~90% network and cloud inference energy.'}
                </span>
                <span className="font-mono text-eco-teal font-semibold">
                  ROI: {activeTelemetry?.roiBox ? `${activeTelemetry.roiBox[2]}×${activeTelemetry.roiBox[3]}px` : 'None'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
