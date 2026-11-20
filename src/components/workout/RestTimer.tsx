import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, X, Timer } from 'lucide-react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [barCapacity, setBarCapacity] = useState(38);

  // Dynamically calculate ASCII bar character capacity to span 100% full width
  useEffect(() => {
    const calculateCapacity = () => {
      if (!containerRef.current) return;
      const widthPx = containerRef.current.clientWidth;
      // In monospace font at text-[11px], average character width is ~6.6px
      // Reserve space for percentage badge (~50px) and brackets
      const available = Math.max(16, Math.floor((widthPx - 55) / 6.7));
      setBarCapacity(available);
    };

    calculateCapacity();
    window.addEventListener('resize', calculateCapacity);
    const observer = new ResizeObserver(calculateCapacity);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      window.removeEventListener('resize', calculateCapacity);
      observer.disconnect();
    };
  }, [isActive]);

  if (!isActive) {
    return (
      <div className="flex items-center justify-between rounded border border-border bg-card px-3 py-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Timer className="h-3.5 w-3.5 text-warning" strokeWidth={1.75} />
          <span className="text-[10px] tracking-wider uppercase font-semibold">
            REST_INTERVAL:
          </span>
        </div>
        <div className="flex items-center gap-1">
          {PRESETS.map((seconds) => (
            <button
              key={seconds}
              onClick={() => onStart(seconds)}
              className="h-8 rounded border border-border bg-secondary/80 px-2 text-[11px] font-mono text-foreground hover:bg-secondary hover:border-warning/50 active:bg-card transition-colors tabular-nums min-w-[40px]"
            >
              {seconds}s
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Calculate filled vs empty blocks for full width
  const total = Math.max(totalSeconds, 1);
  const ratio = Math.max(0, Math.min(1, remainingSeconds / total));
  const filledBlocks = Math.round(ratio * barCapacity);
  const emptyBlocks = Math.max(0, barCapacity - filledBlocks);
  const asciiTrack = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

  return (
    <div className="rounded border border-warning/60 bg-card p-3 shadow-md animate-in fade-in duration-150 space-y-2.5">
      {/* Header with ASCII label and close */}
      <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-warning animate-ping" />
          <span className="text-[10px] font-bold font-mono tracking-wider text-warning uppercase">
            REST_TIMER // COUNTDOWN
          </span>
          <span className="text-[9px] text-muted-foreground uppercase font-mono border border-border/60 px-1 py-0.2 rounded">
            {isRunning ? 'RUNNING' : 'PAUSED'}
          </span>
        </div>
        <button
          onClick={onReset}
          className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="Chiudi timer"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>

      {/* Main Countdown Row */}
      <div className="flex items-center justify-between gap-3">
        {/* Big countdown display */}
        <div className="text-3xl font-black font-mono tracking-tight text-warning tabular-nums">
          {formatDuration(remainingSeconds)}
        </div>

        {/* Tactical Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="iconSm"
            onClick={() => onAddSeconds(-15)}
            title="Sottrai 15s"
            className="h-9 w-9 text-xs font-mono"
          >
            <Minus className="h-3.5 w-3.5" strokeWidth={2} />
          </Button>

          <Button
            variant="outline"
            size="iconSm"
            onClick={() => onAddSeconds(30)}
            title="Aggiungi 30s"
            className="h-9 w-9 text-xs font-mono"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          </Button>

          {isRunning ? (
            <Button
              variant="secondary"
              size="iconSm"
              onClick={onPause}
              title="Metti in pausa"
              className="h-9 w-9 border-warning/40 text-warning"
            >
              <Pause className="h-3.5 w-3.5" strokeWidth={2} />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="iconSm"
              onClick={onResume}
              title="Riprendi timer"
              className="h-9 w-9"
            >
              <Play className="h-3.5 w-3.5" strokeWidth={2} />
            </Button>
          )}

          <Button
            variant="ghost"
            size="iconSm"
            onClick={onReset}
            title="Azzera timer"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
          </Button>
        </div>
      </div>

      {/* Full-Width ASCII Slide Progress Bar */}
      <div
        ref={containerRef}
        className="w-full rounded bg-secondary/80 px-2 py-1.5 border border-border/50 text-[11px] font-mono text-warning tracking-wider flex items-center justify-between select-none overflow-hidden"
      >
        <span className="truncate flex-1 tracking-tight font-mono select-none">
          [{asciiTrack}]
        </span>
        <span className="tabular-nums font-bold pl-2 shrink-0 select-none">
          {Math.round(ratio * 100)}%
        </span>
      </div>
    </div>
  );
}
