import { ArrowIcon } from '../components/ArrowIcon';
import { EventHero } from '../components/EventHero';
import type { EventContent } from '../data/eventContent';
import { TOKEN2049_AGENDA, TOKEN2049_FACTS } from '../data/token2049Content';
import { localizeAgenda, localizeFact } from '../i18n/content';
import type { Lang, Strings } from '../i18n/strings';
import { revealStyle } from '../motion/reveal';

type Token2049PageProps = {
  event: EventContent;
  lang: Lang;
  t: Strings;
  onVote(): void;
};

export function Token2049Page({ event, lang, t, onVote }: Token2049PageProps) {
  const agenda = TOKEN2049_AGENDA.map((item) => localizeAgenda(lang, item));
  const facts = TOKEN2049_FACTS.map((fact) => localizeFact(lang, fact));

  return (
    <div>
      <EventHero event={event}>
        <a className="outline-button hero-button" href="#t2049-schedule-title">{t.t2049HeroCta}<ArrowIcon /></a>
      </EventHero>

      <section className="t2049-intro content-section" aria-labelledby="t2049-intro-title">
        <p className="eyebrow slideIn" data-motion-reveal style={revealStyle(90)}>{t.t2049Eyebrow}</p>
        <h2 id="t2049-intro-title"><span className="slideIn heading-reveal" data-motion-reveal style={revealStyle(180)}>{t.t2049Title}</span></h2>
        <p className="t2049-lede slideIn" data-motion-reveal style={revealStyle(300)}>{t.t2049Copy}</p>
        <dl className="t2049-facts" aria-label={t.t2049FactsLabel}>{facts.map(([label, value], index) => <div className="slideIn" data-motion-reveal style={revealStyle(420 + index * 90)} key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      </section>

      <section className="t2049-schedule content-section" aria-labelledby="t2049-schedule-title">
        <h2 id="t2049-schedule-title"><span className="slideIn heading-reveal" data-motion-reveal style={revealStyle(100)}>{t.agendaTitle}</span></h2>
        <p className="t2049-note slideIn" data-motion-reveal style={revealStyle(170)}>{t.t2049ScheduleNote}</p>
        <div className="agenda-list">{agenda.map(([time, title], index) => <div className="agenda-row slideIn" data-motion-reveal style={revealStyle(240 + index * 70)} key={time}><time>{time}</time><div><strong>{title}</strong></div></div>)}</div>
      </section>

      <section className="t2049-market content-section" aria-labelledby="t2049-market-title">
        <p className="eyebrow slideIn" data-motion-reveal style={revealStyle(90)}>{t.t2049MarketEyebrow}</p>
        <h2 id="t2049-market-title"><span className="slideIn heading-reveal" data-motion-reveal style={revealStyle(180)}>{t.t2049MarketTitle}</span></h2>
        <p className="t2049-market-copy slideIn" data-motion-reveal style={revealStyle(300)}>{t.t2049MarketCopy}</p>
        <button className="outline-button t2049-market-cta slideIn" data-motion-reveal style={revealStyle(420)} type="button" onClick={onVote}>{t.t2049MarketCta}<ArrowIcon /></button>
      </section>
    </div>
  );
}
