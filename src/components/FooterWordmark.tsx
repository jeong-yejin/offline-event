import { revealStyle } from '../motion/reveal';

export function FooterWordmark() {
  const text = 'ReboundX';
  return (
    <div className="footer-brand footer-wordmark" aria-label={text}>
      {Array.from(text).map((letter, index) => (
        <span key={`${letter}-${index}`} className="slideIn" data-motion-reveal style={revealStyle(600 + index * 60)} aria-hidden="true">{letter === ' ' ? '\u00a0' : letter}</span>
      ))}
    </div>
  );
}
