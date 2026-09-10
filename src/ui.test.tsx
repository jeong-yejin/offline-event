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

  /* Both market routes sit behind a sign-in gate. No Google client id is configured here, so the modal
     comes up as a single release button and a test about the market clears it and carries on. The gate
     itself is covered in marketGate.test.tsx. */
  function openMarket(path: string) {
    const user = userEvent.setup();
    renderAt(path);
    return passLoginGate(user).then(() => user);
  }

  async function passLoginGate(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: /continue with google/i }));
  }

  it('renders the Matrix-inspired eyebrow copy', () => {
    renderAt('/perp-dex-day');

    expect(screen.getByText('Wake up, Rebounder')).toBeInTheDocument();
    expect(screen.getByText('Choose the red pill and enter the Matrix')).toBeInTheDocument();
  });

  it('lists every event as a link on the hub, so the first screen only offers a choice', () => {
    renderAt('/');

    const picker = screen.getByRole('navigation', { name: /event selection/i });
    expect(within(picker).getAllByRole('link')).toHaveLength(3);
    expect(within(picker).getByRole('link', { name: 'PERP-DEX DAY' })).toHaveAttribute('href', '/perp-dex-day');
    expect(screen.queryByText('Live trading competition winner prediction betting')).not.toBeInTheDocument();
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
    expect(screen.queryByText('Live trading competition winner prediction betting')).not.toBeInTheDocument();

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

    expect(window.location.pathname).toBe('/perps-day');
    expect(document.querySelector('.hero')).toHaveAttribute('data-event', 'perps-day');
    expect(scrolled).not.toHaveBeenCalled();
    scrolled.mockRestore();
  });

  it('still opens the survival market from the link shared before it moved under PERPS DAY', async () => {
    await openMarket('/token2049-side-event/market');

    /* The old path was handed out to attendees, so it has to keep landing on the market. Rewriting the
       address bar is what stops the dead path from being copied out of the browser a second time.
       The page is identified by its own class, so rewording the headline cannot fail a routing test. */
    expect(document.querySelector('.t2049-market-page')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/perps-day/market');
  });

  it('carries the same three events across every detail page, as links out and not as tab panels', async () => {
    const user = userEvent.setup();
    renderAt('/perp-dex-day');
    const switcher = screen.getByRole('navigation', { name: 'Event selection' });

    /* Marking the current page is what separates navigation from a tab bar. */
    expect(within(switcher).getByRole('link', { current: 'page' })).toHaveTextContent('PERP-DEX DAY');

    await user.click(within(switcher).getByRole('link', { name: 'TOKEN2049 SIDE EVENT' }));

    expect(window.location.pathname).toBe('/perps-day');
    expect(document.querySelector('.hero')).toHaveAttribute('data-event', 'perps-day');
    const moved = screen.getByRole('navigation', { name: 'Event selection' });
    expect(within(moved).getByRole('link', { current: 'page' })).toHaveTextContent('TOKEN2049 SIDE EVENT');
  });

  it('keeps one event\'s date out of the hub hero, which introduces all three', () => {
    renderAt('/');
    const pageHero = document.querySelector('.reboundx-hero') as HTMLElement;
    expect(within(pageHero).getByText(/PERP-DEX DAY, REBOUNDX DAY and TOKEN2049/)).toBeInTheDocument();
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

  it('keeps the leaderboard reachable after the hero CTA became the terminal door', async () => {
    const user = userEvent.setup();
    renderAt('/reboundx-in-wonderland');

    const hero = document.querySelector('.reboundx-hero') as HTMLElement;
    expect(within(hero).getByRole('link', { name: /drink me/i }))
      .toHaveAttribute('href', 'https://reboundx.net/en/terminal-exchange/BINANCE/perp/BTCUSDT');
    expect(within(hero).queryByRole('button', { name: /leaderboard/i })).toBeNull();

    await user.click(screen.getByRole('button', { name: /leaderboard/i }));
    expect(window.location.pathname).toBe('/reboundx-in-wonderland/leaderboard');
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

    await user.click(screen.getByRole('button', { name: /justin/i }));

    expect(screen.getByRole('button', { name: /justin/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByAltText('Justin')).toBeInTheDocument();
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
    expect(screen.getByRole('link', { name: /open wonderland in a new tab/i })).toHaveAttribute('href', '/reboundx/index.html?content=1&lang=en');
  });

  it('stops telling TOKEN2049 visitors that details are missing once the run of show is on the page', () => {
    renderAt('/perps-day');

    expect(screen.queryByText(/details coming soon/i)).not.toBeInTheDocument();
    /* The hero opens on the action now, so the run of show sits below it rather than behind a jump link. */
    expect(screen.getByRole('heading', { level: 2, name: /run of show|timetable/i })).toBeInTheDocument();
  });

  it('names Kalshi as a co-host of the TOKEN2049 experience, not a line in the fine print', () => {
    renderAt('/perps-day');
    const hero = document.querySelector('.hero') as HTMLElement;

    /* The hero names PERPS DAY; the co-host credit lives in Date & Venue.
       It still has to sit in running copy a reader meets, not in the footer's fine print. */
    expect(within(hero).getByRole('heading', { level: 1 })).toHaveTextContent('PERPS DAY');

    const venue = document.querySelector('.t2049-venue') as HTMLElement;
    expect(within(venue).getByText(/ReboundX and Kalshi/)).toBeInTheDocument();

    const kalshi = document.querySelector('.t2049-kalshi') as HTMLElement;
    expect(within(kalshi).getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(within(kalshi).getAllByRole('listitem')).toHaveLength(3);
  });

  it('states the confirmed TOKEN2049 venue and keeps TBA only where nothing is settled', () => {
    renderAt('/perps-day');
    const rows = document.querySelectorAll('.t2049-venue-list > div');
    const row = (label: string) => Array.from(rows).find((entry) => entry.querySelector('dt')?.textContent === label);

    /* Guests book flights off this table. A placeholder here reads as an unbooked venue, so the
       confirmed rows have to carry the real answer and the unconfirmed ones have to keep saying so. */
    expect(row('Date')).toHaveTextContent('October 5, 2026');
    expect(row('Venue')).toHaveTextContent('Zouk');
    expect(row('Venue')).not.toHaveTextContent(/TBA/);
    expect(row('Admission')).toHaveTextContent(/RSVP Required/);
  });

  it('hands the TOKEN2049 audience-betting slot off to the prediction market', async () => {
    const user = userEvent.setup();
    renderAt('/perps-day');

    /* The venue rows above own the address. Here the timetable has to keep 19:30 pointing at the
       market, because that row is the only thing telling a reader when the button matters. */
    expect(screen.getByText('19:30').closest('.agenda-row')).toHaveTextContent('Audience Betting for Winner');

    await user.click(screen.getByRole('button', { name: /predict the winner/i }));
    await passLoginGate(user);

    expect(document.querySelector('.t2049-market-page')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/perps-day/market');
  });

  it('keeps every timetable time and title as a single text run', () => {
    renderAt('/perp-dex-day');

    expect(document.querySelectorAll('.agenda-row time')).toHaveLength(7);
    expect(within(document.querySelector('.agenda-list') as HTMLElement).getByText('16:00')).toBeInTheDocument();
    expect(screen.getByText('Live trading competition winner prediction betting')).toBeInTheDocument();
    expect(screen.getByText('Networking')).toBeInTheDocument();
  });

  it('swaps the featured portrait to the speaker under the pointer', async () => {
    const user = userEvent.setup();
    renderAt('/perp-dex-day');

    await user.hover(screen.getByText('Justin'));

    const rows = Array.from(document.querySelectorAll('[data-speaker-row]'));
    const portraits = Array.from(document.querySelectorAll('.featured-speaker'));
    expect(portraits).toHaveLength(rows.length);
    expect(rows.findIndex((row) => row.getAttribute('data-active') === 'true'))
      .toBe(portraits.findIndex((portrait) => portrait.getAttribute('data-active') === 'true'));
  });

  it('shows the hero CTA label from first paint instead of staggering it in', () => {
    renderAt('/perp-dex-day');
    const words = screen.getByRole('button', { name: /take the red pill/i }).querySelectorAll('.cta-word');

    /* Reveal elements start at opacity 0 and the hero stagger ran 2.15s deep, so the primary CTA sat
       there as an empty pill with a lone arrow while the page loaded. Every other reveal can wait. */
    expect(words).toHaveLength(3);
    words.forEach((word) => {
      expect(word).not.toHaveClass('slideIn');
      expect(word).not.toHaveAttribute('data-motion-reveal');
    });
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

  it('renders the live prediction market when loaded directly at /perp-dex-day/market', async () => {
    await openMarket('/perp-dex-day/market');

    expect(screen.getByRole('heading', { name: /who will rule the matrix/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /probability history/i })).toBeInTheDocument();
    expect(screen.getByRole('form', { name: /order ticket/i })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: /player leaderboard/i })).toBeInTheDocument();

    /* The bar carries the four numbers a player needs before they can act, and the badge above it
       says whether acting is possible at all. */
    expect(document.querySelector('.market-state')).toHaveTextContent('Live');
    const bar = document.querySelector('.market-bar') as HTMLElement;
    expect(within(bar).getByText('Available point').nextElementSibling).toHaveTextContent('100 pt');
    expect(within(bar).getByText('Total asset').nextElementSibling).toHaveTextContent('100 pt');
    expect(within(bar).getByText('My rank').nextElementSibling).not.toBeEmptyDOMElement();
  });

  it('opens all four traders level, because they start on the same margin balance', async () => {
    await openMarket('/perp-dex-day/market');

    const rows = screen.getAllByRole('row').filter((row) => row.classList.contains('trader-row'));
    expect(rows).toHaveLength(4);
    rows.forEach((row) => {
      const cells = within(row).getAllByRole('cell');
      expect(cells[0]).toHaveTextContent('10,000 USDT');
      expect(cells[2]).toHaveTextContent('25%');
    });
    expect(within(rows[0]).getByRole('rowheader')).toHaveTextContent('Trader A');
    /* The exchange's mark is the only place the exchange is named, so the row prints the trader and
       leaves the affiliation to the logo's alt text. */
    expect(rows[0]).not.toHaveTextContent('Variational');
    expect(within(rows[0]).getByRole('img', { name: 'Variational' })).toHaveClass('trader-logo');
  });

  it('disables native history scroll restoration while routing', () => {
    render(<App />);

    expect(window.history.scrollRestoration).toBe('manual');
  });

  it('follows popstate Back and Forward routes and resets scroll', async () => {
    const user = userEvent.setup();
    renderAt('/perp-dex-day');

    await user.click(screen.getByRole('button', { name: /take the red pill/i }));
    await passLoginGate(user);

    document.documentElement.scrollTop = 320;
    document.body.scrollTop = 320;
    traverseHistoryTo('/perp-dex-day');

    expect(screen.getByText('Wake up, Rebounder')).toBeInTheDocument();
    expect(document.documentElement.scrollTop).toBe(0);
    expect(document.body.scrollTop).toBe(0);

    document.documentElement.scrollTop = 640;
    document.body.scrollTop = 640;
    traverseHistoryTo('/perp-dex-day/market');

    expect(screen.getByRole('heading', { name: /who will rule the matrix/i })).toBeInTheDocument();
    expect(document.documentElement.scrollTop).toBe(0);
    expect(document.body.scrollTop).toBe(0);
  });

  it('quotes an order before it fills, so the price a player accepts is the price they pay', async () => {
    const user = userEvent.setup();
    renderAt('/perp-dex-day');

    await user.click(screen.getByRole('button', { name: /take the red pill/i }));
    await passLoginGate(user);
    expect(window.location.pathname).toBe('/perp-dex-day/market');
    /* A flat player is not shown an empty holdings table, so the section only exists once it has a
       row to print. */
    expect(document.querySelector('.market-positions')).toBeNull();

    const rows = screen.getAllByRole('row').filter((row) => row.classList.contains('trader-row'));
    await user.click(within(rows[1]).getByRole('button', { name: /^yes/i }));

    const quantity = screen.getByLabelText('Quantity');
    await user.clear(quantity);
    await user.type(quantity, '2');
    await user.click(screen.getByRole('button', { name: /request buy quote/i }));

    /* The quote is a firm price with a countdown. Nothing is booked until it is accepted. */
    const ticket = screen.getByRole('form', { name: /order ticket/i });
    expect(within(ticket).getByText(/this price holds for/i)).toBeInTheDocument();
    expect(quantity).toBeDisabled();
    expect(document.querySelector('.market-positions')).toBeNull();

    await user.click(screen.getByRole('button', { name: /^confirm buy$/i }));

    expect(screen.getByText(/bought 2 yes on trader b/i)).toBeInTheDocument();
    expect(document.querySelectorAll('.position-row')).toHaveLength(1);
    const position = document.querySelector('.position-row') as HTMLElement;
    expect(within(position).getByRole('rowheader')).toHaveTextContent('Trader B');
    expect(within(position).getAllByRole('cell')[0]).toHaveTextContent('2');
  });

  it('refuses to quote an order the point balance cannot cover, and says how many it can', async () => {
    const user = await openMarket('/perp-dex-day/market');

    const quantity = screen.getByLabelText('Quantity');
    await user.clear(quantity);
    await user.type(quantity, '9000');
    await user.click(screen.getByRole('button', { name: /request buy quote/i }));

    expect(screen.getByText(/100 points, enough for \d+ at this price/i)).toBeInTheDocument();
    expect(screen.queryByText(/this price holds for/i)).not.toBeInTheDocument();
  });

  it('refuses a fractional quantity, because a position is a whole count', async () => {
    const user = await openMarket('/perp-dex-day/market');

    const quantity = screen.getByLabelText('Quantity');
    await user.clear(quantity);
    await user.type(quantity, '0.5');
    await user.click(screen.getByRole('button', { name: /request buy quote/i }));

    expect(screen.getByText(/whole number of 1 or more/i)).toBeInTheDocument();
    expect(screen.queryByText(/this price holds for/i)).not.toBeInTheDocument();
  });

  it('keeps the hero team entry and shows the Figma RSVP attendance details', () => {
    renderAt('/perps-day');
    const hero = document.querySelector('.hero') as HTMLElement;

    expect(within(hero).getByRole('button', { name: /enter your team/i })).toBeInTheDocument();

    const rsvp = document.querySelector('.t2049-rsvp') as HTMLElement;
    expect(rsvp).toHaveTextContent(/confirmation, venue details and door time/i);
    expect(within(rsvp).getAllByRole('listitem')).toHaveLength(3);
    expect(within(rsvp).getByText(/predict the winner with your points/i)).toBeInTheDocument();
  });

  it('sends the team CTA to its own screen instead of scrolling the event page', async () => {
    const user = userEvent.setup();
    renderAt('/perps-day');
    const hero = document.querySelector('.hero') as HTMLElement;

    /* The tier contact hands the link out on its own, so team entry has to be somewhere a reader can
       land directly rather than an anchor part-way down a page written for the audience. */
    await user.click(within(hero).getByRole('button', { name: /enter your team/i }));

    expect(window.location.pathname).toBe('/perps-day/teams');
    expect(document.querySelector('.t2049-teams-page')).toBeInTheDocument();
  });

  it('turns a team away until the invitation code proves the tier picked them', async () => {
    const user = userEvent.setup();
    renderAt('/perps-day/teams');

    /* Slots were sold by tier before the event. A page that accepts any name is an open application,
       which is the thing this screen exists not to be. */
    await user.type(screen.getByLabelText(/invitation code/i), 'LET ME IN');
    await user.type(screen.getByLabelText(/trader 01/i), 'Ha-eun Seo');
    await user.type(screen.getByLabelText(/trader 02/i), 'Marco Villalba');
    await user.click(screen.getByRole('button', { name: /confirm team/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/TIER-XXXX-XXXX/);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('holds a confirmed team on screen so the exchange can check the two names it sent', async () => {
    const user = userEvent.setup();
    renderAt('/perps-day/teams');

    await user.type(screen.getByLabelText(/invitation code/i), 'tier-9f2a-40kd');
    await user.type(screen.getByLabelText(/trader 01/i), 'Ha-eun Seo');
    await user.type(screen.getByLabelText(/trader 02/i), 'Marco Villalba');
    await user.click(screen.getByRole('button', { name: /confirm team/i }));

    /* Nothing is sent anywhere, so the receipt on screen is the only record the exchange gets of what
       it typed. Losing a name here loses it for good. */
    const done = screen.getByRole('status');
    expect(done).toHaveTextContent('TIER-9F2A-40KD');
    expect(done).toHaveTextContent('Ha-eun Seo');
    expect(done).toHaveTextContent('Marco Villalba');
  });

  it('opens the Kalshi account screen on its own route, because it is promoted before the competition', async () => {
    const user = userEvent.setup();
    renderAt('/perps-day');

    /* The address is collected in the run-up to the event and the link is handed out on its own, so
       the screen has to be somewhere a reader can land directly. */
    await user.click(screen.getByRole('button', { name: /add your kalshi account/i }));

    expect(window.location.pathname).toBe('/perps-day/kalshi');
    expect(document.querySelector('.t2049-kalshi-page')).toBeInTheDocument();
  });

  it('refuses an address that is not one, because a typo is only found when rewards are paid', async () => {
    const user = userEvent.setup();
    renderAt('/perps-day/kalshi');

    await user.type(screen.getByLabelText(/kalshi account email/i), 'not-an-address');
    await user.click(screen.getByRole('button', { name: /save kalshi email/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/email address on your kalshi account/i);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('stops a saved address at Pending, because only Kalshi can say Verified or Rejected', async () => {
    const user = userEvent.setup();
    renderAt('/perps-day/kalshi');

    await user.type(screen.getByLabelText(/kalshi account email/i), 'ha-eun.seo@fastmail.com');
    await user.click(screen.getByRole('button', { name: /save kalshi email/i }));

    /* Nothing is sent to Kalshi here. Reading the receipt as Verified would promise a reward the site
       has no way to owe. */
    const done = screen.getByRole('status');
    expect(done).toHaveTextContent('ha-eun.seo@fastmail.com');
    expect(done).toHaveTextContent(/your status: pending/i);
    expect(done).not.toHaveTextContent(/verified/i);
  });

  it('keeps the TOKEN2049 format readable to someone who has never traded', () => {
    renderAt('/perps-day');
    const main = screen.getByRole('main');

    /* The brief rejected trading jargon and the two combat lines. A reader who meets "seed" or
       "last trader standing" is reading copy that was reverted. */
    expect(main).not.toHaveTextContent(/\bseed\b/i);
    expect(main).not.toHaveTextContent(/walks out|last trader standing/i);

    /* Semifinal eliminates, final ranks. Collapsing the two is the mistake this guards. */
    expect(main).toHaveTextContent(/equal live accounts|same balance/i);
    expect(main).toHaveTextContent(/(eliminated|elimination|drops) every 7 minutes 30 seconds/i);
    expect(main).toHaveTextContent(/highest percentage return at the end of the final/i);
  });

  it('counts the open team slots off the roster instead of hard-coding the headline', () => {
    renderAt('/perps-day');
    const entry = document.querySelector('.t2049-entry') as HTMLElement;
    const open = document.querySelectorAll('.t2049-team-grid [data-status="open"]').length;

    /* One open slot reads "1 team slot left", not "1 team slots left", and the number has to move
       with the roster rather than with a copy edit. */
    expect(within(entry).getByRole('heading', { level: 2 })).toHaveTextContent(`${open} team slot${open === 1 ? '' : 's'} left.`);
    expect(open).toBeGreaterThan(0);
  });

  it('gives PERPS DAY its own share card without rebranding the rest of the site', () => {
    const view = renderAt('/perps-day');
    const description = () => document.head.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';

    expect(document.title).toMatch(/PERPS DAY/);
    expect(description()).toMatch(/eight traders/i);

    /* Leaving the route has to hand the head back. The rest of the site is still PERP-DEX DAY. */
    view.unmount();
    renderAt('/perp-dex-day');

    expect(document.title).not.toMatch(/PERPS DAY/);
    expect(description()).not.toMatch(/eight traders/i);
  });

  it('holds the TOKEN2049 page in English for a reader whose choice is Korean', () => {
    window.localStorage.setItem('perpdex.lang.v1', 'ko');
    renderAt('/perps-day');

    /* The event is run in Singapore and ships English-only copy. A half-translated page, where the
       footer and switcher turn Korean under an English format section, is the failure this catches. */
    expect(document.body.textContent ?? '').not.toMatch(/[\uac00-\ud7a3]/);
    expect(document.documentElement.lang).toBe('en');

    /* No switch offered, because there is nothing on the other side of it. */
    expect(screen.queryByRole('button', { name: /read in korean/i })).not.toBeInTheDocument();

    /* The choice belongs to the reader, not to this page: it is still there when they leave. */
    expect(window.localStorage.getItem('perpdex.lang.v1')).toBe('ko');
  });

  it('holds the TOKEN2049 survival market in English for a reader whose choice is Korean', () => {
    window.localStorage.setItem('perpdex.lang.v1', 'ko');
    renderAt('/perps-day/market');

    /* The market route inherits the PERP-DEX DAY market's trading components, whose labels are translated for
       PERP-DEX DAY. Pulling them in untouched is what turns this page half-Korean. */
    expect(document.body.textContent ?? '').not.toMatch(/[\uac00-\ud7a3]/);
    expect(document.documentElement.lang).toBe('en');
    expect(screen.queryByRole('button', { name: /read in korean/i })).not.toBeInTheDocument();
  });

  it('switches the whole interface to Korean and remembers the choice', async () => {
    const user = userEvent.setup();
    const view = renderAt('/perp-dex-day');

    await user.click(screen.getByRole('button', { name: /read in korean/i }));

    expect(screen.getByText('빨간 알약을 선택하고 매트릭스에 들어오세요')).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('ko');

    view.unmount();
    renderAt('/perp-dex-day');

    expect(screen.getByText('빨간 알약을 선택하고 매트릭스에 들어오세요')).toBeInTheDocument();
  });
});
