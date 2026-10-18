import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { StreamViewer } from './components/StreamViewer';
import { TelemetryBar } from './components/TelemetryBar';
import { BandwidthChart } from './components/BandwidthChart';
import { MacroSimulator } from './components/MacroSimulator';
import { ArchitectureStages } from './components/ArchitectureStages';
import { EssayModal } from './components/EssayModal';
import { TeamCard } from './components/TeamCard';
import { useVideoFeed } from './hooks/useVideoFeed';
import { useEdgeWebSocket } from './hooks/useEdgeWebSocket';
import { TelemetryData } from './types';
import { Terminal, Shield, Sparkles } from 'lucide-react';

export default function App() {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [isEssayOpen, setIsEssayOpen] = useState(false);
  const [isTeamOpen, setIsTeamOpen] = useState(false);

  // Hook for handling video input (Webcam / Upload / Sample)
  const videoFeed = useVideoFeed();

  // Hook for Python Edge Worker WebSocket stream
  const edgeWs = useEdgeWebSocket('ws://localhost:8765');

  const activeTelemetry = videoFeed.sourceMode === 'python_live' ? edgeWs.lastPacket : telemetry;

  return (
    <div className="min-h-screen bg-eco-bg text-eco-ink font-sans selection:bg-eco-teal/20 selection:text-eco-teal flex flex-col">
      {/* Top Navbar */}
      <Navbar
        onOpenEssay={() => setIsEssayOpen(true)}
        onOpenTeam={() => setIsTeamOpen(true)}
        isPythonConnected={edgeWs.isConnected}
        sourceMode={videoFeed.sourceMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 space-y-8">
        {/* Hero Section */}
        <div className="space-y-2 border-b border-eco-border/80 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-eco-teal/10 px-3 py-1 font-mono text-xs font-semibold text-eco-teal border border-eco-teal/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Interactive Edge Computer Vision Prototype</span>
            </span>
            <span className="text-xs text-eco-muted font-mono">
              7th International Youth Summit • President University
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight text-eco-ink">
            Eco-Vision Architecture
          </h1>
          <p className="text-sm sm:text-base text-eco-muted max-w-3xl leading-relaxed">
            Decide at the camera lens what is worth sending. An edge pre-processor filters temporal redundancy, 
            skips idle frames, and crops active regions of interest (ROI) — slashing upstream network bandwidth, cloud GPU inference FLOPs, and data center water cooling consumption by ~90%.
          </p>
        </div>

        {/* 1. Dual-View Stream Viewer */}
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

        {/* 2. Real-Time Telemetry Bar */}
        <section>
          <TelemetryBar telemetry={activeTelemetry} />
        </section>

        {/* 3. Real-Time Bandwidth Timeline Chart */}
        <section>
          <BandwidthChart telemetry={activeTelemetry} />
        </section>

        {/* Python Edge Worker Quick Connect Guide */}
        {videoFeed.sourceMode === 'python_live' && (
          <section className="rounded-xl border border-eco-teal/30 bg-eco-card p-5 space-y-3">
            <div className="flex items-center gap-2 text-eco-teal">
              <Terminal className="h-5 w-5" />
              <h3 className="text-sm font-bold font-mono">Run Standalone Python Edge Worker</h3>
            </div>
            <p className="text-xs text-eco-muted leading-relaxed">
              You can connect any real webcam or CCTV RTSP feed through the companion Python worker script. 
              Run the following command in your terminal:
            </p>
            <div className="rounded-lg bg-black/60 p-3 font-mono text-xs text-eco-ink border border-eco-border/80 flex items-center justify-between">
              <code>python edge/edge_worker.py --source 0 --port 8765</code>
              <span className="text-[11px] text-eco-muted">Status: {edgeWs.isConnected ? '● Connected' : 'Waiting for connection...'}</span>
            </div>
          </section>
        )}

        {/* 4. Section 3.3 Macro Resource Model Simulator */}
        <section>
          <MacroSimulator />
        </section>

        {/* 5. 4-Stage Edge Pipeline Walkthrough */}
        <section>
          <ArchitectureStages />
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-eco-border bg-eco-surface/50 py-6 text-xs text-eco-muted">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-eco-teal" />
            <span className="font-semibold text-eco-ink">Eco-Vision Architecture</span>
            <span>— President University Research Prototype</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Firza Miftahul Ilmi</span>
            <span>•</span>
            <span>Muhamad Salman</span>
            <span>•</span>
            <span>Immanuel Elvando Kenjam</span>
            <span>•</span>
            <span>Citra Ayu Setyoningputri</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <EssayModal isOpen={isEssayOpen} onClose={() => setIsEssayOpen(false)} />
      <TeamCard isOpen={isTeamOpen} onClose={() => setIsTeamOpen(false)} />
    </div>
  );
}
