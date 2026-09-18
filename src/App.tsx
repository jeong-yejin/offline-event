import { COMMON_STRINGS } from './i18n/strings/common';
import { GoogleLoginModal } from './auth/GoogleLoginModal';
import { forgetKalshiAddress } from './auth/kalshiAccount';
import { useMarketAccess } from './auth/useMarketAccess';
import { useLanguage } from './i18n/useLanguage';
import { useAppRoute } from './router/useAppRoute';
import { useRouteMeta } from './app/useRouteMeta';
import { ActionPage } from './app/ActionPage';
import { EventLanding } from './app/EventLanding';

function App() {
  const { route: requestedRoute, navigate } = useAppRoute();
  const access = useMarketAccess(requestedRoute, navigate);
  const { route } = access;
  const englishOnly = route === 'perps-day' || route === 't2049-market' || route === 't2049-leaderboard' || route === 't2049-kalshi';
  const { lang, setLang } = useLanguage(englishOnly ? 'en' : undefined);
  const i18n = { lang, onLangChange: englishOnly ? null : setLang };
  useRouteMeta(englishOnly);

  const actionPage = route === 'perp-dex-market' || route === 'perp-dex-leaderboard' || route === 't2049-market' || route === 't2049-leaderboard' || route === 't2049-kalshi' || route === 'wonderland-board';
  if (actionPage) return <ActionPage route={route} navigate={navigate} {...i18n} />;

  return <>
    <EventLanding route={route} navigate={navigate} enterMarket={access.enterMarket} t={COMMON_STRINGS[lang]} {...i18n} />
    {access.loginTarget && <GoogleLoginModal lang={lang} eventName={access.loginEventName}
      onClose={access.cancelLogin}
      onSuccess={() => { forgetKalshiAddress(); access.completeLogin(); }} />}
  </>;
}

export default App;
