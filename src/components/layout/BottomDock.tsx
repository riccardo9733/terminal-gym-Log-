import { Dumbbell, History, Bookmark } from 'lucide-react';
import { cn } from '../../lib/utils';

export type NavTab = 'workout' | 'history' | 'routines';

interface BottomDockProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  hasActiveWorkout: boolean;
}

export function BottomDock({
  currentTab,
  onTabChange,
  hasActiveWorkout,
}: BottomDockProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background shadow-lg pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex h-14 max-w-md items-center justify-around px-2">
        {/* Tab 01: SESSION */}
        <button
          onClick={() => onTabChange('workout')}
          className={cn(
            'flex flex-1 flex-col items-center justify-center py-1 text-[11px] font-mono tracking-wider transition-colors min-h-[44px] select-none',
            currentTab === 'workout'
              ? 'text-accent font-bold'
              : 'text-muted-foreground hover:text-foreground active:text-foreground'
          )}
        >
          <div className="relative">
            <Dumbbell className="h-4 w-4" strokeWidth={currentTab === 'workout' ? 2.25 : 1.75} />
            {hasActiveWorkout && (
              <span className="absolute -right-1.5 -top-1 h-2 w-2 rounded-full bg-accent animate-ping" />
            )}
          </div>
          <span className="mt-1">
            {hasActiveWorkout ? '[01] SESSION*' : '[01] SESSION'}
          </span>
        </button>

        {/* Tab 02: LOGS */}
        <button
          onClick={() => onTabChange('history')}
          className={cn(
            'flex flex-1 flex-col items-center justify-center py-1 text-[11px] font-mono tracking-wider transition-colors min-h-[44px] select-none',
            currentTab === 'history'
              ? 'text-accent font-bold'
              : 'text-muted-foreground hover:text-foreground active:text-foreground'
          )}
        >
          <History className="h-4 w-4" strokeWidth={currentTab === 'history' ? 2.25 : 1.75} />
          <span className="mt-1">[02] LOGS</span>
        </button>

        {/* Tab 03: SCHEDE */}
        <button
          onClick={() => onTabChange('routines')}
          className={cn(
            'flex flex-1 flex-col items-center justify-center py-1 text-[11px] font-mono tracking-wider transition-colors min-h-[44px] select-none',
            currentTab === 'routines'
              ? 'text-accent font-bold'
              : 'text-muted-foreground hover:text-foreground active:text-foreground'
          )}
        >
          <Bookmark className="h-4 w-4" strokeWidth={currentTab === 'routines' ? 2.25 : 1.75} />
          <span className="mt-1">[03] SCHEDE</span>
        </button>
      </div>
    </nav>
  );
}
