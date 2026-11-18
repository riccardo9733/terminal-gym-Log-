import { useState } from 'react';
import {
  User as UserIcon,
  LogOut,
  Terminal,
  Check,
} from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
} from '../ui/drawer';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { UserProfile } from '../../types/workout';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
  isFirebaseConfigured: boolean;
  onLogout: () => Promise<unknown>;
}

export function AuthModal({
  open,
  onOpenChange,
  user,
  isFirebaseConfigured,
  onLogout,
}: AuthModalProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setErrorMsg(null);
    setLoggingOut(true);
    try {
      await onLogout();
      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Logout failed');
      }
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[88dvh]">
        <DrawerHeader>
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" strokeWidth={2} />
            <DrawerTitle>ACCOUNT_&_SETTINGS</DrawerTitle>
          </div>
        </DrawerHeader>

        <DrawerBody className="space-y-4 py-2">
          {/* User Status Card */}
          <div className="rounded border border-border bg-background p-3 text-xs font-mono">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-secondary text-primary border border-border">
                  <UserIcon className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div>
                  <div className="font-bold text-foreground">
                    {user?.displayName || 'athlete'}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate max-w-[190px]">
                    {user?.email || 'authenticated_athlete'}
                  </div>
                </div>
              </div>

              <Badge
                variant={isFirebaseConfigured ? 'synced' : 'outline'}
                className="text-[9px]"
              >
                {isFirebaseConfigured ? 'CLOUD_SYNCED' : 'LOCAL_ONLY'}
              </Badge>
            </div>
          </div>

          {errorMsg && (
            <div className="rounded border border-destructive/40 bg-destructive/10 p-2 text-xs font-mono text-destructive">
              {errorMsg}
            </div>
          )}

          {/* Sync & Session Info */}
          <div className="rounded border border-accent/40 bg-accent/5 p-3 space-y-1.5 text-xs font-mono">
            <div className="flex items-center gap-1.5 font-bold text-accent">
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              <span>AUTHENTICATED // OFFLINE_CACHE_ACTIVE</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Your workouts, routines, and personal records are backed up and synced in real-time with Cloud Firestore. Offline edits in the gym sync automatically when back online.
            </p>
            {user?.uid && (
              <div className="pt-1.5 text-[10px] text-muted-foreground border-t border-border/40 truncate">
                <span className="text-foreground">UID:</span> {user.uid}
              </div>
            )}
          </div>

          {/* Logout Button */}
          <Button
            variant="destructive"
            disabled={loggingOut}
            onClick={handleLogout}
            className="w-full text-xs font-mono gap-2 h-11"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            <span>{loggingOut ? 'SIGNING_OUT...' : 'SIGN_OUT'}</span>
          </Button>

          {/* System Specs info */}
          <div className="border-t border-border/50 pt-2 text-[10px] font-mono text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>DESIGN_SYSTEM:</span>
              <span className="text-foreground">OpenCode Terminal Mono</span>
            </div>
            <div className="flex justify-between">
              <span>OFFLINE_CACHE:</span>
              <span className="text-accent">IndexedDB (Multi-tab)</span>
            </div>
            <div className="flex justify-between">
              <span>DEVICE_APIS:</span>
              <span className="text-foreground">WakeLock + WebAudio</span>
            </div>
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
