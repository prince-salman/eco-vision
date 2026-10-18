import { useEffect, useRef, useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import type { TelemetryData } from '../types';

interface LogEvent {
  id: number;
  timestamp: string;
  zone: string;
  state: 'ACTIVE' | 'IDLE' | 'HEARTBEAT';
  activityPct: number;
  roiW: number | null;
  roiH: number | null;
  kbps: number;
  savedPct: number;
}

interface DetectionLogProps {
  telemetry: TelemetryData | null;
}

const MAX_EVENTS = 200;
const VISIBLE_ROWS = 12;

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

const STATE_STYLES: Record<LogEvent['state'], { dot: string; pill: string; label: string }> = {
  ACTIVE: {
    dot: 'bg-teal-400',
    pill: 'bg-teal-400/15 text-teal-300 border border-teal-400/30',
    label: 'ACTIVE',
  },
  IDLE: {
    dot: 'bg-amber-400',
    pill: 'bg-amber-400/15 text-amber-300 border border-amber-400/30',
    label: 'IDLE',
  },
  HEARTBEAT: {
    dot: 'bg-slate-400',
    pill: 'bg-slate-400/15 text-slate-300 border border-slate-400/30',
    label: 'HEARTBEAT',
  },
};

function StateBadge({ state }: { state: LogEvent['state'] }) {
  const s = STATE_STYLES[state];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function eventsToCSV(events: LogEvent[]): string {
  const header = ['id', 'timestamp', 'zone', 'state', 'activityPct', 'roiW', 'roiH', 'kbps', 'savedPct'].join(',');
  const rows = events.map((e) =>
    [
      e.id,
      e.timestamp,
      e.zone,
      e.state,
      e.activityPct,
      e.roiW ?? '',
      e.roiH ?? '',
      e.kbps,
      e.savedPct,
    ].join(',')
  );
  return [header, ...rows].join('\n');
}

let globalIdCounter = 0;

export default function DetectionLog({ telemetry }: DetectionLogProps) {
  const [log, setLog] = useState<LogEvent[]>([]);
  const lastTimestampRef = useRef<number | null>(null);
  const tableBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!telemetry) return;
    if (lastTimestampRef.current === telemetry.timestamp) return;
    lastTimestampRef.current = telemetry.timestamp;

    const roiW =
      telemetry.roiBox ? telemetry.roiBox[2] - telemetry.roiBox[0] : null;
    const roiH =
      telemetry.roiBox ? telemetry.roiBox[3] - telemetry.roiBox[1] : null;

    const event: LogEvent = {
      id: ++globalIdCounter,
      timestamp: formatTime(telemetry.timestamp),
      zone: 'Zone A',
      state: telemetry.state as LogEvent['state'],
      activityPct: Math.round(telemetry.activityRatio * 1000) / 10,
      roiW,
      roiH,
      kbps: Math.round(telemetry.currentKbps * 10) / 10,
      savedPct: Math.round(telemetry.compressionRatioPct * 10) / 10,
    };

    setLog((prev) => {
      const next = [...prev, event];
      return next.length > MAX_EVENTS ? next.slice(next.length - MAX_EVENTS) : next;
    });
  }, [telemetry]);

  // Auto-scroll to latest
  useEffect(() => {
    tableBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log.length]);

  function handleExport() {
    const csv = eventsToCSV(log);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.href = url;
    a.download = `eco-vision-log-${ts}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleClear() {
    setLog([]);
    lastTimestampRef.current = null;
  }

  const rowHeight = 36; // px, approximate
  const maxHeight = VISIBLE_ROWS * rowHeight;

  return (
    <div className="rounded-xl border border-eco-border bg-eco-card p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-eco-ink">
          Detection Log{' '}
          <span className="text-eco-muted font-normal">({log.length} events)</span>
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={log.length === 0}
            title="Export CSV"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium
                       bg-eco-surface border border-eco-border text-eco-ink
                       hover:bg-eco-teal/10 hover:border-eco-teal/40 hover:text-eco-teal
                       disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
          <button
            onClick={handleClear}
            disabled={log.length === 0}
            title="Clear log"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium
                       bg-eco-surface border border-eco-border text-eco-ink
                       hover:bg-red-400/10 hover:border-red-400/40 hover:text-red-400
                       disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table */}
      {log.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-eco-muted text-sm">
          Waiting for telemetry data...
        </div>
      ) : (
        <div
          className="overflow-y-auto rounded-lg border border-eco-border"
          style={{ maxHeight }}
        >
          <table className="w-full text-xs font-mono border-collapse">
            <thead className="sticky top-0 bg-eco-surface z-10">
              <tr className="text-eco-muted text-left">
                <th className="px-3 py-2 font-medium whitespace-nowrap">Time</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">Zone</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">State</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap text-right">Activity%</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap text-right">ROI (W×H)</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap text-right">kbps</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap text-right">Saved%</th>
              </tr>
            </thead>
            <tbody>
              {log.map((e, i) => (
                <tr
                  key={e.id}
                  className={`border-t border-eco-border transition-colors
                    ${i % 2 === 0 ? 'bg-eco-card' : 'bg-eco-surface/50'}
                    hover:bg-eco-teal/5`}
                >
                  <td className="px-3 py-2 text-eco-muted whitespace-nowrap">{e.timestamp}</td>
                  <td className="px-3 py-2 text-eco-ink whitespace-nowrap">{e.zone}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <StateBadge state={e.state} />
                  </td>
                  <td className="px-3 py-2 text-eco-ink text-right whitespace-nowrap">
                    {e.activityPct.toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 text-eco-muted text-right whitespace-nowrap">
                    {e.roiW !== null && e.roiH !== null
                      ? `${e.roiW}×${e.roiH}`
                      : '—'}
                  </td>
                  <td className="px-3 py-2 text-eco-ink text-right whitespace-nowrap">
                    {e.kbps.toFixed(1)}
                  </td>
                  <td className="px-3 py-2 text-eco-ink text-right whitespace-nowrap">
                    {e.savedPct.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div ref={tableBottomRef} />
        </div>
      )}
    </div>
  );
}
