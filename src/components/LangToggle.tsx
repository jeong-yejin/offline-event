import { LANG_LABEL, type Lang, type Strings } from '../i18n/strings';

type LangToggleProps = {
  lang: Lang;
  t: Strings;
  onChange(lang: Lang): void;
};

/* One button showing the language you get by pressing it. */
export function LangToggle({ lang, t, onChange }: LangToggleProps) {
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
