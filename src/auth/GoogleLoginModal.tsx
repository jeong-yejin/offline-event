import { useModalDialog } from '../components/useModalDialog';
import { useGoogleSignIn } from './useGoogleSignIn';
import type { Lang } from '../i18n/types';

export function GoogleLoginModal({ lang, eventName, onClose, onSuccess }: { lang: Lang; eventName: string; onClose(): void; onSuccess(): void }) {
  const dialog = useModalDialog();
  const { button, status, retry } = useGoogleSignIn(lang, onSuccess);
  const ko = lang === 'ko';
  return <dialog ref={dialog} className="google-login" aria-labelledby="login-title" aria-describedby="login-copy" onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <button className="login-close" type="button" onClick={onClose} aria-label={ko ? '닫기' : 'Close'}>×</button>
    <p className="login-event">{eventName}</p>
    <h2 id="login-title">{ko ? '예측마켓에 참여하세요' : 'Join the prediction market'}</h2>
    <p id="login-copy">{ko ? 'Google 계정으로 로그인하면 예측마켓으로 이동합니다.' : 'Sign in with Google to continue to the prediction market.'}</p>
    <div ref={button} className="google-button" hidden={status !== 'ready'} />
    {status === 'facade' && <button className="login-continue" type="button" onClick={onSuccess}>{ko ? 'Google로 계속하기' : 'Continue with Google'}</button>}
    {(status === 'loading' || status === 'verifying') && <p role="status">{ko ? '로그인 확인 중…' : 'Checking sign-in…'}</p>}
    {status === 'failed' && <><p role="alert">{ko ? '로그인하지 못했습니다. 다시 시도해 주세요.' : 'Unable to sign in. Please try again.'}</p><button className="outline-button" onClick={retry}>{ko ? '다시 시도' : 'Try again'}</button></>}
  </dialog>;
}
