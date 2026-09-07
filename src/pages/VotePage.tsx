import { useState } from 'react';
import { ArrowIcon } from '../components/ArrowIcon';
import { LangToggle } from '../components/LangToggle';
import { ASCII_D60_HERO, ASCII_LOG_LEET, AsciiArt } from '../components/AsciiArt';
import { MarketChart, type ChartRange } from '../components/MarketChart';
import { OrderTicket } from '../components/OrderTicket';
import { CONTRACT_PAYOUT, INITIAL_CANDIDATE_ID, VOTE_CANDIDATES, type VoteCandidateId } from '../data/voteContent';
import type { I18nProps } from '../i18n/strings';
import { formatClock, formatPill, formatSigned, formatTime } from '../market/format';
import { OPEN_PRICES, chanceOf, holdingValue, quote, type Direction, type Side } from '../market/marketEngine';
import { secondsLeftOf, useMarket } from '../market/useMarket';

type VotePageProps = I18nProps & {
  onBack(): void;
};

const candidateOf = (id: VoteCandidateId) => VOTE_CANDIDATES.find((candidate) => candidate.id === id) ?? VOTE_CANDIDATES[0];

export function VotePage({ onBack, lang, t, onLangChange }: VotePageProps) {
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
        <button className="vote-back" type="button" onClick={onBack} aria-label={t.voteBack}>PERP-DEX DAY</button>
        <div className="vote-header-end"><span>{t.voteTag}</span><LangToggle lang={lang} onChange={onLangChange} t={t} /></div>
      </header>

      <main>
        <section className="vote-feature">
          <AsciiArt className="vote-hero-art" recipe={ASCII_D60_HERO} />
        </section>

        <section className="vote-content" aria-labelledby="market-title">
          <div className="vote-intro">
            <h1 id="market-title">{t.marketTitle}</h1>
            <p>{t.marketIntro(CONTRACT_PAYOUT)}</p>
          </div>

          <dl className="market-bar">
            <div className="market-state" data-closed={closed ? 'true' : 'false'}><dt>{t.statusLabel}</dt><dd>{closed ? t.statusClosed : t.statusLive}</dd></div>
            <div><dt>{closed ? t.closedAt : t.closesIn}</dt><dd>{closed ? formatTime(state.closeAt) : <time>{formatClock(secondsLeft)}</time>}</dd></div>
            <div><dt>{t.volume}</dt><dd>{formatPill(state.volume)} PILL</dd></div>
            <div><dt>{t.balance}</dt><dd>{formatPill(state.balance)} PILL</dd></div>
            <div><dt>{t.positionValue}</dt><dd>{formatPill(exposure)} PILL</dd></div>
          </dl>

          {settlement && <div className="market-settled" role="status">
            <h2>{t.settledTitle(candidateOf(settlement.winner).name)}</h2>
            <p>{settlement.payout > 0 ? t.settledPaid(formatPill(settlement.payout)) : t.settledNone} {t.settledFinal(formatPill(state.balance))}</p>
          </div>}

          <div className="market-layout">
            <div className="market-main">
              <MarketChart t={t} focusId={focusId} history={state.history} onFocusChange={setFocusId} onRangeChange={setRange} range={range} />

              <ul className="outcome-list" aria-label={t.outcomesLabel}>
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
                      <button data-side="yes" disabled={closed} onClick={() => pick(candidate.id, 'yes')} type="button">{t.sideYes} <strong>{quote(prices, candidate.id, 'yes')}</strong></button>
                      <button data-side="no" disabled={closed} onClick={() => pick(candidate.id, 'no')} type="button">{t.sideNo} <strong>{quote(prices, candidate.id, 'no')}</strong></button>
                    </div>
                  </li>;
                })}
              </ul>

              <section className="market-activity" aria-labelledby="activity-title">
                <h3 id="activity-title">{t.tapeTitle}</h3>
                {state.fills.length
                  ? <ul>{state.fills.map((fill) => <li data-mine={fill.mine ? 'true' : 'false'} key={`${fill.time}-${fill.id}-${fill.side}-${fill.qty}`}>
                      <time className="tape-time">{formatTime(fill.time)}</time>
                      <span className="tape-name">{candidateOf(fill.id).name}</span>
                      <em className="tape-side" data-side={fill.side}>{t.directionName(fill.direction)} {t.sideName(fill.side)}</em>
                      <span className="tape-size">{formatPill(fill.qty)} @ {fill.price}</span>
                      <strong className="tape-notional">{formatPill(fill.qty * fill.price)} PILL</strong>
                    </li>)}</ul>
                  : <p>{t.tapeEmpty}</p>}
              </section>

              <section className="market-rules" aria-labelledby="rules-title">
                <h3 id="rules-title">{t.rulesTitle}</h3>
                <p>{t.rulesResolve(CONTRACT_PAYOUT)}</p>
                <p>{t.rulesDisclaimer}</p>
              </section>
            </div>

            <aside className="market-side">
              <OrderTicket t={t} balance={state.balance} candidate={focus} closed={closed} holdings={holdings} key={focus.id} onSideChange={setSide} onTrade={submitTrade} prices={prices} side={side} />

              <section className="market-positions" aria-labelledby="positions-title">
                <h3 id="positions-title">{t.positionsTitle}</h3>
                {holdings.length
                  ? <ul>{holdings.map((holding) => {
                      const value = holdingValue(holding, prices);
                      return <li key={`${holding.id}-${holding.side}`}>
                        <span>{candidateOf(holding.id).name}</span>
                        <em data-side={holding.side}>{t.sideName(holding.side)}</em>
                        <span>{formatPill(holding.qty)} @ {Math.round(holding.cost / holding.qty)}</span>
                        <strong>{formatPill(value)} PILL</strong>
                        <b data-move={value - holding.cost > 0 ? 'up' : value - holding.cost < 0 ? 'down' : 'flat'}>{formatSigned(value - holding.cost)}</b>
                      </li>;
                    })}</ul>
                  : <p>{t.positionsEmpty}</p>}
              </section>
            </aside>
          </div>
        </section>

        <section className="vote-brand-card">
          <div className="vote-brand-art" aria-hidden="true"><AsciiArt recipe={ASCII_LOG_LEET} /></div>
          <div className="vote-brand-copy"><h2>{t.voteBrandTitle}</h2><p>{t.voteBrandCopy}</p><a href="#top" onClick={onBack}>{t.backToArena} <ArrowIcon /></a></div>
        </section>
      </main>

      <footer className="vote-footer"><span>PERP-DEX DAY</span><span>{t.voteRights}</span><div><img src="/assets/vote/figma/symbol.png" alt="Symbol" /><img src="/assets/vote/figma/x-icon.jpg" alt="X" /></div></footer>
    </div>
  );
}
