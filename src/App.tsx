import { COMMON_STRINGS } from './i18n/strings/common';
import { TOKEN2049_STRINGS } from './i18n/strings/token2049';
import { useMemo, useState } from 'react';
import { GoogleLoginModal } from './auth/GoogleLoginModal';
import { SiteShell } from './components/SiteShell';
import { EVENTS } from './data/eventContent';
import { localizeEvent } from './i18n/content';
import { useLanguage } from './i18n/useLanguage';
import { HubPage } from './pages/HubPage';
import { PerpDexDayPage } from './pages/PerpDexDayPage';
import { PerpDexDayMarketPage } from './pages/PerpDexDayMarketPage';
import { Token2049KalshiPage } from './pages/Token2049KalshiPage';
import { Token2049Page } from './pages/Token2049Page';
import { Token2049MarketPage } from './pages/Token2049MarketPage';
import { Token2049TeamsPage } from './pages/Token2049TeamsPage';
import { WonderlandPage } from './pages/WonderlandPage';
import { WonderlandBoardPage } from './pages/WonderlandBoardPage';
import { useAppRoute } from './router/useAppRoute';
import { useDocumentMeta } from './router/useDocumentMeta';

function App() {
  const { route: requestedRoute, navigate } = useAppRoute();
  const [authenticated, setAuthenticated] = useState(false);
  const [pendingMarket, setPendingMarket] = useState<'perp-dex-market' | 't2049-market' | null>(null);
  const protectedRoute = requestedRoute === 'perp-dex-market' || requestedRoute === 't2049-market' ? requestedRoute : null;
  const route = protectedRoute && !authenticated ? (protectedRoute === 'perp-dex-market' ? 'perp-dex-day' : 'perps-day') : requestedRoute;
  const loginTarget = pendingMarket ?? (!authenticated ? protectedRoute : null);
  function enterMarket(target: 'perp-dex-market' | 't2049-market') {
    if (authenticated) navigate(target);
    else setPendingMarket(target);
  }
  /* TOKEN2049 runs in Singapore and ships English-only copy, so both of its routes render in English and
     drop the toggle. Leaving it up half-translated the shared chrome around an English page. */
  const englishOnly = route === 'perps-day' || route === 't2049-market' || route === 't2049-teams' || route === 't2049-kalshi';
  const { lang, setLang } = useLanguage(englishOnly ? 'en' : undefined);
  const t = COMMON_STRINGS[lang];
  const metaStrings = TOKEN2049_STRINGS.en;
  const i18n = { lang, onLangChange: englishOnly ? null : setLang };

  /* PERPS DAY is its own event with its own share card, and its market page belongs to that event rather
     than to PERP-DEX DAY, so both routes take the card. Every other route keeps the head from index.html. */
  const meta = useMemo(() => (englishOnly ? {
    title: metaStrings.t2049MetaTitle,
    tags: [
      ['name', 'description', metaStrings.t2049MetaDescription],
      ['property', 'og:title', metaStrings.t2049MetaTitle],
      ['property', 'og:description', metaStrings.t2049OgDescription],
      ['property', 'og:image:alt', metaStrings.t2049OgImageAlt],
      ['name', 'twitter:title', metaStrings.t2049MetaTitle],
      ['name', 'twitter:description', metaStrings.t2049TwitterDescription],
    ] as const,
  } : null), [englishOnly, metaStrings]);

  useDocumentMeta(meta);

  if (route === 't2049-kalshi') return <Token2049KalshiPage onBack={() => navigate('perps-day')} {...i18n} />;
  if (route === 'perp-dex-market') return <PerpDexDayMarketPage onBack={() => navigate('perp-dex-day')} {...i18n} />;
  if (route === 't2049-market') return <Token2049MarketPage onBack={() => navigate('perps-day')} {...i18n} />;
  if (route === 't2049-teams') return <Token2049TeamsPage onBack={() => navigate('perps-day')} {...i18n} />;
  if (route === 'wonderland-board') return <WonderlandBoardPage onBack={() => navigate('reboundx-in-wonderland')} {...i18n} />;

  const event = route === 'home' ? null : localizeEvent(lang, EVENTS.find((item) => item.key === route) ?? EVENTS[0]);

  return (
    <><SiteShell event={event?.key ?? null} onNavigate={navigate} t={t} {...i18n}>
      {event === null ? <HubPage onNavigate={navigate} t={t} lang={lang} /> : null}
      {event?.key === 'perp-dex-day' ? <PerpDexDayPage event={event} lang={lang} onEnterMarket={() => enterMarket('perp-dex-market')} /> : null}
      {event?.key === 'reboundx-in-wonderland' ? <WonderlandPage lang={lang} onOpenBoard={() => navigate('wonderland-board')} /> : null}
      {event?.key === 'perps-day' ? <Token2049Page event={event} lang={lang} onEnterKalshi={() => navigate('t2049-kalshi')} onEnterMarket={() => enterMarket('t2049-market')} onEnterTeams={() => navigate('t2049-teams')} /> : null}
    </SiteShell>
    {loginTarget && <GoogleLoginModal lang={lang} eventName={loginTarget === 'perp-dex-market' ? 'PERP-DEX DAY' : 'TOKEN2049 · PERPS DAY'}
      onClose={() => { setPendingMarket(null); if (protectedRoute) navigate(protectedRoute === 'perp-dex-market' ? 'perp-dex-day' : 'perps-day'); }}
      onSuccess={() => { setAuthenticated(true); setPendingMarket(null); navigate(loginTarget); }} />}</>
  );
}

export default App;
