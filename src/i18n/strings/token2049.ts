import { marketEn, marketKo } from './market';
import { commonEn, commonKo } from './common';
import type { LocalizedProps } from '../types';
import type { Session } from '../../market/token2049/clock';
import type { PolymarketStatus } from '../../data/token2049Content';

/* The survival format carries four numbers the PERP-DEX DAY spec has no room for, so the row list
   takes one shape instead of eight positional arguments. */
type T2049Spec = {
  seats: number;
  sessionMinutes: number;
  breakMinutes: number;
  finalMinutes: number;
  point: number;
  payout: number;
  cutSeconds: number;
  finalists: number;
};

// English-only page copy is shared by both dictionaries.
const shared = {
  /* Document metadata. */
  t2049MetaTitle: 'PERPS DAY — Eight Traders. The Best Trader Wins.',
  t2049MetaDescription: 'Eight traders compete live in Singapore on October 5, 2026. Everyone starts with an equal balance, and one trader is eliminated every 7 minutes 30 seconds in the semifinal. Free entry with RSVP.',
  t2049OgDescription: 'October 5, 2026 · Singapore. Eight traders compete on live accounts with an equal starting balance. One elimination every 7 minutes 30 seconds. Limited capacity. RSVP required.',
  t2049OgImageAlt: 'PERPS DAY by ReboundX and Polymarket · October 5, 2026 · Singapore',
  t2049TwitterDescription: 'October 5, 2026 · Singapore. Eight traders compete live with an equal starting balance. One elimination every 7 minutes 30 seconds.',

  /* Section navigation. */
  t2049NavLabel: 'Section navigation',
  t2049NavCompetition: 'Competition',
  t2049NavTraders: 'Traders',
  t2049NavVenue: 'Venue',
  t2049NavRsvp: 'RSVP',

  /* Hero and countdown. */
  t2049HeroCopy: 'Trade your pick with Polymarket as eight traders compete live.',
  t2049HeroCta: 'Join Pulse',
  /* The strip along the foot of the hero. Six lines, because the loop reads as a loop only once it is
     long enough that a reader does not see the same phrase twice in a glance. */
  t2049HeroMarquee: [
    'LIVE TRADING ON STAGE',
    'LIVE ELIMINATIONS',
    'REBOUNDX \u00d7 POLYMARKET',
    'FOLLOW THE PULSE',
    'PREDICT THE OUTCOME',
    'ONE TRADER TAKES THE WIN',
  ] as readonly string[],
  t2049CountdownTitle: 'Doors Open In',
  t2049CountdownDays: 'Days',
  t2049CountdownHours: 'Hours',
  t2049CountdownMinutes: 'Minutes',
  t2049CountdownSeconds: 'Seconds',

  /* Competition format. */
  t2049Eyebrow: 'Competition Format',
  t2049Title: ['One trader drops', 'every 7 minutes 30 seconds'] as readonly string[],
  t2049Copy: 'Eight traders compete on equal live accounts, with four advancing to the final based on percentage return.',
  t2049LadderLabel: 'Competition rounds',
  t2049Semifinal: 'Semifinal',
  t2049SemifinalDetail: '30 Minutes · 8 Traders → 4 Finalists',
  t2049Intermission: 'Intermission',
  t2049IntermissionDetail: '10 Minutes',
  t2049Final: 'Final',
  t2049FinalDetail: '30 Minutes · 4 Finalists → 1 Winner',
  t2049SpecLabel: 'Competition rules',
  t2049SpecElimination: 'Elimination',
  t2049SpecEliminationCopy: 'Every trader enters on their own. At each cut the lowest percentage return on the floor leaves, and no seat is protected.',
  t2049SpecRanking: 'Ranking',
  t2049SpecRankingCopy: 'Rankings are based on percentage return. Everyone starts with the same balance, so performance alone determines the leaderboard.',
  t2049SpecBalance: 'Starting Balance',
  t2049SpecBalanceCopy: 'Live accounts and starting balances are provided by the organizers on the day. Once the clock starts, every order and fill counts. There are no resets.',
  t2049SpecPrizeCopy: 'The prize goes to the trader with the highest percentage return at the end of the final.',

  /* Traders. */
  t2049LiveEyebrow: 'Meet the Traders',
  t2049LiveTitle: ['Eight traders', 'compete live'] as readonly string[],
  t2049TraderSlot: (seat: number): string => `Trader ${String(seat).padStart(2, '0')}`,
  t2049Tbd: 'To Be Revealed',

  t2049TradersCopy: 'Every trader competes individually under the same conditions. The full line-up is announced the week of the event.',

  /* Live standings and Pulse. */
  t2049PolymarketEyebrow: 'Live Standings & Pulse',
  t2049PolymarketTitle: ['Track the standings', 'and predict the winner'] as readonly string[],
  t2049PolymarketCopy: 'Pulse is the prediction game the audience plays. Follow the live leaderboard and trade YES or NO on the trader you think will win.',
  t2049PolymarketPoints: [
    'Start with 100 points',
    'Trade YES or NO on any trader',
    'Winning positions settle at 100 points, paid out after the event',
  ],

  /* Date and venue. */
  t2049VenueEyebrow: 'Date & Venue',
  t2049VenueTitle: ['Token2049', 'Live in Singapore'] as readonly string[],
  t2049VenueCopy: 'Join ReboundX and Polymarket for a live trading competition during TOKEN2049 Week. Capacity is limited, and entry is available to confirmed guests only.',
  t2049VenueLabel: 'Date and venue details',
  t2049AgendaNote: 'Exact timings for the live trading competition and the filming can shift with operations on the night.',

  /* Pulse is the audience prediction game. Polymarket runs the market behind it, so the rules sit under the
     run of show where a reader decides whether they can play. */
  t2049PulseTitle: 'Pulse rules',
  t2049PulseRules: [
    'Guests who registered online beforehand can play Pulse too.',
    'A QR code is shown at the venue on the day for anyone attending in person who wants to join Pulse.',
    'Rewards follow the Pulse standings. Only guests attending in person are eligible.',
  ],
  t2049VenueDate: 'Date',
  t2049DateValue: 'Monday, October 5, 2026',
  t2049VenuePlace: 'Venue',
  t2049VenueValue: 'Zouk',
  t2049VenueAdmission: 'Admission',
  t2049AdmissionValue: 'Free · RSVP Required · Limited Capacity',

  /* RSVP. */
  t2049RsvpEyebrow: 'RSVP',
  t2049RsvpTitle: ['Save your spot', 'for October 5'] as readonly string[],
  t2049RsvpCopy: 'RSVP now for free entry and receive your confirmation, venue details and door time before spots fill up.',
  t2049RsvpPoints: ['Play Pulse and predict the winner with your points as the odds change in real time.', 'Follow the live standings on the venue screen or your phone as the competition unfolds.', 'Meet traders and builders from around the world throughout TOKEN2049 Week.'],

  /* Polymarket account screen, /perps-day/polymarket. It ships before the competition, so it has to read on its
     own to somebody who has not played yet. */
  t2049PolymarketBack: 'Back to PERPS DAY',
  t2049PolymarketTag: 'TOKEN2049 / POLYMARKET ACCOUNT',
  t2049PolymarketPageTitle: 'Add your Polymarket account.',
  t2049PolymarketPageCopy: 'Rewards are paid to Polymarket accounts. Give us the email address on yours so it can be matched after the competition. Predictions are open either way: the address decides who gets paid, not who can play.',
  t2049PolymarketFlowLabel: 'How the check runs',
  t2049PolymarketFlow: [
    'Sign in to ReboundX.',
    'Enter the email on your Polymarket account.',
    'Play the prediction competition.',
    'The final leaderboard is fixed at the close, and the reward list is drawn from it.',
    'Polymarket checks each address on that list, then rewards are paid.',
  ] as readonly string[],
  t2049PolymarketPayoutNote: 'Rewards are paid through Polymarket. A Polymarket account is required to receive one.',
  t2049PolymarketStatusName: (status: PolymarketStatus): string => ({
    NOT_SUBMITTED: 'Not submitted',
    PENDING: 'Pending',
    VERIFIED: 'Verified',
    REJECTED: 'Rejected',
  })[status],
  t2049PolymarketFormLabel: 'Polymarket account',
  t2049PolymarketEmailLabel: 'Polymarket account email',
  t2049PolymarketEmailHint: 'Use the address you signed up to Polymarket with. Another address cannot be matched.',
  t2049PolymarketSubmit: 'Save Polymarket Email',
  t2049PolymarketErrorEmail: 'Enter the email address on your Polymarket account.',
  t2049PolymarketCurrent: 'Your status',
  t2049PolymarketDoneTitle: 'Address received.',
  t2049PolymarketDoneCopy: 'Your status stays Pending until the competition closes. Polymarket checks the address once the final leaderboard is fixed, and the result shows here.',
  t2049PolymarketDoneEmail: 'Polymarket account email',
  t2049PolymarketAgain: 'Change Address',
  /* The way on from the done screen. A reader who got here through the gate came to open the board,
     so the board is the primary action and changing the address is the second thought. */
  t2049PolymarketToMarket: 'Back to Pulse',
  t2049PolymarketNote: 'We never ask for a Polymarket password and never sign in on your behalf. The address is used to confirm reward eligibility after the competition, nothing else.',
  t2049PolymarketCta: 'Add Your Polymarket Account',

  /* The gate that stands in front of Pulse for a reader with no Polymarket account. It states the reason
     rather than the rule, because the reader did just sign in and is entitled to know why that was
     not enough. */
  t2049GateTitle: 'Pulse runs on your Polymarket account.',
  t2049GateCopy: 'Rewards settle in Polymarket markets, so Pulse opens for Polymarket account holders only. Add the address you signed up to Polymarket with and the board opens.',
  t2049GateCta: 'Verify Polymarket Account',
  t2049GateBack: 'Back to PERPS DAY',

  /* Prediction CTA and marquee. */
  t2049MarketCta: 'Join Pulse',

  /* Pulse, the survival market the audience plays. The tag names the game rather than the format,
     because that is the name the run of show and the venue QR code use. */
  t2049MarketBack: 'Back to PERPS DAY',
  t2049MarketTag: 'TOKEN2049 / PULSE',
  /* Overrides the shared board label: on this event the market a reader goes back to has a name. */
  boardBack: 'Back to Pulse',
  /* Overrides the shared label on every surface of this page at once. "Available point" breaks onto
     two lines in the phone strip's half-width cell below 375px, and the value already reads "pt". */
  availablePoint: 'Available',
  /* Polymarket pays the rewards, so the board names it where a reader can act on it rather than only in
     the rules further down. Its brand green is this page's main colour, so the mark and the palette
     are the same move. */
  t2049MarketPolymarketTitle: 'Rewards by Polymarket',
  /* The lockup after this line sets the name, so the line stops short of it. */
  t2049MarketPolymarketFooter: 'Prediction rewards by',
  t2049MarketHeading: 'Read the pulse and predict who survives.',
  /* Heads the terms list where it now sits, under the book. The heading used to be unnecessary: the
     list was beside the title and read as part of it. */
  t2049MarketDetails: 'Market details',
  t2049MarketSpec: ({ seats, sessionMinutes, breakMinutes, finalMinutes, point, payout, cutSeconds, finalists }: T2049Spec) => [
    { term: 'Markets', detail: `One perpetual DEX per trader, ${seats} seats` },
    { term: 'Trading Time', detail: `${sessionMinutes} minutes, a ${breakMinutes} minute break, then ${finalMinutes} more` },
    { term: 'Starting Points', detail: `${point} points` },
    { term: 'Prediction', detail: 'Buy YES or NO on any trader' },
    { term: 'Elimination', detail: `The weakest seat is cut every ${Math.floor(cutSeconds / 60)}:${String(cutSeconds % 60).padStart(2, '0')} until ${finalists} are left, and its market settles at NO ${payout}` },
    { term: 'Winner', detail: 'The trader with the highest final margin balance' },
    { term: 'Settlement', detail: `Winning positions settle at ${payout} points, paid out a few days after the event` },
  ],
  t2049RulesEliminationLabel: 'Cut schedule',
  t2049RulesElimination: 'Cuts fall at 7:30, 15:00, 22:30 and on the Semifinal bell at 30:00, always the lowest margin balance on the floor. The four finalists trade out the Final without further cuts.',
  t2049RulesResolve: (payout: number) => `A cut seat settles at once: its YES pays 0 and its NO pays ${payout} back into your point. At the close the highest final margin balance wins, its YES settles at ${payout}, and a tie splits the ${payout} between the tied YES markets. Closing settlement is paid out a few days after the event, not into your point.`,
};

