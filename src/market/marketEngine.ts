import { CONTRACT_PAYOUT, VOTE_CANDIDATES, type VoteCandidateId } from '../data/voteContent';

export type Side = 'yes' | 'no';
export type Direction = 'buy' | 'sell';
export type PriceMap = Record<VoteCandidateId, number>;
export type PricePoint = { time: number; prices: PriceMap };
export type Holding = { id: VoteCandidateId; side: Side; qty: number; cost: number };
export type Fill = { id: VoteCandidateId; side: Side; direction: Direction; qty: number; price: number; time: number; mine: boolean };

const PRICE_FLOOR = 2;
const PRICE_CEILING = 96;
const TOTAL_PRICE = 100;
const VOLATILITY = 0.9;
const REBALANCE_PULL = 0.35;
const TRADE_IMPACT = 0.0012;
const SEED_POINTS = 180;
const SEED_INTERVAL = 120000;
const SEED_VALUE = 20260906;

export const CANDIDATE_IDS: readonly VoteCandidateId[] = VOTE_CANDIDATES.map((candidate) => candidate.id);

export const OPEN_PRICES: PriceMap = VOTE_CANDIDATES.reduce((prices, candidate) => ({ ...prices, [candidate.id]: candidate.openPrice }), {} as PriceMap);

const clampPrice = (price: number) => Math.min(PRICE_CEILING, Math.max(PRICE_FLOOR, price));

const mapPrices = (prices: PriceMap, transform: (price: number, id: VoteCandidateId) => number): PriceMap =>
  CANDIDATE_IDS.reduce((next, id) => ({ ...next, [id]: transform(prices[id], id) }), {} as PriceMap);

const totalPrice = (prices: PriceMap) => CANDIDATE_IDS.reduce((total, id) => total + prices[id], 0);

function rebalance(prices: PriceMap): PriceMap {
  const pull = 1 + (TOTAL_PRICE / totalPrice(prices) - 1) * REBALANCE_PULL;
  return mapPrices(prices, (price) => clampPrice(price * pull));
}

export function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export const stepPrices = (prices: PriceMap, random: () => number): PriceMap =>
  rebalance(mapPrices(prices, (price) => price + (random() * 2 - 1) * VOLATILITY));

export function applyImpact(prices: PriceMap, id: VoteCandidateId, side: Side, direction: Direction, qty: number): PriceMap {
  const pressure = qty * TRADE_IMPACT * (side === 'yes' ? 1 : -1) * (direction === 'buy' ? 1 : -1);
  return rebalance(mapPrices(prices, (price, priceId) => (priceId === id ? price * (1 + pressure) : price)));
}

export const chanceOf = (prices: PriceMap, id: VoteCandidateId) => Math.round(prices[id]);

export const quote = (prices: PriceMap, id: VoteCandidateId, side: Side) =>
  side === 'yes' ? chanceOf(prices, id) : TOTAL_PRICE - chanceOf(prices, id);

export const findHolding = (holdings: readonly Holding[], id: VoteCandidateId, side: Side) =>
  holdings.find((holding) => holding.id === id && holding.side === side);

export function addFill(holdings: readonly Holding[], id: VoteCandidateId, side: Side, qty: number, price: number): Holding[] {
  const held = findHolding(holdings, id, side);
  if (!held) return [...holdings, { id, side, qty, cost: qty * price }];
  return holdings.map((holding) => (holding === held ? { ...holding, qty: holding.qty + qty, cost: holding.cost + qty * price } : holding));
}

export const removeFill = (holdings: readonly Holding[], id: VoteCandidateId, side: Side, qty: number): Holding[] =>
  holdings.flatMap((holding) => {
    if (holding.id !== id || holding.side !== side) return [holding];
    const left = holding.qty - qty;
    return left > 0 ? [{ ...holding, qty: left, cost: (holding.cost / holding.qty) * left }] : [];
  });

export const winnerOf = (prices: PriceMap): VoteCandidateId =>
  CANDIDATE_IDS.reduce((best, id) => (prices[id] > prices[best] ? id : best));

export const isWinningHolding = (holding: Holding, winner: VoteCandidateId) =>
  holding.side === 'yes' ? holding.id === winner : holding.id !== winner;

export const settlementPayout = (holdings: readonly Holding[], winner: VoteCandidateId) =>
  holdings.reduce((payout, holding) => payout + (isWinningHolding(holding, winner) ? holding.qty * CONTRACT_PAYOUT : 0), 0);

export const holdingValue = (holding: Holding, prices: PriceMap) => holding.qty * quote(prices, holding.id, holding.side);

export function seedHistory(now: number): PricePoint[] {
  const random = createRandom(SEED_VALUE);
  return Array.from({ length: SEED_POINTS }).reduce<PricePoint[]>((points, _step, index) => {
    const previous = points.length ? points[points.length - 1].prices : OPEN_PRICES;
    return [...points, { time: now - (SEED_POINTS - index) * SEED_INTERVAL, prices: stepPrices(previous, random) }];
  }, []);
}

export function simulateFill(prices: PriceMap, random: () => number, time: number): Fill {
  const id = CANDIDATE_IDS[Math.floor(random() * CANDIDATE_IDS.length)];
  const side: Side = random() < 0.5 ? 'yes' : 'no';
  return { id, side, direction: 'buy', qty: 5 + Math.floor(random() * 140), price: quote(prices, id, side), time, mine: false };
}
