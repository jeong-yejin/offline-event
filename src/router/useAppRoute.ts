import { useCallback, useEffect, useState } from 'react';

export type AppRoute = 'home' | 'vote';

function detectRoute(): AppRoute {
  return window.location.pathname === '/vote' ? 'vote' : 'home';
}

function routePath(route: AppRoute) {
  return route === 'vote' ? '/vote' : '/';
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
