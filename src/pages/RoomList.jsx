import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ref, onValue, query, limitToLast, remove, set } from 'firebase/database';
import { database } from '../firebase';
import { 
  Heart, Users, Gamepad2, Film, Music, Palette, Flame, 
  Church, Trophy, Monitor, GraduationCap, Plane, Utensils, 
  Car, Dog, HelpCircle, Settings, Newspaper, MessageSquare, LogOut, ChevronRight
} from 'lucide-react';

function getRoomVisuals(category, name) {
  const term = ((category || '') + ' ' + (name || '')).toLowerCase();
  
  if (term.includes('namoro') || term.includes('paquera') || term.includes('love') || term.includes('romance') || term.includes('encontro')) 
    return { Icon: Heart, color: '#E91E63' };
  if (term.includes('amizade') || term.includes('amigo') || term.includes('papo') || term.includes('convers')) 
    return { Icon: Users, color: '#2196F3' };
  if (term.includes('jogos') || term.includes('games') || term.includes('play')) 
    return { Icon: Gamepad2, color: '#9C27B0' };
  if (term.includes('filmes') || term.includes('cinema') || term.includes('series') || term.includes('netflix')) 
    return { Icon: Film, color: '#FFC107' };
  if (term.includes('musica') || term.includes('music') || term.includes('som') || term.includes('radio')) 
    return { Icon: Music, color: '#3F51B5' };
  if (term.includes('lgbt') || term.includes('gay') || term.includes('arco-iris') || term.includes('pride')) 
    return { Icon: Palette, color: '#FF4081' };
  if (term.includes('adulto') || term.includes('18+') || term.includes('hot') || term.includes('safadeza') || term.includes('fogo')) 
    return { Icon: Flame, color: '#FF5722' };
  if (term.includes('religiao') || term.includes('evangelico') || term.includes('cristao') || term.includes('deus') || term.includes('fe')) 
    return { Icon: Church, color: '#795548' };
  if (term.includes('esportes') || term.includes('futebol') || term.includes('bola') || term.includes('time')) 
    return { Icon: Trophy, color: '#4CAF50' };
  if (term.includes('tecnologia') || term.includes('tech') || term.includes('programacao') || term.includes('dev')) 
    return { Icon: Monitor, color: '#00BCD4' };
  if (term.includes('estudo') || term.includes('escola') || term.includes('faculdade') || term.includes('curso')) 
    return { Icon: GraduationCap, color: '#607D8B' };
  if (term.includes('viagem') || term.includes('turismo') || term.includes('mundo') || term.includes('ferias')) 
    return { Icon: Plane, color: '#03A9F4' };
  if (term.includes('comida') || term.includes('culinaria') || term.includes('chef') || term.includes('receita')) 
    return { Icon: Utensils, color: '#FF9800' };
  if (term.includes('carro') || term.includes('moto') || term.includes('veiculos') || term.includes('motor')) 
    return { Icon: Car, color: '#F44336' };
  if (term.includes('natureza') || term.includes('animais') || term.includes('pets') || term.includes('verde')) 
    return { Icon: Dog, color: '#8BC34A' };
  if (term.includes('ajuda') || term.includes('suporte') || term.includes('duvidas') || term.includes('faq')) 
    return { Icon: HelpCircle, color: '#CDDC39' };
  if (term.includes('sistema') || term.includes('admin') || term.includes('aviso')) 
    return { Icon: Settings, color: '#9E9E9E' };
  if (term.includes('noticia') || term.includes('jornal') || term.includes('atualidade')) 
    return { Icon: Newspaper, color: '#009688' };
    
  return { Icon: MessageSquare, color: '#673AB7' };
}

