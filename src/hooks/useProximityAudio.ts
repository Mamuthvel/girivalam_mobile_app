import { useState, useEffect, useRef, useCallback } from 'react'
import { useAllLingaAudio } from './useSacredAudio'
import { useAudioPlayer } from '@/contexts/AudioPlayerContext'

// ─── Ashta Lingam positions (fixed sacred geography) ─────────────────────────
// linga_id 1–8 matches the mantra_audio table's linga_id column

export interface LingaPosition {
  lingaId: number
  name: string
  tamilName: string
  directionCode: string
  lat: number
  lng: number
}

export const LINGA_POSITIONS: LingaPosition[] = [
  { lingaId: 1, name: 'Indra Lingam',   tamilName: 'இந்திர லிங்கம்',    directionCode: 'E',  lat: 12.2294833, lng: 79.0703430 },
  { lingaId: 2, name: 'Agni Lingam',    tamilName: 'அக்னி லிங்கம்',     directionCode: 'SE', lat: 12.2240800, lng: 79.0594460 },
  { lingaId: 3, name: 'Yama Lingam',    tamilName: 'யம லிங்கம்',        directionCode: 'S',  lat: 12.2266677, lng: 79.0444047 },
  { lingaId: 4, name: 'Nirruti Lingam', tamilName: 'நிரிருதி லிங்கம்',  directionCode: 'SW', lat: 12.2347976, lng: 79.0326646 },
  { lingaId: 5, name: 'Varuna Lingam',  tamilName: 'வருண லிங்கம்',      directionCode: 'W',  lat: 12.2496359, lng: 79.0346876 },
  { lingaId: 6, name: 'Vayu Lingam',    tamilName: 'வாயு லிங்கம்',      directionCode: 'NW', lat: 12.2578550, lng: 79.0472411 },
  { lingaId: 7, name: 'Kubera Lingam',  tamilName: 'குபேர லிங்கம்',     directionCode: 'N',  lat: 12.2554576, lng: 79.0610551 },
  { lingaId: 8, name: 'Esanya Lingam',  tamilName: 'ஈசான்ய லிங்கம்',   directionCode: 'NE', lat: 12.2454258, lng: 79.0744848 },
]

const PROXIMITY_RADIUS_M = 150

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface ProximityAudioState {
  activeLinga: LingaPosition | null
  mantraName: string | null
  visible: boolean
  distanceMeters: number | null
}

export function useProximityAudio(
  userLocation: { lat: number; lng: number } | null,
  isActive: boolean,
  enabled: boolean,
) {
  const { data: lingaAudioMap } = useAllLingaAudio()
  const { playAudio, stopAudio, isPlaying } = useAudioPlayer()

  // Per-session set: don't auto-trigger the same lingam twice in one walk
  const triggeredIds = useRef<Set<number>>(new Set())

  const [state, setState] = useState<ProximityAudioState>({
    activeLinga: null,
    mantraName: null,
    visible: false,
    distanceMeters: null,
  })

  // Clear triggered set when a new journey starts
  useEffect(() => {
    if (isActive) {
      triggeredIds.current = new Set()
      setState({ activeLinga: null, mantraName: null, visible: false, distanceMeters: null })
    }
  }, [isActive])

  useEffect(() => {
    if (!userLocation || !isActive || !enabled) return

    for (const linga of LINGA_POSITIONS) {
      if (triggeredIds.current.has(linga.lingaId)) continue

      const dist = haversineMeters(userLocation.lat, userLocation.lng, linga.lat, linga.lng)
      if (dist > PROXIMITY_RADIUS_M) continue

      // Mark triggered so we don't repeat this session
      triggeredIds.current.add(linga.lingaId)

      const audio = lingaAudioMap?.[linga.lingaId] ?? null

      if (audio) {
        playAudio(audio.audio_url, `prx-linga-${linga.lingaId}`)
      }

      setState({
        activeLinga: linga,
        mantraName: audio?.mantra_name ?? null,
        visible: true,
        distanceMeters: Math.round(dist),
      })

      break // handle one temple at a time
    }
  }, [userLocation, isActive, enabled, lingaAudioMap, playAudio])

  const dismiss = useCallback(() => {
    setState(prev => ({ ...prev, visible: false }))
  }, [])

  const stop = useCallback(() => {
    stopAudio()
    setState({ activeLinga: null, mantraName: null, visible: false, distanceMeters: null })
  }, [stopAudio])

  return { ...state, dismiss, stop, isPlaying }
}
