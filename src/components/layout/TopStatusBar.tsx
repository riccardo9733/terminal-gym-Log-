import { Wifi, WifiOff, Sun, User as UserIcon } from 'lucide-react';
import { Badge } from '../ui/badge';
import { SyncState } from '../../hooks/useNetworkSync';
import { UserProfile } from '../../types/workout';

interface TopStatusBarProps {
  syncState: SyncState;
  isWakeLocked: boolean;
  user: UserProfile | null;
  onOpenAuth: () => void;
}

export function TopStatusBar({
  syncState,
  isWakeLocked,
  user,
  onOpenAuth,
}: TopStatusBarProps) {
  const { statusBadge, isOnline } = syncState;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background pt-[env(safe-area-inset-top)]">
      <div className="flex h-11 items-center justify-between px-3">
        {/* Left: Terminal Logo */}
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-bold font-mono tracking-tight text-foreground">
            // GYM_LOG
          </span>
        </div>

        {/* Right Controls: WakeLock, Sync Status, User Profile */}
        <div className="flex items-center space-x-1.5">
          {/* Wake Lock Status */}
          {isWakeLocked && (
            <div
              className="flex items-center gap-1 rounded bg-secondary/80 px-1.5 py-0.5 text-[9px] font-mono text-foreground border border-border"
              title="Screen Wake Lock Active"
            >
              <Sun className="h-2.5 w-2.5 text-warning" strokeWidth={2} />
              <span>AWAKE</span>
            </div>
          )}

          {/* Sync Badge */}
          <Badge
            variant={
              statusBadge.variant === 'synced'
                ? 'synced'
                : statusBadge.variant === 'offline'
                ? 'offline'
                : 'default'
            }
            className="flex items-center gap-1 text-[9px] py-0.5 px-1.5"
          >
            {isOnline ? (
              <Wifi className="h-2.5 w-2.5" strokeWidth={2} />
            ) : (
              <WifiOff className="h-2.5 w-2.5" strokeWidth={2} />
            )}
            <span>{statusBadge.label}</span>
          </Badge>

          {/* Auth / Profile Trigger Button */}
          <button
            onClick={onOpenAuth}
            className="flex h-8 items-center gap-1 rounded border border-border bg-secondary/70 px-2 text-[10px] font-mono text-muted-foreground hover:text-foreground active:bg-secondary transition-colors"
            title="User Profile & Settings"
          >
            <UserIcon className="h-3 w-3 text-primary" strokeWidth={1.75} />
            <span className="max-w-[65px] truncate">
              {user ? (user.displayName || user.email?.split('@')[0] || 'usr') : 'usr'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
