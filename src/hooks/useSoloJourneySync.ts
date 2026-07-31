import { useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from "@/lib/logger";

// Key used to queue the end-of-journey sync when the device was offline
const PENDING_SYNC_KEY = 'gv_pending_journey_sync';

interface SoloJourneyData {
  distance_km: number;
  steps_count: number;
  time_elapsed_seconds: number;
  girivalam_progress: number;
  girivalam_completed: boolean;
  path_history: { lat: number; lng: number }[];
  session_id: string;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
}

interface PendingSync {
  journeyId: string;
  userId: string;
  payload: Record<string, unknown>;
  savedAt: number;
}

export const useSoloJourneySync = () => {
  const { user } = useAuth();
  const currentJourneyIdRef = useRef<string | null>(null);
  const lastSyncRef = useRef<number>(0);
  const SYNC_INTERVAL = 30000;

  // On mount (or reconnect): flush any pending offline sync
  useEffect(() => {
    const flushPending = async () => {
      if (!user || !navigator.onLine) return;

      const raw = localStorage.getItem(PENDING_SYNC_KEY);
      if (!raw) return;

      try {
        const pending: PendingSync = JSON.parse(raw);
        if (pending.userId !== user.id) return;

        const { error } = await supabase
          .from('solo_journeys')
          .update(pending.payload as never)
          .eq('id', pending.journeyId)
          .eq('user_id', user.id);

        if (!error) {
          localStorage.removeItem(PENDING_SYNC_KEY);
          logger.log('Flushed offline journey sync:', pending.journeyId);
        }
      } catch {
        // Will retry next session
      }
    };

    flushPending();

    window.addEventListener('online', flushPending);
    return () => window.removeEventListener('online', flushPending);
  }, [user]);

  const startSoloJourney = useCallback(async (sessionId: string): Promise<string | null> => {
    if (!user) return null;

    if (!navigator.onLine) {
      logger.log('Offline — solo journey start queued locally');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('solo_journeys')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          status: 'active',
          started_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        logger.error('Error creating solo journey:', error);
        return null;
      }

      currentJourneyIdRef.current = data.id;
      logger.log('Solo journey started:', data.id);
      return data.id;
    } catch (error) {
      logger.error('Error starting solo journey:', error);
      return null;
    }
  }, [user]);

  const updateSoloJourney = useCallback(async (data: Partial<SoloJourneyData>) => {
    if (!user || !currentJourneyIdRef.current) return;

    // Skip periodic syncs when offline — data is safe in localStorage via useGirivalamPersistence
    if (!navigator.onLine) return;

    const now = Date.now();
    if (now - lastSyncRef.current < SYNC_INTERVAL) return;
    lastSyncRef.current = now;

    try {
      const updatePayload: Record<string, unknown> = {
        distance_km: Math.round((data.distance_km || 0) * 1000) / 1000,
        steps_count: data.steps_count || 0,
        time_elapsed_seconds: data.time_elapsed_seconds || 0,
        girivalam_progress: Math.round((data.girivalam_progress || 0) * 100) / 100,
        girivalam_completed: data.girivalam_completed || false,
      };

      if (data.path_history && data.path_history.length > 0) {
        const sampledPath = data.path_history.filter((_, i) => i % 10 === 0 || i === data.path_history!.length - 1);
        updatePayload.path_history = sampledPath;
      }

      const { error } = await supabase
        .from('solo_journeys')
        .update(updatePayload as never)
        .eq('id', currentJourneyIdRef.current)
        .eq('user_id', user.id);

      if (error) logger.error('Error updating solo journey:', error);
      else logger.log('Solo journey synced — Distance:', data.distance_km?.toFixed(3), 'km');
    } catch (error) {
      logger.error('Error syncing solo journey:', error);
    }
  }, [user]);

  const forceSyncSoloJourney = useCallback(async (data: Partial<SoloJourneyData>) => {
    if (!user || !currentJourneyIdRef.current) return;
    lastSyncRef.current = 0;
    await updateSoloJourney(data);
  }, [user, updateSoloJourney]);

  const endSoloJourney = useCallback(async (finalData: Partial<SoloJourneyData>) => {
    if (!user || !currentJourneyIdRef.current) return;

    const updatePayload: Record<string, unknown> = {
      status: finalData.girivalam_completed ? 'completed' : 'abandoned',
      ended_at: new Date().toISOString(),
      distance_km: Math.round((finalData.distance_km || 0) * 1000) / 1000,
      steps_count: finalData.steps_count || 0,
      time_elapsed_seconds: finalData.time_elapsed_seconds || 0,
      girivalam_progress: Math.round((finalData.girivalam_progress || 0) * 100) / 100,
      girivalam_completed: finalData.girivalam_completed || false,
    };

    if (finalData.path_history && finalData.path_history.length > 0) {
      const sampledPath = finalData.path_history.filter((_, i) => i % 10 === 0 || i === finalData.path_history!.length - 1);
      updatePayload.path_history = sampledPath;
    }

    // If offline: queue the final state so it syncs on reconnect
    if (!navigator.onLine) {
      const pending: PendingSync = {
        journeyId: currentJourneyIdRef.current,
        userId: user.id,
        payload: updatePayload,
        savedAt: Date.now(),
      };
      localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending));
      logger.log('Offline — journey end queued for sync on reconnect');
      currentJourneyIdRef.current = null;
      return;
    }

    try {
      const { error } = await supabase
        .from('solo_journeys')
        .update(updatePayload as never)
        .eq('id', currentJourneyIdRef.current)
        .eq('user_id', user.id);

      if (error) logger.error('Error ending solo journey:', error);
      else logger.log('Solo journey ended:', currentJourneyIdRef.current);
    } catch (error) {
      logger.error('Error ending solo journey:', error);
    }

    currentJourneyIdRef.current = null;
  }, [user]);

  const resumeSoloJourney = useCallback(async (sessionId: string): Promise<string | null> => {
    if (!user) return null;

    if (!navigator.onLine) return null;

    try {
      const { data, error } = await supabase
        .from('solo_journeys')
        .select('id')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .eq('status', 'active')
        .single();

      if (error || !data) {
        return await startSoloJourney(sessionId);
      }

      currentJourneyIdRef.current = data.id;
      logger.log('Solo journey resumed:', data.id);
      return data.id;
    } catch (error) {
      logger.error('Error resuming solo journey:', error);
      return null;
    }
  }, [user, startSoloJourney]);

  const getJourneyId = useCallback(() => currentJourneyIdRef.current, []);

  return {
    startSoloJourney,
    updateSoloJourney,
    forceSyncSoloJourney,
    endSoloJourney,
    resumeSoloJourney,
    getJourneyId,
  };
};
