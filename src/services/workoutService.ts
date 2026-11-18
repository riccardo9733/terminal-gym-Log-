import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { WorkoutSession } from '../types/workout';

const LOCAL_STORAGE_ACTIVE_WORKOUT_KEY = 'terminal_gym_active_workout';
const LOCAL_STORAGE_HISTORY_KEY = 'terminal_gym_workout_history';

export const workoutService = {
  // Listen to active workout session
  subscribeToActiveWorkout(
    userId: string,
    onData: (session: WorkoutSession | null, fromCache: boolean, hasPendingWrites: boolean) => void
  ): () => void {
    if (!isFirebaseConfigured || !db || userId === 'demo-user') {
      // Local demo mode
      const raw = localStorage.getItem(`${LOCAL_STORAGE_ACTIVE_WORKOUT_KEY}_${userId}`);
      if (raw) {
        try {
          onData(JSON.parse(raw), true, false);
        } catch {
          onData(null, true, false);
        }
      } else {
        onData(null, true, false);
      }

      const handler = (e: StorageEvent) => {
        if (e.key === `${LOCAL_STORAGE_ACTIVE_WORKOUT_KEY}_${userId}`) {
          try {
            onData(e.newValue ? JSON.parse(e.newValue) : null, true, false);
          } catch {
            onData(null, true, false);
          }
        }
      };
      window.addEventListener('storage', handler);
      return () => window.removeEventListener('storage', handler);
    }

    // Firestore subscription
    const q = query(
      collection(db, 'users', userId, 'workouts'),
      where('status', '==', 'active')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const fromCache = snapshot.metadata.fromCache;
        const hasPendingWrites = snapshot.metadata.hasPendingWrites;
        if (snapshot.empty) {
          onData(null, fromCache, hasPendingWrites);
        } else {
          const docData = snapshot.docs[0].data() as WorkoutSession;
          onData(docData, fromCache, hasPendingWrites);
        }
      },
      (error) => {
        console.warn('Firestore active workout subscription error:', error);
      }
    );
  },

  // Save or update a workout session (atomic single document)
  async saveWorkout(userId: string, workout: WorkoutSession): Promise<void> {
    const payload: WorkoutSession = {
      ...workout,
      updatedAt: Date.now(),
    };

    // Always mirror to local storage for instant offline recovery
    if (workout.status === 'active') {
      localStorage.setItem(
        `${LOCAL_STORAGE_ACTIVE_WORKOUT_KEY}_${userId}`,
        JSON.stringify(payload)
      );
    } else {
      localStorage.removeItem(`${LOCAL_STORAGE_ACTIVE_WORKOUT_KEY}_${userId}`);
      // Save completed to local history
      const historyRaw = localStorage.getItem(`${LOCAL_STORAGE_HISTORY_KEY}_${userId}`);
      const history: WorkoutSession[] = historyRaw ? JSON.parse(historyRaw) : [];
      const updated = [payload, ...history.filter((w) => w.id !== payload.id)];
      localStorage.setItem(`${LOCAL_STORAGE_HISTORY_KEY}_${userId}`, JSON.stringify(updated));
    }

    if (!isFirebaseConfigured || !db || userId === 'demo-user') {
      return;
    }

    const docRef = doc(db, 'users', userId, 'workouts', workout.id);
    // Non-blocking firestore write (persists to local IndexedDB immediately)
    return setDoc(docRef, payload, { merge: true });
  },

  // Delete a workout session
  async deleteWorkout(userId: string, workoutId: string): Promise<void> {
    // Clear local storage
    const activeRaw = localStorage.getItem(`${LOCAL_STORAGE_ACTIVE_WORKOUT_KEY}_${userId}`);
    if (activeRaw) {
      const active = JSON.parse(activeRaw);
      if (active.id === workoutId) {
        localStorage.removeItem(`${LOCAL_STORAGE_ACTIVE_WORKOUT_KEY}_${userId}`);
      }
    }

    const historyRaw = localStorage.getItem(`${LOCAL_STORAGE_HISTORY_KEY}_${userId}`);
    if (historyRaw) {
      const history: WorkoutSession[] = JSON.parse(historyRaw);
      localStorage.setItem(
        `${LOCAL_STORAGE_HISTORY_KEY}_${userId}`,
        JSON.stringify(history.filter((w) => w.id !== workoutId))
      );
    }

    if (!isFirebaseConfigured || !db || userId === 'demo-user') {
      return;
    }

    const docRef = doc(db, 'users', userId, 'workouts', workoutId);
    return deleteDoc(docRef);
  },

  // Fetch workout history
  async getWorkoutHistory(userId: string): Promise<WorkoutSession[]> {
    if (!isFirebaseConfigured || !db || userId === 'demo-user') {
      const raw = localStorage.getItem(`${LOCAL_STORAGE_HISTORY_KEY}_${userId}`);
      return raw ? JSON.parse(raw) : [];
    }

    try {
      const q = query(
        collection(db, 'users', userId, 'workouts'),
        where('status', '==', 'completed')
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((d) => d.data() as WorkoutSession);
      list.sort((a, b) => b.startedAt - a.startedAt);
      return list;
    } catch (error) {
      console.warn('Failed to load history from Firestore, falling back to local storage', error);
      const raw = localStorage.getItem(`${LOCAL_STORAGE_HISTORY_KEY}_${userId}`);
      return raw ? JSON.parse(raw) : [];
    }
  },
};
