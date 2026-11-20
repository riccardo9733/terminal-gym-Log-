import { useState } from 'react';
import {
  User as UserIcon,
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
import { useClerk } from '@clerk/react';

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
  const { openUserProfile } = useClerk();

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

  const handleOpenClerkProfile = () => {
    onOpenChange(false);
    openUserProfile();
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[88dvh] font-mono">
        <DrawerHeader>
          <div className="flex items-center gap-1.5">
            <span className="text-accent font-bold select-none">&gt;</span>
            <DrawerTitle>ACCOUNT_&amp;_SETTINGS</DrawerTitle>
          </div>
        </DrawerHeader>

        <DrawerBody className="space-y-4 py-2">
          {/* User Status Card */}
          <div className="rounded-[2px] border border-border bg-card p-3 text-xs font-mono">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-[2px] bg-secondary text-accent border border-border">
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
            <div className="rounded-[2px] border border-destructive/40 bg-destructive/10 p-2 text-xs font-mono text-destructive">
              [ERROR]: {errorMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Button
              variant="default"
              onClick={handleOpenClerkProfile}
              className="w-full text-xs font-mono font-bold justify-center h-11"
            >
              [ ⚙ GESTISCI_PROFILO_CLERK ]
            </Button>

            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full text-xs font-mono font-bold justify-center h-11"
            >
              {loggingOut ? '[ LOGGING_OUT... ]' : '[ ✕ DISCONNETTI ]'}
            </Button>
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
