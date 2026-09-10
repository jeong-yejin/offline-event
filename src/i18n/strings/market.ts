import type { LocalizedProps } from '../types';
import type { DataStatus, Direction, Side, TraderState } from '../../market/engine';

// These labels are identical in both languages.
const shared = {
  sideYes: 'Yes',
  sideNo: 'No',
};

export const marketEn = {
  ...shared,

  /* Shared market overview. */
  remaining: 'Remaining',
  closedAt: 'Closed at',
  availablePoint: 'Available point',
  totalAsset: 'Total asset',
  myRank: 'My rank',

  /* Settlement. */
  settledTitle: (names: string) => `Settled — ${names} finished on the highest margin balance`,
  settledSplit: (count: number, price: number) => count > 1
    ? `${count} traders tied, so each winning YES settles at ${price} and its NO takes the rest.`
    : 'The winning YES settles at 100 and every other YES at 0.',
  settledPaid: (payout: string) => `Your settled positions are worth ${payout} points, paid out a few days after the event.`,
  settledNone: 'None of your positions settled in the money.',
  settledFinal: (point: string) => `Trading point at the close ${point}.`,

  /* Trader table. */
  traderStateName: (state: TraderState): string => ({ active: 'Active', eliminated: 'Eliminated', finalist: 'Finalist', winner: 'Winner' })[state],
  marginBalance: 'Margin balance',
  traderReturn: 'Return',
  marketProbability: 'Market probability',
  currentRank: 'Current rank',
  traderTableCaption: 'Trader markets',
  traderColumn: 'Trader',
  tradeColumn: 'Trade',
  feedStatus: (status: DataStatus): string => ({ live: 'Feed live', delayed: 'Feed delayed', stale: 'Feed stale — trading paused' })[status],

  /* Probability chart. */
  chartTitle: 'Market probability',
  chartSeries: 'Chart series',
  chartAll: 'All',
  chartAria: (names: string) => `Market probability history for ${names}`,

  /* Player leaderboard. */
  leaderTitle: 'Live leaderboard',
  leaderFinalTitle: 'Final leaderboard',
  leaderLabel: 'Player leaderboard',
  leaderCaption: 'Players ranked by total asset, updating with the market.',
  leaderFinalCaption: 'Players ranked by final point. This order is locked.',
  leaderFinalNote: 'Ranks are locked. Rewards are paid manually after the event.',
  leaderRank: 'Rank',
  leaderNickname: 'Nickname',
  leaderAsset: 'Total asset',
  leaderPnl: 'P&L',
  leaderReturn: 'Return',
  leaderYou: 'YOU',

  /* Resolution rules. */
  rulesTitle: 'Resolution',
  rulesWinnerLabel: 'Winner settlement',
  rulesRewardLabel: 'Leaderboard rewards',
  rulesPointsLabel: 'Points policy',
  rulesReward: (top: number, first: number) => `The top ${top} on the final leaderboard are rewarded. First place takes ${first} USDT, and ranks 2 to ${top} each take the same amount. Payouts are handled manually after the event.`,
  rulesDisclaimer: 'Points are an event-only balance for a one-time event. They have no cash value, cannot be withdrawn, and are not used for any gambling activity.',

  /* Open positions. */
  positionsTitle: 'My positions',
  averageEntry: 'Average entry',
  currentSell: 'Current sell',
  settlementPriceLabel: 'Settlement price',
  marketValue: 'Market value',
  unrealizedPnl: 'Unrealised P&L',
  sellQuantity: 'Sell quantity',
  sellCta: 'Sell',
  closeAll: 'Close All',
  positionSettled: 'Settled.',

  /* Closed positions. */
  historyTitle: 'Closed positions',
  historyExit: 'Exit',
  historyRealized: 'Realised P&L',

  /* Order ticket. */
  ticketLabel: 'Order ticket',
  directionGroup: 'Order direction',
  directionName: (direction: Direction): string => direction,
  sideGroup: 'Position side',
  sideName: (side: Side): string => side,
  quantity: 'Quantity',
  quantityDown: 'Decrease quantity',
  quantityUp: 'Increase quantity',
  unitPrice: 'Unit price',
  requiredPoint: 'Required point',
  expectedPoint: 'Expected point',
  ownedQuantity: 'Quantity',
  orderableQuantity: 'Max order',
  maxCta: 'MAX',
  quoteId: 'Quote',
  totalPrice: 'Total price',
  quoteLife: (seconds: number) => `This price holds for ${seconds}s.`,
  quoteExpired: 'Quote expired. Ask for a new one.',
  requoteCta: 'New Quote',
  cancelQuote: 'Cancel',
  confirmOrder: (direction: Direction): string => (direction === 'buy' ? 'Confirm Buy' : 'Confirm Sell'),
  requestQuote: (direction: Direction): string => (direction === 'buy' ? 'Request Buy Quote' : 'Request Sell Quote'),
  errorQuantity: 'Quantity must be a whole number of 1 or more.',
  errorOwned: (owned: number) => `You hold ${owned}. Sell that many or fewer.`,
  errorPoint: (point: string, max: number) => `You have ${point} points, enough for ${max} at this price.`,
  hintClosed: 'Trading is closed for this competition.',
  hintStale: (name: string) => `${name}'s feed is stale. New quotes are paused until it recovers.`,
  filled: (direction: Direction, qty: number, side: Side, name: string, price: number) =>
    `${direction === 'buy' ? 'Bought' : 'Sold'} ${qty} ${side.toUpperCase()} on ${name} at ${price} points.`,
};

