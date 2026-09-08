export type VoteCandidateId = 'variational' | 'lighter' | 'aster' | 'extended';

export type VoteCandidate = {
  id: VoteCandidateId;
  trader: string;
  exchange: string;
  logo: string;
  color: string;
};

/* One binary market per trader. The trader/exchange pairing is fixed before the event; the
   real names land then, so the slot label stands in until they do. */
export const VOTE_CANDIDATES: readonly VoteCandidate[] = [
  { id: 'variational', trader: 'Trader A', exchange: 'Variational', logo: 'variational.svg', color: '#caff5d' },
  { id: 'lighter', trader: 'Trader B', exchange: 'Lighter', logo: 'lighter.svg', color: '#5dd0ff' },
  { id: 'aster', trader: 'Trader C', exchange: 'Aster', logo: 'aster.svg', color: '#ff9f5d' },
  { id: 'extended', trader: 'Trader D', exchange: 'Extended', logo: 'extended.svg', color: '#c98dff' },
];

export const INITIAL_CANDIDATE_ID: VoteCandidateId = 'variational';

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
