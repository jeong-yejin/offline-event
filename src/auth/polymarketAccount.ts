/* Rewards on this board settle in Polymarket markets, so only a reader who already holds a Polymarket account
   can take anything from it. Whether they hold one is Polymarket's answer, and nothing in this build asks
   for it: GET /api/polymarket/status does not exist yet.

   Until it does, the address the Polymarket screen saved in this browser stands in for the answer, the way
   the sign-in modal stands in for Google. That keeps the demo walkable in one direction: gate, form,
   board. It is not a check. Anyone can type any address, and the next sign-in forgets it.
   README, 해야 할 작업 -> Polymarket 주소 검증, carries the contract that replaces this. */
const STORE_KEY = 'reboundx.polymarket.address';

export function polymarketAddress(): string {
  /* Private mode throws on access rather than on write, so every call is guarded. */
  try { return localStorage.getItem(STORE_KEY) ?? ''; } catch { return ''; }
}

export function savePolymarketAddress(address: string): void {
  try { localStorage.setItem(STORE_KEY, address); } catch { /* The gate reopens on the next visit. */ }
}

/* Every Google sign-in is followed by the Polymarket gate. Kept past a sign-in, an address saved on an
   earlier visit would open the board by itself, and the reader would never see the second gate. */
export function forgetPolymarketAddress(): void {
  try { localStorage.removeItem(STORE_KEY); } catch { /* Private mode saved nothing to forget. */ }
}

/* VITE_POLYMARKET_VERIFIED=true opens the board without walking the form, for a demo that starts there. */
export const hasPolymarketAccount = (): boolean =>
  import.meta.env.VITE_POLYMARKET_VERIFIED === 'true' || polymarketAddress() !== '';
