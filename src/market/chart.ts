import type { MarketId, Snapshot } from './engine';

export const PLOT_WIDTH = 720;
export const PLOT_HEIGHT = 260;
const MAX_PLOT_POINTS = 180;
const TICKS = 5;
/* A full 0-100 axis buries the lines: eight seats share one hundred points, so every price sits
   under 20 and the plot is four-fifths empty. The axis follows the data instead. */
const MIN_SPAN = 4;
const PAD_RATIO = 0.2;

export type Domain = { low: number; high: number };

export function domainOf(points: readonly Snapshot[], ids: readonly MarketId[]): Domain {
  let low = Infinity;
  let high = -Infinity;
  for (const point of points) {
    for (const id of ids) {
      const value = point.prices[id];
      if (!Number.isFinite(value)) continue;
      low = Math.min(low, value);
      high = Math.max(high, value);
    }
  }
  if (low === Infinity) return { low: 0, high: 100 };
  const pad = Math.max(MIN_SPAN / 2, (high - low) * PAD_RATIO);
  return { low: Math.max(0, Math.floor(low - pad)), high: Math.min(100, Math.ceil(high + pad)) };
}

export const ticksOf = ({ low, high }: Domain) =>
  Array.from({ length: TICKS }, (_tick, index) => low + ((high - low) * index) / (TICKS - 1));

/* The plot draws the whole recorded window. Beyond 180 samples the strokes stop resolving, so the
   history is thinned by an even stride and the last sample is kept whatever the stride lands on. */
export function plotPoints(history: readonly Snapshot[]): readonly Snapshot[] {
  const stride = Math.ceil(history.length / MAX_PLOT_POINTS);
  return stride > 1 ? history.filter((_point, index) => index % stride === 0 || index === history.length - 1) : history;
}

export const linePath = (points: readonly Snapshot[], id: MarketId, { low, high }: Domain) =>
  points
    .map((point, index) => {
      const x = points.length > 1 ? (index / (points.length - 1)) * PLOT_WIDTH : 0;
      const y = PLOT_HEIGHT - ((point.prices[id] - low) / (high - low || 1)) * PLOT_HEIGHT;
      return `${index ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
