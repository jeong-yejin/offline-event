import { T2049Section } from './T2049Section';
import { T2049_SEATS } from '../../data/token2049Content';
import { revealStyle } from '../../motion/reveal';
import type { Strings } from '../../i18n/strings/token2049';

/* One card per seat. Traders enter on their own, so the card carries the seat and its status and has
   nothing above it to group by. */
export function T2049Field({ t }: { t: Strings }) {
  return (
    <T2049Section id="traders" name="field" eyebrow={t.t2049LiveEyebrow} title={t.t2049LiveTitle} headerContent={
      <p className="t2049-lede slideIn" data-motion-reveal style={revealStyle(120)}>{t.t2049TradersCopy}</p>
    }>
      <ul className="t2049-trader-grid">
        {Array.from({ length: T2049_SEATS }, (_, seat) => <li className="slideIn" data-motion-reveal key={seat} style={revealStyle(140 + seat * 60)}>
          <strong>{t.t2049TraderSlot(seat + 1)}</strong>
          <span>{t.t2049Tbd}</span>
        </li>)}
      </ul>
    </T2049Section>
  );
}
