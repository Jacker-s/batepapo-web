import { ROOM_SCOPES, getLanguageBase, formatScopeLabel } from './appRuntime';

export const RADIO_CATEGORY_ALL = 'all';
export const RADIO_CATEGORY_LOCAL = 'local';
export const RADIO_CATEGORY_POP = 'pop';
export const RADIO_CATEGORY_URBAN = 'urban';
export const RADIO_CATEGORY_CHILL = 'chill';

const CATEGORY_THEME = {
  [RADIO_CATEGORY_ALL]: { accent: '#FF8A65', glow: 'rgba(255,138,101,0.22)' },
  [RADIO_CATEGORY_LOCAL]: { accent: '#43A047', glow: 'rgba(67,160,71,0.22)' },
  [RADIO_CATEGORY_POP]: { accent: '#1E88E5', glow: 'rgba(30,136,229,0.22)' },
  [RADIO_CATEGORY_URBAN]: { accent: '#E91E63', glow: 'rgba(233,30,99,0.22)' },
  [RADIO_CATEGORY_CHILL]: { accent: '#7E57C2', glow: 'rgba(126,87,194,0.22)' }
};

const UI = {
  pt: {
    title: 'Radio da sala',
    subtitle: 'Escolha sua radio ou proponha uma sincronizada para a sala.',
    yourRadio: 'Sua radio',
    noRadio: 'Nenhuma radio tocando',
    chooseMine: 'Escolher minha radio',
    stopMine: 'Parar minha radio',
    proposeSync: 'Propor sincronizada',
    voteTitleStart: 'Ativar radio sincronizada',
    voteTitleChange: 'Trocar radio sincronizada',
    voteTitleStop: 'Parar radio sincronizada',
    voteApprove: 'Ouvir junto',
    voteReject: 'Nao agora',
    joinSync: 'Entrar no sincronizado',
    leaveSync: 'Sair do sincronizado',
    requestChange: 'Trocar',
    requestStop: 'Parar',
    playingNow: 'Tocando agora',
    freeMode: 'Modo livre',
    syncedMode: 'Ouvindo junto',
    noVote: 'Nenhuma votacao ativa',
    noVoteBody: 'Cada pessoa pode ouvir sua propria radio ou abrir uma votacao sincronizada para a sala.',
    selectTitle: 'Escolha uma radio',
    regionLabel: 'Regiao ativa',
    categories: {
      [RADIO_CATEGORY_ALL]: 'Tudo',
      [RADIO_CATEGORY_LOCAL]: 'Da regiao',
      [RADIO_CATEGORY_POP]: 'Pop & hits',
      [RADIO_CATEGORY_URBAN]: 'Urbano',
      [RADIO_CATEGORY_CHILL]: 'Chill'
    },
    categoryDescriptions: {
      [RADIO_CATEGORY_ALL]: 'Tudo no mesmo radar para entrar ouvindo rapido.',
      [RADIO_CATEGORY_LOCAL]: 'Brasil hits, sertanejo e radios com clima nacional.',
      [RADIO_CATEGORY_POP]: 'Pop, rock, flashback e radios mais abertas.',
      [RADIO_CATEGORY_URBAN]: 'Funk, rap, pagode, samba e mais calor de sala.',
      [RADIO_CATEGORY_CHILL]: 'Selecao mais leve para ouvir relaxando.'
    },
    empty: 'Nenhuma radio encontrada nessa categoria.',
    expiresIn: 'Votacao termina em',
    openHub: 'Abrir radio',
    syncedBadge: 'Sincronizada',
    manualBadge: 'Manual',
    featured: 'Destaques',
    readyCount: '%count% radios prontas para tocar'
  },
  en: {
    title: 'Room radio',
    subtitle: 'Choose your own station or suggest a synced one for the room.',
    yourRadio: 'Your radio',
    noRadio: 'No station playing',
    chooseMine: 'Choose my radio',
    stopMine: 'Stop my radio',
    proposeSync: 'Suggest synced radio',
    voteTitleStart: 'Start synced radio',
    voteTitleChange: 'Change synced radio',
    voteTitleStop: 'Stop synced radio',
    voteApprove: 'Listen together',
    voteReject: 'Not now',
    joinSync: 'Join sync',
    leaveSync: 'Leave sync',
    requestChange: 'Change',
    requestStop: 'Stop',
    playingNow: 'Playing now',
    freeMode: 'Free mode',
    syncedMode: 'Listening together',
    noVote: 'No active vote',
    noVoteBody: 'Everyone can keep their own radio or open a synced vote for the room.',
    selectTitle: 'Choose a station',
    regionLabel: 'Active region',
    categories: {
      [RADIO_CATEGORY_ALL]: 'All',
      [RADIO_CATEGORY_LOCAL]: 'Regional',
      [RADIO_CATEGORY_POP]: 'Pop & hits',
      [RADIO_CATEGORY_URBAN]: 'Urban',
      [RADIO_CATEGORY_CHILL]: 'Chill'
    },
    categoryDescriptions: {
      [RADIO_CATEGORY_ALL]: 'Everything in one radar so you can jump in quickly.',
      [RADIO_CATEGORY_LOCAL]: 'Regional flavor, local hits and familiar room energy.',
      [RADIO_CATEGORY_POP]: 'Pop, rock, flashback and broader radio rotation.',
      [RADIO_CATEGORY_URBAN]: 'Urban heat with funk, rap, pagode and groove.',
      [RADIO_CATEGORY_CHILL]: 'Lighter stations for slower room sessions.'
    },
    empty: 'No station found in this category.',
    expiresIn: 'Vote ends in',
    openHub: 'Open radio',
    syncedBadge: 'Synced',
    manualBadge: 'Manual',
    featured: 'Featured',
    readyCount: '%count% stations ready to play'
  },
  es: {
    title: 'Radio de la sala',
    subtitle: 'Elige tu propia radio o propone una sincronizada para la sala.',
    yourRadio: 'Tu radio',
    noRadio: 'Ninguna radio sonando',
    chooseMine: 'Elegir mi radio',
    stopMine: 'Detener mi radio',
    proposeSync: 'Proponer sincronizada',
    voteTitleStart: 'Activar radio sincronizada',
    voteTitleChange: 'Cambiar radio sincronizada',
    voteTitleStop: 'Detener radio sincronizada',
    voteApprove: 'Escuchar juntos',
    voteReject: 'Ahora no',
    joinSync: 'Entrar en sincronizado',
    leaveSync: 'Salir del sincronizado',
    requestChange: 'Cambiar',
    requestStop: 'Detener',
    playingNow: 'Sonando ahora',
    freeMode: 'Modo libre',
    syncedMode: 'Escuchando juntos',
    noVote: 'No hay votacion activa',
    noVoteBody: 'Cada persona puede seguir con su propia radio o abrir una votacion sincronizada para la sala.',
    selectTitle: 'Elige una radio',
    regionLabel: 'Region activa',
    categories: {
      [RADIO_CATEGORY_ALL]: 'Todo',
      [RADIO_CATEGORY_LOCAL]: 'De la region',
      [RADIO_CATEGORY_POP]: 'Pop y hits',
      [RADIO_CATEGORY_URBAN]: 'Urbano',
      [RADIO_CATEGORY_CHILL]: 'Chill'
    },
    categoryDescriptions: {
      [RADIO_CATEGORY_ALL]: 'Todo en un mismo radar para entrar escuchando rapido.',
      [RADIO_CATEGORY_LOCAL]: 'Sabor regional, hits locales y clima conocido.',
      [RADIO_CATEGORY_POP]: 'Pop, rock, flashback y radios mas abiertas.',
      [RADIO_CATEGORY_URBAN]: 'Mas calor con urbano, groove y radios intensas.',
      [RADIO_CATEGORY_CHILL]: 'Selecciones mas ligeras para una sala tranquila.'
    },
    empty: 'No se encontro ninguna radio en esta categoria.',
    expiresIn: 'La votacion termina en',
    openHub: 'Abrir radio',
    syncedBadge: 'Sincronizada',
    manualBadge: 'Manual',
    featured: 'Destacadas',
    readyCount: '%count% radios listas para sonar'
  }
};

