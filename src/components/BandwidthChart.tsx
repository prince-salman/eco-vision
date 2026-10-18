import React, { useRef, useEffect } from 'react';
import { TelemetryData } from '../types';

interface BandwidthChartProps {
  telemetry: TelemetryData | null;
}

export const BandwidthChart: React.FC<BandwidthChartProps> = ({ telemetry }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const historyRef = useRef<number[]>(new Array(40).fill(0));
  const lastPushTimeRef = useRef<number>(0);
  const baselineKbps = 4000;

  useEffect(() => {
    const now = performance.now();
    const currentKbps = telemetry?.currentKbps ?? 0;
    const history = historyRef.current;

    // Push new point every ~160ms (~6 updates/sec) or blend with latest point
    if (now - lastPushTimeRef.current >= 160) {
      lastPushTimeRef.current = now;
      history.push(currentKbps);
      if (history.length > 40) {
        history.shift();
      }
    } else if (history.length > 0) {
      history[history.length - 1] = Math.round(history[history.length - 1] * 0.7 + currentKbps * 0.3);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#1F333E';
    ctx.lineWidth = 1;

    // Horizontal lines for 4000, 2000, 0 Kbps
    const yBaseline = 15;
    const yMid = h / 2;
    const yBottom = h - 15;

    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.moveTo(40, yBaseline); ctx.lineTo(w - 10, yBaseline);
    ctx.moveTo(40, yMid); ctx.lineTo(w - 10, yMid);
    ctx.moveTo(40, yBottom); ctx.lineTo(w - 10, yBottom);
    ctx.stroke();
    ctx.setLineDash([]);

    // Y-axis labels
    ctx.fillStyle = '#64748B';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText('4 Mbps', 35, yBaseline + 3);
    ctx.fillText('2 Mbps', 35, yMid + 3);
    ctx.fillText('0 Kbps', 35, yBottom + 3);

    // Draw Centralised Baseline (Red solid line at 4 Mbps)
    ctx.strokeStyle = '#F87171';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, yBaseline);
    ctx.lineTo(w - 10, yBaseline);
    ctx.stroke();

    // Map history data points to coordinates
    const startX = 40;
    const endX = w - 10;
    const stepX = (endX - startX) / (history.length - 1);

    const getX = (idx: number) => startX + idx * stepX;
    const getY = (val: number) => {
      const clamped = Math.max(0, Math.min(baselineKbps, val));
      const ratio = clamped / baselineKbps;
      return yBottom - ratio * (yBottom - yBaseline);
    };

    // Draw Eco-Vision Area Gradient
    const gradient = ctx.createLinearGradient(0, yBaseline, 0, yBottom);
    gradient.addColorStop(0, 'rgba(45, 212, 191, 0.35)');
    gradient.addColorStop(1, 'rgba(45, 212, 191, 0.02)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(getX(0), yBottom);
    for (let i = 0; i < history.length; i++) {
      ctx.lineTo(getX(i), getY(history[i]));
    }
    ctx.lineTo(getX(history.length - 1), yBottom);
    ctx.closePath();
    ctx.fill();

    // Draw Eco-Vision Line (Teal solid)
    ctx.strokeStyle = '#2DD4BF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < history.length; i++) {
      const x = getX(i);
      const y = getY(history[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Latest pulse dot
    const latestX = getX(history.length - 1);
    const latestY = getY(history[history.length - 1]);
    ctx.fillStyle = '#2DD4BF';
    ctx.beginPath();
    ctx.arc(latestX, latestY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [telemetry]);

  return (
    <div className="rounded-xl border border-eco-border bg-eco-card p-4 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-eco-border/60 pb-3 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-eco-ink flex items-center gap-2">
            <span>Uplink Bandwidth Timeline</span>
            <span className="rounded-full bg-eco-surface border border-eco-border px-2 py-0.5 text-[10px] font-mono text-eco-muted">
              Live 40-Tick Rolling Window
            </span>
          </h3>
          <p className="text-xs text-eco-muted mt-0.5">
            Content-driven bandwidth reduction vs always-on 4 Mbps ingress.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-xs bg-eco-coral"></span>
            <span className="text-eco-muted">Centralised (4.0 Mbps)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-xs bg-eco-teal"></span>
            <span className="text-eco-teal font-semibold">Eco-Vision Edge</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          width={700}
          height={140}
          className="w-full h-[140px] block"
        />
      </div>
    </div>
  );
};
