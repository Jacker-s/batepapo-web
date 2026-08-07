import prankBrinde from '../assets/pranks/prank_brinde.json';
import prankCafune from '../assets/pranks/prank_cafune.json';
import prankDancar from '../assets/pranks/prank_dancar.json';
import prankZoar from '../assets/pranks/prank_zoar.json';
import { getLanguageBase } from './appRuntime';

const PRANK_TEXT = {
  pt: {
    ui: {
      pickerTitle: 'Brincadeiras da sala',
      pickerSubtitle: 'Escolha uma ação e depois selecione quem vai receber a brincadeira.',
      previewTitle: 'Previa da brincadeira',
      previewSubtitle: 'Confira o clima antes de escolher quem vai receber.',
      targetTitle: 'Escolha o usuario que vai receber essa brincadeira.',
      noUsers: 'Nenhum outro usuario disponivel nessa sala agora.',
      allInRoom: 'Todos da sala',
      allInRoomDesc: 'Envia a brincadeira como mensagem publica para quem estiver na sala.',
      howAppears: 'Como vai aparecer',
      changePrank: 'Trocar brincadeira',
      chooseUser: 'Escolher usuario',
      sendNow: 'Enviar agora',
      privateInRoom: 'Privado na sala',
      chooseLater: 'Escolha o alvo depois'
    },
    titles: {
      kiss: 'Beijar',
      hug: 'Abracar',
      slap: 'Tapa',
      poke: 'Cutucar',
      love: 'Amor',
      cuddle: 'Cafune',
      dance: 'Dancar',
      tease: 'Zoar',
      toast: 'Brinde',
      radioSync: 'Radio sincronizada',
      truthOrDare: 'Verdade ou Desafio',
      crush: 'Crush'
    },
    subtitles: {
      kiss: 'Envia um beijo animado em particular',
      hug: 'Manda um abraco carinhoso',
      slap: 'Brincadeira rapida e provocativa',
      poke: 'Chama atencao de leve',
      love: 'Dispara coracoes para alguem',
      cuddle: 'Faz um carinho fofo em alguem',
      dance: 'Convida alguem para entrar no clima',
      tease: 'Manda uma provocacao brincalhona',
      toast: 'Levanta um brinde com outro usuario',
      radioSync: 'Propoe uma radio para a sala ouvir junto por votacao',
      truthOrDare: 'Cria um card interativo direto na sala',
      crush: 'Envia um elogio anonimo'
    },
    previewHeadlines: {
      '/beijar': 'Um beijo animado vai aparecer antes de chegar no alvo.',
      '/abracar': 'O abraco chega de forma leve e carinhosa.',
      '/tapa': 'A brincadeira entra com impacto visual rapido.',
      '/cutucar': 'Uma chamada curta para puxar a atencao.',
      '/amor': 'A acao espalha clima fofo e positivo.',
      '/cafune': 'Previa macia, com clima de carinho mesmo.',
      '/dancar': 'A sala ganha energia e movimento antes do envio.',
      '/zoar': 'A brincadeira aparece com humor e provocacao leve.',
      '/brinde': 'A animacao prepara o encontro antes do brinde.',
      '/radiosync': 'Voce escolhe a radio e a sala decide se entra no modo sincronizado.',
      '/crush': 'Mostra o clima secreto antes do elogio seguir.'
    },
    examples: {
      '/radiosync': 'Exemplo: propor uma radio para a sala ouvir junto, com votacao antes de tocar.',
      '/crush': 'Exemplo: alguem te acha muito interessante...'
    },
    animationMessages: {
      ANIMATION_KISS: { label: 'Beijo', message: 'Voce recebeu um beijo!' },
      ANIMATION_HUG: { label: 'Abraco', message: 'Voce recebeu um abraco!' },
      ANIMATION_SLAP: { label: 'Tapa', message: 'Voce tomou um tapa!' },
      ANIMATION_POKE: { label: 'Cutucada', message: 'Alguem te cutucou!' },
      ANIMATION_HEART: { label: 'Amor', message: 'Alguem te mandou amor!' },
      ANIMATION_CAFUNE: { label: 'Cafune', message: 'Voce recebeu um cafune fofo!' },
      ANIMATION_DANCE: { label: 'Danca', message: 'Chamaram voce para dancar!' },
      ANIMATION_TEASE: { label: 'Zoeira', message: 'Alguem comecou a zoar com voce!' },
      ANIMATION_CHEERS: { label: 'Brinde', message: 'Alguem levantou um brinde com voce!' },
      ANIMATION_DICE: { label: 'Dado', message: 'O dado foi lancado!' }
    }
  },
  en: {
    ui: {
      pickerTitle: 'Room pranks',
      pickerSubtitle: 'Choose an action and then select who will receive the prank.',
      previewTitle: 'Prank preview',
      previewSubtitle: 'Check the vibe before choosing who will receive it.',
      targetTitle: 'Choose the user who will receive this prank.',
      noUsers: 'No other users are available in this room right now.',
      allInRoom: 'Everyone in the room',
      allInRoomDesc: 'Sends the prank as a public message to everyone in the room.',
      howAppears: 'How it will appear',
      changePrank: 'Change prank',
      chooseUser: 'Choose user',
      sendNow: 'Send now',
      privateInRoom: 'Private in the room',
      chooseLater: 'Choose the target later'
    },
    titles: {
      kiss: 'Kiss',
      hug: 'Hug',
      slap: 'Slap',
      poke: 'Poke',
      love: 'Love',
      cuddle: 'Head pat',
      dance: 'Dance',
      tease: 'Tease',
      toast: 'Toast',
      radioSync: 'Synced radio',
      truthOrDare: 'Truth or Dare',
      crush: 'Crush'
    },
    subtitles: {
      kiss: 'Send an animated kiss in private',
      hug: 'Send a warm hug',
      slap: 'Quick and provocative playful action',
      poke: 'Gently get someone’s attention',
      love: 'Send hearts to someone',
      cuddle: 'Do a cute affectionate gesture to someone',
      dance: 'Invite someone to join the vibe',
      tease: 'Send a playful provocation',
      toast: 'Raise a toast with another user',
      radioSync: 'Suggest a radio for the room to hear together through voting',
      truthOrDare: 'Creates an interactive card right inside the room',
      crush: 'Send an anonymous compliment'
    },
    previewHeadlines: {
      '/beijar': 'An animated kiss will appear before reaching the target.',
      '/abracar': 'The hug arrives in a light and caring way.',
      '/tapa': 'The prank enters with quick visual impact.',
      '/cutucar': 'A short call to get attention.',
      '/amor': 'The action spreads a cute and positive vibe.',
      '/cafune': 'A soft preview with a caring mood.',
      '/dancar': 'The room gains energy and movement before sending.',
      '/zoar': 'The prank appears with humor and light teasing.',
      '/brinde': 'The animation sets up the moment before the toast.',
      '/radiosync': 'You choose the radio and the room decides whether to enter synced mode.',
      '/crush': 'It sets a secret mood before the compliment lands.'
    },
    examples: {
      '/radiosync': 'Example: suggest a radio for the room to hear together, with a vote before it starts.',
      '/crush': 'Example: someone thinks you are very interesting...'
    },
    animationMessages: {
      ANIMATION_KISS: { label: 'Kiss', message: 'You got a kiss!' },
      ANIMATION_HUG: { label: 'Hug', message: 'You got a hug!' },
      ANIMATION_SLAP: { label: 'Slap', message: 'You got slapped!' },
      ANIMATION_POKE: { label: 'Poke', message: 'Someone poked you!' },
      ANIMATION_HEART: { label: 'Love', message: 'Someone sent you love!' },
      ANIMATION_CAFUNE: { label: 'Head pat', message: 'You got a cute head pat!' },
      ANIMATION_DANCE: { label: 'Dance', message: 'Someone invited you to dance!' },
      ANIMATION_TEASE: { label: 'Tease', message: 'Someone started teasing you!' },
      ANIMATION_CHEERS: { label: 'Toast', message: 'Someone raised a toast with you!' },
      ANIMATION_DICE: { label: 'Dice', message: 'The dice was rolled!' }
    }
  },
  es: {
    ui: {
      pickerTitle: 'Bromas de la sala',
      pickerSubtitle: 'Elige una accion y luego selecciona quien recibira la broma.',
      previewTitle: 'Vista previa de la broma',
      previewSubtitle: 'Mira el ambiente antes de elegir quien la recibira.',
      targetTitle: 'Elige el usuario que recibira esta broma.',
      noUsers: 'No hay otros usuarios disponibles en esta sala ahora mismo.',
      allInRoom: 'Todos en la sala',
      allInRoomDesc: 'Envia la broma como mensaje publico para todos en la sala.',
      howAppears: 'Como aparecera',
      changePrank: 'Cambiar broma',
      chooseUser: 'Elegir usuario',
      sendNow: 'Enviar ahora',
      privateInRoom: 'Privado en la sala',
      chooseLater: 'Elegir el objetivo despues'
    },
    titles: {
      kiss: 'Besar',
      hug: 'Abrazar',
      slap: 'Bofetada',
      poke: 'Picar',
      love: 'Amor',
      cuddle: 'Caricia',
      dance: 'Bailar',
      tease: 'Bromear',
      toast: 'Brindis',
      radioSync: 'Radio sincronizada',
      truthOrDare: 'Verdad o Reto',
      crush: 'Crush'
    },
    subtitles: {
      kiss: 'Envia un beso animado en privado',
      hug: 'Manda un abrazo carinoso',
      slap: 'Accion rapida y provocadora',
      poke: 'Llama la atencion suavemente',
      love: 'Envia corazones a alguien',
      cuddle: 'Haz un gesto tierno a alguien',
      dance: 'Invita a alguien a entrar en el ambiente',
      tease: 'Envia una provocacion juguetona',
      toast: 'Levanta un brindis con otro usuario',
      radioSync: 'Propone una radio para que la sala la escuche junta por votacion',
      truthOrDare: 'Crea una tarjeta interactiva dentro de la sala',
      crush: 'Envia un cumplido anonimo'
    },
    previewHeadlines: {
      '/beijar': 'Un beso animado aparecera antes de llegar al objetivo.',
      '/abracar': 'El abrazo llega de manera ligera y carinosa.',
      '/tapa': 'La broma entra con impacto visual rapido.',
      '/cutucar': 'Un llamado corto para llamar la atencion.',
      '/amor': 'La accion esparce un ambiente tierno y positivo.',
      '/cafune': 'Una vista previa suave y carinosa.',
      '/dancar': 'La sala gana energia y movimiento antes del envio.',
      '/zoar': 'La broma aparece con humor y provocacion ligera.',
      '/brinde': 'La animacion prepara el momento antes del brindis.',
      '/radiosync': 'Tu eliges la radio y la sala decide si entra al modo sincronizado.',
      '/crush': 'Muestra un clima secreto antes de que llegue el cumplido.'
    },
    examples: {
      '/radiosync': 'Ejemplo: proponer una radio para que la sala escuche junta, con votacion antes de empezar.',
      '/crush': 'Ejemplo: alguien te encuentra muy interesante...'
    },
    animationMessages: {
      ANIMATION_KISS: { label: 'Beso', message: 'Recibiste un beso!' },
      ANIMATION_HUG: { label: 'Abrazo', message: 'Recibiste un abrazo!' },
      ANIMATION_SLAP: { label: 'Bofetada', message: 'Te dieron una bofetada!' },
      ANIMATION_POKE: { label: 'Toque', message: 'Alguien te pico!' },
      ANIMATION_HEART: { label: 'Amor', message: 'Alguien te envio amor!' },
      ANIMATION_CAFUNE: { label: 'Caricia', message: 'Recibiste una caricia tierna!' },
      ANIMATION_DANCE: { label: 'Baile', message: 'Te invitaron a bailar!' },
      ANIMATION_TEASE: { label: 'Broma', message: 'Alguien empezo a bromear contigo!' },
      ANIMATION_CHEERS: { label: 'Brindis', message: 'Alguien levanto un brindis contigo!' },
      ANIMATION_DICE: { label: 'Dado', message: 'El dado fue lanzado!' }
    }
  }
};

