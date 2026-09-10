import { marketEn, marketKo } from './market';
import { commonEn, commonKo } from './common';
import type { LocalizedProps } from '../types';
import type { Phase } from '../../market/perpdexday/state';

export const perpdexdayEn = {
  /* Event page. */
  takeRedPill: 'Take the Red Pill',
  ctaWords: ['Take', 'the', 'Red Pill'] as readonly string[],
  sponsorsTitle: 'The teams behind them',
  sponsorsLabel: 'Sponsors',
  speakersTitle: 'Speakers',
  opsEyebrow: 'Choose the red pill and enter the Matrix',
  opsTitle: ['From live trading to predicting the winner.', 'It all becomes one match.'] as readonly string[],
  opsCopy: 'Four traders trade for real, each on a different Perp DEX, while the audience watches the win probability shift live and predicts the outcome.',

  /* PERP-DEX DAY prediction market. */
  marketBack: 'Back to PERP-DEX DAY',
  marketTag: 'THE RED PILL / PREDICTION MARKET',
  marketTitle: 'Who will rule the Matrix?',
  marketSpec: (minutes: number, point: number, payout: number) => [
    { term: 'Markets', detail: 'One perpetual DEX per trader' },
    { term: 'Trading Time', detail: `${minutes} minutes` },
    { term: 'Starting Points', detail: `${point} points` },
    { term: 'Prediction', detail: 'Buy YES or NO on any trader' },
    { term: 'Winner', detail: 'The trader with the highest final margin balance' },
    { term: 'Settlement', detail: `Winning positions settle at ${payout} points, paid out a few days after the event` },
  ],
  statusLabel: 'Status',
  phaseName: (phase: Phase): string => ({ ready: 'Ready', live: 'Live', settling: 'Settling', ended: 'Ended' })[phase],
  rulesResolve: (payout: number) => `The trader holding the highest margin balance when the thirty minutes end wins. Their YES settles at ${payout} points and every other YES at 0. If traders tie, the ${payout} points are split across the tied YES markets. Settlement is paid out a few days after the event, not into your point.`,
  marketBrandTitle: 'Watch the PERP-DEX market move in real time.',
  marketBrandCopy: 'Track volume, market share and rewards in one place.',
};

export const perpdexdayKo: typeof perpdexdayEn = {
  /* Event page. */
  takeRedPill: '빨간 알약 삼키기',
  ctaWords: ['빨간', '알약', '삼키기'],
  sponsorsTitle: '함께하는 팀',
  sponsorsLabel: '스폰서',
  speakersTitle: '연사',
  opsEyebrow: '빨간 알약을 선택하고 매트릭스에 들어오세요',
  opsTitle: ['실시간 거래부터 우승 예측까지,', '모두 하나의 경기가 돼요'],
  opsCopy: '네 명의 트레이더가 각기 다른 Perp DEX로 실제 거래를 펼치고 관객은 실시간으로 바뀌는 우승 확률을 보며 결과를 예측해요.',

  /* PERP-DEX DAY prediction market. */
  marketBack: 'PERP-DEX DAY로 돌아가기',
  marketTag: 'THE RED PILL / 예측 마켓',
  marketTitle: '매트릭스를 지배할 트레이더는 누구일까요?',
  marketSpec: (minutes, point, payout) => [
    { term: '마켓', detail: '트레이더당 Perp DEX 1개' },
    { term: '거래 시간', detail: `${minutes}분` },
    { term: '시작 포인트', detail: `${point} 포인트` },
    { term: '예측', detail: '트레이더별 YES 또는 NO 매수' },
    { term: '우승', detail: '최종 Margin Balance가 가장 높은 트레이더' },
    { term: '정산', detail: `이긴 포지션은 ${payout} 포인트로 정산` },
  ],
  statusLabel: '상태',
  phaseName: (phase) => ({ ready: '시작 전', live: '진행 중', settling: '정산 중', ended: '종료' })[phase],
  rulesResolve: (payout) => `30분 종료 시 Margin Balance가 가장 높은 트레이더가 승리하며 승자의 YES는 ${payout}포인트, 나머지는 0포인트로 정산되고 공동 1위가 나오면 ${payout}포인트를 해당 YES 마켓에 나눠요. 정산 포인트는 대회 종료 며칠 뒤에 별도로 지급됩니다.`,
  marketBrandTitle: '실시간으로 움직이는 PERP-DEX 시장을 확인해 보세요.',
  marketBrandCopy: '거래량부터 점유율과 리워드까지 한눈에 확인해 보세요.',
};

export const PERPDEXDAY_STRINGS = {
  en: { ...commonEn, ...marketEn, ...perpdexdayEn },
  ko: { ...commonKo, ...marketKo, ...perpdexdayKo },
};

export type Strings = typeof PERPDEXDAY_STRINGS.en;
export type I18nProps = LocalizedProps<Strings>;
