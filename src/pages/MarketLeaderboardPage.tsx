import { Fragment, useRef } from 'react';
import { BackLink } from '../components/BackLink';
import { LangToggle } from '../components/LangToggle';
import type { Strings as CommonStrings } from '../i18n/strings/common';
import type { Strings as MarketStrings } from '../i18n/strings/market';
import type { Lang } from '../i18n/types';
import { formatPercent, formatPoint, formatSigned, moveOf } from '../market/format';
import { myPlace, type Rank } from '../market/leaderboard';

/* Both markets hand this page their own dictionary, which is the market block plus the site-wide
   common block. The header and footer read from common, the board itself from market. */
type BoardStrings = MarketStrings & CommonStrings;

type MarketLeaderboardPageProps = {
  t: BoardStrings;
  lang: Lang;
  onLangChange: ((lang: Lang) => void) | null;
  /* The market page's own header tag and footer wordmark, so the board reads as part of that
     competition rather than as a screen the site shows for every event. */
  brand: string;
  tag: string;
  /* PERPS DAY carries its own type pair through a page class. */
  className?: string;
  onBack(): void;
  ranks: readonly Rank[];
  final: boolean;
  rewardTop: number;
};

export function MarketLeaderboardPage({ t, lang, onLangChange, brand, tag, className, onBack, ranks, final, rewardTop }: MarketLeaderboardPageProps) {
  const mineRow = useRef<HTMLTableRowElement>(null);
  const mine = ranks.find((rank) => rank.you);
  const place = myPlace(ranks);
  /* The reward line only means something while there are ranks under it. */
  const cutAt = ranks.length > rewardTop ? rewardTop : 0;

  /* A field this deep puts your own row below the fold most of the time. Scrolling alone leaves a
     keyboard reader where they were, so the row takes focus as well as the viewport. */
  function jumpToMine() {
    const row = mineRow.current;
    if (!row) return;
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    row.scrollIntoView({ block: 'center', behavior: still ? 'auto' : 'smooth' });
    row.focus({ preventScroll: true });
  }

  return (
    <div className={className ? `market-page board-page ${className}` : 'market-page board-page'}>
      <header className="market-header">
        <BackLink className="market-back" label={t.boardBack} onClick={onBack} />
        <div className="market-header-end"><span>{tag}</span><LangToggle lang={lang} onChange={onLangChange} t={t} /></div>
      </header>

      <main>
        <section className="market-content" aria-labelledby="board-title">
          <div className="board-intro">
            <h1 id="board-title">{final ? t.boardFinalTitle : t.boardTitle}</h1>
            <p>{(final ? t.boardFinalCaption : t.boardCaption)(ranks.length, rewardTop)}</p>
          </div>

          <article className="market-card board-summary">
            <dl className="market-bar">
              <div><dt>{t.boardPlayers}</dt><dd>{formatPoint(ranks.length)}</dd></div>
              <div className="market-place"><dt>{t.myRank}</dt><dd>#{place}</dd></div>
              <div><dt>{t.totalAsset}</dt><dd>{mine ? `${formatPoint(mine.asset)} pt` : '—'}</dd></div>
              <div><dt>{t.leaderReturn}</dt><dd data-move={mine ? moveOf(mine.percent) : 'flat'}>{mine ? formatPercent(mine.percent) : '—'}</dd></div>
            </dl>
            <button className="board-jump" type="button" onClick={jumpToMine}>{t.boardJump}</button>
          </article>

          {/* The market page's board scrambles a place when it changes, which reads as an event on ten
              rows. Across the whole field it would be dozens of timers redrawing every second, so the
              full board prints its places plainly. */}
          <section className="leaderboard board-table" aria-labelledby="board-table-title">
            <h2 className="visually-hidden" id="board-table-title">{t.leaderLabel}</h2>
            <table aria-label={t.leaderLabel}>
              <caption className="visually-hidden">{final ? t.leaderFinalCaption : t.leaderCaption}</caption>
              <thead>
                <tr>
                  <th scope="col">{t.leaderRank}</th>
                  <th scope="col">{t.leaderNickname}</th>
                  <th scope="col">{t.leaderAsset}</th>
                  <th scope="col">{t.leaderPnl}</th>
                  <th scope="col">{t.leaderReturn}</th>
                </tr>
              </thead>
              <tbody>
                {ranks.map((row) => <Fragment key={row.name}>
                  <tr data-you={row.you ? 'true' : 'false'} ref={row.you ? mineRow : undefined} tabIndex={row.you ? -1 : undefined}>
                    <td className="leader-place">{row.place}</td>
                    <td className="leader-name"><span>{row.you ? t.leaderYou : row.name}</span>{row.place === 1 ? <em>TOP PREDICTOR</em> : null}</td>
                    <td className="leader-net">{formatPoint(row.asset)} pt</td>
                    <td className="leader-pnl" data-move={moveOf(row.pnl)}>{formatSigned(row.pnl)}</td>
                    <td className="leader-return" data-move={moveOf(row.percent)}>{formatPercent(row.percent)}</td>
                  </tr>
                  {row.place === cutAt ? <tr className="board-cut"><td colSpan={5}>{t.boardCut(rewardTop)}</td></tr> : null}
                </Fragment>)}
              </tbody>
            </table>
            {final ? <p className="leaderboard-note">{t.leaderFinalNote}</p> : null}
          </section>
        </section>
      </main>

      <footer className="market-footer"><span>{brand}</span><span>{t.footerRights}</span></footer>
    </div>
  );
}
