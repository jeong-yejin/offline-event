import { useEffect, useRef, useState } from 'react';
import { ArrowIcon } from '../components/ArrowIcon';
import { WonderlandHero } from '../components/WonderlandHero';
import type { Strings } from '../i18n/strings';

type ReboundXPageProps = {
  t: Strings;
};

type FrameState = 'loading' | 'ready' | 'failed';

const FRAME_SRC = '/reboundx/index.html?content=1';
const MIN_FRAME_HEIGHT = 960;
const SKELETON_ROWS = [0, 1, 2, 3, 4];

export function ReboundXPage({ t }: ReboundXPageProps) {
  const [frameHeight, setFrameHeight] = useState(MIN_FRAME_HEIGHT);
  const [state, setState] = useState<FrameState>('loading');
  const observer = useRef<ResizeObserver | null>(null);

  /* One observer for the whole mount. Creating it in onLoad without this leaks another on every reload. */
  useEffect(() => () => observer.current?.disconnect(), []);

  function syncFrameHeight(frame: HTMLIFrameElement) {
    const documentHeight = frame.contentDocument?.documentElement.scrollHeight;
    if (documentHeight) setFrameHeight(Math.max(documentHeight, MIN_FRAME_HEIGHT));
  }

  function watchFrameHeight(frame: HTMLIFrameElement) {
    const root = frame.contentDocument?.documentElement;
    if (typeof ResizeObserver === 'undefined' || !root) return;
    observer.current?.disconnect();
    observer.current = new ResizeObserver(() => syncFrameHeight(frame));
    observer.current.observe(root);
  }

  function adoptFrame(frame: HTMLIFrameElement) {
    const embeddedDocument = frame.contentDocument;
    /* A served error page still fires load, so an empty body is the only failure signal available. */
    if (embeddedDocument && !embeddedDocument.body?.childElementCount) {
      setState('failed');
      return;
    }
    /* The embedded build ships its own header, hero, and footer; this page already has them. */
    if (embeddedDocument && !embeddedDocument.getElementById('reboundx-content-mode')) {
      const style = embeddedDocument.createElement('style');
      style.id = 'reboundx-content-mode';
      style.textContent = '.topbar, .hero, .footer { display: none !important; }';
      embeddedDocument.head.appendChild(style);
    }
    embeddedDocument?.querySelectorAll<HTMLAnchorElement>('a.drink-me').forEach((link) => {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    });
    syncFrameHeight(frame);
    watchFrameHeight(frame);
    setState('ready');
  }

  return (
    <section className="reboundx-panel" aria-label="REBOUNDX IN WONDERLAND">
      <h2 className="visually-hidden">{t.reboundxPanelTitle}</h2>
      <WonderlandHero />
      <div className="reboundx-frame-wrap">
        {state === 'loading' ? <div className="frame-skeleton" role="status" aria-label={t.reboundxLoading}>{SKELETON_ROWS.map((row) => <span key={row} />)}</div> : null}
        {state === 'failed' ? <div className="frame-error"><p>{t.reboundxFailed}</p><a className="outline-button" href={FRAME_SRC} target="_blank" rel="noopener noreferrer">{t.reboundxFailedCta}<ArrowIcon /></a></div> : null}
        <iframe
          className="reboundx-frame"
          data-state={state}
          title={t.reboundxFrame}
          src={FRAME_SRC}
          loading="eager"
          style={{ height: `${frameHeight}px` }}
          onLoad={(event) => adoptFrame(event.currentTarget)}
          onError={() => setState('failed')}
        />
      </div>
    </section>
  );
}
