import { LANG_LABEL, type Lang } from '../i18n/types';
import type { Strings } from '../i18n/strings/common';

type LangToggleProps = {
  lang: Lang;
  t: Strings;
  /* null on English-only pages, which have no second language to offer. */
  onChange: ((lang: Lang) => void) | null;
};

/* One button showing the language you get by pressing it. */
export function LangToggle({ lang, t, onChange }: LangToggleProps) {
  if (!onChange) return null;

  const next: Lang = lang === 'en' ? 'ko' : 'en';

  return (
    <button
      aria-label={t.langSwitch(next)}
      className="lang-toggle"
      onClick={() => onChange(next)}
      type="button"
    >{LANG_LABEL[next]}</button>
  );
}
