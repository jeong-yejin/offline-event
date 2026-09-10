import type { Strings } from '../i18n/strings/market';
import { formatPoint } from '../market/format';

type SettledBannerProps = {
  t: Strings;
  /* Winner names, already resolved. The banner never reads a roster. */
  winners: readonly string[];
  totalPrice: number;
  payout: number;
  point: number;
};

/* What the close paid: who took the market, what a winning contract resolved at, and what the reader
   walked away holding. */
export function SettledBanner({ t, winners, totalPrice, payout, point }: SettledBannerProps) {
  return (
    <div className="market-settled" role="status">
      <h2>{t.settledTitle(winners.join(', '))}</h2>
      <p>{t.settledSplit(winners.length, totalPrice / winners.length)}</p>
      <p>{payout > 0 ? t.settledPaid(formatPoint(payout)) : t.settledNone} {t.settledFinal(formatPoint(point))}</p>
    </div>
  );
}
