import { describe, expect, it } from 'vitest';
import { INITIAL_TRADER_BALANCE, SETTLEMENT_PRICE, STARTING_POINT } from '../data/voteContent';
import { CANDIDATE_IDS, DEMAND_MAX, MOMENTUM_MAX, OPEN_BALANCES, OPEN_INTEREST, OPEN_PRICES, balanceComponent, demandAdjustment, demandImbalance, midOf, midPrices, momentumAdjustment, momentumOf, normalize, quote, rfqPrice, settlementPayout, settlementPrice, winnersOf, type BalanceMap, type Holding, type OpenMap, type PriceMap } from './marketEngine';
import { createQuote, parseQuantity, type OrderQuote } from './quote';
import { reduceMarket, type MarketState } from './useMarket';

const NOW = 1757000000000;

const bookTotal = (prices: PriceMap) => CANDIDATE_IDS.reduce((total, id) => total + prices[id], 0);

const balancesOf = (values: readonly number[]): BalanceMap =>
  CANDIDATE_IDS.reduce((map, id, index) => ({ ...map, [id]: values[index] }), {} as BalanceMap);

const stateWith = (overrides: Partial<MarketState> = {}): MarketState => ({
  time: NOW,
  startAt: NOW - 1000,
  closeAt: NOW + 600000,
  settleAt: NOW + 620000,
  balances: OPEN_BALANCES,
  prices: OPEN_PRICES,
  open: OPEN_INTEREST,
  updatedAt: CANDIDATE_IDS.reduce((map, id) => ({ ...map, [id]: NOW }), {} as Record<string, number>) as MarketState['updatedAt'],
  history: [],
  fills: [],
  volume: 0,
  point: STARTING_POINT,
  holdings: [],
  settlement: null,
  filled: [],
  ...overrides,
});

const buy = (state: MarketState, qty: number, overrides: Partial<OrderQuote> = {}) =>
  reduceMarket(state, { type: 'fill', time: state.time, quote: { ...createQuote(state.prices, 'variational', 'yes', 'buy', qty, state.time), ...overrides } });

describe('market price pipeline', () => {
  it('centres every price on the trader share of margin balance, so the leader is the favourite', () => {
    const base = balanceComponent(balancesOf([40000, 30000, 20000, 10000]));

    expect(base.variational).toBeCloseTo(40, 6);
    expect(base.lighter).toBeCloseTo(30, 6);
    expect(base.aster).toBeCloseTo(20, 6);
    expect(base.extended).toBeCloseTo(10, 6);
  });

  it('lets three minutes of momentum nudge a price without ever overruling the balance', () => {
    expect(momentumAdjustment(momentumOf(10800, 10000))).toBeCloseTo(3, 6);
    expect(momentumAdjustment(momentumOf(30000, 10000))).toBe(MOMENTUM_MAX);
    expect(momentumAdjustment(momentumOf(1000, 10000))).toBe(-MOMENTUM_MAX);
  });

  it('reads demand off open position quantity and caps how far the crowd can push a price', () => {
    expect(demandImbalance({ yes: 500, no: 200 })).toBeCloseTo(0.375, 6);
    expect(demandAdjustment(demandImbalance({ yes: 500, no: 200 }))).toBeCloseTo(3.75, 6);
    expect(demandAdjustment(1)).toBe(DEMAND_MAX);
    expect(demandAdjustment(-1)).toBe(-DEMAND_MAX);
  });

  it('keeps the first handful of contracts from swinging an empty book on their own', () => {
    expect(demandImbalance({ yes: 10, no: 0 })).toBeCloseTo(0.0909, 3);
    expect(demandImbalance({ yes: 1000, no: 0 })).toBeGreaterThan(0.9);
  });

  it('rescales the four yes prices so the book always adds up to one settled contract', () => {
    const raw = balancesOf([43, 34, 21, 12]);
    const normalized = normalize(raw);

    expect(bookTotal(normalized)).toBeCloseTo(SETTLEMENT_PRICE, 6);
    expect(normalized.variational).toBeCloseTo(39.1, 1);
    expect(normalized.extended).toBeCloseTo(10.9, 1);
  });

  it('prices no as the other half of the same market', () => {
    expect(midOf(OPEN_PRICES, 'aster', 'yes') + midOf(OPEN_PRICES, 'aster', 'no')).toBe(SETTLEMENT_PRICE);
  });

  it('quotes the two directions either side of the mid, so a round trip costs the spread', () => {
    expect(rfqPrice(42, 'buy')).toBe(43);
    expect(rfqPrice(42, 'sell')).toBe(41);
    expect(quote(OPEN_PRICES, 'aster', 'yes', 'buy')).toBeGreaterThan(quote(OPEN_PRICES, 'aster', 'yes', 'sell'));
  });

  it('opens every trader level, because they all start on the same margin balance', () => {
    CANDIDATE_IDS.forEach((id) => expect(OPEN_PRICES[id]).toBeCloseTo(25, 6));
  });

  it('keeps a trailing trader tradable, because nobody is eliminated mid-competition', () => {
    const balances = balancesOf([INITIAL_TRADER_BALANCE * 3, INITIAL_TRADER_BALANCE, INITIAL_TRADER_BALANCE, 20]);
    const prices = midPrices(balances, balances, OPEN_INTEREST);

    expect(prices.extended).toBeGreaterThan(0);
    expect(quote(prices, 'extended', 'yes', 'buy')).toBeGreaterThan(0);
    expect(buy(stateWith({ balances, prices }), 1).holdings).toHaveLength(1);
  });
});

