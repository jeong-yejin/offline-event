import type { MouseEvent } from 'react';
import type { AppRoute } from './routes';

/* Plain links keep middle-click and copy-link working; the handler only spares the reload. */
export function navClick(onNavigate: (route: AppRoute) => void, route: AppRoute) {
  return (clickEvent: MouseEvent) => {
    if (clickEvent.metaKey || clickEvent.ctrlKey || clickEvent.shiftKey || clickEvent.button !== 0) return;
    clickEvent.preventDefault();
    onNavigate(route);
  };
}
