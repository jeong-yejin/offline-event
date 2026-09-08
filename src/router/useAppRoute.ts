import { useCallback, useEffect, useState } from 'react';
import { EVENTS, type EventKey } from '../data/eventContent';

/* Each event is its own page, so the hub at '/' only introduces them. */
export type AppRoute = 'home' | 'vote' | EventKey;

const EVENT_KEYS: readonly string[] = EVENTS.map((event) => event.key);

function detectRoute(): AppRoute {
  const slug = window.location.pathname.replace(/^\/+|\/+$/g, '');
  if (slug === 'vote') return 'vote';
  if (EVENT_KEYS.includes(slug)) return slug as EventKey;
  return 'home';
}

export function routePath(route: AppRoute) {
  return route === 'home' ? '/' : `/${route}`;
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
