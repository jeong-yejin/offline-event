import type { Strings } from '../i18n/strings/market';
import { formatPercent, formatPill, moveOf } from '../market/format';
import type { DataStatus, MarketId, MarketTrader, Side, TraderState } from '../market/engine';

export type TraderRow = {
  candidate: MarketTrader;
  balance: number;
  percent: number;
  rank: number;
  probability: number;
  yesPrice: number;
  noPrice: number;
  status: DataStatus;
  focused: boolean;
  tradable: boolean;
  /* Only the elimination competition carries one. The PERP-DEX DAY market leaves it off. */
  state?: TraderState;
};

type TraderTableProps = {
  t: Strings;
  rows: readonly TraderRow[];
  onPick(id: MarketId, side: Side): void;
  /* Points the ticket at a seat without choosing a side. The whole row carries it. */
  onFocusSeat(id: MarketId): void;
};

/* One row per binary market. A table beats a card grid here because every trader is read against
   the others: the probabilities line up in one column instead of scattering across four corners. */
export function TraderTable({ t, rows, onPick, onFocusSeat }: TraderTableProps) {
  return (
    <div className="trader-scroll">
      <table className="trader-table">
        <caption className="visually-hidden">{t.traderTableCaption}</caption>
        <thead>
          <tr>
            <th scope="col">{t.traderColumn}</th>
            <th scope="col">{t.marginBalance}</th>
            <th scope="col">{t.traderReturn}</th>
            <th scope="col">{t.marketProbability}</th>
            <th scope="col"><span className="visually-hidden">{t.tradeColumn}</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ candidate, balance, percent, rank, probability, yesPrice, noPrice, status, focused, tradable, state }) => (
            <tr className="trader-row" data-focus={focused ? 'true' : 'false'} data-state={state} data-status={status} key={candidate.id} onClick={() => onFocusSeat(candidate.id)}>
              <th scope="row">
                {/* The row is the click target; the name is the same target for a keyboard, and a flex box
                    inside the cell keeps the cell a table cell so the columns still line up. */}
                <button className="trader-name" onClick={() => onFocusSeat(candidate.id)} type="button">
                  {/* The mark is the only place the exchange is named now, so it carries the name as its alt. */}
                  <img alt={candidate.exchange} className="trader-logo" src={`/assets/sponsors/${candidate.logo}`} />
                  <span className="trader-id">
                    <strong>{candidate.trader}</strong>
                    {/* The feed only speaks up when it stops being live, so eight healthy rows stay quiet. */}
                    {status === 'live' ? null : <small className="trader-feed" data-status={status}>{t.feedStatus(status)}</small>}
                  </span>
                  <span className="trader-rank" aria-label={t.currentRank}>#{rank}</span>
                  {/* Every seat is active until the first cut, so the label only earns its place once a seat's standing changes. */}
                  {state && state !== 'active' ? <span className="trader-state" data-state={state}>{t.traderStateName(state)}</span> : null}
                </button>
              </th>

              <td className="trader-balance">{formatPill(balance)} <span>USDT</span></td>
              <td className="trader-move" data-move={moveOf(percent)}>{formatPercent(percent)}</td>

              <td className="trader-chance">
                <span className="trader-probability">{probability}%</span>
                <span className="trader-meter" aria-hidden="true"><span style={{ width: `${probability}%`, background: candidate.color }} /></span>
              </td>

              <td className="trader-actions">
                <button data-side="yes" disabled={!tradable} onClick={() => onPick(candidate.id, 'yes')} type="button">
                  <span>{t.sideYes}</span><strong>{yesPrice}</strong>
                </button>
                <button data-side="no" disabled={!tradable} onClick={() => onPick(candidate.id, 'no')} type="button">
                  <span>{t.sideNo}</span><strong>{noPrice}</strong>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
