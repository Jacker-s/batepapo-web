import { useEffect, useState } from 'react';
import PrankAnimationPlayer from './PrankAnimationPlayer';
import { getPrankAnimationSpec } from '../lib/pranks';

export default function RoomAnimationOverlay({ animationType, localeTag, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const spec = getPrankAnimationSpec(animationType, localeTag);

  useEffect(() => {
    if (!animationType || !spec) return undefined;
    setVisible(true);
    const hideTimer = window.setTimeout(() => setVisible(false), 5500);
    const dismissTimer = window.setTimeout(() => onDismiss?.(), 6000);
    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(dismissTimer);
    };
  }, [animationType, spec, onDismiss]);

  if (!animationType || !spec) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 160,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.88)',
        transition: 'opacity 0.5s ease, transform 0.5s ease'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <PrankAnimationPlayer spec={spec} />
        {spec.message && (
          <div
            style={{
              marginTop: '20px',
              borderRadius: '28px',
              padding: '16px 22px',
              background: `linear-gradient(180deg, ${spec.accent}42, rgba(0,0,0,0.72))`,
              textAlign: 'center',
              boxShadow: '0 18px 48px rgba(0,0,0,0.35)',
              maxWidth: 'min(88vw, 420px)'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '1.8px', color: spec.accent, textTransform: 'uppercase' }}>
              {spec.label}
            </div>
            <div style={{ marginTop: '6px', fontSize: '20px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', lineHeight: 1.2 }}>
              {spec.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

