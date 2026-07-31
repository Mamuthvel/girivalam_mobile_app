import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { logger } from "@/lib/logger";

interface AudioPlayerContextType {
  currentAudioId: string | null;
  isPlaying: boolean;
  isLoading: boolean;
  playAudio: (audioUrl: string, audioId: string) => Promise<void>;
  pauseAudio: () => void;
  stopAudio: () => void;
  toggleAudio: (audioUrl: string, audioId: string) => Promise<void>;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAudioId, setCurrentAudioId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setCurrentAudioId(null);
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  }, []);

  const playAudio = useCallback(async (audioUrl: string, audioId: string) => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }

    setIsLoading(true);
    setCurrentAudioId(audioId);

    try {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsPlaying(true);
        setIsLoading(false);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudioId(null);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setIsLoading(false);
        setCurrentAudioId(null);
        audioRef.current = null;
      };

      audio.onpause = () => {
        setIsPlaying(false);
      };

      await audio.play();
    } catch (error) {
      logger.error('Error playing audio:', error);
      setIsLoading(false);
      setCurrentAudioId(null);
      audioRef.current = null;
    }
  }, []);

  const toggleAudio = useCallback(async (audioUrl: string, audioId: string) => {
    // If same audio is playing, pause it
    if (currentAudioId === audioId && isPlaying) {
      pauseAudio();
      return;
    }

    // If same audio is paused, resume it
    if (currentAudioId === audioId && audioRef.current && !isPlaying) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        return;
      } catch {
        // Fall through to play new audio
      }
    }

    // Play new audio
    await playAudio(audioUrl, audioId);
  }, [currentAudioId, isPlaying, pauseAudio, playAudio]);

  return (
    <AudioPlayerContext.Provider value={{
      currentAudioId,
      isPlaying,
      isLoading,
      playAudio,
      pauseAudio,
      stopAudio,
      toggleAudio,
    }}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};
