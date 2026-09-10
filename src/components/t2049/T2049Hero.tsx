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
  onEnterTeams(): void;
};

export function T2049Hero({ event, t, onEnterMarket, onEnterTeams }: T2049HeroProps) {
  return (
    <EventHero event={event} background={<HeroSplineBackground />}>
      <EventCountdown target={T2049_EVENT_DAY_AT} t={t} />

      <div className="t2049-hero-actions">
        <button className="outline-button hero-button hero-team-button" type="button" onClick={onEnterTeams}>{t.t2049HeroTeamCta}</button>
        <button className="outline-button hero-button hero-market-button" type="button" onClick={onEnterMarket}>{t.t2049HeroCta}<ArrowIcon /></button>
      </div>
    </EventHero>
  );
}
