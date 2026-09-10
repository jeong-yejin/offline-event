import { useState, type FormEvent } from 'react';
import { ArrowIcon } from '../components/ArrowIcon';
import { BackLink } from '../components/BackLink';
import { LangToggle } from '../components/LangToggle';
import {
  T2049_SEATS_PER_TEAM,
  T2049_TEAM_TIERS,
  TOKEN2049_TEAMS,
  formatInvitationCode,
  isInvitationCode,
  teamsInTier,
  type TeamTier,
} from '../data/token2049Content';
import { TOKEN2049_STRINGS, type I18nProps } from '../i18n/strings/token2049';

type Token2049TeamsPageProps = Omit<I18nProps, 't'> & {
  onBack(): void;
};

const TIERS: readonly TeamTier[] = ['founding', 'partner'];
const SEATS = Array.from({ length: T2049_SEATS_PER_TEAM }, (_, seat) => seat + 1);

type Draft = { code: string; traders: readonly string[] };
const EMPTY: Draft = { code: '', traders: SEATS.map(() => '') };

/* Team slots were filled by tier before the event, so this screen confirms a team that already has a
   place rather than taking applications. The invitation code is what proves the reader is one of those
   exchanges, and the tier contact verifies it after the form is sent. */
export function Token2049TeamsPage({ lang, onLangChange, onBack }: Token2049TeamsPageProps) {
  const t = TOKEN2049_STRINGS.en;
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState('');

  const openSlots = TOKEN2049_TEAMS.filter((status) => status === 'open').length;
  const code = draft.code.trim().toUpperCase();

  const setTrader = (seat: number, name: string) => {
    setDraft((current) => ({ ...current, traders: current.traders.map((item, index) => (index === seat ? name : item)) }));
    setError('');
  };

  /* Both checks run against the same submit so the reader never fixes one field, submits, and meets
     the next complaint. The first failing message is the one that names the field they are in. */
  function submit(submitEvent: FormEvent) {
    submitEvent.preventDefault();
    if (!isInvitationCode(code)) {
      setError(t.t2049TeamsErrorCode);
      return;
    }
    if (draft.traders.some((name) => name.trim() === '')) {
      setError(t.t2049TeamsErrorTrader);
      return;
    }
    setError('');
    setConfirmed(code);
  }

  return (
    <div className="t2049-teams-page">
      <header className="market-header">
        <BackLink className="market-back" label={t.t2049TeamsBack} onClick={onBack} />
        <div className="market-header-end"><span>{t.t2049TeamsTag}</span><LangToggle lang={lang} onChange={onLangChange} t={t} /></div>
      </header>

      <main>
        <section className="teams-content" aria-labelledby="t2049-teams-title">
          {/* What the screen is on the left, what the reader has to do on the right, so the two stay
              side by side instead of stacking the form under the copy on a wide window. */}
          <div className="teams-brief">
            <div className="teams-intro">
              <h1 id="t2049-teams-title">{t.t2049TeamsPageTitle}</h1>
              <p>{t.t2049TeamsPageCopy}</p>
            </div>

            <dl className="teams-tiers" aria-label={t.t2049TeamsTierLabel}>
              {TIERS.map((tier) => (
                <div key={tier}>
                  <dt>{t.t2049TeamsTierName(tier)}</dt>
                  <dd>{t.t2049TeamsTierSeats(teamsInTier(tier), T2049_SEATS_PER_TEAM)}</dd>
                </div>
              ))}
              <div><dt>{t.t2049EntryDeadline}</dt><dd>{t.t2049Tba}</dd></div>
            </dl>
          </div>

          {confirmed ? (
            <div className="teams-done" role="status">
              <h2>{t.t2049TeamsDoneTitle}</h2>
              <p>{t.t2049TeamsDoneCopy}</p>
              <dl><div><dt>{t.t2049TeamsDoneCode}</dt><dd>{confirmed}</dd></div></dl>
              <ol className="teams-roster">
                {draft.traders.map((name, seat) => <li key={seat}><span>{t.t2049TeamsTraderLabel(seat + 1)}</span><strong>{name.trim()}</strong></li>)}
              </ol>
              <button className="outline-button" type="button" onClick={onBack}>{t.t2049TeamsBack}<ArrowIcon /></button>
            </div>
          ) : (
            <form className="teams-form" onSubmit={submit} aria-label={t.t2049TeamsFormLabel} noValidate>
              <p className="teams-slots">{t.t2049EntrySlots(openSlots)}</p>

              <div className="teams-field">
                <label htmlFor="team-code">{t.t2049TeamsCodeLabel}</label>
                <input
                  aria-describedby="team-code-hint"
                  aria-invalid={error === t.t2049TeamsErrorCode ? 'true' : 'false'}
                  autoComplete="off"
                  id="team-code"
                  onChange={(changeEvent) => { setDraft((current) => ({ ...current, code: formatInvitationCode(changeEvent.target.value) })); setError(''); }}
                  placeholder="TIER-XXXX-XXXX"
                  spellCheck={false}
                  type="text"
                  value={draft.code}
                />
                <p className="teams-hint" id="team-code-hint">{t.t2049TeamsCodeHint}</p>
              </div>

              {SEATS.map((seat) => (
                <div className="teams-field" key={seat}>
                  <label htmlFor={`team-trader-${seat}`}>{t.t2049TeamsTraderLabel(seat)}</label>
                  <input
                    aria-describedby={seat === 1 ? 'team-trader-hint' : undefined}
                    aria-invalid={error === t.t2049TeamsErrorTrader && draft.traders[seat - 1].trim() === '' ? 'true' : 'false'}
                    autoComplete="off"
                    id={`team-trader-${seat}`}
                    onChange={(changeEvent) => setTrader(seat - 1, changeEvent.target.value)}
                    type="text"
                    value={draft.traders[seat - 1]}
                  />
                  {seat === 1 ? <p className="teams-hint" id="team-trader-hint">{t.t2049TeamsTraderHint}</p> : null}
                </div>
              ))}

              <p className="teams-error" role="alert">{error}</p>

              <button className="outline-button" type="submit">{t.t2049TeamsSubmit}<ArrowIcon /></button>
              <p className="teams-note">{t.t2049TeamsClosedNote}</p>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
