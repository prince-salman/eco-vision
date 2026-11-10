import React from 'react';
import { Sliders, Cpu, Eye, Activity, RotateCcw, Crosshair } from 'lucide-react';
import { TelemetryData } from '../types';

export type PipelineViewMode = 
  | 'dual'
  | 'stage1_bg'
  | 'stage2_diff'
  | 'stage3_blocks'
  | 'stage4_roi'
  | 'cloud_compare';

interface PipelineDebuggerProps {
  viewMode: PipelineViewMode;
  setViewMode: (mode: PipelineViewMode) => void;
  telemetry: TelemetryData | null;
  lumaThreshold: number;
  setLumaThreshold: (val: number) => void;
  activityThreshold: number;
  setActivityThreshold: (val: number) => void;
  hysteresisFrames: number;
  setHysteresisFrames: (val: number) => void;
  roiPaddingPct: number;
  setRoiPaddingPct: (val: number) => void;
  onResetBackground: () => void;
  onInjectMotion: (label: string) => void;
}

export const PipelineDebugger: React.FC<PipelineDebuggerProps> = ({
  viewMode,
  setViewMode,
  telemetry,
  lumaThreshold,
  setLumaThreshold,
  activityThreshold,
  setActivityThreshold,
  hysteresisFrames,
  setHysteresisFrames,
  roiPaddingPct,
  setRoiPaddingPct,
  onResetBackground,
  onInjectMotion,
}) => {
  const VIEW_TABS: { id: PipelineViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'dual', label: 'Dual Stream', icon: <Eye className="h-3.5 w-3.5" /> },
    { id: 'stage1_bg', label: 'Stage 1: Background (Bt)', icon: <Eye className="h-3.5 w-3.5" /> },
    { id: 'stage2_diff', label: 'Stage 2: Delta Mask', icon: <Activity className="h-3.5 w-3.5" /> },
    { id: 'stage3_blocks', label: 'Stage 3: 8×8 Clustering', icon: <Activity className="h-3.5 w-3.5" /> },
    { id: 'stage4_roi', label: 'Stage 4: Cropped ROI', icon: <Eye className="h-3.5 w-3.5" /> },
    { id: 'cloud_compare', label: 'Cloud Ingress Compare', icon: <Cpu className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="space-y-4 rounded-xl border border-eco-border bg-eco-card p-4 shadow-lg">
      {/* View Mode Switcher Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-eco-border/80 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-eco-teal" />
          <span className="font-mono text-xs font-bold text-eco-ink uppercase tracking-wider">
            Pipeline Stage Visualizer & Diagnostics (Section 3.2)
          </span>
        </div>

        {/* View Mode Buttons */}
        <div className="flex flex-wrap items-center gap-1 bg-eco-surface p-1 rounded-lg border border-eco-border">
          {VIEW_TABS.map((tab) => {
            const isActive = viewMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-eco-teal/20 text-eco-teal border border-eco-teal/40 shadow-xs'
                    : 'text-eco-muted hover:text-eco-ink'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Controls & Real-time Tuning Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left 2 Cols: Live Sliders */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          {/* Slider 1: Luma Threshold */}
          <div className="rounded-lg border border-eco-border/60 bg-eco-surface/50 p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-eco-muted">Luma Difference (θ_luma)</span>
              <span className="font-bold text-eco-teal">{lumaThreshold}</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={lumaThreshold}
              onChange={e => setLumaThreshold(Number(e.target.value))}
              className="w-full accent-eco-teal cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-eco-muted">
              <span>5 (Ultra Sensitive)</span>
              <span>20 (Nominal)</span>
              <span>50 (High Noise)</span>
            </div>
          </div>

          {/* Slider 2: Activity Threshold */}
          <div className="rounded-lg border border-eco-border/60 bg-eco-surface/50 p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-eco-muted">Activity Trigger (θ_act)</span>
              <span className="font-bold text-eco-teal">{(activityThreshold * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.001"
              max="0.05"
              step="0.001"
              value={activityThreshold}
              onChange={e => setActivityThreshold(Number(e.target.value))}
              className="w-full accent-eco-teal cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-eco-muted">
              <span>0.1% (Sparse)</span>
              <span>0.5% (Nominal)</span>
              <span>5.0% (Dense)</span>
            </div>
          </div>

          {/* Slider 3: Hysteresis Window */}
          <div className="rounded-lg border border-eco-border/60 bg-eco-surface/50 p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-eco-muted">Hysteresis Buffer</span>
              <span className="font-bold text-eco-teal">{hysteresisFrames} frames ({(hysteresisFrames / 15).toFixed(1)}s)</span>
            </div>
            <input
              type="range"
              min="5"
              max="45"
              step="1"
              value={hysteresisFrames}
              onChange={e => setHysteresisFrames(Number(e.target.value))}
              className="w-full accent-eco-teal cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-eco-muted">
              <span>5 frames</span>
              <span>15 (1.0s)</span>
              <span>45 (3.0s)</span>
            </div>
          </div>

          {/* Slider 4: ROI Padding */}
          <div className="rounded-lg border border-eco-border/60 bg-eco-surface/50 p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-eco-muted">ROI Safety Margin (Pad)</span>
              <span className="font-bold text-eco-teal">{Math.round(roiPaddingPct * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.30"
              step="0.01"
              value={roiPaddingPct}
              onChange={e => setRoiPaddingPct(Number(e.target.value))}
              className="w-full accent-eco-teal cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-eco-muted">
              <span>5% (Tight)</span>
              <span>10% (Nominal)</span>
              <span>30% (Wide)</span>
            </div>
          </div>
        </div>

        {/* Right Col: Interactive Actions & Tensor Telemetry */}
        <div className="rounded-lg border border-eco-border/60 bg-eco-surface/70 p-3 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-eco-muted text-[11px] uppercase tracking-wide">Interactive Stimulus</span>
            <button
              onClick={onResetBackground}
              className="inline-flex items-center gap-1 text-[10px] text-eco-muted hover:text-eco-teal transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Model</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onInjectMotion('Simulated Pedestrian')}
              className="flex-1 inline-flex items-center justify-center gap-1 rounded bg-eco-teal/15 border border-eco-teal/30 py-1.5 px-2 text-[11px] font-semibold text-eco-teal hover:bg-eco-teal/25 transition-all cursor-pointer"
            >
              <Crosshair className="h-3 w-3" />
              <span>Inject Pedestrian</span>
            </button>

            <button
              onClick={() => onInjectMotion('Delivery Vehicle')}
              className="flex-1 inline-flex items-center justify-center gap-1 rounded bg-eco-amber/15 border border-eco-amber/30 py-1.5 px-2 text-[11px] font-semibold text-eco-amber hover:bg-eco-amber/25 transition-all cursor-pointer"
            >
              <Crosshair className="h-3 w-3" />
              <span>Inject Vehicle</span>
            </button>
          </div>

          {/* On-Device MobileNet Feature Tensor Preview */}
          <div className="border-t border-eco-border/60 pt-2 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-eco-muted">
              <span className="flex items-center gap-1">
                <Cpu className="h-3 w-3 text-eco-teal" />
                <span>Stage 4 MobileNet int8 Embedding</span>
              </span>
              <span className="text-eco-teal font-bold">{telemetry?.latencyMs ?? 0} ms</span>
            </div>
            <div className="rounded bg-black/60 p-2 text-[10px] text-eco-muted font-mono overflow-x-auto truncate">
              {telemetry?.embeddingPreview 
                ? `[ ${telemetry.embeddingPreview.join(', ')}, ... 128-d ]`
                : '[ 0, 0, 0, 0, 0, 0, 0, 0, ... ]'}
            </div>
            <div className="flex items-center justify-between text-[10px] text-eco-muted pt-0.5">
              <span>RAM: {telemetry?.hardwareMemoryKb ?? 138} KB / 256 KB</span>
              <span className="text-eco-green font-bold">Lin et al. NeurIPS 2022 OK</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
