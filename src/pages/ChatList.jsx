import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import { MessageSquare } from 'lucide-react';

export default function ChatList({ username }) {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();
  const { friendId } = useParams();

  useEffect(() => {
    const chatsRef = ref(database, `chats/${username}`);
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const chatList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        setChats(chatList);
      } else {
        setChats([]);
      }
    });

    return () => unsubscribe();
  }, [username]);

  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '13px', letterSpacing: '1px' }}>
        MENSAGENS DIRETAS
      </div>
      <div className="room-list">
        {chats.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhuma conversa ainda.
          </div>
        ) : (
          chats.map(chat => (
            <div 
              key={chat.id} 
              className={`room-item ${friendId === chat.id ? 'active' : ''}`}
              onClick={() => navigate(`/app/chat/${chat.id}`)}
            >
              <div className="room-icon" style={{ overflow: 'hidden', background: chat.friendPhotoUrl ? 'transparent' : 'linear-gradient(135deg, #FF2A68, #FF80AB)', color: 'white' }}>
                {chat.friendPhotoUrl ? (
                  <img src={chat.friendPhotoUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '18px' }}>{(chat.friendName || chat.id).charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="room-info" style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="room-name">{chat.friendName || chat.id}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{formatTime(chat.timestamp)}</div>
                </div>
                <div className="room-last-msg" style={{ color: chat.hasUnread ? 'var(--primary)' : 'var(--text-muted)', fontWeight: chat.hasUnread ? 'bold' : 'normal' }}>
                  {chat.lastSenderId === username ? 'Você: ' : ''}{chat.lastMessage}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
