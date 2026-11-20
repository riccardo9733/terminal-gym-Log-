import { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Trash2,
  TrendingUp,
  Search,
} from 'lucide-react';
import { WorkoutSession, MuscleGroup } from '../../types/workout';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
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
    <div className="flex-1 flex flex-col space-y-3 px-3 pt-3 pb-24">
      {/* Header with Machine Ticker */}
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-primary" strokeWidth={2} />
          <h2 className="text-xs font-bold font-mono tracking-wider uppercase text-foreground">
            &gt; LOGS // ALL SESSIONS ({history.length})
          </h2>
        </div>
      </div>

      {/* Search Filter when history has items */}
      {history.length > 2 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Cerca per data o esercizio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded border border-input bg-card pl-9 pr-3 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      {history.length === 0 ? (
        <div className="rounded border border-dashed border-border bg-card/30 p-8 text-center space-y-1.5">
          <Calendar className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" strokeWidth={1.5} />
          <p className="text-xs font-mono font-bold text-muted-foreground uppercase">
            NESSUNA_SESSIONE_REGISTRATA
          </p>
          <p className="text-[11px] font-mono text-muted-foreground/60">
            Concludi e salva un allenamento per consultare qui lo storico dettagliato.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
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

            return (
              <div
                key={workout.id}
                className="rounded border border-border bg-card transition-all overflow-hidden"
              >
                {/* Header item */}
                <div
                  onClick={() => toggleExpand(workout.id)}
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-secondary/40 select-none transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold font-mono text-foreground truncate">
                        {workout.title}
                      </span>
                      <Badge variant="outline" className="text-[9px] py-0 px-1 border-muted">
                        {formatDate(workout.startedAt).split(' ')[0]}
                      </Badge>
                    </div>

                    <div className="mt-1 flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-primary" strokeWidth={2} />
                        {formatDuration(durationSec)}
                      </span>
                      <span>{totalSets} serie</span>
                      <span className="text-foreground font-semibold">
                        {totalVolume.toLocaleString()}kg
                      </span>
                    </div>
                  </div>

                  <div className="text-muted-foreground">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" strokeWidth={2} />
                    ) : (
                      <ChevronRight className="h-4 w-4" strokeWidth={2} />
                    )}
                  </div>
                </div>

                {/* Expanded ASCII Tree Details */}
                {isExpanded && (
                  <div className="border-t border-border/60 bg-background/60 p-3 space-y-3 animate-in fade-in duration-150">
                    <div className="space-y-1.5 font-mono text-xs">
                      {workout.exercises.map((ex, eIdx) => {
                        const isLast = eIdx === workout.exercises.length - 1;
                        const treeSymbol = isLast ? '└─' : '├─';
                        const completedCount = ex.sets.filter((s) => s.completed).length;

                        return (
                          <div
                            key={ex.id || eIdx}
                            className="rounded border border-border/40 bg-card/60 p-2 text-xs font-mono space-y-1.5 hover:border-primary/40 transition-colors"
                          >
                            <div
                              onClick={() => handleOpenExerciseHistory(ex.exerciseId, ex.name, ex.muscleGroup)}
                              className="flex items-center justify-between font-semibold text-foreground cursor-pointer group"
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="text-muted-foreground/60 select-none font-bold">
                                  {treeSymbol}
                                </span>
                                <span className="group-hover:text-primary transition-colors truncate">
                                  {ex.name}
                                </span>
                                <TrendingUp className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <span className="text-[10px] text-muted-foreground uppercase shrink-0">
                                {completedCount} serie
                              </span>
                            </div>

                            {/* Sets breakdown */}
                            <div className="flex flex-wrap gap-1 pl-4">
                              {ex.sets
                                .filter((s) => s.completed)
                                .map((set, sIdx) => (
                                  <span
                                    key={set.id || sIdx}
                                    className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-mono text-foreground border border-border/40 tabular-nums"
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
                        <Trash2 className="mr-1 h-3 w-3" strokeWidth={1.75} />
                        ELIMINA
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onStartFromTemplate(workout)}
                        className="text-[10px] h-8 px-3 font-mono font-bold"
                      >
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
                        RIPETI_SESSIONE
                      </Button>
                    </div>
                  </div>
                )}
              </div>
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
