import React from 'react';
import { clsx } from 'clsx';
import { Database, Sparkles, Clock } from 'lucide-react';

export type ProvenanceType = 'backend-result' | 'illustrative-simulation' | 'planned';

interface ProvenanceBadgeProps {
  type: ProvenanceType;
  className?: string;
  subtext?: string;
}

export function ProvenanceBadge({ type, className, subtext }: ProvenanceBadgeProps) {
  if (type === 'backend-result') {
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider font-semibold bg-cyan-400 text-ink-950 rounded-sm select-none',
          className
        )}
        title="Directly computed by the FastAPI backend machine learning engine"
      >
        <Database className="w-3.5 h-3.5" />
        <span>BACKEND RESULT</span>
        {subtext && <span className="opacity-80 font-normal">({subtext})</span>}
      </span>
    );
  }

  if (type === 'illustrative-simulation') {
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider font-semibold text-orange-500 bg-orange-500/10 border border-orange-500/40 rounded-sm select-none',
          // Distinct hatched background
          'bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(255,107,26,0.12)_6px,rgba(255,107,26,0.12)_12px)]',
          className
        )}
        title="Frontend-side mathematical demonstration on client-generated seeded points (not a trained backend model)"
      >
        <Sparkles className="w-3.5 h-3.5 text-orange-500" />
        <span>ILLUSTRATIVE SIMULATION</span>
        {subtext && <span className="text-steel-400 font-normal">({subtext})</span>}
      </span>
    );
  }

  // Planned
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider font-semibold text-steel-400 border border-dashed border-graphite-600 rounded-sm select-none bg-graphite-800/30',
        className
      )}
      title="Upcoming feature planned for future release"
    >
      <Clock className="w-3.5 h-3.5 text-steel-500" />
      <span>PLANNED</span>
      {subtext && <span className="opacity-75 font-normal">({subtext})</span>}
    </span>
  );
}
