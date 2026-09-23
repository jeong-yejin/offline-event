import { useEffect, useState } from 'react';
import type { Strings } from '../i18n/strings/market';
import { formatPoint } from '../market/format';
import { chanceOf, findHolding, quote as priceOf, type DataStatus, type Direction, type Holding, type MarketTrader, type PriceMap, type Side } from '../market/engine';
import { parseQuantity, quoteSecondsLeft, type OrderQuote } from '../market/quote';

const SIDES: readonly Side[] = ['yes', 'no'];
/* A 100 point balance spans a wide range of sizes because unit prices move: a 26 point favourite
   affords 3, a 2 point long shot affords 50. The spread covers both ends rather than the open alone. */
const PRESETS: readonly number[] = [1, 5, 10, 30];
const DIRECTIONS: readonly Direction[] = ['buy', 'sell'];

type OrderTicketProps = {
  t: Strings;
  candidate: MarketTrader;
  prices: PriceMap;
  side: Side;
  direction: Direction;
  point: number;
  holdings: readonly Holding[];
  tradable: boolean;
  /* Why the ticket is shut. A market that reopens says so instead of reading as finished. */
  closedHint?: string;
  status: DataStatus;
  now: number;
  quote: OrderQuote | null;
  /* The order that just filled. Its receipt takes the submit's place until the reader moves on. A
     board that leaves it off keeps the submit and reports the fill in the notice line alone. */
  filled?: OrderQuote | null;
  notice: string;
  /* A phone docks the ticket to the bottom edge. Collapsed, it shows the seat and its two prices. */
  expanded: boolean;
  onSideChange(side: Side): void;
  onDirectionChange(direction: Direction): void;
  onRequestQuote(quantity: number, direction: Direction): void;
  onConfirm(): void;
  onCancel(): void;
  onExpandedChange(expanded: boolean): void;
};

