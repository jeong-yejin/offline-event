import { COMPETITION_SECONDS, SETTLING_SECONDS } from '../data/perpDexMarketContent';
import { createRandom } from '../market/engine';
import { T2049_BREAK_SECONDS, T2049_SESSION_A_SECONDS, T2049_SESSION_C_SECONDS } from '../data/t2049MarketContent';
import { T2049_RUN_SECONDS } from '../market/token2049/clock';

/* A case screen sits somewhere on a clock that runs 30 minutes on PERP-DEX DAY and 70 on PERPS DAY,
   so reaching one by waiting is not practical. `?preview=<case>` rewinds the market start to put the
   requested screen on the page at load. It reads the live URL rather than a build flag, so the
   deployed site can show any case without a rebuild, and a preview never writes over a saved run. */

const PARAM = 'preview';

/* One fixed stream, so a case screen draws the same balances, the same cut order and the same tape
   every time it is opened. The seeds come off a single walk rather than a counter: the generator is
   linear congruential, so seed and seed + 1 hand back almost the same first draw, and a counter
   would push the first trader's balance the same way for thousands of ticks in a row. */
const PREVIEW_SEED = 20490911;

export const previewSeeds = () => {
  const random = createRandom(PREVIEW_SEED);
  return () => Math.floor(random() * 4294967296);
};

/* The doors screen needs a start that has not arrived yet. */
const BEFORE_START = -120;

/* Seconds of market clock already run when the page loads. */
const PERP_DEX_CASES: Record<string, number> = {
  ready: BEFORE_START,
  live: 600,
  settling: COMPETITION_SECONDS + 5,
  ended: COMPETITION_SECONDS + SETTLING_SECONDS + 60,
};

/* Cuts land on the 7:30 grid, so five minutes into Session C the field is already the four finalists. */
const T2049_CASES: Record<string, number> = {
  ready: BEFORE_START,
  'session-a': 600,
  break: T2049_SESSION_A_SECONDS + 60,
  'session-c': T2049_SESSION_A_SECONDS + T2049_BREAK_SECONDS + 300,
  settling: T2049_SESSION_A_SECONDS + T2049_BREAK_SECONDS + T2049_SESSION_C_SECONDS + 5,
  ended: T2049_RUN_SECONDS + 60,
};

/* The Kalshi account screen and the team entry screen are their own routes rather than a position on
   the clock, so the router reads these two names instead of the case maps. */
export const PREVIEW_ROUTE_CASES: readonly string[] = ['kalshi', 'teams'];

export const PREVIEW_CASES: readonly string[] =
  [...new Set([...Object.keys(PERP_DEX_CASES), ...Object.keys(T2049_CASES), ...PREVIEW_ROUTE_CASES])];

/* A misspelt case would otherwise look like the screen simply rendering as usual, so it is named and
   dropped. Read once: the query string cannot change without a load. */
const NAME: string | null = (() => {
  const name = new URLSearchParams(window.location.search).get(PARAM);
  if (name === null) return null;
  if (PREVIEW_CASES.includes(name)) return name;
  console.warn(`Unknown ?${PARAM}=${name}. Cases: ${PREVIEW_CASES.join(', ')}`);
  return null;
})();

export const previewName = () => NAME;

const startAtOf = (cases: Record<string, number>, now: number): number | null =>
  NAME !== null && NAME in cases ? now - cases[NAME] * 1000 : null;

export const perpDexPreviewStart = (now: number) => startAtOf(PERP_DEX_CASES, now);
export const t2049PreviewStart = (now: number) => startAtOf(T2049_CASES, now);
