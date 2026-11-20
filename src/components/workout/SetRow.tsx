import { WorkoutSet } from '../../types/workout';
import { cn } from '../../lib/utils';

interface SetRowProps {
  setIndex: number;
  set: WorkoutSet;
  prevWeight?: number;
  prevReps?: number;
  fallbackWeight?: number;
  fallbackReps?: number;
  onUpdate: (updated: Partial<WorkoutSet>) => void;
  onToggleComplete: (autoFilled?: { weight: number; reps: number }) => void;
}

export function SetRow({
  setIndex,
  set,
  prevWeight,
  prevReps,
  fallbackWeight,
  fallbackReps,
  onUpdate,
  onToggleComplete,
}: SetRowProps) {
  // Resolve effective fallback values
  const effectivePrevWeight = prevWeight !== undefined && prevWeight > 0 ? prevWeight : fallbackWeight;
  const effectivePrevReps = prevReps !== undefined && prevReps > 0 ? prevReps : fallbackReps;

  const handleApplyPrev = () => {
    if (effectivePrevWeight !== undefined && effectivePrevReps !== undefined) {
      onUpdate({ weight: effectivePrevWeight, reps: effectivePrevReps });
    }
  };

  const handleToggle = () => {
    if (!set.completed) {
      // If weight or reps are unset (0), auto-fill with prev or fallback values
      const autoWeight =
        set.weight > 0
          ? set.weight
          : effectivePrevWeight !== undefined && effectivePrevWeight > 0
          ? effectivePrevWeight
          : 0;

      const autoReps =
        set.reps > 0
          ? set.reps
          : effectivePrevReps !== undefined && effectivePrevReps > 0
          ? effectivePrevReps
          : autoWeight > 0
          ? 8
          : 0;

      onToggleComplete({ weight: autoWeight, reps: autoReps });
    } else {
      onToggleComplete();
    }
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-1.5 py-1 px-1.5 rounded-[2px] transition-colors border',
        set.isWarmup
          ? 'border-dashed border-border/80 bg-secondary/20'
          : 'border-solid border-border bg-card',
        set.completed && 'bg-secondary/40 border-border/90'
      )}
    >
      {/* 1. SET: Warmup [W] or Set Number [01] */}
      <button
        type="button"
        onClick={() => onUpdate({ isWarmup: !set.isWarmup })}
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] text-xs font-bold font-mono transition-colors border select-none tabular-nums',
          set.isWarmup
            ? 'bg-warning/15 text-warning border-warning/50'
            : set.completed
            ? 'bg-secondary text-foreground border-border'
            : 'bg-secondary/70 text-muted-foreground border-border hover:border-accent hover:text-foreground'
        )}
        title={set.isWarmup ? 'Serie di riscaldamento [W]' : 'Serie normale'}
      >
        {set.isWarmup ? '[W]' : `[${String(setIndex).padStart(2, '0')}]`}
      </button>

      {/* 2. PREV: 1-Tap Autofill Button */}
      <div className="w-16 shrink-0 flex items-center justify-center">
        {prevWeight !== undefined && prevReps !== undefined ? (
          <button
            type="button"
            onClick={handleApplyPrev}
            className="w-full h-8 px-1 rounded-[2px] border border-border bg-secondary/60 hover:bg-secondary hover:border-accent active:scale-95 transition-all text-[11px] font-mono font-bold text-foreground tabular-nums select-none truncate text-center"
            title={`Tocca per copiare: ${prevWeight}kg × ${prevReps} reps`}
          >
            {prevWeight}×{prevReps}
          </button>
        ) : fallbackWeight !== undefined && fallbackWeight > 0 && fallbackReps !== undefined ? (
          <button
            type="button"
            onClick={handleApplyPrev}
            className="w-full h-8 px-1 rounded-[2px] border border-dashed border-border/70 bg-secondary/30 hover:bg-secondary hover:border-accent active:scale-95 transition-all text-[11px] font-mono font-medium text-muted-foreground hover:text-foreground tabular-nums select-none truncate text-center"
            title={`Tocca per copiare da serie precedente: ${fallbackWeight}kg × ${fallbackReps} reps`}
          >
            {fallbackWeight}×{fallbackReps}
          </button>
        ) : (
          <span className="text-[11px] font-mono text-muted-foreground/30 tabular-nums select-none text-center">
            —
          </span>
        )}
      </div>

      {/* 3. KG: Weight Input */}
      <div className="flex-1 min-w-0">
        <div className="relative">
          <input
            type="number"
            step="0.5"
            min="0"
            inputMode="decimal"
            enterKeyHint="next"
            placeholder={
              effectivePrevWeight !== undefined && effectivePrevWeight > 0
                ? String(effectivePrevWeight)
                : '0'
            }
            value={set.weight === 0 ? '' : set.weight}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onUpdate({ weight: isNaN(val) ? 0 : val });
            }}
            className="h-10 w-full rounded-[2px] border border-input bg-secondary/80 px-2 pr-6 text-center font-mono text-sm font-bold text-foreground placeholder:text-muted-foreground/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent tabular-nums"
          />
          <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-foreground select-none">
            kg
          </span>
        </div>
      </div>

      {/* 4. REPS: Reps Input */}
      <div className="flex-1 min-w-0">
        <div className="relative">
          <input
            type="number"
            step="1"
            min="0"
            inputMode="numeric"
            enterKeyHint="done"
            placeholder={
              effectivePrevReps !== undefined && effectivePrevReps > 0
                ? String(effectivePrevReps)
                : '0'
            }
            value={set.reps === 0 ? '' : set.reps}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onUpdate({ reps: isNaN(val) ? 0 : val });
            }}
            className="h-10 w-full rounded-[2px] border border-input bg-secondary/80 px-2 pr-6 text-center font-mono text-sm font-bold text-foreground placeholder:text-muted-foreground/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent tabular-nums"
          />
          <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-foreground select-none">
            reps
          </span>
        </div>
      </div>

      {/* 5. DONE: ASCII Tactile Checkbox ([ ] / [x]) with 44x44px touch target */}
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-[2px] border font-mono text-xs font-black transition-all active:scale-95 select-none tracking-tighter',
          set.completed
            ? 'bg-accent/20 border-accent text-accent'
            : 'bg-secondary/70 border-border text-muted-foreground hover:border-accent hover:text-accent'
        )}
        title={set.completed ? 'Serie completata [x]' : 'Segna serie [ ]'}
      >
        <span>{set.completed ? '[x]' : '[ ]'}</span>
      </button>
    </div>
  );
}