const PRANK_BASE = [
  { id: 'kiss', command: '/beijar', emoji: '💋', accent: '#FF6FAE', animationType: 'ANIMATION_KISS' },
  { id: 'hug', command: '/abracar', emoji: '🫂', accent: '#7E57C2', animationType: 'ANIMATION_HUG' },
  { id: 'slap', command: '/tapa', emoji: '✋', accent: '#FFB300', animationType: 'ANIMATION_SLAP' },
  { id: 'poke', command: '/cutucar', emoji: '👉', accent: '#26C6DA', animationType: 'ANIMATION_POKE' },
  { id: 'love', command: '/amor', emoji: '❤️', accent: '#E53935', animationType: 'ANIMATION_HEART' },
  { id: 'cuddle', command: '/cafune', emoji: '🧠', accent: '#8E24AA', animationType: 'ANIMATION_CAFUNE' },
  { id: 'dance', command: '/dancar', emoji: '💃', accent: '#EC407A', animationType: 'ANIMATION_DANCE' },
  { id: 'tease', command: '/zoar', emoji: '🤪', accent: '#FB8C00', animationType: 'ANIMATION_TEASE' },
  { id: 'toast', command: '/brinde', emoji: '🥂', accent: '#00897B', animationType: 'ANIMATION_CHEERS' },
  { id: 'radioSync', command: '/radiosync', emoji: '📻', accent: '#2D9CDB', animationType: null },
  { id: 'truthOrDare', command: '/verdadeoudesafio', emoji: '🎭', accent: '#7C4DFF', animationType: null },
  { id: 'crush', command: '/crush', emoji: '🕵️', accent: '#43A047', animationType: null }
];

