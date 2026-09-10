import { PLOT_WIDTH, PLOT_HEIGHT, domainOf, plotPoints, ticksOf, linePath, type Domain } from '../market/chart';
import { memo, useMemo, useState } from 'react';
import type { Strings } from '../i18n/strings/market';
import { formatTime } from '../market/format';
import type { MarketId, MarketTrader, Snapshot } from '../market/engine';

type MarketChartProps = {
  t: Strings;
  traders: readonly MarketTrader[];
  history: readonly Snapshot[];
  focusId: MarketId;
};

/* The chips under the plot pick which seats are drawn: 'all' is the whole field, an id is that seat on
   its own. The choice stays inside the chart, so filtering the plot never moves the order ticket off
   the seat the reader was about to trade. */
type ChartView = MarketId | 'all';

const tickY = (value: number, { low, high }: Domain) => PLOT_HEIGHT - ((value - low) / (high - low || 1)) * PLOT_HEIGHT;

/* Percentages of the drawn box, for the overlay. The plot is stretched to fit its container, so a
   marker placed in SVG units would land in the right spot but arrive as a squashed ellipse. */
const percentX = (index: number, count: number) => (count > 1 ? (index / (count - 1)) * 100 : 0);
const percentY = (value: number, { low, high }: Domain) => ((high - value) / (high - low || 1)) * 100;

export { domainOf, plotPoints, ticksOf } from '../market/chart';
export type { Domain } from '../market/chart';

export const MarketChart = memo(function MarketChart({ t, traders, history, focusId }: MarketChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const [view, setView] = useState<ChartView>('all');
  const points = useMemo(() => plotPoints(history), [history]);
  const first = points[0];
  const last = points[points.length - 1];
  const drawn = useMemo(() => (view === 'all' ? traders : traders.filter((candidate) => candidate.id === view)), [traders, view]);
  const domain = useMemo(() => domainOf(points, drawn.map((candidate) => candidate.id)), [points, drawn]);
  const ticks = useMemo(() => ticksOf(domain), [domain]);
  const paths = useMemo(() => new Map(drawn.map(({ id }) => [id, linePath(points, id, domain)])), [points, drawn, domain]);
  /* One seat carries the area fill and the big number: on 'all' the seat the ticket points at, otherwise
     the seat the chip picked. */
  const focus = drawn.find((candidate) => candidate.id === focusId) ?? drawn[0];
  const held = hover === null ? null : points[hover];
  /* The readout carries the whole field, so it is ordered by the number it prints rather than by seat:
     the reader is asking who leads at that minute, not where each seat sits in the list. */
  const ordered = held ? [...drawn].sort((a, b) => held.prices[b.id] - held.prices[a.id]) : [];

  const track = (event: React.PointerEvent<HTMLDivElement>) => {
    if (points.length < 2) return;
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - box.left) / box.width;
    setHover(Math.min(points.length - 1, Math.max(0, Math.round(ratio * (points.length - 1)))));
  };

  return (
    <figure className="market-chart">
      <figcaption className="chart-head">
        <div className="chart-title">
          <h3>{t.chartTitle}</h3>
          <p className="chart-now"><strong>{last && focus ? Math.round(last.prices[focus.id]) : 0}%</strong><em style={{ color: focus?.color }}>{focus?.trader}</em></p>
        </div>
      </figcaption>

      <div className="chart-frame">
        <ul className="chart-scale" aria-hidden="true">{[...ticks].reverse().map((value) => <li key={value}>{Math.round(value)}%</li>)}</ul>

        <div className="chart-canvas" onPointerDown={track} onPointerLeave={() => setHover(null)} onPointerMove={track}>
          <svg className="chart-plot" viewBox={`0 0 ${PLOT_WIDTH} ${PLOT_HEIGHT}`} preserveAspectRatio="none" role="img" aria-label={t.chartAria(drawn.map((candidate) => candidate.trader).join(', '))}>
            <defs>
              <linearGradient id="chart-focus-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={focus?.color} stopOpacity=".15" />
                <stop offset="100%" stopColor={focus?.color} stopOpacity="0" />
              </linearGradient>
            </defs>
            {ticks.map((value) => <line className="chart-grid" key={value} x1="0" x2={PLOT_WIDTH} y1={tickY(value, domain)} y2={tickY(value, domain)} vectorEffect="non-scaling-stroke" />)}
            {focus ? <path className="chart-area" d={points.length > 1 ? `${paths.get(focus.id)} L${PLOT_WIDTH} ${PLOT_HEIGHT} L0 ${PLOT_HEIGHT} Z` : ''} fill="url(#chart-focus-fill)" /> : null}
            {drawn.map((candidate) => <path className="chart-line" d={paths.get(candidate.id)} data-focus={candidate.id === focusId ? 'true' : 'false'} fill="none" key={candidate.id} stroke={candidate.color} vectorEffect="non-scaling-stroke" />)}
          </svg>

          {focus && last ? <span aria-hidden="true" className="chart-dot" style={{ left: '100%', top: `${percentY(last.prices[focus.id], domain)}%`, '--seat': focus.color } as React.CSSProperties} /> : null}

          {held && hover !== null ? (
            <>
              <span aria-hidden="true" className="chart-cursor" style={{ left: `${percentX(hover, points.length)}%` }} />
              {drawn.map((candidate) => (
                <span aria-hidden="true" className="chart-dot" data-focus={candidate.id === focusId ? 'true' : 'false'} key={candidate.id}
                  style={{ left: `${percentX(hover, points.length)}%`, top: `${percentY(held.prices[candidate.id], domain)}%`, '--seat': candidate.color } as React.CSSProperties} />
              ))}
              <div className="chart-tip" data-side={percentX(hover, points.length) > 50 ? 'end' : 'start'} role="status" style={{ left: `${percentX(hover, points.length)}%` }}>
                <p>{formatTime(held.time)}</p>
                <ul>
                  {ordered.map((candidate) => (
                    <li data-focus={candidate.id === focusId ? 'true' : 'false'} key={candidate.id}>
                      <i aria-hidden="true" style={{ background: candidate.color }} />
                      <span>{candidate.trader}</span>
                      <strong>{Math.round(held.prices[candidate.id])}%</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="chart-axis" aria-hidden="true"><span>{first ? formatTime(first.time) : ''}</span><span>{last ? formatTime(last.time) : ''}</span></div>

      <div className="chart-chips" role="group" aria-label={t.chartSeries}>
        <button aria-pressed={view === 'all'} data-active={view === 'all' ? 'true' : 'false'} onClick={() => setView('all')} type="button">{t.chartAll}</button>
        {traders.map((candidate) => (
          <button aria-pressed={view === candidate.id} data-active={view === candidate.id ? 'true' : 'false'} key={candidate.id}
            onClick={() => setView(candidate.id)} style={{ '--seat': candidate.color } as React.CSSProperties} type="button">
            <i aria-hidden="true" />{candidate.trader}
          </button>
        ))}
      </div>
    </figure>
  );
});
