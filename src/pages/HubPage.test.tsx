// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { HubPage } from './HubPage';
import { COMMON_STRINGS } from '../i18n/strings/common';

// Graphics own animation clocks; this suite characterizes the Hub's selection clock only.
vi.mock('../components/DigitalRain', () => ({ default: () => null }));
vi.mock('../components/ReboundXTunnel', () => ({ ReboundXTunnel: () => null }));
vi.mock('../components/HeroSplineBackground', () => ({ HeroSplineBackground: () => null }));
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

function mount() {
  vi.useFakeTimers();
  const view = render(<HubPage lang="en" t={COMMON_STRINGS.en} onNavigate={() => {}} />);
  const current = () => view.container.querySelector('.hub-showcase')?.getAttribute('data-event');
  return { ...view, current };
}

it('preserves the intro and five-second event order, wrapping to PERP-DEX after TOKEN2049', () => {
  const { current, unmount } = mount();
  expect(current()).toBe('intro');
  act(() => { vi.advanceTimersByTime(4999); });
  expect(current()).toBe('intro');
  act(() => { vi.advanceTimersByTime(1); });
  expect(current()).toBe('perp-dex-day');
  for (const event of ['reboundx-in-wonderland', 'perps-day', 'perp-dex-day']) {
    act(() => { vi.advanceTimersByTime(5000); });
    expect(current()).toBe(event);
  }
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it('selects manually and holds the slide while keyboard focus is inside the hero', () => {
  const { container, current } = mount();
  const buttons = container.querySelectorAll('.hub-rail button');
  fireEvent.focus(buttons[1]);
  fireEvent.click(buttons[1]);
  act(() => { vi.advanceTimersByTime(15000); });
  expect(current()).toBe('reboundx-in-wonderland');
  expect(buttons[1]).toHaveAttribute('aria-pressed', 'true');
  fireEvent.blur(buttons[1], { relatedTarget: document.body });
  act(() => { vi.advanceTimersByTime(5000); });
  expect(current()).toBe('perps-day');
});

it('keeps manual selection available when reduced motion disables automatic rotation', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  const { container, current } = mount();
  act(() => { vi.advanceTimersByTime(20000); });
  expect(current()).toBe('intro');
  fireEvent.click(container.querySelectorAll('.hub-rail button')[2]);
  expect(current()).toBe('perps-day');
});
