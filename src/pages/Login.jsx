import { useState, useEffect } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { ref, set, get, serverTimestamp } from 'firebase/database';
import { auth, database } from '../firebase';
import { LogIn, Check, RefreshCw, CheckCircle, AlertCircle, X } from 'lucide-react';

const uolColors = [
  "#000000", "#FF0000", "#0000FF", "#008000", 
  "#FF00FF", "#800080", "#FFA500", "#A52A2A"
];

const shortAvatars = [
  "https://api.dicebear.com/7.x/avataaars/png?seed=Jack",
  "https://api.dicebear.com/7.x/avataaars/png?seed=George",
  "https://api.dicebear.com/7.x/avataaars/png?seed=Caleb",
  "https://api.dicebear.com/7.x/adventurer/png?seed=James",
  "https://api.dicebear.com/7.x/adventurer/png?seed=Arthur",
  "https://api.dicebear.com/7.x/open-peeps/png?seed=Robert",
  "https://api.dicebear.com/7.x/open-peeps/png?seed=Steve",
  "https://api.dicebear.com/7.x/personas/png?seed=Paul"
];

const generateAvatars = () => {
  const list = [];
  const collections = ["avataaars", "adventurer", "open-peeps", "personas", "bottts", "pixel-art", "lorelei", "notionists"];
  collections.forEach(coll => {
    for(let i=1; i<=8; i++) list.add(`https://api.dicebear.com/7.x/${coll}/png?seed=${coll}${i}`);
  });
  list.push("https://api.dicebear.com/7.x/big-smile/png?seed=S1");
  list.push("https://api.dicebear.com/7.x/big-smile/png?seed=S2");
  list.push("https://api.dicebear.com/7.x/fun-emoji/png?seed=E1");
  list.push("https://api.dicebear.com/7.x/fun-emoji/png?seed=E2");
  return list;
};

// Instead of `.add`, arrays use `.push`
const allAvatars = (() => {
  const list = [];
  const collections = ["avataaars", "adventurer", "open-peeps", "personas", "bottts", "pixel-art", "lorelei", "notionists"];
  collections.forEach(coll => {
    for(let i=1; i<=8; i++) list.push(`https://api.dicebear.com/7.x/${coll}/png?seed=${coll}${i}`);
  });
  return list;
})();

