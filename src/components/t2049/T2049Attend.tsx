import { T2049Section } from './T2049Section';
import { TOKEN2049_AGENDA } from '../../data/token2049Content';
import type { Strings } from '../../i18n/strings/token2049';

export function T2049Attend({ t }: { t: Strings }) {
  const venue = [
    [t.t2049VenueDate, t.t2049DateValue],
    [t.t2049VenuePlace, t.t2049VenueValue],
    [t.t2049VenueAdmission, t.t2049AdmissionValue],
  ];
  return (
    <T2049Section id="venue" name="venue" eyebrow={t.t2049VenueEyebrow} title={t.t2049VenueTitle} headerContent={
      <dl className="t2049-venue-list" aria-label={t.t2049VenueLabel}>{venue.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>
    }>
      <p className="t2049-lede">{t.t2049VenueCopy}</p>
      <h2 className="t2049-block-title">{t.agendaTitle}</h2>
      <div className="agenda-list">{TOKEN2049_AGENDA.map(([time, title]) => <div className="agenda-row" key={time}>
        <time>{time}</time><div><strong>{title}</strong></div>
      </div>)}</div>
    </T2049Section>
  );
}
