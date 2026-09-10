import { useEffect, useState } from 'react';
import type { Strings } from '../../i18n/strings/token2049';

const SECTION_IDS = ['competition', 'traders', 'venue', 'rsvp'] as const;

type SectionId = (typeof SECTION_IDS)[number];

/* The bar used to scroll out of the viewport inside the first screen and never come back, which
   left the rest of the page with no way to jump anywhere. It sticks now, so the entry it marks has
   to follow the reader rather than stay on the section they landed in. */
function useActiveSection(ids: readonly SectionId[]): SectionId {
  const [active, setActive] = useState<SectionId>(ids[0]);

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);
    if (!('IntersectionObserver' in window) || sections.length === 0) return;

    /* The band sits just under the bar and stops short of the fold, so the section that owns the
       top of the screen wins instead of whichever one happens to be tallest. */
    const observer = new IntersectionObserver(
      (entries) => entries.filter((entry) => entry.isIntersecting).forEach((entry) => setActive(entry.target.id as SectionId)),
      { rootMargin: '-25% 0px -65% 0px' },
    );
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [ids]);

  return active;
}

export function T2049Nav({ t }: { t: Strings }) {
  const active = useActiveSection(SECTION_IDS);
  const labels: Record<SectionId, string> = {
    competition: t.t2049NavCompetition,
    traders: t.t2049NavTraders,
    venue: t.t2049NavVenue,
    rsvp: t.t2049NavRsvp,
  };

  return (
    <nav className="t2049-nav" aria-label={t.t2049NavLabel}>
      <ul>
        {SECTION_IDS.map((id) => (
          <li key={id}>
            <a aria-current={active === id ? 'location' : undefined} href={`#${id}`}>{labels[id]}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
