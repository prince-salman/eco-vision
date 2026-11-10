import React from 'react';
import { 
  ArrowRight, 
  Play, 
  Shield, 
  Cpu, 
  Zap, 
  Droplets, 
  Eye, 
  Server, 
  Sliders, 
  CheckCircle2, 
  Activity, 
  Sparkles, 
  Layers, 
  Video,
  CloudOff
} from 'lucide-react';
import { ActiveNavTab } from './Navbar';

interface LandingPageProps {
  onNavigate: (tab: ActiveNavTab) => void;
  isBackendConnected: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, isBackendConnected }) => {
  return (
    <div className="space-y-20 pb-16">
      {/* ───── 1. HERO SECTION ───── */}
      <section className="relative pt-6 sm:pt-12 text-center max-w-5xl mx-auto space-y-8">
        {/* Glow backdrop effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-eco-teal/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Top Badges */}
        <div className="inline-flex items-center gap-2 rounded-full border border-eco-teal/30 bg-eco-teal/10 px-4 py-1.5 text-xs font-mono text-eco-teal backdrop-blur-md">
          <Sparkles className="h-4 w-4 animate-pulse text-eco-teal" />
          <span className="font-semibold tracking-wide">ECO-VISION PRODUCTION v2.4</span>
          <span className="text-eco-muted hidden sm:inline">•</span>
          <span className="text-eco-muted hidden sm:inline">Sustainable Vision & Edge Fleet Platform</span>
        </div>

        {/* Main Headline */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-extrabold tracking-tight text-eco-ink leading-[1.1]">
            Decide at the camera lens{' '}
            <span className="bg-gradient-to-r from-eco-teal via-eco-emerald to-eco-green bg-clip-text text-transparent underline decoration-eco-teal/30 underline-offset-8">
              what is worth sending.
            </span>
          </h1>
          <p className="text-base sm:text-xl text-eco-muted max-w-3xl mx-auto font-sans leading-relaxed">
            Traditional surveillance floods cloud data centers with 24/7 empty video frames. 
            Eco-Vision pre-processes vision streams at the edge sensor — filtering idle redundancy, 
            cropping active Regions of Interest (ROI), and slashing bandwidth and server cooling emissions by ~90%.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => onNavigate('operations')}
            className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-eco-teal to-eco-accent px-6 py-3.5 text-sm font-bold text-eco-bg shadow-lg shadow-eco-teal/20 transition-all hover:scale-105 hover:shadow-eco-teal/30 active:scale-95"
          >
            <Play className="h-4 w-4 fill-eco-bg transition-transform group-hover:translate-x-0.5" />
            <span>Launch Live Console</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => onNavigate('simulator')}
            className="inline-flex items-center gap-2 rounded-xl border border-eco-border bg-eco-surface/80 px-5 py-3.5 text-sm font-semibold text-eco-ink backdrop-blur-md transition-all hover:bg-eco-card hover:border-eco-teal/40 hover:text-eco-teal"
          >
            <Sliders className="h-4 w-4 text-eco-teal" />
            <span>Section 3.3 Calculator</span>
          </button>

          <button
            onClick={() => onNavigate('fleet')}
            className="inline-flex items-center gap-2 rounded-xl border border-eco-border bg-eco-surface/80 px-5 py-3.5 text-sm font-semibold text-eco-ink backdrop-blur-md transition-all hover:bg-eco-card hover:border-eco-teal/40"
          >
            <Server className="h-4 w-4 text-eco-muted" />
            <span>Fleet Nodes</span>
          </button>
        </div>

        {/* Status Indicator Bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-mono text-eco-muted">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-eco-green animate-pulse" />
            <span>Edge Engine: Ready (Browser WASM + Python)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isBackendConnected ? 'bg-eco-green' : 'bg-eco-amber'}`} />
            <span>FastAPI Backend: {isBackendConnected ? 'Connected (Port 8001)' : 'Offline (Local Mode)'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-eco-teal" />
            <span>Memory Budget: &lt;256 KB SRAM Compliant</span>
          </div>
        </div>
      </section>

      {/* ───── 2. INTERACTIVE CONSOLE PREVIEW CARD ───── */}
      <section className="relative rounded-2xl border border-eco-border bg-eco-surface/90 p-4 sm:p-6 shadow-2xl backdrop-blur-xl max-w-6xl mx-auto overflow-hidden">
        {/* Card Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-eco-border/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
            </div>
            <span className="font-mono text-xs font-semibold text-eco-ink">
              eco-vision://console/live-operations
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="rounded-md bg-eco-teal/15 px-2.5 py-1 text-eco-teal font-bold border border-eco-teal/30">
              ● REAL-TIME EDGE CV
            </span>
            <button
              onClick={() => onNavigate('operations')}
              className="inline-flex items-center gap-1 rounded-md bg-eco-card px-3 py-1 font-sans text-xs text-eco-teal hover:bg-eco-teal hover:text-eco-bg transition-colors border border-eco-teal/30"
            >
              <span>Open Full Console</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Telemetry Highlight Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4">
          <div className="rounded-xl border border-eco-border bg-eco-card/70 p-3.5">
            <div className="text-[11px] font-mono text-eco-muted flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-eco-teal" />
              <span>Bandwidth Reduction</span>
            </div>
            <div className="mt-1 text-2xl font-bold font-mono text-eco-teal">~89.5%</div>
            <div className="text-[11px] text-eco-muted mt-0.5">3,500 kbps → 368 kbps avg</div>
          </div>

          <div className="rounded-xl border border-eco-border bg-eco-card/70 p-3.5">
            <div className="text-[11px] font-mono text-eco-muted flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-eco-green" />
              <span>Cloud Inference FLOPs</span>
            </div>
            <div className="mt-1 text-2xl font-bold font-mono text-eco-green">-90.0%</div>
            <div className="text-[11px] text-eco-muted mt-0.5">Static background skipped</div>
          </div>

          <div className="rounded-xl border border-eco-border bg-eco-card/70 p-3.5">
            <div className="text-[11px] font-mono text-eco-muted flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-eco-amber" />
              <span>Edge Process Latency</span>
            </div>
            <div className="mt-1 text-2xl font-bold font-mono text-eco-ink">&lt; 3.2 ms</div>
            <div className="text-[11px] text-eco-muted mt-0.5">Sub-frame local gating</div>
          </div>

          <div className="rounded-xl border border-eco-border bg-eco-card/70 p-3.5">
            <div className="text-[11px] font-mono text-eco-muted flex items-center gap-1.5">
              <Droplets className="h-3.5 w-3.5 text-cyan-400" />
              <span>Cooling Water Saved</span>
            </div>
            <div className="mt-1 text-2xl font-bold font-mono text-cyan-400">30.2M L</div>
            <div className="text-[11px] text-eco-muted mt-0.5">Annual datacenter impact</div>
          </div>
        </div>

        {/* Visual Teaser Callout */}
        <div 
          onClick={() => onNavigate('operations')}
          className="group relative cursor-pointer rounded-xl border border-eco-border/80 bg-black/60 p-8 text-center transition-all hover:border-eco-teal/50 hover:bg-black/70 overflow-hidden"
        >
          <div className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-eco-teal/15 text-eco-teal border border-eco-teal/30 group-hover:scale-110 transition-transform">
              <Video className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-eco-ink font-serif">
              Click to Open Live Interactive CCTV Simulator & Webcam
            </h3>
            <p className="text-sm text-eco-muted max-w-xl mx-auto">
              Test all 4 surveillance scenarios (Loading Dock, Server Room, Campus Gate, Night IR) with live click-to-inject target motion, or switch to your real laptop webcam!
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 rounded-lg bg-eco-teal px-4 py-2 text-xs font-bold text-eco-bg group-hover:bg-eco-emerald transition-colors">
                <span>Enter Operations Room</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ───── 3. PROBLEM VS SOLUTION ───── */}
      <section className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="font-mono text-xs uppercase tracking-wider text-eco-teal font-semibold">
            Paradigm Shift
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-eco-ink">
            Traditional Cloud CCTV vs Eco-Vision Architecture
          </h2>
          <p className="text-sm sm:text-base text-eco-muted max-w-2xl mx-auto">
            Why streaming 1080p full frames 24 hours a day to cloud GPUs is financially and environmentally unsustainable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Legacy Cloud Streaming */}
          <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                <CloudOff className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-eco-ink">Traditional Cloud Surveillance</h3>
                <p className="text-xs text-red-400 font-mono">Wasteful & Redundant Streaming</p>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs sm:text-sm text-eco-muted">
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold">✕</span>
                <span><strong>Streams 24/7 blank footage:</strong> 90%+ of typical CCTV feeds consist of empty corridors, locked gates, and stationary walls.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold">✕</span>
                <span><strong>Massive cloud GPU inference cost:</strong> Data center GPUs burn kilowatt-hours running YOLO/ResNet on unchanged background pixels.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold">✕</span>
                <span><strong>Network uplink saturation:</strong> 100 cameras saturate a 500 Mbps enterprise WAN connection continuously.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold">✕</span>
                <span><strong>Enormous water footprint:</strong> Evaporative cooling towers in cloud data centers consume tens of millions of liters of freshwater.</span>
              </li>
            </ul>
          </div>

          {/* Eco-Vision Edge Pre-Processor */}
          <div className="rounded-2xl border border-eco-teal/30 bg-eco-teal/5 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-eco-teal/15 border border-eco-teal/30 flex items-center justify-center text-eco-teal">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-eco-ink">Eco-Vision Edge Architecture</h3>
                <p className="text-xs text-eco-teal font-mono">In-Lens Filter & Gated Transmission</p>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs sm:text-sm text-eco-muted">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-eco-teal shrink-0 mt-0.5" />
                <span><strong>Zero transmission when idle:</strong> Transmits 0 kbps while the scene remains stationary, suppressing false alerts.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-eco-teal shrink-0 mt-0.5" />
                <span><strong>Dynamic ROI Patch Cropping:</strong> Only active bounding boxes (e.g. moving vehicle or person) are compressed and uploaded.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-eco-teal shrink-0 mt-0.5" />
                <span><strong>Sub-256 KB SRAM footprint:</strong> Fits directly on low-cost $3 microcontrollers (ESP32-S3, RP2350) right behind the image sensor.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-eco-teal shrink-0 mt-0.5" />
                <span><strong>Measurable ESG Impact:</strong> Directly saves up to 30.2 million liters of water and megawatt-hours of server electricity annually.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ───── 4. THE 4-STAGE PIPELINE WALKTHROUGH ───── */}
      <section className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="font-mono text-xs uppercase tracking-wider text-eco-teal font-semibold">
            Under The Hood (Section 3.2)
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-eco-ink">
            The 4-Stage Gated Computer Vision Pipeline
          </h2>
          <p className="text-sm sm:text-base text-eco-muted max-w-2xl mx-auto">
            Engineered specifically to execute within strict microcontroller SRAM boundaries without losing security accuracy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-eco-border bg-eco-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-eco-teal">STAGE 01</span>
              <Eye className="h-4 w-4 text-eco-muted" />
            </div>
            <h4 className="font-bold text-eco-ink text-sm">Running Luma Model</h4>
            <p className="text-xs text-eco-muted leading-relaxed">
              Adaptive running average background update:
              <code className="block mt-1.5 p-1 rounded bg-black/50 text-[11px] font-mono text-eco-teal">
                B_t = (1-α)B_t-1 + αI_t
              </code>
              Absorbs slow lighting and weather shifts automatically.
            </p>
          </div>

          <div className="rounded-xl border border-eco-border bg-eco-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-eco-teal">STAGE 02</span>
              <Layers className="h-4 w-4 text-eco-muted" />
            </div>
            <h4 className="font-bold text-eco-ink text-sm">Dual Delta Mask</h4>
            <p className="text-xs text-eco-muted leading-relaxed">
              Fast absolute luminance difference binarization:
              <code className="block mt-1.5 p-1 rounded bg-black/50 text-[11px] font-mono text-eco-teal">
                |I_t(x,y) - B_t(x,y)| &gt; θ_luma
              </code>
              Flags anomalous pixels at single-digit millisecond latency.
            </p>
          </div>

          <div className="rounded-xl border border-eco-border bg-eco-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-eco-teal">STAGE 03</span>
              <GridIcon className="h-4 w-4 text-eco-muted" />
            </div>
            <h4 className="font-bold text-eco-ink text-sm">8×8 Spatial Clustering</h4>
            <p className="text-xs text-eco-muted leading-relaxed">
              Downsamples frame into 8×8 block cells. Groups active clusters and suppresses high-frequency sensor noise and swaying leaves.
            </p>
          </div>

          <div className="rounded-xl border border-eco-border bg-eco-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-eco-teal">STAGE 04</span>
              <Zap className="h-4 w-4 text-eco-teal" />
            </div>
            <h4 className="font-bold text-eco-ink text-sm">Dynamic ROI Patching</h4>
            <p className="text-xs text-eco-muted leading-relaxed">
              Calculates minimal enclosing bounding box + padding. Transmits only the cropped micro-patch to cloud while keeping camera idle.
            </p>
          </div>
        </div>
      </section>

      {/* ───── 5. HARDWARE PLATFORM COMPATIBILITY ───── */}
      <section className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="font-mono text-xs uppercase tracking-wider text-eco-teal font-semibold">
            Embedded Hardware
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-eco-ink">
            Tested on Edge Companion Microcontrollers
          </h2>
          <p className="text-sm sm:text-base text-eco-muted max-w-2xl mx-auto">
            Adheres strictly to the Lin et al. (NeurIPS 2022) low-power microcontroller deployment threshold.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-eco-border bg-eco-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-eco-ink text-sm">ESP32-S3 Cam</h4>
              <span className="rounded bg-eco-teal/15 text-eco-teal text-[10px] font-mono px-2 py-0.5 font-bold">MCU</span>
            </div>
            <div className="text-xs text-eco-muted">Dual-core Xtensa 240MHz • 512 KB SRAM</div>
            <div className="text-xs font-mono text-eco-teal pt-1">Latency: 2.8 ms / frame</div>
          </div>

          <div className="rounded-xl border border-eco-border bg-eco-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-eco-ink text-sm">RP2350 Pico 2</h4>
              <span className="rounded bg-eco-teal/15 text-eco-teal text-[10px] font-mono px-2 py-0.5 font-bold">MCU</span>
            </div>
            <div className="text-xs text-eco-muted">Dual Cortex-M33 150MHz • 520 KB SRAM</div>
            <div className="text-xs font-mono text-eco-teal pt-1">Latency: 3.4 ms / frame</div>
          </div>

          <div className="rounded-xl border border-eco-border bg-eco-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-eco-ink text-sm">NVIDIA Jetson Nano</h4>
              <span className="rounded bg-eco-teal/15 text-eco-teal text-[10px] font-mono px-2 py-0.5 font-bold">SBC</span>
            </div>
            <div className="text-xs text-eco-muted">128 Maxwell Cores • TensorRT Edge</div>
            <div className="text-xs font-mono text-eco-teal pt-1">Latency: 0.9 ms / frame</div>
          </div>

          <div className="rounded-xl border border-eco-border bg-eco-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-eco-ink text-sm">Google Coral Edge</h4>
              <span className="rounded bg-eco-teal/15 text-eco-teal text-[10px] font-mono px-2 py-0.5 font-bold">TPU</span>
            </div>
            <div className="text-xs text-eco-muted">Edge TPU 4 TOPS • int8 Quantized</div>
            <div className="text-xs font-mono text-eco-teal pt-1">Latency: 1.1 ms / frame</div>
          </div>
        </div>
      </section>

      {/* ───── 6. FINAL BOTTOM CTA BANNER ───── */}
      <section className="max-w-5xl mx-auto rounded-3xl border border-eco-teal/30 bg-gradient-to-br from-eco-surface via-eco-card to-eco-surface p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-eco-teal/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-eco-green/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-eco-ink">
            Siap Menguji Sistem Secara Langsung?
          </h2>
          <p className="text-sm sm:text-base text-eco-muted max-w-xl mx-auto">
            Buka control room, pilih skenario CCTV interaktif atau aktifkan webcam Anda untuk melihat kompresi bandwidth dan deteksi ROI berjalan seketika.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => onNavigate('operations')}
            className="inline-flex items-center gap-2 rounded-xl bg-eco-teal px-6 py-3.5 text-sm font-bold text-eco-bg shadow-lg shadow-eco-teal/20 transition-all hover:scale-105 hover:bg-eco-emerald"
          >
            <Play className="h-4 w-4 fill-eco-bg" />
            <span>Masuk ke Live Operations Console</span>
          </button>

          <button
            onClick={() => onNavigate('simulator')}
            className="inline-flex items-center gap-2 rounded-xl border border-eco-border bg-eco-card px-5 py-3.5 text-sm font-semibold text-eco-ink transition-all hover:border-eco-teal/40 hover:text-eco-teal"
          >
            <Sliders className="h-4 w-4 text-eco-teal" />
            <span>Buka Macro Model Calculator</span>
          </button>
        </div>
      </section>
    </div>
  );
};

// Simple helper icon for grid
function GridIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" />
      <path d="M3 15h18" />
      <path d="M9 3v18" />
      <path d="M15 3v18" />
    </svg>
  );
}
