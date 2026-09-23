/* Run of show. A slot carries a note only where the title alone does not say what happens in it. */
type T2049AgendaItem = readonly [time: string, title: string, note?: string];

export const TOKEN2049_AGENDA: readonly T2049AgendaItem[] = [
  ['16:00', 'Doors open / booth missions begin'],
  ['18:00–19:15', 'Pitch'],
  ['19:28–19:30','Trading Competition Opening'],
  ['19:30', 'Audience joins Pulse / how Pulse works'],
  ['19:35', 'Trader introductions', 'A short intro video plays for each trader. They walk on one at a time while the MC runs through their background and track record.'],
  ['19:50–20:20', 'Live trading tournament: semifinal'],
  ['20:20–20:30', 'Short interviews & final setup'],
  ['20:30–21:00', 'Live trading tournament: final'],
  ['21:00', 'Awards', 'Trader awards / audience awards / raffle'],
  ['Till 24:00', 'DJ party'],
];

/* Start of event day, 05 Oct 2026 00:00 in Singapore (UTC+8). The hero clock runs to the day, not to
   a slot in the run of show, because the times above shift on the night. */
export const T2049_EVENT_DAY_AT = Date.UTC(2026, 9, 4, 16, 0, 0);

/* Placeholder roster. Traders enter individually, and the names are unannounced, so each seat carries
   its number and its status and nothing else. */
export const T2049_SEATS = 8;

/* Partner marks under the hero date line, in the order they sit there. The files are the white
   wordmarks the PERP-DEX DAY sponsor row shares, but that row inverts them for its own section, so the
   hero states its own sizing and leaves the white alone. Both files are cropped to their ink, so equal
   height would not read as equal size: ZOKU is all caps and fills its box, while Polymarket is mixed
   case and spends nearly half its box on ascenders and descenders. The scale is what each mark takes of
   the row's height to land at the same optical weight. */
export const T2049_HERO_PARTNERS: readonly (readonly [name: string, file: string, scale: number])[] = [
  ['Polymarket', 'polymarket.svg', 1], ['Zoku', 'zoku.svg', 0.75],
];

/* Reward eligibility, /perps-day/polymarket. The competition never signs a reader in to Polymarket and never
   calls its API: it collects the address, and Polymarket checks the reward list against its own accounts
   once the final leaderboard is fixed. So the address never blocks entry, and until that check lands
   the only honest thing the page can say is that the address was received. */
export type PolymarketStatus = 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

/* Shape only. A typo that still parses is caught by Polymarket, not here. */
const EMAIL_ADDRESS = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isEmailAddress = (email: string): boolean => EMAIL_ADDRESS.test(email.trim());
