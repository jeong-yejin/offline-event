import { SEED_INTERVAL, SEED_POINTS } from './constants';
import { midPrices, stepBalances } from './pricing';
import { quote } from './rfq';
import type { Roster } from './roster';
import type { BalanceMap, Direction, Fill, MarketId, OpenMap, PriceMap, Side, Snapshot } from './types';

/* An opening depth book: two draws per market, in roster order. */
export const seedOpenBook = (roster: Roster, random: () => number, depth: number): OpenMap =>
  roster.mapIds(() => ({ yes: Math.floor(random() * depth), no: Math.floor(random() * depth) }));

/* The live market opens on `openBalances`, so the seeded history has to arrive there. Walking
   forward from the open leaves the newest seeded point well away from it, which draws as a cliff at
   the right edge of the chart. The balance walk runs backwards into the past instead, oldest first,
   and carries one extra step so even the first point prices against the step before it.

   `open` and `random` both come from the caller because a competition decides for itself whether
   the depth book is drawn off this same stream or off one of its own. */
export function seedHistory(
  roster: Roster,
  openBalances: BalanceMap,
  open: OpenMap,
  random: () => number,
  now: number,
): Snapshot[] {
  const steps: BalanceMap[] = [openBalances];
  for (let index = 0; index < SEED_POINTS; index++) {
    steps.push(stepBalances(roster, steps[steps.length - 1], random));
  }
  const ordered = steps.reverse();
  return ordered.slice(1).map((balances, index) => ({
    time: now - (SEED_POINTS - 1 - index) * SEED_INTERVAL,
    balances,
    prices: midPrices(roster, balances, ordered[index], open),
  }));
}

/* The depth book starts empty and the sim only prints a few times a minute, so the opening ladder is
   drawn from the same seeded history the chart is drawn from. Newest first, like the live window. */
export function seedFills(roster: Roster, history: readonly Snapshot[], count: number, random: () => number): Fill[] {
  return history
    .slice(-count)
    .map((snapshot) => simulateFill(roster, snapshot.prices, random, snapshot.time))
    .filter((fill): fill is Fill => fill !== null)
    .reverse();
}

/* One print off the floor tape. A field with no seat left standing has nothing to print against. */
export function simulateFill(
  roster: Roster,
  prices: PriceMap,
  random: () => number,
  time: number,
  eliminated: readonly MarketId[] = [],
): Fill | null {
  const live = roster.liveIds(eliminated);
  if (!live.length) return null;
  const id = live[Math.floor(random() * live.length)];
  const side: Side = random() < 0.5 ? 'yes' : 'no';
  const direction: Direction = random() < 0.68 ? 'buy' : 'sell';
  return { id, side, direction, qty: 1 + Math.floor(random() * 24), price: quote(prices, id, side, direction), time, mine: false };
}
