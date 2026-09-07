import { useEffect, useRef, type CSSProperties } from 'react';

const DEFAULTS = {
  headColor: '#FFFFFF',
  trailColor: '#CFFF4B',
  glyphSize: 10,
  speed: 8,
  angle: 0,
  density: 50,
  trail: 18,
  glyphs: 'ｱｲｳｴｵｶｷｸ0123456789ABCDEFｸｿﾝ',
  shuffle: true,
  shuffleGlyphs: 'ｱｲｳｴｵｶｷｸ0123456789ABCDEFｸｿﾝ',
};

const MIN_BURNOUT = 0.75;
const CROSSING_SHARE = 0.35;
const MIN_RELEASE = 0.3;
const MAX_RELEASE = 0.8;
const FLICKER_CHANCE = 0.55;
const TRAIL_FALLOFF = 1.9;

type DigitalRainProps = {
  headColor?: string;
  trailColor?: string;
  glyphSize?: number;
  speed?: number;
  angle?: number;
  density?: number;
  trail?: number;
  glyphs?: string;
  shuffle?: boolean;
  shuffleGlyphs?: string;
  style?: CSSProperties;
};

type Stream = {
  y: number;
  rate: number;
  burnout: number;
  alpha: number;
  lastRow: number;
};

type Column = {
  streams: Stream[];
  releaseAt: number;
  glyphs: string[];
};

export default function DigitalRain({
  headColor = DEFAULTS.headColor,
  trailColor = DEFAULTS.trailColor,
  glyphSize = DEFAULTS.glyphSize,
  speed = DEFAULTS.speed,
  angle = DEFAULTS.angle,
  density = DEFAULTS.density,
  trail = DEFAULTS.trail,
  glyphs = DEFAULTS.glyphs,
  shuffle = DEFAULTS.shuffle,
  shuffleGlyphs = DEFAULTS.shuffleGlyphs,
  style,
}: DigitalRainProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    const wrapElement: HTMLDivElement = wrap;
    const canvasElement: HTMLCanvasElement = canvas;
    const context: CanvasRenderingContext2D = ctx;

    const source = shuffle ? shuffleGlyphs || DEFAULTS.shuffleGlyphs : glyphs || DEFAULTS.glyphs;
    const chars = [...source];
    const pick = () => chars[Math.floor(Math.random() * chars.length)] ?? '';
    const rad = (angle * Math.PI) / 180;
    const rate = speed * glyphSize;
    const gap = glyphSize * (1 + (50 - density) / 12);
    const tailLength = Math.max(1, Math.round(trail));

    let alive = true;
    let raf = 0;
    let last = 0;
    let width = 0;
    let height = 0;
    let span = 0;
    let columns: Column[] = [];

    function spawn(y: number): Stream {
      return {
        y,
        rate: rate * (0.75 + Math.random() * 0.5),
        burnout: Math.random() < CROSSING_SHARE ? Infinity : MIN_BURNOUT + Math.random() * (1 - MIN_BURNOUT),
        alpha: 1,
        lastRow: -Infinity,
      };
    }

    function nextRelease() {
      return span * (MIN_RELEASE + Math.random() * (MAX_RELEASE - MIN_RELEASE));
    }

    function layout() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = wrapElement.clientWidth || 360;
      height = wrapElement.clientHeight || 320;
      canvasElement.width = Math.round(width * dpr);
      canvasElement.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      span = Math.hypot(width, height);
      const columnCount = Math.max(1, Math.ceil(span / gap));
      const rows = Math.ceil(span / glyphSize) + 2;
      columns = Array.from({ length: columnCount }, () => ({
        streams: [spawn(Math.random() * span)],
        releaseAt: nextRelease(),
        glyphs: Array.from({ length: rows }, pick),
      }));
    }

    function draw(dt: number) {
      context.clearRect(0, 0, width, height);
      context.save();
      context.translate(width / 2, height / 2);
      context.rotate(rad);
      // The film's glyphs read mirrored. Flipping the whole field costs one transform
      // instead of a save/restore around every fillText.
      context.scale(-1, 1);
      context.font = `${glyphSize}px ui-monospace, Menlo, monospace`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.shadowColor = headColor;

      const lead = tailLength * glyphSize;
      columns.forEach((column, index) => {
        const x = -span / 2 + index * gap + gap / 2;

        column.streams.forEach((stream) => {
          stream.y += stream.rate * dt;
          if (stream.burnout !== Infinity && stream.y / span > stream.burnout) stream.alpha -= dt * 1.5;

          // Snapping to the row grid makes the head step cell to cell the way the
          // film does, instead of sliding through sub-pixel positions.
          const headRow = Math.floor(stream.y / glyphSize);
          const columnAlpha = Math.max(0, Math.min(1, stream.alpha));

          // The head writes a new glyph on every row it steps onto, so characters are
          // created by the fall rather than lit up where they already sat.
          if (headRow !== stream.lastRow) {
            if (headRow >= 0 && headRow < column.glyphs.length) column.glyphs[headRow] = pick();
            stream.lastRow = headRow;
          }

          if (shuffle && Math.random() < FLICKER_CHANCE) {
            const row = headRow - Math.floor(Math.random() * tailLength);
            if (row >= 0 && row < column.glyphs.length) column.glyphs[row] = pick();
          }

          for (let i = 0; i < tailLength; i++) {
            const row = headRow - i;
            if (row < 0 || row >= column.glyphs.length) continue;
            const taper = i === 0 ? 1 : Math.pow(1 - i / tailLength, TRAIL_FALLOFF);
            context.globalAlpha = columnAlpha * taper;
            context.fillStyle = i === 0 ? headColor : trailColor;
            context.shadowBlur = i === 0 ? glyphSize : 0;
            context.fillText(column.glyphs[row], x, -span / 2 + row * glyphSize);
          }
        });

        column.streams = column.streams.filter((stream) => stream.alpha > 0 && stream.y - lead <= span);
        const newest = column.streams[column.streams.length - 1];
        if (!newest || newest.y >= column.releaseAt) {
          column.streams.push(spawn(-lead));
          column.releaseAt = nextRelease();
        }
      });

      context.globalAlpha = 1;
      context.shadowBlur = 0;
      context.restore();
    }

    function loop(time: number) {
      if (!alive) return;
      const dt = last ? Math.min((time - last) / 1000, 0.05) : 1 / 60;
      last = time;
      draw(dt);
      raf = requestAnimationFrame(loop);
    }

    layout();
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(layout);
    resizeObserver?.observe(wrapElement);
    raf = requestAnimationFrame(loop);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      resizeObserver?.disconnect();
    };
  }, [angle, density, glyphSize, glyphs, headColor, shuffle, shuffleGlyphs, speed, trail, trailColor]);

  return (
    <div ref={wrapRef} aria-hidden="true" style={{ position: 'relative', overflow: 'hidden', ...style }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
