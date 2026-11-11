import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Check, Copy } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { MathRenderer } from '../components/common/MathRenderer';
export { MathRenderer } from '../components/common/MathRenderer';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'cyan-solid' | 'outline' | 'ghost' | 'lime-solid' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'cyan-solid', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-mono font-medium transition-colors focus-visible:outline-2 focus-visible:outline-lime-400 focus-visible:outline-offset-2 disabled:opacity-40 disabled:pointer-events-none select-none';
    
    const sizes = {
      sm: 'text-xs px-3 py-1.5 min-h-[36px]',
      md: 'text-sm px-5 py-2.5 min-h-[44px]',
      lg: 'text-base px-6 py-3 min-h-[48px]',
    };

    const variants = {
      'cyan-solid': 'bg-cyan-400 text-ink-950 hover:bg-cyan-300 font-semibold shadow-cyan-glow',
      'lime-solid': 'bg-lime-400 text-ink-950 hover:bg-lime-300 font-semibold shadow-lime-glow',
      'outline': 'border border-graphite-600 text-bone-100 hover:border-cyan-400 hover:text-cyan-400 bg-graphite-800/40',
      'ghost': 'text-steel-500 hover:text-bone-100 hover:bg-graphite-800/60',
      'danger': 'bg-coral-500 text-white hover:bg-coral-600',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(base, sizes[size], variants[variant], className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'cyan' | 'lime' | 'orange' | 'coral';
}

export function Chip({ className, variant = 'default', children, ...props }: ChipProps) {
  const variants = {
    default: 'bg-graphite-800 border-graphite-700 text-steel-500',
    cyan: 'bg-cyan-400/10 border-cyan-400/30 text-cyan-400',
    lime: 'bg-lime-400/10 border-lime-400/30 text-lime-400',
    orange: 'bg-orange-500/10 border-orange-500/30 text-orange-500',
    coral: 'bg-coral-500/10 border-coral-500/30 text-coral-500',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border tracking-wider uppercase',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusDot({ status }: { status: 'healthy' | 'unreachable' | 'running' | 'idle' }) {
  const colors = {
    healthy: 'bg-cyan-400 shadow-[0_0_8px_#19E3FF]',
    unreachable: 'bg-coral-500 shadow-[0_0_8px_#FF5A6E]',
    running: 'bg-orange-500 animate-pulse shadow-[0_0_8px_#FF6B1A]',
    idle: 'bg-steel-500',
  };

  return <span className={clsx('inline-block w-2 h-2 rounded-full', colors[status])} />;
}

export function CodeBlock({ code, language = 'python', filename }: { code: string; language?: string; filename?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 border border-graphite-700 bg-ink-950 font-mono text-sm group">
      <div className="flex items-center justify-between px-4 py-2 border-b border-graphite-700/60 bg-graphite-800/50">
        <span className="text-xs text-steel-500 tracking-wider uppercase font-semibold">
          {filename || language}
        </span>
        <button
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          className="flex items-center gap-1.5 text-xs text-steel-500 hover:text-cyan-400 transition-colors p-1"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-lime-400" />
              <span className="text-lime-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-bone-100 text-xs sm:text-sm leading-relaxed whitespace-pre">
        <code>{code}</code>
      </div>
    </div>
  );
}

export function MathBlock({ math, displayMode = true }: { math: string; displayMode?: boolean }) {
  return <MathRenderer text={math} block={displayMode} />;
}

export function Callout({
  variant = 'info',
  title,
  children,
}: {
  variant?: 'info' | 'warning' | 'success';
  title?: string;
  children: React.ReactNode;
}) {
  const styles = {
    info: 'border-cyan-400/40 bg-cyan-400/5 text-bone-100',
    warning: 'border-orange-500/40 bg-orange-500/5 text-bone-100',
    success: 'border-lime-400/40 bg-lime-400/5 text-bone-100',
  };

  return (
    <div className={clsx('my-4 p-4 border-l-2', styles[variant])}>
      {title && <div className="font-mono text-xs tracking-wider uppercase font-semibold mb-1">{title}</div>}
      <div className="text-sm text-bone-100/90 leading-relaxed">{children}</div>
    </div>
  );
}
