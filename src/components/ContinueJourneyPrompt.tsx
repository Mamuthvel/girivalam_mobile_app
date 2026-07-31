import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, MapPin, Clock, Footprints, Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SpiritualCard } from '@/components/SpiritualCard';
import type { GirivalamSessionState } from '@/hooks/useGirivalamPersistence';

interface ContinueJourneyPromptProps {
  savedState: GirivalamSessionState;
  onContinue: () => void;
  onStartNew: () => void;
}

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return date.toLocaleDateString();
};

export const ContinueJourneyPrompt: React.FC<ContinueJourneyPromptProps> = ({
  savedState,
  onContinue,
  onStartNew,
}) => {
  const progressPercent = Math.round(savedState.girivalamProgress);
  const distanceKm = savedState.girivalamDistanceCovered.toFixed(1);
  const modeLabel = savedState.mode === 'group' ? '👥 Group' : '🧍 Solo';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md"
        >
          <SpiritualCard className="p-6 border-2 border-primary/30 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Mountain className="h-10 w-10 text-primary" />
              </div>
              <h2 className="font-playfair text-2xl font-bold mb-2">
                Welcome Back, Pilgrim
              </h2>
              <p className="text-muted-foreground">
                You have an unfinished sacred journey
              </p>
            </div>

            {/* Session Stats */}
            <div className="bg-muted/50 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Mode</span>
                <span className="font-medium">{modeLabel}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> Progress
                </span>
                <span className="font-medium text-primary">{progressPercent}%</span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Footprints className="h-4 w-4" /> Distance
                </span>
                <span className="font-medium">{distanceKm} km / 14 km</span>
              </div>
              
              {savedState.timeElapsed > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> Time
                  </span>
                  <span className="font-medium">{formatDuration(savedState.timeElapsed)}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-xs text-muted-foreground">Last active</span>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(savedState.lastUpdated)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                onClick={onContinue}
                className="w-full h-12 text-lg font-semibold gap-2"
                size="lg"
              >
                <Play className="h-5 w-5" />
                Continue Journey
              </Button>
              
              <Button 
                onClick={onStartNew}
                variant="outline"
                className="w-full gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Start Fresh Journey
              </Button>
            </div>

            {/* Spiritual note */}
            <p className="text-center text-xs text-muted-foreground mt-4 italic">
              "Every step around Arunachala is a step towards the Self"
            </p>
          </SpiritualCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContinueJourneyPrompt;
