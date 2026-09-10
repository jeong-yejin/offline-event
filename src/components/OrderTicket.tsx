import { useEffect, useState } from 'react';
import type { Strings } from '../i18n/strings/market';
import { formatPoint } from '../market/format';
import { findHolding, quote as priceOf, type DataStatus, type Direction, type Holding, type MarketTrader, type PriceMap, type Side } from '../market/engine';
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
  notice: string;
  onSideChange(side: Side): void;
  onDirectionChange(direction: Direction): void;
  onRequestQuote(quantity: number, direction: Direction): void;
  onConfirm(): void;
  onCancel(): void;
};

export function OrderTicket({ t, candidate, prices, side, direction, point, holdings, tradable, closedHint, status, now, quote, notice, onSideChange, onDirectionChange, onRequestQuote, onConfirm, onCancel }: OrderTicketProps) {
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
    <form className="order-ticket" onSubmit={submit} aria-label={t.ticketLabel}>
      <h3 className="ticket-title">{t.ticketLabel}</h3>

      {/* The logo already reads "Variational", so the exchange name only earns a line on the seats
          that have no logo, where it carries the seat number instead. */}
      <header className="ticket-head">
        {candidate.logo ? <img alt={candidate.exchange} className="ticket-logo" src={`/assets/sponsors/${candidate.logo}`} /> : null}
        <div><strong>{candidate.trader}</strong>{candidate.logo ? null : <span>{candidate.exchange}</span>}</div>
      </header>

      <div className="ticket-directions" role="group" aria-label={t.directionGroup}>
        {DIRECTIONS.map((option) => <button aria-pressed={option === direction} data-active={option === direction ? 'true' : 'false'} disabled={Boolean(quote)} key={option} onClick={() => onDirectionChange(option)} type="button">{t.directionName(option)}</button>)}
      </div>

      <div className="ticket-sides" role="group" aria-label={t.sideGroup}>
        {SIDES.map((option) => <button aria-pressed={option === side} data-active={option === side ? 'true' : 'false'} data-side={option} disabled={Boolean(quote)} key={option} onClick={() => onSideChange(option)} type="button">
          <span>{t.sideName(option)}</span><strong>{priceOf(prices, candidate.id, option, direction)}</strong>
        </button>)}
      </div>

      <label className="ticket-qty" htmlFor="order-quantity">{t.quantity}</label>
      <div className="ticket-input">
        <div className="ticket-stepper">
          <button aria-label={t.quantityDown} disabled={Boolean(quote) || quantity === 1} onClick={() => step(-1)} type="button">−</button>
          <input aria-describedby="ticket-notice" aria-invalid={error ? 'true' : 'false'} disabled={Boolean(quote)} id="order-quantity" inputMode="numeric" onChange={(event) => { setDraft(event.target.value); setError(''); }} type="text" value={draft} />
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
        <div><dt>{direction === 'buy' ? t.requiredPoint : t.expectedPoint}</dt><dd>{quantity === null ? '—' : `${formatPoint(quantity * unit)} pt`}</dd></div>
        <div><dt>{direction === 'buy' ? t.availablePoint : t.ownedQuantity}</dt><dd>{direction === 'buy' ? `${formatPoint(point)} pt` : owned}</dd></div>
        <div><dt>{t.orderableQuantity}</dt><dd>{maxQuantity} · {formatPoint(maxQuantity * unit)} pt</dd></div>
      </dl>

      {quote
        ? <div className="ticket-quote" data-expired={expired ? 'true' : 'false'} role="status">
            <p className="quote-id">{t.quoteId} <code>{quote.quoteId}</code></p>
            <dl>
              <div><dt>{t.unitPrice}</dt><dd>{quote.unitPrice} pt</dd></div>
              <div><dt>{t.quantity}</dt><dd>{quote.quantity}</dd></div>
              <div><dt>{t.totalPrice}</dt><dd>{formatPoint(quote.totalPrice)} pt</dd></div>
            </dl>
            <p className="quote-life">{expired ? t.quoteExpired : t.quoteLife(quoteSecondsLeft(quote, now))}</p>
            <div className="quote-actions">
              <button className="ticket-submit" data-side={quote.positionSide} disabled={expired} onClick={onConfirm} type="button">{t.confirmOrder(quote.orderSide)}</button>
              <button className="quote-cancel" onClick={onCancel} type="button">{expired ? t.requoteCta : t.cancelQuote}</button>
            </div>
          </div>
        : <button className="ticket-submit" data-side={side} disabled={locked} type="submit">{t.requestQuote(direction)}</button>}

      <p className="ticket-notice" id="ticket-notice" role="status">{error || (closed ? closedHint ?? t.hintClosed : stale ? t.hintStale(candidate.trader) : notice)}</p>
    </form>
  );
}
