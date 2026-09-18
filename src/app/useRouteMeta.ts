import { useMemo } from 'react';
import { TOKEN2049_STRINGS } from '../i18n/strings/token2049';
import { useDocumentMeta } from '../router/useDocumentMeta';

export function useRouteMeta(englishOnly: boolean) {
  const metaStrings = TOKEN2049_STRINGS.en;
  /* PERPS DAY is its own event with its own share card, and its market page belongs to that event rather
     than to PERP-DEX DAY, so both routes take the card. Every other route keeps the head from index.html. */
  const meta = useMemo(() => (englishOnly ? {
    title: metaStrings.t2049MetaTitle,
    tags: [
      ['name', 'description', metaStrings.t2049MetaDescription],
      ['property', 'og:title', metaStrings.t2049MetaTitle],
      ['property', 'og:description', metaStrings.t2049OgDescription],
      ['property', 'og:image:alt', metaStrings.t2049OgImageAlt],
      ['name', 'twitter:title', metaStrings.t2049MetaTitle],
      ['name', 'twitter:description', metaStrings.t2049TwitterDescription],
    ] as const,
  } : null), [englishOnly, metaStrings]);

  useDocumentMeta(meta);

}
