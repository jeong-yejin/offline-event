import { useEffect, useRef, useState } from 'react';
import { ArrowIcon } from '../components/ArrowIcon';
import { WonderlandHero } from '../components/WonderlandHero';
import { WONDERLAND_STRINGS } from '../i18n/strings/wonderland';
import type { Lang } from '../i18n/types';

type WonderlandPageProps = {
  lang: Lang;
  onOpenBoard(): void;
};

type FrameState = 'loading' | 'ready' | 'failed';

/* The build holds this timeline paused so the host page can decide when the door opens. */
type EmbeddedWindow = Window & { __reboundxDoor?: { play(): void } };

/* The embedded build carries its own copy in both languages and reads which one to render from the
   query, so the frame reloads when the host language changes. */
const frameSrc = (lang: Lang) => `/reboundx/index.html?content=1&lang=${lang}`;
const MIN_FRAME_HEIGHT = 960;
/* The door opens once its top has climbed a quarter of the way up the viewport. */
const DOOR_ENTRY = .75;
const SKELETON_ROWS = [0, 1, 2, 3, 4];

export function WonderlandPage({ lang, onOpenBoard }: WonderlandPageProps) {
  const t = WONDERLAND_STRINGS[lang];
  const src = frameSrc(lang);
  const [frameHeight, setFrameHeight] = useState(MIN_FRAME_HEIGHT);
  const [state, setState] = useState<FrameState>('loading');
  const observer = useRef<ResizeObserver | null>(null);
  const doorCheck = useRef<(() => void) | null>(null);

  /* One observer for the whole mount. Creating it in onLoad without this leaks another on every reload. */
  useEffect(() => () => {
    observer.current?.disconnect();
    releaseDoor();
  }, []);

  function releaseDoor() {
    if (doorCheck.current) window.removeEventListener('scroll', doorCheck.current);
    doorCheck.current = null;
  }

  function syncFrameHeight(frame: HTMLIFrameElement) {
    const documentHeight = frame.contentDocument?.documentElement.scrollHeight;
    if (documentHeight) setFrameHeight(Math.max(documentHeight, MIN_FRAME_HEIGHT));
    /* The build renders after the frame's load event, so this is the first moment the door exists. */
    doorCheck.current?.();
  }

  function watchFrameHeight(frame: HTMLIFrameElement) {
    const root = frame.contentDocument?.documentElement;
    if (typeof ResizeObserver === 'undefined' || !root) return;
    observer.current?.disconnect();
    observer.current = new ResizeObserver(() => syncFrameHeight(frame));
    observer.current.observe(root);
  }

  /* The frame is sized to its own content, so nothing inside it ever leaves its own viewport and a
     trigger placed there fires on load. This page owns the scroll the reader actually moves, so the
     door is measured against this page's viewport instead. The element is looked up on every check
     because the build has not rendered yet when the frame fires load. */
  function watchDoor(frame: HTMLIFrameElement) {
    function check() {
      const timeline = (frame.contentWindow as EmbeddedWindow | null)?.__reboundxDoor;
      const door = frame.contentDocument?.querySelector('.terminal__door');
      /* Under reduced motion the build never makes the timeline, so there is nothing to play. */
      if (!door || !timeline) return;
      /* The frame never scrolls itself, so its content coordinates are its element coordinates. */
      const fromTop = frame.getBoundingClientRect().top + door.getBoundingClientRect().top;
      if (fromTop > window.innerHeight * DOOR_ENTRY) return;
      releaseDoor();
      timeline.play();
    }
    releaseDoor();
    doorCheck.current = check;
    window.addEventListener('scroll', check, { passive: true });
    check();
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
    watchDoor(frame);
    setState('ready');
  }

  return (
    <section className="reboundx-panel" aria-label="REBOUNDX IN WONDERLAND">
      <h2 className="visually-hidden">{t.reboundxPanelTitle}</h2>
      <WonderlandHero t={t} />
      <div className="reboundx-frame-wrap">
        {state === 'loading' ? <div className="frame-skeleton" role="status" aria-label={t.reboundxLoading}>{SKELETON_ROWS.map((row) => <span key={row} />)}</div> : null}
        {state === 'failed' ? <div className="frame-error"><p>{t.reboundxFailed}</p><a className="outline-button" href={src} target="_blank" rel="noopener noreferrer">{t.reboundxFailedCta}<ArrowIcon /></a></div> : null}
        <iframe
          className="reboundx-frame"
          data-state={state}
          title={t.reboundxFrame}
          src={src}
          loading="eager"
          style={{ height: `${frameHeight}px` }}
          onLoad={(event) => adoptFrame(event.currentTarget)}
          onError={() => setState('failed')}
        />
      </div>
      <p className="wonder-board-link">
        <button className="outline-button wonder-cta" type="button" onClick={onOpenBoard}>{t.wonderlandCta}<ArrowIcon /></button>
      </p>
    </section>
  );
}
