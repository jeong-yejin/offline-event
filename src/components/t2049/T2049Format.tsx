import { T2049Section } from './T2049Section';
import type { Strings } from '../../i18n/strings/token2049';

const RULE_ICONS = ['imgGroup', 'imgGroup1', 'imgGroup2'];

export function T2049Format({ t }: { t: Strings }) {
  const ladder = [
    { round: t.t2049Semifinal, detail: t.t2049SemifinalDetail, accent: 'cyan' },
    { round: t.t2049Intermission, detail: t.t2049IntermissionDetail, accent: 'magenta' },
    { round: t.t2049Final, detail: t.t2049FinalDetail, accent: 'cyan' },
  ];
  const rules = [
    [t.t2049SpecElimination, t.t2049SpecEliminationCopy],
    [t.t2049SpecRanking, t.t2049SpecRankingCopy],
    [t.t2049SpecBalance, t.t2049SpecBalanceCopy],
  ];
  return (
    <T2049Section id="competition" name="format" eyebrow={t.t2049Eyebrow} title={t.t2049Title}>
      <div className="t2049-format-summary">
        <p className="t2049-lede">{t.t2049Copy}</p>
        <p className="t2049-prize">{t.t2049SpecPrizeCopy}</p>
      </div>
      <ol className="t2049-ladder" aria-label={t.t2049LadderLabel}>
        {ladder.map(({ round, detail, accent }) => <li key={round} data-accent={accent}>
          <strong>{round}</strong><span className="visually-hidden">{detail}</span>
        </li>)}
      </ol>
      <dl className="t2049-spec" aria-label={t.t2049SpecLabel}>
        {rules.map(([term, copy], index) => <div key={term}>
          <dt><img src={`/assets/token2049/figma/${RULE_ICONS[index]}.svg`} width="36" height="36" alt="" aria-hidden="true" /><span>{term}</span></dt>
          <dd>{copy}</dd>
        </div>)}
      </dl>
    </T2049Section>
  );
}
