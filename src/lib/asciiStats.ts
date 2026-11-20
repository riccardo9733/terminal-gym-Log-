/**
 * ASCII & Unicode TUI Telemetry Visualization Utilities
 * Pure client-side, zero external dependencies, 0ms compute.
 */

const SPARK_BLOCKS = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

/**
 * Generates an ASCII block sparkline string for a sequence of numeric values.
 * e.g. [60, 65, 70, 80] -> " ▃▅█"
 */
export function generateAsciiSparkline(values: number[], maxLen = 10): string {
  if (!values || values.length === 0) return '—';

  // Take the most recent values up to maxLen
  const slice = values.slice(-maxLen);
  if (slice.length === 1) return '▄';

  const min = Math.min(...slice);
  const max = Math.max(...slice);
  const range = max - min;

  if (range === 0) {
    return slice.map(() => '▄').join('');
  }

  return slice
    .map((val) => {
      const normalized = Math.max(0, Math.min(1, (val - min) / range));
      const index = Math.min(SPARK_BLOCKS.length - 1, Math.floor(normalized * SPARK_BLOCKS.length));
      return SPARK_BLOCKS[index];
    })
    .join('');
}

/**
 * Generates an ASCII horizontal bar chart representing a ratio.
 * e.g. current = 8, max = 16, width = 10 -> "█████░░░░░"
 */
export function generateAsciiBar(
  current: number,
  max: number,
  width = 10,
  fillChar = '█',
  emptyChar = '░'
): string {
  if (max <= 0 || current <= 0) {
    return emptyChar.repeat(width);
  }
  const ratio = Math.max(0, Math.min(1, current / max));
  const filled = Math.round(ratio * width);
  const empty = width - filled;
  return fillChar.repeat(filled) + emptyChar.repeat(Math.max(0, empty));
}

/**
 * Formats weight in kg with compact formatting.
 */
export function formatWeight(kg: number): string {
  if (kg <= 0) return '—';
  return Number.isInteger(kg) ? `${kg}kg` : `${kg.toFixed(1)}kg`;
}

/**
 * Formats tonnage/volume compactly (e.g. 1,450kg or 12.4t).
 */
export function formatTonnage(kg: number): string {
  if (kg <= 0) return '0kg';
  if (kg >= 1000) {
    const tons = kg / 1000;
    return `${tons >= 10 ? tons.toFixed(1) : tons.toFixed(2)}t`;
  }
  return `${Math.round(kg)}kg`;
}

/**
 * Formats a numeric delta with ASCII arrows and sign.
 * e.g. delta = +2.5 -> "▲ +2.5kg" or delta = -1 -> "▼ -1.0kg"
 */
export function formatDelta(
  delta: number,
  options?: {
    isPercent?: boolean;
    unit?: string;
    showEqual?: boolean;
  }
): { text: string; direction: 'up' | 'down' | 'neutral' } {
  const { isPercent = false, unit = '', showEqual = true } = options || {};

  if (Math.abs(delta) < 0.01) {
    return {
      text: showEqual ? `▶ 0${isPercent ? '%' : unit}` : `0${isPercent ? '%' : unit}`,
      direction: 'neutral',
    };
  }

  const sign = delta > 0 ? '+' : '';
  const arrow = delta > 0 ? '▲' : '▼';
  const formattedVal = Number.isInteger(delta) ? `${delta}` : delta.toFixed(1);

  return {
    text: `${arrow} ${sign}${formattedVal}${isPercent ? '%' : unit}`,
    direction: delta > 0 ? 'up' : 'down',
  };
}
