import { SiteShell } from '../components/SiteShell';
import { EVENTS } from '../data/eventContent';
import { localizeEvent } from '../i18n/content';
import { HubPage } from '../pages/HubPage';
import { PerpDexDayPage } from '../pages/PerpDexDayPage';
import { Token2049Page } from '../pages/Token2049Page';
import { WonderlandPage } from '../pages/WonderlandPage';
import type { AppRoute } from '../router/routes';
import type { I18nProps } from '../i18n/strings/common';

type Props = I18nProps & { route: AppRoute; navigate(route: AppRoute): void; enterMarket(route: 'perp-dex-market' | 't2049-market'): void };
export function EventLanding({ route, navigate, enterMarket, lang, t, ...i18n }: Props) {
  const event = route === 'home' ? null : localizeEvent(lang, EVENTS.find((item) => item.key === route) ?? EVENTS[0]);

  return (
    <SiteShell event={event?.key ?? null} onNavigate={navigate} t={t} lang={lang} {...i18n}>
      {event === null ? <HubPage onNavigate={navigate} t={t} lang={lang} /> : null}
      {event?.key === 'perp-dex-day' ? <PerpDexDayPage event={event} lang={lang} onEnterMarket={() => enterMarket('perp-dex-market')} /> : null}
      {event?.key === 'reboundx-in-wonderland' ? <WonderlandPage lang={lang} onOpenBoard={() => navigate('wonderland-board')} /> : null}
      {event?.key === 'perps-day' ? <Token2049Page event={event} lang={lang} onEnterKalshi={() => navigate('t2049-kalshi')} onEnterMarket={() => enterMarket('t2049-market')} /> : null}
    </SiteShell>
  );
}
