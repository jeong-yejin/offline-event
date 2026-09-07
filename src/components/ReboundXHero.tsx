const WEDGES = 20;
const RINGS = 17;
const THROAT = 6;
const EDGE = 600;
const TWIST = 5;
const SPAN = 360 / WEDGES;
const RATIO = (EDGE / THROAT) ** (1 / RINGS);

function point(radius: number, degrees: number) {
  const angle = (degrees * Math.PI) / 180;
  return `${(radius * Math.cos(angle)).toFixed(1)} ${(radius * Math.sin(angle)).toFixed(1)}`;
}

function cell(innerRadius: number, outerRadius: number, start: number, end: number) {
  return `M${point(outerRadius, start)}A${outerRadius} ${outerRadius} 0 0 1 ${point(outerRadius, end)}L${point(innerRadius, end)}A${innerRadius} ${innerRadius} 0 0 0 ${point(innerRadius, start)}Z`;
}

const CELLS = Array.from({ length: RINGS }, (_, ring) => ring).flatMap((ring) => {
  const innerRadius = THROAT * RATIO ** ring;
  const turn = ring * TWIST;

  return Array.from({ length: WEDGES }, (_, wedge) => wedge)
    .filter((wedge) => (ring + wedge) % 2 === 0)
    .map((wedge) => cell(innerRadius, innerRadius * RATIO, turn + wedge * SPAN, turn + (wedge + 1) * SPAN));
});

function ReboundXTunnel() {
  return (
    <svg className="reboundx-tunnel" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {CELLS.map((path) => <path d={path} key={path} />)}
    </svg>
  );
}

export function ReboundXHero() {
  return (
    <section className="reboundx-hero" aria-labelledby="reboundx-hero-title">
      <div className="reboundx-hero__tunnel" aria-hidden="true"><ReboundXTunnel /></div>
      <h1 id="reboundx-hero-title" className="reboundx-hero__title">
        <img src="/assets/logo.png" alt="ReboundX in Wonderland" width="660" height="396" />
      </h1>
      <div className="reboundx-hero__copy">
        <p className="reboundx-hero__lede">거래소·체인·프로토콜 8팀의 피치부터 실시간 트레이딩 컴피티션과 VIP 포커 나이트까지,<br />단 하루 저녁에만 이상한 나라가 열려요.</p>
        <p className="reboundx-hero__suits" aria-hidden="true"><span>♠</span> <span>♥</span> <span>♣</span> <span>♦</span></p>
        <dl className="reboundx-marquee">
          <div><dt>DATE</dt><dd>SEP 29 TUE</dd><dd>2026</dd></div>
          <div><dt>VENUE</dt><dd>SJ KUNSTHALLE</dd><dd>SEOUL</dd></div>
          <div><dt>DOORS</dt><dd>16:00</dd><dd>TILL 21:00</dd></div>
        </dl>
      </div>
    </section>
  );
}
