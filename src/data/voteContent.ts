export type VoteCandidateId = 'variational' | 'lighter' | 'aster' | 'extended';

export type VoteCandidate = {
  id: VoteCandidateId;
  name: string;
  logo: string;
  color: string;
  openPrice: number;
};

export const VOTE_CANDIDATES: readonly VoteCandidate[] = [
  { id: 'variational', name: 'Variational', logo: 'variational.svg', color: '#caff5d', openPrice: 34 },
  { id: 'lighter', name: 'Lighter', logo: 'lighter.svg', color: '#5dd0ff', openPrice: 28 },
  { id: 'aster', name: 'Aster', logo: 'aster.svg', color: '#ff9f5d', openPrice: 25 },
  { id: 'extended', name: 'Extended', logo: 'extended.svg', color: '#c98dff', openPrice: 13 },
];

export const INITIAL_CANDIDATE_ID: VoteCandidateId = 'variational';

export const INITIAL_COUNTDOWN_SECONDS = 12258;

export const STARTING_BALANCE = 10000;

export const CONTRACT_PAYOUT = 100;

export const OPENING_VOLUME = 184320;

export const MARKET_STORAGE_KEY = 'perpdex.market.v1';
