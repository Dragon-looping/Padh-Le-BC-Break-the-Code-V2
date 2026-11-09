import React from 'react';
import { clsx } from 'clsx';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'bg-graphite-800/60 animate-pulse border border-graphite-700/40 rounded-sm',
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="p-6 border border-graphite-700 bg-graphite-800/40 space-y-4">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="pt-2 flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="border border-graphite-700 bg-graphite-800/30 overflow-hidden">
      <div className="flex border-b border-graphite-700 p-4 gap-4 bg-graphite-800/60">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-graphite-700/50">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex p-4 gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
