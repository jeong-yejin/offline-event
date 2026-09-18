import { EVENTS } from '../../data/eventContent';

export function HubEventRail({ active, onSelect, label }: { active: number; onSelect(index: number): void; label: string }) {
  return (
      <nav className="hub-rail" aria-label={label}>
        <ol>{EVENTS.map((item, index) => <li key={item.key} data-active={index === active}>
          <button type="button" aria-pressed={index === active} onClick={() => onSelect(index)}><small>0{index + 1}</small><span>{item.label}</span></button>
        </li>)}</ol>
      </nav>
  );
}
