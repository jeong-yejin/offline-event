import { describe, expect, it } from 'vitest';
import { REWARD_TOP, STARTING_POINT } from '../data/voteContent';
import { OPEN_PRICES, type PriceMap } from './marketEngine';
import { LEADERBOARD_LIMIT, OPERATOR_COUNT, createOperators, myPlace, rankTraders, visibleRanks } from './leaderboard';

const flatYou = { name: 'YOU', point: STARTING_POINT, holdings: [] };
const brokeYou = { name: 'YOU', point: 0, holdings: [] };
const RALLY: PriceMap = { variational: 96, lighter: 2, aster: 2, extended: 2 };

describe('leaderboard', () => {
  it('opens with every player level, so the board measures the market and not the handicap', () => {
    createOperators().forEach((operator) => {
      const rank = rankTraders([operator], OPEN_PRICES, flatYou).find((row) => !row.you);
      expect(Math.abs(rank?.pnl ?? Infinity)).toBeLessThan(STARTING_POINT * 0.2);
    });
  });

  it('reads return straight off the hundred points everyone started with', () => {
    const ranks = rankTraders(createOperators(), RALLY, flatYou);

    ranks.forEach((rank) => expect(rank.percent).toBeCloseTo(((rank.asset - STARTING_POINT) / STARTING_POINT) * 100, 6));
    expect(ranks.find((rank) => rank.you)?.pnl).toBe(0);
  });

  it('ranks by total asset, because that is what the reward list is drawn from', () => {
    const ranks = rankTraders(createOperators(), RALLY, flatYou);

    ranks.slice(1).forEach((rank, index) => expect(rank.asset).toBeLessThanOrEqual(ranks[index].asset));
    expect(ranks[0].place).toBe(1);
  });

  it('runs deep enough for a top fifty to exist', () => {
    expect(OPERATOR_COUNT + 1).toBeGreaterThan(REWARD_TOP);
  });

  it('keeps you on the board when you are last, because a rank you cannot find is useless', () => {
    const ranks = rankTraders(createOperators(), OPEN_PRICES, brokeYou);
    const visible = visibleRanks(ranks);

    expect(visible).toHaveLength(LEADERBOARD_LIMIT + 1);
    expect(visible[visible.length - 1].you).toBe(true);
    expect(myPlace(ranks)).toBe(ranks.length);
  });
});
