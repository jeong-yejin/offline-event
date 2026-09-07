import { VOTE_CANDIDATES, type VoteCandidateId } from '../data/voteContent';
import type { Strings } from '../i18n/strings';
import { formatTime } from '../market/format';
import type { PricePoint } from '../market/marketEngine';

export type ChartRange = '1H' | '6H' | 'ALL';

const RANGES: readonly ChartRange[] = ['1H', '6H', 'ALL'];
const RANGE_SPAN: Record<ChartRange, number> = { '1H': 3600000, '6H': 21600000, ALL: Number.POSITIVE_INFINITY };
const GRID_LINES = [0, 25, 50, 75, 100];
const PLOT_WIDTH = 720;
const PLOT_HEIGHT = 260;
const MAX_PLOT_POINTS = 180;

type MarketChartProps = {
  t: Strings;
  history: readonly PricePoint[];
  range: ChartRange;
  focusId: VoteCandidateId;
  onRangeChange(range: ChartRange): void;
  onFocusChange(id: VoteCandidateId): void;
};

export function rangePoints(history: readonly PricePoint[], range: ChartRange): PricePoint[] {
  const latest = history[history.length - 1];
  if (!latest) return [];
  const windowed = history.filter((point) => latest.time - point.time <= RANGE_SPAN[range]);
  const stride = Math.ceil(windowed.length / MAX_PLOT_POINTS);
  return stride > 1 ? windowed.filter((_point, index) => index % stride === 0 || index === windowed.length - 1) : windowed;
}

const linePath = (points: readonly PricePoint[], id: VoteCandidateId) =>
  points
    .map((point, index) => {
      const x = points.length > 1 ? (index / (points.length - 1)) * PLOT_WIDTH : 0;
      const y = PLOT_HEIGHT - (point.prices[id] / 100) * PLOT_HEIGHT;
      return `${index ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

export function MarketChart({ t, history, range, focusId, onRangeChange, onFocusChange }: MarketChartProps) {
  const points = rangePoints(history, range);
  const first = points[0];
  const last = points[points.length - 1];

  return (
    <figure className="market-chart">
      <figcaption className="chart-head">
        <h3>{t.chartTitle}</h3>
        <div className="chart-ranges" role="group" aria-label={t.chartRange}>
          {RANGES.map((option) => <button aria-pressed={option === range} data-active={option === range ? 'true' : 'false'} key={option} onClick={() => onRangeChange(option)} type="button">{option}</button>)}
        </div>
      </figcaption>

      <div className="chart-frame">
        <ul className="chart-scale" aria-hidden="true">{[...GRID_LINES].reverse().map((value) => <li key={value}>{value}%</li>)}</ul>
        <svg className="chart-plot" viewBox={`0 0 ${PLOT_WIDTH} ${PLOT_HEIGHT}`} preserveAspectRatio="none" role="img" aria-label={t.chartAria(VOTE_CANDIDATES.map((candidate) => candidate.name).join(', '))}>
          {GRID_LINES.map((value) => <line className="chart-grid" key={value} x1="0" x2={PLOT_WIDTH} y1={PLOT_HEIGHT - (value / 100) * PLOT_HEIGHT} y2={PLOT_HEIGHT - (value / 100) * PLOT_HEIGHT} vectorEffect="non-scaling-stroke" />)}
          {VOTE_CANDIDATES.map((candidate) => <path d={linePath(points, candidate.id)} data-focus={candidate.id === focusId ? 'true' : 'false'} fill="none" key={candidate.id} stroke={candidate.color} vectorEffect="non-scaling-stroke" />)}
        </svg>
      </div>

      <div className="chart-axis" aria-hidden="true"><span>{first ? formatTime(first.time) : ''}</span><span>{last ? formatTime(last.time) : ''}</span></div>

      <ul className="chart-legend">
        {VOTE_CANDIDATES.map((candidate) => {
          const change = last && first ? Math.round(last.prices[candidate.id]) - Math.round(first.prices[candidate.id]) : 0;
          return <li key={candidate.id}>
            <button aria-pressed={candidate.id === focusId} data-active={candidate.id === focusId ? 'true' : 'false'} onClick={() => onFocusChange(candidate.id)} type="button">
              <i style={{ background: candidate.color }} aria-hidden="true" />
              {candidate.name}
              <strong>{last ? Math.round(last.prices[candidate.id]) : 0}%</strong>
              <em data-move={change > 0 ? 'up' : change < 0 ? 'down' : 'flat'}>{change > 0 ? '+' : change < 0 ? '−' : ''}{Math.abs(change)}</em>
            </button>
          </li>;
        })}
      </ul>
    </figure>
  );
}
