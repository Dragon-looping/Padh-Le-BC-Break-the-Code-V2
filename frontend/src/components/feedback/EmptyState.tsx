import React from 'react';
import { Database, FolderOpen, Search, Sparkles } from 'lucide-react';
import { Button } from '@/design-system/primitives';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: 'search' | 'dataset' | 'folder' | 'sparkles';
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionText,
  onAction,
  icon = 'folder',
  className,
}: EmptyStateProps) {
  const icons = {
    search: Search,
    dataset: Database,
    folder: FolderOpen,
    sparkles: Sparkles,
  };
  const IconComponent = icons[icon] || FolderOpen;

  return (
    <div className={`p-8 sm:p-12 text-center border border-dashed border-graphite-700 bg-graphite-800/20 rounded-sm ${className || ''}`}>
      <div className="inline-flex p-3 bg-graphite-800/80 border border-graphite-700 text-steel-500 mb-4 rounded-sm">
        <IconComponent className="w-6 h-6 text-steel-400" />
      </div>
      <h3 className="text-base font-mono font-semibold uppercase tracking-wider text-bone-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-steel-500 max-w-md mx-auto leading-relaxed mb-6">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