export const PRANK_COMMAND_TO_ANIMATION = Object.fromEntries(
  PRANK_BASE.filter((item) => item.animationType).map((item) => [item.command, item.animationType])
);

const ANIMATION_SPECS = {
  ANIMATION_KISS: {
    accent: '#FF6FAE',
    dotLottieUrl: 'https://lottie.host/b8770a29-eac9-4405-84da-9028424beae9/lOw6PqAqmJ.lottie',
    size: 350,
    loop: true,
    speed: 2
  },
  ANIMATION_HUG: {
    accent: '#7E57C2',
    dotLottieUrl: 'https://assets-v2.lottiefiles.com/a/a6d5421a-1153-11ee-8405-4bcb5b3882f5/oIMgJRXEVe.lottie',
    size: 350,
    speed: 2
  },
  ANIMATION_SLAP: {
    accent: '#FFB300',
    dotLottieUrl: 'https://assets-v2.lottiefiles.com/a/c61db752-91a9-11ee-b761-dbfbf3696a57/CfcY0qvnNb.lottie',
    size: 350,
    speed: 1.5
  },
  ANIMATION_POKE: {
    accent: '#26C6DA',
    dotLottieUrl: 'https://assets-v2.lottiefiles.com/a/a78c726e-1185-11ee-8a64-4771928736f2/aHtmkPJTR8.lottie',
    size: 350,
    speed: 2
  },
  ANIMATION_HEART: {
    accent: '#E53935',
    dotLottieUrl: 'https://assets-v2.lottiefiles.com/a/1920d50c-1175-11ee-82c5-9725c893ea9b/wXADuRrGYx.lottie',
    size: 500,
    loop: true,
    speed: 2
  },
  ANIMATION_CAFUNE: {
    accent: '#8E24AA',
    lottieJson: prankCafune,
    size: 380,
    speed: 1.6
  },
  ANIMATION_DANCE: {
    accent: '#EC407A',
    lottieJson: prankDancar,
    size: 460,
    loop: true,
    speed: 2.2
  },
  ANIMATION_TEASE: {
    accent: '#FB8C00',
    lottieJson: prankZoar,
    size: 350,
    speed: 2.4
  },
  ANIMATION_CHEERS: {
    accent: '#00897B',
    lottieJson: prankBrinde,
    size: 440,
    speed: 1.9
  },
  ANIMATION_DICE: {
    accent: '#90CAF9',
    dotLottieUrl: 'https://lottie.host/825f69ec-86f3-424a-95a6-061803734e56/Y9i7z8Yx8C.lottie',
    size: 350,
    speed: 2
  }
};

