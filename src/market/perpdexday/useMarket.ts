import { useMarketClock } from '../useMarketClock';
import { useCallback, useEffect, useReducer } from 'react';
import { COMPETITION_SECONDS, MARKET_STORAGE_KEY, SETTLING_SECONDS } from '../../data/perpDexMarketContent';
import { readStored, writeStored } from '../../infrastructure/storage';
import { perpDexPreviewStart, previewName, previewSeeds } from '../../router/preview';
import { createInitialState as initialize, reduceMarket, type MarketState, type StoredAccount } from './state';
import type { OrderQuote } from '../quote';

export * from './state';
export type { Direction, Side } from '../engine';

/* Rewinding the start alone leaves all four balances on their opening value, so a settled preview
   names every trader a co-winner and the chart draws flat. The reducer is run through the seconds
   the rewound clock claims have already passed. */
const runForward = (state: MarketState, now: number): MarketState => {
  const seed = previewSeeds();
  return Array.from({ length: Math.max(0, Math.floor((now - state.startAt) / 1000)) }).reduce<MarketState>(
    (carried, _second, index) =>
      reduceMarket(carried, { type: 'tick', time: state.startAt + index * 1000, seed: seed() }),
    state,
  );
};

/* A preview opens on its own clock and ignores the saved run, so a case screen can be read without
   the visitor losing the balance and positions they left behind. */
export const createInitialState = () => {
  const now = Date.now();
  const startAt = perpDexPreviewStart(now);
  const base = initialize(now, startAt === null ? readStored<StoredAccount>(MARKET_STORAGE_KEY) : null);
  return startAt === null ? base : runForward({
    ...base,
    startAt,
    closeAt: startAt + COMPETITION_SECONDS * 1000,
    settleAt: startAt + (COMPETITION_SECONDS + SETTLING_SECONDS) * 1000,
  }, now);
};

export function useMarket() {
  const [state, dispatch] = useReducer(reduceMarket, undefined, createInitialState);

  useMarketClock(dispatch);

  useEffect(() => {
    if (previewName() !== null) return;
    writeStored(MARKET_STORAGE_KEY, { startAt: state.startAt, closeAt: state.closeAt, point: state.point, holdings: state.holdings, settlement: state.settlement });
  }, [state.startAt, state.closeAt, state.point, state.holdings, state.settlement]);

  const fill = useCallback((quote: OrderQuote) => dispatch({ type: 'fill', time: Date.now(), quote }), []);

  return { state, fill };
}
