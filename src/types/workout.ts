export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms'
  | 'core'
  | 'conditioning'
  | 'other';

export interface WorkoutSet {
  id: string;
  weight: number;          // Stored in user's preferred unit (kg default)
  reps: number;
  rpe?: number;            // Optional 1-10 scale
  isWarmup?: boolean;
  completed: boolean;
  completedAt?: number;    // Epoch ms
}

export interface WorkoutExercise {
  id: string;              // Instance ID inside this workout
  exerciseId: string;      // Canonical slug (e.g., "barbell-bench-press")
  name: string;            // Display name snapshot
  muscleGroup: MuscleGroup;
  notes?: string;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  title: string;           // e.g., "UPPER_A" or "2026-11-18_SESSION"
  status: 'active' | 'completed';
  startedAt: number;       // Epoch ms
  endedAt?: number;        // Epoch ms
  exercises: WorkoutExercise[];
  updatedAt: number;
  routineId?: string;      // Associated routine template ID if launched from a routine
}

export interface RoutineExercise {
  exerciseId: string;
  name: string;
  muscleGroup: MuscleGroup;
  targetSets: number;
  defaultWeight?: number;
  defaultReps?: number;
  notes?: string;
}

export interface WorkoutRoutine {
  id: string;
  title: string;
  description?: string;
  exercises: RoutineExercise[];
  createdAt: number;
  updatedAt: number;
  lastPerformedAt?: number;
}

export interface UserExerciseMeta {
  id: string;              // Canonical slug
  name: string;
  muscleGroup: MuscleGroup;
  isCustom: boolean;
  usageCount: number;
  lastUsedAt: number;
  bestWeight?: number;     // Cached PR for instant inline display
}

export interface DefaultExercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  aliases?: string[];
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
}

export interface SyncStatus {
  isOnline: boolean;
  pendingWritesCount: number;
  isFromCache: boolean;
  isDemoMode: boolean; // True when Firebase credentials are not provided
}
