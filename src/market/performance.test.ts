import { describe, expect, it } from 'vitest';
import { appendBounded, balancesAt } from './history';
import { domainOf, plotPoints } from './chart';
import { mapRecord } from './record';
import { createInitialState as createPerp, reduceMarket } from './perpdexday/state';
import { createInitialState as createToken, reduceT2049 } from './token2049/state';
import type { Snapshot } from './engine';

const sample = (time: number, value = time): Snapshot => ({ time, balances: { a: value }, prices: { a: value } });

describe('history compatibility', () => {
  it('matches the last filtered sample across clock changes, duplicates and empty windows', () => {
    const history = [sample(10), sample(20), sample(15), sample(20, 99), sample(30)];
    const fallback = { a: -1 };
    for (const cutoff of [-1, 10, 15, 19, 20, 29, 30, Infinity]) {
      const old = history.filter((point) => point.time <= cutoff);
      expect(balancesAt(history, cutoff, fallback)).toBe(old.at(-1)?.balances ?? fallback);
    }
    expect(balancesAt([], 0, fallback)).toBe(fallback);
  });

  it('retains the exact bounded tail without mutating prior state', () => {
    for (const length of [0, 1, 3, 4, 3600]) {
      const history = Object.freeze(Array.from({ length }, (_, i) => sample(i)));
      const added = sample(length);
      for (const limit of [1, 3, 3600]) {
        expect(appendBounded(history, added, limit)).toEqual([...history, added].slice(-limit));
      }
    }
  });
});

describe('chart compatibility', () => {
  it('thins the history by an even stride and always keeps the last sample, so the plot ends on live data', () => {
    for (const length of [0, 1, 180, 181, 359, 3600]) {
      const history = Array.from({ length }, (_, i) => sample(i * 120000));
      const points = plotPoints(history);
      expect(points.at(-1)).toBe(history.at(-1));
      const stride = Math.ceil(length / 180);
      expect(points).toEqual(stride > 1 ? history.filter((_, i) => i % stride === 0 || i === length - 1) : history);
    }
  });

  it('ignores invalid prices and handles large input without spread argument overflow', () => {
    expect(domainOf([], ['a'])).toEqual({ low: 0, high: 100 });
    expect(domainOf([sample(0, NaN), sample(1, Infinity)], ['a'])).toEqual({ low: 0, high: 100 });
    expect(domainOf([sample(0, 12), sample(1, 20), sample(2, NaN)], ['a'])).toEqual({ low: 10, high: 22 });
    expect(domainOf(Array.from({ length: 150000 }, () => sample(0, 12)), ['a'])).toEqual({ low: 10, high: 14 });
  });
});

it('builds independent records with stable key and transform order', () => {
  const seen: string[] = [];
  const ids = ['a', '__proto__', 'b'];
  const record = mapRecord(ids, (id) => { seen.push(id); return id; });
  expect(seen).toEqual(ids);
  expect(Object.keys(record)).toEqual(ids);
  expect(Object.getPrototypeOf(record)).toBe(Object.prototype);
  expect(record.__proto__).toBe('__proto__');
});

it('initializes and advances both markets without browser globals or implicit clocks', () => {
  const time = 1000000;
  const perp = createPerp(time);
  const token = createToken(time);
  expect(createPerp(time)).toEqual(perp);
  expect(createToken(time)).toEqual(token);
  const beforePerp = structuredClone(perp);
  const beforeToken = structuredClone(token);
  reduceMarket(perp, { type: 'tick', time: time + 1000, seed: 42 });
  reduceT2049(token, { type: 'tick', time: time + 1000, seed: 42 });
  expect(perp).toEqual(beforePerp);
  expect(token).toEqual(beforeToken);
  expect(createPerp(time, { ...perp, point: 73 }).point).toBe(73);
  expect(createToken(time, { ...token, point: 61 }).point).toBe(61);
});
