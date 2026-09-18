import { useEffect, useRef, useState } from 'react';

export function useHubSlideshow(eventCount: number) {
  const [active, setActive] = useState(-1);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [visible, setVisible] = useState(true);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) setPaused(true);
    const change = () => { if (media.matches) setPaused(true); };
    media.addEventListener('change', change);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (root.current) observer.observe(root.current);
    return () => { observer.disconnect(); media.removeEventListener('change', change); };
  }, []);
  useEffect(() => {
    if (paused || interacting || !visible) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((current) => (current + 1) % eventCount);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused, interacting, visible, active, eventCount]);
  return { active, select: setActive, visible, root, setInteracting };
}
