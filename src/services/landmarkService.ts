import { supabase } from "@/integrations/supabase/client"
import type { Landmark } from "@/data/landmarks"
import type { Tables } from "@/integrations/supabase/types"
import { saveOffline, loadOffline, OFFLINE_KEYS } from "@/utils/offlineStorage"
import { logger } from "@/lib/logger";

type LandmarkRow = Tables<'landmarks'>

const mapDbToLandmark = (row: LandmarkRow): Landmark => ({
  id: row.id,
  name: row.name,
  lat: row.lat,
  lng: row.lng,
  direction: (row.direction ?? undefined) as Landmark['direction'],
  type: row.type as Landmark['type'],
  description: row.description ?? undefined,
  timings: row.timings ?? undefined,
  facilities: row.facilities ?? undefined,
  animationType: row.animation_type as Landmark['animationType'],
  isAshtaLingam: row.is_ashta_lingam ?? false,
  enableGlow: row.enable_glow ?? true,
  enableAuraPulse: row.enable_aura_pulse ?? true,
  enableSnakeAnimation: row.enable_snake_animation ?? false,
  premiumGlow: row.premium_glow ?? false,
  glowColor: row.glow_color ?? '#FFDFA3',
  auraColor: row.aura_color ?? '#FFF2CC',
  iconSize: (row.icon_size ?? 'medium') as Landmark['iconSize'],
  imageUrl: (row as any).image_url ?? undefined,
})

export const fetchAllLandmarks = async (): Promise<Landmark[]> => {
  // Offline-first: if no network, serve from cache immediately
  if (!navigator.onLine) {
    const cached = loadOffline<Landmark[]>(OFFLINE_KEYS.LANDMARKS)
    if (cached && cached.length > 0) return cached
    return []
  }

  try {
    const { data, error } = await supabase
      .from('landmarks')
      .select('*')
      .eq('is_active', true)

    if (error) throw error

    const landmarks = (data ?? []).map(mapDbToLandmark)

    // Persist for offline use
    if (landmarks.length > 0) {
      saveOffline(OFFLINE_KEYS.LANDMARKS, landmarks)
    }

    return landmarks
  } catch (err) {
    logger.error('Failed to fetch landmarks — trying offline cache', err)
    const cached = loadOffline<Landmark[]>(OFFLINE_KEYS.LANDMARKS)
    if (cached && cached.length > 0) return cached
    throw err
  }
}

export const fetchLandmarksByType = async (
  type: Landmark['type']
): Promise<Landmark[]> => {
  if (!navigator.onLine) {
    const cached = loadOffline<Landmark[]>(OFFLINE_KEYS.LANDMARKS)
    return (cached ?? []).filter(l => l.type === type)
  }

  const { data, error } = await supabase
    .from('landmarks')
    .select('*')
    .eq('type', type)
    .eq('is_active', true)

  if (error) throw error
  return (data ?? []).map(mapDbToLandmark)
}
