/* Rewards on this board settle in Kalshi markets, so only a reader who already holds a Kalshi account
   can take anything from it. Whether they hold one is Kalshi's answer, and nothing in this build asks
   for it: GET /api/kalshi/status does not exist yet.

   Until it does, the address the Kalshi screen saved in this browser stands in for the answer, the way
   the sign-in modal stands in for Google. That keeps the demo walkable in one direction: gate, form,
   board. It is not a check. Anyone can type any address, and clearing site data locks the board again.
   README, 해야 할 작업 -> Kalshi 주소 검증, carries the contract that replaces this. */
const STORE_KEY = 'reboundx.kalshi.address';

export function kalshiAddress(): string {
  /* Private mode throws on access rather than on write, so every call is guarded. */
  try { return localStorage.getItem(STORE_KEY) ?? ''; } catch { return ''; }
}

export function saveKalshiAddress(address: string): void {
  try { localStorage.setItem(STORE_KEY, address); } catch { /* The gate reopens on the next visit. */ }
}

/* VITE_KALSHI_VERIFIED=true opens the board without walking the form, for a demo that starts there. */
export const hasKalshiAccount = (): boolean =>
  import.meta.env.VITE_KALSHI_VERIFIED === 'true' || kalshiAddress() !== '';
