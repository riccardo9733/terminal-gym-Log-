import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-xs font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-40 select-none active:translate-y-[1px]',
  {
    variants: {
      variant: {
        default:
          'bg-card text-foreground border border-border hover:bg-secondary hover:border-primary/50',
        primary:
          'bg-primary text-primary-foreground border border-primary hover:bg-primary/90',
        accent:
          'bg-accent text-accent-foreground font-bold border border-accent hover:bg-accent/90',
        destructive:
          'bg-destructive/15 text-destructive border border-destructive/40 hover:bg-destructive/25',
        secondary:
          'bg-secondary text-foreground border border-border hover:bg-secondary/80',
        ghost:
          'hover:bg-secondary text-muted-foreground hover:text-foreground',
        outline:
          'border border-border bg-transparent hover:bg-secondary text-foreground',
      },
      size: {
        default: 'h-11 px-4 py-2 min-h-[44px]',
        sm: 'h-9 px-3 min-h-[36px] text-[11px]',
        lg: 'h-12 px-6 min-h-[48px] text-sm',
        icon: 'h-11 w-11 min-h-[44px] min-w-[44px]',
        iconSm: 'h-9 w-9 min-h-[36px] min-w-[36px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = ({
  className,
  variant,
  size,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }), 'rounded')}
      {...props}
    />
  );
};
