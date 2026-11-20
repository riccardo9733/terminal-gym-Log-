import { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  MessageSquare,
} from 'lucide-react';
import { WorkoutExercise, WorkoutSet } from '../../types/workout';
import { SetRow } from './SetRow';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AsciiBox } from '../ui/ascii-box';
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
    <AsciiBox
      title={
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-muted-foreground font-bold">
            #{(exerciseIndex + 1).toString().padStart(2, '0')}
          </span>
          <span
            onClick={onOpenHistory}
            className={`text-foreground font-bold hover:text-accent cursor-pointer transition-colors truncate ${
              onOpenHistory ? 'hover:underline' : ''
            }`}
          >
            {exercise.name}
          </span>
          <Badge variant="outline" className="text-[9px]">
            {exercise.muscleGroup.toUpperCase()}
          </Badge>
        </div>
      }
      action={
        <div className="flex items-center gap-1">
          {/* Order buttons */}
          <button
            type="button"
            disabled={exerciseIndex === 0}
            onClick={onMoveUp}
            className="h-6 w-6 rounded-[2px] border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
            title="Sposta su"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            disabled={exerciseIndex === totalExercises - 1}
            onClick={onMoveDown}
            className="h-6 w-6 rounded-[2px] border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
            title="Sposta giù"
          >
            <ChevronDown className="h-3 w-3" />
          </button>

          {/* Delete exercise */}
          <button
            type="button"
            onClick={onRemoveExercise}
            className="h-6 w-6 rounded-[2px] border border-border flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors ml-1"
            title="Elimina esercizio"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      }
      className="space-y-2.5"
    >
      {/* Subheader Badges & Controls */}
      <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono pb-1 border-b border-border/40">
        {bestWeight !== undefined && bestWeight > 0 && (
          <Badge variant="accent" className="text-[10px]">
            {`PR: ${bestWeight}kg`}
          </Badge>
        )}

        {/* History drawer trigger button */}
        {onOpenHistory && (
          <button
            type="button"
            onClick={onOpenHistory}
            className="h-6 px-1.5 rounded-[2px] border border-border bg-secondary/60 text-muted-foreground hover:text-foreground hover:border-accent transition-colors flex items-center gap-1"
            title="Vedi storico serie"
          >
            <span>[HIST]</span>
          </button>
        )}

        {/* Rest interval cycle button */}
        <button
          type="button"
          onClick={handleCycleRest}
          className="h-6 px-1.5 rounded-[2px] border border-border bg-secondary/60 text-muted-foreground hover:text-warning hover:border-warning/50 transition-colors flex items-center gap-1 tabular-nums"
          title="Tocca per cambiare intervallo di riposo"
        >
          <span>{`[REST: ${exercise.restSeconds || 90}S]`}</span>
        </button>

        {/* Notes Toggle */}
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className={`h-6 px-1.5 rounded-[2px] border transition-colors flex items-center gap-1 ml-auto ${
            showNotes || exercise.notes
              ? 'border-accent/40 bg-accent/10 text-accent'
              : 'border-border bg-secondary/60 text-muted-foreground hover:text-foreground'
          }`}
          title="Note esercizio"
        >
          <MessageSquare className="h-2.5 w-2.5" />
          <span>[NOTE]</span>
        </button>
      </div>

      {/* Notes field */}
      {showNotes && (
        <div className="pt-0.5">
          <input
            type="text"
            placeholder="Note di esecuzione / setup macchinario..."
            value={exercise.notes || ''}
            onChange={(e) => onUpdateExercise({ notes: e.target.value })}
            className="h-8 w-full rounded-[2px] border border-border bg-secondary/50 px-2 text-xs font-mono text-foreground placeholder:text-muted-foreground/35 focus:border-accent focus:outline-none"
          />
        </div>
      )}

      {/* Sets Column Header */}
      <div className="flex items-center gap-1.5 px-1.5 text-[9px] font-mono uppercase tracking-wider text-muted-foreground/80 select-none border-b border-border/30 pb-1">
        <div className="w-9 text-center font-bold">SET</div>
        <div className="w-16 text-center font-bold">PREV</div>
        <div className="flex-1 text-center font-bold">KG</div>
        <div className="flex-1 text-center font-bold">REPS</div>
        <div className="w-11 text-center font-bold text-accent">LOG</div>
        <div className="w-6" />
      </div>

      {/* Sets Rows */}
      <div className="space-y-1">
        {exercise.sets.map((set, setIdx) => {
          const prevSet = lastPerformanceSets?.[setIdx];
          return (
            <SetRow
              key={set.id}
              setIndex={setIdx + 1}
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
      <Button
        variant="secondary"
        size="sm"
        onClick={handleAddSet}
        className="w-full h-8 text-[11px] font-mono font-bold tracking-wider border-dashed border-border hover:border-accent hover:text-accent"
      >
        <Plus className="mr-1 h-3 w-3" />
        [ + ADD_SET ]
      </Button>
    </AsciiBox>
  );
}
