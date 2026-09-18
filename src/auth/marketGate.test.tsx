// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import App from '../App';

// The modal's server-verification boundary is tested separately in GoogleLoginModal.test.tsx.
vi.mock('./GoogleLoginModal', () => ({ GoogleLoginModal: ({ onSuccess, onClose }: { onSuccess(): void; onClose(): void }) =>
  <div role="dialog"><button onClick={onSuccess}>Verified session</button><button onClick={onClose}>Cancel sign-in</button></div> }));
afterEach(() => { cleanup(); localStorage.clear(); });

/* The full board is gated with the market it belongs to. It ranks the visitor against the field, so
   opening it without a visitor would print a board with no row for the reader.
   Only the sign-in dialog is checked here. TOKEN2049 raises its Kalshi gate right after, and that
   second gate has its own tests below. */
it.each(['/perp-dex-day/market', '/perps-day/market', '/perp-dex-day/market/leaderboard', '/perps-day/market/leaderboard'])('protects direct entry to %s until verification succeeds', (path) => {
  history.replaceState({}, '', path);
  render(<App />);
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(document.querySelector('.market-page')).toBeNull();
  fireEvent.click(screen.getByText('Verified session'));
  expect(screen.queryByText('Verified session')).toBeNull();
  expect(document.querySelector('.market-page')).toBeInTheDocument();
  expect(location.pathname).toBe(path);
});

/* Signing in says who the reader is. Kalshi settles the rewards, so a reader Kalshi cannot pay is
   held a second time: the board renders, blurred, and the dialog offers the screen that collects the
   address. Without the blur the hold would have nothing to argue for. */
it.each(['/perps-day/market', '/perps-day/market/leaderboard'])('holds %s behind a Kalshi account and points at the screen that collects one', (path) => {
  history.replaceState({}, '', path);
  render(<App />);
  fireEvent.click(screen.getByText('Verified session'));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(document.querySelector('.market-page.t2049-locked')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Verify Kalshi Account'));
  expect(location.pathname).toBe('/perps-day/kalshi');
});

/* Every sign-in is followed by the Kalshi gate. A browser that saved an address on an earlier visit is
   the one that would skip it, so the test starts there. */
it('raises the Kalshi gate after every sign-in, even where an address was saved on an earlier visit', () => {
  localStorage.setItem('reboundx.kalshi.address', 'trader@example.com');
  history.replaceState({}, '', '/perps-day/market');
  render(<App />);
  fireEvent.click(screen.getByText('Verified session'));
  expect(screen.getByText('Verify Kalshi Account')).toBeInTheDocument();
  expect(document.querySelector('.market-page.t2049-locked')).toBeInTheDocument();
});

/* The address saved on that screen is what opens the board, and the screen leads back to it. A reader
   sent here by the gate came to open Pulse, so leaving them to find the market again would strand the
   walk one step short of the thing they were held out of. */
it('walks from the Kalshi gate through the Kalshi screen to an open board', () => {
  history.replaceState({}, '', '/perps-day/market');
  render(<App />);
  fireEvent.click(screen.getByText('Verified session'));
  fireEvent.click(screen.getByText('Verify Kalshi Account'));
  fireEvent.change(screen.getByLabelText('Kalshi account email'), { target: { value: 'trader@example.com' } });
  fireEvent.click(screen.getByText('Save Kalshi Email'));
  fireEvent.click(screen.getByText('Back to Pulse'));

  expect(location.pathname).toBe('/perps-day/market');
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.querySelector('.t2049-locked')).toBeNull();
});

/* PERP-DEX DAY pays in its own points and never asks Kalshi anything, so its board must not inherit
   the hold. A gate copied onto every market would lock a board that has nothing to verify. */
it('leaves the PERP-DEX DAY market open once signed in', () => {
  history.replaceState({}, '', '/perp-dex-day/market');
  render(<App />);
  fireEvent.click(screen.getByText('Verified session'));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.querySelector('.market-page')).toBeInTheDocument();
});

it.each(['/perp-dex-day', '/perps-day'])('keeps the event introduction public: %s', (path) => {
  history.replaceState({}, '', path);
  render(<App />);
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('cancels direct market login back to its event', () => {
  history.replaceState({}, '', '/perp-dex-day/market');
  render(<App />);
  fireEvent.click(screen.getByText('Cancel sign-in'));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(location.pathname).toBe('/perp-dex-day');
});
