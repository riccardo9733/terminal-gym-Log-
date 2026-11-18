import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import {
  WorkoutRoutine,
  WorkoutSession,
  WorkoutExercise,
  MuscleGroup,
} from '../types/workout';
import { generateId } from '../lib/utils';

const LOCAL_STORAGE_ROUTINES_KEY = 'terminal_gym_routines';

export const INITIAL_DEFAULT_ROUTINES: WorkoutRoutine[] = [
  {
    id: 'routine-upper-a',
    title: 'UPPER_A',
    description: 'Panca piana, rematore, overhead press, trazioni, tricipiti e bicipiti',
    defaultRestSeconds: 90,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    exercises: [
      { exerciseId: 'barbell-bench-press', name: 'Barbell Bench Press', muscleGroup: 'chest', targetSets: 4, defaultReps: 8, restSeconds: 120 },
      { exerciseId: 'barbell-bent-over-row', name: 'Barbell Bent-Over Row', muscleGroup: 'back', targetSets: 4, defaultReps: 8, restSeconds: 90 },
      { exerciseId: 'overhead-press', name: 'Overhead Barbell Press (OHP)', muscleGroup: 'shoulders', targetSets: 3, defaultReps: 8, restSeconds: 120 },
      { exerciseId: 'pull-up', name: 'Pull-Up', muscleGroup: 'back', targetSets: 3, defaultReps: 8, restSeconds: 90 },
      { exerciseId: 'tricep-rope-pushdown', name: 'Tricep Rope Pushdown', muscleGroup: 'arms', targetSets: 3, defaultReps: 12, restSeconds: 60 },
      { exerciseId: 'barbell-bicep-curl', name: 'Barbell Bicep Curl', muscleGroup: 'arms', targetSets: 3, defaultReps: 10, restSeconds: 60 },
    ],
  },
  {
    id: 'routine-lower-b',
    title: 'LOWER_B',
    description: 'Squat, stacco rumeno, split squat, leg curl, polpacci e addome',
    defaultRestSeconds: 90,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    exercises: [
      { exerciseId: 'barbell-back-squat', name: 'Barbell Back Squat', muscleGroup: 'legs', targetSets: 4, defaultReps: 6, restSeconds: 150 },
      { exerciseId: 'romanian-deadlift', name: 'Romanian Deadlift (RDL)', muscleGroup: 'legs', targetSets: 3, defaultReps: 8, restSeconds: 120 },
      { exerciseId: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', muscleGroup: 'legs', targetSets: 3, defaultReps: 10, restSeconds: 90 },
      { exerciseId: 'lying-leg-curl', name: 'Lying Leg Curl', muscleGroup: 'legs', targetSets: 3, defaultReps: 12, restSeconds: 60 },
      { exerciseId: 'standing-calf-raise', name: 'Standing Calf Raise', muscleGroup: 'legs', targetSets: 4, defaultReps: 15, restSeconds: 60 },
      { exerciseId: 'hanging-leg-raise', name: 'Hanging Leg Raise', muscleGroup: 'core', targetSets: 3, defaultReps: 12, restSeconds: 60 },
    ],
  },
  {
    id: 'routine-push-day',
    title: 'PUSH_DAY',
    description: 'Panca inclinata, dips zavorrati, lento manubri, alzate laterali, french press',
    defaultRestSeconds: 90,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    exercises: [
      { exerciseId: 'incline-dumbbell-press', name: 'Incline Dumbbell Press', muscleGroup: 'chest', targetSets: 4, defaultReps: 8, restSeconds: 120 },
      { exerciseId: 'chest-dips', name: 'Weighted Dips (Chest)', muscleGroup: 'chest', targetSets: 3, defaultReps: 10, restSeconds: 90 },
      { exerciseId: 'seated-dumbbell-shoulder-press', name: 'Seated Dumbbell Shoulder Press', muscleGroup: 'shoulders', targetSets: 3, defaultReps: 10, restSeconds: 90 },
      { exerciseId: 'dumbbell-lateral-raise', name: 'Dumbbell Lateral Raise', muscleGroup: 'shoulders', targetSets: 4, defaultReps: 15, restSeconds: 60 },
      { exerciseId: 'skullcrushers', name: 'Barbell Skullcrushers (Lying Ext)', muscleGroup: 'arms', targetSets: 3, defaultReps: 10, restSeconds: 60 },
    ],
  },
  {
    id: 'routine-pull-day',
    title: 'PULL_DAY',
    description: 'Stacco da terra, lat machine, pulley, face pull, hammer curl',
    defaultRestSeconds: 90,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    exercises: [
      { exerciseId: 'conventional-deadlift', name: 'Barbell Deadlift', muscleGroup: 'back', targetSets: 4, defaultReps: 5, restSeconds: 150 },
      { exerciseId: 'lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'back', targetSets: 4, defaultReps: 10, restSeconds: 90 },
      { exerciseId: 'seated-cable-row', name: 'Seated Cable Row', muscleGroup: 'back', targetSets: 3, defaultReps: 10, restSeconds: 90 },
      { exerciseId: 'face-pull', name: 'Face Pull', muscleGroup: 'back', targetSets: 4, defaultReps: 15, restSeconds: 60 },
      { exerciseId: 'incline-dumbbell-curl', name: 'Incline Dumbbell Curl', muscleGroup: 'arms', targetSets: 3, defaultReps: 12, restSeconds: 60 },
    ],
  },
];

export const routineService = {
  // Get all routines
  async getRoutines(userId: string): Promise<WorkoutRoutine[]> {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_ROUTINES_KEY}_${userId}`);
    let localList: WorkoutRoutine[] = [];

    if (raw) {
      try {
        localList = JSON.parse(raw);
      } catch {
        localList = [];
      }
    } else {
      // Initialize with default seeds
      localList = [...INITIAL_DEFAULT_ROUTINES];
      localStorage.setItem(`${LOCAL_STORAGE_ROUTINES_KEY}_${userId}`, JSON.stringify(localList));
    }

    if (!isFirebaseConfigured || !db || userId === 'demo-user') {
      return localList;
    }

    try {
      const q = collection(db, 'users', userId, 'routines');
      const snap = await getDocs(q);
      if (!snap.empty) {
        const firestoreList = snap.docs.map((d) => d.data() as WorkoutRoutine);
        // Merge with local list, deduplicated by id
        const map = new Map<string, WorkoutRoutine>();
        localList.forEach((r) => map.set(r.id, r));
        firestoreList.forEach((r) => map.set(r.id, r));
        const merged = Array.from(map.values()).sort((a, b) => b.updatedAt - a.updatedAt);
        localStorage.setItem(`${LOCAL_STORAGE_ROUTINES_KEY}_${userId}`, JSON.stringify(merged));
        return merged;
      } else {
        // Sync initial defaults to Firestore
        for (const routine of localList) {
          const docRef = doc(db, 'users', userId, 'routines', routine.id);
          setDoc(docRef, routine).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Error reading routines from Firestore:', e);
    }

    return localList;
  },

  // Save or update routine
  async saveRoutine(userId: string, routine: WorkoutRoutine): Promise<void> {
    const existing = await this.getRoutines(userId);
    const updated = [routine, ...existing.filter((r) => r.id !== routine.id)];
    localStorage.setItem(`${LOCAL_STORAGE_ROUTINES_KEY}_${userId}`, JSON.stringify(updated));

    if (isFirebaseConfigured && db && userId !== 'demo-user') {
      const docRef = doc(db, 'users', userId, 'routines', routine.id);
      return setDoc(docRef, routine, { merge: true });
    }
  },

  // Delete routine
  async deleteRoutine(userId: string, routineId: string): Promise<void> {
    const existing = await this.getRoutines(userId);
    const updated = existing.filter((r) => r.id !== routineId);
    localStorage.setItem(`${LOCAL_STORAGE_ROUTINES_KEY}_${userId}`, JSON.stringify(updated));

    if (isFirebaseConfigured && db && userId !== 'demo-user') {
      const docRef = doc(db, 'users', userId, 'routines', routineId);
      return deleteDoc(docRef);
    }
  },

  // Convert active session into a reusable routine
  async createRoutineFromSession(
    userId: string,
    session: WorkoutSession,
    customTitle?: string
  ): Promise<WorkoutRoutine> {
    const newRoutine: WorkoutRoutine = {
      id: generateId(),
      title: customTitle?.trim() || session.title.replace(/_\d{4}-\d{2}-\d{2}/, '') || 'NUOVA_SCHEDA',
      description: `${session.exercises.length} esercizi creati dalla sessione`,
      defaultRestSeconds: session.defaultRestSeconds || 90,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastPerformedAt: session.startedAt,
      exercises: session.exercises.map((ex) => {
        const lastCompletedSet = [...ex.sets].reverse().find((s) => s.completed) || ex.sets[0];
        return {
          exerciseId: ex.exerciseId,
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          targetSets: Math.max(1, ex.sets.length),
          defaultWeight: lastCompletedSet ? lastCompletedSet.weight : 0,
          defaultReps: lastCompletedSet ? lastCompletedSet.reps : 8,
          restSeconds: ex.restSeconds,
          notes: ex.notes,
        };
      }),
    };

    await this.saveRoutine(userId, newRoutine);
    return newRoutine;
  },

  // Instantiate an active session from a routine
  createSessionFromRoutine(
    routine: WorkoutRoutine,
    bestWeightsMap: Record<string, number> = {}
  ): WorkoutSession {
    const todayStr = new Date().toISOString().split('T')[0];

    const exercises: WorkoutExercise[] = routine.exercises.map((re) => {
      const setsCount = re.targetSets || 3;
      const initialWeight = re.defaultWeight || bestWeightsMap[re.exerciseId] || 0;
      const initialReps = re.defaultReps || 8;

      return {
        id: generateId(),
        exerciseId: re.exerciseId,
        name: re.name,
        muscleGroup: re.muscleGroup as MuscleGroup,
        notes: re.notes,
        restSeconds: re.restSeconds ?? routine.defaultRestSeconds ?? 90,
        sets: Array.from({ length: setsCount }).map(() => ({
          id: generateId(),
          weight: initialWeight,
          reps: initialReps,
          completed: false,
        })),
      };
    });

    return {
      id: generateId(),
      title: `${routine.title}_${todayStr}`,
      status: 'active',
      startedAt: Date.now(),
      exercises,
      updatedAt: Date.now(),
      routineId: routine.id,
      defaultRestSeconds: routine.defaultRestSeconds || 90,
    };
  },
};
