import React from 'react';
import { TelemetryData } from '../types';
import { Gauge, ArrowDownRight, Droplets, Leaf, Cpu } from 'lucide-react';

interface TelemetryBarProps {
  telemetry: TelemetryData | null;
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({ telemetry }) => {
  const t = telemetry;
  
  // Format numbers cleanly
  const formatNum = (num: number, dp: number = 1) => {
    return num.toLocaleString('en-US', {
      maximumFractionDigits: dp,
      minimumFractionDigits: dp,
    });
  };

  const compressionRatio = t?.compressionRatioPct ?? 0;
  const currentKbps = t?.currentKbps ?? 0;
  const baselineKbps = 4000;
  const bandwidthSavedPct = Math.max(0, Math.round(((baselineKbps - currentKbps) / baselineKbps) * 100));

  const totalCaptured = t?.totalCapturedFrames || 1;
  const totalSent = t?.totalSentFrames || 0;
  const frameRetentionPct = Math.round((totalSent / totalCaptured) * 1000) / 10;

  const energyWh = t?.cumulativeEnergySavedWh ?? 0;
  const co2Grams = t?.cumulativeCo2AvoidedGrams ?? 0;
  const waterMl = t?.cumulativeWaterSavedMl ?? 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {/* 1. Bandwidth Reduction */}
      <div className="rounded-xl border border-eco-border bg-eco-card p-3.5 shadow-md hover:border-eco-teal/40 transition-colors">
        <div className="flex items-center justify-between text-eco-muted mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider">Bandwidth Saved</span>
          <ArrowDownRight className="h-4 w-4 text-eco-teal" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-2xl font-bold tracking-tight text-eco-teal tabular-nums">
            {bandwidthSavedPct}%
          </span>
          <span className="text-[11px] text-eco-muted font-mono">
            vs 4 Mbps
          </span>
        </div>
        <p className="mt-1 text-[11px] text-eco-muted">
          Active: <b className="text-eco-ink font-mono">{currentKbps}</b> Kbps
        </p>
      </div>

      {/* 2. Instant Frame Compression */}
      <div className="rounded-xl border border-eco-border bg-eco-card p-3.5 shadow-md hover:border-eco-emerald/40 transition-colors">
        <div className="flex items-center justify-between text-eco-muted mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider">Frame Traffic</span>
          <Gauge className="h-4 w-4 text-eco-emerald" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-2xl font-bold tracking-tight text-eco-emerald tabular-nums">
            {compressionRatio}%
          </span>
          <span className="text-[11px] text-eco-muted">pruned</span>
        </div>
        <p className="mt-1 text-[11px] text-eco-muted">
          Frames kept: <b className="text-eco-ink font-mono">{frameRetentionPct}%</b>
        </p>
      </div>

      {/* 3. Cloud GPU Inference Offloaded */}
      <div className="rounded-xl border border-eco-border bg-eco-card p-3.5 shadow-md hover:border-eco-teal/40 transition-colors">
        <div className="flex items-center justify-between text-eco-muted mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider">Cloud FLOPs</span>
          <Cpu className="h-4 w-4 text-eco-teal" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-2xl font-bold tracking-tight text-eco-ink tabular-nums">
            {totalCaptured > 0 ? Math.round(((totalCaptured - totalSent) / totalCaptured) * 100) : 0}%
          </span>
          <span className="text-[11px] text-eco-teal">spared</span>
        </div>
        <p className="mt-1 text-[11px] text-eco-muted">
          50 GFLOP/frame inference
        </p>
      </div>

      {/* 4. Energy Saved */}
      <div className="rounded-xl border border-eco-border bg-eco-card p-3.5 shadow-md hover:border-eco-teal/40 transition-colors">
        <div className="flex items-center justify-between text-eco-muted mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider">Energy Saved</span>
          <span className="font-mono text-xs text-eco-teal font-bold">Wh</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-2xl font-bold tracking-tight text-eco-ink tabular-nums">
            {energyWh >= 1000 ? formatNum(energyWh / 1000, 2) : formatNum(energyWh, 1)}
          </span>
          <span className="text-[11px] text-eco-muted font-mono">
            {energyWh >= 1000 ? 'kWh' : 'Wh'}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-eco-muted">
          Cloud IT + Ingress savings
        </p>
      </div>

      {/* 5. CO2 Emissions Avoided */}
      <div className="rounded-xl border border-eco-border bg-eco-card p-3.5 shadow-md hover:border-eco-green/40 transition-colors">
        <div className="flex items-center justify-between text-eco-muted mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider">CO₂ Avoided</span>
          <Leaf className="h-4 w-4 text-eco-green" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-2xl font-bold tracking-tight text-eco-green tabular-nums">
            {co2Grams >= 1000 ? formatNum(co2Grams / 1000, 2) : formatNum(co2Grams, 1)}
          </span>
          <span className="text-[11px] text-eco-muted font-mono">
            {co2Grams >= 1000 ? 'kg' : 'grams'}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-eco-muted">
          Grid 0.45 kg/kWh intensity
        </p>
      </div>

      {/* 6. Water Consumption Spared */}
      <div className="rounded-xl border border-eco-border bg-eco-card p-3.5 shadow-md hover:border-sky-400/40 transition-colors">
        <div className="flex items-center justify-between text-eco-muted mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider">Cooling Water</span>
          <Droplets className="h-4 w-4 text-sky-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-2xl font-bold tracking-tight text-sky-300 tabular-nums">
            {waterMl >= 1000 ? formatNum(waterMl / 1000, 2) : formatNum(waterMl, 1)}
          </span>
          <span className="text-[11px] text-eco-muted font-mono">
            {waterMl >= 1000 ? 'Liters' : 'mL'}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-eco-muted">
          0.5 L / IT kWh evaporative
        </p>
      </div>
    </div>
  );
};
