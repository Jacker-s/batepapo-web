import React, { useEffect, useMemo, useState } from 'react';
import { database, auth } from '../firebase';
import { ref, onValue, set, remove, get, query, limitToLast, push, update } from 'firebase/database';
import { signInAnonymously } from 'firebase/auth';
import {
  Activity,
  AlertTriangle,
  Ban,
  Clock3,
  Database,
  Eye,
  Globe2,
  LogOut,
  Megaphone,
  MessageSquare,
  RefreshCw,
  Search,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Users,
  Wrench,
  X,
  Zap
} from 'lucide-react';
import '../AdminDashboard.css';
import { resolveAdminAccess, isUserAdminName } from '../utils/adminAccess';
import { AD_DEFAULTS, TURBO_DEFAULTS } from '../lib/appRuntime';

const TABS = [
  { id: 'overview', label: 'Visão geral', icon: Activity },
  { id: 'operation', label: 'Operação', icon: Sparkles },
  { id: 'team', label: 'Equipe', icon: Shield },
  { id: 'users', label: 'Usuários', icon: Users },
  { id: 'security', label: 'Segurança', icon: Ban },
  { id: 'runtime', label: 'Runtime', icon: SlidersHorizontal },
  { id: 'ads', label: 'Anúncios', icon: Zap },
  { id: 'banned', label: 'Banidos', icon: Ban },
  { id: 'rooms', label: 'Salas', icon: MessageSquare },
  { id: 'database', label: 'Banco', icon: Database },
  { id: 'system', label: 'Sistema', icon: Wrench }
];

const RUNTIME_FIELDS = [
  ['maintenanceMode', 'Modo manutenção', 'Bloqueia uso normal e deixa o sistema em estado controlado.'],
  ['blockGuestLogin', 'Bloquear convidado', 'Impede login anônimo/rápido.'],
  ['blockPasswordLogin', 'Bloquear login com senha', 'Impede entrar com credenciais.'],
  ['blockNewAccountCreation', 'Bloquear novos cadastros', 'Impede criar conta/perfil novo.'],
  ['blockProfileEditing', 'Bloquear edição de perfil', 'Impede ajustes de avatar, nome e perfil.'],
  ['blockRoomJoin', 'Bloquear entrada em salas', 'Impede entrar em salas.'],
  ['blockRoomCreation', 'Bloquear criação de salas', 'Impede criar salas novas.'],
  ['blockRoomMessages', 'Bloquear mensagens em salas', 'Desliga envio de mensagens públicas.'],
  ['blockPrivateMessages', 'Bloquear PVs', 'Desliga mensagens privadas.'],
  ['blockTextMessages', 'Bloquear texto', 'Impede envio de mensagens de texto.'],
  ['blockMediaUploads', 'Bloquear mídia', 'Impede envio geral de mídia.'],
  ['blockImageUploads', 'Bloquear imagens', 'Impede envio de imagens.'],
  ['blockVideoUploads', 'Bloquear vídeos', 'Impede envio de vídeos.'],
  ['blockAudioUploads', 'Bloquear áudio', 'Impede envio de áudios.'],
  ['blockFileUploads', 'Bloquear arquivos', 'Impede envio de arquivos.'],
  ['blockGif', 'Bloquear GIFs / figurinhas', 'Desliga GIFs e stickers.'],
  ['blockSecretMessages', 'Bloquear modo secreto', 'Impede mensagens secretas.'],
  ['blockCalls', 'Bloquear chamadas', 'Impede áudio/vídeo calls.'],
  ['blockUserSearch', 'Bloquear busca de usuários', 'Impede busca e descoberta de usuários.'],
  ['blockRoomPolls', 'Bloquear enquetes', 'Impede criar votações e enquetes.'],
  ['forceDatabaseErrorScreenApp', 'Tela de falha no app', 'Força tela de indisponibilidade só no app.'],
  ['forceDatabaseErrorScreenWeb', 'Tela de falha no site', 'Força tela de indisponibilidade só no site.']
];

const AD_BOOLEAN_FIELDS = [
  ['adsEnabled', 'Ads globais', 'Chave mestre para o app inteiro.'],
  ['roomListBannerEnabled', 'Banner na lista de salas', 'Exibe bloco patrocinado na lista.'],
  ['roomListEntryOpenEnabled', 'Open ad ao abrir salas', 'Mostra anúncio ao chegar na lista de salas.'],
  ['roomListPeriodicEnabled', 'Interstitial periódico', 'Mostra anúncio periódico na experiência principal.'],
  ['roomExitInterstitialEnabled', 'Interstitial ao sair da sala', 'Mostra ao sair de sala/chat.'],
  ['turboRewardedEnabled', 'Rewarded do Turbo', 'Controle do anúncio recompensado do passe turbo.'],
  ['appForegroundOpenEnabled', 'Open app foreground', 'Mostra open ad ao voltar para o app/site.'],
  ['inlineMessageAdsEnabled', 'Ads inline', 'Espaços patrocinados no fluxo de mensagens.']
];

const AD_COOLDOWN_FIELDS = [
  ['roomListEntryCooldownMinutes', 'Cooldown abrir lista', 30],
  ['roomListPeriodicCooldownMinutes', 'Cooldown periódico', 10],
  ['roomExitInterstitialCooldownMinutes', 'Cooldown sair da sala', 20],
  ['appForegroundOpenCooldownMinutes', 'Cooldown foreground', 30]
];

const TURBO_FIELDS = [
  ['enabled', 'Turbo geral', 'Se desligado, os recursos deixam de exigir Turbo para todos.'],
  ['roomEntryEnabled', 'Entrada em salas Turbo', 'Se desligado, salas Turbo ficam livres para todos.'],
  ['privateMessagesEnabled', 'PVs Turbo', 'Se desligado, PV fica liberado sem Turbo.'],
  ['radiosEnabled', 'Rádio Turbo', 'Se desligado, rádio fica livre sem Turbo.'],
  ['roomMediaEnabled', 'Mídia em sala', 'Se desligado, mídia em sala fica livre sem Turbo.'],
  ['secretModeEnabled', 'Modo secreto', 'Se desligado, modo secreto fica livre sem Turbo.'],
  ['stickerSaveEnabled', 'Salvar stickers/imagens', 'Se desligado, salvar mídias fica livre sem Turbo.']
];

const DATABASE_PATH_SHORTCUTS = ['users', 'rooms', 'room_messages', 'messages', 'presence', 'user_rooms', 'reports', 'admin_logs', 'blocked_ips', 'banned_users', 'app_config'];

const DATABASE_FILTERS = ['Tudo', 'Crítico', 'Alerta', 'OK'];

function formatDateTime(value) {
  if (!value) return 'Sem registro';
  return new Date(value).toLocaleString();
}

function statNumber(value) {
  return new Intl.NumberFormat('pt-BR').format(Number(value || 0));
}

function normalizeUpper(value) {
  return String(value || '').trim().toUpperCase();
}

function deepByteSize(value) {
  try {
    return new TextEncoder().encode(JSON.stringify(value ?? null)).length;
  } catch {
    return 0;
  }
}

function classifyNode(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null || value === undefined) return 'null';
  return typeof value;
}

function previewNode(value) {
  if (value === null || value === undefined) return 'Nó vazio.';
  if (typeof value === 'string') return value.slice(0, 240);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return `Lista com ${value.length} item(ns).`;
  if (typeof value === 'object') return `Objeto com ${Object.keys(value).length} chave(s).`;
  return 'Prévia indisponível.';
}

function safeJson(value) {
  try {
    return JSON.stringify(value ?? null, null, 2);
  } catch {
    return '{}';
  }
}

function diagnosticTone(status) {
  if (status === 'critical') return 'badge-banned';
  if (status === 'warning') return 'badge-admin';
  return 'badge-user';
}

function bannedExpiresLabel(info) {
  if (!info?.isTemporary) return info?.isNuclear ? 'Nuclear' : 'Permanente';
  if (!info.expiresAt) return 'Temporário';
  return `Até ${formatDateTime(info.expiresAt)}`;
}

function ToggleCard({ title, description, value, onToggle }) {
  return (
    <button className={`admin-toggle-card ${value ? 'active' : ''}`} onClick={onToggle}>
      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
      <div className={`admin-toggle-switch ${value ? 'on' : ''}`}>
        <span />
      </div>
    </button>
  );
}

