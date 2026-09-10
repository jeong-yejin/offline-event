import { mapRecord } from '../record';
import type { BalanceMap, MarketId, PriceMap } from './types';

/* The line-up a board is priced over. Every kernel function takes one of these instead of closing
   over a single event's id list, which is what lets two competitions share one implementation.

   `liveIds` is the subset still trading. A knockout format shrinks it as seats go out; a format
   without eliminations passes nothing and never thinks about it again. */
export type Roster = {
  ids: readonly MarketId[];
  mapIds<T>(transform: (id: MarketId) => T): Record<MarketId, T>;
  liveIds(eliminated: readonly MarketId[]): readonly MarketId[];
};

export const createRoster = (ids: readonly MarketId[]): Roster => ({
  ids,
  mapIds: (transform) => mapRecord(ids, transform),
  liveIds: (eliminated) => (eliminated.length ? ids.filter((id) => !eliminated.includes(id)) : ids),
});

export const sumOver = (ids: readonly MarketId[], values: PriceMap | BalanceMap) =>
  ids.reduce((total, id) => total + values[id], 0);
