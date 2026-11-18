import { useState } from 'react';
import {
  User as UserIcon,
  LogOut,
  Terminal,
  ShieldCheck,
  Check,
  Copy,
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
  onLoginGoogle: () => Promise<unknown>;
  onLoginGithub: () => Promise<unknown>;
  onLoginGuest: () => Promise<unknown>;
  onLogout: () => Promise<unknown>;
}

export function AuthModal({
  open,
  onOpenChange,
  user,
  isFirebaseConfigured,
  onLoginGoogle,
  onLoginGithub,
  onLoginGuest,
  onLogout,
}: AuthModalProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAction = async (action: () => Promise<unknown>) => {
    setErrorMsg(null);
    try {
      await action();
      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Authentication failed');
      }
    }
  };

  const copyEnvSnippet = () => {
    const text = `VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                <div className="flex h-7 w-7 items-center justify-center rounded bg-secondary text-primary border border-border">
                  <UserIcon className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div>
                  <div className="font-bold text-foreground">
                    {user?.displayName || 'guest_athlete'}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {user?.email || (user?.isAnonymous ? 'ANONYMOUS_SESSION' : 'LOCAL_USER')}
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

          {/* Auth Providers if Firebase Configured */}
          {isFirebaseConfigured ? (
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                AUTHENTICATION_PROVIDERS
              </div>

              <Button
                variant="default"
                onClick={() => handleAction(onLoginGoogle)}
                className="w-full justify-start text-xs font-mono gap-2 h-11"
              >
                <span className="font-bold">G</span>
                <span>SIGN_IN_WITH_GOOGLE</span>
              </Button>

              <Button
                variant="default"
                onClick={() => handleAction(onLoginGithub)}
                className="w-full justify-start text-xs font-mono gap-2 h-11"
              >
                <span className="font-bold">#</span>
                <span>SIGN_IN_WITH_GITHUB</span>
              </Button>

              <Button
                variant="secondary"
                onClick={() => handleAction(onLoginGuest)}
                className="w-full justify-start text-xs font-mono gap-2 h-11"
              >
                <ShieldCheck className="h-4 w-4 text-accent" strokeWidth={2} />
                <span>CONTINUE_AS_GUEST (ANONYMOUS)</span>
              </Button>

              {user && (
                <Button
                  variant="destructive"
                  onClick={() => handleAction(onLogout)}
                  className="w-full mt-2 text-xs font-mono gap-2 h-11"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.75} />
                  <span>SIGN_OUT</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded border border-warning/40 bg-warning/5 p-3 space-y-2 text-xs font-mono">
              <div className="font-bold text-warning flex items-center gap-1.5">
                <span>[INFO] RUNNING IN OFFLINE LOCAL MODE</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Your workouts, sets, and exercise PRs are currently persisted locally in your browser&apos;s IndexedDB / LocalStorage.
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                To enable multi-device sync and GitHub/Google OAuth, add your Firebase keys to <code className="text-foreground">.env.local</code>:
              </p>
              <button
                type="button"
                onClick={copyEnvSnippet}
                className="mt-1 flex items-center gap-1.5 rounded bg-secondary px-2.5 py-1.5 text-[10px] font-mono text-foreground hover:bg-secondary/80 border border-border transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-accent" strokeWidth={2} />
                    <span>COPIED_TO_CLIPBOARD</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 text-muted-foreground" strokeWidth={1.75} />
                    <span>COPY_.ENV.LOCAL_TEMPLATE</span>
                  </>
                )}
              </button>
            </div>
          )}

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
