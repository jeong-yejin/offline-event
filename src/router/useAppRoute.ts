import { useCallback, useEffect, useState } from 'react';
import { previewName } from './preview';
import { LEGACY_T2049_MARKET_PATH, routeFromPath, routePath, type AppRoute } from './routes';

const currentSlug = () => window.location.pathname.replace(/^\/+|\/+$/g, '');
const detectRoute = () => routeFromPath(window.location.pathname, previewName());

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
