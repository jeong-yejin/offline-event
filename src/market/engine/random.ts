/* Lehmer/LCG. Deterministic from its seed, so replaying a seed replays the market. Consecutive
   seeds hand back nearly the same first draw, which is why callers walk one stream rather than
   counting seeds up. */
export function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
}
