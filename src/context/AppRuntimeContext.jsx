import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { get, onValue, ref } from 'firebase/database';
import { database } from '../firebase';
import { checkWebBanStatus } from '../lib/banGuard';
import {
  AD_DEFAULTS,
  ROOM_SCOPES,
  TURBO_DEFAULTS,
  formatScopeLabel,
  resolveInitialLocale,
  resolveInitialScope,
  tFor,
  translateCategory
} from '../lib/appRuntime';

const STORAGE_TURBO_UNTIL = 'wappi_turbo_until';

const AppRuntimeContext = createContext(null);

export function AppRuntimeProvider({ user, username, children }) {
  const [localeTag, setLocaleTag] = useState(resolveInitialLocale);
  const [roomScope, setRoomScope] = useState(resolveInitialScope);
  const [adsControls, setAdsControls] = useState(AD_DEFAULTS);
  const [turboControls, setTurboControls] = useState(TURBO_DEFAULTS);
  const [profile, setProfile] = useState(null);
  const [manualPremium, setManualPremium] = useState(false);
  const [purchasedPremium, setPurchasedPremium] = useState(() => window.localStorage.getItem('wappi_premium') === 'true');
  const [turboUntil, setTurboUntil] = useState(() => Number(window.localStorage.getItem(STORAGE_TURBO_UNTIL) || 0));
  const [turboNow, setTurboNow] = useState(Date.now());
  const [banState, setBanState] = useState({ checked: false, banned: false, reason: null, ip: null });

  useEffect(() => {
    window.localStorage.setItem('wappi_locale', localeTag);
  }, [localeTag]);

  useEffect(() => {
    window.localStorage.setItem('wappi_room_region', roomScope.regionKey);
  }, [roomScope]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_TURBO_UNTIL, String(turboUntil || 0));
  }, [turboUntil]);

  useEffect(() => {
    window.localStorage.setItem('wappi_premium', purchasedPremium ? 'true' : 'false');
  }, [purchasedPremium]);

  useEffect(() => {
    const tick = window.setInterval(() => setTurboNow(Date.now()), 1000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    const offAds = onValue(ref(database, 'app_config/ad_controls'), (snapshot) => {
      setAdsControls({ ...AD_DEFAULTS, ...(snapshot.val() || {}) });
    });
    const offTurbo = onValue(ref(database, 'app_config/turbo_controls'), (snapshot) => {
      setTurboControls({ ...TURBO_DEFAULTS, ...(snapshot.val() || {}) });
    });
    return () => {
      offAds();
      offTurbo();
    };
  }, []);

  useEffect(() => {
    if (!username) {
      setProfile(null);
      setManualPremium(false);
      return;
    }
    const upper = username.toUpperCase();
    const offUser = onValue(ref(database, `users/${upper}`), (snapshot) => {
      setProfile(snapshot.exists() ? snapshot.val() : null);
    });
    const offManual = onValue(ref(database, `manual_premium/${upper}`), (snapshot) => {
      setManualPremium(snapshot.val() === true);
    });
    return () => {
      offUser();
      offManual();
    };
  }, [username]);

  useEffect(() => {
    if (!user?.uid || !username) return;
    get(ref(database, `uid_to_username/${user.uid}`)).then((snapshot) => {
      if (!snapshot.exists()) return;
      const mapped = String(snapshot.val() || '').toUpperCase().trim();
      if (mapped && mapped !== username.toUpperCase()) {
        setProfile((prev) => ({ ...(prev || {}), name: mapped }));
      }
    }).catch(() => {});
  }, [user?.uid, username]);

  useEffect(() => {
    let cancelled = false;

    if (!user?.uid && !username) {
      setBanState({ checked: true, banned: false, reason: null, ip: null });
      return undefined;
    }

    checkWebBanStatus({ uid: user?.uid, username }).then((result) => {
      if (cancelled) return;
      setBanState({ checked: true, ...result });
    }).catch(() => {
      if (cancelled) return;
      setBanState((prev) => ({ ...prev, checked: true }));
    });

    return () => {
      cancelled = true;
    };
  }, [user?.uid, username, profile?.banned, profile?.bannedIp]);

  const turboRemainingMs = Math.max(0, turboUntil - turboNow);
  const hasTurbo = turboRemainingMs > 0;
  const isPremium = Boolean(profile?.isPremium || manualPremium || purchasedPremium);

  const value = useMemo(() => ({
    localeTag,
    roomScope,
    roomScopes: ROOM_SCOPES,
    adsControls,
    turboControls,
    profile,
    banState,
    isPremium,
    hasTurbo,
    turboRemainingMs,
    setLocaleTag,
    setRoomScopeByKey: (regionKey) => {
      const next = ROOM_SCOPES.find((scope) => scope.regionKey === regionKey);
      if (next) setRoomScope(next);
    },
    activateTurboMinutes: (minutes = 20) => {
      const base = Math.max(Date.now(), turboUntil || 0);
      setTurboUntil(base + minutes * 60_000);
    },
    clearTurbo: () => setTurboUntil(0),
    purchasedPremium,
    setPurchasedPremium,
    t: (key) => tFor(localeTag, key),
    formatScopeLabel: (scope) => formatScopeLabel(scope, localeTag),
    translateCategory: (category) => translateCategory(category, localeTag),
    shouldShowAds: !isPremium && adsControls.adsEnabled,
    canUseTurboFeature: (featureKey) => {
      if (!turboControls.enabled) return true;
      if (!turboControls[featureKey]) return true;
      return isPremium || hasTurbo;
    }
  }), [
    localeTag,
    roomScope,
    adsControls,
    turboControls,
    profile,
    isPremium,
    hasTurbo,
    turboRemainingMs,
    turboUntil
  ]);

  return <AppRuntimeContext.Provider value={value}>{children}</AppRuntimeContext.Provider>;
}

export function useAppRuntime() {
  const context = useContext(AppRuntimeContext);
  if (!context) {
    throw new Error('useAppRuntime must be used inside AppRuntimeProvider');
  }
  return context;
}