function uiPack(localeTag) {
  const base = getLanguageBase(localeTag);
  return UI[base] || UI.en;
}

function station(name, url, category, accent, description, featured = false) {
  return { name, url, category, accent, description, featured };
}

function normalizeCategory(rawCategory) {
  const value = String(rawCategory || '').trim();
  if ([RADIO_CATEGORY_ALL, RADIO_CATEGORY_LOCAL, RADIO_CATEGORY_POP, RADIO_CATEGORY_URBAN, RADIO_CATEGORY_CHILL].includes(value)) {
    return value;
  }
  switch (value) {
    case 'Tudo':
      return RADIO_CATEGORY_ALL;
    case 'Brasil Hits':
    case 'Sertanejo & Forró':
      return RADIO_CATEGORY_LOCAL;
    case 'Funk, Rap & Soul':
    case 'Pagode, Samba & MPB':
      return RADIO_CATEGORY_URBAN;
    case 'Pop, Rock & Flashback':
      return RADIO_CATEGORY_POP;
    default:
      return RADIO_CATEGORY_POP;
  }
}

const GLOBAL_FALLBACK = [
  station('SomaFM Groove Salad', 'https://ice2.somafm.com/groovesalad-128-mp3', RADIO_CATEGORY_CHILL, '#5C6BC0', 'Ambient, chill and electronic texture for calmer rooms.', true),
  station('SomaFM PopTron', 'https://ice2.somafm.com/poptron-128-mp3', RADIO_CATEGORY_POP, '#EF5350', 'Indie pop and alt hooks that keep chat moving.'),
  station('SomaFM Indie Pop Rocks!', 'https://ice2.somafm.com/indiepop-128-mp3', RADIO_CATEGORY_POP, '#AB47BC', 'Melodic indie pop with a brighter energy.'),
  station('KEXP 90.3 FM', 'https://kexp-mp3-128.streamguys1.com/kexp128.mp3', RADIO_CATEGORY_LOCAL, '#26A69A', 'Alternative discovery radio with strong curation.'),
  station('Radio Swiss Pop', 'https://stream.srg-ssr.ch/m/rsp/mp3_128', RADIO_CATEGORY_LOCAL, '#42A5F5', 'Smooth international pop stream for shared listening.'),
  station('SomaFM Secret Agent', 'https://ice2.somafm.com/secretagent-128-mp3', RADIO_CATEGORY_URBAN, '#8E24AA', 'Cinematic grooves and stylish beats for rooms with attitude.'),
  station('SomaFM Lush', 'https://ice2.somafm.com/lush-128-mp3', RADIO_CATEGORY_CHILL, '#EC407A', 'Dream pop, shoegaze and softer textures for longer chats.'),
  station('SomaFM Beat Blender', 'https://ice2.somafm.com/beatblender-128-mp3', RADIO_CATEGORY_POP, '#7E57C2', 'Beat-driven electronic mix that keeps the room moving.'),
  station('SomaFM Drone Zone', 'https://ice2.somafm.com/dronezone-128-mp3', RADIO_CATEGORY_CHILL, '#5E35B1', 'Deep ambient flow for quieter or late-night rooms.'),
  station('SomaFM The Trip', 'https://ice2.somafm.com/thetrip-128-mp3', RADIO_CATEGORY_CHILL, '#26C6DA', 'Progressive electronica and ambient with more momentum.'),
  station('SomaFM Illinois Street Lounge', 'https://ice2.somafm.com/illstreet-128-mp3', RADIO_CATEGORY_POP, '#8D6E63', 'Retro lounge and dusty grooves for a different room mood.'),
  station('SomaFM Mission Control', 'https://ice2.somafm.com/missioncontrol-128-mp3', RADIO_CATEGORY_CHILL, '#3949AB', 'Space-age ambient and downbeat textures.'),
  station('SomaFM Deep Space One', 'https://ice2.somafm.com/deepspaceone-128-mp3', RADIO_CATEGORY_CHILL, '#283593', 'Slow cosmic ambience for rooms that want a softer background.'),
  station('Radio Swiss Jazz', 'https://stream.srg-ssr.ch/m/rsj/mp3_128', RADIO_CATEGORY_POP, '#00897B', 'Smooth jazz and classy instrumentation.'),
  station('Radio Swiss Classic', 'https://stream.srg-ssr.ch/m/rsc_de/mp3_128', RADIO_CATEGORY_CHILL, '#6D4C41', 'Classical radio with a calm and elegant room feel.')
];

