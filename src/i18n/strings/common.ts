import type { Lang, LocalizedProps } from '../types';

// These labels are identical in both languages.
const shared = {
  footerRights: 'REBOUND X / ALL RIGHTS RESERVED',
  copyright: '© 2026 PERP-DEX DAY',
};

export const commonEn = {
  ...shared,

  /* Shared navigation and accessibility. */
  langSwitch: (lang: Lang): string => (lang === 'en' ? 'Read in English' : 'Read in Korean'),
  eventSelection: 'Event selection',
  backToTop: 'Back to Top',
  brandHome: (name: string): string => `Go to ${name} home`,
  motionEnabled: 'Motion enabled',
  skipToContent: 'Skip to Content',
  agendaTitle: 'Timetable',

  /* Event hub. */
  hubHeadline: 'Experience firsthand the better trading ReboundX is building.',
  hubLede: 'At PERP-DEX DAY, REBOUNDX DAY and TOKEN2049, you get all of it: the tension of predicting a winner, the fun of taking part, and networking with people from everywhere.',
};

export const commonKo: typeof commonEn = {
  ...shared,

  /* Shared navigation and accessibility. */
  langSwitch: (lang) => (lang === 'en' ? '영어로 보기' : '한국어로 보기'),
  eventSelection: '이벤트 선택',
  backToTop: '맨 위로',
  brandHome: (name) => `${name} 홈으로`,
  motionEnabled: '모션 사용',
  skipToContent: '본문으로 건너뛰기',
  agendaTitle: '타임테이블',

  /* Event hub. */
  hubHeadline: 'ReboundX가 만드는 더 나은 거래를 직접 경험해요.',
  hubLede: 'PERP-DEX DAY, REBOUNDX DAY, TOKEN2049에서 승부를 예측하는 긴장감부터 직접 참여하는 즐거움과 글로벌 네트워킹까지 모두 경험해요.',
};

export const COMMON_STRINGS = {
  en: { ...commonEn },
  ko: { ...commonKo },
};

export type Strings = typeof COMMON_STRINGS.en;
export type I18nProps = LocalizedProps<Strings>;
