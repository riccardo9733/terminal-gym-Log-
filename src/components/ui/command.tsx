import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { cn } from '../../lib/utils';

export const Command = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive>) => (
  <CommandPrimitive
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-[2px] bg-card text-foreground font-mono border border-border',
      className
    )}
    {...props}
  />
);

export const CommandInput = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>) => (
  <div className="flex items-center border-b border-border px-3 bg-secondary/30" cmdk-input-wrapper="">
    <span className="mr-2 text-xs font-mono font-bold text-accent select-none">$</span>
    <CommandPrimitive.Input
      className={cn(
        'flex h-11 w-full bg-transparent py-2 text-xs outline-none placeholder:text-muted-foreground/50 disabled:cursor-not-allowed disabled:opacity-50 font-mono tracking-wide',
        className
      )}
      {...props}
    />
    <span className="text-accent animate-pulse font-mono font-bold select-none text-xs">█</span>
  </div>
);

export const CommandList = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>) => (
  <CommandPrimitive.List
    className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden p-1', className)}
    {...props}
  />
);

export const CommandEmpty = ({
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>) => (
  <CommandPrimitive.Empty className="py-6 text-center text-xs font-mono text-muted-foreground" {...props} />
);

export const CommandGroup = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>) => (
  <CommandPrimitive.Group
    className={cn(
      'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground',
      className
    )}
    {...props}
  />
);

export const CommandItem = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>) => (
  <CommandPrimitive.Item
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-[2px] px-2 py-2 text-xs font-mono outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent/15 data-[selected=true]:text-accent data-[disabled=true]:opacity-50 min-h-[44px] transition-colors',
      className
    )}
    {...props}
  />
);
