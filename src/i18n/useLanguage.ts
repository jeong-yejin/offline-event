import { useEffect, useState } from 'react';
import { DICT, type Lang, type Strings } from './strings';

const STORAGE_KEY = 'perpdex.lang.v1';

const isLang = (value: unknown): value is Lang => value === 'en' || value === 'ko';

function readLang(): Lang {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) return stored;
  } catch {
    /* storage blocked; fall through to the browser preference. */
  }
  return window.navigator.language?.toLowerCase().startsWith('ko') ? 'ko' : 'en';
}

export function useLanguage(): { lang: Lang; setLang(lang: Lang): void; t: Strings } {
  const [lang, setLang] = useState<Lang>(readLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage blocked; the choice lasts for this session only. */
    }
  }, [lang]);

  return { lang, setLang, t: DICT[lang] };
}
