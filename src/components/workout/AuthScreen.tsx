import React, { useState } from 'react';
import { Terminal, Shield, LogIn, UserPlus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface AuthScreenProps {
  onLoginEmail: (email: string, pass: string) => Promise<unknown>;
  onRegisterEmail: (email: string, pass: string, displayName?: string) => Promise<unknown>;
  onLoginGoogle: () => Promise<unknown>;
  onLoginGithub: () => Promise<unknown>;
}

export function AuthScreen({
  onLoginEmail,
  onRegisterEmail,
  onLoginGoogle,
  onLoginGithub,
}: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('EMAIL_AND_PASSWORD_REQUIRED');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('PASSWORD_MIN_6_CHARACTERS');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await onRegisterEmail(email, password, displayName.trim() || undefined);
      } else {
        await onLoginEmail(email, password);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Humanize common Firebase auth errors
        if (err.message.includes('auth/invalid-credential') || err.message.includes('auth/wrong-password')) {
          setErrorMsg('INVALID_CREDENTIALS');
        } else if (err.message.includes('auth/email-already-in-use')) {
          setErrorMsg('EMAIL_ALREADY_IN_USE');
        } else if (err.message.includes('auth/weak-password')) {
          setErrorMsg('PASSWORD_TOO_WEAK');
        } else {
          setErrorMsg(err.message.replace('Firebase: ', ''));
        }
      } else {
        setErrorMsg('AUTHENTICATION_FAILED');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleOAuth = async (fn: () => Promise<unknown>) => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await fn();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message.replace('Firebase: ', ''));
      } else {
        setErrorMsg('OAUTH_FAILED');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] max-w-md mx-auto flex flex-col justify-between p-4 bg-background text-foreground font-mono">
      {/* Top Header */}
      <div className="pt-6 space-y-3">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-bold font-mono tracking-tight text-foreground">
            // GYM_LOG
          </span>
          <span className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.2 rounded">
            v0.1.0
          </span>
        </div>

        <div className="border-l-2 border-primary pl-2.5 space-y-0.5">
          <div className="text-sm font-bold text-foreground tracking-wide">
            AUTHENTICATION_REQUIRED
          </div>
          <div className="text-[11px] text-muted-foreground">
            Sign in or create an account to start tracking workouts with deterministic offline sync.
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="my-auto py-4 space-y-4">
        {/* Mode Toggle (Tabs) */}
        <div className="grid grid-cols-2 gap-1 rounded bg-secondary/80 p-1 border border-border">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex items-center justify-center gap-1.5 rounded py-2 text-xs font-mono font-bold transition-all ${
              mode === 'login'
                ? 'bg-background text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>[ LOGIN ]</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`flex items-center justify-center gap-1.5 rounded py-2 text-xs font-mono font-bold transition-all ${
              mode === 'signup'
                ? 'bg-background text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>[ SIGN_UP ]</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="rounded border border-destructive/50 bg-destructive/10 p-2.5 text-xs text-destructive font-mono flex items-start gap-1.5">
            <span className="font-bold">[ERROR]</span>
            <span className="break-all">{errorMsg}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground tracking-wider uppercase">
                ATHLETE_NAME (OPTIONAL)
              </label>
              <Input
                type="text"
                placeholder="e.g. alex_runner"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={submitting}
                className="text-xs font-mono h-10"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground tracking-wider uppercase">
              EMAIL_ADDRESS
            </label>
            <Input
              type="email"
              placeholder="athlete@gym-log.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              required
              className="text-xs font-mono h-10"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground tracking-wider uppercase">
              PASSWORD (MIN 6 CHARS)
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
              className="text-xs font-mono h-10"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-11 text-xs font-mono font-bold tracking-wider mt-2"
          >
            {submitting ? (
              <span className="animate-pulse">CONNECTING...</span>
            ) : mode === 'login' ? (
              'ENTER_TERMINAL'
            ) : (
              'CREATE_ACCOUNT'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center py-2">
          <div className="border-t border-border w-full" />
          <span className="bg-background px-2 text-[10px] text-muted-foreground uppercase tracking-widest absolute">
            OR_CONNECT_WITH
          </span>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-2">
          <Button
            type="button"
            variant="secondary"
            disabled={submitting}
            onClick={() => handleOAuth(onLoginGoogle)}
            className="w-full justify-start text-xs font-mono gap-2.5 h-11 border border-border"
          >
            <span className="font-bold text-foreground">G</span>
            <span>SIGN_IN_WITH_GOOGLE</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            disabled={submitting}
            onClick={() => handleOAuth(onLoginGithub)}
            className="w-full justify-start text-xs font-mono gap-2.5 h-11 border border-border"
          >
            <span className="font-bold text-foreground">#</span>
            <span>SIGN_IN_WITH_GITHUB</span>
          </Button>
        </div>
      </div>

      {/* Footer Specs */}
      <div className="border-t border-border/50 pt-3 pb-2 text-[10px] text-muted-foreground space-y-1 font-mono">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Shield className="h-3 w-3 text-accent" />
            <span>OFFLINE_PERSISTENCE:</span>
          </span>
          <span className="text-foreground">IndexedDB Multi-tab</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Terminal className="h-3 w-3 text-primary" />
            <span>CORE_PHILOSOPHY:</span>
          </span>
          <span className="text-muted-foreground">Zero bloat / No guest leak</span>
        </div>
      </div>
    </div>
  );
}
