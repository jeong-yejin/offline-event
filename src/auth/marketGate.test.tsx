// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import App from '../App';

// The modal's server-verification boundary is tested separately in GoogleLoginModal.test.tsx.
vi.mock('./GoogleLoginModal', () => ({ GoogleLoginModal: ({ onSuccess, onClose }: { onSuccess(): void; onClose(): void }) =>
  <div role="dialog"><button onClick={onSuccess}>Verified session</button><button onClick={onClose}>Cancel sign-in</button></div> }));
afterEach(() => { cleanup(); localStorage.clear(); });

it.each(['/perp-dex-day/market', '/perps-day/market'])('protects direct entry to %s until verification succeeds', (path) => {
  history.replaceState({}, '', path);
  render(<App />);
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(document.querySelector('.market-page')).toBeNull();
  fireEvent.click(screen.getByText('Verified session'));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.querySelector('.market-page')).toBeInTheDocument();
  expect(location.pathname).toBe(path);
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
