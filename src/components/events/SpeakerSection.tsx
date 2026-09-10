import { useEffect, useMemo, useState } from 'react';
import { SPEAKERS } from '../../data/homeContent';
import { localizeRole } from '../../i18n/content';
import type { I18nProps } from '../../i18n/strings/perpdexday';
import { revealStyle } from '../../motion/reveal';

export function SpeakerSection({ lang, t }: Pick<I18nProps, 'lang' | 't'>) {
  const [activeSpeaker, setActiveSpeaker] = useState(0);
  const speakers = useMemo(() => SPEAKERS.map((speaker) => localizeRole(lang, speaker)), [lang]);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (media?.matches) return undefined;
    const timer = window.setInterval(() => setActiveSpeaker((current) => (current + 1) % SPEAKERS.length), 2400);
    return () => window.clearInterval(timer);
  }, []);

  return (
      <section className="speakers content-section split-section" aria-labelledby="speakers-title">
        <div className="speaker-feature"><h2 id="speakers-title"><span className="slideIn heading-reveal" data-motion-reveal style={revealStyle(100)}>{t.speakersTitle}</span></h2><div className="speaker-feature-media slideIn" data-motion-reveal style={revealStyle(280)}>{speakers.map(([name, , image], index) => <img className="featured-speaker" data-active={activeSpeaker === index ? 'true' : 'false'} key={name} src={image} alt={activeSpeaker === index ? name : ''} />)}</div></div>
        <div className="speaker-list dense-speaker-list">{speakers.map(([name, role], index) => <button className="speaker" data-speaker-row data-active={activeSpeaker === index ? 'true' : 'false'} type="button" aria-pressed={activeSpeaker === index} onMouseEnter={() => setActiveSpeaker(index)} onFocus={() => setActiveSpeaker(index)} onClick={() => setActiveSpeaker(index)} key={name}><div><strong>{name}</strong><span>{role}</span></div></button>)}</div>
      </section>
  );
}
