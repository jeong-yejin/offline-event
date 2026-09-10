import type { Lang } from '../i18n/types';
import { T2049Attend } from '../components/t2049/T2049Attend';
import { T2049Field } from '../components/t2049/T2049Field';
import { T2049Format } from '../components/t2049/T2049Format';
import { T2049Hero } from '../components/t2049/T2049Hero';
import { T2049Join } from '../components/t2049/T2049Join';
import { T2049Nav } from '../components/t2049/T2049Nav';
import { T2049Predict } from '../components/t2049/T2049Predict';
import type { EventContent } from '../data/eventContent';
import { TOKEN2049_STRINGS } from '../i18n/strings/token2049';

type Token2049PageProps = {
  event: EventContent;
  lang: Lang;
  onEnterKalshi(): void;
  onEnterMarket(): void;
  onEnterTeams(): void;
};

/* TOKEN2049 ships in English only. The site-wide toggle still runs the shared chrome around it,
   but everything inside this page reads the English dictionary and skips the Korean localisers.

   The page answers five questions in order: how the competition works, who is in it, how to play
   along, where and when to turn up, and how to get in. One section per question. */
export function Token2049Page({ event, onEnterKalshi, onEnterMarket, onEnterTeams }: Token2049PageProps) {
  const t = TOKEN2049_STRINGS.en;

  return (
    <div className="t2049-page">
      <T2049Hero event={event} t={t} onEnterMarket={onEnterMarket} onEnterTeams={onEnterTeams} />
      <T2049Nav t={t} />
      <T2049Format t={t} />
      <T2049Field t={t} onEnterTeams={onEnterTeams} />
      <T2049Predict t={t} onEnterKalshi={onEnterKalshi} onEnterMarket={onEnterMarket} />
      <T2049Attend t={t} />
      <T2049Join t={t} onEnterTeams={onEnterTeams} />

      <ul className="t2049-marquee">{t.t2049Marquee.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>
  );
}
