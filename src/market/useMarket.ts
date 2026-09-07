import { useCallback, useEffect, useReducer } from 'react';
import { INITIAL_COUNTDOWN_SECONDS, MARKET_STORAGE_KEY, OPENING_VOLUME, STARTING_BALANCE, type VoteCandidateId } from '../data/voteContent';
import { OPEN_PRICES, addFill, applyImpact, createRandom, findHolding, quote, removeFill, seedHistory, settlementPayout, simulateFill, stepPrices, winnerOf, type Direction, type Fill, type Holding, type PriceMap, type PricePoint, type Side } from './marketEngine';

export type Settlement = { winner: VoteCandidateId; payout: number };

export type MarketState = {
  time: number;
  closeAt: number;
  prices: PriceMap;
  history: PricePoint[];
  fills: Fill[];
  volume: number;
  balance: number;
  holdings: Holding[];
  settlement: Settlement | null;
};

type TradeRequest = { id: VoteCandidateId; side: Side; direction: Direction; qty: number };

type MarketAction = ({ type: 'tick'; seed: number } | ({ type: 'trade' } & TradeRequest)) & { time: number };

type StoredAccount = Pick<MarketState, 'closeAt' | 'balance' | 'holdings' | 'settlement'>;

const TICK_INTERVAL = 1000;
const HISTORY_LIMIT = 3600;
const FILL_LIMIT = 12;
const FILL_CHANCE = 0.34;

export const secondsLeftOf = (state: MarketState) => Math.max(0, Math.round((state.closeAt - state.time) / 1000));

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
  return {
    time,
    closeAt: stored?.closeAt ?? time + INITIAL_COUNTDOWN_SECONDS * 1000,
    prices: OPEN_PRICES,
    history: seedHistory(time),
    fills: [],
    volume: OPENING_VOLUME,
    balance: stored?.balance ?? STARTING_BALANCE,
    holdings: stored?.holdings ?? [],
    settlement: stored?.settlement ?? null,
  };
}

function settle(state: MarketState): MarketState {
  const winner = winnerOf(state.prices);
  const payout = settlementPayout(state.holdings, winner);
  return { ...state, balance: state.balance + payout, settlement: { winner, payout } };
}

function applyTick(state: MarketState, time: number, seed: number): MarketState {
  const random = createRandom(seed);
  const closed = time >= state.closeAt;
  if (closed && state.settlement) return { ...state, time };
  if (closed) return settle({ ...state, time });
  const prices = stepPrices(state.prices, random);
  const fill = random() < FILL_CHANCE ? simulateFill(prices, random, time) : null;
  return {
    ...state,
    time,
    prices,
    history: [...state.history, { time, prices }].slice(-HISTORY_LIMIT),
    fills: fill ? [fill, ...state.fills].slice(0, FILL_LIMIT) : state.fills,
    volume: state.volume + (fill ? fill.qty * fill.price : 0),
  };
}

function applyTrade(state: MarketState, time: number, request: TradeRequest): MarketState {
  const { id, side, direction, qty } = request;
  if (state.settlement || qty <= 0) return state;
  const price = quote(state.prices, id, side);
  const notional = price * qty;
  const held = findHolding(state.holdings, id, side);
  if (direction === 'buy' ? notional > state.balance : !held || held.qty < qty) return state;
  return {
    ...state,
    time,
    prices: applyImpact(state.prices, id, side, direction, qty),
    balance: direction === 'buy' ? state.balance - notional : state.balance + notional,
    holdings: direction === 'buy' ? addFill(state.holdings, id, side, qty, price) : removeFill(state.holdings, id, side, qty),
    fills: [{ id, side, direction, qty, price, time, mine: true }, ...state.fills].slice(0, FILL_LIMIT),
    volume: state.volume + notional,
  };
}

export const reduceMarket = (state: MarketState, action: MarketAction): MarketState =>
  action.type === 'tick' ? applyTick(state, action.time, action.seed) : applyTrade(state, action.time, action);

export function useMarket() {
  const [state, dispatch] = useReducer(reduceMarket, undefined, createInitialState);

  useEffect(() => {
    const timer = window.setInterval(() => dispatch({ type: 'tick', time: Date.now(), seed: Math.floor(Math.random() * 4294967296) }), TICK_INTERVAL);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    writeAccount({ closeAt: state.closeAt, balance: state.balance, holdings: state.holdings, settlement: state.settlement });
  }, [state.closeAt, state.balance, state.holdings, state.settlement]);

  const trade = useCallback((request: TradeRequest) => dispatch({ type: 'trade', time: Date.now(), ...request }), []);

  return { state, trade };
}
