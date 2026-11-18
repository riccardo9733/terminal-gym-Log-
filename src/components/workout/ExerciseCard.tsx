import { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  MessageSquare,
  Trophy,
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
  onUpdateExercise: (updated: Partial<WorkoutExercise>) => void;
  onRemoveExercise: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSetCompleted: (exercise: WorkoutExercise, set: WorkoutSet) => void;
}

export function ExerciseCard({
  exerciseIndex,
  totalExercises,
  exercise,
  bestWeight,
  onUpdateExercise,
  onRemoveExercise,
  onMoveUp,
  onMoveDown,
  onSetCompleted,
}: ExerciseCardProps) {
  const [showNotes, setShowNotes] = useState(Boolean(exercise.notes));

  const handleAddSet = () => {
    // Copy weight and reps from previous set if available
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: WorkoutSet = {
      id: generateId(),
      weight: lastSet ? lastSet.weight : 0,
      reps: lastSet ? lastSet.reps : 0,
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
    <div className="rounded border border-border bg-card p-3 shadow-sm transition-all">
      {/* Exercise Header */}
      <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-muted-foreground font-semibold">
              #{(exerciseIndex + 1).toString().padStart(2, '0')}
            </span>
            <h3 className="text-sm font-bold font-mono text-foreground tracking-tight truncate">
              {exercise.name}
            </h3>
            <Badge variant="outline" className="text-[9px] py-0 px-1 border-muted">
              {exercise.muscleGroup}
            </Badge>
          </div>

          {bestWeight !== undefined && bestWeight > 0 && (
            <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-accent">
              <Trophy className="h-3 w-3" strokeWidth={2} />
              <span>PR: {bestWeight}kg</span>
            </div>
          )}
        </div>

        {/* Action Controls: Up/Down, Notes, Delete */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            disabled={exerciseIndex === 0}
            onClick={onMoveUp}
            className="h-8 w-8 flex items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
            title="Move up"
          >
            <ChevronUp className="h-4 w-4" strokeWidth={1.75} />
          </button>

          <button
            type="button"
            disabled={exerciseIndex === totalExercises - 1}
            onClick={onMoveDown}
            className="h-8 w-8 flex items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
            title="Move down"
          >
            <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
          </button>

          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className={`h-8 w-8 flex items-center justify-center rounded transition-colors ${
              exercise.notes
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Toggle notes"
          >
            <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>

          <button
            type="button"
            onClick={onRemoveExercise}
            className="h-8 w-8 flex items-center justify-center rounded text-muted-foreground hover:text-destructive transition-colors"
            title="Remove exercise"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Optional Exercise Notes */}
      {showNotes && (
        <div className="pt-2 pb-1">
          <input
            type="text"
            placeholder="Notes (e.g. 3010 tempo, seat pin #4)..."
            value={exercise.notes || ''}
            onChange={(e) => onUpdateExercise({ notes: e.target.value })}
            className="w-full rounded border border-input bg-secondary/50 px-2.5 py-1 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      {/* Table Headers */}
      <div className="flex items-center gap-2 px-2 py-1.5 text-[9px] font-bold font-mono uppercase tracking-wider text-muted-foreground">
        <span className="w-8 shrink-0 text-center">SET</span>
        <span className="w-16 shrink-0 text-center">PREV</span>
        <span className="flex-1 text-center">KG</span>
        <span className="flex-1 text-center">REPS</span>
        <span className="w-11 shrink-0 text-center">LOG</span>
        <span className="w-8 shrink-0" />
      </div>

      {/* Set Rows */}
      <div className="space-y-1.5">
        {exercise.sets.map((set, sIdx) => {
          const prevSet = exercise.sets[sIdx - 1];
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

      {/* Add Set Button */}
      <div className="mt-2.5">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleAddSet}
          className="w-full text-xs font-mono font-bold tracking-wider border-border/80 hover:border-primary/40 text-foreground"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
          ADD_SET
        </Button>
      </div>
    </div>
  );
}
