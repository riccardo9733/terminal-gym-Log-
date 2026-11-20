import { WorkoutSession, WorkoutRoutine, MuscleGroup } from '../types/workout';
import { generateAsciiBar } from '../lib/asciiStats';

export interface WeeklyTelemetry {
  currentWeekWorkouts: number;
  prevWeekWorkouts: number;
  currentWeekVolume: number;
  prevWeekVolume: number;
  volumeDeltaPercent: number;
  currentWeekSets: number;
  avgDurationMinutes: number;
  activeStreakWeeks: number;
  muscleDistribution: Array<{
    muscleGroup: MuscleGroup;
    sets: number;
    percentage: number;
    asciiBar: string;
  }>;
}

export interface RoutineAnalytics {
  routineId: string;
  routineTitle: string;
  plannedExercisesCount: number;
  plannedSetsTotal: number;
  plannedMuscleSplit: Array<{
    muscleGroup: MuscleGroup;
    sets: number;
    asciiBar: string;
  }>;
  executionCount: number;
  avgDurationMinutes: number;
  lastExecutedAt?: number;
  lastTonnage?: number;
  tonnageProgressionDeltaPercent?: number; // Delta between first and latest or last two
}

export interface SessionComparison {
  prevSessionId: string;
  prevSessionTitle: string;
  prevDate: number;
  volumeDelta: number;
  volumeDeltaPercent: number;
  durationDeltaMinutes: number;
  setsDelta: number;
}

export interface HeatmapDay {
  dateStr: string; // YYYY-MM-DD
  count: number;
  char: string; // '·' | '░' | '▒' | '▓' | '█'
}

export interface ActivityHeatmap {
  weeks: HeatmapDay[][]; // Array of 7-day columns (Mon to Sun)
  totalSessionsInPeriod: number;
}

/**
 * Helper to get the start of the week (Monday at 00:00:00) for a given timestamp
 */
