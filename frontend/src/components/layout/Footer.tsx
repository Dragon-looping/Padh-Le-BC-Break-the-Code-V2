import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useReducedMotion } from '@/motion/useReducedMotion';

export function Footer() {
  const { reducedMotion, toggleReducedMotion } = useReducedMotion();

  return (
    <footer className="w-full border-t border-graphite-700/80 bg-ink-950/90 py-12 text-sm font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-graphite-700/60">
          <div className="md:col-span-2 space-y-3">
            <div className="font-display font-black text-xl text-bone-100 tracking-tight">
              PADH LE <span className="text-cyan-400">BC</span>
            </div>
            <p className="text-xs text-steel-500 font-sans max-w-sm leading-relaxed">
              Tagline: Learn the algorithm. Understand the result. Choose with confidence.
              An educational AI/ML curriculum integrated with a leakage-free model training and comparison laboratory.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase text-steel-400 tracking-wider">Platform</div>
            <ul className="space-y-1.5 text-xs text-steel-500">
              <li><Link to="/learn" className="hover:text-cyan-400 transition-colors">Learning Hub</Link></li>
              <li><Link to="/algorithms" className="hover:text-cyan-400 transition-colors">Algorithm Library</Link></li>
              <li><Link to="/playground" className="hover:text-cyan-400 transition-colors">ML Playground</Link></li>
              <li><Link to="/model-lab" className="hover:text-cyan-400 transition-colors">Model Lab</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase text-steel-400 tracking-wider">Preferences</div>
            <button
              onClick={toggleReducedMotion}
              className="flex items-center gap-2 px-3 py-2 border border-graphite-600 bg-graphite-800/50 hover:border-cyan-400 text-bone-100 text-xs rounded-sm transition-colors"
              aria-pressed={reducedMotion}
            >
              {reducedMotion ? <EyeOff className="w-4 h-4 text-orange-500" /> : <Eye className="w-4 h-4 text-cyan-400" />}
              <span>{reducedMotion ? 'Reduce Motion: ON' : 'Reduce Motion: OFF'}</span>
            </button>
            <p className="text-[11px] text-steel-500 leading-normal">
              Disables 3D vortex particles, text scramble, and heavy transitions.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-steel-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-lime-400" />
            <span>Honest Machine Learning: All metrics computed authentically by backend scikit-learn.</span>
          </div>
          <div>PADH LE BC © 2026. Break the Code.</div>
        </div>
      </div>
    </footer>
  );
}
