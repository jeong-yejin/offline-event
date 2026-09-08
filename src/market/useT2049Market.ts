import { useCallback, useEffect, useReducer } from 'react';
import {
  T2049_BREAK_SECONDS,
  T2049_OPENING_VOLUME,
  T2049_SESSION_A_SECONDS,
  T2049_SESSION_C_SECONDS,
  T2049_SETTLING_SECONDS,
  T2049_STARTING_POINT,
  T2049_STORAGE_KEY,
} from '../data/t2049MarketContent';
import {
  MOMENTUM_WINDOW_MS,
  addFill,
  createRandom,
  dataStatusOf,
  findHolding,
  removeFill,
  type BalanceMap,
  type DataStatus,
  type Direction,
  type Fill,
  type Holding,
  type MarketId,
  type OpenMap,
  type PriceMap,
  type Side,
  type Snapshot,
} from './marketEngine';
import { isExpired, type OrderQuote } from './quote';
import {
  T2049_IDS,
  T2049_OPEN_BALANCES,
  T2049_OPEN_PRICES,
  eliminationCountAt,
  eliminationPrice,
  isTradingSession,
  sessionAt,
  t2049ApplyOpen,
  t2049MidPrices,
  t2049SeedHistory,
  t2049SeedOpenInterest,
  t2049SettlementPrice,
  t2049SimulateFill,
  t2049StepBalances,
  t2049WinnersOf,
  weakestActive,
  type Session,
} from './t2049Engine';

export type T2049Settlement = { winners: MarketId[]; payout: number; balances: BalanceMap };

/* The seat that just left, so the page can raise the elimination banner over the floor. */
export type Cut = { id: MarketId; time: number; payout: number };

