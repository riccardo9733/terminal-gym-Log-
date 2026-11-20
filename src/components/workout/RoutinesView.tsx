import { useState, useMemo } from 'react';
import {
  Clock,
  ChevronRight,
  ChevronDown,
  Edit2,
  Copy,
  Trash2,
} from 'lucide-react';
import { WorkoutRoutine } from '../../types/workout';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AsciiBox } from '../ui/ascii-box';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
} from '../ui/drawer';
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
  const [expandedRoutineIds, setExpandedRoutineIds] = useState<Record<string, boolean>>({});
  const [routineOptionsTarget, setRoutineOptionsTarget] = useState<WorkoutRoutine | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedRoutineIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredRoutines = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q || routines.length < 5) return routines;
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
    <div className="flex-1 flex flex-col space-y-3 px-3 pt-3 pb-24 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/80 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-accent font-bold">&gt;</span>
          <h2 className="text-xs font-bold font-mono tracking-wider uppercase text-foreground">
            SCHEDE // BLUEPRINTS ({routines.length})
          </h2>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onCreateNewRoutine}
          className="h-8 px-2.5 text-[10px] font-mono font-bold"
        >
          [ + NUOVA_SCHEDA ]
        </Button>
      </div>

      {/* Shell Command Input - only shown if routines >= 5 */}
      {routines.length >= 5 && (
        <div className="relative flex items-center border border-border bg-card px-2.5 py-1.5 text-xs rounded-[2px]">
          <span className="text-accent font-bold mr-2 select-none">$ grep</span>
          <input
            type="text"
            placeholder="scheda_o_esercizio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 w-full bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
          />
          <span className="text-accent animate-pulse font-mono select-none">█</span>
        </div>
      )}

      {/* Routines Empty State */}
      {routines.length === 0 && (
        <div className="rounded-[2px] border border-dashed border-border bg-card/30 p-8 text-center space-y-2">
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
            [ + CREA_SCHEDA_ORA ]
          </Button>
        </div>
      )}

      {/* Routines Blueprint Stack */}
      <div className="space-y-3">
        {filteredRoutines.map((routine, idx) => {
          const muscleGroups = Array.from(
            new Set(routine.exercises.map((e) => e.muscleGroup))
          );
          const isExpanded = Boolean(expandedRoutineIds[routine.id]);

          return (
            <AsciiBox
              key={routine.id}
              title={
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-muted-foreground">
                    [{String(idx + 1).padStart(2, '0')}]
                  </span>
                  <span className="text-foreground font-black truncate">
                    {routine.title}
                  </span>
                  <Badge variant="outline" className="text-[9px]">
                    {`${routine.exercises.length} ES.`}
                  </Badge>
                </div>
              }
              action={
                <button
                  type="button"
                  onClick={() => setRoutineOptionsTarget(routine)}
                  className="h-6 px-1.5 rounded-[2px] border border-border bg-secondary/80 text-xs font-mono font-bold text-muted-foreground hover:text-foreground hover:border-accent transition-colors select-none"
                  title="Opzioni scheda"
                >
                  [···]
                </button>
              }
              className="space-y-3 hover:border-accent/60 transition-colors"
            >
              {routine.description && (
                <p className="text-xs font-mono text-muted-foreground line-clamp-2">
                  {routine.description}
                </p>
              )}

              {/* Telemetry info & Muscle tags */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] font-mono text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span>REST: {routine.defaultRestSeconds ?? 90}s</span>
                  {routine.lastPerformedAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-accent" strokeWidth={2} />
                      <span className="tabular-nums">{formatShortDate(routine.lastPerformedAt)}</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {muscleGroups.map((mg) => (
                    <Badge
                      key={mg}
                      variant="outline"
                      className="text-[9px] border-border text-muted-foreground"
                    >
                      {mg.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Accordion: ASCII tree of exercises */}
              <div className="border-t border-border/50 pt-2 space-y-1">
                <button
                  type="button"
                  onClick={() => toggleExpand(routine.id)}
                  className="flex items-center gap-1 text-[11px] font-mono text-accent hover:underline select-none"
                >
                  {isExpanded ? (
                    <>
                      <ChevronDown className="h-3.5 w-3.5" />
                      <span>▾ Nascondi esercizi e serie target</span>
                    </>
                  ) : (
                    <>
                      <ChevronRight className="h-3.5 w-3.5" />
                      <span>▸ Visualizza esercizi e serie target</span>
                    </>
                  )}
                </button>

                {isExpanded && (
                  <div className="pt-1.5 font-mono text-xs text-muted-foreground space-y-1 pl-1 border-l border-border/40 ml-1.5">
                    {routine.exercises.map((ex, eIdx, arr) => {
                      const isLast = eIdx === arr.length - 1;
                      const prefix = isLast ? '└─' : '├─';
                      return (
                        <div key={ex.exerciseId + eIdx} className="flex items-center justify-between text-[11px] truncate">
                          <div className="truncate pr-2">
                            <span className="text-accent mr-1.5 select-none">{prefix}</span>
                            <span className="text-foreground font-semibold">{ex.name}</span>
                            <span className="text-muted-foreground/60 text-[10px] ml-1">
                              ({ex.muscleGroup})
                            </span>
                          </div>
                          <div className="shrink-0 tabular-nums text-[10px] text-muted-foreground">
                            {ex.targetSets}×{ex.defaultReps}
                            {ex.defaultWeight ? ` @ ${ex.defaultWeight}kg` : ''}
                            {ex.restSeconds ? ` [REST: ${ex.restSeconds}s]` : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Primary Start Routine Action */}
              <div className="pt-1">
                <Button
                  variant="primary"
                  size="default"
                  onClick={() => onStartRoutine(routine)}
                  className="w-full text-xs font-mono font-bold tracking-wider h-11"
                >
                  [ ▶ AVVIA_SCHEDA ↵ ]
                </Button>
              </div>
            </AsciiBox>
          );
        })}
      </div>

      {/* Routine Options Drawer */}
      <Drawer
        open={Boolean(routineOptionsTarget)}
        onOpenChange={(open) => !open && setRoutineOptionsTarget(null)}
      >
        <DrawerContent className="max-h-[85dvh]">
          <DrawerHeader>
            <DrawerTitle className="font-mono text-sm uppercase">
              {routineOptionsTarget?.title} // OPZIONI
            </DrawerTitle>
            <DrawerDescription className="font-mono text-xs">
              {routineOptionsTarget?.exercises.length} ESERCIZI PREIMPOSTATI
            </DrawerDescription>
          </DrawerHeader>

          <DrawerBody className="space-y-2 font-mono">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (routineOptionsTarget) {
                  const target = routineOptionsTarget;
                  setRoutineOptionsTarget(null);
                  onEditRoutine(target);
                }
              }}
              className="w-full h-11 text-xs justify-start"
            >
              <Edit2 className="mr-2 h-4 w-4" />
              [ MODIFICA SCHEDA ]
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (routineOptionsTarget) {
                  const target = routineOptionsTarget;
                  setRoutineOptionsTarget(null);
                  handleDuplicate(target);
                }
              }}
              className="w-full h-11 text-xs justify-start"
            >
              <Copy className="mr-2 h-4 w-4" />
              [ DUPLICA SCHEDA ]
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (routineOptionsTarget) {
                  const targetId = routineOptionsTarget.id;
                  setRoutineOptionsTarget(null);
                  onDeleteRoutine(targetId);
                }
              }}
              className="w-full h-11 text-xs justify-start text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              [ ✕ ELIMINA SCHEDA ]
            </Button>
          </DrawerBody>

          <DrawerFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRoutineOptionsTarget(null)}
            >
              [ CHIUDI ]
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
