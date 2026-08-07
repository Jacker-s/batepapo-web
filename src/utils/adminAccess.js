import { get, ref } from 'firebase/database';
import { database } from '../firebase';

const STAFF_NAMES = ['ADM', 'JACKSON', 'PRINCE', 'ALICE'];

function normalizeName(value) {
  return String(value || '').trim().toUpperCase();
}

export function isUserAdminName(username) {
  const upper = normalizeName(username);
  if (!upper) return false;
  return STAFF_NAMES.some((name) => upper === name || upper.startsWith(`${name}_`));
}

export async function resolveAdminAccess({ username, uid }) {
  const normalizedUsername = normalizeName(username);
  const normalizedUid = String(uid || '').trim();

  if (isUserAdminName(normalizedUsername)) {
    return true;
  }

  if (!normalizedUsername && !normalizedUid) {
    return false;
  }

  try {
    if (normalizedUsername) {
      const profileSnapshot = await get(ref(database, `users/${normalizedUsername}`));
      if (profileSnapshot.exists()) {
        const profile = profileSnapshot.val() || {};
        if (String(profile.role || '').trim().toLowerCase() === 'adm') {
          return true;
        }
        if (isUserAdminName(profile.name || normalizedUsername)) {
          return true;
        }
      }
    }

    if (normalizedUid) {
      const accessSnapshot = await get(ref(database, `admin_access_keys/${normalizedUid}`));
      if (accessSnapshot.exists()) {
        return true;
      }
    }
  } catch (error) {
    console.error('resolveAdminAccess error', error);
  }

  return false;
}
