import { useState, useEffect } from 'react';
import {
  Plus,
  Dumbbell,
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
import { formatTonnage } from '../../lib/asciiStats';

interface ActiveWorkoutProps {
  session: WorkoutSession;
  userExercises: Record<string, UserExerciseMeta>;
  history?: WorkoutSession[];
  onUpdateSession: (updated: WorkoutSession) => void;
  onFinishSession: (session: WorkoutSession, saveAsRoutine?: boolean) => void;
  onCancelSession: () => void;
  onCreateCustomExercise: (name: string, muscleGroup: MuscleGroup) => void;
  onRecordSetPR: (exercise: WorkoutExercise, set: WorkoutSet) => void;
  onSaveAsRoutine?: (session: WorkoutSession) => void;
  restTimer?: ReturnType<typeof useRestTimer>;
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
  restTimer: propRestTimer,
}: ActiveWorkoutProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [saveAsRoutineCheck, setSaveAsRoutineCheck] = useState(false);

  // Exercise History Drawer state
  const [historySummary, setHistorySummary] = useState<ExerciseHistorySummary | null>(null);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);

  // Rest Timer Hook (use shared prop if passed from App, else local instance)
  const localRestTimer = useRestTimer(session.defaultRestSeconds || 90);
  const restTimer = propRestTimer || localRestTimer;

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

  // Compute 10-char ASCII progress bar for sets
  const setsRatio = totalSets > 0 ? completedSets / totalSets : 0;
  const setsFilled = Math.min(10, Math.round(setsRatio * 10));
  const setsAsciiBar = '█'.repeat(setsFilled) + '░'.repeat(10 - setsFilled);

  return (
    <div className="flex-1 flex flex-col space-y-3 px-3 pt-3 pb-40 font-mono">
      {/* Compact TUI Telemetry Header Strip (~34px) */}
      <div className="flex items-center justify-between gap-2 h-9 px-2.5 rounded-[2px] border border-border bg-card/90 text-xs font-mono select-none">
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          <span className="text-accent font-bold shrink-0">&gt;</span>
          <span className="font-bold text-foreground truncate text-xs" title={session.title}>
            {session.title}
          </span>
          <span className="text-accent font-bold tabular-nums text-xs whitespace-nowrap shrink-0">
            [⏱ {formatDuration(elapsedSeconds)}]
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-[10px] text-muted-foreground tabular-nums">
          <span className="text-foreground font-bold">{formatTonnage(totalVolumeKg)}</span>
          <span className="text-border">│</span>
          <span className="font-bold text-foreground">{completedSets}/{totalSets}</span>
          <span className="text-accent font-bold tracking-tighter">[{setsAsciiBar}]</span>
        </div>
      </div>

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
          <div className="rounded-[2px] border border-dashed border-border bg-card/30 p-8 text-center space-y-1">
            <Dumbbell className="mx-auto h-7 w-7 text-muted-foreground/30 mb-2" strokeWidth={1.5} />
            <p className="text-xs font-mono font-bold text-muted-foreground uppercase">
              NESSUN_ESERCIZIO_AGGIUNTO
            </p>
            <p className="text-[11px] font-mono text-muted-foreground/60">
              Tocca il pulsante qui sotto per aggiungere movimenti a questa sessione.
            </p>
          </div>
        )}
      </div>

      {/* Add Exercise Action */}
      <Button
        variant="default"
        size="lg"
        onClick={() => setComboboxOpen(true)}
        className="w-full border-dashed border-border/80 hover:border-accent hover:text-accent font-mono tracking-wider text-xs"
      >
        <Plus className="mr-2 h-4 w-4" strokeWidth={2} />
        [ + AGGIUNGI_ESERCIZIO ]
      </Button>

      {/* Discreet Secondary Session Discard Action */}
      <div className="pt-3 pb-2 text-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowCancelConfirm(true)}
          className="text-xs font-mono text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Annulla e cancella la sessione attiva"
        >
          [ ✕ ANNULLA QUESTA SESSIONE ]
        </Button>
      </div>

      {/* ALWAYS VISIBLE PINNED BOTTOM DOCK (STICKY REST TIMER + FINISH BAR) */}
      <div
        className="fixed left-0 right-0 z-30 border-t border-border bg-background"
        style={{ bottom: 'calc(2.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="mx-auto max-w-md">
          {/* Compact Sticky Rest Timer (36px, zero layout shift, renders only when active) */}
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

          {/* Always Visible Full-Width FINISH Button */}
          <div className="px-3 py-2">
            <Button
              type="button"
              variant="primary"
              onClick={() => setShowFinishConfirm(true)}
              className="w-full font-mono text-xs font-black tracking-wider h-11"
              title="Termina e registra sessione"
            >
              <span>[ ✓ CONCLUDI SESSIONE ({completedSets}/{totalSets}) ↵ ]</span>
            </Button>
          </div>
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
            <DrawerTitle>&gt; CONCLUDERE_SESSIONE_DI_ALLENAMENTO?</DrawerTitle>
            <DrawerDescription>
              Riepilogo: {completedSets} serie completate su {session.exercises.length} esercizi ({totalVolumeKg.toLocaleString()}kg in {formatDuration(elapsedSeconds)}).
            </DrawerDescription>
          </DrawerHeader>

          <DrawerBody className="space-y-3">
            {/* ASCII Toggle to also save as routine */}
            <div
              onClick={() => setSaveAsRoutineCheck(!saveAsRoutineCheck)}
              className="rounded-[2px] border border-border bg-secondary/40 p-3 cursor-pointer select-none space-y-1 hover:border-accent transition-colors"
            >
              <div className="flex items-center gap-2 text-xs font-mono text-foreground font-bold">
                <span className={`font-mono text-sm font-bold ${saveAsRoutineCheck ? 'text-accent' : 'text-muted-foreground'}`}>
                  {saveAsRoutineCheck ? '[x]' : '[ ]'}
                </span>
                <span>SALVA_ANCHE_COME_SCHEDA_RIUTILIZZABILE</span>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground pl-6">
                Verrà creata una scheda preimpostata &quot;{session.title.replace(/_\d{4}-\d{2}-\d{2}/, '')}&quot; per riutilizzarla nei prossimi allenamenti.
              </p>
            </div>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" onClick={() => setShowFinishConfirm(false)}>
              [ ANNULLA ]
            </Button>
            <Button
              variant="primary"
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
              [ ✓ CONFERMA_E_SALVA ↵ ]
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Cancel Confirmation Drawer */}
      <Drawer open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DrawerContent className="max-h-[85dvh]">
          <DrawerHeader>
            <DrawerTitle className="text-destructive">&gt; ANNULLARE_LA_SESSIONE_ATTIVA?</DrawerTitle>
            <DrawerDescription>
              Attenzione: tutte le serie registrate in questa sessione andranno perse in modo irreversibile.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>
              [ CONTINUA_SESSIONE ]
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowCancelConfirm(false);
                onCancelSession();
              }}
            >
              [ ✕ CONFERMA_ANNULLAMENTO ↵ ]
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
