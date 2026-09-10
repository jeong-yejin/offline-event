import { describe, expect, it } from 'vitest';
import {
  boardAt,
  elapsedAt,
  feedCut,
  FIELD_SIZE,
  HEAT_END,
  HEAT_SECONDS,
  HEAT_START,
  MY_HANDLE,
  phaseAt,
  remainingAt,
  scoredCount,
  SETTLING_END,
  START_EQUITY,
} from './wonderlandBoard';

const handles = (elapsed: number) => boardAt(elapsed).map((row) => row.handle);

describe('Wonderland trading heat', () => {
  it('opens every seat on the same equity, so the first screen is a starting grid and not a result', () => {
    const opening = boardAt(0);
    expect(opening).toHaveLength(FIELD_SIZE);
    expect(opening.every((row) => row.equity === START_EQUITY && row.pnl === 0)).toBe(true);
  });

  it('reorders the field mid-heat, which is the only reason a live board is worth watching', () => {
    expect(handles(900)).not.toEqual(handles(0));
  });

  it('draws the same board for the same second, so two screens in the room agree', () => {
    expect(boardAt(742)).toEqual(boardAt(742));
  });

  it('holds the field at the bell, so a late refresh cannot change who won', () => {
    expect(handles(HEAT_SECONDS)).toEqual(handles(HEAT_SECONDS + 600));
    expect(boardAt(HEAT_SECONDS)[0].rank).toBe(1);
  });

  it('reads the climb against the board of a minute ago, so a comeback is visible without a second table', () => {
    const rows = boardAt(1200);
    const earlier = new Map(boardAt(1140).map((row) => [row.handle, row.rank]));
    expect(rows.every((row) => (row.rank === null
      ? row.climb === 0
      : row.climb === (earlier.get(row.handle) ?? row.rank) - row.rank))).toBe(true);
    /* A minute of a live heat has to move somebody, or the column is decoration. */
    expect(rows.some((row) => row.climb !== 0)).toBe(true);
  });

  it('runs the clock through ready, live, settling and ended, so nobody reads a provisional result as final', () => {
    const early = HEAT_START - 86_400_000;
    expect(phaseAt(early)).toBe('ready');
    expect(elapsedAt(early)).toBeGreaterThanOrEqual(0);
    expect(elapsedAt(early)).toBeLessThan(HEAT_SECONDS);
    expect(phaseAt(HEAT_START + 61_000)).toBe('live');
    expect(elapsedAt(HEAT_START + 61_000)).toBe(61);
    expect(phaseAt(HEAT_END + 1)).toBe('settling');
    expect(phaseAt(SETTLING_END + 1)).toBe('ended');
    expect(elapsedAt(SETTLING_END + 1)).toBe(HEAT_SECONDS);
  });

  it('counts down the heat that is on screen, so the clock never sits still above rows that are moving', () => {
    const rehearsing = HEAT_START - 86_400_000;
    expect(remainingAt(rehearsing)).toBe(HEAT_SECONDS - elapsedAt(rehearsing));
    expect(remainingAt(HEAT_START + 600_000)).toBe(HEAT_SECONDS - 600);
    expect(remainingAt(HEAT_END + 1)).toBe(0);
    expect(remainingAt(SETTLING_END + 1)).toBe(0);
  });

  it('stays quiet while any seat is still reporting, so the warning only ever means the feed stopped', () => {
    const rows = boardAt(600);
    expect(feedCut(rows)).toBe(false);

    const silent = rows.map((row) => ({ ...row, reportAge: 60 }));
    expect(feedCut(silent)).toBe(true);
    expect(feedCut([{ ...silent[0], reportAge: 0 }, ...silent.slice(1)])).toBe(false);
  });
});

describe('Wonderland competition scores', () => {
  it('ranks on one score drawn from both measures, so the board is not the profit board renamed', () => {
    const rows = boardAt(900);
    const byScore = rows.map((row) => row.handle);
    const byProfit = [...rows].sort((left, right) => right.pnl - left.pnl).map((row) => row.handle);
    expect(byScore).not.toEqual(byProfit);
  });

  it('adds two places into one score, so no seat can win the night on a single measure', () => {
    const scored = boardAt(1500).filter((row): row is typeof row & { score: number } => row.score !== null);
    const ceiling = scored.length * 2;
    expect(scored.every((row) => row.score >= 2 && row.score <= ceiling)).toBe(true);
    /* The board is sorted by the score, so the row on top has to be holding the highest one. */
    expect(scored[0].score).toBe(Math.max(...scored.map((row) => row.score)));
    expect(scored[0].rank).toBe(1);
  });

  it('leaves a seat with no executed notional unscored instead of ranking it as a zero', () => {
    const rows = boardAt(900);
    const unscored = rows.filter((row) => row.competitionReturn === null);
    expect(unscored.length).toBeGreaterThan(0);
    expect(unscored.every((row) => row.notional === 0 && row.score === null && row.rank === null)).toBe(true);
    expect(scoredCount(rows)).toBe(FIELD_SIZE - unscored.length);
    /* The seat keeps its row so its trader can find it, under everyone the night could score. */
    expect(rows.slice(-unscored.length).every((row) => row.score === null)).toBe(true);
  });

  it('still prints a P&L for a seat whose fills are missing, because its equity keeps arriving', () => {
    const incomplete = boardAt(900).filter((row) => row.notional === 0);
    expect(incomplete.length).toBeGreaterThan(0);
    expect(incomplete.every((row) => Number.isFinite(row.pnl) && row.competitionReturn === null)).toBe(true);
  });

  it('gives a tie the same rank, so an equal score is never ordered by whichever way the sort fell', () => {
    const scored = boardAt(1500).filter((row): row is typeof row & { score: number; rank: number } => row.score !== null);
    expect(Math.min(...scored.map((row) => row.rank))).toBe(1);
    /* Places add up to a small whole number, so two seats landing on the same score is ordinary and
       the rank has to follow the score alone. */
    const pairs = scored.flatMap((left) => scored.map((right) => [left, right] as const));
    expect(pairs.every(([left, right]) => (left.score === right.score
      ? left.rank === right.rank
      : (left.score > right.score) === (left.rank < right.rank)))).toBe(true);
  });

  it('names one seat as the reader, because My Performance has nothing to read from otherwise', () => {
    const rows = boardAt(600);
    expect(rows.filter((row) => row.mine)).toHaveLength(1);
    expect(rows.find((row) => row.mine)?.handle).toBe(MY_HANDLE);
  });
});
