import { useState } from 'react';
import type { AppRoute } from '../router/routes';

type MarketRoute = 'perp-dex-market' | 'perp-dex-leaderboard' | 't2049-market' | 't2049-leaderboard';
const MARKET_EVENT = {
  'perp-dex-market': 'perp-dex-day',
  'perp-dex-leaderboard': 'perp-dex-day',
  't2049-market': 'perps-day',
  't2049-leaderboard': 'perps-day',
} as const;
const isMarketRoute = (route: AppRoute): route is MarketRoute => route in MARKET_EVENT;

// Session policy owns route gating, but knows nothing about Google, storage, or modal rendering.
export function useMarketAccess(requestedRoute: AppRoute, navigate: (route: AppRoute) => void) {
  const [authenticated, setAuthenticated] = useState(false);
  const [pendingMarket, setPendingMarket] = useState<MarketRoute | null>(null);
  const protectedRoute = isMarketRoute(requestedRoute) ? requestedRoute : null;
  const route = protectedRoute && !authenticated ? MARKET_EVENT[protectedRoute] : requestedRoute;
  const loginTarget = pendingMarket ?? (!authenticated ? protectedRoute : null);

  function enterMarket(target: MarketRoute) {
    if (authenticated) navigate(target);
    else setPendingMarket(target);
  }
  function cancelLogin() {
    setPendingMarket(null);
    if (protectedRoute) navigate(MARKET_EVENT[protectedRoute]);
  }
  function completeLogin() {
    if (!loginTarget) return;
    setAuthenticated(true);
    setPendingMarket(null);
    navigate(loginTarget);
  }
  const loginEventName = loginTarget && MARKET_EVENT[loginTarget] === 'perp-dex-day' ? 'PERP-DEX DAY' : 'TOKEN2049 · PERPS DAY';
  return { route, loginTarget, loginEventName, enterMarket, cancelLogin, completeLogin };
}
