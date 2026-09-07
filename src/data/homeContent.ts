export type Sponsor = readonly [name: string, file: string];

export type Speaker = readonly [name: string, role: string, image: string];

export type AgendaItem = readonly [time: string, title: string, type?: string];

/* Stand-in portrait: replace per speaker once real photos land in /public/assets/speakers/. */
export const SPEAKER_PLACEHOLDER = '/assets/d3c2e53a-76d3-4193-b449-5db294dc9904.png';

export const SPONSORS: readonly Sponsor[] = [
  ['Variational', 'variational.svg'], ['Lighter', 'lighter.svg'], ['Aster', 'aster.svg'], ['Extended', 'extended.svg'],
  ['MetaMask', 'metamask.svg'],
];

export const SPEAKERS: readonly Speaker[] = [
  ['Hansolar', 'APAC Growth Head of Variational', '/assets/speakers/speaker_variational-hansolar.webp'],
  ['Nick', 'Product Head of Lighter', SPEAKER_PLACEHOLDER],
  ['Arnold', 'CEO of Aster', '/assets/speakers/speaker_Aster-Arnold.webp'],
  ['Stefano', 'CTO of Extended', '/assets/speakers/speaker_Extended-Stefano.webp'],
];

export const AGENDA: readonly AgendaItem[] = [
  ['16:00', 'Check in/Booth open'],
  ['17:30 - 17:45', 'Magon Pitch'],
  ['17:45 - 18:45', 'The Alpha Talk (debate)'],
  ['18:45 - 18:55', 'Live trading competition winner betting'],
  ['19:00 - 19:30', 'Trading Competition'],
  ['19:45 - 20:00', 'Raffle'],
  ['20:00 -', 'VIP MAFIA NIGHT/ Networking'],
];
