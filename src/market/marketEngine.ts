import { INITIAL_TRADER_BALANCE, SETTLEMENT_PRICE, VOTE_CANDIDATES, type VoteCandidateId } from '../data/voteContent';

/* Two competitions share this engine and they field different line-ups, so a market is keyed by
   its own id rather than by one event's candidate union. */
export type MarketId = string;
export type MarketTrader = { id: MarketId; trader: string; exchange: string; logo: string; color: string };

export type Side = 'yes' | 'no';
export type Direction = 'buy' | 'sell';
export type PriceMap = Record<MarketId, number>;
export type BalanceMap = Record<MarketId, number>;
export type OpenQty = { yes: number; no: number };
export type OpenMap = Record<MarketId, OpenQty>;
export type Snapshot = { time: number; balances: BalanceMap; prices: PriceMap };
export type Holding = { id: MarketId; side: Side; qty: number; cost: number };
export type Fill = { id: MarketId; side: Side; direction: Direction; qty: number; price: number; time: number; mine: boolean };
export type DataStatus = 'live' | 'delayed' | 'stale';

export const TOTAL_PRICE = 100;
export const BALANCE_DRIFT = 0.014;

/* Momentum reads the last 3 minutes of margin balance. At the PRD's worked example, +8% over
   the window lands on +3 points, which is what this weight reproduces. */
export const MOMENTUM_WINDOW_MS = 180000;
export const MOMENTUM_WEIGHT = 37.5;
export const MOMENTUM_MAX = 5;

/* Demand reads open position quantity, not cumulative buys. Virtual liquidity keeps the first
   few contracts of an empty book from swinging a price on their own. */
export const VIRTUAL_LIQUIDITY = 100;
export const DEMAND_WEIGHT = 10;
export const DEMAND_MAX = 10;

/* RFQ quotes a mid, then prices the two directions either side of it. */
export const RFQ_SPREAD = 1;

/* Feed age thresholds. A trader older than the stale bound stops accepting new quotes. */
export const DELAYED_AFTER_MS = 5000;
export const STALE_AFTER_MS = 15000;

const SEED_POINTS = 180;
const SEED_INTERVAL = 120000;
const SEED_VALUE = 20260906;
const SEED_OPEN_MAX = 900;

export const CANDIDATE_IDS: readonly VoteCandidateId[] = VOTE_CANDIDATES.map((candidate) => candidate.id);

const mapIds = <T,>(transform: (id: VoteCandidateId) => T): Record<VoteCandidateId, T> =>
  CANDIDATE_IDS.reduce((next, id) => ({ ...next, [id]: transform(id) }), {} as Record<VoteCandidateId, T>);

const sumOf = (values: PriceMap) => CANDIDATE_IDS.reduce((total, id) => total + values[id], 0);
const clamp = (value: number, bound: number) => Math.max(-bound, Math.min(bound, value));

export const OPEN_BALANCES: BalanceMap = mapIds(() => INITIAL_TRADER_BALANCE);
export const OPEN_INTEREST: OpenMap = mapIds(() => ({ yes: 0, no: 0 }));

export function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
}

/* Every trader's share of the total margin balance on the floor. This is the centre of the price;
   momentum and demand only nudge it. */
export const balanceComponent = (balances: BalanceMap): PriceMap => {
  const total = sumOf(balances);
  return mapIds((id) => (total > 0 ? (balances[id] / total) * TOTAL_PRICE : 0));
};

export const momentumOf = (current: number, past: number) => (past > 0 ? (current - past) / past : 0);

export const momentumAdjustment = (momentum: number) => clamp(momentum * MOMENTUM_WEIGHT, MOMENTUM_MAX);

export const demandImbalance = ({ yes, no }: OpenQty) => (yes - no) / (yes + no + VIRTUAL_LIQUIDITY);

export const demandAdjustment = (imbalance: number) => clamp(imbalance * DEMAND_WEIGHT, DEMAND_MAX);

/* The four YES prices have to add up to 100, so the raw prices are rescaled, not clipped. */
export const normalize = (raw: PriceMap): PriceMap => {
  const floored = mapIds((id) => Math.max(0, raw[id]));
  const total = sumOf(floored);
  return total > 0 ? mapIds((id) => (floored[id] / total) * TOTAL_PRICE) : mapIds(() => TOTAL_PRICE / CANDIDATE_IDS.length);
};

/* Margin balance -> balance base price -> momentum -> demand -> normalize -> YES mid price. */
export function midPrices(balances: BalanceMap, past: BalanceMap, open: OpenMap): PriceMap {
  const base = balanceComponent(balances);
  return normalize(mapIds((id) => base[id] + momentumAdjustment(momentumOf(balances[id], past[id])) + demandAdjustment(demandImbalance(open[id]))));
}

export const OPEN_PRICES: PriceMap = midPrices(OPEN_BALANCES, OPEN_BALANCES, OPEN_INTEREST);

export const chanceOf = (prices: PriceMap, id: MarketId) => Math.round(prices[id]);

/* NO is the other half of the same binary market. */
export const midOf = (prices: PriceMap, id: MarketId, side: Side) =>
  side === 'yes' ? chanceOf(prices, id) : TOTAL_PRICE - chanceOf(prices, id);

