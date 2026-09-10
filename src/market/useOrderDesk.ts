import { useState } from 'react';
import type { Direction, MarketId, PriceMap, Side } from './engine';
import { createQuote, type OrderQuote } from './quote';

type OrderDeskOptions = {
  /* The market the ticket points at before the reader picks one. */
  initialId: MarketId;
  prices: PriceMap;
  fill(quote: OrderQuote): void;
  /* The line the desk prints after a fill. The board's copy and its line-up stay outside the desk,
     so the same desk drives a competition in any language over any roster. */
  describeFill(quote: OrderQuote): string;
};

/* The order desk both competitions trade through: which market the ticket points at, which way it
   is pointed, the one quote outstanding, and the last thing the desk said. */
export function useOrderDesk({ initialId, prices, fill, describeFill }: OrderDeskOptions) {
  const [focusId, setFocusId] = useState<MarketId>(initialId);
  const [side, setSide] = useState<Side>('yes');
  const [direction, setDirection] = useState<Direction>('buy');
  const [pending, setPending] = useState<OrderQuote | null>(null);
  const [notice, setNotice] = useState('');

  /* One quote at a time. A new request replaces the last, which is what an RFQ desk does. */
  function askQuote(id: MarketId, positionSide: Side, orderSide: Direction, quantity: number) {
    setFocusId(id);
    setSide(positionSide);
    setDirection(orderSide);
    setPending(createQuote(prices, id, positionSide, orderSide, quantity, Date.now()));
    setNotice('');
  }

  function cancel() {
    setPending(null);
  }

  function confirm() {
    if (!pending) return;
    fill(pending);
    setNotice(describeFill(pending));
    setPending(null);
  }

  /* Re-pointing the ticket voids the outstanding quote. That price was for the old order. */
  function chooseSide(next: Side) {
    setSide(next);
    setPending(null);
  }

  function chooseDirection(next: Direction) {
    setDirection(next);
    setPending(null);
  }

  function pick(id: MarketId, nextSide: Side) {
    setFocusId(id);
    chooseSide(nextSide);
  }

  /* Picking a seat off the board leaves the side and the direction alone: the reader chose who to
     trade, not which way. The outstanding quote still goes, because that price was for another seat. */
  function focusSeat(id: MarketId) {
    setFocusId(id);
    setPending(null);
  }

  return { focusId, side, direction, pending, notice, askQuote, cancel, confirm, pick, focusSeat, chooseSide, chooseDirection };
}
