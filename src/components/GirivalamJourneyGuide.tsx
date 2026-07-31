import React, { useState, useEffect, useCallback } from 'react';
import { saveOffline, loadOffline, OFFLINE_KEYS } from '@/utils/offlineStorage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  MapPin,
  Clock,
  Footprints,
  CheckCircle2,
  Circle,
  ChevronRight,
  RotateCcw,
  Trophy,
  Mountain,
  Timer,
  Route,
  Navigation,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TempleStop {
  id: number;
  name: string;
  tamilName: string;
  direction: string;       // full word, e.g. "East"
  directionCode: string;   // DB short code, e.g. "E"
  distanceFromPrevious: number;
  cumulativeDistance: number;
  estimatedTime: number;
  cumulativeTime: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  highlights: string[];
  description?: string;
  timings?: string;
  lat: number;
  lng: number;
}

// ─── Direction ordering for Girivalam path ───────────────────────────────────

const DIRECTION_ORDER = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'];

const DIRECTION_LABELS: Record<string, string> = {
  E: 'East', SE: 'Southeast', S: 'South', SW: 'Southwest',
  W: 'West', NW: 'Northwest', N: 'North', NE: 'Northeast',
};

// ─── Route-specific supplement (distances, times, Tamil names, difficulty) ───
// These are path-derived values that don't change with admin edits.

const ROUTE_SUPPLEMENT: Record<string, {
  tamilName: string;
  distanceFromPrevious: number;
  cumulativeDistance: number;
  estimatedTime: number;
  cumulativeTime: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  highlights: string[];
}> = {
  E:  { tamilName: 'இந்திர லிங்கம்', distanceFromPrevious: 0,   cumulativeDistance: 0,    estimatedTime: 0,  cumulativeTime: 0,   difficulty: 'easy',        highlights: ['Starting point', 'Best at sunrise', 'Prosperity blessings'] },
  SE: { tamilName: 'அக்னி லிங்கம்',  distanceFromPrevious: 1.8, cumulativeDistance: 1.8,  estimatedTime: 25, cumulativeTime: 25,  difficulty: 'easy',        highlights: ['Purification', 'Fire deity', 'Tuesday special'] },
  S:  { tamilName: 'யம லிங்கம்',     distanceFromPrevious: 1.7, cumulativeDistance: 3.5,  estimatedTime: 24, cumulativeTime: 49,  difficulty: 'moderate',    highlights: ['Longevity blessings', 'Ancestor prayers', 'Midday worship'] },
  SW: { tamilName: 'நிரிருதி லிங்கம்', distanceFromPrevious: 1.8, cumulativeDistance: 5.3, estimatedTime: 25, cumulativeTime: 74,  difficulty: 'moderate',    highlights: ['Protection', 'Remove negativity', 'Fear removal'] },
  W:  { tamilName: 'வருண லிங்கம்',   distanceFromPrevious: 1.9, cumulativeDistance: 7.2,  estimatedTime: 27, cumulativeTime: 101, difficulty: 'moderate',    highlights: ['Water deity', 'Purification', 'Evening prayers'] },
  NW: { tamilName: 'வாயு லிங்கம்',   distanceFromPrevious: 1.8, cumulativeDistance: 9.0,  estimatedTime: 25, cumulativeTime: 126, difficulty: 'challenging', highlights: ['Wind deity', 'Respiratory health', 'Voice blessings'] },
  N:  { tamilName: 'குபேர லிங்கம்',  distanceFromPrevious: 2.0, cumulativeDistance: 11.0, estimatedTime: 28, cumulativeTime: 154, difficulty: 'challenging', highlights: ['Wealth deity', 'Business success', 'Financial blessings'] },
  NE: { tamilName: 'ஈசான்ய லிங்கம்', distanceFromPrevious: 3.0, cumulativeDistance: 14.0, estimatedTime: 42, cumulativeTime: 196, difficulty: 'moderate',    highlights: ['Final temple', 'Spiritual enlightenment', 'Moksha blessings'] },
};

// ─── Fallback hardcoded stops (if DB unavailable) ────────────────────────────

