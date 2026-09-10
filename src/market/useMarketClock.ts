import { useEffect, type Dispatch } from 'react';

type Tick = { type: 'tick'; time: number; seed: number };

/** Application clock adapter: reducers receive explicit time and deterministic random seeds. */
export function useMarketClock(dispatch: Dispatch<Tick>) {
  useEffect(() => {
    const timer = window.setInterval(() => dispatch({
      type: 'tick',
      time: Date.now(),
      seed: Math.floor(Math.random() * 4294967296),
    }), 1000);
    return () => window.clearInterval(timer);
  }, [dispatch]);
}
