export const ROOM_SCOPES = [
  { localeTag: 'pt-BR', languageCode: 'pt', countryCode: 'BR', regionKey: 'BR_PT' },
  { localeTag: 'en-US', languageCode: 'en', countryCode: 'US', regionKey: 'US_EN' },
  { localeTag: 'es-ES', languageCode: 'es', countryCode: 'ES', regionKey: 'ES_ES' },
  { localeTag: 'es-MX', languageCode: 'es', countryCode: 'MX', regionKey: 'MX_ES' },
  { localeTag: 'fr-FR', languageCode: 'fr', countryCode: 'FR', regionKey: 'FR_FR' },
  { localeTag: 'de-DE', languageCode: 'de', countryCode: 'DE', regionKey: 'DE_DE' },
  { localeTag: 'it-IT', languageCode: 'it', countryCode: 'IT', regionKey: 'IT_IT' },
  { localeTag: 'ru-RU', languageCode: 'ru', countryCode: 'RU', regionKey: 'RU_RU' },
  { localeTag: 'ar-SA', languageCode: 'ar', countryCode: 'SA', regionKey: 'SA_AR' },
  { localeTag: 'hi-IN', languageCode: 'hi', countryCode: 'IN', regionKey: 'IN_HI' },
  { localeTag: 'bn-BD', languageCode: 'bn', countryCode: 'BD', regionKey: 'BD_BN' },
  { localeTag: 'id-ID', languageCode: 'id', countryCode: 'ID', regionKey: 'ID_ID' },
  { localeTag: 'ja-JP', languageCode: 'ja', countryCode: 'JP', regionKey: 'JP_JA' },
  { localeTag: 'ko-KR', languageCode: 'ko', countryCode: 'KR', regionKey: 'KR_KO' },
  { localeTag: 'tr-TR', languageCode: 'tr', countryCode: 'TR', regionKey: 'TR_TR' },
  { localeTag: 'ur-PK', languageCode: 'ur', countryCode: 'PK', regionKey: 'PK_UR' }
];

const COUNTRY_FALLBACKS = {
  pt: 'BR',
  en: 'US',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
  it: 'IT',
  ru: 'RU',
  ar: 'SA',
  hi: 'IN',
  bn: 'BD',
  id: 'ID',
  ja: 'JP',
  ko: 'KR',
  tr: 'TR',
  ur: 'PK'
};

export const AD_DEFAULTS = {
  adsEnabled: true,
  roomListBannerEnabled: true,
  roomListEntryOpenEnabled: true,
  roomListEntryCooldownMinutes: 30,
  roomListPeriodicEnabled: true,
  roomListPeriodicCooldownMinutes: 10,
  roomExitInterstitialEnabled: true,
  roomExitInterstitialCooldownMinutes: 20,
  turboRewardedEnabled: true,
  appForegroundOpenEnabled: false,
  appForegroundOpenCooldownMinutes: 30,
  inlineMessageAdsEnabled: true
};

export const TURBO_DEFAULTS = {
  enabled: true,
  roomEntryEnabled: true,
  privateMessagesEnabled: true,
  radiosEnabled: true,
  roomMediaEnabled: true,
  secretModeEnabled: true,
  stickerSaveEnabled: true
};

