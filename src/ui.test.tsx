// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

describe('PERP-DEX DAY interface', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    Object.defineProperty(window.history, 'scrollRestoration', {
      configurable: true,
      value: 'auto',
      writable: true,
    });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    Reflect.deleteProperty(window.history, 'scrollRestoration');
  });

  function traverseHistoryTo(path: string) {
    act(() => {
      window.history.replaceState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
  }

  it('renders the Matrix-inspired eyebrow copy', () => {
    render(<App />);

    expect(screen.getByText('Wake up. The arena is calling.')).toBeInTheDocument();
    expect(screen.getByText('Choose the red pill. Enter the construct.')).toBeInTheDocument();
  });

  it('renders the event switcher with PERP-DEX DAY selected by default', () => {
    render(<App />);

    expect(screen.getByRole('tablist', { name: /event selection/i })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByRole('tab', { name: 'PERP-DEX DAY' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'PERP-DEX DAY' })).toBeInTheDocument();
    expect(screen.getByText('Live trading competition winner betting')).toBeInTheDocument();
  });

  it('switches event content and returns to the PERP-DEX DAY screen', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: 'REBOUNDX IN WONDERLAND' }));
    expect(screen.getByRole('tab', { name: 'REBOUNDX IN WONDERLAND' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'REBOUNDX IN WONDERLAND' })).toContainElement(screen.getByTitle('ReboundX in Wonderland event page'));
    expect(screen.getByTitle('ReboundX in Wonderland event page')).toHaveAttribute('src', '/reboundx/index.html?content=1');
    expect(document.querySelector('.reboundx-hero')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'ReboundX in Wonderland' })).toBeInTheDocument();
    expect(document.querySelector('.hero')).not.toBeInTheDocument();
    expect(screen.queryByText('Live trading competition winner betting')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'PERP-DEX DAY' }));
    expect(screen.getByRole('tab', { name: 'PERP-DEX DAY' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Live trading competition winner betting')).toBeInTheDocument();
  });

  it('opens the ReboundX Drink Me link in the top-level window', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: 'REBOUNDX IN WONDERLAND' }));
    const frame = screen.getByTitle('ReboundX in Wonderland event page');
    const frameDocument = document.implementation.createHTMLDocument();
    const externalLink = frameDocument.createElement('a');
    externalLink.className = 'drink-me';
    externalLink.href = 'https://reboundx.net/en/terminal-exchange/BINANCE/perp/BTCUSDT';
    frameDocument.body.appendChild(externalLink);
    Object.defineProperty(frame, 'contentDocument', { configurable: true, value: frameDocument });
    vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });

    fireEvent.load(frame);

    try {
      expect(externalLink.target).toBe('_top');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('keeps every timetable time and title as a single text run', () => {
    render(<App />);

    expect(document.querySelectorAll('.agenda-row time')).toHaveLength(7);
    expect(screen.getByText('16:00')).toBeInTheDocument();
    expect(screen.getByText('Live trading competition winner betting')).toBeInTheDocument();
    expect(screen.getByText('VIP MAFIA NIGHT/ Networking')).toBeInTheDocument();
  });

  it('swaps the featured portrait to the speaker under the pointer', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.hover(screen.getByText('Justin'));

    const rows = Array.from(document.querySelectorAll('[data-speaker-row]'));
    const portraits = Array.from(document.querySelectorAll('.featured-speaker'));
    expect(portraits).toHaveLength(rows.length);
    expect(rows.findIndex((row) => row.getAttribute('data-active') === 'true'))
      .toBe(portraits.findIndex((portrait) => portrait.getAttribute('data-active') === 'true'));
  });

  it('attaches the PERP-DEX DAY motion system to the page', async () => {
    render(<App />);

    await waitFor(() => expect(screen.getByLabelText(/motion enabled/i)).toHaveAttribute('data-motion-ready', 'true'));
    expect(document.querySelector('.hero canvas')).toBeInTheDocument();
    expect(document.querySelector('.hero [aria-hidden="true"]')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /take the red pill/i }).querySelectorAll('.cta-word')).toHaveLength(3);
    expect(document.querySelectorAll('[data-motion-reveal][data-inview="true"]').length).toBeGreaterThan(8);
    expect(document.querySelector('[data-speaker-row][data-active="true"]')).toBeInTheDocument();
  });

  it('renders the live prediction market when loaded directly at /vote', () => {
    window.history.replaceState({}, '', '/vote');

    render(<App />);

    expect(screen.getByRole('heading', { name: /who will own the arena/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /probability history/i })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: /market outcomes/i }).children).toHaveLength(4);
    expect(screen.getByRole('form', { name: /order ticket/i })).toBeInTheDocument();
    expect(screen.getByText('Closes in')).toBeInTheDocument();
    expect(screen.getByText('10,000 PILL')).toBeInTheDocument();
  });

  it('disables native history scroll restoration while routing', () => {
    render(<App />);

    expect(window.history.scrollRestoration).toBe('manual');
  });

  it('follows popstate Back and Forward routes and resets scroll', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /take the red pill/i }));

    document.documentElement.scrollTop = 320;
    document.body.scrollTop = 320;
    traverseHistoryTo('/');

    expect(screen.getByText('Wake up. The arena is calling.')).toBeInTheDocument();
    expect(document.documentElement.scrollTop).toBe(0);
    expect(document.body.scrollTop).toBe(0);

    document.documentElement.scrollTop = 640;
    document.body.scrollTop = 640;
    traverseHistoryTo('/vote');

    expect(screen.getByRole('heading', { name: /who will own the arena/i })).toBeInTheDocument();
    expect(document.documentElement.scrollTop).toBe(0);
    expect(document.body.scrollTop).toBe(0);
  });

  it('opens the prediction market and buys a PILL position on a trader', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /take the red pill/i }));
    expect(screen.getByRole('heading', { name: /who will own the arena/i })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/vote');
    expect(screen.getByText(/no open positions/i)).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: /^Yes \d+$/ })[1]);
    const contracts = screen.getByLabelText('Contracts');
    await user.clear(contracts);
    await user.type(contracts, '10');
    await user.click(screen.getByRole('button', { name: /^buy 10 yes$/i }));

    expect(screen.getByRole('status')).toHaveTextContent(/bought 10 yes on lighter/i);
    expect(screen.queryByText(/no open positions/i)).not.toBeInTheDocument();
  });

  it('blocks an order that costs more PILL than the balance holds', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/vote');
    render(<App />);

    const contracts = screen.getByLabelText('Contracts');
    await user.clear(contracts);
    await user.type(contracts, '9000');

    expect(screen.getByRole('button', { name: /^buy 9,000 yes$/i })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(/not enough pill/i);
  });
});
