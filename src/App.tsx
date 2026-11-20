import { useState, useEffect, useCallback } from 'react';
import { MobileAppShell } from './components/layout/MobileAppShell';
import { TopStatusBar } from './components/layout/TopStatusBar';
import { BottomDock, NavTab } from './components/layout/BottomDock';
import { ActiveWorkout } from './components/workout/ActiveWorkout';
import { HistoryView } from './components/workout/HistoryView';
import { RoutinesView } from './components/workout/RoutinesView';
import { StartWorkoutDrawer } from './components/workout/StartWorkoutDrawer';
import { AuthModal } from './components/workout/AuthModal';
import { AuthScreen } from './components/workout/AuthScreen';
import { RoutineEditorModal } from './components/workout/RoutineEditorModal';
import { Button } from './components/ui/button';
import { AsciiBox } from './components/ui/ascii-box';
import { useAuth } from './hooks/useAuth';
import { useWakeLock } from './hooks/useWakeLock';
import { useNetworkSync } from './hooks/useNetworkSync';
import { workoutService } from './services/workoutService';
import { exerciseService } from './services/exerciseService';
import { routineService } from './services/routineService';
import {
  WorkoutSession,
  WorkoutExercise,
  WorkoutSet,
  WorkoutRoutine,
  UserExerciseMeta,
  MuscleGroup,
} from './types/workout';
import { generateId, formatDate, formatDuration } from './lib/utils';

