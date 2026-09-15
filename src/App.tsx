import { COMMON_STRINGS } from './i18n/strings/common';
import { TOKEN2049_STRINGS } from './i18n/strings/token2049';
import { useMemo, useState } from 'react';
import { GoogleLoginModal } from './auth/GoogleLoginModal';
import { KalshiAccountModal } from './auth/KalshiAccountModal';
import { hasKalshiAccount } from './auth/kalshiAccount';
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
import { WonderlandPage } from './pages/WonderlandPage';
import { WonderlandBoardPage } from './pages/WonderlandBoardPage';
import { useAppRoute, type AppRoute } from './router/useAppRoute';
import { useDocumentMeta } from './router/useDocumentMeta';

/* Every screen inside a competition sits behind the sign-in gate, the full leaderboard included: it
   ranks the visitor against the field, so it cannot open before there is a visitor. The value is where
   an unauthenticated visitor lands instead, and where the gate sends them if they close it. */
type MarketRoute = 'perp-dex-market' | 'perp-dex-leaderboard' | 't2049-market' | 't2049-leaderboard';
const MARKET_EVENT: Record<MarketRoute, AppRoute> = {
  'perp-dex-market': 'perp-dex-day',
  'perp-dex-leaderboard': 'perp-dex-day',
  't2049-market': 'perps-day',
  't2049-leaderboard': 'perps-day',
};
const isMarketRoute = (route: AppRoute): route is MarketRoute => route in MARKET_EVENT;

function App() {
  const { route: requestedRoute, navigate } = useAppRoute();
  const [authenticated, setAuthenticated] = useState(false);
  const [pendingMarket, setPendingMarket] = useState<MarketRoute | null>(null);
  const protectedRoute = isMarketRoute(requestedRoute) ? requestedRoute : null;
  const route = protectedRoute && !authenticated ? MARKET_EVENT[protectedRoute] : requestedRoute;
  const loginTarget = pendingMarket ?? (!authenticated ? protectedRoute : null);
  function enterMarket(target: MarketRoute) {
    if (authenticated) navigate(target);
    else setPendingMarket(target);
  }
  /* TOKEN2049 runs in Singapore and ships English-only copy, so both of its routes render in English and
     drop the toggle. Leaving it up half-translated the shared chrome around an English page. */
  const englishOnly = route === 'perps-day' || route === 't2049-market' || route === 't2049-leaderboard' || route === 't2049-kalshi';
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

  if (route === 't2049-kalshi') return <Token2049KalshiPage onBack={() => navigate('perps-day')} onOpenMarket={() => navigate('t2049-market')} {...i18n} />;
  /* The board is a view of the market page rather than a page beside it, so the competition it ranks
     keeps running while the reader is on it. Both routes therefore render the same component, and the
     way back out is one step: board to market, market to event. */
  if (route === 'perp-dex-market' || route === 'perp-dex-leaderboard') {
    const board = route === 'perp-dex-leaderboard';
    return <PerpDexDayMarketPage view={board ? 'leaderboard' : 'market'} onBack={() => navigate(board ? 'perp-dex-market' : 'perp-dex-day')} onOpenLeaderboard={() => navigate('perp-dex-leaderboard')} {...i18n} />;
  }
  /* Pulse is gated twice. Signing in says who the reader is; the Kalshi account says whether Kalshi
     can pay them, and the board is worth nothing to a reader it cannot pay. The answer is read on
     every render rather than held in state, so the board opens the moment the Kalshi screen saves an
     address and the reader walks back. */
  if (route === 't2049-market' || route === 't2049-leaderboard') {
    const board = route === 't2049-leaderboard';
    const locked = !hasKalshiAccount();
    return <>
      <Token2049MarketPage locked={locked} view={board ? 'leaderboard' : 'market'} onBack={() => navigate(board ? 't2049-market' : 'perps-day')} onOpenLeaderboard={() => navigate('t2049-leaderboard')} {...i18n} />
      {locked && <KalshiAccountModal onClose={() => navigate('perps-day')} onOpenKalshi={() => navigate('t2049-kalshi')} />}
    </>;
  }
  if (route === 'wonderland-board') return <WonderlandBoardPage onBack={() => navigate('reboundx-in-wonderland')} {...i18n} />;

  const event = route === 'home' ? null : localizeEvent(lang, EVENTS.find((item) => item.key === route) ?? EVENTS[0]);

  return (
    <><SiteShell event={event?.key ?? null} onNavigate={navigate} t={t} {...i18n}>
      {event === null ? <HubPage onNavigate={navigate} t={t} lang={lang} /> : null}
      {event?.key === 'perp-dex-day' ? <PerpDexDayPage event={event} lang={lang} onEnterMarket={() => enterMarket('perp-dex-market')} /> : null}
      {event?.key === 'reboundx-in-wonderland' ? <WonderlandPage lang={lang} onOpenBoard={() => navigate('wonderland-board')} /> : null}
      {event?.key === 'perps-day' ? <Token2049Page event={event} lang={lang} onEnterKalshi={() => navigate('t2049-kalshi')} onEnterMarket={() => enterMarket('t2049-market')} /> : null}
    </SiteShell>
    {loginTarget && <GoogleLoginModal lang={lang} eventName={MARKET_EVENT[loginTarget] === 'perp-dex-day' ? 'PERP-DEX DAY' : 'TOKEN2049 · PERPS DAY'}
      onClose={() => { setPendingMarket(null); if (protectedRoute) navigate(MARKET_EVENT[protectedRoute]); }}
      onSuccess={() => { setAuthenticated(true); setPendingMarket(null); navigate(loginTarget); }} />}</>
  );
}

export default App;
