import { createRandom, quote, totalAsset, type Holding, type MarketId, type PriceMap, type Side } from './engine';

export type Operator = { name: string; point: number; holdings: readonly Holding[] };
export type Rank = { name: string; place: number; asset: number; pnl: number; percent: number; you: boolean };
/* Two competitions field different line-ups. An operator opened against the wrong id prices at
   undefined, which is how a whole leaderboard turns into NaN. */
export type Field = { ids: readonly MarketId[]; openPrices: PriceMap; startingPoint: number };

/* Crew call signs. The player is the anomaly, so no operator is named Neo. */
const OPERATOR_NAMES = [
  'MORPHEUS', 'TRINITY', 'SMITH', 'CYPHER', 'NIOBE', 'SERAPH', 'GHOST', 'SWITCH', 'APOC', 'TANK',
  'MOUSE', 'DOZER', 'LOCK', 'BANE', 'KID', 'SPARKS', 'ROLAND', 'AXEL', 'COLT', 'MAGGIE',
  'ZEE', 'LINK', 'VECTOR', 'BINARY',
] as const;
const OPERATOR_SEED = 19990331;
/* Rewards run to rank 50, so the field has to be deep enough for that rank to exist. */
export const OPERATOR_COUNT = 57;
export const LEADERBOARD_LIMIT = 10;

const handleAt = (index: number) => {
  const base = OPERATOR_NAMES[index % OPERATOR_NAMES.length];
  const deck = Math.floor(index / OPERATOR_NAMES.length);
  return deck ? `${base}_${String(deck * 7 + (index % 9) + 1).padStart(2, '0')}` : base;
};

/* Each operator opens one conviction at the opening price, sized to what 100 points buys. */
export function createOperators(field: Field): Operator[] {
  const random = createRandom(OPERATOR_SEED);
  return Array.from({ length: OPERATOR_COUNT }, (_row, index) => {
    const id = field.ids[Math.floor(random() * field.ids.length)];
    const side: Side = random() < 0.72 ? 'yes' : 'no';
    const price = quote(field.openPrices, id, side, 'buy');
    const qty = Math.max(1, Math.min(Math.floor(field.startingPoint / price), 1 + Math.floor(random() * 4)));
    return { name: handleAt(index), point: field.startingPoint - qty * price, holdings: [{ id, side, qty, cost: qty * price }] };
  });
}

export const assetOf = (operator: Operator, prices: PriceMap) => totalAsset(operator.point, operator.holdings, prices);

/* Everyone opened on the same 100 points, so profit and return read straight off total asset. */
export function rankTraders(operators: readonly Operator[], prices: PriceMap, you: Operator, startingPoint: number): Rank[] {
  const score = (operator: Operator, mine: boolean) => {
    const asset = assetOf(operator, prices);
    return { name: operator.name, asset, pnl: asset - startingPoint, percent: ((asset - startingPoint) / startingPoint) * 100, you: mine };
  };
  return [...operators.map((operator) => score(operator, false)), score(you, true)]
    .sort((a, b) => b.asset - a.asset)
    .map((row, index) => ({ ...row, place: index + 1 }));
}

export const myPlace = (ranks: readonly Rank[]) => ranks.find((rank) => rank.you)?.place ?? ranks.length;

/* Keep the player on screen even when they are last. */
export const visibleRanks = (ranks: readonly Rank[], limit = LEADERBOARD_LIMIT): Rank[] => {
  const top = ranks.slice(0, limit);
  return top.some((rank) => rank.you) ? top : [...top, ...ranks.filter((rank) => rank.you)];
};
