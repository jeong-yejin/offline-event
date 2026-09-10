import { mapRecord } from '../record';
import { appendBounded, balancesAt } from '../history';
import {
  T2049_BREAK_SECONDS,
  T2049_OPENING_VOLUME,
  T2049_SESSION_A_SECONDS,
  T2049_SESSION_C_SECONDS,
  T2049_SETTLING_SECONDS,
  T2049_STARTING_POINT,
} from '../../data/t2049MarketContent';
import { isExpired, type OrderQuote } from '../quote';
import {
  T2049_RUN_SECONDS,
  eliminationCountAt,
  isTradingSession,
  sessionAt,
  type Session,
} from './clock';
import {
  MOMENTUM_WINDOW_MS,
  T2049_IDS,
  T2049_OPEN_BALANCES,
  T2049_OPEN_PRICES,
  addFill,
  applyOpen,
  averageEntry,
  createRandom,
  dataStatusOf,
  eliminationPrice,
  findHolding,
  midPrices,
  removeFill,
  seedFills,
  seedHistory,
  seedOpenInterest,
  settlementPrice,
  simulateFill,
  stepBalances,
  weakestActive,
  winnersOf,
  type BalanceMap,
  type DataStatus,
  type Fill,
  type Holding,
  type MarketId,
  type OpenMap,
  type PriceMap,
  type Side,
  type Snapshot,
} from './market';

export type T2049Settlement = { winners: MarketId[]; payout: number; balances: BalanceMap };

/* The seat that just left, so the page can raise the elimination banner over the floor. */
export type Cut = { id: MarketId; time: number; payout: number };

/* A position leaves the book two ways before the final bell: the holder sells it, or its seat is
   cut and the market settles under it. Both take the row off the open board, so the price it left
   at is recorded here or the holder has no way back to what the trade actually returned. */
export type ClosedPosition = { id: MarketId; side: Side; qty: number; entry: number; exit: number; time: number };

export type T2049State = {
  time: number;
  startAt: number;
  balances: BalanceMap;
  prices: PriceMap;
  open: OpenMap;
  updatedAt: Record<MarketId, number>;
  history: Snapshot[];
  fills: Fill[];
  closed: ClosedPosition[];
  volume: number;
  point: number;
  holdings: Holding[];
  eliminated: MarketId[];
  lastCut: Cut | null;
  settlement: T2049Settlement | null;
  filled: string[];
};

type T2049Action = ({ type: 'tick'; seed: number } | { type: 'fill'; quote: OrderQuote }) & { time: number };

/* Eliminations are decided from a balance run that is not itself persisted, so the seats that
   already left have to be stored or a reload would cut different people. */
export type StoredAccount = Pick<T2049State, 'startAt' | 'point' | 'holdings' | 'eliminated' | 'settlement' | 'closed'>;

const HISTORY_LIMIT = 3600;
/* The book reads one seat at a time, so the window has to hold a ladder's worth of prints per seat
   rather than a screen's worth in total. */
const FILL_LIMIT = 12 * T2049_IDS.length;
const FILL_CHANCE = 0.34;
/* Deep enough to hold a full run of sells and every cut a holder can sit through. */
const CLOSED_LIMIT = 40;
const FEED_REFRESH_CHANCE = 0.92;

const SEGMENT_END: Record<Session, number> = {
  ready: 0,
  sessionA: T2049_SESSION_A_SECONDS,
  break: T2049_SESSION_A_SECONDS + T2049_BREAK_SECONDS,
  sessionC: T2049_SESSION_A_SECONDS + T2049_BREAK_SECONDS + T2049_SESSION_C_SECONDS,
  settling: T2049_SESSION_A_SECONDS + T2049_BREAK_SECONDS + T2049_SESSION_C_SECONDS + T2049_SETTLING_SECONDS,
  ended: 0,
};

export const elapsedOf = (state: T2049State) => (state.time - state.startAt) / 1000;

export const sessionOf = (state: T2049State): Session => sessionAt(elapsedOf(state));

/* Time left in the segment on screen. ENDED has nothing left to count. */
export function secondsLeftOf(state: T2049State) {
  const session = sessionOf(state);
  if (session === 'ended') return 0;
  if (session === 'ready') return Math.max(0, Math.round(-elapsedOf(state)));
  return Math.max(0, Math.round(SEGMENT_END[session] - elapsedOf(state)));
}

