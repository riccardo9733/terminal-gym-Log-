import { useState, useMemo } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Edit2,
  Copy,
  Trash2,
} from 'lucide-react';
import { WorkoutRoutine, WorkoutSession } from '../../types/workout';
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
import { generateId } from '../../lib/utils';
import { getRoutineAnalytics, RoutineAnalytics } from '../../services/statsService';
import { formatDelta } from '../../lib/asciiStats';

interface RoutinesViewProps {
  routines: WorkoutRoutine[];
  history?: WorkoutSession[];
  onStartRoutine: (routine: WorkoutRoutine) => void;
  onEditRoutine: (routine: WorkoutRoutine) => void;
  onDeleteRoutine: (routineId: string) => void;
  onSaveRoutine: (routine: WorkoutRoutine) => void;
  onCreateNewRoutine: () => void;
}

export function RoutinesView({
  routines,
  history = [],
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

  // Compute analytics map for routines
  const analyticsMap = useMemo(() => {
    const map: Record<string, RoutineAnalytics> = {};
    routines.forEach((r) => {
      map[r.id] = getRoutineAnalytics(r, history);
    });
    return map;
  }, [routines, history]);

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

  const selectedTargetAnalytics = routineOptionsTarget ? analyticsMap[routineOptionsTarget.id] : null;

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
          const isExpanded = Boolean(expandedRoutineIds[routine.id]);
          const analytics = analyticsMap[routine.id];

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
              className="space-y-2.5 hover:border-accent/60 transition-colors"
            >
              {routine.description && (
                <p className="text-xs font-mono text-muted-foreground line-clamp-2">
                  {routine.description}
                </p>
              )}

              {/* Blueprint Telemetry bar */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] font-mono text-muted-foreground bg-secondary/20 p-1.5 rounded-[2px]">
                <div className="flex items-center gap-2.5">
                  <span className="text-foreground font-semibold">
                    {analytics?.plannedSetsTotal || 0} serie target
                  </span>
                  <span>REST: {routine.defaultRestSeconds ?? 90}s</span>
                </div>

                {analytics && analytics.executionCount > 0 ? (
                  <div className="flex items-center gap-2 text-[10px] tabular-nums">
                    <span>EXEC: <strong className="text-foreground">{analytics.executionCount}x</strong></span>
                    {analytics.avgDurationMinutes > 0 && (
                      <span>DURATA: ~{analytics.avgDurationMinutes}m</span>
                    )}
                    {analytics.tonnageProgressionDeltaPercent !== undefined && (
                      <span
                        className={`font-bold ${
                          analytics.tonnageProgressionDeltaPercent > 0
                            ? 'text-accent'
                            : analytics.tonnageProgressionDeltaPercent < 0
                            ? 'text-destructive'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {formatDelta(analytics.tonnageProgressionDeltaPercent, { isPercent: true }).text}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[9px] text-muted-foreground/60">
                    NON ANCORA ESEGUITA
                  </span>
                )}
              </div>

              {/* Muscle distribution compact pill list */}
              {analytics && analytics.plannedMuscleSplit.length > 0 && (
                <div className="flex flex-wrap gap-1 items-center text-[9px] font-mono">
                  <span className="text-muted-foreground text-[8px] uppercase font-bold mr-1 select-none">
                    SPLIT:
                  </span>
                  {analytics.plannedMuscleSplit.map((split) => (
                    <span
                      key={split.muscleGroup}
                      className="border border-border/80 bg-secondary/40 px-1 py-0.5 rounded-[2px] text-muted-foreground"
                    >
                      <strong className="text-foreground uppercase">{split.muscleGroup}</strong> [{split.sets}s]
                    </span>
                  ))}
                </div>
              )}

              {/* Accordion: ASCII tree of exercises */}
              <div className="border-t border-border/50 pt-1.5 space-y-1">
                <button
                  type="button"
                  onClick={() => toggleExpand(routine.id)}
                  className="flex items-center gap-1 text-[11px] font-mono text-accent hover:underline select-none"
                >
                  {isExpanded ? (
                    <>
                      <ChevronDown className="h-3.5 w-3.5" />
                      <span>▾ Nascondi dettagli esercizi</span>
                    </>
                  ) : (
                    <>
                      <ChevronRight className="h-3.5 w-3.5" />
                      <span>▸ Visualizza dettagli ({routine.exercises.length} movimenti)</span>
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

      {/* Routine Detail & Options Bottom Drawer */}
      <Drawer
        open={Boolean(routineOptionsTarget)}
        onOpenChange={(open) => !open && setRoutineOptionsTarget(null)}
      >
        <DrawerContent className="max-h-[85dvh] font-mono">
          <DrawerHeader>
            <DrawerTitle className="font-mono text-sm uppercase">
              {routineOptionsTarget?.title} // OPZIONI
            </DrawerTitle>
            <DrawerDescription className="font-mono text-xs">
              {routineOptionsTarget?.exercises.length} ESERCIZI PREIMPOSTATI
            </DrawerDescription>
          </DrawerHeader>

          <DrawerBody className="space-y-3 font-mono">
            {/* Telemetry specs pane */}
            {selectedTargetAnalytics && (
              <div className="border border-border bg-secondary/20 p-2.5 rounded-[2px] space-y-2">
                <div className="text-[10px] font-mono font-bold uppercase text-foreground border-b border-border/40 pb-1">
                  ┌─[ TELEMETRIA SCHEDA // BLUEPRINT METRICS ]
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                  <div className="border border-border bg-card p-1.5 rounded-[2px]">
                    <div className="text-[8px] text-muted-foreground uppercase">SERIE TOT</div>
                    <div className="text-xs font-black text-foreground tabular-nums">
                      {selectedTargetAnalytics.plannedSetsTotal}
                    </div>
                  </div>
                  <div className="border border-border bg-card p-1.5 rounded-[2px]">
                    <div className="text-[8px] text-muted-foreground uppercase">ESECUZIONI</div>
                    <div className="text-xs font-black text-foreground tabular-nums">
                      {selectedTargetAnalytics.executionCount}x
                    </div>
                  </div>
                  <div className="border border-border bg-card p-1.5 rounded-[2px]">
                    <div className="text-[8px] text-muted-foreground uppercase">DURATA MED</div>
                    <div className="text-xs font-black text-foreground tabular-nums">
                      {selectedTargetAnalytics.avgDurationMinutes > 0
                        ? `${selectedTargetAnalytics.avgDurationMinutes}m`
                        : '—'}
                    </div>
                  </div>
                </div>

                {/* Muscle Split Bars */}
                {selectedTargetAnalytics.plannedMuscleSplit.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="text-[9px] text-muted-foreground font-bold uppercase">
                      DISTRETTO MUSCOLARE TARGET
                    </div>
                    <div className="space-y-1 text-[10px]">
                      {selectedTargetAnalytics.plannedMuscleSplit.map((s) => (
                        <div key={s.muscleGroup} className="flex items-center justify-between">
                          <span className="w-16 truncate uppercase text-foreground font-semibold text-[9px]">
                            {s.muscleGroup}
                          </span>
                          <span className="text-accent font-black tracking-widest text-[9px] mx-1">
                            {s.asciiBar}
                          </span>
                          <span className="text-[9px] tabular-nums font-bold text-foreground">
                            {s.sets} serie
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions list */}
            <div className="space-y-1.5 pt-1">
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
            </div>
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
