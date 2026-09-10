import { mapRecord } from '../record';
import { appendBounded, balancesAt } from '../history';
import { COMPETITION_SECONDS, OPENING_VOLUME, SETTLING_SECONDS, STARTING_POINT } from '../../data/perpDexMarketContent';
import { PERP_DEX_IDS, MOMENTUM_WINDOW_MS, OPEN_BALANCES, OPEN_PRICES, addFill, applyOpen, createRandom, dataStatusOf, findHolding, midPrices, removeFill, seedFills, seedHistory, seedOpenInterest, settlementPayout, simulateFill, stepBalances, winnersOf, type BalanceMap, type DataStatus, type Fill, type Holding, type MarketId, type OpenMap, type PriceMap, type Snapshot } from './market';
import { isExpired, type OrderQuote } from '../quote';

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

export type StoredAccount = Pick<MarketState, 'startAt' | 'closeAt' | 'point' | 'holdings' | 'settlement'>;

const HISTORY_LIMIT = 3600;
/* The book reads one market at a time, so the window has to hold a ladder's worth of prints per
   market rather than a screen's worth in total. */
const FILL_LIMIT = 12 * PERP_DEX_IDS.length;
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

/* A closed feed is not a broken feed. Only a live market can go delayed or stale; before the open and
   after the close the last print is the final print, so the board says nothing about the feed. */
export const statusOf = (state: MarketState, id: MarketId): DataStatus =>
  phaseOf(state) === 'live' ? dataStatusOf(state.updatedAt[id], state.time) : 'live';

const pastBalances = (history: readonly Snapshot[], time: number): BalanceMap =>
  balancesAt(history, time - MOMENTUM_WINDOW_MS, OPEN_BALANCES);

export function createInitialState(time: number, stored: StoredAccount | null = null): MarketState {
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
    updatedAt: mapRecord(PERP_DEX_IDS, () => time),
    history,
    fills: seedFills(history, FILL_LIMIT),
    volume: OPENING_VOLUME,
    point: stored?.point ?? STARTING_POINT,
    holdings: stored?.holdings ?? [],
    settlement: stored?.settlement ?? null,
    filled: [],
  };
}

/* Final margin balances decide the winner, so settlement reads the balances as they stand at
   the end of the settling window rather than the prices. The payout is recorded and not credited:
   prizes are paid by hand a few days after the event, so adding it to `point` here would show a
   balance nobody can spend. */
function settle(state: MarketState): MarketState {
  const winners = winnersOf(state.balances);
  const payout = settlementPayout(state.holdings, winners);
  return { ...state, settlement: { winners, payout, balances: state.balances } };
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
    updatedAt: mapRecord(PERP_DEX_IDS, (id) => random() < FEED_REFRESH_CHANCE ? time : state.updatedAt[id]),
    history: appendBounded(state.history, { time, balances, prices }, HISTORY_LIMIT),
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

