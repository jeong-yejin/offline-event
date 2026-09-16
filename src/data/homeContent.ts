export type Sponsor = readonly [name: string, file: string];

export type Speaker = readonly [name: string, role: string, image: string];

export type AgendaItem = readonly [time: string, title: string, type?: string];

export const SPONSORS: readonly Sponsor[] = [
  ['Variational', 'variational.svg'], ['Lighter', 'lighter.svg'], ['Aster', 'aster.svg'], ['Extended', 'extended.svg'],
  ['MetaMask', 'metamask.svg'],['gte', 'gte.svg']
];

export const SPEAKERS: readonly Speaker[] = [
  ['Justin', 'Product Head of Variational', '/assets/speakers/PerpDexDay/Variational-Justin.webp'],
  ['Nick', 'Product Head of Lighter', '/assets/speakers/PerpDexDay/Lighter-Nick.webp'],
  ['Arnold', 'CEO of Aster', '/assets/speakers/PerpDexDay/Aster-Arnold.webp'],
  ['Stefano', 'CTO of Extended', '/assets/speakers/PerpDexDay/Extended-Stefano.webp'],
];

export const AGENDA: readonly AgendaItem[] = [
  ['16:00', 'Check in/Booth open'],
  ['17:30 - 17:45', 'ReboundX Opening'],
  ['17:45 - 18:45', 'The Alpha Talk (debate)'],
  ['18:45 -', 'Meet the Traders & Winner Prediction Opens'],
  ['19:00 - 19:30', 'Live Trading Competition'],
  ['19:30', 'Prediction Closes & Winner Announcement'],
  ['20:00 -', 'Raffle'],
  ['20:30 -', 'Networking'],
];
