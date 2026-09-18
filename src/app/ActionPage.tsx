import { KalshiAccountModal } from '../auth/KalshiAccountModal';
import { hasKalshiAccount } from '../auth/kalshiAccount';
import { PerpDexDayMarketPage } from '../pages/PerpDexDayMarketPage';
import { Token2049KalshiPage } from '../pages/Token2049KalshiPage';
import { Token2049MarketPage } from '../pages/Token2049MarketPage';
import { WonderlandBoardPage } from '../pages/WonderlandBoardPage';
import type { AppRoute } from '../router/routes';
import type { I18nProps } from '../i18n/strings/common';

export function ActionPage({ route, navigate, ...i18n }: Omit<I18nProps, 't'> & { route: AppRoute; navigate(route: AppRoute): void }) {
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

  return null;
}