export function OrderTicket({ t, candidate, prices, side, direction, point, holdings, tradable, closedHint, status, now, quote, filled, notice, expanded, onSideChange, onDirectionChange, onRequestQuote, onConfirm, onCancel, onExpandedChange }: OrderTicketProps) {
  const [draft, setDraft] = useState('1');
  const [error, setError] = useState('');

  useEffect(() => { setError(''); }, [candidate.id, side, direction]);

  const owned = findHolding(holdings, candidate.id, side)?.qty ?? 0;
  const unit = priceOf(prices, candidate.id, side, direction);
  const quantity = parseQuantity(draft);
  const expired = quote ? quoteSecondsLeft(quote, now) === 0 : false;
  const closed = !tradable;
  const stale = status === 'stale';
  const locked = closed || stale;
  /* What the balance actually buys at the price on screen. The ticket answers "how much can I order"
     up front instead of waiting for the quantity box to reject a number. A sale is capped by the
     position on the book, not by point. */
  const maxQuantity = direction === 'buy' ? Math.floor(point / unit) : owned;
  /* A quantity is counted in positions of one side, and a price in points. Every count on the ticket
     names its side, so "3" never reads as three points. */
  const unitOf = (option: Side) => t.sideName(option).toUpperCase();
  const held = holdings.filter((holding) => holding.id === candidate.id).map((holding) => `${holding.qty} ${unitOf(holding.side)}`);

  /* Quantity is a count of positions. Anything else never reaches a quote request. */
  function check(): number | null {
    if (quantity === null) {
      setError(t.errorQuantity);
      return null;
    }
    if (direction === 'sell' && quantity > owned) {
      setError(t.errorOwned(owned));
      return null;
    }
    if (direction === 'buy' && quantity * unit > point) {
      setError(t.errorPoint(formatPoint(point), maxQuantity));
      return null;
    }
    setError('');
    return quantity;
  }

  /* An unparseable box steps to 1 rather than to NaN, and the floor is one position, never zero. */
  function step(delta: number) {
    setDraft(String(Math.max(1, (quantity ?? 0) + delta)));
    setError('');
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (locked) return;
    const valid = check();
    if (valid === null) return;
    onRequestQuote(valid, direction);
  }

  return (
    <>
      {/* On a phone the open ticket is a sheet over a dimmed board, and a tap on the dim closes it.
          The toggle is the keyboard's way out, so the dim stays out of the tab order and the tree. */}
      {expanded ? <div aria-hidden="true" className="ticket-scrim" onClick={() => onExpandedChange(false)} /> : null}
      {/* --yes draws the seat's chance along the docked ticket's top edge (41-market-mobile.css). */}
      <form className="order-ticket" data-expanded={expanded ? 'true' : 'false'} onSubmit={submit} aria-label={t.ticketLabel} style={{ '--yes': `${chanceOf(prices, candidate.id)}%` } as React.CSSProperties}>
        <h3 className="ticket-title">{t.ticketLabel}</h3>

        {/* The logo already reads "Variational", so the exchange name only earns a line on the seats
            that have no logo, where it carries the seat number instead. */}
        <header className="ticket-head">
          {candidate.logo ? <img alt={candidate.exchange} className="ticket-logo" src={`/assets/sponsors/${candidate.logo}`} /> : null}
          {/* What the reader already holds on this seat, so a fill shows up where the next order starts.
              The key replays its entrance when the holding changes. */}
          <div><strong>{candidate.trader}</strong>{candidate.logo ? null : <span>{candidate.exchange}</span>}{held.length > 0 ? <span className="ticket-held" key={held.join()}><span>{t.ticketHeld}</span> {held.join(' · ')}</span> : null}</div>
          {/* Only the docked ticket on a phone shows this. The sidebar ticket is always whole. */}
          <button aria-expanded={expanded} aria-label={t.ticketLabel} className="ticket-toggle" onClick={() => onExpandedChange(!expanded)} type="button">
            <svg aria-hidden="true" fill="none" viewBox="0 0 16 16"><path d="M4 10 8 6l4 4" stroke="currentColor" strokeLinecap="square" strokeWidth="1.4" /></svg>
          </button>
        </header>

        <div className="ticket-directions" role="group" aria-label={t.directionGroup}>
          {DIRECTIONS.map((option) => <button aria-pressed={option === direction} data-active={option === direction ? 'true' : 'false'} disabled={Boolean(quote)} key={option} onClick={() => onDirectionChange(option)} type="button">{t.directionName(option)}</button>)}
        </div>

        <div className="ticket-sides" role="group" aria-label={t.sideGroup}>
          {SIDES.map((option) => <button aria-pressed={option === side} data-active={option === side ? 'true' : 'false'} data-side={option} disabled={Boolean(quote)} key={option} onClick={() => onSideChange(option)} type="button">
            <span>{t.sideName(option)}</span><strong>{priceOf(prices, candidate.id, option, direction)}<small> pt</small></strong>
          </button>)}
        </div>

        <label className="ticket-qty" htmlFor="order-quantity">{t.quantity}</label>
        <div className="ticket-input">
          <div className="ticket-stepper">
            <button aria-label={t.quantityDown} disabled={Boolean(quote) || quantity === 1} onClick={() => step(-1)} type="button">−</button>
            <span className="ticket-field">
              <input aria-describedby="ticket-notice" aria-invalid={error ? 'true' : 'false'} disabled={Boolean(quote)} id="order-quantity" inputMode="numeric" onChange={(event) => { setDraft(event.target.value); setError(''); }} type="text" value={draft} />
              <span aria-hidden="true" data-side={side}>{unitOf(side)}</span>
            </span>
            <button aria-label={t.quantityUp} disabled={Boolean(quote)} onClick={() => step(1)} type="button">+</button>
          </div>
          {/* Every preset stays pressable. A size the balance cannot cover is answered by the summary
              below and by the submit, which names the point short, rather than by a dead button. */}
          <div className="ticket-presets">
            {PRESETS.map((preset) => <button data-active={preset === quantity ? 'true' : 'false'} disabled={Boolean(quote)} key={preset} onClick={() => { setDraft(String(preset)); setError(''); }} type="button">{preset}</button>)}
            <button data-active={maxQuantity > 0 && maxQuantity === quantity ? 'true' : 'false'} disabled={Boolean(quote) || maxQuantity < 1} onClick={() => { setDraft(String(maxQuantity)); setError(''); }} type="button">{t.maxCta}</button>
          </div>
        </div>

        <dl className="ticket-summary">
          <div><dt>{t.unitPrice}</dt><dd>{unit} pt</dd></div>
          {/* The sum is spelled out, so the count and the point total cannot be read as each other. */}
          <div><dt>{direction === 'buy' ? t.requiredPoint : t.expectedPoint}</dt><dd>{quantity === null ? '—' : <><small>{quantity} {unitOf(side)} × {unit} pt =</small> {formatPoint(quantity * unit)} pt</>}</dd></div>
          <div><dt>{direction === 'buy' ? t.availablePoint : t.ownedQuantity}</dt><dd>{direction === 'buy' ? `${formatPoint(point)} pt` : `${owned} ${unitOf(side)}`}</dd></div>
          <div><dt>{t.orderableQuantity}</dt><dd>{maxQuantity} {unitOf(side)} · {formatPoint(maxQuantity * unit)} pt</dd></div>
        </dl>

        {quote
          ? <div className="ticket-quote" data-expired={expired ? 'true' : 'false'} role="status">
              <p className="quote-id">{t.quoteId} <code>{quote.quoteId}</code></p>
              <dl>
                <div><dt>{t.unitPrice}</dt><dd>{quote.unitPrice} pt</dd></div>
                <div><dt>{t.quantity}</dt><dd>{quote.quantity} {unitOf(quote.positionSide)}</dd></div>
                <div><dt>{t.totalPrice}</dt><dd>{formatPoint(quote.totalPrice)} pt</dd></div>
              </dl>
              <p className="quote-life">{expired ? t.quoteExpired : t.quoteLife(quoteSecondsLeft(quote, now))}</p>
              <div className="quote-actions">
                <button className="ticket-submit" data-side={quote.positionSide} disabled={expired} onClick={onConfirm} type="button">{t.confirmOrder(quote.orderSide)}</button>
                <button className="quote-cancel" onClick={onCancel} type="button">{expired ? t.requoteCta : t.cancelQuote}</button>
              </div>
            </div>
          /* The fill takes the submit's place, so the sheet stops offering the order it just placed.
             The notice line under it still says what filled; this card only says that it did. */
          : filled
            ? <div className="ticket-filled">
                <p className="filled-title"><svg aria-hidden="true" fill="none" viewBox="0 0 16 16"><path d="m3 8.5 3.5 3.5L13 4.5" stroke="currentColor" strokeLinecap="square" strokeWidth="1.4" /></svg>{t.filledTitle}</p>
                <dl><div><dt>{t.totalPrice}</dt><dd>{formatPoint(filled.totalPrice)} pt</dd></div></dl>
                <button className="ticket-done" onClick={() => onExpandedChange(false)} type="button">{t.filledDone}</button>
              </div>
            : <button className="ticket-submit" data-side={side} disabled={locked} type="submit">{t.requestQuote(direction)}</button>}

        <p className="ticket-notice" id="ticket-notice" role="status">{error || (closed ? closedHint ?? t.hintClosed : stale ? t.hintStale(candidate.trader) : notice)}</p>
      </form>
    </>
  );
}
