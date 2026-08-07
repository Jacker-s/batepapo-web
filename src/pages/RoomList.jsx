import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { onValue, ref, remove } from 'firebase/database';
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Flame,
  Globe2,
  Lock,
  MessageSquare,
  Search,
  Sparkles,
  Users,
  X,
  Zap
} from 'lucide-react';
import { database } from '../firebase';
import { useAppRuntime } from '../context/AppRuntimeContext';
import AdSenseBlock from '../components/AdSenseBlock';

const INTEREST_CATEGORIES = ['Entretenimento', 'Relacionamentos', 'Hobbies & Estilo', 'Idade'];
const ADULT_CATEGORY = 'Adulto +18 🔥';
const REGION_ID_REGEX = /_(BR|US|ES|MX|FR|DE|IT|RU|SA|IN|BD|ID|JP|KR|TR|PK)_([A-Z]{2,3})(?:_|$)/i;
const GENERAL_ROOM_REGEX = /^ROOM_GENERAL_([A-Z]{2})_([A-Z]{2,3})$/i;
const DEFAULT_ROOM_TEMPLATES = [
  { slug: 'GENERAL', key: 'general', category: 'Geral' },
  { slug: 'FRIENDS', key: 'friends', category: 'Relacionamentos' },
  { slug: 'DATING', key: 'dating', category: 'Relacionamentos' },
  { slug: 'MUSIC', key: 'music', category: 'Entretenimento' },
  { slug: 'GAMES', key: 'games', category: 'Entretenimento' },
  { slug: 'ADULTS', key: 'adults', category: 'Adulto +18 🔥' },
  { slug: 'HUMOR', key: 'humor', category: 'Entretenimento' },
  { slug: 'TRAVEL', key: 'travel', category: 'Hobbies & Estilo' },
  { slug: 'TECH', key: 'tech', category: 'Hobbies & Estilo' },
  { slug: 'SPORTS', key: 'sports', category: 'Hobbies & Estilo' }
];

