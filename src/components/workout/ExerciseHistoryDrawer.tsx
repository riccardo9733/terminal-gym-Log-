import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerFooter,
} from '../ui/drawer';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatDate } from '../../lib/utils';
import { ExerciseHistorySummary } from '../../services/exerciseHistoryService';
import { generateAsciiSparkline, formatDelta, formatTonnage } from '../../lib/asciiStats';
import { MUSCLE_GROUPS_IT } from '../../data/default-exercises';
import { MuscleGroup } from '../../types/workout';

interface ExerciseHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  historySummary: ExerciseHistorySummary | null;
}

export function ExerciseHistoryDrawer({
  open,
  onOpenChange,
  historySummary,
}: ExerciseHistoryDrawerProps) {
  if (!historySummary) return null;

  const {
    exerciseName,
    muscleGroup,
    personalRecord,
    estimatedMaxOneRepMax,
    totalSessions,
    lifetimeVolume,
    sessionLogs,
    repRecords,
    deltaVsPrevious,
    sparklineValues,
    daysSinceLast,
    avgRestDays,
  } = historySummary;

  const sparklineString = generateAsciiSparkline(sparklineValues, 10);
  const minTrend = sparklineValues.length > 0 ? Math.min(...sparklineValues) : 0;
  const maxTrend = sparklineValues.length > 0 ? Math.max(...sparklineValues) : 0;
  const trendDeltaPercent =
    minTrend > 0 && maxTrend > 0 && sparklineValues.length >= 2
      ? Math.round(((sparklineValues[sparklineValues.length - 1] - sparklineValues[0]) / sparklineValues[0]) * 1000) / 10
      : 0;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="font-mono">
        {/* Header */}
        <DrawerHeader>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-accent font-bold select-none">&gt;</span>
            <DrawerTitle className="text-xs font-bold font-mono tracking-tight text-foreground truncate">
              {exerciseName}
            </DrawerTitle>
            <Badge variant="outline" className="text-[9px] uppercase font-bold">
              {MUSCLE_GROUPS_IT[muscleGroup as MuscleGroup] || muscleGroup}
            </Badge>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
            PROGRESSION_TELEMETRY &amp; SESSION_LOGS
          </p>
        </DrawerHeader>

        {/* Body */}
        <DrawerBody className="space-y-3">
          {/* Telemetry Metrics 4-Pane Grid */}
          <div className="grid grid-cols-4 gap-1.5">
            {/* PR */}
            <div className="rounded-[2px] border border-accent/40 bg-accent/5 p-2 text-center">
              <div className="text-[9px] font-mono text-accent uppercase font-bold">
                PR
              </div>
              <div className="text-sm font-black font-mono text-accent mt-0.5 tabular-nums">
                {personalRecord > 0 ? `${personalRecord}kg` : '—'}
              </div>
            </div>

            {/* Est. 1RM */}
            <div className="rounded-[2px] border border-border bg-secondary/40 p-2 text-center">
              <div className="text-[9px] font-mono text-muted-foreground uppercase font-bold">
                EST.1RM
              </div>
              <div className="text-sm font-black font-mono text-foreground mt-0.5 tabular-nums">
                {estimatedMaxOneRepMax > 0 ? `${estimatedMaxOneRepMax}kg` : '—'}
              </div>
            </div>

            {/* Sessions */}
            <div className="rounded-[2px] border border-border bg-secondary/40 p-2 text-center">
              <div className="text-[9px] font-mono text-muted-foreground uppercase font-bold">
                LOGS
              </div>
              <div className="text-sm font-black font-mono text-foreground mt-0.5 tabular-nums">
                {totalSessions}
              </div>
            </div>

            {/* Total Volume */}
            <div className="rounded-[2px] border border-border bg-secondary/40 p-2 text-center">
              <div className="text-[9px] font-mono text-muted-foreground uppercase font-bold">
                VOLUME
              </div>
              <div className="text-sm font-black font-mono text-accent mt-0.5 tabular-nums">
                {formatTonnage(lifetimeVolume)}
              </div>
            </div>
          </div>

          {/* 1RM Trend Sparkline Panel */}
          {sparklineValues.length >= 2 && (
            <div className="rounded-[2px] border border-border bg-card p-2.5 space-y-1">
              <div className="flex items-center justify-between text-[9px] font-mono uppercase text-muted-foreground">
                <span className="font-bold">┌─[ TREND 1RM // ULTIME {sparklineValues.length} SESS. ]</span>
                {trendDeltaPercent !== 0 && (
                  <span
                    className={`font-bold tabular-nums ${
                      trendDeltaPercent > 0 ? 'text-accent' : 'text-destructive'
                    }`}
                  >
                    {formatDelta(trendDeltaPercent, { isPercent: true }).text}
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-[10px] font-mono text-muted-foreground/80 tabular-nums">
                  [{minTrend}kg]
                </span>
                <span className="text-base font-mono tracking-widest text-accent font-black select-none">
                  {sparklineString}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground/80 tabular-nums">
                  [{sparklineValues[sparklineValues.length - 1]}kg]
                </span>
              </div>
            </div>
          )}

          {/* Delta vs Previous & Cadence Strip */}
          {(deltaVsPrevious || daysSinceLast !== null) && (
            <div className="rounded-[2px] border border-border bg-secondary/20 p-2 flex items-center justify-between text-[10px] font-mono flex-wrap gap-1">
              {daysSinceLast !== null && (
                <div className="text-muted-foreground">
                  ULTIMO: <strong className="text-foreground">{daysSinceLast === 0 ? 'OGGI' : `${daysSinceLast}d fa`}</strong>
                  {avgRestDays !== null && (
                    <span className="text-muted-foreground/60 ml-1">
                      (CADENZA: ~{avgRestDays}d)
                    </span>
                  )}
                </div>
              )}
              {deltaVsPrevious && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    Δ CARICO:{' '}
                    <strong
                      className={
                        deltaVsPrevious.weightDelta > 0
                          ? 'text-accent'
                          : deltaVsPrevious.weightDelta < 0
                          ? 'text-destructive'
                          : 'text-foreground'
                      }
                    >
                      {formatDelta(deltaVsPrevious.weightDelta, { unit: 'kg' }).text}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Rep-Range PRs (1RM, 3RM, 5RM, 8RM, 10RM) */}
          {repRecords && (repRecords.oneRM > 0 || repRecords.fiveRM > 0) && (
            <div className="space-y-1">
              <div className="text-[9px] font-mono uppercase text-muted-foreground font-bold px-0.5">
                ┌─[ RECORD PER RIPETIZIONI (REP_RECORDS) ]
              </div>
              <div className="grid grid-cols-5 gap-1 text-center font-mono text-xs">
                {[
                  { label: '1RM', weight: repRecords.oneRM },
                  { label: '3RM', weight: repRecords.threeRM },
                  { label: '5RM', weight: repRecords.fiveRM },
                  { label: '8RM', weight: repRecords.eightRM },
                  { label: '10RM', weight: repRecords.tenRM },
                ].map((rep) => (
                  <div
                    key={rep.label}
                    className="border border-border bg-card py-1.5 px-1 rounded-[2px]"
                  >
                    <div className="text-[9px] text-muted-foreground uppercase font-semibold">
                      {rep.label}
                    </div>
                    <div className="text-xs font-black text-foreground mt-0.5 tabular-nums">
                      {rep.weight > 0 ? `${rep.weight}k` : '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sessions Timeline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold px-0.5">
              <span>CRONOLOGIA_SESSIONI ({sessionLogs.length})</span>
            </div>

            {sessionLogs.length === 0 ? (
              <div className="rounded-[2px] border border-dashed border-border bg-card/30 p-6 text-center space-y-1">
                <p className="text-xs font-mono font-bold text-muted-foreground uppercase">
                  NESSUN_DATO_REGISTRATO_IN_PASSATO
                </p>
                <p className="text-[10px] font-mono text-muted-foreground/60">
                  I carichi e le ripetizioni salvati nelle sessioni concluse appariranno qui.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessionLogs.map((log) => (
                  <div
                    key={log.workoutId}
                    className="rounded-[2px] border border-border bg-card p-2.5 space-y-2 transition-colors hover:border-border/80"
                  >
                    {/* Log Session Header */}
                    <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-bold font-mono text-foreground truncate">
                          {log.workoutTitle}
                        </span>
                        {log.isPR && (
                          <Badge variant="accent" className="text-[9px]">
                            PR
                          </Badge>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-muted-foreground shrink-0 tabular-nums">
                        {formatDate(log.date).split(' ')[0]}
                      </span>
                    </div>

                    {/* Sets Breakdown as ASCII tree items */}
                    <div className="flex flex-wrap gap-1.5">
                      {log.sets.map((set) => (
                        <div
                          key={set.id}
                          className={`flex items-center gap-1 rounded-[2px] border px-1.5 py-0.5 text-[10px] font-mono tabular-nums ${
                            set.isWarmup
                              ? 'bg-secondary/40 border-warning/40 text-warning'
                              : set.weight === log.bestWeight
                              ? 'bg-accent/10 border-accent/40 text-accent font-bold'
                              : 'bg-secondary/70 border-border/60 text-foreground'
                          }`}
                        >
                          <span className="text-muted-foreground font-semibold">
                            {set.isWarmup ? '[W]' : `[${set.setIndex}]`}
                          </span>
                          <span>
                            {set.weight}kg × {set.reps}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer summary for this session */}
                    <div className="flex items-center justify-between pt-1 border-t border-border/30 text-[9px] font-mono text-muted-foreground">
                      <span>
                        VOL: <strong className="text-foreground">{formatTonnage(log.totalVolume)}</strong>
                      </span>
                      <span>
                        EST. 1RM: <strong className="text-accent">{log.estimatedOneRepMax}kg</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DrawerBody>

        {/* Footer */}
        <DrawerFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="w-full text-xs font-mono font-bold tracking-wider"
          >
            [ CHIUDI ]
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
