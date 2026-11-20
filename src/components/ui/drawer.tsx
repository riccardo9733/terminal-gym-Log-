import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
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
      'fixed inset-0 z-50 bg-black/80 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
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
        'fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] w-full max-w-md flex-col rounded-t-[2px] border-t border-x border-border bg-card pb-[env(safe-area-inset-bottom)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-150 focus:outline-none overflow-hidden',
        className
      )}
      {...props}
    >
      {/* TUI Sheet Pull Bar */}
      <div className="flex w-full items-center justify-center pt-2 pb-1 font-mono text-[10px] text-muted-foreground/50 select-none">
        <span>[ ────── ]</span>
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
      'relative flex items-center justify-between border-b border-border/80 bg-secondary/30 px-3 py-2 text-left font-mono',
      className
    )}
    {...props}
  >
    <div className="flex-1 min-w-0 pr-6">{children}</div>
    <DialogPrimitive.Close className="absolute right-2 top-2 h-7 w-7 rounded-[2px] border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors font-mono text-xs">
      ✕
      <span className="sr-only">Chiudi</span>
    </DialogPrimitive.Close>
  </div>
);

export const DrawerBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex-1 overflow-y-auto px-3 py-3 space-y-3 font-mono', className)}
    {...props}
  />
);

export const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col gap-2 border-t border-border/80 p-3 bg-secondary/20 font-mono',
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
    className={cn('text-xs font-bold font-mono text-foreground tracking-wider uppercase', className)}
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