const DEFAULT_ROOM_CONTENT = {
  pt: {
    general: { name: 'Geral', description: 'O ponto de encontro mais rapido para cair em conversa real.' },
    friends: { name: 'Amizades', description: 'Conheca pessoas novas e converse sem pressa.' },
    dating: { name: 'Paquera', description: 'Clima leve para flerte, quimica e conexoes.' },
    music: { name: 'Musica', description: 'Troque gostos, radios e descobertas musicais.' },
    games: { name: 'Games', description: 'Fale de jogos, partidas e universos favoritos.' },
    adults: { name: 'Adulto +18', description: 'Espaco adulto para conversas mais ousadas.' },
    humor: { name: 'Humor', description: 'Memes, zoeira e papo leve para distrair.' },
    travel: { name: 'Viagens', description: 'Destinos, experiencias e historias de estrada.' },
    tech: { name: 'Tecnologia', description: 'Apps, IA, internet e novidades digitais.' },
    sports: { name: 'Esportes', description: 'Times, jogos e assuntos que movem a torcida.' }
  },
  en: {
    general: { name: 'General', description: 'The fastest meeting point to drop into a real conversation.' },
    friends: { name: 'Friends', description: 'Meet new people and talk with no pressure.' },
    dating: { name: 'Dating', description: 'A lighter room for flirting and chemistry.' },
    music: { name: 'Music', description: 'Share tastes, radios and music discoveries.' },
    games: { name: 'Games', description: 'Talk about games, matches and favorite worlds.' },
    adults: { name: 'Adults 18+', description: 'Adult space for bolder conversations.' },
    humor: { name: 'Humor', description: 'Memes, jokes and lighter chat.' },
    travel: { name: 'Travel', description: 'Destinations, experiences and road stories.' },
    tech: { name: 'Tech', description: 'Apps, AI, internet and digital trends.' },
    sports: { name: 'Sports', description: 'Teams, matches and fan energy.' }
  },
  es: {
    general: { name: 'General', description: 'El punto de encuentro mas rapido para caer en una conversacion real.' },
    friends: { name: 'Amistades', description: 'Conoce gente nueva y conversa sin presion.' },
    dating: { name: 'Coqueteo', description: 'Sala ligera para flirteo y quimica.' },
    music: { name: 'Musica', description: 'Comparte gustos, radios y descubrimientos musicales.' },
    games: { name: 'Juegos', description: 'Habla de juegos, partidas y mundos favoritos.' },
    adults: { name: 'Adultos +18', description: 'Espacio adulto para conversaciones mas atrevidas.' },
    humor: { name: 'Humor', description: 'Memes, bromas y charla ligera.' },
    travel: { name: 'Viajes', description: 'Destinos, experiencias e historias de ruta.' },
    tech: { name: 'Tecnologia', description: 'Apps, IA, internet y novedades digitales.' },
    sports: { name: 'Deportes', description: 'Equipos, partidos y energia de la aficion.' }
  },
  fr: {
    general: { name: 'General', description: 'Le point de rencontre le plus rapide pour tomber dans une vraie conversation.' },
    friends: { name: 'Amities', description: 'Rencontrez de nouvelles personnes et discutez librement.' },
    dating: { name: 'Flirt', description: 'Un espace leger pour le flirt et l alchimie.' },
    music: { name: 'Musique', description: 'Partagez gouts, radios et decouvertes musicales.' },
    games: { name: 'Jeux', description: 'Parlez jeux, parties et univers favoris.' },
    adults: { name: 'Adultes 18+', description: 'Espace adulte pour des conversations plus osees.' },
    humor: { name: 'Humour', description: 'Memes, blagues et discussion legere.' },
    travel: { name: 'Voyages', description: 'Destinations, experiences et histoires de route.' },
    tech: { name: 'Technologie', description: 'Apps, IA, internet et nouveautes numeriques.' },
    sports: { name: 'Sports', description: 'Equipes, matchs et energie des supporters.' }
  },
  de: {
    general: { name: 'Allgemein', description: 'Der schnellste Treffpunkt fuer ein echtes Gespraech.' },
    friends: { name: 'Freundschaften', description: 'Neue Leute kennenlernen und locker reden.' },
    dating: { name: 'Flirten', description: 'Ein leichter Raum fuer Flirts und Chemie.' },
    music: { name: 'Musik', description: 'Teile Musikgeschmack, Radios und Entdeckungen.' },
    games: { name: 'Games', description: 'Sprich ueber Spiele, Matches und Lieblingswelten.' },
    adults: { name: 'Erwachsene 18+', description: 'Erwachsenenraum fuer mutigere Gespraeche.' },
    humor: { name: 'Humor', description: 'Memes, Witze und lockerer Chat.' },
    travel: { name: 'Reisen', description: 'Reiseziele, Erfahrungen und Geschichten unterwegs.' },
    tech: { name: 'Technologie', description: 'Apps, KI, Internet und digitale Trends.' },
    sports: { name: 'Sport', description: 'Teams, Spiele und Fanenergie.' }
  },
  it: {
    general: { name: 'Generale', description: 'Il punto di incontro piu rapido per entrare in una conversazione vera.' },
    friends: { name: 'Amicizie', description: 'Conosci nuove persone e parla senza pressione.' },
    dating: { name: 'Flirt', description: 'Una stanza piu leggera per flirt e chimica.' },
    music: { name: 'Musica', description: 'Condividi gusti, radio e scoperte musicali.' },
    games: { name: 'Giochi', description: 'Parla di giochi, partite e mondi preferiti.' },
    adults: { name: 'Adulti 18+', description: 'Spazio adulto per conversazioni piu audaci.' },
    humor: { name: 'Umorismo', description: 'Meme, battute e chiacchiere leggere.' },
    travel: { name: 'Viaggi', description: 'Destinazioni, esperienze e storie di viaggio.' },
    tech: { name: 'Tecnologia', description: 'App, IA, internet e novita digitali.' },
    sports: { name: 'Sport', description: 'Squadre, partite ed energia dei tifosi.' }
  }
};

function formatLanguageLabel(scope, localeTag) {
  try {
    const locale = localeTag || scope.localeTag;
    return new Intl.DisplayNames([locale], { type: 'language' }).of(scope.languageCode) || scope.languageCode.toUpperCase();
  } catch {
    return scope.languageCode.toUpperCase();
  }
}

function getUniqueLanguageOptions(roomScopes, localeTag) {
  const seen = new Set();
  return roomScopes.filter((scope) => {
    if (seen.has(scope.languageCode)) return false;
    seen.add(scope.languageCode);
    return true;
  }).map((scope) => ({
    localeTag: scope.localeTag,
    languageCode: scope.languageCode,
    label: formatLanguageLabel(scope, localeTag)
  }));
}

