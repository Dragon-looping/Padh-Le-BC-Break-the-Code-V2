import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { Button } from '@/design-system/primitives';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[PADH LE BC UI Error]', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <div className="max-w-lg w-full p-8 border border-coral-500/50 bg-ink-900 shadow-2xl text-center space-y-4">
            <div className="inline-flex p-3 bg-coral-500/10 text-coral-500 rounded-sm">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-mono uppercase tracking-wider text-bone-100 font-bold">
              Rendering Failure
            </h2>
            <p className="text-sm text-steel-500 leading-relaxed font-mono">
              {this.state.error?.message || 'A client-side component crashed unexpectedly.'}
            </p>
            <div className="pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload Application</span>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
