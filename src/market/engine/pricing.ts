import {
  BALANCE_DRIFT,
  DEMAND_MAX,
  DEMAND_WEIGHT,
  MOMENTUM_MAX,
  MOMENTUM_WEIGHT,
  TOTAL_PRICE,
  VIRTUAL_LIQUIDITY,
} from './constants';
import { sumOver, type Roster } from './roster';
import type { BalanceMap, MarketId, OpenMap, OpenQty, PriceMap } from './types';

const clamp = (value: number, bound: number) => Math.max(-bound, Math.min(bound, value));

/* Every live trader's share of the margin balance on the floor. This is the centre of the price;
   momentum and demand only nudge it. A seat that is out counts as 0 and leaves the denominator, so
   the remaining YES prices still add up to 100. */
export function balanceComponent(roster: Roster, balances: BalanceMap, live: readonly MarketId[]): PriceMap {
  const total = sumOver(live, balances);
  return roster.mapIds((id) => (total > 0 && live.includes(id) ? (balances[id] / total) * TOTAL_PRICE : 0));
}

export const momentumOf = (current: number, past: number) => (past > 0 ? (current - past) / past : 0);

export const momentumAdjustment = (momentum: number) => clamp(momentum * MOMENTUM_WEIGHT, MOMENTUM_MAX);

export const demandImbalance = ({ yes, no }: OpenQty) => (yes - no) / (yes + no + VIRTUAL_LIQUIDITY);

export const demandAdjustment = (imbalance: number) => clamp(imbalance * DEMAND_WEIGHT, DEMAND_MAX);

/* The live YES prices have to add up to 100, so raw prices are rescaled, not clipped. */
export function normalize(roster: Roster, raw: PriceMap, live: readonly MarketId[]): PriceMap {
  const floored = roster.mapIds((id) => (live.includes(id) ? Math.max(0, raw[id]) : 0));
  const total = sumOver(live, floored);
  if (total > 0) return roster.mapIds((id) => (floored[id] / total) * TOTAL_PRICE);
  return roster.mapIds((id) => (live.includes(id) ? TOTAL_PRICE / live.length : 0));
}

/* Margin balance -> balance share -> momentum -> demand -> normalize -> YES mid price. */
export function midPrices(
  roster: Roster,
  balances: BalanceMap,
  past: BalanceMap,
  open: OpenMap,
  eliminated: readonly MarketId[] = [],
): PriceMap {
  const live = roster.liveIds(eliminated);
  const base = balanceComponent(roster, balances, live);
  return normalize(
    roster,
    roster.mapIds((id) => base[id]
      + momentumAdjustment(momentumOf(balances[id], past[id]))
      + demandAdjustment(demandImbalance(open[id]))),
    live,
  );
}

/* One second of drift on every seat still standing. A seat that is out sits at 0 and draws no
   random, so replaying a seed cuts the same seats in the same order. */
export function stepBalances(
  roster: Roster,
  balances: BalanceMap,
  random: () => number,
  eliminated: readonly MarketId[] = [],
): BalanceMap {
  return roster.mapIds((id) => (eliminated.includes(id)
    ? 0
    : Math.max(0, balances[id] * (1 + (random() * 2 - 1) * BALANCE_DRIFT))));
}
