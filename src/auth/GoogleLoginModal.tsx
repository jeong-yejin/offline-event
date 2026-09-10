import { useEffect, useRef, useState } from 'react';
import type { Lang } from '../i18n/types';

type GoogleId = {
  initialize(options: { client_id: string; callback(response: { credential: string }): void }): void;
  renderButton(element: HTMLElement, options: Record<string, string | number>): void;
};
declare global { interface Window { google?: { accounts: { id: GoogleId } } } }
let sdk: Promise<void> | undefined;
function loadGoogle() {
  if (window.google?.accounts.id) return Promise.resolve();
  return sdk ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    const timer = window.setTimeout(() => { script.remove(); sdk = undefined; reject(new Error('timeout')); }, 12000);
    script.onload = () => { clearTimeout(timer); resolve(); };
    script.onerror = () => { clearTimeout(timer); script.remove(); sdk = undefined; reject(new Error('load')); };
    document.head.appendChild(script);
  });
}

export function GoogleLoginModal({ lang, eventName, onClose, onSuccess }: { lang: Lang; eventName: string; onClose(): void; onSuccess(): void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const button = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'verifying' | 'failed' | 'facade'>('loading');
  const [attempt, setAttempt] = useState(0);
  const ko = lang === 'ko';
  const success = useRef(onSuccess);
  success.current = onSuccess;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
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
          const response = await fetch(endpoint, { method: 'POST', credentials: 'include', signal: controller.signal,
            headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ credential }) });
          const result = await response.json();
          if (!response.ok || result.authenticated !== true) throw new Error('Verification rejected');
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
  return <dialog ref={dialog} className="google-login" aria-labelledby="login-title" aria-describedby="login-copy" onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <button className="login-close" type="button" onClick={onClose} aria-label={ko ? '닫기' : 'Close'}>×</button>
    <p className="login-event">{eventName}</p>
    <h2 id="login-title">{ko ? '예측마켓에 참여하세요' : 'Join the prediction market'}</h2>
    <p id="login-copy">{ko ? 'Google 계정으로 로그인하면 예측마켓으로 이동합니다.' : 'Sign in with Google to continue to the prediction market.'}</p>
    <div ref={button} className="google-button" hidden={status !== 'ready'} />
    {status === 'facade' && <button className="login-continue" type="button" onClick={onSuccess}>{ko ? 'Google로 계속하기' : 'Continue with Google'}</button>}
    {(status === 'loading' || status === 'verifying') && <p role="status">{ko ? '로그인 확인 중…' : 'Checking sign-in…'}</p>}
    {status === 'failed' && <><p role="alert">{ko ? '로그인하지 못했습니다. 다시 시도해 주세요.' : 'Unable to sign in. Please try again.'}</p><button className="outline-button" onClick={() => setAttempt((value) => value + 1)}>{ko ? '다시 시도' : 'Try again'}</button></>}
  </dialog>;
}
