import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { onValue, push, query, ref, remove, serverTimestamp, set, orderByChild, limitToLast } from 'firebase/database';
import { ArrowLeft, ChevronDown, MessageCircle, Reply, Send, Users, X } from 'lucide-react';
import { database } from '../firebase';
import { useAppRuntime } from '../context/AppRuntimeContext';

const messageTime = (value) => {
  const timestamp = Number(value || 0);
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const compareMessages = (a, b) => Number(a.timestamp || 0) - Number(b.timestamp || 0);

export default function ChatRoom({ username, myName, myPhoto }) {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { t } = useAppRuntime();
  const [room, setRoom] = useState({ name: 'Sala', description: '', photoUrl: null, premiumAccessLevel: 'ALL' });
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [messageLimit, setMessageLimit] = useState(80);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const messagesRef = useRef(null);
  const endRef = useRef(null);
  const typingTimerRef = useRef(null);
  const stayAtBottomRef = useRef(true);

  const isWebLocked = room.premiumAccessLevel === 'PREMIUM' || room.premiumAccessLevel === 'TURBO';

  useEffect(() => {
    const roomRef = ref(database, `rooms/${roomId}`);
    const participantRef = ref(database, `room_participants/${roomId}/${username}`);
    const messagesQuery = query(ref(database, `room_messages/${roomId}`), orderByChild('timestamp'), limitToLast(messageLimit));

    const unsubscribeRoom = onValue(roomRef, (snapshot) => {
      const value = snapshot.val() || {};
      setRoom({
        name: value.name || 'Sala',
        description: value.description || '',
        photoUrl: value.photoUrl || null,
        premiumAccessLevel: value.premiumAccessLevel || 'ALL'
      });
    });
    const unsubscribeMessages = onValue(messagesQuery, (snapshot) => {
      const nextMessages = Object.entries(snapshot.val() || {})
        .map(([id, value]) => ({ id, ...value }))
        .filter((message) => !message.whisperTo || message.whisperTo === username || message.senderId === username)
        .sort(compareMessages);
      setMessages(nextMessages);
    });
    const unsubscribeParticipants = onValue(ref(database, `room_participants/${roomId}`), (snapshot) => {
      setParticipants(Object.entries(snapshot.val() || {}).map(([id, value]) => ({ id, ...value })));
    });
    const unsubscribeTyping = onValue(ref(database, `room_typing/${roomId}`), (snapshot) => {
      setTypingUsers(Object.keys(snapshot.val() || {}).filter((id) => snapshot.val()[id] && id !== username));
    });

    if (!isWebLocked) {
      set(ref(database, `user_rooms/${username}/${roomId}`), true).catch(() => {});
      set(participantRef, { id: username, name: myName || username, photoUrl: myPhoto || null, joinedAt: serverTimestamp() }).catch(() => {});
    }

    return () => {
      unsubscribeRoom();
      unsubscribeMessages();
      unsubscribeParticipants();
      unsubscribeTyping();
      window.clearTimeout(typingTimerRef.current);
      set(ref(database, `room_typing/${roomId}/${username}`), false).catch(() => {});
      if (!isWebLocked) remove(participantRef).catch(() => {});
    };
  }, [roomId, username, myName, myPhoto, messageLimit, isWebLocked]);

  useEffect(() => {
    if (stayAtBottomRef.current) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const handleScroll = () => {
    const element = messagesRef.current;
    if (!element) return;
    const distance = element.scrollHeight - element.scrollTop - element.clientHeight;
    stayAtBottomRef.current = distance < 96;
    setShowJumpToBottom(distance >= 220);
    if (element.scrollTop <= 16 && messages.length >= messageLimit) setMessageLimit((current) => current + 60);
  };

  const updateTyping = (value) => {
    setText(value);
    set(ref(database, `room_typing/${roomId}/${username}`), Boolean(value.trim())).catch(() => {});
    window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      set(ref(database, `room_typing/${roomId}/${username}`), false).catch(() => {});
    }, 1800);
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const body = text.trim();
    if (!body || isWebLocked) return;
    const messageRef = push(ref(database, `room_messages/${roomId}`));
    await set(messageRef, {
      text: body,
      type: 'TEXT',
      timestamp: serverTimestamp(),
      senderId: username,
      senderName: myName || username,
      senderPhotoUrl: myPhoto || null,
      replyToId: replyTo?.id || null,
      replyToText: replyTo?.text || null,
      replyToSender: replyTo?.senderName || null
    });
    setText('');
    setReplyTo(null);
    set(ref(database, `room_typing/${roomId}/${username}`), false).catch(() => {});
    stayAtBottomRef.current = true;
  };

  const jumpToBottom = () => {
    stayAtBottomRef.current = true;
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    setShowJumpToBottom(false);
  };

  if (isWebLocked) {
    return (
      <section className="simple-room simple-room-locked">
        <button className="simple-room-back" onClick={() => navigate('/app')}><ArrowLeft size={20} /> Voltar para salas</button>
        <div className="simple-room-lock-card">
          <div className="simple-room-lock-icon">✦</div>
          <h1>{room.name}</h1>
          <p>Esta sala usa recursos exclusivos do app. Abra o BP para Android para participar.</p>
          <a href="https://play.google.com/store/apps/details?id=com.jack.friend" target="_blank" rel="noreferrer">Abrir na Play Store</a>
        </div>
      </section>
    );
  }

  return (
    <section className="simple-room">
      <header className="simple-room-header">
        <button className="simple-room-back" onClick={() => navigate('/app')} aria-label="Voltar"><ArrowLeft size={20} /></button>
        <div className="simple-room-avatar">
          {room.photoUrl ? <img src={room.photoUrl} alt="" /> : room.name.charAt(0).toUpperCase()}
        </div>
        <button className="simple-room-title" onClick={() => setShowParticipants(true)}>
          <strong>{room.name}</strong>
          <span>{participants.length} {t('participants')}</span>
        </button>
        <button className="simple-room-members" onClick={() => setShowParticipants(true)} aria-label="Participantes"><Users size={19} /></button>
      </header>

      {room.description && <div className="simple-room-description">{room.description}</div>}
      {typingUsers.length > 0 && <div className="simple-room-typing">{typingUsers.slice(0, 2).join(', ')} {typingUsers.length > 1 ? 'estão digitando...' : 'está digitando...'}</div>}

      <main className="simple-room-messages" ref={messagesRef} onScroll={handleScroll}>
        {messages.length === 0 && (
          <div className="simple-room-empty"><MessageCircle size={28} /><strong>A conversa começa aqui</strong><span>Envie uma mensagem para entrar na sala.</span></div>
        )}
        {messages.map((message) => <TextMessage key={message.id} message={message} isMine={message.senderId === username} onReply={setReplyTo} />)}
        <div ref={endRef} />
      </main>

      {showJumpToBottom && <button className="simple-room-jump" onClick={jumpToBottom} aria-label="Ir para a mensagem mais recente"><ChevronDown size={20} /></button>}

      <form className="simple-room-composer" onSubmit={sendMessage}>
        {replyTo && <div className="simple-room-reply"><Reply size={15} /><span>Respondendo a {replyTo.senderName || 'mensagem'}</span><button type="button" onClick={() => setReplyTo(null)}><X size={15} /></button></div>}
        <div className="simple-room-input-row">
          <input value={text} onChange={(event) => updateTyping(event.target.value)} placeholder="Escreva uma mensagem" maxLength={1200} />
          <button type="submit" disabled={!text.trim()} aria-label="Enviar mensagem"><Send size={19} /></button>
        </div>
        <small>O site envia apenas texto. Para mídias e recursos extras, use o app.</small>
      </form>

      {showParticipants && (
        <div className="sheet-backdrop" onClick={() => setShowParticipants(false)}>
          <section className="simple-room-members-sheet" onClick={(event) => event.stopPropagation()}>
            <header><div><strong>Participantes</strong><span>{participants.length} na sala</span></div><button onClick={() => setShowParticipants(false)}><X size={19} /></button></header>
            <div className="simple-room-members-list">
              {participants.map((person) => <div key={person.id} className="simple-room-member"><div>{person.photoUrl ? <img src={person.photoUrl} alt="" /> : (person.name || person.id).charAt(0)}</div><span>{person.name || person.id}</span></div>)}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function TextMessage({ message, isMine, onReply }) {
  const imageUrl = message.imageUrl || message.stickerUrl || (message.type === 'GIF' ? message.mediaUrl : null);
  const videoUrl = message.videoUrl;
  const otherMediaUrl = !imageUrl && !videoUrl && (message.fileUrl || message.mediaUrl);
  return (
    <article className={`simple-message ${isMine ? 'mine' : ''}`}>
      {!isMine && <div className="simple-message-sender">{message.senderName || message.senderId}</div>}
      <div className="simple-message-bubble">
        {message.replyToText && <div className="simple-message-quote">{message.replyToSender || 'Mensagem'}: {message.replyToText}</div>}
        {imageUrl && <img className={`simple-message-image ${message.stickerUrl ? 'sticker' : ''}`} src={imageUrl} alt="Mídia enviada" loading="lazy" />}
        {videoUrl && <video className="simple-message-video" src={videoUrl} controls preload="metadata" />}
        {otherMediaUrl && <a className="simple-message-media-link" href={otherMediaUrl} target="_blank" rel="noreferrer">Abrir mídia enviada</a>}
        {message.text && <span>{message.text}</span>}
        {!message.text && !imageUrl && !videoUrl && !otherMediaUrl && <span>Mensagem</span>}
        <div className="simple-message-footer"><time>{messageTime(message.timestamp)}</time><button onClick={() => onReply(message)} aria-label="Responder"><Reply size={13} /></button></div>
      </div>
    </article>
  );
}
