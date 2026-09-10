import { T2049Arrow } from './T2049Arrow';
import { T2049Section } from './T2049Section';
import { TOKEN2049_TEAMS } from '../../data/token2049Content';
import type { Strings } from '../../i18n/strings/token2049';

export function T2049Join({ t, onEnterTeams }: { t: Strings; onEnterTeams(): void }) {
  const openSlots = TOKEN2049_TEAMS.filter((status) => status === 'open').length;
  return (
    <T2049Section id="rsvp" name="join" eyebrow={t.t2049RsvpEyebrow} title={t.t2049RsvpTitle} afterBody={
      <div className="t2049-entry-wrap">
        <aside className="t2049-entry" id="entry" aria-labelledby="t2049-entry-title">
          <div className="t2049-entry-inner">
            <div className="t2049-entry-summary">
              <p className="eyebrow">{t.t2049EntryEyebrow}</p>
              <h2 className="t2049-block-title" id="t2049-entry-title">{t.t2049EntrySlots(openSlots)}</h2>
              <p className="t2049-entry-copy">{t.t2049EntryCopy}</p>
              <button className="outline-button t2049-entry-cta" type="button" onClick={onEnterTeams}>{t.t2049EntryCta}<T2049Arrow /></button>
              <dl className="t2049-entry-meta"><div><dt>{t.t2049EntryDeadline}</dt><dd>{t.t2049Tba}</dd></div></dl>
            </div>
            <div className="t2049-entry-benefits">
              <h3 className="t2049-subtitle">{t.t2049EntryReceives}</h3>
              <ul className="t2049-points">{t.t2049EntryPoints.map((point) => <li key={point}>{point}</li>)}</ul>
            </div>
          </div>
        </aside>
      </div>
    }>
      <div className="t2049-rsvp">
        <p className="t2049-lede">{t.t2049RsvpCopy}</p>
        <ul className="t2049-points">{t.t2049RsvpPoints.map((point) => <li key={point}>{point}</li>)}</ul>
      </div>
    </T2049Section>
  );
}
