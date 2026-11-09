import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/design-system/primitives';
import { API_BASE_URL } from '@/services/api';

interface ConnectionErrorProps {
  requestName?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ConnectionError({
  requestName = 'Backend Request',
  message,
  onRetry,
  className,
}: ConnectionErrorProps) {
  return (
    <div
      role="alert"
      className={`border border-coral-500/40 bg-coral-500/5 p-6 rounded-sm text-left ${className || ''}`}
    >
      <div className="flex items-start gap-4">
        <div className="p-2 bg-coral-500/10 border border-coral-500/30 text-coral-500 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="font-mono text-sm uppercase tracking-wider text-coral-500 font-semibold">
            Connection Error — {requestName}
          </div>
          <p className="text-sm text-bone-100/90 leading-relaxed">
            {message || 'Unable to establish a reliable connection with the FastAPI backend server.'}
          </p>
          <div className="font-mono text-xs text-steel-500 pt-1">
            Target Base URL:{' '}
            <code className="text-bone-100 bg-graphite-800 px-1.5 py-0.5 border border-graphite-700">
              {API_BASE_URL || 'http://127.0.0.1:8000/api'}
            </code>
          </div>
          {onRetry && (
            <div className="pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="hover:border-coral-500 hover:text-coral-500 gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
