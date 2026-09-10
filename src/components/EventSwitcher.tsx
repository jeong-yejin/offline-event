import { useEffect, useRef } from 'react';
import { EVENTS, type EventKey } from '../data/eventContent';
import type { I18nProps } from '../i18n/strings/common';
import { navClick, routePath, type AppRoute } from '../router/useAppRoute';

type EventSwitcherProps = Pick<I18nProps, 't'> & {
  current: EventKey;
  onNavigate(route: AppRoute): void;
};

/* One mark per destination, so the pill reads at a glance before the label is read. */
const ICON_PATHS: Record<EventKey, string> = {
  'perp-dex-day': 'M4.3 2.5V13.5M11.7 4V12.6M2.6 5.6H6V10.4H2.6ZM10 6.9H13.4V11.3H10Z',
  'reboundx-in-wonderland': 'M8 2.6 4.5 6.7a2.5 2.5 0 1 0 3.5 3.6 2.5 2.5 0 1 0 3.5-3.6zM8 10.3v3.2M6.4 13.5h3.2',
  'perps-day': 'M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12ZM2 8h12M8 2c1.8 2 2.7 4 2.7 6S9.8 14 8 14 5.3 10 5.3 8 6.2 4 8 2Z',
};

/* Global navigation, not a tab panel: every name leaves this page for another event's page. */
export function EventSwitcher({ current, onNavigate, t }: EventSwitcherProps) {
  const listRef = useRef<HTMLUListElement>(null);

  /* The capsule scrolls sideways on narrow screens, so pull the current page into view or you land on a bar that never names where you are. */
  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!list || !active) return;
    list.scrollLeft = active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2;
  }, [current]);

  return (
    <nav className="event-switcher" aria-label={t.eventSelection}>
      <ul className="event-switcher-list" ref={listRef}>
        {EVENTS.map((item) => <li key={item.key}>
          <a
            aria-current={item.key === current ? 'page' : undefined}
            className="event-switcher-tab"
            href={routePath(item.key)}
            onClick={navClick(onNavigate, item.key)}
          >
            <svg aria-hidden="true" className="event-switcher-icon" viewBox="0 0 16 16" fill="none"><path d={ICON_PATHS[item.key]} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {item.label}
          </a>
        </li>)}
      </ul>
    </nav>
  );
}
