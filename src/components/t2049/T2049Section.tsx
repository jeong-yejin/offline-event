import type { ReactNode } from 'react';
import { revealStyle } from '../../motion/reveal';

type T2049SectionProps = {
  id?: string;
  name: string;
  eyebrow: string;
  title: readonly string[];
  headerContent?: ReactNode;
  children: ReactNode;
  afterBody?: ReactNode;
};

/** A section heading and body, with optional copy in the heading column and a full-width closing row. */
export function T2049Section({ id, name, eyebrow, title, headerContent, children, afterBody }: T2049SectionProps) {
  const titleId = `t2049-${name}-title`;
  return (
    <section className={`t2049-section t2049-${name}`} id={id} aria-labelledby={titleId}>
      <header className="t2049-head">
        <p className="eyebrow slideIn" data-motion-reveal style={revealStyle(90)}>{eyebrow}</p>
        <h2 id={titleId}>{title.map((line, index) => (
          <span className="slideIn heading-reveal t2049-title-line" data-motion-reveal key={line} style={revealStyle(180 + index * 60)}>{index > 0 ? ' ' : ''}{line}</span>
        ))}</h2>
        {headerContent}
      </header>
      <div className="t2049-body">{children}</div>
      {afterBody}
    </section>
  );
}
