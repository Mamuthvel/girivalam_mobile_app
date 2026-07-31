import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from "@/lib/logger";

export interface RecentJourney {
  id: string;
  type: 'solo' | 'group';
  distanceKm: number;
  stepsCount: number;
  timeSeconds: number;
  completed: boolean;
  progress: number;   // 0–100
  startedAt: string;
  endedAt: string | null;
}

export interface JourneyStats {
  totalGirivalams: number;       // confirmed completed rounds
  totalDistance: number;         // km (solo + group combined)
  totalTime: number;             // hours
  soloCount: number;             // number of solo sessions started
  groupCount: number;            // number of group sessions participated in
  stepsWalked: number;
  completedGirivalams: number;   // solo girivalams marked complete
  templesCompleted: number;      // completedGirivalams * 8
  bestTimeHours: number | null;  // fastest confirmed solo girivalam
  recentJourneys: RecentJourney[];
  isLoading: boolean;
  error: string | null;
}

const AVERAGE_SPEED_KMH = 3.5;
const TEMPLES_PER_GIRIVALAM = 8;
const GIRIVALAM_KM = 14;
const RECENT_LIMIT = 10;

export const useJourneyStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<JourneyStats>({
    totalGirivalams: 0,
    totalDistance: 0,
    totalTime: 0,
    soloCount: 0,
    groupCount: 0,
    stepsWalked: 0,
    completedGirivalams: 0,
    templesCompleted: 0,
    bestTimeHours: null,
    recentJourneys: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!user) {
      setStats(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchStats = async () => {
      try {
        // Parallel fetch: solo journeys + group memberships
        const [soloResult, memberResult] = await Promise.all([
          supabase
            .from('solo_journeys')
            .select('id, distance_km, steps_count, time_elapsed_seconds, girivalam_completed, girivalam_progress, status, started_at, ended_at')
            .eq('user_id', user.id)
            .order('started_at', { ascending: false }),
          supabase
            .from('group_members')
            .select('id, group_id, distance_km, steps_count, tracking_started_at, joined_at')
            .eq('user_id', user.id)
            .not('tracking_started_at', 'is', null),
        ]);

        if (soloResult.error) throw soloResult.error;
        if (memberResult.error) throw memberResult.error;

        const soloJourneys = soloResult.data ?? [];
        const memberships  = memberResult.data ?? [];

        // ── Solo aggregates ──────────────────────────────────────────────
        let soloDistance  = 0;
        let soloSteps     = 0;
        let soloTimeSec   = 0;
        let completedCount = 0;
        let bestTimeSec: number | null = null;

        const recentSolo: RecentJourney[] = [];

        for (const j of soloJourneys) {
          soloDistance += Number(j.distance_km) || 0;
          soloSteps    += j.steps_count || 0;
          soloTimeSec  += j.time_elapsed_seconds || 0;

          const isCompleted = j.girivalam_completed === true || j.status === 'completed';
          if (isCompleted) {
            completedCount++;
            const t = j.time_elapsed_seconds;
            if (t && (bestTimeSec === null || t < bestTimeSec)) bestTimeSec = t;
          }

          if (recentSolo.length < RECENT_LIMIT) {
            recentSolo.push({
              id:          j.id,
              type:        'solo',
              distanceKm:  Math.round((Number(j.distance_km) || 0) * 10) / 10,
              stepsCount:  j.steps_count || 0,
              timeSeconds: j.time_elapsed_seconds || 0,
              completed:   isCompleted,
              progress:    Math.round(j.girivalam_progress || 0),
              startedAt:   j.started_at,
              endedAt:     j.ended_at ?? null,
            });
          }
        }

        // ── Group aggregates ─────────────────────────────────────────────
        let groupDistance = 0;
        let groupSteps    = 0;

        const recentGroup: RecentJourney[] = [];

        for (const m of memberships) {
          groupDistance += Number(m.distance_km) || 0;
          groupSteps    += m.steps_count || 0;

          if (recentGroup.length < RECENT_LIMIT) {
            const distKm = Math.round((Number(m.distance_km) || 0) * 10) / 10;
            recentGroup.push({
              id:          m.id,
              type:        'group',
              distanceKm:  distKm,
              stepsCount:  m.steps_count || 0,
              timeSeconds: Math.round((distKm / AVERAGE_SPEED_KMH) * 3600),
              completed:   distKm >= GIRIVALAM_KM,
              progress:    Math.min(100, Math.round((distKm / GIRIVALAM_KM) * 100)),
              startedAt:   m.tracking_started_at!,
              endedAt:     null,
            });
          }
        }

        // ── Combined ─────────────────────────────────────────────────────
        const totalDistance = soloDistance + groupDistance;
        const totalSteps    = soloSteps + groupSteps;

        const groupGirivalams   = Math.floor(groupDistance / GIRIVALAM_KM);
        const totalGirivalams   = completedCount + groupGirivalams;
        const templesCompleted  = completedCount * TEMPLES_PER_GIRIVALAM;

        const groupEstimatedSec = Math.round((groupDistance / AVERAGE_SPEED_KMH) * 3600);
        const totalTimeHours    = Math.round((soloTimeSec + groupEstimatedSec) / 3600);

        const bestTimeHours = bestTimeSec != null
          ? Math.round((bestTimeSec / 3600) * 10) / 10
          : null;

        // Merge + sort recent journeys by date desc, cap at RECENT_LIMIT
        const recentJourneys = [...recentSolo, ...recentGroup]
          .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
          .slice(0, RECENT_LIMIT);

        setStats({
          totalGirivalams,
          totalDistance:      Math.round(totalDistance * 10) / 10,
          totalTime:          totalTimeHours,
          soloCount:          soloJourneys.length,
          groupCount:         memberships.length,
          stepsWalked:        totalSteps,
          completedGirivalams: completedCount,
          templesCompleted,
          bestTimeHours,
          recentJourneys,
          isLoading: false,
          error: null,
        });
      } catch (err: any) {
        logger.error('useJourneyStats error:', err);
        setStats(prev => ({ ...prev, isLoading: false, error: err?.message ?? 'Failed to load stats' }));
      }
    };

    fetchStats();
  }, [user]);

  return stats;
};
