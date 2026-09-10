/* The survival format's clock. Time only: which session the run is in, and when the next cut lands.
   Nothing here knows the line-up, so the schedule can be read without pricing a board. */
import {
  T2049_BREAK_SECONDS,
  T2049_ELIMINATION_INTERVAL_SECONDS,
  T2049_FINALIST_COUNT,
  T2049_INITIAL_TRADER_COUNT,
  T2049_SESSION_A_SECONDS,
  T2049_SESSION_C_SECONDS,
  T2049_SETTLING_SECONDS,
} from '../../data/t2049MarketContent';

/* The competition states of §59. `break` pauses trading; `settling` and `ended` close it. */
export type Session = 'ready' | 'sessionA' | 'break' | 'sessionC' | 'settling' | 'ended';

const BREAK_AT = T2049_SESSION_A_SECONDS;
const SESSION_C_AT = BREAK_AT + T2049_BREAK_SECONDS;
const SETTLING_AT = SESSION_C_AT + T2049_SESSION_C_SECONDS;
/* The whole run, opening bell to settled. A stored run older than this is over and gone. */
export const T2049_RUN_SECONDS = SETTLING_AT + T2049_SETTLING_SECONDS;
const ENDED_AT = T2049_RUN_SECONDS;

/* Seats that leave before the finalist field is reached. */
const CUT_COUNT = T2049_INITIAL_TRADER_COUNT - T2049_FINALIST_COUNT;

export function sessionAt(elapsedSeconds: number): Session {
  if (elapsedSeconds < 0) return 'ready';
  if (elapsedSeconds < BREAK_AT) return 'sessionA';
  if (elapsedSeconds < SESSION_C_AT) return 'break';
  if (elapsedSeconds < SETTLING_AT) return 'sessionC';
  if (elapsedSeconds < ENDED_AT) return 'settling';
  return 'ended';
}

/* Only the two live sessions accept an RFQ. The break holds positions without pricing them. */
export const isTradingSession = (session: Session) => session === 'sessionA' || session === 'sessionC';

/* Cuts land on the 7:30 grid inside Session A and stop once the finalist field is reached.
   Session C runs the finalists to the close, so co-winners stay possible at final settlement. */
export function eliminationCountAt(elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const due = Math.floor(elapsedSeconds / T2049_ELIMINATION_INTERVAL_SECONDS);
  return Math.min(CUT_COUNT, Math.max(0, due));
}

export const nextEliminationAt = (elapsedSeconds: number) =>
  eliminationCountAt(elapsedSeconds) >= CUT_COUNT
    ? null
    : (Math.floor(elapsedSeconds / T2049_ELIMINATION_INTERVAL_SECONDS) + 1) * T2049_ELIMINATION_INTERVAL_SECONDS;