function RoomLastMessage({ roomId }) {
  const [lastMsg, setLastMsg] = useState('Toque para entrar');

  useEffect(() => {
    const msgsRef = query(ref(database, `room_messages/${roomId}`), limitToLast(1));
    const unsubscribe = onValue(msgsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const keys = Object.keys(data);
        if (keys.length > 0) {
          const msg = data[keys[0]];
          if (msg.text) {
            setLastMsg(`${msg.senderName}: ${msg.text}`);
          } else if (msg.type === 'IMAGE' || msg.imageUrl) {
            setLastMsg(`${msg.senderName}: 📷 Imagem`);
          } else if (msg.type === 'VIDEO' || msg.videoUrl) {
            setLastMsg(`${msg.senderName}: 🎥 Vídeo`);
          } else if (msg.type === 'STICKER' || msg.stickerUrl) {
            setLastMsg(`${msg.senderName}: 🖼️ Figurinha`);
          } else {
            setLastMsg('Nova mensagem');
          }
        }
      } else {
        setLastMsg('Toque para entrar');
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  return <>{lastMsg}</>;
}

export default function RoomList({ username }) {
  const [rooms, setRooms] = useState([]);
  const [joinedRoomIds, setJoinedRoomIds] = useState(new Set());
  const navigate = useNavigate();
  const { roomId } = useParams();

  useEffect(() => {
    // 1. Listen to all rooms
    const roomsRef = ref(database, 'rooms');
    const unsubscribeRooms = onValue(roomsRef, (snapshot) => {
      if (snapshot.exists()) {
        const roomsData = snapshot.val();
        const roomsList = Object.keys(roomsData).map(key => ({
          id: key,
          ...roomsData[key]
        }));
        setRooms(roomsList);
      } else {
        setRooms([]);
      }
    });

    // 2. Listen to joined rooms
    const joinedRef = ref(database, `user_rooms/${username}`);
    const unsubscribeJoined = onValue(joinedRef, (snapshot) => {
      if (snapshot.exists()) {
        setJoinedRoomIds(new Set(Object.keys(snapshot.val())));
      } else {
        setJoinedRoomIds(new Set());
      }
    });

    return () => {
      unsubscribeRooms();
      unsubscribeJoined();
    };
  }, [username]);

  const handleLeaveRoom = async (e, rId) => {
    e.stopPropagation();
    if (confirm('Deseja sair desta sala?')) {
      try {
        await remove(ref(database, `user_rooms/${username}/${rId}`));
        await remove(ref(database, `room_participants/${rId}/${username}`));
        if (roomId === rId) navigate('/app');
      } catch (err) {
        console.error("Erro ao sair da sala:", err);
      }
    }
  };

  const joinedRooms = rooms.filter(r => joinedRoomIds.has(r.id))
    .sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));
  
  const otherRooms = rooms.filter(r => !joinedRoomIds.has(r.id))
    .sort((a, b) => (b.participantCount || 0) - (a.participantCount || 0));

  const categories = [...new Set(otherRooms.map(r => r.category || 'Geral'))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
      {/* Section: Joined Rooms */}
      <div style={{ padding: '16px 16px 8px', fontWeight: '800', color: '#4CAF50', fontSize: '12px', letterSpacing: '1.5px' }}>
        MINHAS SALAS
      </div>
      
      {joinedRooms.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', background: 'rgba(255,255,255,0.03)', margin: '0 16px', borderRadius: '12px' }}>
          Você ainda não está em nenhuma sala.<br/>Explore as categorias abaixo!
        </div>
      ) : (
        <div className="room-list">
          {joinedRooms.map(room => (
            <div 
              key={room.id} 
              className={`room-item joined ${roomId === room.id ? 'active' : ''}`}
              onClick={() => navigate(`/app/room/${room.id}`)}
            >
              <div 
                className="room-icon" 
                style={{ 
                  background: room.photoUrl ? 'transparent' : (getRoomVisuals(room.category, room.name).color + '26')
                }}
              >
                {room.photoUrl ? (
                  <img src={room.photoUrl} alt="room" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (() => {
                  const visuals = getRoomVisuals(room.category, room.name);
                  const IconComp = visuals.Icon;
                  return <IconComp size={24} color={visuals.color} />;
                })()}
              </div>
              <div className="room-info">
                <div className="room-name" style={{ color: 'var(--text-primary)' }}>{room.name}</div>
                <div className="room-last-msg">
                  <RoomLastMessage roomId={room.id} />
                </div>
              </div>
              <button 
                className="leave-room-btn"
                onClick={(e) => handleLeaveRoom(e, room.id)}
                title="Sair da sala"
              >
                <LogOut size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Section: Categories / Other Rooms */}
      {categories.map(cat => (
        <div key={cat}>
          <div style={{ padding: '24px 16px 8px', fontWeight: '800', color: 'var(--primary)', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            {cat}
          </div>
          <div className="room-list">
            {otherRooms.filter(r => (r.category || 'Geral') === cat).map(room => (
              <div 
                key={room.id} 
                className={`room-item ${roomId === room.id ? 'active' : ''}`}
                onClick={() => navigate(`/app/room/${room.id}`)}
              >
                <div 
                  className="room-icon" 
                  style={{ 
                    background: room.photoUrl ? 'transparent' : (getRoomVisuals(room.category, room.name).color + '26')
                  }}
                >
                  {room.photoUrl ? (
                    <img src={room.photoUrl} alt="room" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (() => {
                    const visuals = getRoomVisuals(room.category, room.name);
                    const IconComp = visuals.Icon;
                    return <IconComp size={24} color={visuals.color} />;
                  })()}
                </div>
                <div className="room-info">
                  <div className="room-name">{room.name}</div>
                  <div className="room-meta" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={12} /> {room.participantCount || 0}
                    </span>
                    <span style={{ color: getRoomVisuals(room.category, room.name).color, fontWeight: 'bold', fontSize: '10px' }}>
                      {room.category || 'Geral'}
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} color="var(--text-muted)" />
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={{ height: '40px' }} />
    </div>
  );
}
