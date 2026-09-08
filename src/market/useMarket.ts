import { useCallback, useEffect, useReducer } from 'react';
import { COMPETITION_SECONDS, MARKET_STORAGE_KEY, OPENING_VOLUME, SETTLING_SECONDS, STARTING_POINT } from '../data/voteContent';
import { CANDIDATE_IDS, MOMENTUM_WINDOW_MS, OPEN_BALANCES, OPEN_PRICES, addFill, applyOpen, createRandom, dataStatusOf, findHolding, midPrices, removeFill, seedHistory, seedOpenInterest, settlementPayout, simulateFill, stepBalances, winnersOf, type BalanceMap, type DataStatus, type Direction, type Fill, type Holding, type MarketId, type OpenMap, type PriceMap, type Side, type Snapshot } from './marketEngine';
import { isExpired, type OrderQuote } from './quote';

export type Phase = 'ready' | 'live' | 'settling' | 'ended';
export type Settlement = { winners: MarketId[]; payout: number; balances: BalanceMap };

export type MarketState = {
  time: number;
  startAt: number;
  closeAt: number;
  settleAt: number;
  balances: BalanceMap;
  prices: PriceMap;
  open: OpenMap;
  updatedAt: Record<MarketId, number>;
  history: Snapshot[];
  fills: Fill[];
  volume: number;
  point: number;
  holdings: Holding[];
  settlement: Settlement | null;
  filled: string[];
};

type MarketAction = ({ type: 'tick'; seed: number } | { type: 'fill'; quote: OrderQuote }) & { time: number };

type StoredAccount = Pick<MarketState, 'startAt' | 'closeAt' | 'point' | 'holdings' | 'settlement'>;

const TICK_INTERVAL = 1000;
const HISTORY_LIMIT = 3600;
const FILL_LIMIT = 12;
const FILL_CHANCE = 0.34;
/* Each trader's feed refreshes on most ticks. The gaps are what turn a card delayed. */
const FEED_REFRESH_CHANCE = 0.92;

export function phaseOf(state: MarketState): Phase {
  if (state.time < state.startAt) return 'ready';
  if (state.time < state.closeAt) return 'live';
  return state.settlement ? 'ended' : 'settling';
}

export const secondsLeftOf = (state: MarketState) =>
  Math.max(0, Math.round(((phaseOf(state) === 'ready' ? state.startAt : state.closeAt) - state.time) / 1000));

export const statusOf = (state: MarketState, id: MarketId): DataStatus => dataStatusOf(state.updatedAt[id], state.time);

const pastBalances = (history: readonly Snapshot[], time: number): BalanceMap => {
  const cutoff = time - MOMENTUM_WINDOW_MS;
  const older = history.filter((point) => point.time <= cutoff);
  return older.length ? older[older.length - 1].balances : OPEN_BALANCES;
};

function readAccount(): StoredAccount | null {
  try {
    const stored = window.localStorage.getItem(MARKET_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as StoredAccount) : null;
  } catch {
    return null;
  }
}

function writeAccount(account: StoredAccount) {
  try {
    window.localStorage.setItem(MARKET_STORAGE_KEY, JSON.stringify(account));
  } catch {
    return;
  }
}

export function createInitialState(): MarketState {
  const time = Date.now();
  const stored = readAccount();
  const startAt = stored?.startAt ?? time;
  const closeAt = stored?.closeAt ?? startAt + COMPETITION_SECONDS * 1000;
  const history = seedHistory(time);
  return {
    time,
    startAt,
    closeAt,
    settleAt: closeAt + SETTLING_SECONDS * 1000,
    balances: OPEN_BALANCES,
    prices: OPEN_PRICES,
    open: seedOpenInterest(),
    updatedAt: CANDIDATE_IDS.reduce((map, id) => ({ ...map, [id]: time }), {} as Record<MarketId, number>),
    history,
    fills: [],
    volume: OPENING_VOLUME,
    point: stored?.point ?? STARTING_POINT,
    holdings: stored?.holdings ?? [],
    settlement: stored?.settlement ?? null,
    filled: [],
  };
}

