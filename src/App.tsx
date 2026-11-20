import { useState, useEffect, useCallback } from 'react';
import {
  Play,
  TrendingUp,
  Plus,
  Bookmark,
  ChevronRight,
  Calendar,
  Clock,
  RotateCcw,
  Dumbbell,
} from 'lucide-react';
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
import { Badge } from './components/ui/badge';
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
import { generateId, formatDate, formatDuration, getTodayFormatted } from './lib/utils';

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
              <div className="flex-1 flex flex-col space-y-3.5 px-3 pt-3 pb-24">
                {/* 1. Date of Today Banner */}
                <div className="flex items-center justify-between rounded border border-border bg-card/60 px-3 py-2 text-xs font-mono">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" strokeWidth={2} />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80">
                      DATA_DI_OGGI:
                    </span>
                  </div>
                  <span className="font-bold text-foreground tracking-tight text-[11px]">
                    {getTodayFormatted()}
                  </span>
                </div>

                {/* 2. Hero Action Card: INIZIA UN ALLENAMENTO */}
                <div className="rounded border border-primary/50 bg-card p-4 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-bold">
                      &gt; PRONTO_PER_L&apos;ALLENAMENTO
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      v0.1.0-mono
                    </span>
                  </div>

                  <div>
                    <h1 className="text-xl font-black font-mono tracking-tight text-foreground">
                      SESSIONE_DI_ALLENAMENTO
                    </h1>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">
                      Apri il selettore per scegliere tra le tue schede o avviare una sessione libera.
                    </p>
                  </div>

                  {/* Primary Trigger: Opens Bottom Drawer */}
                  <Button
                    variant="accent"
                    size="lg"
                    onClick={() => setStartWorkoutDrawerOpen(true)}
                    className="w-full text-xs font-mono font-bold tracking-wider h-12 shadow-sm"
                  >
                    <Play className="mr-2 h-4 w-4 fill-current" strokeWidth={0} />
                    INIZIA UN ALLENAMENTO &gt;
                  </Button>
                </div>

                {/* 3. Ultima sessione svolta (se presente) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
                      <span>ULTIMA_SESSIONE_SVOLTA</span>
                    </div>

                    {lastSession && (
                      <span className="text-muted-foreground/70">
                        {formatDate(lastSession.startedAt).split(' ')[0]}
                      </span>
                    )}
                  </div>

                  {lastSession ? (
                    <div className="rounded border border-border bg-card p-3 space-y-2.5 shadow-2xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-sm font-bold font-mono text-foreground tracking-tight truncate">
                              {lastSession.title}
                            </h3>
                            <Badge variant="outline" className="text-[9px] py-0 px-1 border-muted">
                              {lastSession.exercises.length} ESERCIZI
                            </Badge>
                          </div>

                          <div className="mt-1 flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                            <span>{lastSessionSetsCount} serie</span>
                            <span className="text-foreground font-semibold">
                              {lastSessionVolume.toLocaleString()}kg
                            </span>
                            {lastSessionDurationSec > 0 && (
                              <span>{formatDuration(lastSessionDurationSec)}</span>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleStartFromHistoryTemplate(lastSession)}
                          className="h-8 px-2.5 text-[10px] font-mono font-bold shrink-0 border-border hover:border-primary/50"
                          title="Ripeti gli stessi esercizi di questa sessione"
                        >
                          <RotateCcw className="mr-1 h-3 w-3 text-primary" strokeWidth={2} />
                          RIPETI
                        </Button>
                      </div>

                      {/* Exercises snapshot preview */}
                      <div className="flex flex-wrap gap-1 pt-1.5 border-t border-border/40">
                        {lastSession.exercises.slice(0, 3).map((ex, idx) => (
                          <span
                            key={ex.exerciseId + idx}
                            className="rounded bg-secondary/70 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground border border-border/40 truncate max-w-[120px]"
                          >
                            {ex.name}
                          </span>
                        ))}
                        {lastSession.exercises.length > 3 && (
                          <span className="text-[9px] font-mono text-muted-foreground/60 py-0.5">
                            +{lastSession.exercises.length - 3} altri
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded border border-dashed border-border bg-card/30 p-6 text-center">
                      <Dumbbell className="mx-auto h-7 w-7 text-muted-foreground/30 mb-1.5" strokeWidth={1.5} />
                      <p className="text-xs font-mono text-muted-foreground">
                        Nessun allenamento completato finora.
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">
                        I tuoi progressi e l&apos;ultima sessione svolta compariranno qui.
                      </p>
                    </div>
                  )}
                </div>

                {/* 4. Schede rapide shortcut strip */}
                <div className="rounded border border-border bg-card/60 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                      <Bookmark className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
                      <span>LE_TUE_SCHEDE ({routines.length})</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentTab('routines')}
                      className="flex items-center gap-0.5 text-[10px] font-mono text-primary font-bold hover:underline"
                    >
                      <span>VEDI TUTTE</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {routines.slice(0, 4).map((routine) => (
                      <button
                        key={routine.id}
                        type="button"
                        onClick={() => handleStartFromRoutine(routine)}
                        className="shrink-0 rounded border border-border bg-background px-2.5 py-1.5 text-left hover:border-accent hover:bg-secondary/40 active:bg-secondary transition-all"
                      >
                        <div className="text-xs font-bold font-mono text-foreground truncate max-w-[120px]">
                          {routine.title}
                        </div>
                        <div className="text-[9px] font-mono text-accent font-semibold mt-0.5">
                          {routine.exercises.length} es. &gt;
                        </div>
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        setRoutineToEdit(null);
                        setRoutineEditorOpen(true);
                      }}
                      className="shrink-0 flex items-center gap-1 rounded border border-dashed border-border bg-background/50 px-2.5 py-2 text-xs font-mono text-primary hover:bg-secondary/40 transition-all"
                    >
                      <Plus className="h-3 w-3" />
                      <span>CREA</span>
                    </button>
                  </div>
                </div>

                {/* 5. Metrics Summary Strip */}
                <div className="rounded border border-border bg-card/50 p-3 text-xs font-mono space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <TrendingUp className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
                    <span>LIFETIME_TELEMETRY</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="rounded border border-border/40 bg-secondary/40 p-2">
                      <div className="text-[10px] text-muted-foreground">SESSIONI_TOTALI</div>
                      <div className="text-lg font-black font-mono text-foreground tabular-nums">
                        {totalCompletedWorkouts}
                      </div>
                    </div>

                    <div className="rounded border border-border/40 bg-secondary/40 p-2">
                      <div className="text-[10px] text-muted-foreground">VOLUME_TOTALE</div>
                      <div className="text-lg font-black font-mono text-accent tabular-nums">
                        {totalLifetimeVolume > 1000
                          ? `${(totalLifetimeVolume / 1000).toFixed(1)}t`
                          : `${totalLifetimeVolume}kg`}
                      </div>
                    </div>
                  </div>
                </div>
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
