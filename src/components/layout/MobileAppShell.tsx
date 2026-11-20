import * as React from 'react';
import { cn } from '../../lib/utils';

export function MobileAppShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-background text-foreground border-x border-border/40 relative pb-16 selection:bg-accent/20 font-mono',
        className
      )}
    >
      {children}
    </div>
  );
}