function defaultRoomIdFor(scope, slug) {
  return `ROOM_${slug}_${scope.countryCode}_${scope.languageCode.toUpperCase()}`;
}

function defaultRoomContentFor(scope, key) {
  const languageContent = DEFAULT_ROOM_CONTENT[scope.languageCode] || DEFAULT_ROOM_CONTENT.en;
  return languageContent[key] || DEFAULT_ROOM_CONTENT.en[key] || { name: key, description: '' };
}

function buildFallbackRoomsForScope(scope, existingRooms) {
  const roomIds = new Set(existingRooms.map((room) => String(room.id || '').toUpperCase()));
  const shouldPreferLegacyBrazilGeneral = scope.regionKey === 'BR_PT' && roomIds.has('ROOM_GERAL');

  return DEFAULT_ROOM_TEMPLATES
    .filter((template) => !(shouldPreferLegacyBrazilGeneral && template.slug === 'GENERAL'))
    .map((template) => {
      const id = defaultRoomIdFor(scope, template.slug);
      const content = defaultRoomContentFor(scope, template.key);
      return {
        id,
        name: content.name,
        category: template.category,
        description: content.description,
        participantCount: 0,
        maxParticipants: 50,
        languageCode: scope.languageCode,
        countryCode: scope.countryCode,
        localeTag: scope.localeTag,
        regionKey: scope.regionKey,
        active: true,
        isFallbackRoom: true
      };
    })
    .filter((room) => !roomIds.has(String(room.id).toUpperCase()));
}

function mergeFallbackRoomsForScope(allRooms, scope) {
  return [...allRooms, ...buildFallbackRoomsForScope(scope, allRooms)];
}

function getRoomVisual(room, translateCategory) {
  const category = translateCategory(room.category || '');
  const term = `${room.category || ''} ${room.name || ''}`.toLowerCase();

  if (term.includes('adult') || term.includes('putaria') || term.includes('18')) {
    return { icon: Flame, tint: '#ff6b57', category };
  }
  if (term.includes('relacion') || term.includes('amiz') || term.includes('love')) {
    return { icon: MessageSquare, tint: '#7c4dff', category };
  }
  return { icon: Sparkles, tint: '#4da3ff', category };
}

function isLegacyBrazilRoom(room) {
  const roomId = String(room?.id || '').trim().toUpperCase();
  return (
    roomId === 'ROOM_GERAL' ||
    roomId.startsWith('HOT_') ||
    (roomId.startsWith('USR_') && !REGION_ID_REGEX.test(roomId))
  );
}

function inferRoomRegionKey(room) {
  if (!room) return '';

  const explicitRegion = String(room.regionKey || room.roomRegionKey || '').trim().toUpperCase();
  if (explicitRegion) return explicitRegion;

  const countryCode = String(room.countryCode || '').trim().toUpperCase();
  const languageCode = String(room.languageCode || '').trim().toLowerCase();
  if (countryCode && languageCode) {
    return `${countryCode}_${languageCode.toUpperCase()}`;
  }

  const localeTag = String(room.localeTag || '').trim();
  if (localeTag.includes('-')) {
    const [languagePart, countryPart] = localeTag.split('-');
    const inferredLanguage = String(languagePart || '').trim().toLowerCase();
    const inferredCountry = String(countryPart || '').trim().toUpperCase();
    if (inferredLanguage && inferredCountry) {
      return `${inferredCountry}_${inferredLanguage.toUpperCase()}`;
    }
  }

  const roomId = String(room.id || '').trim().toUpperCase();
  const generalMatch = roomId.match(GENERAL_ROOM_REGEX);
  if (generalMatch) {
    return `${generalMatch[1].toUpperCase()}_${generalMatch[2].toUpperCase()}`;
  }

  const embeddedMatch = roomId.match(REGION_ID_REGEX);
  if (embeddedMatch) {
    return `${embeddedMatch[1].toUpperCase()}_${embeddedMatch[2].toUpperCase()}`;
  }

  if (isLegacyBrazilRoom(room)) {
    return 'BR_PT';
  }

  return '';
}

function roomBelongsToScope(room, scope) {
  const inferredRegionKey = inferRoomRegionKey(room);
  if (!inferredRegionKey) return false;
  return inferredRegionKey === scope.regionKey;
}

function isGeneralRoom(room) {
  const roomId = String(room?.id || '').trim().toUpperCase();
  return roomId === 'ROOM_GERAL' || GENERAL_ROOM_REGEX.test(roomId);
}

