import { cn, formatDuration } from '../../lib/utils';

export type NavTab = 'workout' | 'history' | 'routines';

interface BottomDockProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  hasActiveWorkout: boolean;
  elapsedSeconds?: number;
  activeRestSeconds?: number;
}

export function BottomDock({
  currentTab,
  onTabChange,
  hasActiveWorkout,
  elapsedSeconds,
  activeRestSeconds,
}: BottomDockProps) {
  const getWorkoutLabel = () => {
    if (!hasActiveWorkout) return 'SESSION';
    if (activeRestSeconds !== undefined && activeRestSeconds > 0) {
      return `SESSION [REST ${activeRestSeconds}s]`;
    }
    if (elapsedSeconds !== undefined && elapsedSeconds > 0) {
      return `SESSION [⏱${formatDuration(elapsedSeconds)}]`;
    }
    return 'SESSION*';
  };

  const tabs: { id: NavTab; index: number; label: string }[] = [
    { id: 'workout', index: 0, label: getWorkoutLabel() },
    { id: 'history', index: 1, label: 'LOGS' },
    { id: 'routines', index: 2, label: 'SCHEDE' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] font-mono">
      <div className="mx-auto flex h-11 max-w-md items-center justify-between px-1">
        {tabs.map((tab, idx) => {
          const isActive = currentTab === tab.id;
          const isWorkoutTab = tab.id === 'workout';
          const isBackgroundActiveWorkout = isWorkoutTab && hasActiveWorkout && !isActive;

          return (
            <div key={tab.id} className="flex-1 flex items-center h-full min-w-0">
              <button
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex-1 h-9 mx-0.5 flex items-center justify-center text-xs font-mono tracking-wider uppercase transition-all select-none rounded-[2px] truncate px-1',
                  isActive
                    ? 'bg-accent text-background font-extrabold border border-accent'
                    : isBackgroundActiveWorkout
                    ? 'border border-accent/80 bg-accent/15 text-accent font-bold animate-pulse'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60 active:bg-secondary border border-transparent'
                )}
                title={tab.label}
              >
                <span className="truncate">
                  {tab.index}:{tab.label}
                  {isActive && !tab.label.includes('*') && !hasActiveWorkout ? '*' : ''}
                </span>
              </button>
              {idx < tabs.length - 1 && (
                <span className="text-border select-none text-xs px-0.5 shrink-0">│</span>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
