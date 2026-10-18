import React from 'react';
import { Leaf, Cpu, Video, Server, Sliders, FileText, Code2 } from 'lucide-react';

export type ActiveNavTab = 'operations' | 'fleet' | 'simulator' | 'log' | 'api' | 'whitepaper';

interface NavbarProps {
  isPythonConnected: boolean;
  isBackendConnected: boolean;
  sourceMode: string;
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isPythonConnected,
  isBackendConnected,
  sourceMode,
  activeTab,
  setActiveTab,
}) => {
  const NAV_ITEMS: { id: ActiveNavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'operations', label: 'Live Operations', icon: <Video className="h-4 w-4" /> },
    { id: 'fleet', label: 'Fleet & Edge Nodes', icon: <Server className="h-4 w-4" /> },
    { id: 'simulator', label: 'Macro Model (3.3)', icon: <Sliders className="h-4 w-4" /> },
    { id: 'log', label: 'Detection Log', icon: <FileText className="h-4 w-4" /> },
    { id: 'api', label: 'REST API & VMS', icon: <Code2 className="h-4 w-4" /> },
    { id: 'whitepaper', label: 'Research Paper', icon: <Leaf className="h-4 w-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-eco-border bg-eco-bg/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-eco-teal/15 border border-eco-teal/40 text-eco-teal shadow-md shadow-eco-teal/10">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold tracking-tight text-eco-ink">
                Eco-Vision
              </span>
              <span className="rounded-full bg-eco-teal/15 text-eco-teal border border-eco-teal/30 px-2 py-0.5 text-[10px] font-mono font-bold">
                PRODUCTION v2.4
              </span>
            </div>
            <p className="text-[11px] text-eco-muted font-sans hidden sm:block">
              Edge Computer Vision Pre-Processing & Fleet Platform
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 rounded-xl border border-eco-border bg-eco-surface p-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-eco-card text-eco-teal border border-eco-teal/40 shadow-xs'
                    : 'text-eco-muted hover:text-eco-ink hover:bg-eco-card/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Live System Connectivity Badges */}
        <div className="flex items-center gap-2">
          {/* Backend Status */}
          <div className="flex items-center gap-1.5 rounded-lg border border-eco-border bg-eco-card px-2.5 py-1 text-[11px] font-mono">
            <span className="text-eco-muted hidden md:inline">Backend API:</span>
            <div className={`h-2 w-2 rounded-full ${isBackendConnected ? 'bg-eco-green animate-pulse' : 'bg-eco-muted'}`} />
            <span className={isBackendConnected ? 'text-eco-ink font-semibold' : 'text-eco-muted'}>
              {isBackendConnected ? ':8001' : 'Offline'}
            </span>
          </div>

          {/* Edge Worker Status */}
          <div className="flex items-center gap-1.5 rounded-lg border border-eco-border bg-eco-card px-2.5 py-1 text-[11px] font-mono">
            <Cpu className="h-3 w-3 text-eco-teal" />
            <span className="text-eco-muted hidden md:inline">Edge:</span>
            <span className="text-eco-ink font-semibold">
              {sourceMode === 'python_live' ? 'Python' : 'Browser CV'}
            </span>
            <div className={`h-2 w-2 rounded-full ${isPythonConnected || sourceMode !== 'python_live' ? 'bg-eco-green' : 'bg-eco-amber'}`} />
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden border-t border-eco-border/60 bg-eco-surface/50 px-3 py-1.5 overflow-x-auto flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium ${
                isActive
                  ? 'bg-eco-card text-eco-teal border border-eco-teal/30 shadow-xs font-bold'
                  : 'text-eco-muted hover:text-eco-ink'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
