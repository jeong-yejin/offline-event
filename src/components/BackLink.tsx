type BackLinkProps = {
  /* What the reader goes back to, named after the event, so the way out reads the same on every
     screen one level inside an event. */
  label: string;
  onClick(): void;
  className: string;
};

export function BackLink({ label, onClick, className }: BackLinkProps) {
  return (
    <button className={className} type="button" onClick={onClick}>
      <svg aria-hidden="true" className="back-arrow" viewBox="0 0 16 16" fill="none"><path d="M13 8H3m4-4-4 4 4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" /></svg>
      {label}
    </button>
  );
}
