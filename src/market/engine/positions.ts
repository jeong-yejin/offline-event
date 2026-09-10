import { quote } from './rfq';
import type { Roster } from './roster';
import type { BalanceMap, Holding, MarketId, OpenMap, PriceMap, Side } from './types';

export const findHolding = (holdings: readonly Holding[], id: MarketId, side: Side) =>
  holdings.find((holding) => holding.id === id && holding.side === side);

export function addFill(holdings: readonly Holding[], id: MarketId, side: Side, qty: number, price: number): Holding[] {
  const held = findHolding(holdings, id, side);
  if (!held) return [...holdings, { id, side, qty, cost: qty * price }];
  return holdings.map((holding) => (holding === held ? { ...holding, qty: holding.qty + qty, cost: holding.cost + qty * price } : holding));
}

export const removeFill = (holdings: readonly Holding[], id: MarketId, side: Side, qty: number): Holding[] =>
  holdings.flatMap((holding) => {
    if (holding.id !== id || holding.side !== side) return [holding];
    const left = holding.qty - qty;
    return left > 0 ? [{ ...holding, qty: left, cost: (holding.cost / holding.qty) * left }] : [];
  });

export const applyOpen = (roster: Roster, open: OpenMap, id: MarketId, side: Side, delta: number): OpenMap =>
  roster.mapIds((other) => (other === id ? { ...open[other], [side]: Math.max(0, open[other][side] + delta) } : open[other]));

export const averageEntry = (holding: Holding) => holding.cost / holding.qty;

/* A position is worth what it can be sold for right now. */
export const holdingValue = (holding: Holding, prices: PriceMap) => holding.qty * quote(prices, holding.id, holding.side, 'sell');

export const totalAsset = (point: number, holdings: readonly Holding[], prices: PriceMap) =>
  holdings.reduce((total, holding) => total + holdingValue(holding, prices), point);

/* Standings are read over the whole line-up, so a seat that is out keeps the place it fell to
   instead of renumbering everyone above it. */
export const rankOf = (ids: readonly MarketId[], balances: BalanceMap, id: MarketId) =>
  ids.filter((other) => balances[other] > balances[id]).length + 1;

export const returnOf = (balance: number, opening: number) => ((balance - opening) / opening) * 100;
