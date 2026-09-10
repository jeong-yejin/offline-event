import type { Strings } from '../i18n/strings/market';
import { formatPercent, formatPoint, formatSigned, formatTime, moveOf } from '../market/format';
import type { Side, TraderState } from '../market/engine';

export type ClosedRow = {
  key: string;
  trader: string;
  state: TraderState;
  side: Side;
  qty: number;
  entry: number;
  exit: number;
  time: number;
};

type ClosedPositionListProps = {
  t: Strings;
  rows: readonly ClosedRow[];
};

/* One row per position that has already left the book, sold or settled under a cut seat. The open
   board above keeps the live rows, so this one reads only what the trade returned. It sits in the
   380px column beside the ticket, which is too narrow for the seven-column table shape used above,
   so each row stacks into three lines instead. */
export function ClosedPositionList({ t, rows }: ClosedPositionListProps) {
  return (
    <ol className="closed-list">
      {rows.map((row) => {
        const basis = row.entry * row.qty;
        const value = row.exit * row.qty;
        const pnl = value - basis;

        return (
          <li className="closed-row" key={row.key}>
            <p className="closed-who">
              <strong>{row.trader}</strong>
              <em data-side={row.side}>{t.sideName(row.side)}</em>
              <span>{t.traderStateName(row.state)}</span>
              <time dateTime={new Date(row.time).toISOString()}>{formatTime(row.time)}</time>
            </p>
            <p className="closed-trade">
              <span>
                <span className="visually-hidden">{t.ownedQuantity} </span>{row.qty}
                {' @ '}
                <span className="visually-hidden">{t.averageEntry} </span>{formatPoint(row.entry)}
                {' \u2192 '}
                <span className="visually-hidden">{t.historyExit} </span>{formatPoint(row.exit)}
              </span>
              <b><span className="visually-hidden">{t.marketValue} </span>{formatPoint(value)} pt</b>
            </p>
            <p className="closed-pnl" data-move={moveOf(pnl)}>
              <span className="visually-hidden">{t.historyRealized} </span>
              {formatSigned(pnl)}
              {basis > 0 ? <small>{formatPercent((pnl / basis) * 100)}</small> : null}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
