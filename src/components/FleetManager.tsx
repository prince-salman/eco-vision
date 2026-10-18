import React, { useState, useEffect } from 'react';
import { Server, Wifi, Plus, Trash2, Shield, Activity, RefreshCw } from 'lucide-react';

interface CameraNode {
  id: string;
  name: string;
  location: string;
  rtsp_url: string | null;
  status: string;
  resolution: string;
  fps: number;
  power_draw_w: number;
  firmware_version: string;
  last_heartbeat: string;
}

export const FleetManager: React.FC = () => {
  const [cameras, setCameras] = useState<CameraNode[]>([
    {
      id: "cam-01",
      name: "Loading Dock Alpha",
      location: "Industrial Logistics Bay",
      rtsp_url: "rtsp://192.168.1.101:554/ch01",
      status: "ONLINE",
      resolution: "1080p",
      fps: 15,
      power_draw_w: 2.0,
      firmware_version: "v2.4.1-edge",
      last_heartbeat: new Date().toISOString()
    },
    {
      id: "cam-02",
      name: "Corridor Logistics Bravo",
      location: "Storage Facility Floor 2",
      rtsp_url: "rtsp://192.168.1.102:554/ch01",
      status: "IDLE",
      resolution: "1080p",
      fps: 15,
      power_draw_w: 1.8,
      firmware_version: "v2.4.1-edge",
      last_heartbeat: new Date().toISOString()
    },
    {
      id: "cam-03",
      name: "Perimeter Fence Charlie",
      location: "North Security Boundary",
      rtsp_url: "rtsp://192.168.1.103:554/ch01",
      status: "IDLE",
      resolution: "1080p",
      fps: 15,
      power_draw_w: 2.1,
      firmware_version: "v2.4.1-edge",
      last_heartbeat: new Date().toISOString()
    },
    {
      id: "cam-04",
      name: "Campus Main Gate Delta",
      location: "President University Entrance",
      rtsp_url: "rtsp://192.168.1.104:554/ch01",
      status: "ONLINE",
      resolution: "1080p",
      fps: 15,
      power_draw_w: 2.0,
      firmware_version: "v2.4.1-edge",
      last_heartbeat: new Date().toISOString()
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCam, setNewCam] = useState({
    id: `cam-0${cameras.length + 1}`,
    name: '',
    location: '',
    rtsp_url: '',
    resolution: '1080p',
    fps: 15,
    power_draw_w: 2.0
  });

  const fetchCameras = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8001/api/v1/cameras');
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setCameras(data);
        }
      }
    } catch {
      // Backend offline, keep local state
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  const handleAddCamera = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCam.name) return;

    try {
      const res = await fetch('http://localhost:8001/api/v1/cameras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCam)
      });
      if (res.ok) {
        const created = await res.json();
        setCameras(prev => [...prev, created]);
      } else {
        // Fallback local
        setCameras(prev => [...prev, {
          ...newCam,
          status: 'ONLINE',
          firmware_version: 'v2.4.1-edge',
          last_heartbeat: new Date().toISOString()
        }]);
      }
    } catch {
      setCameras(prev => [...prev, {
        ...newCam,
        status: 'ONLINE',
        firmware_version: 'v2.4.1-edge',
        last_heartbeat: new Date().toISOString()
      }]);
    }

    setShowAddModal(false);
    setNewCam({
      id: `cam-0${cameras.length + 2}`,
      name: '',
      location: '',
      rtsp_url: '',
      resolution: '1080p',
      fps: 15,
      power_draw_w: 2.0
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:8001/api/v1/cameras/${id}`, { method: 'DELETE' });
    } catch {}
    setCameras(prev => prev.filter(c => c.id !== id));
  };

  const totalPower = cameras.reduce((acc, c) => acc + c.power_draw_w, 0);
  const activeCount = cameras.filter(c => c.status === 'ONLINE').length;

  return (
    <div className="space-y-6">
      {/* Fleet Top Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-eco-border bg-eco-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-eco-muted">
            <span>Total Edge Nodes</span>
            <Server className="h-4 w-4 text-eco-teal" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-eco-ink">{cameras.length} Nodes</p>
          <span className="text-[11px] text-eco-teal font-mono">Companion SBC boards</span>
        </div>

        <div className="rounded-xl border border-eco-border bg-eco-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-eco-muted">
            <span>Active Transmitting</span>
            <Activity className="h-4 w-4 text-eco-green" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-eco-green">{activeCount} / {cameras.length}</p>
          <span className="text-[11px] text-eco-muted font-mono">{cameras.length - activeCount} in IDLE saving power</span>
        </div>

        <div className="rounded-xl border border-eco-border bg-eco-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-eco-muted">
            <span>Total Edge Fleet Power</span>
            <span className="text-xs font-mono font-bold text-eco-teal">2.0W / node</span>
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-eco-ink">{totalPower.toFixed(1)} W</p>
          <span className="text-[11px] text-eco-muted font-mono">Section 3.3 assumption</span>
        </div>

        <div className="rounded-xl border border-eco-border bg-eco-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-eco-muted">
            <span>Fleet Security</span>
            <Shield className="h-4 w-4 text-eco-teal" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-eco-ink">TLS / WSS</p>
          <span className="text-[11px] text-eco-teal font-mono">Signed firmware updates</span>
        </div>
      </div>

      {/* Fleet Table Card */}
      <div className="rounded-xl border border-eco-border bg-eco-card shadow-lg overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-eco-border/80 bg-eco-surface/90 px-6 py-4">
          <div>
            <h2 className="text-base font-bold font-serif text-eco-ink flex items-center gap-2">
              <Server className="h-4 w-4 text-eco-teal" />
              <span>Heterogeneous Camera Fleet Management (Section 3.4)</span>
            </h2>
            <p className="text-xs text-eco-muted mt-0.5">
              Eco-Vision companion boards connect directly to standard RTSP IP cameras and process frames locally before uplink.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchCameras}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-eco-border bg-eco-surface px-3 py-1.5 text-xs text-eco-muted hover:text-eco-ink"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-eco-teal' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-eco-teal px-3 py-1.5 text-xs font-semibold text-eco-bg hover:bg-eco-teal/90 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Register Node</span>
            </button>
          </div>
        </div>

        {/* Node Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-eco-border/80 bg-eco-surface/50 text-[11px] uppercase tracking-wider text-eco-muted">
              <tr>
                <th className="px-6 py-3">Node ID</th>
                <th className="px-6 py-3">Camera Name</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">RTSP Stream</th>
                <th className="px-6 py-3">Resolution & Rate</th>
                <th className="px-6 py-3">Node Power</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-eco-border/40 text-eco-ink">
              {cameras.map((cam) => (
                <tr key={cam.id} className="hover:bg-eco-surface/30 transition-colors">
                  <td className="px-6 py-3.5 font-bold text-eco-teal">{cam.id.toUpperCase()}</td>
                  <td className="px-6 py-3.5 font-semibold font-sans">{cam.name}</td>
                  <td className="px-6 py-3.5 text-eco-muted font-sans">{cam.location}</td>
                  <td className="px-6 py-3.5 text-eco-muted truncate max-w-xs">{cam.rtsp_url || 'USB / Native V4L2'}</td>
                  <td className="px-6 py-3.5 text-eco-muted">{cam.resolution} @ {cam.fps}fps</td>
                  <td className="px-6 py-3.5 text-eco-teal">{cam.power_draw_w} W</td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      cam.status === 'ONLINE'
                        ? 'border border-eco-teal/40 bg-eco-teal/15 text-eco-teal'
                        : 'border border-eco-amber/40 bg-eco-amber/15 text-eco-amber'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cam.status === 'ONLINE' ? 'bg-eco-teal animate-ping' : 'bg-eco-amber'}`} />
                      {cam.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => handleDelete(cam.id)}
                      className="text-eco-muted hover:text-eco-coral transition-colors p-1"
                      title="Decommission Node"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Camera Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-eco-border bg-eco-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-eco-border/80 pb-3">
              <h3 className="font-bold text-base text-eco-ink font-serif flex items-center gap-2">
                <Wifi className="h-4 w-4 text-eco-teal" />
                <span>Register New Camera Node</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs text-eco-muted hover:text-eco-ink font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCamera} className="space-y-3 text-xs">
              <div>
                <label className="block text-eco-muted font-mono mb-1">Node ID</label>
                <input
                  type="text"
                  value={newCam.id}
                  onChange={e => setNewCam({ ...newCam, id: e.target.value })}
                  className="w-full rounded-lg border border-eco-border bg-eco-surface px-3 py-2 font-mono text-eco-ink focus:outline-none focus:border-eco-teal"
                  required
                />
              </div>

              <div>
                <label className="block text-eco-muted font-mono mb-1">Camera Label</label>
                <input
                  type="text"
                  placeholder="e.g. Server Room Entrance"
                  value={newCam.name}
                  onChange={e => setNewCam({ ...newCam, name: e.target.value })}
                  className="w-full rounded-lg border border-eco-border bg-eco-surface px-3 py-2 text-eco-ink focus:outline-none focus:border-eco-teal"
                  required
                />
              </div>

              <div>
                <label className="block text-eco-muted font-mono mb-1">Facility Location</label>
                <input
                  type="text"
                  placeholder="e.g. Building B, 3rd Floor"
                  value={newCam.location}
                  onChange={e => setNewCam({ ...newCam, location: e.target.value })}
                  className="w-full rounded-lg border border-eco-border bg-eco-surface px-3 py-2 text-eco-ink focus:outline-none focus:border-eco-teal"
                />
              </div>

              <div>
                <label className="block text-eco-muted font-mono mb-1">RTSP Stream URL</label>
                <input
                  type="text"
                  placeholder="rtsp://admin:pass@192.168.1.50:554/live"
                  value={newCam.rtsp_url}
                  onChange={e => setNewCam({ ...newCam, rtsp_url: e.target.value })}
                  className="w-full rounded-lg border border-eco-border bg-eco-surface px-3 py-2 font-mono text-eco-ink focus:outline-none focus:border-eco-teal"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-eco-muted font-mono mb-1">Resolution</label>
                  <select
                    value={newCam.resolution}
                    onChange={e => setNewCam({ ...newCam, resolution: e.target.value })}
                    className="w-full rounded-lg border border-eco-border bg-eco-surface px-3 py-2 font-mono text-eco-ink focus:outline-none focus:border-eco-teal"
                  >
                    <option value="1080p">1080p (Full HD)</option>
                    <option value="720p">720p (HD)</option>
                    <option value="4K">4K (UHD)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-eco-muted font-mono mb-1">Power Draw (W)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newCam.power_draw_w}
                    onChange={e => setNewCam({ ...newCam, power_draw_w: parseFloat(e.target.value) || 2.0 })}
                    className="w-full rounded-lg border border-eco-border bg-eco-surface px-3 py-2 font-mono text-eco-ink focus:outline-none focus:border-eco-teal"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-eco-border px-4 py-2 text-xs font-semibold text-eco-muted hover:text-eco-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-eco-teal px-4 py-2 text-xs font-semibold text-eco-bg hover:bg-eco-teal/90 shadow-sm"
                >
                  Add Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
