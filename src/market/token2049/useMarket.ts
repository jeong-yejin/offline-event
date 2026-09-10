import { useMarketClock } from '../useMarketClock';
import { useCallback, useEffect, useReducer } from 'react';
import { T2049_STORAGE_KEY } from '../../data/t2049MarketContent';
import { readStored, writeStored } from '../../infrastructure/storage';
import { previewName, previewSeeds, t2049PreviewStart } from '../../router/preview';
import { createInitialState as initialize, reduceT2049, type StoredAccount, type T2049State } from './state';
import type { OrderQuote } from '../quote';

export * from './state';
export type { Direction, Side } from '../engine';

/* Rewinding the start alone leaves all eight balances on their opening value, so a settled preview
   names every trader a co-winner and the chart draws flat. The reducer is run through the seconds
   the rewound clock claims have already passed, which is also what puts the cuts in a real order. */
const runForward = (state: T2049State, now: number): T2049State => {
  const seed = previewSeeds();
  return Array.from({ length: Math.max(0, Math.floor((now - state.startAt) / 1000)) }).reduce<T2049State>(
    (carried, _second, index) =>
      reduceT2049(carried, { type: 'tick', time: state.startAt + index * 1000, seed: seed() }),
    state,
  );
};

/* A preview opens on its own clock and ignores the saved run, so a case screen can be read without
   the visitor losing the balance and positions they left behind. */
export const createInitialState = () => {
  const now = Date.now();
  const startAt = t2049PreviewStart(now);
  const base = initialize(now, startAt === null ? readStored<StoredAccount>(T2049_STORAGE_KEY) : null);
  return startAt === null ? base : runForward({ ...base, startAt }, now);
};

export function useMarket() {
  const [state, dispatch] = useReducer(reduceT2049, undefined, createInitialState);

  useMarketClock(dispatch);

  useEffect(() => {
    if (previewName() !== null) return;
    writeStored(T2049_STORAGE_KEY, {
      startAt: state.startAt,
      point: state.point,
      holdings: state.holdings,
      eliminated: state.eliminated,
      settlement: state.settlement,
      closed: state.closed,
    });
  }, [state.startAt, state.point, state.holdings, state.eliminated, state.settlement, state.closed]);

  const fill = useCallback((quote: OrderQuote) => dispatch({ type: 'fill', time: Date.now(), quote }), []);

  return { state, fill };
}
