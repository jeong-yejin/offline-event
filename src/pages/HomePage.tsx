import { useEffect, useState } from 'react';
import { ArrowIcon } from '../components/ArrowIcon';
import { LangToggle } from '../components/LangToggle';
import { CtaWord } from '../components/CtaWord';
import { FooterWordmark } from '../components/FooterWordmark';
import BlackHoleBG from '../components/BlackHoleBG';
import DigitalRain from '../components/DigitalRain';
import { ReboundXHero } from '../components/ReboundXHero';
import { EVENTS, type EventKey } from '../data/eventContent';
import { AGENDA, SPEAKERS, SPONSORS } from '../data/homeContent';
import { localizeAgenda, localizeEvent, localizeRole } from '../i18n/content';
import type { I18nProps, Strings } from '../i18n/strings';
import { revealStyle, useMotionReveal } from '../motion/reveal';

type HomePageProps = I18nProps & {
  onVote(): void;
};

function ReboundXPanel({ t }: { t: Strings }) {
  const [frameHeight, setFrameHeight] = useState(960);

  function syncFrameHeight(frame: HTMLIFrameElement) {
    const documentHeight = frame.contentDocument?.documentElement.scrollHeight;
    if (documentHeight) setFrameHeight(Math.max(documentHeight, 960));
  }

  return (
    <div className="reboundx-frame-wrap">
      <iframe
        className="reboundx-frame"
        title={t.reboundxFrame}
        src="/reboundx/index.html?content=1"
        loading="eager"
        style={{ height: `${frameHeight}px` }}
        onLoad={(event) => {
          const frame = event.currentTarget;
          const embeddedDocument = frame.contentDocument;
          if (embeddedDocument && !embeddedDocument.getElementById('reboundx-content-mode')) {
            const style = embeddedDocument.createElement('style');
            style.id = 'reboundx-content-mode';
            style.textContent = '.topbar, .hero, .footer { display: none !important; }';
            embeddedDocument.head.appendChild(style);
          }
          embeddedDocument?.querySelectorAll<HTMLAnchorElement>('a.drink-me').forEach((link) => {
            link.target = '_top';
            link.rel = 'noopener noreferrer';
          });
          syncFrameHeight(frame);
          if (typeof ResizeObserver !== 'undefined') {
            const observer = new ResizeObserver(() => syncFrameHeight(frame));
            if (frame.contentDocument?.documentElement) observer.observe(frame.contentDocument.documentElement);
          }
        }}
      />
    </div>
  );
}

