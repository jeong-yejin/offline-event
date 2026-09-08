import {
  T2049_ELIMINATION_INTERVAL_SECONDS,
  T2049_FINALIST_COUNT,
  T2049_INITIAL_TRADER_BALANCE,
  T2049_SESSION_A_SECONDS,
  T2049_TRADERS,
  T2049_BREAK_SECONDS,
  T2049_SESSION_C_SECONDS,
  T2049_SETTLING_SECONDS,
} from '../data/t2049MarketContent';
import {
  BALANCE_DRIFT,
  MOMENTUM_WINDOW_MS,
  TOTAL_PRICE,
  createRandom,
  demandAdjustment,
  demandImbalance,
  momentumAdjustment,
  momentumOf,
  quote,
  type BalanceMap,
  type Direction,
  type Fill,
  type MarketId,
  type OpenMap,
  type OpenQty,
  type PriceMap,
  type Side,
  type Snapshot,
} from './marketEngine';

/* Warm-up history so the chart opens with a shape instead of a flat line. The seed is fixed, so
   every visitor sees the same pre-competition run. */
const SEED_POINTS = 180;
const SEED_INTERVAL = 120000;
const SEED_VALUE = 20261005;
const SEED_OPEN_MAX = 620;

/* The competition states of §59. SESSION_BREAK pauses trading; SETTLING and ENDED close it. */
export type Session = 'ready' | 'sessionA' | 'break' | 'sessionC' | 'settling' | 'ended';

/* A seat's standing in the competition, not the health of its price feed. */
export type TraderState = 'active' | 'eliminated' | 'finalist' | 'winner';

export const T2049_IDS: readonly MarketId[] = T2049_TRADERS.map((trader) => trader.id);

const mapIds = <T,>(transform: (id: MarketId) => T): Record<MarketId, T> =>
  T2049_IDS.reduce((next, id) => ({ ...next, [id]: transform(id) }), {} as Record<MarketId, T>);

export const T2049_OPEN_BALANCES: BalanceMap = mapIds(() => T2049_INITIAL_TRADER_BALANCE);
export const T2049_OPEN_INTEREST: OpenMap = mapIds(() => ({ yes: 0, no: 0 }));

/* ---- session clock ---------------------------------------------------------------------- */

const BREAK_AT = T2049_SESSION_A_SECONDS;
const SESSION_C_AT = BREAK_AT + T2049_BREAK_SECONDS;
const SETTLING_AT = SESSION_C_AT + T2049_SESSION_C_SECONDS;
const ENDED_AT = SETTLING_AT + T2049_SETTLING_SECONDS;

export function sessionAt(elapsedSeconds: number): Session {
  if (elapsedSeconds < 0) return 'ready';
  if (elapsedSeconds < BREAK_AT) return 'sessionA';
  if (elapsedSeconds < SESSION_C_AT) return 'break';
  if (elapsedSeconds < SETTLING_AT) return 'sessionC';
  if (elapsedSeconds < ENDED_AT) return 'settling';
  return 'ended';
}

/* Only the two live sessions accept an RFQ. The break holds positions without pricing them. */
export const isTradingSession = (session: Session) => session === 'sessionA' || session === 'sessionC';

/* Cuts land on the 7:30 grid inside Session A and stop once the finalist field is reached.
   Session C runs the finalists to the close, so co-winners stay possible at final settlement. */
export function eliminationCountAt(elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const due = Math.floor(elapsedSeconds / T2049_ELIMINATION_INTERVAL_SECONDS);
  return Math.min(T2049_TRADERS.length - T2049_FINALIST_COUNT, Math.max(0, due));
}

export const nextEliminationAt = (elapsedSeconds: number) =>
  eliminationCountAt(elapsedSeconds) >= T2049_TRADERS.length - T2049_FINALIST_COUNT
    ? null
    : (Math.floor(elapsedSeconds / T2049_ELIMINATION_INTERVAL_SECONDS) + 1) * T2049_ELIMINATION_INTERVAL_SECONDS;

/* ---- prices ----------------------------------------------------------------------------- */

export const activeIds = (eliminated: readonly MarketId[]) => T2049_IDS.filter((id) => !eliminated.includes(id));

/* An eliminated seat's margin balance counts as 0, so the balance share is taken over the
   remaining field and the active YES prices still add up to 100. */
export const t2049BalanceComponent = (balances: BalanceMap, eliminated: readonly MarketId[]): PriceMap => {
  const live = activeIds(eliminated);
  const total = live.reduce((sum, id) => sum + balances[id], 0);
  return mapIds((id) => (live.includes(id) && total > 0 ? (balances[id] / total) * TOTAL_PRICE : 0));
};

export const t2049Normalize = (raw: PriceMap, eliminated: readonly MarketId[]): PriceMap => {
  const live = activeIds(eliminated);
  const floored = mapIds((id) => (live.includes(id) ? Math.max(0, raw[id]) : 0));
  const total = live.reduce((sum, id) => sum + floored[id], 0);
  if (total > 0) return mapIds((id) => (floored[id] / total) * TOTAL_PRICE);
  return mapIds((id) => (live.includes(id) ? TOTAL_PRICE / live.length : 0));
};

