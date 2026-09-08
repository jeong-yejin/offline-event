import { ReboundXTunnel } from './ReboundXTunnel';

/* Opens the Wonderland tab under the page hero, so its heading needs an id of its own. */
export function WonderlandHero() {
  return (
    <section className="reboundx-hero" aria-labelledby="wonderland-hero-title">
      <ReboundXTunnel />
      <h1 id="wonderland-hero-title" className="reboundx-hero__title">
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
