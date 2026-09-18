import { useMemo, useState } from 'react';
import { ChanceBar } from '../components/ChanceBar';
import { ClosedPositionList } from '../components/ClosedPositionList';
import { BackLink } from '../components/BackLink';
import { LangToggle } from '../components/LangToggle';
import { Leaderboard } from '../components/Leaderboard';
import { MarketLeaderboardPage } from './MarketLeaderboardPage';
import { MarketChart } from '../components/MarketChart';
import { OrderTicket } from '../components/OrderTicket';
import { PositionsSection } from '../components/PositionsSection';
import { RulesSection } from '../components/RulesSection';
import { SettledBanner } from '../components/SettledBanner';
import { TraderTable } from '../components/TraderTable';
import {
  T2049_BREAK_SECONDS,
  T2049_ELIMINATION_INTERVAL_SECONDS,
  T2049_FINALIST_COUNT,
  T2049_INITIAL_TRADER_COUNT,
  T2049_REWARD_FIRST_USDT,
  T2049_REWARD_TOP,
  T2049_SESSION_A_SECONDS,
  T2049_SESSION_C_SECONDS,
  T2049_STARTING_POINT,
  T2049_TRADERS,
} from '../data/t2049MarketContent';
import { TOKEN2049_STRINGS, type I18nProps } from '../i18n/strings/token2049';
import { formatClock, formatPoint, formatTime } from '../market/format';
import { createOperators, myPlace, rankTraders, type Field } from '../market/leaderboard';
import { chanceOf, quote as priceOf, totalAsset, TOTAL_PRICE, type MarketId } from '../market/engine';
import { useOrderDesk } from '../market/useOrderDesk';
import { isTradingSession, nextEliminationAt } from '../market/token2049/clock';
import {
  T2049_IDS,
  T2049_OPEN_PRICES,
  activeIds,
  eliminationPrice,
  rankOf,
  returnOf,
  traderStateOf,
} from '../market/token2049/market';
import { elapsedOf, isClosed, secondsLeftOf, sessionOf, statusOf, useMarket } from '../market/token2049/useMarket';

type Token2049MarketPageProps = Omit<I18nProps, 't'> & {
  /* The full board is a route of its own, but it ranks the run this page is holding. Rendering it
     from inside this component is what keeps the competition alive across the navigation: the
     balances walk a random path that is never persisted, so a board mounted beside this page would
     reopen the market and report a different rank for the same player. */
  view: 'market' | 'leaderboard';
  onBack(): void;
  onOpenLeaderboard(): void;
  /* True while the Kalshi gate is up over this page. The board still renders under it: it is what the
     gate is arguing for, and a reader who cannot see it has no reason to go and fill the form. */
  locked: boolean;
};

const traderOf = (id: MarketId) => T2049_TRADERS.find((trader) => trader.id === id) ?? T2049_TRADERS[0];

/* The simulated field has to hold seat markets. Opened against the PERP-DEX DAY line-up it prices at
   undefined and every rank reads NaN. */
const T2049_FIELD: Field = { ids: T2049_IDS, openPrices: T2049_OPEN_PRICES, startingPoint: T2049_STARTING_POINT };

/* A minute out, the cut clock stops being background information. */
const URGENT_SECONDS = 60;

/* TOKEN2049 ships in English only. The toggle stays so the language choice carries back to the rest
   of the site, but every string on this page comes from the English dictionary. */
