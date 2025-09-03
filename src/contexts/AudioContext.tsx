import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface AudioContextType {
  isPlaying: boolean;
  volume: number;
  userPaused: boolean;
  playMenuMusic: () => void;
  stopMenuMusic: () => void;
  pauseMenuMusic: () => void;
  setVolume: (volume: number) => void;
  toggleMusic: () => void;
  setUserPaused: (paused: boolean) => void;
  resetUserPaused: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio deve ser usado dentro de um AudioProvider');
  }
  return context;
};

interface AudioProviderProps {
  children: React.ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [userPaused, setUserPaused] = useState(false);

  useEffect(() => {
    // Criar o elemento de áudio
    audioRef.current = new Audio('/audio/menu-music.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
    audioRef.current.preload = 'auto';

    // Event listeners
    const audio = audioRef.current;
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleCanPlayThrough = () => {
      // Quando o áudio estiver carregado, tentar reproduzir automaticamente
      audio.play().catch(error => {
        console.log('Autoplay bloqueado pelo navegador:', error);
      });
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);

    // Cleanup
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.pause();
    };
  }, []);

  const playMenuMusic = () => {
    if (audioRef.current && !isPlaying && !userPaused) {
      audioRef.current.play().catch(error => {
        console.error('Erro ao reproduzir música:', error);
      });
    }
  };

  const stopMenuMusic = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
    }
  };

  const pauseMenuMusic = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
    }
  };

  const setVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  };

  const toggleMusic = () => {
    if (isPlaying) {
      pauseMenuMusic();
      setUserPaused(true);
    } else {
      playMenuMusic();
      setUserPaused(false);
    }
  };

  const resetUserPaused = () => {
    setUserPaused(false);
  };

  const value: AudioContextType = {
    isPlaying,
    volume,
    userPaused,
    playMenuMusic,
    stopMenuMusic,
    pauseMenuMusic,
    setVolume,
    toggleMusic,
    setUserPaused,
    resetUserPaused,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};
