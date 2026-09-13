import type { AgendaItem } from './homeContent';

/* Indicative run of show from the PerpDEX Day @ TOKEN2049 Singapore deck. Times shift on the night. */
export const TOKEN2049_AGENDA: readonly AgendaItem[] = [
  ['17:00', 'Doors open / Booth missions begin'],
  ['18:00', 'The Alpha Talk'],
  ['19:30', 'Audience Betting for Winner'],
  ['20:00', 'Live Trading Tournament'],
  ['21:00', 'Raffle & awards'],
  ['22:00', 'Nightlife transition — Zouk main floor'],
];

/* Start of event day, 05 Oct 2026 00:00 in Singapore (UTC+8). The hero clock runs to the day, not to
   a slot in the run of show, because the times above shift on the night. */
export const T2049_EVENT_DAY_AT = Date.UTC(2026, 9, 4, 16, 0, 0);

export const T2049_SEATS = 8;

/* Placeholder roster. Names are unannounced, so each card carries its status and nothing else. */
export type TeamStatus = 'confirmed' | 'tbd' | 'open';
export const TOKEN2049_TEAMS: readonly TeamStatus[] = ['confirmed', 'tbd', 'tbd', 'open'];

export const T2049_SEATS_PER_TEAM = T2049_SEATS / TOKEN2049_TEAMS.length;

/* Reward eligibility, /perps-day/kalshi. The competition never signs a reader in to Kalshi and never
   calls its API: it collects the address, and Kalshi checks the reward list against its own accounts
   once the final leaderboard is fixed. So the address never blocks entry, and until that check lands
   the only honest thing the page can say is that the address was received. */
export type KalshiStatus = 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

/* Shape only. A typo that still parses is caught by Kalshi, not here. */
const EMAIL_ADDRESS = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isEmailAddress = (email: string): boolean => EMAIL_ADDRESS.test(email.trim());
