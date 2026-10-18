import React from 'react';
import { X, Award, GraduationCap, UserCheck } from 'lucide-react';

interface TeamCardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const members = [
    {
      name: 'Firza Miftahul Ilmi',
      role: 'Team Leader',
      title: 'Architectural Concept & Research Formulation',
      badge: 'Leader',
    },
    {
      name: 'Muhamad Salman',
      role: 'Team Member',
      title: 'Edge Computer Vision & Full-Stack Prototyping',
      badge: 'Engineering',
    },
    {
      name: 'Immanuel Elvando Kenjam',
      role: 'Team Member',
      title: 'Resource Impact Modeling & Analytical Calculations',
      badge: 'Modeling',
    },
    {
      name: 'Citra Ayu Setyoningputri',
      role: 'Team Member',
      title: 'Environmental Policy & Lifecycle Assessment',
      badge: 'Sustainability',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-eco-border bg-eco-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-eco-border bg-eco-surface px-6 py-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-eco-teal" />
            <span className="font-mono text-xs font-semibold text-eco-muted uppercase tracking-wider">
              President University Team
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-eco-muted hover:bg-eco-card hover:text-eco-ink transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-eco-amber/15 text-eco-amber border border-eco-amber/30 px-3 py-0.5 text-xs font-semibold">
              <Award className="h-3.5 w-3.5" />
              <span>7th International Youth Summit (IYS) Essay Competition</span>
            </div>
            <h2 className="text-xl font-bold font-serif text-eco-ink">
              The Eco-Vision Research Team
            </h2>
            <p className="text-xs text-eco-muted max-w-md mx-auto">
              President University students tackling data center power, water, and carbon burdens through decentralized edge intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {members.map((m, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-eco-border bg-eco-surface/70 p-4 space-y-1.5 hover:border-eco-teal/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-eco-teal uppercase">
                    {m.role}
                  </span>
                  <span className="rounded-full bg-eco-card border border-eco-border px-2 py-0.5 text-[10px] font-mono text-eco-muted">
                    {m.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-eco-ink flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-eco-emerald shrink-0" />
                  <span>{m.name}</span>
                </h3>
                <p className="text-xs text-eco-muted leading-relaxed">
                  {m.title}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-eco-teal/30 bg-eco-teal/10 p-4 text-xs text-eco-ink/90 flex items-center justify-between">
            <div>
              <p className="font-semibold text-eco-teal">Institution: President University</p>
              <p className="text-eco-muted text-[11px] mt-0.5">Faculty of Engineering & Computer Science • Cikarang, Indonesia</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg bg-eco-teal px-4 py-2 text-xs font-bold text-eco-bg hover:bg-eco-emerald transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
