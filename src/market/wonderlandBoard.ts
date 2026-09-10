/* The Wonderland trading competition is one 30-minute heat on the Scene III clock.
   No exchange feed reaches this page, so the board is a pure function of the clock: the same
   second always draws the same standings, which is what lets two screens in the room agree. */

export type Suit = 'spade' | 'heart' | 'club' | 'diamond';
export type Phase = 'ready' | 'live' | 'settling' | 'ended';

export type Standing = {
  handle: string;
  suit: Suit;
  mine: boolean;
  equity: number;
  pnl: number;
  /* Executed notional, the denominator of the return. */
  notional: number;
  /* Net profit over executed notional. Null when the denominator is 0, which the screen prints as
     "not scored" and the board refuses to sort as a zero. */
  competitionReturn: number | null;
  /* Profit places and return places added. Null while the seat has no return to score with. */
  score: number | null;
  rank: number | null;
  /* Places gained over the last minute. A comeback shows nowhere else on the board. */
  climb: number;
  /* Seconds since this seat's last report. */
  reportAge: number;
};

export const HEAT_SECONDS = 1800;
export const START_EQUITY = 10000;
export const HEAT_START = Date.parse('2026-09-29T19:30:00+09:00');
export const HEAT_END = HEAT_START + HEAT_SECONDS * 1000;
/* Between the bell and the final result the board is still moving: missed reports get recovered and
   the closing scores are computed. The screen says so rather than passing the result off as final. */
export const SETTLING_SECONDS = 120;
export const SETTLING_END = HEAT_END + SETTLING_SECONDS * 1000;

/* The heat runs once, on the night. Before it starts the same thirty minutes replays on a loop, so a
   screen switched on early shows a board that moves instead of an empty grid. */
export function elapsedAt(now: number): number {
  if (now >= HEAT_START) return Math.min(Math.floor((now - HEAT_START) / 1000), HEAT_SECONDS);
  const cycle = HEAT_SECONDS * 1000;
  return Math.floor(((((now - HEAT_START) % cycle) + cycle) % cycle) / 1000);
}

export function phaseAt(now: number): Phase {
  if (now < HEAT_START) return 'ready';
  if (now <= HEAT_END) return 'live';
  return now <= SETTLING_END ? 'settling' : 'ended';
}

/* Counts down the heat that is on screen, so the rehearsal loop shows its own remainder. */
export const remainingAt = (now: number) => HEAT_SECONDS - elapsedAt(now);

/* My Performance needs one seat to be the reader's. No account reaches this page, so the board names
   the seat here and every "my" number on the screen reads from that row. */
export const MY_HANDLE = 'KNAVE';

const CLIMB_WINDOW = 60;
const TWO_PI = Math.PI * 2;

type Seat = {
  handle: string;
  suit: Suit;
  drift: number;
  /* Executed notional per second. Two seats with the same profit and different tempo earn a
     different return, which is what the second half of the score measures. */
  tempo: number;
  /* Seconds between this seat's reports. 0 means its fills never arrive. */
  report: number;
};

/* Twelve seats, each with the drift that decides where it finishes. Suits split four by three so
   the board reads as a hand of cards rather than a spreadsheet. */
const TRADERS: readonly Seat[] = [
  { handle: 'WHITE RABBIT', suit: 'heart', drift: 0.4, tempo: 26, report: 3 },
  { handle: 'CHESHIRE', suit: 'spade', drift: 0.31, tempo: 9, report: 4 },
  { handle: 'MAD HATTER', suit: 'club', drift: 0.24, tempo: 18, report: 3 },
  { handle: 'QUEEN OF HEARTS', suit: 'heart', drift: 0.18, tempo: 6, report: 8 },
  { handle: 'MARCH HARE', suit: 'diamond', drift: 0.12, tempo: 22, report: 3 },
  { handle: 'CATERPILLAR', suit: 'spade', drift: 0.06, tempo: 4, report: 5 },
  { handle: 'KNAVE', suit: 'diamond', drift: 0.01, tempo: 11, report: 6 },
  { handle: 'DUCHESS', suit: 'heart', drift: -0.04, tempo: 15, report: 21 },
  { handle: 'GRYPHON', suit: 'club', drift: -0.09, tempo: 7, report: 4 },
  { handle: 'DORMOUSE', suit: 'club', drift: -0.14, tempo: 19, report: 12 },
  { handle: 'MOCK TURTLE', suit: 'spade', drift: -0.19, tempo: 5, report: 3 },
  { handle: 'JABBERWOCK', suit: 'diamond', drift: -0.26, tempo: 0, report: 0 },
];

export const FIELD_SIZE = TRADERS.length;

/* Three waves at coprime speeds. Ranks cross without the page keeping a single tick of history. */
function swingAt(index: number, progress: number) {
  const phase = index * 0.7211;
  return Math.sin(TWO_PI * (progress * 3 + phase)) * 380
    + Math.sin(TWO_PI * (progress * 7 + phase * 2.3)) * 210
    + Math.sin(TWO_PI * (progress * 13 + phase * 4.1)) * 90;
}

