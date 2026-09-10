import '@testing-library/jest-dom/vitest';

if (typeof HTMLCanvasElement !== 'undefined') {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: () => null,
  });
}

/* jsdom has no layout, so scrolling is a no-op here rather than a missing method. */
if (typeof Element !== 'undefined') {
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: () => {},
  });
}

/* jsdom answers no media query at all, so a component that asks for prefers-reduced-motion throws
   before it renders. Reduced motion is off here; a test that needs it on stubs matchMedia itself. */
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (media: string) => ({
      matches: false,
      media,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  });
}

/* jsdom ships <dialog> without its modal methods. Toggling the open attribute is what the tests
   read, so the stub does that and nothing else. */
if (typeof HTMLDialogElement !== 'undefined' && typeof HTMLDialogElement.prototype.showModal !== 'function') {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value(this: HTMLDialogElement) { this.open = true; },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value(this: HTMLDialogElement) { this.open = false; },
  });
}

/* jsdom has no viewport, so nothing ever intersects and a page built on reveal-on-scroll renders
   empty. Every observed element is reported visible once, which is where a real browser lands after
   the first paint. */
if (typeof window !== 'undefined' && !('IntersectionObserver' in window)) {
  class ImmediateIntersectionObserver {
    constructor(private readonly notify: IntersectionObserverCallback) {}
    observe(target: Element) {
      const entry = { isIntersecting: true, intersectionRatio: 1, target } as IntersectionObserverEntry;
      this.notify([entry], this as unknown as IntersectionObserver);
    }
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] { return []; }
  }
  Object.defineProperty(window, 'IntersectionObserver', { configurable: true, value: ImmediateIntersectionObserver });
}
