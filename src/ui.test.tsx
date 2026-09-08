// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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

  /* Every event has its own page now, so a test renders the route it is about. */
  function renderAt(path: string) {
    window.history.replaceState({}, '', path);
    return render(<App />);
  }

  it('renders the Matrix-inspired eyebrow copy', () => {
    renderAt('/perp-dex-day');

    expect(screen.getByText('Wake up. The arena is calling.')).toBeInTheDocument();
    expect(screen.getByText('Choose the red pill. Enter the construct.')).toBeInTheDocument();
  });

  it('lists every event as a link on the hub, so the first screen only offers a choice', () => {
    renderAt('/');

    const picker = screen.getByRole('navigation', { name: /event selection/i });
    expect(within(picker).getAllByRole('link')).toHaveLength(3);
    expect(within(picker).getByRole('link', { name: 'PERP-DEX DAY' })).toHaveAttribute('href', '/perp-dex-day');
    expect(screen.queryByText('Live trading competition winner betting')).not.toBeInTheDocument();
  });

  it('leaves the hub for the picked event page and finds a way back', async () => {
    const user = userEvent.setup();
    renderAt('/');

    await user.click(screen.getByRole('link', { name: 'REBOUNDX IN WONDERLAND' }));

    expect(window.location.pathname).toBe('/reboundx-in-wonderland');
    const wonderland = screen.getByRole('region', { name: 'REBOUNDX IN WONDERLAND' });
    expect(wonderland).toContainElement(screen.getByTitle('ReboundX in Wonderland event page'));
    expect(screen.getByTitle('ReboundX in Wonderland event page')).toHaveAttribute('src', '/reboundx/index.html?content=1');
    /* The hub hero stays on '/', so an event page carries only its own. */
    expect(document.querySelectorAll('.reboundx-hero')).toHaveLength(1);
    expect(within(wonderland).getByRole('img', { name: 'ReboundX in Wonderland' })).toBeInTheDocument();
    expect(screen.queryByText('Live trading competition winner betting')).not.toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /go to reboundx home/i }));

    expect(window.location.pathname).toBe('/');
    expect(screen.getByRole('link', { name: 'PERP-DEX DAY' })).toBeInTheDocument();
  });

  it('gives the hub its own hero and each event page the hero for that event', () => {
    renderAt('/');
    expect(document.querySelector('.reboundx-hero--page')).toBeInTheDocument();
    expect(document.querySelector('.hero')).toBeNull();

    cleanup();
    renderAt('/perp-dex-day');
    expect(document.querySelector('.reboundx-hero--page')).toBeNull();
    expect(document.querySelector('.hero')).toHaveAttribute('data-event', 'perp-dex-day');
  });

  it('puts the event picker inside the hub hero, so the first screen is where an event is chosen', () => {
    renderAt('/');

    const pageHero = document.querySelector('.reboundx-hero') as HTMLElement;
    expect(within(pageHero).getByRole('navigation', { name: /event selection/i })).toBeInTheDocument();
    expect(within(pageHero).getAllByRole('link')).toHaveLength(3);
  });

  it('takes a picked event to its own page instead of scrolling the hub', async () => {
    const user = userEvent.setup();
    const scrolled = vi.spyOn(Element.prototype, 'scrollIntoView');
    renderAt('/');

    await user.click(screen.getByRole('link', { name: 'TOKEN2049 SIDE EVENT' }));

    expect(window.location.pathname).toBe('/token2049-side-event');
    expect(document.querySelector('.hero')).toHaveAttribute('data-event', 'token2049-side-event');
    expect(scrolled).not.toHaveBeenCalled();
    scrolled.mockRestore();
  });

  it('carries the same three events across every detail page, as links out and not as tab panels', async () => {
    const user = userEvent.setup();
    renderAt('/perp-dex-day');
    const switcher = screen.getByRole('navigation', { name: 'Event selection' });

    /* Marking the current page is what separates navigation from a tab bar. */
    expect(within(switcher).getByRole('link', { current: 'page' })).toHaveTextContent('PERP-DEX DAY');

    await user.click(within(switcher).getByRole('link', { name: 'TOKEN2049 SIDE EVENT' }));

    expect(window.location.pathname).toBe('/token2049-side-event');
    expect(document.querySelector('.hero')).toHaveAttribute('data-event', 'token2049-side-event');
    const moved = screen.getByRole('navigation', { name: 'Event selection' });
    expect(within(moved).getByRole('link', { current: 'page' })).toHaveTextContent('TOKEN2049 SIDE EVENT');
  });

  it('keeps one event\'s date out of the hub hero, which introduces all three', () => {
    renderAt('/');
    const pageHero = document.querySelector('.reboundx-hero') as HTMLElement;
    expect(within(pageHero).getByText(/PERP-DEX DAY, REBOUNDX DAY, TOKEN2049/)).toBeInTheDocument();
    expect(within(pageHero).queryByText('SJ KUNSTHALLE')).toBeNull();

    cleanup();
    renderAt('/reboundx-in-wonderland');
    const eventHero = document.querySelector('.reboundx-hero') as HTMLElement;
    expect(within(eventHero).getByText('SJ KUNSTHALLE')).toBeInTheDocument();
  });

  it('opens the ReboundX Drink Me link in a new tab, so the event page is never lost', async () => {
    const user = userEvent.setup();
    renderAt('/reboundx-in-wonderland');

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
      expect(externalLink.target).toBe('_blank');
      expect(externalLink.rel).toBe('noopener noreferrer');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('gives keyboard users a jump past the header and the event picker', async () => {
    const user = userEvent.setup();
    renderAt('/');

    await user.tab();

    expect(screen.getByRole('link', { name: /skip to content/i })).toHaveFocus();
  });

  it('lets a click drive the speaker portrait, not only a pointer that never lands on touch', async () => {
    const user = userEvent.setup();
    renderAt('/perp-dex-day');

    await user.click(screen.getByRole('button', { name: /hansolar/i }));

    expect(screen.getByRole('button', { name: /hansolar/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByAltText('Hansolar')).toBeInTheDocument();
  });

  it('holds the Wonderland panel open with a loading state instead of collapsing to nothing', () => {
    renderAt('/reboundx-in-wonderland');

    expect(screen.getByRole('status', { name: /loading the wonderland page/i })).toBeInTheDocument();
  });

  it('offers a way into Wonderland when the embed comes back empty, instead of a blank panel', () => {
    renderAt('/reboundx-in-wonderland');

    const frame = screen.getByTitle('ReboundX in Wonderland event page');
    Object.defineProperty(frame, 'contentDocument', { configurable: true, value: document.implementation.createHTMLDocument() });

    fireEvent.load(frame);

    expect(screen.getByText(/did not load/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open wonderland in a new tab/i })).toHaveAttribute('href', '/reboundx/index.html?content=1');
  });

  it('stops telling TOKEN2049 visitors that details are missing once the run of show is on the page', () => {
    renderAt('/token2049-side-event');

    expect(screen.queryByText(/details coming soon/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /see the run of show/i })).toHaveAttribute('href', '#t2049-schedule-title');
  });

  it('hands the TOKEN2049 audience-betting slot off to the prediction market', async () => {
    const user = userEvent.setup();
    renderAt('/token2049-side-event');

    expect(screen.getByRole('main')).toHaveTextContent('Zouk \u00b7 Clarke Quay');
    expect(screen.getByText('19:30').closest('.agenda-row')).toHaveTextContent('Audience Betting for Winner');

    await user.click(screen.getByRole('button', { name: /open the prediction market/i }));

    expect(screen.getByRole('heading', { name: /who will own the arena/i })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/vote');
  });

  it('keeps every timetable time and title as a single text run', () => {
    renderAt('/perp-dex-day');

    expect(document.querySelectorAll('.agenda-row time')).toHaveLength(7);
    expect(within(document.querySelector('.agenda-list') as HTMLElement).getByText('16:00')).toBeInTheDocument();
    expect(screen.getByText('Live trading competition winner betting')).toBeInTheDocument();
    expect(screen.getByText('VIP MAFIA NIGHT/ Networking')).toBeInTheDocument();
  });

  it('swaps the featured portrait to the speaker under the pointer', async () => {
    const user = userEvent.setup();
    renderAt('/perp-dex-day');

    await user.hover(screen.getByText('Hansolar'));

    const rows = Array.from(document.querySelectorAll('[data-speaker-row]'));
    const portraits = Array.from(document.querySelectorAll('.featured-speaker'));
    expect(portraits).toHaveLength(rows.length);
    expect(rows.findIndex((row) => row.getAttribute('data-active') === 'true'))
      .toBe(portraits.findIndex((portrait) => portrait.getAttribute('data-active') === 'true'));
  });

  it('attaches the PERP-DEX DAY motion system to the page', async () => {
    renderAt('/perp-dex-day');

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
    expect(screen.getByRole('form', { name: /order ticket/i })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: /player leaderboard/i })).toBeInTheDocument();

    /* The bar carries the four numbers a player needs before they can act. */
    const bar = document.querySelector('.market-bar') as HTMLElement;
    expect(within(bar).getByText('Status').nextElementSibling).toHaveTextContent('Live');
    expect(within(bar).getByText('Available point').nextElementSibling).toHaveTextContent('100 pt');
    expect(within(bar).getByText('Total asset').nextElementSibling).toHaveTextContent('100 pt');
    expect(within(bar).getByText('My rank').nextElementSibling).not.toBeEmptyDOMElement();
  });

  it('opens all four traders level, because they start on the same margin balance', () => {
    window.history.replaceState({}, '', '/vote');

    render(<App />);

    const cards = Array.from(document.querySelectorAll('.trader-card')) as HTMLElement[];
    expect(cards).toHaveLength(4);
    cards.forEach((card) => {
      expect(within(card).getByText('Margin balance').nextElementSibling).toHaveTextContent('10,000 USDT');
      expect(within(card).getByText('Market probability').nextElementSibling).toHaveTextContent('25%');
    });
    expect(within(cards[0]).getByRole('heading', { level: 3 })).toHaveTextContent('Trader A');
    expect(cards[0]).toHaveTextContent('Variational');
  });

  it('disables native history scroll restoration while routing', () => {
    render(<App />);

    expect(window.history.scrollRestoration).toBe('manual');
  });

  it('follows popstate Back and Forward routes and resets scroll', async () => {
    const user = userEvent.setup();
    renderAt('/perp-dex-day');

    await user.click(screen.getByRole('button', { name: /take the red pill/i }));

    document.documentElement.scrollTop = 320;
    document.body.scrollTop = 320;
    traverseHistoryTo('/perp-dex-day');

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

  it('quotes an order before it fills, so the price a player accepts is the price they pay', async () => {
    const user = userEvent.setup();
    renderAt('/perp-dex-day');

    await user.click(screen.getByRole('button', { name: /take the red pill/i }));
    expect(window.location.pathname).toBe('/vote');
    expect(screen.getByText(/no open positions/i)).toBeInTheDocument();

    const cards = Array.from(document.querySelectorAll('.trader-card')) as HTMLElement[];
    await user.click(within(cards[1]).getByRole('button', { name: /^yes/i }));

    const quantity = screen.getByLabelText('Quantity');
    await user.clear(quantity);
    await user.type(quantity, '2');
    await user.click(screen.getByRole('button', { name: /request buy quote/i }));

    /* The quote is a firm price with a countdown. Nothing is booked until it is accepted. */
    const ticket = screen.getByRole('form', { name: /order ticket/i });
    expect(within(ticket).getByText(/this price holds for/i)).toBeInTheDocument();
    expect(quantity).toBeDisabled();
    expect(screen.getByText(/no open positions/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^confirm buy$/i }));

    expect(screen.getByText(/bought 2 yes on trader b/i)).toBeInTheDocument();
    expect(screen.queryByText(/no open positions/i)).not.toBeInTheDocument();
    expect(document.querySelectorAll('.position-row')).toHaveLength(1);
    expect(within(document.querySelector('.position-row') as HTMLElement).getByText('Quantity').nextElementSibling).toHaveTextContent('2');
  });

  it('refuses to quote an order the point balance cannot cover, and says how many it can', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/vote');
    render(<App />);

    const quantity = screen.getByLabelText('Quantity');
    await user.clear(quantity);
    await user.type(quantity, '9000');
    await user.click(screen.getByRole('button', { name: /request buy quote/i }));

    expect(screen.getByText(/100 points, enough for \d+ at this price/i)).toBeInTheDocument();
    expect(screen.queryByText(/this price holds for/i)).not.toBeInTheDocument();
  });

  it('refuses a fractional quantity, because a position is a whole count', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/vote');
    render(<App />);

    const quantity = screen.getByLabelText('Quantity');
    await user.clear(quantity);
    await user.type(quantity, '0.5');
    await user.click(screen.getByRole('button', { name: /request buy quote/i }));

    expect(screen.getByText(/whole number of 1 or more/i)).toBeInTheDocument();
    expect(screen.queryByText(/this price holds for/i)).not.toBeInTheDocument();
  });

  it('switches the whole interface to Korean and remembers the choice', async () => {
    const user = userEvent.setup();
    const view = renderAt('/perp-dex-day');

    await user.click(screen.getByRole('button', { name: /read in korean/i }));

    expect(screen.getByText('빨간 알약을 골라라. 구조체로 들어가라.')).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('ko');

    view.unmount();
    renderAt('/perp-dex-day');

    expect(screen.getByText('빨간 알약을 골라라. 구조체로 들어가라.')).toBeInTheDocument();
  });
});
