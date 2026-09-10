import { useEffect, useRef, useState } from 'react';

/* Three vertices covering the viewport, built from gl_VertexID so no buffer is needed. */
const VERTEX = `#version 300 es
void main() { vec2 corner = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2); gl_Position = vec4(corner * 2. - 1., 0., 1.); }`;

const FRAGMENT = `#version 300 es
precision highp float;

uniform float iTime;
uniform vec2 iResolution;
out vec4 fragColor;

#define TAU 6.283185307179586
#define WEDGES 20.
#define RINGS 6.
#define TWIST .9
#define SPEED .7
#define REACH .3
#define DRIFT .35
#define CREAM vec3(.957, .937, .902)
#define ALPHA .55

/* Lateral drift of the tunnel. Straight at the start, easing in over the first few seconds. */
vec2 tunnelPath(float x) {
  vec2 offs = vec2(
    .2 * sin(TAU * x * .5) + .4 * sin(TAU * x * .2 + .3),
    .3 * cos(TAU * x * .3) + .2 * cos(TAU * x * .1)
  );
  return offs * DRIFT * smoothstep(1., 4., x);
}

/* Box-filtered checkerboard. Cells finer than a pixel settle at .5 instead of aliasing.
   Widths arrive analytically rather than from fwidth, which would blow up on the atan
   seam and draw a hairline out of the throat. */
float checker(vec2 q, vec2 w) {
  w += .001;
  vec2 edge = 2. * (abs(fract((q - .5 * w) * .5) - .5) - abs(fract((q + .5 * w) * .5) - .5)) / w;
  return .5 - .5 * edge.x * edge.y;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - .5 * iResolution) / iResolution.y;
  float camZ = iTime * SPEED;
  /* Screen radius reads as distance ahead, so one pass through the path bends the tunnel:
     near the rim the offset cancels out, far down the throat it is the full drift. */
  vec2 p = uv + tunnelPath(camZ + REACH / max(length(uv), .001)) - tunnelPath(camZ);
  float r = max(length(p), .001);
  float z = camZ + REACH / r;
  float pixel = 1. / iResolution.y;
  float dz = REACH / (r * r) * pixel;
  /* Twisting the angle by depth turns concentric rings into the swirl. */
  float shade = checker(
    vec2(z * RINGS, (atan(p.y, p.x) + z * TWIST) * WEDGES / TAU),
    vec2(RINGS * dz, WEDGES / TAU * (pixel / r + TWIST * dz))
  );
  /* Premultiplied, so the page composites this without a blend stage of its own. */
  float alpha = clamp(shade, 0., 1.) * ALPHA;
  fragColor = vec4(CREAM * alpha, alpha);
}`;

const MAX_DPR = 2;
/* The reference loop advances time at half rate; kept so the fall reads as a drift, not a rush. */
const TIME_SCALE = .5;

function buildProgram(gl: WebGL2RenderingContext) {
  const program = gl.createProgram();
  [[gl.VERTEX_SHADER, VERTEX], [gl.FRAGMENT_SHADER, FRAGMENT]].forEach(([type, source]) => {
    const shader = gl.createShader(type as number)!;
    gl.shaderSource(shader, source as string);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
  });
  gl.linkProgram(program);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  console.error('ReboundX tunnel shader failed to link:', gl.getProgramInfoLog(program));
  return null;
}

export function ReboundXTunnel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /* A canvas we cannot draw into still composites whatever the driver left in it, which reads as a
     white blob over the hero. Dropping the element is the only way to fall back to the gradient. */
  const [lost, setLost] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl2', { alpha: true, antialias: false });
    if (!canvas || !gl) {
      setLost(true);
      return;
    }

    const program = buildProgram(gl);
    if (!program) {
      setLost(true);
      return;
    }

    /* Every pixel is rewritten by the one triangle, so no blending and no clear: with
       either, frames drawn while the canvas is not composited would pile up and saturate. */
    gl.useProgram(program);
    const timeAt = gl.getUniformLocation(program, 'iTime');
    const resolutionAt = gl.getUniformLocation(program, 'iResolution');

    let elapsed = 0;
    let previous = 0;
    let frame = 0;

    const draw = () => {
      gl.uniform1f(timeAt, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      // Effect replay creates a fresh program, even when the canvas size is unchanged.
      // Uniforms belong to that program and must always be initialized before drawing.
      gl.viewport(0, 0, width, height);
      gl.uniform2f(resolutionAt, width, height);
      draw();
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      elapsed += (previous ? now - previous : 0) * .001 * TIME_SCALE;
      previous = now;
      draw();
    };

    const stillMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    /* A hidden tab or a reader who asked for stillness gets the frame that is already drawn. */
    const sync = () => {
      const running = !stillMotion.matches && !document.hidden;
      if (running === Boolean(frame)) return;
      if (running) {
        previous = 0;
        frame = requestAnimationFrame(tick);
        return;
      }
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const drop = (contextEvent: Event) => {
      contextEvent.preventDefault();
      setLost(true);
    };
    canvas.addEventListener('webglcontextlost', drop);

    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
    observer?.observe(canvas);
    resize();
    sync();

    stillMotion.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);

    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener('webglcontextlost', drop);
      observer?.disconnect();
      stillMotion.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
      gl.deleteProgram(program);
    };
  }, []);

  if (lost) return null;
  return <canvas className="reboundx-hero__tunnel" ref={canvasRef} aria-hidden="true" />;
}
