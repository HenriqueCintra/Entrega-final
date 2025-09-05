import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAudio } from '../contexts/AudioContext';

export const AudioManager = () => {
  const location = useLocation();
  const { playMenuMusic, stopMenuMusic, userPaused } = useAudio();
  const hasInitialized = useRef(false);
  const lastPathname = useRef(location.pathname);

  useEffect(() => {
    // Parar a música quando estiver no jogo
    if (location.pathname === '/game') {
      stopMenuMusic();
    } else {
      // Só tocar música se:
      // 1. Não estiver pausada pelo usuário
      // 2. Não estivesse no jogo antes (evita tocar quando sai do jogo)
      if (!userPaused && lastPathname.current !== '/game') {
        const timer = setTimeout(() => {
          playMenuMusic();
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
    
    lastPathname.current = location.pathname;
  }, [location.pathname, playMenuMusic, stopMenuMusic, userPaused]);

  // Efeito para iniciar a música apenas na primeira carga
  useEffect(() => {
    if (!hasInitialized.current && location.pathname !== '/game') {
      hasInitialized.current = true;
      const initialTimer = setTimeout(() => {
        playMenuMusic();
      }, 1000);
      
      return () => clearTimeout(initialTimer);
    }
  }, [location.pathname, playMenuMusic]);

  return null; // Este componente não renderiza nada
};
