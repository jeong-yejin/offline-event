import type { AgendaItem, Speaker } from '../data/homeContent';
import type { EventContent, EventKey } from '../data/eventContent';
import type { EventFact } from '../data/token2049Content';
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
    eyebrow: '아레나가 싱가포르로 간다.',
    copy: 'PerpDEX Day는 서울에서 시작된 라이브 트레이딩 대회입니다. 2026년 10월 5일, TOKEN2049 위크 기간에 Zouk에서 열립니다. 17시 부스 미션부터 알파 토크, 관객 배팅, 그리고 1,000명이 넘는 관중 앞에서 온체인으로 정산되는 트레이딩 토너먼트까지 이어집니다.',
    date: 'TOKEN2049 싱가포르 · 2026년 10월 5일',
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
  'Doors open / Booth missions begin': '입장 시작 / 부스 미션 오픈',
  'The Alpha Talk': '알파 토크',
  'Audience Betting for Winner': '우승자 관객 배팅',
  'Live Trading Tournament': '라이브 트레이딩 토너먼트',
  'Raffle & awards': '경품 추첨 & 시상',
  'Nightlife transition — Zouk main floor': '애프터파티 — Zouk 메인 플로어',
};

const KO_FACT_LABELS: Record<string, string> = {
  Date: '일정',
  Venue: '장소',
  Crowd: '참가 규모',
  Hosts: '주최',
};

export const localizeEvent = (lang: Lang, event: EventContent): EventContent =>
  lang === 'ko' ? { ...event, ...KO_EVENTS[event.key] } : event;

export const localizeRole = (lang: Lang, [name, role, image]: Speaker): Speaker =>
  lang === 'ko' ? [name, KO_SPEAKER_ROLES[role] ?? role, image] : [name, role, image];

export const localizeAgenda = (lang: Lang, [time, title, type]: AgendaItem): AgendaItem =>
  lang === 'ko' ? [time, KO_AGENDA_TITLES[title] ?? title, type] : [time, title, type];

export const localizeFact = (lang: Lang, [label, value]: EventFact): EventFact =>
  lang === 'ko' ? [KO_FACT_LABELS[label] ?? label, value] : [label, value];