function isColorDark(color) {
  // basic hex to rgb
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 128;
}

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [selectedChatColor, setSelectedChatColor] = useState('#000000');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState('');
  const [showAvatarGallery, setShowAvatarGallery] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [error, setError] = useState('');

  const generateRandomUsername = () => {
    const adjs = ["Lobo", "Tigre", "Ninja", "Fantasma", "Sombra", "Mestre", "Dragao", "Rei"];
    const nouns = ["Negro", "Branco", "Oculto", "Veloz", "Supremo", "Feroz", "Mortal", "Anonimo"];
    const adj = adjs[Math.floor(Math.random() * adjs.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 900) + 100;
    setUsername(`${adj}${noun}${num}`);
    setIsAvailable(null);
  };

  const checkAvailability = async () => {
    if (username.length < 3) return;
    setIsChecking(true);
    try {
      const cleanName = username.trim().toLowerCase();
      const snapshot = await get(ref(database, `users/${cleanName}`));
      if (snapshot.exists()) {
        // Only valid if it belongs to me (auth uid)
        // Wait, if not authenticated yet, we assume it's taken unless it's ours after login.
        // For pre-login check, we just say it's taken.
        setIsAvailable(false);
      } else {
        setIsAvailable(true);
      }
    } catch (e) {
      setIsAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (username.length < 3) {
      setError('O nome deve ter pelo menos 3 caracteres');
      return;
    }

    const cleanNickname = username.trim().toLowerCase();
    setLoading(true);
    setError('');

    try {
      let user;
      if (!auth.currentUser) {
         const userCredential = await signInAnonymously(auth);
         user = userCredential.user;
      } else {
         user = auth.currentUser;
      }

      const usernameRef = ref(database, `users/${cleanNickname}`);
      const snapshot = await get(usernameRef);

      if (!snapshot.exists()) {
        await set(usernameRef, {
          uid: user.uid,
          name: cleanNickname,
          isOnline: true,
          presenceStatus: 'Online',
          status: 'Olá! Estou usando o Secret.',
          chatColor: selectedChatColor,
          photoUrl: selectedAvatarUrl || null,
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp()
        });
        
        await set(ref(database, `uid_to_username/${user.uid}`), cleanNickname);
      } else {
        const existingData = snapshot.val();
        if (existingData.uid !== user.uid) {
           setError('Esse nome já está em uso.');
           setLoading(false);
           return;
        }
        // Update profile
        await set(ref(database, `users/${cleanNickname}/chatColor`), selectedChatColor);
        if (selectedAvatarUrl) {
          await set(ref(database, `users/${cleanNickname}/photoUrl`), selectedAvatarUrl);
        }
        await set(ref(database, `users/${cleanNickname}/isOnline`), true);
        await set(ref(database, `users/${cleanNickname}/lastActive`), serverTimestamp());
      }

      onLogin(cleanNickname);
    } catch (err) {
      console.error(err);
      setError('Erro ao entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen" style={{ overflowY: 'auto' }}>
      <div className="login-card animate-fade-in" style={{ padding: '32px 24px', maxWidth: '400px', width: '90%', margin: '40px auto' }}>
        <h1 className="login-logo" style={{ marginBottom: '8px' }}>Bate Papo Anônimo</h1>
        <p className="login-subtitle" style={{ fontSize: '13px', marginBottom: '24px' }}>
          Conecte-se com pessoas novas de forma segura e divertida. Escolha seu visual abaixo!
        </p>
        
        <div style={{ textAlign: 'left', marginBottom: '24px' }}>
          <div style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '12px' }}>Escolha sua Cor de Texto</div>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
            {uolColors.map(color => (
              <div 
                key={color} 
                onClick={() => setSelectedChatColor(color)}
                style={{ 
                  minWidth: '40px', height: '40px', borderRadius: '50%', backgroundColor: color, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  border: selectedChatColor === color ? '3px solid var(--primary)' : 'none'
                }}
              >
                {selectedChatColor === color && <Check size={20} color={isColorDark(color) ? '#FFF' : '#000'} />}
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'left', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Escolha seu Avatar</div>
            <button onClick={() => setShowAvatarGallery(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer' }}>
              Ver mais
            </button>
          </div>
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
            {shortAvatars.map(url => (
              <div 
                key={url} 
                onClick={() => setSelectedAvatarUrl(url)}
                style={{ 
                  minWidth: '70px', height: '70px', borderRadius: '50%', padding: '4px', cursor: 'pointer',
                  backgroundColor: selectedAvatarUrl === url ? 'rgba(255, 42, 104, 0.2)' : 'transparent',
                  border: selectedAvatarUrl === url ? '3px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <img src={url} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'left', marginBottom: '24px', backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255, 42, 104, 0.1)' }}>
          <div style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '12px' }}>Seu Nome Secreto</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Digite um nome..."
              value={username}
              onChange={(e) => {
                const val = e.target.value.replace('.', '');
                if (val.length <= 20) {
                   setUsername(val);
                   setIsAvailable(null);
                }
              }}
              style={{ flex: 1, margin: 0 }}
              disabled={loading}
            />
            <button 
              type="button" 
              onClick={generateRandomUsername}
              style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(255, 42, 104, 0.1)', color: 'var(--primary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <RefreshCw size={20} />
            </button>
          </div>
          
          {username.length >= 3 && (
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', fontSize: '12px' }}>
              {isChecking ? (
                <span style={{ color: 'var(--text-muted)' }}>Verificando...</span>
              ) : isAvailable === true ? (
                <><CheckCircle size={14} color="#4CAF50" style={{ marginRight: '4px' }} /> <span style={{ color: '#4CAF50' }}>Nome disponível</span></>
              ) : isAvailable === false ? (
                <><AlertCircle size={14} color="#F44336" style={{ marginRight: '4px' }} /> <span style={{ color: '#F44336' }}>Nome indisponível</span></>
              ) : (
                <button type="button" onClick={checkAvailability} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0 }}>
                  Verificar disponibilidade
                </button>
              )}
            </div>
          )}
        </div>

        {error && <div style={{ color: '#FF3B30', fontSize: '14px', marginBottom: '16px' }}>{error}</div>}

        <button onClick={handleLogin} className="btn-primary" disabled={loading} style={{ height: '56px', fontSize: '16px', letterSpacing: '1px' }}>
          {loading ? 'ENTRANDO...' : 'ENTRAR NO SECRET'}
        </button>
      </div>

      {showAvatarGallery && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: 'var(--primary)' }}>Galeria de Avatares</h2>
              <button onClick={() => setShowAvatarGallery(false)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '16px', overflowY: 'auto', flex: 1, paddingBottom: '20px' }}>
              {allAvatars.map(url => (
                <div 
                  key={url} 
                  onClick={() => { setSelectedAvatarUrl(url); setShowAvatarGallery(false); }}
                  style={{ 
                    aspectRatio: '1', borderRadius: '50%', padding: '4px', cursor: 'pointer',
                    backgroundColor: selectedAvatarUrl === url ? 'rgba(255, 42, 104, 0.2)' : 'transparent',
                    border: selectedAvatarUrl === url ? '3px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <img src={url} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
