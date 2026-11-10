import { useState, useEffect, useRef } from 'react';
import { Navbar, ActiveNavTab } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { StreamViewer } from './components/StreamViewer';
import { TelemetryBar } from './components/TelemetryBar';
import { BandwidthChart } from './components/BandwidthChart';
import DetectionLog from './components/DetectionLog';
import { MacroSimulator } from './components/MacroSimulator';
import { ArchitectureStages } from './components/ArchitectureStages';
import { FleetManager } from './components/FleetManager';
import { useVideoFeed } from './hooks/useVideoFeed';
import { useEdgeWebSocket } from './hooks/useEdgeWebSocket';
import { TelemetryData } from './types';
import { Shield, Sparkles, Terminal } from 'lucide-react';

export default function App() {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  // Default to Main Landing Page with background surveillance video & bright white-green theme
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('home');
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col">
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
        {/* ───── TAB: HOME / LANDING PAGE ───── */}
        {activeTab === 'home' && (
          <LandingPage onNavigate={setActiveTab} isBackendConnected={isBackendConnected} />
        )}

        {/* ───── OPERATIONS / FLEET / SIMULATOR / LOG HEADER ───── */}
        {activeTab !== 'home' && (
          <div className="space-y-2 border-b border-slate-200 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 font-mono text-xs font-semibold text-emerald-800 border border-emerald-300">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Control Room & Operations</span>
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Hardware In-the-Loop Edge Vision
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight text-slate-900">
                  {activeTab === 'operations' && 'Live Camera Operations & Pipeline Visualizer'}
                  {activeTab === 'fleet' && 'Fleet & Distributed Edge Nodes'}
                  {activeTab === 'simulator' && 'Macro Model Calculator (Section 3.3)'}
                  {activeTab === 'log' && 'Real-Time Detection Event Log'}
                </h1>
              </div>

              {/* Back to Home Button */}
              <button
                onClick={() => setActiveTab('home')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-800 hover:border-emerald-300 transition-colors shadow-2xs"
              >
                <span>← Back to Overview</span>
              </button>
            </div>

            {/* Quick Tab Switcher Pills */}
            <div className="pt-3 flex flex-wrap gap-2 text-xs font-medium">
              <button
                onClick={() => setActiveTab('operations')}
                className={`rounded-lg px-3 py-1.5 border transition-all ${
                  activeTab === 'operations' ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-800'
                }`}
              >
                🎥 Live Video & Dual Viewer
              </button>
              <button
                onClick={() => setActiveTab('fleet')}
                className={`rounded-lg px-3 py-1.5 border transition-all ${
                  activeTab === 'fleet' ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-800'
                }`}
              >
                🏢 Fleet & Edge Nodes
              </button>
              <button
                onClick={() => setActiveTab('simulator')}
                className={`rounded-lg px-3 py-1.5 border transition-all ${
                  activeTab === 'simulator' ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-800'
                }`}
              >
                📊 Section 3.3 Calculator
              </button>
              <button
                onClick={() => setActiveTab('log')}
                className={`rounded-lg px-3 py-1.5 border transition-all ${
                  activeTab === 'log' ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-800'
                }`}
              >
                📋 Detection Event Log
              </button>
            </div>
          </div>
        )}

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
              <section className="rounded-xl border border-emerald-200 bg-white p-5 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Terminal className="h-5 w-5" />
                  <h3 className="text-sm font-bold font-mono">Run Standalone Python Edge Worker</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Connect any real webcam or CCTV RTSP feed through the companion Python worker script:
                </p>
                <div className="rounded-lg bg-slate-900 p-3 font-mono text-xs text-emerald-400 border border-slate-800 flex items-center justify-between">
                  <code>python edge/edge_worker.py --source synthetic --port 8765</code>
                  <span className="text-[11px] text-slate-400">Status: {edgeWs.isConnected ? '● Connected' : 'Waiting...'}</span>
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
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-7 text-xs text-slate-500 shadow-2xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span className="font-semibold text-slate-800">Eco-Vision Architecture</span>
            <span>— Sustainable Vision Computing & Edge Fleet Orchestration</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
            <span>Enterprise Edge Fleet</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">Green AI Appliance</span>
            <span>•</span>
            <span>Edge Pipeline v2.4</span>
            <span>•</span>
            <span>FastAPI + Edge CV</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
