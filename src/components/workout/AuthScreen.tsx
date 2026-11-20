import { useState } from 'react';
import { Terminal, Shield, LogIn, UserPlus } from 'lucide-react';
import { SignIn, SignUp } from '@clerk/react';
import { dark } from '@clerk/themes';

export function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-[100dvh] max-w-md mx-auto flex flex-col justify-between p-4 bg-background text-foreground font-mono">
      {/* Top Header */}
      <div className="pt-4 space-y-3">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-bold font-mono tracking-tight text-foreground">
            // GYM_LOG
          </span>
          <span className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.2 rounded">
            v0.1.0-clerk
          </span>
        </div>

        <div className="border-l-2 border-primary pl-2.5 space-y-0.5">
          <div className="text-sm font-bold text-foreground tracking-wide">
            AUTHENTICATION_REQUIRED
          </div>
          <div className="text-[11px] text-muted-foreground">
            Sign in or create an account to start tracking workouts offline.
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="my-auto py-4 space-y-4">
        {/* Mode Toggle (Tabs) */}
        <div className="grid grid-cols-2 gap-1 rounded bg-secondary/80 p-1 border border-border">
          <button
            type="button"
            onClick={() => setMode('login')}
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
            onClick={() => setMode('signup')}
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

        {/* Clerk Component Container */}
        <div className="flex justify-center w-full">
          {mode === 'login' ? (
            <SignIn
              routing="hash"
              appearance={{
                theme: dark,
                variables: {
                  colorPrimary: '#007aff',
                  colorBackground: '#201d1d',
                  colorInput: '#2e2a2a',
                  colorInputForeground: '#fdfcfc',
                },
                elements: {
                  rootBox: 'w-full',
                  card: 'border border-border/60 shadow-none bg-card/90 w-full',
                  formButtonPrimary:
                    'font-mono text-xs font-bold rounded bg-primary hover:bg-primary/90 text-primary-foreground',
                  formFieldInput:
                    'font-mono text-xs rounded border-border bg-secondary/60 text-foreground',
                  formFieldLabel:
                    'font-mono text-[10px] text-muted-foreground tracking-wider uppercase',
                  footerActionLink: 'text-primary font-mono text-xs hover:underline',
                  headerTitle: 'font-mono text-base font-bold',
                  headerSubtitle: 'font-mono text-xs text-muted-foreground',
                  socialButtonsBlockButton:
                    'font-mono text-xs border-border bg-secondary/70 hover:bg-secondary',
                },
              }}
            />
          ) : (
            <SignUp
              routing="hash"
              appearance={{
                theme: dark,
                variables: {
                  colorPrimary: '#007aff',
                  colorBackground: '#201d1d',
                  colorInput: '#2e2a2a',
                  colorInputForeground: '#fdfcfc',
                },
                elements: {
                  rootBox: 'w-full',
                  card: 'border border-border/60 shadow-none bg-card/90 w-full',
                  formButtonPrimary:
                    'font-mono text-xs font-bold rounded bg-primary hover:bg-primary/90 text-primary-foreground',
                  formFieldInput:
                    'font-mono text-xs rounded border-border bg-secondary/60 text-foreground',
                  formFieldLabel:
                    'font-mono text-[10px] text-muted-foreground tracking-wider uppercase',
                  footerActionLink: 'text-primary font-mono text-xs hover:underline',
                  headerTitle: 'font-mono text-base font-bold',
                  headerSubtitle: 'font-mono text-xs text-muted-foreground',
                  socialButtonsBlockButton:
                    'font-mono text-xs border-border bg-secondary/70 hover:bg-secondary',
                },
              }}
            />
          )}
        </div>
      </div>

      {/* Footer Specs */}
      <div className="border-t border-border/50 pt-3 pb-2 text-[10px] text-muted-foreground space-y-1 font-mono">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Shield className="h-3 w-3 text-accent" />
            <span>AUTH_ENGINE:</span>
          </span>
          <span className="text-foreground">Clerk Security Core</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Terminal className="h-3 w-3 text-primary" />
            <span>OFFLINE_PERSISTENCE:</span>
          </span>
          <span className="text-muted-foreground">IndexedDB Multi-tab</span>
        </div>
      </div>
    </div>
  );
}
