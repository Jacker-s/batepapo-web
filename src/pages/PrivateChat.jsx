import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue, push, set, serverTimestamp, remove, update, get } from 'firebase/database';
import { database } from '../firebase';
import { Send, ArrowLeft, Trash2, Smile, Image as ImageIcon, Sticker } from 'lucide-react';
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
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Upload falhou");
  }
  
  const data = await response.json();
  return data.secure_url;
}

export default function PrivateChat({ username }) {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [friendData, setFriendData] = useState({ name: friendId, photoUrl: null, isOnline: false });
  const [myData, setMyData] = useState({ photoUrl: null });
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Fetch friend data
    const friendRef = ref(database, `users/${friendId}`);
    const unFriend = onValue(friendRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setFriendData({
           name: data.name || friendId,
           photoUrl: data.photoUrl || null,
           isOnline: data.isOnline || false,
           lastActive: data.lastActive
        });
      }
    });

    // Fetch my data
    get(ref(database, `users/${username}`)).then(snap => {
      if (snap.exists()) setMyData(snap.val());
    });

    const key = chatKey(username, friendId);
    if (!key) return;

    const msgsRef = ref(database, `messages/${key}`);
    const unMsgs = onValue(msgsRef, (snapshot) => {
      if (snapshot.exists()) {
        const msgsData = snapshot.val();
        const msgsList = Object.keys(msgsData).map(k => ({
          id: k,
          ...msgsData[k]
        })).sort((a, b) => a.timestamp - b.timestamp);
        
        setMessages(msgsList);
      } else {
        setMessages([]);
      }
    });

    const typingRef = ref(database, `typing/${key}/${friendId}`);
    const unTyping = onValue(typingRef, (snapshot) => {
      if (snapshot.exists()) {
        setIsTyping(snapshot.val() === true);
      } else {
        setIsTyping(false);
      }
    });

    // Mark as read
    update(ref(database, `chats/${username}/${friendId}`), { hasUnread: false });

    return () => {
      unFriend();
      unMsgs();
      unTyping();
      set(ref(database, `typing/${key}/${username}`), false);
    };
  }, [friendId, username]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    const key = chatKey(username, friendId);
    set(ref(database, `typing/${key}/${username}`), true);
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      set(ref(database, `typing/${key}/${username}`), false);
    }, 2000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveChatSummary = async (text) => {
    // Update summary for ME
    await update(ref(database, `chats/${username}/${friendId}`), {
        friendId,
        friendName: friendData.name,
        friendPhotoUrl: friendData.photoUrl || null,
        lastMessage: text,
        lastSenderId: username,
        timestamp: serverTimestamp(),
        hasUnread: false
    });

    // Update summary for FRIEND
    await update(ref(database, `chats/${friendId}/${username}`), {
        friendId: username,
        friendName: username,
        friendPhotoUrl: myData.photoUrl || null,
        lastMessage: text,
        lastSenderId: username,
        timestamp: serverTimestamp(),
        hasUnread: true
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const currentMessage = newMessage.trim();
    setNewMessage('');
    setShowEmojiPicker(false);

    const key = chatKey(username, friendId);
    const msgsRef = ref(database, `messages/${key}`);
    const newMsgRef = push(msgsRef);
    
    const msgData = {
      id: newMsgRef.key,
      senderId: username,
      receiverId: friendId,
      senderName: username,
      text: currentMessage,
      timestamp: serverTimestamp(),
      type: 'TEXT',
      userColor: myData.chatColor
    };

    try {
      await set(newMsgRef, msgData);
      await saveChatSummary(currentMessage);
    } catch (err) {
      console.error("Error sending private message: ", err);
    }
  };

  const handleStickerSend = async (stickerUrl) => {
    setShowStickerPicker(false);
    const key = chatKey(username, friendId);
    const msgsRef = ref(database, `messages/${key}`);
    const newMsgRef = push(msgsRef);
    
    const msgData = {
      id: newMsgRef.key,
      senderId: username,
      receiverId: friendId,
      senderName: username,
      text: '',
      timestamp: serverTimestamp(),
      type: 'STICKER',
      stickerUrl: stickerUrl,
      userColor: myData.chatColor
    };

    try {
      await set(newMsgRef, msgData);
      await saveChatSummary('🖼️ Sticker');
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
    setShowEmojiPicker(false);

    try {
      const url = await uploadToCloudinarySigned(file, isVideo);
      const key = chatKey(username, friendId);
      const msgsRef = ref(database, `messages/${key}`);
      const newMsgRef = push(msgsRef);
      
      const msgData = {
        id: newMsgRef.key,
        senderId: username,
        receiverId: friendId,
        senderName: username,
        text: '',
        timestamp: serverTimestamp(),
        type: isVideo ? 'VIDEO' : 'IMAGE',
        userColor: myData.chatColor
      };
      
      if (isVideo) msgData.videoUrl = url;
      else msgData.imageUrl = url;

      await set(newMsgRef, msgData);
      await saveChatSummary('📷 Mídia');
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
    const key = chatKey(username, friendId);
    await remove(ref(database, `messages/${key}/${msgId}`));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div className="chat-header">
        <button className="mobile-only" onClick={() => navigate('/app')} style={{ color: 'var(--text-main)', marginRight: '16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
          <ArrowLeft size={24} />
        </button>
        <div className="room-icon" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '12px', fontSize: '18px', overflow: 'hidden', background: friendData.photoUrl ? 'transparent' : 'linear-gradient(135deg, #FF2A68, #FF80AB)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {friendData.photoUrl ? (
            <img src={friendData.photoUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            friendData.name.charAt(0).toUpperCase()
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div className="chat-title">{friendData.name}</div>
          <div className="chat-subtitle" style={{ color: friendData.isOnline ? '#4CAF50' : 'var(--text-muted)' }}>
            {friendData.isOnline ? 'Online' : 'Offline'}
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map(msg => {
          const isMe = msg.senderId === username;
          return (
            <div 
              key={msg.id} 
              style={{ 
                display: 'flex', 
                gap: '8px', 
                alignSelf: isMe ? 'flex-end' : 'flex-start', 
                maxWidth: '85%', 
                flexDirection: isMe ? 'row-reverse' : 'row' 
              }}
            >
              <div className={`message-wrapper ${isMe ? 'message-me' : 'message-other'}`} style={{ maxWidth: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{formatTime(msg.timestamp)}</span>
                </div>
                <div 
                  className="message-bubble"
                  style={{ 
                    backgroundColor: msg.userColor ? msg.userColor : undefined,
                    color: msg.userColor ? '#FFFFFF' : undefined
                  }}
                >
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
                  
                  {isMe && (
                     <button 
                       onClick={() => handleDeleteMessage(msg.id)}
                       style={{ position: 'absolute', right: isMe ? 'auto' : '-30px', left: isMe ? '-30px' : 'auto', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                     >
                       <Trash2 size={16} />
                     </button>
                  )}
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
      
      {isTyping && (
        <div style={{ padding: '0 24px 8px', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          {friendData.name} está digitando...
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
          placeholder="Digite sua mensagem..."
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
