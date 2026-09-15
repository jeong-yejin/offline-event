import { T2049Section } from './T2049Section';
import { TOKEN2049_AGENDA } from '../../data/token2049Content';
import { revealStyle } from '../../motion/reveal';
import type { Strings } from '../../i18n/strings/token2049';

export function T2049Attend({ t }: { t: Strings }) {
  const venue = [
    [t.t2049VenueDate, t.t2049DateValue],
    [t.t2049VenuePlace, t.t2049VenueValue],
    [t.t2049VenueAdmission, t.t2049AdmissionValue],
  ];
  return (
    <T2049Section id="venue" name="venue" eyebrow={t.t2049VenueEyebrow} title={t.t2049VenueTitle} headerContent={<>
      <p className="t2049-lede slideIn" data-motion-reveal style={revealStyle(120)}>{t.t2049VenueCopy}</p>
      <dl className="t2049-venue-list" aria-label={t.t2049VenueLabel}>{venue.map(([term, value], index) => <div className="slideIn" data-motion-reveal key={term} style={revealStyle(160 + index * 70)}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>
    </>}>
      <h2 className="t2049-block-title slideIn" data-motion-reveal style={revealStyle(120)}>{t.agendaTitle}</h2>
      <p className="t2049-agenda-note slideIn" data-motion-reveal style={revealStyle(180)}>{t.t2049AgendaNote}</p>
      {/* 40ms a row, not the 70 the shorter lists use: at 11 rows a wider step leaves the last row
          sitting blank for most of a second after it is already on screen. */}
      <div className="agenda-list">{TOKEN2049_AGENDA.map(([time, title, note], index) => <div className="agenda-row slideIn" data-motion-reveal key={time} style={revealStyle(160 + index * 40)}>
        <time>{time}</time><div><strong>{title}</strong>{note ? <p>{note}</p> : null}</div>
      </div>)}</div>
      <h2 className="t2049-block-title slideIn" data-motion-reveal style={revealStyle(120)}>{t.t2049PulseTitle}</h2>
      <ul className="t2049-pulse-rules">{t.t2049PulseRules.map((rule, index) => <li className="slideIn" data-motion-reveal key={rule} style={revealStyle(160 + index * 70)}>{rule}</li>)}</ul>
    </T2049Section>
  );
}
