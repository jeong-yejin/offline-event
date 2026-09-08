import { STARTING_POINT } from '../data/voteContent';
import { CANDIDATE_IDS, OPEN_PRICES, createRandom, quote, totalAsset, type Holding, type PriceMap, type Side } from './marketEngine';

export type Operator = { name: string; point: number; holdings: readonly Holding[] };
export type Rank = { name: string; place: number; asset: number; pnl: number; percent: number; you: boolean };

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
export function createOperators(): Operator[] {
  const random = createRandom(OPERATOR_SEED);
  return Array.from({ length: OPERATOR_COUNT }, (_row, index) => {
    const id = CANDIDATE_IDS[Math.floor(random() * CANDIDATE_IDS.length)];
    const side: Side = random() < 0.72 ? 'yes' : 'no';
    const price = quote(OPEN_PRICES, id, side, 'buy');
    const qty = Math.max(1, Math.min(Math.floor(STARTING_POINT / price), 1 + Math.floor(random() * 4)));
    return { name: handleAt(index), point: STARTING_POINT - qty * price, holdings: [{ id, side, qty, cost: qty * price }] };
  });
}

export const assetOf = (operator: Operator, prices: PriceMap) => totalAsset(operator.point, operator.holdings, prices);

/* Everyone opened on the same 100 points, so profit and return read straight off total asset. */
export function rankTraders(operators: readonly Operator[], prices: PriceMap, you: Operator): Rank[] {
  const score = (operator: Operator, mine: boolean) => {
    const asset = assetOf(operator, prices);
    return { name: operator.name, asset, pnl: asset - STARTING_POINT, percent: ((asset - STARTING_POINT) / STARTING_POINT) * 100, you: mine };
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
