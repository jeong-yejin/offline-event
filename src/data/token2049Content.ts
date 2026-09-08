import type { AgendaItem } from './homeContent';

export type EventFact = readonly [label: string, value: string];

/* Indicative run of show from the PerpDEX Day @ TOKEN2049 Singapore deck. Times shift on the night. */
export const TOKEN2049_AGENDA: readonly AgendaItem[] = [
  ['17:00', 'Doors open / Booth missions begin'],
  ['18:00', 'The Alpha Talk'],
  ['19:30', 'Audience Betting for Winner'],
  ['20:00', 'Live Trading Tournament'],
  ['21:00', 'Raffle & awards'],
  ['22:00', 'Nightlife transition — Zouk main floor'],
];

/* Values are names, dates, and figures, so only the labels are translated. */
export const TOKEN2049_FACTS: readonly EventFact[] = [
  ['Date', '05 Oct 2026'],
  ['Venue', 'Zouk · Clarke Quay'],
  ['Crowd', '1,000+'],
  ['Hosts', 'ReboundX × ZOKU'],
];