export const marketKo: typeof marketEn = {
  ...shared,

  /* Shared market overview. */
  remaining: '남은 시간',
  closedAt: '종료 시각',
  availablePoint: '보유 포인트',
  totalAsset: '총 자산',
  myRank: '내 순위',

  /* Settlement. */
  settledTitle: (names) => `정산 완료 — 최종 Margin Balance 1위는 ${names}`,
  settledSplit: (count, price) => count > 1
    ? `${count}명이 공동 1위여서 해당 YES는 각각 ${price}, NO는 나머지로 정산됐습니다.`
    : '1위의 YES는 100, 나머지 YES는 0으로 정산됐습니다.',
  settledPaid: (payout) => `정산된 포지션 ${payout} 포인트는 대회 종료 며칠 뒤에 별도로 지급됩니다.`,
  settledNone: '정산 금액이 발생한 포지션이 없습니다.',
  settledFinal: (point) => `종료 시점 거래 포인트 ${point}.`,

  /* Trader table. */
  traderStateName: (state) => ({ active: '진행 중', eliminated: '탈락', finalist: '파이널리스트', winner: '우승' })[state],
  marginBalance: 'Margin Balance',
  traderReturn: '수익률',
  marketProbability: 'Market Probability',
  currentRank: '현재 순위',
  traderTableCaption: '트레이더 마켓',
  traderColumn: '트레이더',
  tradeColumn: '거래',
  feedStatus: (status) => ({ live: '실시간', delayed: '지연됨', stale: '데이터 끊김 — 거래 일시 중지' })[status],

  /* Probability chart. */
  chartTitle: 'Market Probability',
  chartSeries: '차트 계열',
  chartAll: '전체',
  chartAria: (names) => `${names}의 Market Probability 추이`,

  /* Player leaderboard. */
  leaderTitle: '실시간 리더보드',
  leaderFinalTitle: '최종 리더보드',
  leaderLabel: '참가자 리더보드',
  leaderCaption: '총 자산 순으로 정렬되며 마켓과 함께 갱신됩니다.',
  leaderFinalCaption: '최종 포인트 순입니다. 이 순위는 고정됩니다.',
  leaderFinalNote: '순위가 확정됐습니다. 리워드는 행사 종료 후 수동 지급됩니다.',
  leaderRank: '순위',
  leaderNickname: '닉네임',
  leaderAsset: '총 자산',
  leaderPnl: '손익',
  leaderReturn: '수익률',
  leaderYou: '나',

  /* Resolution rules. */
  rulesTitle: '정산 규칙',
  rulesWinnerLabel: '승자 결정',
  rulesRewardLabel: '리더보드 리워드',
  rulesPointsLabel: '포인트 안내',
  rulesReward: (top, first) => `최종 리더보드 상위 ${top}명에게 리워드를 지급하며 1위는 ${first} USDT, 2위부터 ${top}위까지는 동일한 금액을 행사 종료 후 수동으로 지급해요.`,
  rulesDisclaimer: '포인트는 현금 가치와 출금 기능이 없는 일회성 행사 전용 잔액이며 사행성 활동에 사용되지 않아요.',

  /* Open positions. */
  positionsTitle: '내 포지션',
  averageEntry: '평균 진입가',
  currentSell: '현재 매도가',
  settlementPriceLabel: '정산가',
  marketValue: '평가 금액',
  unrealizedPnl: '미실현 손익',
  sellQuantity: '매도 수량',
  sellCta: '매도',
  closeAll: '전량 청산',
  positionSettled: '정산 완료.',

  /* Closed positions. */
  historyTitle: '종료된 포지션',
  historyExit: '청산가',
  historyRealized: '실현 손익',

  /* Order ticket. */
  ticketLabel: '주문 티켓',
  directionGroup: '주문 방향',
  directionName: (direction) => (direction === 'buy' ? '매수' : '매도'),
  sideGroup: '포지션 방향',
  sideName: (side) => (side === 'yes' ? 'YES' : 'NO'),
  quantity: '수량',
  quantityDown: '수량 줄이기',
  quantityUp: '수량 늘리기',
  unitPrice: '단가',
  requiredPoint: '필요 포인트',
  expectedPoint: '예상 수령 포인트',
  ownedQuantity: '수량',
  orderableQuantity: '주문 가능',
  maxCta: 'MAX',
  quoteId: '견적',
  totalPrice: '총 금액',
  quoteLife: (seconds) => `이 가격은 ${seconds}초 동안 유효합니다.`,
  quoteExpired: '견적이 만료됐습니다. 다시 요청하세요.',
  requoteCta: '새 견적',
  cancelQuote: '취소',
  confirmOrder: (direction) => (direction === 'buy' ? '매수 확정' : '매도 확정'),
  requestQuote: (direction) => (direction === 'buy' ? '매수 견적 요청' : '매도 견적 요청'),
  errorQuantity: '수량은 1 이상의 정수여야 합니다.',
  errorOwned: (owned) => `보유 수량은 ${owned}입니다. 그 이하로 입력하세요.`,
  errorPoint: (point, max) => `보유 포인트가 ${point}이라 이 가격으로는 ${max}까지 가능합니다.`,
  hintClosed: '이 대회의 거래가 종료됐습니다.',
  hintStale: (name) => `${name}의 데이터가 끊겼습니다. 복구될 때까지 새 견적을 받을 수 없습니다.`,
  filled: (direction, qty, side, name, price) =>
    `${name} ${side.toUpperCase()} ${qty}개를 ${price} 포인트에 ${direction === 'buy' ? '매수' : '매도'}했습니다.`,
};

export const MARKET_STRINGS = {
  en: { ...marketEn },
  ko: { ...marketKo },
};

export type Strings = typeof MARKET_STRINGS.en;
export type I18nProps = LocalizedProps<Strings>;
