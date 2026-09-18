import { EVENTS } from '../data/eventContent';
import type { I18nProps } from '../i18n/strings/common';
import type { AppRoute } from '../router/routes';
import { HubBackdrop } from '../features/hub/HubBackdrop';
import { HubSlides } from '../features/hub/HubSlides';
import { HubEventRail } from '../features/hub/HubEventRail';
import { useHubSlideshow } from '../features/hub/useHubSlideshow';

type HubPageProps = Pick<I18nProps, 't' | 'lang'> & { onNavigate(route: AppRoute): void };

export function HubPage({ onNavigate, t, lang }: HubPageProps) {
  const { active, select, visible, root, setInteracting } = useHubSlideshow(EVENTS.length);
  return (
    <section ref={root} className="hub-showcase" data-event={EVENTS[active]?.key ?? 'intro'} aria-label={t.eventSelection}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}>
      <HubBackdrop active={active} visible={visible} />
      <HubSlides active={active} onNavigate={onNavigate} t={t} lang={lang} />
      <HubEventRail active={active} onSelect={select} label={t.eventSelection} />
    </section>
  );
}
