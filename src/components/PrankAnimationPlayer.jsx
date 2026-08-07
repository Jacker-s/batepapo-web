import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Lottie from 'lottie-react';

export default function PrankAnimationPlayer({ spec, size, style }) {
  const visualSize = size || spec?.size || 320;

  if (!spec) return null;

  if (spec.lottieJson) {
    return (
      <div style={{ width: visualSize, height: visualSize, ...style }}>
        <Lottie
          animationData={spec.lottieJson}
          loop={Boolean(spec.loop)}
          autoplay
          style={{ width: '100%', height: '100%' }}
          rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
        />
      </div>
    );
  }

  if (spec.dotLottieUrl) {
    return (
      <div
        style={{
          width: visualSize,
          height: visualSize,
          ...style
        }}
      >
        <DotLottieReact
          src={spec.dotLottieUrl}
          autoplay
          loop={Boolean(spec.loop)}
          speed={spec.speed || 1}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    );
  }

  return null;
}
