import { useState } from 'react';
import { ArrowIcon } from '../components/ArrowIcon';
import { LangToggle } from '../components/LangToggle';
import { ASCII_D60_HERO, ASCII_LOG_LEET, AsciiArt } from '../components/AsciiArt';
import { Leaderboard } from '../components/Leaderboard';
import { MarketChart, type ChartRange } from '../components/MarketChart';
import { OrderTicket } from '../components/OrderTicket';
import { PositionList } from '../components/PositionList';
import { TraderCard } from '../components/TraderCard';
import { REWARD_FIRST_USDT, REWARD_TOP, SETTLEMENT_PRICE, STARTING_POINT, VOTE_CANDIDATES, INITIAL_CANDIDATE_ID } from '../data/voteContent';
import type { I18nProps } from '../i18n/strings';
import { formatClock, formatPercent, formatPoint, formatSigned, formatTime, moveOf } from '../market/format';
import { chanceOf, quote as priceOf, rankOf, returnOf, totalAsset, type Direction, type MarketId, type Side } from '../market/marketEngine';
import { createOperators, myPlace, rankTraders } from '../market/leaderboard';
import { createQuote, type OrderQuote } from '../market/quote';
import { phaseOf, secondsLeftOf, statusOf, useMarket } from '../market/useMarket';

type VotePageProps = I18nProps & {
  onBack(): void;
};

const traderOf = (id: MarketId) => VOTE_CANDIDATES.find((candidate) => candidate.id === id) ?? VOTE_CANDIDATES[0];

