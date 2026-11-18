import { Dumbbell, History, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';

export type NavTab = 'workout' | 'history' | 'exercises';

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
        <button
          onClick={() => onTabChange('workout')}
          className={cn(
            'flex flex-1 flex-col items-center justify-center py-1 text-[10px] font-mono tracking-wider transition-colors min-h-[44px]',
            currentTab === 'workout'
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <div className="relative">
            <Dumbbell className="h-4 w-4" strokeWidth={1.75} />
            {hasActiveWorkout && (
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-accent animate-ping" />
            )}
          </div>
          <span className="mt-1">
            {hasActiveWorkout ? 'SESSION*' : 'SESSION'}
          </span>
        </button>

        <button
          onClick={() => onTabChange('history')}
          className={cn(
            'flex flex-1 flex-col items-center justify-center py-1 text-[10px] font-mono tracking-wider transition-colors min-h-[44px]',
            currentTab === 'history'
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <History className="h-4 w-4" strokeWidth={1.75} />
          <span className="mt-1">LOGS</span>
        </button>

        <button
          onClick={() => onTabChange('exercises')}
          className={cn(
            'flex flex-1 flex-col items-center justify-center py-1 text-[10px] font-mono tracking-wider transition-colors min-h-[44px]',
            currentTab === 'exercises'
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <BookOpen className="h-4 w-4" strokeWidth={1.75} />
          <span className="mt-1">EXERCISES</span>
        </button>
      </div>
    </nav>
  );
}
