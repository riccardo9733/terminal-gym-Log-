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

export interface RepRecords {
  oneRM: number;
  threeRM: number;
  fiveRM: number;
  eightRM: number;
  tenRM: number;
}

export interface DeltaVsPrevious {
  weightDelta: number;
  weightPercent: number;
  volumeDelta: number;
  volumePercent: number;
  oneRMDelta: number;
  oneRMPercent: number;
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
  // Advanced Telemetry
  repRecords: RepRecords;
  deltaVsPrevious: DeltaVsPrevious | null;
  sparklineValues: number[]; // chronologically ordered 1RM for trend chart (oldest to newest)
  daysSinceLast: number | null; // days since last execution
  avgRestDays: number | null; // average days between sessions
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

  const repRecords: RepRecords = {
    oneRM: 0,
    threeRM: 0,
    fiveRM: 0,
    eightRM: 0,
    tenRM: 0,
  };

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

        // Rep Records calculation (weight lifted for >= target reps)
        if (s.reps >= 1 && s.weight > repRecords.oneRM) repRecords.oneRM = s.weight;
        if (s.reps >= 3 && s.weight > repRecords.threeRM) repRecords.threeRM = s.weight;
        if (s.reps >= 5 && s.weight > repRecords.fiveRM) repRecords.fiveRM = s.weight;
        if (s.reps >= 8 && s.weight > repRecords.eightRM) repRecords.eightRM = s.weight;
        if (s.reps >= 10 && s.weight > repRecords.tenRM) repRecords.tenRM = s.weight;
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

  // Compute Delta vs Previous Session
  let deltaVsPrevious: DeltaVsPrevious | null = null;
  if (sessionLogs.length >= 2) {
    const latest = sessionLogs[0];
    const prev = sessionLogs[1];

    const weightDelta = latest.bestWeight - prev.bestWeight;
    const weightPercent = prev.bestWeight > 0 ? Math.round((weightDelta / prev.bestWeight) * 1000) / 10 : 0;

    const volumeDelta = latest.totalVolume - prev.totalVolume;
    const volumePercent = prev.totalVolume > 0 ? Math.round((volumeDelta / prev.totalVolume) * 1000) / 10 : 0;

    const oneRMDelta = latest.estimatedOneRepMax - prev.estimatedOneRepMax;
    const oneRMPercent = prev.estimatedOneRepMax > 0 ? Math.round((oneRMDelta / prev.estimatedOneRepMax) * 1000) / 10 : 0;

    deltaVsPrevious = {
      weightDelta,
      weightPercent,
      volumeDelta,
      volumePercent,
      oneRMDelta,
      oneRMPercent,
    };
  }

  // Compute chronological sparkline values (up to 10 latest sessions, oldest -> newest)
  const sparklineValues = sessionLogs
    .slice(0, 10)
    .reverse()
    .map((log) => log.estimatedOneRepMax || log.bestWeight);

  // Compute recovery cadence
  let daysSinceLast: number | null = null;
  let avgRestDays: number | null = null;

  if (sessionLogs.length > 0) {
    daysSinceLast = Math.max(0, Math.floor((Date.now() - sessionLogs[0].date) / (1000 * 60 * 60 * 24)));

    if (sessionLogs.length >= 2) {
      let totalGapDays = 0;
      for (let i = 0; i < sessionLogs.length - 1; i++) {
        const gap = Math.max(0, (sessionLogs[i].date - sessionLogs[i + 1].date) / (1000 * 60 * 60 * 24));
        totalGapDays += gap;
      }
      avgRestDays = Math.round((totalGapDays / (sessionLogs.length - 1)) * 10) / 10;
    }
  }

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
    repRecords,
    deltaVsPrevious,
    sparklineValues,
    daysSinceLast,
    avgRestDays,
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
