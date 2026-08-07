import { useState, useEffect } from 'react';
import { signInAnonymously, signInWithEmailAndPassword, linkWithCredential, EmailAuthProvider } from 'firebase/auth';
import { ref, set, get, serverTimestamp } from 'firebase/database';
import { auth, database } from '../firebase';
import { LogIn, Check, RefreshCw, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useAppRuntime } from '../context/AppRuntimeContext';
import { checkWebBanStatus } from '../lib/banGuard';

function banErrorMessage(banCheck) {
  if (!banCheck?.banned) return '';
  if (banCheck.isTemporary) {
    const until = banCheck.expiresAt ? new Date(banCheck.expiresAt).toLocaleString() : '';
    return until
      ? `Sua conta esta suspensa temporariamente ate ${until}.`
      : 'Sua conta esta suspensa temporariamente.';
  }
  return 'Esta conta ou este IP foi banido permanentemente e nao pode usar o site.';
}

function NoAdsIcon({ size = 18, color = '#FFD700' }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Círculo Proibido */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        border: `2.5px solid ${color}`,
        boxSizing: 'border-box'
      }} />
      {/* Linha diagonal de banido */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '2.5px',
        background: color,
        transform: 'rotate(-45deg)',
        transformOrigin: 'center'
      }} />
      {/* Letras AD */}
      <span style={{
        fontSize: `${size * 0.4}px`,
        fontWeight: 900,
        color: color === '#ffffff' ? '#000000' : 'white',
        zIndex: 2,
        letterSpacing: '-0.5px',
        textShadow: color === '#ffffff' ? 'none' : '0px 0px 2px rgba(0,0,0,0.8)'
      }}>
        AD
      </span>
    </div>
  );
}

