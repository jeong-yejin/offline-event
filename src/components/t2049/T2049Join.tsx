import { T2049Section } from './T2049Section';
import { revealStyle } from '../../motion/reveal';
import type { Strings } from '../../i18n/strings/token2049';

export function T2049Join({ t }: { t: Strings }) {
  return (
    <T2049Section id="rsvp" name="join" eyebrow={t.t2049RsvpEyebrow} title={t.t2049RsvpTitle}>
      <div className="t2049-rsvp">
        <p className="t2049-lede slideIn" data-motion-reveal style={revealStyle(120)}>{t.t2049RsvpCopy}</p>
        <ul className="t2049-points">{t.t2049RsvpPoints.map((point, index) => <li className="slideIn" data-motion-reveal key={point} style={revealStyle(160 + index * 80)}>{point}</li>)}</ul>
      </div>
    </T2049Section>
  );
}
