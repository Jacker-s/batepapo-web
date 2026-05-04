import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue, push, set, serverTimestamp, remove, update, get } from 'firebase/database';
import { database } from '../firebase';
import { Send, ArrowLeft, Trash2, Smile, Image as ImageIcon, Sticker, Reply, X, User } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import StickerPicker from '../components/StickerPicker';

const chatKey = (u1, u2) => {
  if (!u1 || !u2) return '';
  const a = u1.toUpperCase().trim();
  const b = u2.toUpperCase().trim();
  return a < b ? `${a}_${b}` : `${b}_${a}`;
};

async function uploadToCloudinarySigned(file, isVideo) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const apiSecret = "CKubGcQuYFyGat2n5I0Q0eZi-QQ";
  const apiKey = "515648516698279";
  const cloudName = "dagdvifyz";
  const str = `timestamp=${timestamp}${apiSecret}`;
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const formData = new FormData();
  formData.append('file', file);
  formData.append('timestamp', timestamp);
  formData.append('api_key', apiKey);
  formData.append('signature', signature);
  const resourceType = isVideo ? 'video' : 'image';
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
    method: 'POST',
    body: formData
  });
  if (!response.ok) throw new Error("Upload falhou");
  const data = await response.json();
  return data.secure_url;
}

export default function PrivateChat({ username }) {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [friendData, setFriendData] = useState({ name: friendId, photoUrl: null, isOnline: false });
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const [chatColor, setChatColor] = useState(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const friendRef = ref(database, `users/${friendId}`);
    onValue(friendRef, (snap) => {
      if (snap.exists()) setFriendData({ ...snap.val(), id: friendId });
    });

    get(ref(database, `users/${username}`)).then(snap => {
      if (snap.exists()) setChatColor(snap.val().chatColor || null);
    });

    const key = chatKey(username, friendId);
    if (!key) return;

    const msgsRef = ref(database, `messages/${key}`);
    onValue(msgsRef, (snap) => {
      if (snap.exists()) {
        const list = Object.keys(snap.val()).map(k => ({ id: k, ...snap.val()[k] })).sort((a, b) => a.timestamp - b.timestamp);
        setMessages(list);
      } else setMessages([]);
    });

    const typingRef = ref(database, `typing/${key}/${friendId}`);
    onValue(typingRef, (snap) => setIsTyping(snap.exists() && snap.val() === true));

    update(ref(database, `chats/${username}/${friendId}`), { hasUnread: false });

    return () => {
      set(ref(database, `typing/${key}/${username}`), false);
    };
  }, [friendId, username]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    const key = chatKey(username, friendId);
    set(ref(database, `typing/${key}/${username}`), true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => set(ref(database, `typing/${key}/${username}`), false), 2000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveChatSummary = async (text) => {
    const summary = {
      friendId,
      friendName: friendData.name,
      friendPhotoUrl: friendData.photoUrl || null,
      lastMessage: text,
      lastSenderId: username,
      timestamp: serverTimestamp(),
      hasUnread: false
    };
    await update(ref(database, `chats/${username}/${friendId}`), summary);
    await update(ref(database, `chats/${friendId}/${username}`), {
      ...summary,
      friendId: username,
      friendName: username, // Would be better to get my name
      hasUnread: true
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const text = newMessage.trim();
    const reply = replyTarget;
    setNewMessage('');
    setReplyTarget(null);
    setShowEmojiPicker(false);

    const key = chatKey(username, friendId);
    const newMsgRef = push(ref(database, `messages/${key}`));
    const msgData = {
      id: newMsgRef.key,
      senderId: username,
      text,
      timestamp: serverTimestamp(),
      type: 'TEXT',
      userColor: chatColor
    };
    if (reply) {
      msgData.replyToId = reply.id;
      msgData.replyToText = reply.text || 'Mídia';
      msgData.replyToName = isMe(reply.senderId) ? 'Você' : friendData.name;
    }
    await set(newMsgRef, msgData);
    await saveChatSummary(text);
  };

  const handleStickerSend = async (stickerUrl) => {
    setShowStickerPicker(false);
    const key = chatKey(username, friendId);
    const newMsgRef = push(ref(database, `messages/${key}`));
    await set(newMsgRef, {
      id: newMsgRef.key,
      senderId: username,
      text: '',
      stickerUrl,
      timestamp: serverTimestamp(),
      type: 'STICKER',
      userColor: chatColor
    });
    await saveChatSummary('🖼️ Figurinha');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const isVideo = file.type.startsWith('video/');
      const url = await uploadToCloudinarySigned(file, isVideo);
      const key = chatKey(username, friendId);
      const newMsgRef = push(ref(database, `messages/${key}`));
      const msgData = {
        id: newMsgRef.key,
        senderId: username,
        text: '',
        timestamp: serverTimestamp(),
        type: isVideo ? 'VIDEO' : 'IMAGE',
        [isVideo ? 'videoUrl' : 'imageUrl']: url,
        userColor: chatColor
      };
      await set(newMsgRef, msgData);
      await saveChatSummary('📷 Mídia');
    } catch (err) { alert("Erro no upload"); }
    finally { setIsUploading(false); }
  };

  const isMe = (id) => id === username;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div className="chat-header">
        <button className="mobile-only" onClick={() => navigate('/app/conversations')} style={{ color: 'var(--text-main)', border: 'none', background: 'none' }}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', marginRight: '12px' }}>
          {friendData.photoUrl ? <img src={friendData.photoUrl} alt="av" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div className="room-icon" style={{ width: '100%', height: '100%' }}>{friendData.name.charAt(0)}</div>}
        </div>
        <div style={{ flex: 1 }}>
          <div className="chat-title">{friendData.name}</div>
          <div className="chat-subtitle" style={{ color: friendData.isOnline ? 'var(--primary)' : 'var(--text-muted)' }}>
            {isTyping ? 'Digitando...' : (friendData.isOnline ? 'Online' : 'Offline')}
          </div>
        </div>
      </div>

      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {messages.map(msg => {
          const me = isMe(msg.senderId);
          return (
            <div id={`msg-${msg.id}`} key={msg.id} className="message-item" style={{ display: 'flex', width: '100%', justifyContent: me ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
              <div className={`message-wrapper ${me ? 'message-me' : 'message-other'}`} style={{ maxWidth: '100%', width: '100%' }}>
                <div className="message-bubble" style={{ backgroundColor: msg.userColor ? msg.userColor : undefined, color: msg.userColor ? '#FFFFFF' : undefined, flexDirection: me ? 'row-reverse' : 'row' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {(me ? null : friendData.photoUrl) ? <img src={friendData.photoUrl} alt="av" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (me ? 'EU' : friendData.name.charAt(0))}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {msg.replyToId && (
                      <div onClick={() => document.getElementById(`msg-${msg.replyToId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })} style={{ padding: '6px 10px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '6px', borderLeft: '3px solid var(--primary)', marginBottom: '8px', cursor: 'pointer', fontSize: '12px' }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{msg.replyToName}</div>
                        <div style={{ opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.replyToText}</div>
                      </div>
                    )}
                    {msg.imageUrl && <img src={msg.imageUrl} alt="m" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />}
                    {msg.videoUrl && <video src={msg.videoUrl} controls style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />}
                    {msg.stickerUrl && <img src={msg.stickerUrl} alt="s" style={{ width: '120px', height: '120px' }} />}
                    {msg.text && <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.text}</div>}
                  </div>
                  <div style={{ position: 'absolute', right: me ? 'auto' : '-44px', left: me ? '-44px' : 'auto', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button onClick={() => setReplyTarget(msg)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }}><Reply size={16} /></button>
                    {me && <button onClick={async () => remove(ref(database, `messages/${chatKey(username, friendId)}/${msg.id}`))} style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }}><Trash2 size={16} /></button>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {isUploading && <div style={{ padding: '8px 24px', fontSize: '12px', color: 'var(--text-muted)' }}>Enviando mídia...</div>}
      
      {replyTarget && (
        <div style={{ padding: '8px 24px', backgroundColor: 'rgba(255, 42, 104, 0.1)', borderTop: '1px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '8px' }}>
            <div style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '12px' }}>Respondendo</div>
            <div style={{ opacity: 0.8, fontSize: '12px' }}>{replyTarget.text || 'Mídia'}</div>
          </div>
          <button onClick={() => setReplyTarget(null)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }}><X size={16} /></button>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="chat-input-area">
        <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }}><Smile size={24} /></button>
        <button type="button" onClick={() => setShowStickerPicker(!showStickerPicker)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }}><Sticker size={24} /></button>
        <button type="button" onClick={() => fileInputRef.current?.click()} style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }}><ImageIcon size={24} /></button>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" style={{ display: 'none' }} />
        <input type="text" className="chat-input" placeholder="Digite sua mensagem..." value={newMessage} onChange={handleTyping} />
        <button type="submit" className="send-button" disabled={!newMessage.trim() || isUploading}><Send size={20} /></button>
      </form>
      {showEmojiPicker && <div style={{ position: 'absolute', bottom: '80px', left: '16px', zIndex: 50 }}><EmojiPicker theme="dark" onEmojiClick={(e) => setNewMessage(p => p + e.emoji)} /></div>}
      {showStickerPicker && <StickerPicker onSelect={handleStickerSend} onClose={() => setShowStickerPicker(false)} />}
    </div>
  );
}
