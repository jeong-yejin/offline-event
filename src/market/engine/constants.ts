/* Every live YES price on a board adds up to this, so a price reads straight off as a percentage. */
export const TOTAL_PRICE = 100;

/* How far one second can move a trader's margin balance. */
export const BALANCE_DRIFT = 0.014;

/* Momentum reads the last 3 minutes of margin balance. At the PRD's worked example, +8% over
   the window lands on +3 points, which is what this weight reproduces. */
export const MOMENTUM_WINDOW_MS = 180000;
export const MOMENTUM_WEIGHT = 37.5;
export const MOMENTUM_MAX = 5;

/* Demand reads open position quantity, not cumulative buys. Virtual liquidity keeps the first
   few contracts of an empty book from swinging a price on their own. */
export const VIRTUAL_LIQUIDITY = 100;
export const DEMAND_WEIGHT = 10;
export const DEMAND_MAX = 10;

/* RFQ quotes a mid, then prices the two directions either side of it. */
export const RFQ_SPREAD = 1;

/* Feed age thresholds. A market older than the stale bound stops accepting new quotes. */
export const DELAYED_AFTER_MS = 5000;
export const STALE_AFTER_MS = 15000;

/* Warm-up history, so a chart opens with a shape instead of a flat line. Both competitions draw the
   same six hours of two-minute candles; only the seed and the book depth differ. */
export const SEED_POINTS = 180;
export const SEED_INTERVAL = 120000;
