import { useState } from 'react';
import {
  Calendar,
  Clock,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { WorkoutSession } from '../../types/workout';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatDate, formatDuration } from '../../lib/utils';

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

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="flex-1 flex flex-col space-y-3 px-3 pt-3 pb-24">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-primary" strokeWidth={2} />
          <h2 className="text-xs font-bold font-mono tracking-wider uppercase text-foreground">
            WORKOUT_LOGS ({history.length})
          </h2>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="rounded border border-dashed border-border bg-card/30 p-8 text-center">
          <Calendar className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" strokeWidth={1.5} />
          <p className="text-xs font-mono text-muted-foreground">NO_LOGGED_WORKOUTS_YET</p>
          <p className="text-[11px] font-mono text-muted-foreground/50 mt-1">
            Complete and finish a workout session to see your logged history here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {history.map((workout) => {
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
                      <span>{totalSets} sets</span>
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

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-border/60 bg-background/50 p-3 space-y-3 animate-in fade-in-50 duration-150">
                    <div className="space-y-2">
                      {workout.exercises.map((ex, eIdx) => (
                        <div
                          key={ex.id || eIdx}
                          className="rounded border border-border/50 bg-card/60 p-2 text-xs font-mono"
                        >
                          <div className="flex items-center justify-between font-semibold text-foreground pb-1 border-b border-border/30">
                            <span>{ex.name}</span>
                            <span className="text-[10px] text-muted-foreground capitalize">
                              {ex.muscleGroup}
                            </span>
                          </div>

                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {ex.sets
                              .filter((s) => s.completed)
                              .map((set, sIdx) => (
                                <span
                                  key={set.id || sIdx}
                                  className="rounded bg-secondary/80 px-1.5 py-0.5 text-[10px] font-mono text-foreground border border-border/40 tabular-nums"
                                >
                                  {set.weight}kg × {set.reps}
                                </span>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteWorkout(workout.id)}
                        className="text-[10px] h-8 px-2"
                      >
                        <Trash2 className="mr-1 h-3 w-3" strokeWidth={1.75} />
                        DELETE_LOG
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onStartFromTemplate(workout)}
                        className="text-[10px] h-8 px-3 font-mono font-bold"
                      >
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
                        USE_AS_TEMPLATE
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
