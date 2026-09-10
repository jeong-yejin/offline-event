import { useEffect, useState } from 'react';
import type { Lang } from './types';

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

/* `forced` serves English-only routes. They render in that language without overwriting the choice the
   reader made elsewhere, so leaving TOKEN2049 returns them to the language they were reading in. */
export function useLanguage(forced?: Lang): { lang: Lang; setLang(lang: Lang): void } {
  const [preferred, setPreferred] = useState<Lang>(readLang);
  const lang = forced ?? preferred;

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, preferred);
    } catch {
      /* storage blocked; the choice lasts for this session only. */
    }
  }, [preferred]);

  return { lang, setLang: setPreferred };
}
