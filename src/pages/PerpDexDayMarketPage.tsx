import { useMemo, useState } from 'react';
import { ArrowIcon } from '../components/ArrowIcon';
import { ChanceBar } from '../components/ChanceBar';
import { BackLink } from '../components/BackLink';
import { LangToggle } from '../components/LangToggle';
import { ASCII_D60_HERO, ASCII_LOG_LEET, AsciiArt } from '../components/AsciiArt';
import { Leaderboard } from '../components/Leaderboard';
import { MarketChart } from '../components/MarketChart';
import { OrderTicket } from '../components/OrderTicket';
import { PositionsSection } from '../components/PositionsSection';
import { RulesSection } from '../components/RulesSection';
import { SettledBanner } from '../components/SettledBanner';
import { TraderTable } from '../components/TraderTable';
import { COMPETITION_SECONDS, REWARD_FIRST_USDT, REWARD_TOP, SETTLEMENT_PRICE, STARTING_POINT, PERP_DEX_TRADERS, INITIAL_PERP_DEX_TRADER_ID } from '../data/perpDexMarketContent';
import { PERPDEXDAY_STRINGS, type I18nProps } from '../i18n/strings/perpdexday';
import { formatClock, formatPercent, formatPill, formatPoint, formatTime, moveOf } from '../market/format';
import { PERP_DEX_IDS, OPEN_PRICES, chanceOf, quote as priceOf, rankOf, returnOf, totalAsset, type MarketId } from '../market/perpdexday/market';
import { createOperators, myPlace, rankTraders, type Field } from '../market/leaderboard';
import { useOrderDesk } from '../market/useOrderDesk';
import { phaseOf, secondsLeftOf, statusOf, useMarket } from '../market/perpdexday/useMarket';

type PerpDexDayMarketPageProps = Omit<I18nProps, 't'> & {
  onBack(): void;
};

const traderOf = (id: MarketId) => PERP_DEX_TRADERS.find((candidate) => candidate.id === id) ?? PERP_DEX_TRADERS[0];

/* The simulated field has to hold this line-up's markets. Opened against another board's ids it
   prices at undefined and every rank reads NaN. */
const PERP_DEX_FIELD: Field = { ids: PERP_DEX_IDS, openPrices: OPEN_PRICES, startingPoint: STARTING_POINT };

