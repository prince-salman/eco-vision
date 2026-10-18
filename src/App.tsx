import { useState, useEffect, useRef } from 'react';
import { Navbar, ActiveNavTab } from './components/Navbar';
import { StreamViewer } from './components/StreamViewer';
import { TelemetryBar } from './components/TelemetryBar';
import { BandwidthChart } from './components/BandwidthChart';
import DetectionLog from './components/DetectionLog';
import { MacroSimulator } from './components/MacroSimulator';
import { ArchitectureStages } from './components/ArchitectureStages';
import { FleetManager } from './components/FleetManager';
import { ApiExplorer } from './components/ApiExplorer';
import { ResearchWhitepaper } from './components/ResearchWhitepaper';
import { useVideoFeed } from './hooks/useVideoFeed';
import { useEdgeWebSocket } from './hooks/useEdgeWebSocket';
import { TelemetryData } from './types';
import { Shield, Sparkles, Terminal } from 'lucide-react';

export default function App() {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('operations');
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Hook for handling video input (Webcam / Upload / Sample)
  const videoFeed = useVideoFeed();

  // Hook for Python Edge Worker WebSocket stream
  const edgeWs = useEdgeWebSocket('ws://localhost:8765');

  const activeTelemetry = videoFeed.sourceMode === 'python_live' ? edgeWs.lastPacket : telemetry;

  // Check backend health periodically
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('http://localhost:8001/api/v1/health');
        if (res.ok) {
          setIsBackendConnected(true);
        } else {
          setIsBackendConnected(false);
        }
      } catch {
        setIsBackendConnected(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  // Post detection event to backend when state is ACTIVE
  const lastLoggedTimestampRef = useRef<number>(0);
  useEffect(() => {
    if (!activeTelemetry || activeTelemetry.state !== 'ACTIVE') return;
    if (activeTelemetry.timestamp === lastLoggedTimestampRef.current) return;
    lastLoggedTimestampRef.current = activeTelemetry.timestamp;

    if (isBackendConnected) {
      fetch('http://localhost:8001/api/v1/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          camera_id: 'cam-01',
          state: 'ACTIVE',
          activity_pct: Math.round(activeTelemetry.activityRatio * 1000) / 10,
          roi_x: activeTelemetry.roiBox ? activeTelemetry.roiBox[0] : null,
          roi_y: activeTelemetry.roiBox ? activeTelemetry.roiBox[1] : null,
          roi_w: activeTelemetry.roiBox ? activeTelemetry.roiBox[2] : null,
          roi_h: activeTelemetry.roiBox ? activeTelemetry.roiBox[3] : null,
          current_kbps: activeTelemetry.currentKbps,
          saved_pct: activeTelemetry.compressionRatioPct,
          label: 'Motion Trigger',
          confidence: 0.98
        })
      }).catch(() => {});
    }
  }, [activeTelemetry, isBackendConnected]);

  return (
    <div className="min-h-screen bg-eco-bg text-eco-ink font-sans selection:bg-eco-teal/20 selection:text-eco-teal flex flex-col">
      {/* Top Navbar */}
      <Navbar
        isPythonConnected={edgeWs.isConnected}
        isBackendConnected={isBackendConnected}
        sourceMode={videoFeed.sourceMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 space-y-8">
        {/* Header Title & Subtitle */}
        <div className="space-y-2 border-b border-eco-border/80 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-eco-teal/10 px-3 py-1 font-mono text-xs font-semibold text-eco-teal border border-eco-teal/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Production Platform & Edge Fleet Architecture</span>
            </span>
            <span className="text-xs text-eco-muted font-mono">
              Mitigating Data Center Resource Consumption
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight text-eco-ink">
            Eco-Vision Architecture
          </h1>
          <p className="text-sm sm:text-base text-eco-muted max-w-4xl leading-relaxed">
            Decide at the camera lens what is worth sending. An edge pre-processor filters temporal redundancy, 
            skips idle frames, and crops active regions of interest (ROI) — slashing upstream network bandwidth by ~89.5%, 
            cloud GPU inference FLOPs by 90%, and data center evaporative cooling consumption by roughly 30 million liters annually.
          </p>

          {/* Quick Tab Switcher Pills */}
          <div className="pt-2 flex flex-wrap gap-2 text-xs font-medium">
            <button
              onClick={() => setActiveTab('operations')}
              className={`rounded-lg px-3 py-1.5 border transition-all ${
                activeTab === 'operations' ? 'bg-eco-teal/15 text-eco-teal border-eco-teal/40 font-bold' : 'border-eco-border text-eco-muted hover:text-eco-ink'
              }`}
            >
              🎥 Live Video & Dual Viewer
            </button>
            <button
              onClick={() => setActiveTab('fleet')}
              className={`rounded-lg px-3 py-1.5 border transition-all ${
                activeTab === 'fleet' ? 'bg-eco-teal/15 text-eco-teal border-eco-teal/40 font-bold' : 'border-eco-border text-eco-muted hover:text-eco-ink'
              }`}
            >
              🏢 Fleet & Edge Nodes
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`rounded-lg px-3 py-1.5 border transition-all ${
                activeTab === 'simulator' ? 'bg-eco-teal/15 text-eco-teal border-eco-teal/40 font-bold' : 'border-eco-border text-eco-muted hover:text-eco-ink'
              }`}
            >
              📊 Section 3.3 Calculator
            </button>
            <button
              onClick={() => setActiveTab('log')}
              className={`rounded-lg px-3 py-1.5 border transition-all ${
                activeTab === 'log' ? 'bg-eco-teal/15 text-eco-teal border-eco-teal/40 font-bold' : 'border-eco-border text-eco-muted hover:text-eco-ink'
              }`}
            >
              📋 Detection Event Log
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`rounded-lg px-3 py-1.5 border transition-all ${
                activeTab === 'api' ? 'bg-eco-teal/15 text-eco-teal border-eco-teal/40 font-bold' : 'border-eco-border text-eco-muted hover:text-eco-ink'
              }`}
            >
              🔌 REST API & VMS
            </button>
            <button
              onClick={() => setActiveTab('whitepaper')}
              className={`rounded-lg px-3 py-1.5 border transition-all ${
                activeTab === 'whitepaper' ? 'bg-eco-teal/15 text-eco-teal border-eco-teal/40 font-bold' : 'border-eco-border text-eco-muted hover:text-eco-ink'
              }`}
            >
              📄 Research Whitepaper
            </button>
          </div>
        </div>

        {/* ───── TAB 1: OPERATIONS ───── */}
        {activeTab === 'operations' && (
          <div className="space-y-8">
            {/* Stream Viewer */}
            <section>
              <StreamViewer
                sourceMode={videoFeed.sourceMode}
                setSourceMode={videoFeed.setSourceMode}
                videoRef={videoFeed.videoRef}
                telemetry={telemetry}
                setTelemetry={setTelemetry}
                pythonStream={edgeWs.lastPacket}
                isPythonConnected={edgeWs.isConnected}
                isPlaying={videoFeed.isPlaying}
                togglePlayPause={videoFeed.togglePlayPause}
                handleFileUpload={videoFeed.handleFileUpload}
                uploadedFileName={videoFeed.uploadedFileName}
                webcamError={videoFeed.webcamError}
              />
            </section>

            {/* Real-Time Telemetry Bar */}
            <section>
              <TelemetryBar telemetry={activeTelemetry} />
            </section>

            {/* Real-Time Bandwidth Timeline Chart */}
            <section>
              <BandwidthChart telemetry={activeTelemetry} />
            </section>

            {/* Python Edge Worker Quick Guide */}
            {videoFeed.sourceMode === 'python_live' && (
              <section className="rounded-xl border border-eco-teal/30 bg-eco-card p-5 space-y-3">
                <div className="flex items-center gap-2 text-eco-teal">
                  <Terminal className="h-5 w-5" />
                  <h3 className="text-sm font-bold font-mono">Run Standalone Python Edge Worker</h3>
                </div>
                <p className="text-xs text-eco-muted leading-relaxed">
                  Connect any real webcam or CCTV RTSP feed through the companion Python worker script:
                </p>
                <div className="rounded-lg bg-black/60 p-3 font-mono text-xs text-eco-ink border border-eco-border/80 flex items-center justify-between">
                  <code>python edge/edge_worker.py --source synthetic --port 8765</code>
                  <span className="text-[11px] text-eco-muted">Status: {edgeWs.isConnected ? '● Connected' : 'Waiting...'}</span>
                </div>
              </section>
            )}

            {/* 4-Stage Edge Pipeline Walkthrough */}
            <section>
              <ArchitectureStages />
            </section>
          </div>
        )}

        {/* ───── TAB 2: FLEET & NODES ───── */}
        {activeTab === 'fleet' && (
          <section>
            <FleetManager />
          </section>
        )}

        {/* ───── TAB 3: MACRO SIMULATOR ───── */}
        {activeTab === 'simulator' && (
          <section>
            <MacroSimulator />
          </section>
        )}

        {/* ───── TAB 4: DETECTION LOG ───── */}
        {activeTab === 'log' && (
          <section>
            <DetectionLog telemetry={activeTelemetry} />
          </section>
        )}

        {/* ───── TAB 5: REST API & VMS ───── */}
        {activeTab === 'api' && (
          <section>
            <ApiExplorer />
          </section>
        )}

        {/* ───── TAB 6: RESEARCH WHITEPAPER ───── */}
        {activeTab === 'whitepaper' && (
          <section>
            <ResearchWhitepaper />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-eco-border bg-eco-surface/50 py-6 text-xs text-eco-muted">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-eco-teal" />
            <span className="font-semibold text-eco-ink">Eco-Vision Architecture</span>
            <span>— Sustainable Vision Computing & Edge Fleet Orchestration</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-eco-muted">
            <span>President University</span>
            <span>•</span>
            <span>7th IYS Summit</span>
            <span>•</span>
            <span>Green AI</span>
            <span>•</span>
            <span>Backend v2.4 (FastAPI + SQLite)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
