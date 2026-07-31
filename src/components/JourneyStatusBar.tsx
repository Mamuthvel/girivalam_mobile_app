import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  ChevronDown, 
  ChevronUp, 
  Footprints, 
  Clock, 
  Zap,
  AlertTriangle,
  Users
} from 'lucide-react';

interface JourneyStatusBarProps {
  // Core tracking data
  isTracking: boolean;
  isActive: boolean;
  gpsAccuracy: number | null;
  distance: number;
  progress: number;
  
  // Expanded view data
  timeElapsed: number;
  stepCount: number;
  speed?: number;
  
  // Path status
  onPath: boolean;
  
  // Group mode (optional)
  isGroupMode?: boolean;
  groupMemberCount?: number;
  
  className?: string;
}

export const JourneyStatusBar: React.FC<JourneyStatusBarProps> = ({
  isTracking,
  isActive,
  gpsAccuracy,
  distance,
  progress,
  timeElapsed,
  stepCount,
  speed,
  onPath,
  isGroupMode = false,
  groupMemberCount = 0,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format time as HH:MM:SS or MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate calories (rough estimation)
  const estimatedCalories = Math.round(stepCount * 0.04);

  // Calculate speed from distance and time if not provided
  const avgSpeed = speed ?? (timeElapsed > 0 ? (distance / (timeElapsed / 3600)).toFixed(1) : '0.0');

  // GPS status color
  const getGpsColor = () => {
    if (gpsAccuracy === null) return 'text-muted-foreground';
    if (gpsAccuracy <= 10) return 'text-green-500';
    if (gpsAccuracy <= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getGpsBg = () => {
    if (gpsAccuracy === null) return 'bg-muted';
    if (gpsAccuracy <= 10) return 'bg-green-500/10';
    if (gpsAccuracy <= 50) return 'bg-yellow-500/10';
    return 'bg-red-500/10';
  };

  if (!isActive) return null;

  return (
    <div 
      className={cn(
        "sticky top-20 z-40 mx-auto w-full max-w-lg",
        className
      )}
    >
      <motion.div
        layout
        className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg overflow-hidden"
      >
        {/* Collapsed View - Icon Based */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between touch-manipulation active:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3 flex-wrap">
            {/* Journey Active Indicator */}
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "w-2.5 h-2.5 rounded-full",
                isTracking ? "bg-green-500 animate-pulse" : "bg-yellow-500"
              )} />
              <span className="text-xs font-medium text-green-600">
                {isTracking ? 'Active' : 'Paused'}
              </span>
            </div>

            {/* GPS Status */}
            <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-xs", getGpsBg(), getGpsColor())}>
              <span>📡</span>
              <span className="font-medium">
                {gpsAccuracy !== null ? `${Math.round(gpsAccuracy)}m` : '--'}
              </span>
            </div>

            {/* Live Tracking Badge */}
            {isTracking && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                <span>🚶</span>
                <span className="font-medium">Live</span>
              </div>
            )}

            {/* Group Indicator (only in group mode) */}
            {isGroupMode && groupMemberCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs">
                <Users className="h-3 w-3" />
                <span className="font-medium">{groupMemberCount}</span>
              </div>
            )}
          </div>

          {/* Distance & Progress - Always visible */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-xs">📏</span>
                <span className="text-sm font-semibold text-foreground">{distance.toFixed(2)} km</span>
              </div>
              <div className="flex items-center gap-1 justify-end">
                <span className="text-[10px]">📊</span>
                <span className="text-xs text-primary font-medium">{progress.toFixed(1)}%</span>
              </div>
            </div>
            
            {/* Expand/Collapse indicator */}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Expanded View */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-2 border-t border-border/50">
                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {/* Time Elapsed */}
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <Clock className="h-4 w-4 text-sky-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-sky-500">{formatTime(timeElapsed)}</p>
                    <p className="text-[10px] text-muted-foreground">Time</p>
                  </div>

                  {/* Speed */}
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <Zap className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-purple-500">{avgSpeed}</p>
                    <p className="text-[10px] text-muted-foreground">km/h</p>
                  </div>

                  {/* Steps */}
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <Footprints className="h-4 w-4 text-primary mx-auto mb-1" />
                    <p className="text-sm font-bold text-primary">{stepCount.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">Steps</p>
                  </div>

                  {/* Calories */}
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <span className="text-orange-500 text-sm">🔥</span>
                    <p className="text-sm font-bold text-orange-500">{estimatedCalories}</p>
                    <p className="text-[10px] text-muted-foreground">Cal</p>
                  </div>
                </div>

                {/* Path Status / Geo-fence Warning */}
                <div className={cn(
                  "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium",
                  onPath 
                    ? "bg-green-500/10 text-green-600" 
                    : "bg-orange-500/10 text-orange-600"
                )}>
                  {onPath ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span>✅ On the Girivalam path</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>⚠️ Off the sacred path</span>
                    </>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Girivalam Progress</span>
                    <span>{distance.toFixed(2)} / 14 km</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <motion.div 
                      className="bg-gradient-to-r from-primary via-primary to-accent h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default JourneyStatusBar;
