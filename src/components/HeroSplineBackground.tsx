import { lazy, Suspense, useEffect, useState } from 'react';

/* Code export rather than a viewer link, so the scene draws into a canvas in this page. The viewer link
   (`my.spline.design/<slug>/`) only works as a top-level page: framed, it loads and paints its watermark
   but never renders the canvas, in any browser we tried. */
const SCENE = 'https://prod.spline.design/bzE7kJS5BQNYI0uX/scene.splinecode';

/* The runtime is around half a megabyte, so it loads on its own after the hero copy is already up. */
const Spline = lazy(() => import('@splinetool/react-spline'));

/* Two reasons to skip the scene: the reader asked for less motion, or the browser cannot draw WebGL and
   would give us an empty canvas after that download. The WebGL probe also keeps the scene out of the
   test run, since jsdom has no context to hand back. */
const canDrawScene = () => {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
};

/* Decorative backdrop for the TOKEN2049 hero, in the slot the digital rain uses on every other event.
   `aria-hidden` is what earns it the shared `.hero > [aria-hidden='true']` sizing and the reduced-motion
   rule that hides hero backdrops outright. */
export function HeroSplineBackground() {
  const [draw, setDraw] = useState(false);

  useEffect(() => { setDraw(canDrawScene()); }, []);

  return (
    <div className="hero-spline" aria-hidden="true">
      {draw ? <Suspense fallback={null}><Spline scene={SCENE} /></Suspense> : null}
    </div>
  );
}