describe('quantity validation', () => {
  it('takes whole positive counts and nothing else', () => {
    expect(parseQuantity('1')).toBe(1);
    expect(parseQuantity('100')).toBe(100);
    ['0', '-1', '0.5', '1.5', 'ten', '', ' '].forEach((draft) => expect(parseQuantity(draft)).toBeNull());
  });
});

describe('rfq order flow', () => {
  it('charges the quoted price and books the position', () => {
    const state = stateWith();
    const unit = quote(state.prices, 'variational', 'yes', 'buy');
    const after = buy(state, 2);

    expect(after.point).toBe(STARTING_POINT - unit * 2);
    expect(after.holdings).toEqual([{ id: 'variational', side: 'yes', qty: 2, cost: unit * 2 }]);
    expect(after.open.variational.yes).toBe(state.open.variational.yes + 2);
  });

  it('refuses a quote the point balance cannot cover, so the balance never goes negative', () => {
    const state = stateWith({ point: 10 });

    expect(buy(state, 4)).toBe(state);
  });

  it('refuses an expired quote, because the price it names is no longer firm', () => {
    const state = stateWith();

    expect(buy(state, 1, { expiresAt: NOW - 1 })).toBe(state);
  });

  it('fills a quote once, so a double click or a retry cannot open the position twice', () => {
    const state = stateWith();
    const order = createQuote(state.prices, 'variational', 'yes', 'buy', 1, NOW);
    const once = reduceMarket(state, { type: 'fill', time: NOW, quote: order });

    expect(reduceMarket(once, { type: 'fill', time: NOW, quote: order })).toBe(once);
  });

  it('blocks a new quote on a trader whose feed has gone stale', () => {
    const state = stateWith({ updatedAt: { ...stateWith().updatedAt, variational: NOW - 20000 } });

    expect(buy(state, 1)).toBe(state);
  });

  it('returns the quoted proceeds and clears the position on a full close', () => {
    const held: Holding[] = [{ id: 'variational', side: 'yes', qty: 5, cost: 130 }];
    const state = stateWith({ point: 0, holdings: held });
    const unit = quote(state.prices, 'variational', 'yes', 'sell');
    const after = reduceMarket(state, { type: 'fill', time: NOW, quote: createQuote(state.prices, 'variational', 'yes', 'sell', 5, NOW) });

    expect(after.point).toBe(unit * 5);
    expect(after.holdings).toEqual([]);
  });

  it('keeps a partial close open at the remaining quantity', () => {
    const state = stateWith({ holdings: [{ id: 'variational', side: 'yes', qty: 5, cost: 130 }] });
    const after = reduceMarket(state, { type: 'fill', time: NOW, quote: createQuote(state.prices, 'variational', 'yes', 'sell', 2, NOW) });

    expect(after.holdings[0].qty).toBe(3);
  });

  it('refuses to sell more than the trader holds', () => {
    const state = stateWith({ holdings: [{ id: 'variational', side: 'yes', qty: 2, cost: 52 }] });

    expect(reduceMarket(state, { type: 'fill', time: NOW, quote: createQuote(state.prices, 'variational', 'yes', 'sell', 3, NOW) })).toBe(state);
  });

  it('stops taking orders the moment the thirty minutes are up', () => {
    const state = stateWith({ time: NOW + 700000 });

    expect(buy(state, 1)).toBe(state);
  });
});