export const rfqPrice = (mid: number, direction: Direction) =>
  direction === 'buy' ? Math.min(TOTAL_PRICE - 1, mid + RFQ_SPREAD) : Math.max(1, mid - RFQ_SPREAD);

export const quote = (prices: PriceMap, id: MarketId, side: Side, direction: Direction) =>
  rfqPrice(midOf(prices, id, side), direction);

export const dataStatusOf = (updatedAt: number, now: number): DataStatus => {
  const age = now - updatedAt;
  if (age >= STALE_AFTER_MS) return 'stale';
  if (age >= DELAYED_AFTER_MS) return 'delayed';
  return 'live';
};

export const rankOf = (balances: BalanceMap, id: VoteCandidateId) =>
  CANDIDATE_IDS.filter((other) => balances[other] > balances[id]).length + 1;

export const returnOf = (balance: number) => ((balance - INITIAL_TRADER_BALANCE) / INITIAL_TRADER_BALANCE) * 100;

export function stepBalances(balances: BalanceMap, random: () => number): BalanceMap {
  return mapIds((id) => Math.max(0, balances[id] * (1 + (random() * 2 - 1) * BALANCE_DRIFT)));
}

export const findHolding = (holdings: readonly Holding[], id: MarketId, side: Side) =>
  holdings.find((holding) => holding.id === id && holding.side === side);

export function addFill(holdings: readonly Holding[], id: MarketId, side: Side, qty: number, price: number): Holding[] {
  const held = findHolding(holdings, id, side);
  if (!held) return [...holdings, { id, side, qty, cost: qty * price }];
  return holdings.map((holding) => (holding === held ? { ...holding, qty: holding.qty + qty, cost: holding.cost + qty * price } : holding));
}

export const removeFill = (holdings: readonly Holding[], id: MarketId, side: Side, qty: number): Holding[] =>
  holdings.flatMap((holding) => {
    if (holding.id !== id || holding.side !== side) return [holding];
    const left = holding.qty - qty;
    return left > 0 ? [{ ...holding, qty: left, cost: (holding.cost / holding.qty) * left }] : [];
  });

export const applyOpen = (open: OpenMap, id: MarketId, side: Side, delta: number): OpenMap =>
  mapIds((other) => (other === id ? { ...open[other], [side]: Math.max(0, open[other][side] + delta) } : open[other]));

export const averageEntry = (holding: Holding) => holding.cost / holding.qty;

/* A position is worth what it can be sold for right now. */
export const holdingValue = (holding: Holding, prices: PriceMap) => holding.qty * quote(prices, holding.id, holding.side, 'sell');

export const totalAsset = (point: number, holdings: readonly Holding[], prices: PriceMap) =>
  holdings.reduce((total, holding) => total + holdingValue(holding, prices), point);

/* Highest final margin balance wins. Two traders can tie, so this returns every winner. */
export function winnersOf(balances: BalanceMap): VoteCandidateId[] {
  const best = CANDIDATE_IDS.reduce((top, id) => Math.max(top, balances[id]), 0);
  return CANDIDATE_IDS.filter((id) => balances[id] === best);
}

/* One winner pays YES 100. N co-winners split it, so each YES settles at 100/N and its NO takes
   the rest. Everyone else settles YES 0 / NO 100. */
export const settlementPrice = (winners: readonly MarketId[], id: MarketId, side: Side) => {
  const yes = winners.includes(id) ? SETTLEMENT_PRICE / winners.length : 0;
  return side === 'yes' ? yes : SETTLEMENT_PRICE - yes;
};

export const settlementPayout = (holdings: readonly Holding[], winners: readonly MarketId[]) =>
  holdings.reduce((payout, holding) => payout + holding.qty * settlementPrice(winners, holding.id, holding.side), 0);

export function seedHistory(now: number): Snapshot[] {
  const random = createRandom(SEED_VALUE);
  const open = mapIds(() => ({ yes: Math.floor(random() * SEED_OPEN_MAX), no: Math.floor(random() * SEED_OPEN_MAX) }));
  return Array.from({ length: SEED_POINTS }).reduce<Snapshot[]>((points, _step, index) => {
    const previous = points.length ? points[points.length - 1].balances : OPEN_BALANCES;
    const window = points.find((point) => now - (SEED_POINTS - index) * SEED_INTERVAL - point.time <= MOMENTUM_WINDOW_MS);
    const balances = stepBalances(previous, random);
    return [...points, { time: now - (SEED_POINTS - index) * SEED_INTERVAL, balances, prices: midPrices(balances, window ? window.balances : OPEN_BALANCES, open) }];
  }, []);
}

export const seedOpenInterest = (): OpenMap => {
  const random = createRandom(SEED_VALUE);
  return mapIds(() => ({ yes: Math.floor(random() * SEED_OPEN_MAX), no: Math.floor(random() * SEED_OPEN_MAX) }));
};

export function simulateFill(prices: PriceMap, random: () => number, time: number): Fill {
  const id = CANDIDATE_IDS[Math.floor(random() * CANDIDATE_IDS.length)];
  const side: Side = random() < 0.5 ? 'yes' : 'no';
  const direction: Direction = random() < 0.68 ? 'buy' : 'sell';
  return { id, side, direction, qty: 1 + Math.floor(random() * 24), price: quote(prices, id, side, direction), time, mine: false };
}
