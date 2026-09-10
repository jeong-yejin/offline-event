import { useEffect, useState, type CSSProperties } from 'react';

export function revealStyle(delayMs: number, durationMs = 800): CSSProperties {
  return { '--delay': `${delayMs}ms`, '--duration': `${durationMs}ms` } as CSSProperties;
}

/* The hub and all three event pages are one mounted component, so a tab click swaps the reveal
   elements without remounting. A one-shot scan would leave every new element at opacity 0 until a
   reload, so the scan re-runs whenever the page on screen changes. */
export function useMotionReveal(page: string | null) {
  const [motionReady, setMotionReady] = useState(false);

  useEffect(() => {
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>('[data-motion-reveal]'));
    const activate = (element: HTMLElement) => { element.dataset.inview = 'true'; };
    if (!('IntersectionObserver' in window)) revealItems.forEach(activate);
    else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activate(entry.target as HTMLElement);
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
      revealItems.forEach((element) => observer.observe(element));
      setMotionReady(true);
      return () => observer.disconnect();
    }
    setMotionReady(true);
  }, [page]);

  return motionReady;
}
