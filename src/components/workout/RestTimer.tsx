import { formatDuration, cn } from '../../lib/utils';

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

export function RestTimer({
  remainingSeconds,
  totalSeconds,
  isRunning,
  isActive,
  onPause,
  onResume,
  onReset,
  onAddSeconds,
}: RestTimerProps) {
  // When timer is not active, render nothing (0px height, zero layout shift)
  if (!isActive) {
    return null;
  }

  // Calculate filled vs empty blocks for compact ASCII progress track
  const total = Math.max(totalSeconds, 1);
  const ratio = Math.max(0, Math.min(1, remainingSeconds / total));
  const totalBlocks = 8;
  const filledBlocks = Math.max(0, Math.min(totalBlocks, Math.round(ratio * totalBlocks)));
  const asciiTrack = '█'.repeat(filledBlocks) + '░'.repeat(totalBlocks - filledBlocks);

  return (
    <div className="h-9 px-2.5 border-b border-warning/40 bg-secondary/95 backdrop-blur-sm flex items-center justify-between gap-1.5 font-mono select-none">
      {/* Left: Indicator + Big Countdown */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[10px] text-warning font-bold">⏱ REST</span>
        <span className="text-sm font-black font-mono tracking-tight text-warning tabular-nums">
          {formatDuration(remainingSeconds)}
        </span>
      </div>

      {/* Center: Compact ASCII Progress Track */}
      <div className="hidden min-[380px]:flex items-center gap-1 text-[10px] text-warning font-mono tabular-nums shrink-0">
        <span className="tracking-tighter">[{asciiTrack}]</span>
        <span className="text-[9px] font-bold opacity-80">{Math.round(ratio * 100)}%</span>
      </div>

      {/* Right: 1-Tap Tactical Controls */}
      <div className="flex items-center gap-1 text-[10px] font-mono shrink-0">
        <button
          type="button"
          onClick={() => onAddSeconds(-15)}
          className="h-6 px-1.5 rounded-[2px] border border-border bg-card/80 text-foreground hover:border-warning/50 active:scale-95 transition-all tabular-nums"
          title="Sottrai 15s"
        >
          -15s
        </button>
        <button
          type="button"
          onClick={() => onAddSeconds(15)}
          className="h-6 px-1.5 rounded-[2px] border border-border bg-card/80 text-foreground hover:border-warning/50 active:scale-95 transition-all tabular-nums"
          title="Aggiungi 15s"
        >
          +15s
        </button>
        <button
          type="button"
          onClick={isRunning ? onPause : onResume}
          className={cn(
            'h-6 px-1.5 rounded-[2px] border font-bold active:scale-95 transition-all',
            isRunning
              ? 'border-border bg-card/80 text-foreground hover:border-warning/50'
              : 'border-warning/60 bg-warning/20 text-warning'
          )}
          title={isRunning ? 'Pausa' : 'Riprendi'}
        >
          {isRunning ? '⏸' : '▶'}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="h-6 px-1.5 rounded-[2px] border border-warning/50 bg-warning/10 text-warning font-bold hover:bg-warning/20 active:scale-95 transition-all"
          title="Salta / chiudi recupero"
        >
          [✕]
        </button>
      </div>
    </div>
  );
}