export const CATEGORY_TRANSLATIONS = {
  'Relacionamentos': {
    pt: 'Relacionamentos',
    en: 'Relationships',
    es: 'Relaciones',
    fr: 'Relations',
    de: 'Beziehungen',
    it: 'Relazioni',
    ru: 'Отношения',
    ar: 'العلاقات',
    hi: 'रिश्ते',
    bn: 'সম্পর্ক',
    id: 'Hubungan',
    ja: '関係',
    ko: '관계',
    tr: 'Iliskiler',
    ur: 'تعلقات'
  },
  'Entretenimento': {
    pt: 'Entretenimento',
    en: 'Entertainment',
    es: 'Entretenimiento',
    fr: 'Divertissement',
    de: 'Unterhaltung',
    it: 'Intrattenimento',
    ru: 'Развлечения',
    ar: 'الترفيه',
    hi: 'मनोरंजन',
    bn: 'বিনোদন',
    id: 'Hiburan',
    ja: 'エンタメ',
    ko: '엔터테인먼트',
    tr: 'Eglence',
    ur: 'تفریح'
  },
  'Hobbies & Estilo': {
    pt: 'Hobbies & Estilo',
    en: 'Hobbies & Style',
    es: 'Pasatiempos y estilo',
    fr: 'Loisirs et style',
    de: 'Hobbys und Stil',
    it: 'Hobby e stile',
    ru: 'Хобби и стиль',
    ar: 'الهوايات والاسلوب',
    hi: 'शौक और स्टाइल',
    bn: 'শখ ও স্টাইল',
    id: 'Hobi & Gaya',
    ja: '趣味とスタイル',
    ko: '취미와 스타일',
    tr: 'Hobiler ve stil',
    ur: 'شوق اور اسٹائل'
  },
  'Idade': {
    pt: 'Idade',
    en: 'Age groups',
    es: 'Edad',
    fr: 'Age',
    de: 'Alter',
    it: 'Eta',
    ru: 'Возраст',
    ar: 'العمر',
    hi: 'उम्र',
    bn: 'বয়স',
    id: 'Usia',
    ja: '年齢',
    ko: '연령',
    tr: 'Yas',
    ur: 'عمر'
  },
  'Adulto +18 🔥': {
    pt: 'Adulto +18',
    en: 'Adult 18+',
    es: 'Adulto +18',
    fr: 'Adulte 18+',
    de: 'Erwachsen 18+',
    it: 'Adulti 18+',
    ru: '18+ для взрослых',
    ar: '+18 للبالغين',
    hi: 'वयस्क 18+',
    bn: 'প্রাপ্তবয়স্ক ১৮+',
    id: 'Dewasa 18+',
    ja: '18歳以上',
    ko: '성인 18+',
    tr: 'Yetiskin 18+',
    ur: 'بالغ 18+'
  }
};

