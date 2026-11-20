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
        'group flex items-center gap-1.5 py-1 px-1.5 rounded border transition-colors',
        set.completed
          ? 'bg-secondary/40 border-border'
          : set.isWarmup
          ? 'bg-secondary/20 border-dashed border-border'
          : 'bg-card border-border'
      )}
    >
      {/* 1. SET: Set Number / Warmup Toggle Button */}
      <button
        type="button"
        onClick={() => onUpdate({ isWarmup: !set.isWarmup })}
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded text-xs font-bold font-mono transition-colors border select-none',
          set.isWarmup
            ? 'bg-warning/15 text-warning border-warning/50'
            : set.completed
            ? 'bg-secondary text-foreground border-border'
            : 'bg-secondary/70 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
        )}
        title={set.isWarmup ? 'Serie di riscaldamento (clicca per serie normale)' : 'Serie normale (clicca per serie warmup)'}
      >
        {set.isWarmup ? 'W' : String(setIndex).padStart(2, '0')}
      </button>

      {/* 2. PREV: Previous Performance Reference */}
      <div
        className="w-16 shrink-0 text-[11px] font-mono text-center tabular-nums select-none truncate px-1"
        title={
          prevWeight !== undefined && prevReps !== undefined
            ? `Prestazione precedente: ${prevWeight}kg × ${prevReps} reps`
            : 'Nessuna prestazione precedente'
        }
      >
        {prevWeight !== undefined && prevReps !== undefined ? (
          <span className="font-semibold text-muted-foreground">
            {prevWeight}×{prevReps}
          </span>
        ) : (
          <span className="text-muted-foreground/30">—</span>
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
            placeholder={prevWeight !== undefined && prevWeight > 0 ? String(prevWeight) : '0'}
            value={set.weight === 0 ? '' : set.weight}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onUpdate({ weight: isNaN(val) ? 0 : val });
            }}
            className="h-10 w-full rounded border border-input bg-secondary px-2 pr-6 text-center font-mono text-base font-bold text-foreground placeholder:text-muted-foreground/35 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary tabular-nums"
          />
          <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-foreground">
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
            placeholder={prevReps !== undefined && prevReps > 0 ? String(prevReps) : '0'}
            value={set.reps === 0 ? '' : set.reps}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onUpdate({ reps: isNaN(val) ? 0 : val });
            }}
            className="h-10 w-full rounded border border-input bg-secondary px-2 pr-6 text-center font-mono text-base font-bold text-foreground placeholder:text-muted-foreground/35 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary tabular-nums"
          />
          <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-foreground">
            reps
          </span>
        </div>
      </div>

      {/* 5. DONE: Tactile Completion Checkbox (Strict 44x44px Touch Target) */}
      <button
        type="button"
        onClick={onToggleComplete}
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded border transition-all active:scale-95 select-none',
          set.completed
            ? 'bg-accent border-accent text-accent-foreground font-black shadow-xs'
            : 'bg-secondary/80 border-border text-muted-foreground hover:border-accent hover:text-accent'
        )}
        title={set.completed ? 'Serie completata' : 'Segna serie completata'}
      >
        <Check
          className={cn('h-5 w-5', set.completed ? 'stroke-[3]' : 'stroke-[1.75]')}
        />
      </button>

      {/* Delete Set Button */}
      <button
        type="button"
        onClick={onDelete}
        className="flex h-11 w-7 shrink-0 items-center justify-center text-muted-foreground/30 hover:text-destructive active:text-destructive transition-colors"
        title="Elimina serie"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
    </div>
  );
}
