import { Badge } from '../ui/badge';
import { SyncState } from '../../hooks/useNetworkSync';
import { UserProfile } from '../../types/workout';
import { UserButton } from '@clerk/react';

interface TopStatusBarProps {
  syncState: SyncState;
  isWakeLocked?: boolean;
  user?: UserProfile | null;
  onOpenAuth?: () => void;
}

export function TopStatusBar({
  syncState,
  isWakeLocked,
}: TopStatusBarProps) {
  const { statusBadge, isOnline } = syncState;

  // Choose ASCII symbol for sync status
  const syncGlyph = isOnline
    ? statusBadge.variant === 'synced'
      ? '◈'
      : '↻'
    : '⛛';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-xs pt-[env(safe-area-inset-top)] font-mono">
      <div className="flex h-10 items-center justify-between px-3">
        {/* Left: Terminal Machine Brand */}
        <div className="flex items-center space-x-1.5 select-none">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse inline-block" />
          <span className="text-xs font-bold tracking-tight text-foreground uppercase">
            // GYM_LOG
          </span>
        </div>

        {/* Right Controls: tmux status pane */}
        <div className="flex items-center space-x-1.5 text-[10px]">
          {/* Wake Lock Status */}
          {isWakeLocked && (
            <span className="bg-secondary/70 border border-border px-1.5 py-0.5 text-foreground font-bold select-none tabular-nums">
              [☀ AWAKE]
            </span>
          )}

          {/* Sync Status Badge */}
          <Badge
            variant={
              statusBadge.variant === 'synced'
                ? 'synced'
                : statusBadge.variant === 'offline'
                ? 'offline'
                : 'default'
            }
            className="tabular-nums"
          >
            {`[${syncGlyph} ${statusBadge.label}]`}
          </Badge>

          {/* User Button (Clerk or squared fallback) */}
          <div className="flex items-center">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'h-6 w-6 border border-border rounded-[2px]',
                },
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
