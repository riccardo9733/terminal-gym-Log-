import { useState, useEffect } from 'react';
import {
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Dumbbell,
  Edit2,
  Check,
  BookmarkPlus,
} from 'lucide-react';
import { WorkoutSession, WorkoutExercise, WorkoutSet, UserExerciseMeta, MuscleGroup } from '../../types/workout';
import { ExerciseCard } from './ExerciseCard';
import { RestTimer } from './RestTimer';
import { ExerciseCombobox } from './ExerciseCombobox';
import { ExerciseHistoryDrawer } from './ExerciseHistoryDrawer';
import { Button } from '../ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
} from '../ui/drawer';
import { generateId, formatDuration } from '../../lib/utils';
import { useRestTimer } from '../../hooks/useRestTimer';
import { getExerciseHistory, ExerciseHistorySummary } from '../../services/exerciseHistoryService';

interface ActiveWorkoutProps {
  session: WorkoutSession;
  userExercises: Record<string, UserExerciseMeta>;
  history?: WorkoutSession[];
  onUpdateSession: (updated: WorkoutSession) => void;
  onFinishSession: (session: WorkoutSession, saveAsRoutine?: boolean) => void;
  onCancelSession: () => void;
  onCreateCustomExercise: (name: string, muscleGroup: MuscleGroup) => void;
  onRecordSetPR: (exercise: WorkoutExercise, set: WorkoutSet) => void;
  onSaveAsRoutine: (session: WorkoutSession) => void;
}

