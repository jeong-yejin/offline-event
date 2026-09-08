import { useState } from 'react';
import type { Strings } from '../i18n/strings';
import { formatPercent, formatPoint, formatSigned, moveOf } from '../market/format';
import { averageEntry, holdingValue, quote as priceOf, settlementPrice, type Holding, type MarketId, type MarketTrader, type PriceMap, type Side } from '../market/marketEngine';
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

/* One row per open position. Everything the PRD asks a holder to see before selling is on it:
   what it cost, what it is worth now, and what closing it would return. */
export function PositionList({ t, traders, holdings, prices, winners, tradable, onSell }: PositionListProps) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const traderOf = (id: MarketId) => traders.find((candidate) => candidate.id === id) ?? traders[0];

  if (!holdings.length) return <p className="positions-empty">{t.positionsEmpty}</p>;

  return (
    <ul className="position-list">
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
          <li className="position-row" key={key}>
            <div className="position-id">
              <strong>{trader.trader}</strong>
              <em data-side={holding.side}>{t.sideName(holding.side)}</em>
              <span>{trader.exchange}</span>
            </div>

            <dl className="position-stats">
              <div><dt>{t.ownedQuantity}</dt><dd>{holding.qty}</dd></div>
              <div><dt>{t.averageEntry}</dt><dd>{formatPoint(entry)}</dd></div>
              <div><dt>{settled === null ? t.currentSell : t.settlementPriceLabel}</dt><dd>{formatPoint(sell)}</dd></div>
              <div><dt>{t.marketValue}</dt><dd>{formatPoint(value)} pt</dd></div>
              <div><dt>{t.unrealizedPnl}</dt><dd data-move={moveOf(pnl)}>{formatSigned(pnl)} <small>{formatPercent((pnl / holding.cost) * 100)}</small></dd></div>
            </dl>

            {settled === null
              ? <div className="position-actions">
                  <label className="position-qty" htmlFor={`sell-${key}`}>{t.sellQuantity}</label>
                  <input disabled={!tradable} id={`sell-${key}`} inputMode="numeric" onChange={(event) => setDrafts((current) => ({ ...current, [key]: event.target.value }))} type="text" value={draft} />
                  <button disabled={!sellable} onClick={() => quantity !== null && onSell(holding.id, holding.side, quantity)} type="button">{t.sellCta}</button>
                  <button className="position-close" disabled={!tradable} onClick={() => onSell(holding.id, holding.side, holding.qty)} type="button">{t.closeAll}</button>
                </div>
              : <p className="position-settled">{t.positionSettled}</p>}
          </li>
        );
      })}
    </ul>
  );
}