export const isClosed = (state: T2049State, id: MarketId) => state.eliminated.includes(id) || state.settlement !== null;

/* A closed feed is not a broken feed. Only a seat still trading can go delayed or stale; a cut seat and
   every seat during the intermission or the close hold their last print, and the board stays quiet. */
export const statusOf = (state: T2049State, id: MarketId): DataStatus =>
  isTradingSession(sessionOf(state)) && !isClosed(state, id) ? dataStatusOf(state.updatedAt[id], state.time) : 'live';

const pastBalances = (history: readonly Snapshot[], time: number): BalanceMap =>
  balancesAt(history, time - MOMENTUM_WINDOW_MS, T2049_OPEN_BALANCES);

/* Most seats refresh on most ticks. The gaps are what turn a card DELAYED and then STALE. */
const feedTimes = (previous: Record<MarketId, number>, time: number, random: () => number) =>
  mapRecord(T2049_IDS, (id) => random() < FEED_REFRESH_CHANCE ? time : previous[id]);


/* The run is 70 minutes long and the start time is persisted, so a visitor coming back the next day
   would otherwise land on a market that ended hours ago. A finished run reopens instead. */
const isSpent = (stored: StoredAccount, time: number) => (time - stored.startAt) / 1000 >= T2049_RUN_SECONDS;

export function createInitialState(time: number, saved: StoredAccount | null = null): T2049State {
  const stored = saved && isSpent(saved, time) ? null : saved;
  const eliminated = stored?.eliminated ?? [];
  const balances = mapRecord(T2049_IDS, (id) => eliminated.includes(id) ? 0 : T2049_OPEN_BALANCES[id]);
  const history = seedHistory(time);
  return {
    time,
    startAt: stored?.startAt ?? time,
    balances,
    prices: eliminated.length ? midPrices(balances, balances, seedOpenInterest(), eliminated) : T2049_OPEN_PRICES,
    open: seedOpenInterest(),
    updatedAt: mapRecord(T2049_IDS, () => time),
    history,
    fills: seedFills(history, FILL_LIMIT),
    closed: stored?.closed ?? [],
    volume: T2049_OPENING_VOLUME,
    point: stored?.point ?? T2049_STARTING_POINT,
    holdings: stored?.holdings ?? [],
    eliminated,
    lastCut: null,
    settlement: stored?.settlement ?? null,
    filled: [],
  };
}

/* A cut settles that seat's market on the spot: YES 0, NO 100. The proceeds land in available
   point straight away, so they can be put back to work on the seats still standing. */
type Cuts = Pick<T2049State, 'eliminated' | 'holdings' | 'point' | 'lastCut' | 'closed'>;

const closeOf = (holding: Holding, qty: number, exit: number, time: number): ClosedPosition =>
  ({ id: holding.id, side: holding.side, qty, entry: averageEntry(holding), exit, time });

function applyCuts(state: T2049State, balances: BalanceMap, time: number, due: number): Cuts {
  const pending = Array.from({ length: Math.max(0, due - state.eliminated.length) });
  return pending.reduce<Cuts>(
    (carried) => {
      const out = weakestActive(balances, carried.eliminated);
      if (!out) return carried;
      const leaving = carried.holdings.filter((holding) => holding.id === out);
      const payout = leaving.reduce((total, holding) => total + holding.qty * eliminationPrice(holding.side), 0);
      return {
        eliminated: [...carried.eliminated, out],
        holdings: carried.holdings.filter((holding) => holding.id !== out),
        point: carried.point + payout,
        lastCut: { id: out, time, payout },
        closed: [
          ...leaving.map((holding) => closeOf(holding, holding.qty, eliminationPrice(holding.side), time)),
          ...carried.closed,
        ].slice(0, CLOSED_LIMIT),
      };
    },
    { eliminated: state.eliminated, holdings: state.holdings, point: state.point, lastCut: state.lastCut, closed: state.closed },
  );
}

/* Highest final margin balance wins, per the competition rule. A tie makes co-winners.
   The payout is recorded and not credited: prizes are paid by hand a few days after the event.
   Cut payouts during the competition still land in `point`, because that capital has to go back
   on the board for the seats that are still trading. */
function settle(state: T2049State): T2049State {
  const winners = winnersOf(state.balances, state.eliminated);
  const payout = state.holdings.reduce(
    (total, holding) => total + holding.qty * settlementPrice(winners, holding.id, holding.side),
    0,
  );
  return { ...state, settlement: { winners, payout, balances: state.balances } };
}

