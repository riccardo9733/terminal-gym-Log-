import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = ({
  className,
  type,
  ...props
}: InputProps) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded border border-input bg-card/60 px-3 py-2 text-base font-mono text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
        className
      )}
      {...props}
    />
  );
};
