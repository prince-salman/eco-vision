import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TelemetryData, VideoSourceMode } from '../types';
import { BrowserEdgePipeline } from '../engine/edgeEngine';
import { Camera, Video, Upload, Radio, Play, Pause, Activity, ShieldCheck, Zap } from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<'both' | 'raw' | 'edge'>('both');

  // Synthetic sample scene simulation (Loading dock with intermittent pedestrian/vehicle)
  const drawSampleScene = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, t: number) => {
    // Backdrop: industrial loading dock
    ctx.fillStyle = '#1A2932';
    ctx.fillRect(0, 0, width, height);

    // Floor
    ctx.fillStyle = '#263C47';
    ctx.fillRect(0, height * 0.65, width, height * 0.35);

    // Dock doors
    ctx.fillStyle = '#132128';
    ctx.fillRect(width * 0.08, height * 0.2, width * 0.25, height * 0.45);
    ctx.fillRect(width * 0.67, height * 0.2, width * 0.25, height * 0.45);

    // Periodic moving object: vehicle or delivery cart
    const cycle = 12; // 12 seconds per cycle
    const phase = t % cycle;
    const activeDuration = 4.5; // active for 4.5s out of 12s (~37% activity)

    if (phase < activeDuration) {
      const progress = phase / activeDuration;
      const x = -80 + (width + 160) * progress;
      const y = height * 0.58;

      // Cart body
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(x, y, 70, 36);

      // Cargo box (amber/accent)
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(x + 10, y - 22, 50, 22);

      // Wheels
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(x + 18, y + 36, 8, 0, Math.PI * 2);
      ctx.arc(x + 52, y + 36, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  // Main rendering loop for browser engine
  useEffect(() => {
    let animId: number;
    const analysisW = 128;
    const analysisH = 72;

    // Offscreen analysis canvas
    const offCanvas = document.createElement('canvas');
    offCanvas.width = analysisW;
    offCanvas.height = analysisH;
    const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });

    const maskCtx = maskCanvasRef.current?.getContext('2d');

    const renderLoop = () => {
      if (sourceMode !== 'python_live' && isPlaying) {
        sampleTimeRef.current += 1 / 15;
        const rawCanvas = rawCanvasRef.current;
        const edgeCanvas = edgeCanvasRef.current;

        if (rawCanvas && edgeCanvas && offCtx) {
          const rawCtx = rawCanvas.getContext('2d');
          const edgeCtx = edgeCanvas.getContext('2d');

          const w = rawCanvas.width || 640;
          const h = rawCanvas.height || 360;

          if (sourceMode === 'browser_sample') {
            // Draw sample simulation
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

          // Run Edge CV pipeline on analysis frame
          const imgData = offCtx.getImageData(0, 0, analysisW, analysisH);
          const tResult = pipelineRef.current.processFrame(imgData, w, h, maskCtx || undefined);
          setTelemetry(tResult);

          // Render Eco-Vision Edge view
          if (edgeCtx) {
            edgeCtx.fillStyle = '#0B1318';
            edgeCtx.fillRect(0, 0, w, h);

            if (tResult.state === 'ACTIVE' || tResult.state === 'HEARTBEAT') {
              // Draw raw frame content
              if (sourceMode === 'browser_sample') {
                drawSampleScene(edgeCtx, w, h, sampleTimeRef.current);
              } else if (videoRef.current && videoRef.current.readyState >= 2) {
                edgeCtx.drawImage(videoRef.current, 0, 0, w, h);
              }

              // Dim static background if active ROI exists
              if (tResult.state === 'ACTIVE' && tResult.roiBox) {
                const [rx, ry, rw, rh] = tResult.roiBox;
                edgeCtx.fillStyle = 'rgba(11, 19, 24, 0.75)';
                // Mask outside ROI
                edgeCtx.fillRect(0, 0, w, ry);
                edgeCtx.fillRect(0, ry + rh, w, h - (ry + rh));
                edgeCtx.fillRect(0, ry, rx, rh);
                edgeCtx.fillRect(rx + rw, ry, w - (rx + rw), rh);

                // High-visibility ROI bounding box
                edgeCtx.strokeStyle = '#2DD4BF';
                edgeCtx.lineWidth = 2.5;
                edgeCtx.strokeRect(rx, ry, rw, rh);

                // Corner brackets
                const len = 12;
                edgeCtx.strokeStyle = '#FFFFFF';
                edgeCtx.lineWidth = 3;
                // Top-left
                edgeCtx.beginPath();
                edgeCtx.moveTo(rx, ry + len); edgeCtx.lineTo(rx, ry); edgeCtx.lineTo(rx + len, ry);
                edgeCtx.stroke();
                // Bottom-right
                edgeCtx.beginPath();
                edgeCtx.moveTo(rx + rw, ry + rh - len); edgeCtx.lineTo(rx + rw, ry + rh); edgeCtx.lineTo(rx + rw - len, ry + rh);
                edgeCtx.stroke();
              }
            } else {
              // IDLE: Dark power-saving mode
              edgeCtx.fillStyle = 'rgba(17, 29, 36, 0.95)';
              edgeCtx.fillRect(0, 0, w, h);
              edgeCtx.fillStyle = '#8A9FA8';
              edgeCtx.font = '14px JetBrains Mono, monospace';
              edgeCtx.textAlign = 'center';
              edgeCtx.fillText('IDLE: Scene Unchanged — Uplink Throttled', w / 2, h / 2);
            }
          }
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [sourceMode, isPlaying, drawSampleScene, setTelemetry, videoRef]);

  const activeTelemetry = sourceMode === 'python_live' ? pythonStream : telemetry;

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
        </div>

        {/* Play/Pause & View Toggle */}
        <div className="flex items-center gap-2">
          {sourceMode !== 'python_live' && (
            <button
              onClick={togglePlayPause}
              className="inline-flex items-center gap-1.5 rounded-lg border border-eco-border bg-eco-surface px-3 py-1.5 text-xs font-medium text-eco-ink hover:border-eco-teal/50"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5 text-eco-amber" /> : <Play className="h-3.5 w-3.5 text-eco-teal" />}
              <span>{isPlaying ? 'Pause' : 'Resume'}</span>
            </button>
          )}

          <div className="hidden sm:flex rounded-lg border border-eco-border bg-eco-surface p-0.5 text-xs">
            <button
              onClick={() => setActiveTab('both')}
              className={`rounded-md px-2.5 py-1 ${activeTab === 'both' ? 'bg-eco-card text-eco-teal font-semibold shadow-xs' : 'text-eco-muted'}`}
            >
              Split View
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`rounded-md px-2.5 py-1 ${activeTab === 'raw' ? 'bg-eco-card text-eco-teal font-semibold shadow-xs' : 'text-eco-muted'}`}
            >
              Raw Only
            </button>
            <button
              onClick={() => setActiveTab('edge')}
              className={`rounded-md px-2.5 py-1 ${activeTab === 'edge' ? 'bg-eco-card text-eco-teal font-semibold shadow-xs' : 'text-eco-muted'}`}
            >
              Eco-Vision
            </button>
          </div>
        </div>
      </div>

      {webcamError && (
        <div className="rounded-lg border border-eco-coral/30 bg-eco-coral/10 p-3 text-xs text-eco-coral">
          {webcamError} — Switched back to sample video simulation.
        </div>
      )}

      {/* Hidden processing elements */}
      <video ref={videoRef} playsInline muted loop className="hidden" />
      <canvas ref={maskCanvasRef} width={128} height={72} className="hidden" />

      {/* Dual Video Viewer Grid */}
      <div className={`grid gap-4 ${activeTab === 'both' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Left: Raw Centralised Stream */}
        {(activeTab === 'both' || activeTab === 'raw') && (
          <div className="relative overflow-hidden rounded-xl border border-eco-border bg-eco-card shadow-xl">
            {/* Header badge */}
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

            {/* Video Canvas */}
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

              {/* Watermark overlay */}
              <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-black/70 px-2 py-1 font-mono text-[10px] text-eco-muted backdrop-blur-xs">
                1080p @ 15fps | 100% Frames Sent to Cloud
              </div>
            </div>

            {/* Sub-bar */}
            <div className="border-t border-eco-border/60 bg-eco-surface/40 p-2.5 text-xs text-eco-muted">
              Sends every frame without evaluation. Cloud GPU wastes computation analyzing static pixels.
            </div>
          </div>
        )}

        {/* Right: Eco-Vision Edge Pipeline Output */}
        {(activeTab === 'both' || activeTab === 'edge') && (
          <div className="relative overflow-hidden rounded-xl border border-eco-teal/40 bg-eco-card shadow-xl shadow-eco-teal/5">
            {/* Header badge */}
            <div className="flex items-center justify-between border-b border-eco-teal/20 bg-eco-surface/90 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-eco-teal" />
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-eco-teal">
                  Eco-Vision Edge Stream
                </span>
              </div>

              {/* Live State Chip */}
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

            {/* Video Canvas */}
            <div className="relative aspect-video bg-[#070D10] flex items-center justify-center">
              {sourceMode === 'python_live' ? (
                activeTelemetry?.roiB64 ? (
                  <img
                    src={activeTelemetry.roiB64}
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

              {/* Status HUD overlay */}
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

            {/* Sub-bar */}
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
    </div>
  );
};
