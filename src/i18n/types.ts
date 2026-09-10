export type Lang = 'en' | 'ko';

export const LANGS: readonly Lang[] = ['en', 'ko'];
export const LANG_LABEL: Record<Lang, string> = { en: 'EN', ko: 'KO' };

export type LocalizedProps<T> = {
  lang: Lang;
  t: T;
  /** English-only routes do not expose a language toggle. */
  onLangChange: ((lang: Lang) => void) | null;
};
