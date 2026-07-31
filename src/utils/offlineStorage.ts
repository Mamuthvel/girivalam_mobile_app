// Lightweight localStorage-based offline cache.
// Used when Supabase is unreachable (no network, or request failed).

export const OFFLINE_KEYS = {
  LANDMARKS:    'gv_offline_landmarks_v1',
  ASHTA_LINGAM: 'gv_offline_ashtalingam_v1',
  SAVED_AT:     'gv_offline_saved_at',
} as const

const MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export function saveOffline<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    localStorage.setItem(OFFLINE_KEYS.SAVED_AT, String(Date.now()))
  } catch {
    // Storage quota exceeded — fail silently
  }
}

export function loadOffline<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function clearOfflineCache(): void {
  Object.values(OFFLINE_KEYS).forEach(k => localStorage.removeItem(k))
}

/** Returns age of the cache in minutes, or null if nothing is cached. */
export function offlineCacheAgeMinutes(): number | null {
  const ts = localStorage.getItem(OFFLINE_KEYS.SAVED_AT)
  if (!ts) return null
  return Math.floor((Date.now() - Number(ts)) / 60_000)
}

/** True when cached data is older than MAX_CACHE_AGE_MS (7 days). */
export function isOfflineCacheStale(): boolean {
  const ts = localStorage.getItem(OFFLINE_KEYS.SAVED_AT)
  if (!ts) return true
  return Date.now() - Number(ts) > MAX_CACHE_AGE_MS
}
