import { useCallback, useEffect, useState, type MouseEvent } from 'react';
import { EVENTS, type EventKey } from '../data/eventContent';
import { previewName } from './preview';

/* Each event is its own page, so the hub at '/' only introduces them. */
export type AppRoute = 'home' | 'perp-dex-market' | 't2049-market' | 't2049-teams' | 't2049-kalshi' | 'wonderland-board' | EventKey;

const EVENT_KEYS: readonly string[] = EVENTS.map((event) => event.key);

/* Every market page sits under the event it belongs to rather than at the root. PERP-DEX DAY moved
   off the old /vote path to match, so links to /vote now fall through to the hub. */
const PERP_DEX_MARKET_PATH = 'perp-dex-day/market';

/* The survival market moved under PERPS DAY along with the event. Links handed out under the old
   TOKEN2049 path still open the page, and the address bar is rewritten to the current one. */
const T2049_MARKET_PATH = 'perps-day/market';
const LEGACY_T2049_MARKET_PATH = 'token2049-side-event/market';

/* Team entry is its own screen so a tier contact can send the link on its own, without the reader
   having to scroll past an event page written for the audience. */
const T2049_TEAMS_PATH = 'perps-day/teams';

/* The Kalshi account screen ships before the competition and is promoted on its own link, so it is a
   route rather than a step inside the market page. */
const T2049_KALSHI_PATH = 'perps-day/kalshi';

/* Same rule for the Wonderland board: it is that night's leaderboard, not a second hub page. */
const WONDERLAND_BOARD_PATH = 'reboundx-in-wonderland/leaderboard';

const currentSlug = () => window.location.pathname.replace(/^\/+|\/+$/g, '');

/* The other preview cases rewind the market clock, which the event page itself can show. These two are
   screens of their own, so the case name has to reach the route or the reader lands on the event page
   and sees nothing different. */
const PREVIEW_ROUTES: Record<string, AppRoute> = { kalshi: 't2049-kalshi', teams: 't2049-teams' };

function detectRoute(): AppRoute {
  const preview = previewName();
  if (preview !== null && preview in PREVIEW_ROUTES) return PREVIEW_ROUTES[preview];
  const slug = currentSlug();
  if (slug === PERP_DEX_MARKET_PATH) return 'perp-dex-market';
  if (slug === T2049_MARKET_PATH || slug === LEGACY_T2049_MARKET_PATH) return 't2049-market';
  if (slug === T2049_TEAMS_PATH) return 't2049-teams';
  if (slug === T2049_KALSHI_PATH) return 't2049-kalshi';
  if (slug === WONDERLAND_BOARD_PATH) return 'wonderland-board';
  if (EVENT_KEYS.includes(slug)) return slug as EventKey;
  return 'home';
}

export function routePath(route: AppRoute) {
  if (route === 'home') return '/';
  if (route === 'perp-dex-market') return `/${PERP_DEX_MARKET_PATH}`;
  if (route === 't2049-market') return `/${T2049_MARKET_PATH}`;
  if (route === 't2049-teams') return `/${T2049_TEAMS_PATH}`;
  if (route === 't2049-kalshi') return `/${T2049_KALSHI_PATH}`;
  return route === 'wonderland-board' ? `/${WONDERLAND_BOARD_PATH}` : `/${route}`;
}

/* Plain links keep middle-click and copy-link working; the handler only spares the reload. */
export function navClick(onNavigate: (route: AppRoute) => void, route: AppRoute) {
  return (clickEvent: MouseEvent) => {
    if (clickEvent.metaKey || clickEvent.ctrlKey || clickEvent.shiftKey || clickEvent.button !== 0) return;
    clickEvent.preventDefault();
    onNavigate(route);
  };
}

function resetScroll() {
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export function useAppRoute() {
  const [route, setRoute] = useState<AppRoute>(() => detectRoute());

  const updateRoute = useCallback((nextRoute: AppRoute) => {
    setRoute(nextRoute);
    resetScroll();
  }, []);

  useEffect(() => {
    if (currentSlug() === LEGACY_T2049_MARKET_PATH) window.history.replaceState({}, '', routePath('t2049-market'));
  }, []);

  useEffect(() => {
    const restoresScroll = 'scrollRestoration' in window.history;
    const previousScrollRestoration = window.history.scrollRestoration;
    if (restoresScroll) window.history.scrollRestoration = 'manual';

    const syncRoute = () => updateRoute(detectRoute());
    window.addEventListener('popstate', syncRoute);
    return () => {
      window.removeEventListener('popstate', syncRoute);
      if (restoresScroll) window.history.scrollRestoration = previousScrollRestoration;
    };
  }, [updateRoute]);

  const navigate = useCallback((nextRoute: AppRoute) => {
    window.history.pushState({}, '', routePath(nextRoute));
    updateRoute(nextRoute);
  }, [updateRoute]);

  return { route, navigate };
}
