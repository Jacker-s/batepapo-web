import { useMemo, useState } from 'react';
import { getMetaEmojiList, META_EMOJI_CATEGORIES } from '../lib/metaEmojiData';

const RECENTS_KEY = 'wappi_meta_emoji_recents';

function loadRecents() {
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function saveRecentEmoji(emoji) {
  const current = loadRecents().filter((item) => item !== emoji);
  const next = [emoji, ...current].slice(0, 48);
  window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  return next;
}

export default function MetaEmojiPickerWeb({ onEmojiClick, width = 300, height = 350 }) {
  const [category, setCategory] = useState('FACES');
  const [recents, setRecents] = useState(() => loadRecents());
  const emojis = useMemo(() => getMetaEmojiList(category, recents), [category, recents]);

  return (
    <div
      style={{
        width,
        height,
        borderRadius: '22px',
        overflow: 'hidden',
        background: 'rgba(14,18,28,0.96)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 18px 44px rgba(0,0,0,0.35)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '15px', fontWeight: 800, color: 'white' }}>
          {META_EMOJI_CATEGORIES.find((item) => item.key === category)?.label || 'Emojis'}
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>
          Mesmo conjunto base do app
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
          gap: '6px',
          alignContent: 'start'
        }}
      >
        {emojis.map((emoji) => (
          <button
            key={`${category}_${emoji}`}
            type="button"
            onClick={() => {
              const nextRecents = saveRecentEmoji(emoji);
              setRecents(nextRecents);
              onEmojiClick?.({ emoji });
            }}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '21px',
              transition: 'transform 0.15s ease, background 0.15s ease'
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.transform = 'scale(1.08)';
              event.currentTarget.style.background = 'rgba(255,255,255,0.11)';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = 'scale(1)';
              event.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }}
          >
            {emoji}
          </button>
        ))}
      </div>

      <div
        style={{
          padding: '10px',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          borderTop: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        {META_EMOJI_CATEGORIES.map((item) => {
          const active = item.key === category;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setCategory(item.key)}
              style={{
                minWidth: '40px',
                height: '34px',
                padding: '0 10px',
                borderRadius: '999px',
                background: active ? 'rgba(77,163,255,0.18)' : 'rgba(255,255,255,0.06)',
                color: active ? '#9fd4ff' : 'rgba(255,255,255,0.74)',
                fontSize: '17px',
                fontWeight: 700,
                flexShrink: 0
              }}
              title={item.label}
            >
              {item.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}
