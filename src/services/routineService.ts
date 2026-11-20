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
  WorkoutSet,
  MuscleGroup,
  RoutineSetTemplate,
} from '../types/workout';
import { generateId } from '../lib/utils';

const LOCAL_STORAGE_ROUTINES_KEY = 'terminal_gym_routines';

// 2 warmup sets (4 & 2 reps) + 2 working sets (8 reps)
const DEFAULT_SETS_TEMPLATE: RoutineSetTemplate[] = [
  { reps: 4, isWarmup: true },
  { reps: 2, isWarmup: true },
  { reps: 8, isWarmup: false },
  { reps: 8, isWarmup: false },
];

export const INITIAL_DEFAULT_ROUTINES: WorkoutRoutine[] = [
  {
    id: 'routine-scheda-a',
    title: 'SCHEDA_A',
    description: 'Spinte 30° (petto), lat machine (dorso), pressa 45° (gambe), alzate laterali (delt.), curl panca 60° (bic.)',
    defaultRestSeconds: 90,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    exercises: [
      {
        exerciseId: 'incline-dumbbell-press',
        name: 'Spinte 30° (Petto)',
        muscleGroup: 'chest',
        targetSets: 4,
        defaultReps: 8,
        restSeconds: 90,
        setsTemplate: DEFAULT_SETS_TEMPLATE,
      },
      {
        exerciseId: 'lat-pulldown',
        name: 'Lat Machine (Dorso)',
        muscleGroup: 'back',
        targetSets: 4,
        defaultReps: 8,
        restSeconds: 90,
        setsTemplate: DEFAULT_SETS_TEMPLATE,
      },
      {
        exerciseId: 'leg-press',
        name: 'Pressa 45° (Gambe)',
        muscleGroup: 'legs',
        targetSets: 4,
        defaultReps: 8,
        restSeconds: 90,
        setsTemplate: DEFAULT_SETS_TEMPLATE,
      },
      {
        exerciseId: 'dumbbell-lateral-raise',
        name: 'Alzate Laterali (Delt.)',
        muscleGroup: 'shoulders',
        targetSets: 4,
        defaultReps: 8,
        restSeconds: 60,
        setsTemplate: DEFAULT_SETS_TEMPLATE,
      },
      {
        exerciseId: 'incline-dumbbell-curl',
        name: 'Curl Panca 60° (Bic.)',
        muscleGroup: 'arms',
        targetSets: 4,
        defaultReps: 8,
        restSeconds: 60,
        setsTemplate: DEFAULT_SETS_TEMPLATE,
      },
    ],
  },
  {
    id: 'routine-scheda-b',
    title: 'SCHEDA_B',
    description: 'Shoulder press, leg curl, french press, pull face, crunch ai cavi',
    defaultRestSeconds: 90,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    exercises: [
      {
        exerciseId: 'seated-dumbbell-shoulder-press',
        name: 'Shoulder Press',
        muscleGroup: 'shoulders',
        targetSets: 4,
        defaultReps: 8,
        restSeconds: 90,
        setsTemplate: DEFAULT_SETS_TEMPLATE,
      },
      {
        exerciseId: 'lying-leg-curl',
        name: 'Leg Curl',
        muscleGroup: 'legs',
        targetSets: 4,
        defaultReps: 8,
        restSeconds: 90,
        setsTemplate: DEFAULT_SETS_TEMPLATE,
      },
      {
        exerciseId: 'skullcrushers',
        name: 'French Press',
        muscleGroup: 'arms',
        targetSets: 4,
        defaultReps: 8,
        restSeconds: 60,
        setsTemplate: DEFAULT_SETS_TEMPLATE,
      },
      {
        exerciseId: 'face-pull',
        name: 'Pull Face',
        muscleGroup: 'back',
        targetSets: 4,
        defaultReps: 8,
        restSeconds: 60,
        setsTemplate: DEFAULT_SETS_TEMPLATE,
      },
      {
        exerciseId: 'cable-crunch',
        name: 'Crunch ai Cavi',
        muscleGroup: 'core',
        targetSets: 4,
        defaultReps: 8,
        restSeconds: 60,
        setsTemplate: DEFAULT_SETS_TEMPLATE,
      },
    ],
  },
  {
    id: 'routine-scheda-c',
    title: 'SCHEDA_C',
    description: 'Pulley basso, croci ai cavi, leg extension, push down, curl martello',
    defaultRestSeconds: 90,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    exercises: [
      {
        exerciseId: 'seated-cable-row',
        name: 'Pulley Basso',
        muscleGroup: 'back',
        targetSets: 4,
        defaultReps: 8,
        restSeconds: 90,
        setsTemplate: DEFAULT_SETS_TEMPLATE,
      },
      {
        exerciseId: 'cable-chest-crossover',
        name: 'Croci ai Cavi',
        muscleGroup: 'chest',
        targetSets: 4,
        defaultReps: 8,
        restSeconds: 60,
        setsTemplate: DEFAULT_SETS_TEMPLATE,
      },
      {
        exerciseId: 'leg-extension',
        name: 'Leg Extension',
        muscleGroup: 'legs',
        targetSets: 4,
        defaultReps: 8,
        restSeconds: 90,
        setsTemplate: DEFAULT_SETS_TEMPLATE,
      },
      {
        exerciseId: 'tricep-rope-pushdown',
        name: 'Push Down',
        muscleGroup: 'arms',
        targetSets: 4,
        defaultReps: 8,
        restSeconds: 60,
        setsTemplate: DEFAULT_SETS_TEMPLATE,
      },
      {
        exerciseId: 'dumbbell-hammer-curl',
        name: 'Curl Martello',
        muscleGroup: 'arms',
        targetSets: 4,
        defaultReps: 8,
        restSeconds: 60,
        setsTemplate: DEFAULT_SETS_TEMPLATE,
      },
    ],
  },
];

