import { useState } from 'react';
import { SignIn, SignUp } from '@clerk/react';
import { dark } from '@clerk/themes';

export function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-[100dvh] max-w-md mx-auto flex flex-col justify-between p-4 bg-background text-foreground font-mono">
      {/* Top Header */}
      <div className="pt-4 space-y-3">
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-[0px] bg-accent animate-pulse inline-block" />
          <span className="text-xs font-bold font-mono tracking-tight text-foreground">
            // GYM_LOG
          </span>
          <span className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.2 rounded-[2px]">
            [v0.1.0-clerk]
          </span>
        </div>

        <div className="border-l-2 border-accent pl-2.5 space-y-0.5">
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
        {/* Mode Toggle (tmux-style tabs) */}
        <div className="grid grid-cols-2 gap-1 rounded-[2px] bg-secondary/80 p-1 border border-border">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex items-center justify-center gap-1.5 rounded-[2px] py-2 text-xs font-mono font-bold transition-all ${
              mode === 'login'
                ? 'bg-accent text-background border border-accent font-extrabold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>[ 0:LOGIN{mode === 'login' ? '*' : ''} ]</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex items-center justify-center gap-1.5 rounded-[2px] py-2 text-xs font-mono font-bold transition-all ${
              mode === 'signup'
                ? 'bg-accent text-background border border-accent font-extrabold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>[ 1:SIGN_UP{mode === 'signup' ? '*' : ''} ]</span>
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
                  colorPrimary: '#00d892',
                  colorBackground: '#16191e',
                  colorInput: '#22252a',
                  colorInputForeground: '#fafafa',
                },
                elements: {
                  rootBox: 'w-full',
                  card: 'border border-border/80 shadow-none bg-card w-full rounded-[2px]',
                  formButtonPrimary:
                    'font-mono text-xs font-bold rounded-[2px] bg-accent hover:bg-accent/90 text-background',
                  formFieldInput:
                    'font-mono text-xs rounded-[2px] border-border bg-secondary/80 text-foreground',
                  formFieldLabel:
                    'font-mono text-[10px] text-muted-foreground tracking-wider uppercase',
                  footerActionLink: 'text-accent font-mono text-xs hover:underline',
                  headerTitle: 'font-mono text-base font-bold',
                  headerSubtitle: 'font-mono text-xs text-muted-foreground',
                  socialButtonsBlockButton:
                    'font-mono text-xs border-border bg-secondary/70 hover:bg-secondary rounded-[2px]',
                },
              }}
            />
          ) : (
            <SignUp
              routing="hash"
              appearance={{
                theme: dark,
                variables: {
                  colorPrimary: '#00d892',
                  colorBackground: '#16191e',
                  colorInput: '#22252a',
                  colorInputForeground: '#fafafa',
                },
                elements: {
                  rootBox: 'w-full',
                  card: 'border border-border/80 shadow-none bg-card w-full rounded-[2px]',
                  formButtonPrimary:
                    'font-mono text-xs font-bold rounded-[2px] bg-accent hover:bg-accent/90 text-background',
                  formFieldInput:
                    'font-mono text-xs rounded-[2px] border-border bg-secondary/80 text-foreground',
                  formFieldLabel:
                    'font-mono text-[10px] text-muted-foreground tracking-wider uppercase',
                  footerActionLink: 'text-accent font-mono text-xs hover:underline',
                  headerTitle: 'font-mono text-base font-bold',
                  headerSubtitle: 'font-mono text-xs text-muted-foreground',
                  socialButtonsBlockButton:
                    'font-mono text-xs border-border bg-secondary/70 hover:bg-secondary rounded-[2px]',
                },
              }}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] text-muted-foreground/50 pb-2">
        <span>// OXIDE_TUI_SYSTEM // GYM_LOG</span>
      </div>
    </div>
  );
}
