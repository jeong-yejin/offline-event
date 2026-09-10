import type { ReactNode } from 'react';
import type { I18nProps } from '../i18n/strings/common';

type ReboundXHeroProps = Pick<I18nProps, 't'> & { children: ReactNode; cta?: ReactNode };

/* Page hero on first entry. It introduces all three events, so it carries no single event's date. */
export function ReboundXHero({ children, cta, t }: ReboundXHeroProps) {
  return (
    <section className="reboundx-hero reboundx-hero--page" aria-labelledby="reboundx-hero-title">
      <div className="reboundx-hero__intro">
        <h1 id="reboundx-hero-title" className="reboundx-hero__headline">{t.hubHeadline}</h1>
        <div className="reboundx-hero__copy">
          <p className="reboundx-hero__lede">{t.hubLede}</p>
          {cta}
        </div>
      </div>
      {children}
    </section>
  );
}