const FALLBACK_STOPS: TempleStop[] = DIRECTION_ORDER.map((code, i) => {
  const s = ROUTE_SUPPLEMENT[code];
  const names: Record<string, string> = {
    E: 'Indra Lingam', SE: 'Agni Lingam', S: 'Yama Lingam', SW: 'Nirruti Lingam',
    W: 'Varuna Lingam', NW: 'Vayu Lingam', N: 'Kubera Lingam', NE: 'Esanya Lingam',
  };
  const coords: Record<string, [number, number]> = {
    E:  [12.2294833, 79.0703430], SE: [12.2240800, 79.0594460],
    S:  [12.2266677, 79.0444047], SW: [12.2347976, 79.0326646],
    W:  [12.2496359, 79.0346876], NW: [12.2578550, 79.0472411],
    N:  [12.2554576, 79.0610551], NE: [12.2454258, 79.0744848],
  };
  return {
    id: i + 1,
    name: names[code],
    tamilName: s.tamilName,
    direction: DIRECTION_LABELS[code],
    directionCode: code,
    ...s,
    lat: coords[code][0],
    lng: coords[code][1],
  };
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'girivalam_journey_progress';
const PROXIMITY_RADIUS_METERS = 100;

interface JourneyProgress {
  currentStopId: number;
  completedStops: number[];
  startedAt: string | null;
  isActive: boolean;
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Component ───────────────────────────────────────────────────────────────

interface GirivalamJourneyGuideProps {
  isActive?: boolean;
  userLocation?: { lat: number; lng: number } | null;
}

const GirivalamJourneyGuide: React.FC<GirivalamJourneyGuideProps> = ({
  isActive: externalIsActive,
  userLocation: externalUserLocation,
}) => {
  const [stops, setStops] = useState<TempleStop[]>(FALLBACK_STOPS);
  const [dbLoading, setDbLoading] = useState(true);

  const [progress, setProgress] = useState<JourneyProgress>({
    currentStopId: 1,
    completedStops: [],
    startedAt: null,
    isActive: false,
  });
  const [expandedStop, setExpandedStop] = useState<number | null>(null);

  const isControlled = externalIsActive !== undefined;
  const isJourneyActive = isControlled ? externalIsActive : progress.isActive;
  const userLocation = externalUserLocation || null;

  // ── Fetch real Ashta Lingam data from DB ──────────────────────────────────
  useEffect(() => {
    const fetchTemples = async () => {
      const buildStops = (data: { id: number; name: string; lat: number; lng: number; direction: string | null; description: string | null; timings: string | null }[]): TempleStop[] => {
        const sorted = [...data].sort(
          (a, b) =>
            DIRECTION_ORDER.indexOf(a.direction ?? '') -
            DIRECTION_ORDER.indexOf(b.direction ?? '')
        );
        return sorted.map((temple) => {
          const code = temple.direction ?? '';
          const supp = ROUTE_SUPPLEMENT[code] ?? ROUTE_SUPPLEMENT['E'];
          return {
            id: temple.id,
            name: toTitleCase(temple.name),
            tamilName: supp.tamilName,
            direction: DIRECTION_LABELS[code] ?? code,
            directionCode: code,
            distanceFromPrevious: supp.distanceFromPrevious,
            cumulativeDistance:   supp.cumulativeDistance,
            estimatedTime:        supp.estimatedTime,
            cumulativeTime:       supp.cumulativeTime,
            difficulty:           supp.difficulty,
            highlights: [...(temple.description ? [temple.description] : []), ...supp.highlights].slice(0, 4),
            description: temple.description ?? undefined,
            timings:     temple.timings ?? undefined,
            lat: temple.lat,
            lng: temple.lng,
          };
        });
      };

      try {
        // Offline: try local cache first
                if (!navigator.onLine) {
                  type OfflineTemple = {
                    id: number;
                    name: string;
                    lat: number;
                    lng: number;
                    direction: string | null;
                    description: string | null;
                    timings: string | null;
                  };
                  const cached = loadOffline<OfflineTemple[]>(OFFLINE_KEYS.ASHTA_LINGAM);
                  if (cached && cached.length >= 8) {
                    setStops(buildStops(cached));
                  }
                  return;
                }

        const { data, error } = await supabase
          .from('landmarks')
          .select('id, name, lat, lng, direction, description, timings')
          .eq('is_ashta_lingam', true)
          .eq('is_active', true);

        if (error || !data || data.length === 0) {
          // Try offline cache as fallback
          const cached = loadOffline<typeof data>(OFFLINE_KEYS.ASHTA_LINGAM);
          if (cached && cached.length >= 8) setStops(buildStops(cached as any));
          return;
        }

        const merged = buildStops(data as any);
        if (merged.length === 8) {
          setStops(merged);
          // Persist for offline use
          saveOffline(OFFLINE_KEYS.ASHTA_LINGAM, data);
        }
      } catch {
        // Network failure: try offline cache before falling back to hardcoded
        const cached = loadOffline<any[]>(OFFLINE_KEYS.ASHTA_LINGAM);
        if (cached && cached.length >= 8) setStops(buildStops(cached));
      } finally {
        setDbLoading(false);
      }
    };
    fetchTemples();
  }, []);

  // ── Load/save progress ────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setProgress(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    if (isControlled && externalIsActive !== progress.isActive) {
      setProgress(prev => ({
        ...prev,
        isActive: externalIsActive || false,
        startedAt: externalIsActive && !prev.startedAt ? new Date().toISOString() : prev.startedAt,
      }));
    }
  }, [isControlled, externalIsActive, progress.isActive]);

  // ── Auto-mark temples by proximity ────────────────────────────────────────
  const checkProximityAndMark = useCallback(
    (lat: number, lng: number) => {
      if (!isJourneyActive) return;
      stops.forEach((stop) => {
        if (progress.completedStops.includes(stop.id)) return;
        const dist = calculateDistance(lat, lng, stop.lat, stop.lng);
        if (dist <= PROXIMITY_RADIUS_METERS) {
          setProgress((prev) => {
            if (prev.completedStops.includes(stop.id)) return prev;
            toast.success(`📍 ${stop.name} visited!`, {
              description: `You're within ${Math.round(dist)}m of the temple`,
            });
            const newCompleted = [...prev.completedStops, stop.id];
            const next = stops.find((s) => !newCompleted.includes(s.id));
            return { ...prev, completedStops: newCompleted, currentStopId: next?.id || stop.id };
          });
        }
      });
    },
    [isJourneyActive, progress.completedStops, stops]
  );

  useEffect(() => {
    if (userLocation && isJourneyActive) {
      checkProximityAndMark(userLocation.lat, userLocation.lng);
    }
  }, [userLocation, isJourneyActive, checkProximityAndMark]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getDistanceToTemple = (stop: TempleStop) =>
    userLocation ? calculateDistance(userLocation.lat, userLocation.lng, stop.lat, stop.lng) : null;

  const formatDistanceMeters = (m: number) => m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h === 0 ? `${m} min` : `${h}h ${m}m`;
  };

  const getDifficultyColor = (d: TempleStop['difficulty']) => ({
    easy:       'bg-green-50 text-green-700 border-green-200',
    moderate:   'bg-amber-50 text-amber-700 border-amber-200',
    challenging:'bg-orange-50 text-orange-700 border-orange-200',
  }[d]);

  const completeStop = (stopId: number) => {
    setProgress((prev) => {
      const newCompleted = [...prev.completedStops, stopId];
      const next = stops.find((s) => !newCompleted.includes(s.id));
      return { ...prev, completedStops: newCompleted, currentStopId: next?.id || stopId };
    });
  };

  const resetJourney = () =>
    setProgress({ currentStopId: stops[0]?.id ?? 1, completedStops: [], startedAt: null, isActive: false });

  const completionPercentage = (progress.completedStops.length / stops.length) * 100;
  const isJourneyComplete   = progress.completedStops.length === stops.length && stops.length > 0;
  const totalKm  = stops[stops.length - 1]?.cumulativeDistance ?? 14;
  const totalMin = stops[stops.length - 1]?.cumulativeTime ?? 196;

  return (
    <div className="space-y-6">
      {/* Journey Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl p-6 border border-primary/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-playfair text-xl font-semibold flex items-center gap-2">
              <Route className="h-5 w-5 text-primary" />
              Girivalam Journey Guide
              {dbLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {totalKm} km sacred path • {stops.length} Ashta Lingam temples
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            {isJourneyActive ? (
              <Badge className="bg-green-500/10 text-green-600 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                Journey Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-muted-foreground">
                <Circle className="h-3 w-3 mr-2" />
                Not Started
              </Badge>
            )}
            {progress.completedStops.length > 0 && !isJourneyActive && (
              <Button variant="ghost" size="sm" onClick={resetJourney} className="gap-1 text-xs">
                <RotateCcw className="h-3 w-3" />
                Reset Progress
              </Button>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {progress.completedStops.length} of {stops.length} temples visited
            </span>
            <span className="font-medium text-primary">{Math.round(completionPercentage)}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <Footprints className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold">{totalKm} km</p>
            <p className="text-xs text-muted-foreground">Total Distance</p>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <Timer className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold">{formatTime(totalMin)}</p>
            <p className="text-xs text-muted-foreground">Est. Time</p>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <Mountain className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold">Moderate</p>
            <p className="text-xs text-muted-foreground">Difficulty</p>
          </div>
        </div>

        {/* GPS status */}
        {isJourneyActive && (
          <div className="flex items-center justify-center gap-2 p-3 bg-background/50 rounded-lg mt-4">
            <div className={cn('w-2 h-2 rounded-full', userLocation ? 'bg-green-500 animate-pulse' : 'bg-yellow-500')} />
            <p className="text-sm text-muted-foreground">
              {userLocation ? 'GPS active • Temples are marked automatically when nearby' : 'Waiting for GPS signal…'}
            </p>
          </div>
        )}
      </div>

      {/* Complete banner */}
      {isJourneyComplete && (
        <div className="bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-500/30 text-center">
          <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
          <h3 className="font-playfair text-xl font-semibold mb-2">🎉 Girivalam Complete!</h3>
          <p className="text-muted-foreground">
            Congratulations! You have completed the sacred {totalKm} km circumambulation of Arunachala.
          </p>
          <p className="text-sm text-primary mt-2 font-medium">ॐ नमः शिवाय • Om Namah Shivaya</p>
        </div>
      )}

      {/* Temple stops */}
      <div className="relative">
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20" />

        <div className="space-y-1">
          {stops.map((stop, index) => {
            const isCompleted = progress.completedStops.includes(stop.id);
            const isCurrent   = progress.currentStopId === stop.id && isJourneyActive;
            const isExpanded  = expandedStop === stop.id;

            return (
              <div key={stop.id} className="relative">
                {/* Inter-stop distance */}
                {index > 0 && (
                  <div className="ml-12 py-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <ChevronRight className="h-3 w-3" />
                    <span>{stop.distanceFromPrevious} km</span>
                    <span>•</span>
                    <span>~{stop.estimatedTime} min</span>
                  </div>
                )}

                {/* Stop card */}
                <div
                  onClick={() => setExpandedStop(isExpanded ? null : stop.id)}
                  className={cn(
                    'relative flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all',
                    isCompleted && 'bg-green-500/5 border border-green-500/20',
                    isCurrent  && 'bg-primary/10 border border-primary/30 shadow-md',
                    !isCompleted && !isCurrent && 'bg-muted/30 hover:bg-muted/50'
                  )}
                >
                  {/* Status icon */}
                  <div className={cn(
                    'relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
                    isCompleted && 'bg-green-500 text-white',
                    isCurrent  && 'bg-primary text-primary-foreground animate-pulse',
                    !isCompleted && !isCurrent && 'bg-muted border-2 border-border'
                  )}>
                    {isCompleted ? <CheckCircle2 className="h-6 w-6" /> :
                     isCurrent  ? <MapPin className="h-6 w-6" /> :
                                  <Circle className="h-6 w-6 text-muted-foreground" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 flex-wrap">
                          {stop.name}
                          <Badge variant="outline" className="text-xs font-normal">
                            {stop.direction}
                          </Badge>
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          <p className="text-sm text-muted-foreground">{stop.tamilName}</p>

                          {/* Live distance badge */}
                          {userLocation && isJourneyActive && !isCompleted && (() => {
                            const dist = getDistanceToTemple(stop);
                            if (dist === null) return null;
                            const nearby = dist <= PROXIMITY_RADIUS_METERS;
                            return (
                              <Badge
                                variant={nearby ? 'default' : 'secondary'}
                                className={cn('text-xs', nearby && 'bg-green-500 text-white animate-pulse')}
                              >
                                <Navigation className="h-3 w-3 mr-1" />
                                {formatDistanceMeters(dist)}
                              </Badge>
                            );
                          })()}
                        </div>
                      </div>
                      <Badge className={cn('text-xs flex-shrink-0', getDifficultyColor(stop.difficulty))}>
                        {stop.difficulty}
                      </Badge>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-3 space-y-3 animate-in slide-in-from-top-2">
                        {/* Route stats */}
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Route className="h-4 w-4" />
                            {stop.cumulativeDistance} km from start
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {formatTime(stop.cumulativeTime)} total
                          </span>
                          {stop.timings && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Timer className="h-4 w-4" />
                              {stop.timings}
                            </span>
                          )}
                        </div>

                        {/* Highlights / description */}
                        <div className="flex flex-wrap gap-2">
                          {stop.highlights.map((h, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {h}
                            </Badge>
                          ))}
                        </div>

                        {/* Manual mark button */}
                        {isCurrent && !isCompleted && (
                          <Button
                            size="sm"
                            className="mt-2"
                            onClick={(e) => { e.stopPropagation(); completeStop(stop.id); }}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Mark as Visited
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Title-case helper (converts "NIRUTHI LINGAM" → "Niruthi Lingam")
function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default GirivalamJourneyGuide;
