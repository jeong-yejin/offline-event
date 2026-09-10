import { ReboundXTunnel } from './ReboundXTunnel';
import type { Strings } from '../i18n/strings/wonderland';

/* The same door the trading section offers, lifted to the hero so the terminal is the first thing on offer. */
const TERMINAL_URL = 'https://reboundx.net/en/terminal-exchange/BINANCE/perp/BTCUSDT';

/* Opens the Wonderland tab under the page hero, so its heading needs an id of its own. */
export function WonderlandHero({ t }: { t: Strings }) {
  return (
    <section className="reboundx-hero reboundx-hero--wonderland" aria-labelledby="wonderland-hero-title">
      <ReboundXTunnel />
      <h1 id="wonderland-hero-title" className="reboundx-hero__title">
        <img src="/assets/logo.png" alt="ReboundX in Wonderland" width="660" height="396" />
      </h1>
      <div className="reboundx-hero__copy">
        <p className="reboundx-hero__lede">{t.wonderlandLedeTop}<br />{t.wonderlandLedeBottom}</p>
        <p className="reboundx-hero__suits" aria-hidden="true"><span>♠</span> <span>♥</span> <span>♣</span> <span>♦</span></p>
        <dl className="reboundx-marquee">
          <div><dt>DATE</dt><dd>SEP 29 TUE</dd><dd>2026</dd></div>
          <div><dt>VENUE</dt><dd>SJ KUNSTHALLE</dd><dd>SEOUL</dd></div>
          <div><dt>DOORS</dt><dd>16:00</dd><dd>TILL 21:00</dd></div>
        </dl>
        <a className="wonder-ticket" href={TERMINAL_URL} target="_blank" rel="noopener noreferrer">
          <span className="wonder-ticket__label">Drink Me!</span>
          <span className="wonder-ticket__sub">Open &rarr;</span>
        </a>
      </div>
    </section>
  );
}
