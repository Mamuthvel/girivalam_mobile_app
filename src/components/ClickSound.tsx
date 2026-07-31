import React, { useCallback } from 'react';

interface ClickSoundProps {
  children: React.ReactNode;
  soundText?: string;
  className?: string;
  onClick?: () => void;
}

// Set to true to use ElevenLabs API (requires paid subscription)
// Set to false to use browser's native TTS only
const USE_ELEVENLABS = false;

export const ClickSound: React.FC<ClickSoundProps> = ({
  children,
  soundText = "Om Namah Shivaya",
  className = "",
  onClick
}) => {
  // Browser's native TTS (free, works offline)
  const speakWithBrowserTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.7;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Use browser TTS only (ElevenLabs disabled due to free tier block)
    if (!USE_ELEVENLABS) {
      speakWithBrowserTTS(soundText);
    }
    
    // Call the original onClick if provided
    if (onClick) {
      onClick();
    }
  }, [onClick, soundText]);

  return (
    <div className={className} onClick={handleClick}>
      {children}
    </div>
  );
};
