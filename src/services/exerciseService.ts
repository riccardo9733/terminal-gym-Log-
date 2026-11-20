import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { UserExerciseMeta, MuscleGroup } from '../types/workout';
import { slugify } from '../lib/utils';

const LOCAL_STORAGE_EXERCISES_KEY = 'terminal_gym_custom_exercises';

export const exerciseService = {
  // Fetch user exercise dictionary
  async getUserExercises(userId: string): Promise<Record<string, UserExerciseMeta>> {
    const localRaw = localStorage.getItem(`${LOCAL_STORAGE_EXERCISES_KEY}_${userId}`);
    const localMap: Record<string, UserExerciseMeta> = localRaw ? JSON.parse(localRaw) : {};

    if (!isFirebaseConfigured || !db || userId === 'demo-user') {
      return localMap;
    }

    try {
      const docRef = doc(db, 'users', userId, 'meta', 'exercises');
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const firestoreMap = snapshot.data() as Record<string, UserExerciseMeta>;
        const merged = { ...firestoreMap, ...localMap };
        localStorage.setItem(`${LOCAL_STORAGE_EXERCISES_KEY}_${userId}`, JSON.stringify(merged));
        return merged;
      }
    } catch (error) {
      console.warn('Error reading exercises meta from Firestore:', error);
    }

    return localMap;
  },

  // Record exercise usage and update PR
  async recordExerciseUsage(
    userId: string,
    exerciseId: string,
    name: string,
    muscleGroup: MuscleGroup,
    weight?: number,
    isCustom = false
  ): Promise<UserExerciseMeta> {
    const existingMap = await this.getUserExercises(userId);
    const existing = existingMap[exerciseId];

    const currentBest = existing?.bestWeight ?? 0;
    const newBest = weight && weight > currentBest ? weight : currentBest;

    const updatedItem: UserExerciseMeta = {
      id: exerciseId,
      name,
      muscleGroup,
      isCustom: isCustom || (existing?.isCustom ?? false),
      usageCount: (existing?.usageCount || 0) + 1,
      lastUsedAt: Date.now(),
      bestWeight: newBest > 0 ? newBest : undefined,
    };

    const updatedMap = {
      ...existingMap,
      [exerciseId]: updatedItem,
    };

    localStorage.setItem(
      `${LOCAL_STORAGE_EXERCISES_KEY}_${userId}`,
      JSON.stringify(updatedMap)
    );

    if (isFirebaseConfigured && db && userId !== 'demo-user') {
      const docRef = doc(db, 'users', userId, 'meta', 'exercises');
      const sanitized = JSON.parse(JSON.stringify(updatedMap));
      setDoc(docRef, sanitized, { merge: true }).catch((err) => {
        console.warn('Error syncing exercise meta to Firestore:', err);
      });
    }

    return updatedItem;
  },

  // Create custom exercise inline
  async createCustomExercise(
    userId: string,
    name: string,
    muscleGroup: MuscleGroup = 'other'
  ): Promise<UserExerciseMeta> {
    const id = slugify(name);
    return this.recordExerciseUsage(userId, id, name, muscleGroup, undefined, true);
  },
};
