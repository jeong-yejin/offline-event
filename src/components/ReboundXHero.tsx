import type { ReactNode } from 'react';

/* Page hero on first entry. It introduces all three events, so it carries no single event's date. */
export function ReboundXHero({ children, cta }: { children: ReactNode; cta?: ReactNode }) {
  return (
    <section className="reboundx-hero reboundx-hero--page" aria-labelledby="reboundx-hero-title">
      <div className="reboundx-hero__intro">
        <h1 id="reboundx-hero-title" className="reboundx-hero__headline">ReboundX가 만드는 더 나은 거래를 직접 경험해요.</h1>
        <div className="reboundx-hero__copy">
          <p className="reboundx-hero__lede">PERP-DEX DAY, REBOUNDX DAY, TOKEN2049에서 승부를 예측하는 긴장감부터 직접 참여하는 즐거움과 글로벌 네트워킹까지 모두 경험해요.</p>
          {cta}
        </div>
      </div>
      {children}
    </section>
  );
}
