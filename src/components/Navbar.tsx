import React from 'react';
import { Leaf, Cpu, Video, Server, Sliders, FileText, Home, ArrowRight } from 'lucide-react';

export type ActiveNavTab = 'home' | 'operations' | 'fleet' | 'simulator' | 'log';

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
    { id: 'home', label: 'Overview', icon: <Home className="h-4 w-4" /> },
    { id: 'operations', label: 'Live Operations', icon: <Video className="h-4 w-4" /> },
    { id: 'fleet', label: 'Fleet & Edge Nodes', icon: <Server className="h-4 w-4" /> },
    { id: 'simulator', label: 'Macro Model (3.3)', icon: <Sliders className="h-4 w-4" /> },
    { id: 'log', label: 'Detection Log', icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand (Click to go Home) */}
        <button 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 text-left transition-opacity hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700 shadow-sm">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold tracking-tight text-slate-900">
                Eco-Vision
              </span>
              <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 text-[10px] font-mono font-bold">
                PRODUCTION v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans hidden sm:block">
              Sustainable Vision & Edge Fleet Platform
            </p>
          </div>
        </button>

        {/* Navigation Tabs (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-emerald-800 border border-emerald-200 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action & Badges */}
        <div className="flex items-center gap-2">
          {/* Quick Launch Console button if on Home */}
          {activeTab === 'home' && (
            <button
              onClick={() => setActiveTab('operations')}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <span>Launch Console</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Backend Status */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-mono shadow-2xs">
            <span className="text-slate-500 hidden md:inline">API:</span>
            <div className={`h-2 w-2 rounded-full ${isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className={isBackendConnected ? 'text-slate-800 font-semibold' : 'text-slate-500'}>
              {isBackendConnected ? ':8001' : 'Local'}
            </span>
          </div>

          {/* Edge Status */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-mono shadow-2xs">
            <Cpu className="h-3 w-3 text-emerald-600" />
            <span className="text-slate-500 hidden md:inline">Edge:</span>
            <span className="text-slate-800 font-semibold">
              {sourceMode === 'python_live' ? 'Python' : 'Browser CV'}
            </span>
            <div className={`h-2 w-2 rounded-full ${isPythonConnected || sourceMode !== 'python_live' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden border-t border-slate-200 bg-slate-50 px-3 py-1.5 overflow-x-auto flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium ${
                isActive
                  ? 'bg-white text-emerald-800 border border-emerald-300 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
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