export function HomePage({ onVote, lang, t, onLangChange }: HomePageProps) {
  const motionReady = useMotionReveal();
  const [activeSpeaker, setActiveSpeaker] = useState(0);
  const [activeEvent, setActiveEvent] = useState<EventKey>('perp-dex-day');
  const selectedEvent = localizeEvent(lang, EVENTS.find((event) => event.key === activeEvent) ?? EVENTS[0]);
  const speakers = SPEAKERS.map((speaker) => localizeRole(lang, speaker));
  const agenda = AGENDA.map((item) => localizeAgenda(lang, item));

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (media?.matches) return undefined;
    const timer = window.setInterval(() => setActiveSpeaker((current) => (current + 1) % SPEAKERS.length), 2400);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="site-shell" data-motion-ready={motionReady} aria-label={t.motionEnabled}>
      <header className="site-header">
        <a href="#top" className="brand-link" aria-label={t.brandHome(selectedEvent.label)}>
          <span className="brand-wordmark">{selectedEvent.label}</span>
        </a>
        <LangToggle lang={lang} onChange={onLangChange} t={t} />
      </header>

      <main id="top">
        {selectedEvent.key === 'reboundx-in-wonderland' ? <ReboundXHero /> : <section className="hero" data-event={selectedEvent.key} aria-labelledby="hero-title">
          <DigitalRain headColor="#D9FFD9" trailColor="#00E23E" density={56} trail={38} shuffleGlyphs="ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍｦｲｸｺｿﾁﾄﾉﾌﾔﾖﾙﾚﾛﾝ0123456789" style={{ inset: 0, opacity: 1, pointerEvents: 'none', position: 'absolute', zIndex: 0 }} />
          <div className="hero-content">
            <p className="eyebrow slideIn" data-motion-reveal style={revealStyle(250)}>{selectedEvent.eyebrow}</p>
            <h1 id="hero-title"><span className="slideIn heading-reveal" data-motion-reveal style={revealStyle(520, 900)}>{selectedEvent.title}</span></h1>
            <p className="hero-copy slideIn" data-motion-reveal style={revealStyle(1040)}>{selectedEvent.copy}</p>
            <p className="event-date slideIn" data-motion-reveal style={revealStyle(1840)}>{selectedEvent.date}</p>
            {selectedEvent.key === 'perp-dex-day' ? <button className="outline-button hero-button motion-cta" type="button" onClick={onVote} aria-label={t.takeRedPill}>
              <span className="cta-shine" aria-hidden="true" />
              {t.ctaWords.map((word, index) => <CtaWord delay={2150 + index * 150} key={word}>{word}</CtaWord>)}<ArrowIcon />
            </button> : <span className="hero-status" aria-label={t.detailsSoonAria}>{t.detailsSoon}</span>}
          </div>
        </section>}

        <nav className="event-switcher" aria-label={t.eventSelection}>
          <div className="event-switcher-inner" role="tablist" aria-label={t.eventSelection}>
            {EVENTS.map((event, index) => <button
              className="event-tab"
              data-active={activeEvent === event.key ? 'true' : 'false'}
              id={`tab-${event.key}`}
              key={event.key}
              role="tab"
              aria-controls={`panel-${event.key}`}
              aria-selected={activeEvent === event.key}
              tabIndex={activeEvent === event.key ? 0 : -1}
              type="button"
              onClick={() => setActiveEvent(event.key)}
              onKeyDown={(keyboardEvent) => {
                if (keyboardEvent.key !== 'ArrowRight' && keyboardEvent.key !== 'ArrowLeft') return;
                keyboardEvent.preventDefault();
                const nextIndex = keyboardEvent.key === 'ArrowRight' ? (index + 1) % EVENTS.length : (index - 1 + EVENTS.length) % EVENTS.length;
                const nextEvent = EVENTS[nextIndex];
                setActiveEvent(nextEvent.key);
                document.getElementById(`tab-${nextEvent.key}`)?.focus();
              }}
            >{event.label}<ArrowIcon /></button>)}
          </div>
        </nav>

        {selectedEvent.key === 'perp-dex-day' ? <div id="panel-perp-dex-day" role="tabpanel" aria-labelledby="tab-perp-dex-day" aria-label="PERP-DEX DAY">
        <section className="sponsors content-section" aria-labelledby="sponsors-title">
          <p id="sponsors-title" className="section-intro slideIn" data-motion-reveal style={revealStyle(120)}>{t.sponsorsTitle}</p>
          <div className="logo-row" aria-label={t.sponsorsLabel}>{SPONSORS.map(([name, file], index) => <img className="slideIn" data-motion-reveal style={revealStyle(220 + index * 80)} key={name} src={`/assets/sponsors/${file}`} alt={name} />)}</div>
        </section>

        <section className="speakers content-section split-section" aria-labelledby="speakers-title">
          <div className="speaker-feature"><h2 id="speakers-title"><span className="slideIn heading-reveal" data-motion-reveal style={revealStyle(100)}>{t.speakersTitle}</span></h2><div className="speaker-feature-media slideIn" data-motion-reveal style={revealStyle(280)}>{speakers.map(([name, , image], index) => <img className="featured-speaker" data-active={activeSpeaker === index ? 'true' : 'false'} key={name} src={image} alt={activeSpeaker === index ? name : ''} />)}</div></div>
          <div className="speaker-list dense-speaker-list">{speakers.map(([name, role], index) => <div className="speaker" data-speaker-row data-active={activeSpeaker === index ? 'true' : 'false'} onMouseEnter={() => setActiveSpeaker(index)} onFocus={() => setActiveSpeaker(index)} tabIndex={0} key={name}><div><strong>{name}</strong><span>{role}</span></div></div>)}</div>
        </section>

        <section id="agenda" className="agenda content-section" aria-labelledby="agenda-title">
          <h2 id="agenda-title"><span className="slideIn heading-reveal" data-motion-reveal style={revealStyle(100)}>{t.agendaTitle}</span></h2>
          <div className="agenda-list">{agenda.map(([time, title, type], index) => <div className="agenda-row slideIn" data-motion-reveal style={revealStyle(180 + index * 70)} key={time}><time>{time}</time><div><strong>{title}</strong>{type ? <span>{type}</span> : null}</div><ArrowIcon /></div>)}</div>
        </section>

        <section className="operations content-section" aria-labelledby="operations-title">
          <BlackHoleBG style={{ inset: 0, pointerEvents: 'none', position: 'absolute', zIndex: 0 }} />
          <div className="operations-content"><p className="eyebrow eyebrow-dark slideIn" data-motion-reveal style={revealStyle(90)}>{t.opsEyebrow}</p><h2 id="operations-title"><span className="slideIn heading-reveal" data-motion-reveal style={revealStyle(180)}>{t.opsTitle}</span></h2><p className="operations-copy slideIn" data-motion-reveal style={revealStyle(300)}>{t.opsCopy}</p></div>
        </section>
        </div> : selectedEvent.key === 'reboundx-in-wonderland' ? <section className="reboundx-panel" id="panel-reboundx-in-wonderland" role="tabpanel" aria-labelledby="tab-reboundx-in-wonderland" aria-label="REBOUNDX IN WONDERLAND">
          <ReboundXPanel t={t} />
        </section> : <section className="event-placeholder content-section" id={`panel-${selectedEvent.key}`} role="tabpanel" aria-labelledby={`tab-${selectedEvent.key}`} aria-label={selectedEvent.label}>
          <p className="eyebrow">{t.placeholderEyebrow}</p>
          <h2>{selectedEvent.label}</h2>
          <p>{t.placeholderCopy}</p>
        </section>}
      </main>

      <footer className="site-footer"><FooterWordmark /><a href="#top">{t.backToArena}</a><span>{t.copyright}</span></footer>
    </div>
  );
}
