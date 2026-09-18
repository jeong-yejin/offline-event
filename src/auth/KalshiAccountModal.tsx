import { useModalDialog } from '../components/useModalDialog';
import { ArrowIcon } from '../components/ArrowIcon';
import { TOKEN2049_STRINGS } from '../i18n/strings/token2049';

/* The second gate on Pulse. Signing in with Google says who the reader is; this says whether Kalshi
   can pay them, which is a different question and the one the board turns on.

   The market stays mounted and blurred behind the dialog rather than being replaced. A reader who can
   see the board they are held out of has a reason to go and fill the form, and the blur says the hold
   is temporary in a way an empty page does not. */
export function KalshiAccountModal({ onClose, onOpenKalshi }: { onClose(): void; onOpenKalshi(): void }) {
  const dialog = useModalDialog();
  const t = TOKEN2049_STRINGS.en;

  return <dialog ref={dialog} className="google-login kalshi-gate" aria-labelledby="kalshi-gate-title" aria-describedby="kalshi-gate-copy"
    onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <button className="login-close" type="button" onClick={onClose} aria-label="Close">×</button>
    <p className="login-event">{t.t2049MarketTag}</p>
    <h2 id="kalshi-gate-title">{t.t2049GateTitle}</h2>
    <p id="kalshi-gate-copy">{t.t2049GateCopy}</p>
    <button className="login-continue" type="button" onClick={onOpenKalshi}>{t.t2049GateCta}<ArrowIcon /></button>
    <button className="kalshi-gate-leave" type="button" onClick={onClose}>{t.t2049GateBack}</button>
  </dialog>;
}
