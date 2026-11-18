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
  ChevronDown,
  ChevronUp,
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
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null);

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

  const toggleExpand = (id: string) => {
    setExpandedRoutineId((prev) => (prev === id ? null : id));
  };

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
            SCHEDE_DI_ALLENAMENTO ({routines.length})
          </h2>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onCreateNewRoutine}
          className="h-8 px-2.5 text-[10px] font-mono"
        >
          <Plus className="mr-1 h-3.5 w-3.5" strokeWidth={2} />
          NUOVA_SCHEDA
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
            className="h-10 w-full rounded border border-input bg-card pl-9 pr-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      {/* Routines List */}
      <div className="space-y-3">
        {filteredRoutines.map((routine) => {
          const isExpanded = expandedRoutineId === routine.id;

          // Unique muscle groups in this routine
          const muscleGroups = Array.from(
            new Set(routine.exercises.map((e) => e.muscleGroup))
          );

          return (
            <div
              key={routine.id}
              className="rounded border border-border bg-card p-3.5 space-y-2.5 hover:border-primary/50 transition-colors shadow-xs"
            >
              {/* Routine Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-base font-bold font-mono text-foreground tracking-tight truncate">
                      {routine.title}
                    </h3>
                    <Badge variant="outline" className="text-[9px] py-0 px-1 border-muted">
                      {routine.exercises.length} ESERCIZI
                    </Badge>
                  </div>

                  {routine.description && (
                    <p className="mt-1 text-xs font-mono text-muted-foreground line-clamp-2">
                      {routine.description}
                    </p>
                  )}

                  {routine.lastPerformedAt && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-muted-foreground/80">
                      <Clock className="h-3 w-3 text-primary" strokeWidth={2} />
                      <span>Ultima esecuzione: {formatShortDate(routine.lastPerformedAt)}</span>
                    </div>
                  )}
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
                    variant="outline"
                    className="text-[9px] py-0 px-1.5 border-border bg-secondary/50 capitalize"
                  >
                    {mg}
                  </Badge>
                ))}
              </div>

              {/* Expandable Exercise Details */}
              <div className="border-t border-border/50 pt-2">
                <button
                  type="button"
                  onClick={() => toggleExpand(routine.id)}
                  className="flex w-full items-center justify-between text-[11px] font-mono text-muted-foreground hover:text-foreground py-0.5"
                >
                  <span>
                    {isExpanded ? 'Nascondi dettagli esercizi' : 'Visualizza esercizi e serie target'}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-2 space-y-1.5 animate-in fade-in-50 duration-150">
                    {routine.exercises.map((ex, idx) => (
                      <div
                        key={ex.exerciseId + idx}
                        className="flex items-center justify-between rounded bg-background/70 px-2 py-1.5 text-xs font-mono border border-border/40"
                      >
                        <div className="flex items-center gap-1.5 min-w-0 pr-2">
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            #{(idx + 1).toString().padStart(2, '0')}
                          </span>
                          <span className="font-medium text-foreground truncate">
                            {ex.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 text-[11px] tabular-nums font-semibold text-primary">
                          <span>{ex.targetSets} serie × {ex.defaultReps || 8} rip</span>
                          {ex.defaultWeight !== undefined && ex.defaultWeight > 0 && (
                            <span className="text-accent">({ex.defaultWeight}kg)</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Start Routine Button */}
              <Button
                variant="accent"
                size="lg"
                onClick={() => onStartRoutine(routine)}
                className="w-full text-xs font-mono font-bold tracking-wider h-11"
              >
                <Play className="mr-2 h-4 w-4 fill-current" strokeWidth={0} />
                AVVIA_SCHEDA &gt;
              </Button>
            </div>
          );
        })}

        {filteredRoutines.length === 0 && (
          <div className="rounded border border-dashed border-border bg-card/30 p-8 text-center">
            <Bookmark className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" strokeWidth={1.5} />
            <p className="text-xs font-mono text-muted-foreground">
              NESSUNA_SCHEDA_TROVATA
            </p>
            <p className="text-[11px] font-mono text-muted-foreground/60 mt-1">
              Crea una nuova scheda con i tuoi esercizi preferiti per ripeterla ogni settimana.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={onCreateNewRoutine}
              className="mt-3 text-xs font-mono"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              CREA_PRIMA_SCHEDA
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
