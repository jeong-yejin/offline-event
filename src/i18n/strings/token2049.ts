import { marketEn, marketKo } from './market';
import { commonEn, commonKo } from './common';
import type { LocalizedProps } from '../types';
import type { Session } from '../../market/token2049/clock';
import type { KalshiStatus, TeamTier } from '../../data/token2049Content';

/* The survival format carries four numbers the PERP-DEX DAY spec has no room for, so the row list
   takes one shape instead of eight positional arguments. */
export type T2049Spec = {
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
  t2049MetaTitle: 'PERPS DAY — Eight Traders. Four Teams. The Best Trader Wins.',
  t2049MetaDescription: 'Eight traders from four teams compete live in Singapore on October 5, 2026. Everyone starts with an equal balance, and one trader is eliminated every 7 minutes 30 seconds in the semifinal. Free entry with RSVP.',
  t2049OgDescription: 'October 5, 2026 · Singapore. Eight traders compete on live accounts with an equal starting balance. One elimination every 7 minutes 30 seconds. Limited capacity. RSVP required.',
  t2049OgImageAlt: 'PERPS DAY by ReboundX and Kalshi · October 5, 2026 · Singapore',
  t2049TwitterDescription: 'October 5, 2026 · Singapore. Eight traders compete live with an equal starting balance. One elimination every 7 minutes 30 seconds.',

  /* Section navigation. */
  t2049NavLabel: 'Section navigation',
  t2049NavCompetition: 'Competition',
  t2049NavTraders: 'Traders',
  t2049NavVenue: 'Venue',
  t2049NavRsvp: 'RSVP',

  /* Hero and countdown. */
  t2049HeroCta: 'View Live Standings',
  t2049HeroTeamCta: 'Enter Your Team',
  t2049CountdownTitle: 'Doors Open In',
  t2049CountdownDays: 'Days',
  t2049CountdownHours: 'Hours',
  t2049CountdownMinutes: 'Minutes',
  t2049CountdownSeconds: 'Seconds',

  /* Competition format. */
  t2049Eyebrow: 'Competition Format',
  t2049Title: ['One trader drops', 'every 7 minutes 30 seconds.'] as readonly string[],
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
  t2049SpecEliminationCopy: 'Eliminations are individual, not team-based. Both traders from the same team may advance, or both may be eliminated.',
  t2049SpecRanking: 'Ranking',
  t2049SpecRankingCopy: 'Rankings are based on percentage return. Everyone starts with the same balance, so performance alone determines the leaderboard.',
  t2049SpecBalance: 'Starting Balance',
  t2049SpecBalanceCopy: 'Live accounts and starting balances are provided by the organizers on the day. Once the clock starts, every order and fill counts. There are no resets.',
  t2049SpecPrizeCopy: 'The prize goes to the trader with the highest percentage return at the end of the final.',

  /* Traders. */
  t2049LiveEyebrow: 'Meet the Traders',
  t2049LiveTitle: ['Eight traders from four teams', 'compete live.'] as readonly string[],
  t2049TraderSlot: (seat: number): string => `Trader ${String(seat).padStart(2, '0')}`,
  t2049Tbd: 'To Be Revealed',

  /* Teams. */
  t2049TeamsCopy: 'Each team sends two traders to compete under the same conditions. One team slot is still open.',
  t2049TeamConfirmed: 'Confirmed',
  t2049TeamSlotOpen: 'Team Slot Open',
  t2049TeamsCta: 'Apply to Enter Your Team',

  /* Live standings and predictions. */
  t2049KalshiEyebrow: 'Live Standings & Predictions',
  t2049KalshiTitle: ['Track the standings', 'and predict the winner.'] as readonly string[],
  t2049KalshiCopy: 'Follow the live leaderboard and trade YES or NO on the trader you think will win.',
  t2049KalshiPoints: [
    'Start with 100 points',
    'Trade YES or NO on any trader',
    'Winning positions settle at 100 points, paid out after the event',
  ],

  /* Date and venue. */
  t2049VenueEyebrow: 'Date & Venue',
  t2049VenueTitle: ['Token2049', 'Live in Singapore'] as readonly string[],
  t2049VenueCopy: 'Join ReboundX and Kalshi for a live trading competition during TOKEN2049 Week. Capacity is limited, and entry is available to confirmed guests only.',
  t2049VenueLabel: 'Date and venue details',
  t2049VenueDate: 'Date',
  t2049DateValue: 'Monday, October 5, 2026',
  t2049VenuePlace: 'Venue',
  t2049VenueValue: 'Zouk',
  t2049VenueAdmission: 'Admission',
  t2049AdmissionValue: 'Free · RSVP Required · Limited Capacity',

  /* RSVP. */
  t2049RsvpEyebrow: 'RSVP',
  t2049RsvpTitle: ['Save your spot', 'for October 5.'] as readonly string[],
  t2049RsvpCopy: 'RSVP now for free entry and receive your confirmation, venue details and door time before spots fill up.',
  t2049RsvpPoints: ['Predict the winner with your points as the odds change in real time.', 'Follow the live standings on the venue screen or your phone as the competition unfolds.', 'Meet traders, teams and builders from around the world throughout TOKEN2049 Week.'],

  /* Team entry. */
  t2049EntryEyebrow: 'Enter Your Team',
  t2049EntrySlots: (slots: number): string => `${slots} team slot${slots === 1 ? '' : 's'} left.`,
  t2049EntryCopy: 'Send two traders to compete live on stage with accounts and starting balances provided by us.',
  t2049EntryDeadline: 'Application Deadline',
  t2049Tba: 'To Be Announced',
  t2049EntryReceives: 'What Your Team Receives',
  t2049EntryPoints: ['Co-branded team presence across event assets', 'Two trader profiles featured on the stage screen and live leaderboard', 'Flights and accommodation for both traders'],
  t2049EntryCta: 'Apply as a Team',

  /* Team entry screen, /perps-day/teams. Entry closed before the event, so this page confirms a team
     that was already chosen rather than collecting applications. */
  t2049TeamsBack: 'Back to PERPS DAY',
  t2049TeamsTag: 'TOKEN2049 / TEAM ENTRY',
  t2049TeamsPageTitle: 'Confirm your team.',
  t2049TeamsPageCopy: 'The four team slots go to exchanges selected in the Founding and Partner tiers. If your exchange holds a slot, confirm your two traders here. This is not an open application.',
  t2049TeamsTierLabel: 'Selected tiers',
  t2049TeamsTierName: (tier: TeamTier): string => (tier === 'founding' ? 'Founding' : 'Partner'),
  t2049TeamsTierSeats: (exchanges: number, seats: number): string => `${exchanges} exchanges · ${seats} traders each`,
  t2049TeamsFormLabel: 'Team confirmation',
  t2049TeamsCodeLabel: 'Invitation code',
  t2049TeamsCodeHint: 'Sent to your tier contact. Format TIER-XXXX-XXXX.',
  t2049TeamsTraderLabel: (seat: number): string => `Trader ${String(seat).padStart(2, '0')}`,
  t2049TeamsTraderHint: 'Full name as it should read on the stage screen.',
  t2049TeamsSubmit: 'Confirm Team',
  t2049TeamsErrorCode: 'Enter the invitation code as TIER-XXXX-XXXX.',
  t2049TeamsErrorTrader: 'Enter a name for both traders.',
  t2049TeamsDoneTitle: 'Team received.',
  t2049TeamsDoneCopy: 'Your tier contact checks the invitation code and confirms both seats by email. Nothing else is needed from you now.',
  t2049TeamsDoneCode: 'Invitation code',
  t2049TeamsClosedNote: 'No invitation code? Slots are filled by tier only. Ask your ReboundX contact before the deadline.',

  /* Kalshi account screen, /perps-day/kalshi. It ships before the competition, so it has to read on its
     own to somebody who has not played yet. */
  t2049KalshiBack: 'Back to PERPS DAY',
  t2049KalshiTag: 'TOKEN2049 / KALSHI ACCOUNT',
  t2049KalshiPageTitle: 'Add your Kalshi account.',
  t2049KalshiPageCopy: 'Rewards are paid to Kalshi accounts. Give us the email address on yours so it can be matched after the competition. Predictions are open either way: the address decides who gets paid, not who can play.',
  t2049KalshiFlowLabel: 'How the check runs',
  t2049KalshiFlow: [
    'Sign in to ReboundX.',
    'Enter the email on your Kalshi account.',
    'Play the prediction competition.',
    'The final leaderboard is fixed at the close, and the reward list is drawn from it.',
    'Kalshi checks each address on that list, then rewards are paid.',
  ] as readonly string[],
  t2049KalshiPayoutNote: 'Rewards are paid through Kalshi. A Kalshi account is required to receive one.',
  t2049KalshiStatusName: (status: KalshiStatus): string => ({
    NOT_SUBMITTED: 'Not submitted',
    PENDING: 'Pending',
    VERIFIED: 'Verified',
    REJECTED: 'Rejected',
  })[status],
  t2049KalshiFormLabel: 'Kalshi account',
  t2049KalshiEmailLabel: 'Kalshi account email',
  t2049KalshiEmailHint: 'Use the address you signed up to Kalshi with. Another address cannot be matched.',
  t2049KalshiSubmit: 'Save Kalshi Email',
  t2049KalshiErrorEmail: 'Enter the email address on your Kalshi account.',
  t2049KalshiCurrent: 'Your status',
  t2049KalshiDoneTitle: 'Address received.',
  t2049KalshiDoneCopy: 'Your status stays Pending until the competition closes. Kalshi checks the address once the final leaderboard is fixed, and the result shows here.',
  t2049KalshiDoneEmail: 'Kalshi account email',
  t2049KalshiAgain: 'Change Address',
  t2049KalshiNote: 'We never ask for a Kalshi password and never sign in on your behalf. The address is used to confirm reward eligibility after the competition, nothing else.',
  t2049KalshiCta: 'Add Your Kalshi Account',

  /* Prediction CTA and marquee. */
  t2049MarketCta: 'Predict the Winner',
  t2049Marquee: ['8 Traders', '4 Teams', 'The Best Trader Wins', 'October 5 · Singapore'],

  /* Survival market. */
  t2049MarketBack: 'Back to PERPS DAY',
  t2049MarketTag: 'TOKEN2049 / SURVIVAL MARKET',
  t2049MarketHeading: 'Choose the four traders you think will survive.',
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

export const token2049En = {
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

export const token2049Ko: typeof token2049En = {
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
