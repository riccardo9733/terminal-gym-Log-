import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerPortal = DialogPrimitive.Portal;
export const DrawerClose = DialogPrimitive.Close;

export const DrawerOverlay = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) => (
  <DialogPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-black/75 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
);

export const DrawerContent = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DialogPrimitive.Content
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] w-full max-w-md flex-col rounded-t-[6px] border-t border-border bg-card shadow-2xl pb-[env(safe-area-inset-bottom)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-200 focus:outline-none overflow-hidden',
        className
      )}
      {...props}
    >
      {/* Visual Sheet Pull Handle */}
      <div className="flex w-full items-center justify-center pt-2.5 pb-1">
        <div className="h-1 w-10 rounded-full bg-muted-foreground/40" />
      </div>
      {children}
    </DialogPrimitive.Content>
  </DrawerPortal>
);

export const DrawerHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'relative flex items-center justify-between border-b border-border/70 px-4 py-2.5 text-left',
      className
    )}
    {...props}
  >
    <div className="flex-1 min-w-0 pr-6">{children}</div>
    <DialogPrimitive.Close className="absolute right-3 top-2.5 h-8 w-8 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
      <X className="h-4 w-4" strokeWidth={1.75} />
      <span className="sr-only">Chiudi</span>
    </DialogPrimitive.Close>
  </div>
);

export const DrawerBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex-1 overflow-y-auto px-4 py-3 space-y-3', className)}
    {...props}
  />
);

export const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-border/70 p-3 bg-card',
      className
    )}
    {...props}
  />
);

export const DrawerTitle = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) => (
  <DialogPrimitive.Title
    className={cn('text-sm font-bold font-mono text-foreground tracking-tight', className)}
    {...props}
  />
);

export const DrawerDescription = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) => (
  <DialogPrimitive.Description
    className={cn('text-[11px] font-mono text-muted-foreground mt-0.5', className)}
    {...props}
  />
);