function getTextPack(localeTag) {
  return PRANK_TEXT[getLanguageBase(localeTag)] || PRANK_TEXT.en;
}

export function getPrankPickerUi(localeTag) {
  return getTextPack(localeTag).ui;
}

export function getPrankCatalog(localeTag) {
  const pack = getTextPack(localeTag);
  return PRANK_BASE.map((item) => ({
    ...item,
    title: pack.titles[item.id],
    subtitle: pack.subtitles[item.id],
    previewHeadline: pack.previewHeadlines[item.command] || pack.subtitles[item.id],
    previewExample: pack.examples[item.command] || (
      getLanguageBase(localeTag) === 'pt'
        ? `Exemplo: ${item.emoji} ${pack.titles[item.id].toLowerCase()} em particular para o usuario selecionado.`
        : getLanguageBase(localeTag) === 'es'
        ? `Ejemplo: ${item.emoji} ${pack.titles[item.id].toLowerCase()} en privado para el usuario seleccionado.`
        : `Example: ${item.emoji} ${pack.titles[item.id].toLowerCase()} privately to the selected user.`
    )
  }));
}

export function getPrankAnimationSpec(animationType, localeTag) {
  const base = ANIMATION_SPECS[animationType];
  if (!base) return null;
  const pack = getTextPack(localeTag);
  return {
    ...base,
    ...(pack.animationMessages[animationType] || {})
  };
}

