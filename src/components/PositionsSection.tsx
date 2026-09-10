import type { Strings } from '../i18n/strings/market';
import { formatPercent, formatPoint, formatSigned, moveOf } from '../market/format';
import { totalAsset, type Holding, type MarketId, type MarketTrader, type PriceMap, type Side } from '../market/engine';
import { PositionList } from './PositionList';

type PositionsSectionProps = {
  t: Strings;
  traders: readonly MarketTrader[];
  holdings: readonly Holding[];
  prices: PriceMap;
  winners: readonly MarketId[] | null;
  tradable: boolean;
  onSell(id: MarketId, side: Side, quantity: number): void;
  point: number;
  startingPoint: number;
};

/* The board only names a position once there is one to name, so a flat reader is not asked to read an
   empty table between the chart and the standings. */
export function PositionsSection({ t, traders, holdings, prices, winners, tradable, onSell, point, startingPoint }: PositionsSectionProps) {
  if (holdings.length === 0) return null;

  const asset = totalAsset(point, holdings, prices);
  const pnl = asset - startingPoint;

  return (
    <section className="market-positions market-card" aria-labelledby="positions-title">
      <h3 id="positions-title">{t.positionsTitle}</h3>
      <PositionList
        holdings={holdings}
        traders={traders}
        onSell={onSell}
        prices={prices}
        t={t}
        tradable={tradable}
        winners={winners}
      />
      <dl className="positions-total">
        <div><dt>{t.availablePoint}</dt><dd>{formatPoint(point)} pt</dd></div>
        <div><dt>{t.totalAsset}</dt><dd>{formatPoint(asset)} pt</dd></div>
        <div><dt>{t.leaderPnl}</dt><dd data-move={moveOf(pnl)}>{formatSigned(pnl)} <small>{formatPercent((pnl / startingPoint) * 100)}</small></dd></div>
      </dl>
    </section>
  );
}