const STRINGS = {
  pt: {
    discover: 'Descobrir',
    searchRooms: 'Procurar salas...',
    roomsByRegion: 'Salas por regiao',
    swap: 'Trocar',
    rooms: 'Salas',
    conversations: 'PVs',
    myRooms: 'Minhas salas',
    noMyRooms: 'Voce ainda nao esta em nenhuma sala.',
    exploreMore: 'Explore as salas da sua regiao abaixo.',
    popularNow: 'Em alta agora',
    all: 'Tudo',
    interests: 'Interesses',
    adult: 'Adulto +18',
    turbo: 'Turbo',
    premium: 'Premium',
    premiumActive: 'Premium ativo',
    removeAds: 'Remover anuncios',
    sponsored: 'Patrocinado',
    onlineNow: 'online agora',
    touchToEnter: 'Toque para entrar',
    searchConversations: 'Pesquisar conversas...',
    noConversations: 'Sua lista esta vazia',
    noSearchResults: 'Nenhum resultado encontrado',
    regionLanguage: 'Regiao e idioma',
    appLanguage: 'Idioma do app',
    automatic: 'Automatico',
    activeRegion: 'Regiao atual',
    participants: 'participantes',
    messagePlaceholder: 'Mensagem...',
    typing: 'digitando...',
    uploading: 'Enviando midia...',
    participantsTitle: 'Participantes',
    online: 'Online',
    offline: 'Offline',
    replyingTo: 'Respondendo a',
    whisperTo: 'Sussurrando para',
    watchSponsored: 'Ativar com patrocinio',
    turboReady: 'Passe Turbo',
    turboActive: 'Turbo ativo',
    turboDesc: 'Libere recursos extras, menos limites e menos interrupcoes.',
    turboDescActive: 'Seu tempo turbo esta rodando neste navegador.',
    reward20min: '+20 min',
    max50People: '50 por sala',
    regionRoomsOnly: 'Mostrando somente salas da regiao ativa.',
    welcome: 'Bem-vindo',
    chooseRoom: 'Escolha uma sala ou conversa para comecar.',
    menu: 'Navegacao',
    settings: 'Configuracoes',
    adminPanel: 'Painel admin',
    social: 'Social',
    logout: 'Encerrar sessao',
    cancel: 'Cancelar',
    you: 'voce',
    media: 'Midia',
    deleteConversation: 'Apagar conversa',
    pranks: 'Brincadeiras',
    choosePrank: 'Escolha a brincadeira',
    chooseTarget: 'Escolha o alvo',
    everyone: 'Enviar para todos',
    sendPrank: 'Enviar brincadeira',
    roomAccessPremium: 'Somente premium',
    roomAccessTurbo: 'Premium ou Turbo',
    roomWebLockedTitle: 'Disponivel apenas no app',
    roomWebLockedBody: 'Salas Premium e Turbo devem ser acessadas pelo aplicativo. Baixe o app para entrar nessa sala.',
    roomWebLockedAction: 'Baixar o app',
    playStore: 'Baixar app',
    roomLimit: 'limite 50',
    poweredByAds: 'Monetizado com AdSense'
  },
  en: {
    discover: 'Discover',
    searchRooms: 'Search rooms...',
    roomsByRegion: 'Rooms by region',
    swap: 'Swap',
    rooms: 'Rooms',
    conversations: 'DMs',
    myRooms: 'My rooms',
    noMyRooms: 'You are not in any room yet.',
    exploreMore: 'Explore rooms from your active region below.',
    popularNow: 'Trending now',
    all: 'All',
    interests: 'Interests',
    adult: 'Adult 18+',
    turbo: 'Turbo',
    premium: 'Premium',
    premiumActive: 'Premium active',
    removeAds: 'Remove ads',
    sponsored: 'Sponsored',
    onlineNow: 'online now',
    touchToEnter: 'Tap to enter',
    searchConversations: 'Search conversations...',
    noConversations: 'Your list is empty',
    noSearchResults: 'No results found',
    regionLanguage: 'Region and language',
    appLanguage: 'App language',
    automatic: 'Automatic',
    activeRegion: 'Current region',
    participants: 'participants',
    messagePlaceholder: 'Message...',
    typing: 'typing...',
    uploading: 'Uploading media...',
    participantsTitle: 'Participants',
    online: 'Online',
    offline: 'Offline',
    replyingTo: 'Replying to',
    whisperTo: 'Whispering to',
    watchSponsored: 'Unlock with sponsor',
    turboReady: 'Turbo Pass',
    turboActive: 'Turbo active',
    turboDesc: 'Unlock extra features, fewer limits and fewer interruptions.',
    turboDescActive: 'Your turbo time is active in this browser.',
    reward20min: '+20 min',
    max50People: '50 per room',
    regionRoomsOnly: 'Showing only rooms from the active region.',
    welcome: 'Welcome',
    chooseRoom: 'Pick a room or conversation to get started.',
    menu: 'Navigation',
    settings: 'Settings',
    adminPanel: 'Admin panel',
    social: 'Social',
    logout: 'Sign out',
    cancel: 'Cancel',
    you: 'you',
    media: 'Media',
    deleteConversation: 'Delete conversation',
    pranks: 'Pranks',
    choosePrank: 'Choose a prank',
    chooseTarget: 'Choose a target',
    everyone: 'Send to everyone',
    sendPrank: 'Send prank',
    roomAccessPremium: 'Premium only',
    roomAccessTurbo: 'Premium or Turbo',
    roomWebLockedTitle: 'Available only in the app',
    roomWebLockedBody: 'Premium and Turbo rooms must be accessed in the mobile app. Download the app to enter this room.',
    roomWebLockedAction: 'Get the app',
    playStore: 'Get the app',
    roomLimit: '50 limit',
    poweredByAds: 'Monetized with AdSense'
  },
  es: {
    discover: 'Descubrir',
    searchRooms: 'Buscar salas...',
    roomsByRegion: 'Salas por region',
    swap: 'Cambiar',
    rooms: 'Salas',
    conversations: 'PVs',
    myRooms: 'Mis salas',
    noMyRooms: 'Todavia no estas en ninguna sala.',
    exploreMore: 'Explora las salas de tu region activa abajo.',
    popularNow: 'En tendencia',
    all: 'Todo',
    interests: 'Intereses',
    adult: 'Adulto +18',
    turbo: 'Turbo',
    premium: 'Premium',
    premiumActive: 'Premium activo',
    removeAds: 'Quitar anuncios',
    sponsored: 'Patrocinado',
    onlineNow: 'en linea',
    touchToEnter: 'Toca para entrar',
    searchConversations: 'Buscar conversaciones...',
    noConversations: 'Tu lista esta vacia',
    noSearchResults: 'No se encontraron resultados',
    regionLanguage: 'Region e idioma',
    appLanguage: 'Idioma de la app',
    automatic: 'Automatico',
    activeRegion: 'Region actual',
    participants: 'participantes',
    messagePlaceholder: 'Mensaje...',
    typing: 'escribiendo...',
    uploading: 'Enviando multimedia...',
    participantsTitle: 'Participantes',
    online: 'En linea',
    offline: 'Sin conexion',
    replyingTo: 'Respondiendo a',
    whisperTo: 'Susurrando a',
    watchSponsored: 'Desbloquear con patrocinio',
    turboReady: 'Pase Turbo',
    turboActive: 'Turbo activo',
    turboDesc: 'Desbloquea extras, menos limites y menos interrupciones.',
    turboDescActive: 'Tu tiempo turbo esta activo en este navegador.',
    reward20min: '+20 min',
    max50People: '50 por sala',
    regionRoomsOnly: 'Mostrando solo salas de la region activa.',
    welcome: 'Bienvenido',
    chooseRoom: 'Elige una sala o conversacion para empezar.',
    menu: 'Navegacion',
    settings: 'Configuracion',
    adminPanel: 'Panel admin',
    social: 'Social',
    logout: 'Cerrar sesion',
    cancel: 'Cancelar',
    you: 'tu',
    media: 'Media',
    deleteConversation: 'Borrar conversacion',
    pranks: 'Bromas',
    choosePrank: 'Elige la broma',
    chooseTarget: 'Elige el objetivo',
    everyone: 'Enviar a todos',
    sendPrank: 'Enviar broma',
    roomAccessPremium: 'Solo premium',
    roomAccessTurbo: 'Premium o Turbo',
    roomWebLockedTitle: 'Disponible solo en la app',
    roomWebLockedBody: 'Las salas Premium y Turbo deben abrirse desde la aplicacion. Descarga la app para entrar en esta sala.',
    roomWebLockedAction: 'Descargar la app',
    playStore: 'Descargar app',
    roomLimit: 'limite 50',
    poweredByAds: 'Monetizado con AdSense'
  }
};

