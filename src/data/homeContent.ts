export type Sponsor = readonly [name: string, file: string];

export type Speaker = readonly [name: string, role: string, image: string];

export type AgendaItem = readonly [time: string, title: string, type?: string];

export const SPONSORS: readonly Sponsor[] = [
  ['Variational', 'variational.svg'], ['Lighter', 'lighter.svg'], ['Aster', 'aster.svg'], ['Extended', 'extended.svg'],
  ['MetaMask', 'metamask.svg'],
];

export const SPEAKERS: readonly Speaker[] = [
  ['Justin', 'Product Head of Variational', '/assets/speakers/PerpDexDay/Variational-Justin.webp'],
  ['Nick', 'Product Head of Lighter', '/assets/speakers/PerpDexDay/Lighter-Nick.webp'],
  ['Arnold', 'CEO of Aster', '/assets/speakers/PerpDexDay/Aster-Arnold.webp'],
  ['Stefano', 'CTO of Extended', '/assets/speakers/PerpDexDay/Extended-Stefano.webp'],
];

export const AGENDA: readonly AgendaItem[] = [
  ['16:00', 'Check in/Booth open'],
  ['17:30 - 17:45', 'ReboundX Pitch'],
  ['17:45 - 18:45', 'The Alpha Talk (debate)'],
  ['18:45 - 18:55', 'Live trading competition winner prediction betting'],
  ['19:00 - 19:30', 'Trading Competition'],
  ['19:45 - 20:00', 'Raffle'],
  ['20:00 -', 'Networking'],
];