const REGIONAL_BASE = {
  BR_PT: [
    station('Kiss FM', 'https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO_KISSFM_ADP.aac', RADIO_CATEGORY_POP, '#AD1457', 'Hits, pop rock e programação quente', true),
    station('Mix FM SP', 'https://playerservices.streamtheworld.com/api/livestream-redirect/MIXFM_SAOPAULOAAC.aac', RADIO_CATEGORY_LOCAL, '#E65100', 'Mainstream pop para ouvir sem pensar', true),
    station('Band FM SP', 'https://playerservices.streamtheworld.com/api/livestream-redirect/BANDFM_SP.mp3', RADIO_CATEGORY_LOCAL, '#1565C0', 'Popular brasileira com clima de rádio grande', true),
    station('Rádio Disney Brasil', 'https://playerservices.streamtheworld.com/api/livestream-redirect/DISNEY_BRA_SPAAC.aac', RADIO_CATEGORY_POP, '#00ACC1', 'Pop jovem e faixas conhecidas'),
    station('BH FM 102.1', 'https://playerservices.streamtheworld.com/api/livestream-redirect/BHFMAAC.aac', RADIO_CATEGORY_LOCAL, '#0D47A1', 'Funk, pop, pagode e sertanejo em rotação alta'),
    station('Nativa FM SP', 'https://playerservices.streamtheworld.com/api/livestream-redirect/NATIVA_SPAAC.aac', RADIO_CATEGORY_LOCAL, '#43A047', 'Música popular e sertanejo romântico'),
    station('Sucesso FM 88.3', 'https://servidor36.brlogic.com:8300/live?1696916321806', RADIO_CATEGORY_LOCAL, '#FF7043', 'Playlist aberta com brasilidades e hits'),
    station('Hunter Pop', 'https://live.hunter.fm/pop_high', RADIO_CATEGORY_POP, '#EC407A', 'Pop atual em fluxo contínuo'),
    station('Hunter Hits Brasil', 'https://live.hunter.fm/hitsbrasil_high', RADIO_CATEGORY_LOCAL, '#1E88E5', 'Hits nacionais e refrões conhecidos'),
    station('Hunter Smash', 'https://live.hunter.fm/smash_high', RADIO_CATEGORY_POP, '#00BCD4', 'Seleção acelerada para manter a sala viva'),
    station('Rádio Ambiente Brasil', 'https://stream.zeno.fm/js0ph1liomptv', RADIO_CATEGORY_LOCAL, '#FF7043', 'Rádio brasileira com hits e programação popular'),
    station('Rádio Axebahia', 'https://stream.zeno.fm/bpsyxg80g3quv', RADIO_CATEGORY_LOCAL, '#FF7043', 'Rádio brasileira com hits e programação popular'),
    station('Rádio Boom Bap Brasil', 'https://stream.zeno.fm/h29qowus601tv', RADIO_CATEGORY_LOCAL, '#FF7043', 'Rádio brasileira com hits e programação popular'),
    station('Rádio Brasil Do Trecho', 'https://stream.zeno.fm/sztiwct84dvvv', RADIO_CATEGORY_LOCAL, '#FF7043', 'Rádio brasileira com hits e programação popular'),
    station('Rádio Brasil Sertaneja 99 FM', 'https://stream.zeno.fm/39ndkymwvrhvv', RADIO_CATEGORY_LOCAL, '#FF7043', 'Rádio brasileira com hits e programação popular'),
    station('Rádio Brasilcaminhoneiro', 'https://stream.zeno.fm/2uh0rysx71zuv', RADIO_CATEGORY_LOCAL, '#FF7043', 'Rádio brasileira com hits e programação popular'),
    station('Rádio Brasileiras Alto', 'https://stream.zeno.fm/xgcrwxyto9wvv', RADIO_CATEGORY_LOCAL, '#FF7043', 'Rádio brasileira com hits e programação popular'),
    station('Rádio Brasiliamixdigital', 'https://stream.zeno.fm/vrp580674bhvv', RADIO_CATEGORY_LOCAL, '#FF7043', 'Rádio brasileira com hits e programação popular'),
    station('Rádio Brasilmultivideos', 'https://stream.zeno.fm/nzd3t8vmzc9uv', RADIO_CATEGORY_LOCAL, '#FF7043', 'Rádio brasileira com hits e programação popular'),
    station('Rádio Brega Webhits', 'https://stream.zeno.fm/m3h4eakvsy8uv', RADIO_CATEGORY_LOCAL, '#FF7043', 'Rádio brasileira com hits e programação popular'),

    station('Hunter Sertanejo', 'https://live.hunter.fm/sertanejo_high', RADIO_CATEGORY_LOCAL, '#2E7D32', 'Sertanejo forte para sala animada', true),
    station('Hunter Moda Sertaneja', 'https://live.hunter.fm/modasertaneja_high', RADIO_CATEGORY_LOCAL, '#558B2F', 'Moda sertaneja e clássicos do interior'),
    station('Hunter Pisadinha', 'https://live.hunter.fm/pisadinha_high', RADIO_CATEGORY_LOCAL, '#E65100', 'Pisadinha e sofrência dançante'),
    station('MGT Forró', 'https://cast.mgtradio.net/radio/8050/aac', RADIO_CATEGORY_LOCAL, '#BF360C', 'Forró e clima nordestino'),
    station('Rádio Forró', 'https://stm5.painelcast.com:7600/stream', RADIO_CATEGORY_LOCAL, '#FF8F00', 'Forró direto e sem enrolação'),
    station('Sertaneja 106.7', 'https://sc4s.cdn.upx.com:8067/stream', RADIO_CATEGORY_LOCAL, '#33691E', 'Sertanejo tradicional e universitário'),
    station('Rádio Café Viola', 'https://stm6.xcast.com.br:9328/', RADIO_CATEGORY_LOCAL, '#4E342E', 'Viola, raiz e clima de estrada'),
    station('Rádio Riacho FM', 'https://stm23.srvaudio.com.br:10974/stream', RADIO_CATEGORY_LOCAL, '#6D4C41', 'Mistura forró, sertanejo e música popular'),
    station('Rádio Buteco Sertanejo', 'https://stream.zeno.fm/6kumndewqbruv', RADIO_CATEGORY_LOCAL, '#7CB342', 'Sertanejo de boteco e refrão conhecido'),
    station('Rádio Sertaneja Raiz', 'http://station.radionanet.com:8330/stream?1713376151781', RADIO_CATEGORY_LOCAL, '#689F38', 'Raiz, viola e modão'),
    station('MGT Clássicos Sertanejos', 'https://cast.mgtradio.net/radio/8000/aac', RADIO_CATEGORY_LOCAL, '#8D6E63', 'Clássicos sertanejos em sequência'),
    station('MGT Sertanejo Universitário', 'https://cast.mgtradio.net/radio/8020/aac', RADIO_CATEGORY_LOCAL, '#9CCC65', 'Universitário e sofrência popular'),
    station('Rádio Arrocha Itaqua', 'https://stream.zeno.fm/hcsg8u0d2hhvv', RADIO_CATEGORY_LOCAL, '#43A047', 'Sertanejo, forró e clima de interior'),
    station('Rádio Arrocha Music', 'https://stream.zeno.fm/dcw55flsm3ovv', RADIO_CATEGORY_LOCAL, '#43A047', 'Sertanejo, forró e clima de interior'),
    station('Rádio Arrocha Web Radio', 'https://stream.zeno.fm/v7tajfnfuscvv', RADIO_CATEGORY_LOCAL, '#43A047', 'Sertanejo, forró e clima de interior'),
    station('Rádio Atualfm', 'https://stream.zeno.fm/vcng501a8tzuv', RADIO_CATEGORY_LOCAL, '#43A047', 'Sertanejo, forró e clima de interior'),
    station('Rádio Baroes Da Pisadinha', 'https://stream.zeno.fm/qzulktntngqtv', RADIO_CATEGORY_LOCAL, '#43A047', 'Sertanejo, forró e clima de interior'),
    station('Rádio Forro Antigas', 'https://stream.zeno.fm/8311rcerdg8uv', RADIO_CATEGORY_LOCAL, '#43A047', 'Sertanejo, forró e clima de interior'),
    station('Rádio Forro Brega', 'https://stream.zeno.fm/85yuxftum3quv', RADIO_CATEGORY_LOCAL, '#43A047', 'Sertanejo, forró e clima de interior'),
    station('Rádio Forro Brega Garanhuns', 'https://stream.zeno.fm/xkmpa3ez7ikvv', RADIO_CATEGORY_LOCAL, '#43A047', 'Sertanejo, forró e clima de interior'),
    station('Rádio Forro Das Antigas Diferente', 'https://stream.zeno.fm/30f8uubce78uv', RADIO_CATEGORY_LOCAL, '#43A047', 'Sertanejo, forró e clima de interior'),
    station('Rádio Buteco Sertanejo Ao Vivo', 'https://stream.zeno.fm/6urwsf4wzrruv', RADIO_CATEGORY_LOCAL, '#43A047', 'Sertanejo, forró e clima de interior'),

    station('Rádio Disco Funk BR', 'http://streaming12.hstbr.net:8084/live', RADIO_CATEGORY_URBAN, '#E91E63', 'Disco funk e grooves clássicos', true),
    station('Radio Soul One', 'https://stream.soulone.com.br/listen/soulone/externo', RADIO_CATEGORY_URBAN, '#8E24AA', 'Soul, R&B, funk e rap'),
    station('Rádio Rap Brasil', 'https://stream.zeno.fm/7c83b37e32quv', RADIO_CATEGORY_URBAN, '#5E35B1', 'Rap brasileiro e seleção urbana'),
    station('LEMIXX Funk & Groove', 'http://centova6.ciclanohost.com.br:9428/stream2', RADIO_CATEGORY_URBAN, '#D81B60', 'Old school dance, groove e raridades'),
    station('Radio Funk Brasil', 'https://stream.zeno.fm/rz29b8ahguhvv', RADIO_CATEGORY_URBAN, '#FF1744', 'Funk 24 horas direto do Zeno'),
    station('Top Funk', 'https://stream.zeno.fm/9vrapx4a3hhvv', RADIO_CATEGORY_URBAN, '#FF4081', 'Pancadão, trap e rap em rotação alta'),
    station('Rádio Trend - Funk', 'https://stream.zeno.fm/vqsnxuwkkzzuv', RADIO_CATEGORY_URBAN, '#FF5252', 'Lançamentos e tendências do funk brasileiro'),
    station('Pool FM', 'https://radios.poolwebwork.com.br/8010/stream', RADIO_CATEGORY_URBAN, '#26C6DA', 'Funk, disco e clima poolside'),
    station('DJ Guu Ofc', 'http://jpdofunk3.com.br:8262/stream', RADIO_CATEGORY_URBAN, '#FF4081', 'Funk direto para sala agitada'),
    station('105 FM SP', 'http://www.appradio.app:8010//live', RADIO_CATEGORY_URBAN, '#3949AB', 'Rap, samba e pagode de rua'),
    station('FUNK BRASIL', 'https://stream.zeno.fm/gu8g4kqpn3quv', RADIO_CATEGORY_URBAN, '#EF5350', 'Funk brasileiro em rotação contínua'),
    station('Conquista WebStation Brazil', 'https://stream.zeno.fm/ecryaaflji9tv', RADIO_CATEGORY_URBAN, '#AB47BC', 'Soul, dance e pop groove'),
    station('Rádio Ale Funk', 'https://stream.zeno.fm/x6shyqu4hc9uv', RADIO_CATEGORY_URBAN, '#E91E63', 'Funk, rap, soul e batida urbana brasileira'),
    station('Rádio Ale Funk 2', 'https://stream.zeno.fm/h7hcwaz3hc9uv', RADIO_CATEGORY_URBAN, '#E91E63', 'Funk, rap, soul e batida urbana brasileira'),
    station('Rádio Brasilian Songs', 'https://stream.zeno.fm/5nm6cnd0txhvv', RADIO_CATEGORY_URBAN, '#E91E63', 'Funk, rap, soul e batida urbana brasileira'),
    station('Rádio Brilhantina O Som Da Saudade', 'https://stream.zeno.fm/pidcycprxlluv', RADIO_CATEGORY_URBAN, '#E91E63', 'Funk, rap, soul e batida urbana brasileira'),
    station('Rádio Charme Love', 'https://stream.zeno.fm/tmk93xv0czxvv', RADIO_CATEGORY_URBAN, '#E91E63', 'Funk, rap, soul e batida urbana brasileira'),
    station('Rádio Charme Web Jb', 'https://stream.zeno.fm/kh3dyqcizkuuv', RADIO_CATEGORY_URBAN, '#E91E63', 'Funk, rap, soul e batida urbana brasileira'),
    station('Rádio Conexao Charme', 'https://stream.zeno.fm/ql33vuiljscvv', RADIO_CATEGORY_URBAN, '#E91E63', 'Funk, rap, soul e batida urbana brasileira'),
    station('Rádio Funk Digital SP', 'https://stream.zeno.fm/0o2cavmaejnvv', RADIO_CATEGORY_URBAN, '#E91E63', 'Funk, rap, soul e batida urbana brasileira'),
    station('Rádio Rapzim', 'https://stream.zeno.fm/58n3s75msv8uv', RADIO_CATEGORY_URBAN, '#E91E63', 'Funk, rap, soul e batida urbana brasileira'),
    station('Rádio Funk Brasil 2', 'https://stream.zeno.fm/3sw2vhlg0bptv', RADIO_CATEGORY_URBAN, '#E91E63', 'Funk, rap, soul e batida urbana brasileira'),

    station('Hunter Pagode', 'https://live.hunter.fm/pagode_high', RADIO_CATEGORY_URBAN, '#E91E63', 'Pagode leve para conversa e risada', true),
    station('Rádio Viva o Samba', 'https://servidor33-3.brlogic.com:8020/live', RADIO_CATEGORY_URBAN, '#D50000', 'Samba e partido alto'),
    station('Nova Brasil FM', 'https://playerservices.streamtheworld.com/api/livestream-redirect/NOVABRASIL_SPAAC.aac', RADIO_CATEGORY_URBAN, '#4A148C', 'MPB e brasilidade elegante'),
    station('Alpha MPB', 'https://playerservices.streamtheworld.com/api/livestream-redirect/ALPHAMPBAAC.aac', RADIO_CATEGORY_URBAN, '#0D47A1', 'MPB curada e mais leve'),
    station('Rádio Batuta MPB', 'http://radioims.out.airtime.pro:8000/radioims_a', RADIO_CATEGORY_URBAN, '#6A1B9A', 'Acervo musical do IMS voltado à música brasileira'),
    station('Rádio FM O Dia 99.7', 'https://wz7.servidoresbrasil.com:8274/stream', RADIO_CATEGORY_URBAN, '#FF7043', 'Pagode, samba e hits populares'),
    station('Piatã FM', 'https://streaming.livespanel.com:9430/stream', RADIO_CATEGORY_URBAN, '#26A69A', 'Pagode baiano e popular'),
    station('Rádio Itapoan FM 97.5', 'https://cast.radiu.live:9300/stream', RADIO_CATEGORY_URBAN, '#29B6F6', 'Popular, samba e pagode'),
    station('Rádio Clube 105.5 FM', 'https://8157.brasilstream.com.br/stream', RADIO_CATEGORY_URBAN, '#8E24AA', 'Samba, pagode e popular'),
    station('Radio Amigos da MPB', 'http://stm4.voxhd.com.br:7086/', RADIO_CATEGORY_URBAN, '#7E57C2', 'MPB para ouvir sem pressa'),
    station('Rádio Joli MPB', 'https://stream-163.zeno.fm/mrutsyhkc3quv', RADIO_CATEGORY_URBAN, '#5C6BC0', 'Música popular brasileira e voz suave'),
    station('Eldorado FM São Paulo', 'https://eldoradolive01.akamaized.net/hls/live/2041487/eldorado/master.m3u8', RADIO_CATEGORY_URBAN, '#00838F', 'MPB, jazz e curadoria brasileira'),
    station('Rádio Maroca', 'https://server03.srvsh.com.br:6844/', RADIO_CATEGORY_URBAN, '#6A1B9A', 'MPB e brasilidade com clima autoral'),
    station('Rádio Agenda Cultural MPB', 'https://stream.zeno.fm/1r6f3yp6kg8uv', RADIO_CATEGORY_URBAN, '#8E24AA', 'Pagode, samba e MPB para tocar na sala'),
    station('Rádio Agenda Cultural Samba Pagode', 'https://stream.zeno.fm/g56sdpgkeq8uv', RADIO_CATEGORY_URBAN, '#8E24AA', 'Pagode, samba e MPB para tocar na sala'),
    station('Rádio Belo Samba', 'https://stream.zeno.fm/f3jepw5fjjwvv', RADIO_CATEGORY_URBAN, '#8E24AA', 'Pagode, samba e MPB para tocar na sala'),
    station('Rádio Brisadesamba', 'https://stream.zeno.fm/08pzyh88azzuv', RADIO_CATEGORY_URBAN, '#8E24AA', 'Pagode, samba e MPB para tocar na sala'),
    station('Rádio Classe A MPB', 'https://stream.zeno.fm/xwdghpxnky8uv', RADIO_CATEGORY_URBAN, '#8E24AA', 'Pagode, samba e MPB para tocar na sala'),
    station('Rádio ClassicosMPB', 'https://stream.zeno.fm/p07ypp4gxzzuv', RADIO_CATEGORY_URBAN, '#8E24AA', 'Pagode, samba e MPB para tocar na sala'),
    station('Rádio Coletanea Pagodes Do Brasil', 'https://stream.zeno.fm/ycq6ds6p2uhvv', RADIO_CATEGORY_URBAN, '#8E24AA', 'Pagode, samba e MPB para tocar na sala'),
    station('Rádio Conexao Do Samba', 'https://stream.zeno.fm/n1hkgc30kn8uv', RADIO_CATEGORY_URBAN, '#8E24AA', 'Pagode, samba e MPB para tocar na sala'),
    station('Rádio Pagode 90 FM', 'https://stream.zeno.fm/qfbvg0bhfg8uv', RADIO_CATEGORY_URBAN, '#8E24AA', 'Pagode, samba e MPB para tocar na sala'),
    station('Rádio Ginga Pagodeira', 'https://stream.zeno.fm/xmz0a2f2ybruv', RADIO_CATEGORY_URBAN, '#8E24AA', 'Pagode, samba e MPB para tocar na sala'),

    station('Alpha FM', 'https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO_ALPHAFMAAC.aac', RADIO_CATEGORY_POP, '#00695C', 'Adult pop brasileiro e internacional bem curado', true),
    station('Transamérica Pop (PR)', 'https://playerservices.streamtheworld.com/api/livestream-redirect/RT_CWBAAC.aac', RADIO_CATEGORY_POP, '#880E4F', 'Pop e sucessos de rádio'),
    station('Antena 1 São Paulo', 'https://antenaone.crossradio.com.br/stream/1;', RADIO_CATEGORY_POP, '#42A5F5', 'Flashback e adult hits'),
    station('89 A Rádio Rock', 'https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO_89FM_ADP.aac?dist=site-89fm', RADIO_CATEGORY_POP, '#B71C1C', 'Rock de rádio com energia alta'),
    station('Rádio Cidade RJ', 'https://playerservices.streamtheworld.com/api/livestream-redirect/RADIOCIDADEAAC.aac', RADIO_CATEGORY_POP, '#D84315', 'Rock, pop e clássicos urbanos'),
    station('Bons Tempos FM', 'https://server02.ouvir.radio.br:8050/stream?1609720768800', RADIO_CATEGORY_POP, '#FF8A65', 'Nostalgia, românticas e rock leve'),
    station('Só Cacarecos Classic Rock', 'http://sokakarecos.ddns.net:9030/rock128', RADIO_CATEGORY_POP, '#6D4C41', 'Classic rock e progressivo'),
    station('91 Rock Curitiba', 'http://servidor40.brlogic.com:8044/live', RADIO_CATEGORY_POP, '#455A64', 'Rock brasileiro e internacional de rádio'),
    station('Rádio Saudade FM 99.7', 'https://playerservices.streamtheworld.com/api/livestream-redirect/SAUDADE_FMAAC.aac', RADIO_CATEGORY_POP, '#FFB300', 'Flashback e memórias afetivas'),
    station('Rádio Flashback FM', 'http://hd.matutos.com.br:8008/;stream.mp3', RADIO_CATEGORY_POP, '#8D6E63', 'Flashback nacional e internacional de rádio'),
    station('Fita Cassete', 'https://server01.ouvir.radio.br:8018/stream', RADIO_CATEGORY_POP, '#5E35B1', 'Anos 80, 90 e 2000'),
    station('Rádio Studio Flashback', 'https://stream-163.zeno.fm/6gv76f1xruquv?zs=SvdWy-tsTtCXPZ9IZC0ASA', RADIO_CATEGORY_POP, '#3949AB', 'Sequência de flashbacks e clássicos'),
    station('Radio Alvorada 94.9 FM', 'https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO_ALVORADAAAC.aac', RADIO_CATEGORY_POP, '#26A69A', 'Adulto contemporâneo e flashback'),
    station('Rádio Music Hall', 'http://server02.ouvir.radio.br:8050/stream', RADIO_CATEGORY_POP, '#EC407A', 'Pop rock e clima retrô'),
    station('Rádio 322 Brazil', 'https://stream.zeno.fm/77nxt58004zuv', RADIO_CATEGORY_POP, '#1E88E5', 'Pop, rock e flashback em rádios brasileiras'),
    station('Rádio Brasil The Classic Rock', 'https://stream.zeno.fm/ggn13p62gd0uv', RADIO_CATEGORY_POP, '#1E88E5', 'Pop, rock e flashback em rádios brasileiras'),
    station('Rádio Flexplay Agua Branca', 'https://stream.zeno.fm/s3ix2fvt000uv', RADIO_CATEGORY_POP, '#1E88E5', 'Pop, rock e flashback em rádios brasileiras'),
    station('Rádio Flexplay Brasilia', 'https://stream.zeno.fm/otdb4amutdutv', RADIO_CATEGORY_POP, '#1E88E5', 'Pop, rock e flashback em rádios brasileiras'),
    station('Rádio Flexplay Rio Branco', 'https://stream.zeno.fm/e1agcp8vbnfvv', RADIO_CATEGORY_POP, '#1E88E5', 'Pop, rock e flashback em rádios brasileiras'),
    station('Rádio Pop Rock Brazil', 'https://stream.zeno.fm/6xjtkzchmtouv', RADIO_CATEGORY_POP, '#1E88E5', 'Pop, rock e flashback em rádios brasileiras'),
    station('Rádio RadioBluesRockBrasil', 'https://stream.zeno.fm/skyzs0bmw98uv', RADIO_CATEGORY_POP, '#1E88E5', 'Pop, rock e flashback em rádios brasileiras'),
    station('Rádio Reginaldo Rossi Do Brasil', 'https://stream.zeno.fm/lmkeyg9nv0luv', RADIO_CATEGORY_POP, '#1E88E5', 'Pop, rock e flashback em rádios brasileiras'),
    station('Rádio Roberto Carlos Do Brasil', 'https://stream.zeno.fm/q32t9z1vcuhvv', RADIO_CATEGORY_POP, '#1E88E5', 'Pop, rock e flashback em rádios brasileiras'),
    station('Rádio Roda FM Brasil', 'https://stream.zeno.fm/l5ss9u1trhlvv', RADIO_CATEGORY_POP, '#1E88E5', 'Pop, rock e flashback em rádios brasileiras')
  ],
  US_EN: [
    station('US Indie Flow', 'https://ice2.somafm.com/indiepop-128-mp3', RADIO_CATEGORY_LOCAL, '#1E88E5', 'Indie and alt pop for United States rooms.', true),
    station('US Chill Mix', 'https://ice2.somafm.com/groovesalad-128-mp3', RADIO_CATEGORY_CHILL, '#26A69A', 'Chill electronic set for calmer conversations.'),
    station('US Pop Select', 'https://ice2.somafm.com/poptron-128-mp3', RADIO_CATEGORY_POP, '#EF5350', 'Fast pop fallback for shared rooms.')
  ],
  ES_ES: [
    station('Espana Pop Live', 'https://stream.srg-ssr.ch/m/rsp/mp3_128', RADIO_CATEGORY_LOCAL, '#FF7043', 'Pop-focused fallback for Spain rooms.', true),
    station('Espana Alt Mix', 'https://ice2.somafm.com/poptron-128-mp3', RADIO_CATEGORY_POP, '#8E24AA', 'Alternative pop and modern hooks.'),
    station('Espana Chill', 'https://ice2.somafm.com/groovesalad-128-mp3', RADIO_CATEGORY_CHILL, '#26C6DA', 'Soft electronic current for longer chats.')
  ],
  MX_ES: [
    station('Mexico Pop Room', 'https://ice2.somafm.com/indiepop-128-mp3', RADIO_CATEGORY_LOCAL, '#43A047', 'Fallback stream for Mexico rooms.', true),
    station('Mexico Soft Hits', 'https://stream.srg-ssr.ch/m/rsp/mp3_128', RADIO_CATEGORY_POP, '#FB8C00', 'Lighter pop rotation for shared listening.'),
    station('Mexico Chill', 'https://ice2.somafm.com/groovesalad-128-mp3', RADIO_CATEGORY_CHILL, '#26C6DA', 'Softer atmosphere for room sessions.')
  ],
  FR_FR: [
    station('France Pop Select', 'https://stream.srg-ssr.ch/m/rsp/mp3_128', RADIO_CATEGORY_LOCAL, '#5C6BC0', 'Pop selection for French rooms.', true),
    station('France Electro Mood', 'https://ice2.somafm.com/groovesalad-128-mp3', RADIO_CATEGORY_CHILL, '#26C6DA', 'Electronic and chill current.'),
    station('France Alt Pop', 'https://ice2.somafm.com/poptron-128-mp3', RADIO_CATEGORY_POP, '#EC407A', 'Modern hooks for active rooms.')
  ],
  DE_DE: [
    station('Deutschland Pop Mix', 'https://ice2.somafm.com/poptron-128-mp3', RADIO_CATEGORY_LOCAL, '#3949AB', 'Modern pop fallback for German rooms.', true),
    station('Deutschland Alt Radio', 'https://kexp-mp3-128.streamguys1.com/kexp128.mp3', RADIO_CATEGORY_POP, '#00897B', 'Alternative rotation with room-friendly energy.'),
    station('Deutschland Chill', 'https://ice2.somafm.com/groovesalad-128-mp3', RADIO_CATEGORY_CHILL, '#42A5F5', 'Slower electronic set for the room.')
  ],
  IT_IT: [
    station('Italia Pop Lounge', 'https://stream.srg-ssr.ch/m/rsp/mp3_128', RADIO_CATEGORY_LOCAL, '#EC407A', 'Soft pop fallback for Italian rooms.', true),
    station('Italia Indie Flow', 'https://ice2.somafm.com/indiepop-128-mp3', RADIO_CATEGORY_POP, '#7E57C2', 'Indie and melodic mix.'),
    station('Italia Chill', 'https://ice2.somafm.com/groovesalad-128-mp3', RADIO_CATEGORY_CHILL, '#26C6DA', 'Calmer atmosphere for the room.')
  ],
  RU_RU: [
    station('Russia Pop Wave', 'https://ice2.somafm.com/poptron-128-mp3', RADIO_CATEGORY_LOCAL, '#EF5350', 'Pop fallback for Russian rooms.', true),
    station('Russia Chill Grid', 'https://ice2.somafm.com/groovesalad-128-mp3', RADIO_CATEGORY_CHILL, '#29B6F6', 'Slower electronic texture for the room.'),
    station('Russia Indie Mix', 'https://ice2.somafm.com/indiepop-128-mp3', RADIO_CATEGORY_POP, '#AB47BC', 'Indie pop for active chats.')
  ],
  SA_AR: [
    station('Arabia Pop Flow', 'https://stream.srg-ssr.ch/m/rsp/mp3_128', RADIO_CATEGORY_LOCAL, '#26A69A', 'Pop fallback for Arabic rooms.', true),
    station('Arabia Night Mix', 'https://ice2.somafm.com/groovesalad-128-mp3', RADIO_CATEGORY_CHILL, '#8D6E63', 'Warm electronic set for longer sessions.'),
    station('Arabia Pop Select', 'https://ice2.somafm.com/poptron-128-mp3', RADIO_CATEGORY_POP, '#EF5350', 'Pop stream for shared listening.')
  ],
  IN_HI: [
    station('India Pop Now', 'https://ice2.somafm.com/poptron-128-mp3', RADIO_CATEGORY_LOCAL, '#FFA726', 'Fast pop fallback for India rooms.', true),
    station('India Chill Room', 'https://ice2.somafm.com/groovesalad-128-mp3', RADIO_CATEGORY_CHILL, '#26C6DA', 'Chill electronic stream for slower chats.'),
    station('India Indie Light', 'https://ice2.somafm.com/indiepop-128-mp3', RADIO_CATEGORY_POP, '#7E57C2', 'Lighter melodic mix.')
  ],
  BD_BN: [
    station('Bangla Pop Mix', 'https://ice2.somafm.com/indiepop-128-mp3', RADIO_CATEGORY_LOCAL, '#66BB6A', 'Fallback mix for Bangladesh rooms.', true),
    station('Bangla Lounge', 'https://stream.srg-ssr.ch/m/rsp/mp3_128', RADIO_CATEGORY_POP, '#42A5F5', 'Soft pop stream for shared listening.'),
    station('Bangla Chill', 'https://ice2.somafm.com/groovesalad-128-mp3', RADIO_CATEGORY_CHILL, '#26C6DA', 'Ambient support for longer sessions.')
  ],
  ID_ID: [
    station('Indonesia Pop Room', 'https://ice2.somafm.com/poptron-128-mp3', RADIO_CATEGORY_LOCAL, '#26A69A', 'Fallback pop stream for Indonesia.', true),
    station('Indonesia Sunset Mix', 'https://ice2.somafm.com/groovesalad-128-mp3', RADIO_CATEGORY_CHILL, '#FF7043', 'Lighter electronic sequence for rooms.'),
    station('Indonesia Indie', 'https://ice2.somafm.com/indiepop-128-mp3', RADIO_CATEGORY_POP, '#AB47BC', 'Melodic support for shared listening.')
  ],
  JP_JA: [
    station('Japan City Pop Flow', 'https://stream.srg-ssr.ch/m/rsp/mp3_128', RADIO_CATEGORY_LOCAL, '#EC407A', 'Smooth pop fallback for Japan rooms.', true),
    station('Japan Night Drive', 'https://ice2.somafm.com/groovesalad-128-mp3', RADIO_CATEGORY_CHILL, '#5C6BC0', 'Late-night electronic current.'),
    station('Japan Alt Pop', 'https://ice2.somafm.com/poptron-128-mp3', RADIO_CATEGORY_POP, '#EF5350', 'Modern pop hooks for active rooms.')
  ],
  KR_KO: [
    station('Korea Pop Room', 'https://ice2.somafm.com/poptron-128-mp3', RADIO_CATEGORY_LOCAL, '#AB47BC', 'Fallback pop stream for Korea rooms.', true),
    station('Korea Chill Select', 'https://stream.srg-ssr.ch/m/rsp/mp3_128', RADIO_CATEGORY_POP, '#42A5F5', 'Smooth pop for shared room playback.'),
    station('Korea Night Flow', 'https://ice2.somafm.com/groovesalad-128-mp3', RADIO_CATEGORY_CHILL, '#26C6DA', 'Softer radio flow for longer sessions.')
  ],
  TR_TR: [
    station('Turkiye Pop Flow', 'https://ice2.somafm.com/indiepop-128-mp3', RADIO_CATEGORY_LOCAL, '#26A69A', 'Indie-pop fallback for Turkiye rooms.', true),
    station('Turkiye Night Mix', 'https://ice2.somafm.com/groovesalad-128-mp3', RADIO_CATEGORY_CHILL, '#FF8A65', 'Slower electronic stream for room ambience.'),
    station('Turkiye Pop Select', 'https://ice2.somafm.com/poptron-128-mp3', RADIO_CATEGORY_POP, '#EF5350', 'Pop stream for active room flow.')
  ],
  PK_UR: [
    station('Pakistan Pop Room', 'https://stream.srg-ssr.ch/m/rsp/mp3_128', RADIO_CATEGORY_LOCAL, '#66BB6A', 'Fallback pop stream for Pakistan rooms.', true),
    station('Pakistan Chill Waves', 'https://ice2.somafm.com/groovesalad-128-mp3', RADIO_CATEGORY_CHILL, '#29B6F6', 'Ambient and light electronic sequence.'),
    station('Pakistan Indie Mix', 'https://ice2.somafm.com/indiepop-128-mp3', RADIO_CATEGORY_POP, '#AB47BC', 'Melodic backup for shared rooms.')
  ]
};