export function App() {
  const {
    user,
    loading: authLoading,
    isFirebaseConfigured,
    logout,
  } = useAuth();

  const [currentTab, setCurrentTab] = useState<NavTab>('workout');
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [userExercises, setUserExercises] = useState<Record<string, UserExerciseMeta>>({});
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [routineEditorOpen, setRoutineEditorOpen] = useState(false);
  const [routineToEdit, setRoutineToEdit] = useState<WorkoutRoutine | null>(null);
  const [startWorkoutDrawerOpen, setStartWorkoutDrawerOpen] = useState(false);
  const [pendingWritesCount, setPendingWritesCount] = useState(0);

  // Sync state & Wake lock
  const syncState = useNetworkSync(pendingWritesCount, Boolean(user));
  const { isLocked: isWakeLocked } = useWakeLock(Boolean(activeSession));

  const userId = user?.uid || 'demo-user';

  // Load user exercises dictionary
  const loadUserExercises = useCallback(async () => {
    try {
      const data = await exerciseService.getUserExercises(userId);
      setUserExercises(data);
    } catch (e) {
      console.warn('Could not load user exercises:', e);
    }
  }, [userId]);

  // Load routines
  const loadRoutines = useCallback(async () => {
    try {
      const list = await routineService.getRoutines(userId);
      setRoutines(list);
    } catch (e) {
      console.warn('Could not load routines:', e);
    }
  }, [userId]);

  // Load history
  const loadHistory = useCallback(async () => {
    try {
      const list = await workoutService.getWorkoutHistory(userId);
      setHistory(list);
    } catch (e) {
      console.warn('Could not load history:', e);
    }
  }, [userId]);

  // Active workout subscription
  useEffect(() => {
    loadUserExercises();
    loadRoutines();
    loadHistory();

    const unsubscribe = workoutService.subscribeToActiveWorkout(
      userId,
      (session, _fromCache, hasPending) => {
        setActiveSession(session);
        setPendingWritesCount(hasPending ? 1 : 0);
      }
    );

    return () => unsubscribe();
  }, [userId, loadUserExercises, loadRoutines, loadHistory]);

  // Start new empty session
  const handleStartEmptyWorkout = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newSession: WorkoutSession = {
      id: generateId(),
      title: `${todayStr}_SESSION`,
      status: 'active',
      startedAt: Date.now(),
      exercises: [],
      updatedAt: Date.now(),
      defaultRestSeconds: 90,
    };

    setActiveSession(newSession);
    workoutService.saveWorkout(userId, newSession);
    setCurrentTab('workout');
  };

  // Start session from a routine (scheda)
  const handleStartFromRoutine = (routine: WorkoutRoutine) => {
    const bestWeightsMap: Record<string, number> = {};
    Object.entries(userExercises).forEach(([id, meta]) => {
      if (meta.bestWeight) bestWeightsMap[id] = meta.bestWeight;
    });

    const session = routineService.createSessionFromRoutine(routine, bestWeightsMap);
    setActiveSession(session);
    workoutService.saveWorkout(userId, session);

    // Update routine lastPerformedAt
    const updatedRoutine: WorkoutRoutine = {
      ...routine,
      lastPerformedAt: Date.now(),
      updatedAt: Date.now(),
    };
    routineService.saveRoutine(userId, updatedRoutine).then(() => {
      setRoutines((prev) => prev.map((r) => (r.id === routine.id ? updatedRoutine : r)));
    });

    setCurrentTab('workout');
  };

  // Save or update a routine
  const handleSaveRoutine = async (routine: WorkoutRoutine) => {
    await routineService.saveRoutine(userId, routine);
    await loadRoutines();
  };

  // Delete a routine
  const handleDeleteRoutine = async (routineId: string) => {
    await routineService.deleteRoutine(userId, routineId);
    setRoutines((prev) => prev.filter((r) => r.id !== routineId));
  };

  // Save active session as a reusable routine on the fly
  const handleSaveSessionAsRoutine = async (session: WorkoutSession) => {
    const created = await routineService.createRoutineFromSession(userId, session);
    await loadRoutines();
    alert(`Scheda "${created.title}" salvata! La trovi nella tab SCHEDE.`);
  };

  // Update active workout
  const handleUpdateSession = (updated: WorkoutSession) => {
    setActiveSession(updated);
    workoutService.saveWorkout(userId, updated);
  };

  // Finish active session
  const handleFinishSession = async (finished: WorkoutSession, saveAsRoutine = false) => {
    // 1. Optimistically close active session and navigate immediately (0ms UI lag)
    setActiveSession(null);
    setCurrentTab('history');
    setHistory((prev) => [finished, ...prev.filter((w) => w.id !== finished.id)]);

    try {
      await workoutService.saveWorkout(userId, finished);
    } catch (err) {
      console.error('Failed to save workout session:', err);
    }

    if (saveAsRoutine) {
      try {
        await routineService.createRoutineFromSession(userId, finished);
        await loadRoutines();
      } catch (err) {
        console.error('Failed to create routine from session:', err);
      }
    }

    try {
      await Promise.all([loadHistory(), loadUserExercises()]);
    } catch (err) {
      console.warn('Failed to refresh history or exercises:', err);
    }
  };

  // Cancel/discard active session
  const handleCancelSession = async () => {
    const sessionToCancel = activeSession;
    setActiveSession(null);
    if (sessionToCancel) {
      try {
        await workoutService.deleteWorkout(userId, sessionToCancel.id);
      } catch (err) {
        console.error('Failed to delete workout session:', err);
      }
    }
  };

  // Record exercise PR on set completion
  const handleRecordSetPR = async (exercise: WorkoutExercise, set: WorkoutSet) => {
    if (!set.completed || set.weight <= 0) return;
    try {
      const updatedMeta = await exerciseService.recordExerciseUsage(
        userId,
        exercise.exerciseId,
        exercise.name,
        exercise.muscleGroup,
        set.weight
      );
      setUserExercises((prev) => ({
        ...prev,
        [exercise.exerciseId]: updatedMeta,
      }));
    } catch (err) {
      console.warn('Failed to record PR:', err);
    }
  };

  // Create custom exercise
  const handleCreateCustomExercise = async (name: string, muscleGroup: MuscleGroup) => {
    try {
      const created = await exerciseService.createCustomExercise(userId, name, muscleGroup);
      setUserExercises((prev) => ({
        ...prev,
        [created.id]: created,
      }));
    } catch (err) {
      console.warn('Failed to create custom exercise:', err);
    }
  };

  // Delete history item
  const handleDeleteWorkout = async (workoutId: string) => {
    await workoutService.deleteWorkout(userId, workoutId);
    setHistory((prev) => prev.filter((w) => w.id !== workoutId));
  };

  // Reuse past workout as template
  const handleStartFromHistoryTemplate = (template: WorkoutSession) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newSession: WorkoutSession = {
      id: generateId(),
      title: `${template.title.replace(/_\d{4}-\d{2}-\d{2}/, '')}_${todayStr}`,
      status: 'active',
      startedAt: Date.now(),
      defaultRestSeconds: template.defaultRestSeconds || 90,
      exercises: template.exercises.map((ex) => ({
        id: generateId(),
        exerciseId: ex.exerciseId,
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        restSeconds: ex.restSeconds ?? template.defaultRestSeconds ?? 90,
        sets: ex.sets.map((s) => ({
          id: generateId(),
          weight: s.weight,
          reps: s.reps,
          completed: false,
        })),
      })),
      updatedAt: Date.now(),
    };

    setActiveSession(newSession);
    workoutService.saveWorkout(userId, newSession);
    setCurrentTab('workout');
  };

  // Overall workout stats
  const totalCompletedWorkouts = history.length;
  const totalLifetimeVolume = history.reduce((acc, w) => {
    return (
      acc +
      w.exercises.reduce((exAcc, ex) => {
        return (
          exAcc +
          ex.sets
            .filter((s) => s.completed)
            .reduce((sAcc, s) => sAcc + s.weight * s.reps, 0)
        );
      }, 0)
    );
  }, 0);

  // Latest completed session
  const lastSession = history.length > 0 ? history[0] : null;
  const lastSessionDurationSec = lastSession?.endedAt
    ? Math.max(0, Math.floor((lastSession.endedAt - lastSession.startedAt) / 1000))
    : 0;
  const lastSessionSetsCount = lastSession?.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  ) || 0;
  const lastSessionVolume = lastSession?.exercises.reduce((acc, ex) => {
    return (
      acc +
      ex.sets
        .filter((s) => s.completed)
        .reduce((sAcc, s) => sAcc + s.weight * s.reps, 0)
    );
  }, 0) || 0;

  if (authLoading) {
    return (
      <div className="min-h-[100dvh] max-w-md mx-auto flex flex-col items-center justify-center p-4 bg-background font-mono text-xs">
        <div className="flex items-center gap-2 text-foreground">
          <div className="h-2 w-2 rounded-full bg-accent animate-ping" />
          <span>INITIALIZING_SESSION...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <MobileAppShell>
      {/* Top Status Bar */}
      <TopStatusBar
        syncState={syncState}
        isWakeLocked={isWakeLocked}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {/* 1. SESSION TAB */}
        {currentTab === 'workout' && (
          <>
            {activeSession ? (
              <ActiveWorkout
                session={activeSession}
                userExercises={userExercises}
                history={history}
                onUpdateSession={handleUpdateSession}
                onFinishSession={handleFinishSession}
                onCancelSession={handleCancelSession}
                onCreateCustomExercise={handleCreateCustomExercise}
                onRecordSetPR={handleRecordSetPR}
                onSaveAsRoutine={handleSaveSessionAsRoutine}
              />
            ) : (
              /* Idle Workout Launcher Screen */
              <div className="flex-1 flex flex-col space-y-3 px-3 pt-3 pb-24 font-mono">
                {/* 1. Primary Empty Workout Action */}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStartEmptyWorkout}
                  className="w-full text-xs font-mono font-bold tracking-wider h-11"
                  title="Avvia sessione libera"
                >
                  [ ▶ AVVIA SESSIONE LIBERA ↵ ]
                </Button>

                {/* 2. Tiled Lifetime Telemetry Panes */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="border border-border bg-card p-2.5 rounded-[2px] space-y-1">
                    <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
                      ┌─[ SESSIONI ]
                    </div>
                    <div className="text-xl font-black font-mono text-foreground tabular-nums">
                      {totalCompletedWorkouts}
                    </div>
                  </div>

                  <div className="border border-border bg-card p-2.5 rounded-[2px] space-y-1">
                    <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
                      ┌─[ VOLUME ]
                    </div>
                    <div className="text-xl font-black font-mono text-accent tabular-nums">
                      {totalLifetimeVolume > 1000
                        ? `${(totalLifetimeVolume / 1000).toFixed(1)}t`
                        : `${totalLifetimeVolume}kg`}
                    </div>
                  </div>
                </div>

                {/* 3. Le Tue Schede (1-Tap Direct Launch) */}
                <AsciiBox
                  title={`LE_TUE_SCHEDE (${routines.length})`}
                  action={
                    <button
                      type="button"
                      onClick={() => setCurrentTab('routines')}
                      className="text-[10px] font-mono text-accent hover:underline flex items-center gap-0.5"
                    >
                      <span>[VEDI_TUTTE]</span>
                    </button>
                  }
                >
                  <div className="space-y-1.5">
                    {routines.map((routine) => (
                      <div
                        key={routine.id}
                        onClick={() => handleStartFromRoutine(routine)}
                        className="flex items-center justify-between gap-2 p-2 rounded-[2px] border border-border/80 bg-secondary/50 hover:bg-secondary hover:border-accent active:scale-[0.99] transition-all cursor-pointer group select-none"
                      >
                        <div className="min-w-0 flex-1 truncate">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-xs font-bold font-mono text-foreground group-hover:text-accent transition-colors truncate">
                              {routine.title}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                              • {routine.exercises.length} es.
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono font-bold text-accent shrink-0 border border-accent/40 bg-accent/10 px-1.5 py-0.5 rounded-[2px] group-hover:bg-accent group-hover:text-background transition-colors">
                          [ ▶ AVVIA ]
                        </span>
                      </div>
                    ))}

                    {routines.length === 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setRoutineToEdit(null);
                          setRoutineEditorOpen(true);
                        }}
                        className="w-full py-3 rounded-[2px] border border-dashed border-border bg-secondary/20 text-xs font-mono text-muted-foreground hover:text-accent hover:border-accent transition-colors text-center"
                      >
                        [ + CREA LA TUA PRIMA SCHEDA ]
                      </button>
                    )}
                  </div>
                </AsciiBox>

                {/* 4. Ultima Sessione Svolta (con ASCII Tree) */}
                {lastSession ? (
                  <AsciiBox
                    title="ULTIMA_SESSIONE_SVOLTA"
                    status={`[${formatDate(lastSession.startedAt).split(' ')[0]}]`}
                    action={
                      <Button
                        variant="secondary"
                        size="compact"
                        onClick={() => handleStartFromHistoryTemplate(lastSession)}
                        className="text-[10px]"
                        title="Ripeti gli stessi esercizi di questa sessione"
                      >
                        [ ↻ RIPETI ]
                      </Button>
                    }
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-foreground truncate max-w-[180px]">{lastSession.title}</span>
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          {lastSessionSetsCount} serie │ {lastSessionVolume.toLocaleString()}kg
                          {lastSessionDurationSec > 0 && ` │ ${formatDuration(lastSessionDurationSec)}`}
                        </span>
                      </div>

                      {/* ASCII Tree Exercise Preview */}
                      <div className="font-mono text-xs text-muted-foreground space-y-0.5 pt-1 border-t border-border/40">
                        {lastSession.exercises.slice(0, 3).map((ex, idx, arr) => {
                          const isLast = idx === arr.length - 1 && lastSession.exercises.length <= 3;
                          const prefix = isLast ? '└─' : '├─';
                          return (
                            <div key={ex.exerciseId + idx} className="truncate text-[11px]">
                              <span className="text-accent/70 select-none mr-1.5">{prefix}</span>
                              <span className="text-foreground">{ex.name}</span>
                              <span className="text-muted-foreground/60 text-[10px] ml-1">
                                ({ex.muscleGroup})
                              </span>
                            </div>
                          );
                        })}
                        {lastSession.exercises.length > 3 && (
                          <div className="truncate text-[11px]">
                            <span className="text-accent/70 select-none mr-1.5">└─</span>
                            <span className="text-muted-foreground/80">
                              +{lastSession.exercises.length - 3} altri movimenti
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </AsciiBox>
                ) : (
                  <div className="rounded-[2px] border border-dashed border-border bg-card/30 p-6 text-center space-y-1">
                    <p className="text-xs font-mono font-bold text-muted-foreground uppercase">
                      NESSUNA_SESSIONE_PRECEDENTE
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground/60">
                      I tuoi progressi e l&apos;ultima sessione completata compariranno qui.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* 2. HISTORY / LOGS TAB */}
        {currentTab === 'history' && (
          <HistoryView
            history={history}
            onStartFromTemplate={handleStartFromHistoryTemplate}
            onDeleteWorkout={handleDeleteWorkout}
          />
        )}

        {/* 3. ROUTINES / SCHEDE TAB */}
        {currentTab === 'routines' && (
          <RoutinesView
            routines={routines}
            onStartRoutine={handleStartFromRoutine}
            onEditRoutine={(routine) => {
              setRoutineToEdit(routine);
              setRoutineEditorOpen(true);
            }}
            onDeleteRoutine={handleDeleteRoutine}
            onSaveRoutine={handleSaveRoutine}
            onCreateNewRoutine={() => {
              setRoutineToEdit(null);
              setRoutineEditorOpen(true);
            }}
          />
        )}
      </main>

      {/* Bottom Dock Navigation */}
      <BottomDock
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        hasActiveWorkout={Boolean(activeSession)}
      />

      {/* Start Workout Bottom Drawer */}
      <StartWorkoutDrawer
        open={startWorkoutDrawerOpen}
        onOpenChange={setStartWorkoutDrawerOpen}
        routines={routines}
        onStartEmpty={handleStartEmptyWorkout}
        onStartRoutine={handleStartFromRoutine}
        onCreateRoutine={() => {
          setRoutineToEdit(null);
          setRoutineEditorOpen(true);
        }}
      />

      {/* Routine Editor / Creator Bottom Drawer */}
      <RoutineEditorModal
        open={routineEditorOpen}
        onOpenChange={setRoutineEditorOpen}
        routineToEdit={routineToEdit}
        userExercises={userExercises}
        onSaveRoutine={handleSaveRoutine}
        onCreateCustomExercise={handleCreateCustomExercise}
      />

      {/* Auth & Settings Bottom Drawer */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        user={user}
        isFirebaseConfigured={isFirebaseConfigured}
        onLogout={logout}
      />
    </MobileAppShell>
  );
}
