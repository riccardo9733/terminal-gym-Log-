import { Play, Pause, RotateCcw, Plus, Minus, X, Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { formatDuration } from '../../lib/utils';

interface RestTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  isActive: boolean;
  onStart: (seconds: number) => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onAddSeconds: (delta: number) => void;
}

const PRESETS = [60, 90, 120, 180];

export function RestTimer({
  remainingSeconds,
  totalSeconds,
  isRunning,
  isActive,
  onStart,
  onPause,
  onResume,
  onReset,
  onAddSeconds,
}: RestTimerProps) {
  if (!isActive) {
    return (
      <div className="flex items-center justify-between rounded border border-border bg-card/60 px-3 py-2 text-xs font-mono">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Bell className="h-3.5 w-3.5 text-warning" strokeWidth={1.75} />
          <span>REST_TIMER:</span>
        </div>
        <div className="flex items-center gap-1">
          {PRESETS.map((seconds) => (
            <button
              key={seconds}
              onClick={() => onStart(seconds)}
              className="h-8 rounded border border-border bg-secondary/80 px-2 text-[11px] font-mono text-foreground hover:bg-secondary hover:border-primary/50 active:bg-card transition-colors"
            >
              {seconds}s
            </button>
          ))}
        </div>
      </div>
    );
  }

  const progressPercent = totalSeconds > 0 ? (remainingSeconds / totalSeconds) * 100 : 0;

  return (
    <div className="rounded border border-warning/50 bg-card p-3 shadow-md animate-in fade-in duration-150">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-warning animate-ping" />
          <span className="text-[10px] font-bold font-mono tracking-wider text-warning uppercase">
            REST_INTERVAL
          </span>
        </div>
        <button
          onClick={onReset}
          className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="Dismiss timer"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>

      <div className="flex items-center justify-between">
        {/* Big countdown display */}
        <div className="text-3xl font-black font-mono tracking-tight text-warning tabular-nums">
          {formatDuration(remainingSeconds)}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="iconSm"
            onClick={() => onAddSeconds(-15)}
            title="Minus 15s"
            className="h-9 w-9"
          >
            <Minus className="h-3.5 w-3.5" strokeWidth={2} />
          </Button>

          <Button
            variant="outline"
            size="iconSm"
            onClick={() => onAddSeconds(30)}
            title="Plus 30s"
            className="h-9 w-9"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          </Button>

          {isRunning ? (
            <Button
              variant="secondary"
              size="iconSm"
              onClick={onPause}
              title="Pause timer"
              className="h-9 w-9 border-warning/40 text-warning"
            >
              <Pause className="h-3.5 w-3.5" strokeWidth={2} />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="iconSm"
              onClick={onResume}
              title="Resume timer"
              className="h-9 w-9"
            >
              <Play className="h-3.5 w-3.5" strokeWidth={2} />
            </Button>
          )}

          <Button
            variant="ghost"
            size="iconSm"
            onClick={onReset}
            title="Reset timer"
            className="h-9 w-9 text-muted-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-warning transition-all duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
