export type PerpDexTraderId = 'variational' | 'lighter' | 'aster' | 'extended';

export type PerpDexTrader = {
  id: PerpDexTraderId;
  trader: string;
  exchange: string;
  logo: string;
  color: string;
};

/* One binary market per trader. The trader/exchange pairing is fixed before the event; the
   real names land then, so the slot label stands in until they do. The logo is the exchange's
   symbol mark rather than its wordmark, because the trader list carries it as a 28px circle. */
export const PERP_DEX_TRADERS: readonly PerpDexTrader[] = [
  { id: 'variational', trader: 'Trader A', exchange: 'Variational', logo: 'symbol/variational.svg', color: '#caff5d' },
  { id: 'lighter', trader: 'Trader B', exchange: 'Lighter', logo: 'symbol/lighter.svg', color: '#5dd0ff' },
  { id: 'aster', trader: 'Trader C', exchange: 'Aster', logo: 'symbol/aster.svg', color: '#ff9f5d' },
  { id: 'extended', trader: 'Trader D', exchange: 'Extended', logo: 'symbol/extended.svg', color: '#c98dff' },
];

export const INITIAL_PERP_DEX_TRADER_ID: PerpDexTraderId = 'variational';

/* Every trader starts on the same margin balance, so the four YES prices open at 25 each. */
export const INITIAL_TRADER_BALANCE = 10000;

export const COMPETITION_SECONDS = 1800;

/* The PRD settles 30 minutes after the close. Nothing here confirms final balances, so the
   front end holds SETTLING for 20 seconds instead and the state stays observable. */
export const SETTLING_SECONDS = 20;

export const STARTING_POINT = 100;

export const SETTLEMENT_PRICE = 100;

export const REWARD_TOP = 50;

export const REWARD_FIRST_USDT = 100;

export const OPENING_VOLUME = 184320;

export const MARKET_STORAGE_KEY = 'perpdex.market.v3';
