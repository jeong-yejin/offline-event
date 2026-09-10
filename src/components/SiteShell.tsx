import type { ReactNode } from 'react';
import { EventSwitcher } from './EventSwitcher';
import { FooterWordmark } from './FooterWordmark';
import { LangToggle } from './LangToggle';
import type { EventKey } from '../data/eventContent';
import type { I18nProps } from '../i18n/strings/common';
import { useMotionReveal } from '../motion/reveal';
import { navClick, type AppRoute } from '../router/useAppRoute';

type SiteShellProps = I18nProps & {
  /* null is the hub at '/', which introduces the events instead of showing one. */
  event: EventKey | null;
  onNavigate(route: AppRoute): void;
  children: ReactNode;
};

/* Header, footer and the reveal scan are the same on every page under '/', so they live here and the
   page files hold nothing but their own body. */
export function SiteShell({ event, onNavigate, lang, t, onLangChange, children }: SiteShellProps) {
  const motionReady = useMotionReveal(event);

  /* data-event lets each event name its own typeface for the header, switcher and footer it shares. */
  return (
    <div className="site-shell" data-event={event} data-motion-ready={motionReady} aria-label={t.motionEnabled}>
      <a className="skip-link" href="#top">{t.skipToContent}</a>
      <header className="site-header">
        {/* The hub is the top of this site, so its header hands the reader on to reboundx.net itself.
            An event page instead walks back to the hub, and says which hub it is. */}
        {event ? (
          <a href="/" className="brand-link" aria-label={t.brandHome('REBOUNDX EVENTS')} onClick={navClick(onNavigate, 'home')}>
            <span className="brand-wordmark">REBOUNDX EVENTS</span>
          </a>
        ) : (
          <a href="https://www.reboundx.net/en" className="brand-link">
            <img className="brand-mark" src="/reboundx/assets/white-color.svg" width="150" height="24" alt="REBOUNDX" />
          </a>
        )}
        {event ? <EventSwitcher current={event} onNavigate={onNavigate} t={t} /> : null}
        <LangToggle lang={lang} onChange={onLangChange} t={t} />
      </header>

      <main id="top" tabIndex={-1}>
        {children}
      </main>

      <footer className="site-footer"><FooterWordmark /><a href="#top">{t.backToTop}</a><span>{t.copyright}</span></footer>
    </div>
  );
}