// ─── MD5 Pure JavaScript Implementation ──────────────────────────────────────
function md5(string) {
  function sub(x, y) {
    const lsw = (x & 0xFFFF) + (y & 0xFFFF);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
  }
  function rcls(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  function cmn(q, a, b, x, s, t) {
    return sub(rcls(sub(sub(a, q), sub(x, t)), s), b);
  }
  function ff(a, b, c, d, x, s, t) {
    return cmn((b & c) | ((~b) & d), a, b, x, s, t);
  }
  function gg(a, b, c, d, x, s, t) {
    return cmn((b & d) | (c & (~d)), a, b, x, s, t);
  }
  function hh(a, b, c, d, x, s, t) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a, b, c, d, x, s, t) {
    return cmn(c ^ (b | (~d)), a, b, x, s, t);
  }
  function str2bin(str) {
    const bin = [];
    const mask = (1 << 8) - 1;
    for (let i = 0; i < str.length * 8; i += 8) {
      bin[i >> 5] |= (str.charCodeAt(i / 8) & mask) << (i % 32);
    }
    return bin;
  }
  function bin2hex(bin) {
    const hex_tab = "0123456789abcdef";
    let str = "";
    for (let i = 0; i < bin.length * 4; i++) {
      str += hex_tab.charAt((bin[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) +
             hex_tab.charAt((bin[i >> 2] >> ((i % 4) * 8)) & 0xF);
    }
    return str;
  }
  
  let x = str2bin(string);
  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;
  
  for (let i = 0; i < x.length; i += 16) {
    let olda = a;
    let oldb = b;
    let oldc = c;
    let oldd = d;
    
    a = ff(a, b, c, d, x[i+0], 7, -680876936);
    d = ff(d, a, b, c, x[i+1], 12, -389564586);
    c = ff(c, d, a, b, x[i+2], 17,  606105819);
    b = ff(b, c, d, a, x[i+3], 22, -1044525330);
    a = ff(a, b, c, d, x[i+4], 7, -176418897);
    d = ff(d, a, b, c, x[i+5], 12,  1200080426);
    c = ff(c, d, a, b, x[i+6], 17, -1473231341);
    b = ff(b, c, d, a, x[i+7], 22, -45705983);
    a = ff(a, b, c, d, x[i+8], 7,  1770035416);
    d = ff(d, a, b, c, x[i+9], 12, -1958414417);
    c = ff(c, d, a, b, x[i+10], 17, -42063);
    b = ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = ff(a, b, c, d, x[i+12], 7,  1804603682);
    d = ff(d, a, b, c, x[i+13], 12, -40341101);
    c = ff(c, d, a, b, x[i+14], 17, -1502002290);
    b = ff(b, c, d, a, x[i+15], 22,  1236535329);
    
    a = gg(a, b, c, d, x[i+1], 5, -165796510);
    d = gg(d, a, b, c, x[i+6], 9, -1069501632);
    c = gg(c, d, a, b, x[i+11], 14,  643717713);
    b = gg(b, c, d, a, x[i+0], 20, -373897302);
    a = gg(a, b, c, d, x[i+5], 5, -701558691);
    d = gg(d, a, b, c, x[i+10], 9,  38016083);
    c = gg(c, d, a, b, x[i+15], 14, -660478335);
    b = gg(b, c, d, a, x[i+4], 20, -405537848);
    a = gg(a, b, c, d, x[i+9], 5,  568446438);
    d = gg(d, a, b, c, x[i+14], 9, -1019803690);
    c = gg(c, d, a, b, x[i+3], 14, -187363961);
    b = gg(b, c, d, a, x[i+8], 20,  1163531501);
    a = gg(a, b, c, d, x[i+13], 5, -1444681467);
    d = gg(d, a, b, c, x[i+2], 9, -51403784);
    c = gg(c, d, a, b, x[i+7], 14,  1735328473);
    b = gg(b, c, d, a, x[i+12], 20, -1926607734);
    
    a = hh(a, b, c, d, x[i+5], 4, -378558);
    d = hh(d, a, b, c, x[i+8], 11, -2022574463);
    c = hh(c, d, a, b, x[i+11], 16,  1839030562);
    b = hh(b, c, d, a, x[i+14], 23, -35309556);
    a = hh(a, b, c, d, x[i+1], 4, -1530992060);
    d = hh(d, a, b, c, x[i+4], 11,  1272893353);
    c = hh(c, d, a, b, x[i+7], 16, -155497632);
    b = hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = hh(a, b, c, d, x[i+13], 4,  681279174);
    d = hh(d, a, b, c, x[i+0], 11, -358537222);
    c = hh(c, d, a, b, x[i+3], 16, -722521979);
    b = hh(b, c, d, a, x[i+6], 23,  76029189);
    a = hh(a, b, c, d, x[i+9], 4, -640364487);
    d = hh(d, a, b, c, x[i+12], 11, -421815835);
    c = hh(c, d, a, b, x[i+15], 16,  530742520);
    b = hh(b, c, d, a, x[i+2], 23, -995338651);
    
    a = ii(a, b, c, d, x[i+0], 6, -198630844);
    d = ii(d, a, b, c, x[i+7], 10,  1126891415);
    c = ii(c, d, a, b, x[i+14], 15, -1416354905);
    b = ii(b, c, d, a, x[i+5], 21, -57434055);
    a = ii(a, b, c, d, x[i+12], 6,  1700485571);
    d = ii(d, a, b, c, x[i+3], 10, -1894986606);
    c = ii(c, d, a, b, x[i+10], 15, -1050366);
    b = ii(b, c, d, a, x[i+1], 21, -2054922799);
    a = ii(a, b, c, d, x[i+8], 6,  1873313359);
    d = ii(d, a, b, c, x[i+15], 10, -30611744);
    c = ii(c, d, a, b, x[i+6], 15, -1560198380);
    b = ii(b, c, d, a, x[i+13], 21,  1309151649);
    a = ii(a, b, c, d, x[i+4], 6, -145523070);
    d = ii(d, a, b, c, x[i+11], 10, -1120210379);
    c = ii(c, d, a, b, x[i+2], 15,  718787259);
    b = ii(b, c, d, a, x[i+9], 21, -343485551);
    
    a = sub(a, olda);
    b = sub(b, oldb);
    c = sub(c, oldc);
    d = sub(d, oldd);
  }
  return bin2hex([a, b, c, d]);
}

function getInternalEmail(username) {
  const normalized = username.toLowerCase().trim();
  return `${md5(normalized)}@wappi.com`;
}

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
  const { t, roomScope, formatScopeLabel, purchasedPremium, setPurchasedPremium, localeTag } = useAppRuntime();
  const [username, setUsername] = useState('');
  const [selectedChatColor, setSelectedChatColor] = useState('#000000');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState('');
  const [showAvatarGallery, setShowAvatarGallery] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [error, setError] = useState('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [loginMode, setLoginMode] = useState('credentials'); // 'guest' ou 'credentials'
  const [password, setPassword] = useState('');
  const loginActionLabel = loading ? 'ENTRANDO...' : loginMode === 'credentials' ? 'ENTRAR NA MINHA CONTA' : 'ENTRAR COMO CONVIDADO';

  useEffect(() => {
    if (loginMode !== 'guest') {
      setIsChecking(false);
      setIsAvailable(null);
      return undefined;
    }

    const cleanName = username.trim();
    if (cleanName.length < 3) {
      setIsChecking(false);
      setIsAvailable(null);
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      checkAvailability(cleanName);
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [username, loginMode]);

  const ensureAnonymousSession = async () => {
    if (auth.currentUser) return auth.currentUser;
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  };

  const generateRandomUsername = () => {
    const adjs = ["Lobo", "Tigre", "Ninja", "Fantasma", "Sombra", "Mestre", "Dragao", "Rei"];
    const nouns = ["Negro", "Branco", "Oculto", "Veloz", "Supremo", "Feroz", "Mortal", "Anonimo"];
    const adj = adjs[Math.floor(Math.random() * adjs.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 900) + 100;
    setUsername(`${adj}${noun}${num}`.toUpperCase());
    setIsAvailable(null);
  };

  const checkAvailability = async (candidate = username) => {
    if (candidate.trim().length < 3) return;
    setIsChecking(true);
    try {
      const currentUser = await ensureAnonymousSession();
      const cleanName = candidate.trim().toUpperCase();
      const snapshot = await get(ref(database, `users/${cleanName}`));
      if (!snapshot.exists()) {
        setIsAvailable(true);
      } else {
        const registeredUid = String(snapshot.child('uid').val() || '');
        setIsAvailable(Boolean(registeredUid) && registeredUid === currentUser.uid);
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

    if (loginMode === 'credentials' && password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    const cleanNickname = username.trim().toUpperCase();
    setLoading(true);
    setError('');

    try {
      const preBanCheck = await checkWebBanStatus({ uid: auth.currentUser?.uid, username: cleanNickname });
      if (preBanCheck.banned) {
        setError(banErrorMessage(preBanCheck));
        setLoading(false);
        return;
      }

      if (loginMode === 'credentials') {
        // MODO LOGIN COM SENHA (ABA ENTRAR)
        const email = getInternalEmail(username);
        const legacyEmail = `${username.toUpperCase().trim()}@friend.com`;
        
        let user;
        try {
          // Tenta novo formato (MD5)
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          user = userCredential.user;
        } catch (err) {
          try {
            // Tenta formato antigo
            const userCredential = await signInWithEmailAndPassword(auth, legacyEmail, password);
            user = userCredential.user;
          } catch (err2) {
            setError('Usuário não encontrado ou senha incorreta.');
            setLoading(false);
            return;
          }
        }

        // Busca o username correto do mapeamento
        const uidSnap = await get(ref(database, `uid_to_username/${user.uid}`));
        let actualName = username.trim();
        if (uidSnap.exists()) {
          actualName = uidSnap.val();
        } else {
          // Garante sincronia do mapeamento se estiver ausente
          await set(ref(database, `uid_to_username/${user.uid}`), cleanNickname);
          await set(ref(database, `username_to_uid/${cleanNickname}`), user.uid);
        }

        const loginBanCheck = await checkWebBanStatus({ uid: user.uid, username: actualName.toUpperCase() });
        if (loginBanCheck.banned) {
          setError(banErrorMessage(loginBanCheck));
          setLoading(false);
          return;
        }

        // Atualiza perfil no database para online
        const userRef = ref(database, `users/${actualName.toUpperCase()}`);
        const userSnap = await get(userRef);
        if (!userSnap.exists()) {
          await set(userRef, {
            uid: user.uid,
            name: actualName,
            isOnline: true,
            presenceStatus: 'Online',
            status: 'Olá! Estou usando o Bate Papo Anônimo.',
            chatColor: selectedChatColor,
            photoUrl: selectedAvatarUrl || null,
            languageCode: roomScope.languageCode,
            countryCode: roomScope.countryCode,
            localeTag,
            roomRegionKey: roomScope.regionKey,
            regionKey: roomScope.regionKey,
            createdAt: serverTimestamp(),
            lastActive: serverTimestamp()
          });
        } else {
          await set(ref(database, `users/${actualName.toUpperCase()}/isOnline`), true);
          await set(ref(database, `users/${actualName.toUpperCase()}/lastActive`), serverTimestamp());
          if (selectedAvatarUrl) {
            await set(ref(database, `users/${actualName.toUpperCase()}/photoUrl`), selectedAvatarUrl);
          }
          await set(ref(database, `users/${actualName.toUpperCase()}/chatColor`), selectedChatColor);
          await set(ref(database, `users/${actualName.toUpperCase()}/languageCode`), roomScope.languageCode);
          await set(ref(database, `users/${actualName.toUpperCase()}/countryCode`), roomScope.countryCode);
          await set(ref(database, `users/${actualName.toUpperCase()}/localeTag`), localeTag);
          await set(ref(database, `users/${actualName.toUpperCase()}/roomRegionKey`), roomScope.regionKey);
          await set(ref(database, `users/${actualName.toUpperCase()}/regionKey`), roomScope.regionKey);
        }

        onLogin(actualName.toUpperCase());
      } else {
        // MODO CONVIDADO (ANÔNIMO OU NOVA CONTA COM SENHA)
        const nameCheckSnap = await get(ref(database, `username_to_uid/${cleanNickname}`));
        const currentUser = await ensureAnonymousSession();
        const existingOwnerUid = nameCheckSnap.exists() ? String(nameCheckSnap.val() || '') : '';
        if (existingOwnerUid && existingOwnerUid !== currentUser.uid) {
          setError('Esse nome já possui dono protegido. Faça login com senha na aba correspondente!');
          setLoading(false);
          return;
        }

        const guestBanCheck = await checkWebBanStatus({ uid: currentUser.uid, username: cleanNickname });
        if (guestBanCheck.banned) {
          setError(banErrorMessage(guestBanCheck));
          setLoading(false);
          return;
        }

        const user = currentUser;

        const usernameRef = ref(database, `users/${cleanNickname}`);
        await set(usernameRef, {
          uid: user.uid,
          name: username.trim(),
          isOnline: true,
          presenceStatus: 'Online',
          status: 'Olá! Estou usando o Bate Papo Anônimo.',
          chatColor: selectedChatColor,
          photoUrl: selectedAvatarUrl || null,
          languageCode: roomScope.languageCode,
          countryCode: roomScope.countryCode,
          localeTag,
          roomRegionKey: roomScope.regionKey,
          regionKey: roomScope.regionKey,
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp()
        });
        
        await set(ref(database, `uid_to_username/${user.uid}`), cleanNickname);
        await set(ref(database, `username_to_uid/${cleanNickname}`), user.uid);

        // Se definiu senha na aba convidado, vincula para tornar conta permanente
        if (password.trim().length >= 6) {
          const email = getInternalEmail(username);
          const credential = EmailAuthProvider.credential(email, password);
          try {
            await linkWithCredential(user, credential);
          } catch (linkError) {
            console.error('Falha ao vincular senha:', linkError);
          }
        }

        onLogin(cleanNickname);
      }
    } catch (err) {
      console.error(err);
      if (err?.code === 'auth/unauthorized-domain') {
        setError('Este domínio ainda não foi autorizado no Firebase. Tente novamente em alguns minutos.');
      } else {
        setError('Erro ao entrar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen login-screen-web" style={{ overflowY: 'auto' }}>
      <div className="login-shell animate-fade-in">
        <section className="login-brand-panel">
          <div className="login-brand-glow login-brand-glow-top" />
          <div className="login-brand-glow login-brand-glow-bottom" />
          <div className="login-brand-badge">
            <span className="login-brand-badge-dot" />
            BP ANONIMO
          </div>
          <div className="login-brand-mark">
            <div className="login-brand-mark-ring">
              <img src="/bp-logo.png" alt="BP" className="login-brand-mark-image" />
            </div>
          </div>
          <div className="login-brand-copy">
            <h1 className="login-logo" style={{ marginBottom: '10px' }}>Bate Papo Anônimo</h1>
            <p className="login-subtitle" style={{ fontSize: '14px', marginBottom: '20px' }}>
              Entre rapido, escolha seu visual e comece a conversar com a mesma energia do app.
            </p>
          </div>
          <div className="login-brand-scope-card">
            <div className="login-brand-scope-label">Escopo atual</div>
            <div className="login-brand-scope-value">{formatScopeLabel(roomScope)}</div>
          </div>
          <div className="login-brand-feature-row">
            <div className="login-brand-feature-pill">Avatar rapido</div>
            <div className="login-brand-feature-pill">Cor do chat</div>
            <div className="login-brand-feature-pill">Modo anonimo</div>
          </div>
        </section>

        <section className="login-card login-card-web" style={{ padding: '32px 24px', width: '100%', margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button
              onClick={() => setShowPremiumModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '999px',
                background: purchasedPremium
                  ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                  : 'rgba(255,255,255,0.06)',
                border: purchasedPremium ? 'none' : '1px solid rgba(255,255,255,0.15)',
                boxShadow: purchasedPremium ? '0 0 15px rgba(255, 215, 0, 0.4)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                outline: 'none',
                borderStyle: 'none'
              }}
            >
              <NoAdsIcon size={18} color={purchasedPremium ? '#000000' : '#FFD700'} />
              <span style={{
                fontSize: '12px',
                fontWeight: 800,
                color: purchasedPremium ? '#000000' : '#FFD700',
                letterSpacing: '0.5px'
              }}>
                {purchasedPremium ? t('premiumActive') : t('premium')}
              </span>
            </button>
          </div>

          <div className="login-mobile-hero">
            <div className="login-mobile-hero-logo">
              <img src="/bp-logo.png" alt="BP" className="login-mobile-hero-image" />
            </div>
            <div>
              <div className="login-logo" style={{ marginBottom: '6px' }}>Bate Papo Anônimo</div>
              <div className="login-subtitle" style={{ fontSize: '13px', marginBottom: 0 }}>
                Sua identidade, sua cor, sua sala.
              </div>
            </div>
          </div>

          <div style={{
            marginBottom: '18px',
            padding: '14px 16px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, rgba(77,163,255,0.12), rgba(77,163,255,0.04))',
            border: '1px solid rgba(77,163,255,0.16)',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '12px',
            fontWeight: 700
          }}>
            {formatScopeLabel(roomScope)}
          </div>

          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '4px', marginBottom: '24px' }}>
            <button
              type="button"
              onClick={() => { setLoginMode('credentials'); setError(''); }}
              style={{
                flex: 1, padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '13px',
                cursor: 'pointer', transition: 'all 0.2s',
                background: loginMode === 'credentials' ? 'var(--primary)' : 'transparent',
                color: loginMode === 'credentials' ? 'white' : 'rgba(255,255,255,0.5)',
                boxShadow: loginMode === 'credentials' ? '0 8px 18px rgba(255,42,104,0.24)' : 'none',
                outline: 'none',
                borderStyle: 'none'
              }}
            >
              Entrar na minha conta
            </button>
            <button
              type="button"
              onClick={() => { setLoginMode('guest'); setError(''); }}
              style={{
                flex: 1, padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '13px',
                cursor: 'pointer', transition: 'all 0.2s',
                background: loginMode === 'guest' ? 'var(--primary)' : 'transparent',
                color: loginMode === 'guest' ? 'white' : 'rgba(255,255,255,0.5)',
                boxShadow: loginMode === 'guest' ? '0 8px 18px rgba(255,42,104,0.24)' : 'none',
                outline: 'none',
                borderStyle: 'none'
              }}
            >
              Convidado / criar conta
            </button>
          </div>

          <div style={{ margin: '-10px 0 20px', color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.5 }}>
            {loginMode === 'credentials'
              ? 'Use o mesmo nome e senha definidos no app. Contas anônimas sem senha precisam ser protegidas no app antes de usar o site.'
              : 'Use este modo apenas para criar uma nova conta web ou entrar como convidado.'}
          </div>
        
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

        <div style={{ textAlign: 'left', marginBottom: '20px', backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255, 42, 104, 0.1)' }}>
          <div style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '12px' }}>Seu Nome Secreto</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Digite seu nome..."
              value={username}
              onChange={(e) => {
                const val = e.target.value.replace('.', '');
                if (val.length <= 20) {
                   setUsername(val.toUpperCase());
                   setIsAvailable(null);
                }
              }}
              style={{ flex: 1, margin: 0 }}
              disabled={loading}
            />
            {loginMode === 'guest' && (
              <button 
                type="button" 
                onClick={generateRandomUsername}
                style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(255, 42, 104, 0.1)', color: 'var(--primary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <RefreshCw size={20} />
              </button>
            )}
          </div>
          
          {loginMode === 'guest' && username.length >= 3 && (
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', fontSize: '12px' }}>
              {isChecking ? (
                <span style={{ color: 'var(--text-muted)' }}>Verificando...</span>
              ) : isAvailable === true ? (
                <><CheckCircle size={14} color="#4CAF50" style={{ marginRight: '4px' }} /> <span style={{ color: '#4CAF50' }}>Nome disponível</span></>
              ) : isAvailable === false ? (
                <><AlertCircle size={14} color="#F44336" style={{ marginRight: '4px' }} /> <span style={{ color: '#F44336' }}>Nome indisponível</span></>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Digite para verificar automaticamente</span>
              )}
            </div>
          )}
        </div>

        {/* Password input for claim / linking */}
        <div style={{ textAlign: 'left', marginBottom: '24px', backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255, 42, 104, 0.1)' }}>
          <div style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>
            {loginMode === 'guest' ? 'Proteger com Senha (Opcional)' : 'Sua Senha Secreta'}
          </div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px', lineHeight: 1.4 }}>
            {loginMode === 'guest' 
              ? 'Defina uma senha de no mínimo 6 caracteres para proteger e salvar sua conta.' 
              : 'Digite sua senha cadastrada.'}
          </p>
          <input
            type="password"
            className="input-field"
            placeholder={loginMode === 'guest' ? 'Senha opcional...' : 'Senha obrigatória...'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', margin: 0 }}
            disabled={loading}
          />
        </div>

        {error && <div style={{ color: '#FF3B30', fontSize: '14px', marginBottom: '16px' }}>{error}</div>}

        <button onClick={handleLogin} className="btn-primary" disabled={loading} style={{ height: '56px', fontSize: '16px', letterSpacing: '1px' }}>
          {loginActionLabel}
        </button>

        {/* Version & About Footer */}
        <div style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.25)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ fontWeight: 800, letterSpacing: '0.5px' }}>
            BATE PAPO ANÔNIMO • v3.0.1
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)' }}>
            Privacidade e Segurança 100% Criptografada
          </div>
          <a
            href="https://batepapoanonimo.com"
            target="_blank"
            rel="noreferrer"
            style={{
              color: 'var(--primary)',
              textDecoration: 'none',
              fontWeight: 700,
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            batepapoanonimo.com
          </a>
        </div>
        </section>
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

      {/* Premium / No Ads Modal */}
      {showPremiumModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1C1C23, #0F0F13)',
            border: '2px solid #FFD700',
            borderRadius: '28px',
            width: '100%',
            maxWidth: '400px',
            padding: '30px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(255,215,0,0.15)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowPremiumModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                background: 'rgba(255, 215, 0, 0.1)',
                padding: '20px',
                borderRadius: '50%',
                border: '2px dashed #FFD700',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(255, 215, 0, 0.1)'
              }}>
                <NoAdsIcon size={48} color="#FFD700" />
              </div>
            </div>

            <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 900, marginBottom: '10px', letterSpacing: '0.5px' }}>
              BATE PAPO ANÔNIMO PREMIUM
            </h3>
            
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
              Parabéns! Apoie a nossa comunidade anônima. Remova todos os anúncios do site e do aplicativo móvel de forma definitiva. Visite nosso site oficial para mais detalhes!
            </p>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.05)',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>STATUS PREMIUM:</span>
              <span style={{
                fontSize: '13px',
                fontWeight: 900,
                color: purchasedPremium ? '#4CAF50' : '#FF5252',
                background: purchasedPremium ? 'rgba(76,175,80,0.1)' : 'rgba(255,82,82,0.1)',
                padding: '4px 10px',
                borderRadius: '8px'
              }}>
                {purchasedPremium ? 'ATIVADO' : 'DESATIVADO'}
              </span>
            </div>

            <button
              onClick={() => {
                setPurchasedPremium(!purchasedPremium);
              }}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                border: 'none',
                fontWeight: 900,
                fontSize: '14px',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                background: purchasedPremium ? 'rgba(255,82,82,0.15)' : 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: purchasedPremium ? '#FF5252' : '#000000',
                transition: 'all 0.2s',
                boxShadow: purchasedPremium ? 'none' : '0 4px 15px rgba(255, 215, 0, 0.3)'
              }}
            >
              {purchasedPremium ? 'Desativar Premium' : 'Ativar Premium'}
            </button>

            <div style={{ marginTop: '20px' }}>
              <a 
                href="https://batepapoanonimo.com" 
                target="_blank" 
                rel="noreferrer"
                style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', textDecoration: 'none' }}
              >
                batepapoanonimo.com
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
