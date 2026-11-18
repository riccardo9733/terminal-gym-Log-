---
trigger: glob
globs: "src/lib/**, src/services/**, src/hooks/**, src/types/**, firestore.rules"
description: Firestore offline-first persistence, denormalized schema, and hybrid exercise picker rules
---

# Firebase, Offline Sync & Exercise Data Rules

## 1. Firestore Offline-First Initialization (`src/lib/firebase.ts`)
Gym basements frequently lack cellular or Wi-Fi connectivity. Initialize Firestore with persistent local IndexedDB caching:
- Use `initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })`.
- Do not `await` non-critical Firestore writes in UI event handlers when offline; rely on local cache commits and expose sync state via `onSnapshotsInSync` / `metadata.fromCache` / `metadata.hasPendingWrites`.
- Surface connection and sync state in the `44px` top status bar using terminal badges:
  - `SYNCED` (`#30d158`) when online with zero pending writes
  - `OFFLINE [N QUEUED]` (`#ff9f0a`) when offline or syncing pending mutations

## 2. Denormalized Firestore Data Model
Keep reads and writes minimal to stay well within Firebase free-tier quotas and guarantee atomic offline saves.

### Collection: `users/{uid}/workouts/{workoutId}`
Each workout session is a single self-contained document:
```ts
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
}
```

### Document: `users/{uid}/meta/exercises`
Stores the user's personalized exercise dictionary and usage frequency:
```ts
export interface UserExerciseMeta {
  id: string;              // Canonical slug
  name: string;
  muscleGroup: MuscleGroup;
  isCustom: boolean;
  usageCount: number;
  lastUsedAt: number;
  bestWeight?: number;     // Cached PR for instant inline display
}
```

## 3. Hybrid Exercise Strategy (Creatable Combobox)
1. **Static Seed (`src/data/default-exercises.ts`):** Bundle ~60–80 fundamental exercises as a typed constant array (`DEFAULT_EXERCISES`). Zero Firestore reads required on first launch.
2. **Merge & Rank:** In the exercise picker (`Command` + `Popover`/`Drawer`), merge `userExercises` with `DEFAULT_EXERCISES` (deduplicated by `id`), sorting recently and frequently used exercises to the top.
3. **Inline Creation:** When the search query does not match an existing exercise, render a `+ CREATE "<QUERY>"` option at the bottom of the command list. Selecting it generates a deterministic slug (`slugify(name)`), adds it to `users/{uid}/meta/exercises`, and inserts it into the active workout immediately.

## 4. Security Rules (`firestore.rules`)
Enforce strict owner-only isolation:
- `match /users/{userId}/{document=**}` -> `allow read, write: if request.auth != null && request.auth.uid == userId;`