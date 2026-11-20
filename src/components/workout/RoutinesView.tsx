import { useState, useMemo } from 'react';
import {
  Bookmark,
  Plus,
  Play,
  Edit2,
  Trash2,
  Copy,
  Clock,
  Search,
} from 'lucide-react';
import { WorkoutRoutine } from '../../types/workout';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatShortDate, generateId } from '../../lib/utils';

interface RoutinesViewProps {
  routines: WorkoutRoutine[];
  onStartRoutine: (routine: WorkoutRoutine) => void;
  onEditRoutine: (routine: WorkoutRoutine) => void;
  onDeleteRoutine: (routineId: string) => void;
  onSaveRoutine: (routine: WorkoutRoutine) => void;
  onCreateNewRoutine: () => void;
}

export function RoutinesView({
  routines,
  onStartRoutine,
  onEditRoutine,
  onDeleteRoutine,
  onSaveRoutine,
  onCreateNewRoutine,
}: RoutinesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoutines = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return routines;
    return routines.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.exercises.some((e) => e.name.toLowerCase().includes(q) || e.muscleGroup.toLowerCase().includes(q))
    );
  }, [routines, searchQuery]);

  const handleDuplicate = (routine: WorkoutRoutine) => {
    const cloned: WorkoutRoutine = {
      ...routine,
      id: generateId(),
      title: `${routine.title}_COPY`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastPerformedAt: undefined,
    };
    onSaveRoutine(cloned);
  };

  return (
    <div className="flex-1 flex flex-col space-y-3 px-3 pt-3 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-1.5">
          <Bookmark className="h-4 w-4 text-primary" strokeWidth={2} />
          <h2 className="text-xs font-bold font-mono tracking-wider uppercase text-foreground">
            &gt; SCHEDE // BLUEPRINTS ({routines.length})
          </h2>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onCreateNewRoutine}
          className="h-8 px-2.5 text-[10px] font-mono font-bold"
        >
          <Plus className="mr-1 h-3.5 w-3.5" strokeWidth={2} />
          + NUOVA_SCHEDA
        </Button>
      </div>

      {/* Search Filter */}
      {routines.length > 2 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Cerca scheda o esercizio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded border border-input bg-card pl-9 pr-3 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      {/* Routines Empty State */}
      {routines.length === 0 && (
        <div className="rounded border border-dashed border-border bg-card/30 p-8 text-center space-y-2">
          <Bookmark className="mx-auto h-8 w-8 text-muted-foreground/30 mb-1" strokeWidth={1.5} />
          <p className="text-xs font-mono font-bold text-muted-foreground uppercase">
            NESSUNA_SCHEDA_CREATA
          </p>
          <p className="text-[11px] font-mono text-muted-foreground/60 max-w-xs mx-auto">
            Crea la tua prima scheda preimpostata per iniziare ogni allenamento in 1 click.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={onCreateNewRoutine}
            className="text-xs font-mono mt-2"
          >
            <Plus className="mr-1 h-3.5 w-3.5" strokeWidth={2} />
            CREA SCHEDA ORA
          </Button>
        </div>
      )}

      {/* Routines Blueprint Stack */}
      <div className="space-y-3">
        {filteredRoutines.map((routine, idx) => {
          const muscleGroups = Array.from(
            new Set(routine.exercises.map((e) => e.muscleGroup))
          );

          return (
            <div
              key={routine.id}
              className="rounded border border-border bg-card p-3.5 space-y-3 hover:border-primary/50 transition-colors shadow-xs"
            >
              {/* Routine Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono text-muted-foreground font-bold">
                      [0{idx + 1}]
                    </span>
                    <h3 className="text-sm font-bold font-mono text-foreground tracking-tight truncate">
                      {routine.title}
                    </h3>
                    <Badge variant="outline" className="text-[9px] py-0 px-1 border-muted">
                      {routine.exercises.length} ES.
                    </Badge>
                  </div>

                  {routine.description && (
                    <p className="mt-1 text-xs font-mono text-muted-foreground line-clamp-2">
                      {routine.description}
                    </p>
                  )}

                  <div className="mt-1.5 flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                    <span>REST: {routine.defaultRestSeconds ?? 90}s</span>
                    {routine.lastPerformedAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-primary" strokeWidth={2} />
                        {formatShortDate(routine.lastPerformedAt)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions: Duplicate, Edit, Delete */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDuplicate(routine)}
                    className="h-8 w-8 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    title="Duplica scheda"
                  >
                    <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onEditRoutine(routine)}
                    className="h-8 w-8 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    title="Modifica scheda"
                  >
                    <Edit2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteRoutine(routine.id)}
                    className="h-8 w-8 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
                    title="Elimina scheda"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              </div>

              {/* Muscle groups badges */}
              <div className="flex flex-wrap gap-1">
                {muscleGroups.map((mg) => (
                  <Badge
                    key={mg}
                    variant="default"
                    className="text-[9px] py-0 px-1.5 bg-secondary text-muted-foreground border-border uppercase font-mono"
                  >
                    {mg}
                  </Badge>
                ))}
              </div>

              {/* Exercises preview list */}
              <div className="border-t border-border/40 pt-2 space-y-1">
                {routine.exercises.slice(0, 4).map((ex, eIdx) => (
                  <div
                    key={ex.exerciseId + eIdx}
                    className="flex items-center justify-between text-[11px] font-mono text-muted-foreground"
                  >
                    <span className="truncate pr-2">
                      {eIdx + 1}. {ex.name}
                    </span>
                    <span className="text-foreground shrink-0 tabular-nums">
                      {ex.targetSets} serie
                    </span>
                  </div>
                ))}
                {routine.exercises.length > 4 && (
                  <div className="text-[10px] font-mono text-muted-foreground/60 pt-0.5">
                    +{routine.exercises.length - 4} altri esercizi...
                  </div>
                )}
              </div>

              {/* Primary Start Routine Trigger */}
              <div className="pt-1">
                <Button
                  variant="primary"
                  size="default"
                  onClick={() => onStartRoutine(routine)}
                  className="w-full text-xs font-mono font-bold tracking-wider h-11"
                >
                  <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
                  [▸] INIZIA QUESTA SCHEDA
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
