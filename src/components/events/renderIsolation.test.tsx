// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import * as hero from '../EventHero';
import { Token2049Page } from '../../pages/Token2049Page';
import { PerpDexDayPage } from '../../pages/PerpDexDayPage';
import { EVENTS, type EventContent } from '../../data/eventContent';

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

const eventOf = (key: string): EventContent => EVENTS.find((event) => event.key === key)!;

/* Each row builds its own element because the two pages no longer take the same props: only
   TOKEN2049 has a team entry screen to open. */
it.each([
  ['countdown', 'perps-day', 1000, (event: EventContent) => <Token2049Page event={event} lang="en" onEnterKalshi={() => {}} onEnterMarket={() => {}} onEnterTeams={() => {}} />],
  ['speaker rotation', 'perp-dex-day', 2400, (event: EventContent) => <PerpDexDayPage event={event} lang="en" onEnterMarket={() => {}} />],
] as const)('%s updates its region without rerendering the hero', (_, key, interval, renderPage) => {
  vi.useFakeTimers();
  vi.setSystemTime(Date.UTC(2026, 8, 9));
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  const renderHero = vi.spyOn(hero, 'EventHero');
  const view = render(renderPage(eventOf(key)));
  const initial = view.container.innerHTML;
  expect(renderHero).toHaveBeenCalledTimes(1);
  act(() => { vi.advanceTimersByTime(interval); });
  expect(view.container.innerHTML).not.toBe(initial);
  expect(renderHero).toHaveBeenCalledTimes(1);
  view.unmount();
  expect(vi.getTimerCount()).toBe(0);
});
