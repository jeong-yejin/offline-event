import { useState } from 'react';
import type { Strings } from '../i18n/strings/market';
import { formatPercent, formatPoint, formatSigned, moveOf } from '../market/format';
import { averageEntry, holdingValue, quote as priceOf, settlementPrice, type Holding, type MarketId, type MarketTrader, type PriceMap, type Side } from '../market/engine';
import { parseQuantity } from '../market/quote';

type PositionListProps = {
  t: Strings;
  traders: readonly MarketTrader[];
  holdings: readonly Holding[];
  prices: PriceMap;
  winners: readonly MarketId[] | null;
  tradable: boolean;
  onSell(id: MarketId, side: Side, quantity: number): void;
};

/* One row per open position, in the same table shape as the trader board above it, so a holder reads
   cost, current value, and what closing would return across one line. The section only renders once a
   position exists, so there is no empty branch here. */
export function PositionList({ t, traders, holdings, prices, winners, tradable, onSell }: PositionListProps) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const traderOf = (id: MarketId) => traders.find((candidate) => candidate.id === id) ?? traders[0];

  return (
    <div className="position-scroll">
      <table className="position-table">
        <thead>
          <tr>
            <th scope="col">{t.traderColumn}</th>
            <th scope="col">{t.ownedQuantity}</th>
            <th scope="col">{t.averageEntry}</th>
            <th scope="col">{winners ? t.settlementPriceLabel : t.currentSell}</th>
            <th scope="col">{t.marketValue}</th>
            <th scope="col">{t.unrealizedPnl}</th>
            <th scope="col">{t.sellQuantity}</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => {
            const key = `${holding.id}-${holding.side}`;
            const trader = traderOf(holding.id);
            const entry = averageEntry(holding);
            const settled = winners ? settlementPrice(winners, holding.id, holding.side) : null;
            const sell = settled ?? priceOf(prices, holding.id, holding.side, 'sell');
            const value = settled === null ? holdingValue(holding, prices) : settled * holding.qty;
            const pnl = value - holding.cost;
            const draft = drafts[key] ?? '1';
            const quantity = parseQuantity(draft);
            const sellable = tradable && quantity !== null && quantity <= holding.qty;

            return (
              <tr className="position-row" key={key}>
                <th scope="row">
                  <span className="position-id">
                    <strong>{trader.trader}</strong>
                    <em data-side={holding.side}>{t.sideName(holding.side)}</em>
                  </span>
                </th>
                <td>{holding.qty}</td>
                <td>{formatPoint(entry)}</td>
                <td>{formatPoint(sell)}</td>
                <td>{formatPoint(value)} pt</td>
                <td data-move={moveOf(pnl)}>{formatSigned(pnl)} <small>{formatPercent((pnl / holding.cost) * 100)}</small></td>
                <td>
                  {settled === null
                    ? <span className="position-actions">
                        <input aria-label={t.sellQuantity} disabled={!tradable} id={`sell-${key}`} inputMode="numeric" onChange={(event) => setDrafts((current) => ({ ...current, [key]: event.target.value }))} type="text" value={draft} />
                        <button disabled={!sellable} onClick={() => quantity !== null && onSell(holding.id, holding.side, quantity)} type="button">{t.sellCta}</button>
                        <button disabled={!tradable} onClick={() => onSell(holding.id, holding.side, holding.qty)} type="button">{t.closeAll}</button>
                      </span>
                    : <span className="position-settled">{t.positionSettled}</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
