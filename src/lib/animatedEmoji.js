const BASE_URL = 'https://fonts.gstatic.com/s/e/notoemoji/latest';

export function getAnimatedEmojiUrl(emoji) {
  if (!emoji) return '';
  if (String(emoji).startsWith('http') && String(emoji).endsWith('.json')) {
    return String(emoji);
  }

  const codepoints = [];
  for (const symbol of String(emoji)) {
    codepoints.push(symbol.codePointAt(0).toString(16).toLowerCase());
  }
  return `${BASE_URL}/${codepoints.join('_')}/lottie.json`;
}

export function getAnimatedEmojiParticles(emoji) {
  switch (emoji) {
    case '🔥':
      return ['✨', '💥', '⚡', '🔥'];
    case '❤️':
    case '🥰':
    case '😍':
      return ['💖', '💕', '✨', '💓'];
    case '😂':
    case '🤣':
      return ['💧', '✨', '😆'];
    case '🎉':
    case '🥳':
      return ['🎊', '✨', '🎈'];
    case '👍':
      return ['✨', '✅', '⭐'];
    case '💪':
      return ['⚡', '✨', '💥'];
    case '🚀':
      return ['🔥', '✨', '💨'];
    case '😭':
    case '😢':
      return ['💧', '🌊', '❄️'];
    case '🤯':
      return ['🧠', '💥', '✨'];
    case '💰':
    case '🤑':
      return ['💵', '💎', '💰'];
    default:
      return ['✨', '⭐'];
  }
}

export function getAnimatedEmojiEffectEmojis(emoji) {
  switch (emoji) {
    case '🔥':
      return ['✨', '💥', '⚡', '🔥'];
    case '❤️':
    case '🥰':
    case '😍':
      return ['💖', '💕', '✨', '💓'];
    case '😂':
    case '🤣':
      return ['💧', '✨', '😆'];
    case '🎉':
    case '🥳':
      return ['🎊', '✨', '🎈', '🎈'];
    case '👍':
      return ['✨', '✅', '⭐'];
    case '💪':
      return ['⚡', '✨', '💥'];
    case '🚀':
      return ['🔥', '✨', '💨', '💨'];
    case '😭':
    case '😢':
      return ['💧', '🌊', '❄️'];
    case '🤯':
      return ['🧠', '💥', '✨'];
    case '💰':
    case '🤑':
      return ['💵', '💎', '💰'];
    default:
      return ['✨', '⭐'];
  }
}

function isIgnorableInEmoji(codePoint) {
  return codePoint === 0x200d || (codePoint >= 0x1f3fb && codePoint <= 0x1f3ff) || codePoint === 0xfe0f;
}

function isEmojiCodePoint(codePoint) {
  return (
    (codePoint >= 0x1f300 && codePoint <= 0x1f9ff) ||
    (codePoint >= 0x1f600 && codePoint <= 0x1f64f) ||
    (codePoint >= 0x1f680 && codePoint <= 0x1f6ff) ||
    (codePoint >= 0x2600 && codePoint <= 0x26ff) ||
    (codePoint >= 0x2700 && codePoint <= 0x27bf) ||
    (codePoint >= 0x1fa00 && codePoint <= 0x1faff)
  );
}

export function isSingleEmojiMessage(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return false;

  let count = 0;
  let hasEmoji = false;
  for (const symbol of trimmed) {
    const codePoint = symbol.codePointAt(0);
    if (!isIgnorableInEmoji(codePoint)) {
      count += 1;
      if (isEmojiCodePoint(codePoint)) {
        hasEmoji = true;
      }
    }
  }

  return count === 1 && hasEmoji;
}
