import type { AgendaItem, Speaker } from '../data/homeContent';
import type { EventContent, EventKey } from '../data/eventContent';
import type { Lang } from './strings';

/* Korean overrides keyed by the English source's own identity, so the data files stay single-source. */
type EventCopy = Pick<EventContent, 'eyebrow' | 'copy' | 'date'>;

const KO_EVENTS: Record<EventKey, EventCopy> = {
  'perp-dex-day': {
    eyebrow: '깨어나라. 아레나가 부른다.',
    copy: 'PERP-DEX DAY는 Korea Blockchain Week 2026 기간에 열리는 사이드 이벤트입니다. 퍼페추얼 DEX의 경쟁력과 인지도를 끌어올리기 위해 만들어졌습니다. 실시간 트레이딩, 무대 위 경쟁, 그리고 밀도 있는 네트워킹을 통해 Perp-DEX의 다음 가능성을 직접 확인하세요.',
    date: 'Korea Blockchain Week 2026 · 서울, 대한민국',
  },
  'reboundx-in-wonderland': {
    eyebrow: '신호를 따라가라. 원더랜드로 들어가라.',
    copy: 'Korea Blockchain Week 2026을 위한 새로운 이벤트 월드를 만들고 있습니다. 원더랜드의 첫 신호를 곧 공개합니다.',
    date: 'Korea Blockchain Week 2026 · 서울, 대한민국',
  },
  'token2049-side-event': {
    eyebrow: '사이드 룸이 켜지고 있다.',
    copy: '다음 사이드 이벤트는 아직 구조체 안에 있습니다. 장소, 프로그램, 등록 정보를 곧 공개합니다.',
    date: 'TOKEN2049 · 싱가포르',
  },
};

const KO_SPEAKER_ROLES: Record<string, string> = {
  'CTO of Extended': 'Extended CTO',
  'CEO of Aster': 'Aster CEO',
  'APAC Growth Head of Variational': 'Variational APAC 그로스 총괄',
  'Product Head of Lighter': 'Lighter 프로덕트 총괄',
};

const KO_AGENDA_TITLES: Record<string, string> = {
  'Check in/Booth open': '체크인 / 부스 오픈',
  'Magon Pitch': 'Magon 피치',
  'The Alpha Talk (debate)': '알파 토크 (토론)',
  'Live trading competition winner betting': '트레이딩 대회 우승자 실시간 예측',
  'Trading Competition': '트레이딩 대회',
  Raffle: '경품 추첨',
  'VIP MAFIA NIGHT/ Networking': 'VIP 마피아 나이트 / 네트워킹',
};

export const localizeEvent = (lang: Lang, event: EventContent): EventContent =>
  lang === 'ko' ? { ...event, ...KO_EVENTS[event.key] } : event;

export const localizeRole = (lang: Lang, [name, role, image]: Speaker): Speaker =>
  lang === 'ko' ? [name, KO_SPEAKER_ROLES[role] ?? role, image] : [name, role, image];

export const localizeAgenda = (lang: Lang, [time, title, type]: AgendaItem): AgendaItem =>
  lang === 'ko' ? [time, KO_AGENDA_TITLES[title] ?? title, type] : [time, title, type];
