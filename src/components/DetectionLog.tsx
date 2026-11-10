import { useEffect, useRef, useState } from 'react';
import { Download, Trash2, ShieldCheck, Database } from 'lucide-react';
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
  const [log, setLog] = useState<LogEvent[]>(() => {
    try {
      const saved = localStorage.getItem('ecovision_detection_log');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const lastTimestampRef = useRef<number | null>(null);
  const tableBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('ecovision_detection_log', JSON.stringify(log));
    } catch {}
  }, [log]);

  useEffect(() => {
    if (!telemetry) return;
    if (lastTimestampRef.current === telemetry.timestamp) return;
    lastTimestampRef.current = telemetry.timestamp;

    const roiW = telemetry.roiBox ? telemetry.roiBox[2] : null;
    const roiH = telemetry.roiBox ? telemetry.roiBox[3] : null;

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
    try {
      localStorage.removeItem('ecovision_detection_log');
    } catch {}
  }

  return (
    <div className="rounded-xl border border-eco-border bg-eco-card p-4 shadow-lg space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-eco-border pb-3">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-eco-teal" />
          <h3 className="font-serif text-sm font-bold text-eco-ink">
            Live Detection Event Log ({log.length} events)
          </h3>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-eco-teal/10 px-2 py-0.5 text-[10px] font-mono text-eco-teal border border-eco-teal/20">
            <ShieldCheck className="h-3 w-3" />
            <span>Persisted Local & Cloud Relay</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={log.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-eco-teal/15 border border-eco-teal/40 px-3 py-1.5 text-xs font-mono font-semibold text-eco-teal hover:bg-eco-teal/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleClear}
            disabled={log.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-eco-border px-3 py-1.5 text-xs font-mono text-eco-muted hover:text-eco-coral hover:border-eco-coral/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="relative overflow-x-auto rounded-lg border border-eco-border bg-eco-surface/50 max-h-80 overflow-y-auto">
        {log.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-eco-muted">
            Waiting for edge camera telemetry data...
          </div>
        ) : (
          <table className="w-full text-left text-xs font-mono">
            <thead className="sticky top-0 bg-eco-card border-b border-eco-border text-[11px] text-eco-muted uppercase">
              <tr>
                <th className="p-2.5">Time</th>
                <th className="p-2.5">Zone</th>
                <th className="p-2.5">State</th>
                <th className="p-2.5">Activity</th>
                <th className="p-2.5">ROI Extents</th>
                <th className="p-2.5">Uplink</th>
                <th className="p-2.5 text-right">Saved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-eco-border/40 text-eco-ink">
              {log.map((e) => (
                <tr key={e.id} className="hover:bg-eco-surface/70 transition-colors">
                  <td className="p-2.5 text-eco-muted">{e.timestamp}</td>
                  <td className="p-2.5">{e.zone}</td>
                  <td className="p-2.5">
                    <StateBadge state={e.state} />
                  </td>
                  <td className="p-2.5 text-eco-teal font-semibold">{e.activityPct}%</td>
                  <td className="p-2.5 text-eco-muted">
                    {e.roiW && e.roiH ? `${e.roiW}×${e.roiH} px` : '— (None)'}
                  </td>
                  <td className="p-2.5">{e.kbps} Kbps</td>
                  <td className="p-2.5 text-right font-bold text-eco-green">{e.savedPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div ref={tableBottomRef} />
      </div>
    </div>
  );
}
