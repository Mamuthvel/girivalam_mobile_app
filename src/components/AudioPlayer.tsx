import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

interface AudioPlayerProps {
  text: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  text,
  size = "sm",
  variant = "outline",
  className = ""
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [usingWebSpeech, setUsingWebSpeech] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const getPreferredVoiceId = () => localStorage.getItem('tts_voice_id') || 'pFZP5JQG7iQjIQuC4Bku';
  const getPreferredModelId = () => localStorage.getItem('tts_model_id') || 'eleven_multilingual_v2';

  const speakWithWebSpeech = (textToSpeak: string) => {
    try {
      if (!('speechSynthesis' in window)) return false;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const voices = window.speechSynthesis.getVoices();
      const taVoice = voices.find(v => v.lang?.toLowerCase().startsWith('ta'));
      if (taVoice) utterance.voice = taVoice;
      utterance.onstart = () => {
        setUsingWebSpeech(true);
        setIsPlaying(true);
      };
      utterance.onend = () => {
        setIsPlaying(false);
        setUsingWebSpeech(false);
      };
      utterance.onerror = () => {
        setIsPlaying(false);
        setUsingWebSpeech(false);
      };
      window.speechSynthesis.speak(utterance);
      return true;
    } catch {
      return false;
    }
  };

  const generateAudio = async () => {
    if (audioUrl) return audioUrl;

    setIsLoading(true);
    try {
      logger.log('Generating audio for text:', text);
      
      const voiceId = getPreferredVoiceId();
      const modelId = getPreferredModelId();
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voiceId, modelId }
      });

      if (error) {
        logger.error('Error generating audio:', error);
        throw error;
      }

      if (data?.audioContent) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        return url;
      } else {
        throw new Error('No audio content received');
      }
    } catch (error) {
      logger.error('Error generating audio:', error);
      const usedFallback = speakWithWebSpeech(text);
      if (usedFallback) {
        toast({
          title: "Using device voice",
          description: "Network TTS unavailable; using your device's voice.",
        });
        return null;
      }
      toast({
        title: "Error generating audio",
        description: "Failed to generate audio. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = async () => {
    if (isLoading) return;

    // If currently playing, stop it
    if (isPlaying) {
      if (usingWebSpeech) {
        try { window.speechSynthesis?.cancel(); } catch {}
        setIsPlaying(false);
        setUsingWebSpeech(false);
        return;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setIsPlaying(false);
        return;
      }
    }

    // Generate audio if needed
    let url = audioUrl;
    if (!url) {
      url = await generateAudio();
      if (!url) return;
    }

    // Clean up any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }

    try {
      // Create new audio element
      const audio = new Audio(url);
      audioRef.current = audio;

      // Set up event handlers before playing
      audio.onplay = () => {
        logger.log('Audio onplay');
        setIsPlaying(true);
      };

      audio.onended = () => {
        logger.log('Audio ended');
        setIsPlaying(false);
        audioRef.current = null;
      };

      audio.onerror = (e) => {
        logger.error('Audio error event:', e);
        setIsPlaying(false);
        audioRef.current = null;
        toast({
          title: "Playback Error",
          description: "Failed to play audio. Please try again.",
          variant: "destructive",
        });
      };

      // Attempt to play
      await audio.play();
      logger.log('Audio play() resolved');
    } catch (error: any) {
      // Ignore benign AbortError from rapid toggling
      if (error?.name === 'AbortError') {
        logger.warn('Audio play aborted (likely due to rapid pause):', error);
        return;
      }

      logger.error('Error playing audio:', error);
      setIsPlaying(false);
      audioRef.current = null;
      toast({
        title: "Playback Error",
        description: "Failed to start audio playback.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      // Clean up object URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handlePlayPause}
      disabled={isLoading}
      className={`${className} ${isLoading ? 'opacity-70' : ''}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPlaying ? (
        <Pause className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </Button>
  );
};

export default AudioPlayer;
