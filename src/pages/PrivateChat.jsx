import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ref, onValue, push, set, serverTimestamp, remove,
  update, get, query, orderByChild, limitToLast
} from 'firebase/database';
import { database } from '../firebase';
import {
  Send, ArrowLeft, Smile, Image as ImageIcon,
  Reply, X, Trash2, ChevronDown, Mic, Zap, Lock, Flame
} from 'lucide-react';
import GifPicker from '../components/GifPicker';
import PrankPicker from '../components/PrankPicker';
import RoomAnimationOverlay from '../components/RoomAnimationOverlay';
import AnimatedEmojiMessage from '../components/AnimatedEmojiMessage';
import MetaEmojiPickerWeb from '../components/MetaEmojiPickerWeb';
import { useAppRuntime } from '../context/AppRuntimeContext';
import {
  buildPrivatePrankMessage,
  PRANK_COMMAND_TO_ANIMATION
} from '../lib/pranks';
import { isSingleEmojiMessage } from '../lib/animatedEmoji';

const chatKey = (u1, u2) => {
  if (!u1 || !u2) return '';
  const a = u1.toUpperCase().trim();
  const b = u2.toUpperCase().trim();
  return a < b ? `${a}_${b}` : `${b}_${a}`;
};

const compareMessages = (a, b) => {
  const timeA = Number(a?.timestamp || 0);
  const timeB = Number(b?.timestamp || 0);
  if (timeA !== timeB) return timeA - timeB;
  return String(a?.id || '').localeCompare(String(b?.id || ''));
};

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

