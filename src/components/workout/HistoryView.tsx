import { useState, useMemo } from 'react';
import {
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { WorkoutSession, MuscleGroup } from '../../types/workout';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AsciiBox } from '../ui/ascii-box';
import { formatDate, formatDuration } from '../../lib/utils';
import { ExerciseHistoryDrawer } from './ExerciseHistoryDrawer';
import { getExerciseHistory, ExerciseHistorySummary } from '../../services/exerciseHistoryService';

interface HistoryViewProps {
  history: WorkoutSession[];
  onStartFromTemplate: (workout: WorkoutSession) => void;
  onDeleteWorkout: (workoutId: string) => void;
}

export function HistoryView({
  history,
  onStartFromTemplate,
  onDeleteWorkout,
}: HistoryViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedExerciseSummary, setSelectedExerciseSummary] = useState<ExerciseHistorySummary | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return history;
    return history.filter(
      (w) =>
        w.title.toLowerCase().includes(q) ||
        w.exercises.some((e) => e.name.toLowerCase().includes(q) || e.muscleGroup.toLowerCase().includes(q))
    );
  }, [history, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleOpenExerciseHistory = (exerciseId: string, name: string, muscle: MuscleGroup) => {
    const summary = getExerciseHistory(exerciseId, history, name, muscle);
    setSelectedExerciseSummary(summary);
    setDrawerOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col space-y-3 px-3 pt-3 pb-24 font-mono">
      {/* Header with Machine Ticker */}
      <div className="flex items-center justify-between border-b border-border/80 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-accent font-bold">&gt;</span>
          <h2 className="text-xs font-bold font-mono tracking-wider uppercase text-foreground">
            LOGSTREAM // ALL SESSIONS ({history.length})
          </h2>
        </div>
      </div>

      {/* Search Filter */}
      {history.length > 1 && (
        <div className="relative flex items-center border border-border bg-card px-2.5 py-1.5 text-xs rounded-[2px]">
          <span className="text-accent font-bold mr-2 select-none">$ grep</span>
          <input
            type="text"
            placeholder="data_o_esercizio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 w-full bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
          />
          <span className="text-accent animate-pulse font-mono select-none">█</span>
        </div>
      )}

      {history.length === 0 ? (
        <div className="rounded-[2px] border border-dashed border-border bg-card/30 p-8 text-center space-y-1.5">
          <p className="text-xs font-mono font-bold text-muted-foreground uppercase">
            NESSUNA_SESSIONE_REGISTRATA
          </p>
          <p className="text-[11px] font-mono text-muted-foreground/60">
            Concludi e salva un allenamento per consultare qui lo storico dettagliato.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((workout) => {
            const isExpanded = expandedId === workout.id;
            const durationSec = workout.endedAt
              ? Math.max(0, Math.floor((workout.endedAt - workout.startedAt) / 1000))
              : 0;

            const totalSets = workout.exercises.reduce(
              (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
              0
            );

            const totalVolume = workout.exercises.reduce((acc, ex) => {
              return (
                acc +
                ex.sets
                  .filter((s) => s.completed)
                  .reduce((sAcc, s) => sAcc + s.weight * s.reps, 0)
              );
            }, 0);

            const dateStr = formatDate(workout.startedAt).split(' ')[0];

            return (
              <AsciiBox
                key={workout.id}
                title={
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-muted-foreground">LOG</span>
                    <span className="text-foreground font-black truncate">
                      {workout.title}
                    </span>
                    <Badge variant="outline" className="text-[9px]">
                      {dateStr}
                    </Badge>
                  </div>
                }
                status={
                  <button
                    onClick={() => toggleExpand(workout.id)}
                    className="flex items-center gap-1 text-[10px] text-accent font-bold hover:underline"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronDown className="h-3 w-3" />
                        <span>[COLLAPSE]</span>
                      </>
                    ) : (
                      <>
                        <ChevronRight className="h-3 w-3" />
                        <span>[EXPAND]</span>
                      </>
                    )}
                  </button>
                }
                className="space-y-2 hover:border-accent/60 transition-colors"
              >
                {/* Telemetry bar */}
                <div
                  onClick={() => toggleExpand(workout.id)}
                  className="flex items-center justify-between text-[11px] font-mono text-muted-foreground cursor-pointer select-none tabular-nums flex-wrap gap-2 pt-0.5"
                >
                  <div className="flex items-center gap-3">
                    <span>⏱ {formatDuration(durationSec)}</span>
                    <span>{totalSets} serie</span>
                    <span className="text-foreground font-semibold">
                      {totalVolume.toLocaleString()}kg
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/60">
                    {workout.exercises.length} movimenti
                  </span>
                </div>

                {/* Collapsed quick tree preview */}
                {!isExpanded && (
                  <div className="font-mono text-xs text-muted-foreground space-y-0.5 pt-1 border-t border-border/40">
                    {workout.exercises.slice(0, 3).map((ex, eIdx, arr) => {
                      const isLast = eIdx === arr.length - 1 && workout.exercises.length <= 3;
                      const prefix = isLast ? '└─' : '├─';
                      return (
                        <div key={ex.id || eIdx} className="truncate text-[11px]">
                          <span className="text-accent/60 mr-1.5 select-none">{prefix}</span>
                          <span className="text-foreground">{ex.name}</span>
                          <span className="text-muted-foreground/60 text-[10px] ml-1">
                            ({ex.muscleGroup})
                          </span>
                        </div>
                      );
                    })}
                    {workout.exercises.length > 3 && (
                      <div className="text-[10px] text-muted-foreground/60 pl-3">
                        └─ +{workout.exercises.length - 3} altri movimenti...
                      </div>
                    )}
                  </div>
                )}

                {/* Expanded ASCII Tree Details */}
                {isExpanded && (
                  <div className="border-t border-border/60 pt-2 space-y-2.5 animate-in fade-in duration-150">
                    <div className="space-y-1.5 font-mono text-xs">
                      {workout.exercises.map((ex, eIdx) => {
                        const isLast = eIdx === workout.exercises.length - 1;
                        const treeSymbol = isLast ? '└─' : '├─';
                        const completedCount = ex.sets.filter((s) => s.completed).length;

                        return (
                          <div
                            key={ex.id || eIdx}
                            className="rounded-[2px] border border-border/40 bg-secondary/30 p-2 text-xs font-mono space-y-1.5 hover:border-accent/40 transition-colors"
                          >
                            <div
                              onClick={() => handleOpenExerciseHistory(ex.exerciseId, ex.name, ex.muscleGroup)}
                              className="flex items-center justify-between font-semibold text-foreground cursor-pointer group"
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="text-accent select-none font-bold">
                                  {treeSymbol}
                                </span>
                                <span className="group-hover:text-accent transition-colors truncate">
                                  {ex.name}
                                </span>
                              </div>
                              <span className="text-[10px] text-muted-foreground uppercase shrink-0 tabular-nums">
                                [{completedCount} SERIE]
                              </span>
                            </div>

                            {/* Sets breakdown */}
                            <div className="flex flex-wrap gap-1 pl-4">
                              {ex.sets
                                .filter((s) => s.completed)
                                .map((set, sIdx) => (
                                  <span
                                    key={set.id || sIdx}
                                    className="rounded-[2px] bg-secondary/80 px-1.5 py-0.5 text-[10px] font-mono text-foreground border border-border/60 tabular-nums"
                                  >
                                    {set.weight}kg × {set.reps}
                                  </span>
                                ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteWorkout(workout.id)}
                        className="text-[10px] h-8 px-2 font-mono"
                      >
                        [ ✕ ELIMINA ]
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onStartFromTemplate(workout)}
                        className="text-[10px] h-8 px-3 font-mono font-bold"
                      >
                        [ ↻ RIPETI_SESSIONE ]
                      </Button>
                    </div>
                  </div>
                )}
              </AsciiBox>
            );
          })}
        </div>
      )}

      {/* Exercise Progression History Drawer */}
      <ExerciseHistoryDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        historySummary={selectedExerciseSummary}
      />
    </div>
  );
}
