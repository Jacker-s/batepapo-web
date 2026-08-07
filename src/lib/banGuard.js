import { get, ref } from 'firebase/database';
import { database } from '../firebase';

const STORAGE_KEY = 'wappi_client_ip';

function normalizeUsername(username) {
  return String(username || '').trim().toUpperCase();
}

function sanitizeIp(ip) {
  return String(ip || '').trim().replace(/\./g, '_');
}

let cachedIp = null;

export async function fetchClientIpAddress() {
  if (cachedIp) return cachedIp;

  try {
    const response = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });
    if (!response.ok) return null;
    const payload = await response.json();
    const ip = String(payload?.ip || '').trim();
    if (ip) {
      cachedIp = ip;
    }
    return ip;
  } catch {
    return null;
  }
}

export async function checkWebBanStatus({ uid, username }) {
  const upper = normalizeUsername(username);
  const checks = [];

  if (uid) {
    checks.push(get(ref(database, `banned_users/${uid}`)).catch(() => null));
  } else {
    checks.push(Promise.resolve(null));
  }

  if (upper) {
    checks.push(get(ref(database, `users/${upper}/banned`)).catch(() => null));
    checks.push(get(ref(database, `users/${upper}/bannedIp`)).catch(() => null));
  } else {
    checks.push(Promise.resolve(null));
    checks.push(Promise.resolve(null));
  }

  const ip = await fetchClientIpAddress();
  if (ip) {
    checks.push(get(ref(database, `blocked_ips/${sanitizeIp(ip)}`)).catch(() => null));
  } else {
    checks.push(Promise.resolve(null));
  }

  const [uidBanSnap, profileBanSnap, profileBannedIpSnap, blockedIpSnap] = await Promise.all(checks);
  const now = Date.now();

  const parseBanInfo = (rawValue, fallbackReason) => {
    if (rawValue == null) return null;
    if (rawValue === true || rawValue === 'true') {
      return {
        banned: true,
        reason: fallbackReason,
        isTemporary: false,
        isPermanent: true,
        expiresAt: 0,
        isNuclear: false
      };
    }
    if (typeof rawValue === 'object') {
      const isTemporary = rawValue.isTemporary === true;
      const expiresAt = Number(rawValue.expiresAt || 0);
      const isExpired = isTemporary && expiresAt > 0 && expiresAt <= now;
      if (isExpired) return null;
      return {
        banned: !isTemporary || expiresAt <= 0 || expiresAt > now,
        reason: fallbackReason,
        isTemporary,
        isPermanent: rawValue.isNuclear === true || !isTemporary,
        expiresAt,
        isNuclear: rawValue.isNuclear === true
      };
    }
    return null;
  };

  const uidBan = uidBanSnap?.exists() ? parseBanInfo(uidBanSnap.val(), 'uid') : null;
  console.log('[BanGuard] UID Ban check:', { uid, exists: uidBanSnap?.exists(), val: uidBanSnap?.val(), parsed: uidBan });
  if (uidBan?.banned) {
    console.log('[BanGuard] Blocked by UID Ban');
    return { ...uidBan, ip };
  }

  const profileBan = profileBanSnap?.exists() ? parseBanInfo(profileBanSnap.val(), 'profile') : null;
  console.log('[BanGuard] Profile Ban check:', { username, exists: profileBanSnap?.exists(), val: profileBanSnap?.val(), parsed: profileBan });
  if (profileBan?.banned) {
    console.log('[BanGuard] Blocked by Profile Ban');
    return { ...profileBan, ip };
  }

  const profileBannedIpVal = profileBannedIpSnap?.val();
  console.log('[BanGuard] Profile Banned IP check:', { bannedIp: profileBannedIpVal, exists: profileBannedIpSnap?.exists() });
  if (profileBannedIpSnap?.exists() && String(profileBannedIpVal || '').trim()) {
    const profileBannedIp = String(profileBannedIpVal).trim();
    const isIpStillBlockedSnap = await get(ref(database, `blocked_ips/${sanitizeIp(profileBannedIp)}`)).catch(() => null);
    console.log('[BanGuard] Profile Banned IP still blocked check:', { ip: profileBannedIp, blocked: isIpStillBlockedSnap?.val() });
    if (isIpStillBlockedSnap?.exists() && isIpStillBlockedSnap.val()) {
      console.log('[BanGuard] Blocked by Profile Banned IP');
      return {
        banned: true,
        reason: 'profile_ip',
        isTemporary: false,
        isPermanent: true,
        expiresAt: 0,
        isNuclear: true,
        ip
      };
    }
  }

  console.log('[BanGuard] IP Block check:', { ip, sanitized: sanitizeIp(ip), blocked: blockedIpSnap?.val() });
  if (blockedIpSnap?.exists() && blockedIpSnap.val()) {
    console.log('[BanGuard] Blocked by IP Block');
    return {
      banned: true,
      reason: 'ip',
      isTemporary: false,
      isPermanent: true,
      expiresAt: 0,
      isNuclear: true,
      ip
    };
  }

  console.log('[BanGuard] User is not banned');
  return {
    banned: false,
    reason: null,
    isTemporary: false,
    isPermanent: false,
    expiresAt: 0,
    isNuclear: false,
    ip
  };
}
