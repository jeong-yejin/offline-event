import { useEffect, useState } from 'react';
import type { Strings } from '../../i18n/strings/token2049';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/* The clock runs to the start of event day in Singapore. It stops at zero instead of going negative. */
function useCountdown(target: number): number {
  const [left, setLeft] = useState(() => Math.max(0, target - Date.now()));

  useEffect(() => {
    const id = window.setInterval(() => setLeft(Math.max(0, target - Date.now())), SECOND);
    return () => window.clearInterval(id);
  }, [target]);

  return left;
}

export function EventCountdown({ target, t }: { target: number; t: Strings }) {
  const left = useCountdown(target);

  const clock: readonly (readonly [string, number])[] = [
    [t.t2049CountdownDays, Math.floor(left / DAY)],
    [t.t2049CountdownHours, Math.floor((left % DAY) / HOUR)],
    [t.t2049CountdownMinutes, Math.floor((left % HOUR) / MINUTE)],
    [t.t2049CountdownSeconds, Math.floor((left % MINUTE) / SECOND)],
  ];

  return (
    <div className="t2049-clock" role="group" aria-label={t.t2049CountdownTitle}>
      <p className="t2049-clock-title">{t.t2049CountdownTitle}</p>
      <dl>{clock.map(([label, value]) => <div key={label}><dd>{String(value).padStart(2, '0')}</dd><dt>{label}</dt></div>)}</dl>
    </div>
  );
}