export default function PrivateChat({ username, myName, myPhoto }) {
  const { friendId: rawFriendId } = useParams();
  const friendId = rawFriendId?.toUpperCase();
  const navigate = useNavigate();
  const { t, localeTag, canUseTurboFeature } = useAppRuntime();

  const [messages, setMessages] = useState([]);
  const [friendData, setFriendData] = useState({ name: friendId, photoUrl: null, isOnline: false });
  const [myChatColor, setMyChatColor] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showPrankPicker, setShowPrankPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFriendTyping, setIsFriendTyping] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const [msgLimit, setMsgLimit] = useState(50);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [activeAnimationType, setActiveAnimationType] = useState(null);
  const DURATION_OPTIONS = [5, 10, 20, 30, 60];
  const [secretSeconds, setSecretSeconds] = useState(0);
  const [showDurationMenu, setShowDurationMenu] = useState(false);

  const canUsePrivateChat = canUseTurboFeature('privateMessagesEnabled');
  const canUsePrivateMedia = canUseTurboFeature('roomMediaEnabled');

  const typingTimer = useRef(null);
  const messagesEnd = useRef(null);
  const chatRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const seenAnimationMessageId = useRef(null);
  const hasPrimedAnimationFeed = useRef(false);

  // ── Listeners ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!friendId) return;

    // Friend profile
    const unFriend = onValue(ref(database, `users/${friendId}`), snap => {
      if (snap.exists()) setFriendData({ id: friendId, ...snap.val() });
    });

    // My color
    get(ref(database, `users/${username}/chatColor`)).then(snap => {
      if (snap.exists()) setMyChatColor(snap.val());
    });

    const key = chatKey(username, friendId);

    // Messages
    const msgsQ = query(ref(database, `messages/${key}`), orderByChild('timestamp'), limitToLast(msgLimit));
    const unMsgs = onValue(msgsQ, snap => {
      if (snap.exists()) {
        setMessages(
          Object.keys(snap.val())
            .map(k => ({ id: k, ...snap.val()[k] }))
            .sort(compareMessages)
        );
      } else setMessages([]);
    });

    // Typing
    const unTyping = onValue(ref(database, `typing/${key}/${friendId}`), snap => {
      setIsFriendTyping(snap.exists() && snap.val() === true);
    });

    // Mark as read
    update(ref(database, `chats/${username}/${friendId}`), { hasUnread: false });

    return () => {
      unFriend(); unMsgs(); unTyping();
      set(ref(database, `typing/${key}/${username}`), false);
    };
  }, [friendId, username, msgLimit]);

  // Auto-scroll
  useEffect(() => {
    if (isNearBottom) messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isNearBottom]);

  useEffect(() => {
    const latestAnimation = [...messages]
      .reverse()
      .find((message) => String(message.type || '').startsWith('ANIMATION_'));

    if (!latestAnimation) return;
    if (!hasPrimedAnimationFeed.current) {
      hasPrimedAnimationFeed.current = true;
      seenAnimationMessageId.current = latestAnimation.id;
      return;
    }
    if (latestAnimation.id === seenAnimationMessageId.current) return;
    seenAnimationMessageId.current = latestAnimation.id;
    setActiveAnimationType(latestAnimation.type);
  }, [messages]);

  // Recording timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `audio_${Date.now()}.webm`, { type: 'audio/webm' });
        setIsUploading(true);
        try {
          const url = await uploadToR2(audioFile);
          const key = chatKey(username, friendId);
          const msgRef = push(ref(database, `messages/${key}`));
          const curReply = replyTarget;
          setReplyTarget(null);

          const msg = {
            id: msgRef.key,
            senderId: username.toUpperCase(),
            receiverId: friendId,
            text: '', timestamp: serverTimestamp(), type: 'AUDIO',
            userColor: myChatColor,
            senderName: myName || username, isRead: false,
            audioUrl: url
          };
          if (curReply) {
            msg.replyToId = curReply.id;
            msg.replyToText = curReply.text || (curReply.type === 'AUDIO' ? '🎤 Áudio' : 'Mídia');
            msg.replyToName = isMe(curReply.senderId) ? 'Você' : friendData.name;
          }
          if (secretSeconds > 0) { msg.tempDurationMillis = secretSeconds * 1000; setSecretSeconds(0); }

          await set(msgRef, msg);
          await saveChatSummary('🎤 Áudio');
        } catch (err) {
          alert('Erro ao enviar mensagem de voz.');
        } finally {
          setIsUploading(false);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);
    } catch (err) {
      alert('Permissão de microfone negada ou indisponível.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.onstop = () => {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleScroll = () => {
    if (!chatRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatRef.current;
    const near = scrollHeight - scrollTop - clientHeight < 120;
    setIsNearBottom(near);
    setShowScrollBtn(!near);
    if (scrollTop === 0 && messages.length >= msgLimit) setMsgLimit(p => p + 50);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    const key = chatKey(username, friendId);
    set(ref(database, `typing/${key}/${username}`), true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      set(ref(database, `typing/${key}/${username}`), false);
    }, 2500);
  };

  const saveChatSummary = async (text) => {
    const me = username.toUpperCase();
    const friend = friendId.toUpperCase();
    const summaryBase = {
      lastMessage: text, lastSenderId: me,
      timestamp: serverTimestamp()
    };
    await update(ref(database, `chats/${me}/${friend}`), {
      ...summaryBase, friendId: friend,
      friendName: friendData.name || friendId,
      friendPhotoUrl: friendData.photoUrl || null,
      hasUnread: false
    }).catch(() => {});
    await update(ref(database, `chats/${friend}/${me}`), {
      ...summaryBase, friendId: me,
      friendName: myName || username,
      friendPhotoUrl: myPhoto || null,
      hasUnread: true
    }).catch(() => {});
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = newMessage.trim();
    if (!text) return;

    const curReply = replyTarget;
    setNewMessage(''); setReplyTarget(null);
    setShowEmojiPicker(false); setIsNearBottom(true);
    set(ref(database, `typing/${chatKey(username, friendId)}/${username}`), false);

    const key = chatKey(username, friendId);
    const msgRef = push(ref(database, `messages/${key}`));
    const msg = {
      id: msgRef.key,
      senderId: username.toUpperCase(),
      receiverId: friendId,
      text, timestamp: serverTimestamp(), type: 'TEXT',
      userColor: myChatColor,
      senderName: myName || username, isRead: false
    };
    if (curReply) {
      msg.replyToId = curReply.id;
      msg.replyToText = curReply.text || 'Mídia';
      msg.replyToName = isMe(curReply.senderId) ? 'Você' : friendData.name;
    }
    if (secretSeconds > 0) { msg.tempDurationMillis = secretSeconds * 1000; setSecretSeconds(0); }

    await set(msgRef, msg);
    await saveChatSummary(text);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!canUsePrivateMedia) {
      alert(`${t('turbo')} required`);
      e.target.value = '';
      return;
    }
    setIsUploading(true);
    try {
      const isVideo = file.type.startsWith('video/');
      const url = await uploadToR2(file);
      const key = chatKey(username, friendId);
      const msgRef = push(ref(database, `messages/${key}`));
      const mediaMsg = {
        id: msgRef.key,
        senderId: username.toUpperCase(), receiverId: friendId,
        text: '', timestamp: serverTimestamp(),
        type: isVideo ? 'VIDEO' : 'IMAGE',
        ...(isVideo ? { videoUrl: url } : { imageUrl: url }),
        userColor: myChatColor, senderName: myName || username, isRead: false
      };
      if (secretSeconds > 0) { mediaMsg.tempDurationMillis = secretSeconds * 1000; setSecretSeconds(0); }
      await set(msgRef, mediaMsg);
      await saveChatSummary(isVideo ? '🎥 Vídeo' : '📷 Imagem');
    } catch { alert('Erro ao enviar mídia'); }
    finally { setIsUploading(false); e.target.value = ''; }
  };

  const handleSendGif = async (gifUrl) => {
    if (!canUsePrivateMedia) return;
    const key = chatKey(username, friendId);
    const msgRef = push(ref(database, `messages/${key}`));
    const gifMsg = {
      id: msgRef.key,
      senderId: username.toUpperCase(), receiverId: friendId,
      text: '', timestamp: serverTimestamp(), type: 'GIF',
      imageUrl: gifUrl, senderName: myName || username, isRead: false,
      userColor: myChatColor
    };
    if (secretSeconds > 0) { gifMsg.tempDurationMillis = secretSeconds * 1000; setSecretSeconds(0); }
    await set(msgRef, gifMsg);
    await saveChatSummary('🎞️ GIF');
  };

  const handleSendPrank = async ({ prank }) => {
    if (!canUsePrivateMedia) return;
    const key = chatKey(username, friendId);
    const msgRef = push(ref(database, `messages/${key}`));
    const senderName = myName || username;
    const animationType = PRANK_COMMAND_TO_ANIMATION[prank.command] || null;
    const text = buildPrivatePrankMessage(prank, senderName, friendData.name || friendId);
    await set(msgRef, {
      id: msgRef.key,
      senderId: username.toUpperCase(), receiverId: friendId,
      text,
      timestamp: serverTimestamp(),
      type: animationType || 'FUN',
      userColor: myChatColor,
      prankId: prank.id,
      prankEmoji: prank.emoji,
      prankTitle: prank.title,
      prankCommand: prank.command,
      senderName: myName || username,
      isRead: false
    });
    await saveChatSummary(`${prank.emoji} ${prank.title}`);
    setShowPrankPicker(false);
  };

  const handleDeleteChat = async () => {
    if (!confirm('Deseja apagar esta conversa?')) return;
    const key = chatKey(username, friendId);
    await set(ref(database, `messages/${key}`), null).catch(() => {});
    await set(ref(database, `chats/${username}/${friendId}`), null).catch(() => {});
    navigate('/app');
  };

  const handleDeleteMessage = (msgId) => {
    const key = chatKey(username, friendId);
    remove(ref(database, `messages/${key}/${msgId}`));
  };

  const isMe = (id) => (id || '').toUpperCase() === username.toUpperCase();
  if (!canUsePrivateChat) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div className="chat-header">
          <button className="mobile-only" onClick={() => navigate('/app')} style={{ color: 'var(--text-secondary)', padding: '4px' }}>
            <ArrowLeft size={22} />
          </button>
          <div style={{ flex: 1 }}>
            <div className="chat-title">{friendData.name || friendId}</div>
            <div className="chat-subtitle">{t('premium')} / {t('turbo')}</div>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px' }}>
          <div style={{
            maxWidth: '440px',
            width: '100%',
            borderRadius: '28px',
            padding: '28px',
            background: 'linear-gradient(135deg, rgba(255,196,97,0.14), rgba(255,255,255,0.03))',
            border: '1px solid rgba(255,196,97,0.2)',
            textAlign: 'center'
          }}>
            <div style={{ width: '66px', height: '66px', borderRadius: '24px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,196,97,0.12)', color: '#ffd269' }}>
              <Lock size={28} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, marginBottom: '10px' }}>{t('turboReady')}</div>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              PVs no site seguem a mesma logica de acesso do app quando esse recurso estiver protegido por Turbo.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="desktop-chat-shell" style={{ height: '100%', minHeight: 0 }}>
      <div className="desktop-chat-main" style={{ display: 'flex', flexDirection: 'column', position: 'relative', inset: 0, overflow: 'hidden' }}>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="chat-header">
          <button className="mobile-only" onClick={() => navigate('/app')} style={{ color: 'var(--text-secondary)', padding: '4px' }}>
            <ArrowLeft size={22} />
          </button>

          <div style={{
            width: '42px', height: '42px', borderRadius: '50%',
            overflow: 'hidden', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: friendData.photoUrl ? 'transparent' : 'linear-gradient(135deg, #FF2A68, #ff80ab)',
            color: 'white', fontWeight: 800, fontSize: '17px',
            border: '2px solid rgba(255,255,255,0.08)'
          }}>
            {friendData.photoUrl
              ? <img src={friendData.photoUrl} alt="av" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (friendData.name || friendId).charAt(0).toUpperCase()
            }
          </div>

          <div style={{ flex: 1 }}>
            <div className="chat-title">{friendData.name || friendId}</div>
            <div className="chat-subtitle" style={{
              color: isFriendTyping ? '#4CAF50' : (friendData.isOnline ? 'var(--primary)' : 'var(--text-muted)')
            }}>
              {isFriendTyping ? t('typing') : (friendData.isOnline ? `● ${t('online')}` : t('offline'))}
            </div>
          </div>

          <button
            onClick={handleDeleteChat}
          title={t('deleteConversation')}
            style={{ color: 'rgba(255,82,82,0.5)', padding: '8px', borderRadius: '12px', background: 'rgba(255,82,82,0.06)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#FF5252'; e.currentTarget.style.background = 'rgba(255,82,82,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,82,82,0.5)'; e.currentTarget.style.background = 'rgba(255,82,82,0.06)'; }}
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* ── Messages ───────────────────────────────────────────────────────── */}
        <div className="chat-messages" ref={chatRef} onScroll={handleScroll}>
          {messages.map(msg => {
            const mine = isMe(msg.senderId);
            return (
              <PrivateBubble
                key={msg.id}
                msg={msg}
                isMe={mine}
                friendData={friendData}
                myPhoto={myPhoto}
                onReply={() => { setReplyTarget(msg); inputRef.current?.focus(); }}
                onDelete={() => handleDeleteMessage(msg.id)}
                formatTime={formatTime}
              />
            );
          })}
          <div ref={messagesEnd} />
        </div>

      {/* Scroll to bottom */}
        {showScrollBtn && (
        <button
          onClick={() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); setIsNearBottom(true); setShowScrollBtn(false); }}
          style={{
            position: 'absolute', bottom: '90px', right: '20px',
            width: '38px', height: '38px', borderRadius: '50%',
            background: 'var(--primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(255,42,104,0.4)', zIndex: 5
          }}
        >
          <ChevronDown size={20} />
        </button>
        )}

        {isUploading && (
          <div style={{ padding: '6px 20px', fontSize: '12px', color: 'var(--primary)', borderTop: '1px solid var(--separator)' }}>
            {t('uploading')}
          </div>
        )}

        {/* Secret mode banner */}
        {secretSeconds > 0 && (
          <div style={{
            padding: '6px 20px', fontSize: '12px', color: '#FF4500', fontWeight: 700,
            borderTop: '1px solid rgba(255,69,0,0.25)',
            background: 'rgba(255,69,0,0.08)',
            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
          }}
            onClick={() => { setSecretSeconds(0); setShowDurationMenu(false); }}>
            <Flame size={14} /> Modo Secreto · {secretSeconds}s 🔥
          </div>
        )}

      {/* Reply banner */}
        {replyTarget && (
          <div className="reply-banner">
            <div className="reply-bar">
              <div className="reply-name">{t('replyingTo')} {isMe(replyTarget.senderId) ? t('you') : friendData.name}</div>
              <div className="reply-text">{replyTarget.text || t('media')}</div>
            </div>
            <button onClick={() => setReplyTarget(null)} style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
              <X size={16} />
            </button>
          </div>
        )}

      {/* ── Input area ─────────────────────────────────────────────────────── */}
        <form onSubmit={handleSend} className="chat-input-area">
        {showEmojiPicker && (
          <div style={{ position: 'absolute', bottom: '70px', left: '16px', zIndex: 50 }}>
            <MetaEmojiPickerWeb onEmojiClick={(e) => setNewMessage(p => p + e.emoji)} height={350} width={300} />
          </div>
        )}
        {showGifPicker && (
          <GifPicker onSelect={handleSendGif} onClose={() => setShowGifPicker(false)} />
        )}
        {showPrankPicker && (
          <PrankPicker
            mode="private"
            friendName={friendData.name || friendId}
            onSelect={handleSendPrank}
            onClose={() => setShowPrankPicker(false)}
            localeTag={localeTag}
          />
        )}

        {isRecording ? (
          <div className="chat-input-wrapper chat-input-wrapper-recording">
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%', background: '#ff2a68',
              opacity: recordingTime % 2 === 0 ? 0.3 : 1,
              transition: 'opacity 0.2s', flexShrink: 0
            }} />
            <span style={{ color: 'white', flex: 1, fontSize: '14px', fontWeight: 600 }}>
              Gravando voz... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </span>
            <button type="button" onClick={cancelRecording} style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 700, padding: '4px 8px' }}>
              {t('cancel')}
            </button>
          </div>
        ) : (
          <div className="chat-input-wrapper" style={{ overflow: 'visible' }}>
            <div style={{ position: 'relative' }}>
              <button type="button"
                onClick={() => setShowDurationMenu(v => !v)}
                className="chat-action-btn"
                title="Modo Secreto"
                style={{ color: secretSeconds > 0 ? '#FF4500' : 'var(--text-muted)' }}>
                <Flame size={18} />
              </button>
            </div>
            {showDurationMenu && (
              <>
                <div
                  onClick={() => setShowDurationMenu(false)}
                  style={{
                    position: 'fixed', inset: 0, zIndex: 9998,
                    background: 'rgba(0,0,0,0.4)'
                  }}
                />
                <div style={{
                  position: 'fixed',
                  bottom: '72px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 9999,
                  background: '#1a1a2e',
                  border: '1px solid rgba(255,69,0,0.3)',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  gap: '8px',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
                }}>
                  {DURATION_OPTIONS.map(sec => (
                    <button key={sec} type="button"
                      onClick={() => { setSecretSeconds(sec); setShowDurationMenu(false); }}
                      style={{
                        width: '56px', height: '56px', borderRadius: '14px', border: '1px solid rgba(255,69,0,0.4)',
                        background: secretSeconds === sec ? '#FF4500' : 'rgba(255,255,255,0.06)',
                        color: secretSeconds === sec ? '#fff' : '#FF4500',
                        fontWeight: 700, fontSize: '15px', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: '2px'
                      }}>
                      <span style={{ fontSize: '18px' }}>{sec}</span>
                      <span style={{ fontSize: '10px', opacity: 0.7 }}>seg</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <button type="button" onClick={() => setShowEmojiPicker(v => !v)}
              className="chat-action-btn"
              style={{ color: showEmojiPicker ? 'var(--primary)' : 'var(--text-muted)' }}>
              <Smile size={20} />
            </button>

            <button type="button"
              onClick={() => { setShowGifPicker(v => !v); setShowEmojiPicker(false); }}
              title="Enviar GIF"
              className="chat-action-btn chat-action-btn-gif"
              style={{ color: showGifPicker ? 'var(--primary)' : 'var(--text-muted)', border: showGifPicker ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.15)' }}>
              GIF
            </button>

            <button
              type="button"
              onClick={() => { if (canUsePrivateMedia) { setShowPrankPicker(v => !v); setShowEmojiPicker(false); setShowGifPicker(false); } }}
              title={t('pranks')}
              className="chat-action-btn"
              style={{ color: canUsePrivateMedia ? (showPrankPicker ? 'var(--primary)' : 'var(--text-muted)') : 'rgba(255,255,255,0.28)' }}
            >
              {canUsePrivateMedia ? <Zap size={18} /> : <Lock size={16} />}
            </button>

            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none' }}
              placeholder={`${t('messagePlaceholder')} ${friendData.name || friendId}...`}
              value={newMessage}
              onChange={handleTyping}
              onFocus={() => setShowEmojiPicker(false)}
            />

            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="chat-action-btn"
              style={{ color: canUsePrivateMedia ? 'var(--text-muted)' : 'rgba(255,255,255,0.28)' }}>
              {canUsePrivateMedia ? <ImageIcon size={20} /> : <Lock size={16} />}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" style={{ display: 'none' }} />
          </div>
        )}

        {isRecording ? (
          <button type="button" className="send-btn animate-pulse" onClick={stopRecording} style={{ background: 'var(--primary)', color: 'white' }}>
            <Send size={18} />
          </button>
        ) : newMessage.trim() ? (
          <button type="submit" className="send-btn" disabled={isUploading}>
            <Send size={18} />
          </button>
        ) : (
          <button type="button" className="send-btn" onClick={startRecording} disabled={isUploading} style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
            <Mic size={18} />
          </button>
        )}
        </form>
      </div>

      {activeAnimationType && (
        <RoomAnimationOverlay
          animationType={activeAnimationType}
          localeTag={localeTag}
          onDismiss={() => setActiveAnimationType(null)}
        />
      )}

      <aside className="desktop-chat-rail">
        <div className="desktop-chat-panel">
          <div className="desktop-chat-panel-media desktop-chat-panel-media-round">
            {friendData.photoUrl ? (
              <img src={friendData.photoUrl} alt={friendData.name || friendId} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span>{(friendData.name || friendId || '?').charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="desktop-chat-panel-title">{friendData.name || friendId}</div>
          <div className="desktop-chat-panel-subtitle">
            {isFriendTyping ? t('typing') : (friendData.isOnline ? t('online') : t('offline'))}
          </div>
          <div className="desktop-chat-chip-row">
            <span className="desktop-chat-chip">{t('conversations')}</span>
            <span className="desktop-chat-chip">{canUsePrivateMedia ? t('turbo') : t('premium')}</span>
          </div>
        </div>

        <div className="desktop-chat-panel desktop-chat-panel-grow">
          <div className="desktop-chat-panel-header">
            <strong>{t('settings')}</strong>
          </div>
          <div className="desktop-presence-list">
            <div className="desktop-info-row">
              <span>{t('online')}</span>
              <strong>{friendData.isOnline ? t('online') : t('offline')}</strong>
            </div>
            <div className="desktop-info-row">
              <span>{t('turbo')}</span>
              <strong>{canUsePrivateMedia ? t('premiumActive') : t('turboReady')}</strong>
            </div>
            <button className="desktop-danger-btn" onClick={handleDeleteChat}>
              <Trash2 size={16} />
              <span>{t('deleteConversation')}</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

// ── Private bubble ────────────────────────────────────────────────────────────
function PrivateBubble({ msg, isMe, friendData, myPhoto, onReply, onDelete, formatTime }) {
  const [showActions, setShowActions] = useState(false);
  const isAnimatedEmoji =
    msg.type === 'TEXT' &&
    !msg.imageUrl &&
    !msg.videoUrl &&
    !msg.audioUrl &&
    !msg.fileUrl &&
    !msg.latitude &&
    !msg.mediaUrl &&
    !msg.stickerUrl &&
    !msg.replyToId &&
    isSingleEmojiMessage(msg.text);

  return (
    <div
      id={`msg-${msg.id}`}
      className={`message-row ${isMe ? 'me' : 'other'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {!isMe && (
        <div style={{
          width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
          overflow: 'hidden',
          background: friendData.photoUrl ? 'transparent' : 'linear-gradient(135deg, #FF2A68, #ff80ab)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: '13px'
        }}>
          {friendData.photoUrl
            ? <img src={friendData.photoUrl} alt="av" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : (friendData.name || '?').charAt(0).toUpperCase()
          }
        </div>
      )}

      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: isMe ? 'flex-end' : 'flex-start'
      }}>
        <div
          className={`message-bubble ${isMe ? 'me' : 'other'}`}
          style={
            (msg.type === 'FUN' || String(msg.type || '').startsWith('ANIMATION_'))
              ? {
                  background: isMe ? 'linear-gradient(135deg, #6f4bff, #ff5f8f)' : 'linear-gradient(135deg, rgba(111,75,255,0.18), rgba(255,95,143,0.18))',
                  border: '1px solid rgba(255,255,255,0.08)'
                }
              : msg.userColor && isMe
              ? { background: msg.userColor, WebkitTextFillColor: 'initial' }
              : msg.userColor && !isMe
              ? { background: `${msg.userColor}20`, borderLeft: `3px solid ${msg.userColor}` }
              : isAnimatedEmoji
              ? {
                  background: 'transparent',
                  boxShadow: 'none',
                  border: 'none',
                  padding: '4px 0 12px',
                  maxWidth: 'none',
                  minWidth: '0',
                  overflow: 'visible'
                }
              : {}
          }
        >
          {(msg.type === 'FUN' || String(msg.type || '').startsWith('ANIMATION_')) && (
            <div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '7px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 800, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              <span>{msg.prankEmoji || '✨'}</span>
              <span>{msg.prankTitle || 'Brincadeira'}</span>
            </div>
          )}
          {/* Reply quote */}
          {msg.replyToId && (
            <div
              onClick={() => document.getElementById(`msg-${msg.replyToId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              style={{
                padding: '5px 8px', background: 'rgba(0,0,0,0.2)',
                borderRadius: '8px', borderLeft: '3px solid rgba(255,255,255,0.4)',
                marginBottom: '8px', cursor: 'pointer', fontSize: '12px'
              }}
            >
              <div style={{ fontWeight: 700, opacity: 0.8 }}>{msg.replyToName}</div>
              <div style={{ opacity: 0.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.replyToText}</div>
            </div>
          )}

          {msg.imageUrl && <img src={msg.imageUrl} alt="img" style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: '10px', display: 'block', marginBottom: msg.text ? '8px' : 0 }} />}
          {msg.videoUrl && <video src={msg.videoUrl} controls style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: '10px', display: 'block', marginBottom: msg.text ? '8px' : 0 }} />}
          {msg.stickerUrl && <img src={msg.stickerUrl} alt="sticker" style={{ width: '120px', height: '120px', background: 'transparent' }} />}
          {msg.audioUrl && <audio src={msg.audioUrl} controls style={{ maxWidth: '100%', minWidth: '220px', display: 'block', margin: '6px 0 0', outline: 'none' }} />}
          {msg.text && (
            isAnimatedEmoji ? (
              <AnimatedEmojiMessage emoji={msg.text.trim()} />
            ) : (
              <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.4 }}>{msg.text}</div>
            )
          )}

        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '4px',
          alignSelf: 'center',
          ...(isMe ? { marginRight: '8px' } : { marginLeft: '8px' })
        }}>
          <button onClick={onReply}
            style={{ color: 'var(--text-muted)', padding: '5px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)' }}>
            <Reply size={14} />
          </button>
          {isMe && (
            <button onClick={onDelete}
              style={{ color: 'rgba(255,82,82,0.5)', padding: '5px', borderRadius: '8px', background: 'rgba(255,82,82,0.06)' }}>
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