function getStartOfWeek(epochMs: number): number {
  const d = new Date(epochMs);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday (0) to make Monday first
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Calculates session total volume
 */
export function calculateSessionVolume(session: WorkoutSession): number {
  if (!session.exercises) return 0;
  return session.exercises.reduce((acc, ex) => {
    return (
      acc +
      ex.sets
        .filter((s) => s.completed)
        .reduce((sAcc, s) => sAcc + s.weight * s.reps, 0)
    );
  }, 0);
}

/**
 * Calculates session total completed sets
 */
export function calculateSessionCompletedSets(session: WorkoutSession): number {
  if (!session.exercises) return 0;
  return session.exercises.reduce((acc, ex) => {
    return acc + ex.sets.filter((s) => s.completed).length;
  }, 0);
}

/**
 * Aggregates weekly telemetry and muscle split from workout history
 */
export function getWeeklyTelemetry(history: WorkoutSession[]): WeeklyTelemetry {
  const now = Date.now();
  const currentWeekStart = getStartOfWeek(now);
  const prevWeekStart = currentWeekStart - 7 * 24 * 60 * 60 * 1000;

  const currentWeekSessions = history.filter(
    (s) => s.startedAt >= currentWeekStart && s.startedAt <= now
  );
  const prevWeekSessions = history.filter(
    (s) => s.startedAt >= prevWeekStart && s.startedAt < currentWeekStart
  );

  const currentWeekWorkouts = currentWeekSessions.length;
  const prevWeekWorkouts = prevWeekSessions.length;

  const currentWeekVolume = currentWeekSessions.reduce((acc, s) => acc + calculateSessionVolume(s), 0);
  const prevWeekVolume = prevWeekSessions.reduce((acc, s) => acc + calculateSessionVolume(s), 0);

  const volumeDeltaPercent =
    prevWeekVolume > 0
      ? Math.round(((currentWeekVolume - prevWeekVolume) / prevWeekVolume) * 1000) / 10
      : 0;

  const currentWeekSets = currentWeekSessions.reduce(
    (acc, s) => acc + calculateSessionCompletedSets(s),
    0
  );

  // Average duration
  let totalMinutes = 0;
  let countWithDuration = 0;
  currentWeekSessions.forEach((s) => {
    if (s.endedAt && s.endedAt > s.startedAt) {
      totalMinutes += Math.round((s.endedAt - s.startedAt) / (1000 * 60));
      countWithDuration++;
    }
  });
  const avgDurationMinutes = countWithDuration > 0 ? Math.round(totalMinutes / countWithDuration) : 0;

  // Muscle group set distribution (from past 14 days or current week)
  const recentSessions = history.filter((s) => s.startedAt >= currentWeekStart - 7 * 24 * 60 * 60 * 1000);
  const muscleMap: Partial<Record<MuscleGroup, number>> = {};

  recentSessions.forEach((s) => {
    s.exercises?.forEach((ex) => {
      const completedCount = ex.sets.filter((set) => set.completed).length;
      if (completedCount > 0) {
        muscleMap[ex.muscleGroup] = (muscleMap[ex.muscleGroup] || 0) + completedCount;
      }
    });
  });

  const muscleEntries = Object.entries(muscleMap) as [MuscleGroup, number][];
  const totalRecentSets = muscleEntries.reduce((acc, [, sets]) => acc + sets, 0);
  const maxMuscleSets = Math.max(1, ...muscleEntries.map(([, sets]) => sets));

  const muscleDistribution = muscleEntries
    .sort((a, b) => b[1] - a[1])
    .map(([muscleGroup, sets]) => ({
      muscleGroup,
      sets,
      percentage: totalRecentSets > 0 ? Math.round((sets / totalRecentSets) * 100) : 0,
      asciiBar: generateAsciiBar(sets, maxMuscleSets, 10),
    }));

  // Active weekly streak calculation
  let streak = 0;
  let checkWeekStart = currentWeekStart;
  while (true) {
    const hasWorkout = history.some(
      (s) => s.startedAt >= checkWeekStart && s.startedAt < checkWeekStart + 7 * 24 * 60 * 60 * 1000
    );
    if (hasWorkout) {
      streak++;
      checkWeekStart -= 7 * 24 * 60 * 60 * 1000;
    } else {
      break;
    }
  }

  return {
    currentWeekWorkouts,
    prevWeekWorkouts,
    currentWeekVolume,
    prevWeekVolume,
    volumeDeltaPercent,
    currentWeekSets,
    avgDurationMinutes,
    activeStreakWeeks: streak,
    muscleDistribution,
  };
}

/**
 * Calculates routine analytics and historical performance
 */
export function getRoutineAnalytics(
  routine: WorkoutRoutine,
  history: WorkoutSession[]
): RoutineAnalytics {
  const plannedSetsTotal = routine.exercises.reduce((acc, ex) => acc + (ex.targetSets || 3), 0);

  // Planned muscle split
  const muscleMap: Partial<Record<MuscleGroup, number>> = {};
  routine.exercises.forEach((ex) => {
    muscleMap[ex.muscleGroup] = (muscleMap[ex.muscleGroup] || 0) + (ex.targetSets || 3);
  });

  const muscleEntries = Object.entries(muscleMap) as [MuscleGroup, number][];
  const maxSets = Math.max(1, ...muscleEntries.map(([, sets]) => sets));

  const plannedMuscleSplit = muscleEntries
    .sort((a, b) => b[1] - a[1])
    .map(([muscleGroup, sets]) => ({
      muscleGroup,
      sets,
      asciiBar: generateAsciiBar(sets, maxSets, 8),
    }));

  // Find matching executions in history (sorted oldest to newest)
  const executions = history
    .filter(
      (s) =>
        s.routineId === routine.id ||
        (routine.title && s.title.toLowerCase().includes(routine.title.toLowerCase()))
    )
    .sort((a, b) => a.startedAt - b.startedAt);

  const executionCount = executions.length;
  let avgDurationMinutes = 0;
  let lastExecutedAt: number | undefined;
  let lastTonnage: number | undefined;
  let tonnageProgressionDeltaPercent: number | undefined;

  if (executionCount > 0) {
    const latest = executions[executions.length - 1];
    lastExecutedAt = latest.startedAt;
    lastTonnage = calculateSessionVolume(latest);

    let totalDuration = 0;
    let validDurationCount = 0;
    executions.forEach((s) => {
      if (s.endedAt && s.endedAt > s.startedAt) {
        totalDuration += Math.round((s.endedAt - s.startedAt) / (1000 * 60));
        validDurationCount++;
      }
    });
    if (validDurationCount > 0) {
      avgDurationMinutes = Math.round(totalDuration / validDurationCount);
    }

    if (executions.length >= 2) {
      const prev = executions[executions.length - 2];
      const prevVolume = calculateSessionVolume(prev);
      if (prevVolume > 0 && lastTonnage > 0) {
        tonnageProgressionDeltaPercent =
          Math.round(((lastTonnage - prevVolume) / prevVolume) * 1000) / 10;
      }
    }
  }

  return {
    routineId: routine.id,
    routineTitle: routine.title,
    plannedExercisesCount: routine.exercises.length,
    plannedSetsTotal,
    plannedMuscleSplit,
    executionCount,
    avgDurationMinutes,
    lastExecutedAt,
    lastTonnage,
    tonnageProgressionDeltaPercent,
  };
}

/**
 * Finds the immediate prior session of the same routine/title and computes deltas
 */
export function getSessionComparison(
  session: WorkoutSession,
  history: WorkoutSession[]
): SessionComparison | null {
  // Find preceding session with same routineId or similar title
  const priorSessions = history
    .filter(
      (s) =>
        s.id !== session.id &&
        s.startedAt < session.startedAt &&
        ((session.routineId && s.routineId === session.routineId) ||
          (session.title && s.title.toLowerCase() === session.title.toLowerCase()))
    )
    .sort((a, b) => b.startedAt - a.startedAt);

  if (priorSessions.length === 0) return null;

  const prior = priorSessions[0];
  const curVol = calculateSessionVolume(session);
  const prevVol = calculateSessionVolume(prior);
  const volDelta = curVol - prevVol;
  const volDeltaPercent = prevVol > 0 ? Math.round((volDelta / prevVol) * 1000) / 10 : 0;

  const curDurMin = session.endedAt
    ? Math.round((session.endedAt - session.startedAt) / (1000 * 60))
    : 0;
  const prevDurMin = prior.endedAt
    ? Math.round((prior.endedAt - prior.startedAt) / (1000 * 60))
    : 0;

  const curSets = calculateSessionCompletedSets(session);
  const prevSets = calculateSessionCompletedSets(prior);

  return {
    prevSessionId: prior.id,
    prevSessionTitle: prior.title,
    prevDate: prior.startedAt,
    volumeDelta: volDelta,
    volumeDeltaPercent: volDeltaPercent,
    durationDeltaMinutes: curDurMin - prevDurMin,
    setsDelta: curSets - prevSets,
  };
}

/**
 * Generates compact ASCII GitHub-style activity matrix for the last N weeks
 */
export function getActivityHeatmap(history: WorkoutSession[], weeksCount = 10): ActivityHeatmap {
  const now = new Date();
  const dayCounts: Record<string, number> = {};

  history.forEach((s) => {
    const d = new Date(s.startedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    dayCounts[key] = (dayCounts[key] || 0) + 1;
  });

  const weeks: HeatmapDay[][] = [];
  const startOfWeekNow = getStartOfWeek(now.getTime());
  let totalSessionsInPeriod = 0;

  for (let w = weeksCount - 1; w >= 0; w--) {
    const weekStartEpoch = startOfWeekNow - w * 7 * 24 * 60 * 60 * 1000;
    const weekDays: HeatmapDay[] = [];

    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const dayEpoch = weekStartEpoch + dayIdx * 24 * 60 * 60 * 1000;
      const d = new Date(dayEpoch);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      const count = dayCounts[key] || 0;
      totalSessionsInPeriod += count;

      let char = '·';
      if (count === 1) char = '░';
      else if (count === 2) char = '▒';
      else if (count >= 3) char = '█';

      weekDays.push({
        dateStr: key,
        count,
        char,
      });
    }

    weeks.push(weekDays);
  }

  return {
    weeks,
    totalSessionsInPeriod,
  };
}
