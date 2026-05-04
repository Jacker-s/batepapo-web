import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../firebase';
import { Globe, Heart, X } from 'lucide-react';

export default function StickerPicker({ onSelect, onClose }) {
  const [activeTab, setActiveTab] = useState('global');
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStickers = async () => {
      setLoading(true);
      try {
        const snapshot = await get(ref(database, 'stickers'));
        if (snapshot.exists()) {
          const data = snapshot.val();
          // Assuming it's an object or array of URLs
          const urls = Object.values(data);
          setStickers(urls);
        }
      } catch (err) {
        console.error("Erro ao carregar stickers", err);
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === 'global') fetchStickers();
  }, [activeTab]);

  return (
    <div style={{
      position: 'absolute', bottom: '80px', left: '16px', right: '16px', 
      backgroundColor: 'var(--bg-secondary)', borderRadius: '24px', 
      border: '1px solid var(--separator)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      height: '300px', display: 'flex', flexDirection: 'column', zIndex: 50,
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--separator)', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            onClick={() => setActiveTab('global')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: activeTab === 'global' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'global' ? 'bold' : 'normal', cursor: 'pointer' }}
          >
            <Globe size={18} /> Global
          </button>
          <button 
            onClick={() => setActiveTab('minhas')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: activeTab === 'minhas' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'minhas' ? 'bold' : 'normal', cursor: 'pointer' }}
          >
            <Heart size={18} /> Minhas
          </button>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '12px', alignContent: 'start' }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', marginTop: '20px' }}>Carregando...</div>
        ) : stickers.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', marginTop: '20px' }}>Nenhum sticker encontrado.</div>
        ) : (
          stickers.map((url, i) => (
            <div 
              key={i} 
              onClick={() => onSelect(url)}
              style={{ aspectRatio: '1', cursor: 'pointer', borderRadius: '8px', overflow: 'hidden' }}
            >
              <img src={url} alt="sticker" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
