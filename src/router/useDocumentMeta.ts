import { useEffect } from 'react';

/* Which attribute names the tag: Open Graph uses property, everything else uses name. */
export type MetaTag = readonly [attribute: 'name' | 'property', key: string, content: string];

export type DocumentMeta = {
  title: string;
  tags: readonly MetaTag[];
};

/* index.html ships the PERP-DEX DAY head and most routes are happy with it. A route that needs its
   own share card passes one in; the previous values go back when it leaves, and tags this hook had
   to create are removed rather than left behind holding another page's copy. */
export function useDocumentMeta(meta: DocumentMeta | null): void {
  useEffect(() => {
    if (!meta) return;

    const title = document.title;
    const previous = new Map<HTMLMetaElement, string | null>();

    document.title = meta.title;

    meta.tags.forEach(([attribute, key, content]) => {
      const existing = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      const tag = existing ?? document.head.appendChild(Object.assign(document.createElement('meta'), { [attribute]: key }));
      previous.set(tag, existing ? tag.getAttribute('content') : null);
      tag.setAttribute('content', content);
    });

    return () => {
      document.title = title;
      previous.forEach((content, tag) => {
        if (content === null) tag.remove();
        else tag.setAttribute('content', content);
      });
    };
  }, [meta]);
}
