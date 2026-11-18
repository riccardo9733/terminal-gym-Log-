import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold font-mono tracking-wider uppercase transition-colors select-none',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-foreground border border-border',
        synced: 'bg-accent/15 text-accent border border-accent/30',
        offline: 'bg-warning/15 text-warning border border-warning/30',
        destructive: 'bg-destructive/15 text-destructive border border-destructive/30',
        primary: 'bg-primary/15 text-primary border border-primary/30',
        outline: 'text-muted-foreground border border-border',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
