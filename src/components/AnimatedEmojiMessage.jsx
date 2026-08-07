import React, { useEffect, useMemo, useRef, useState } from 'react';
import Lottie from 'lottie-react';
import { getAnimatedEmojiEffectEmojis, getAnimatedEmojiUrl } from '../lib/animatedEmoji';

class AnimatedEmojiErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {}

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function AnimatedEmojiMessage({ emoji, size = 100 }) {
  const [animationData, setAnimationData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [particles, setParticles] = useState([]);
  const particleIdRef = useRef(0);
  const url = useMemo(() => getAnimatedEmojiUrl(emoji), [emoji]);

  useEffect(() => {
    let cancelled = false;
    setAnimationData(null);
    setFailed(false);

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error('animated emoji unavailable');
        }
        return response.json();
      })
      .then((data) => {
        if (!cancelled) {
          setAnimationData(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    if (!pressed) return undefined;
    const reset = window.setTimeout(() => {
      setPressed(false);
      setRotation(0);
    }, 520);
    return () => window.clearTimeout(reset);
  }, [pressed]);

  useEffect(() => {
    if (!particles.length) return undefined;
    const cleanup = window.setTimeout(() => {
      setParticles((current) => current.slice(-2));
    }, 1050);
    return () => window.clearTimeout(cleanup);
  }, [particles]);

  const handleTap = () => {
    const effectEmojis = getAnimatedEmojiEffectEmojis(emoji);
    const nextParticles = Array.from({ length: 10 }, (_, index) => ({
      id: particleIdRef.current++,
      emoji: effectEmojis[Math.floor(Math.random() * effectEmojis.length)] || '✨',
      angle: Math.random() * Math.PI * 2,
      distance: 56 + Math.random() * 64,
      rotate: -180 + Math.random() * 360,
      scale: 0.6 + Math.random() * 0.7,
      delay: index * 12
    }));
    setParticles(nextParticles);
    setPressed(true);
    setRotation(-20 + Math.random() * 40);
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(12);
    }
  };

  return (
    <div
      className="animated-emoji-helper"
      style={{
        width: size * 1.4,
        height: size * 1.4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        position: 'relative'
      }}
    >
      {particles.map((particle) => (
        <span
          key={particle.id}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            fontSize: '22px',
            lineHeight: 1,
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
            animation: `emoji-particle-burst 1000ms cubic-bezier(.19,1,.22,1) ${particle.delay}ms forwards`,
            '--emoji-dx': `${Math.cos(particle.angle) * particle.distance}px`,
            '--emoji-dy': `${Math.sin(particle.angle) * particle.distance}px`,
            '--emoji-rot': `${particle.rotate}deg`,
            '--emoji-scale': particle.scale
          }}
        >
          {particle.emoji}
        </span>
      ))}
      <div
        className="animated-emoji-helper-core"
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${pressed ? 1.16 : 1}) rotate(${rotation}deg)`,
          transition: 'transform 160ms cubic-bezier(.2,.9,.2,1.25)',
          cursor: 'pointer'
        }}
        onClick={handleTap}
        onContextMenu={(event) => event.preventDefault()}
      >
        {!failed && animationData ? (
          <AnimatedEmojiErrorBoundary
            fallback={
              <span
                style={{
                  fontSize: `${size * 0.62}px`,
                  lineHeight: 1,
                  display: 'inline-block'
                }}
              >
                {emoji}
              </span>
            }
          >
            <Lottie
              animationData={animationData}
              loop
              autoplay
              style={{ width: '100%', height: '100%' }}
              rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
            />
          </AnimatedEmojiErrorBoundary>
        ) : (
          <span
            style={{
              fontSize: `${size * 0.62}px`,
              lineHeight: 1,
              display: 'inline-block'
            }}
          >
            {emoji}
          </span>
        )}
      </div>
    </div>
  );
}