export function Token2049MarketPage({ view, onBack, onOpenLeaderboard, lang, onLangChange, locked }: Token2049MarketPageProps) {
  const t = TOKEN2049_STRINGS.en;
  const { state, fill } = useMarket();
  const [operators] = useState(() => createOperators(T2049_FIELD));

  const { balances, prices, holdings, settlement, point, eliminated, lastCut, closed } = state;
  const { focusId, side, direction, pending, notice, ticketExpanded, askQuote, cancel, confirm, pick, focusSeat, chooseSide, chooseDirection, setTicketExpanded } = useOrderDesk({
    initialId: T2049_TRADERS[0].id,
    prices,
    fill,
    describeFill: (order) => t.filled(order.orderSide, order.quantity, order.positionSide, traderOf(order.marketId).trader, order.unitPrice),
  });
  const session = sessionOf(state);
  const open = isTradingSession(session);
  const focus = traderOf(focusId);
  const asset = totalAsset(point, holdings, prices);
  const ranks = useMemo(() => rankTraders(operators, prices, { name: 'YOU', point, holdings }, T2049_STARTING_POINT), [operators, prices, point, holdings]);
  const place = myPlace(ranks);

  if (view === 'leaderboard') return <MarketLeaderboardPage
    brand="TOKEN2049"
    className={locked ? 't2049-market-page t2049-locked' : 't2049-market-page'}
    final={session === 'ended'}
    lang={lang}
    onBack={onBack}
    onLangChange={onLangChange}
    ranks={ranks}
    rewardTop={T2049_REWARD_TOP}
    t={t}
    tag={t.t2049MarketTag}
  />;

  const cutIn = nextEliminationAt(elapsedOf(state));
  const cutLeft = cutIn === null ? null : Math.max(0, Math.round(cutIn - elapsedOf(state)));

  const tradableSeat = (id: MarketId) => open && !isClosed(state, id) && statusOf(state, id) !== 'stale';

  /* The overview bar and the order ticket both read the seat the ticket is pointed at. */
  const chance = chanceOf(prices, focusId);
  const focusYes = priceOf(prices, focusId, 'yes', direction);
  const focusNo = priceOf(prices, focusId, 'no', direction);

  return (
    <div className={locked ? 'market-page t2049-market-page t2049-locked' : 'market-page t2049-market-page'}>
      <header className="market-header">
        <BackLink className="market-back" label={t.t2049MarketBack} onClick={onBack} />
        <div className="market-header-end"><span>{t.t2049MarketTag}</span><LangToggle lang={lang} onChange={onLangChange} t={t} /></div>
      </header>

      <main>
        <section className="market-content" aria-labelledby="t2049-market-title">
          <div className="market-intro">
            <h1 id="t2049-market-title">{t.t2049MarketHeading}</h1>
            <dl className="market-spec">
              {t.t2049MarketSpec({
                breakMinutes: T2049_BREAK_SECONDS / 60,
                cutSeconds: T2049_ELIMINATION_INTERVAL_SECONDS,
                finalMinutes: T2049_SESSION_C_SECONDS / 60,
                finalists: T2049_FINALIST_COUNT,
                payout: TOTAL_PRICE,
                point: T2049_STARTING_POINT,
                seats: T2049_INITIAL_TRADER_COUNT,
                sessionMinutes: T2049_SESSION_A_SECONDS / 60,
              }).map((row) => <div key={row.term}><dt>{row.term}</dt><dd>{row.detail}</dd></div>)}
            </dl>
          </div>

          <article className="market-card market-overview">
            <p className="market-state" data-phase={session}><i aria-hidden="true" /><span className="visually-hidden">{t.sessionLabel} </span>{t.sessionName(session)}</p>

            <dl className="market-bar">
              <div><dt>{t.availablePoint}</dt><dd>{formatPoint(point)} pt</dd></div>
              <div><dt>{t.totalAsset}</dt><dd>{formatPoint(asset)} pt</dd></div>
              <div className="market-place"><dt>{t.myRank}</dt><dd>#{place}</dd></div>
              {/* A cut clock outranks the session clock while a seat is still going out, and the two
                  never run at once, so the fourth card carries whichever one is live. */}
              {cutLeft === null
                ? <div><dt>{session === 'ended' ? t.closedAt : t.remaining}</dt><dd>{session === 'ended' ? formatTime(state.time) : <time>{formatClock(secondsLeftOf(state))}</time>}</dd></div>
                : <div className="market-cut-clock" data-urgent={cutLeft <= URGENT_SECONDS ? 'true' : 'false'}><dt>{t.nextCut} · {activeIds(eliminated).length}/{T2049_TRADERS.length}</dt><dd><time>{formatClock(cutLeft)}</time></dd></div>}
            </dl>

            <ChanceBar t={t} name={focus.trader} chance={chance} yesPrice={focusYes} noPrice={focusNo} />
          </article>

          {session === 'break' && <p className="market-break" role="status">{t.breakNotice}</p>}
          {session === 'settling' && <p className="market-break" role="status">{t.settlingNotice}</p>}

          {lastCut && !settlement && <div className="market-cut" role="status">
            <h2>{t.cutTitle(traderOf(lastCut.id).trader)}</h2>
            <p>{t.cutPrices(eliminationPrice('no'))}</p>
            <p>{lastCut.payout > 0 ? t.cutSettled(formatPoint(lastCut.payout)) : t.cutNone}</p>
          </div>}

          {settlement && <SettledBanner
            t={t}
            winners={settlement.winners.map((id) => traderOf(id).trader)}
            totalPrice={TOTAL_PRICE}
            payout={settlement.payout}
            point={point}
          />}

          <div className="market-layout">
            <div className="market-main">
              <MarketChart t={t} traders={T2049_TRADERS} focusId={focusId} history={state.history} />

              <section className="market-traders market-card" aria-labelledby="t2049-traders-title">
                <h3 id="t2049-traders-title">{t.traderTableCaption}</h3>
                {/* Standings move through a session, so the rows move with them and the board can be
                    read top to bottom. A cut seat keeps the place its frozen balance earned, which is
                    the rule the rank badge already follows. Equal balances hold the seat order. */}
                <TraderTable onFocusSeat={focusSeat} onPick={pick} rows={T2049_TRADERS.map((candidate) => ({
                  balance: balances[candidate.id],
                  candidate,
                  focused: candidate.id === focusId,
                  noPrice: priceOf(prices, candidate.id, 'no', direction),
                  percent: returnOf(balances[candidate.id]),
                  probability: chanceOf(prices, candidate.id),
                  rank: rankOf(balances, candidate.id),
                  state: traderStateOf(candidate.id, session, eliminated, settlement ? settlement.winners : null),
                  status: statusOf(state, candidate.id),
                  tradable: tradableSeat(candidate.id),
                  yesPrice: priceOf(prices, candidate.id, 'yes', direction),
                })).sort((a, b) => a.rank - b.rank)} t={t} />
              </section>

              <PositionsSection
                t={t}
                traders={T2049_TRADERS}
                holdings={holdings}
                prices={prices}
                winners={settlement ? settlement.winners : null}
                tradable={open}
                onSell={(id, positionSide, quantity) => askQuote(id, positionSide, 'sell', quantity)}
                point={point}
                startingPoint={T2049_STARTING_POINT}
              />

              <Leaderboard t={t} ranks={ranks} final={session === 'ended'} onViewAll={onOpenLeaderboard} />

              <RulesSection t={t} rows={[
                { term: t.t2049RulesEliminationLabel, detail: t.t2049RulesElimination },
                { term: t.rulesWinnerLabel, detail: t.t2049RulesResolve(TOTAL_PRICE) },
                { term: t.rulesRewardLabel, detail: t.rulesReward(T2049_REWARD_TOP, T2049_REWARD_FIRST_USDT) },
                { term: t.rulesPointsLabel, detail: t.rulesDisclaimer },
              ]} />

              {/* Kalshi settles the rewards this board plays for, so its mark sits with the rules
                  rather than in the chrome. No action here: every reader who can see this board has
                  already passed the Kalshi gate, so an add-account button would ask twice. */}
              <section className="t2049-kalshi-card market-card" aria-labelledby="t2049-kalshi-card-title">
                <img alt="" aria-hidden="true" height="44" src="/assets/sponsors/symbol/kalshi.svg" width="44" />
                <div>
                  <h3 id="t2049-kalshi-card-title">{t.t2049MarketKalshiTitle}</h3>
                  <p>{t.t2049KalshiPayoutNote}</p>
                </div>
              </section>
            </div>

            <aside className="market-side">
              <OrderTicket
                candidate={focus}
                direction={direction}
                expanded={ticketExpanded}
                holdings={holdings}
                key={focus.id}
                notice={notice}
                now={state.time}
                onCancel={cancel}
                onConfirm={confirm}
                onDirectionChange={chooseDirection}
                onExpandedChange={setTicketExpanded}
                onRequestQuote={(quantity, orderSide) => askQuote(focusId, side, orderSide, quantity)}
                onSideChange={chooseSide}
                tradable={open && !isClosed(state, focusId)}
                closedHint={session === 'break' ? t.hintPaused : eliminated.includes(focusId) ? t.hintEliminated : undefined}
                point={point}
                prices={prices}
                quote={pending}
                side={side}
                status={statusOf(state, focus.id)}
                t={t}
              />

              {/* PRD 41. A sold position and a position cut out from under its holder both leave the
                  open board, so what they returned is read back here rather than lost with the row. */}
              {closed.length > 0 ? (
                <section className="market-history market-card" aria-labelledby="t2049-history-title">
                  <h3 id="t2049-history-title">{t.historyTitle}</h3>
                  <ClosedPositionList rows={closed.map((row, index) => ({
                    entry: row.entry,
                    exit: row.exit,
                    key: `${row.id}-${row.side}-${row.time}-${index}`,
                    qty: row.qty,
                    side: row.side,
                    state: traderStateOf(row.id, session, eliminated, settlement ? settlement.winners : null),
                    time: row.time,
                    trader: traderOf(row.id).trader,
                  }))} t={t} />
                </section>
              ) : null}
            </aside>
          </div>
        </section>
      </main>

      <footer className="market-footer">
        <span>TOKEN2049</span>
        <p className="t2049-kalshi-mark"><img alt="" aria-hidden="true" height="20" src="/assets/sponsors/symbol/kalshi.svg" width="20" />{t.t2049MarketKalshiFooter}</p>
        <span>{t.footerRights}</span>
      </footer>
    </div>
  );
}