export function getRadioUi(localeTag) {
  return uiPack(localeTag);
}

export function getCategoryTheme(category) {
  return CATEGORY_THEME[category] || CATEGORY_THEME[RADIO_CATEGORY_POP];
}

export function getRegionRadioStations(regionKey) {
  const regional = REGIONAL_BASE[regionKey] || REGIONAL_BASE.US_EN;
  return [...regional, ...GLOBAL_FALLBACK].filter(
    (stationValue, index, list) => list.findIndex((item) => item.url === stationValue.url) === index
  );
}

export function normalizeRemoteRadioStation(raw, regionKey) {
  if (!raw || !raw.url || !raw.name) return null;
  const category = normalizeCategory(raw.category);
  return {
    name: String(raw.name),
    url: String(raw.url),
    category,
    accent: String(raw.color || '#4DA3FF'),
    description: String(raw.description || ''),
    featured: Boolean(raw.featured),
    regionKey: String(raw.regionKey || regionKey || '')
  };
}

export function mergeRegionalRadioStations(regionKey, remoteStations = []) {
  const base = getRegionRadioStations(regionKey);
  return [...remoteStations, ...base].filter(
    (stationValue, index, list) => list.findIndex((item) => item.url === stationValue.url) === index
  );
}

export function getCategoryOptions(localeTag, stations) {
  const pack = uiPack(localeTag);
  const available = new Set(stations.map((stationValue) => stationValue.category));
  return [
    { key: RADIO_CATEGORY_ALL, label: pack.categories[RADIO_CATEGORY_ALL] },
    ...[RADIO_CATEGORY_LOCAL, RADIO_CATEGORY_POP, RADIO_CATEGORY_URBAN, RADIO_CATEGORY_CHILL]
      .filter((key) => available.has(key))
      .map((key) => ({
        key,
        label: pack.categories[key],
        description: pack.categoryDescriptions[key],
        ...getCategoryTheme(key)
      }))
  ];
}

export function formatRegionRadioLabel(scope, localeTag) {
  return formatScopeLabel(scope || ROOM_SCOPES[0], localeTag);
}

export function getFeaturedStations(stations, selectedCategory) {
  const source = selectedCategory === RADIO_CATEGORY_ALL
    ? stations
    : stations.filter((stationValue) => stationValue.category === selectedCategory);
  return source.filter((stationValue) => stationValue.featured).slice(0, 8);
}

export function groupStationsByCategory(stations) {
  return [RADIO_CATEGORY_LOCAL, RADIO_CATEGORY_URBAN, RADIO_CATEGORY_POP, RADIO_CATEGORY_CHILL]
    .map((key) => ({ key, items: stations.filter((stationValue) => stationValue.category === key) }))
    .filter((group) => group.items.length > 0);
}
