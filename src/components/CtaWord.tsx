import { revealStyle } from '../motion/reveal';

export function CtaWord({ children, delay }: { children: string; delay: number }) {
  return (
    <span className="cta-word slideIn" data-motion-reveal style={revealStyle(delay)} aria-hidden="true">
      <span className="cta-word-track"><span>{children}</span><span>{children}</span></span>
    </span>
  );
}
