// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import * as geometry from '../market/chart';
import { MarketChart } from './MarketChart';
import { MARKET_STRINGS } from '../i18n/strings/market';
import { PERP_DEX_TRADERS } from '../data/perpDexMarketContent';
import { seedHistory } from '../market/perpdexday/market';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('reuses chart paths across hover and unrelated parent updates, invalidating on new data', () => {
  const path = vi.spyOn(geometry, 'linePath');
  const history = seedHistory(100000000);
  const props = { t: MARKET_STRINGS.en, traders: PERP_DEX_TRADERS, history, focusId: PERP_DEX_TRADERS[0].id };
  const view = render(<MarketChart {...props} />);
  const count = path.mock.calls.length;
  expect(count).toBe(PERP_DEX_TRADERS.length);
  const canvas = view.container.querySelector('.chart-canvas')!;
  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, width: 720 } as DOMRect);
  // jsdom may not provide PointerEvent; explicit properties keep this an actual hover update.
  const move = new Event('pointermove', { bubbles: true });
  Object.defineProperty(move, 'clientX', { value: 360 });
  fireEvent(canvas, move);
  expect(view.container.querySelector('.chart-tip')).not.toBeNull();
  view.rerender(<MarketChart {...props} />);
  expect(path).toHaveBeenCalledTimes(count);
  view.rerender(<MarketChart {...props} history={[...history]} />);
  expect(path).toHaveBeenCalledTimes(count * 2);
});

/* The chips are the chart's own filter: picking a seat narrows the plot to that seat and moves the big
   readout onto it, and All puts the field back. The order ticket is a separate control, so focusId is
   given to the chart and never changed by it. */
it('narrows the plot to the seat its chip picked, and puts the field back on All', () => {
  const [first, second] = PERP_DEX_TRADERS;
  const view = render(<MarketChart t={MARKET_STRINGS.en} traders={PERP_DEX_TRADERS} history={seedHistory(100000000)} focusId={first.id} />);
  const chip = (name: string) => view.getByRole('button', { name });
  const lines = () => view.container.querySelectorAll('.chart-line');
  const readout = () => view.container.querySelector('.chart-now em')!.textContent;

  expect(lines()).toHaveLength(PERP_DEX_TRADERS.length);
  expect(readout()).toBe(first.trader);

  fireEvent.click(chip(second.trader));
  expect(lines()).toHaveLength(1);
  expect(readout()).toBe(second.trader);
  expect(chip(second.trader).getAttribute('aria-pressed')).toBe('true');

  fireEvent.click(chip(MARKET_STRINGS.en.chartAll));
  expect(lines()).toHaveLength(PERP_DEX_TRADERS.length);
  expect(readout()).toBe(first.trader);
});
