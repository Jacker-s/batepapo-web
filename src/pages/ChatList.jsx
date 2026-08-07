import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../firebase';
import { MessageSquare, Search, X, Trash2 } from 'lucide-react';
import { useAppRuntime } from '../context/AppRuntimeContext';

export default function ChatList({ username }) {
  const { t } = useAppRuntime();
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { friendId: activeId } = useParams();

  useEffect(() => {
    const unsub = onValue(ref(database, `chats/${username}`), (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        setChats(
          Object.keys(data)
            .map(k => ({ id: k, ...data[k] }))
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        );
      } else {
        setChats([]);
      }
    });
    return () => unsub();
  }, [username]);

  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  };

  const chatKey = (u1, u2) => {
    const a = (u1 || '').toUpperCase().trim();
    const b = (u2 || '').toUpperCase().trim();
    return a < b ? `${a}_${b}` : `${b}_${a}`;
  };

  const handleDeleteChat = async (e, fId) => {
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm('Deseja apagar esta conversa?')) return;
    const me = username.toUpperCase();
    const friend = fId.toUpperCase();
    const key = chatKey(me, friend);
    try {
      await set(ref(database, `messages/${key}`), null);
      await set(ref(database, `chats/${me}/${friend}`), null);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = useMemo(() =>
    chats.filter(c =>
      !searchQuery ||
      (c.friendName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.id || '').toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [chats, searchQuery]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>

      {/* Header */}
      <div style={{
        padding: '18px 20px 0',
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(15,15,19,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{
          fontSize: '22px', fontWeight: 900, letterSpacing: '1px', marginBottom: '16px',
          background: 'linear-gradient(90deg, #FF2A68, rgba(255,42,104,0.6))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          {t('conversations').toUpperCase()}
        </div>

        {/* Search */}
        <div className="search-bar" style={{ margin: '0 0 14px' }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder={t('searchConversations')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}><X size={14} /></button>
          )}
        </div>
      </div>

      {/* List */}
      <div style={{ padding: '8px 10px 40px' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <MessageSquare size={48} style={{ opacity: 0.15, marginBottom: '12px' }} />
            <div style={{ fontSize: '15px' }}>
              {searchQuery ? t('noSearchResults') : t('noConversations')}
            </div>
          </div>
        ) : (
          filtered.map(chat => (
            <ChatRow
              key={chat.id}
              chat={chat}
              username={username}
              isActive={activeId === chat.id}
              formatTime={formatTime}
              onOpen={() => navigate(`/app/chat/${chat.id}`)}
              onDelete={e => handleDeleteChat(e, chat.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ChatRow({ chat, username, isActive, formatTime, onOpen, onDelete }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`chat-row ${isActive ? 'active' : ''}`}
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ marginBottom: '2px' }}
    >
      {/* Avatar */}
      <div style={{
        width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: chat.friendPhotoUrl ? 'transparent' : 'linear-gradient(135deg, #FF2A68 0%, #ff80ab 100%)',
        color: 'white', fontWeight: 800, fontSize: '19px',
        border: '2px solid rgba(255,255,255,0.06)'
      }}>
        {chat.friendPhotoUrl
          ? <img src={chat.friendPhotoUrl} alt="av" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : (chat.friendName || chat.id).charAt(0).toUpperCase()
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
          <span className="chat-row-name">{chat.friendName || chat.id}</span>
          <span className="chat-row-time">{formatTime(chat.timestamp)}</span>
        </div>
        <div className="chat-row-preview" style={{
          color: chat.hasUnread ? 'var(--primary)' : 'var(--text-secondary)',
          fontWeight: chat.hasUnread ? 700 : 400
        }}>
          {chat.lastSenderId === username ? 'Você: ' : ''}{chat.lastMessage || '...'}
        </div>
      </div>

      {/* Unread badge or delete */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
        {chat.hasUnread && (
          <div className="unread-badge">●</div>
        )}
        {(hovered || isActive) && (
          <button
            onClick={onDelete}
            style={{
              color: 'rgba(255,82,82,0.5)', background: 'none',
              border: 'none', padding: '4px', borderRadius: '8px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#FF5252'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,82,82,0.5)'}
            title="Apagar conversa"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
