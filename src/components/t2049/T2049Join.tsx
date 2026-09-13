import { T2049Section } from './T2049Section';
import type { Strings } from '../../i18n/strings/token2049';

export function T2049Join({ t }: { t: Strings }) {
  return (
    <T2049Section id="rsvp" name="join" eyebrow={t.t2049RsvpEyebrow} title={t.t2049RsvpTitle}>
      <div className="t2049-rsvp">
        <p className="t2049-lede">{t.t2049RsvpCopy}</p>
        <ul className="t2049-points">{t.t2049RsvpPoints.map((point) => <li key={point}>{point}</li>)}</ul>
      </div>
    </T2049Section>
  );
}
