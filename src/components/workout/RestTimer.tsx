import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { formatDuration } from '../../lib/utils';
import { AsciiBox } from '../ui/ascii-box';

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
  const [barCapacity, setBarCapacity] = useState(28);

  useEffect(() => {
    const calculateCapacity = () => {
      if (!containerRef.current) return;
      const widthPx = containerRef.current.clientWidth;
      // In monospace font at text-[11px], average character width is ~7px
      const available = Math.max(16, Math.floor((widthPx - 60) / 7.2));
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
      <div className="flex items-center justify-between rounded-[2px] border border-border bg-card px-3 py-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-muted-foreground select-none">
          <span className="text-warning font-bold">&gt;</span>
          <span className="text-[10px] tracking-wider uppercase font-semibold">
            REST_INTERVAL:
          </span>
        </div>
        {/* ASCII Radio buttons for presets */}
        <div className="flex items-center gap-1.5">
          {PRESETS.map((seconds) => (
            <button
              key={seconds}
              onClick={() => onStart(seconds)}
              className="h-7 px-2 rounded-[2px] border border-border bg-secondary/70 text-[11px] font-mono text-muted-foreground hover:text-warning hover:border-warning/50 active:bg-secondary transition-colors tabular-nums select-none"
            >
              ( ) {seconds}s
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Calculate filled vs empty blocks for ASCII progress track
  const total = Math.max(totalSeconds, 1);
  const ratio = Math.max(0, Math.min(1, remainingSeconds / total));
  const filledBlocks = Math.round(ratio * barCapacity);
  const emptyBlocks = Math.max(0, barCapacity - filledBlocks);
  const asciiTrack = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

  return (
    <AsciiBox
      variant="warning"
      title="REST_TIMER // COUNTDOWN"
      status={
        <span className="text-warning font-bold">
          {isRunning ? '[RUNNING]' : '[PAUSED]'}
        </span>
      }
      action={
        <button
          onClick={onReset}
          className="h-6 w-6 rounded-[2px] border border-warning/40 text-warning hover:bg-warning/20 flex items-center justify-center font-mono text-xs select-none transition-colors"
          title="Chiudi timer"
        >
          ✕
        </button>
      }
      className="space-y-2.5"
    >
      {/* Main Countdown Row */}
      <div className="flex items-center justify-between gap-3">
        {/* Big countdown display */}
        <div className="text-3xl font-black font-mono tracking-tight text-warning tabular-nums">
          {formatDuration(remainingSeconds)}
        </div>

        {/* Tactical Controls */}
        <div className="flex items-center gap-1 text-[11px] font-mono">
          <button
            onClick={() => onAddSeconds(-15)}
            className="h-8 px-2 rounded-[2px] border border-border bg-secondary/80 text-foreground hover:border-warning/50 active:bg-secondary tabular-nums"
            title="Sottrai 15s"
          >
            -15s
          </button>
          <button
            onClick={() => onAddSeconds(15)}
            className="h-8 px-2 rounded-[2px] border border-border bg-secondary/80 text-foreground hover:border-warning/50 active:bg-secondary tabular-nums"
            title="Aggiungi 15s"
          >
            +15s
          </button>
          <Button
            variant="default"
            size="sm"
            onClick={isRunning ? onPause : onResume}
            className="h-8 px-2.5 font-bold"
          >
            {isRunning ? '[ ⏸ PAUSE ]' : '[ ▶ RESUME ]'}
          </Button>
          <button
            onClick={onReset}
            className="h-8 px-2 rounded-[2px] border border-border bg-secondary/80 text-muted-foreground hover:text-foreground"
            title="Reset timer"
          >
            [↻]
          </button>
        </div>
      </div>

      {/* ASCII Progress Bar Track */}
      <div
        ref={containerRef}
        className="w-full bg-secondary/40 border border-border/80 px-2 py-1 font-mono text-[11px] text-warning flex items-center justify-between overflow-hidden select-none"
      >
        <span className="tracking-tighter truncate font-mono">{`[${asciiTrack}]`}</span>
        <span className="tabular-nums font-bold text-[10px] ml-2 shrink-0">
          {Math.round(ratio * 100)}%
        </span>
      </div>
    </AsciiBox>
  );
}
