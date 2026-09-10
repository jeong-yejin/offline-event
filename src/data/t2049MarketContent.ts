import type { MarketTrader } from '../market/engine';

/* Eight seats open the TOKEN2049 competition, two per team, so the four teams read down the list in
   pairs. Real nicknames land the week of the event; the seat letter stands in until they do, and the
   team's exchange mark stands where a portrait would. */
export const T2049_TRADERS: readonly MarketTrader[] = [
  { id: 'seat-a', trader: 'Trader A', exchange: 'Variational', logo: 'symbol/variational.svg', color: '#caff5d' },
  { id: 'seat-b', trader: 'Trader B', exchange: 'Variational', logo: 'symbol/variational.svg', color: '#5dd0ff' },
  { id: 'seat-c', trader: 'Trader C', exchange: 'Lighter', logo: 'symbol/lighter.svg', color: '#ff9f5d' },
  { id: 'seat-d', trader: 'Trader D', exchange: 'Lighter', logo: 'symbol/lighter.svg', color: '#c98dff' },
  { id: 'seat-e', trader: 'Trader E', exchange: 'OKX', logo: 'symbol/okx.svg', color: '#5dffb0' },
  { id: 'seat-f', trader: 'Trader F', exchange: 'OKX', logo: 'symbol/okx.svg', color: '#ff6f9c' },
  { id: 'seat-g', trader: 'Trader G', exchange: 'Kalshi', logo: 'symbol/kalshi.svg', color: '#ffe45d' },
  { id: 'seat-h', trader: 'Trader H', exchange: 'Kalshi', logo: 'symbol/kalshi.svg', color: '#8d9cff' },
];

export const T2049_INITIAL_TRADER_COUNT = 8;

/* Config §76. Every seat opens on the same margin balance, so the eight YES prices start at 12.5. */
export const T2049_INITIAL_TRADER_BALANCE = 10000;

export const T2049_SESSION_A_SECONDS = 1800;
export const T2049_BREAK_SECONDS = 600;
export const T2049_SESSION_C_SECONDS = 1800;

/* One seat leaves every 7:30, so the cuts fall at 7:30, 15:00, 22:30 and on the Session A bell
   at 30:00. Four cuts is what leaves four finalists for Session C. */
export const T2049_ELIMINATION_INTERVAL_SECONDS = 450;
export const T2049_FINALIST_COUNT = 4;

/* The PRD settles after the event. The front end holds SETTLING briefly so the state is visible. */
export const T2049_SETTLING_SECONDS = 20;

export const T2049_STARTING_POINT = 100;

export const T2049_REWARD_TOP = 50;
export const T2049_REWARD_FIRST_USDT = 100;

export const T2049_OPENING_VOLUME = 268800;

export const T2049_STORAGE_KEY = 'perpdex.t2049.v1';