export function PerpDexDayMarketPage({ onBack, lang, onLangChange }: PerpDexDayMarketPageProps) {
  const t = PERPDEXDAY_STRINGS[lang];
  const { state, fill } = useMarket();
  const [operators] = useState(() => createOperators(PERP_DEX_FIELD));

  const { balances, prices, holdings, settlement, point } = state;
  const { focusId, side, direction, pending, notice, askQuote, cancel, confirm, pick, focusSeat, chooseSide, chooseDirection } = useOrderDesk({
    initialId: INITIAL_PERP_DEX_TRADER_ID,
    prices,
    fill,
    describeFill: (order) => t.filled(order.orderSide, order.quantity, order.positionSide, traderOf(order.marketId).trader, order.unitPrice),
  });
  const phase = phaseOf(state);
  const tradable = phase === 'live';
  const focus = traderOf(focusId);
  const asset = totalAsset(point, holdings, prices);
  const ranks = useMemo(() => rankTraders(operators, prices, { name: 'YOU', point, holdings }, STARTING_POINT), [operators, prices, point, holdings]);
  const place = myPlace(ranks);
  /* The overview bar and the sidebar card both read the trader the ticket is pointed at. */
  const chance = chanceOf(prices, focusId);
  const focusYes = priceOf(prices, focusId, 'yes', direction);
  const focusNo = priceOf(prices, focusId, 'no', direction);

  return (
    <div className="market-page">
      <header className="market-header">
        <BackLink className="market-back" label={t.marketBack} onClick={onBack} />
        <div className="market-header-end"><span>{t.marketTag}</span><LangToggle lang={lang} onChange={onLangChange} t={t} /></div>
      </header>

      <main>
        <section className="market-feature">
          <AsciiArt className="market-hero-art" recipe={ASCII_D60_HERO} />
        </section>

        <section className="market-content" aria-labelledby="market-title">
          <div className="market-intro">
            <h1 id="market-title">{t.marketTitle}</h1>
            <dl className="market-spec">
              {t.marketSpec(COMPETITION_SECONDS / 60, STARTING_POINT, SETTLEMENT_PRICE).map((row) => (
                <div key={row.term}><dt>{row.term}</dt><dd>{row.detail}</dd></div>
              ))}
            </dl>
          </div>

          <article className="market-card market-overview">
            <p className="market-state" data-phase={phase}><i aria-hidden="true" /><span className="visually-hidden">{t.statusLabel} </span>{t.phaseName(phase)}</p>

            <dl className="market-bar">
              <div><dt>{t.availablePoint}</dt><dd>{formatPoint(point)} pt</dd></div>
              <div><dt>{t.totalAsset}</dt><dd>{formatPoint(asset)} pt</dd></div>
              <div className="market-place"><dt>{t.myRank}</dt><dd>#{place}</dd></div>
              <div><dt>{phase === 'live' ? t.remaining : t.closedAt}</dt><dd>{phase === 'live' ? <time>{formatClock(secondsLeftOf(state))}</time> : formatTime(state.closeAt)}</dd></div>
            </dl>

            <ChanceBar t={t} name={focus.trader} chance={chance} yesPrice={focusYes} noPrice={focusNo} />
          </article>

          {settlement && <SettledBanner
            t={t}
            winners={settlement.winners.map((id) => traderOf(id).trader)}
            totalPrice={SETTLEMENT_PRICE}
            payout={settlement.payout}
            point={point}
          />}

          <div className="market-layout">
            <div className="market-main">
              <section className="market-traders market-card" aria-labelledby="traders-title">
                <h3 id="traders-title">{t.traderTableCaption}</h3>
                <TraderTable onFocusSeat={focusSeat} onPick={pick} rows={PERP_DEX_TRADERS.map((candidate) => ({
                  balance: balances[candidate.id],
                  candidate,
                  focused: candidate.id === focusId,
                  noPrice: priceOf(prices, candidate.id, 'no', direction),
                  percent: returnOf(balances[candidate.id]),
                  probability: chanceOf(prices, candidate.id),
                  rank: rankOf(balances, candidate.id),
                  status: statusOf(state, candidate.id),
                  tradable: tradable && statusOf(state, candidate.id) !== 'stale',
                  yesPrice: priceOf(prices, candidate.id, 'yes', direction),
                }))} t={t} />
              </section>

              <MarketChart t={t} traders={PERP_DEX_TRADERS} focusId={focusId} history={state.history} />

              <PositionsSection
                t={t}
                traders={PERP_DEX_TRADERS}
                holdings={holdings}
                prices={prices}
                winners={settlement ? settlement.winners : null}
                tradable={tradable}
                onSell={(id, positionSide, quantity) => askQuote(id, positionSide, 'sell', quantity)}
                point={point}
                startingPoint={STARTING_POINT}
              />

              <Leaderboard t={t} ranks={ranks} final={phase === 'ended'} />

              <RulesSection t={t} rows={[
                { term: t.rulesWinnerLabel, detail: t.rulesResolve(SETTLEMENT_PRICE) },
                { term: t.rulesRewardLabel, detail: t.rulesReward(REWARD_TOP, REWARD_FIRST_USDT) },
                { term: t.rulesPointsLabel, detail: t.rulesDisclaimer },
              ]} />
            </div>

            <aside className="market-side">
              <OrderTicket
                candidate={focus}
                direction={direction}
                holdings={holdings}
                key={focus.id}
                notice={notice}
                now={state.time}
                onCancel={cancel}
                onConfirm={confirm}
                onDirectionChange={chooseDirection}
                onRequestQuote={(quantity, orderSide) => askQuote(focusId, side, orderSide, quantity)}
                onSideChange={chooseSide}
                tradable={tradable}
                point={point}
                prices={prices}
                quote={pending}
                side={side}
                status={statusOf(state, focus.id)}
                t={t}
              />

              <section className="market-focus market-card" aria-labelledby="focus-title">
                <h3 id="focus-title">{focus.trader}</h3>
                <dl>
                  <div><dt>{t.marginBalance}</dt><dd>{formatPill(balances[focusId])} <span>USDT</span></dd></div>
                  <div><dt>{t.traderReturn}</dt><dd data-move={moveOf(returnOf(balances[focusId]))}>{formatPercent(returnOf(balances[focusId]))}</dd></div>
                  <div><dt>{t.currentRank}</dt><dd>#{rankOf(balances, focus.id)}</dd></div>
                  <div><dt>{t.marketProbability}</dt><dd>{chance}%</dd></div>
                </dl>
              </section>
            </aside>
          </div>
        </section>

        <section className="market-brand-card">
          <div className="market-brand-art" aria-hidden="true"><AsciiArt recipe={ASCII_LOG_LEET} /></div>
          <div className="market-brand-copy"><h2>{t.marketBrandTitle}</h2><p>{t.marketBrandCopy}</p><a href="#top" onClick={onBack}>{t.marketBack} <ArrowIcon /></a></div>
        </section>
      </main>

      <footer className="market-footer"><span>PERP-DEX DAY</span><span>{t.footerRights}</span><div><img src="/assets/market/figma/sns=telegram.svg" alt="Telegram" /><img src="/assets/market/figma/sns=x.svg" alt="X" /></div></footer>
    </div>
  );
}