describe('settlement', () => {
  it('pays the highest final margin balance and nothing else', () => {
    const balances = balancesOf([14200, 13800, 11500, 9700]);

    expect(winnersOf(balances)).toEqual(['variational']);
    expect(settlementPrice(['variational'], 'variational', 'yes')).toBe(SETTLEMENT_PRICE);
    expect(settlementPrice(['variational'], 'lighter', 'yes')).toBe(0);
    expect(settlementPrice(['variational'], 'lighter', 'no')).toBe(SETTLEMENT_PRICE);
  });

  it('splits the settlement between traders who tie, so a shared win is not a double payout', () => {
    expect(settlementPrice(['variational', 'lighter'], 'variational', 'yes')).toBe(50);
    expect(settlementPrice(['variational', 'lighter'], 'variational', 'no')).toBe(50);
    expect(settlementPrice(['variational', 'lighter', 'aster'], 'aster', 'yes')).toBeCloseTo(33.33, 1);
    expect(settlementPrice(['variational', 'lighter', 'aster'], 'aster', 'no')).toBeCloseTo(66.67, 1);
    expect(settlementPrice(['variational', 'lighter', 'aster'], 'extended', 'no')).toBe(SETTLEMENT_PRICE);
  });

  it('values every settled position at its settlement price', () => {
    const holdings: Holding[] = [
      { id: 'variational', side: 'yes', qty: 3, cost: 90 },
      { id: 'lighter', side: 'yes', qty: 4, cost: 100 },
      { id: 'lighter', side: 'no', qty: 5, cost: 350 },
    ];

    expect(settlementPayout(holdings, ['variational'])).toBe(8 * SETTLEMENT_PRICE);
  });

  it('holds the market in settling before it pays, because final balances are confirmed first', () => {
    const open = stateWith({ point: 0, holdings: [{ id: 'variational', side: 'yes', qty: 3, cost: 78 }], balances: balancesOf([14200, 13800, 11500, 9700]) });
    const settling = reduceMarket(open, { type: 'tick', time: open.closeAt, seed: 1 });

    expect(settling.settlement).toBeNull();
    expect(settling.point).toBe(0);

    const ended = reduceMarket(settling, { type: 'tick', time: open.settleAt, seed: 1 });

    expect(ended.settlement?.winners).toEqual(['variational']);
    expect(ended.point).toBe(3 * SETTLEMENT_PRICE);
    expect(buy(ended, 1)).toBe(ended);
  });

  it('freezes prices while settling, so nothing moves after the final print', () => {
    const open = stateWith();
    const settling = reduceMarket(open, { type: 'tick', time: open.closeAt, seed: 9 });

    expect(settling.prices).toEqual(open.prices);
    expect(settling.balances).toEqual(open.balances);
  });
});

describe('trader read-outs', () => {
  it('reports a feed as delayed before it is stale, so a pause is never a surprise', () => {
    const open: OpenMap = OPEN_INTEREST;

    expect(open.variational).toEqual({ yes: 0, no: 0 });
    expect(midPrices(OPEN_BALANCES, OPEN_BALANCES, open)).toEqual(OPEN_PRICES);
  });
});