export function ActiveWorkout({
  session,
  userExercises,
  history,
  onUpdateSession,
  onFinishSession,
  onCancelSession,
  onCreateCustomExercise,
  onRecordSetPR,
  onSaveAsRoutine,
}: ActiveWorkoutProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [saveAsRoutineCheck, setSaveAsRoutineCheck] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(session.title);

  // Exercise History Drawer state
  const [historySummary, setHistorySummary] = useState<ExerciseHistorySummary | null>(null);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);

  // Rest Timer Hook
  const restTimer = useRestTimer(session.defaultRestSeconds || 90);

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
    const targetRest = exercise.restSeconds ?? session.defaultRestSeconds ?? 90;
    restTimer.startTimer(targetRest);
  };

  const handleOpenExerciseHistory = (ex: WorkoutExercise) => {
    const summary = getExerciseHistory(ex.exerciseId, history || [], ex.name, ex.muscleGroup);
    setHistorySummary(summary);
    setHistoryDrawerOpen(true);
  };

  const handleAddExercise = (selected: {
    id: string;
    name: string;
    muscleGroup: MuscleGroup;
    isCustom: boolean;
  }) => {
    // Look up previous performance history for this exercise
    const prevHistory = getExerciseHistory(selected.id, history || [], selected.name, selected.muscleGroup);
    const lastSets = prevHistory.lastPerformanceSets;
    const initialWeight =
      lastSets.length > 0 && lastSets[0].weight > 0
        ? lastSets[0].weight
        : userExercises[selected.id]?.bestWeight || 0;
    const initialReps =
      lastSets.length > 0 && lastSets[0].reps > 0
        ? lastSets[0].reps
        : 8;

    const newExercise: WorkoutExercise = {
      id: generateId(),
      exerciseId: selected.id,
      name: selected.name,
      muscleGroup: selected.muscleGroup,
      restSeconds: session.defaultRestSeconds || 90,
      sets: [
        {
          id: generateId(),
          weight: initialWeight,
          reps: initialReps,
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
    <div className="flex-1 flex flex-col space-y-3 px-3 pt-3 pb-36">
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

          {/* Session Timer & Save As Routine Action */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onSaveAsRoutine(session)}
              className="flex h-8 items-center gap-1 rounded border border-border bg-secondary/80 px-2 text-[10px] font-mono text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
              title="Salva questa sessione come scheda"
            >
              <BookmarkPlus className="h-3 w-3 text-primary" strokeWidth={2} />
              <span>SALVA_SCHEDA</span>
            </button>

            <div className="flex items-center gap-1.5 rounded bg-secondary/80 px-2 py-1 text-xs font-mono font-semibold text-foreground border border-border tabular-nums">
              <Clock className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
              <span>{formatDuration(elapsedSeconds)}</span>
            </div>
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
        {session.exercises.map((exercise, idx) => {
          const prevHistory = getExerciseHistory(
            exercise.exerciseId,
            history || [],
            exercise.name,
            exercise.muscleGroup
          );
          return (
            <ExerciseCard
              key={exercise.id}
              exerciseIndex={idx}
              totalExercises={session.exercises.length}
              exercise={exercise}
              bestWeight={userExercises[exercise.exerciseId]?.bestWeight}
              lastPerformanceSets={prevHistory.lastPerformanceSets}
              onOpenHistory={() => handleOpenExerciseHistory(exercise)}
              onUpdateExercise={(patch) => handleUpdateExercise(idx, patch)}
              onRemoveExercise={() => handleRemoveExercise(idx)}
              onMoveUp={() => handleMoveExercise(idx, idx - 1)}
              onMoveDown={() => handleMoveExercise(idx, idx + 1)}
              onSetCompleted={handleSetCompleted}
            />
          );
        })}

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

      {/* ALWAYS VISIBLE PINNED BOTTOM ACTION BAR (Above the main navigation dock) */}
      <div
        className="fixed left-0 right-0 z-30 border-t border-border bg-background shadow-2xl"
        style={{ bottom: 'calc(3.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="mx-auto flex max-w-md items-center justify-between gap-2.5 px-3 py-2">
          {/* Always Visible DISCARD Button */}
          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowCancelConfirm(true)}
            className="flex-1 max-w-[130px] font-mono text-xs tracking-wider h-11"
            title="Annulla sessione"
          >
            <XCircle className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
            DISCARD
          </Button>

          {/* Always Visible FINISH Button */}
          <Button
            type="button"
            variant="accent"
            onClick={() => setShowFinishConfirm(true)}
            className="flex-1 font-mono text-xs tracking-wider h-11"
            title="Termina e registra sessione"
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" strokeWidth={2.5} />
            <span>FINISH ({completedSets}/{totalSets})</span>
          </Button>
        </div>
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

      {/* Finish Confirmation Drawer */}
      <Drawer open={showFinishConfirm} onOpenChange={setShowFinishConfirm}>
        <DrawerContent className="max-h-[85dvh]">
          <DrawerHeader>
            <DrawerTitle>FINISH_WORKOUT_SESSION?</DrawerTitle>
            <DrawerDescription>
              Riepilogo: {completedSets} serie completate su {session.exercises.length} esercizi ({totalVolumeKg.toLocaleString()}kg in {formatDuration(elapsedSeconds)}).
            </DrawerDescription>
          </DrawerHeader>

          <DrawerBody className="space-y-3">
            {/* Option to also save as routine */}
            <div className="rounded border border-border bg-background p-3">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-mono text-foreground select-none">
                <input
                  type="checkbox"
                  checked={saveAsRoutineCheck}
                  onChange={(e) => setSaveAsRoutineCheck(e.target.checked)}
                  className="h-4 w-4 rounded border-input bg-card accent-accent cursor-pointer"
                />
                <span className="font-semibold">Salva anche come scheda riutilizzabile</span>
              </label>
              <p className="text-[10px] font-mono text-muted-foreground mt-1 pl-6">
                Verrà creata la scheda &quot;{session.title.replace(/_\d{4}-\d{2}-\d{2}/, '')}&quot; con questi esercizi per riutilizzarla nei prossimi allenamenti.
              </p>
            </div>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" onClick={() => setShowFinishConfirm(false)}>
              CONTINUA
            </Button>
            <Button
              variant="accent"
              onClick={() => {
                setShowFinishConfirm(false);
                onFinishSession(
                  {
                    ...session,
                    status: 'completed',
                    endedAt: Date.now(),
                  },
                  saveAsRoutineCheck
                );
              }}
            >
              SALVA_E_REGISTRA
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Cancel Confirmation Drawer */}
      <Drawer open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DrawerContent className="max-h-[85dvh]">
          <DrawerHeader>
            <DrawerTitle className="text-destructive">DISCARD_WORKOUT_SESSION?</DrawerTitle>
            <DrawerDescription>
              Vuoi scartare questo allenamento? Tutte le serie registrate in questa sessione andranno perse.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>
              CONTINUA_SESSIONE
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowCancelConfirm(false);
                onCancelSession();
              }}
            >
              CONFERMA_DISCARD
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Exercise History & Progression Drawer */}
      <ExerciseHistoryDrawer
        open={historyDrawerOpen}
        onOpenChange={setHistoryDrawerOpen}
        historySummary={historySummary}
      />
    </div>
  );
}