export function buildRoomPrankMessage(prank, senderName, targetName, sendToAll) {
  const action = {
    '/beijar': '💋 enviou um beijo carinhoso para',
    '/abracar': '🫂 deu um abraco apertado em',
    '/tapa': '✋ deu um tapa brincalhao em',
    '/cutucar': '👉 cutucou',
    '/amor': '❤️ mandou muito amor para',
    '/cafune': '🧠 fez um cafune cheio de carinho em',
    '/dancar': '💃 chamou para dancar com',
    '/zoar': '🤪 comecou uma zoeira com',
    '/brinde': '🥂 levantou um brinde com',
    '/radiosync': '📻 sugeriu uma radio sincronizada para',
    '/verdadeoudesafio': '🎭 iniciou Verdade ou Desafio com',
    '/crush': '🕵️ mandou um crush secreto para'
  }[prank.command] || `${prank.emoji} chamou`;

  if (sendToAll) {
    return `✨ **${senderName}** ${action.replace(/ com$| para$| em$|ou$/, '').trim()} **toda a sala**!`;
  }

  return `✨ **${senderName}** ${action} **${targetName}**!`;
}

export function buildPrivatePrankMessage(prank, senderName, friendName) {
  const fallbackName = friendName || 'voce';
  if (prank.command === '/crush') {
    return `🕵️ ${senderName} enviou um elogio secreto para ${fallbackName}.`;
  }
  if (prank.command === '/verdadeoudesafio') {
    return `🎭 ${senderName} quer jogar Verdade ou Desafio com ${fallbackName}.`;
  }
  if (prank.command === '/radiosync') {
    return `📻 ${senderName} compartilhou uma ideia de radio sincronizada com ${fallbackName}.`;
  }
  return `✨ ${senderName} te chamou para ${prank.title.toLowerCase()}.`;
}
