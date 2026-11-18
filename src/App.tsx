import { useState, useEffect, useCallback } from 'react';
import {
  Play,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { MobileAppShell } from './components/layout/MobileAppShell';
import { TopStatusBar } from './components/layout/TopStatusBar';
import { BottomDock, NavTab } from './components/layout/BottomDock';
import { ActiveWorkout } from './components/workout/ActiveWorkout';
import { HistoryView } from './components/workout/HistoryView';
import { ExerciseListView } from './components/workout/ExerciseListView';
import { AuthModal } from './components/workout/AuthModal';
import { Button } from './components/ui/button';
import { useAuth } from './hooks/useAuth';
import { useWakeLock } from './hooks/useWakeLock';
import { useNetworkSync } from './hooks/useNetworkSync';
import { workoutService } from './services/workoutService';
import { exerciseService } from './services/exerciseService';
import {
  WorkoutSession,
  WorkoutExercise,
  WorkoutSet,
  UserExerciseMeta,
  MuscleGroup,
} from './types/workout';
import { generateId, formatDate } from './lib/utils';

const WORKOUT_SPLIT_PRESETS = [
  {
    title: 'UPPER_A',
    description: 'Bench press, rows, overhead press, pull-ups, arms',
    exercises: [
      { id: 'barbell-bench-press', name: 'Barbell Bench Press', muscleGroup: 'chest' as MuscleGroup },
      { id: 'barbell-bent-over-row', name: 'Barbell Bent-Over Row', muscleGroup: 'back' as MuscleGroup },
      { id: 'overhead-press', name: 'Overhead Barbell Press (OHP)', muscleGroup: 'shoulders' as MuscleGroup },
      { id: 'pull-up', name: 'Pull-Up', muscleGroup: 'back' as MuscleGroup },
      { id: 'tricep-rope-pushdown', name: 'Tricep Rope Pushdown', muscleGroup: 'arms' as MuscleGroup },
      { id: 'barbell-bicep-curl', name: 'Barbell Bicep Curl', muscleGroup: 'arms' as MuscleGroup },
    ],
  },
  {
    title: 'LOWER_B',
    description: 'Squat, Romanian deadlift, split squat, leg curl, calves',
    exercises: [
      { id: 'barbell-back-squat', name: 'Barbell Back Squat', muscleGroup: 'legs' as MuscleGroup },
      { id: 'romanian-deadlift', name: 'Romanian Deadlift (RDL)', muscleGroup: 'legs' as MuscleGroup },
      { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', muscleGroup: 'legs' as MuscleGroup },
      { id: 'lying-leg-curl', name: 'Lying Leg Curl', muscleGroup: 'legs' as MuscleGroup },
      { id: 'standing-calf-raise', name: 'Standing Calf Raise', muscleGroup: 'legs' as MuscleGroup },
      { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', muscleGroup: 'core' as MuscleGroup },
    ],
  },
  {
    title: 'PUSH_DAY',
    description: 'Incline bench, dips, dumbbell shoulder press, lateral raises',
    exercises: [
      { id: 'incline-dumbbell-press', name: 'Incline Dumbbell Press', muscleGroup: 'chest' as MuscleGroup },
      { id: 'chest-dips', name: 'Weighted Dips (Chest)', muscleGroup: 'chest' as MuscleGroup },
      { id: 'seated-dumbbell-shoulder-press', name: 'Seated Dumbbell Shoulder Press', muscleGroup: 'shoulders' as MuscleGroup },
      { id: 'dumbbell-lateral-raise', name: 'Dumbbell Lateral Raise', muscleGroup: 'shoulders' as MuscleGroup },
      { id: 'skullcrushers', name: 'Barbell Skullcrushers (Lying Ext)', muscleGroup: 'arms' as MuscleGroup },
    ],
  },
  {
    title: 'PULL_DAY',
    description: 'Deadlift, lat pulldown, seated cable row, curls',
    exercises: [
      { id: 'conventional-deadlift', name: 'Barbell Deadlift', muscleGroup: 'back' as MuscleGroup },
      { id: 'lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'back' as MuscleGroup },
      { id: 'seated-cable-row', name: 'Seated Cable Row', muscleGroup: 'back' as MuscleGroup },
      { id: 'face-pull', name: 'Face Pull', muscleGroup: 'back' as MuscleGroup },
      { id: 'incline-dumbbell-curl', name: 'Incline Dumbbell Curl', muscleGroup: 'arms' as MuscleGroup },
    ],
  },
];

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
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
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
    loadHistory();

    const unsubscribe = workoutService.subscribeToActiveWorkout(
      userId,
      (session, _fromCache, hasPending) => {
        setActiveSession(session);
        setPendingWritesCount(hasPending ? 1 : 0);
      }
    );

    return () => unsubscribe();
  }, [userId, loadUserExercises, loadHistory]);

  // Start new empty or custom session
  const handleStartWorkout = (title = 'WORKOUT_SESSION', seedExercises?: { id: string; name: string; muscleGroup: MuscleGroup }[]) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const sessionTitle = title === 'WORKOUT_SESSION' ? `${todayStr}_SESSION` : title;

    const initialExercises: WorkoutExercise[] = (seedExercises || []).map((se) => ({
      id: generateId(),
      exerciseId: se.id,
      name: se.name,
      muscleGroup: se.muscleGroup,
      sets: [
        {
          id: generateId(),
          weight: userExercises[se.id]?.bestWeight || 0,
          reps: 8,
          completed: false,
        },
      ],
    }));

    const newSession: WorkoutSession = {
      id: generateId(),
      title: sessionTitle,
      status: 'active',
      startedAt: Date.now(),
      exercises: initialExercises,
      updatedAt: Date.now(),
    };

    setActiveSession(newSession);
    workoutService.saveWorkout(userId, newSession);
    setCurrentTab('workout');
  };

  // Update active workout
  const handleUpdateSession = (updated: WorkoutSession) => {
    setActiveSession(updated);
    workoutService.saveWorkout(userId, updated);
  };

  // Finish active session
  const handleFinishSession = async (finished: WorkoutSession) => {
    await workoutService.saveWorkout(userId, finished);
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

  // Reuse workout as template
  const handleStartFromTemplate = (template: WorkoutSession) => {
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
              />
            ) : (
              /* Idle Workout Launcher Screen */
              <div className="flex-1 flex flex-col space-y-4 px-3 pt-3 pb-24">
                {/* Hero Card */}
                <div className="rounded border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-bold">
                      &gt; READY_FOR_TRAINING
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      v0.1.0-mono
                    </span>
                  </div>

                  <div>
                    <h1 className="text-xl font-black font-mono tracking-tight text-foreground">
                      START_WORKOUT
                    </h1>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">
                      Fast keyboard/thumb logging, 100% offline-first.
                    </p>
                  </div>

                  {/* Primary Start Empty Button */}
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => handleStartWorkout()}
                    className="w-full text-xs font-mono font-bold tracking-wider h-12"
                  >
                    <Play className="mr-2 h-4 w-4 fill-current" strokeWidth={0} />
                    START_EMPTY_SESSION
                  </Button>
                </div>

                {/* Quick Split Presets */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 px-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                    <Zap className="h-3 w-3 text-warning" strokeWidth={2} />
                    <span>OR_SELECT_PRESET_SPLIT</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {WORKOUT_SPLIT_PRESETS.map((preset) => (
                      <button
                        key={preset.title}
                        type="button"
                        onClick={() => handleStartWorkout(preset.title, preset.exercises)}
                        className="rounded border border-border bg-card/70 p-3 text-left hover:border-primary/60 hover:bg-secondary/40 active:bg-secondary transition-all"
                      >
                        <div className="text-xs font-bold font-mono text-foreground">
                          {preset.title}
                        </div>
                        <div className="mt-1 text-[10px] font-mono text-muted-foreground line-clamp-2">
                          {preset.description}
                        </div>
                        <div className="mt-2 text-[9px] font-mono text-primary font-semibold">
                          {preset.exercises.length} MOVEMENTS &gt;
                        </div>
                      </button>
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
                      <div className="text-[10px] text-muted-foreground">COMPLETED_SESSIONS</div>
                      <div className="text-lg font-black font-mono text-foreground tabular-nums">
                        {totalCompletedWorkouts}
                      </div>
                    </div>

                    <div className="rounded border border-border/40 bg-secondary/40 p-2">
                      <div className="text-[10px] text-muted-foreground">TOTAL_VOLUME</div>
                      <div className="text-lg font-black font-mono text-accent tabular-nums">
                        {totalLifetimeVolume > 1000
                          ? `${(totalLifetimeVolume / 1000).toFixed(1)}t`
                          : `${totalLifetimeVolume}kg`}
                      </div>
                    </div>
                  </div>

                  {history.length > 0 && (
                    <div className="pt-1 text-[10px] text-muted-foreground flex justify-between">
                      <span>LAST_TRAINED:</span>
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
            onStartFromTemplate={handleStartFromTemplate}
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
