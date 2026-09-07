import { useEffect, useState } from 'react';
import { ArrowIcon } from '../components/ArrowIcon';
import { CtaWord } from '../components/CtaWord';
import { FooterWordmark } from '../components/FooterWordmark';
import BlackHoleBG from '../components/BlackHoleBG';
import DigitalRain from '../components/DigitalRain';
import { ReboundXHero } from '../components/ReboundXHero';
import { EVENTS, type EventKey } from '../data/eventContent';
import { AGENDA, SPEAKERS, SPONSORS } from '../data/homeContent';
import { revealStyle, useMotionReveal } from '../motion/reveal';

type HomePageProps = {
  onVote(): void;
};

function ReboundXPanel() {
  const [frameHeight, setFrameHeight] = useState(960);

  function syncFrameHeight(frame: HTMLIFrameElement) {
    const documentHeight = frame.contentDocument?.documentElement.scrollHeight;
    if (documentHeight) setFrameHeight(Math.max(documentHeight, 960));
  }

  return (
    <div className="reboundx-frame-wrap">
      <iframe
        className="reboundx-frame"
        title="ReboundX in Wonderland event page"
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

export function HomePage({ onVote }: HomePageProps) {
  const motionReady = useMotionReveal();
  const [activeSpeaker, setActiveSpeaker] = useState(0);
  const [activeEvent, setActiveEvent] = useState<EventKey>('perp-dex-day');
  const selectedEvent = EVENTS.find((event) => event.key === activeEvent) ?? EVENTS[0];

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (media?.matches) return undefined;
    const timer = window.setInterval(() => setActiveSpeaker((current) => (current + 1) % SPEAKERS.length), 2400);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="site-shell" data-motion-ready={motionReady} aria-label="Motion enabled">
      <header className="site-header">
        <a href="#top" className="brand-link" aria-label="Go to PERP-DEX DAY home">
          <span className="brand-wordmark">PERP-DEX DAY</span>
        </a>
      </header>

      <main id="top">
        {selectedEvent.key === 'reboundx-in-wonderland' ? <ReboundXHero /> : <section className="hero" data-event={selectedEvent.key} aria-labelledby="hero-title">
          <DigitalRain headColor="#D9FFD9" trailColor="#00E23E" density={56} trail={38} shuffleGlyphs="ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍｦｲｸｺｿﾁﾄﾉﾌﾔﾖﾙﾚﾛﾝ0123456789" style={{ inset: 0, opacity: 1, pointerEvents: 'none', position: 'absolute', zIndex: 0 }} />
          <div className="hero-content">
            <p className="eyebrow slideIn" data-motion-reveal style={revealStyle(250)}>{selectedEvent.eyebrow}</p>
            <h1 id="hero-title"><span className="slideIn heading-reveal" data-motion-reveal style={revealStyle(520, 900)}>{selectedEvent.title}</span></h1>
            <p className="hero-copy slideIn" data-motion-reveal style={revealStyle(1040)}>{selectedEvent.copy}</p>
            <p className="event-date slideIn" data-motion-reveal style={revealStyle(1840)}>{selectedEvent.date}</p>
            {selectedEvent.key === 'perp-dex-day' ? <button className="outline-button hero-button motion-cta" type="button" onClick={onVote} aria-label="Take the red pill">
              <span className="cta-shine" aria-hidden="true" />
              <CtaWord delay={2150}>Take</CtaWord><CtaWord delay={2300}>the</CtaWord><CtaWord delay={2450}>red pill</CtaWord><ArrowIcon />
            </button> : <span className="hero-status" aria-label="Event details coming soon">Details coming soon</span>}
          </div>
        </section>}

        <nav className="event-switcher" aria-label="Event selection">
          <div className="event-switcher-inner" role="tablist" aria-label="Event selection">
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
          <p id="sponsors-title" className="section-intro slideIn" data-motion-reveal style={revealStyle(120)}>The teams behind them</p>
          <div className="logo-row" aria-label="Sponsors">{SPONSORS.map(([name, file], index) => <img className="slideIn" data-motion-reveal style={revealStyle(220 + index * 80)} key={name} src={`/assets/sponsors/${file}`} alt={name} />)}</div>
        </section>

        <section className="speakers content-section split-section" aria-labelledby="speakers-title">
          <div className="speaker-feature"><h2 id="speakers-title"><span className="slideIn heading-reveal" data-motion-reveal style={revealStyle(100)}>Speakers</span></h2><div className="speaker-feature-media slideIn" data-motion-reveal style={revealStyle(280)}>{SPEAKERS.map(([name, , image], index) => <img className="featured-speaker" data-active={activeSpeaker === index ? 'true' : 'false'} key={name} src={image} alt={activeSpeaker === index ? name : ''} />)}</div></div>
          <div className="speaker-list dense-speaker-list">{SPEAKERS.map(([name, role], index) => <div className="speaker" data-speaker-row data-active={activeSpeaker === index ? 'true' : 'false'} onMouseEnter={() => setActiveSpeaker(index)} onFocus={() => setActiveSpeaker(index)} tabIndex={0} key={name}><div><strong>{name}</strong><span>{role}</span></div></div>)}</div>
        </section>

        <section id="agenda" className="agenda content-section" aria-labelledby="agenda-title">
          <h2 id="agenda-title"><span className="slideIn heading-reveal" data-motion-reveal style={revealStyle(100)}>Timetable</span></h2>
          <div className="agenda-list">{AGENDA.map(([time, title, type], index) => <div className="agenda-row slideIn" data-motion-reveal style={revealStyle(180 + index * 70)} key={time}><time>{time}</time><div><strong>{title}</strong>{type ? <span>{type}</span> : null}</div><ArrowIcon /></div>)}</div>
        </section>

        <section className="operations content-section" aria-labelledby="operations-title">
          <BlackHoleBG style={{ inset: 0, pointerEvents: 'none', position: 'absolute', zIndex: 0 }} />
          <div className="operations-content"><p className="eyebrow eyebrow-dark slideIn" data-motion-reveal style={revealStyle(90)}>Choose the red pill. Enter the construct.</p><h2 id="operations-title"><span className="slideIn heading-reveal" data-motion-reveal style={revealStyle(180)}>Trading, elevated to e-sports.</span></h2><p className="operations-copy slideIn" data-motion-reveal style={revealStyle(300)}>There is only one. The rest are forks. The strongest Perp DEX teams get unplugged and return bigger, stronger, and ready to trade in front of the crowd.</p></div>
        </section>
        </div> : selectedEvent.key === 'reboundx-in-wonderland' ? <section className="reboundx-panel" id="panel-reboundx-in-wonderland" role="tabpanel" aria-labelledby="tab-reboundx-in-wonderland" aria-label="REBOUNDX IN WONDERLAND">
          <ReboundXPanel />
        </section> : <section className="event-placeholder content-section" id={`panel-${selectedEvent.key}`} role="tabpanel" aria-labelledby={`tab-${selectedEvent.key}`} aria-label={selectedEvent.label}>
          <p className="eyebrow">Transmission queued</p>
          <h2>{selectedEvent.label}</h2>
          <p>Coming soon. The event details are still being written into the construct.</p>
        </section>}
      </main>

      <footer className="site-footer"><FooterWordmark /><a href="#top">Back to the arena</a><span>© 2026 PERP-DEX DAY</span></footer>
    </div>
  );
}
