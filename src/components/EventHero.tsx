import type { ReactNode } from 'react';
import DigitalRain from './DigitalRain';
import type { EventContent } from '../data/eventContent';
import { revealStyle } from '../motion/reveal';

type EventHeroProps = {
  event: EventContent;
  /* The call to action differs per event, so the panel that owns the hero supplies it. */
  children: ReactNode;
};

export function EventHero({ event, children }: EventHeroProps) {
  return (
    <section className="hero" data-event={event.key} aria-labelledby="hero-title">
      <DigitalRain headColor="#D9FFD9" trailColor="#00E23E" density={56} trail={38} shuffleGlyphs="ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍｦｲｸｺｿﾁﾄﾉﾌﾔﾖﾙﾚﾛﾝ0123456789" style={{ inset: 0, opacity: 1, pointerEvents: 'none', position: 'absolute', zIndex: 0 }} />
      <div className="hero-content">
        <p className="eyebrow slideIn" data-motion-reveal style={revealStyle(250)}>{event.eyebrow}</p>
        <h1 id="hero-title"><span className="slideIn heading-reveal" data-motion-reveal style={revealStyle(520, 900)}>{event.title}</span></h1>
        <p className="hero-copy slideIn" data-motion-reveal style={revealStyle(1040)}>{event.copy}</p>
        <p className="event-date slideIn" data-motion-reveal style={revealStyle(1840)}>{event.date}</p>
        {children}
      </div>
    </section>
  );
}
