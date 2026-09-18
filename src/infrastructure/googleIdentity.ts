type GoogleId = {
  initialize(options: { client_id: string; callback(response: { credential: string }): void }): void;
  renderButton(element: HTMLElement, options: Record<string, string | number>): void;
};
declare global { interface Window { google?: { accounts: { id: GoogleId } } } }
let sdk: Promise<void> | undefined;
export function loadGoogle() {
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

// Transport only: the caller owns timeout, cancellation and user-facing state.
export async function verifyGoogleCredential(endpoint: string, credential: string, signal: AbortSignal): Promise<void> {
  const response = await fetch(endpoint, { method: 'POST', credentials: 'include', signal,
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ credential }) });
  const result = await response.json();
  if (!response.ok || result.authenticated !== true) throw new Error('Verification rejected');
}
