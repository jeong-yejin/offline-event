import { useState, type FormEvent } from 'react';
import { ArrowIcon } from '../components/ArrowIcon';
import { BackLink } from '../components/BackLink';
import { LangToggle } from '../components/LangToggle';
import { isEmailAddress } from '../data/token2049Content';
import { savePolymarketAddress } from '../auth/polymarketAccount';
import { TOKEN2049_STRINGS, type I18nProps } from '../i18n/strings/token2049';

type Token2049PolymarketPageProps = Omit<I18nProps, 't'> & {
  onBack(): void;
  /* Most readers reach this screen from the gate over Pulse, so the done state has to lead back there
     rather than dropping them on the landing page to find the market a second time. */
  onOpenMarket(): void;
};

/* Reward eligibility, collected before the competition so the page can be promoted on its own. Nothing
   here signs the reader in to Polymarket: the address is stated, and Polymarket checks it against its own
   accounts after the final leaderboard is fixed. Saving therefore moves the reader to PENDING and no
   further, because VERIFIED and REJECTED are Polymarket's answers to give. */
export function Token2049PolymarketPage({ lang, onLangChange, onBack, onOpenMarket }: Token2049PolymarketPageProps) {
  const t = TOKEN2049_STRINGS.en;
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  function submit(submitEvent: FormEvent) {
    submitEvent.preventDefault();
    if (!isEmailAddress(draft)) {
      setError(t.t2049PolymarketErrorEmail);
      return;
    }
    setError('');
    const address = draft.trim();
    /* The gate over Pulse reads this back. Nothing is verified by saving it, so the board opens on a
       stated address rather than a checked one, which is the whole of the stand-in. */
    savePolymarketAddress(address);
    setSaved(address);
  }

  return (
    <div className="t2049-polymarket-page">
      <header className="market-header">
        <BackLink className="market-back" label={t.t2049PolymarketBack} onClick={onBack} />
        <div className="market-header-end"><span>{t.t2049PolymarketTag}</span><LangToggle lang={lang} onChange={onLangChange} t={t} /></div>
      </header>

      <main>
        <section className="polymarket-content" aria-labelledby="t2049-polymarket-title">
          {/* What the address is for on the left, the field on the right. */}
          <div className="polymarket-brief">
            <div className="polymarket-intro">
              <h1 id="t2049-polymarket-title">{t.t2049PolymarketPageTitle}</h1>
              <p>{t.t2049PolymarketPageCopy}</p>
            </div>

            <ol className="polymarket-flow" aria-label={t.t2049PolymarketFlowLabel}>
              {t.t2049PolymarketFlow.map((step) => <li key={step}><span aria-hidden="true" /><p>{step}</p></li>)}
            </ol>

            {/* The flow ends on the reward, so who can be paid is said there and not beside the field. */}
            <p className="polymarket-payout">{t.t2049PolymarketPayoutNote}</p>
          </div>

          {saved ? (
            <div className="polymarket-done" role="status">
              <p className="polymarket-pill" data-status="PENDING">{t.t2049PolymarketCurrent}: {t.t2049PolymarketStatusName('PENDING')}</p>
              <h2>{t.t2049PolymarketDoneTitle}</h2>
              <p>{t.t2049PolymarketDoneCopy}</p>
              <dl><div><dt>{t.t2049PolymarketDoneEmail}</dt><dd>{saved}</dd></div></dl>
              <div className="polymarket-done-actions">
                <button className="polymarket-done-go" type="button" onClick={onOpenMarket}>{t.t2049PolymarketToMarket}<ArrowIcon /></button>
                <button className="outline-button" type="button" onClick={() => { setDraft(saved); setSaved(''); }}>{t.t2049PolymarketAgain}<ArrowIcon /></button>
              </div>
            </div>
          ) : (
            <form className="polymarket-form" onSubmit={submit} aria-label={t.t2049PolymarketFormLabel} noValidate>
              <div className="polymarket-field">
                <label htmlFor="polymarket-email">{t.t2049PolymarketEmailLabel}</label>
                <input
                  aria-describedby="polymarket-email-hint"
                  aria-invalid={error ? 'true' : 'false'}
                  autoComplete="email"
                  id="polymarket-email"
                  inputMode="email"
                  onChange={(changeEvent) => { setDraft(changeEvent.target.value); setError(''); }}
                  placeholder="you@example.com"
                  spellCheck={false}
                  type="email"
                  value={draft}
                />
                <p className="polymarket-hint" id="polymarket-email-hint">{t.t2049PolymarketEmailHint}</p>
              </div>

              <p className="polymarket-error" role="alert">{error}</p>

              <button className="outline-button polymarket-submit" type="submit">{t.t2049PolymarketSubmit}<ArrowIcon /></button>
              <p className="polymarket-note">{t.t2049PolymarketNote}</p>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
