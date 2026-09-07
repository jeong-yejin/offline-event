export type EventKey = 'perp-dex-day' | 'reboundx-in-wonderland' | 'token2049-side-event';

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
    eyebrow: 'Wake up. The arena is calling.',
    title: 'PERP-DEX DAY',
    copy: 'PERP-DEX DAY is a side event during Korea Blockchain Week 2026, built to strengthen the competitive edge and brand awareness of Perpetual DEXs. Experience live trading, competition on stage, and meaningful networking—and discover the next possibilities of Perp-DEX, firsthand.',
    date: 'Korea Blockchain Week 2026 · Seoul, Korea',
  },
  {
    key: 'reboundx-in-wonderland',
    label: 'REBOUNDX IN WONDERLAND',
    eyebrow: 'Follow the signal. Enter Wonderland.',
    title: 'REBOUNDX IN WONDERLAND',
    copy: 'A new event world is being assembled for Korea Blockchain Week 2026. Check back soon for the first signal from Wonderland.',
    date: 'Korea Blockchain Week 2026 · Seoul, Korea',
  },
  {
    key: 'token2049-side-event',
    label: 'TOKEN2049 SIDE EVENT',
    eyebrow: 'The side room is powering up.',
    title: 'TOKEN2049 SIDE EVENT',
    copy: 'The next side event is still in the construct. Check back soon for venue, program, and registration details.',
    date: 'TOKEN2049 · Singapore',
  },
];
