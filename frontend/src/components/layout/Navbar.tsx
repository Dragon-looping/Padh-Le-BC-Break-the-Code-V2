import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { Menu, X, Database } from 'lucide-react';
import { KineticWordmark } from '@/components/navigation/KineticWordmark';
import { Button } from '@/design-system/primitives';

const NAV_ITEMS = [
  { name: 'Home', path: '/' },
  { name: 'Learning Hub', path: '/learn' },
  { name: 'Algorithm Library', path: '/algorithms' },
  { name: 'ML Playground', path: '/playground' },
  { name: 'Model Lab', path: '/model-lab' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-graphite-700/80 bg-ink-950/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <KineticWordmark />

          <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1 xl:gap-2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-xs font-mono font-medium tracking-wider transition-colors uppercase select-none rounded-sm ${
                    isActive
                      ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/30'
                      : 'text-steel-400 hover:text-bone-100 hover:bg-graphite-800/40'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            <Link to="/model-lab">
              <Button variant="cyan-solid" size="sm" className="gap-2 text-xs">
                <Database className="w-3.5 h-3.5" />
                <span>Launch Lab</span>
              </Button>
            </Link>
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open Navigation Menu"
              aria-expanded={mobileOpen}
              className="p-2 text-steel-400 hover:text-bone-100 focus-visible:outline-2 focus-visible:outline-lime-400"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-0 z-50 flex flex-col bg-ink-950/98 backdrop-blur-xl lg:hidden p-6"
        >
          <div className="flex items-center justify-between pb-6 border-b border-graphite-700">
            <KineticWordmark />
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close Navigation Menu"
              className="p-2 text-steel-400 hover:text-bone-100 focus-visible:outline-2 focus-visible:outline-lime-400"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 py-8 flex flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `px-4 py-3 text-sm font-mono tracking-wider uppercase rounded-sm border ${
                    isActive
                      ? 'text-cyan-400 bg-cyan-400/10 border-cyan-400/40'
                      : 'text-bone-100 border-transparent hover:bg-graphite-800/60'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="pt-6 border-t border-graphite-700">
            <Link to="/model-lab" className="block w-full">
              <Button variant="cyan-solid" size="md" className="w-full gap-2">
                <Database className="w-4 h-4" />
                <span>Launch Model Lab</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
