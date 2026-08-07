import { useEffect } from 'react';
import { useAppRuntime } from '../context/AppRuntimeContext';

const SLOT_BY_PLACEMENT = {
  room_list_banner: '3434182855',
  room_list_native: '3434182855',
  chat_inline: '3434182855',
  chat_list_banner: '3434182855',
  private_chat_inline: '3434182855'
};

export default function AdSenseBlock({
  placement = 'room_list_banner',
  label,
  minHeight = 110,
  style
}) {
  const { shouldShowAds, t } = useAppRuntime();

  useEffect(() => {
    if (!shouldShowAds) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, [placement, shouldShowAds]);

  if (!shouldShowAds) return null;

  return (
    <div
      style={{
        margin: '14px 0',
        padding: '12px',
        borderRadius: '22px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
        minHeight,
        overflow: 'hidden',
        ...style
      }}
    >
      <div
        style={{
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '1.8px',
          color: 'rgba(255,255,255,0.35)',
          marginBottom: '10px',
          fontWeight: 800
        }}
      >
        {label || t('sponsored')}
      </div>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-7931782163570852"
        data-ad-slot={SLOT_BY_PLACEMENT[placement] || SLOT_BY_PLACEMENT.room_list_banner}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
