// @vitest-environment jsdom
import { StrictMode } from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ReboundXTunnel } from './ReboundXTunnel';

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it('initializes resolution for every shader program when StrictMode replays setup on the same canvas', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  const resolutions = new Map<object, number[]>();
  let program: object;
  const gl = {
    createProgram: () => ({}), createShader: () => ({}), shaderSource() {}, compileShader() {},
    attachShader() {}, deleteShader() {}, linkProgram() {}, getProgramParameter: () => true,
    useProgram: (value: object) => { program = value; }, getUniformLocation: () => ({}),
    uniform1f() {}, uniform2f: (_location: unknown, width: number, height: number) => { resolutions.set(program, [width, height]); },
    viewport() {}, drawArrays() {}, deleteProgram() {},
  };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(gl as unknown as WebGL2RenderingContext);
  render(<StrictMode><ReboundXTunnel /></StrictMode>);
  // Canvas dimensions survive effect cleanup; shader uniforms do not.
  expect(resolutions.size).toBe(2);
  for (const [width, height] of resolutions.values()) {
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  }
});
