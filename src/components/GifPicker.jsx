import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader } from 'lucide-react';

// Giphy public beta key (development / demo)
const GIPHY_KEY = 'dc6zaTOxFJmzC';
const GIPHY_BASE = 'https://api.giphy.com/v1/gifs';

export default function GifPicker({ onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);
  const LIMIT = 24;

  // Load trending on open
  useEffect(() => {
    fetchGifs('', 0, true);
  }, []);

  // Debounced search when query changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchGifs(query, 0, true);
    }, 450);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Close on click outside
  useEffect(() => {
    const handle = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose]);

  const fetchGifs = async (q, off, reset) => {
    setLoading(true);
    try {
      const endpoint = q
        ? `${GIPHY_BASE}/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(q)}&limit=${LIMIT}&offset=${off}&rating=r&lang=pt`
        : `${GIPHY_BASE}/trending?api_key=${GIPHY_KEY}&limit=${LIMIT}&offset=${off}&rating=r`;

      const res = await fetch(endpoint);
      const data = await res.json();

      const parsed = (data.data || []).map(g => ({
        id: g.id,
        url: g.images?.original?.url || g.images?.downsized?.url,
        preview: g.images?.fixed_width_small?.url || g.images?.downsized_small?.mp4 || g.images?.fixed_width?.url,
        title: g.title
      })).filter(g => g.url && g.preview);

      setGifs(reset ? parsed : prev => [...prev, ...parsed]);
      setOffset(off + LIMIT);
      setHasMore((data.pagination?.total_count || 0) > off + LIMIT);
    } catch (e) {
      console.error('Giphy error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        bottom: '70px',
        left: '16px',
        width: '340px',
        maxHeight: '420px',
        background: '#15151d',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '18px',
        boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 60,
        overflow: 'hidden'
      }}
    >
      {/* Header / Search */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0,
        background: 'rgba(255,255,255,0.02)'
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{
            position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
            color: 'rgba(255,255,255,0.3)', pointerEvents: 'none'
          }} />
          <input
            autoFocus
            type="text"
            placeholder="Buscar GIFs no Giphy..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%', padding: '8px 10px 8px 32px',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none'
            }}
          />
        </div>
        <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0, padding: '4px' }}>
          <X size={18} />
        </button>
      </div>

      {/* Giphy badge */}
      <div style={{
        padding: '4px 14px 2px',
        fontSize: '9px', fontWeight: 800, letterSpacing: '1.5px',
        color: 'rgba(255,255,255,0.18)',
        display: 'flex', alignItems: 'center', gap: '4px'
      }}>
        Powered by GIPHY
      </div>

      {/* Grid */}
      <div style={{
        overflowY: 'auto', flex: 1, padding: '8px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '5px',
        alignContent: 'start'
      }}>
        {gifs.map(gif => (
          <div
            key={gif.id}
            onClick={() => { onSelect(gif.url); onClose(); }}
            title={gif.title}
            style={{
              borderRadius: '10px', overflow: 'hidden', cursor: 'pointer',
              aspectRatio: '1', background: 'rgba(255,255,255,0.05)',
              transition: 'transform 0.15s, opacity 0.15s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.outline = '2px solid var(--primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.outline = 'none';
            }}
          >
            <img
              src={gif.preview}
              alt={gif.title || 'gif'}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        ))}

        {/* Loading spinner */}
        {loading && (
          <div style={{
            gridColumn: '1/-1', display: 'flex', justifyContent: 'center',
            alignItems: 'center', padding: '24px', gap: '8px',
            color: 'rgba(255,255,255,0.4)', fontSize: '13px'
          }}>
            <Loader size={18} color="var(--primary)" style={{ animation: 'gifSpin 0.7s linear infinite' }} />
            Carregando...
          </div>
        )}

        {/* Load more */}
        {!loading && hasMore && gifs.length > 0 && (
          <button
            onClick={() => fetchGifs(query, offset, false)}
            style={{
              gridColumn: '1/-1', padding: '10px',
              background: 'rgba(255,42,104,0.08)',
              border: '1px solid rgba(255,42,104,0.2)',
              borderRadius: '10px', color: 'var(--primary)',
              fontWeight: 700, fontSize: '12px', cursor: 'pointer',
              marginTop: '4px'
            }}
          >
            Carregar mais
          </button>
        )}

        {/* Empty */}
        {!loading && gifs.length === 0 && (
          <div style={{
            gridColumn: '1/-1', textAlign: 'center',
            padding: '40px 0', color: 'rgba(255,255,255,0.25)', fontSize: '13px'
          }}>
            {query ? 'Nenhum GIF encontrado para esta busca' : 'Não foi possível carregar GIFs'}
          </div>
        )}
      </div>

      <style>{`
        @keyframes gifSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