/* Every seat opens on the same number, so the first screen is a starting grid. */
const OPENING_SWING = TRADERS.map((_trader, index) => swingAt(index, 0));

function equityAt(index: number, elapsed: number) {
  const progress = elapsed / HEAT_SECONDS;
  const swing = swingAt(index, progress) - OPENING_SWING[index];
  return Math.round(START_EQUITY + TRADERS[index].drift * progress * START_EQUITY + swing * (0.35 + progress));
}

/* Notional only grows, so a seat's return never improves because its denominator shrank. */
const notionalAt = (index: number, elapsed: number) => Math.round(TRADERS[index].tempo * elapsed * 100) / 100;

/* A seat whose fills never arrive has no report to date, so its age runs from the start of the heat. */
const reportAgeAt = (index: number, elapsed: number) => {
  const period = TRADERS[index].report;
  return period === 0 ? elapsed : elapsed % period;
};

type SeatState = {
  trader: Seat;
  equity: number;
  pnl: number;
  notional: number;
  competitionReturn: number | null;
  reportAge: number;
};

const seatsAt = (elapsed: number): SeatState[] => TRADERS.map((trader, index) => {
  const equity = equityAt(index, elapsed);
  const notional = notionalAt(index, elapsed);
  const pnl = equity - START_EQUITY;
  return { trader, equity, pnl, notional, competitionReturn: notional === 0 ? null : (pnl / notional) * 100, reportAge: reportAgeAt(index, elapsed) };
});

/* Two seats on the same score share the higher rank, so a tie is never broken by whichever way the
   sort happened to fall. */
const rankIn = (scores: readonly number[], score: number) => scores.filter((other) => other > score).length + 1;

/* Profit is USDT and return is a percentage, so the two cannot be added. Each seat's standing on a
   measure is turned into places over the same field, and the places add: first on a measure is worth
   as many points as there are scored seats, last is worth 1. That leaves one number to rank on, and
   a seat that only ever grinds a large book cannot outscore one that trades a small one well. */
function scoresOf(seats: readonly SeatState[]): (number | null)[] {
  const scored = seats.filter((seat): seat is SeatState & { competitionReturn: number } => seat.competitionReturn !== null);
  const profits = scored.map((seat) => seat.pnl);
  const returns = scored.map((seat) => seat.competitionReturn);
  const size = scored.length;

  return seats.map((seat) => (seat.competitionReturn === null
    ? null
    : size - rankIn(profits, seat.pnl) + 1 + (size - rankIn(returns, seat.competitionReturn) + 1)));
}

const rankMapAt = (elapsed: number): Map<string, number> => {
  const seats = seatsAt(elapsed);
  const scores = scoresOf(seats);
  const ranked = scores.filter((score): score is number => score !== null);
  return new Map(seats.flatMap((seat, index) => {
    const score = scores[index];
    return score === null ? [] : [[seat.trader.handle, rankIn(ranked, score)] as const];
  }));
};

/* An unscored seat keeps its row so its trader can still find themselves, and sits under everyone the
   night was able to score. */
function byRank(left: Standing, right: Standing) {
  if (left.score === null && right.score === null) return right.pnl - left.pnl;
  if (left.score === null) return 1;
  if (right.score === null) return -1;
  return right.score - left.score || right.pnl - left.pnl;
}

export function boardAt(elapsed: number): Standing[] {
  const clamped = Math.min(Math.max(elapsed, 0), HEAT_SECONDS);
  const earlier = rankMapAt(Math.max(0, clamped - CLIMB_WINDOW));
  const seats = seatsAt(clamped);
  const scores = scoresOf(seats);
  const ranked = scores.filter((score): score is number => score !== null);

  return seats
    .map((seat, index) => {
      const score = scores[index];
      const rank = score === null ? null : rankIn(ranked, score);
      return {
        handle: seat.trader.handle,
        suit: seat.trader.suit,
        mine: seat.trader.handle === MY_HANDLE,
        equity: seat.equity,
        pnl: seat.pnl,
        notional: seat.notional,
        competitionReturn: seat.competitionReturn,
        score,
        rank,
        climb: rank === null ? 0 : (earlier.get(seat.trader.handle) ?? rank) - rank,
        reportAge: seat.reportAge,
      };
    })
    .sort(byRank);
}

/* How many seats the score could be computed for. The board says so out loud, because the reader has
   to know a rank was drawn over eleven seats and not twelve. */
export const scoredCount = (rows: readonly Standing[]) => rows.filter((row) => row.score !== null).length;

/* Seconds of silence from every seat that mean the reports have stopped rather than slowed. A frozen
   number looks exactly like a quiet one on screen, so the board has to say which of the two it is. */
const FEED_GAP = 15;
export const feedCut = (rows: readonly Standing[]) => rows.every((row) => row.reportAge >= FEED_GAP);

