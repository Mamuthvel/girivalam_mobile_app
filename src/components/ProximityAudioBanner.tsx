import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Volume2, VolumeX, X, Music2 } from 'lucide-react'
import type { LingaPosition } from '@/hooks/useProximityAudio'

interface ProximityAudioBannerProps {
  visible: boolean
  activeLinga: LingaPosition | null
  mantraName: string | null
  isPlaying: boolean
  distanceMeters: number | null
  onDismiss: () => void
  onStop: () => void
}

const ProximityAudioBanner: React.FC<ProximityAudioBannerProps> = ({
  visible,
  activeLinga,
  mantraName,
  isPlaying,
  distanceMeters,
  onDismiss,
  onStop,
}) => {
  if (!activeLinga) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          className="fixed bottom-4 left-3 right-3 z-[2000] max-w-sm mx-auto pointer-events-none"
        >
          <div className="pointer-events-auto bg-gradient-to-br from-amber-950/95 via-orange-900/95 to-amber-900/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-amber-700/40 text-white">
            <div className="flex items-center gap-3">
              {/* Om / temple icon */}
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl">
                  🕉️
                </div>
                {/* Pulsing ring when audio is playing */}
                {isPlaying && mantraName && (
                  <span className="absolute inset-0 rounded-full border-2 border-amber-400 animate-ping opacity-60" />
                )}
              </div>

              {/* Temple info */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-amber-300/80 font-medium uppercase tracking-wide">
                  You are near
                </p>
                <p className="font-semibold text-sm leading-tight truncate">
                  {activeLinga.name}
                </p>
                <p className="text-xs text-amber-300/70 truncate leading-tight">
                  {activeLinga.tamilName}
                </p>
                {mantraName ? (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Music2 className="h-3 w-3 text-amber-400 flex-shrink-0" />
                    <p className="text-[11px] text-amber-300 truncate">
                      {isPlaying ? `Playing: ${mantraName}` : mantraName}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-400/60 mt-0.5">
                    No audio available for this temple
                  </p>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                {mantraName && (
                  <button
                    onClick={onStop}
                    title="Stop audio"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center"
                  >
                    <VolumeX className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={onDismiss}
                  title="Dismiss"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Distance + audio status bar */}
            <div className="mt-3 pt-2.5 border-t border-amber-700/30 flex items-center justify-between">
              <span className="text-[11px] text-amber-400/70">
                {distanceMeters !== null ? `${distanceMeters}m from temple` : ''}
              </span>
              {isPlaying && mantraName && (
                <div className="flex items-center gap-1.5">
                  <Volume2 className="h-3 w-3 text-amber-400" />
                  {/* Mini waveform bars */}
                  <div className="flex items-end gap-0.5 h-3">
                    {[3, 5, 4, 6, 3].map((h, i) => (
                      <div
                        key={i}
                        className="w-0.5 bg-amber-400 rounded-full animate-pulse"
                        style={{
                          height: `${h * 2}px`,
                          animationDelay: `${i * 80}ms`,
                          animationDuration: '600ms',
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-amber-400">Playing</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ProximityAudioBanner
