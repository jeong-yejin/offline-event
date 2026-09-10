import type { BalanceMap, Snapshot } from './engine';

/** Last matching sample, including duplicate/out-of-order timestamps after a clock change. */
export function balancesAt(history: readonly Snapshot[], cutoff: number, fallback: BalanceMap): BalanceMap {
  for (let index = history.length - 1; index >= 0; index--) {
    if (history[index].time <= cutoff) return history[index].balances;
  }
  return fallback;
}

/** Copy retained references once; never mutate a snapshot owned by a previous reducer state. */
export function appendBounded<T>(items: readonly T[], value: T, limit: number): T[] {
  const next = items.slice(Math.max(0, items.length - limit + 1));
  next.push(value);
  return next;
}
