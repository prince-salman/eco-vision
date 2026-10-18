import React, { useState } from 'react';
import { MacroParams } from '../types';
import { calculateMacroImpact, DEFAULT_MACRO_PARAMS } from '../engine/macroModel';
import { Sliders, RotateCcw, TrendingDown, Server, Wind, Droplet } from 'lucide-react';

export const MacroSimulator: React.FC = () => {
  const [params, setParams] = useState<MacroParams>(DEFAULT_MACRO_PARAMS);

  const updateParam = (key: keyof MacroParams, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const resetDefaults = () => {
    setParams(DEFAULT_MACRO_PARAMS);
  };

  const impact = calculateMacroImpact(params);

  const formatCams = (v: number) => {
    return v >= 1e6 ? `${(v / 1e6).toFixed(2)} million` : `${Math.round(v / 1e3)} thousand`;
  };

  return (
    <div className="space-y-6 rounded-2xl border border-eco-border bg-eco-card p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-eco-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-eco-teal" />
            <h2 className="text-xl font-bold font-serif text-eco-ink tracking-tight">
              Macro Resource Consumption Model (Section 3.3)
            </h2>
          </div>
          <p className="text-xs text-eco-muted mt-1 max-w-2xl">
            Simulate city-scale or enterprise camera networks using the analytical model from Section 3.3 of the essay: 
            1080p @ 4 Mbps, 15 fps, 50-GFLOP detector, 10 pJ/FLOP, 0.5% metadata overhead, and 0.5 L cooling water/IT kWh.
          </p>
        </div>

        <button
          onClick={resetDefaults}
          className="inline-flex items-center gap-1.5 rounded-lg border border-eco-border bg-eco-surface px-3 py-1.5 text-xs font-medium text-eco-muted hover:text-eco-ink hover:border-eco-teal/40 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* 1. Camera Fleet Size */}
        <div className="space-y-2 rounded-xl border border-eco-border/60 bg-eco-surface/50 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-eco-ink">Camera Fleet Size (N)</span>
            <span className="font-mono text-eco-teal font-bold">{formatCams(params.cams)}</span>
          </div>
          <input
            type="range"
            min="10000"
            max="5000000"
            step="10000"
            value={params.cams}
            onChange={(e) => updateParam('cams', Number(e.target.value))}
            className="w-full accent-eco-teal cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-eco-muted font-mono">
            <span>10k</span>
            <span>1M</span>
            <span>5M</span>
          </div>
        </div>

        {/* 2. Scene Activity Share */}
        <div className="space-y-2 rounded-xl border border-eco-border/60 bg-eco-surface/50 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-eco-ink">Scene Activity (% time)</span>
            <span className="font-mono text-eco-teal font-bold">{params.act}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="80"
            step="1"
            value={params.act}
            onChange={(e) => updateParam('act', Number(e.target.value))}
            className="w-full accent-eco-teal cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-eco-muted font-mono">
            <span>5% (sparse)</span>
            <span>20% (typical)</span>
            <span>80% (busy)</span>
          </div>
        </div>

        {/* 3. ROI Share of Frame */}
        <div className="space-y-2 rounded-xl border border-eco-border/60 bg-eco-surface/50 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-eco-ink">ROI Share of Active Frame</span>
            <span className="font-mono text-eco-teal font-bold">{params.roi}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="1"
            value={params.roi}
            onChange={(e) => updateParam('roi', Number(e.target.value))}
            className="w-full accent-eco-teal cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-eco-muted font-mono">
            <span>10% (tight crop)</span>
            <span>50% (average)</span>
            <span>100% (full frame)</span>
          </div>
        </div>

        {/* 4. Edge Node Power */}
        <div className="space-y-2 rounded-xl border border-eco-border/60 bg-eco-surface/50 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-eco-ink">Edge Node Power (Watts)</span>
            <span className="font-mono text-eco-teal font-bold">{params.edge.toFixed(1)} W</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="5.0"
            step="0.1"
            value={params.edge}
            onChange={(e) => updateParam('edge', Number(e.target.value))}
            className="w-full accent-eco-teal cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-eco-muted font-mono">
            <span>0.5 W (MCU)</span>
            <span>2.0 W (Edge TPU)</span>
            <span>5.0 W (SBC)</span>
          </div>
        </div>

        {/* 5. Data Center PUE */}
        <div className="space-y-2 rounded-xl border border-eco-border/60 bg-eco-surface/50 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-eco-ink">Data Center PUE</span>
            <span className="font-mono text-eco-teal font-bold">{params.pue.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="1.10"
            max="2.00"
            step="0.05"
            value={params.pue}
            onChange={(e) => updateParam('pue', Number(e.target.value))}
            className="w-full accent-eco-teal cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-eco-muted font-mono">
            <span>1.10 (Hyperscale)</span>
            <span>1.40 (Industry avg)</span>
            <span>2.00 (Legacy)</span>
          </div>
        </div>

        {/* 6. Grid Carbon Intensity */}
        <div className="space-y-2 rounded-xl border border-eco-border/60 bg-eco-surface/50 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-eco-ink">Grid Carbon Intensity</span>
            <span className="font-mono text-eco-teal font-bold">{params.grid.toFixed(2)} kg/kWh</span>
          </div>
          <input
            type="range"
            min="0.10"
            max="0.90"
            step="0.05"
            value={params.grid}
            onChange={(e) => updateParam('grid', Number(e.target.value))}
            className="w-full accent-eco-teal cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-eco-muted font-mono">
            <span>0.10 (Hydro/Nuclear)</span>
            <span>0.45 (Global avg)</span>
            <span>0.90 (Coal grid)</span>
          </div>
        </div>
      </div>

      {/* Headline Impact Callout */}
      <div className={`rounded-xl border p-4 transition-all ${
        impact.netEnergySavedGwh > 0 
          ? 'border-eco-green/40 bg-eco-green/10 text-eco-ink' 
          : 'border-eco-amber/40 bg-eco-amber/10 text-eco-ink'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`rounded-lg p-2 ${impact.netEnergySavedGwh > 0 ? 'bg-eco-green/20 text-eco-green' : 'bg-eco-amber/20 text-eco-amber'}`}>
            <TrendingDown className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-eco-ink">Annual Impact Summary</h4>
            <p className="text-xs leading-relaxed text-eco-ink/90 mt-0.5">
              {impact.summaryText}
            </p>
          </div>
        </div>
      </div>

      {/* Annual Resource Model Table */}
      <div className="overflow-x-auto rounded-xl border border-eco-border bg-eco-surface/40">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-eco-border bg-eco-surface text-eco-muted font-mono uppercase tracking-wider">
              <th className="py-3 px-4">Metric</th>
              <th className="py-3 px-4 text-right">Centralised (Cloud Only)</th>
              <th className="py-3 px-4 text-right">Eco-Vision (Edge + Cloud)</th>
              <th className="py-3 px-4 text-right">Net Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-eco-border/50 font-mono">
            {impact.tableRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-eco-surface/80 transition-colors">
                <td className="py-3 px-4 font-sans font-medium text-eco-ink">
                  {row.metric}
                </td>
                <td className="py-3 px-4 text-right text-eco-muted tabular-nums">
                  {row.centralised}
                </td>
                <td className="py-3 px-4 text-right text-eco-ink font-semibold tabular-nums">
                  {row.ecoVision}
                </td>
                <td className={`py-3 px-4 text-right font-bold tabular-nums ${
                  row.badgeType === 'good' ? 'text-eco-emerald' : row.badgeType === 'keep' ? 'text-eco-teal' : 'text-eco-muted'
                }`}>
                  {row.change}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Explanatory notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-eco-muted border-t border-eco-border/60 pt-4">
        <div className="flex items-start gap-2">
          <Server className="h-4 w-4 text-eco-teal shrink-0 mt-0.5" />
          <span>
            <b>Inference Load:</b> In centralised setups, 15 fps runs continuously on empty rooms. Eco-Vision reduces cloud inference FLOPs strictly in proportion to scene activity and ROI area.
          </span>
        </div>
        <div className="flex items-start gap-2">
          <Wind className="h-4 w-4 text-eco-green shrink-0 mt-0.5" />
          <span>
            <b>Carbon Accounting:</b> Operational carbon emissions are computed from net GWh saved minus edge node consumption, multiplied by the local grid carbon intensity.
          </span>
        </div>
        <div className="flex items-start gap-2">
          <Droplet className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
          <span>
            <b>Evaporative Water:</b> Data centers consume roughly 0.5 L of water per IT kWh for cooling towers. Offloading inference preserves local freshwater aquifers.
          </span>
        </div>
      </div>
    </div>
  );
};
