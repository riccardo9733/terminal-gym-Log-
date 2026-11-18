import { useState, useEffect } from 'react';
import {
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Dumbbell,
  Edit2,
  Check,
} from 'lucide-react';
import { WorkoutSession, WorkoutExercise, WorkoutSet, UserExerciseMeta, MuscleGroup } from '../../types/workout';
import { ExerciseCard } from './ExerciseCard';
import { RestTimer } from './RestTimer';
import { ExerciseCombobox } from './ExerciseCombobox';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { generateId, formatDuration } from '../../lib/utils';
import { useRestTimer } from '../../hooks/useRestTimer';

interface ActiveWorkoutProps {
  session: WorkoutSession;
  userExercises: Record<string, UserExerciseMeta>;
  onUpdateSession: (updated: WorkoutSession) => void;
  onFinishSession: (session: WorkoutSession) => void;
  onCancelSession: () => void;
  onCreateCustomExercise: (name: string, muscleGroup: MuscleGroup) => void;
  onRecordSetPR: (exercise: WorkoutExercise, set: WorkoutSet) => void;
}

export function ActiveWorkout({
  session,
  userExercises,
  onUpdateSession,
  onFinishSession,
  onCancelSession,
  onCreateCustomExercise,
  onRecordSetPR,
}: ActiveWorkoutProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(session.title);

  // Rest Timer Hook
  const restTimer = useRestTimer(90);

  // Live session elapsed clock
  useEffect(() => {
    const updateElapsed = () => {
      const diff = Math.max(0, Math.floor((Date.now() - session.startedAt) / 1000));
      setElapsedSeconds(diff);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [session.startedAt]);

  // When a set is marked completed, auto-start rest timer & update PR
  const handleSetCompleted = (exercise: WorkoutExercise, set: WorkoutSet) => {
    onRecordSetPR(exercise, set);
    restTimer.startTimer(90);
  };

  const handleAddExercise = (selected: {
    id: string;
    name: string;
    muscleGroup: MuscleGroup;
    isCustom: boolean;
  }) => {
    const newExercise: WorkoutExercise = {
      id: generateId(),
      exerciseId: selected.id,
      name: selected.name,
      muscleGroup: selected.muscleGroup,
      sets: [
        {
          id: generateId(),
          weight: userExercises[selected.id]?.bestWeight || 0,
          reps: 8,
          completed: false,
        },
      ],
    };

    onUpdateSession({
      ...session,
      exercises: [...session.exercises, newExercise],
    });
  };

  const handleUpdateExercise = (exIndex: number, patch: Partial<WorkoutExercise>) => {
    const updatedExercises = [...session.exercises];
    updatedExercises[exIndex] = { ...updatedExercises[exIndex], ...patch };
    onUpdateSession({
      ...session,
      exercises: updatedExercises,
    });
  };

  const handleRemoveExercise = (exIndex: number) => {
    const updated = session.exercises.filter((_, idx) => idx !== exIndex);
    onUpdateSession({
      ...session,
      exercises: updated,
    });
  };

  const handleMoveExercise = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= session.exercises.length) return;
    const items = [...session.exercises];
    const [moved] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, moved);
    onUpdateSession({
      ...session,
      exercises: items,
    });
  };

  const saveTitle = () => {
    if (tempTitle.trim()) {
      onUpdateSession({ ...session, title: tempTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  // Workout stats
  const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = session.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalVolumeKg = session.exercises.reduce((acc, ex) => {
    return (
      acc +
      ex.sets
        .filter((s) => s.completed)
        .reduce((sAcc, s) => sAcc + s.weight * s.reps, 0)
    );
  }, 0);

  return (
    <div className="flex-1 flex flex-col space-y-3 px-3 py-3">
      {/* Active Workout Header */}
      <div className="rounded border border-border bg-card p-3 shadow-xs">
        <div className="flex items-center justify-between">
          {/* Editable Title */}
          {isEditingTitle ? (
            <div className="flex items-center gap-1.5 flex-1 pr-2">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
                className="h-9 w-full rounded border border-primary bg-background px-2 text-sm font-bold font-mono text-foreground focus:outline-none"
                autoFocus
              />
              <Button size="iconSm" variant="primary" onClick={saveTitle} className="h-9 w-9">
                <Check className="h-4 w-4" strokeWidth={2} />
              </Button>
            </div>
          ) : (
            <div
              onClick={() => {
                setTempTitle(session.title);
                setIsEditingTitle(true);
              }}
              className="flex items-center gap-1.5 cursor-pointer group"
              title="Click to edit session name"
            >
              <h2 className="text-sm font-bold font-mono text-foreground tracking-tight">
                {session.title}
              </h2>
              <Edit2 className="h-3 w-3 text-muted-foreground opacity-60 group-hover:opacity-100" strokeWidth={1.75} />
            </div>
          )}

          {/* Session Timer */}
          <div className="flex items-center gap-1.5 rounded bg-secondary/80 px-2 py-1 text-xs font-mono font-semibold text-foreground border border-border tabular-nums shrink-0">
            <Clock className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
            <span>{formatDuration(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Quick Summary Pill Bar */}
        <div className="mt-2.5 flex items-center justify-between border-t border-border/50 pt-2 text-[10px] font-mono text-muted-foreground">
          <div>
            SETS:{' '}
            <span className="text-accent font-bold">
              {completedSets}/{totalSets}
            </span>
          </div>
          <div>
            VOLUME:{' '}
            <span className="text-foreground font-semibold">
              {totalVolumeKg.toLocaleString()}kg
            </span>
          </div>
          <div>
            EXERCISES:{' '}
            <span className="text-foreground font-semibold">
              {session.exercises.length}
            </span>
          </div>
        </div>
      </div>

      {/* Rest Timer Widget */}
      <RestTimer
        remainingSeconds={restTimer.remainingSeconds}
        totalSeconds={restTimer.totalSeconds}
        isRunning={restTimer.isRunning}
        isActive={restTimer.isActive}
        onStart={restTimer.startTimer}
        onPause={restTimer.pauseTimer}
        onResume={restTimer.resumeTimer}
        onReset={restTimer.resetTimer}
        onAddSeconds={restTimer.addSeconds}
      />

      {/* Exercises List */}
      <div className="space-y-3">
        {session.exercises.map((exercise, idx) => (
          <ExerciseCard
            key={exercise.id}
            exerciseIndex={idx}
            totalExercises={session.exercises.length}
            exercise={exercise}
            bestWeight={userExercises[exercise.exerciseId]?.bestWeight}
            onUpdateExercise={(patch) => handleUpdateExercise(idx, patch)}
            onRemoveExercise={() => handleRemoveExercise(idx)}
            onMoveUp={() => handleMoveExercise(idx, idx - 1)}
            onMoveDown={() => handleMoveExercise(idx, idx + 1)}
            onSetCompleted={handleSetCompleted}
          />
        ))}

        {session.exercises.length === 0 && (
          <div className="rounded border border-dashed border-border bg-card/30 p-8 text-center">
            <Dumbbell className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" strokeWidth={1.5} />
            <p className="text-xs font-mono text-muted-foreground">
              NO_EXERCISES_ADDED_YET
            </p>
            <p className="text-[11px] font-mono text-muted-foreground/60 mt-1">
              Tap below to search seed database or create custom movement
            </p>
          </div>
        )}
      </div>

      {/* Add Exercise Action */}
      <Button
        variant="default"
        size="lg"
        onClick={() => setComboboxOpen(true)}
        className="w-full border-dashed border-border/80 hover:border-primary/60 font-mono tracking-wider text-xs"
      >
        <Plus className="mr-2 h-4 w-4" strokeWidth={2} />
        + ADD_EXERCISE
      </Button>

      {/* Session Action Footer */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <Button
          variant="destructive"
          onClick={() => setShowCancelConfirm(true)}
          className="w-full font-mono text-xs tracking-wider"
        >
          <XCircle className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
          DISCARD
        </Button>

        <Button
          variant="accent"
          onClick={() => setShowFinishConfirm(true)}
          className="w-full font-mono text-xs tracking-wider"
        >
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
          FINISH
        </Button>
      </div>

      {/* Creatable Combobox Modal */}
      <ExerciseCombobox
        open={comboboxOpen}
        onOpenChange={setComboboxOpen}
        userExercises={userExercises}
        onSelectExercise={handleAddExercise}
        onCreateCustomExercise={(name, muscleGroup) => {
          onCreateCustomExercise(name, muscleGroup);
          handleAddExercise({
            id: generateId(),
            name,
            muscleGroup,
            isCustom: true,
          });
        }}
      />

      {/* Finish Confirmation Dialog */}
      <Dialog open={showFinishConfirm} onOpenChange={setShowFinishConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>FINISH_WORKOUT_SESSION?</DialogTitle>
            <DialogDescription>
              Session summary: {completedSets} completed sets across {session.exercises.length} exercises ({totalVolumeKg.toLocaleString()}kg total volume in {formatDuration(elapsedSeconds)}).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinishConfirm(false)}>
              RESUME
            </Button>
            <Button
              variant="accent"
              onClick={() => {
                setShowFinishConfirm(false);
                onFinishSession({
                  ...session,
                  status: 'completed',
                  endedAt: Date.now(),
                });
              }}
            >
              SAVE_AND_LOG
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">DISCARD_WORKOUT_SESSION?</DialogTitle>
            <DialogDescription>
              This will permanently discard all logged sets in this active workout. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>
              KEEP_WORKING
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowCancelConfirm(false);
                onCancelSession();
              }}
            >
              CONFIRM_DISCARD
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
