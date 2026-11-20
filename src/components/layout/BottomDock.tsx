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
  const tabs: { id: NavTab; index: number; label: string }[] = [
    { id: 'workout', index: 0, label: hasActiveWorkout ? 'SESSION*' : 'SESSION' },
    { id: 'history', index: 1, label: 'LOGS' },
    { id: 'routines', index: 2, label: 'SCHEDE' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] font-mono">
      <div className="mx-auto flex h-11 max-w-md items-center justify-between px-1">
        {tabs.map((tab, idx) => {
          const isActive = currentTab === tab.id;
          return (
            <div key={tab.id} className="flex-1 flex items-center h-full">
              <button
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex-1 h-9 mx-0.5 flex items-center justify-center text-xs font-mono tracking-wider uppercase transition-colors select-none rounded-[2px]',
                  isActive
                    ? 'bg-accent text-background font-extrabold border border-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60 active:bg-secondary border border-transparent'
                )}
              >
                <span>
                  {tab.index}:{tab.label}
                  {isActive && !tab.label.includes('*') ? '*' : ''}
                </span>
              </button>
              {idx < tabs.length - 1 && (
                <span className="text-border select-none text-xs px-0.5">│</span>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
