import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SpiritualCard } from "@/components/SpiritualCard";
import { Sparkles, Users, Footprints, Play, Pause } from "lucide-react";
import type { SOLO_CONTENT } from "@/pages/map-tracker/constants";

type ModeContent = typeof SOLO_CONTENT;

interface JourneyControlCardProps {
  girivalamMode: string;
  modeContent: ModeContent;
  isTracking: boolean;
  girivalamProgress: number;
  girivalamDistanceCovered: number;
  startGirivalam: () => void;
  handleStopTouchStart: () => void;
  handleStopTouchEnd: () => void;
  isLongPressing: boolean;
  longPressProgress: number;
}

/**
 * Mode-specific header + the unified Start/Stop Girivalam control card.
 * Purely presentational — all state and handlers are owned by MapTracker.
 */
const JourneyControlCard = ({
  girivalamMode,
  modeContent,
  isTracking,
  girivalamProgress,
  girivalamDistanceCovered,
  startGirivalam,
  handleStopTouchStart,
  handleStopTouchEnd,
  isLongPressing,
  longPressProgress,
}: JourneyControlCardProps) => (
  <>
    {/* Mode-Specific Header */}
    <div className="text-center mb-6">
      <Badge variant="outline" className={`mb-3 ${girivalamMode === 'group' ? 'bg-secondary/10 border-secondary/30' : 'bg-primary/10 border-primary/30'}`}>
        <Sparkles className="h-3 w-3 mr-1" />
        {girivalamMode === 'group' ? 'Group Mode' : 'Solo Mode'}
      </Badge>
      <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center gap-2">
        {girivalamMode === 'group' ? <Users className="h-8 w-8 text-secondary" /> : <Footprints className="h-8 w-8 text-primary" />}
        {modeContent.headerTitle}
      </h1>
      <p className="text-muted-foreground italic">{modeContent.headerQuote}</p>
    </div>

    {/* ========== UNIFIED START/STOP GIRIVALAM BUTTON ========== */}
    <div className="mb-6">
      <SpiritualCard className="bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border-primary/20">
        <div className="flex flex-col items-center justify-center gap-4 py-4">
          {!isTracking ? (
            <>
              <div className="text-center">
                <h3 className="font-playfair text-xl font-semibold mb-1">Begin Your Sacred Journey</h3>
                <p className="text-sm text-muted-foreground">
                  One tap to start GPS tracking & activate the Journey Guide
                </p>
              </div>
              <Button
                onClick={startGirivalam}
                className={`${girivalamMode === 'group' ? 'bg-secondary hover:bg-secondary/90' : 'bg-primary hover:bg-primary/90'} min-w-[280px] h-14 text-lg shadow-lg`}
                size="lg"
              >
                <Play className="mr-2 h-6 w-6" />
                Start Girivalam
              </Button>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 font-medium">Journey Active</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {girivalamProgress.toFixed(1)}% complete • {girivalamDistanceCovered.toFixed(2)} km covered
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Button
                  onMouseDown={handleStopTouchStart}
                  onMouseUp={handleStopTouchEnd}
                  onMouseLeave={handleStopTouchEnd}
                  onTouchStart={handleStopTouchStart}
                  onTouchEnd={handleStopTouchEnd}
                  onTouchCancel={handleStopTouchEnd}
                  className="relative bg-destructive hover:bg-destructive/90 min-w-[280px] h-14 text-lg overflow-hidden"
                  size="lg"
                >
                  {/* Long press progress overlay */}
                  {isLongPressing && (
                    <div
                      className="absolute inset-0 bg-red-800/50 transition-all duration-100"
                      style={{ width: `${longPressProgress}%` }}
                    />
                  )}
                  <span className="relative z-10 flex items-center">
                    <Pause className="mr-2 h-6 w-6" />
                    {modeContent.stopButton}
                  </span>
                </Button>
                <p className="text-xs text-muted-foreground text-center">Long press to stop your journey</p>
              </div>
            </>
          )}
        </div>
      </SpiritualCard>
    </div>
  </>
);

export default JourneyControlCard;
