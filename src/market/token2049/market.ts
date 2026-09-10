/* TOKEN2049's market: the shared kernel bound to the eight-seat survival line-up. Seats are cut as
   the run goes on, so almost every call here carries the eliminated list and prices over what is
   left. This is the only file in the TOKEN2049 slice that knows who is on the floor. */
import { T2049_INITIAL_TRADER_BALANCE, T2049_TRADERS } from '../../data/t2049MarketContent';
import * as kernel from '../engine';
import type { BalanceMap, Fill, MarketId, OpenMap, PriceMap, Side, Snapshot, TraderState } from '../engine';
import type { Session } from './clock';

export type {
  BalanceMap, DataStatus, Direction, Fill, Holding, MarketId, MarketTrader,
  OpenMap, OpenQty, PriceMap, Side, Snapshot, TraderState,
} from '../engine';
export {
  MOMENTUM_WINDOW_MS, TOTAL_PRICE,
  addFill, averageEntry, chanceOf, createRandom, dataStatusOf, findHolding, quote, removeFill,
  settlementPrice, totalAsset,
} from '../engine';

/* Warm-up history and the opening ladder. The seed is fixed, so every visitor opens on the same
   pre-competition run. */
const SEED_VALUE = 20261005;
const SEED_OPEN_MAX = 620;

export const T2049_IDS: readonly MarketId[] = T2049_TRADERS.map((trader) => trader.id);

const ROSTER = kernel.createRoster(T2049_IDS);

export const T2049_OPEN_BALANCES: BalanceMap = ROSTER.mapIds(() => T2049_INITIAL_TRADER_BALANCE);
export const T2049_OPEN_INTEREST: OpenMap = ROSTER.mapIds(() => ({ yes: 0, no: 0 }));

export const activeIds = (eliminated: readonly MarketId[]) => ROSTER.liveIds(eliminated);

/* An eliminated seat's margin balance counts as 0, so the balance share is taken over the
   remaining field and the active YES prices still add up to 100. */
export const balanceComponent = (balances: BalanceMap, eliminated: readonly MarketId[]): PriceMap =>
  kernel.balanceComponent(ROSTER, balances, activeIds(eliminated));

export const normalize = (raw: PriceMap, eliminated: readonly MarketId[]): PriceMap =>
  kernel.normalize(ROSTER, raw, activeIds(eliminated));

export const midPrices = (balances: BalanceMap, past: BalanceMap, open: OpenMap, eliminated: readonly MarketId[]): PriceMap =>
  kernel.midPrices(ROSTER, balances, past, open, eliminated);

export const T2049_OPEN_PRICES: PriceMap = midPrices(T2049_OPEN_BALANCES, T2049_OPEN_BALANCES, T2049_OPEN_INTEREST, []);

export const stepBalances = (balances: BalanceMap, eliminated: readonly MarketId[], random: () => number): BalanceMap =>
  kernel.stepBalances(ROSTER, balances, random, eliminated);

export const applyOpen = (open: OpenMap, id: MarketId, side: Side, delta: number): OpenMap =>
  kernel.applyOpen(ROSTER, open, id, side, delta);

export const rankOf = (balances: BalanceMap, id: MarketId) => kernel.rankOf(T2049_IDS, balances, id);

export const returnOf = (balance: number) => kernel.returnOf(balance, T2049_INITIAL_TRADER_BALANCE);

/* ---- elimination and settlement ---------------------------------------------------------- */

/* The seat with the lowest margin balance leaves. Ties break on seat order so a replay of the
   same balance history always cuts the same seat. */
export function weakestActive(balances: BalanceMap, eliminated: readonly MarketId[]): MarketId | null {
  const live = activeIds(eliminated);
  if (!live.length) return null;
  return live.reduce((weakest, id) => (balances[id] < balances[weakest] ? id : weakest), live[0]);
}

/* Highest final margin balance wins. A tie makes co-winners, which §58 splits. */
export const winnersOf = (balances: BalanceMap, eliminated: readonly MarketId[]): MarketId[] =>
  kernel.winnersOf(balances, activeIds(eliminated));

/* A cut market settles at once: YES 0, NO 100. */
export const eliminationPrice = (side: Side) => (side === 'yes' ? 0 : kernel.TOTAL_PRICE);

export function traderStateOf(id: MarketId, session: Session, eliminated: readonly MarketId[], winners: readonly MarketId[] | null): TraderState {
  if (eliminated.includes(id)) return 'eliminated';
  if (winners) return winners.includes(id) ? 'winner' : 'eliminated';
  return session === 'break' || session === 'sessionC' ? 'finalist' : 'active';
}

/* ---- seeding ------------------------------------------------------------------------------ */

/* The depth book runs off a stream of its own, so the balance walk below starts at the head of the
   seed rather than after eight draws. PERP-DEX DAY shares one stream between the two; the shapes
   differ because of that and have since both boards shipped. */
export const seedOpenInterest = (): OpenMap =>
  kernel.seedOpenBook(ROSTER, kernel.createRandom(SEED_VALUE), SEED_OPEN_MAX);

export const seedHistory = (now: number): Snapshot[] =>
  kernel.seedHistory(ROSTER, T2049_OPEN_BALANCES, seedOpenInterest(), kernel.createRandom(SEED_VALUE), now);

export const seedFills = (history: readonly Snapshot[], count: number): Fill[] =>
  kernel.seedFills(ROSTER, history, count, kernel.createRandom(SEED_VALUE));

/* Eliminated seats are closed, so the tape never prints against them. */
export const simulateFill = (prices: PriceMap, eliminated: readonly MarketId[], random: () => number, time: number): Fill | null =>
  kernel.simulateFill(ROSTER, prices, random, time, eliminated);