/* Final margin balances decide the winner, so settlement reads the balances as they stand at
   the end of the settling window rather than the prices. */
function settle(state: MarketState): MarketState {
  const winners = winnersOf(state.balances);
  const payout = settlementPayout(state.holdings, winners);
  return { ...state, point: state.point + payout, settlement: { winners, payout, balances: state.balances } };
}

function applyTick(state: MarketState, time: number, seed: number): MarketState {
  const random = createRandom(seed);
  const phase = phaseOf({ ...state, time });
  if (phase === 'ended') return { ...state, time };
  if (phase === 'settling') return time >= state.settleAt ? settle({ ...state, time }) : { ...state, time };
  if (phase === 'ready') return { ...state, time };

  const balances = stepBalances(state.balances, random);
  const prices = midPrices(balances, pastBalances(state.history, time), state.open);
  const fill = random() < FILL_CHANCE ? simulateFill(prices, random, time) : null;
  const open = fill ? applyOpen(state.open, fill.id, fill.side, fill.direction === 'buy' ? fill.qty : -fill.qty) : state.open;
  return {
    ...state,
    time,
    balances,
    prices,
    open,
    updatedAt: CANDIDATE_IDS.reduce((map, id) => ({ ...map, [id]: random() < FEED_REFRESH_CHANCE ? time : state.updatedAt[id] }), {} as Record<MarketId, number>),
    history: [...state.history, { time, balances, prices }].slice(-HISTORY_LIMIT),
    fills: fill ? [fill, ...state.fills].slice(0, FILL_LIMIT) : state.fills,
    volume: state.volume + (fill ? fill.qty * fill.price : 0),
  };
}

/* A quote is the only way in. It has to be live, affordable, and never filled before. */
function applyFill(state: MarketState, time: number, quote: OrderQuote): MarketState {
  const { marketId, positionSide, orderSide, quantity, unitPrice, totalPrice } = quote;
  if (phaseOf({ ...state, time }) !== 'live') return state;
  if (isExpired(quote, time) || state.filled.includes(quote.idempotencyKey)) return state;
  if (statusOf({ ...state, time }, marketId) === 'stale') return state;
  const held = findHolding(state.holdings, marketId, positionSide);
  if (orderSide === 'buy' ? totalPrice > state.point : !held || held.qty < quantity) return state;
  return {
    ...state,
    time,
    point: orderSide === 'buy' ? state.point - totalPrice : state.point + totalPrice,
    holdings: orderSide === 'buy' ? addFill(state.holdings, marketId, positionSide, quantity, unitPrice) : removeFill(state.holdings, marketId, positionSide, quantity),
    open: applyOpen(state.open, marketId, positionSide, orderSide === 'buy' ? quantity : -quantity),
    fills: [{ id: marketId, side: positionSide, direction: orderSide, qty: quantity, price: unitPrice, time, mine: true }, ...state.fills].slice(0, FILL_LIMIT),
    volume: state.volume + totalPrice,
    filled: [...state.filled, quote.idempotencyKey].slice(-64),
  };
}

export const reduceMarket = (state: MarketState, action: MarketAction): MarketState =>
  action.type === 'tick' ? applyTick(state, action.time, action.seed) : applyFill(state, action.time, action.quote);

export function useMarket() {
  const [state, dispatch] = useReducer(reduceMarket, undefined, createInitialState);

  useEffect(() => {
    const timer = window.setInterval(() => dispatch({ type: 'tick', time: Date.now(), seed: Math.floor(Math.random() * 4294967296) }), TICK_INTERVAL);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    writeAccount({ startAt: state.startAt, closeAt: state.closeAt, point: state.point, holdings: state.holdings, settlement: state.settlement });
  }, [state.startAt, state.closeAt, state.point, state.holdings, state.settlement]);

  const fill = useCallback((quote: OrderQuote) => dispatch({ type: 'fill', time: Date.now(), quote }), []);

  return { state, fill };
}

export type { Direction, Side };