function normalizeRoomListForScope(roomList, scope) {
  const generalRooms = roomList.filter(isGeneralRoom);
  if (generalRooms.length <= 1) {
    return [...roomList].sort((a, b) => {
      const aGeneral = isGeneralRoom(a) ? 1 : 0;
      const bGeneral = isGeneralRoom(b) ? 1 : 0;
      return bGeneral - aGeneral || (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0) || (b.participantCount || 0) - (a.participantCount || 0);
    });
  }

  const preferredGeneralId = scope.regionKey === 'BR_PT'
    ? 'ROOM_GERAL'
    : `ROOM_GENERAL_${scope.countryCode}_${scope.languageCode.toUpperCase()}`;

  const preferredGeneral = generalRooms.find((room) => String(room.id || '').toUpperCase() === preferredGeneralId)
    || generalRooms.find((room) => inferRoomRegionKey(room) === scope.regionKey)
    || generalRooms[0];

  const deduped = roomList.filter((room) => !isGeneralRoom(room) || room.id === preferredGeneral.id);
  return deduped.sort((a, b) => {
    const aGeneral = isGeneralRoom(a) ? 1 : 0;
    const bGeneral = isGeneralRoom(b) ? 1 : 0;
    return bGeneral - aGeneral || (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0) || (b.participantCount || 0) - (a.participantCount || 0);
  });
}

function RoomCard({
  room,
  isJoined,
  isActive,
  onOpen,
  onLeave,
  translateCategory,
  t,
  canAccessRoom,
  lockLabel
}) {
  const { icon: Icon, tint, category } = getRoomVisual(room, translateCategory);
  const onlineCount = room.participantCount || 0;
  const isLocked = !canAccessRoom;
  const accessBadge = room.premiumAccessLevel === 'PREMIUM'
    ? t('roomAccessPremium')
    : room.premiumAccessLevel === 'TURBO'
    ? t('roomAccessTurbo')
    : null;

  return (
    <div
      onClick={onOpen}
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '60px 1fr auto',
        gap: '14px',
        padding: '16px',
        borderRadius: '24px',
        background: isActive
          ? 'linear-gradient(135deg, rgba(76,163,255,0.14), rgba(255,255,255,0.04))'
          : 'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.018))',
        border: `1px solid ${isActive ? 'rgba(76,163,255,0.22)' : 'rgba(255,255,255,0.07)'}`,
        marginBottom: '12px',
        cursor: 'pointer',
        overflow: 'hidden',
        boxShadow: '0 18px 40px rgba(0,0,0,0.15)'
      }}
    >
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '22px',
        background: room.photoUrl ? 'rgba(255,255,255,0.04)' : `${tint}18`,
        border: `1px solid ${tint}30`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {room.photoUrl ? (
          <img src={room.photoUrl} alt={room.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Icon size={26} color={tint} />
        )}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 900,
            letterSpacing: '-0.4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%'
          }}>
            {room.name}
          </div>
          {isJoined && <CheckCircle2 size={16} color="#53dd7a" />}
          {accessBadge && (
            <div style={{
              padding: '4px 8px',
              borderRadius: '999px',
              background: room.premiumAccessLevel === 'PREMIUM' ? 'rgba(255,215,64,0.16)' : 'rgba(45,156,219,0.16)',
              color: room.premiumAccessLevel === 'PREMIUM' ? '#ffd54f' : '#8fd7ff',
              fontSize: '10px',
              fontWeight: 900,
              letterSpacing: '0.7px',
              textTransform: 'uppercase'
            }}>
              {accessBadge}
            </div>
          )}
        </div>
        <div style={{
          fontSize: '12px',
          fontWeight: 800,
          color: tint,
          textTransform: 'uppercase',
          letterSpacing: '1.2px',
          marginTop: '2px'
        }}>
          {category}
        </div>
        <div style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: 1.45,
          marginTop: '8px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {room.description || t('touchToEnter')}
        </div>
        <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{
            padding: '7px 10px',
            borderRadius: '999px',
            background: 'rgba(255,107,87,0.08)',
            color: '#ff7f66',
            fontSize: '12px',
            fontWeight: 800
          }}>
            {onlineCount} {t('onlineNow')}
          </div>
          <div style={{
            padding: '7px 10px',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.06)',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: 800
          }}>
            {t('roomLimit')}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', gap: '10px' }}>
        {isLocked ? (
          <div style={{
            padding: '10px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.05)',
            color: '#ffd54f'
          }}>
            <Lock size={18} />
          </div>
        ) : (
          <div style={{
            padding: '10px',
            borderRadius: '16px',
            background: 'rgba(75,255,165,0.12)',
            color: '#60e6a5'
          }}>
            <ArrowUpRight size={18} />
          </div>
        )}
        <button
          onClick={(event) => {
            event.stopPropagation();
            if (!isLocked) onOpen();
          }}
          style={{
            padding: '10px 12px',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.07)',
            background: isLocked ? 'rgba(255,255,255,0.05)' : 'rgba(85,243,160,0.12)',
            color: isLocked ? 'rgba(255,255,255,0.5)' : '#57d486',
            fontWeight: 900,
            fontSize: '13px',
            minWidth: '110px'
          }}
        >
          {isLocked ? lockLabel : t('touchToEnter')}
        </button>
        {isJoined && (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onLeave(room.id);
            }}
            style={{
              padding: '8px 10px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 800,
              fontSize: '12px'
            }}
          >
            Sair
          </button>
        )}
      </div>
    </div>
  );
}

