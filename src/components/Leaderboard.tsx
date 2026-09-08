import { useEffect, useState } from 'react';
import type { Strings } from '../i18n/strings';
import { formatPercent, formatPoint, formatSigned, moveOf } from '../market/format';
import { visibleRanks, type Rank } from '../market/leaderboard';

/* Same katakana set the hero rain uses, so a decoding rank reads as one effect with the page. */
const GLYPHS = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍｦｲｸｺｿﾁﾄﾉﾌﾔﾖﾙﾚﾛﾝ0123456789';
const SCRAMBLE_STEPS = 6;
const SCRAMBLE_INTERVAL = 60;

const mask = (value: string) => Array.from(value, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join('');

/* A place only changes when the market reorders someone, so the decode marks a real event. */
function Scramble({ value }: { value: string }) {
  const [glyphs, setGlyphs] = useState('');

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    let left = SCRAMBLE_STEPS;
    setGlyphs(mask(value));
    const timer = window.setInterval(() => {
      left -= 1;
      setGlyphs(left > 0 ? mask(value) : '');
      if (left <= 0) window.clearInterval(timer);
    }, SCRAMBLE_INTERVAL);
    return () => {
      window.clearInterval(timer);
      setGlyphs('');
    };
  }, [value]);

  return <span data-scramble={glyphs ? 'true' : 'false'}>{glyphs || value}</span>;
}

type LeaderboardProps = {
  t: Strings;
  ranks: readonly Rank[];
  final: boolean;
};

export function Leaderboard({ t, ranks, final }: LeaderboardProps) {
  const rows = visibleRanks(ranks);

  return (
    <section className="leaderboard" aria-labelledby="leaderboard-title">
      <h3 id="leaderboard-title">{final ? t.leaderFinalTitle : t.leaderTitle}</h3>
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
          {rows.map((row) => <tr data-you={row.you ? 'true' : 'false'} key={row.name}>
            <td className="leader-place">{final ? row.place : <Scramble value={String(row.place)} />}</td>
            <td className="leader-name"><span>{row.you ? t.leaderYou : row.name}</span>{row.place === 1 ? <em>THE ONE</em> : null}</td>
            <td className="leader-net">{formatPoint(row.asset)} pt</td>
            <td className="leader-pnl" data-move={moveOf(row.pnl)}>{formatSigned(row.pnl)}</td>
            <td className="leader-return" data-move={moveOf(row.percent)}>{formatPercent(row.percent)}</td>
          </tr>)}
        </tbody>
      </table>
      <p className="leaderboard-note">{final ? t.leaderFinalNote : t.leaderNote}</p>
    </section>
  );
}
