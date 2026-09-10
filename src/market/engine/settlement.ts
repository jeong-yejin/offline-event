import { TOTAL_PRICE } from './constants';
import type { BalanceMap, Holding, MarketId, Side } from './types';

/* Highest final margin balance wins. Two traders can tie, so this returns every winner. */
export function winnersOf(balances: BalanceMap, live: readonly MarketId[]): MarketId[] {
  if (!live.length) return [];
  const best = live.reduce((top, id) => Math.max(top, balances[id]), Number.NEGATIVE_INFINITY);
  return live.filter((id) => balances[id] === best);
}

/* One winner pays YES 100. N co-winners split it, so each YES settles at 100/N and its NO takes the
   rest. Everyone else settles YES 0 / NO 100, which is also what a seat cut mid-competition pays. */
export const settlementPrice = (winners: readonly MarketId[], id: MarketId, side: Side) => {
  const yes = winners.includes(id) ? TOTAL_PRICE / winners.length : 0;
  return side === 'yes' ? yes : TOTAL_PRICE - yes;
};

export const settlementPayout = (holdings: readonly Holding[], winners: readonly MarketId[]) =>
  holdings.reduce((payout, holding) => payout + holding.qty * settlementPrice(winners, holding.id, holding.side), 0);