function englishFallbackKey(key) {
  return STRINGS.en[key] || key;
}

export function getLanguageBase(localeTag) {
  return String(localeTag || 'en-US').split('-')[0].toLowerCase();
}

export function tFor(localeTag, key) {
  const base = getLanguageBase(localeTag);
  return STRINGS[base]?.[key] || englishFallbackKey(key);
}

export function normalizeSupportedLocale(rawLocale) {
  const [langRaw, countryRaw] = String(rawLocale || '').replace('_', '-').split('-');
  const languageCode = (langRaw || 'en').toLowerCase();
  const countryCode = (countryRaw || COUNTRY_FALLBACKS[languageCode] || 'US').toUpperCase();
  const exact = ROOM_SCOPES.find((scope) => scope.languageCode === languageCode && scope.countryCode === countryCode);
  if (exact) return exact.localeTag;
  const fallback = ROOM_SCOPES.find((scope) => scope.languageCode === languageCode);
  return fallback?.localeTag || 'en-US';
}

export function resolveInitialScope() {
  if (typeof window === 'undefined') return ROOM_SCOPES[0];
  const saved = window.localStorage.getItem('wappi_room_region');
  if (saved) {
    const fromStorage = ROOM_SCOPES.find((scope) => scope.regionKey === saved);
    if (fromStorage) return fromStorage;
  }
  const localeTag = normalizeSupportedLocale(window.localStorage.getItem('wappi_locale') || navigator.language);
  return ROOM_SCOPES.find((scope) => scope.localeTag === localeTag) || ROOM_SCOPES[0];
}

export function resolveInitialLocale() {
  if (typeof window === 'undefined') return 'pt-BR';
  return normalizeSupportedLocale(window.localStorage.getItem('wappi_locale') || navigator.language);
}

export function formatScopeLabel(scope, localeTag) {
  try {
    const locale = localeTag || scope.localeTag;
    const countryName = new Intl.DisplayNames([locale], { type: 'region' }).of(scope.countryCode) || scope.countryCode;
    const languageName = new Intl.DisplayNames([locale], { type: 'language' }).of(scope.languageCode) || scope.languageCode;
    return `${countryName} · ${languageName}`;
  } catch {
    return `${scope.countryCode} · ${scope.languageCode.toUpperCase()}`;
  }
}

export function translateCategory(category, localeTag) {
  if (!category) return '';
  const base = getLanguageBase(localeTag);
  return CATEGORY_TRANSLATIONS[category]?.[base] || category;
}
