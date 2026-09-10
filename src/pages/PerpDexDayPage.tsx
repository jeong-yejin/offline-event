import { SpeakerSection } from '../components/events/SpeakerSection';
import { ArrowIcon } from '../components/ArrowIcon';
import { CtaWord } from '../components/CtaWord';
import BlackHoleBG from '../components/BlackHoleBG';
import { EventHero } from '../components/EventHero';
import type { EventContent } from '../data/eventContent';
import { AGENDA, SPONSORS } from '../data/homeContent';
import { localizeAgenda } from '../i18n/content';
import { PERPDEXDAY_STRINGS, type I18nProps } from '../i18n/strings/perpdexday';
import { revealStyle } from '../motion/reveal';

type PerpDexDayPageProps = Pick<I18nProps, 'lang'> & {
  /* Already localized by the caller, so the hero copy matches the rest of the shell. */
  event: EventContent;
  onEnterMarket(): void;
};

export function PerpDexDayPage({ event, lang, onEnterMarket }: PerpDexDayPageProps) {
  const t = PERPDEXDAY_STRINGS[lang];
  const agenda = AGENDA.map((item) => localizeAgenda(lang, item));

  return (
    <>
      <EventHero event={event}>
        <button className="shiny-cta hero-button motion-cta" type="button" onClick={onEnterMarket} aria-label={t.takeRedPill}>
          <span className="cta-shine" aria-hidden="true" />
          {t.ctaWords.map((word) => <CtaWord key={word}>{word}</CtaWord>)}<ArrowIcon />
        </button>
      </EventHero>

      <section className="sponsors content-section" aria-labelledby="sponsors-title">
        <p id="sponsors-title" className="section-intro slideIn" data-motion-reveal style={revealStyle(120)}>{t.sponsorsTitle}</p>
        <div className="logo-row" aria-label={t.sponsorsLabel}>{SPONSORS.map(([name, file], index) => <img className="slideIn" data-motion-reveal style={revealStyle(220 + index * 80)} key={name} src={`/assets/sponsors/wordmark-white/${file}`} alt={name} />)}</div>
      </section>

      <SpeakerSection lang={lang} t={t} />

      <section id="agenda" className="agenda content-section" aria-labelledby="agenda-title">
        <h2 id="agenda-title"><span className="slideIn heading-reveal" data-motion-reveal style={revealStyle(100)}>{t.agendaTitle}</span></h2>
        <div className="agenda-list">{agenda.map(([time, title, type], index) => <div className="agenda-row slideIn" data-motion-reveal style={revealStyle(180 + index * 70)} key={time}><time>{time}</time><div><strong>{title}</strong>{type ? <span>{type}</span> : null}</div></div>)}</div>
      </section>

      <section className="operations content-section" aria-labelledby="operations-title">
        <BlackHoleBG style={{ inset: 0, pointerEvents: 'none', position: 'absolute', zIndex: 0 }} />
        <div className="operations-content"><p className="eyebrow eyebrow-dark slideIn" data-motion-reveal style={revealStyle(90)}>{t.opsEyebrow}</p><h2 id="operations-title">{t.opsTitle.map((line, index) => <span className="slideIn heading-reveal operations-line" data-motion-reveal key={line} style={revealStyle(180 + index * 60)}>{line}</span>)}</h2><p className="operations-copy slideIn" data-motion-reveal style={revealStyle(300)}>{t.opsCopy}</p></div>
      </section>
    </>
  );
}
