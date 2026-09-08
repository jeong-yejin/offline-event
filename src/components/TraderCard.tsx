import type { Strings } from '../i18n/strings';
import { formatPercent, formatPill, moveOf } from '../market/format';
import type { DataStatus, MarketTrader, Side } from '../market/marketEngine';
import type { TraderState } from '../market/t2049Engine';

type TraderCardProps = {
  t: Strings;
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
  /* Only the elimination competition carries one. The vote market leaves it off. */
  state?: TraderState;
  onPick(side: Side): void;
};

export function TraderCard({ t, candidate, balance, percent, rank, probability, yesPrice, noPrice, status, focused, tradable, state, onPick }: TraderCardProps) {
  return (
    <li className="trader-card" data-focus={focused ? 'true' : 'false'} data-state={state} data-status={status}>
      <header className="trader-head">
        {candidate.logo
          ? <img alt="" className="trader-logo" src={`/assets/sponsors/${candidate.logo}`} />
          : <span aria-hidden="true" className="trader-seat" style={{ color: candidate.color }}>{candidate.trader.slice(-1)}</span>}
        <div className="trader-id">
          <h3>{candidate.trader}</h3>
          <p>{candidate.exchange}</p>
        </div>
        <p className="trader-rank" aria-label={t.currentRank}>#{rank}</p>
      </header>

      {state ? <p className="trader-state" data-state={state}>{t.traderStateName(state)}</p> : null}

      <dl className="trader-stats">
        <div>
          <dt>{t.marginBalance}</dt>
          <dd>{formatPill(balance)} <span>USDT</span></dd>
        </div>
        <div>
          <dt>{t.traderReturn}</dt>
          <dd data-move={moveOf(percent)}>{formatPercent(percent)}</dd>
        </div>
        <div>
          <dt>{t.marketProbability}</dt>
          <dd className="trader-probability">{probability}%</dd>
        </div>
      </dl>

      <div className="trader-meter" aria-hidden="true"><span style={{ width: `${probability}%`, background: candidate.color }} /></div>

      <div className="trader-actions">
        <button data-side="yes" disabled={!tradable} onClick={() => onPick('yes')} type="button">
          <span>{t.sideYes}</span><strong>{yesPrice}</strong>
        </button>
        <button data-side="no" disabled={!tradable} onClick={() => onPick('no')} type="button">
          <span>{t.sideNo}</span><strong>{noPrice}</strong>
        </button>
      </div>

      <p className="trader-feed" data-status={status}>{t.feedStatus(status)}</p>
    </li>
  );
}
