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
   is pointed, the one quote outstanding, the last thing the desk said, and whether a phone shows the
   whole ticket. */
export function useOrderDesk({ initialId, prices, fill, describeFill }: OrderDeskOptions) {
  const [focusId, setFocusId] = useState<MarketId>(initialId);
  const [side, setSide] = useState<Side>('yes');
  const [direction, setDirection] = useState<Direction>('buy');
  const [pending, setPending] = useState<OrderQuote | null>(null);
  const [notice, setNotice] = useState('');
  /* The order that just went through. The ticket shows it in place of the submit until the reader
     moves on: a new quote, another side, direction or seat, or folding the sheet away. */
  const [filled, setFilled] = useState<OrderQuote | null>(null);
  /* A phone docks the ticket to the bottom edge, collapsed to the seat and its two prices. Picking a
     side or asking for a quote anywhere on the page expands it, because that tap starts an order. */
  const [ticketExpanded, setExpanded] = useState(false);

  /* Folding the sheet away is moving on, so the receipt goes with it. */
  function setTicketExpanded(next: boolean) {
    setExpanded(next);
    if (!next) setFilled(null);
  }

  /* One quote at a time. A new request replaces the last, which is what an RFQ desk does. */
  function askQuote(id: MarketId, positionSide: Side, orderSide: Direction, quantity: number) {
    setFocusId(id);
    setSide(positionSide);
    setDirection(orderSide);
    setPending(createQuote(prices, id, positionSide, orderSide, quantity, Date.now()));
    setNotice('');
    setFilled(null);
    setTicketExpanded(true);
  }

  function cancel() {
    setPending(null);
  }

  function confirm() {
    if (!pending) return;
    fill(pending);
    setNotice(describeFill(pending));
    setFilled(pending);
    setPending(null);
  }

  /* Re-pointing the ticket voids the outstanding quote. That price was for the old order. */
  function chooseSide(next: Side) {
    setSide(next);
    setPending(null);
    setFilled(null);
    setTicketExpanded(true);
  }

  function chooseDirection(next: Direction) {
    setDirection(next);
    setPending(null);
    setFilled(null);
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
    setFilled(null);
  }

  return { focusId, side, direction, pending, filled, notice, ticketExpanded, askQuote, cancel, confirm, pick, focusSeat, chooseSide, chooseDirection, setTicketExpanded };
}
