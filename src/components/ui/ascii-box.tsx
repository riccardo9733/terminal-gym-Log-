import * as React from 'react';
import { cn } from '../../lib/utils';

export interface AsciiBoxProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  status?: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'default' | 'accent' | 'warning' | 'destructive' | 'dashed';
  bodyClassName?: string;
}

export function AsciiBox({
  title,
  status,
  action,
  variant = 'default',
  className,
  bodyClassName,
  children,
  ...props
}: AsciiBoxProps) {
  const borderVariants = {
    default: 'border-border',
    accent: 'border-accent/70 hover:border-accent',
    warning: 'border-warning/70 hover:border-warning',
    destructive: 'border-destructive/70 hover:border-destructive',
    dashed: 'border-dashed border-border',
  };

  const headerBgVariants = {
    default: 'bg-secondary/40 text-muted-foreground',
    accent: 'bg-accent/10 text-accent',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
    dashed: 'bg-secondary/20 text-muted-foreground',
  };

  const hasHeader = title || status || action;

  return (
    <div
      className={cn(
        'relative rounded-[2px] border bg-card transition-colors select-text',
        borderVariants[variant],
        className
      )}
      {...props}
    >
      {hasHeader && (
        <div
          className={cn(
            'flex items-center justify-between border-b border-border/60 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider',
            headerBgVariants[variant]
          )}
        >
          <div className="flex items-center gap-1.5 font-bold truncate">
            {typeof title === 'string' ? (
              <span className="truncate">┌─[ {title} ]</span>
            ) : (
              title
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {status && (
              <span className="font-mono text-[10px] tabular-nums">{status}</span>
            )}
            {action}
          </div>
        </div>
      )}

      <div className={cn('p-3', bodyClassName)}>{children}</div>
    </div>
  );
}
