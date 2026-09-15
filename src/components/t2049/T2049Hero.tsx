import { ArrowIcon } from '../ArrowIcon';
import { EventCountdown } from '../events/EventCountdown';
import { EventHero } from '../EventHero';
import { HeroSplineBackground } from '../HeroSplineBackground';
import type { EventContent } from '../../data/eventContent';
import { T2049_EVENT_DAY_AT } from '../../data/token2049Content';
import type { Strings } from '../../i18n/strings/token2049';

type T2049HeroProps = {
  event: EventContent;
  t: Strings;
  onEnterMarket(): void;
};

export function T2049Hero({ event, t, onEnterMarket }: T2049HeroProps) {
  return (
    <EventHero
      event={event}
      background={<HeroSplineBackground />}
      /* The Spline scene paints its watermark into the bottom corner of its own canvas, where nothing
         in this page can reach it. A band across the foot of the hero covers that corner, and the six
         lines it carries are the pitch the hero copy has no room for. The list runs twice so the loop
         has no seam; the second copy is decoration, so only that one is hidden from a reader. */
      footer={<div className="t2049-hero-marquee">
        <div className="t2049-hero-marquee-track">
          <ul>{t.t2049HeroMarquee.map((line) => <li key={line}>{line}</li>)}</ul>
          <ul aria-hidden="true">{t.t2049HeroMarquee.map((line) => <li key={line}>{line}</li>)}</ul>
        </div>
      </div>}
    >
      <EventCountdown target={T2049_EVENT_DAY_AT} t={t} />

      <div className="t2049-hero-actions">
        <button className="outline-button hero-button hero-market-button" type="button" onClick={onEnterMarket}>{t.t2049HeroCta}<ArrowIcon /></button>
      </div>
    </EventHero>
  );
}
