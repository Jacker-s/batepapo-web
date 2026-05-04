import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue, push, set, serverTimestamp, remove, update, get } from 'firebase/database';
import { database } from '../firebase';
import { Send, ArrowLeft, Trash2, Smile, Image as ImageIcon, Sticker, Reply, X, Users as UsersIcon, User, MessageCircle, EyeOff } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import StickerPicker from '../components/StickerPicker';

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
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Upload falhou");
  }
  
  const data = await response.json();
  return data.secure_url;
}

export default function ChatRoom({ username }) {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [roomPhotoUrl, setRoomPhotoUrl] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [whisperTarget, setWhisperTarget] = useState(null);
  const [replyTarget, setReplyTarget] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [chatColor, setChatColor] = useState(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    set(ref(database, `user_rooms/${username}/${roomId}`), true);
    
    get(ref(database, `users/${username}`)).then(snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setChatColor(data.chatColor || null);
      }
    });

    const roomRef = ref(database, `rooms/${roomId}`);
    const unRoom = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setRoomName(data.name || 'Sala Anônima');
        setRoomPhotoUrl(data.photoUrl || null);
      }
    });

    const msgsRef = ref(database, `room_messages/${roomId}`);
    const unMsgs = onValue(msgsRef, (snapshot) => {
      if (snapshot.exists()) {
        const msgsData = snapshot.val();
        const msgsList = Object.keys(msgsData).map(key => ({
          id: key,
          ...msgsData[key]
        })).sort((a, b) => a.timestamp - b.timestamp);
        
        const visibleMsgs = msgsList.filter(msg => 
          !msg.whisperTo || 
          msg.whisperTo === username || 
          msg.senderId === username
        );
        
        setMessages(visibleMsgs);
      } else {
        setMessages([]);
      }
    });

    const typingRef = ref(database, `room_typing/${roomId}`);
    const unTyping = onValue(typingRef, (snapshot) => {
      if (snapshot.exists()) {
        const typingData = snapshot.val();
        const typing = Object.keys(typingData).filter(key => typingData[key] === true && key !== username);
        setTypingUsers(typing);
      } else {
        setTypingUsers([]);
      }
    });

    const myParticipantRef = ref(database, `room_participants/${roomId}/${username}`);
    get(ref(database, `users/${username}`)).then(snapshot => {
      const userData = snapshot.exists() ? snapshot.val() : {};
      set(myParticipantRef, {
        id: username,
        name: userData.name || username,
        photoUrl: userData.photoUrl || null,
        joinedAt: serverTimestamp()
      });
    });

    const participantsRef = ref(database, `room_participants/${roomId}`);
    const unParticipants = onValue(participantsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.keys(data).map(k => ({ ...data[k], id: k }));
        setParticipants(list);
      } else {
        setParticipants([]);
      }
    });

    return () => {
      unRoom();
      unMsgs();
      unTyping();
      unParticipants();
      set(ref(database, `room_typing/${roomId}/${username}`), false);
      remove(myParticipantRef);
    };
  }, [roomId, username]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    set(ref(database, `room_typing/${roomId}/${username}`), true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      set(ref(database, `room_typing/${roomId}/${username}`), false);
    }, 2000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const currentMessage = newMessage.trim();
    const currentWhisper = whisperTarget;
    const currentReply = replyTarget;

    setNewMessage('');
    setWhisperTarget(null);
    setReplyTarget(null);
    setShowEmojiPicker(false);

    const msgsRef = ref(database, `room_messages/${roomId}`);
    const newMsgRef = push(msgsRef);
    
    const msgData = {
      id: newMsgRef.key,
      roomId: roomId,
      senderId: username,
      senderName: username,
      text: currentMessage,
      timestamp: serverTimestamp(),
      type: 'TEXT',
      userColor: chatColor
    };

    if (currentWhisper) msgData.whisperTo = currentWhisper;
    if (currentReply) {
      msgData.replyToId = currentReply.id;
      msgData.replyToText = currentReply.text || 'Mídia';
      msgData.replyToName = currentReply.senderName;
    }

    try {
      await set(newMsgRef, msgData);
      if (!currentWhisper) {
         await update(ref(database, `rooms/${roomId}`), {
            lastMessage: `${username}: ${currentMessage}`,
            lastMessageTimestamp: serverTimestamp()
         });
      }
    } catch (err) {
      console.error("Error sending message: ", err);
    }
  };

  const handleStickerSend = async (stickerUrl) => {
    setShowStickerPicker(false);
    const msgsRef = ref(database, `room_messages/${roomId}`);
    const newMsgRef = push(msgsRef);
    const msgData = {
      id: newMsgRef.key,
      roomId: roomId,
      senderId: username,
      senderName: username,
      text: '',
      timestamp: serverTimestamp(),
      type: 'STICKER',
      stickerUrl: stickerUrl,
      userColor: chatColor
    };
    try { await set(newMsgRef, msgData); } catch (err) { console.error(err); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadToCloudinarySigned(file, file.type.startsWith('video/'));
      const msgsRef = ref(database, `room_messages/${roomId}`);
      const newMsgRef = push(msgsRef);
      const msgData = {
        id: newMsgRef.key,
        roomId: roomId,
        senderId: username,
        senderName: username,
        text: '',
        timestamp: serverTimestamp(),
        type: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
        [file.type.startsWith('video/') ? 'videoUrl' : 'imageUrl']: url,
        userColor: chatColor
      };
      await set(newMsgRef, msgData);
    } catch (error) {
      alert("Erro ao enviar mídia.");
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleDeleteMessage = async (msgId) => {
    await remove(ref(database, `room_messages/${roomId}/${msgId}`));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div className="chat-header">
        <button className="mobile-only" onClick={() => navigate('/app')} style={{ color: 'var(--text-main)', border: 'none', background: 'none' }}>
          <ArrowLeft size={24} />
        </button>
        {roomPhotoUrl ? (
          <img src={roomPhotoUrl} alt="room" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '12px' }} />
        ) : (
          <div className="room-icon" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '12px' }}>{roomName.charAt(0)}</div>
        )}
        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setShowParticipants(true)}>
          <div className="chat-title">{roomName}</div>
          <div className="chat-subtitle" style={{ color: 'var(--primary)' }}>{participants.length} pessoas online</div>
        </div>
        <button onClick={() => setShowParticipants(true)} style={{ color: 'var(--text-main)', border: 'none', background: 'none' }}>
          <UsersIcon size={24} />
        </button>
      </div>

      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {messages.map(msg => {
          const isMe = msg.senderId === username;
          return (
            <div id={`msg-${msg.id}`} key={msg.id} className="message-item" style={{ display: 'flex', width: '100%', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
              <div className={`message-wrapper ${isMe ? 'message-me' : 'message-other'}`} style={{ maxWidth: '100%', width: '100%' }}>
                {!isMe && <div className="message-sender" style={{ marginBottom: '4px', fontSize: '12px', paddingLeft: '12px' }}>{msg.senderName}</div>}
                <div className={`message-bubble ${msg.whisperTo ? 'message-whisper' : ''}`} style={{ backgroundColor: msg.userColor && !msg.whisperTo ? msg.userColor : undefined, color: msg.userColor && !msg.whisperTo ? '#FFFFFF' : undefined, flexDirection: isMe ? 'row-reverse' : 'row' }}>
                  <div onClick={() => { if (!isMe) navigate(`/app/chat/${msg.senderId}`); }} style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, cursor: isMe ? 'default' : 'pointer', border: '2px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {msg.senderPhotoUrl ? <img src={msg.senderPhotoUrl} alt="av" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : msg.senderName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {msg.replyToId && (
                      <div onClick={(e) => { e.stopPropagation(); document.getElementById(`msg-${msg.replyToId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }} style={{ padding: '6px 10px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '6px', borderLeft: '3px solid var(--primary)', marginBottom: '8px', cursor: 'pointer', fontSize: '12px' }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{msg.replyToName}</div>
                        <div style={{ opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.replyToText}</div>
                      </div>
                    )}
                    {msg.imageUrl && <img src={msg.imageUrl} alt="media" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', marginBottom: msg.text ? '8px' : '0' }} />}
                    {msg.videoUrl && <video src={msg.videoUrl} controls style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', marginBottom: msg.text ? '8px' : '0' }} />}
                    {msg.stickerUrl && <img src={msg.stickerUrl} alt="sticker" style={{ width: '120px', height: '120px', background: 'transparent' }} />}
                    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.text}</div>
                    <div style={{ textAlign: 'right', fontSize: '10px', opacity: 0.6, marginTop: '4px' }}>{formatTime(msg.timestamp)}</div>
                  </div>
                  <div style={{ position: 'absolute', right: isMe ? 'auto' : '-44px', left: isMe ? '-44px' : 'auto', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button onClick={(e) => { e.stopPropagation(); setReplyTarget(msg); }} style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }}><Reply size={16} /></button>
                    {isMe && <button onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id); }} style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }}><Trash2 size={16} /></button>}
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
            <div style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '12px' }}>Respondendo a {replyTarget.senderName}</div>
            <div style={{ opacity: 0.8, fontSize: '12px' }}>{replyTarget.text || 'Mídia'}</div>
          </div>
          <button onClick={() => setReplyTarget(null)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }}><X size={16} /></button>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="chat-input-area" style={{ position: 'relative' }}>
        {showEmojiPicker && (
          <div style={{ position: 'absolute', bottom: '80px', left: '16px', zIndex: 50 }}><EmojiPicker theme="dark" onEmojiClick={(e) => setNewMessage(p => p + e.emoji)} /></div>
        )}
        {showStickerPicker && <StickerPicker onSelect={handleStickerSend} onClose={() => setShowStickerPicker(false)} />}
        <button type="button" onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowStickerPicker(false); }} style={{ color: showEmojiPicker ? 'var(--primary)' : 'var(--text-muted)', background: 'none', border: 'none' }}><Smile size={24} /></button>
        <button type="button" onClick={() => { setShowStickerPicker(!showStickerPicker); setShowEmojiPicker(false); }} style={{ color: showStickerPicker ? 'var(--primary)' : 'var(--text-muted)', background: 'none', border: 'none' }}><Sticker size={24} /></button>
        <button type="button" onClick={() => fileInputRef.current?.click()} style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }}><ImageIcon size={24} /></button>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" style={{ display: 'none' }} />
        <input type="text" className="chat-input" placeholder="Digite sua mensagem..." value={newMessage} onChange={handleTyping} />
        <button type="submit" className="send-button" disabled={!newMessage.trim() || isUploading}><Send size={20} /></button>
      </form>

      {showParticipants && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', width: '300px', maxWidth: '85%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--separator)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--primary)' }}>Participantes</h2>
              <button onClick={() => setShowParticipants(false)} style={{ color: 'var(--text-main)', background: 'none', border: 'none' }}><X size={24} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              {participants.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', cursor: 'pointer' }} onClick={() => { if (p.id !== username) navigate(`/app/chat/${p.id}`); }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.photoUrl ? <img src={p.photoUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={20} color="var(--text-muted)" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{p.name} {p.id === username && '(você)'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--primary)' }}>Online</div>
                  </div>
                  {p.id !== username && <MessageCircle size={18} color="var(--primary)" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
