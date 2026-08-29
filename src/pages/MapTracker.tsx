import { Helmet } from "react-helmet-async";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SpiritualCard } from "@/components/SpiritualCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Map from "@/components/Map";
import JourneyStatusBar from "@/components/JourneyStatusBar";
import GroupManagement from "@/components/GroupManagement";
import LiveGroupMap from "@/components/LiveGroupMap";
import { LocationPermissionBanner } from "@/components/LocationPermissionBanner";
import GirivalamJourneyGuide from "@/components/GirivalamJourneyGuide";
import ContinueJourneyPrompt from "@/components/ContinueJourneyPrompt";
import InviteLinkButton from "@/components/InviteLinkButton";
import ProximityAudioBanner from "@/components/ProximityAudioBanner";
import { useGirivalamPersistence } from "@/hooks/useGirivalamPersistence";
import { useSoloJourneySync } from "@/hooks/useSoloJourneySync";
import { useProximityAudio } from "@/hooks/useProximityAudio";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { fetchAllLandmarks } from "@/services/landmarkService"
import { JOURNEY_SETTINGS_KEY } from "@/pages/Settings";

import type { Landmark } from "@/data/landmarks"
import {
  isWithinGeofence,
  calculatePathProgress,
  TOTAL_GIRIVALAM_DISTANCE,
  GEOFENCE_BUFFER_METERS
} from "@/data/girivalam-path";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Navigation as NavigationIcon,
  MoreHorizontal,
  Phone,
  Droplets,
  Utensils,
  Home as Temple,
  RadioIcon,
  Compass,
  Car,
  Heart,
  LogOut,
  User,
  Footprints,
  Users,
  LogIn,
  Target,
  Home,
  Sparkles,
  Mountain,
  WifiOff,
  Map as MapIcon,
  ShieldCheck,
  Loader2,
  X,
} from "lucide-react";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MapFilterDropdown from "@/components/MapFilterDropdown";
import { logger } from "@/lib/logger";

// Constants, types, and pure helpers extracted from this file.
import {
  SOLO_CONTENT,
  GROUP_CONTENT,
  ALL_LANDMARK_TYPES,
  type Group,
} from "@/pages/map-tracker/constants";
import { calculateDistance } from "@/pages/map-tracker/utils";
import JourneyControlCard from "@/pages/map-tracker/JourneyControlCard";

