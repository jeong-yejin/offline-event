import { useState } from 'react';
import { CONTRACT_PAYOUT, type VoteCandidate } from '../data/voteContent';
import { formatPill } from '../market/format';
import { findHolding, quote, type Direction, type Holding, type PriceMap, type Side } from '../market/marketEngine';

const SIDES: readonly Side[] = ['yes', 'no'];
const DIRECTIONS: readonly Direction[] = ['buy', 'sell'];
const STEPS = [1, 10, 100];

type OrderTicketProps = {
  candidate: VoteCandidate;
  prices: PriceMap;
  side: Side;
  balance: number;
  holdings: readonly Holding[];
  closed: boolean;
  onSideChange(side: Side): void;
  onTrade(qty: number, direction: Direction): void;
};

export function OrderTicket({ candidate, prices, side, balance, holdings, closed, onSideChange, onTrade }: OrderTicketProps) {
  const [direction, setDirection] = useState<Direction>('buy');
  const [draft, setDraft] = useState('25');
  const [notice, setNotice] = useState('');

  const price = quote(prices, candidate.id, side);
  const held = findHolding(holdings, candidate.id, side);
  const owned = held ? held.qty : 0;
  const qty = Math.max(0, Math.floor(Number(draft) || 0));
  const notional = qty * price;
  const ceiling = direction === 'buy' ? Math.floor(balance / price) : owned;
  const blocked = closed || qty < 1 || qty > ceiling;

  const hint = closed
    ? 'Market closed. Trading has ended.'
    : direction === 'sell' && owned < 1
      ? `You hold no ${side.toUpperCase()} contracts on ${candidate.name}.`
      : qty > ceiling
        ? direction === 'buy' ? `Not enough PILL. You can afford ${formatPill(ceiling)} contracts.` : `You only hold ${formatPill(owned)} contracts.`
        : '';

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (blocked) return;
    onTrade(qty, direction);
    setNotice(`${direction === 'buy' ? 'Bought' : 'Sold'} ${formatPill(qty)} ${side.toUpperCase()} on ${candidate.name} at ${price} PILL.`);
  }

  return (
    <form className="order-ticket" onSubmit={submit} aria-label="Order ticket">
      <header className="ticket-head"><img alt="" className="ticket-logo" src={`/assets/sponsors/${candidate.logo}`} /><strong>{candidate.name}</strong></header>

      <div className="ticket-directions" role="group" aria-label="Order direction">
        {DIRECTIONS.map((option) => <button aria-pressed={option === direction} data-active={option === direction ? 'true' : 'false'} key={option} onClick={() => { setDirection(option); setNotice(''); }} type="button">{option}</button>)}
      </div>

      <div className="ticket-sides" role="group" aria-label="Contract side">
        {SIDES.map((option) => <button aria-pressed={option === side} data-active={option === side ? 'true' : 'false'} data-side={option} key={option} onClick={() => { onSideChange(option); setNotice(''); }} type="button">
          <span>{option}</span><strong>{quote(prices, candidate.id, option)}</strong>
        </button>)}
      </div>

      <label className="ticket-qty" htmlFor="order-contracts">Contracts</label>
      <div className="ticket-input">
        <button aria-label="Decrease contracts" onClick={() => setDraft(String(Math.max(0, qty - 1)))} type="button">−</button>
        <input id="order-contracts" inputMode="numeric" min="0" onChange={(event) => { setDraft(event.target.value); setNotice(''); }} type="number" value={draft} />
        <button aria-label="Increase contracts" onClick={() => setDraft(String(qty + 1))} type="button">+</button>
      </div>

      <div className="ticket-steps">
        {STEPS.map((step) => <button key={step} onClick={() => setDraft(String(qty + step))} type="button">+{step}</button>)}
        <button onClick={() => setDraft(String(Math.max(0, ceiling)))} type="button">max</button>
      </div>

      <dl className="ticket-summary">
        <div><dt>Price</dt><dd>{price} PILL</dd></div>
        <div><dt>{direction === 'buy' ? 'You pay' : 'You receive'}</dt><dd>{formatPill(notional)} PILL</dd></div>
        <div><dt>{direction === 'buy' ? 'To win' : 'Contracts left'}</dt><dd>{direction === 'buy' ? `${formatPill(qty * CONTRACT_PAYOUT)} PILL` : formatPill(Math.max(0, owned - qty))}</dd></div>
      </dl>

      <button className="ticket-submit" data-side={side} disabled={blocked} type="submit">{direction} {formatPill(qty)} {side}</button>

      <p className="ticket-notice" role="status">{hint || notice}</p>
    </form>
  );
}