export function VotePage({ onBack, lang, t, onLangChange }: VotePageProps) {
  const { state, fill } = useMarket();
  const [focusId, setFocusId] = useState<MarketId>(INITIAL_CANDIDATE_ID);
  const [side, setSide] = useState<Side>('yes');
  const [direction, setDirection] = useState<Direction>('buy');
  const [range, setRange] = useState<ChartRange>('6H');
  const [pending, setPending] = useState<OrderQuote | null>(null);
  const [notice, setNotice] = useState('');
  const [operators] = useState(createOperators);

  const { balances, prices, holdings, settlement, point } = state;
  const phase = phaseOf(state);
  const tradable = phase === 'live';
  const focus = traderOf(focusId);
  const asset = totalAsset(point, holdings, prices);
  const ranks = rankTraders(operators, prices, { name: 'YOU', point, holdings });
  const place = myPlace(ranks);

  /* One quote at a time. A new request replaces the last, which is what an RFQ desk does. */
  function askQuote(id: MarketId, positionSide: Side, orderSide: Direction, quantity: number) {
    setFocusId(id);
    setSide(positionSide);
    setDirection(orderSide);
    setPending(createQuote(prices, id, positionSide, orderSide, quantity, Date.now()));
    setNotice('');
  }

  function confirm() {
    if (!pending) return;
    fill(pending);
    setNotice(t.filled(pending.orderSide, pending.quantity, pending.positionSide, traderOf(pending.marketId).trader, pending.unitPrice));
    setPending(null);
  }

  function pick(id: MarketId, nextSide: Side) {
    setFocusId(id);
    setSide(nextSide);
    setPending(null);
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
            <p>{t.marketIntro(STARTING_POINT, SETTLEMENT_PRICE)}</p>
          </div>

          <dl className="market-bar">
            <div className="market-state" data-phase={phase}><dt>{t.statusLabel}</dt><dd>{t.phaseName(phase)}</dd></div>
            <div><dt>{phase === 'live' ? t.remaining : t.closedAt}</dt><dd>{phase === 'live' ? <time>{formatClock(secondsLeftOf(state))}</time> : formatTime(state.closeAt)}</dd></div>
            <div><dt>{t.availablePoint}</dt><dd>{formatPoint(point)} pt</dd></div>
            <div><dt>{t.totalAsset}</dt><dd>{formatPoint(asset)} pt</dd></div>
            <div className="market-place"><dt>{t.myRank}</dt><dd>#{place}</dd></div>
          </dl>

          {settlement && <div className="market-settled" role="status">
            <h2>{t.settledTitle(settlement.winners.map((id) => traderOf(id).trader).join(', '))}</h2>
            <p>{t.settledSplit(settlement.winners.length, SETTLEMENT_PRICE / settlement.winners.length)}</p>
            <p>{settlement.payout > 0 ? t.settledPaid(formatPoint(settlement.payout)) : t.settledNone} {t.settledFinal(formatPoint(point))}</p>
          </div>}

          <div className="market-layout">
            <div className="market-main">
              <section className="trader-board" aria-labelledby="traders-title">
                <h2 id="traders-title">{t.tradersTitle}</h2>
                <ul className="trader-grid">
                  {VOTE_CANDIDATES.map((candidate) => <TraderCard
                    balance={balances[candidate.id]}
                    candidate={candidate}
                    focused={candidate.id === focusId}
                    key={candidate.id}
                    noPrice={priceOf(prices, candidate.id, 'no', direction)}
                    onPick={(nextSide) => pick(candidate.id, nextSide)}
                    percent={returnOf(balances[candidate.id])}
                    probability={chanceOf(prices, candidate.id)}
                    rank={rankOf(balances, candidate.id)}
                    status={statusOf(state, candidate.id)}
                    t={t}
                    tradable={tradable && statusOf(state, candidate.id) !== 'stale'}
                    yesPrice={priceOf(prices, candidate.id, 'yes', direction)}
                  />)}
                </ul>
              </section>

              <MarketChart t={t} traders={VOTE_CANDIDATES} focusId={focusId} history={state.history} onFocusChange={setFocusId} onRangeChange={setRange} range={range} />

              <section className="market-activity" aria-labelledby="activity-title">
                <h3 id="activity-title">{t.tapeTitle}</h3>
                {state.fills.length
                  ? <ul>{state.fills.map((fillRow) => <li data-mine={fillRow.mine ? 'true' : 'false'} key={`${fillRow.time}-${fillRow.id}-${fillRow.side}-${fillRow.qty}`}>
                      <time className="tape-time">{formatTime(fillRow.time)}</time>
                      <span className="tape-name">{traderOf(fillRow.id).trader}</span>
                      <em className="tape-side" data-side={fillRow.side}>{t.directionName(fillRow.direction)} {t.sideName(fillRow.side)}</em>
                      <span className="tape-size">{fillRow.qty} @ {fillRow.price}</span>
                      <strong className="tape-notional">{formatPoint(fillRow.qty * fillRow.price)} pt</strong>
                    </li>)}</ul>
                  : <p>{t.tapeEmpty}</p>}
              </section>

              <Leaderboard t={t} ranks={ranks} final={phase === 'ended'} />

              <section className="market-rules" aria-labelledby="rules-title">
                <h3 id="rules-title">{t.rulesTitle}</h3>
                <p>{t.rulesResolve(SETTLEMENT_PRICE)}</p>
                <p>{t.rulesReward(REWARD_TOP, REWARD_FIRST_USDT)}</p>
                <p>{t.rulesDisclaimer}</p>
              </section>
            </div>

            <aside className="market-side">
              <OrderTicket
                candidate={focus}
                direction={direction}
                holdings={holdings}
                key={focus.id}
                notice={notice}
                now={state.time}
                onCancel={() => setPending(null)}
                onConfirm={confirm}
                onDirectionChange={(next) => { setDirection(next); setPending(null); }}
                onRequestQuote={(quantity, orderSide) => askQuote(focusId, side, orderSide, quantity)}
                onSideChange={(next) => { setSide(next); setPending(null); }}
                tradable={tradable}
                point={point}
                prices={prices}
                quote={pending}
                side={side}
                status={statusOf(state, focus.id)}
                t={t}
              />

              <section className="market-positions" aria-labelledby="positions-title">
                <h3 id="positions-title">{t.positionsTitle}</h3>
                <PositionList
                  holdings={holdings}
                  traders={VOTE_CANDIDATES}
                  onSell={(id, positionSide, quantity) => askQuote(id, positionSide, 'sell', quantity)}
                  prices={prices}
                  t={t}
                  tradable={tradable}
                  winners={settlement ? settlement.winners : null}
                />
                <dl className="positions-total">
                  <div><dt>{t.availablePoint}</dt><dd>{formatPoint(point)} pt</dd></div>
                  <div><dt>{t.totalAsset}</dt><dd>{formatPoint(asset)} pt</dd></div>
                  <div><dt>{t.leaderPnl}</dt><dd data-move={moveOf(asset - STARTING_POINT)}>{formatSigned(asset - STARTING_POINT)} <small>{formatPercent(((asset - STARTING_POINT) / STARTING_POINT) * 100)}</small></dd></div>
                </dl>
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