function RegionSelector({ open, onClose, roomScopes, roomScope, setRoomScopeByKey, formatScopeLabel, t, localeTag, setLocaleTag }) {
  if (!open) return null;
  const languageOptions = getUniqueLanguageOptions(roomScopes, localeTag);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="region-sheet" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-handle" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.8px' }}>
              {t('regionLanguage')}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, marginTop: '8px' }}>
              {t('roomsByRegion')}
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '8px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{
          padding: '16px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(77,163,255,0.12), rgba(255,255,255,0.03))',
          border: '1px solid rgba(77,163,255,0.16)',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1.5px' }}>
            {t('activeRegion')}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '6px' }}>{formatScopeLabel(roomScope)}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{roomScope.localeTag}</div>
        </div>

        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '10px' }}>
          {t('appLanguage')}
        </div>
        <div className="region-language-grid">
          {languageOptions.map((option) => {
            const active = localeTag === option.localeTag || roomScope.languageCode === option.languageCode;
            return (
              <button
                key={option.languageCode}
                type="button"
                className={`region-language-chip ${active ? 'active' : ''}`}
                onClick={() => {
                  setLocaleTag(option.localeTag);
                  const matchedScope = roomScopes.find((scope) => scope.localeTag === option.localeTag);
                  if (matchedScope) {
                    setRoomScopeByKey(matchedScope.regionKey);
                  }
                }}
              >
                <span>{option.label}</span>
                <small>{option.languageCode.toUpperCase()}</small>
              </button>
            );
          })}
        </div>

        <div className="region-option-grid">
          {roomScopes.map((scope) => {
            const isSelected = scope.regionKey === roomScope.regionKey;
            return (
              <button
                key={scope.regionKey}
                type="button"
                onClick={() => {
                  setRoomScopeByKey(scope.regionKey);
                  onClose();
                }}
                className={`region-option-card ${isSelected ? 'active' : ''}`}
              >
                <div className="region-option-topline">
                  <div>
                    <div className="region-option-title">{formatScopeLabel(scope)}</div>
                    <div className="region-option-subtitle">{scope.localeTag}</div>
                  </div>
                  {isSelected && <CheckCircle2 size={18} color="#8fd7ff" />}
                </div>
                <div className="region-option-meta">
                  <span>{scope.countryCode}</span>
                  <span>{scope.languageCode.toUpperCase()}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function RoomList({ username }) {
  const navigate = useNavigate();
  const { roomId: activeRoomId } = useParams();
  const {
    t,
    roomScope,
    roomScopes,
    setRoomScopeByKey,
    localeTag,
    setLocaleTag,
    formatScopeLabel,
    translateCategory,
    adsControls
  } = useAppRuntime();

  const [rooms, setRooms] = useState([]);
  const [joinedRoomIds, setJoinedRoomIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopGroup, setSelectedTopGroup] = useState('ALL');
  const [regionPickerOpen, setRegionPickerOpen] = useState(false);
  const [webLockedRoom, setWebLockedRoom] = useState(null);

  useEffect(() => {
    const offRooms = onValue(ref(database, 'rooms'), (snapshot) => {
      const data = snapshot.val() || {};
      setRooms(Object.keys(data).map((id) => ({ id, ...data[id] })));
    });
    const offJoined = onValue(ref(database, `user_rooms/${username}`), (snapshot) => {
      setJoinedRoomIds(snapshot.exists() ? new Set(Object.keys(snapshot.val())) : new Set());
    });
    return () => {
      offRooms();
      offJoined();
    };
  }, [username]);

  const filteredRooms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const sourceRooms = mergeFallbackRoomsForScope(rooms, roomScope);
    const scopedRooms = sourceRooms.filter((room) => {
      if (!room.active && room.active !== undefined) return false;
      if (!roomBelongsToScope(room, roomScope)) return false;
      if (query) {
        const haystack = `${room.name || ''} ${room.category || ''} ${room.description || ''}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (selectedTopGroup === 'INTERESTS') return INTEREST_CATEGORIES.includes(room.category);
      if (selectedTopGroup === 'ADULT') return room.category === ADULT_CATEGORY;
      return true;
    });
    return normalizeRoomListForScope(scopedRooms, roomScope);
  }, [rooms, roomScope, searchQuery, selectedTopGroup]);

  const joinedRooms = filteredRooms.filter((room) => joinedRoomIds.has(room.id));
  const discoverRooms = filteredRooms.filter((room) => !joinedRoomIds.has(room.id));

  const featuredRooms = [...discoverRooms]
    .sort((a, b) => (b.participantCount || 0) - (a.participantCount || 0))
    .slice(0, 3);

  const groupedRooms = discoverRooms.reduce((accumulator, room) => {
    const key = room.category || 'Geral';
    if (!accumulator[key]) accumulator[key] = [];
    accumulator[key].push(room);
    return accumulator;
  }, {});

  const hasStrongRoomContent = filteredRooms.length >= 6;

  const handleLeaveRoom = async (roomId) => {
    await remove(ref(database, `user_rooms/${username}/${roomId}`)).catch(() => {});
    await remove(ref(database, `room_participants/${roomId}/${username}`)).catch(() => {});
    if (activeRoomId === roomId) navigate('/app', { replace: true });
  };

  const isWebLockedRoom = (room) => room?.premiumAccessLevel === 'PREMIUM' || room?.premiumAccessLevel === 'TURBO';

  const canAccessRoom = (room) => !isWebLockedRoom(room);

  const lockLabelForRoom = (room) => {
    if (isWebLockedRoom(room)) return t('playStore');
    return t('touchToEnter');
  };

  const handleOpenRoom = (room) => {
    if (isWebLockedRoom(room)) {
      setWebLockedRoom(room);
      return;
    }
    navigate(`/app/room/${room.id}`);
  };

  return (
    <div className="room-list-scroll" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, height: '100%', background: 'var(--bg)' }}>
      <div className="discover-shell">
        <button className="region-banner" onClick={() => setRegionPickerOpen(true)}>
          <div className="region-banner-icon">
            <Globe2 size={20} />
          </div>
          <div style={{ minWidth: 0, textAlign: 'left' }}>
            <div style={{ fontSize: '14px', fontWeight: 900 }}>{t('roomsByRegion')}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {formatScopeLabel(roomScope)}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: '#7ebdff', fontWeight: 900 }}>
            {t('swap')}
            <ChevronDown size={16} />
          </div>
        </button>

        <div className="room-filter-row">
          <button className={`filter-pill ${selectedTopGroup === 'ALL' ? 'active' : ''}`} onClick={() => setSelectedTopGroup('ALL')}>
            {t('all')}
          </button>
          <button className={`filter-pill ${selectedTopGroup === 'INTERESTS' ? 'active' : ''}`} onClick={() => setSelectedTopGroup('INTERESTS')}>
            {t('interests')}
          </button>
          <button className={`filter-pill ${selectedTopGroup === 'ADULT' ? 'active' : ''}`} onClick={() => setSelectedTopGroup('ADULT')}>
            {t('adult')}
          </button>
        </div>

        <div style={{ position: 'relative', marginTop: '12px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t('searchRooms')}
            style={{
              width: '100%',
              borderRadius: '18px',
              padding: '14px 44px 14px 42px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'white'
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <X size={15} />
            </button>
          )}
        </div>

        {adsControls.roomListBannerEnabled && hasStrongRoomContent && (
          <AdSenseBlock
            placement="room_list_banner"
            minHeight={120}
            style={{ marginTop: '20px' }}
          />
        )}

        <div className="section-label">
          <Globe2 size={15} />
          {t('regionRoomsOnly')}
        </div>

        {joinedRooms.length > 0 && (
          <>
            <div className="section-label">
              <CheckCircle2 size={15} />
              {t('myRooms')}
            </div>
            {joinedRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                isJoined
                isActive={activeRoomId === room.id}
                onOpen={() => handleOpenRoom(room)}
                onLeave={handleLeaveRoom}
                translateCategory={translateCategory}
                t={t}
                canAccessRoom={canAccessRoom(room)}
                lockLabel={lockLabelForRoom(room)}
              />
            ))}
          </>
        )}

        {featuredRooms.length > 0 && (
          <>
            <div className="section-label">
              <Sparkles size={15} />
              {t('popularNow')}
            </div>
            {featuredRooms.map((room) => (
              <RoomCard
                key={`featured-${room.id}`}
                room={room}
                isActive={activeRoomId === room.id}
                onOpen={() => handleOpenRoom(room)}
                onLeave={handleLeaveRoom}
                translateCategory={translateCategory}
                t={t}
                canAccessRoom={canAccessRoom(room)}
                lockLabel={lockLabelForRoom(room)}
              />
            ))}
          </>
        )}

        {Object.entries(groupedRooms).map(([category, categoryRooms], index) => (
          <div key={category}>
            <div className="section-label">
              <Users size={15} />
              {translateCategory(category)}
            </div>
            {categoryRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                isActive={activeRoomId === room.id}
                onOpen={() => handleOpenRoom(room)}
                onLeave={handleLeaveRoom}
                translateCategory={translateCategory}
                t={t}
                canAccessRoom={canAccessRoom(room)}
                lockLabel={lockLabelForRoom(room)}
              />
            ))}
            {adsControls.roomListPeriodicEnabled && hasStrongRoomContent && index === 0 && (
              <AdSenseBlock placement="room_list_native" />
            )}
          </div>
        ))}

        {filteredRooms.length === 0 && (
          <div className="empty-panel">
            <MessageSquare size={42} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <div style={{ fontSize: '17px', fontWeight: 800 }}>{t('noSearchResults')}</div>
            <div style={{ color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
              {t('exploreMore')}
            </div>
          </div>
        )}
      </div>

      <RegionSelector
        open={regionPickerOpen}
        onClose={() => setRegionPickerOpen(false)}
        roomScopes={roomScopes}
        roomScope={roomScope}
        setRoomScopeByKey={setRoomScopeByKey}
        formatScopeLabel={formatScopeLabel}
        t={t}
        localeTag={localeTag}
        setLocaleTag={setLocaleTag}
      />

      {webLockedRoom && (
        <div className="sheet-backdrop" onClick={() => setWebLockedRoom(null)}>
          <div
            className="region-sheet"
            style={{ width: 'min(520px, 100%)', maxHeight: 'unset' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sheet-handle" />
            <div style={{ textAlign: 'center', padding: '8px 6px 4px' }}>
              <div style={{ width: '64px', height: '64px', margin: '0 auto 14px', borderRadius: '22px', background: webLockedRoom.premiumAccessLevel === 'PREMIUM' ? 'rgba(255,215,64,0.14)' : 'rgba(45,156,219,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {webLockedRoom.premiumAccessLevel === 'PREMIUM' ? <Lock size={28} color="#ffd54f" /> : <Zap size={28} color="#8fd7ff" />}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900 }}>{t('roomWebLockedTitle')}</div>
              <div style={{ marginTop: '10px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {t('roomWebLockedBody')}
              </div>
              <div style={{ marginTop: '10px', fontWeight: 800, color: webLockedRoom.premiumAccessLevel === 'PREMIUM' ? '#ffd54f' : '#8fd7ff' }}>
                {webLockedRoom.name}
              </div>
            </div>
            <div style={{ display: 'grid', gap: '10px', marginTop: '18px' }}>
              <a
                href="https://play.google.com/store/apps/details?id=com.jack.friend"
                target="_blank"
                rel="noreferrer"
                style={{
                  width: '100%',
                  textAlign: 'center',
                  padding: '15px 18px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #4da3ff, #6be3ff)',
                  color: '#06111f',
                  fontWeight: 900,
                  textDecoration: 'none'
                }}
              >
                {t('roomWebLockedAction')}
              </a>
              <button
                onClick={() => setWebLockedRoom(null)}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: '18px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white',
                  background: 'rgba(255,255,255,0.04)',
                  fontWeight: 800
                }}
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
