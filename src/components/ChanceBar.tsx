import type { Strings } from '../i18n/strings/market';

type ChanceBarProps = {
  t: Strings;
  name: string;
  chance: number;
  yesPrice: number;
  noPrice: number;
};

/* One split bar reads the whole book: what the room pays for the focused market to win, and what it
   pays against. */
export function ChanceBar({ t, name, chance, yesPrice, noPrice }: ChanceBarProps) {
  return (
    <div className="market-prob">
      <div className="prob-bar" aria-hidden="true"><span data-side="yes" style={{ width: `${chance}%` }} /><span data-side="no" style={{ width: `${100 - chance}%` }} /></div>
      <p className="prob-legend"><span data-side="yes">{yesPrice} pt {t.sideYes}</span><em>{name}</em><span data-side="no">{noPrice} pt {t.sideNo}</span></p>
    </div>
  );
}
