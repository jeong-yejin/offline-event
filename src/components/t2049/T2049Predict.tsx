import { T2049Arrow } from './T2049Arrow';
import { T2049Section } from './T2049Section';
import type { Strings } from '../../i18n/strings/token2049';

/* Rewards are paid to Kalshi accounts, so the address is collected in the run-up rather than at the
   close. The section that explains the prediction market is where a reader is already thinking about
   getting paid, so the account screen is linked from here. */
export function T2049Predict({ t, onEnterKalshi, onEnterMarket }: { t: Strings; onEnterKalshi(): void; onEnterMarket(): void }) {
  return (
    <T2049Section name="kalshi" eyebrow={t.t2049KalshiEyebrow} title={t.t2049KalshiTitle} headerContent={<>
      <p className="t2049-lede">{t.t2049KalshiCopy}</p>
      <div className="t2049-predict-actions">
        <button className="outline-button t2049-predict-cta" type="button" onClick={onEnterMarket}>{t.t2049MarketCta}<T2049Arrow /></button>
        <button className="outline-button t2049-predict-cta" type="button" onClick={onEnterKalshi}>{t.t2049KalshiCta}<T2049Arrow /></button>
      </div>
    </>}>
      <div className="t2049-prediction-board">
        <img className="t2049-step-line t2049-step-line--first" src="/assets/token2049/figma/imgLine.png" width="250" height="2" alt="" aria-hidden="true" />
        <img className="t2049-step-line t2049-step-line--second" src="/assets/token2049/figma/imgLine1.png" width="290" height="2" alt="" aria-hidden="true" />
        <ol className="t2049-prediction-steps">{t.t2049KalshiPoints.map((point, index) => <li key={point}>
          <img className="t2049-pin" src={`/assets/token2049/figma/imgPin${index || ''}.svg`} width="14" height="18" alt="" aria-hidden="true" />
          <span className="t2049-step-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <p>{point}</p>
        </li>)}</ol>
      </div>
    </T2049Section>
  );
}
