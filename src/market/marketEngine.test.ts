import { describe, expect, it } from 'vitest';
import { CONTRACT_PAYOUT, STARTING_BALANCE } from '../data/voteContent';
import { CANDIDATE_IDS, OPEN_PRICES, applyImpact, chanceOf, createRandom, quote, settlementPayout, stepPrices, winnerOf, type Holding, type PriceMap } from './marketEngine';
import { reduceMarket, type MarketState } from './useMarket';

const NOW = 1757000000000;
const OPEN_YES = quote(OPEN_PRICES, 'variational', 'yes');

const bookTotal = (prices: PriceMap) => CANDIDATE_IDS.reduce((total, id) => total + prices[id], 0);

const stateWith = (overrides: Partial<MarketState> = {}): MarketState => ({
  time: NOW,
  closeAt: NOW + 3600000,
  prices: OPEN_PRICES,
  history: [],
  fills: [],
  volume: 0,
  balance: STARTING_BALANCE,
  holdings: [],
  settlement: null,
  ...overrides,
});

const buy = (state: MarketState, qty: number) => reduceMarket(state, { type: 'trade', time: NOW, id: 'variational', side: 'yes', direction: 'buy', qty });

describe('prediction market pricing', () => {
  it('keeps a tradable book: no outcome goes worthless or certain, and the odds still add up', () => {
    const random = createRandom(7);
    const drifted = Array.from({ length: 600 }).reduce<PriceMap>((prices) => stepPrices(prices, random), OPEN_PRICES);

    CANDIDATE_IDS.forEach((id) => {
      expect(drifted[id]).toBeGreaterThanOrEqual(2);
      expect(drifted[id]).toBeLessThanOrEqual(96);
    });
    expect(bookTotal(drifted)).toBeGreaterThan(94);
    expect(bookTotal(drifted)).toBeLessThan(106);
  });

  it('reprices a trader upward when the flow buys their yes contracts', () => {
    const after = applyImpact(OPEN_PRICES, 'variational', 'yes', 'buy', 400);

    expect(chanceOf(after, 'variational')).toBeGreaterThan(chanceOf(OPEN_PRICES, 'variational'));
    expect(chanceOf(after, 'lighter')).toBeLessThan(chanceOf(OPEN_PRICES, 'lighter'));
  });

  it('prices no as the mirror of yes so a full pair always costs one contract', () => {
    expect(quote(OPEN_PRICES, 'aster', 'yes') + quote(OPEN_PRICES, 'aster', 'no')).toBe(CONTRACT_PAYOUT);
  });
});

describe('PILL order flow', () => {
  it('charges the quoted price and books the contracts', () => {
    const after = buy(stateWith(), 10);

    expect(after.balance).toBe(STARTING_BALANCE - OPEN_YES * 10);
    expect(after.holdings).toEqual([{ id: 'variational', side: 'yes', qty: 10, cost: OPEN_YES * 10 }]);
    expect(after.fills[0]).toMatchObject({ id: 'variational', direction: 'buy', qty: 10, mine: true });
  });

  it('refuses an order the PILL balance cannot cover so the balance never goes negative', () => {
    const state = stateWith({ balance: OPEN_YES * 5 });

    expect(buy(state, 6)).toBe(state);
  });

  it('returns the quoted proceeds and closes the position on a full sell', () => {
    const held: Holding[] = [{ id: 'variational', side: 'yes', qty: 10, cost: 300 }];
    const after = reduceMarket(stateWith({ balance: 0, holdings: held }), { type: 'trade', time: NOW, id: 'variational', side: 'yes', direction: 'sell', qty: 10 });

    expect(after.balance).toBe(OPEN_YES * 10);
    expect(after.holdings).toEqual([]);
  });

  it('refuses to sell contracts the trader does not hold', () => {
    const state = stateWith({ holdings: [{ id: 'variational', side: 'yes', qty: 2, cost: 60 }] });

    expect(reduceMarket(state, { type: 'trade', time: NOW, id: 'variational', side: 'yes', direction: 'sell', qty: 3 })).toBe(state);
  });
});

describe('settlement', () => {
  it('pays 100 PILL for yes on the winner and for no on everyone else', () => {
    const holdings: Holding[] = [
      { id: 'variational', side: 'yes', qty: 3, cost: 90 },
      { id: 'lighter', side: 'yes', qty: 4, cost: 100 },
      { id: 'lighter', side: 'no', qty: 5, cost: 350 },
    ];

    expect(settlementPayout(holdings, 'variational')).toBe(8 * CONTRACT_PAYOUT);
  });

  it('resolves to the leading trader, credits the payout, and stops accepting orders', () => {
    const open = stateWith({ holdings: [{ id: 'variational', side: 'yes', qty: 10, cost: 340 }], balance: 0 });
    const closed = reduceMarket(open, { type: 'tick', time: open.closeAt, seed: 1 });

    expect(closed.settlement).toEqual({ winner: winnerOf(open.prices), payout: 10 * CONTRACT_PAYOUT });
    expect(closed.balance).toBe(10 * CONTRACT_PAYOUT);
    expect(buy(closed, 1)).toBe(closed);
  });
});
