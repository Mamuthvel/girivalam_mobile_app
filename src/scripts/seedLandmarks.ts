import { supabase } from '@/integrations/supabase/client'
import { allLandmarks, ashtalingamTemples } from '@/data/landmarks'

const ASHTA_IDS = new Set(ashtalingamTemples.map(t => t.id))

export interface SeedResult {
  inserted: number
  skipped: number
}

export async function seedLandmarks(): Promise<SeedResult> {
  // 1. Fetch existing names to stay idempotent (never duplicate)
  const { data: existing, error: fetchErr } = await supabase
    .from('landmarks')
    .select('name')

  if (fetchErr) throw fetchErr

  const existingNames = new Set(
    (existing ?? []).map(l => l.name.toLowerCase().trim())
  )

  // 2. Only insert landmarks missing from DB
  const toInsert = allLandmarks.filter(
    l => !existingNames.has(l.name.toLowerCase().trim())
  )

  if (toInsert.length === 0) {
    return { inserted: 0, skipped: allLandmarks.length }
  }

  // 3. Build full insert records
  const records = toInsert.map(l => {
    const isAshta = ASHTA_IDS.has(l.id)
    return {
      name:                   l.name,
      lat:                    l.lat,
      lng:                    l.lng,
      type:                   l.type,
      direction:              l.direction ?? null,
      description:            l.description ?? null,
      timings:                l.timings ?? null,
      facilities:             l.facilities ?? null,
      animation_type:         l.animationType,
      is_active:              true,
      is_ashta_lingam:        isAshta,
      enable_glow:            isAshta,
      enable_aura_pulse:      isAshta,
      enable_snake_animation: false,
      premium_glow:           false,
      glow_color:             isAshta ? '#FFDFA3' : null,
      aura_color:             isAshta ? '#FFF2CC' : null,
      icon_size:              'medium',
    }
  })

  const { error: insertErr } = await supabase
    .from('landmarks')
    .insert(records as any)

  if (insertErr) throw insertErr

  return { inserted: toInsert.length, skipped: allLandmarks.length - toInsert.length }
}