export type T2049State = {
  time: number;
  startAt: number;
  balances: BalanceMap;
  prices: PriceMap;
  open: OpenMap;
  updatedAt: Record<MarketId, number>;
  history: Snapshot[];
  fills: Fill[];
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
type StoredAccount = Pick<T2049State, 'startAt' | 'point' | 'holdings' | 'eliminated' | 'settlement'>;

const TICK_INTERVAL = 1000;
const HISTORY_LIMIT = 3600;
const FILL_LIMIT = 12;
const FILL_CHANCE = 0.34;
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

export const statusOf = (state: T2049State, id: MarketId): DataStatus => dataStatusOf(state.updatedAt[id], state.time);

export const isClosed = (state: T2049State, id: MarketId) => state.eliminated.includes(id) || state.settlement !== null;

const pastBalances = (history: readonly Snapshot[], time: number): BalanceMap => {
  const cutoff = time - MOMENTUM_WINDOW_MS;
  const older = history.filter((point) => point.time <= cutoff);
  return older.length ? older[older.length - 1].balances : T2049_OPEN_BALANCES;
};

/* Most seats refresh on most ticks. The gaps are what turn a card DELAYED and then STALE. */
const feedTimes = (previous: Record<MarketId, number>, time: number, random: () => number) =>
  T2049_IDS.reduce((map, id) => ({ ...map, [id]: random() < FEED_REFRESH_CHANCE ? time : previous[id] }), {} as Record<MarketId, number>);

const allFeedsFresh = (time: number) => T2049_IDS.reduce((map, id) => ({ ...map, [id]: time }), {} as Record<MarketId, number>);

function readAccount(): StoredAccount | null {
  try {
    const stored = window.localStorage.getItem(T2049_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as StoredAccount) : null;
  } catch {
    return null;
  }
}

function writeAccount(account: StoredAccount) {
  try {
    window.localStorage.setItem(T2049_STORAGE_KEY, JSON.stringify(account));
  } catch {
    return;
  }
}

export function createInitialState(): T2049State {
  const time = Date.now();
  const stored = readAccount();
  const eliminated = stored?.eliminated ?? [];
  const balances = T2049_IDS.reduce(
    (map, id) => ({ ...map, [id]: eliminated.includes(id) ? 0 : T2049_OPEN_BALANCES[id] }),
    {} as BalanceMap,
  );
  return {
    time,
    startAt: stored?.startAt ?? time,
    balances,
    prices: eliminated.length ? t2049MidPrices(balances, balances, t2049SeedOpenInterest(), eliminated) : T2049_OPEN_PRICES,
    open: t2049SeedOpenInterest(),
    updatedAt: T2049_IDS.reduce((map, id) => ({ ...map, [id]: time }), {} as Record<MarketId, number>),
    history: t2049SeedHistory(time),
    fills: [],
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
type Cuts = Pick<T2049State, 'eliminated' | 'holdings' | 'point' | 'lastCut'>;

function applyCuts(state: T2049State, balances: BalanceMap, time: number, due: number): Cuts {
  const pending = Array.from({ length: Math.max(0, due - state.eliminated.length) });
  return pending.reduce<Cuts>(
    (carried) => {
      const out = weakestActive(balances, carried.eliminated);
      if (!out) return carried;
      const payout = carried.holdings
        .filter((holding) => holding.id === out)
        .reduce((total, holding) => total + holding.qty * eliminationPrice(holding.side), 0);
      return {
        eliminated: [...carried.eliminated, out],
        holdings: carried.holdings.filter((holding) => holding.id !== out),
        point: carried.point + payout,
        lastCut: { id: out, time, payout },
      };
    },
    { eliminated: state.eliminated, holdings: state.holdings, point: state.point, lastCut: state.lastCut },
  );
}

/* Highest final margin balance wins, per the competition rule. A tie makes co-winners. */
function settle(state: T2049State): T2049State {
  const winners = t2049WinnersOf(state.balances, state.eliminated);
  const payout = state.holdings.reduce(
    (total, holding) => total + holding.qty * t2049SettlementPrice(winners, holding.id, holding.side),
    0,
  );
  return { ...state, point: state.point + payout, settlement: { winners, payout, balances: state.balances } };
}

function applyTick(state: T2049State, time: number, seed: number): T2049State {
  const random = createRandom(seed);
  const next = { ...state, time };
  const session = sessionOf(next);

  if (session === 'ended') return state.settlement ? next : settle(next);
  if (session === 'ready') return next;
  /* The break and the settling window hold every position and price where the bell left them.
     Feeds keep reporting so a paused card is never mistaken for a dead one. */
  if (session === 'break' || session === 'settling') return { ...next, updatedAt: allFeedsFresh(time) };

  const stepped = t2049StepBalances(state.balances, state.eliminated, random);
  const cuts = applyCuts(state, stepped, time, eliminationCountAt(elapsedOf(next)));
  const balances = T2049_IDS.reduce(
    (map, id) => ({ ...map, [id]: cuts.eliminated.includes(id) ? 0 : stepped[id] }),
    {} as BalanceMap,
  );
  const prices = t2049MidPrices(balances, pastBalances(state.history, time), state.open, cuts.eliminated);
  const fill = random() < FILL_CHANCE ? t2049SimulateFill(prices, cuts.eliminated, random, time) : null;

  return {
    ...next,
    balances,
    prices,
    open: fill ? t2049ApplyOpen(state.open, fill.id, fill.side, fill.direction === 'buy' ? fill.qty : -fill.qty) : state.open,
    updatedAt: feedTimes(state.updatedAt, time, random),
    history: [...state.history, { time, balances, prices }].slice(-HISTORY_LIMIT),
    fills: fill ? [fill, ...state.fills].slice(0, FILL_LIMIT) : state.fills,
    volume: state.volume + (fill ? fill.qty * fill.price : 0),
    eliminated: cuts.eliminated,
    holdings: cuts.holdings,
    point: cuts.point,
    lastCut: cuts.lastCut,
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
    open: t2049ApplyOpen(state.open, marketId, positionSide, orderSide === 'buy' ? quantity : -quantity),
    fills: [{ id: marketId, side: positionSide, direction: orderSide, qty: quantity, price: unitPrice, time, mine: true }, ...state.fills].slice(0, FILL_LIMIT),
    volume: state.volume + totalPrice,
    filled: [...state.filled, quote.idempotencyKey].slice(-64),
  };
}

export const reduceT2049 = (state: T2049State, action: T2049Action): T2049State =>
  action.type === 'tick' ? applyTick(state, action.time, action.seed) : applyFill(state, action.time, action.quote);

export function useT2049Market() {
  const [state, dispatch] = useReducer(reduceT2049, undefined, createInitialState);

  useEffect(() => {
    const timer = window.setInterval(
      () => dispatch({ type: 'tick', time: Date.now(), seed: Math.floor(Math.random() * 4294967296) }),
      TICK_INTERVAL,
    );
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    writeAccount({
      startAt: state.startAt,
      point: state.point,
      holdings: state.holdings,
      eliminated: state.eliminated,
      settlement: state.settlement,
    });
  }, [state.startAt, state.point, state.holdings, state.eliminated, state.settlement]);

  const fill = useCallback((quote: OrderQuote) => dispatch({ type: 'fill', time: Date.now(), quote }), []);

  return { state, fill };
}

export type { Direction, Side };