function SectionCard({ title, description, right, children }) {
  return (
    <section className="admin-panel-card">
      <div className="panel-card-header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

const AdminPanel = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authForm, setAuthForm] = useState({ user: '', pass: '' });
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState({});
  const [rooms, setRooms] = useState({});
  const [reports, setReports] = useState({});
  const [logs, setLogs] = useState([]);
  const [blockedIps, setBlockedIps] = useState({});
  const [safetyViolations, setSafetyViolations] = useState({});
  const [moderators, setModerators] = useState({});
  const [manualPremium, setManualPremium] = useState({});
  const [bannedUsers, setBannedUsers] = useState({});
  const [runtimeControls, setRuntimeControls] = useState({});
  const [adControls, setAdControls] = useState(AD_DEFAULTS);
  const [turboControls, setTurboControls] = useState(TURBO_DEFAULTS);
  const [globalNotice, setGlobalNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [selectedRoomIds, setSelectedRoomIds] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [roomSearch, setRoomSearch] = useState('');
  const [reportSearch, setReportSearch] = useState('');
  const [teamSearch, setTeamSearch] = useState('');
  const [banSearch, setBanSearch] = useState('');
  const [dbPath, setDbPath] = useState('users');
  const [dbChildKey, setDbChildKey] = useState('');
  const [dbJson, setDbJson] = useState('{}');
  const [dbUseAutoKey, setDbUseAutoKey] = useState(false);
  const [inspectedNode, setInspectedNode] = useState(null);
  const [diagnosticsFilter, setDiagnosticsFilter] = useState('Tudo');
  const [noticeDraft, setNoticeDraft] = useState({ title: '', message: '' });
  const [roomFilterStatus, setRoomFilterStatus] = useState('Todas');
  const [safetyFilterEnabled, setSafetyFilterEnabled] = useState(true);
  const [mediaSafetyEnabled, setMediaSafetyEnabled] = useState(true);
  const [mediaSafetyAutoBan, setMediaSafetyAutoBan] = useState(true);
  const [mediaSafetyRanges, setMediaSafetyRanges] = useState({ '0-3': true, '4-7': true, '8-12': false, '13-17': false });
  const [cooldownDrafts, setCooldownDrafts] = useState(() => ({
    roomListEntryCooldownMinutes: 30,
    roomListPeriodicCooldownMinutes: 10,
    roomExitInterstitialCooldownMinutes: 20,
    appForegroundOpenCooldownMinutes: 30
  }));

  useEffect(() => {
    setCooldownDrafts({
      roomListEntryCooldownMinutes: Number(adControls.roomListEntryCooldownMinutes || 30),
      roomListPeriodicCooldownMinutes: Number(adControls.roomListPeriodicCooldownMinutes || 10),
      roomExitInterstitialCooldownMinutes: Number(adControls.roomExitInterstitialCooldownMinutes || 20),
      appForegroundOpenCooldownMinutes: Number(adControls.appForegroundOpenCooldownMinutes || 30)
    });
  }, [adControls]);

  useEffect(() => {
    let unsubs = [];

    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error(error);
        }
        return;
      }

      const usernameSnapshot = await get(ref(database, `uid_to_username/${user.uid}`));
      const linkedUsername = usernameSnapshot.exists() ? String(usernameSnapshot.val() || '') : '';
      const canAccessAdmin = await resolveAdminAccess({ username: linkedUsername, uid: user.uid });
      setIsAuthorized(canAccessAdmin);
      if (!canAccessAdmin) {
        localStorage.removeItem('admin_authorized');
        setLoading(false);
        return;
      }

      localStorage.setItem('admin_authorized', 'true');

      const bind = (path, setter, transform = (snapshot) => snapshot.val() || {}) => {
        const off = onValue(ref(database, path), (snapshot) => setter(transform(snapshot)));
        unsubs.push(off);
      };

      bind('users', setUsers);
      bind('rooms', setRooms);
      bind('reports', setReports);
      bind('blocked_ips', setBlockedIps);
      bind('safety_violations', setSafetyViolations);
      bind('moderators', setModerators);
      bind('manual_premium', setManualPremium);
      bind('banned_users', setBannedUsers);
      bind('app_config/runtime_controls', (value) => setRuntimeControls(value || {}), (snapshot) => snapshot.val() || {});
      bind('app_config/ad_controls', (value) => setAdControls({ ...AD_DEFAULTS, ...(value || {}) }), (snapshot) => snapshot.val() || {});
      bind('app_config/turbo_controls', (value) => setTurboControls({ ...TURBO_DEFAULTS, ...(value || {}) }), (snapshot) => snapshot.val() || {});
      bind('app_config/media_safety', (value) => {
        const data = value || {};
        setSafetyFilterEnabled(data.enabled !== false);
        setMediaSafetyEnabled(data.enabled !== false);
        setMediaSafetyAutoBan(data.autoBan !== false);
        setMediaSafetyRanges({ '0-3': true, '4-7': true, '8-12': false, '13-17': false, ...(data.ranges || {}) });
      });
      bind('current_global_notice', (value) => setGlobalNotice(value && value.id ? value : null), (snapshot) => snapshot.val() || null);
      const offLogs = onValue(query(ref(database, 'admin_logs'), limitToLast(200)), (snapshot) => {
        const raw = snapshot.val() || {};
        setLogs(Object.values(raw).sort((a, b) => (b?.timestamp || 0) - (a?.timestamp || 0)));
      });
      unsubs.push(offLogs);

      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubs.forEach((off) => off && off());
    };
  }, []);

  const createLog = async (action, target, details) => {
    await set(ref(database, `admin_logs/${Date.now()}`), {
      timestamp: Date.now(),
      adminId: auth.currentUser?.uid || 'system',
      adminName: authForm.user || auth.currentUser?.uid || 'web-admin',
      action,
      target,
      details
    });
  };

  const handleAction = async (taskName, callback) => {
    setProcessing(taskName);
    try {
      await callback();
      alert(`✅ ${taskName} concluído.`);
    } catch (error) {
      console.error(error);
      alert(`❌ ${taskName} falhou.\n${error.message || 'Verifique regras do Firebase.'}`);
    } finally {
      setProcessing(null);
    }
  };

  const stats = useMemo(() => {
    const userEntries = Object.entries(users);
    const premiumUsers = Object.entries(manualPremium).filter(([, value]) => value === true).length
      + userEntries.filter(([, user]) => user?.isPremium === true).length;
    const inactiveRooms = Object.values(rooms).filter((room) => room?.active === false).length;
    const onlineUsers = userEntries.filter(([, user]) => user?.isOnline).length;
    return {
      totalUsers: userEntries.length,
      totalRooms: Object.keys(rooms).length,
      activeReports: Object.keys(reports).length,
      onlineUsers,
      safetyViolations: Object.keys(safetyViolations).length,
      bannedUsers: Object.keys(bannedUsers).length,
      blockedIps: Object.keys(blockedIps).length,
      premiumUsers,
      inactiveRooms,
      activeModerators: Object.values(moderators).filter(Boolean).length
    };
  }, [users, rooms, reports, blockedIps, safetyViolations, manualPremium, bannedUsers, moderators]);

  const teamMembers = useMemo(() => {
    const names = new Set();
    Object.entries(users).forEach(([username, user]) => {
      if (user?.role === 'adm' || user?.role === 'moderador' || user?.role === 'mod' || moderators[username] === true || isUserAdminName(username)) {
        names.add(username);
      }
    });
    Object.entries(moderators).forEach(([username, active]) => {
      if (active) names.add(username);
    });
    return [...names].map((username) => ({
      username,
      profile: users[username] || null,
      isAdmin: users[username]?.role === 'adm' || isUserAdminName(username),
      isModerator: moderators[username] === true || users[username]?.role === 'moderador' || users[username]?.role === 'mod'
    })).filter((item) => {
      const term = teamSearch.trim().toLowerCase();
      if (!term) return true;
      return item.username.toLowerCase().includes(term) || String(item.profile?.uid || '').toLowerCase().includes(term);
    });
  }, [users, moderators, teamSearch]);

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    return Object.entries(users).filter(([username, data]) => {
      if (!term) return true;
      return username.toLowerCase().includes(term) || String(data?.uid || '').toLowerCase().includes(term);
    });
  }, [users, userSearch]);

  const filteredRooms = useMemo(() => {
    const term = roomSearch.trim().toLowerCase();
    return Object.entries(rooms).filter(([roomId, room]) => {
      const matchesQuery = !term || roomId.toLowerCase().includes(term)
        || String(room?.name || '').toLowerCase().includes(term)
        || String(room?.regionKey || room?.localeTag || '').toLowerCase().includes(term);
      const matchesFilter = roomFilterStatus === 'Todas'
        || (roomFilterStatus === 'Ativas' && room?.active !== false)
        || (roomFilterStatus === 'Inativas' && room?.active === false)
        || (roomFilterStatus === 'Fixadas' && room?.isPinned === true)
        || (roomFilterStatus === 'Staff' && room?.isPrivate === true);
      return matchesQuery && matchesFilter;
    });
  }, [rooms, roomSearch, roomFilterStatus]);

  const filteredReports = useMemo(() => {
    const term = reportSearch.trim().toLowerCase();
    return Object.entries(reports).filter(([reportId, report]) => {
      if (!term) return true;
      return reportId.toLowerCase().includes(term)
        || String(report?.reportedUsername || '').toLowerCase().includes(term)
        || String(report?.reporterUsername || '').toLowerCase().includes(term)
        || String(report?.reason || '').toLowerCase().includes(term);
    });
  }, [reports, reportSearch]);

  const bannedList = useMemo(() => {
    const term = banSearch.trim().toLowerCase();
    return Object.entries(bannedUsers).map(([uid, info]) => ({
      uid,
      username: info?.username || info?.name || uid,
      isNuclear: info?.isNuclear === true,
      isTemporary: info?.isTemporary === true,
      expiresAt: Number(info?.expiresAt || 0),
      reason: info?.reason || ''
    })).filter((item) => {
      if (!term) return true;
      return item.uid.toLowerCase().includes(term)
        || item.username.toLowerCase().includes(term)
        || item.reason.toLowerCase().includes(term);
    });
  }, [bannedUsers, banSearch]);

  const diagnostics = useMemo(() => {
    const userEntries = Object.entries(users);
    const roomEntries = Object.entries(rooms);
    const roomIds = new Set(roomEntries.map(([roomId]) => roomId));
    const usersWithoutUid = userEntries.filter(([, user]) => !String(user?.uid || '').trim()).length;
    const roomsWithoutName = roomEntries.filter(([, room]) => !String(room?.name || '').trim()).length;

    const roomParticipants = Object.entries(users).length ? {} : {};
    void roomParticipants;
    return [];
  }, [users, rooms]);

  const [diagnosticItems, setDiagnosticItems] = useState([]);

  useEffect(() => {
    const buildDiagnostics = async () => {
      if (!isAuthorized) return;
      try {
        const [participantsSnap, userRoomsSnap, presenceSnap] = await Promise.all([
          get(ref(database, 'room_participants')),
          get(ref(database, 'user_rooms')),
          get(ref(database, 'presence'))
        ]);
        const roomIds = new Set(Object.keys(rooms));
        const usersWithoutUid = Object.entries(users).filter(([, user]) => !String(user?.uid || '').trim()).length;
        const roomsWithoutName = Object.entries(rooms).filter(([, room]) => !String(room?.name || '').trim()).length;

        let ghostRoomParticipantNodes = 0;
        participantsSnap.forEach((roomSnap) => {
          if (!roomIds.has(roomSnap.key)) {
            ghostRoomParticipantNodes += roomSnap.size;
          }
        });

        let orphanedUserRoomLinks = 0;
        userRoomsSnap.forEach((userSnap) => {
          userSnap.forEach((roomSnap) => {
            if (!roomIds.has(roomSnap.key)) orphanedUserRoomLinks += 1;
          });
        });

        let stalePresenceCount = 0;
        const stalePresenceLimit = Date.now() - (48 * 60 * 60 * 1000);
        presenceSnap.forEach((presenceItem) => {
          const value = presenceItem.val();
          const timestamp = typeof value === 'number' ? value : 0;
          if (timestamp > 0 && timestamp < stalePresenceLimit) stalePresenceCount += 1;
        });

        const next = [
          { label: 'Usuários', path: 'users', count: Object.keys(users).length, status: usersWithoutUid === 0 ? 'ok' : 'warning', details: usersWithoutUid === 0 ? 'Todos os perfis principais possuem UID.' : `${usersWithoutUid} usuário(s) sem UID salvo.` },
          { label: 'Salas', path: 'rooms', count: Object.keys(rooms).length, status: roomsWithoutName === 0 ? 'ok' : 'warning', details: roomsWithoutName === 0 ? 'Todas as salas possuem nome.' : `${roomsWithoutName} sala(s) sem nome.` },
          { label: 'Participantes fantasma', path: 'room_participants', count: ghostRoomParticipantNodes, status: ghostRoomParticipantNodes === 0 ? 'ok' : 'warning', details: ghostRoomParticipantNodes === 0 ? 'Nenhum participante preso em sala inexistente.' : `${ghostRoomParticipantNodes} participante(s) em salas que não existem mais.` },
          { label: 'Links user_rooms', path: 'user_rooms', count: orphanedUserRoomLinks, status: orphanedUserRoomLinks === 0 ? 'ok' : 'warning', details: orphanedUserRoomLinks === 0 ? 'Nenhum vínculo órfão detectado.' : `${orphanedUserRoomLinks} vínculo(s) apontando para salas ausentes.` },
          { label: 'Denúncias', path: 'reports', count: Object.keys(reports).length, status: Object.keys(reports).length === 0 ? 'ok' : 'warning', details: Object.keys(reports).length === 0 ? 'Sem denúncias pendentes.' : 'Existem denúncias aguardando revisão.' },
          { label: 'Logs admin', path: 'admin_logs', count: logs.length, status: 'ok', details: 'Histórico de auditoria carregado.' },
          { label: 'Presence antigo', path: 'presence', count: stalePresenceCount, status: stalePresenceCount === 0 ? 'ok' : 'warning', details: stalePresenceCount === 0 ? 'Nenhum presence antigo acima de 48h.' : `${stalePresenceCount} presence(s) parecem stale há mais de 48h.` }
        ];
        setDiagnosticItems(next);
      } catch (error) {
        setDiagnosticItems([{ label: 'Falha no diagnóstico', path: '/', count: 0, status: 'critical', details: error.message || 'Erro desconhecido.' }]);
      }
    };

    buildDiagnostics();
  }, [isAuthorized, users, rooms, reports, logs]);

  const filteredDiagnostics = useMemo(() => diagnosticItems.filter((item) => {
    if (diagnosticsFilter === 'Tudo') return true;
    if (diagnosticsFilter === 'Crítico') return item.status === 'critical';
    if (diagnosticsFilter === 'Alerta') return item.status === 'warning';
    return item.status === 'ok';
  }), [diagnosticItems, diagnosticsFilter]);

  const topRooms = useMemo(() => {
    return [...Object.entries(rooms)]
      .sort((a, b) => (b[1]?.participantCount || 0) - (a[1]?.participantCount || 0))
      .slice(0, 6);
  }, [rooms]);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (authForm.user !== 'Jack O ADM' || authForm.pass !== '5341') {
      alert('Credenciais master inválidas.');
      return;
    }

    await handleAction('Elevação de acesso', async () => {
      const userCredential = await signInAnonymously(auth);
      const currentUser = userCredential.user;
      await set(ref(database, `admin_access_keys/${currentUser.uid}`), '5341');
      const usernameSnapshot = await get(ref(database, `uid_to_username/${currentUser.uid}`));
      const linkedUsername = usernameSnapshot.exists() ? String(usernameSnapshot.val() || '') : authForm.user;
      const canAccessAdmin = await resolveAdminAccess({ username: linkedUsername, uid: currentUser.uid });
      if (!canAccessAdmin) throw new Error('Falha ao validar privilégios.');
      setIsAuthorized(true);
      localStorage.setItem('admin_authorized', 'true');
      await createLog('LOGIN_MASTER_WEB', 'painel_web', currentUser.uid);
    });
  };

  const updatePathValue = async (path, value) => {
    await set(ref(database, path), value);
  };

  const inspectDatabasePath = async (path) => {
    const normalized = String(path || '').replace(/^\/+/, '').trim();
    const snapshot = await get(ref(database, normalized));
    const value = snapshot.val();
    setInspectedNode({
      path: normalized || '/',
      exists: snapshot.exists(),
      type: classifyNode(value),
      childrenCount: snapshot.size,
      estimatedBytes: deepByteSize(value),
      preview: previewNode(value),
      childKeys: Object.keys(value || {}).slice(0, 40),
      json: safeJson(value)
    });
    setDbJson(safeJson(value));
  };

  const cleanupUserReferences = async (targets) => {
    if (!targets.length) return;
    const updates = {};
    const targetNames = new Set(targets.map((target) => normalizeUpper(target.username)));
    const targetUids = new Set(targets.map((target) => String(target.uid || '').trim()).filter(Boolean));
    const matchesUser = (value) => {
      const normalized = normalizeUpper(value);
      return targetNames.has(normalized) || targetUids.has(String(value || '').trim());
    };

    targets.forEach((target) => {
      const upper = normalizeUpper(target.username);
      const uid = String(target.uid || '').trim();
      if (upper) {
        updates[`users/${upper}`] = null;
        updates[`username_to_uid/${upper}`] = null;
        updates[`manual_premium/${upper}`] = null;
        updates[`moderators/${upper}`] = null;
        updates[`user_ips/${upper}`] = null;
        updates[`user_rooms/${upper}`] = null;
      }
      if (uid) {
        updates[`uid_to_username/${uid}`] = null;
        updates[`presence/${uid}`] = null;
        updates[`user_stickers/${uid}`] = null;
        updates[`fcmTokens/${uid}`] = null;
        updates[`banned_users/${uid}`] = null;
        updates[`user_ips/${uid}`] = null;
      }
    });

    const [roomMessagesSnap, privateMessagesSnap, roomParticipantsSnap, reportsSnap, roomBansSnap] = await Promise.all([
      get(ref(database, 'room_messages')),
      get(ref(database, 'messages')),
      get(ref(database, 'room_participants')),
      get(ref(database, 'reports')),
      get(ref(database, 'room_bans'))
    ]);

    roomMessagesSnap.forEach((roomSnap) => {
      roomSnap.forEach((msgSnap) => {
        const msg = msgSnap.val() || {};
        if (matchesUser(msg.senderId) || matchesUser(msg.senderName)) {
          updates[`room_messages/${roomSnap.key}/${msgSnap.key}`] = null;
        }
      });
    });

    privateMessagesSnap.forEach((chatSnap) => {
      chatSnap.forEach((msgSnap) => {
        const msg = msgSnap.val() || {};
        if (matchesUser(msg.senderId) || matchesUser(msg.senderName)) {
          updates[`messages/${chatSnap.key}/${msgSnap.key}`] = null;
        }
      });
    });

    roomParticipantsSnap.forEach((roomSnap) => {
      roomSnap.forEach((participantSnap) => {
        const participant = participantSnap.val() || {};
        if (
          matchesUser(participantSnap.key) ||
          matchesUser(participant.uid) ||
          matchesUser(participant.username) ||
          matchesUser(participant.name)
        ) {
          updates[`room_participants/${roomSnap.key}/${participantSnap.key}`] = null;
        }
      });
    });

    reportsSnap.forEach((reportSnap) => {
      const report = reportSnap.val() || {};
      if (
        matchesUser(report.reportedUid) ||
        matchesUser(report.reportedUsername) ||
        matchesUser(report.reporterUid) ||
        matchesUser(report.reporterUsername)
      ) {
        updates[`reports/${reportSnap.key}`] = null;
      }
    });

    roomBansSnap.forEach((roomSnap) => {
      roomSnap.forEach((banSnap) => {
        const ban = banSnap.val() || {};
        if (
          matchesUser(banSnap.key) ||
          matchesUser(ban.uid) ||
          matchesUser(ban.username)
        ) {
          updates[`room_bans/${roomSnap.key}/${banSnap.key}`] = null;
        }
      });
    });

    await update(ref(database), updates);
  };

  const executeBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    await handleAction(`Broadcast para ${selectedRoomIds.length} sala(s)`, async () => {
      const updates = {};
      selectedRoomIds.forEach((roomId) => {
        const newMsgId = push(ref(database, `room_messages/${roomId}`)).key;
        updates[`room_messages/${roomId}/${newMsgId}`] = {
          id: newMsgId,
          text: `⚠️ AVISO SISTEMA: ${broadcastMsg}`,
          senderName: 'SISTEMA',
          senderId: 'system',
          timestamp: Date.now(),
          isAnnouncement: true
        };
      });
      await update(ref(database), updates);
      await createLog('BROADCAST', `${selectedRoomIds.length} salas`, broadcastMsg);
      setShowBroadcastModal(false);
      setBroadcastMsg('');
    });
  };

  const globalSearch = async () => {
    const term = window.prompt('Digite o termo para busca global (salas e chats):');
    if (!term) return;
    await handleAction(`Busca global por "${term}"`, async () => {
      const [roomMessages, privateMessages] = await Promise.all([
        get(ref(database, 'room_messages')),
        get(ref(database, 'messages'))
      ]);
      const results = [];
      const scanNode = (snapshot, type) => {
        snapshot.forEach((groupSnap) => {
          groupSnap.forEach((messageSnap) => {
            const message = messageSnap.val() || {};
            if (String(message.text || '').toLowerCase().includes(term.toLowerCase())) {
              results.push({
                type,
                location: groupSnap.key,
                user: message.senderName || 'Desconhecido',
                uid: message.senderId || 'sem-uid',
                text: message.text,
                time: message.timestamp
              });
            }
          });
        });
      };
      scanNode(roomMessages, 'SALA');
      scanNode(privateMessages, 'CHAT');
      if (!results.length) {
        alert('Nenhuma mensagem encontrada.');
        return;
      }
      const report = results.map((item) => `📍 ${item.type} (${item.location})\n👤 ${item.user}\n🆔 ${item.uid}\n🕒 ${formatDateTime(item.time)}\n💬 ${item.text}`).join('\n\n');
      const reportWindow = window.open('', '_blank');
      reportWindow?.document.write(`<pre style="background:#050505;color:#d7efff;padding:24px;font-family:monospace;white-space:pre-wrap">${report}</pre>`);
    });
  };

  const cleanOldLogs = async () => {
    if (!window.confirm('Apagar logs com mais de 7 dias?')) return;
    await handleAction('Limpeza de logs antigos', async () => {
      const limit = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const snapshot = await get(ref(database, 'admin_logs'));
      const updates = {};
      snapshot.forEach((item) => {
        if (Number(item.key || 0) < limit) updates[`admin_logs/${item.key}`] = null;
      });
      await update(ref(database), updates);
      await createLog('CLEAN_OLD_LOGS', 'admin_logs', 'logs > 7 dias removidos');
    });
  };

  const nuclearDelete = async (username, uid) => {
    if (window.prompt(`Digite CONFIRMAR para deletar @${username}`) !== 'CONFIRMAR') return;
    await handleAction(`Exclusão profunda de ${username}`, async () => {
      await cleanupUserReferences([{ username, uid }]);
      await createLog('NUCLEAR_DELETE', username, uid || 'sem-uid');
    });
  };

  const bulkDeleteInactiveUsers = async () => {
    if (!window.confirm('Apagar usuários offline/inativos há mais de 7 dias?')) return;
    await handleAction('Limpeza de usuários inativos', async () => {
      const limit = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const targets = Object.entries(users)
        .filter(([, user]) => {
          const lastActive = Number(user?.lastActive || user?.createdAt || 0);
          return !user?.isOnline && lastActive > 0 && lastActive < limit;
        })
        .map(([username, user]) => ({ username, uid: user?.uid || '' }));
      if (!targets.length) throw new Error('Nenhum usuário elegível encontrado.');
      await cleanupUserReferences(targets);
      await createLog('BULK_DELETE_INACTIVE_USERS', `${targets.length} usuários`, 'limpeza > 7 dias');
    });
  };

  const repairRoomParticipantCounts = async () => {
    await handleAction('Reparo de contagem das salas', async () => {
      const participantsSnap = await get(ref(database, 'room_participants'));
      let updatedCount = 0;
      const updates = {};
      Object.entries(rooms).forEach(([roomId, room]) => {
        const actual = participantsSnap.child(roomId).size;
        const saved = Number(room?.participantCount || 0);
        if (saved !== actual) {
          updates[`rooms/${roomId}/participantCount`] = actual;
          updatedCount += 1;
        }
      });
      await update(ref(database), updates);
      await createLog('REPAIR_ROOM_COUNTS', `${updatedCount} salas`, 'participantCount sincronizado');
    });
  };

  const cleanupGhostRoomParticipants = async () => {
    await handleAction('Limpeza de participantes fantasma', async () => {
      const roomIds = new Set(Object.keys(rooms));
      const participantsSnap = await get(ref(database, 'room_participants'));
      let removed = 0;
      const updates = {};
      participantsSnap.forEach((roomSnap) => {
        if (!roomIds.has(roomSnap.key)) {
          removed += roomSnap.size;
          updates[`room_participants/${roomSnap.key}`] = null;
        }
      });
      await update(ref(database), updates);
      await createLog('CLEAN_GHOST_PARTICIPANTS', `${removed} participantes`, 'salas inexistentes');
    });
  };

  const cleanupOrphanedUserRooms = async () => {
    await handleAction('Limpeza de user_rooms órfão', async () => {
      const roomIds = new Set(Object.keys(rooms));
      const userRoomsSnap = await get(ref(database, 'user_rooms'));
      let removed = 0;
      const updates = {};
      userRoomsSnap.forEach((userSnap) => {
        userSnap.forEach((roomSnap) => {
          if (!roomIds.has(roomSnap.key)) {
            updates[`user_rooms/${userSnap.key}/${roomSnap.key}`] = null;
            removed += 1;
          }
        });
      });
      await update(ref(database), updates);
      await createLog('CLEAN_ORPHAN_USER_ROOMS', `${removed} vínculos`, 'salas ausentes');
    });
  };

  const cleanupStalePresence = async () => {
    await handleAction('Limpeza de presence antigo', async () => {
      const limit = Date.now() - (48 * 60 * 60 * 1000);
      const presenceSnap = await get(ref(database, 'presence'));
      let removed = 0;
      const updates = {};
      presenceSnap.forEach((presenceItem) => {
        const value = presenceItem.val();
        const timestamp = typeof value === 'number' ? value : 0;
        if (timestamp > 0 && timestamp < limit) {
          updates[`presence/${presenceItem.key}`] = null;
          removed += 1;
        }
      });
      await update(ref(database), updates);
      await createLog('CLEAN_STALE_PRESENCE', `${removed} presence`, 'stale > 48h');
    });
  };

  const createDatabaseChild = async () => {
    await handleAction('Criação de nó no banco', async () => {
      const parsed = JSON.parse(dbJson || '{}');
      const parentRef = ref(database, dbPath.replace(/^\/+/, '').trim());
      const childRef = dbUseAutoKey ? push(parentRef) : ref(database, `${dbPath.replace(/^\/+/, '').trim()}/${dbChildKey.trim()}`);
      if (!dbUseAutoKey && !dbChildKey.trim()) throw new Error('Informe a chave manual.');
      await set(childRef, parsed);
      await createLog('CREATE_DB_NODE', dbPath, childRef.key || dbChildKey.trim());
    });
  };

  const updateDatabaseNode = async () => {
    await handleAction('Atualização de nó do banco', async () => {
      const normalized = dbPath.replace(/^\/+/, '').trim();
      if (!normalized) throw new Error('Editar a raiz inteira não é permitido.');
      const parsed = JSON.parse(dbJson || '{}');
      await set(ref(database, normalized), parsed);
      await createLog('UPDATE_DB_NODE', normalized, 'payload atualizado');
      await inspectDatabasePath(normalized);
    });
  };

  const deleteDatabaseNode = async () => {
    if (!window.confirm(`Apagar o nó ${dbPath}?`)) return;
    await handleAction('Remoção de nó do banco', async () => {
      const normalized = dbPath.replace(/^\/+/, '').trim();
      if (!normalized) throw new Error('Apagar a raiz inteira não é permitido.');
      await remove(ref(database, normalized));
      await createLog('DELETE_DB_NODE', normalized, 'remoção manual');
      setInspectedNode({
        path: normalized,
        exists: false,
        type: 'null',
        childrenCount: 0,
        estimatedBytes: 0,
        preview: 'Nó removido.',
        childKeys: [],
        json: '{}'
      });
    });
  };

  const toggleModerator = async (username, next) => {
    await handleAction(`${next ? 'Promover' : 'Remover'} moderador`, async () => {
      await updatePathValue(`moderators/${username}`, next ? true : null);
      await createLog(next ? 'MAKE_MOD' : 'REMOVE_MOD', username, 'moderator');
    });
  };

  const toggleAdminRole = async (username, next) => {
    await handleAction(`${next ? 'Promover' : 'Remover'} admin`, async () => {
      await updatePathValue(`users/${username}/role`, next ? 'adm' : null);
      await createLog(next ? 'MAKE_ADMIN' : 'REMOVE_ADMIN', username, 'role adm');
    });
  };

  const unbanUser = async (uid, username) => {
    await handleAction(`Desbanir ${username}`, async () => {
      const upper = normalizeUpper(username);
      const updates = {
        [`banned_users/${uid}`]: null,
        [`users/${upper}/banned`]: null,
        [`users/${upper}/bannedIp`]: null
      };
      const profile = users[upper] || {};
      const bannedIp = String(profile?.bannedIp || '').trim();
      if (bannedIp) {
        updates[`blocked_ips/${bannedIp.replace(/\./g, '_')}`] = null;
      }
      await update(ref(database), updates);
      await createLog('UNBAN_USER', username, uid);
    });
  };

  const saveNotice = async () => {
    if (!noticeDraft.title.trim() || !noticeDraft.message.trim()) return;
    await handleAction('Publicação de aviso global', async () => {
      const id = `notice_${Date.now()}`;
      await set(ref(database, 'current_global_notice'), {
        id,
        title: noticeDraft.title.trim(),
        message: noticeDraft.message.trim(),
        createdAt: Date.now(),
        createdBy: auth.currentUser?.uid || 'web-admin'
      });
      await createLog('SET_GLOBAL_NOTICE', id, noticeDraft.title.trim());
    });
  };

  const clearNotice = async () => {
    await handleAction('Remoção de aviso global', async () => {
      await remove(ref(database, 'current_global_notice'));
      await createLog('CLEAR_GLOBAL_NOTICE', 'current_global_notice', 'aviso removido');
    });
  };

  if (loading) {
    return (
      <div className="admin-login-container">
        <div className="admin-auth-card">
          <div className="admin-auth-badge"><RefreshCw size={16} /> Carregando privilégios</div>
          <h1>BP Control Center</h1>
          <p>Validando acesso e carregando o estado do painel web.</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="admin-login-container">
        <div className="admin-auth-card">
          <div className="admin-auth-badge">
            <Shield size={18} />
            Controle restrito
          </div>
          <h1>BP Control Center</h1>
          <p>Acesso reservado para a administração master do projeto.</p>
          <form onSubmit={handleLogin}>
            <input className="admin-input" type="text" placeholder="Usuário master" value={authForm.user} onChange={(event) => setAuthForm({ ...authForm, user: event.target.value })} />
            <input className="admin-input" type="password" placeholder="Senha master" value={authForm.pass} onChange={(event) => setAuthForm({ ...authForm, pass: event.target.value })} />
            <button className="admin-btn admin-btn-primary admin-auth-submit">Acessar sistema</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {processing && <div className="admin-overlay">⚡ Processando: {processing}</div>}

      {showBroadcastModal && (
        <div className="admin-overlay" style={{ background: 'rgba(0,0,0,0.92)' }}>
          <div className="admin-modal admin-broadcast-modal">
            <div className="admin-modal-header">
              <div>
                <h3>Broadcast para salas</h3>
                <p>Envie um aviso administrativo para várias salas ao mesmo tempo.</p>
              </div>
              <button onClick={() => setShowBroadcastModal(false)} className="admin-icon-btn"><X size={18} /></button>
            </div>
            <textarea className="admin-input admin-textarea" placeholder="Escreva a mensagem do sistema..." value={broadcastMsg} onChange={(event) => setBroadcastMsg(event.target.value)} />
            <div className="admin-selection-toolbar">
              <strong>Salas disponíveis</strong>
              <button className="admin-link-btn" onClick={() => setSelectedRoomIds(Object.keys(rooms))}>Selecionar todas</button>
            </div>
            <div className="admin-selection-list">
              {Object.entries(rooms).map(([roomId, room]) => {
                const checked = selectedRoomIds.includes(roomId);
                return (
                  <button key={roomId} className={`admin-selection-item ${checked ? 'selected' : ''}`} onClick={() => setSelectedRoomIds((prev) => (prev.includes(roomId) ? prev.filter((item) => item !== roomId) : [...prev, roomId]))}>
                    <input type="checkbox" readOnly checked={checked} />
                    <div>
                      <div className="selection-title">{room.name}</div>
                      <div className="selection-subtitle">{roomId}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn" onClick={() => setShowBroadcastModal(false)}>Cancelar</button>
              <button className="admin-btn admin-btn-primary" onClick={executeBroadcast}>Disparar para {selectedRoomIds.length} salas</button>
            </div>
          </div>
        </div>
      )}

      <aside className="admin-sidebar">
        <div className="admin-logo"><Sparkles size={18} /> BP Admin</div>
        <nav className="admin-nav">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`admin-nav-item ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <button className="admin-btn admin-btn-ghost" onClick={() => { localStorage.removeItem('admin_authorized'); setIsAuthorized(false); }}>
          <LogOut size={16} />
          Encerrar sessão
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-page-header">
          <div>
            <div className="admin-kicker">Painel web unificado</div>
            <h1>{TABS.find((tab) => tab.id === activeTab)?.label || 'Painel admin'}</h1>
            <p>Versão web espelhada no painel do app, com foco em operação, limpeza, diagnóstico e controle remoto em tempo real.</p>
          </div>
          <div className="admin-header-badges">
            <div className="admin-header-badge"><Globe2 size={15} /> Web control</div>
            <div className="admin-header-badge"><Clock3 size={15} /> {formatDateTime(Date.now())}</div>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card stat-card-hero">
            <div className="stat-label">Usuários totais</div>
            <div className="stat-value">{statNumber(stats.totalUsers)}</div>
            <div className="stat-trend">{statNumber(stats.onlineUsers)} online agora</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Salas</div>
            <div className="stat-value">{statNumber(stats.totalRooms)}</div>
            <div className="stat-trend">{statNumber(stats.inactiveRooms)} inativas</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Denúncias</div>
            <div className="stat-value">{statNumber(stats.activeReports)}</div>
            <div className="stat-trend">{statNumber(stats.safetyViolations)} violações</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Banimentos</div>
            <div className="stat-value">{statNumber(stats.bannedUsers)}</div>
            <div className="stat-trend">{statNumber(stats.blockedIps)} IPs bloqueados</div>
          </div>
        </section>

        {activeTab === 'overview' && (
          <div className="admin-dashboard-grid">
            <SectionCard title="Radar operacional" description="Resumo das áreas mais sensíveis do ecossistema agora.">
              <div className="admin-metric-grid">
                <div className="admin-mini-metric"><strong>{statNumber(stats.premiumUsers)}</strong><span>Premium / manual</span></div>
                <div className="admin-mini-metric"><strong>{statNumber(stats.activeModerators)}</strong><span>Moderadores</span></div>
                <div className="admin-mini-metric"><strong>{statNumber(topRooms.length)}</strong><span>Salas em destaque</span></div>
                <div className="admin-mini-metric"><strong>{statNumber(logs.length)}</strong><span>Eventos auditados</span></div>
              </div>
              <div className="admin-note-card">
                <strong>Aviso global</strong>
                <span>{globalNotice ? `${globalNotice.title} • ativo` : 'Nenhum aviso global ativo agora.'}</span>
              </div>
            </SectionCard>

            <SectionCard title="Salas em destaque" description="As maiores ocupações da malha atual.">
              <div className="admin-room-stack">
                {topRooms.map(([roomId, room]) => (
                  <div key={roomId} className="admin-room-stack-item">
                    <div>
                      <div className="stack-title">{room.name}</div>
                      <div className="stack-subtitle">{room.regionKey || room.localeTag || 'Sem região'}</div>
                    </div>
                    <div className="stack-meta">{room.participantCount || 0} online</div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Auditoria recente" description="Os últimos eventos administrativos gravados no banco.">
              <div className="audit-list">
                {logs.slice(0, 8).map((log, index) => (
                  <div key={`${log.timestamp}-${index}`} className="audit-item">
                    <div className="audit-topline">
                      <strong>{log.action}</strong>
                      <span>{formatDateTime(log.timestamp)}</span>
                    </div>
                    <div className="audit-target">{log.target}</div>
                    <small>Por {log.adminName} • {log.details}</small>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Atalhos de limpeza" description="As ações mais úteis do dia a dia em um bloco só.">
              <div className="admin-tool-grid">
                <button className="admin-tool-card" onClick={repairRoomParticipantCounts}><RefreshCw size={20} /><div><strong>Reparar contagem das salas</strong><span>Sincroniza participantCount com room_participants.</span></div></button>
                <button className="admin-tool-card" onClick={cleanupGhostRoomParticipants}><Trash2 size={20} /><div><strong>Limpar fantasmas</strong><span>Remove participantes presos em salas inexistentes.</span></div></button>
                <button className="admin-tool-card" onClick={cleanupOrphanedUserRooms}><Database size={20} /><div><strong>Limpar user_rooms órfão</strong><span>Remove vínculos de salas que já não existem.</span></div></button>
                <button className="admin-tool-card" onClick={cleanupStalePresence}><Clock3 size={20} /><div><strong>Limpar presence antigo</strong><span>Remove presenças stale com mais de 48h.</span></div></button>
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === 'operation' && (
          <div className="admin-section-grid">
            <SectionCard title="Centro de operação" description="Números de risco, premium e salas inativas em leitura rápida.">
              <div className="admin-metric-grid">
                <div className="admin-mini-metric"><strong>{statNumber(stats.activeReports)}</strong><span>Denúncias</span></div>
                <div className="admin-mini-metric"><strong>{statNumber(stats.safetyViolations)}</strong><span>Safety violations</span></div>
                <div className="admin-mini-metric"><strong>{statNumber(stats.bannedUsers)}</strong><span>Banidos</span></div>
                <div className="admin-mini-metric"><strong>{statNumber(stats.blockedIps)}</strong><span>IPs bloqueados</span></div>
                <div className="admin-mini-metric"><strong>{statNumber(stats.premiumUsers)}</strong><span>Premium</span></div>
                <div className="admin-mini-metric"><strong>{statNumber(stats.inactiveRooms)}</strong><span>Salas inativas</span></div>
              </div>
            </SectionCard>

            <SectionCard title="IPs bloqueados" description="Lista consolidada para revisão e desbloqueio rápido.">
              <div className="admin-chip-list">
                {Object.keys(blockedIps).length === 0 && <div className="admin-empty-state compact">Nenhum IP bloqueado agora.</div>}
                {Object.keys(blockedIps).map((ipKey) => (
                  <div key={ipKey} className="admin-chip-card">
                    <div>
                      <strong>{ipKey}</strong>
                      <span>Bloqueio remoto registrado.</span>
                    </div>
                    <button className="admin-btn" onClick={() => handleAction(`Desbloquear ${ipKey}`, async () => {
                      await remove(ref(database, `blocked_ips/${ipKey}`));
                      await createLog('UNBLOCK_IP', ipKey, 'desbloqueio manual');
                    })}>Desbloquear</button>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === 'team' && (
          <SectionCard
            title="Equipe e poderes"
            description="Reconhece admins e mods do banco e permite promover ou retirar funções."
            right={<div className="admin-search"><Search size={16} /><input value={teamSearch} onChange={(event) => setTeamSearch(event.target.value)} placeholder="Buscar staff..." /></div>}
          >
            <div className="admin-staff-list">
              {teamMembers.map((member) => (
                <div key={member.username} className="admin-staff-card">
                  <div>
                    <div className="stack-title">{member.username}</div>
                    <div className="stack-subtitle">{member.profile?.uid || 'Sem UID'} • {member.profile?.role || (member.isModerator ? 'mod' : 'staff')}</div>
                  </div>
                  <div className="admin-room-chip-row">
                    <span className={`badge ${member.isAdmin ? 'badge-admin' : 'badge-user'}`}>{member.isAdmin ? 'Admin' : 'Usuário'}</span>
                    <span className={`badge ${member.isModerator ? 'badge-admin' : 'badge-user'}`}>{member.isModerator ? 'Mod' : 'Sem mod'}</span>
                    <button className="admin-btn" onClick={() => toggleModerator(member.username, !member.isModerator)}>{member.isModerator ? 'Remover mod' : 'Tornar mod'}</button>
                    {!isUserAdminName(member.username) && (
                      <button className="admin-btn admin-btn-primary" onClick={() => toggleAdminRole(member.username, !member.isAdmin)}>{member.isAdmin ? 'Remover admin' : 'Tornar admin'}</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {activeTab === 'users' && (
          <SectionCard
            title="Central de usuários"
            description="Busca, remoção profunda e limpeza em massa para perfis inativos."
            right={<div className="admin-search"><Search size={16} /><input value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Buscar usuário ou UID..." /></div>}
          >
            <div className="admin-action-bar">
              <button className="admin-btn admin-btn-danger" onClick={bulkDeleteInactiveUsers}><Trash2 size={14} /> Limpar usuários {'>'} 7 dias</button>
            </div>
              <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Status</th>
                    <th>Premium</th>
                    <th>UID</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(([username, user]) => {
                    const isPremiumUser = user?.isPremium || manualPremium[username];
                    return (
                      <tr key={username}>
                        <td>
                          <div className="table-user-block">
                            <div className="table-avatar">{username.charAt(0)}</div>
                            <div>
                              <strong>{username}</strong>
                              <small>{user?.name || 'Sem nome visual'}</small>
                            </div>
                          </div>
                        </td>
                        <td><span className={`status-pill ${user?.isOnline ? 'online' : 'offline'}`}>{user?.isOnline ? 'Online' : 'Offline'}</span></td>
                        <td><span className={`badge ${isPremiumUser ? 'badge-admin' : 'badge-user'}`}>{isPremiumUser ? 'Premium' : 'Padrão'}</span></td>
                        <td><code>{user?.uid || 'Sem UID'}</code></td>
                        <td>
                          <div className="admin-room-chip-row">
                            <button className={`admin-btn ${isPremiumUser ? 'admin-btn-ghost' : 'admin-btn-primary'}`} onClick={() => handleAction(`${isPremiumUser ? 'Remover' : 'Dar'} premium ${username}`, async () => {
                              await updatePathValue(`manual_premium/${username}`, isPremiumUser ? null : true);
                              await createLog('SET_MANUAL_PREMIUM', username, String(!isPremiumUser));
                            })}>{isPremiumUser ? 'Remover' : 'Dar'} Premium</button>
                            {user?.uid && (
                              <button className="admin-btn" onClick={() => {
                                const title = window.prompt('Título da notificação:', 'BP Aviso');
                                if (!title) return;
                                const msg = window.prompt('Mensagem:');
                                if (!msg) return;
                                handleAction(`Notificar ${username}`, async () => {
                                  await set(ref(database, `fcm_requests/user_notices/${Date.now()}`), {
                                    targetUid: user.uid,
                                    targetUsername: username,
                                    title, message: msg,
                                    timestamp: Date.now()
                                  });
                                  await createLog('SEND_USER_PUSH', username, `${title}: ${msg}`);
                                });
                              }}>Push</button>
                            )}
                            <button className="admin-btn admin-btn-danger" onClick={() => nuclearDelete(username, user?.uid)}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {activeTab === 'security' && (
          <div className="admin-section-grid">
            <SectionCard title="Triagem de segurança" description="Panorama rápido de denúncias e violações registradas.">
              <div className="admin-metric-grid">
                <div className="admin-mini-metric"><strong>{statNumber(stats.activeReports)}</strong><span>Denúncias abertas</span></div>
                <div className="admin-mini-metric"><strong>{statNumber(stats.safetyViolations)}</strong><span>Violação safety</span></div>
                <div className="admin-mini-metric"><strong>{statNumber(stats.bannedUsers)}</strong><span>Contas banidas</span></div>
                <div className="admin-mini-metric"><strong>{statNumber(stats.blockedIps)}</strong><span>IPs bloqueados</span></div>
              </div>
            </SectionCard>

            <SectionCard title="Violações de segurança" description="Mídia bloqueada pelo filtro de segurança." right={
              Object.keys(safetyViolations).length > 0 && (
                <button className="admin-btn admin-btn-danger" onClick={() => handleAction('Limpar violações', async () => {
                  if (!window.confirm(`Limpar todas as ${Object.keys(safetyViolations).length} violações?`)) return;
                  await remove(ref(database, 'safety_violations'));
                  await createLog('CLEAR_SAFETY_VIOLATIONS', 'all', String(Object.keys(safetyViolations).length));
                })}>Limpar todas</button>
              )
            }>
              <div className="admin-report-list">
                {Object.keys(safetyViolations).length === 0 ? (
                  <div className="admin-empty-state"><Shield size={34} /><div>Nenhuma violação registrada.</div></div>
                ) : (
                  Object.entries(safetyViolations).slice(0, 20).map(([key, v]) => (
                    <div key={key} className="admin-report-card">
                      <div className="admin-report-top">
                        <div>
                          <div className="stack-title">{v?.username || 'desconhecido'}</div>
                          <div className="stack-subtitle">Sala: {v?.roomId || 'sem sala'} • {formatDateTime(v?.timestamp)}</div>
                        </div>
                        <Ban size={18} color="#ff7d7d" />
                      </div>
                      <div className="admin-report-meta"><strong>IP:</strong> {v?.ip || 'N/A'}</div>
                      <div className="admin-report-meta"><strong>Conteúdo:</strong> {v?.contentType || 'N/A'}</div>
                      <div className="admin-report-meta"><strong>Label:</strong> {v?.safetyLabel || v?.label || 'N/A'}</div>
                      {v?.mediaUrl && <div className="admin-report-meta" style={{ wordBreak: 'break-all' }}><strong>URL:</strong> <a href={v.mediaUrl} target="_blank" rel="noopener noreferrer">{v.mediaUrl.slice(0, 80)}</a></div>}
                    </div>
                  ))
                )}
              </div>
            </SectionCard>

            <SectionCard title="Filtro de Segurança" description="Quando ativado, imagens e vídeos são escaneados pela Google Cloud Vision API.">
              <div className="admin-toggle-grid">
                <ToggleCard title="Filtro de segurança" description="Liga/desliga o escaneamento de mídia enviada." value={safetyFilterEnabled} onToggle={() => handleAction('Segurança: toggle filtro', async () => {
                  const next = !safetyFilterEnabled;
                  await set(ref(database, 'app_config/media_safety/enabled'), next);
                  setSafetyFilterEnabled(next);
                  await createLog('SET_SAFETY_FILTER', 'enabled', String(next));
                })} />
                <ToggleCard title="Auto-ban" description="Banir automaticamente ao detectar conteúdo proibido." value={mediaSafetyAutoBan} onToggle={() => handleAction('Segurança: toggle auto-ban', async () => {
                  const next = !mediaSafetyAutoBan;
                  await set(ref(database, 'app_config/media_safety/autoBan'), next);
                  setMediaSafetyAutoBan(next);
                  await createLog('SET_MEDIA_AUTOBAN', 'autoBan', String(next));
                })} />
              </div>
              {mediaSafetyEnabled && (
                <div className="admin-form-grid" style={{ marginTop: 12 }}>
                  {[['0-3', 'Bebê (0-3)'], ['4-7', 'Criança (4-7)'], ['8-12', 'Pré-adolescente (8-12)'], ['13-17', 'Adolescente (13-17)']].map(([key, label]) => (
                    <div key={key} className="admin-form-card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong>{label}</strong>
                      <button className={`admin-btn ${mediaSafetyRanges[key] ? 'admin-btn-primary' : 'admin-btn-ghost'}`} onClick={() => handleAction(`Range ${key}`, async () => {
                        const next = !mediaSafetyRanges[key];
                        await set(ref(database, `app_config/media_safety/ranges/${key}`), next);
                        setMediaSafetyRanges((prev) => ({ ...prev, [key]: next }));
                        await createLog('SET_MEDIA_RANGE', key, String(next));
                      })}>{mediaSafetyRanges[key] ? 'Bloqueado' : 'Liberado'}</button>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Denúncias recentes"
              description="Fila com ação imediata para revisão e banimento."
              right={<div className="admin-search"><Search size={16} /><input value={reportSearch} onChange={(event) => setReportSearch(event.target.value)} placeholder="Buscar denúncia..." /></div>}
            >
              <div className="admin-report-list">
                {filteredReports.length === 0 ? (
                  <div className="admin-empty-state"><AlertTriangle size={34} /><div>Nenhuma denúncia pendente.</div></div>
                ) : (
                  filteredReports.slice(0, 12).map(([reportId, report]) => (
                    <div key={reportId} className="admin-report-card">
                      <div className="admin-report-top">
                        <div>
                          <div className="stack-title">{report.reason || 'Motivo não informado'}</div>
                          <div className="stack-subtitle">Sala: {report.roomId || 'sem sala'} • {formatDateTime(report.timestamp)}</div>
                        </div>
                        <AlertTriangle size={18} color="#ff7d7d" />
                      </div>
                      <div className="admin-report-meta"><strong>Denunciado:</strong> {report.reportedUsername || 'desconhecido'}</div>
                      <div className="admin-report-meta"><strong>Reportado por:</strong> {report.reporterUsername || 'desconhecido'}</div>
                      <div className="admin-report-actions">
                        <button className="admin-btn admin-btn-danger" onClick={() => nuclearDelete(report.reportedUsername, report.reportedUid)}>Banir</button>
                        <button className="admin-btn" onClick={() => remove(ref(database, `reports/${reportId}`))}>Ignorar</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === 'runtime' && (
          <SectionCard title="Controles globais de runtime" description="As mesmas chaves remotas usadas pelo app, agora administradas no site.">
            <div className="admin-toggle-grid">
              {RUNTIME_FIELDS.map(([key, label, description]) => (
                <ToggleCard key={key} title={label} description={description} value={Boolean(runtimeControls[key])} onToggle={() => handleAction(`Runtime: ${label}`, async () => {
                  const next = !runtimeControls[key];
                  await set(ref(database, `app_config/runtime_controls/${key}`), next);
                  await createLog('SET_RUNTIME_CONTROL', key, String(next));
                })} />
              ))}
            </div>
          </SectionCard>
        )}

        {activeTab === 'ads' && (
          <div className="admin-section-grid">
            <SectionCard title="Anúncios remotos" description="Gerencie exibição, posições e cooldowns do sistema de anúncios.">
              <div className="admin-toggle-grid">
                {AD_BOOLEAN_FIELDS.map(([key, label, description]) => (
                  <ToggleCard key={key} title={label} description={description} value={Boolean(adControls[key])} onToggle={() => handleAction(`Ads: ${label}`, async () => {
                    const next = !adControls[key];
                    await set(ref(database, `app_config/ad_controls/${key}`), next);
                    await createLog('SET_AD_CONTROL', key, String(next));
                  })} />
                ))}
              </div>
              <div className="admin-form-grid">
                {AD_COOLDOWN_FIELDS.map(([key, label]) => (
                  <div key={key} className="admin-form-card">
                    <strong>{label}</strong>
                    <input className="admin-input" type="number" min="1" max="1440" value={cooldownDrafts[key]} onChange={(event) => setCooldownDrafts((prev) => ({ ...prev, [key]: event.target.value }))} />
                    <button className="admin-btn admin-btn-primary" onClick={() => handleAction(`Cooldown: ${label}`, async () => {
                      const minutes = Math.max(1, Math.min(1440, Number(cooldownDrafts[key] || AD_DEFAULTS[key] || 30)));
                      await set(ref(database, `app_config/ad_controls/${key}`), minutes);
                      await createLog('SET_AD_COOLDOWN', key, String(minutes));
                    })}>Salvar</button>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Recursos do Turbo" description="Se desligar um recurso aqui, ele fica livre para todos sem exigir Turbo.">
              <div className="admin-toggle-grid">
                {TURBO_FIELDS.map(([key, label, description]) => (
                  <ToggleCard key={key} title={label} description={description} value={Boolean(turboControls[key])} onToggle={() => handleAction(`Turbo: ${label}`, async () => {
                    const next = !turboControls[key];
                    await set(ref(database, `app_config/turbo_controls/${key}`), next);
                    await createLog('SET_TURBO_CONTROL', key, String(next));
                  })} />
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === 'banned' && (
          <SectionCard
            title="Usuários banidos"
            description="Acompanhe bans ativos, gravidade e desfaça bloqueios com limpeza de IP."
            right={<div className="admin-search"><Search size={16} /><input value={banSearch} onChange={(event) => setBanSearch(event.target.value)} placeholder="Buscar banido..." /></div>}
          >
            <div className="admin-report-list">
              {bannedList.length === 0 ? (
                <div className="admin-empty-state"><Ban size={34} /><div>Nenhum usuário banido no momento.</div></div>
              ) : (
                bannedList.map((info) => (
                  <div key={info.uid} className="admin-report-card">
                    <div className="admin-report-top">
                      <div>
                        <div className="stack-title">{info.username}</div>
                        <div className="stack-subtitle">{info.uid}</div>
                      </div>
                      <span className={`badge ${info.isNuclear ? 'badge-banned' : 'badge-admin'}`}>{info.isNuclear ? 'Nuclear' : info.isTemporary ? 'Temporário' : 'Permanente'}</span>
                    </div>
                    <div className="admin-report-meta"><strong>Status:</strong> {bannedExpiresLabel(info)}</div>
                    <div className="admin-report-meta"><strong>Motivo:</strong> {info.reason || 'Não informado'}</div>
                    <div className="admin-report-actions">
                      <button className="admin-btn" onClick={() => unbanUser(info.uid, info.username)}>Desbanir</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        )}

        {activeTab === 'rooms' && (
          <SectionCard
            title="Radar de salas"
            description="Leitura espaçada para região, tipo, ocupação e acesso premium/turbo."
            right={<div className="admin-search"><Search size={16} /><input value={roomSearch} onChange={(event) => setRoomSearch(event.target.value)} placeholder="Buscar sala, ID ou região..." /></div>}
          >
            <div className="admin-action-bar" style={{ flexWrap: 'wrap' }}>
              {['Todas', 'Ativas', 'Inativas', 'Fixadas', 'Staff'].map((filter) => (
                <button key={filter} className={`admin-filter-chip ${roomFilterStatus === filter ? 'active' : ''}`} onClick={() => setRoomFilterStatus(filter)}>{filter}</button>
              ))}
              <button className="admin-btn admin-btn-primary" onClick={() => {
                const name = window.prompt('Nome da sala:');
                if (!name) return;
                const category = window.prompt('Categoria:', 'geral');
                const desc = window.prompt('Descrição:', '');
                const isPrivate = window.confirm('Sala privada/staff?');
                handleAction(`Criar sala ${name}`, async () => {
                  const roomRef = push(ref(database, 'rooms'));
                  const roomId = roomRef.key;
                  await set(roomRef, {
                    name, description: desc || '', category: category || 'geral',
                    isPrivate, active: true, isPinned: false,
                    participantCount: 0, premiumAccessLevel: 'ALL',
                    localeTag: 'pt-BR', regionKey: 'BR_PT',
                    languageCode: 'pt', countryCode: 'BR',
                    createdAt: Date.now()
                  });
                  await createLog('CREATE_ROOM', name, roomId);
                });
              }}>+ Nova sala</button>
            </div>
            <div className="admin-rooms-grid">
              {filteredRooms.length === 0 ? (
                <div className="admin-empty-state"><MessageSquare size={34} /><div>Nenhuma sala encontrada.</div></div>
              ) : (
                filteredRooms.map(([roomId, room]) => {
                  const isActive = room?.active !== false;
                  const isPinned = room?.isPinned === true;
                  return (
                    <div key={roomId} className="admin-room-card" style={{ borderLeft: `4px solid ${isActive ? (isPinned ? '#FFB300' : '#2ECC71') : '#ff4444'}` }}>
                      <div className="admin-room-card-top">
                        <div>
                          <div className="stack-title">{room.name} {isPinned && '📌'}</div>
                          <div className="stack-subtitle">{roomId}</div>
                        </div>
                        <div className="admin-room-chip-row">
                          <span className={`badge ${room?.isPrivate ? 'badge-banned' : 'badge-admin'}`}>{room?.isPrivate ? 'Privada' : 'Pública'}</span>
                          <span className={`badge ${isActive ? 'badge-admin' : 'badge-banned'}`}>{isActive ? 'Ativa' : 'Inativa'}</span>
                          {isPinned && <span className="badge badge-admin">Fixada</span>}
                        </div>
                      </div>
                      <div className="admin-room-chip-row">
                        <span className="status-pill online">{room.participantCount || 0} online</span>
                        <span className="status-pill">{room.regionKey || room.localeTag || 'Sem região'}</span>
                        <span className="status-pill">{room.premiumAccessLevel || 'ALL'}</span>
                      </div>
                      <p className="admin-room-description">{room.description || 'Sem descrição informada.'}</p>
                      <div className="admin-room-chip-row" style={{ marginTop: 8 }}>
                        <button className={`admin-btn admin-btn-sm ${isActive ? 'admin-btn-ghost' : 'admin-btn-primary'}`} onClick={() => handleAction(`${isActive ? 'Desativar' : 'Ativar'} sala ${room.name}`, async () => {
                          await set(ref(database, `rooms/${roomId}/active`), !isActive);
                          await createLog('TOGGLE_ROOM_ACTIVE', room.name, String(!isActive));
                        })}>{isActive ? 'Desativar' : 'Ativar'}</button>
                        <button className={`admin-btn admin-btn-sm ${isPinned ? 'admin-btn-primary' : 'admin-btn-ghost'}`} onClick={() => handleAction(`${isPinned ? 'Desafixar' : 'Fixar'} sala ${room.name}`, async () => {
                          await set(ref(database, `rooms/${roomId}/isPinned`), !isPinned);
                          await createLog('TOGGLE_ROOM_PIN', room.name, String(!isPinned));
                        })}>{isPinned ? 'Desafixar' : 'Fixar'}</button>
                        <button className="admin-btn admin-btn-sm" onClick={() => {
                          const newName = window.prompt('Novo nome:', room.name);
                          if (!newName) return;
                          const newDesc = window.prompt('Nova descrição:', room.description || '');
                          handleAction(`Editar sala ${room.name}`, async () => {
                            await update(ref(database, `rooms/${roomId}`), { name: newName, description: newDesc || '' });
                            await createLog('EDIT_ROOM', room.name, roomId);
                          });
                        }}>Editar</button>
                        <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => {
                          if (!window.confirm(`Apagar sala "${room.name}" (${roomId}) permanentemente?`)) return;
                          handleAction(`Apagar sala ${room.name}`, async () => {
                            await remove(ref(database, `rooms/${roomId}`));
                            await remove(ref(database, `room_messages/${roomId}`));
                            await remove(ref(database, `room_participants/${roomId}`));
                            await createLog('DELETE_ROOM', room.name, roomId);
                          });
                        }}>Apagar</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </SectionCard>
        )}

        {activeTab === 'database' && (
          <div className="admin-section-grid">
            <SectionCard title="Diagnóstico do banco" description="Mesmos eixos do app: vínculos órfãos, fantasmas, logs e stale presence.">
              <div className="admin-action-bar">
                {DATABASE_FILTERS.map((filter) => (
                  <button key={filter} className={`admin-filter-chip ${diagnosticsFilter === filter ? 'active' : ''}`} onClick={() => setDiagnosticsFilter(filter)}>{filter}</button>
                ))}
              </div>
              <div className="admin-diagnostic-list">
                {filteredDiagnostics.map((item) => (
                  <button key={`${item.path}-${item.label}`} className="admin-diagnostic-card" onClick={() => { setDbPath(item.path); inspectDatabasePath(item.path); }}>
                    <div className="admin-diagnostic-top">
                      <strong>{item.label}</strong>
                      <span className={`badge ${diagnosticTone(item.status)}`}>{item.status}</span>
                    </div>
                    <div className="stack-subtitle">{item.path}</div>
                    <div className="admin-diagnostic-value">{statNumber(item.count)}</div>
                    <div className="admin-room-description">{item.details}</div>
                  </button>
                ))}
              </div>
              <div className="admin-tool-grid">
                <button className="admin-tool-card" onClick={repairRoomParticipantCounts}><RefreshCw size={20} /><div><strong>Reparar contagens</strong><span>Sincroniza participantCount.</span></div></button>
                <button className="admin-tool-card" onClick={cleanupGhostRoomParticipants}><Trash2 size={20} /><div><strong>Limpar fantasmas</strong><span>Remove participantes em salas ausentes.</span></div></button>
                <button className="admin-tool-card" onClick={cleanupOrphanedUserRooms}><Users size={20} /><div><strong>Limpar user_rooms</strong><span>Remove vínculos órfãos.</span></div></button>
                <button className="admin-tool-card" onClick={cleanupStalePresence}><Clock3 size={20} /><div><strong>Limpar presence</strong><span>Remove presence stale.</span></div></button>
              </div>
            </SectionCard>

            <SectionCard title="Explorer do banco" description="Inspecione, crie, edite e remova nós do Realtime Database.">
              <div className="admin-chip-list shortcuts">
                {DATABASE_PATH_SHORTCUTS.map((path) => (
                  <button key={path} className="admin-filter-chip" onClick={() => { setDbPath(path); inspectDatabasePath(path); }}>{path}</button>
                ))}
              </div>
              <div className="admin-form-grid explorer">
                <div className="admin-form-card grow">
                  <strong>Caminho</strong>
                  <input className="admin-input" value={dbPath} onChange={(event) => setDbPath(event.target.value)} placeholder="users/ALGUEM" />
                  <div className="admin-action-bar">
                    <button className="admin-btn" onClick={() => inspectDatabasePath(dbPath)}><Eye size={14} /> Inspecionar</button>
                    <button className="admin-btn admin-btn-danger" onClick={deleteDatabaseNode}><Trash2 size={14} /> Apagar nó</button>
                  </div>
                </div>
                <div className="admin-form-card">
                  <strong>Nova chave</strong>
                  <input className="admin-input" value={dbChildKey} onChange={(event) => setDbChildKey(event.target.value)} placeholder="nova_chave" />
                  <label className="admin-check-row"><input type="checkbox" checked={dbUseAutoKey} onChange={(event) => setDbUseAutoKey(event.target.checked)} /> Usar auto key</label>
                  <button className="admin-btn admin-btn-primary" onClick={createDatabaseChild}>Criar filho</button>
                </div>
              </div>
              <textarea className="admin-input admin-textarea admin-code-area" value={dbJson} onChange={(event) => setDbJson(event.target.value)} />
              <div className="admin-action-bar">
                <button className="admin-btn admin-btn-primary" onClick={updateDatabaseNode}>Salvar payload</button>
              </div>
              {inspectedNode && (
                <div className="admin-node-summary">
                  <div className="admin-room-chip-row">
                    <span className="status-pill">{inspectedNode.path}</span>
                    <span className="status-pill">{inspectedNode.type}</span>
                    <span className="status-pill">{inspectedNode.childrenCount} filhos</span>
                    <span className="status-pill">{statNumber(inspectedNode.estimatedBytes)} bytes</span>
                  </div>
                  <p className="admin-room-description">{inspectedNode.preview}</p>
                </div>
              )}
            </SectionCard>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="admin-section-grid">
            <SectionCard title="Aviso global" description="Mesmo canal remoto usado pelo app para destaque e comunicação importante.">
              <div className="admin-form-grid">
                <div className="admin-form-card grow">
                  <strong>Título</strong>
                  <input className="admin-input" value={noticeDraft.title} onChange={(event) => setNoticeDraft((prev) => ({ ...prev, title: event.target.value }))} placeholder="Título do aviso" />
                </div>
                <div className="admin-form-card grow">
                  <strong>Mensagem</strong>
                  <textarea className="admin-input admin-textarea" value={noticeDraft.message} onChange={(event) => setNoticeDraft((prev) => ({ ...prev, message: event.target.value }))} placeholder="Mensagem visível no app" />
                </div>
              </div>
              <div className="admin-action-bar">
                <button className="admin-btn admin-btn-primary" onClick={saveNotice}><Megaphone size={14} /> Publicar aviso</button>
                <button className="admin-btn" onClick={clearNotice}>Limpar aviso</button>
              </div>
              <div className="admin-note-card">
                <strong>Status atual</strong>
                <span>{globalNotice ? `${globalNotice.title} • ${globalNotice.message}` : 'Nenhum aviso global ativo.'}</span>
              </div>
            </SectionCard>

            <SectionCard title="Ferramentas operacionais" description="Broadcast, busca global e manutenção de logs do ecossistema.">
              <div className="admin-tool-grid">
                <button className="admin-tool-card" onClick={() => setShowBroadcastModal(true)}><Megaphone size={20} /><div><strong>Broadcast</strong><span>Envie avisos em lote para salas selecionadas.</span></div></button>
                <button className="admin-tool-card" onClick={globalSearch}><Search size={20} /><div><strong>Busca global</strong><span>Varredura rápida em mensagens públicas e privadas.</span></div></button>
                <button className="admin-tool-card" onClick={cleanOldLogs}><Clock3 size={20} /><div><strong>Limpar logs</strong><span>Remove eventos antigos para manter o histórico leve.</span></div></button>
                <button className="admin-tool-card" onClick={bulkDeleteInactiveUsers}><Trash2 size={20} /><div><strong>Limpeza em massa</strong><span>Apaga usuários offline/inativos há mais de 7 dias.</span></div></button>
              </div>
            </SectionCard>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
