import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-[2px] px-1.5 py-0.5 text-[10px] font-bold font-mono tracking-wider uppercase transition-colors select-none leading-none border',
  {
    variants: {
      variant: {
        default: 'bg-secondary/70 text-foreground border-border',
        synced: 'bg-accent/15 text-accent border-accent/40',
        offline: 'bg-warning/15 text-warning border-warning/40',
        destructive: 'bg-destructive/15 text-destructive border-destructive/40',
        primary: 'bg-primary/15 text-primary border-primary/40',
        accent: 'bg-accent/15 text-accent border-accent/40',
        outline: 'bg-transparent text-muted-foreground border-border',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  bracketed?: boolean;
}

export function Badge({
  className,
  variant,
  bracketed = true,
  children,
  ...props
}: BadgeProps) {
  // If bracketed is true and children is a string without brackets, wrap it in brackets
  const renderContent = () => {
    if (!bracketed) return children;
    if (typeof children === 'string') {
      const trimmed = children.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        return children;
      }
      return `[${trimmed}]`;
    }
    return children;
  };

  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {renderContent()}
    </span>
  );
}
