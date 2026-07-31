import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SacredAudio {
  id: string;
  mantra_id: string;
  mantra_name: string;
  audio_url: string;
  language: string;
  duration_seconds: number | null;
  audio_type: string;
  linga_id: number | null;
  file_size: number | null;
  file_format: string | null;
  created_at: string;
  updated_at: string;
}

// Fetch all sacred audio
export const useSacredAudio = () => {
  return useQuery({
    queryKey: ['sacred-audio'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mantra_audio')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SacredAudio[];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

// Fetch audio for a specific linga (1-8)
export const useLingaAudio = (lingaId: number) => {
  return useQuery({
    queryKey: ['linga-audio', lingaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mantra_audio')
        .select('*')
        .eq('audio_type', 'linga')
        .eq('linga_id', lingaId)
        .maybeSingle();
      
      if (error) throw error;
      return data as SacredAudio | null;
    },
    staleTime: 1000 * 60 * 5,
    enabled: lingaId >= 1 && lingaId <= 8,
  });
};

// Fetch audio for a specific chant by mantra_id
export const useChantAudio = (mantraId: string) => {
  return useQuery({
    queryKey: ['chant-audio', mantraId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mantra_audio')
        .select('*')
        .eq('audio_type', 'chant')
        .eq('mantra_id', mantraId)
        .maybeSingle();
      
      if (error) throw error;
      return data as SacredAudio | null;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!mantraId,
  });
};

// Fetch all linga audio in one query for efficiency
export const useAllLingaAudio = () => {
  return useQuery({
    queryKey: ['all-linga-audio'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mantra_audio')
        .select('*')
        .eq('audio_type', 'linga')
        .order('linga_id', { ascending: true });
      
      if (error) throw error;
      
      // Create a map of linga_id to audio
      const audioMap: Record<number, SacredAudio> = {};
      (data as SacredAudio[]).forEach(audio => {
        if (audio.linga_id) {
          audioMap[audio.linga_id] = audio;
        }
      });
      
      return audioMap;
    },
    staleTime: 1000 * 60 * 5,
  });
};

// Fetch all chant audio
export const useAllChantAudio = () => {
  return useQuery({
    queryKey: ['all-chant-audio'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mantra_audio')
        .select('*')
        .eq('audio_type', 'chant')
        .order('mantra_name', { ascending: true });
      
      if (error) throw error;
      
      // Create a map of mantra_id to audio
      const audioMap: Record<string, SacredAudio> = {};
      (data as SacredAudio[]).forEach(audio => {
        audioMap[audio.mantra_id] = audio;
      });
      
      return audioMap;
    },
    staleTime: 1000 * 60 * 5,
  });
};
