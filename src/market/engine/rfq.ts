import { DELAYED_AFTER_MS, RFQ_SPREAD, STALE_AFTER_MS, TOTAL_PRICE } from './constants';
import type { DataStatus, Direction, MarketId, PriceMap, Side } from './types';

export const chanceOf = (prices: PriceMap, id: MarketId) => Math.round(prices[id]);

/* NO is the other half of the same binary market. */
export const midOf = (prices: PriceMap, id: MarketId, side: Side) =>
  side === 'yes' ? chanceOf(prices, id) : TOTAL_PRICE - chanceOf(prices, id);

export const rfqPrice = (mid: number, direction: Direction) =>
  direction === 'buy' ? Math.min(TOTAL_PRICE - 1, mid + RFQ_SPREAD) : Math.max(1, mid - RFQ_SPREAD);

export const quote = (prices: PriceMap, id: MarketId, side: Side, direction: Direction) =>
  rfqPrice(midOf(prices, id, side), direction);

export const dataStatusOf = (updatedAt: number, now: number): DataStatus => {
  const age = now - updatedAt;
  if (age >= STALE_AFTER_MS) return 'stale';
  if (age >= DELAYED_AFTER_MS) return 'delayed';
  return 'live';
};
