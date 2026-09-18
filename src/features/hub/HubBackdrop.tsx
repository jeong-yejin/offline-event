import DigitalRain from '../../components/DigitalRain';
import { ReboundXTunnel } from '../../components/ReboundXTunnel';
import { HeroSplineBackground } from '../../components/HeroSplineBackground';

export function HubBackdrop({ active, visible }: { active: number; visible: boolean }) {
  return (
      <div className="hub-backdrop" aria-hidden="true">
        {visible && (active === 0 ? <DigitalRain headColor="#D9FFD9" trailColor="#00E23E" density={56} trail={38} /> : active === 1 ? <ReboundXTunnel /> : null)}
        {visible && <div className="hub-spline-layer" style={{ visibility: active === 2 ? 'visible' : 'hidden' }}><HeroSplineBackground /></div>}
        {/* Last, so it falls across whichever scene is running rather than under it. It is three
            gradients and no script, so unlike the scenes above it is not gated on visibility. */}
        <div className="hub-lamp" />
      </div>
  );
}
