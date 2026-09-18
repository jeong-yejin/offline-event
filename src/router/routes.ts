import { EVENTS, type EventKey } from '../data/eventContent';

/* Each event is its own page, so the hub at '/' only introduces them. */
export type AppRoute = 'home' | 'perp-dex-market' | 'perp-dex-leaderboard' | 't2049-market' | 't2049-leaderboard' | 't2049-kalshi' | 'wonderland-board' | EventKey;

const EVENT_KEYS: readonly string[] = EVENTS.map((event) => event.key);

/* Every market page sits under the event it belongs to rather than at the root. PERP-DEX DAY moved
   off the old /vote path to match, so links to /vote now fall through to the hub. */
const PERP_DEX_MARKET_PATH = 'perp-dex-day/market';

/* The survival market moved under PERPS DAY along with the event. Links handed out under the old
   TOKEN2049 path still open the page, and the address bar is rewritten to the current one. */
const T2049_MARKET_PATH = 'perps-day/market';
export const LEGACY_T2049_MARKET_PATH = 'token2049-side-event/market';

/* The Kalshi account screen ships before the competition and is promoted on its own link, so it is a
   route rather than a step inside the market page. */
const T2049_KALSHI_PATH = 'perps-day/kalshi';

/* Each market shows the top ten on its own board. The whole field lives one level under the market it
   belongs to, so the address says which competition the standings are from. */
const PERP_DEX_LEADERBOARD_PATH = `${PERP_DEX_MARKET_PATH}/leaderboard`;
const T2049_LEADERBOARD_PATH = `${T2049_MARKET_PATH}/leaderboard`;

/* Same rule for the Wonderland board: it is that night's leaderboard, not a second hub page. */
const WONDERLAND_BOARD_PATH = 'reboundx-in-wonderland/leaderboard';

/* The other preview cases rewind the market clock, which the event page itself can show. This one is a
   screen of its own, so the case name has to reach the route or the reader lands on the event page and
   sees nothing different. */
const PREVIEW_ROUTES: Record<string, AppRoute> = { kalshi: 't2049-kalshi' };

export function routeFromPath(pathname: string, preview: string | null = null): AppRoute {
  if (preview !== null && preview in PREVIEW_ROUTES) return PREVIEW_ROUTES[preview];
  const slug = pathname.replace(/^\/+|\/+$/g, '');
  if (slug === PERP_DEX_LEADERBOARD_PATH) return 'perp-dex-leaderboard';
  if (slug === T2049_LEADERBOARD_PATH) return 't2049-leaderboard';
  if (slug === PERP_DEX_MARKET_PATH) return 'perp-dex-market';
  if (slug === T2049_MARKET_PATH || slug === LEGACY_T2049_MARKET_PATH) return 't2049-market';
  if (slug === T2049_KALSHI_PATH) return 't2049-kalshi';
  if (slug === WONDERLAND_BOARD_PATH) return 'wonderland-board';
  if (EVENT_KEYS.includes(slug)) return slug as EventKey;
  return 'home';
}

export function routePath(route: AppRoute) {
  if (route === 'home') return '/';
  if (route === 'perp-dex-market') return `/${PERP_DEX_MARKET_PATH}`;
  if (route === 'perp-dex-leaderboard') return `/${PERP_DEX_LEADERBOARD_PATH}`;
  if (route === 't2049-market') return `/${T2049_MARKET_PATH}`;
  if (route === 't2049-leaderboard') return `/${T2049_LEADERBOARD_PATH}`;
  if (route === 't2049-kalshi') return `/${T2049_KALSHI_PATH}`;
  return route === 'wonderland-board' ? `/${WONDERLAND_BOARD_PATH}` : `/${route}`;
}
