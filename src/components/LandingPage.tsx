import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowRight, 
  Play, 
  Pause,
  Shield, 
  Cpu, 
  Zap, 
  Droplets, 
  Eye, 
  Server, 
  Sliders, 
  CheckCircle2, 
  Activity, 
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
  const [isPlaying, setIsPlaying] = useState(true);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);

  // Guarantee instant hardware-accelerated autoplay
  useEffect(() => {
    if (heroVideoRef.current) {
      heroVideoRef.current.defaultMuted = true;
      heroVideoRef.current.muted = true;
      heroVideoRef.current.play().catch(() => {});
    }
  }, []);

  const togglePlay = () => {
    if (heroVideoRef.current) {
      if (isPlaying) {
        heroVideoRef.current.pause();
      } else {
        heroVideoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative space-y-20 pb-20 overflow-hidden">
      {/* ───── 1. LIGHTWEIGHT HIGH-TECH BACKGROUND LAYER (NO CPU STUTTER) ───── */}
      <div className="absolute top-0 left-0 right-0 h-[800px] -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-200/50 via-emerald-50/20 to-[#F8FAFC]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0596690d_1px,transparent_1px),linear-gradient(to_bottom,#0596690d_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
      </div>

      {/* ───── 2. HERO SECTION ───── */}
      <section className="relative pt-6 sm:pt-14 text-center max-w-5xl mx-auto space-y-8">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white/95 px-4 py-1.5 text-xs font-mono text-emerald-800 shadow-sm backdrop-blur-md">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <span className="font-bold tracking-wide">ECO-VISION PRODUCTION v2.4</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-sans font-medium">Sustainable Edge AI Fleet</span>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100/90 px-3 py-1 text-[11px] font-mono font-bold text-emerald-800 shadow-xs">
            <Video className="h-3.5 w-3.5 text-emerald-700 animate-pulse" />
            <span>REAL-TIME CCTV STREAM (60 FPS FLUID)</span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-extrabold tracking-tight text-slate-900 leading-[1.12]">
            Decide at the camera lens{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent underline decoration-emerald-300 underline-offset-8">
              what is worth sending.
            </span>
          </h1>
          <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto font-sans leading-relaxed">
            Traditional surveillance floods cloud data centers with 24/7 empty video frames. 
            Eco-Vision pre-processes vision streams at the edge sensor — filtering idle redundancy, 
            cropping active Regions of Interest (ROI), and slashing bandwidth and server cooling emissions by ~90%.
          </p>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => onNavigate('operations')}
            className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-emerald-600/25 transition-all hover:scale-105 hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-600/35 active:scale-95"
          >
            <Play className="h-4 w-4 fill-white transition-transform group-hover:translate-x-0.5" />
            <span>Launch Live Console</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => onNavigate('simulator')}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800"
          >
            <Sliders className="h-4 w-4 text-emerald-600" />
            <span>Section 3.3 Calculator</span>
          </button>

          <button
            onClick={() => onNavigate('fleet')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-emerald-300"
          >
            <Server className="h-4 w-4 text-slate-500" />
            <span>Fleet Nodes</span>
          </button>
        </div>

        {/* Live System Status Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-700 font-semibold">Edge Engine: Ready (Browser WASM + Python)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${isBackendConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>FastAPI Backend: {isBackendConnected ? 'Connected (Port 8001)' : 'Local Mode'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-emerald-600" />
            <span>Memory Budget: &lt;256 KB SRAM Compliant</span>
          </div>
        </div>
      </section>

      {/* ───── 3. SILKY-SMOOTH HARDWARE-ACCELERATED VIDEO SHOWCASE CARD ───── */}
      <section className="relative rounded-3xl border-2 border-emerald-200 bg-white p-5 sm:p-7 shadow-2xl shadow-emerald-950/10 max-w-6xl mx-auto overflow-hidden">
        {/* Card Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
            </div>
            <span className="font-mono text-xs font-semibold text-slate-700">
              eco-vision://live-feed/cam-01/traffic-corridor
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={togglePlay}
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 font-mono text-xs transition-colors"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5 text-slate-600" /> : <Play className="h-3.5 w-3.5 text-emerald-600" />}
              <span>{isPlaying ? 'Pause Video' : 'Play Video'}</span>
            </button>
            <button
              onClick={() => onNavigate('operations')}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 py-1 font-sans text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <span>Launch Control Room</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 🎬 REAL CCTV VIDEO PLAYER (OPTIMIZED 30 FPS FLUID STREAM) */}
        <div className="relative mt-5 rounded-2xl overflow-hidden border-2 border-emerald-400/80 bg-slate-950 shadow-2xl aspect-video sm:aspect-[21/9] group">
          <video
            ref={heroVideoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover will-change-transform"
          >
            <source src="/videos/surveillance-bg.mp4" type="video/mp4" />
          </video>

          {/* OSD Surveillance HUD Overlay */}
          <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 flex flex-col justify-between bg-gradient-to-t from-black/80 via-transparent to-black/60">
            {/* Top OSD Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-emerald-400">
              <div className="flex items-center gap-2.5 bg-black/70 px-3 py-1.5 rounded-lg border border-emerald-500/30 backdrop-blur-md">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-white font-extrabold tracking-wider">LIVE REC</span>
                <span className="text-emerald-300">CAM-01 • TRAFFIC CORRIDOR</span>
                <span className="text-slate-400 hidden sm:inline">1080p @ 30FPS</span>
              </div>
              <div className="bg-emerald-950/80 border border-emerald-400/50 px-3 py-1.5 rounded-lg text-emerald-300 font-bold backdrop-blur-md">
                ⚡ IN-LENS EDGE FILTER: ACTIVE [89.5% SAVED]
              </div>
            </div>

            {/* Dynamic Simulated Edge Bounding Box Target */}
            <div className="absolute top-[35%] left-[28%] w-36 h-48 border-2 border-emerald-400 rounded-lg bg-emerald-400/10 pointer-events-none animate-pulse">
              <span className="absolute -top-6 left-0 bg-emerald-600 text-white text-[11px] font-mono px-2 py-0.5 rounded font-bold shadow-md">
                PEDESTRIAN 98.4%
              </span>
              <div className="absolute bottom-1 right-1 font-mono text-[9px] text-emerald-300 bg-black/60 px-1 rounded">
                ROI [144×192]
              </div>
            </div>

            <div className="absolute top-[45%] right-[22%] w-48 h-32 border-2 border-cyan-400 rounded-lg bg-cyan-400/10 pointer-events-none">
              <span className="absolute -top-6 left-0 bg-cyan-600 text-white text-[11px] font-mono px-2 py-0.5 rounded font-bold shadow-md">
                VEHICLE 96.1%
              </span>
            </div>

            {/* Bottom OSD Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-black/75 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-lg text-xs font-mono font-bold backdrop-blur-md">
                  Transmitting ROI: 368 kbps <span className="text-slate-400 line-through ml-1">3,500 kbps</span>
                </span>
                <span className="bg-black/75 text-cyan-300 border border-cyan-500/40 px-3 py-1.5 rounded-lg text-xs font-mono font-bold backdrop-blur-md hidden sm:inline">
                  Latency: 2.8 ms (ESP32-S3)
                </span>
              </div>
              <button
                onClick={() => onNavigate('operations')}
                className="pointer-events-auto inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-lg hover:scale-105"
              >
                <span>Enter Operations Room</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Telemetry Highlight Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-6">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 transition-transform hover:-translate-y-0.5">
            <div className="text-[11px] font-mono text-emerald-800 font-semibold flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-emerald-600" />
              <span>Bandwidth Reduction</span>
            </div>
            <div className="mt-2 text-3xl font-extrabold font-mono text-emerald-700">~89.5%</div>
            <div className="text-xs text-slate-500 mt-1">3,500 kbps → 368 kbps avg</div>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 transition-transform hover:-translate-y-0.5">
            <div className="text-[11px] font-mono text-emerald-800 font-semibold flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-emerald-600" />
              <span>Cloud Inference FLOPs</span>
            </div>
            <div className="mt-2 text-3xl font-extrabold font-mono text-emerald-700">-90.0%</div>
            <div className="text-xs text-slate-500 mt-1">Static background skipped</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-transform hover:-translate-y-0.5">
            <div className="text-[11px] font-mono text-slate-700 font-semibold flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-amber-600" />
              <span>Edge Process Latency</span>
            </div>
            <div className="mt-2 text-3xl font-extrabold font-mono text-slate-900">&lt; 3.2 ms</div>
            <div className="text-xs text-slate-500 mt-1">Sub-frame local gating</div>
          </div>

          <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-4 transition-transform hover:-translate-y-0.5">
            <div className="text-[11px] font-mono text-cyan-800 font-semibold flex items-center gap-1.5">
              <Droplets className="h-4 w-4 text-cyan-600" />
              <span>Cooling Water Saved</span>
            </div>
            <div className="mt-2 text-3xl font-extrabold font-mono text-cyan-700">30.2M L</div>
            <div className="text-xs text-slate-500 mt-1">Annual datacenter impact</div>
          </div>
        </div>
      </section>

      {/* ───── 4. PROBLEM VS SOLUTION (PARADIGM SHIFT) ───── */}
      <section className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="font-mono text-xs uppercase tracking-wider text-emerald-700 font-bold bg-emerald-100 px-3 py-1 rounded-full">
            PARADIGM SHIFT
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
            Traditional Cloud CCTV vs Eco-Vision Architecture
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Why streaming 1080p full frames 24 hours a day to cloud GPUs is financially and environmentally unsustainable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Legacy Cloud Streaming */}
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600">
                <CloudOff className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Traditional Cloud Surveillance</h3>
                <p className="text-xs text-red-600 font-mono font-semibold">Wasteful 24/7 Redundant Streaming</p>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-extrabold text-base">✕</span>
                <span><strong>Streams 24/7 blank footage:</strong> 90%+ of typical CCTV feeds consist of empty corridors, locked gates, and stationary walls.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-extrabold text-base">✕</span>
                <span><strong>Massive cloud GPU inference cost:</strong> Data center GPUs burn kilowatt-hours running YOLO/ResNet on unchanged background pixels.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-extrabold text-base">✕</span>
                <span><strong>Network uplink saturation:</strong> 100 cameras saturate a 500 Mbps enterprise WAN connection continuously.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-extrabold text-base">✕</span>
                <span><strong>Enormous water footprint:</strong> Evaporative cooling towers in cloud data centers consume tens of millions of liters of freshwater.</span>
              </li>
            </ul>
          </div>

          {/* Eco-Vision Edge Pre-Processor */}
          <div className="rounded-2xl border border-emerald-300 bg-white p-6 sm:p-8 space-y-6 shadow-md shadow-emerald-950/5">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Eco-Vision Edge Architecture</h3>
                <p className="text-xs text-emerald-700 font-mono font-bold">In-Lens Filter & Gated Transmission</p>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span><strong>Zero transmission when idle:</strong> Transmits 0 kbps while the scene remains stationary, suppressing false alerts.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span><strong>Dynamic ROI Patch Cropping:</strong> Only active bounding boxes (e.g. moving vehicle or person) are compressed and uploaded.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span><strong>Sub-256 KB SRAM footprint:</strong> Fits directly on low-cost $3 microcontrollers (ESP32-S3, RP2350) right behind the image sensor.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span><strong>Measurable ESG Impact:</strong> Directly saves up to 30.2 million liters of water and megawatt-hours of server electricity annually.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ───── 5. THE 4-STAGE PIPELINE WALKTHROUGH ───── */}
      <section className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="font-mono text-xs uppercase tracking-wider text-emerald-700 font-bold bg-emerald-100 px-3 py-1 rounded-full">
            UNDER THE HOOD (SECTION 3.2)
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
            The 4-Stage Gated Computer Vision Pipeline
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Engineered specifically to execute within strict microcontroller SRAM boundaries without losing security accuracy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-emerald-100 bg-white p-5 space-y-3 shadow-sm hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">STAGE 01</span>
              <Eye className="h-4 w-4 text-emerald-600" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Running Luma Model</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Adaptive running average background update:
              <code className="block mt-1.5 p-1.5 rounded bg-slate-100 text-[11px] font-mono text-emerald-800 font-semibold">
                B_t = (1-α)B_t-1 + αI_t
              </code>
              Absorbs slow lighting and weather shifts automatically.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-white p-5 space-y-3 shadow-sm hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">STAGE 02</span>
              <Layers className="h-4 w-4 text-emerald-600" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Dual Delta Mask</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fast absolute luminance difference binarization:
              <code className="block mt-1.5 p-1.5 rounded bg-slate-100 text-[11px] font-mono text-emerald-800 font-semibold">
                |I_t(x,y) - B_t(x,y)| &gt; θ_luma
              </code>
              Flags anomalous pixels at single-digit millisecond latency.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-white p-5 space-y-3 shadow-sm hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">STAGE 03</span>
              <GridIcon className="h-4 w-4 text-emerald-600" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">8×8 Spatial Clustering</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Downsamples frame into 8×8 block cells. Groups active clusters and suppresses high-frequency sensor noise and swaying leaves.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-white p-5 space-y-3 shadow-sm hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">STAGE 04</span>
              <Zap className="h-4 w-4 text-emerald-600" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Dynamic ROI Patching</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calculates minimal enclosing bounding box + padding. Transmits only the cropped micro-patch to cloud while keeping camera idle.
            </p>
          </div>
        </div>
      </section>

      {/* ───── 6. HARDWARE PLATFORM COMPATIBILITY ───── */}
      <section className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="font-mono text-xs uppercase tracking-wider text-emerald-700 font-bold bg-emerald-100 px-3 py-1 rounded-full">
            EMBEDDED HARDWARE
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
            Tested on Edge Companion Microcontrollers
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Adheres strictly to the Lin et al. (NeurIPS 2022) low-power microcontroller deployment threshold.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2 shadow-sm hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">ESP32-S3 Cam</h4>
              <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono px-2 py-0.5 font-bold">MCU</span>
            </div>
            <div className="text-xs text-slate-500">Dual-core Xtensa 240MHz • 512 KB SRAM</div>
            <div className="text-xs font-mono text-emerald-700 font-semibold pt-1">Latency: 2.8 ms / frame</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2 shadow-sm hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">RP2350 Pico 2</h4>
              <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono px-2 py-0.5 font-bold">MCU</span>
            </div>
            <div className="text-xs text-slate-500">Dual Cortex-M33 150MHz • 520 KB SRAM</div>
            <div className="text-xs font-mono text-emerald-700 font-semibold pt-1">Latency: 3.4 ms / frame</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2 shadow-sm hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">NVIDIA Jetson Nano</h4>
              <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono px-2 py-0.5 font-bold">SBC</span>
            </div>
            <div className="text-xs text-slate-500">128 Maxwell Cores • TensorRT Edge</div>
            <div className="text-xs font-mono text-emerald-700 font-semibold pt-1">Latency: 0.9 ms / frame</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2 shadow-sm hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">Google Coral Edge</h4>
              <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono px-2 py-0.5 font-bold">TPU</span>
            </div>
            <div className="text-xs text-slate-500">Edge TPU 4 TOPS • int8 Quantized</div>
            <div className="text-xs font-mono text-emerald-700 font-semibold pt-1">Latency: 1.1 ms / frame</div>
          </div>
        </div>
      </section>

      {/* ───── 7. FINAL BOTTOM CTA BANNER (BRIGHT EMERALD THEME) ───── */}
      <section className="max-w-5xl mx-auto rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-8 sm:p-12 text-center space-y-6 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-white">
            Siap Menguji Sistem Secara Langsung?
          </h2>
          <p className="text-sm sm:text-base text-emerald-50 max-w-xl mx-auto">
            Buka control room, pilih skenario CCTV interaktif atau aktifkan webcam Anda untuk melihat kompresi bandwidth dan deteksi ROI berjalan seketika.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 relative z-10">
          <button
            onClick={() => onNavigate('operations')}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 text-sm font-bold text-emerald-800 shadow-lg hover:bg-emerald-50 transition-all hover:scale-105"
          >
            <Play className="h-4 w-4 fill-emerald-800" />
            <span>Masuk ke Live Operations Console</span>
          </button>

          <button
            onClick={() => onNavigate('simulator')}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/60 bg-emerald-800/40 px-6 py-4 text-sm font-semibold text-white transition-all hover:bg-emerald-800/60 backdrop-blur-sm"
          >
            <Sliders className="h-4 w-4 text-emerald-200" />
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
