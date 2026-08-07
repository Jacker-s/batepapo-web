import { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import RoomList from './RoomList';
import ChatList from './ChatList';
const ChatRoom = lazy(() => import('./ChatRoom'));
const PrivateChat = lazy(() => import('./PrivateChat'));
import { LogOut, LayoutGrid, MessageCircle, MessageSquare, Shield, Crown, Globe2, ChevronRight, Star, X, User, Camera } from 'lucide-react';
import { auth, database } from '../firebase';
import { ref, get, set, update, serverTimestamp } from 'firebase/database';
import { useAppRuntime } from '../context/AppRuntimeContext';
import { resolveAdminAccess } from '../utils/adminAccess';

const formatFriendlyName = (name) => {
  if (!name) return '';
  if (name === name.toUpperCase()) {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }
  return name;
};

const formatLanguageLabel = (scope, localeTag) => {
  try {
    const locale = localeTag || scope.localeTag;
    return new Intl.DisplayNames([locale], { type: 'language' }).of(scope.languageCode) || scope.languageCode.toUpperCase();
  } catch {
    return scope.languageCode.toUpperCase();
  }
};

const getUniqueLanguageOptions = (roomScopes, localeTag) => {
  const seen = new Set();
  return roomScopes.filter((scope) => {
    if (seen.has(scope.languageCode)) return false;
    seen.add(scope.languageCode);
    return true;
  }).map((scope) => ({
    localeTag: scope.localeTag,
    languageCode: scope.languageCode,
    label: formatLanguageLabel(scope, localeTag)
  }));
};

export default function MainApp({ user, username }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    t,
    isPremium,
    purchasedPremium,
    setPurchasedPremium,
    hasTurbo,
    roomScope,
    roomScopes,
    setRoomScopeByKey,
    localeTag,
    setLocaleTag,
    formatScopeLabel
  } = useAppRuntime();
  const [activeTab, setActiveTab] = useState('rooms');
  const [displayName, setDisplayName] = useState(formatFriendlyName(username));
  const [photoUrl, setPhotoUrl] = useState(null);
  const [showProfileSheet, setShowProfileSheet] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const languageOptions = getUniqueLanguageOptions(roomScopes, localeTag);

  useEffect(() => {
    const userRef = ref(database, `users/${username}`);
    get(userRef).then(async (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        setDisplayName(data.name || formatFriendlyName(username));
        setPhotoUrl(data.photoUrl || null);
        const canAccessAdmin = await resolveAdminAccess({ username: data.name || username, uid: data.uid || user?.uid });
        setIsAdminAuthorized(canAccessAdmin);
      } else {
        const canAccessAdmin = await resolveAdminAccess({ username, uid: user?.uid });
        setIsAdminAuthorized(canAccessAdmin);
      }
    });

    // Set online presence
    set(ref(database, `users/${username}/isOnline`), true);
    set(ref(database, `users/${username}/lastActive`), serverTimestamp());

    return () => {
      set(ref(database, `users/${username}/isOnline`), false);
    };
  }, [username]);

  useEffect(() => {
    setEditName(displayName);
  }, [displayName]);

  useEffect(() => {
    if (location.pathname.includes('/app/chat/')) {
      setActiveTab('chats');
      return;
    }
    if (location.pathname.includes('/app/room/')) {
      setActiveTab('rooms');
    }
  }, [location.pathname]);

  async function uploadToR2(file) {
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const res = await fetch('https://noisy-band-009ewappi-upload.ssj53415170.workers.dev/', {
      method: 'POST',
      headers: { 'X-File-Name': fileName, 'Content-Type': file.type },
      body: file
    });
    if (!res.ok) throw new Error('Upload falhou');
    return (await res.json()).url;
  }

  const handleSaveProfile = async (newPhotoUrl) => {
    setIsSaving(true);
    try {
      const updates = {};
      if (editName.trim()) updates[`users/${username}/name`] = editName.trim();
      if (newPhotoUrl) updates[`users/${username}/photoUrl`] = newPhotoUrl;
      await update(ref(database), updates);
      setDisplayName(editName.trim());
      if (newPhotoUrl) setPhotoUrl(newPhotoUrl);
      setShowProfileSheet(false);
    } catch {
      alert('Erro ao salvar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('admin_authorized');
      localStorage.clear(); // Limpeza completa por segurança
      await set(ref(database, `users/${username}/isOnline`), false);
      await auth.signOut();
      navigate('/');
    } catch {
      localStorage.clear();
      await auth.signOut();
      navigate('/');
    }
  };

  const isChatOpen = location.pathname.includes('/app/room/') || location.pathname.includes('/app/chat/');

  const initial = (displayName || username).charAt(0).toUpperCase();

  return (
    <div className="app-container">
      <div className={`sidebar ${isChatOpen ? 'hidden-on-mobile' : ''}`}>
        <div className="sidebar-header">
          <button
            className="sidebar-profile-card"
            onClick={() => setShowProfileSheet(true)}
            type="button"
          >
            <div
              className="avatar-circle sidebar-profile-avatar"
              style={{ background: photoUrl ? 'transparent' : undefined, border: 'none' }}
            >
              {photoUrl
                ? <img src={photoUrl} alt="me" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : initial
              }
            </div>

            <div className="sidebar-profile-copy">
              <div className="sidebar-profile-name-row">
                <div className="sidebar-profile-name">{formatFriendlyName(displayName)}</div>
                <ChevronRight size={16} className="sidebar-profile-chevron" />
              </div>

              <div className="sidebar-profile-meta">
                <span className="sidebar-status-pill">
                  <span className="sidebar-status-dot" />
                  {t('online')}
                </span>
                <span className="sidebar-region-pill">{formatScopeLabel(roomScope)}</span>
              </div>

              <div className="sidebar-profile-tags">
                {isPremium && (
                  <span className="sidebar-tag sidebar-tag-premium">
                    <Crown size={12} />
                    {t('premium')}
                  </span>
                )}
                {hasTurbo && (
                  <span className="sidebar-tag sidebar-tag-turbo">
                    <Star size={12} />
                    {t('turbo')}
                  </span>
                )}
              </div>
            </div>
          </button>
          <button
            onClick={handleLogout}
            title={t('logout')}
            className="sidebar-logout-btn"
          >
            <LogOut size={18} />
          </button>
        </div>

        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'grid',
          gap: '10px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            padding: '12px 14px',
            borderRadius: '18px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '14px',
                background: 'rgba(74,144,226,0.12)',
                color: '#8ec5ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Globe2 size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 800 }}>
                  {t('activeRegion')}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {formatScopeLabel(roomScope)}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              {isPremium && (
                <div style={{
                  padding: '6px 10px',
                  borderRadius: '999px',
                  background: 'rgba(255,215,64,0.14)',
                  color: '#ffd95f',
                  fontSize: '11px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <Crown size={12} />
                  {t('premium')}
                </div>
              )}
              {hasTurbo && (
                <div style={{
                  padding: '6px 10px',
                  borderRadius: '999px',
                  background: 'rgba(67,198,172,0.14)',
                  color: '#79f6da',
                  fontSize: '11px',
                  fontWeight: 900
                }}>
                  {t('turbo')}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="tab-switcher desktop-only">
          <button className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>
            {t('rooms')}
          </button>
          <button className={`tab-btn ${activeTab === 'chats' ? 'active' : ''}`} onClick={() => setActiveTab('chats')}>
            {t('conversations')}
          </button>
          <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            Perfil
          </button>
        </div>

        <div className="room-list-container" style={{ flex: 1, minHeight: 0 }}>
          {activeTab === 'rooms' && <RoomList username={username} />}
          {activeTab === 'chats' && <ChatList username={username} />}
          {activeTab === 'profile' && (
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div className="avatar-circle" style={{
                  width: '80px', height: '80px', fontSize: '28px', cursor: 'pointer', position: 'relative',
                  background: photoUrl ? 'transparent' : undefined
                }}>
                  {photoUrl
                    ? <img src={photoUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    : initial
                  }
                </div>
                <div style={{ width: '100%' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Nome</label>
                  <input type="text" value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder={displayName || username}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: '14px', outline: 'none'
                    }}
                  />
                </div>
                <label style={{
                  width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px dashed rgba(255,69,0,0.4)',
                  background: 'rgba(255,69,0,0.06)', color: '#FF4500', fontSize: '14px', cursor: 'pointer',
                  textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}>
                  <Camera size={18} /> Alterar Foto
                  <input type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const url = await uploadToR2(file);
                        await handleSaveProfile(url);
                      } catch { alert('Erro ao fazer upload da foto'); }
                      e.target.value = '';
                    }}
                  />
                </label>
                <button onClick={() => handleSaveProfile(null)}
                  disabled={isSaving || !editName.trim()}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
                    background: editName.trim() && !isSaving ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                    color: editName.trim() && !isSaving ? 'white' : 'var(--text-muted)',
                    fontWeight: 700, fontSize: '15px', cursor: editName.trim() && !isSaving ? 'pointer' : 'default'
                  }}>
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.25)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }} className="desktop-only">
          <div style={{ fontWeight: 800, letterSpacing: '0.5px' }}>
            BP WEB • GLOBAL
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)' }}>
            {t('poweredByAds')}
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

        <div className="mobile-nav">
          <button className={`mobile-nav-item ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>
            <LayoutGrid size={22} />
            <span>{t('rooms').toUpperCase()}</span>
          </button>
          <button className={`mobile-nav-item ${activeTab === 'chats' ? 'active' : ''}`} onClick={() => setActiveTab('chats')}>
            <MessageCircle size={22} />
            <span>{t('conversations').toUpperCase()}</span>
          </button>
          <button className={`mobile-nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <User size={22} />
            <span>PERFIL</span>
          </button>
        </div>
      </div>

      <div className={`main-content ${!isChatOpen ? 'hidden-on-mobile' : ''}`}>
        <Routes>
          <Route
            path="/"
            element={
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: '100%', padding: '40px', textAlign: 'center',
                background: 'radial-gradient(ellipse at center, rgba(255,42,104,0.04) 0%, transparent 70%)'
              }}>
                <div style={{
                  width: '100px', height: '100px', borderRadius: '36px',
                  background: 'rgba(255,42,104,0.06)',
                  border: '1px solid rgba(255,42,104,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '24px'
                }}>
                  <MessageSquare size={52} color="var(--primary)" style={{ opacity: 0.7 }} />
                </div>
                <h2 style={{ fontWeight: 900, fontSize: '22px', marginBottom: '10px', color: 'white' }}>
                  {t('welcome')}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '280px', lineHeight: 1.6 }}>
                  {t('chooseRoom')}
                </p>
                <div style={{ marginTop: '22px', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Shield size={14} />
                    {formatScopeLabel(roomScope)}
                  </div>
                </div>
              </div>
            }
          />
          <Route path="room/:roomId" element={<Suspense fallback={<div className="route-loading">Abrindo sala...</div>}><ChatRoom username={username} uid={user?.uid} myName={displayName} myPhoto={photoUrl} /></Suspense>} />
          <Route path="chat/:friendId" element={<Suspense fallback={<div className="route-loading">Abrindo conversa...</div>}><PrivateChat username={username} uid={user?.uid} myName={displayName} myPhoto={photoUrl} /></Suspense>} />
        </Routes>
      </div>

      {showProfileSheet && (
        <div className="sheet-backdrop" onClick={() => setShowProfileSheet(false)}>
          <div className="region-sheet profile-sheet" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                <div className="avatar-circle" style={{ width: '58px', height: '58px', fontSize: '20px', background: photoUrl ? 'transparent' : undefined }}>
                  {photoUrl
                    ? <img src={photoUrl} alt="me" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    : initial
                  }
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '22px', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {formatFriendlyName(displayName)}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '13px' }}>
                    {formatScopeLabel(roomScope)}
                  </div>
                </div>
              </div>
              <button onClick={() => setShowProfileSheet(false)} style={{ color: 'var(--text-muted)', padding: '8px' }}>
                <X size={18} />
              </button>
            </div>

            <div className="profile-grid">
              <button className="profile-card" onClick={() => { setActiveTab('profile'); setShowProfileSheet(false); }}>
                <User size={20} />
                <div>
                  <div className="profile-card-title">Editar Perfil</div>
                  <div className="profile-card-desc">Alterar nome e foto</div>
                </div>
                <ChevronRight size={16} />
              </button>

              <button className="profile-card" onClick={() => { setActiveTab('rooms'); setShowProfileSheet(false); navigate('/app'); }}>
                <LayoutGrid size={20} />
                <div>
                  <div className="profile-card-title">{t('rooms')}</div>
                  <div className="profile-card-desc">{t('discover')}</div>
                </div>
                <ChevronRight size={16} />
              </button>

              <button className="profile-card" onClick={() => { setActiveTab('chats'); setShowProfileSheet(false); navigate('/app'); }}>
                <MessageCircle size={20} />
                <div>
                  <div className="profile-card-title">{t('conversations')}</div>
                  <div className="profile-card-desc">{t('noConversations')}</div>
                </div>
                <ChevronRight size={16} />
              </button>

              {isAdminAuthorized && (
                <button className="profile-card" onClick={() => { setShowProfileSheet(false); navigate('/admin'); }}>
                  <Shield size={20} />
                  <div>
                    <div className="profile-card-title">{t('adminPanel')}</div>
                    <div className="profile-card-desc">{t('settings')}</div>
                  </div>
                  <ChevronRight size={16} />
                </button>
              )}

              <button className="profile-card" onClick={() => setPurchasedPremium(!purchasedPremium)}>
                <Crown size={20} />
                <div>
                  <div className="profile-card-title">{t('premium')}</div>
                  <div className="profile-card-desc">{isPremium ? t('premiumActive') : t('removeAds')}</div>
                </div>
                <Star size={16} />
              </button>
            </div>

            <div className="profile-section-title">{t('regionLanguage')}</div>
            <div style={{ display: 'grid', gap: '12px', marginBottom: '18px' }}>
              <div className="region-language-grid compact">
                {languageOptions.map((option) => {
                  const active = localeTag === option.localeTag || roomScope.languageCode === option.languageCode;
                  return (
                    <button
                      key={option.languageCode}
                      type="button"
                      className={`region-language-chip ${active ? 'active' : ''}`}
                      onClick={() => {
                        setLocaleTag(option.localeTag);
                        const matchedScope = roomScopes.find((scope) => scope.localeTag === option.localeTag);
                        if (matchedScope) {
                          setRoomScopeByKey(matchedScope.regionKey);
                        }
                      }}
                    >
                      <span>{option.label}</span>
                      <small>{option.languageCode.toUpperCase()}</small>
                    </button>
                  );
                })}
              </div>
              <div className="region-option-grid compact">
                {roomScopes.map((scope) => {
                  const active = roomScope.regionKey === scope.regionKey;
                  return (
                    <button
                      key={scope.regionKey}
                      type="button"
                      className={`region-option-card ${active ? 'active' : ''}`}
                      onClick={() => setRoomScopeByKey(scope.regionKey)}
                    >
                      <div className="region-option-topline">
                        <div>
                          <div className="region-option-title">{formatScopeLabel(scope)}</div>
                          <div className="region-option-subtitle">{scope.localeTag}</div>
                        </div>
                        {active && <ChevronRight size={16} color="#8fd7ff" />}
                      </div>
                      <div className="region-option-meta">
                        <span>{scope.countryCode}</span>
                        <span>{scope.languageCode.toUpperCase()}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button className="profile-logout" onClick={handleLogout}>
              <LogOut size={18} />
              {t('logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