const MapTracker = () => {
  // Core hooks - must be declared first
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Network status
  const { isOnline } = useNetworkStatus();

  // Proximity audio setting (read from Settings localStorage)
  const proximityAudioEnabled = useMemo(() => {
    try {
      const saved = localStorage.getItem(JOURNEY_SETTINGS_KEY);
      if (saved) return (JSON.parse(saved) as { proximityAudioEnabled?: boolean }).proximityAudioEnabled ?? true;
    } catch { /* ignore */ }
    return true;
  }, []);
  
  // Read mode from URL params
  const [searchParams] = useSearchParams();
  const urlMode = searchParams.get('mode') === 'group' ? 'group' : 'solo';
  
  // Journey persistence hook
  const {
    state: savedState,
    hasActiveSession,
    isRestoring,
    updateTrackingData,
    startJourney,
    resumeJourney,
    stopJourney: persistStopJourney,
    clearSession,
  } = useGirivalamPersistence();
  
  // Solo journey database sync hook
  const {
    startSoloJourney,
    updateSoloJourney,
    endSoloJourney,
    resumeSoloJourney,
  } = useSoloJourneySync();
  
  // Show continue prompt state
  const [showContinuePrompt, setShowContinuePrompt] = useState(false);
  const [sessionInitialized, setSessionInitialized] = useState(false);

  // Mode the user has chosen on the start screen (defaults to the URL's mode).
  // Editable before a journey starts so a fresh visitor can pick Solo or Group here.
  const [selectedMode, setSelectedMode] = useState<'solo' | 'group'>(urlMode);
  // Keep in sync when arriving via the selection page while no session is active.
  useEffect(() => {
    if (!savedState.isTracking) setSelectedMode(urlMode);
  }, [urlMode, savedState.isTracking]);

  // Use saved mode if resuming, otherwise the user's current selection.
  const girivalamMode = sessionInitialized && savedState.isTracking
    ? savedState.mode
    : selectedMode;
  const modeContent = useMemo(() => girivalamMode === 'group' ? GROUP_CONTENT : SOLO_CONTENT, [girivalamMode]);
  
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ lat: 12.2307, lng: 79.0628 });
  const [selectedLandmarkTypes, setSelectedLandmarkTypes] = useState<Landmark['type'][]>(ALL_LANDMARK_TYPES);
  const [visitedLandmarks, setVisitedLandmarks] = useState<number[]>([]);

  // Enhanced tracking state
  const [stepCount, setStepCount] = useState(0);
  const [distance, setDistance] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [lastLocation, setLastLocation] = useState<{ lat: number; lng: number } | null>(null);

  // GPS signal status
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [lastLocationUpdate, setLastLocationUpdate] = useState<Date | null>(null);
  const [locationRequestPending, setLocationRequestPending] = useState(false);
  // First-load "Locate me" primer — dismissed choice remembered so it doesn't nag.
  const [locationPrimerDismissed, setLocationPrimerDismissed] = useState(() => {
    try { return localStorage.getItem('girivalam_location_primer_dismissed') === '1'; } catch { return false; }
  });

  // Map control states
  const [centerOnUserTrigger, setCenterOnUserTrigger] = useState(0);
  const [mapFocusTypes, setMapFocusTypes] = useState<Landmark['type'][] | null>(null);

  // Group tracking state
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [activeDevotees, setActiveDevotees] = useState(0);
  const [devoteesList, setDevoteesList] = useState<any[]>([]);
  const [locationSharingEnabled, setLocationSharingEnabled] = useState(false);

  // Girivalam path tracking state
  const [onGirivalamPath, setOnGirivalamPath] = useState(false);
  const [girivalamProgress, setGirivalamProgress] = useState(0);
  const [girivalamDistanceCovered, setGirivalamDistanceCovered] = useState(0);
  const [userPathHistory, setUserPathHistory] = useState<{ lat: number; lng: number }[]>([]);
  const [hasStartedGirivalam, setHasStartedGirivalam] = useState(false);
  const [girivalamCompleted, setGirivalamCompleted] = useState(false);

  // Proximity audio — auto-plays temple mantra when within 150m of an Ashta Lingam
  const proximityAudio = useProximityAudio(
    isTracking ? currentLocation : null,
    isTracking,
    proximityAudioEnabled,
  );

  // Long-press state for stop button
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [longPressProgress, setLongPressProgress] = useState(0);
  const LONG_PRESS_DURATION = 1500; // 1.5 seconds to stop

  // Check for saved session on mount
  useEffect(() => {
    if (!isRestoring && hasActiveSession && !sessionInitialized) {
      setShowContinuePrompt(true);
    } else if (!isRestoring) {
      setSessionInitialized(true);
    }
  }, [isRestoring, hasActiveSession, sessionInitialized]);

  // Handle continue journey
  const handleContinueJourney = useCallback(async () => {
    // Restore all state from saved session
    setIsTracking(true);
    setCurrentLocation(savedState.currentLocation);
    setStepCount(savedState.stepCount);
    setDistance(savedState.distance);
    setTimeElapsed(savedState.timeElapsed);
    setGirivalamProgress(savedState.girivalamProgress);
    setGirivalamDistanceCovered(savedState.girivalamDistanceCovered);
    setUserPathHistory(savedState.userPathHistory);
    setOnGirivalamPath(savedState.onGirivalamPath);
    setHasStartedGirivalam(savedState.hasStartedGirivalam);
    setGirivalamCompleted(savedState.girivalamCompleted);
    
    if (savedState.startTime) {
      setStartTime(new Date(savedState.startTime));
    }
    
    resumeJourney();
    setShowContinuePrompt(false);
    setSessionInitialized(true);
    
    // Resume solo journey in database if it's a solo session
    if (savedState.mode === 'solo' && user) {
      await resumeSoloJourney(savedState.sessionId);
    }
    
    toast({
      title: "🕉️ Journey Resumed",
      description: "Welcome back, pilgrim. Your sacred walk continues.",
    });
  }, [savedState, resumeJourney, toast, user, resumeSoloJourney]);

  // Handle start new journey
  const handleStartNewJourney = useCallback(() => {
    clearSession();
    setShowContinuePrompt(false);
    setSessionInitialized(true);
  }, [clearSession]);

  // Persist tracking data periodically
  useEffect(() => {
    if (!isTracking || !sessionInitialized) return;
    
    updateTrackingData({
      currentLocation,
      stepCount,
      distance,
      timeElapsed,
      girivalamProgress,
      girivalamDistanceCovered,
      onGirivalamPath,
      girivalamCompleted,
    });
  }, [
    isTracking, 
    sessionInitialized,
    currentLocation, 
    stepCount, 
    distance, 
    timeElapsed, 
    girivalamProgress, 
    girivalamDistanceCovered, 
    onGirivalamPath, 
    girivalamCompleted,
    updateTrackingData
  ]);

  // Landmarks data
  const [allLandmarks, setAllLandmarks] = useState<Landmark[]>([])
  const [landmarksLoading, setLandmarksLoading] = useState(true)

  useEffect(() => {
    const loadLandmarks = async () => {
      try {
        const data = await fetchAllLandmarks()
        setAllLandmarks(data)
      } catch {
        toast({
          title: "Failed to load landmarks",
          variant: "destructive",
        })
      } finally {
        setLandmarksLoading(false)
      }
    }

    loadLandmarks()
  }, [])
  // Get actual Aṣṭa Lingam landmarks — memoized so GPS re-renders don't produce a new array
  const ashtaLingams = useMemo(
    () => allLandmarks.filter(l => l.isAshtaLingam === true),
    [allLandmarks]
  );
  
  // State for showing only Aṣṭa Lingas
  const [showOnlyAshtaLingas, setShowOnlyAshtaLingas] = useState(false);
  
  // Calculate nearest Aṣṭa Linga for enhanced glow
  const nearestAshtaLingam = useMemo(() => {
    if (ashtaLingams.length === 0) return null;
    
    let nearest: Landmark | null = null;
    let minDistance = Infinity;
    
    for (const linga of ashtaLingams) {
      const dist = Math.sqrt(
        Math.pow(linga.lat - currentLocation.lat, 2) + 
        Math.pow(linga.lng - currentLocation.lng, 2)
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearest = linga;
      }
    }
    
    return nearest;
  }, [ashtaLingams, currentLocation]);

  const getLandmarksByType = (type: Landmark['type']) =>
    allLandmarks.filter(l => l.type === type);
  
  // Filtered landmarks for map display
  const displayLandmarks = useMemo(() => {
    if (showOnlyAshtaLingas) return ashtaLingams;
    if (selectedLandmarkTypes.length === 0) return ashtaLingams;
    return allLandmarks.filter(l => selectedLandmarkTypes.includes(l.type));
  }, [showOnlyAshtaLingas, ashtaLingams, allLandmarks, selectedLandmarkTypes]);

  // Stable selectedTypes prop for <Map> — avoids passing a new [] literal every render
  // which would trigger a full marker rebuild on every GPS update.
  const EMPTY_TYPES = useMemo<Landmark['type'][]>(() => [], []);
  const mapSelectedTypes = useMemo(
    () => (showOnlyAshtaLingas ? EMPTY_TYPES : selectedLandmarkTypes),
    [showOnlyAshtaLingas, selectedLandmarkTypes, EMPTY_TYPES]
  );

  // Guests can use the live map + solo GPS tracking (stored locally). Only
  // account-only features (group walks, cross-device sync, history) require sign-in.

  // After a guest signs in from the "Save this journey" nudge, persist the
  // completed journey (held in localStorage) to their new account — one time.
  const journeyBackfilledRef = useRef(false);
  useEffect(() => {
    if (!user || journeyBackfilledRef.current) return;
    let pending = false;
    try { pending = sessionStorage.getItem('pendingJourneySave') === '1'; } catch { /* ignore */ }
    if (!pending) return;
    if (savedState.mode !== 'solo' || !savedState.girivalamCompleted) return;

    journeyBackfilledRef.current = true;
    try { sessionStorage.removeItem('pendingJourneySave'); } catch { /* ignore */ }

    (async () => {
      const id = await startSoloJourney(savedState.sessionId);
      if (!id) return;
      await endSoloJourney({
        distance_km: savedState.distance,
        steps_count: savedState.stepCount,
        time_elapsed_seconds: savedState.timeElapsed,
        girivalam_progress: savedState.girivalamProgress,
        girivalam_completed: true,
        path_history: savedState.userPathHistory,
      });
      toast({ title: 'Journey saved! 🙏', description: 'Your Girivalam is now in your history.' });
    })();
  }, [user, savedState, startSoloJourney, endSoloJourney, toast]);

  // Timer for elapsed time when tracking
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isTracking && startTime) {
      interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, startTime]);

  // Initialize location on component mount
  useEffect(() => {
    const initializeLocation = async () => {
      // Check location permission status
      if ('permissions' in navigator) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          setLocationPermissionStatus(result.state as 'granted' | 'denied' | 'prompt');

          result.addEventListener('change', () => {
            setLocationPermissionStatus(result.state as 'granted' | 'denied' | 'prompt');
          });
        } catch (error) {
          logger.log('Permissions API not supported');
        }
      }

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000
            });
          });

          const initialLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          setCurrentLocation(initialLocation);
          setLastLocation(initialLocation);
          setLastLocationUpdate(new Date());
          setLocationPermissionStatus('granted');
          logger.log("Initial location set:", initialLocation);
        } catch (error) {
          logger.log("Could not get initial location, using Arunachala default");
          setCurrentLocation({ lat: 12.2307, lng: 79.0628 });
          if ((error as GeolocationPositionError).code === 1) {
            setLocationPermissionStatus('denied');
          }
        }
      }
    };

    initializeLocation();
  }, []);

  // Track if device motion is working
  const [motionSensorActive, setMotionSensorActive] = useState(false);
  const lastDistanceRef = useRef(0);

  // Enhanced step counter using device motion with fallback
  useEffect(() => {
    if (!isTracking) return;

    let lastAcceleration = { x: 0, y: 0, z: 0 };
    let stepThreshold = 12; // Threshold for step detection
    let lastStepTime = 0;
    let stepBuffer: number[] = [];
    const minStepInterval = 300; // Minimum 300ms between steps
    const maxStepInterval = 2000; // Maximum 2s between steps for walking
    let motionEventReceived = false;

    const handleMotion = (event: DeviceMotionEvent) => {
      if (!motionEventReceived) {
        setMotionSensorActive(true);
        motionEventReceived = true;
        logger.log("Motion sensor active - step counting enabled");
      }

      if (event.accelerationIncludingGravity) {
        const { x = 0, y = 0, z = 0 } = event.accelerationIncludingGravity;
        const currentTime = Date.now();

        // Calculate change in acceleration (jerk)
        const deltaX = Math.abs(x - lastAcceleration.x);
        const deltaY = Math.abs(y - lastAcceleration.y);
        const deltaZ = Math.abs(z - lastAcceleration.z);

        const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);

        // Add to buffer for smoothing
        stepBuffer.push(magnitude);
        if (stepBuffer.length > 10) stepBuffer.shift();

        // Calculate average to smooth out noise
        const avgMagnitude = stepBuffer.reduce((a, b) => a + b, 0) / stepBuffer.length;

        // Detect step with improved logic
        if (avgMagnitude > stepThreshold &&
          currentTime - lastStepTime > minStepInterval &&
          currentTime - lastStepTime < maxStepInterval) {

          setStepCount(prev => prev + 1);
          lastStepTime = currentTime;
          logger.log("Step detected, magnitude:", avgMagnitude.toFixed(2));
        }

        lastAcceleration = { x, y, z };
      }
    };

    const requestMotionPermission = async () => {
      if (typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
        try {
          const response = await (DeviceMotionEvent as any).requestPermission();
          if (response === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
            logger.log("Motion permission granted, step counter active");
          } else {
            logger.log("Motion permission denied - using distance-based estimation");
          }
        } catch (error) {
          logger.error("Error requesting motion permission:", error);
        }
      } else {
        window.addEventListener('devicemotion', handleMotion);
        logger.log("Motion events available without permission");
      }
    };

    requestMotionPermission();

    // Check after 3 seconds if motion sensor is working
    const fallbackTimer = setTimeout(() => {
      if (!motionEventReceived) {
        logger.log("Motion sensor not available - using distance-based step estimation");
        setMotionSensorActive(false);
      }
    }, 3000);

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      clearTimeout(fallbackTimer);
    };
  }, [isTracking]);

  // Fallback: Estimate steps from distance when motion sensor is not available
  useEffect(() => {
    if (!isTracking || motionSensorActive) return;

    // Average stride length ~0.75 meters, so ~1333 steps per km
    const STEPS_PER_KM = 1333;
    const distanceIncrement = distance - lastDistanceRef.current;
    
    if (distanceIncrement > 0.001) { // Only update if moved at least 1 meter
      const estimatedSteps = Math.round(distanceIncrement * STEPS_PER_KM);
      if (estimatedSteps > 0) {
        setStepCount(prev => prev + estimatedSteps);
        logger.log("Estimated steps from distance:", estimatedSteps, "Total:", stepCount + estimatedSteps);
      }
      lastDistanceRef.current = distance;
    }
  }, [isTracking, motionSensorActive, distance]);

  // Group tracking with Supabase realtime
  useEffect(() => {
    if (!user || !currentGroup || !isTracking) return;

    const channel = supabase.channel(`group_${currentGroup.id}_tracking`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const devotees = Object.values(presenceState).flat();
        setActiveDevotees(devotees.length);
        setDevoteesList(devotees);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        logger.log('Devotee joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        logger.log('Devotee left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            email: user.email,
            online_at: new Date().toISOString(),
            location: currentLocation,
            step_count: stepCount,
            distance_km: distance
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentGroup, isTracking, currentLocation, stepCount, distance]);

  // GPS location tracking with distance calculation
  useEffect(() => {
    if (!isTracking || !navigator.geolocation) return;

    let watchId: number;
    let lastKnownLocation: { lat: number; lng: number } | null = null;
    let locationUpdateCount = 0;

    const MIN_ACCURACY = 50; // meters - only accept locations with accuracy better than 50m
    const MIN_DISTANCE_FOR_UPDATE = 5; // meters - minimum distance to trigger an update
    const MAX_LOCATION_AGE = 10000; // 10 seconds

    const processLocationUpdate = (position: GeolocationPosition) => {
      const accuracy = position.coords.accuracy;
      const timestamp = position.timestamp;
      const age = Date.now() - timestamp;

      // Skip if location is too old or inaccurate
      if (age > MAX_LOCATION_AGE) {
        logger.log("Skipping old location data, age:", age, "ms");
        return;
      }

      if (accuracy > MIN_ACCURACY) {
        logger.log("Skipping inaccurate location, accuracy:", accuracy, "meters");
        return;
      }

      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      logger.log("High-quality location received:", newLocation, "Accuracy:", accuracy, "meters");

      // Check if we've moved enough to warrant an update
      if (lastKnownLocation) {
        const distanceFromLast = calculateDistance(
          lastKnownLocation.lat, lastKnownLocation.lng,
          newLocation.lat, newLocation.lng
        ) * 1000; // convert to meters

        if (distanceFromLast < MIN_DISTANCE_FOR_UPDATE) {
          logger.log("Movement too small, distance:", distanceFromLast, "meters");
          return;
        }

        // Calculate distance increment in kilometers
        const distanceIncrement = distanceFromLast / 1000;
        setDistance(prev => prev + distanceIncrement);

        logger.log("Distance increment:", distanceIncrement, "km");
      }

      // Update locations and GPS status
      setCurrentLocation(newLocation);
      setLastLocation(newLocation);
      setGpsAccuracy(accuracy);
      setLastLocationUpdate(new Date());
      lastKnownLocation = newLocation;
      checkNearbyLandmarks(newLocation);
      checkGirivalamPath(newLocation);

      locationUpdateCount++;

      // Show toast only occasionally to avoid spam
      if (locationUpdateCount % 5 === 1) {
        toast({
          title: "Location Updated! 📍",
          description: `Accuracy: ${Math.round(accuracy)}m`,
        });
      }
    };

    const handleLocationError = (error: GeolocationPositionError) => {
      logger.error("Location error:", error);
      let errorMessage = "Unable to get your location.";

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location access denied. Please enable location permissions in your browser.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information unavailable. Check your GPS signal.";
          break;
        case error.TIMEOUT:
          errorMessage = "Location request timed out. Trying again...";
          break;
      }

      toast({
        title: "Location Error",
        description: errorMessage,
        variant: "destructive",
      });

      // Fallback to Arunachala location if GPS fails
      if (error.code === error.PERMISSION_DENIED) {
        setCurrentLocation({ lat: 12.2307, lng: 79.0628 });
      }
    };

    const startLocationTracking = async () => {
      try {
        // Check if geolocation is supported and permissions
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        logger.log("Geolocation permission status:", permissionStatus.state);
        setLocationPermissionStatus(permissionStatus.state as any);

        if (permissionStatus.state === 'denied') {
          handleLocationError({
            code: 1,
            message: "Permission denied"
          } as GeolocationPositionError);
          return;
        }

        // Start watching position with optimized settings
        watchId = navigator.geolocation.watchPosition(
          processLocationUpdate,
          handleLocationError,
          {
            enableHighAccuracy: true,
            timeout: 20000, // Increased timeout
            maximumAge: 3000 // Reduced max age for fresher data
          }
        );

        logger.log("Location tracking started, watchId:", watchId);

      } catch (error) {
        logger.error("Failed to start location tracking:", error);
        toast({
          title: "Location Error",
          description: "Failed to start location tracking. Please check your GPS settings.",
          variant: "destructive",
        });
      }
    };

    startLocationTracking();

    return () => {
      if (watchId) {
        logger.log("Clearing location watch:", watchId);
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isTracking]); // Removed lastLocation from dependencies to prevent infinite loops

  // Update group member stats in database
  useEffect(() => {
    if (user && currentGroup && isTracking) {
      const updateMemberStats = async () => {
        try {
          const { error } = await supabase
            .from('group_members')
            .update({
              steps_count: stepCount,
              distance_km: Math.round(distance * 1000) / 1000, // Round to 3 decimal places
              tracking_started_at: startTime?.toISOString()
            })
            .eq('group_id', currentGroup.id)
            .eq('user_id', user.id);
          
          if (error) {
            logger.error('Error updating member stats:', error);
          } else {
            logger.log('Stats saved to DB - Steps:', stepCount, 'Distance:', distance.toFixed(3), 'km');
          }
        } catch (error) {
          logger.error('Error updating member stats:', error);
        }
      };

      // Update immediately when values change significantly
      updateMemberStats();
      
      // Also update periodically every 30 seconds
      const interval = setInterval(updateMemberStats, 30000);
      return () => clearInterval(interval);
    }
  }, [user, currentGroup, isTracking, stepCount, distance, startTime]);

  // Update solo journey stats in database
  useEffect(() => {
    if (user && girivalamMode === 'solo' && isTracking && !currentGroup) {
      // Sync solo journey data periodically
      updateSoloJourney({
        distance_km: distance,
        steps_count: stepCount,
        time_elapsed_seconds: timeElapsed,
        girivalam_progress: girivalamProgress,
        girivalam_completed: girivalamCompleted,
        path_history: userPathHistory,
        session_id: savedState.sessionId,
        status: 'active',
      });
    }
  }, [user, girivalamMode, isTracking, currentGroup, stepCount, distance, timeElapsed, girivalamProgress, girivalamCompleted, userPathHistory, savedState.sessionId, updateSoloJourney]);

  const checkNearbyLandmarks = (userPos: { lat: number; lng: number }) => {
    allLandmarks.forEach(landmark => {
      const landmarkDistance = calculateDistance(userPos.lat, userPos.lng, landmark.lat, landmark.lng);
      if (landmarkDistance < 0.05 && !visitedLandmarks.includes(landmark.id)) { // 50 meters
        setVisitedLandmarks(prev => [...prev, landmark.id]);
        toast({
          title: "Landmark Visited! 🎉",
          description: `You've reached ${landmark.name}`,
        });
      }
    });
  };

  // Check Girivalam path geo-fence and track progress
  const checkGirivalamPath = (userPos: { lat: number; lng: number }) => {
    const { withinFence, distanceToPath } = isWithinGeofence(userPos.lat, userPos.lng);
    const { completionPercentage, distanceCovered } = calculatePathProgress(userPos.lat, userPos.lng);

    // Check if user entered the geo-fence
    if (withinFence && !onGirivalamPath) {
      setOnGirivalamPath(true);
      if (!hasStartedGirivalam && isTracking) {
        setHasStartedGirivalam(true);
        toast({
          title: "🕉️ Girivalam Path Detected!",
          description: "You are now on the sacred Girivalam path. Tracking started automatically.",
        });
      }
    }

    // Check if user left the geo-fence
    if (!withinFence && onGirivalamPath) {
      setOnGirivalamPath(false);
      toast({
        title: "⚠️ Off the Girivalam Path",
        description: "You have moved away from the sacred path.",
        variant: "destructive",
      });
    }

    // Update progress if on path and tracking
    if (withinFence && isTracking) {
      setGirivalamProgress(completionPercentage);
      setGirivalamDistanceCovered(distanceCovered);

      // Add current position to path history
      setUserPathHistory(prev => [...prev, userPos]);

      // Check for completion
      if (completionPercentage >= 99 && !girivalamCompleted) {
        setGirivalamCompleted(true);
        toast({
          title: "🎉 Girivalam Completed!",
          description: `Congratulations! You have completed the sacred 14 km circumambulation of Arunachala Hill. Om Namah Shivaya!`,
        });
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "Come back soon for your spiritual journey!",
    });
  };

  // Long press handlers for stopping Girivalam
  const handleStopTouchStart = useCallback(() => {
    if (!isTracking) return;
    
    setIsLongPressing(true);
    setLongPressProgress(0);
    
    const startTime = Date.now();
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / LONG_PRESS_DURATION) * 100, 100);
      setLongPressProgress(progress);
      
      if (progress >= 100) {
        // Long press complete - stop the journey
        stopGirivalam();
        handleStopTouchEnd();
      } else {
        longPressTimerRef.current = setTimeout(updateProgress, 50);
      }
    };
    
    longPressTimerRef.current = setTimeout(updateProgress, 50);
  }, [isTracking]);

  const handleStopTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsLongPressing(false);
    setLongPressProgress(0);
  }, []);

  // Stop Girivalam journey
  const stopGirivalam = useCallback(async () => {
    setIsTracking(false);
    setStartTime(null);
    persistStopJourney();
    
    // End solo journey in database if it's a solo session
    if (girivalamMode === 'solo' && user) {
      await endSoloJourney({
        distance_km: distance,
        steps_count: stepCount,
        time_elapsed_seconds: timeElapsed,
        girivalam_progress: girivalamProgress,
        girivalam_completed: girivalamCompleted,
        path_history: userPathHistory,
        session_id: savedState.sessionId,
        status: girivalamCompleted ? 'completed' : 'abandoned',
      });
    }
    
    toast({
      title: "🕉️ Girivalam Ended",
      description: "Your sacred journey has been saved. Om Namah Shivaya!",
    });
  }, [toast, persistStopJourney, girivalamMode, user, endSoloJourney, distance, stepCount, timeElapsed, girivalamProgress, girivalamCompleted, userPathHistory, savedState.sessionId]);

  // Unified Start Girivalam - one click handles everything
  // One-tap "Locate me" — shared by the first-load primer and the map's permission banner.
  const requestLocationOnce = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocationRequestPending(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCurrentLocation(newLocation);
        setLastLocation(newLocation);
        setLastLocationUpdate(new Date());
        setLocationPermissionStatus('granted');
        setCenterOnUserTrigger((prev) => prev + 1);
        setLocationRequestPending(false);
      },
      (error) => {
        if (error.code === 1) setLocationPermissionStatus('denied');
        setLocationRequestPending(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const dismissLocationPrimer = useCallback(() => {
    setLocationPrimerDismissed(true);
    try { localStorage.setItem('girivalam_location_primer_dismissed', '1'); } catch { /* ignore */ }
  }, []);

  const startGirivalam = async () => {
    // Group walks require an account (to create/join a group and share location).
    if (girivalamMode === 'group' && !user) {
      toast({
        title: "Sign in for Group Girivalam",
        description: "Create an account to walk with your group and share live location.",
      });
      navigate('/auth?redirect=/girivalam-map?mode=group');
      return;
    }

    // Step 1: Request GPS permission if not already granted
    if (locationPermissionStatus !== 'granted') {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });
        
        // Permission granted - set initial location
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(newLocation);
        setLastLocation(newLocation);
        setLocationPermissionStatus('granted');
        setLastLocationUpdate(new Date());
        
      } catch (error) {
        const geoError = error as GeolocationPositionError;
        if (geoError.code === 1) {
          // Permission denied - show spiritual message
          toast({
            title: "🕉️ Location Needed",
            description: "Location is needed to walk with Arunachala. Please enable GPS access.",
            variant: "destructive",
          });
          setLocationPermissionStatus('denied');
        } else {
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please check your GPS settings.",
            variant: "destructive",
          });
        }
        return;
      }
    }

    // Step 2: Initialize the Girivalam journey
    const now = new Date();
    const sessionId = `girivalam_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    setStartTime(now);
    setStepCount(0);
    setDistance(0);
    setTimeElapsed(0);
    setLastLocation(null);
    setUserPathHistory([]);
    setGirivalamProgress(0);
    setGirivalamDistanceCovered(0);
    setGirivalamCompleted(false);
    setHasStartedGirivalam(true);
    setIsTracking(true);
    
    // Persist the new journey (localStorage) — share the same sessionId with the DB
    // row so resume reliably matches the original journey instead of duplicating it.
    startJourney(girivalamMode, currentGroup?.id, sessionId);

    // Start solo journey in database if it's solo mode
    if (girivalamMode === 'solo' && user) {
      await startSoloJourney(sessionId);
    }
    
    toast({
      title: girivalamMode === 'group' ? "👥 Group Girivalam Started!" : "🧍 Solo Girivalam Started!",
      description: girivalamMode === 'group' 
        ? "Walking together on the sacred path. Om Namah Shivaya!"
        : "Your sacred journey begins. Walk with Shiva!",
    });
  };

  const toggleLandmarkType = (type: Landmark['type']) => {
    setSelectedLandmarkTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleGroupJoined = async (groupId: string) => {
    try {
      // Use groups_public view to avoid exposing password_hash
      const { data: group, error } = await supabase
        .from('groups_public')
        .select('*')
        .eq('id', groupId)
        .single();

      if (error) throw error;
      setCurrentGroup({
        ...group,
        group_type: group.group_type as 'public' | 'private'
      });

      // Fetch location sharing status for this group
      if (user) {
        const { data: memberData } = await supabase
          .from('group_members')
          .select('location_sharing_enabled')
          .eq('group_id', groupId)
          .eq('user_id', user.id)
          .maybeSingle();

        setLocationSharingEnabled((memberData as any)?.location_sharing_enabled || false);
      }

      toast({
        title: "Group Selected! 🎉",
        description: `Now tracking with "${group.name}"`,
      });
    } catch (error) {
      logger.error('Error setting current group:', error);
      toast({
        title: "Error",
        description: "Failed to set current group",
        variant: "destructive",
      });
    }
  };

  // Show loading while restoring session
  if (isRestoring) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Mountain className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <p className="mt-4 text-muted-foreground">Preparing your journey...</p>
        </div>
      </div>
    );
  }

  // Show continue prompt if there's an active session
  if (showContinuePrompt && hasActiveSession) {
    return (
      <ContinueJourneyPrompt
        savedState={savedState}
        onContinue={handleContinueJourney}
        onStartNew={handleStartNewJourney}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 md:pt-24">
      <Helmet>
        <title>Girivalam Map — Live Location GPS Tracker & 14 km Route | Tiruvannamalai</title>
        <meta name="description" content="Track your Girivalam live on the map — see your GPS live location on the 14 km Arunachala route, find all 8 Ashta Lingam temples, and walk with your group in real time." />
        <link rel="canonical" href="https://mygirivalam.in/girivalam-map" />
      </Helmet>
      {/* Fixed Site Header for consistent mobile background */}
      <SiteHeader />

      {/* Main Content */}
      <div className="px-4 py-6 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Guest nudge — the map & solo tracking work without an account */}
          {!user && (
            <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
              <p className="text-sm text-foreground/80 text-center sm:text-left">
                <span className="font-semibold">Exploring as a guest.</span>{" "}
                Sign in to save your journey, sync across devices, and walk with a group.
              </p>
              <Button
                onClick={() => navigate('/auth?redirect=/girivalam-map')}
                variant="outline"
                size="sm"
                className="shrink-0 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <LogIn className="h-4 w-4 mr-1.5" />
                Sign in
              </Button>
            </div>
          )}

          {/* First-load location primer — explains WHY before the browser prompt, one tap to locate. */}
          {!locationPrimerDismissed &&
            (locationPermissionStatus === 'prompt' || locationPermissionStatus === 'unknown') && (
              <div className="mb-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-playfair text-base font-semibold">Show me on the sacred path</h3>
                      <button
                        type="button"
                        onClick={dismissLocationPrimer}
                        aria-label="Dismiss"
                        className="-mr-1 -mt-1 rounded-full p-1 text-muted-foreground/60 hover:bg-muted hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      We use your location to place your dot on the 14 km Girivalam route and guide you between temples.
                    </p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary/70" />
                      Stays on your device — never shared unless you join a group.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button
                        onClick={requestLocationOnce}
                        disabled={locationRequestPending}
                        className="bg-primary hover:bg-primary/90"
                        size="sm"
                      >
                        {locationRequestPending ? (
                          <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Locating…</>
                        ) : (
                          <><MapPin className="mr-1.5 h-4 w-4" /> Locate me</>
                        )}
                      </Button>
                      <Button onClick={dismissLocationPrimer} variant="ghost" size="sm" className="text-muted-foreground">
                        Not now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          <JourneyControlCard
            girivalamMode={girivalamMode}
            modeContent={modeContent}
            isTracking={isTracking}
            girivalamProgress={girivalamProgress}
            girivalamDistanceCovered={girivalamDistanceCovered}
            startGirivalam={startGirivalam}
            handleStopTouchStart={handleStopTouchStart}
            handleStopTouchEnd={handleStopTouchEnd}
            isLongPressing={isLongPressing}
            longPressProgress={longPressProgress}
            onModeChange={setSelectedMode}
          />

          {/* Main Tabs - Show Groups tab only in group mode */}
          <Tabs defaultValue="tracker" className="w-full">
            {girivalamMode === 'group' && (
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1">
                <TabsTrigger value="tracker" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  🗺️ Tracker
                </TabsTrigger>
                <TabsTrigger value="groups" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  👥 Groups
                </TabsTrigger>
              </TabsList>
            )}

            {/* Tracker Tab */}
            <TabsContent value="tracker" className="space-y-6">
              {/* Unified Journey Status Bar - Replaces GPS Status, StepTracker, and Progress cards */}
              <JourneyStatusBar
                isTracking={isTracking}
                isActive={hasStartedGirivalam || isTracking}
                gpsAccuracy={gpsAccuracy}
                distance={girivalamDistanceCovered}
                progress={girivalamProgress}
                timeElapsed={timeElapsed}
                stepCount={stepCount}
                onPath={onGirivalamPath}
                isGroupMode={girivalamMode === 'group'}
                groupMemberCount={activeDevotees}
              />

              {/* Girivalam Completion Celebration */}
              {girivalamProgress >= 99 && (
                <SpiritualCard className={`bg-gradient-to-br ${girivalamMode === 'group' ? 'from-secondary/10 to-secondary/5 border-secondary' : 'from-primary/10 to-primary/5 border-primary'}`}>
                  <div className="text-center p-4">
                    <div className="text-4xl mb-2">🎉</div>
                    <h4 className={`font-playfair text-xl font-bold ${girivalamMode === 'group' ? 'text-secondary' : 'text-primary'} mb-1`}>
                      {modeContent.completionTitle}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {modeContent.completionMessage}
                    </p>

                    {/* Guest → account: capture the signup at the value moment */}
                    {!user && (
                      <div className="mt-4 pt-4 border-t border-primary/10">
                        <div className="flex items-center justify-center gap-3 text-sm mb-3">
                          <span className="font-semibold text-foreground">{girivalamDistanceCovered.toFixed(1)} km</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="font-semibold text-foreground">{visitedLandmarks.length} temples</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 max-w-sm mx-auto">
                          Create a free account to save this Girivalam to your history and track your progress over time.
                        </p>
                        <Button
                          onClick={() => {
                            try { sessionStorage.setItem('pendingJourneySave', '1'); } catch { /* ignore */ }
                            navigate('/auth?redirect=/girivalam-map');
                          }}
                          className="bg-primary hover:bg-primary/90"
                          size="lg"
                        >
                          <LogIn className="h-4 w-4 mr-2" />
                          Save this journey
                        </Button>
                      </div>
                    )}
                  </div>
                </SpiritualCard>
              )}

              {/* Enhanced Interactive Map Section */}
              <SpiritualCard className="overflow-hidden" style={{ backdropFilter: 'none', WebkitBackdropFilter: 'none' }}>
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="font-playfair text-2xl font-semibold mb-2 flex items-center justify-center gap-2">
                      <MapIcon className="h-6 w-6 text-primary" />
                      Interactive Girivalam Map
                    </h3>
                    <p className="text-muted-foreground">Detailed satellite view with all landmarks and real-time tracking</p>
                  </div>

                  {/* Map Controls */}
                  <div className="flex flex-col space-y-4">
                    {/* Premium Filter Controls */}

                    <MapFilterDropdown
                      selectedFilters={selectedLandmarkTypes}
                      onApplyFilters={(filters) => {
                        setSelectedLandmarkTypes(filters);
                        setMapFocusTypes(null);
                      }}
                      onReset={() => {
                        // Reset clears all filters but always keeps temples
                        setSelectedLandmarkTypes(['temple']);
                        setMapFocusTypes(null);
                      }}
                      onShowAll={() => {
                        // Show all landmarks
                        setSelectedLandmarkTypes(ALL_LANDMARK_TYPES);
                        setMapFocusTypes(null);
                      }}
                    />
                    {/* Minimal Map Context - Only show group info if needed */}
                    {girivalamMode === 'group' && (
                      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                        {currentGroup ? (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-secondary" />
                            <span className="text-secondary font-medium">{currentGroup.name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span className="text-sm">Join or create a group to walk together</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>


                  {/* Full-Featured Map */}
                  <div className="relative">

                    {/* Location Permission Banner */}
                    <LocationPermissionBanner
                      permissionStatus={locationPermissionStatus}
                      lastLocation={lastLocation}
                      lastUpdate={lastLocationUpdate}
                      onRequestPermission={requestLocationOnce}
                    />

                    {/* Map Component with Fallback */}
                    <div className="relative">
                      {currentGroup ? (
                        <div className="h-[60vh] sm:h-[400px] md:h-[500px] w-full bg-muted rounded-lg border-2 border-primary/20 relative overflow-hidden">
                          <LiveGroupMap
                            groupId={currentGroup.id}
                            userLocation={currentLocation}
                            isTracking={isTracking}
                            locationSharingEnabled={locationSharingEnabled}
                            className="h-full w-full"
                          />
                          {/* Fallback overlay removed - Map component handles its own loading states */}
                        </div>
                      ) : (
                        <div className="h-[60vh] sm:h-[400px] md:h-[500px] w-full bg-muted rounded-lg border-2 border-primary/20 relative overflow-hidden">
                          <Map
                            allLandmarks={displayLandmarks}
                            userLocation={currentLocation}
                            isTracking={isTracking}
                            selectedTypes={mapSelectedTypes}
                            className="h-full w-full"
                            centerOnUserTrigger={centerOnUserTrigger}
                            focusTypes={mapFocusTypes}
                            userPath={userPathHistory}
                            completionPercentage={girivalamProgress}
                            nearestAshtaLingamId={showOnlyAshtaLingas ? nearestAshtaLingam?.id : undefined}
                          />
                          {/* Fallback overlay removed - Map component handles its own loading states */}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Map Actions */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Center map on current location
                        setCenterOnUserTrigger(prev => prev + 1);
                        setMapFocusTypes(null);
                        toast({
                          title: "Map Centered! 🎯",
                          description: "Map focused on your current location",
                        });
                      }}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Center on Me
                    </Button>

                    <Button
                      variant={showOnlyAshtaLingas ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newState = !showOnlyAshtaLingas;
                        setShowOnlyAshtaLingas(newState);
                        
                        if (newState) {
                          // Focus map on Aṣṭa Lingas
                          setMapFocusTypes(['temple']);
                          toast({
                            title: "🕉 Aṣṭa Lingas Shown",
                            description: `${ashtaLingams.length} sacred Aṣṭa Lingams are now highlighted`,
                          });
                        } else {
                          // Return to normal view
                          setSelectedLandmarkTypes(ALL_LANDMARK_TYPES);
                          setMapFocusTypes(null);
                          toast({
                            title: "All Landmarks Shown",
                            description: "Map showing all landmark types",
                          });
                        }
                      }}
                      className={showOnlyAshtaLingas ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-lg" : ""}
                    >
                      <Sparkles className="h-4 w-4 mr-1" /> 
                      {showOnlyAshtaLingas ? "🕉 Asta Lingas" : "🕉 Show Asta Lingas"}
                    </Button>

                    {/* <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Show all facilities
                        const facilityTypes: Landmark['type'][] = ['water', 'food', 'toilet', 'medical', 'rest'];
                        setSelectedLandmarkTypes(facilityTypes);
                        setMapFocusTypes(facilityTypes);
                        const totalFacilities = facilityTypes.reduce((count, type) =>
                          count + getLandmarksByType(type).length, 0);
                        toast({
                          title: "Facilities Shown! 🏪",
                          description: `${totalFacilities} facilities are now visible on the map`,
                        });
                      }}
                    >
                      🏪 Show Facilities
                    </Button> */}

                    {/* <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Show all landmarks
                        setSelectedLandmarkTypes(['temple', 'water', 'food', 'toilet', 'medical', 'rest', 'parking', 'rooms']);
                        setMapFocusTypes(null);
                        toast({
                          title: "All Landmarks! 🗺️",
                          description: `All ${allLandmarks.length} landmarks are now visible`,
                        });
                      }}
                    >
                      🗺️ Show All
                    </Button> */}

                    {visitedLandmarks.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Show visited landmarks info
                          const lingaCount = ashtaLingams.filter(t => visitedLandmarks.includes(t.id)).length;
                          toast({
                            title: "Journey Summary! 👣",
                            description: `You've visited ${visitedLandmarks.length} landmarks (${lingaCount}/${ashtaLingams.length} Aṣṭa Lingas)`,
                          });
                        }}
                      >
                        <Footprints className="h-4 w-4 mr-2" />
                        My Journey ({visitedLandmarks.length})
                      </Button>
                    )}
                  </div>
                </div>
              </SpiritualCard>

              {/* Girivalam Journey Guide - Controlled by parent */}
              <GirivalamJourneyGuide isActive={isTracking} userLocation={currentLocation} />

            </TabsContent>

            {/* Groups tab - only rendered in group mode */}
            {girivalamMode === 'group' && (
              <TabsContent value="groups">
                {user ? (
                  <GroupManagement
                    onGroupJoined={handleGroupJoined}
                    currentGroup={currentGroup}
                    userLocation={currentLocation}
                    isTracking={isTracking}
                  />
                ) : (
                  <SpiritualCard className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Users className="h-8 w-8 text-secondary" />
                    </div>
                    <h3 className="font-playfair text-xl font-semibold mb-2">Walk together as a group</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                      Create or join a group to share your live location with family and friends and
                      keep everyone together on the sacred path. This needs a free account.
                    </p>
                    <Button
                      onClick={() => navigate('/auth?redirect=/girivalam-map?mode=group')}
                      className="bg-secondary hover:bg-secondary/90"
                      size="lg"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign in to create or join a group
                    </Button>
                  </SpiritualCard>
                )}
              </TabsContent>
            )}


          </Tabs>
        </div>
      </div>

      {/* Floating Invite Link Button - Only in group mode with active group */}
      {girivalamMode === 'group' && currentGroup && (
        <InviteLinkButton
          groupId={currentGroup.id}
          groupCode={currentGroup.code}
          groupName={currentGroup.name}
          groupType={currentGroup.group_type}
        />
      )}

      {/* Offline banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[3000] flex items-center justify-center gap-2 bg-gray-900/95 text-white text-sm py-2 px-4">
          <WifiOff className="h-4 w-4 text-yellow-400 flex-shrink-0" />
          <span>
            You're offline — map & landmarks loaded from cache. Journey data saved locally and will sync when reconnected.
          </span>
        </div>
      )}

      {/* Proximity audio banner — slides up when entering a temple's radius */}
      <ProximityAudioBanner
        visible={proximityAudio.visible}
        activeLinga={proximityAudio.activeLinga}
        mantraName={proximityAudio.mantraName}
        isPlaying={proximityAudio.isPlaying}
        distanceMeters={proximityAudio.distanceMeters}
        onDismiss={proximityAudio.dismiss}
        onStop={proximityAudio.stop}
      />

      {/* Site Footer with Map Attribution */}
      <SiteFooter />
    </div>
  );
};

export default MapTracker;