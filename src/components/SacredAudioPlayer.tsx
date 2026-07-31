import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, Loader2 } from "lucide-react";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";

interface SacredAudioPlayerProps {
  audioUrl: string | null;
  audioId: string;
  fallbackText?: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost";
  className?: string;
  disabled?: boolean;
}

/**
 * Audio player component that plays pre-uploaded sacred audio from the database.
 * Falls back to disabled state if no audio URL is available.
 */
export const SacredAudioPlayer: React.FC<SacredAudioPlayerProps> = ({
  audioUrl,
  audioId,
  size = "sm",
  variant = "outline",
  className = "",
  disabled = false,
}) => {
  const { currentAudioId, isPlaying, isLoading, toggleAudio } = useAudioPlayer();

  const isThisPlaying = currentAudioId === audioId && isPlaying;
  const isThisLoading = currentAudioId === audioId && isLoading;

  const handleClick = async () => {
    if (!audioUrl || disabled) return;
    await toggleAudio(audioUrl, audioId);
  };

  // No audio available
  if (!audioUrl) {
    return (
      <Button
        size={size}
        variant={variant}
        disabled
        className={`${className} opacity-50`}
        title="Audio not available"
      >
        <Volume2 className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleClick}
      disabled={disabled || isThisLoading}
      className={`${className} ${isThisLoading ? 'opacity-70' : ''}`}
    >
      {isThisLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isThisPlaying ? (
        <Pause className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </Button>
  );
};

export default SacredAudioPlayer;
