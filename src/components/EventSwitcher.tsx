import { EVENTS, type EventKey } from '../data/eventContent';
import type { I18nProps } from '../i18n/strings';
import { routePath, type AppRoute } from '../router/useAppRoute';

type EventSwitcherProps = Pick<I18nProps, 't'> & {
  current: EventKey;
  onNavigate(route: AppRoute): void;
};

/* Global navigation, not a tab panel: every name leaves this page for another event's page. */
export function EventSwitcher({ current, onNavigate, t }: EventSwitcherProps) {
  function goTo(route: AppRoute) {
    return (clickEvent: React.MouseEvent) => {
      if (clickEvent.metaKey || clickEvent.ctrlKey || clickEvent.shiftKey || clickEvent.button !== 0) return;
      clickEvent.preventDefault();
      onNavigate(route);
    };
  }

  return (
    <nav className="event-switcher" aria-label={t.eventSelection}>
      <ul className="event-switcher-list">
        {EVENTS.map((item) => <li key={item.key}>
          <a
            aria-current={item.key === current ? 'page' : undefined}
            className="event-switcher-tab"
            href={routePath(item.key)}
            onClick={goTo(item.key)}
          >{item.label}</a>
        </li>)}
      </ul>
    </nav>
  );
}
