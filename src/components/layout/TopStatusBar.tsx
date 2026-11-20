import { Wifi, WifiOff } from 'lucide-react';
import { UserButton } from '@clerk/react';
import { Badge } from '../ui/badge';
import { SyncState } from '../../hooks/useNetworkSync';
import { UserProfile } from '../../types/workout';

interface TopStatusBarProps {
  syncState: SyncState;
  isWakeLocked?: boolean;
  user?: UserProfile | null;
  onOpenAuth?: () => void;
}

export function TopStatusBar({
  syncState,
}: TopStatusBarProps) {
  const { statusBadge, isOnline } = syncState;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-xs pt-[env(safe-area-inset-top)]">
      <div className="flex h-11 items-center justify-between px-3">
        {/* Left: Terminal Machine Logo */}
        <div className="flex items-center space-x-1.5 font-mono select-none">
          <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-bold tracking-tight text-foreground">
            // GYM_LOG
          </span>
        </div>

        {/* Right Controls: Only Sync Status + Clerk User Profile */}
        <div className="flex items-center space-x-2">
          {/* Sync Status Badge */}
          <Badge
            variant={
              statusBadge.variant === 'synced'
                ? 'synced'
                : statusBadge.variant === 'offline'
                ? 'offline'
                : 'default'
            }
            className="flex items-center gap-1 text-[9px] py-0.5 px-1.5 tracking-wider font-mono select-none"
          >
            {isOnline ? (
              <Wifi className="h-2.5 w-2.5" strokeWidth={2} />
            ) : (
              <WifiOff className="h-2.5 w-2.5" strokeWidth={2} />
            )}
            <span>{statusBadge.label}</span>
          </Badge>

          {/* Clerk User Button */}
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'h-7 w-7 border border-border rounded',
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
