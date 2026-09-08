import { useEffect, useState } from 'react';
import { ArrowIcon } from '../components/ArrowIcon';
import { LangToggle } from '../components/LangToggle';
import { CtaWord } from '../components/CtaWord';
import { FooterWordmark } from '../components/FooterWordmark';
import BlackHoleBG from '../components/BlackHoleBG';
import { EventHero } from '../components/EventHero';
import { EventSwitcher } from '../components/EventSwitcher';
import { ReboundXHero } from '../components/ReboundXHero';
import { EVENTS, type EventKey } from '../data/eventContent';
import { AGENDA, SPEAKERS, SPONSORS } from '../data/homeContent';
import { localizeAgenda, localizeEvent, localizeRole } from '../i18n/content';
import type { I18nProps } from '../i18n/strings';
import { revealStyle, useMotionReveal } from '../motion/reveal';
import { routePath, type AppRoute } from '../router/useAppRoute';
import { ReboundXPage } from './ReboundXPage';
import { Token2049Page } from './Token2049Page';

type HomePageProps = I18nProps & {
  /* null is the hub at '/', which introduces the events instead of showing one. */
  event: EventKey | null;
  onNavigate(route: AppRoute): void;
};

const BRAND = 'REBOUNDX';

export function HomePage({ event, onNavigate, lang, t, onLangChange }: HomePageProps) {
  const motionReady = useMotionReveal();
  const [activeSpeaker, setActiveSpeaker] = useState(0);
  const selectedEvent = event ? localizeEvent(lang, EVENTS.find((item) => item.key === event) ?? EVENTS[0]) : null;
  const speakers = SPEAKERS.map((speaker) => localizeRole(lang, speaker));
  const agenda = AGENDA.map((item) => localizeAgenda(lang, item));

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (media?.matches) return undefined;
    const timer = window.setInterval(() => setActiveSpeaker((current) => (current + 1) % SPEAKERS.length), 2400);
    return () => window.clearInterval(timer);
  }, []);

  /* Plain links keep middle-click and copy-link working; the handler only spares the reload. */
  function goTo(route: AppRoute) {
    return (clickEvent: React.MouseEvent) => {
      if (clickEvent.metaKey || clickEvent.ctrlKey || clickEvent.shiftKey || clickEvent.button !== 0) return;
      clickEvent.preventDefault();
      onNavigate(route);
    };
  }

  return (
    <div className="site-shell" data-motion-ready={motionReady} aria-label={t.motionEnabled}>
      <a className="skip-link" href="#top">{t.skipToContent}</a>
      <header className="site-header">
        <a href="/" className="brand-link" aria-label={t.brandHome(BRAND)} onClick={goTo('home')}>
          <span className="brand-wordmark">{BRAND}</span>
        </a>
        <LangToggle lang={lang} onChange={onLangChange} t={t} />
      </header>

      <main id="top" tabIndex={-1}>
        {selectedEvent === null ? <ReboundXHero>
          <nav className="event-nav" aria-label={t.eventSelection}>
            <ul className="event-nav-list">
              {EVENTS.map((item) => <li key={item.key}>
                <a className="event-tab" href={routePath(item.key)} onClick={goTo(item.key)}>{item.label}<ArrowIcon /></a>
              </li>)}
            </ul>
          </nav>
        </ReboundXHero> : null}

        {selectedEvent ? <EventSwitcher current={selectedEvent.key} onNavigate={onNavigate} t={t} /> : null}

        {selectedEvent?.key === 'perp-dex-day' ? <>
        <EventHero event={selectedEvent}>
          <button className="outline-button hero-button motion-cta" type="button" onClick={() => onNavigate('vote')} aria-label={t.takeRedPill}>
            <span className="cta-shine" aria-hidden="true" />
            {t.ctaWords.map((word, index) => <CtaWord delay={2150 + index * 150} key={word}>{word}</CtaWord>)}<ArrowIcon />
          </button>
        </EventHero>

        <section className="sponsors content-section" aria-labelledby="sponsors-title">
          <p id="sponsors-title" className="section-intro slideIn" data-motion-reveal style={revealStyle(120)}>{t.sponsorsTitle}</p>
          <div className="logo-row" aria-label={t.sponsorsLabel}>{SPONSORS.map(([name, file], index) => <img className="slideIn" data-motion-reveal style={revealStyle(220 + index * 80)} key={name} src={`/assets/sponsors/${file}`} alt={name} />)}</div>
        </section>

        <section className="speakers content-section split-section" aria-labelledby="speakers-title">
          <div className="speaker-feature"><h2 id="speakers-title"><span className="slideIn heading-reveal" data-motion-reveal style={revealStyle(100)}>{t.speakersTitle}</span></h2><div className="speaker-feature-media slideIn" data-motion-reveal style={revealStyle(280)}>{speakers.map(([name, , image], index) => <img className="featured-speaker" data-active={activeSpeaker === index ? 'true' : 'false'} key={name} src={image} alt={activeSpeaker === index ? name : ''} />)}</div></div>
          <div className="speaker-list dense-speaker-list">{speakers.map(([name, role], index) => <button className="speaker" data-speaker-row data-active={activeSpeaker === index ? 'true' : 'false'} type="button" aria-pressed={activeSpeaker === index} onMouseEnter={() => setActiveSpeaker(index)} onFocus={() => setActiveSpeaker(index)} onClick={() => setActiveSpeaker(index)} key={name}><div><strong>{name}</strong><span>{role}</span></div></button>)}</div>
        </section>

        <section id="agenda" className="agenda content-section" aria-labelledby="agenda-title">
          <h2 id="agenda-title"><span className="slideIn heading-reveal" data-motion-reveal style={revealStyle(100)}>{t.agendaTitle}</span></h2>
          <div className="agenda-list">{agenda.map(([time, title, type], index) => <div className="agenda-row slideIn" data-motion-reveal style={revealStyle(180 + index * 70)} key={time}><time>{time}</time><div><strong>{title}</strong>{type ? <span>{type}</span> : null}</div></div>)}</div>
        </section>

        <section className="operations content-section" aria-labelledby="operations-title">
          <BlackHoleBG style={{ inset: 0, pointerEvents: 'none', position: 'absolute', zIndex: 0 }} />
          <div className="operations-content"><p className="eyebrow eyebrow-dark slideIn" data-motion-reveal style={revealStyle(90)}>{t.opsEyebrow}</p><h2 id="operations-title"><span className="slideIn heading-reveal" data-motion-reveal style={revealStyle(180)}>{t.opsTitle}</span></h2><p className="operations-copy slideIn" data-motion-reveal style={revealStyle(300)}>{t.opsCopy}</p></div>
        </section>
        </> : selectedEvent?.key === 'reboundx-in-wonderland' ? <ReboundXPage t={t} /> : selectedEvent ? <Token2049Page event={selectedEvent} lang={lang} t={t} onVote={() => onNavigate('vote')} /> : null}
      </main>

      <footer className="site-footer"><FooterWordmark /><a href="#top">{t.backToArena}</a><span>{t.copyright}</span></footer>
    </div>
  );
}
