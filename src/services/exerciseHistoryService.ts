import { WorkoutSession, MuscleGroup } from '../types/workout';

export interface ExerciseSetHistory {
  id: string;
  setIndex: number;
  weight: number;
  reps: number;
  isWarmup?: boolean;
}

export interface ExerciseSessionLog {
  workoutId: string;
  workoutTitle: string;
  date: number; // startedAt
  sets: ExerciseSetHistory[];
  bestWeight: number;
  totalVolume: number;
  estimatedOneRepMax: number;
  isPR?: boolean;
}

export interface ExerciseHistorySummary {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  totalSessions: number;
  lifetimeVolume: number;
  personalRecord: number;
  estimatedMaxOneRepMax: number;
  sessionLogs: ExerciseSessionLog[]; // sorted newest first
  lastPerformanceSets: ExerciseSetHistory[]; // sets from the most recent completed session
}

/**
 * Calculates estimated One-Rep Max (1RM) using Epley formula.
 * Formula: weight * (1 + reps / 30) for reps > 1. If reps == 1, 1RM = weight.
 */
export function calculateOneRepMax(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

/**
 * Extracts comprehensive history and progression metrics for a specific exercise
 * from the user's completed workout sessions.
 */
export function getExerciseHistory(
  exerciseId: string,
  history: WorkoutSession[],
  fallbackName?: string,
  fallbackMuscle?: MuscleGroup
): ExerciseHistorySummary {
  // Filter sessions that contain this exercise, sorted newest first
  const matchingSessions = history
    .filter((session) =>
      session.exercises && session.exercises.some((e) => e.exerciseId === exerciseId)
    )
    .sort((a, b) => b.startedAt - a.startedAt);

  let detectedName = fallbackName || exerciseId;
  let detectedMuscle: MuscleGroup = fallbackMuscle || 'other';
  let lifetimeVolume = 0;
  let personalRecord = 0;
  let estimatedMax1RM = 0;

  const sessionLogs: ExerciseSessionLog[] = [];

  for (const session of matchingSessions) {
    const exerciseInstance = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!exerciseInstance) continue;

    if (exerciseInstance.name) detectedName = exerciseInstance.name;
    if (exerciseInstance.muscleGroup) detectedMuscle = exerciseInstance.muscleGroup;

    // Filter valid completed sets (or sets with weight and reps entered)
    const validSets: ExerciseSetHistory[] = exerciseInstance.sets
      .filter((s) => s.completed || (s.weight > 0 && s.reps > 0))
      .map((s, idx) => ({
        id: s.id,
        setIndex: idx + 1,
        weight: s.weight,
        reps: s.reps,
        isWarmup: s.isWarmup,
      }));

    if (validSets.length === 0) continue;

    let sessionBestWeight = 0;
    let sessionVolume = 0;
    let sessionBest1RM = 0;

    for (const s of validSets) {
      if (!s.isWarmup) {
        if (s.weight > sessionBestWeight) {
          sessionBestWeight = s.weight;
        }
        if (s.weight > personalRecord) {
          personalRecord = s.weight;
        }
      }

      const volume = s.weight * s.reps;
      sessionVolume += volume;
      lifetimeVolume += volume;

      const oneRM = calculateOneRepMax(s.weight, s.reps);
      if (oneRM > sessionBest1RM) {
        sessionBest1RM = oneRM;
      }
      if (oneRM > estimatedMax1RM) {
        estimatedMax1RM = oneRM;
      }
    }

    sessionLogs.push({
      workoutId: session.id,
      workoutTitle: session.title,
      date: session.startedAt,
      sets: validSets,
      bestWeight: sessionBestWeight,
      totalVolume: sessionVolume,
      estimatedOneRepMax: Math.round(sessionBest1RM),
    });
  }

  // Mark which sessions achieved or equaled the all-time PR
  if (personalRecord > 0) {
    sessionLogs.forEach((log) => {
      if (log.bestWeight === personalRecord) {
        log.isPR = true;
      }
    });
  }

  const lastPerformanceSets = sessionLogs.length > 0 ? sessionLogs[0].sets : [];

  return {
    exerciseId,
    exerciseName: detectedName,
    muscleGroup: detectedMuscle,
    totalSessions: sessionLogs.length,
    lifetimeVolume,
    personalRecord,
    estimatedMaxOneRepMax: Math.round(estimatedMax1RM),
    sessionLogs,
    lastPerformanceSets,
  };
}

/**
 * Builds a fast lookup map for all exercises present in history
 */
export function buildExerciseHistoryMap(
  history: WorkoutSession[]
): Record<string, ExerciseHistorySummary> {
  const map: Record<string, ExerciseHistorySummary> = {};
  const exerciseIds = new Set<string>();

  for (const session of history) {
    if (session.exercises) {
      for (const ex of session.exercises) {
        exerciseIds.add(ex.exerciseId);
      }
    }
  }

  for (const id of exerciseIds) {
    map[id] = getExerciseHistory(id, history);
  }

  return map;
}