const token2049En = {
  ...shared,

  /* Session and elimination states. The page currently uses English only. */
  sessionLabel: 'Round',
  sessionName: (session: Session): string => ({ ready: 'Ready', sessionA: 'Semifinal', break: 'Intermission', sessionC: 'Final', settling: 'Settling', ended: 'Ended' })[session],
  nextCut: 'Next cut',
  cutTitle: (name: string) => `${name} eliminated`,
  cutPrices: (payout: number) => `YES 0 · NO ${payout}`,
  cutSettled: (payout: string) => `Positions settled. ${payout} points paid into your balance.`,
  cutNone: 'Positions settled. You held nothing on this seat.',
  breakNotice: 'Intermission, stage reset. Trading is paused and every position is held until the Final opens at 40:00.',
  settlingNotice: 'Settling. Final margin balances are confirmed first, then the winner is fixed, every position settles, and the leaderboard locks.',
  hintPaused: 'Trading is paused for the Intermission stage reset.',
  hintEliminated: 'This seat is out. Its market is closed.',
};

const token2049Ko: typeof token2049En = {
  ...shared,

  /* Session and elimination states. The page currently uses English only. */
  sessionLabel: '라운드',
  sessionName: (session) => ({ ready: '시작 전', sessionA: '준결승', break: '중간 휴식', sessionC: '결승', settling: '정산 중', ended: '종료' })[session],
  nextCut: '다음 탈락',
  cutTitle: (name) => `${name} 탈락`,
  cutPrices: (payout) => `YES 0 · NO ${payout}`,
  cutSettled: (payout) => `포지션이 정산됐습니다. ${payout} 포인트가 잔액에 들어왔습니다.`,
  cutNone: '포지션이 정산됐습니다. 이 자리에 보유한 포지션은 없었습니다.',
  breakNotice: '중간 휴식, 스테이지 정비입니다. 거래가 중지되고 모든 포지션은 40:00에 결승이 열릴 때까지 유지됩니다.',
  settlingNotice: '정산 중입니다. 최종 Margin Balance를 먼저 확정한 뒤 승자를 확정하고, 모든 포지션을 정산하고, 리더보드를 잠급니다. 정산 포인트는 대회 종료 며칠 뒤에 별도로 지급됩니다.',
  hintPaused: '중간 휴식 정비로 거래가 중지됐습니다.',
  hintEliminated: '탈락한 자리입니다. 마켓이 닫혔습니다.',
};

export const TOKEN2049_STRINGS = {
  en: { ...commonEn, ...marketEn, ...token2049En },
  ko: { ...commonKo, ...marketKo, ...token2049Ko },
};

export type Strings = typeof TOKEN2049_STRINGS.en;
export type I18nProps = LocalizedProps<Strings>;
