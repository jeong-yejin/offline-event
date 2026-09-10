// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { GoogleLoginModal } from './GoogleLoginModal';

beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

// The gate is a soft one. It must never strand a participant at the door because
// the site has no Google client, so each missing piece degrades one step instead
// of blocking: no client id at all, then a client id with nothing to verify against.
it('opens the gate when no Google client is configured', () => {
  vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '');
  const success = vi.fn();
  render(<GoogleLoginModal lang="en" eventName="PERP-DEX DAY" onClose={() => {}} onSuccess={success} />);
  fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));
  expect(success).toHaveBeenCalledOnce();
});

it('signs in without a server when only the client id is configured', async () => {
  vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client');
  vi.stubEnv('VITE_GOOGLE_AUTH_ENDPOINT', '');
  let callback: (response: { credential: string }) => void = () => {};
  vi.stubGlobal('google', { accounts: { id: {
    initialize: (options: { callback: typeof callback }) => { callback = options.callback; },
    renderButton: vi.fn(),
  } } });
  const request = vi.fn();
  vi.stubGlobal('fetch', request);
  const success = vi.fn();
  render(<GoogleLoginModal lang="en" eventName="PERP-DEX DAY" onClose={() => {}} onSuccess={success} />);
  await waitFor(() => expect(document.querySelector('.google-button')).not.toHaveAttribute('hidden'));
  await act(async () => { callback({ credential: 'test-credential' }); });
  expect(request).not.toHaveBeenCalled();
  expect(success).toHaveBeenCalledOnce();
});

it.each([false, true])('grants access only when the server verifies the credential: %s', async (verified) => {
  vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client');
  vi.stubEnv('VITE_GOOGLE_AUTH_ENDPOINT', '/test/auth');
  let callback: (response: { credential: string }) => void = () => {};
  vi.stubGlobal('google', { accounts: { id: {
    initialize: (options: { callback: typeof callback }) => { callback = options.callback; },
    renderButton: vi.fn(),
  } } });
  const request = vi.fn().mockResolvedValue({ ok: verified, json: async () => ({ authenticated: verified }) });
  vi.stubGlobal('fetch', request);
  const success = vi.fn();
  render(<GoogleLoginModal lang="en" eventName="PERP-DEX DAY" onClose={() => {}} onSuccess={success} />);
  await waitFor(() => expect(document.querySelector('.google-button')).not.toHaveAttribute('hidden'));
  await act(async () => { callback({ credential: 'test-credential' }); });
  expect(request).toHaveBeenCalledWith('/test/auth', expect.objectContaining({ method: 'POST', credentials: 'include', body: JSON.stringify({ credential: 'test-credential' }) }));
  if (verified) expect(success).toHaveBeenCalledOnce();
  else { expect(success).not.toHaveBeenCalled(); expect(screen.getByRole('alert')).toHaveTextContent('Unable to sign in'); }
});
