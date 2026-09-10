const WHOLE_FORMAT = new Intl.NumberFormat('en-US');
const POINT_FORMAT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const CLOCK_FORMAT = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
const STAMP_FORMAT = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
/* Competition scores print to two decimals, so the same score never reads as two numbers on two screens. */
const SCORE_FORMAT = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatPill = (value: number) => WHOLE_FORMAT.format(Math.round(value));

/* Point balances land on halves once a co-winner settlement splits 100 between two markets. */
export const formatPoint = (value: number) => POINT_FORMAT.format(value);

export const formatClock = (seconds: number) =>
  [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map((part) => String(part).padStart(2, '0')).join(':');

export const formatTime = (time: number) => CLOCK_FORMAT.format(time);

export const formatStamp = (time: number) => STAMP_FORMAT.format(time);

export const formatScore = (value: number) => SCORE_FORMAT.format(value);

export const formatSignedScore = (value: number) =>
  `${value > 0 ? '+' : value < 0 ? '−' : ''}${SCORE_FORMAT.format(Math.abs(value))}`;

export const formatScorePercent = (value: number) => `${formatSignedScore(value)}%`;

export const formatSigned = (value: number) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${formatPoint(Math.abs(value))}`;

export const formatPercent = (value: number) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${POINT_FORMAT.format(Math.abs(value))}%`;

export const moveOf = (value: number) => (value > 0 ? 'up' : value < 0 ? 'down' : 'flat');
