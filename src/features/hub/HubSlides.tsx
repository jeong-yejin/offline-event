import { ArrowIcon } from '../../components/ArrowIcon';
import { localizeEvent } from '../../i18n/content';
import { EVENTS } from '../../data/eventContent';
import type { I18nProps } from '../../i18n/strings/common';
import { navClick } from '../../router/navigation';
import { routePath, type AppRoute } from '../../router/routes';

type Props = Pick<I18nProps, 't' | 'lang'> & { active: number; onNavigate(route: AppRoute): void };

export function HubSlides({ active, onNavigate, t, lang }: Props) {
  const ko = lang === 'ko';
  return (
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
  );
}
