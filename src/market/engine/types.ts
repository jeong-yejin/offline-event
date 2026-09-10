/* Two competitions share this kernel and they field different line-ups, so a market is keyed by its
   own id rather than by one event's trader union. */
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

/* Health of one market's price feed, not the standing of the trader behind it. */
export type DataStatus = 'live' | 'delayed' | 'stale';

/* A seat's standing in the competition. Only a knockout format ever leaves 'active', but the shared
   trader table renders the badge for both, so the union lives beside DataStatus rather than inside
   one event's module. */
export type TraderState = 'active' | 'eliminated' | 'finalist' | 'winner';
