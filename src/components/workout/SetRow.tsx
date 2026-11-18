import { Check, Trash2 } from 'lucide-react';
import { WorkoutSet } from '../../types/workout';
import { cn } from '../../lib/utils';

interface SetRowProps {
  setIndex: number;
  set: WorkoutSet;
  prevWeight?: number;
  prevReps?: number;
  onUpdate: (updated: Partial<WorkoutSet>) => void;
  onToggleComplete: () => void;
  onDelete: () => void;
}

export function SetRow({
  setIndex,
  set,
  prevWeight,
  prevReps,
  onUpdate,
  onToggleComplete,
  onDelete,
}: SetRowProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-2 py-1.5 px-2 rounded border transition-colors',
        set.completed
          ? 'bg-accent/5 border-accent/30'
          : set.isWarmup
            ? 'bg-secondary/40 border-dashed border-border'
            : 'bg-card/40 border-border'
      )}
    >
      {/* Set Number / Warmup Toggle Button */}
      <button
        type="button"
        onClick={() => onUpdate({ isWarmup: !set.isWarmup })}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded text-xs font-bold font-mono transition-colors border',
          set.isWarmup
            ? 'bg-warning/20 text-warning border-warning/50'
            : 'bg-secondary text-foreground border-border hover:border-primary/50'
        )}
        title={set.isWarmup ? 'Warmup Set (click to make normal)' : 'Normal Set (click to mark warmup)'}
      >
        {set.isWarmup ? 'W' : setIndex}
      </button>

      {/* Previous Performance Hint */}
      <div
        className="w-16 shrink-0 text-[11px] font-mono text-muted-foreground text-center tabular-nums select-none"
        title={
          prevWeight !== undefined && prevReps !== undefined
            ? `Prestazione precedente: ${prevWeight}kg × ${prevReps} reps`
            : 'Nessuna prestazione precedente registrata'
        }
      >
        {prevWeight !== undefined && prevReps !== undefined ? (
          <span className="font-semibold text-muted-foreground/90">
            {prevWeight}kg×{prevReps}
          </span>
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </div>

      {/* Weight Input (kg) */}
      <div className="flex-1 min-w-0">
        <div className="relative">
          <input
            type="number"
            step="0.5"
            min="0"
            inputMode="decimal"
            enterKeyHint="next"
            placeholder={prevWeight !== undefined && prevWeight > 0 ? String(prevWeight) : '0'}
            value={set.weight === 0 ? '' : set.weight}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onUpdate({ weight: isNaN(val) ? 0 : val });
            }}
            className={cn(
              'h-11 w-full rounded border border-input bg-background/80 px-2 text-center font-mono text-base font-semibold text-foreground placeholder:text-muted-foreground/35 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary tabular-nums',
              set.completed && 'text-accent'
            )}
          />
          <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-foreground">
            kg
          </span>
        </div>
      </div>

      {/* Reps Input */}
      <div className="flex-1 min-w-0">
        <div className="relative">
          <input
            type="number"
            step="1"
            min="0"
            inputMode="numeric"
            enterKeyHint="done"
            placeholder={prevReps !== undefined && prevReps > 0 ? String(prevReps) : '0'}
            value={set.reps === 0 ? '' : set.reps}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onUpdate({ reps: isNaN(val) ? 0 : val });
            }}
            className={cn(
              'h-11 w-full rounded border border-input bg-background/80 px-2 text-center font-mono text-base font-semibold text-foreground placeholder:text-muted-foreground/35 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary tabular-nums',
              set.completed && 'text-accent'
            )}
          />
          <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-foreground">
            reps
          </span>
        </div>
      </div>

      {/* Completion Toggle Button (Strict 44x44px Touch Target) */}
      <button
        type="button"
        onClick={onToggleComplete}
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded border transition-all active:scale-95',
          set.completed
            ? 'bg-accent border-accent text-background shadow-xs'
            : 'bg-secondary/70 border-border text-muted-foreground hover:border-accent hover:text-accent'
        )}
        title={set.completed ? 'Set completed' : 'Mark set as completed'}
      >
        <Check
          className={cn('h-5 w-5', set.completed ? 'stroke-[2.5]' : 'stroke-[1.75]')}
        />
      </button>

      {/* Delete Set Button */}
      <button
        type="button"
        onClick={onDelete}
        className="flex h-11 w-8 shrink-0 items-center justify-center text-muted-foreground/50 hover:text-destructive active:text-destructive transition-colors"
        title="Delete set"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}
