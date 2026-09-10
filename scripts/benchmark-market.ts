/** Run: node --import tsx scripts/benchmark-market.ts. Microbenchmarks, not browser FPS. */
import { performance } from 'node:perf_hooks';
import assert from 'node:assert/strict';
import { balancesAt, appendBounded } from '../src/market/history';
import { domainOf, rangePoints } from '../src/market/chart';
import { mapRecord } from '../src/market/record';
import type { Snapshot } from '../src/market/marketEngine';

const ids = Array.from({ length: 8 }, (_, i) => `seat-${i}`);
const history: Snapshot[] = Array.from({ length: 3600 }, (_, index) => ({
  time: index * 1000,
  balances: Object.fromEntries(ids.map((id, seat) => [id, 1000 + index + seat])),
  prices: Object.fromEntries(ids.map((id, seat) => [id, 8 + seat + Math.sin(index / 60)])),
}));
const cutoff = history.at(-1)!.time - 180000;
const fallback = history[0].balances;
let sink: unknown;
function medianMs(run: () => unknown, iterations: number) {
  for (let i = 0; i < 500; i++) sink = run();
  const samples = Array.from({ length: 7 }, () => {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) sink = run();
    return performance.now() - start;
  });
  return samples.sort((a, b) => a - b)[3];
}
function compare(name: string, before: () => unknown, after: () => unknown, iterations = 2000) {
  assert.deepEqual(after(), before());
  const oldMs = medianMs(before, iterations);
  const newMs = medianMs(after, iterations);
  console.log(JSON.stringify({ name, iterations, beforeMs: +oldMs.toFixed(3), afterMs: +newMs.toFixed(3), speedup: +(oldMs / newMs).toFixed(2) }));
}
compare('momentum lookup / 3600 samples', () => {
  const older = history.filter((p) => p.time <= cutoff);
  return older.at(-1)?.balances ?? fallback;
}, () => balancesAt(history, cutoff, fallback));
compare('bounded append / 3600 samples', () => [...history, history[0]].slice(-3600), () => appendBounded(history, history[0], 3600));
const points = rangePoints(history, 'ALL');
compare('domain / sampled chart', () => {
  const values = points.flatMap((p) => ids.map((id) => p.prices[id])).filter(Number.isFinite);
  const low = Math.min(...values), high = Math.max(...values);
  const pad = Math.max(2, (high - low) * .2);
  return { low: Math.max(0, Math.floor(low - pad)), high: Math.min(100, Math.ceil(high + pad)) };
}, () => domainOf(points, ids));
for (const count of [4, 8, 128]) {
  const field = Array.from({ length: count }, (_, i) => `seat-${i}`);
  compare(`record construction / ${count} seats`, () => field.reduce((record, id) => ({ ...record, [id]: 1 }), {} as Record<string, number>), () => mapRecord(field, () => 1));
}
// Keep values observable to the runtime; no wall-clock assertions in CI.
assert.ok(sink);
