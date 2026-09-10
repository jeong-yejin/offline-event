import { useEffect, useMemo, useState } from 'react';
import { BackLink } from '../components/BackLink';
import { LangToggle } from '../components/LangToggle';
import { WONDERLAND_STRINGS, type I18nProps } from '../i18n/strings/wonderland';
import { formatClock, formatScore, formatScorePercent, formatSignedScore, formatStamp, formatTime, moveOf } from '../market/format';
import { boardAt, elapsedAt, feedCut, HEAT_END, HEAT_START, phaseAt, remainingAt } from '../market/wonderlandBoard';

type WonderlandBoardPageProps = Omit<I18nProps, 't'> & {
  onBack(): void;
};

/* Each seat carries a portrait rather than its suit mark, so the trader column reads as a field of
   people. The file is named after the handle, and its ground keeps the seat's suit colour. */
const portraitOf = (handle: string) => `/assets/wonderland/traders/${handle.toLowerCase().replace(/ /g, '-')}.svg`;
const CLIMB_GLYPH = { up: '▲', down: '▼', flat: '·' } as const;

export function WonderlandBoardPage({ onBack, lang, onLangChange }: WonderlandBoardPageProps) {
  const t = WONDERLAND_STRINGS[lang];
  const [now, setNow] = useState(() => Date.now());

  /* The second hand is the page, so the tick runs for as long as the board is mounted. */
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const phase = phaseAt(now);
  const elapsed = elapsedAt(now);
  const rows = useMemo(() => boardAt(elapsed), [elapsed]);
  const mine = rows.find((row) => row.mine) ?? rows[0];
  const cut = feedCut(rows);
  const note = t.wonderlandNote(phase);

  return (
    <div className="wonder-page">
      <header className="wonder-header">
        <BackLink className="wonder-back" label={t.wonderlandBack} onClick={onBack} />
        <div className="wonder-header-end"><span>SEP 29 2026</span><LangToggle lang={lang} onChange={onLangChange} t={t} /></div>
      </header>

      <main className="wonder-main">
        {/* My own numbers first, then whether the heat is running at all. Both answers come before the
            title, so a trader who opened the page mid-heat reads their own row without scrolling. */}
        <section className="wonder-dashboard" aria-label={t.wonderlandDashboardLabel}>
          <div className="wonder-competition">
            <p className="wonder-phase" data-phase={phase} role="status">
              <i aria-hidden="true" /><span className="visually-hidden">{t.wonderlandStatus} </span>{t.wonderlandPhaseName(phase)}
            </p>

            <dl className="wonder-facts">
              <div><dt>{t.wonderlandStarts}</dt><dd>{formatTime(HEAT_START)}</dd></div>
              <div><dt>{t.wonderlandEnds}</dt><dd>{formatTime(HEAT_END)}</dd></div>
              <div><dt>{t.wonderlandRemaining}</dt><dd>{formatClock(remainingAt(now))}</dd></div>
              <div><dt>{t.wonderlandLastUpdated}</dt><dd>{formatStamp(now)}</dd></div>
            </dl>
          </div>

          <div className="wonder-mine">
            <p className="wonder-mine-title">{t.wonderlandMyPerformance}</p>
            <p className="wonder-mine-profile">
              <img className="wonder-portrait" src={portraitOf(mine.handle)} width="16" height="16" alt="" />
              <span className="visually-hidden">{t.wonderlandProfile} </span>{mine.handle}
            </p>

            <dl className="wonder-mine-stats">
              <div><dt>{t.wonderlandOverallRank}</dt><dd>{mine.rank === null ? t.wonderlandUnscored : `#${mine.rank}`}</dd></div>
              <div><dt>{t.wonderlandMyScore}</dt><dd>{mine.score === null ? t.wonderlandUnscored : mine.score}</dd></div>
              <div><dt>{t.wonderlandMyPnl}</dt><dd data-move={moveOf(mine.pnl)}>{formatSignedScore(mine.pnl)}</dd></div>
              <div>
                <dt>{t.wonderlandMyReturn}</dt>
                <dd data-move={mine.competitionReturn === null ? 'flat' : moveOf(mine.competitionReturn)}>
                  {mine.competitionReturn === null ? t.wonderlandUnscored : formatScorePercent(mine.competitionReturn)}
                </dd>
              </div>
              <div><dt>{t.wonderlandMyNotional}</dt><dd>{formatScore(mine.notional)}</dd></div>
            </dl>
          </div>
        </section>

        <div className="wonder-head">
          <p className="wonder-eyebrow">{t.wonderlandEyebrow}</p>
          <h1 className="wonder-title">The Queen's Court</h1>
        </div>

        <div className="wonder-basis">
          <p>{t.wonderlandScoringNote}</p>
        </div>

        {/* Nothing marks the feed while it is working. The reader is only told when the numbers below
            have stopped being the market. */}
        {cut ? <p className="wonder-cut" role="alert">{t.wonderlandFeedCut}</p> : null}

        <section className="wonder-boards">
          <div className="wonder-board">
            <table>
              <caption className="visually-hidden">{t.wonderlandCaption}</caption>
              <thead>
                <tr>
                  <th scope="col">{t.wonderlandRank}</th>
                  <th scope="col">{t.wonderlandTrader}</th>
                  <th scope="col">{t.wonderlandScore}</th>
                  <th scope="col">{t.wonderlandPnl}</th>
                  <th scope="col">{t.wonderlandReturn}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr data-mine={row.mine ? 'true' : 'false'} data-place={row.rank ?? undefined} key={row.handle}>
                    <td className="wonder-place">
                      {row.rank === null ? '—' : `#${row.rank}`}
                      <span className="wonder-climb" data-move={moveOf(row.climb)} aria-hidden="true">{CLIMB_GLYPH[moveOf(row.climb)]}</span>
                    </td>
                    <td className="wonder-name">
                      <img className="wonder-portrait" src={portraitOf(row.handle)} width="16" height="16" alt="" />
                      <span>{row.handle}</span>
                      {row.rank === 1 ? <em>QUEEN'S FAVOUR</em> : null}
                      {row.mine ? <em className="wonder-tag-mine">{t.wonderlandMine}</em> : null}
                    </td>
                    <td className="wonder-score">{row.score === null ? t.wonderlandUnscored : row.score}</td>
                    <td className="wonder-pnl" data-move={moveOf(row.pnl)}>{formatSignedScore(row.pnl)}</td>
                    <td className="wonder-return" data-move={row.competitionReturn === null ? 'flat' : moveOf(row.competitionReturn)}>
                      {row.competitionReturn === null ? t.wonderlandUnscored : formatScorePercent(row.competitionReturn)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {note ? <p className="wonder-note">{note}</p> : null}
      </main>

      <footer className="wonder-footer"><span>REBOUNDX IN WONDERLAND</span><span>SJ KUNSTHALLE · SEOUL</span></footer>
    </div>
  );
}
