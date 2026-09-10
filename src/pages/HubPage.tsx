import { ArrowIcon } from '../components/ArrowIcon';
import { useEffect, useRef, useState } from 'react';
import { localizeEvent } from '../i18n/content';
import { EVENTS } from '../data/eventContent';
import DigitalRain from '../components/DigitalRain';
import { ReboundXTunnel } from '../components/ReboundXTunnel';
import { HeroSplineBackground } from '../components/HeroSplineBackground';
import type { I18nProps } from '../i18n/strings/common';
import { navClick, routePath, type AppRoute } from '../router/useAppRoute';

type HubPageProps = Pick<I18nProps, 't' | 'lang'> & {
  onNavigate(route: AppRoute): void;
};

/* The landing page at '/'. It names the three events and hands the visitor off; no event owns it. */
export function HubPage({ onNavigate, t, lang }: HubPageProps) {
  const [active, setActive] = useState(-1);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [visible, setVisible] = useState(true);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) setPaused(true);
    const change = () => { if (media.matches) setPaused(true); };
    media.addEventListener('change', change);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (root.current) observer.observe(root.current);
    return () => { observer.disconnect(); media.removeEventListener('change', change); };
  }, []);
  useEffect(() => {
    if (paused || interacting || !visible) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((current) => (current + 1) % EVENTS.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused, interacting, visible, active]);
  const event = active < 0 ? null : localizeEvent(lang, EVENTS[active]);
  const ko = lang === 'ko';
  return (
    <section ref={root} className="hub-showcase" data-event={event?.key ?? 'intro'} aria-label={t.eventSelection}
      onFocusCapture={() => setInteracting(true)} onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setInteracting(false); }}>
      <div className="hub-backdrop" aria-hidden="true">
        {visible && (active === 0 ? <DigitalRain headColor="#D9FFD9" trailColor="#00E23E" density={56} trail={38} /> : active === 1 ? <ReboundXTunnel /> : null)}
        {visible && <div className="hub-spline-layer" style={{ visibility: active === 2 ? 'visible' : 'hidden' }}><HeroSplineBackground /></div>}
      </div>
      <div className="hub-slides">
        <article className="hub-slide hub-slide--intro" data-active={active === -1} aria-hidden={active !== -1} inert={active !== -1}>
          <p className="hub-kicker">REBOUNDX EVENTS</p>
          <h1>{t.hubHeadline}</h1>
          <p className="hub-description">{t.hubLede}</p>
        </article>
        {EVENTS.map((source, index) => {
          const item = localizeEvent(lang, source);
          return <article key={item.key} className="hub-slide" data-active={index === active} aria-hidden={index !== active} inert={index !== active}>
            <p className="hub-kicker">REBOUNDX EVENTS / 0{index + 1}</p>
            <p className="hub-eyebrow">{item.eyebrow}</p>
            <h1>{item.title}</h1>
            <p className="hub-description">{item.copy}</p>
            <p className="hub-date">{item.date}</p>
            <a className="outline-button" href={routePath(item.key)} onClick={navClick(onNavigate, item.key)}>{ko ? '행사 자세히 보기' : 'Explore event'}<ArrowIcon /></a>
          </article>;
        })}
      </div>
      <nav className="hub-rail" aria-label={t.eventSelection}>
        <ol>{EVENTS.map((item, index) => <li key={item.key} data-active={index === active}>
          <button type="button" aria-pressed={index === active} onClick={() => setActive(index)}><small>0{index + 1}</small><span>{item.label}</span></button>
        </li>)}</ol>
      </nav>
    </section>
  );
}
