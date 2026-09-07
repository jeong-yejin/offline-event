const PILL_FORMAT = new Intl.NumberFormat('en-US');
const CLOCK_FORMAT = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

export const formatPill = (value: number) => PILL_FORMAT.format(Math.round(value));

export const formatClock = (seconds: number) =>
  [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map((part) => String(part).padStart(2, '0')).join(':');

export const formatTime = (time: number) => CLOCK_FORMAT.format(time);

export const formatSigned = (value: number) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${formatPill(Math.abs(value))}`;
