import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/design-system/primitives';

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center font-mono">
      <div className="p-4 bg-graphite-800 border border-graphite-700 text-cyan-400 mb-4 rounded-sm">
        <HelpCircle className="w-10 h-10" />
      </div>
      <div className="text-4xl sm:text-6xl font-black text-cyan-400">404</div>
      <h1 className="text-xl sm:text-2xl font-bold text-bone-100 mt-2">
        Vector Coordinate Not Found
      </h1>
      <p className="text-xs sm:text-sm text-steel-500 max-w-md mt-2 font-sans leading-relaxed">
        The requested URL path or resource identifier does not exist within the PADH LE BC routing graph.
      </p>
      <div className="mt-8">
        <Link to="/">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Origin</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
