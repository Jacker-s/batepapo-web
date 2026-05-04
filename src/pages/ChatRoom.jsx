import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue, push, set, serverTimestamp, remove, update, get } from 'firebase/database';
import { database } from '../firebase';
import { Send, ArrowLeft, Trash2, EyeOff, Smile, Hash, Image as ImageIcon, Sticker, Reply, X } from 'lucide-react';
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
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [chatColor, setChatColor] = useState(null);

  useEffect(() => {
    // Register as joined
    set(ref(database, `user_rooms/${username}/${roomId}`), true);
    set(ref(database, `room_participants/${roomId}/${username}`), true);

    // Fetch user profile for chatColor
    get(ref(database, `users/${username}`)).then(snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setChatColor(data.chatColor || null);
      }
    });

    // Fetch room name
    const roomRef = ref(database, `rooms/${roomId}`);
    const unRoom = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setRoomName(data.name || 'Sala Anônima');
        setRoomPhotoUrl(data.photoUrl || null);
      }
    });

    // Fetch messages
    const msgsRef = ref(database, `room_messages/${roomId}`);
    const unMsgs = onValue(msgsRef, (snapshot) => {
      if (snapshot.exists()) {
        const msgsData = snapshot.val();
        const msgsList = Object.keys(msgsData).map(key => ({
          id: key,
          ...msgsData[key]
        })).sort((a, b) => a.timestamp - b.timestamp);
        
        // Filter out whispers meant for someone else
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

    // Fetch typing users - Parity with Android path 'room_typing'
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

    return () => {
      unRoom();
      unMsgs();
      unTyping();
      // Cleanup own typing status
      set(ref(database, `room_typing/${roomId}/${username}`), false);
    };
  }, [roomId, username]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Set typing to true
    set(ref(database, `room_typing/${roomId}/${username}`), true);
    
    // Clear after 2 seconds
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

    if (currentWhisper) {
      msgData.whisperTo = currentWhisper;
    }

    if (currentReply) {
      msgData.replyToId = currentReply.id;
      msgData.replyToText = currentReply.text || (currentReply.imageUrl ? '📷 Imagem' : (currentReply.stickerUrl ? '🖼️ Figurinha' : 'Mídia'));
      msgData.replyToName = currentReply.senderName;
      msgData.replyToImageUrl = currentReply.imageUrl || null;
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
    const currentWhisper = whisperTarget;
    const currentReply = replyTarget;
    setWhisperTarget(null);
    setReplyTarget(null);

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
    
    if (currentWhisper) msgData.whisperTo = currentWhisper;
    if (currentReply) {
      msgData.replyToId = currentReply.id;
      msgData.replyToText = currentReply.text || (currentReply.imageUrl ? '📷 Imagem' : (currentReply.stickerUrl ? '🖼️ Figurinha' : 'Mídia'));
      msgData.replyToName = currentReply.senderName;
      msgData.replyToImageUrl = currentReply.imageUrl || null;
    }

    try {
      await set(newMsgRef, msgData);
      if (!currentWhisper) {
         await update(ref(database, `rooms/${roomId}`), {
            lastMessage: `${username}: 🖼️ Sticker`,
            lastMessageTimestamp: serverTimestamp()
         });
      }
    } catch (err) {
      console.error("Error sending sticker: ", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      alert("Formato não suportado. Envie apenas imagens ou vídeos.");
      return;
    }

    setIsUploading(true);
    const currentWhisper = whisperTarget;
    const currentReply = replyTarget;
    setWhisperTarget(null);
    setReplyTarget(null);
    setShowEmojiPicker(false);

    try {
      const url = await uploadToCloudinarySigned(file, isVideo);
      const msgsRef = ref(database, `room_messages/${roomId}`);
      const newMsgRef = push(msgsRef);
      
      const msgData = {
        id: newMsgRef.key,
        roomId: roomId,
        senderId: username,
        senderName: username,
        text: '',
        timestamp: serverTimestamp(),
        type: isVideo ? 'VIDEO' : 'IMAGE',
        userColor: chatColor
      };
      
      if (isVideo) msgData.videoUrl = url;
      else msgData.imageUrl = url;
      if (currentWhisper) msgData.whisperTo = currentWhisper;
      if (currentReply) {
        msgData.replyToId = currentReply.id;
        msgData.replyToText = currentReply.text || (currentReply.imageUrl ? '📷 Imagem' : (currentReply.stickerUrl ? '🖼️ Figurinha' : 'Mídia'));
        msgData.replyToName = currentReply.senderName;
        msgData.replyToImageUrl = currentReply.imageUrl || null;
      }

      await set(newMsgRef, msgData);
      
      if (!currentWhisper) {
         await update(ref(database, `rooms/${roomId}`), {
            lastMessage: `${username}: 📷 Mídia`,
            lastMessageTimestamp: serverTimestamp()
         });
      }
    } catch (error) {
      console.error("Error uploading file", error);
      alert("Erro ao enviar mídia.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleDeleteMessage = async (msgId) => {
    await remove(ref(database, `room_messages/${roomId}/${msgId}`));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div className="chat-header">
        <button className="mobile-only" onClick={() => navigate('/app')} style={{ color: 'var(--text-main)', marginRight: '16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
          <ArrowLeft size={24} />
        </button>
        {roomPhotoUrl ? (
          <img src={roomPhotoUrl} alt="room avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', marginRight: '12px' }} />
        ) : (
          <div className="room-icon" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '12px', fontSize: '18px' }}>
            <Hash size={20} />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div className="chat-title">{roomName}</div>
          <div className="chat-subtitle">{messages.length} mensagens</div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map(msg => {
          const isMe = msg.senderId === username;
          return (
            <div 
              key={msg.id} 
              className="message-item"
              style={{ 
                display: 'flex', 
                gap: '8px', 
                alignSelf: isMe ? 'flex-end' : 'flex-start', 
                flexDirection: isMe ? 'row-reverse' : 'row',
                width: '100%'
              }}
            >
              <div 
                className="room-icon mobile-hidden" 
                onClick={() => { if (!isMe) navigate(`/app/chat/${msg.senderId}`); }}
                style={{ width: '36px', height: '36px', fontSize: '14px', flexShrink: 0, overflow: 'hidden', alignSelf: 'flex-end', marginBottom: '8px', cursor: isMe ? 'default' : 'pointer' }}
              >
                {msg.senderPhotoUrl ? (
                  <img src={msg.senderPhotoUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  msg.senderName.charAt(0).toUpperCase()
                )}
              </div>
              
              <div className={`message-wrapper ${isMe ? 'message-me' : 'message-other'}`} style={{ maxWidth: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                  <span className="message-sender" style={{ margin: 0 }}>{msg.senderName}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{formatTime(msg.timestamp)}</span>
                  {msg.whisperTo && <EyeOff size={12} style={{ color: 'var(--primary)' }} />}
                </div>
                
                <div 
                  className={`message-bubble ${msg.whisperTo ? 'message-whisper' : ''}`}
                  style={{ 
                    cursor: 'default',
                    backgroundColor: msg.userColor && !msg.whisperTo ? msg.userColor : undefined,
                    color: msg.userColor && !msg.whisperTo ? '#FFFFFF' : undefined,
                    position: 'relative',
                    paddingTop: msg.replyToId ? '40px' : '12px'
                  }}
                >
                  {msg.replyToId && (
                    <div style={{ 
                      position: 'absolute', top: '4px', left: '4px', right: '4px', 
                      background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '4px',
                      fontSize: '11px', borderLeft: '3px solid var(--primary)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{msg.replyToName}</div>
                      <div style={{ opacity: 0.8 }}>{msg.replyToText}</div>
                    </div>
                  )}

                  {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="media" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', marginBottom: msg.text ? '8px' : '0', objectFit: 'contain' }} />
                  )}
                  {msg.videoUrl && (
                    <video src={msg.videoUrl} controls style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', marginBottom: msg.text ? '8px' : '0', objectFit: 'contain' }} />
                  )}
                  {msg.stickerUrl && (
                    <img src={msg.stickerUrl} alt="sticker" style={{ width: '120px', height: '120px', borderRadius: '0', marginBottom: msg.text ? '8px' : '0', objectFit: 'contain', background: 'transparent' }} />
                  )}
                  {msg.text}
                  
                  <div style={{ position: 'absolute', right: isMe ? 'auto' : '-40px', left: isMe ? '-40px' : 'auto', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setReplyTarget(msg); }}
                      style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                      <Reply size={16} />
                    </button>
                    {isMe && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id); }}
                        style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {isUploading && (
          <div style={{ alignSelf: 'flex-end', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 24px' }}>
            Enviando mídia...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {typingUsers.length > 0 && (
        <div style={{ padding: '0 24px 8px', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'está' : 'estão'} digitando...
        </div>
      )}
      
      {whisperTarget && (
        <div style={{ padding: '8px 24px', backgroundColor: 'var(--bg-tertiary)', borderTop: '1px solid var(--separator)', fontSize: '12px', color: '#E1BEE7', display: 'flex', justifyContent: 'space-between' }}>
          <span>Sussurrando para: <strong>{whisperTarget}</strong></span>
          <button onClick={() => setWhisperTarget(null)} style={{ color: 'var(--text-muted)' }}>Cancelar</button>
        </div>
      )}

      {replyTarget && (
        <div style={{ padding: '8px 24px', backgroundColor: 'rgba(255, 42, 104, 0.1)', borderTop: '1px solid var(--primary)', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '8px', overflow: 'hidden' }}>
            <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Respondendo a {replyTarget.senderName}</div>
            <div style={{ opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {replyTarget.text || 'Mídia'}
            </div>
          </div>
          <button onClick={() => setReplyTarget(null)} style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="chat-input-area" style={{ position: 'relative' }}>
        {showEmojiPicker && (
          <div style={{ position: 'absolute', bottom: '80px', left: '16px', zIndex: 50 }}>
            <EmojiPicker 
              theme="dark" 
              onEmojiClick={(emojiData) => setNewMessage(prev => prev + emojiData.emoji)} 
            />
          </div>
        )}
        {showStickerPicker && (
          <StickerPicker onSelect={handleStickerSend} onClose={() => setShowStickerPicker(false)} />
        )}
        <button 
          type="button" 
          onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowStickerPicker(false); }}
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <Smile size={24} />
        </button>
        <button 
          type="button" 
          onClick={() => { setShowStickerPicker(!showStickerPicker); setShowEmojiPicker(false); }}
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}
        >
          <Sticker size={24} />
        </button>
        
        <input 
          type="file" 
          accept="image/*,video/*" 
          style={{ display: 'none' }} 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
        />
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ImageIcon size={24} />
        </button>

        <input
          type="text"
          className="chat-input"
          placeholder={whisperTarget ? `Sussurrar para ${whisperTarget}...` : "Digite sua mensagem..."}
          value={newMessage}
          onChange={handleTyping}
          onClick={() => setShowEmojiPicker(false)}
        />
        <button type="submit" className="send-button" disabled={!newMessage.trim()}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
