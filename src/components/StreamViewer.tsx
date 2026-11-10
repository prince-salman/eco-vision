import React, { useRef, useEffect, useState } from 'react';
import { TelemetryData, VideoSourceMode } from '../types';
import { BrowserEdgePipeline } from '../engine/edgeEngine';
import {
  SurveillanceSimulator,
  SurveillanceScenario,
  SCENARIO_PRESETS,
} from '../engine/surveillanceSim';
import { PipelineDebugger, PipelineViewMode } from './PipelineDebugger';
import { EdgeBenchmarkModal } from './EdgeBenchmarkModal';
import {
  Camera, Video, Upload, Radio, Play, Pause, Activity,
  ShieldCheck, Zap, Grid2x2, Moon, Sun, Wifi, WifiOff,
  Sparkles
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
  const simulatorRef = useRef<SurveillanceSimulator>(new SurveillanceSimulator());
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Multi-cam canvases (4 cameras)
  const multiCamRefs = [
    useRef<HTMLCanvasElement | null>(null),
    useRef<HTMLCanvasElement | null>(null),
    useRef<HTMLCanvasElement | null>(null),
    useRef<HTMLCanvasElement | null>(null),
  ];

  const [activeTab, setActiveTab] = useState<'both' | 'raw' | 'edge' | 'multicam'>('both');
  const [viewMode, setViewMode] = useState<PipelineViewMode>('dual');
  const [selectedScenario, setSelectedScenario] = useState<SurveillanceScenario>('warehouse_dock');
  const [nightMode, setNightMode] = useState(false);
  const [lastPythonB64, setLastPythonB64] = useState<string | null>(null);
  const [rtspUrl, setRtspUrl] = useState('');
  const [showRtspInput, setShowRtspInput] = useState(false);
  const [showBenchmarkModal, setShowBenchmarkModal] = useState(false);

  // Real-time tunable parameters
  const [lumaThreshold, setLumaThreshold] = useState(20);
  const [activityThreshold, setActivityThreshold] = useState(0.005);
  const [hysteresisFrames, setHysteresisFrames] = useState(15);
  const [roiPaddingPct, setRoiPaddingPct] = useState(0.10);

  // Synchronize pipeline options when sliders change
  useEffect(() => {
    pipelineRef.current.lumaThreshold = lumaThreshold;
    pipelineRef.current.activityThreshold = activityThreshold;
    pipelineRef.current.hysteresisFrames = hysteresisFrames;
    pipelineRef.current.roiPaddingPct = roiPaddingPct;
  }, [lumaThreshold, activityThreshold, hysteresisFrames, roiPaddingPct]);

  // Per-camera activity state for multi-cam
  const [camActivity, setCamActivity] = useState<('ACTIVE' | 'IDLE')[]>(['IDLE', 'IDLE', 'IDLE', 'IDLE']);

  useEffect(() => {
    if (pythonStream?.roiB64) {
      setLastPythonB64(pythonStream.roiB64);
    }
  }, [pythonStream?.roiB64]);

  // Handle clicking on raw canvas to inject synthetic target
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (sourceMode !== 'browser_sample') return;
    const canvas = rawCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;
    simulatorRef.current.setInteractiveTarget(clickX, clickY, 'Injected Target');
  };

  const handleResetBackground = () => {
    pipelineRef.current.reset();
    simulatorRef.current.clearInteractiveTarget();
  };

  const handleInjectMotion = (label: string) => {
    const canvas = rawCanvasRef.current;
    const w = canvas?.width || 640;
    const h = canvas?.height || 360;
    simulatorRef.current.setInteractiveTarget(w * 0.35 + Math.random() * 120, h * 0.55, label);
  };

  // Main rendering loop for single camera
  useEffect(() => {
    let animId: number;
    let lastRenderTime = performance.now();
    let lastCvProcessTime = 0;
    const CV_INTERVAL_MS = 1000 / 15; // 15 FPS

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

          // Update interactive target physics
          simulatorRef.current.updateInteractiveTarget(w, h);

          // 1. Draw source scene
          if (sourceMode === 'browser_sample') {
            simulatorRef.current.renderScene(offCtx, analysisW, analysisH, sampleTimeRef.current, selectedScenario, nightMode);
            if (rawCtx) {
              simulatorRef.current.renderScene(rawCtx, w, h, sampleTimeRef.current, selectedScenario, nightMode);
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

          // 2. Execute Edge Computer Vision Pipeline (Throttled to 15 FPS)
          if (now - lastCvProcessTime >= CV_INTERVAL_MS) {
            lastCvProcessTime = now;
            const imgData = offCtx.getImageData(0, 0, analysisW, analysisH);
            const tResult = pipelineRef.current.processFrame(imgData, w, h, maskCtx || undefined);
            latestTelemetry = tResult;
            setTelemetry(tResult);
          }

          // 3. Render Eco-Vision Edge View according to active Pipeline View Mode
          if (edgeCtx) {
            edgeCtx.fillStyle = '#0B1318';
            edgeCtx.fillRect(0, 0, w, h);

            const curState = latestTelemetry?.state ?? 'IDLE';
            const curRoi = latestTelemetry?.roiBox;

            if (viewMode === 'stage1_bg') {
              // --- STAGE 1: Learned Background Model View ---
              const bgImg = pipelineRef.current.getBackgroundModelImageData(edgeCtx);
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = analysisW;
              tempCanvas.height = analysisH;
              tempCanvas.getContext('2d')?.putImageData(bgImg, 0, 0);
              edgeCtx.imageSmoothingEnabled = false;
              edgeCtx.drawImage(tempCanvas, 0, 0, w, h);

              edgeCtx.fillStyle = 'rgba(45,212,191,0.9)';
              edgeCtx.font = 'bold 12px JetBrains Mono, monospace';
              edgeCtx.fillText('STAGE 1: Learned Running Statistical Background Model (Bt)', 16, 26);
              edgeCtx.fillStyle = '#94a3b8';
              edgeCtx.font = '10px JetBrains Mono, monospace';
              edgeCtx.fillText('Static scene absorbed at reduced resolution. Moving objects filtered out.', 16, 42);
            } else if (viewMode === 'stage2_diff') {
              // --- STAGE 2: Delta Difference Mask View ---
              if (maskCanvasRef.current) {
                edgeCtx.imageSmoothingEnabled = false;
                edgeCtx.drawImage(maskCanvasRef.current, 0, 0, w, h);
              }
              edgeCtx.fillStyle = 'rgba(45,212,191,0.9)';
              edgeCtx.font = 'bold 12px JetBrains Mono, monospace';
              edgeCtx.fillText('STAGE 2: Foreground Motion Delta Mask (|It - Bt| > θ)', 16, 26);
              edgeCtx.fillStyle = '#94a3b8';
              edgeCtx.font = '10px JetBrains Mono, monospace';
              edgeCtx.fillText(`Active Pixels: ${Math.round((latestTelemetry?.activityRatio ?? 0) * 1000) / 10}% | State: ${curState}`, 16, 42);
            } else if (viewMode === 'stage3_blocks') {
              // --- STAGE 3: 8x8 Spatial Block Clustering ---
              if (sourceMode === 'browser_sample') {
                simulatorRef.current.renderScene(edgeCtx, w, h, sampleTimeRef.current, selectedScenario, nightMode);
              } else if (videoRef.current && videoRef.current.readyState >= 2) {
                edgeCtx.drawImage(videoRef.current, 0, 0, w, h);
              }

              // Overlay 16x9 block grid
              const gridCols = 16;
              const gridRows = 9;
              const cellW = w / gridCols;
              const cellH = h / gridRows;

              edgeCtx.strokeStyle = 'rgba(255,255,255,0.15)';
              edgeCtx.lineWidth = 1;
              for (let c = 0; c <= gridCols; c++) {
                edgeCtx.beginPath(); edgeCtx.moveTo(c * cellW, 0); edgeCtx.lineTo(c * cellW, h); edgeCtx.stroke();
              }
              for (let r = 0; r <= gridRows; r++) {
                edgeCtx.beginPath(); edgeCtx.moveTo(0, r * cellH); edgeCtx.lineTo(w, r * cellH); edgeCtx.stroke();
              }

              // Highlight active blocks
              const blockGrid = latestTelemetry?.activeBlockGrid || [];
              for (let r = 0; r < gridRows; r++) {
                for (let c = 0; c < gridCols; c++) {
                  const idx = r * gridCols + c;
                  if (blockGrid[idx] === 1) {
                    edgeCtx.fillStyle = 'rgba(45,212,191,0.45)';
                    edgeCtx.fillRect(c * cellW, r * cellH, cellW, cellH);
                    edgeCtx.strokeStyle = '#2dd4bf';
                    edgeCtx.strokeRect(c * cellW, r * cellH, cellW, cellH);
                  }
                }
              }

              edgeCtx.fillStyle = '#ffffff';
              edgeCtx.font = 'bold 12px JetBrains Mono, monospace';
              edgeCtx.fillText(`STAGE 3: 8×8 Spatial Block Clustering (${latestTelemetry?.activeBlockCount ?? 0} active clusters)`, 16, 26);
            } else if (viewMode === 'stage4_roi') {
              // --- STAGE 4: Cropped ROI Patch ---
              if (curRoi && (curState === 'ACTIVE' || curState === 'HEARTBEAT')) {
                const [rx, ry, rw, rh] = curRoi;
                const targetScale = Math.min(w * 0.75 / rw, h * 0.75 / rh);
                const dw = rw * targetScale;
                const dh = rh * targetScale;
                const dx = (w - dw) / 2;
                const dy = (h - dh) / 2;

                if (rawCanvas) {
                  edgeCtx.drawImage(rawCanvas, rx, ry, rw, rh, dx, dy, dw, dh);
                }
                edgeCtx.strokeStyle = '#2dd4bf';
                edgeCtx.lineWidth = 3;
                edgeCtx.strokeRect(dx, dy, dw, dh);

                edgeCtx.fillStyle = '#2dd4bf';
                edgeCtx.font = 'bold 12px JetBrains Mono, monospace';
                edgeCtx.fillText(`STAGE 4: Extracted High-Fidelity ROI Patch (${rw}×${rh} px)`, 16, 26);
                edgeCtx.fillStyle = '#94a3b8';
                edgeCtx.font = '10px JetBrains Mono, monospace';
                edgeCtx.fillText(`Payload: ${latestTelemetry?.sentBytes} B (Saved: ${latestTelemetry?.compressionRatioPct}%)`, 16, 42);
              } else {
                edgeCtx.fillStyle = 'rgba(11,19,24,0.9)';
                edgeCtx.fillRect(0, 0, w, h);
                edgeCtx.fillStyle = '#2DD4BF';
                edgeCtx.font = '13px JetBrains Mono, monospace';
                edgeCtx.textAlign = 'center';
                edgeCtx.fillText('IDLE: Scene Static — Zero Crop Payload Transmitted', w / 2, h / 2);
                edgeCtx.textAlign = 'left';
              }
            } else if (viewMode === 'cloud_compare') {
              // --- CLOUD INGRESS COMPARISON ---
              edgeCtx.save();
              edgeCtx.beginPath();
              edgeCtx.rect(0, 0, w / 2, h);
              edgeCtx.clip();
              if (rawCanvas) edgeCtx.drawImage(rawCanvas, 0, 0, w, h);
              edgeCtx.fillStyle = 'rgba(0,0,0,0.4)';
              edgeCtx.fillRect(0, 0, w / 2, h);
              edgeCtx.fillStyle = '#f59e0b';
              edgeCtx.font = 'bold 11px JetBrains Mono, monospace';
              edgeCtx.fillText('CONVENTIONAL CLOUD INGEST', 12, 22);
              edgeCtx.fillStyle = '#ffffff';
              edgeCtx.font = '10px JetBrains Mono, monospace';
              edgeCtx.fillText('• 100% Full 1080p Stream (4 Mbps)', 12, 38);
              edgeCtx.fillText('• Cloud GPU: 50 GFLOP/s (100% Load)', 12, 52);
              edgeCtx.restore();

              // Divider
              edgeCtx.strokeStyle = '#2dd4bf';
              edgeCtx.lineWidth = 2;
              edgeCtx.beginPath(); edgeCtx.moveTo(w / 2, 0); edgeCtx.lineTo(w / 2, h); edgeCtx.stroke();

              // Right half: Eco-Vision Ingest
              edgeCtx.save();
              edgeCtx.beginPath();
              edgeCtx.rect(w / 2, 0, w / 2, h);
              edgeCtx.clip();
              if (curState === 'ACTIVE' && curRoi) {
                const [rx, ry, rw, rh] = curRoi;
                if (rawCanvas) edgeCtx.drawImage(rawCanvas, rx, ry, rw, rh, w / 2 + 20, 70, rw * 0.7, rh * 0.7);
                edgeCtx.strokeStyle = '#2dd4bf';
                edgeCtx.strokeRect(w / 2 + 20, 70, rw * 0.7, rh * 0.7);
              }
              edgeCtx.fillStyle = '#2dd4bf';
              edgeCtx.font = 'bold 11px JetBrains Mono, monospace';
              edgeCtx.fillText('ECO-VISION INGEST', w / 2 + 12, 22);
              edgeCtx.fillStyle = '#ffffff';
              edgeCtx.font = '10px JetBrains Mono, monospace';
              edgeCtx.fillText(`• Throttled Stream (${latestTelemetry?.currentKbps ?? 0} Kbps)`, w / 2 + 12, 38);
              edgeCtx.fillText(`• Cloud GPU Spared: ${latestTelemetry?.compressionRatioPct ?? 0}%`, w / 2 + 12, 52);
              edgeCtx.restore();
            } else {
              // --- DUAL / STANDARD ECO-VISION VIEW ---
              if (curState === 'ACTIVE' || curState === 'HEARTBEAT') {
                if (sourceMode === 'browser_sample') {
                  simulatorRef.current.renderScene(edgeCtx, w, h, sampleTimeRef.current, selectedScenario, nightMode);
                } else if (videoRef.current && videoRef.current.readyState >= 2) {
                  edgeCtx.drawImage(videoRef.current, 0, 0, w, h);
                }

                if (curState === 'ACTIVE' && curRoi) {
                  const [rx, ry, rw, rh] = curRoi;
                  edgeCtx.fillStyle = 'rgba(11, 19, 24, 0.72)';
                  edgeCtx.fillRect(0, 0, w, ry);
                  edgeCtx.fillRect(0, ry + rh, w, h - (ry + rh));
                  edgeCtx.fillRect(0, ry, rx, rh);
                  edgeCtx.fillRect(rx + rw, ry, w - (rx + rw), rh);

                  edgeCtx.strokeStyle = '#2DD4BF';
                  edgeCtx.lineWidth = 2.5;
                  edgeCtx.strokeRect(rx, ry, rw, rh);

                  const len = 14;
                  edgeCtx.strokeStyle = '#FFFFFF';
                  edgeCtx.lineWidth = 3;
                  edgeCtx.beginPath();
                  edgeCtx.moveTo(rx, ry + len); edgeCtx.lineTo(rx, ry); edgeCtx.lineTo(rx + len, ry);
                  edgeCtx.stroke();
                  edgeCtx.beginPath();
                  edgeCtx.moveTo(rx + rw, ry + rh - len); edgeCtx.lineTo(rx + rw, ry + rh); edgeCtx.lineTo(rx + rw - len, ry + rh);
                  edgeCtx.stroke();

                  edgeCtx.fillStyle = '#0f172a';
                  edgeCtx.fillRect(rx, ry - 22, 160, 20);
                  edgeCtx.strokeStyle = '#2dd4bf';
                  edgeCtx.strokeRect(rx, ry - 22, 160, 20);
                  edgeCtx.fillStyle = '#2dd4bf';
                  edgeCtx.font = 'bold 10px JetBrains Mono, monospace';
                  edgeCtx.fillText(`ROI TARGET [${rw}×${rh}px]`, rx + 6, ry - 8);
                }
              } else {
                // IDLE: Throttled state
                if (sourceMode === 'browser_sample') {
                  simulatorRef.current.renderScene(edgeCtx, w, h, sampleTimeRef.current, selectedScenario, nightMode);
                } else if (videoRef.current && videoRef.current.readyState >= 2) {
                  edgeCtx.drawImage(videoRef.current, 0, 0, w, h);
                }
                edgeCtx.fillStyle = 'rgba(11, 19, 24, 0.85)';
                edgeCtx.fillRect(0, 0, w, h);
                edgeCtx.fillStyle = '#2DD4BF';
                edgeCtx.font = '13px JetBrains Mono, monospace';
                edgeCtx.textAlign = 'center';
                edgeCtx.fillText('IDLE: Scene Static — Uplink Throttled to 48 B/s', w / 2, h / 2 - 8);
                edgeCtx.fillStyle = '#64748B';
                edgeCtx.font = '11px JetBrains Mono, monospace';
                edgeCtx.fillText('Zero redundant frames transmitted (3s keepalive heartbeat ping)', w / 2, h / 2 + 14);
                edgeCtx.textAlign = 'left';
              }
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
  }, [sourceMode, isPlaying, setTelemetry, videoRef, selectedScenario, nightMode, viewMode]);

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
        SCENARIO_PRESETS.forEach((preset, idx) => {
          const canvas = multiCamRefs[idx].current;
          if (!canvas) { newActivity.push('IDLE'); return; }
          const ctx = canvas.getContext('2d');
          if (!ctx) { newActivity.push('IDLE'); return; }

          simulatorRef.current.renderScene(ctx, canvas.width, canvas.height, sampleTimeRef.current, preset.id, nightMode);

          const cycle = preset.id === 'warehouse_dock' ? 12 : preset.id === 'server_corridor' ? 10 : preset.id === 'campus_gate' ? 14 : 16;
          const activeDuration = cycle * (preset.defaultActivePct / 100);
          const isActive = (sampleTimeRef.current % cycle) < activeDuration;
          newActivity.push(isActive ? 'ACTIVE' : 'IDLE');

          if (!isActive) {
            ctx.fillStyle = 'rgba(11,19,24,0.72)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#2DD4BF';
            ctx.font = 'bold 11px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.fillText('IDLE — Uplink Throttled', canvas.width / 2, canvas.height / 2);
          } else {
            ctx.strokeStyle = '#2DD4BF';
            ctx.lineWidth = 2;
            ctx.strokeRect(canvas.width * 0.25, canvas.height * 0.35, canvas.width * 0.5, canvas.height * 0.45);
          }
        });

        setCamActivity(newActivity);
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [activeTab, nightMode]);

  const activeTelemetry = sourceMode === 'python_live' ? pythonStream : telemetry;
  const activeCamCount = camActivity.filter(s => s === 'ACTIVE').length;
  const totalCams = SCENARIO_PRESETS.length;

  return (
    <div className="space-y-4">
      {/* Top Source & Mode Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-eco-border bg-eco-card p-3 shadow-lg">
        {/* Source Mode Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setSourceMode('browser_sample')}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
              sourceMode === 'browser_sample'
                ? 'bg-eco-teal/20 text-eco-teal border border-eco-teal/40 shadow-sm'
                : 'text-eco-muted hover:bg-eco-surface hover:text-eco-ink'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Surveillance Scenarios</span>
          </button>

          <button
            onClick={() => setSourceMode('browser_webcam')}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
              sourceMode === 'browser_webcam'
                ? 'bg-eco-teal/20 text-eco-teal border border-eco-teal/40 shadow-sm'
                : 'text-eco-muted hover:bg-eco-surface hover:text-eco-ink'
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>Live Webcam CV</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
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
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
              sourceMode === 'python_live'
                ? 'bg-eco-teal/20 text-eco-teal border border-eco-teal/40 shadow-sm'
                : 'text-eco-muted hover:bg-eco-surface hover:text-eco-ink'
            }`}
          >
            <Radio className={`h-4 w-4 ${isPythonConnected ? 'text-eco-green animate-pulse' : ''}`} />
            <span>Python Edge {isPythonConnected ? '(Live)' : '(ws)'}</span>
          </button>

          <button
            onClick={() => setShowRtspInput(v => !v)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
              showRtspInput
                ? 'bg-eco-amber/15 text-eco-amber border border-eco-amber/40'
                : 'text-eco-muted hover:bg-eco-surface hover:text-eco-ink'
            }`}
          >
            {isPythonConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span>RTSP / IP Cam</span>
          </button>
        </div>

        {/* Right Tools: Scenario Picker, Night Mode, Benchmark */}
        <div className="flex flex-wrap items-center gap-2">
          {sourceMode === 'browser_sample' && (
            <select
              value={selectedScenario}
              onChange={e => setSelectedScenario(e.target.value as SurveillanceScenario)}
              className="rounded-lg border border-eco-border bg-eco-surface px-2.5 py-1.5 font-mono text-xs text-eco-ink focus:outline-none focus:border-eco-teal cursor-pointer"
            >
              {SCENARIO_PRESETS.map(s => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.defaultActivePct}% act)
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowBenchmarkModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-eco-teal/15 border border-eco-teal/40 px-3 py-1.5 text-xs font-mono font-bold text-eco-teal hover:bg-eco-teal/25 transition-all cursor-pointer"
            title="Execute automated 60-frame hardware benchmark"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Hardware Benchmark</span>
          </button>

          <button
            onClick={() => setNightMode(v => !v)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              nightMode
                ? 'border-green-500/40 bg-green-900/20 text-green-400'
                : 'border-eco-border bg-eco-surface text-eco-muted hover:text-eco-ink'
            }`}
          >
            {nightMode ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            <span>{nightMode ? 'Night IR' : 'Day'}</span>
          </button>

          {sourceMode !== 'python_live' && (
            <button
              onClick={togglePlayPause}
              className="inline-flex items-center gap-1.5 rounded-lg border border-eco-border bg-eco-surface px-3 py-1.5 text-xs font-medium text-eco-ink hover:border-eco-teal/50 cursor-pointer"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5 text-eco-amber" /> : <Play className="h-3.5 w-3.5 text-eco-teal" />}
              <span>{isPlaying ? 'Pause' : 'Resume'}</span>
            </button>
          )}

          <div className="hidden sm:flex rounded-lg border border-eco-border bg-eco-surface p-0.5 text-xs">
            <button
              onClick={() => setActiveTab('both')}
              className={`rounded-md px-2.5 py-1 cursor-pointer ${activeTab === 'both' ? 'bg-eco-card text-eco-teal font-semibold shadow-xs' : 'text-eco-muted'}`}
            >
              Split
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`rounded-md px-2.5 py-1 cursor-pointer ${activeTab === 'raw' ? 'bg-eco-card text-eco-teal font-semibold shadow-xs' : 'text-eco-muted'}`}
            >
              Raw
            </button>
            <button
              onClick={() => setActiveTab('edge')}
              className={`rounded-md px-2.5 py-1 cursor-pointer ${activeTab === 'edge' ? 'bg-eco-card text-eco-teal font-semibold shadow-xs' : 'text-eco-muted'}`}
            >
              Eco-Vision
            </button>
            <button
              onClick={() => setActiveTab('multicam')}
              className={`rounded-md px-2.5 py-1 inline-flex items-center gap-1 cursor-pointer ${activeTab === 'multicam' ? 'bg-eco-card text-eco-teal font-semibold shadow-xs' : 'text-eco-muted'}`}
            >
              <Grid2x2 className="h-3 w-3" />
              4-Cam
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Pipeline Debugger & Tuner Drawer */}
      <PipelineDebugger
        viewMode={viewMode}
        setViewMode={setViewMode}
        telemetry={activeTelemetry}
        lumaThreshold={lumaThreshold}
        setLumaThreshold={setLumaThreshold}
        activityThreshold={activityThreshold}
        setActivityThreshold={setActivityThreshold}
        hysteresisFrames={hysteresisFrames}
        setHysteresisFrames={setHysteresisFrames}
        roiPaddingPct={roiPaddingPct}
        setRoiPaddingPct={setRoiPaddingPct}
        onResetBackground={handleResetBackground}
        onInjectMotion={handleInjectMotion}
      />

      {/* RTSP Input Panel */}
      {showRtspInput && (
        <div className="rounded-xl border border-eco-amber/30 bg-eco-amber/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-eco-amber" />
            <h3 className="text-xs font-bold font-mono text-eco-amber">RTSP / IP Camera Direct Connection</h3>
            <span className="ml-auto text-[10px] font-mono text-eco-muted rounded-full border border-eco-muted/30 px-2 py-0.5">Section 3.4 Companion Board</span>
          </div>
          <p className="text-xs text-eco-muted leading-relaxed">
            Enter your CCTV camera RTSP URL. To ingest without browser CORS restrictions, run the Python Edge Worker:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={rtspUrl}
              onChange={e => setRtspUrl(e.target.value)}
              placeholder="rtsp://admin:password@192.168.1.100:554/stream"
              className="flex-1 rounded-lg border border-eco-border bg-eco-surface px-3 py-2 font-mono text-xs text-eco-ink placeholder-eco-muted/60 focus:border-eco-amber/60 focus:outline-none"
            />
          </div>
          <div className="rounded-lg bg-black/40 px-3 py-2 font-mono text-[11px] text-eco-muted border border-eco-border/60">
            <span className="text-eco-amber">$</span>{' '}
            python edge/edge_worker.py --source {rtspUrl || 'rtsp://...'} --port 8765
          </div>
        </div>
      )}

      {webcamError && (
        <div className="rounded-lg border border-eco-coral/30 bg-eco-coral/10 p-3 text-xs text-eco-coral">
          {webcamError} — Switched back to realistic surveillance simulation.
        </div>
      )}

      {/* Hidden processing elements */}
      <video ref={videoRef} playsInline muted loop className="hidden" />
      <canvas ref={maskCanvasRef} width={128} height={72} className="hidden" />

      {/* Benchmark Modal */}
      <EdgeBenchmarkModal
        isOpen={showBenchmarkModal}
        onClose={() => setShowBenchmarkModal(false)}
      />

      {/* ──── MULTI-CAM GRID VIEW ──── */}
      {activeTab === 'multicam' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid2x2 className="h-4 w-4 text-eco-teal" />
              <span className="font-mono text-xs font-semibold text-eco-teal uppercase tracking-wider">
                Multi-Camera Eco-Vision Fleet (Section 3.4)
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-eco-muted">
                Active Nodes: <span className="text-eco-teal font-bold">{activeCamCount}/{totalCams}</span>
              </span>
              <span className="text-eco-muted">
                Bandwidth Saved: <span className="text-eco-teal font-bold">
                  {Math.round(((totalCams - activeCamCount) / totalCams) * 100)}%
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SCENARIO_PRESETS.map((cam, idx) => (
              <div
                key={cam.id}
                className={`relative overflow-hidden rounded-xl border shadow-lg transition-all ${
                  camActivity[idx] === 'ACTIVE'
                    ? 'border-eco-teal/50 shadow-eco-teal/10'
                    : 'border-eco-border'
                }`}
              >
                <div className="flex items-center justify-between border-b border-eco-border/60 bg-eco-surface/90 px-3 py-1.5">
                  <span className="font-mono text-[11px] font-semibold text-eco-ink">{cam.title}</span>
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

                <div className="relative aspect-video bg-black">
                  <canvas
                    ref={multiCamRefs[idx]}
                    width={320}
                    height={180}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-eco-border bg-eco-card px-4 py-2.5 flex flex-wrap items-center gap-6 text-xs font-mono text-eco-muted">
            <span>
              <span className="text-eco-ink font-semibold">{activeCamCount}</span> nodes transmitting ROI crops
            </span>
            <span>
              <span className="text-eco-ink font-semibold">{totalCams - activeCamCount}</span> nodes in IDLE power saving
            </span>
            <span className="text-eco-teal font-semibold ml-auto">
              ~{Math.round(((totalCams - activeCamCount) / totalCams) * 4000)} Kbps fleet bandwidth saved
            </span>
          </div>
        </div>
      )}

      {/* ──── DUAL / SINGLE CAMERA VIEWER ──── */}
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
                      Raw stream captured locally by Python edge worker.
                    </p>
                  </div>
                ) : (
                  <canvas
                    ref={rawCanvasRef}
                    width={640}
                    height={360}
                    onClick={handleCanvasClick}
                    className="h-full w-full object-cover cursor-crosshair"
                  />
                )}

                {sourceMode === 'browser_sample' && (
                  <div className="pointer-events-none absolute top-3 left-3 rounded-md bg-black/75 border border-white/20 px-2 py-1 font-mono text-[10px] text-white/80 backdrop-blur-xs flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-eco-teal" />
                    <span>Click anywhere to inject motion</span>
                  </div>
                )}
              </div>

              <div className="border-t border-eco-border/60 bg-eco-surface/40 p-2.5 text-xs text-eco-muted">
                Unconditionally encodes every pixel. Cloud GPU wastes 50 GFLOPs analyzing unchanged stillness.
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
                    Eco-Vision Edge Output
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
                        IDLE: Empty Frames Skipped
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="relative aspect-video bg-[#070D10] flex items-center justify-center overflow-hidden">
                {sourceMode === 'python_live' ? (
                  (activeTelemetry?.roiB64 || lastPythonB64) ? (
                    <img
                      src={activeTelemetry?.roiB64 || lastPythonB64 || ''}
                      alt="Eco-Vision ROI Feed"
                      className="max-h-full max-w-full object-contain"
                    />
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
                <span className="text-eco-muted truncate max-w-sm">
                  {activeTelemetry?.state === 'ACTIVE'
                    ? 'Foreground motion verified: Transmitting cropped bounding box with safety margin.'
                    : 'Zero scene delta: Uplink silenced, saving ~90% data center cooling water.'}
                </span>
                <span className="font-mono text-eco-teal font-semibold shrink-0">
                  ROI: {activeTelemetry?.roiBox ? `${activeTelemetry.roiBox[2]}×${activeTelemetry.roiBox[3]}px` : 'None (0 B)'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
