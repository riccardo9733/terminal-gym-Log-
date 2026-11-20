import { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  MessageSquare,
  Trophy,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { WorkoutExercise, WorkoutSet } from '../../types/workout';
import { SetRow } from './SetRow';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { generateId } from '../../lib/utils';

interface ExerciseCardProps {
  exerciseIndex: number;
  totalExercises: number;
  exercise: WorkoutExercise;
  bestWeight?: number;
  lastPerformanceSets?: Array<{ weight: number; reps: number; isWarmup?: boolean }>;
  onOpenHistory?: () => void;
  onUpdateExercise: (updated: Partial<WorkoutExercise>) => void;
  onRemoveExercise: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSetCompleted: (exercise: WorkoutExercise, set: WorkoutSet) => void;
}

const REST_PRESETS = [45, 60, 90, 120, 150, 180];

export function ExerciseCard({
  exerciseIndex,
  totalExercises,
  exercise,
  bestWeight,
  lastPerformanceSets,
  onOpenHistory,
  onUpdateExercise,
  onRemoveExercise,
  onMoveUp,
  onMoveDown,
  onSetCompleted,
}: ExerciseCardProps) {
  const [showNotes, setShowNotes] = useState(Boolean(exercise.notes));

  const handleCycleRest = () => {
    const current = exercise.restSeconds || 90;
    const currentIndex = REST_PRESETS.indexOf(current);
    const next =
      currentIndex === -1 || currentIndex === REST_PRESETS.length - 1
        ? REST_PRESETS[0]
        : REST_PRESETS[currentIndex + 1];
    onUpdateExercise({ restSeconds: next });
  };

  const handleAddSet = () => {
    const nextSetIdx = exercise.sets.length;
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const prevWorkoutSet =
      lastPerformanceSets?.[nextSetIdx] ||
      (lastPerformanceSets && lastPerformanceSets.length > 0
        ? lastPerformanceSets[lastPerformanceSets.length - 1]
        : undefined);

    const defaultWeight =
      lastSet && lastSet.weight > 0
        ? lastSet.weight
        : prevWorkoutSet && prevWorkoutSet.weight > 0
        ? prevWorkoutSet.weight
        : bestWeight || 0;

    const defaultReps =
      lastSet && lastSet.reps > 0
        ? lastSet.reps
        : prevWorkoutSet && prevWorkoutSet.reps > 0
        ? prevWorkoutSet.reps
        : 8;

    const newSet: WorkoutSet = {
      id: generateId(),
      weight: defaultWeight,
      reps: defaultReps,
      completed: false,
    };

    onUpdateExercise({
      sets: [...exercise.sets, newSet],
    });
  };

  const handleUpdateSet = (setId: string, patch: Partial<WorkoutSet>) => {
    onUpdateExercise({
      sets: exercise.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
    });
  };

  const handleToggleComplete = (set: WorkoutSet) => {
    const nextCompleted = !set.completed;
    const completedAt = nextCompleted ? Date.now() : undefined;
    const updatedSet: WorkoutSet = {
      ...set,
      completed: nextCompleted,
      completedAt,
    };

    onUpdateExercise({
      sets: exercise.sets.map((s) => (s.id === set.id ? updatedSet : s)),
    });

    if (nextCompleted) {
      onSetCompleted(exercise, updatedSet);
    }
  };

  const handleDeleteSet = (setId: string) => {
    onUpdateExercise({
      sets: exercise.sets.filter((s) => s.id !== setId),
    });
  };

  return (
    <div className="rounded border border-border bg-card p-3 shadow-xs space-y-2.5">
      {/* Exercise Card Header */}
      <div className="flex items-start justify-between gap-2 border-b border-border/50 pb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-muted-foreground font-bold">
              #{(exerciseIndex + 1).toString().padStart(2, '0')}
            </span>
            <h3
              onClick={onOpenHistory}
              className={`text-sm font-bold font-mono text-foreground tracking-tight truncate ${
                onOpenHistory ? 'cursor-pointer hover:text-primary transition-colors' : ''
              }`}
              title={onOpenHistory ? 'Tocca per aprire lo storico e la progressione' : undefined}
            >
              {exercise.name}
            </h3>
            <Badge variant="outline" className="text-[9px] py-0 px-1 border-border text-muted-foreground">
              {exercise.muscleGroup}
            </Badge>
          </div>

          {/* Subheader Badges & Controls */}
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            {bestWeight !== undefined && bestWeight > 0 && (
              <div className="flex items-center gap-1 text-[10px] font-mono text-accent">
                <Trophy className="h-3 w-3" strokeWidth={2} />
                <span>PR: {bestWeight}kg</span>
              </div>
            )}

            {onOpenHistory && (
              <button
                type="button"
                onClick={onOpenHistory}
                className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground bg-secondary/80 hover:bg-secondary border border-border rounded px-1.5 py-0.5 active:scale-95 transition-all"
                title="Visualizza storico serie e progressione"
              >
                <TrendingUp className="h-3 w-3 text-muted-foreground" strokeWidth={1.75} />
                <span>HIST</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCycleRest}
              className="flex items-center gap-1 text-[10px] font-mono text-warning/90 hover:text-warning bg-warning/10 hover:bg-warning/20 border border-warning/30 rounded px-1.5 py-0.5 active:scale-95 transition-all"
              title="Cambia tempo recupero (45s, 60s, 90s, 120s, 150s, 180s)"
            >
              <Timer className="h-3 w-3 text-warning" strokeWidth={2} />
              <span>REST: {exercise.restSeconds || 90}s</span>
            </button>
          </div>
        </div>

        {/* Action Controls: Move Up/Down, Notes, Delete */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            disabled={exerciseIndex === 0}
            onClick={onMoveUp}
            className="h-8 w-8 flex items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
            title="Sposta su"
          >
            <ChevronUp className="h-4 w-4" strokeWidth={1.75} />
          </button>

          <button
            type="button"
            disabled={exerciseIndex === totalExercises - 1}
            onClick={onMoveDown}
            className="h-8 w-8 flex items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
            title="Sposta giù"
          >
            <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
          </button>

          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className={`h-8 w-8 flex items-center justify-center rounded transition-colors ${
              exercise.notes || showNotes
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Note esercizio"
          >
            <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>

          <button
            type="button"
            onClick={onRemoveExercise}
            className="h-8 w-8 flex items-center justify-center rounded text-muted-foreground hover:text-destructive transition-colors"
            title="Rimuovi esercizio"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Optional Exercise Notes Input */}
      {showNotes && (
        <div className="rounded border border-border bg-secondary/60 p-2 space-y-1">
          <div className="text-[10px] font-mono text-muted-foreground uppercase font-semibold">
            NOTE_ESERCIZIO:
          </div>
          <input
            type="text"
            placeholder="Es: RPE 8, inclinata a 30°, presa stretta..."
            value={exercise.notes || ''}
            onChange={(e) => onUpdateExercise({ notes: e.target.value })}
            className="w-full bg-background border border-input rounded px-2 py-1 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary"
          />
        </div>
      )}

      {/* Rigorous SET | PREV | KG | REPS | DONE Header */}
      <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border/40 select-none">
        <span className="w-9 text-center">SET</span>
        <span className="w-16 text-center">PREV</span>
        <span className="flex-1 text-center">KG</span>
        <span className="flex-1 text-center">REPS</span>
        <span className="w-11 text-center">DONE</span>
        <span className="w-7"></span>
      </div>

      {/* Set Rows Stack */}
      <div className="space-y-1.5">
        {exercise.sets.map((set, sIdx) => {
          const prevSet = lastPerformanceSets?.[sIdx];
          return (
            <SetRow
              key={set.id}
              setIndex={sIdx + 1}
              set={set}
              prevWeight={prevSet?.weight}
              prevReps={prevSet?.reps}
              onUpdate={(patch) => handleUpdateSet(set.id, patch)}
              onToggleComplete={() => handleToggleComplete(set)}
              onDelete={() => handleDeleteSet(set.id)}
            />
          );
        })}
      </div>

      {/* Card Footer: Add Set Button */}
      <div className="pt-1">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleAddSet}
          className="w-full text-xs font-mono font-bold tracking-wider h-9 border-dashed border-border hover:border-primary/50"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
          [ + AGGIUNGI SERIE ]
        </Button>
      </div>
    </div>
  );
}
