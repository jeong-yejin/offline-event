import { commonEn, commonKo } from './common';
import type { LocalizedProps } from '../types';
import type { Phase as HeatPhase } from '../../market/wonderlandBoard';

/* Only the closing phases have anything to say. A phase with no note is absent from the map rather
   than carrying an empty string, so the screen prints no paragraph at all. */
type PhaseNote = Partial<Record<HeatPhase, string>>;

// These labels are identical in both languages.
const shared = {
  reboundxPanelTitle: 'ReboundX',
};

export const wonderlandEn = {
  ...shared,

  /* Page hero. */
  wonderlandLedeTop: 'Pitches from 7 exchange, chain and protocol teams, a live trading competition, and a VIP poker night.',
  wonderlandLedeBottom: 'Wonderland opens for one evening only.',

  /* Embedded event page and fallback states. */
  reboundxFrame: 'ReboundX in Wonderland event page',
  reboundxLoading: 'Loading the Wonderland page…',
  reboundxFailed: 'The Wonderland page did not load. Open it in its own tab to keep reading.',
  reboundxFailedCta: 'Open Wonderland in a New Tab',
  wonderlandCta: 'Live Leaderboard',

  /* Live leaderboard. */
  wonderlandBack: 'Back to Wonderland',
  wonderlandEyebrow: 'Live standings',
  wonderlandStatus: 'Status',
  wonderlandPhaseName: (phase: HeatPhase): string =>
    ({ ready: 'Ready', live: 'Live', settling: 'Settling', ended: 'Ended' })[phase],
  wonderlandStarts: 'Starts',
  wonderlandEnds: 'Ends',
  wonderlandRemaining: 'Remaining',
  wonderlandLastUpdated: 'Last updated',
  wonderlandDashboardLabel: 'My performance and competition status',

  /* My performance. */
  wonderlandMyPerformance: 'My performance',
  wonderlandProfile: 'Profile',
  wonderlandOverallRank: 'Rank',
  wonderlandMyScore: 'Score',
  wonderlandMyPnl: 'Competition PnL (USDT)',
  wonderlandMyReturn: 'Competition return (%)',
  wonderlandMyNotional: 'Executed notional (USDT)',
  wonderlandUnscored: 'Not scored',
  wonderlandScoringNote: 'Net profit and return are ranked separately, each place is converted to points and added, and the highest total takes the final rank. Scores count only trades filled inside the competition window, and a seat with no executed notional is left without a return.',

  /* The board. */
  wonderlandRank: 'Rank',
  wonderlandTrader: 'Trader',
  wonderlandScore: 'Score',
  wonderlandPnl: 'PnL (USDT)',
  wonderlandReturn: 'Return (%)',
  wonderlandMine: 'You',
  wonderlandCaption: 'Live standings by competition score',
  wonderlandFeedCut: 'Reports have stopped. These numbers are the last ones the board received.',
  wonderlandNote: (phase: HeatPhase): string | undefined => ({
    settling: 'The bell has rung. Missed reports are being recovered and the closing scores are still being computed.',
    ended: 'Final standings. The result is fixed and no further report changes it.',
  } as PhaseNote)[phase],
};

export const wonderlandKo: typeof wonderlandEn = {
  ...shared,

  /* Page hero. */
  wonderlandLedeTop: '거래소·체인·프로토콜 7팀의 피치부터 실시간 트레이딩 컴피티션과 VIP 포커 나이트까지,',
  wonderlandLedeBottom: '단 하루 저녁에만 이상한 나라가 열려요.',

  /* Embedded event page and fallback states. */
  reboundxFrame: 'ReboundX in Wonderland 이벤트 페이지',
  reboundxLoading: 'Wonderland 페이지를 불러오는 중…',
  reboundxFailed: 'Wonderland 페이지를 불러오지 못했습니다. 새 탭에서 열어 이어서 보세요.',
  reboundxFailedCta: '새 탭에서 Wonderland 열기',
  wonderlandCta: '실시간 리더보드',

  /* Live leaderboard. */
  wonderlandBack: 'Wonderland로 돌아가기',
  wonderlandEyebrow: '실시간 순위',
  wonderlandStatus: '대회 상태',
  wonderlandPhaseName: (phase) => ({ ready: '준비', live: '진행 중', settling: '정산 중', ended: '종료' })[phase],
  wonderlandStarts: '시작',
  wonderlandEnds: '종료',
  wonderlandRemaining: '남은 시간',
  wonderlandLastUpdated: '마지막 갱신',
  wonderlandDashboardLabel: '내 성과 및 대회 현황',

  /* My performance. */
  wonderlandMyPerformance: '내 성과',
  wonderlandProfile: '프로필',
  wonderlandOverallRank: '종합 순위',
  wonderlandMyScore: '종합 점수',
  wonderlandMyPnl: '대회 손익 (USDT)',
  wonderlandMyReturn: '대회 수익률 (%)',
  wonderlandMyNotional: '누적 체결금액 (USDT)',
  wonderlandUnscored: '미산정',
  wonderlandScoringNote: '순이익과 수익률 순위를 각각 점수로 환산해 합산하며, 총점이 높은 순으로 최종 순위를 정합니다. 점수는 경기 시간 내 체결된 거래만 반영하며, 체결금액이 없는 참가자의 수익률은 산정하지 않습니다.',

  /* The board. */
  wonderlandRank: '순위',
  wonderlandTrader: '트레이더',
  wonderlandScore: '종합 점수',
  wonderlandPnl: '손익 (USDT)',
  wonderlandReturn: '수익률 (%)',
  wonderlandMine: '나',
  wonderlandCaption: 'Wonderland 트레이딩 컴피티션 종합 점수 순위',
  wonderlandFeedCut: '데이터 수신이 끊겼습니다. 지금 보이는 값은 마지막으로 받은 보고입니다.',
  wonderlandNote: (phase) => ({
    settling: '벨이 울렸습니다. 누락된 보고를 복구하고 최종 점수를 계산하는 중입니다.',
    ended: '최종 순위입니다. 결과는 확정되었고 이후 보고로 바뀌지 않습니다.',
  } as PhaseNote)[phase],
};

export const WONDERLAND_STRINGS = {
  en: { ...commonEn, ...wonderlandEn },
  ko: { ...commonKo, ...wonderlandKo },
};

export type Strings = typeof WONDERLAND_STRINGS.en;
export type I18nProps = LocalizedProps<Strings>;
