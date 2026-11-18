import { useState, useEffect, useCallback } from 'react';
import {
  Play,
  TrendingUp,
  Plus,
  Bookmark,
  Edit2,
  Trash2,
  Clock,
} from 'lucide-react';
import { MobileAppShell } from './components/layout/MobileAppShell';
import { TopStatusBar } from './components/layout/TopStatusBar';
import { BottomDock, NavTab } from './components/layout/BottomDock';
import { ActiveWorkout } from './components/workout/ActiveWorkout';
import { HistoryView } from './components/workout/HistoryView';
import { ExerciseListView } from './components/workout/ExerciseListView';
import { AuthModal } from './components/workout/AuthModal';
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
import { generateId, formatDate, formatShortDate } from './lib/utils';

export function App() {
  const {
    user,
    isFirebaseConfigured,
    loginWithGoogle,
    loginWithGithub,
    loginAsGuest,
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
  const [pendingWritesCount, setPendingWritesCount] = useState(0);

  // Sync state & Wake lock
  const syncState = useNetworkSync(pendingWritesCount);
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
    alert(`Scheda "${created.title}" salvata con successo! Potrai rieseguirla in qualsiasi momento.`);
  };

  // Update active workout
  const handleUpdateSession = (updated: WorkoutSession) => {
    setActiveSession(updated);
    workoutService.saveWorkout(userId, updated);
  };

  // Finish active session
  const handleFinishSession = async (finished: WorkoutSession, saveAsRoutine = false) => {
    await workoutService.saveWorkout(userId, finished);

    if (saveAsRoutine) {
      await routineService.createRoutineFromSession(userId, finished);
      await loadRoutines();
    }

    setActiveSession(null);
    await loadHistory();
    await loadUserExercises();
    setCurrentTab('history');
  };

  // Cancel/discard active session
  const handleCancelSession = async () => {
    if (activeSession) {
      await workoutService.deleteWorkout(userId, activeSession.id);
    }
    setActiveSession(null);
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
      exercises: template.exercises.map((ex) => ({
        id: generateId(),
        exerciseId: ex.exerciseId,
        name: ex.name,
        muscleGroup: ex.muscleGroup,
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
        {currentTab === 'workout' && (
          <>
            {activeSession ? (
              <ActiveWorkout
                session={activeSession}
                userExercises={userExercises}
                onUpdateSession={handleUpdateSession}
                onFinishSession={handleFinishSession}
                onCancelSession={handleCancelSession}
                onCreateCustomExercise={handleCreateCustomExercise}
                onRecordSetPR={handleRecordSetPR}
                onSaveAsRoutine={handleSaveSessionAsRoutine}
              />
            ) : (
              /* Idle Workout Launcher Screen */
              <div className="flex-1 flex flex-col space-y-4 px-3 pt-3 pb-24">
                {/* Hero Card */}
                <div className="rounded border border-border bg-card p-4 space-y-3">
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
                      INIZIA_ALLENAMENTO
                    </h1>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">
                      Scegli una scheda salvata o avvia una sessione libera.
                    </p>
                  </div>

                  {/* Primary Start Empty Button */}
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleStartEmptyWorkout}
                    className="w-full text-xs font-mono font-bold tracking-wider h-11 border-dashed"
                  >
                    <Play className="mr-2 h-4 w-4 fill-current" strokeWidth={0} />
                    SESSIONE_LIBERA (VUOTA)
                  </Button>
                </div>

                {/* SAVED ROUTINES / LE MIE SCHEDE SECTION */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-0.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                      <Bookmark className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
                      <span>LE_MIE_SCHEDE ({routines.length})</span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setRoutineToEdit(null);
                        setRoutineEditorOpen(true);
                      }}
                      className="h-7 px-2 text-[10px] font-mono"
                    >
                      <Plus className="mr-1 h-3 w-3" strokeWidth={2} />
                      CREA_SCHEDA
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {routines.map((routine) => (
                      <div
                        key={routine.id}
                        className="rounded border border-border bg-card p-3 space-y-2 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="text-sm font-bold font-mono text-foreground tracking-tight truncate">
                                {routine.title}
                              </h3>
                              <Badge variant="outline" className="text-[9px] py-0 px-1 border-muted">
                                {routine.exercises.length} ESERCIZI
                              </Badge>
                            </div>

                            {routine.description && (
                              <p className="mt-0.5 text-[11px] font-mono text-muted-foreground line-clamp-1">
                                {routine.description}
                              </p>
                            )}

                            {routine.lastPerformedAt && (
                              <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-muted-foreground/70">
                                <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                                <span>Ultima volta: {formatShortDate(routine.lastPerformedAt)}</span>
                              </div>
                            )}
                          </div>

                          {/* Routine Actions: Edit & Delete */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setRoutineToEdit(routine);
                                setRoutineEditorOpen(true);
                              }}
                              className="h-8 w-8 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                              title="Modifica scheda"
                            >
                              <Edit2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteRoutine(routine.id)}
                              className="h-8 w-8 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
                              title="Elimina scheda"
                            >
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                            </button>
                          </div>
                        </div>

                        {/* Exercise tags preview */}
                        <div className="flex flex-wrap gap-1 pt-1 border-t border-border/40">
                          {routine.exercises.slice(0, 4).map((ex, idx) => (
                            <span
                              key={ex.exerciseId + idx}
                              className="rounded bg-secondary/80 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground border border-border/40 truncate max-w-[130px]"
                            >
                              {ex.name}
                            </span>
                          ))}
                          {routine.exercises.length > 4 && (
                            <span className="text-[9px] font-mono text-muted-foreground/60 py-0.5">
                              +{routine.exercises.length - 4} altri
                            </span>
                          )}
                        </div>

                        {/* Start Routine Button */}
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => handleStartFromRoutine(routine)}
                          className="w-full text-xs font-mono font-bold tracking-wider h-10 mt-1"
                        >
                          <Play className="mr-1.5 h-3.5 w-3.5 fill-current" strokeWidth={0} />
                          AVVIA_SCHEDA &gt;
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics Summary Strip */}
                <div className="rounded border border-border bg-card/50 p-3 text-xs font-mono space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <TrendingUp className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
                    <span>LIFETIME_TELEMETRY</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="rounded border border-border/40 bg-secondary/40 p-2">
                      <div className="text-[10px] text-muted-foreground">SESSIONI_COMPLETATE</div>
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

                  {history.length > 0 && (
                    <div className="pt-1 text-[10px] text-muted-foreground flex justify-between">
                      <span>ULTIMO_ALLENAMENTO:</span>
                      <span className="text-foreground">
                        {formatDate(history[0].startedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {currentTab === 'history' && (
          <HistoryView
            history={history}
            onStartFromTemplate={handleStartFromHistoryTemplate}
            onDeleteWorkout={handleDeleteWorkout}
          />
        )}

        {currentTab === 'exercises' && (
          <ExerciseListView
            userExercises={userExercises}
            onCreateExercise={handleCreateCustomExercise}
          />
        )}
      </main>

      {/* Bottom Dock Navigation */}
      <BottomDock
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        hasActiveWorkout={Boolean(activeSession)}
      />

      {/* Routine Editor / Creator Modal */}
      <RoutineEditorModal
        open={routineEditorOpen}
        onOpenChange={setRoutineEditorOpen}
        routineToEdit={routineToEdit}
        userExercises={userExercises}
        onSaveRoutine={handleSaveRoutine}
        onCreateCustomExercise={handleCreateCustomExercise}
      />

      {/* Auth & Settings Modal */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        user={user}
        isFirebaseConfigured={isFirebaseConfigured}
        onLoginGoogle={loginWithGoogle}
        onLoginGithub={loginWithGithub}
        onLoginGuest={loginAsGuest}
        onLogout={logout}
      />
    </MobileAppShell>
  );
}
