import { Leaf, BookOpen, Users, Cpu } from 'lucide-react';

interface NavbarProps {
  onOpenEssay: () => void;
  onOpenTeam: () => void;
  isPythonConnected: boolean;
  sourceMode: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenEssay,
  onOpenTeam,
  isPythonConnected,
  sourceMode,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-eco-border bg-eco-bg/90 backdrop-blur-md">
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
                PROTOTYPE v1.0
              </span>
            </div>
            <p className="text-[11px] text-eco-muted font-sans hidden sm:block">
              Edge Computer Vision Pre-Processing • President University
            </p>
          </div>
        </div>

        {/* Live Engine Status */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-lg border border-eco-border bg-eco-card px-3 py-1.5 text-xs font-mono">
            <Cpu className="h-3.5 w-3.5 text-eco-teal" />
            <span className="text-eco-muted">Engine:</span>
            <span className="text-eco-ink font-semibold">
              {sourceMode === 'python_live' ? 'Python Edge Worker' : 'In-Browser Client CV'}
            </span>
            <div className={`h-2 w-2 rounded-full ${isPythonConnected || sourceMode !== 'python_live' ? 'bg-eco-green animate-pulse' : 'bg-eco-amber'}`} />
          </div>

          {/* Action buttons */}
          <button
            onClick={onOpenEssay}
            className="inline-flex items-center gap-1.5 rounded-lg border border-eco-border bg-eco-surface px-3 py-1.5 text-xs font-semibold text-eco-ink hover:border-eco-teal/50 hover:bg-eco-card transition-all"
          >
            <BookOpen className="h-3.5 w-3.5 text-eco-teal" />
            <span>IYS Essay</span>
          </button>

          <button
            onClick={onOpenTeam}
            className="inline-flex items-center gap-1.5 rounded-lg border border-eco-border bg-eco-surface px-3 py-1.5 text-xs font-semibold text-eco-ink hover:border-eco-teal/50 hover:bg-eco-card transition-all"
          >
            <Users className="h-3.5 w-3.5 text-eco-teal" />
            <span>Team</span>
          </button>
        </div>
      </div>
    </header>
  );
};
