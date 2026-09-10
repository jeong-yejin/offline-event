import type { AgendaItem, Speaker } from '../data/homeContent';
import type { EventContent, EventKey } from '../data/eventContent';
import type { Lang } from './types';

/* Korean overrides keyed by the English source's own identity, so the data files stay single-source. */
type EventCopy = Pick<EventContent, 'eyebrow' | 'copy' | 'date'>;

/* TOKEN2049 ships in English only, so it has no entry and falls through to the source copy. */
const KO_EVENTS: Partial<Record<EventKey, EventCopy>> = {
  'perp-dex-day': {
    eyebrow: '깨어나세요, Rebounder',
    copy: 'PERP-DEX DAY는 Korea Blockchain Week 2026 기간에 열리는 사이드 이벤트입니다. Perpetual DEX의 경쟁력과 인지도를 끌어올리기 위해 만들어졌습니다. 실시간 트레이딩, 무대 위 경쟁, 그리고 밀도 있는 네트워킹을 통해 Perp-DEX의 다음 가능성을 직접 확인하세요.',
    date: 'Korea Blockchain Week 2026 · 2026년 9월 28일',
  },
  'reboundx-in-wonderland': {
    eyebrow: '흰토끼를 따라 원더랜드로 들어오세요',
    copy: '원더랜드 곳곳의 미션을 즐기며 더 똑똑하고 간편하게 함께하는 거래를 경험해 보세요.',
    date: 'Korea Blockchain Week 2026 · 2026년 9월 29일',
  },
};

const KO_SPEAKER_ROLES: Record<string, string> = {
  'CTO of Extended': 'Extended CTO',
  'CEO of Aster': 'Aster CEO',
  'Product Head of Variational': 'Variational 프로덕트 총괄',
  'Product Head of Lighter': 'Lighter 프로덕트 총괄',
};

/* PERP-DEX DAY is the only agenda that runs through here in Korean: Token2049Page asks for 'en'. */
const KO_AGENDA_TITLES: Record<string, string> = {
  'Check in/Booth open': '체크인 / 부스 오픈',
  'ReboundX Pitch': 'ReboundX 피치',
  'The Alpha Talk (debate)': '알파 토크',
  'Live trading competition winner prediction betting': '트레이딩 대회 우승자 예측 배팅',
  'Trading Competition': '트레이딩 대회',
  Raffle: '경품 추첨',
  'Networking': '네트워킹',
};

export const localizeEvent = (lang: Lang, event: EventContent): EventContent =>
  lang === 'ko' ? { ...event, ...KO_EVENTS[event.key] } : event;

export const localizeRole = (lang: Lang, [name, role, image]: Speaker): Speaker =>
  lang === 'ko' ? [name, KO_SPEAKER_ROLES[role] ?? role, image] : [name, role, image];

export const localizeAgenda = (lang: Lang, [time, title, type]: AgendaItem): AgendaItem =>
  lang === 'ko' ? [time, KO_AGENDA_TITLES[title] ?? title, type] : [time, title, type];

