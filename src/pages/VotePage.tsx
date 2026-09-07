import { useState } from 'react';
import { ArrowIcon } from '../components/ArrowIcon';
import { ASCII_D60_HERO, ASCII_LOG_LEET, AsciiArt } from '../components/AsciiArt';
import { MarketChart, type ChartRange } from '../components/MarketChart';
import { OrderTicket } from '../components/OrderTicket';
import { CONTRACT_PAYOUT, INITIAL_CANDIDATE_ID, VOTE_CANDIDATES, type VoteCandidateId } from '../data/voteContent';
import { formatClock, formatPill, formatSigned, formatTime } from '../market/format';
import { OPEN_PRICES, chanceOf, holdingValue, quote, type Direction, type Side } from '../market/marketEngine';
import { secondsLeftOf, useMarket } from '../market/useMarket';

type VotePageProps = {
  onBack(): void;
};

const candidateOf = (id: VoteCandidateId) => VOTE_CANDIDATES.find((candidate) => candidate.id === id) ?? VOTE_CANDIDATES[0];

export function VotePage({ onBack }: VotePageProps) {
  const { state, trade } = useMarket();
  const [focusId, setFocusId] = useState<VoteCandidateId>(INITIAL_CANDIDATE_ID);
  const [side, setSide] = useState<Side>('yes');
  const [range, setRange] = useState<ChartRange>('6H');

  const { prices, holdings, settlement } = state;
  const closed = settlement !== null;
  const secondsLeft = secondsLeftOf(state);
  const focus = candidateOf(focusId);
  const exposure = holdings.reduce((total, holding) => total + holdingValue(holding, prices), 0);

  function pick(id: VoteCandidateId, nextSide: Side) {
    setFocusId(id);
    setSide(nextSide);
  }

  function submitTrade(qty: number, direction: Direction) {
    trade({ id: focusId, side, direction, qty });
  }

  return (
    <div className="vote-page">
      <header className="vote-header">
        <button className="vote-back" type="button" onClick={onBack} aria-label="Back to PERP-DEX DAY">PERP-DEX DAY</button>
        <span>THE RED PILL / PREDICTION MARKET</span>
      </header>

      <main>
        <section className="vote-feature">
          <AsciiArt className="vote-hero-art" recipe={ASCII_D60_HERO} />
        </section>

        <section className="vote-content" aria-labelledby="market-title">
          <div className="vote-intro">
            <h1 id="market-title">Who will own the arena?</h1>
            <p>Trade the live trading competition winner with PILL, our event points. Prices move until the arena closes, then every winning contract settles at {CONTRACT_PAYOUT} PILL.</p>
          </div>

          <dl className="market-bar">
            <div className="market-state" data-closed={closed ? 'true' : 'false'}><dt>Status</dt><dd>{closed ? 'Closed' : 'Live'}</dd></div>
            <div><dt>{closed ? 'Closed at' : 'Closes in'}</dt><dd>{closed ? formatTime(state.closeAt) : <time>{formatClock(secondsLeft)}</time>}</dd></div>
            <div><dt>Volume</dt><dd>{formatPill(state.volume)} PILL</dd></div>
            <div><dt>Balance</dt><dd>{formatPill(state.balance)} PILL</dd></div>
            <div><dt>Position value</dt><dd>{formatPill(exposure)} PILL</dd></div>
          </dl>

          {settlement && <div className="market-settled" role="status">
            <h2>Market resolved — {candidateOf(settlement.winner).name} wins</h2>
            <p>{settlement.payout > 0 ? `${formatPill(settlement.payout)} PILL paid out to your winning contracts.` : 'None of your contracts finished in the money.'} Final balance {formatPill(state.balance)} PILL.</p>
          </div>}

          <div className="market-layout">
            <div className="market-main">
              <MarketChart focusId={focusId} history={state.history} onFocusChange={setFocusId} onRangeChange={setRange} range={range} />

              <ul className="outcome-list" aria-label="Market outcomes">
                {VOTE_CANDIDATES.map((candidate) => {
                  const chance = chanceOf(prices, candidate.id);
                  const change = chance - OPEN_PRICES[candidate.id];
                  return <li className="outcome-row" data-focus={candidate.id === focusId ? 'true' : 'false'} key={candidate.id}>
                    <button aria-pressed={candidate.id === focusId} className="outcome-pick" onClick={() => setFocusId(candidate.id)} type="button">
                      <img alt="" className="vote-card-logo" src={`/assets/sponsors/${candidate.logo}`} />
                      <span>{candidate.name}</span>
                    </button>
                    <p className="outcome-chance"><strong>{chance}%</strong><em data-move={change > 0 ? 'up' : change < 0 ? 'down' : 'flat'}>{change > 0 ? '▲' : change < 0 ? '▼' : '■'} {Math.abs(change)}</em></p>
                    <div className="outcome-actions">
                      <button data-side="yes" disabled={closed} onClick={() => pick(candidate.id, 'yes')} type="button">Yes <strong>{quote(prices, candidate.id, 'yes')}</strong></button>
                      <button data-side="no" disabled={closed} onClick={() => pick(candidate.id, 'no')} type="button">No <strong>{quote(prices, candidate.id, 'no')}</strong></button>
                    </div>
                  </li>;
                })}
              </ul>

              <section className="market-activity" aria-labelledby="activity-title">
                <h3 id="activity-title">Live tape</h3>
                {state.fills.length
                  ? <ul>{state.fills.map((fill) => <li data-mine={fill.mine ? 'true' : 'false'} key={`${fill.time}-${fill.id}-${fill.side}-${fill.qty}`}>
                      <time className="tape-time">{formatTime(fill.time)}</time>
                      <span className="tape-name">{candidateOf(fill.id).name}</span>
                      <em className="tape-side" data-side={fill.side}>{fill.direction} {fill.side}</em>
                      <span className="tape-size">{formatPill(fill.qty)} @ {fill.price}</span>
                      <strong className="tape-notional">{formatPill(fill.qty * fill.price)} PILL</strong>
                    </li>)}</ul>
                  : <p>Waiting for the first print.</p>}
              </section>

              <section className="market-rules" aria-labelledby="rules-title">
                <h3 id="rules-title">Resolution</h3>
                <p>The market resolves to the trader leading the arena when the countdown reaches zero. Winning contracts pay {CONTRACT_PAYOUT} PILL each, losing contracts pay nothing.</p>
                <p>PILL is an event point balance. It has no cash value and cannot be withdrawn. This is a one-time event and is not a gambling activity.</p>
              </section>
            </div>

            <aside className="market-side">
              <OrderTicket balance={state.balance} candidate={focus} closed={closed} holdings={holdings} key={focus.id} onSideChange={setSide} onTrade={submitTrade} prices={prices} side={side} />

              <section className="market-positions" aria-labelledby="positions-title">
                <h3 id="positions-title">Your positions</h3>
                {holdings.length
                  ? <ul>{holdings.map((holding) => {
                      const value = holdingValue(holding, prices);
                      return <li key={`${holding.id}-${holding.side}`}>
                        <span>{candidateOf(holding.id).name}</span>
                        <em data-side={holding.side}>{holding.side}</em>
                        <span>{formatPill(holding.qty)} @ {Math.round(holding.cost / holding.qty)}</span>
                        <strong>{formatPill(value)} PILL</strong>
                        <b data-move={value - holding.cost > 0 ? 'up' : value - holding.cost < 0 ? 'down' : 'flat'}>{formatSigned(value - holding.cost)}</b>
                      </li>;
                    })}</ul>
                  : <p>No open positions. Pick a side to enter the market.</p>}
              </section>
            </aside>
          </div>
        </section>

        <section className="vote-brand-card">
          <div className="vote-brand-art" aria-hidden="true"><AsciiArt recipe={ASCII_LOG_LEET} /></div>
          <div className="vote-brand-copy"><h2>See what moves the PERP-DEX market.</h2><p>Volume, share, and rewards — all in one construct.</p><a href="#top" onClick={onBack}>Back to the arena <ArrowIcon /></a></div>
        </section>
      </main>

      <footer className="vote-footer"><span>PERP-DEX DAY</span><span>REBOUND X / ALL RIGHTS RESERVED</span><div><img src="/assets/vote/figma/symbol.png" alt="Symbol" /><img src="/assets/vote/figma/x-icon.jpg" alt="X" /></div></footer>
    </div>
  );
}
