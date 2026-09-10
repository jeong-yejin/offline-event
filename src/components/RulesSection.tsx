import type { Strings } from '../i18n/strings/market';

export type RuleRow = {
  term: string;
  detail: string;
};

/* The rules each competition settles under. The rows come from the page because the two events
   resolve differently: one cuts seats along the way, the other only settles at the close. */
export function RulesSection({ t, rows }: { t: Strings; rows: readonly RuleRow[] }) {
  return (
    <section className="market-rules market-card" aria-labelledby="rules-title">
      <h3 id="rules-title">{t.rulesTitle}</h3>
      <dl className="rules-list">
        {rows.map((row) => <div key={row.term}><dt>{row.term}</dt><dd>{row.detail}</dd></div>)}
      </dl>
    </section>
  );
}
