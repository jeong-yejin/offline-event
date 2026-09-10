/* PERP-DEX DAY's market: the shared kernel bound to this event's four-trader line-up. Callers get
   the kernel's own names with the roster already filled in, so nothing downstream repeats it. This
   is the only file in the PERP-DEX DAY slice that knows who is on the floor. */
import { INITIAL_TRADER_BALANCE, PERP_DEX_TRADERS, type PerpDexTraderId } from '../../data/perpDexMarketContent';
import * as kernel from '../engine';
import type { BalanceMap, Fill, MarketId, OpenMap, PriceMap, Side, Snapshot } from '../engine';

export type {
  BalanceMap, DataStatus, Direction, Fill, Holding, MarketId, MarketTrader,
  OpenMap, OpenQty, PriceMap, Side, Snapshot, TraderState,
} from '../engine';
export {
  BALANCE_DRIFT, DELAYED_AFTER_MS, DEMAND_MAX, DEMAND_WEIGHT, MOMENTUM_MAX, MOMENTUM_WEIGHT,
  MOMENTUM_WINDOW_MS, RFQ_SPREAD, STALE_AFTER_MS, TOTAL_PRICE, VIRTUAL_LIQUIDITY,
  addFill, averageEntry, chanceOf, createRandom, dataStatusOf, demandAdjustment, demandImbalance,
  findHolding, holdingValue, midOf, momentumAdjustment, momentumOf, quote, removeFill, rfqPrice,
  settlementPayout, settlementPrice, totalAsset,
} from '../engine';

/* Warm-up history and the opening ladder. The seed is fixed, so every visitor opens on the same
   pre-competition run. */
const SEED_VALUE = 20260906;
const SEED_OPEN_MAX = 900;

export const PERP_DEX_IDS: readonly PerpDexTraderId[] = PERP_DEX_TRADERS.map((candidate) => candidate.id);

const ROSTER = kernel.createRoster(PERP_DEX_IDS);

/* No seat ever leaves this board, so the whole line-up is live from the opening bell to the close
   and the kernel's elimination argument is never used. */
export const OPEN_BALANCES: BalanceMap = ROSTER.mapIds(() => INITIAL_TRADER_BALANCE);
export const OPEN_INTEREST: OpenMap = ROSTER.mapIds(() => ({ yes: 0, no: 0 }));

export const balanceComponent = (balances: BalanceMap): PriceMap =>
  kernel.balanceComponent(ROSTER, balances, PERP_DEX_IDS);

export const normalize = (raw: PriceMap): PriceMap => kernel.normalize(ROSTER, raw, PERP_DEX_IDS);

export const midPrices = (balances: BalanceMap, past: BalanceMap, open: OpenMap): PriceMap =>
  kernel.midPrices(ROSTER, balances, past, open);

export const OPEN_PRICES: PriceMap = midPrices(OPEN_BALANCES, OPEN_BALANCES, OPEN_INTEREST);

export const stepBalances = (balances: BalanceMap, random: () => number): BalanceMap =>
  kernel.stepBalances(ROSTER, balances, random);

export const applyOpen = (open: OpenMap, id: MarketId, side: Side, delta: number): OpenMap =>
  kernel.applyOpen(ROSTER, open, id, side, delta);

export const rankOf = (balances: BalanceMap, id: MarketId) => kernel.rankOf(PERP_DEX_IDS, balances, id);

export const returnOf = (balance: number) => kernel.returnOf(balance, INITIAL_TRADER_BALANCE);

export const winnersOf = (balances: BalanceMap): MarketId[] => kernel.winnersOf(balances, PERP_DEX_IDS);

export const seedOpenInterest = (): OpenMap =>
  kernel.seedOpenBook(ROSTER, kernel.createRandom(SEED_VALUE), SEED_OPEN_MAX);

/* Here the depth book is drawn off the head of the stream the balance walk then continues on, so
   the opening chart and the opening ladder come out of one run. TOKEN2049 draws its book off a
   stream of its own; the two shapes differ because of that and have since they shipped. */
export function seedHistory(now: number): Snapshot[] {
  const random = kernel.createRandom(SEED_VALUE);
  const open = kernel.seedOpenBook(ROSTER, random, SEED_OPEN_MAX);
  return kernel.seedHistory(ROSTER, OPEN_BALANCES, open, random, now);
}

export const seedFills = (history: readonly Snapshot[], count: number): Fill[] =>
  kernel.seedFills(ROSTER, history, count, kernel.createRandom(SEED_VALUE));

export const simulateFill = (prices: PriceMap, random: () => number, time: number): Fill | null =>
  kernel.simulateFill(ROSTER, prices, random, time);
