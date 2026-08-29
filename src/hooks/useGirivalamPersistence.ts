import { useState, useEffect, useCallback } from 'react';
import { logger } from "@/lib/logger";

const STORAGE_KEY = 'girivalam_session_state';
const SESSION_EXPIRY_HOURS = 12; // Sessions expire after 12 hours of inactivity

export interface GirivalamSessionState {
  // Core journey state
  isTracking: boolean;
  mode: 'solo' | 'group';
  groupId?: string;
  
  // Progress tracking
  startTime: string | null;
  girivalamProgress: number;
  girivalamDistanceCovered: number;
  stepCount: number;
  distance: number;
  timeElapsed: number;
  
  // Location tracking
  currentLocation: { lat: number; lng: number };
  userPathHistory: { lat: number; lng: number }[];
  onGirivalamPath: boolean;
  hasStartedGirivalam: boolean;
  girivalamCompleted: boolean;
  
  // Metadata
  lastUpdated: string;
  sessionId: string;
}

const generateSessionId = () => {
  return `girivalam_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const defaultState: GirivalamSessionState = {
  isTracking: false,
  mode: 'solo',
  startTime: null,
  girivalamProgress: 0,
  girivalamDistanceCovered: 0,
  stepCount: 0,
  distance: 0,
  timeElapsed: 0,
  currentLocation: { lat: 12.2307, lng: 79.0628 },
  userPathHistory: [],
  onGirivalamPath: false,
  hasStartedGirivalam: false,
  girivalamCompleted: false,
  lastUpdated: new Date().toISOString(),
  sessionId: generateSessionId(),
};

export const useGirivalamPersistence = () => {
  const [state, setState] = useState<GirivalamSessionState>(defaultState);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);

  // Load saved state on mount
  useEffect(() => {
    const loadSavedState = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
          setIsRestoring(false);
          return;
        }

        const parsed: GirivalamSessionState = JSON.parse(saved);
        
        // Check if session has expired
        const lastUpdated = new Date(parsed.lastUpdated);
        const now = new Date();
        const hoursSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceUpdate > SESSION_EXPIRY_HOURS) {
          // Session expired, clear it
          localStorage.removeItem(STORAGE_KEY);
          setIsRestoring(false);
          return;
        }

        // Check if there was an active tracking session
        if (parsed.isTracking || parsed.hasStartedGirivalam) {
          setHasActiveSession(true);
          setState(parsed);
        }
      } catch (error) {
        logger.error('Failed to load Girivalam session:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
      setIsRestoring(false);
    };

    loadSavedState();
  }, []);

  // Save state to localStorage whenever it changes (debounced)
  useEffect(() => {
    if (isRestoring) return;
    
    const timeoutId = setTimeout(() => {
      const stateToSave = {
        ...state,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }, 500); // Debounce saves

    return () => clearTimeout(timeoutId);
  }, [state, isRestoring]);

  // Update specific fields
  const updateState = useCallback((updates: Partial<GirivalamSessionState>) => {
    setState(prev => ({
      ...prev,
      ...updates,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  // Start a new journey session. Accepts an explicit sessionId so the DB row and
  // the localStorage session stay in sync (needed for reliable resume).
  const startJourney = useCallback((mode: 'solo' | 'group', groupId?: string, sessionId?: string) => {
    const newState: GirivalamSessionState = {
      ...defaultState,
      isTracking: true,
      mode,
      groupId,
      startTime: new Date().toISOString(),
      hasStartedGirivalam: true,
      lastUpdated: new Date().toISOString(),
      sessionId: sessionId || generateSessionId(),
    };
    setState(newState);
    setHasActiveSession(true);
  }, []);

  // Resume an existing session
  const resumeJourney = useCallback(() => {
    setState(prev => ({
      ...prev,
      isTracking: true,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  // Stop the journey
  const stopJourney = useCallback(() => {
    setState(prev => ({
      ...prev,
      isTracking: false,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  // Clear the session entirely
  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
    setHasActiveSession(false);
  }, []);

  // Update tracking data (location, steps, distance, progress)
  const updateTrackingData = useCallback((data: {
    currentLocation?: { lat: number; lng: number };
    stepCount?: number;
    distance?: number;
    timeElapsed?: number;
    girivalamProgress?: number;
    girivalamDistanceCovered?: number;
    onGirivalamPath?: boolean;
    girivalamCompleted?: boolean;
  }) => {
    setState(prev => {
      const newState = { ...prev, ...data };
      
      // Add to path history if location changed significantly
      if (data.currentLocation && prev.isTracking) {
        const lastPoint = prev.userPathHistory[prev.userPathHistory.length - 1];
        if (!lastPoint || 
            Math.abs(lastPoint.lat - data.currentLocation.lat) > 0.00005 ||
            Math.abs(lastPoint.lng - data.currentLocation.lng) > 0.00005) {
          newState.userPathHistory = [...prev.userPathHistory, data.currentLocation];
        }
      }
      
      return newState;
    });
  }, []);

  // Get session age in minutes
  const getSessionAge = useCallback(() => {
    if (!state.startTime) return 0;
    const start = new Date(state.startTime);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
  }, [state.startTime]);

  return {
    state,
    hasActiveSession,
    isRestoring,
    updateState,
    startJourney,
    resumeJourney,
    stopJourney,
    clearSession,
    updateTrackingData,
    getSessionAge,
  };
};