const LEGACY_DEFAULT_IDS = [
  'routine-upper-a',
  'routine-lower-b',
  'routine-push-day',
  'routine-pull-day',
];

export const routineService = {
  // Get all routines
  async getRoutines(userId: string): Promise<WorkoutRoutine[]> {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_ROUTINES_KEY}_${userId}`);
    let localList: WorkoutRoutine[] = [];

    if (raw) {
      try {
        localList = JSON.parse(raw);
        // Purge legacy default routines if present
        const hasLegacy = localList.some((r) => LEGACY_DEFAULT_IDS.includes(r.id));
        if (hasLegacy) {
          localList = localList.filter((r) => !LEGACY_DEFAULT_IDS.includes(r.id));
          for (const newDef of INITIAL_DEFAULT_ROUTINES) {
            if (!localList.some((r) => r.id === newDef.id)) {
              localList.push(newDef);
            }
          }
          localStorage.setItem(`${LOCAL_STORAGE_ROUTINES_KEY}_${userId}`, JSON.stringify(localList));
        }
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
        let firestoreList = snap.docs.map((d) => d.data() as WorkoutRoutine);
        // Purge legacy defaults from firestore list as well
        firestoreList = firestoreList.filter((r) => !LEGACY_DEFAULT_IDS.includes(r.id));

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
          setDoc(docRef, routine).catch(() => { });
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
      const sanitized = JSON.parse(JSON.stringify(routine));
      return setDoc(docRef, sanitized, { merge: true });
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
      const initialWeight = re.defaultWeight || bestWeightsMap[re.exerciseId] || 0;

      let sets: WorkoutSet[];
      if (re.setsTemplate && re.setsTemplate.length > 0) {
        sets = re.setsTemplate.map((st) => ({
          id: generateId(),
          weight: st.weight !== undefined ? st.weight : initialWeight,
          reps: st.reps,
          isWarmup: st.isWarmup ?? false,
          completed: false,
        }));
      } else {
        const setsCount = re.targetSets || 4;
        const initialReps = re.defaultReps || 8;
        sets = Array.from({ length: setsCount }).map(() => ({
          id: generateId(),
          weight: initialWeight,
          reps: initialReps,
          completed: false,
        }));
      }

      return {
        id: generateId(),
        exerciseId: re.exerciseId,
        name: re.name,
        muscleGroup: re.muscleGroup as MuscleGroup,
        notes: re.notes,
        restSeconds: re.restSeconds ?? routine.defaultRestSeconds ?? 90,
        sets,
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
