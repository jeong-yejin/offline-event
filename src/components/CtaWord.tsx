/* The hero CTA is the one thing on the page that must never read as empty, so the label skips the
   scroll reveal the rest of the hero uses. Each word is stacked twice for the hover roll-up. */
export function CtaWord({ children }: { children: string }) {
  return (
    <span className="cta-word" aria-hidden="true">
      <span className="cta-word-track"><span>{children}</span><span>{children}</span></span>
    </span>
  );
}
