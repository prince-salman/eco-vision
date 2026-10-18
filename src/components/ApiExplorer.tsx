import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Globe } from 'lucide-react';

interface Endpoint {
  method: 'GET' | 'POST' | 'DELETE' | 'WS';
  path: string;
  description: string;
  exampleCurl: string;
  exampleResponse: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: 'GET',
    path: '/api/v1/health',
    description: 'System health check and live client telemetry connection count.',
    exampleCurl: 'curl -X GET http://localhost:8001/api/v1/health',
    exampleResponse: JSON.stringify({
      status: "healthy",
      service: "Eco-Vision Backend & Edge Orchestration Engine",
      version: "2.4.0",
      active_clients: 2
    }, null, 2)
  },
  {
    method: 'GET',
    path: '/api/v1/cameras',
    description: 'List all registered edge camera nodes with power consumption and operational status.',
    exampleCurl: 'curl -X GET http://localhost:8001/api/v1/cameras',
    exampleResponse: JSON.stringify([
      {
        id: "cam-01",
        name: "Loading Dock Alpha",
        status: "ONLINE",
        resolution: "1080p",
        fps: 15,
        power_draw_w: 2.0
      }
    ], null, 2)
  },
  {
    method: 'POST',
    path: '/api/v1/events',
    description: 'Ingest real detection event from edge companion board with activity ratio and ROI coordinates.',
    exampleCurl: `curl -X POST http://localhost:8001/api/v1/events \\\n  -H "Content-Type: application/json" \\\n  -d '{"camera_id":"cam-01","state":"ACTIVE","activity_pct":24.5,"roi_x":80,"roi_y":45,"roi_w":180,"roi_h":120,"current_kbps":412.0,"saved_pct":89.7}'`,
    exampleResponse: JSON.stringify({
      id: 142,
      camera_id: "cam-01",
      state: "ACTIVE",
      current_kbps: 412.0,
      saved_pct: 89.7,
      timestamp: "2026-10-18T13:50:00Z"
    }, null, 2)
  },
  {
    method: 'POST',
    path: '/api/v1/model/simulate',
    description: 'Execute mathematical analytical model from Section 3.3 across any camera fleet size.',
    exampleCurl: `curl -X POST http://localhost:8001/api/v1/model/simulate \\\n  -H "Content-Type: application/json" \\\n  -d '{"cams":1000000,"act":20.0,"roi":50.0,"edge":2.0,"pue":1.4,"grid":0.45}'`,
    exampleResponse: JSON.stringify({
      retention_pct: 10.5,
      raw_traffic_tbps: 4.0,
      eco_traffic_tbps: 0.42,
      net_energy_saved_gwh: 56.1,
      net_co2_avoided_tonnes: 25245,
      cooling_water_avoided_million_l: 26.3
    }, null, 2)
  },
  {
    method: 'GET',
    path: '/api/v1/events/export',
    description: 'Download rolling CSV detection log for compliance and energy audits.',
    exampleCurl: 'curl -X GET http://localhost:8001/api/v1/events/export -O eco_events.csv',
    exampleResponse: "ID,Camera ID,Timestamp (UTC),State,Activity (%),Current Kbps,Bandwidth Saved (%)\n1,cam-01,2026-10-18T13:45:00Z,ACTIVE,24.5,412.0,89.7"
  },
  {
    method: 'WS',
    path: '/ws/telemetry',
    description: 'Real-time WebSocket hub for instant bidirectional telemetry and ROI streaming.',
    exampleCurl: 'wscat -c ws://localhost:8001/ws/telemetry',
    exampleResponse: JSON.stringify({
      type: "EDGE_TELEMETRY",
      camera_id: "cam-01",
      currentKbps: 412,
      saved_pct: 89.7
    }, null, 2)
  }
];

export const ApiExplorer: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(ENDPOINTS[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-eco-border bg-eco-card p-6 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-eco-teal" />
            <h2 className="text-xl font-bold font-serif text-eco-ink">Eco-Vision Enterprise REST API & WebSocket Hub</h2>
          </div>
          <p className="text-xs text-eco-muted mt-1 max-w-2xl leading-relaxed">
            Integrate Eco-Vision edge filters directly into existing Video Management Systems (VMS) such as Milestone XProtect, 
            Genetec Security Center, or proprietary cloud inference microservices.
          </p>
        </div>

        <a
          href="http://localhost:8001/api/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-eco-teal/15 border border-eco-teal/40 px-4 py-2 font-mono text-xs font-bold text-eco-teal hover:bg-eco-teal/25 transition-all"
        >
          <span>Open Interactive Swagger Docs</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {/* Explorer Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Endpoints Sidebar */}
        <div className="space-y-2 rounded-xl border border-eco-border bg-eco-card p-3 shadow-sm">
          <span className="px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-eco-muted block">
            Available Endpoints
          </span>
          <div className="space-y-1">
            {ENDPOINTS.map((ep, idx) => {
              const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedEndpoint(ep)}
                  className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left font-mono text-xs transition-all ${
                    isSelected
                      ? 'bg-eco-teal/15 text-eco-teal border border-eco-teal/40 shadow-xs'
                      : 'text-eco-muted hover:bg-eco-surface hover:text-eco-ink'
                  }`}
                >
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                    ep.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400' :
                    ep.method === 'DELETE' ? 'bg-rose-500/20 text-rose-400' : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {ep.method}
                  </span>
                  <span className="truncate">{ep.path}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Endpoint Inspector */}
        <div className="lg:col-span-2 space-y-4 rounded-xl border border-eco-border bg-eco-card p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-eco-border/80 pb-3">
            <div className="flex items-center gap-2 font-mono">
              <span className={`rounded px-2 py-0.5 text-xs font-bold ${
                selectedEndpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                selectedEndpoint.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400' :
                selectedEndpoint.method === 'DELETE' ? 'bg-rose-500/20 text-rose-400' : 'bg-purple-500/20 text-purple-400'
              }`}>
                {selectedEndpoint.method}
              </span>
              <span className="text-sm font-bold text-eco-ink">{selectedEndpoint.path}</span>
            </div>
            <span className="text-xs text-eco-muted font-mono">200 OK</span>
          </div>

          <p className="text-xs text-eco-muted leading-relaxed font-sans">
            {selectedEndpoint.description}
          </p>

          {/* cURL Request */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-eco-muted">
              <span>Example Request (cURL)</span>
              <button
                onClick={() => handleCopy(selectedEndpoint.exampleCurl)}
                className="inline-flex items-center gap-1 hover:text-eco-teal transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-eco-green" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="rounded-lg bg-black/70 p-3 font-mono text-xs text-eco-ink border border-eco-border/80 overflow-x-auto">
              <code>{selectedEndpoint.exampleCurl}</code>
            </pre>
          </div>

          {/* Response Payload */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-eco-muted block">Example Response Payload</span>
            <pre className="rounded-lg bg-black/70 p-3 font-mono text-xs text-eco-teal border border-eco-border/80 overflow-x-auto max-h-64">
              <code>{selectedEndpoint.exampleResponse}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
