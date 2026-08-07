import { lazy, Suspense, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth, database } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { Smartphone, X } from 'lucide-react';

import Login from './pages/Login';
import MainApp from './pages/MainApp';
const AdminDashboard = lazy(() => import('./pages/AdminPanel'));
import { AppRuntimeProvider, useAppRuntime } from './context/AppRuntimeContext';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.jack.friend';

function BannedGate({ children }) {
  const { banState } = useAppRuntime();

  const expiryLabel = banState?.expiresAt
    ? new Date(banState.expiresAt).toLocaleString()
    : '';

  if (banState?.checked && banState?.banned) {
    return (
      <div className="brand-splash">
        <div className="brand-splash-card animate-fade-in" style={{ maxWidth: '520px' }}>
          <div className="brand-splash-logo-stage">
            <div className="brand-splash-logo-glow" />
            <div className="brand-splash-logo-shell">
              <img src="/bp-logo.png" alt="BP" className="brand-splash-logo" />
            </div>
          </div>
          <div className="brand-splash-copy" style={{ fontSize: '28px', fontWeight: 900 }}>
            {banState.isTemporary ? 'Suspensao temporaria' : 'Acesso bloqueado'}
          </div>
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.7, maxWidth: '380px' }}>
            {banState.isTemporary
              ? `Sua conta esta suspensa temporariamente no app e no site.${expiryLabel ? ` Libera em ${expiryLabel}.` : ''}`
              : 'Esta conta ou este IP foi banido. O bloqueio da moderacao vale no app e no site.'}
          </div>
        </div>
      </div>
    );
  }

  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAppNotice, setShowAppNotice] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const openRoom = params.get('openRoom')?.trim();
    const openChat = params.get('openChat')?.trim();
    const isAndroid = /Android/i.test(window.navigator.userAgent || '');
    const target = openRoom
      ? (
        isAndroid
          ? `intent://room/${encodeURIComponent(openRoom)}#Intent;scheme=wappi;package=com.jack.friend;S.browser_fallback_url=${encodeURIComponent(PLAY_STORE_URL)};end`
          : `wappi://room/${encodeURIComponent(openRoom)}`
      )
      : openChat
        ? (
          isAndroid
            ? `intent://chat/${encodeURIComponent(openChat)}#Intent;scheme=wappi;package=com.jack.friend;S.browser_fallback_url=${encodeURIComponent(PLAY_STORE_URL)};end`
            : `wappi://chat/${encodeURIComponent(openChat)}`
        )
        : null;

    if (!target) return undefined;

    const fallbackTimer = window.setTimeout(() => {
      window.location.replace(PLAY_STORE_URL);
    }, 1800);

    window.location.href = target;

    const clearFallback = () => window.clearTimeout(fallbackTimer);
    window.addEventListener('pagehide', clearFallback, { once: true });
    window.addEventListener('blur', clearFallback, { once: true });

    return () => {
      clearFallback();
      window.removeEventListener('pagehide', clearFallback);
      window.removeEventListener('blur', clearFallback);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch username
        try {
          const snapshot = await get(ref(database, `uid_to_username/${currentUser.uid}`));
          if (snapshot.exists()) {
            setUsername(String(snapshot.val()).toUpperCase().trim());
          }
        } catch (error) {
          console.error("Error fetching username:", error);
        }
      } else {
        setUser(null);
        setUsername(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="brand-splash">
        <div className="brand-splash-card animate-fade-in">
          <div className="brand-splash-logo-stage">
            <div className="brand-splash-logo-glow" />
            <div className="brand-splash-logo-shell">
              <img src="/bp-logo.png" alt="BP" className="brand-splash-logo" />
            </div>
          </div>
          <div className="brand-splash-loader" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="brand-splash-copy">Carregando sua sala...</div>
        </div>
      </div>
    );
  }

  return (
    <AppRuntimeProvider user={user} username={username}>
      <BannedGate>
        <HashRouter>
          {showAppNotice && (
            <div className="app-download-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Smartphone size={18} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'white' }}>BP para Android</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mais recursos, turbo e melhor experiencia.</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="play-store-btn"
                >
                  BAIXAR APP
                </a>
                <button
                  onClick={() => setShowAppNotice(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '8px', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}
          <Routes>
            <Route
              path="/"
              element={
                user && username ? <Navigate to="/app" /> : <Login onLogin={(uname) => setUsername(uname)} />
              }
            />
            <Route
              path="/app/*"
              element={
                user && username ? <MainApp user={user} username={username} /> : <Navigate to="/" />
              }
            />
            <Route
              path="/admin"
              element={<Suspense fallback={<div className="route-loading">Abrindo painel...</div>}><AdminDashboard /></Suspense>}
            />
          </Routes>
        </HashRouter>
      </BannedGate>
    </AppRuntimeProvider>
  );
}

export default App;
