import { useState, type FormEvent } from 'react';
import { ArrowIcon } from '../components/ArrowIcon';
import { BackLink } from '../components/BackLink';
import { LangToggle } from '../components/LangToggle';
import { isEmailAddress } from '../data/token2049Content';
import { TOKEN2049_STRINGS, type I18nProps } from '../i18n/strings/token2049';

type Token2049KalshiPageProps = Omit<I18nProps, 't'> & {
  onBack(): void;
};

/* Reward eligibility, collected before the competition so the page can be promoted on its own. Nothing
   here signs the reader in to Kalshi: the address is stated, and Kalshi checks it against its own
   accounts after the final leaderboard is fixed. Saving therefore moves the reader to PENDING and no
   further, because VERIFIED and REJECTED are Kalshi's answers to give. */
export function Token2049KalshiPage({ lang, onLangChange, onBack }: Token2049KalshiPageProps) {
  const t = TOKEN2049_STRINGS.en;
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  function submit(submitEvent: FormEvent) {
    submitEvent.preventDefault();
    if (!isEmailAddress(draft)) {
      setError(t.t2049KalshiErrorEmail);
      return;
    }
    setError('');
    setSaved(draft.trim());
  }

  return (
    <div className="t2049-kalshi-page">
      <header className="market-header">
        <BackLink className="market-back" label={t.t2049KalshiBack} onClick={onBack} />
        <div className="market-header-end"><span>{t.t2049KalshiTag}</span><LangToggle lang={lang} onChange={onLangChange} t={t} /></div>
      </header>

      <main>
        <section className="teams-content" aria-labelledby="t2049-kalshi-title">
          {/* What the address is for on the left, the field on the right, the same way the team screen
              splits its brief from its form. */}
          <div className="teams-brief">
            <div className="teams-intro">
              <h1 id="t2049-kalshi-title">{t.t2049KalshiPageTitle}</h1>
              <p>{t.t2049KalshiPageCopy}</p>
            </div>

            <ol className="kalshi-flow" aria-label={t.t2049KalshiFlowLabel}>
              {t.t2049KalshiFlow.map((step) => <li key={step}><span aria-hidden="true" /><p>{step}</p></li>)}
            </ol>

            {/* The flow ends on the reward, so who can be paid is said there and not beside the field. */}
            <p className="kalshi-payout">{t.t2049KalshiPayoutNote}</p>
          </div>

          {saved ? (
            <div className="teams-done" role="status">
              <p className="kalshi-pill" data-status="PENDING">{t.t2049KalshiCurrent}: {t.t2049KalshiStatusName('PENDING')}</p>
              <h2>{t.t2049KalshiDoneTitle}</h2>
              <p>{t.t2049KalshiDoneCopy}</p>
              <dl><div><dt>{t.t2049KalshiDoneEmail}</dt><dd>{saved}</dd></div></dl>
              <button className="outline-button" type="button" onClick={() => { setDraft(saved); setSaved(''); }}>{t.t2049KalshiAgain}<ArrowIcon /></button>
            </div>
          ) : (
            <form className="teams-form" onSubmit={submit} aria-label={t.t2049KalshiFormLabel} noValidate>
              <div className="teams-field">
                <label htmlFor="kalshi-email">{t.t2049KalshiEmailLabel}</label>
                <input
                  aria-describedby="kalshi-email-hint"
                  aria-invalid={error ? 'true' : 'false'}
                  autoComplete="email"
                  id="kalshi-email"
                  inputMode="email"
                  onChange={(changeEvent) => { setDraft(changeEvent.target.value); setError(''); }}
                  placeholder="you@example.com"
                  spellCheck={false}
                  type="email"
                  value={draft}
                />
                <p className="teams-hint" id="kalshi-email-hint">{t.t2049KalshiEmailHint}</p>
              </div>

              <p className="teams-error" role="alert">{error}</p>

              <button className="outline-button kalshi-submit" type="submit">{t.t2049KalshiSubmit}<ArrowIcon /></button>
              <p className="teams-note">{t.t2049KalshiNote}</p>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
