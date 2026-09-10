import { quote as priceOf, type Direction, type MarketId, type PriceMap, type Side } from './engine';

/* An RFQ quote is a firm price with a short life. Past it the trader has to ask again. */
export const QUOTE_TTL_MS = 4000;

export type OrderQuote = {
  quoteId: string;
  idempotencyKey: string;
  marketId: MarketId;
  positionSide: Side;
  orderSide: Direction;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  expiresAt: number;
};

let counter = 0;

const nextId = (prefix: string, time: number) => {
  counter += 1;
  return `${prefix}-${time.toString(36)}-${counter.toString(36)}`;
};

/* Quantity is a count of positions, so anything but a positive integer is rejected outright.
   0, -1, 0.5, letters and an empty box all fail here. */
export function parseQuantity(draft: string): number | null {
  const trimmed = draft.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return value >= 1 ? value : null;
}

export function createQuote(prices: PriceMap, marketId: MarketId, positionSide: Side, orderSide: Direction, quantity: number, time: number): OrderQuote {
  const unitPrice = priceOf(prices, marketId, positionSide, orderSide);
  return {
    quoteId: nextId('q', time),
    /* Sent with the fill so a double click, a retry, or a resend can only fill once. */
    idempotencyKey: nextId('idem', time),
    marketId,
    positionSide,
    orderSide,
    quantity,
    unitPrice,
    totalPrice: unitPrice * quantity,
    expiresAt: time + QUOTE_TTL_MS,
  };
}

export const isExpired = (quote: OrderQuote, now: number) => now >= quote.expiresAt;

export const quoteSecondsLeft = (quote: OrderQuote, now: number) => Math.max(0, Math.ceil((quote.expiresAt - now) / 1000));
