import { T2049Arrow } from './T2049Arrow';
import { T2049Section } from './T2049Section';
import { T2049_SEATS_PER_TEAM, TOKEN2049_TEAMS, type TeamStatus } from '../../data/token2049Content';
import type { Strings } from '../../i18n/strings/token2049';

export function T2049Field({ t, onEnterTeams }: { t: Strings; onEnterTeams(): void }) {
  const statusLabel = (status: TeamStatus): string => status === 'confirmed' ? t.t2049TeamConfirmed : status === 'open' ? t.t2049TeamSlotOpen : t.t2049Tbd;
  return (
    <T2049Section id="traders" name="field" eyebrow={t.t2049LiveEyebrow} title={t.t2049LiveTitle} headerContent={<>
      <p className="t2049-lede">{t.t2049TeamsCopy}</p>
      <button className="outline-button t2049-teams-cta" type="button" onClick={onEnterTeams}>{t.t2049TeamsCta}<T2049Arrow /></button>
    </>}>
      <ul className="t2049-team-grid">
        {TOKEN2049_TEAMS.map((status, team) => <li data-status={status} key={team}>
          <strong>{String(team + 1).padStart(2, '0')}</strong>
          <ul className="t2049-team-seats">{Array.from({ length: T2049_SEATS_PER_TEAM }, (_, seat) =>
            <li key={seat}>{t.t2049TraderSlot(team * T2049_SEATS_PER_TEAM + seat + 1)}</li>)}</ul>
          <span>{statusLabel(status)}</span>
        </li>)}
      </ul>
    </T2049Section>
  );
}
