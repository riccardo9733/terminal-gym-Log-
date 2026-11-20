import { useState, useMemo } from 'react';
import {
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { WorkoutSession, MuscleGroup } from '../../types/workout';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AsciiBox } from '../ui/ascii-box';
import { formatDate, formatDuration } from '../../lib/utils';
import { ExerciseHistoryDrawer } from './ExerciseHistoryDrawer';
import { getExerciseHistory, ExerciseHistorySummary } from '../../services/exerciseHistoryService';
import {
  getWeeklyTelemetry,
  getSessionComparison,
  getActivityHeatmap,
} from '../../services/statsService';
import { formatDelta, formatTonnage } from '../../lib/asciiStats';

interface HistoryViewProps {
  history: WorkoutSession[];
  onStartFromTemplate: (workout: WorkoutSession) => void;
  onDeleteWorkout: (workoutId: string) => void;
}

const DAY_LABELS = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'];

export function HistoryView({
  history,
  onStartFromTemplate,
  onDeleteWorkout,
}: HistoryViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedExerciseSummary, setSelectedExerciseSummary] = useState<ExerciseHistorySummary | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTelemetry, setShowTelemetry] = useState(true);

  // Compute stats client-side (0ms latency)
  const weeklyTelemetry = useMemo(() => getWeeklyTelemetry(history), [history]);
  const activityHeatmap = useMemo(() => getActivityHeatmap(history, 10), [history]);

  const filteredHistory = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q || history.length < 4) return history;
    return history.filter(
      (w) =>
        w.title.toLowerCase().includes(q) ||
        w.exercises.some((e) => e.name.toLowerCase().includes(q) || e.muscleGroup.toLowerCase().includes(q))
    );
  }, [history, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleOpenExerciseHistory = (exerciseId: string, name: string, muscle: MuscleGroup) => {
    const summary = getExerciseHistory(exerciseId, history, name, muscle);
    setSelectedExerciseSummary(summary);
    setDrawerOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col space-y-3 px-3 pt-3 pb-24 font-mono">
      {/* Header with Machine Ticker */}
      <div className="flex items-center justify-between border-b border-border/80 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-accent font-bold">&gt;</span>
          <h2 className="text-xs font-bold font-mono tracking-wider uppercase text-foreground">
            LOGSTREAM // ALL SESSIONS ({history.length})
          </h2>
        </div>

        {history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTelemetry((prev) => !prev)}
            className="h-7 px-2 text-[10px] font-mono font-bold text-accent hover:bg-accent/10"
            title="Mostra/Nascondi dashboard statistiche"
          >
            {showTelemetry ? '[ ▲ NASCONDI STATS ]' : '[ ▼ MOSTRA STATS ]'}
          </Button>
        )}
      </div>

      {/* Telemetry & Stats Dashboard (Collapsible) */}
      {history.length > 0 && showTelemetry && (
        <div className="border border-border bg-card p-2.5 rounded-[2px] space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground border-b border-border/40 pb-1.5">
            <span className="font-bold text-foreground">┌─[ TELEMETRIA // CURRENT_WEEK ]</span>
            {weeklyTelemetry.activeStreakWeeks > 0 && (
              <span className="text-accent font-bold tabular-nums">
                STREAK: {weeklyTelemetry.activeStreakWeeks} SETT.
              </span>
            )}
          </div>

          {/* 4-Pane Weekly Summary Grid */}
          <div className="grid grid-cols-4 gap-1.5">
            {/* Workouts this week */}
            <div className="border border-border bg-secondary/30 p-1.5 rounded-[2px] text-center">
              <div className="text-[8px] font-mono text-muted-foreground uppercase font-bold">
                SESS (7D)
              </div>
              <div className="text-sm font-black font-mono text-foreground mt-0.5 tabular-nums">
                {weeklyTelemetry.currentWeekWorkouts}
              </div>
              <div className="text-[8px] text-muted-foreground/70 font-mono mt-0.5">
                prev: {weeklyTelemetry.prevWeekWorkouts}
              </div>
            </div>

            {/* Volume this week */}
            <div className="border border-border bg-secondary/30 p-1.5 rounded-[2px] text-center">
              <div className="text-[8px] font-mono text-muted-foreground uppercase font-bold">
                TONNAGGIO
              </div>
              <div className="text-sm font-black font-mono text-accent mt-0.5 tabular-nums">
                {formatTonnage(weeklyTelemetry.currentWeekVolume)}
              </div>
              <div
                className={`text-[8px] font-bold font-mono mt-0.5 tabular-nums ${
                  weeklyTelemetry.volumeDeltaPercent > 0
                    ? 'text-accent'
                    : weeklyTelemetry.volumeDeltaPercent < 0
                    ? 'text-destructive'
                    : 'text-muted-foreground/60'
                }`}
              >
                {weeklyTelemetry.prevWeekVolume > 0
                  ? formatDelta(weeklyTelemetry.volumeDeltaPercent, { isPercent: true }).text
                  : '—'}
              </div>
            </div>

            {/* Total Completed Sets */}
            <div className="border border-border bg-secondary/30 p-1.5 rounded-[2px] text-center">
              <div className="text-[8px] font-mono text-muted-foreground uppercase font-bold">
                SERIE TOT
              </div>
              <div className="text-sm font-black font-mono text-foreground mt-0.5 tabular-nums">
                {weeklyTelemetry.currentWeekSets}
              </div>
              <div className="text-[8px] text-muted-foreground/70 font-mono mt-0.5">
                allenanti
              </div>
            </div>

            {/* Avg Duration */}
            <div className="border border-border bg-secondary/30 p-1.5 rounded-[2px] text-center">
              <div className="text-[8px] font-mono text-muted-foreground uppercase font-bold">
                DURATA MED
              </div>
              <div className="text-sm font-black font-mono text-foreground mt-0.5 tabular-nums">
                {weeklyTelemetry.avgDurationMinutes > 0 ? `${weeklyTelemetry.avgDurationMinutes}m` : '—'}
              </div>
              <div className="text-[8px] text-muted-foreground/70 font-mono mt-0.5">
                a sessione
              </div>
            </div>
          </div>

          {/* Muscle Volume Split ASCII Bars */}
          {weeklyTelemetry.muscleDistribution.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-border/40">
              <div className="text-[9px] font-mono uppercase text-muted-foreground font-bold">
                ┌─[ RIPARTIZIONE SERIE PER DISTRETTO (ULTIME 2 SETT.) ]
              </div>
              <div className="space-y-1 font-mono text-[10px] pt-0.5">
                {weeklyTelemetry.muscleDistribution.slice(0, 5).map((item) => (
                  <div key={item.muscleGroup} className="flex items-center justify-between text-muted-foreground">
                    <span className="w-14 truncate uppercase text-foreground/90 font-semibold text-[9px]">
                      {item.muscleGroup}
                    </span>
                    <span className="text-accent font-black tracking-widest text-[9px] select-none mx-2">
                      {item.asciiBar}
                    </span>
                    <span className="tabular-nums text-foreground text-[9px] shrink-0 font-bold">
                      {item.sets}s ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Consistency Heatmap (Last 10 Weeks) */}
          <div className="space-y-1 pt-1 border-t border-border/40">
            <div className="flex items-center justify-between text-[9px] font-mono uppercase text-muted-foreground font-bold">
              <span>┌─[ CONSISTENZA ATTIVITÀ // 10 SETTIMANE ]</span>
              <span className="text-foreground/70 tabular-nums">
                {activityHeatmap.totalSessionsInPeriod} sess
              </span>
            </div>
            <div className="bg-secondary/20 p-2 rounded-[2px] overflow-x-auto">
              <div className="grid grid-flow-col auto-cols-max gap-x-2 text-[10px] font-mono select-none">
                {/* Labels column */}
                <div className="grid grid-rows-7 gap-y-0.5 text-[8px] text-muted-foreground font-bold pr-1">
                  {DAY_LABELS.map((day, idx) => (
                    <span key={day} className="h-3 flex items-center">
                      {idx % 2 === 0 ? day : ''}
                    </span>
                  ))}
                </div>
                {/* Week columns */}
                {activityHeatmap.weeks.map((week, wIdx) => (
                  <div key={wIdx} className="grid grid-rows-7 gap-y-0.5">
                    {week.map((day) => (
                      <span
                        key={day.dateStr}
                        className={`h-3 w-3 flex items-center justify-center rounded-[1px] text-[9px] leading-none ${
                          day.count > 0
                            ? 'bg-accent/20 text-accent font-black border border-accent/40'
                            : 'text-muted-foreground/30'
                        }`}
                        title={`${day.dateStr}: ${day.count} sessioni`}
                      >
                        {day.char}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-[8px] font-mono text-muted-foreground/60 pt-1.5 border-t border-border/30 mt-1.5">
                <span>· RIPOSO</span>
                <span>░ 1 SESSIONE</span>
                <span>▒ 2+ SESSIONI</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Filter - only shown when there are 4 or more sessions */}
      {history.length >= 4 && (
        <div className="relative flex items-center border border-border bg-card px-2.5 py-1.5 text-xs rounded-[2px]">
          <span className="text-accent font-bold mr-2 select-none">$ grep</span>
          <input
            type="text"
            placeholder="data_o_esercizio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 w-full bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
          />
          <span className="text-accent animate-pulse font-mono select-none">█</span>
        </div>
      )}

      {history.length === 0 ? (
        <div className="rounded-[2px] border border-dashed border-border bg-card/30 p-8 text-center space-y-1.5">
          <p className="text-xs font-mono font-bold text-muted-foreground uppercase">
            NESSUNA_SESSIONE_REGISTRATA
          </p>
          <p className="text-[11px] font-mono text-muted-foreground/60">
            Concludi e salva un allenamento per consultare qui lo storico dettagliato.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((workout) => {
            const isExpanded = expandedId === workout.id;
            const durationSec = workout.endedAt
              ? Math.max(0, Math.floor((workout.endedAt - workout.startedAt) / 1000))
              : 0;

            const totalSets = workout.exercises.reduce(
              (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
              0
            );

            const totalVolume = workout.exercises.reduce((acc, ex) => {
              return (
                acc +
                ex.sets
                  .filter((s) => s.completed)
                  .reduce((sAcc, s) => sAcc + s.weight * s.reps, 0)
              );
            }, 0);

            const dateStr = formatDate(workout.startedAt).split(' ')[0];

            // Session comparison against prior instance of same routine
            const comparison = getSessionComparison(workout, history);

            return (
              <AsciiBox
                key={workout.id}
                title={
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-muted-foreground">LOG</span>
                    <span className="text-foreground font-black truncate">
                      {workout.title}
                    </span>
                    <Badge variant="outline" className="text-[9px]">
                      {dateStr}
                    </Badge>
                  </div>
                }
                status={
                  <button
                    onClick={() => toggleExpand(workout.id)}
                    className="flex items-center gap-1 text-[10px] text-accent font-bold hover:underline"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronDown className="h-3 w-3" />
                        <span>[COLLAPSE]</span>
                      </>
                    ) : (
                      <>
                        <ChevronRight className="h-3 w-3" />
                        <span>[EXPAND]</span>
                      </>
                    )}
                  </button>
                }
                className="space-y-2 hover:border-accent/60 transition-colors"
              >
                {/* Telemetry bar */}
                <div
                  onClick={() => toggleExpand(workout.id)}
                  className="flex items-center justify-between text-[11px] font-mono text-muted-foreground cursor-pointer select-none tabular-nums flex-wrap gap-2 pt-0.5"
                >
                  <div className="flex items-center gap-3">
                    <span>⏱ {formatDuration(durationSec)}</span>
                    <span>{totalSets} serie</span>
                    <span className="text-foreground font-semibold">
                      {totalVolume.toLocaleString()}kg
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/60">
                    {workout.exercises.length} movimenti
                  </span>
                </div>

                {/* Session delta comparison vs prior session */}
                {comparison && (
                  <div className="text-[10px] font-mono bg-secondary/30 px-2 py-1 rounded-[2px] flex items-center justify-between text-muted-foreground">
                    <span>
                      vs PREV: <strong className={comparison.volumeDelta >= 0 ? 'text-accent' : 'text-destructive'}>
                        {formatDelta(comparison.volumeDeltaPercent, { isPercent: true }).text} VOL
                      </strong>
                    </span>
                    {comparison.durationDeltaMinutes !== 0 && (
                      <span className="text-[9px]">
                        TEMPO: {comparison.durationDeltaMinutes > 0 ? `+${comparison.durationDeltaMinutes}m` : `${comparison.durationDeltaMinutes}m`}
                      </span>
                    )}
                  </div>
                )}

                {/* Collapsed quick tree preview */}
                {!isExpanded && (
                  <div className="font-mono text-xs text-muted-foreground space-y-0.5 pt-1 border-t border-border/40">
                    {workout.exercises.slice(0, 3).map((ex, eIdx, arr) => {
                      const isLast = eIdx === arr.length - 1 && workout.exercises.length <= 3;
                      const prefix = isLast ? '└─' : '├─';
                      return (
                        <div key={ex.id || eIdx} className="truncate text-[11px]">
                          <span className="text-accent/60 mr-1.5 select-none">{prefix}</span>
                          <span className="text-foreground">{ex.name}</span>
                          <span className="text-muted-foreground/60 text-[10px] ml-1">
                            ({ex.muscleGroup})
                          </span>
                        </div>
                      );
                    })}
                    {workout.exercises.length > 3 && (
                      <div className="text-[10px] text-muted-foreground/60 pl-3">
                        └─ +{workout.exercises.length - 3} altri movimenti...
                      </div>
                    )}
                  </div>
                )}

                {/* Expanded Clean ASCII Tree Details (Zero nested box noise) */}
                {isExpanded && (
                  <div className="border-t border-border/60 pt-2 space-y-2.5 animate-in fade-in duration-150">
                    <div className="space-y-2 font-mono text-xs">
                      {workout.exercises.map((ex, eIdx) => {
                        const isLast = eIdx === workout.exercises.length - 1;
                        const treeSymbol = isLast ? '└─' : '├─';
                        const completedSets = ex.sets.filter((s) => s.completed);

                        return (
                          <div key={ex.id || eIdx} className="space-y-0.5">
                            {/* Exercise Name line with tree symbol */}
                            <div className="flex items-center justify-between">
                              <div
                                onClick={() => handleOpenExerciseHistory(ex.exerciseId, ex.name, ex.muscleGroup)}
                                className="flex items-center gap-1.5 truncate cursor-pointer group"
                                title="Tocca per aprire storico esercizio"
                              >
                                <span className="text-accent select-none font-bold shrink-0">
                                  {treeSymbol}
                                </span>
                                <span className="font-bold text-foreground group-hover:text-accent group-hover:underline transition-colors truncate">
                                  {ex.name}
                                </span>
                              </div>
                              <span className="text-[10px] text-muted-foreground uppercase shrink-0 tabular-nums font-semibold">
                                [{completedSets.length} SERIE]
                              </span>
                            </div>

                            {/* Clean sets breakdown without borders: e.g. 80kg × 8 │ 80kg × 8 │ 85kg × 6 */}
                            <div className="pl-4 text-[11px] text-foreground/90 tabular-nums flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                              {completedSets.map((set, sIdx) => (
                                <span key={set.id || sIdx} className="inline-flex items-center">
                                  {sIdx > 0 && <span className="text-border mr-1.5 select-none">│</span>}
                                  <span>{set.weight}kg × {set.reps}</span>
                                </span>
                              ))}
                              {completedSets.length === 0 && (
                                <span className="text-muted-foreground/40 text-[10px]">— nessuna serie completata</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-border/40">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteWorkout(workout.id)}
                        className="text-[10px] h-8 px-2 font-mono"
                      >
                        [ ✕ ELIMINA ]
                      </Button>

                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => onStartFromTemplate(workout)}
                        className="text-[10px] h-8 px-3 font-mono font-bold"
                      >
                        [ ↻ RIPETI_SESSIONE ]
                      </Button>
                    </div>
                  </div>
                )}
              </AsciiBox>
            );
          })}
        </div>
      )}

      {/* Exercise Progression History Drawer */}
      <ExerciseHistoryDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        historySummary={selectedExerciseSummary}
      />
    </div>
  );
}
