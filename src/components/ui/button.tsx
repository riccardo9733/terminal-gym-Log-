import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-xs font-bold font-mono uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-40 select-none active:translate-y-[1px] rounded-[2px]',
  {
    variants: {
      variant: {
        default:
          'bg-secondary/90 text-foreground border border-border hover:bg-secondary hover:border-accent/50',
        primary:
          'bg-accent text-background border border-accent hover:bg-accent/90 font-extrabold',
        accent:
          'bg-accent text-background border border-accent hover:bg-accent/90 font-extrabold',
        destructive:
          'bg-destructive/15 text-destructive border border-destructive/40 hover:bg-destructive/30 hover:border-destructive',
        secondary:
          'bg-secondary/80 text-foreground border border-border hover:bg-secondary hover:border-border/80',
        ghost:
          'bg-transparent hover:bg-secondary text-muted-foreground hover:text-foreground border border-transparent hover:border-border',
        outline:
          'border border-border bg-transparent hover:bg-secondary/60 text-foreground hover:border-border/80',
      },
      size: {
        default: 'h-11 px-4 py-2 min-h-[44px]',
        sm: 'h-9 px-3 min-h-[36px] text-[11px]',
        lg: 'h-12 px-6 min-h-[48px] text-xs',
        icon: 'h-11 w-11 min-h-[44px] min-w-[44px]',
        iconSm: 'h-9 w-9 min-h-[36px] min-w-[36px]',
        compact: 'h-7 px-2 text-[10px] min-h-[28px]',
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
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
};
