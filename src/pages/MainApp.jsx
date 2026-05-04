import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import RoomList from './RoomList';
import ChatList from './ChatList';
import ChatRoom from './ChatRoom';
import PrivateChat from './PrivateChat';
import { LogOut, MessageSquare } from 'lucide-react';
import { auth, database } from '../firebase';
import { ref, remove } from 'firebase/database';

export default function MainApp({ user, username }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' or 'chats'
  
  const handleLogout = async () => {
    try {
      // 1. Delete user node to free up username
      await remove(ref(database, `users/${username}`));
      // 2. Delete UID mapping
      if (user?.uid) {
        await remove(ref(database, `uid_to_username/${user.uid}`));
      }
      // 3. Sign out
      await auth.signOut();
      navigate('/');
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
      // Fallback signout
      await auth.signOut();
      navigate('/');
    }
  };

  const isChatOpen = location.pathname.includes('/app/room/') || location.pathname.includes('/app/chat/');

  return (
    <div className="app-container" style={{ minHeight: 0 }}>
      {/* Sidebar - Hidden on mobile if chat is open */}
      <div className={`sidebar ${isChatOpen ? 'hidden-on-mobile' : ''}`}>
        <div className="room-header" style={{ borderBottom: 'none', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="room-icon" style={{ width: '40px', height: '40px', fontSize: '16px' }}>
              {username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="room-header-title" style={{ fontSize: '16px' }}>{username}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Online</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}>
            <LogOut size={20} />
          </button>
        </div>
        
        {/* Tab Toggle */}
        <div style={{ display: 'flex', padding: '0 16px', borderBottom: '1px solid var(--separator)' }}>
          <button 
            onClick={() => setActiveTab('rooms')}
            style={{ 
              flex: 1, padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer',
              fontWeight: 'bold', fontSize: '14px', color: activeTab === 'rooms' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'rooms' ? '2px solid var(--primary)' : '2px solid transparent'
            }}
          >
            SALAS
          </button>
          <button 
            onClick={() => setActiveTab('chats')}
            style={{ 
              flex: 1, padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer',
              fontWeight: 'bold', fontSize: '14px', color: activeTab === 'chats' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'chats' ? '2px solid var(--primary)' : '2px solid transparent'
            }}
          >
            CONVERSAS
          </button>
        </div>
        
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          {activeTab === 'rooms' ? <RoomList username={username} /> : <ChatList username={username} />}
        </div>
      </div>

      {/* Main Content */}
      <div className={`main-content ${!isChatOpen ? 'hidden-on-mobile' : ''}`}>
        <Routes>
          <Route 
            path="/" 
            element={
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 0, color: 'var(--text-muted)' }}>
                <MessageSquare size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <h2>Selecione uma sala ou conversa para começar</h2>
              </div>
            } 
          />
          <Route path="room/:roomId" element={<ChatRoom username={username} />} />
          <Route path="chat/:friendId" element={<PrivateChat username={username} />} />
        </Routes>
      </div>
    </div>
  );
}
