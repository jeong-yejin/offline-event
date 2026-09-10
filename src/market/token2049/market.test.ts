import { describe, expect, it } from 'vitest';
import { T2049_STARTING_POINT, T2049_TRADERS } from '../../data/t2049MarketContent';
import type { BalanceMap, MarketId } from '../engine';
import { createQuote } from '../quote';
import { eliminationCountAt, nextEliminationAt, sessionAt } from './clock';
import {
  T2049_IDS,
  T2049_OPEN_BALANCES,
  T2049_OPEN_INTEREST,
  T2049_OPEN_PRICES,
  activeIds,
  settlementPrice,
} from './market';
import { reduceT2049, type T2049State } from './state';

const NOW = 1757000000000;
const SESSION_A_END = 1800;

/* Seat A down to seat H, already in cut order, so the weakest four are known before the tick. */
const LADDER: BalanceMap = T2049_IDS.reduce(
  (map, id, index) => ({ ...map, [id]: 10800 - index * 100 }),
  {} as BalanceMap,
);

const stateWith = (overrides: Partial<T2049State> = {}): T2049State => ({
  time: NOW,
  startAt: NOW,
  balances: T2049_OPEN_BALANCES,
  prices: T2049_OPEN_PRICES,
  open: T2049_OPEN_INTEREST,
  updatedAt: T2049_IDS.reduce((map, id) => ({ ...map, [id]: NOW }), {} as Record<MarketId, number>),
  history: [],
  fills: [],
  closed: [],
  volume: 0,
  point: T2049_STARTING_POINT,
  holdings: [],
  eliminated: [],
  lastCut: null,
  settlement: null,
  filled: [],
  ...overrides,
});

const atBell = (overrides: Partial<T2049State> = {}) =>
  reduceT2049(
    stateWith({ startAt: NOW - SESSION_A_END * 1000, balances: LADDER, ...overrides }),
    { type: 'tick', time: NOW, seed: 7 },
  );

describe('t2049 schedule', () => {
  it('runs the whole competition without a gap, so the page always has a state to name', () => {
    expect(sessionAt(-1)).toBe('ready');
    expect(sessionAt(0)).toBe('sessionA');
    expect(sessionAt(SESSION_A_END)).toBe('break');
    expect(sessionAt(2400)).toBe('sessionC');
    expect(sessionAt(4200)).toBe('settling');
    expect(sessionAt(4220)).toBe('ended');
  });

  it('stops cutting after four seats, so Session C runs the finalists out untouched', () => {
    expect(eliminationCountAt(0)).toBe(0);
    expect(eliminationCountAt(450)).toBe(1);
    expect(eliminationCountAt(SESSION_A_END)).toBe(4);
    expect(eliminationCountAt(4200)).toBe(4);
    expect(nextEliminationAt(0)).toBe(450);
    expect(nextEliminationAt(SESSION_A_END)).toBeNull();
  });
});

describe('t2049 eliminations', () => {
  it('leaves four seats standing at the bell, so a final tie can still split between co-winners', () => {
    const state = atBell();
    expect(state.eliminated).toEqual(['seat-h', 'seat-g', 'seat-f', 'seat-e']);
    expect(activeIds(state.eliminated)).toHaveLength(4);
  });

  it('pays a cut seat NO holder at once, so the proceeds can go back on the seats still standing', () => {
    const state = atBell({ holdings: [{ id: 'seat-h', side: 'no', qty: 3, cost: 240 }] });
    expect(state.point).toBe(T2049_STARTING_POINT + 300);
    expect(state.holdings).toHaveLength(0);
    /* All four cuts land on this one tick, so the banner names the seat that left last. */
    expect(state.lastCut).toMatchObject({ id: 'seat-e' });
  });

  it('drops a cut seat YES holder to nothing, which is what makes the NO side worth 100', () => {
    const state = atBell({ holdings: [{ id: 'seat-h', side: 'yes', qty: 3, cost: 40 }] });
    expect(state.point).toBe(T2049_STARTING_POINT);
    expect(state.holdings).toHaveLength(0);
  });

  it('keeps the standing YES prices adding up to 100, so the board still reads as probability', () => {
    const state = atBell();
    const total = activeIds(state.eliminated).reduce((sum, id) => sum + state.prices[id], 0);
    expect(total).toBeCloseTo(100, 6);
    state.eliminated.forEach((id) => expect(state.prices[id]).toBe(0));
  });
});

describe('t2049 settlement', () => {
  it('splits the payout between tied co-winners, so a dead heat cannot pay out twice over', () => {
    const tied = [T2049_TRADERS[0].id, T2049_TRADERS[1].id];
    expect(settlementPrice(tied, tied[0], 'yes')).toBe(50);
    expect(settlementPrice(tied, tied[0], 'no')).toBe(50);
    expect(settlementPrice(tied, T2049_TRADERS[2].id, 'yes')).toBe(0);
    expect(settlementPrice([tied[0]], tied[0], 'yes')).toBe(100);
  });
});

describe('t2049 trading windows', () => {
  const buyOne = (state: T2049State) =>
    reduceT2049(state, {
      type: 'fill',
      time: NOW,
      quote: createQuote(state.prices, T2049_TRADERS[0].id, 'yes', 'buy', 2, NOW),
    });

  it('fills inside a live session, so the break test below is about the bell and not the plumbing', () => {
    const live = stateWith({ startAt: NOW - 60000 });
    expect(buyOne(live).point).toBeLessThan(T2049_STARTING_POINT);
  });

  it('refuses a fill during the break, so a paused market cannot be traded while it is frozen', () => {
    const paused = stateWith({ startAt: NOW - 2000 * 1000 });
    expect(buyOne(paused)).toBe(paused);
  });
});

/* A row that leaves the open board is the only record of what the trade returned, so it has to be
   kept on the way out. Both exits pay in points the holder can see; neither is reconstructable from
   the remaining holdings. */
describe('t2049 closed positions', () => {
  const HELD = { id: 'seat-a', side: 'yes' as const, qty: 4, cost: 120 };

  it('records the entry a sold position was bought at, so a realised result can be read back', () => {
    const live = stateWith({ startAt: NOW - 60000, holdings: [HELD] });
    const quote = createQuote(live.prices, 'seat-a', 'yes', 'sell', 3, NOW);
    const sold = reduceT2049(live, { type: 'fill', time: NOW, quote });

    expect(sold.closed).toHaveLength(1);
    expect(sold.closed[0]).toMatchObject({ id: 'seat-a', side: 'yes', qty: 3, entry: 30, exit: quote.unitPrice });
    expect(sold.holdings[0].qty).toBe(1);
  });

  it('records a position the cut settled, which otherwise leaves the board with nothing behind it', () => {
    const state = atBell({ holdings: [{ id: 'seat-h', side: 'no', qty: 3, cost: 240 }] });

    expect(state.holdings).toHaveLength(0);
    expect(state.closed).toHaveLength(1);
    expect(state.closed[0]).toMatchObject({ id: 'seat-h', side: 'no', qty: 3, entry: 80, exit: 100 });
  });
});
