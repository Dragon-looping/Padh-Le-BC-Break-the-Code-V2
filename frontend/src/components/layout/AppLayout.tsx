import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';

export function AppLayout() {
  const location = useLocation();
  const [wiping, setWiping] = useState(false);

  // Cyan scanline route wipe transition
  useEffect(() => {
    setWiping(true);
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setWiping(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex flex-col bg-ink-950 text-bone-100 font-body">
      {/* Skip to Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[9999] px-4 py-2 bg-cyan-400 text-ink-950 font-mono text-xs font-bold"
      >
        Skip to main content
      </a>

      {/* Static Film Grain Overlay */}
      <div className="film-grain" aria-hidden="true" />

      {/* Thin Cyan Scanline Route Wipe */}
      {wiping && (
        <div
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 h-[2px] bg-cyan-400 z-[9998] shadow-[0_0_12px_#19E3FF] animate-pulse"
        />
      )}

      {/* Persistent Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 w-full" tabIndex={-1}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
