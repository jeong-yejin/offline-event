import { useEffect, useRef, useState } from 'react';
import type { Lang } from '../i18n/types';
import { loadGoogle, verifyGoogleCredential } from '../infrastructure/googleIdentity';

// Preserve the current demo modes: no client ID releases the facade; no endpoint skips server verification.
export function useGoogleSignIn(lang: Lang, onSuccess: () => void) {
  const button = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'verifying' | 'failed' | 'facade'>('loading');
  const [attempt, setAttempt] = useState(0);
  const success = useRef(onSuccess);
  success.current = onSuccess;

  useEffect(() => {
    let live = true;
    const controller = new AbortController();
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const endpoint = import.meta.env.VITE_GOOGLE_AUTH_ENDPOINT;
    // No client id means no Google at all: the button becomes a plain gate release.
    if (!clientId) { setStatus('facade'); return; }
    setStatus('loading');
    loadGoogle().then(() => {
      if (!live || !button.current) return;
      const api = window.google?.accounts.id;
      if (!api) throw new Error('SDK unavailable');
      api.initialize({ client_id: clientId, callback: async ({ credential }) => {
        if (!live) return;
        // A client id without an endpoint signs in for real but has nothing to verify against.
        if (!endpoint) { success.current(); return; }
        setStatus('verifying');
        const timeout = window.setTimeout(() => controller.abort(), 15000);
        try {
          await verifyGoogleCredential(endpoint, credential, controller.signal);
          if (live) success.current();
        } catch { if (live) setStatus('failed'); }
        finally { clearTimeout(timeout); }
      } });
      button.current.replaceChildren();
      api.renderButton(button.current, { theme: 'outline', size: 'large', text: 'continue_with', width: 280, locale: lang });
      setStatus('ready');
    }).catch(() => { if (live) setStatus('failed'); });
    return () => { live = false; controller.abort(); };
  }, [attempt, lang]);
  return { button, status, retry: () => setAttempt(value => value + 1) };
}