function applyTick(state: T2049State, time: number, seed: number): T2049State {
  const random = createRandom(seed);
  const next = { ...state, time };
  const session = sessionOf(next);

  if (session === 'ended') return state.settlement ? next : settle(next);
  if (session === 'ready') return next;
  /* The break and the settling window hold every position, price and feed clock where the bell left
     them. The fourth cut falls on the Semifinal bell itself, so a cut still owed is taken here or the
     Final would open on five seats instead of four. */
  if (session === 'break' || session === 'settling') {
    const cuts = applyCuts(state, state.balances, time, eliminationCountAt(elapsedOf(next)));
    const paused = next;
    if (cuts.eliminated.length === state.eliminated.length) return paused;
    const balances = mapRecord(T2049_IDS, (id) => cuts.eliminated.includes(id) ? 0 : state.balances[id]);
    return {
      ...paused,
      balances,
      prices: midPrices(balances, balances, state.open, cuts.eliminated),
      eliminated: cuts.eliminated,
      holdings: cuts.holdings,
      point: cuts.point,
      lastCut: cuts.lastCut,
      closed: cuts.closed,
    };
  }

  const stepped = stepBalances(state.balances, state.eliminated, random);
  const cuts = applyCuts(state, stepped, time, eliminationCountAt(elapsedOf(next)));
  const balances = mapRecord(T2049_IDS, (id) => cuts.eliminated.includes(id) ? 0 : stepped[id]);
  const prices = midPrices(balances, pastBalances(state.history, time), state.open, cuts.eliminated);
  const fill = random() < FILL_CHANCE ? simulateFill(prices, cuts.eliminated, random, time) : null;

  return {
    ...next,
    balances,
    prices,
    open: fill ? applyOpen(state.open, fill.id, fill.side, fill.direction === 'buy' ? fill.qty : -fill.qty) : state.open,
    updatedAt: feedTimes(state.updatedAt, time, random),
    history: appendBounded(state.history, { time, balances, prices }, HISTORY_LIMIT),
    fills: fill ? [fill, ...state.fills].slice(0, FILL_LIMIT) : state.fills,
    volume: state.volume + (fill ? fill.qty * fill.price : 0),
    eliminated: cuts.eliminated,
    holdings: cuts.holdings,
    point: cuts.point,
    lastCut: cuts.lastCut,
    closed: cuts.closed,
  };
}

/* A quote is the only way in. It has to be live, on an open seat, affordable, and never filled. */
function applyFill(state: T2049State, time: number, quote: OrderQuote): T2049State {
  const { marketId, positionSide, orderSide, quantity, unitPrice, totalPrice } = quote;
  const next = { ...state, time };
  if (!isTradingSession(sessionOf(next))) return state;
  if (isExpired(quote, time) || state.filled.includes(quote.idempotencyKey)) return state;
  if (state.eliminated.includes(marketId)) return state;
  if (statusOf(next, marketId) === 'stale') return state;
  const held = findHolding(state.holdings, marketId, positionSide);
  if (orderSide === 'buy' ? totalPrice > state.point : !held || held.qty < quantity) return state;
  return {
    ...next,
    point: orderSide === 'buy' ? state.point - totalPrice : state.point + totalPrice,
    holdings: orderSide === 'buy'
      ? addFill(state.holdings, marketId, positionSide, quantity, unitPrice)
      : removeFill(state.holdings, marketId, positionSide, quantity),
    open: applyOpen(state.open, marketId, positionSide, orderSide === 'buy' ? quantity : -quantity),
    closed: orderSide === 'sell' && held
      ? [closeOf(held, quantity, unitPrice, time), ...state.closed].slice(0, CLOSED_LIMIT)
      : state.closed,
    fills: [{ id: marketId, side: positionSide, direction: orderSide, qty: quantity, price: unitPrice, time, mine: true }, ...state.fills].slice(0, FILL_LIMIT),
    volume: state.volume + totalPrice,
    filled: [...state.filled, quote.idempotencyKey].slice(-64),
  };
}

export const reduceT2049 = (state: T2049State, action: T2049Action): T2049State =>
  action.type === 'tick' ? applyTick(state, action.time, action.seed) : applyFill(state, action.time, action.quote);

