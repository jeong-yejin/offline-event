export type EventKey = 'perp-dex-day' | 'reboundx-in-wonderland' | 'perps-day';

export type EventContent = {
  key: EventKey;
  label: string;
  eyebrow: string;
  title: string;
  copy: string;
  date: string;
};

export const EVENTS: readonly EventContent[] = [
  {
    key: 'perp-dex-day',
    label: 'PERP-DEX DAY',
    eyebrow: 'Wake up, Rebounder',
    title: 'PERP-DEX DAY',
    copy: 'PERP-DEX DAY is a side event during Korea Blockchain Week 2026, built to strengthen the competitive edge and brand awareness of Perpetual DEXs. Experience live trading, competition on stage, and meaningful networking—and discover the next possibilities of Perp-DEX, firsthand.',
    date: 'Korea Blockchain Week 2026 · 28 September 2026',
  },
  {
    key: 'reboundx-in-wonderland',
    label: 'REBOUNDX IN WONDERLAND',
    eyebrow: 'Follow the White Rabbit into Wonderland',
    title: 'REBOUNDX IN WONDERLAND',
    copy: 'Take on the missions scattered across Wonderland and see how much smarter and simpler trading together can be.',
    date: 'Korea Blockchain Week 2026 · 29 September 2026',
  },
  {
    key: 'perps-day',
    label: 'TOKEN2049 SIDE EVENT',
    eyebrow: 'ASIA TRADING COMPETITION',
    title: 'PERPS DAY',
    copy: 'Predict and trade on which of the eight traders will take the win.',
    date: 'TOKEN2049 Singapore · 05 October 2026',
  },
];
