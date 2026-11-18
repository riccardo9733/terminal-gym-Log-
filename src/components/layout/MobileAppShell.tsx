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
        'mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-background text-foreground shadow-2xl relative pb-20 selection:bg-primary/20',
        className
      )}
    >
      {children}
    </div>
  );
}