/* Margin balance -> balance share -> momentum -> demand -> active normalize -> YES mid. */
export function t2049MidPrices(balances: BalanceMap, past: BalanceMap, open: OpenMap, eliminated: readonly MarketId[]): PriceMap {
  const base = t2049BalanceComponent(balances, eliminated);
  return t2049Normalize(
    mapIds((id) => base[id] + momentumAdjustment(momentumOf(balances[id], past[id])) + demandAdjustment(demandImbalance(open[id] as OpenQty))),
    eliminated,
  );
}

export const T2049_OPEN_PRICES: PriceMap = t2049MidPrices(T2049_OPEN_BALANCES, T2049_OPEN_BALANCES, T2049_OPEN_INTEREST, []);

export function t2049StepBalances(balances: BalanceMap, eliminated: readonly MarketId[], random: () => number): BalanceMap {
  return mapIds((id) => (eliminated.includes(id) ? 0 : Math.max(0, balances[id] * (1 + (random() * 2 - 1) * BALANCE_DRIFT))));
}

export const t2049ApplyOpen = (open: OpenMap, id: MarketId, side: Side, delta: number): OpenMap =>
  mapIds((other) => (other === id ? { ...open[other], [side]: Math.max(0, open[other][side] + delta) } : open[other]));

export const t2049RankOf = (balances: BalanceMap, id: MarketId) =>
  T2049_IDS.filter((other) => balances[other] > balances[id]).length + 1;

export const t2049ReturnOf = (balance: number) =>
  ((balance - T2049_INITIAL_TRADER_BALANCE) / T2049_INITIAL_TRADER_BALANCE) * 100;

/* ---- elimination and settlement ---------------------------------------------------------- */

/* The seat with the lowest margin balance leaves. Ties break on seat order so a replay of the
   same balance history always eliminates the same seat. */
export function weakestActive(balances: BalanceMap, eliminated: readonly MarketId[]): MarketId | null {
  const live = activeIds(eliminated);
  if (!live.length) return null;
  return live.reduce((weakest, id) => (balances[id] < balances[weakest] ? id : weakest), live[0]);
}

/* Highest final margin balance wins. A tie makes co-winners, which §58 splits. */
export function t2049WinnersOf(balances: BalanceMap, eliminated: readonly MarketId[]): MarketId[] {
  const live = activeIds(eliminated);
  if (!live.length) return [];
  const best = live.reduce((top, id) => Math.max(top, balances[id]), Number.NEGATIVE_INFINITY);
  return live.filter((id) => balances[id] === best);
}

/* An eliminated market settles at once: YES 0, NO 100. */
export const eliminationPrice = (side: Side) => (side === 'yes' ? 0 : TOTAL_PRICE);

/* One winner pays YES 100. N co-winners each pay 100/N and their NO takes the rest. */
export const t2049SettlementPrice = (winners: readonly MarketId[], id: MarketId, side: Side) => {
  const yes = winners.includes(id) ? TOTAL_PRICE / winners.length : 0;
  return side === 'yes' ? yes : TOTAL_PRICE - yes;
};

export function traderStateOf(id: MarketId, session: Session, eliminated: readonly MarketId[], winners: readonly MarketId[] | null): TraderState {
  if (eliminated.includes(id)) return 'eliminated';
  if (winners) return winners.includes(id) ? 'winner' : 'eliminated';
  return session === 'break' || session === 'sessionC' ? 'finalist' : 'active';
}

/* ---- opening book ------------------------------------------------------------------------ */

export const t2049SeedOpenInterest = (): OpenMap => {
  const random = createRandom(SEED_VALUE);
  return mapIds(() => ({ yes: Math.floor(random() * SEED_OPEN_MAX), no: Math.floor(random() * SEED_OPEN_MAX) }));
};

export function t2049SeedHistory(now: number): Snapshot[] {
  const random = createRandom(SEED_VALUE);
  const open = t2049SeedOpenInterest();
  return Array.from({ length: SEED_POINTS }).reduce<Snapshot[]>((points, _step, index) => {
    const previous = points.length ? points[points.length - 1].balances : T2049_OPEN_BALANCES;
    const time = now - (SEED_POINTS - index) * SEED_INTERVAL;
    const window = points.find((point) => time - point.time <= MOMENTUM_WINDOW_MS);
    const balances = t2049StepBalances(previous, [], random);
    return [...points, { time, balances, prices: t2049MidPrices(balances, window ? window.balances : T2049_OPEN_BALANCES, open, []) }];
  }, []);
}

/* Floor trade tape. Eliminated seats are closed, so the tape never prints against them. */
export function t2049SimulateFill(prices: PriceMap, eliminated: readonly MarketId[], random: () => number, time: number): Fill | null {
  const live = activeIds(eliminated);
  if (!live.length) return null;
  const id = live[Math.floor(random() * live.length)];
  const side: Side = random() < 0.5 ? 'yes' : 'no';
  const direction: Direction = random() < 0.68 ? 'buy' : 'sell';
  return { id, side, direction, qty: 1 + Math.floor(random() * 24), price: quote(prices, id, side, direction), time, mine: false };
}
