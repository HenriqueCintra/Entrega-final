import { useEffect, useRef } from 'react';
import { KaboomCtx } from 'kaboom';
import { setupRainSystem } from './rainSystem';

interface RainEffectProps {
  k: KaboomCtx;
}

export const RainEffect: React.FC<RainEffectProps> = ({ k }) => {
  const rainControllerRef = useRef<any>(null);

  useEffect(() => {
    // Inicia o sistema de chuva
    if (k) {
      rainControllerRef.current = setupRainSystem(k);
    }

    // A função de limpeza do useEffect é a chave!
    // Ela é chamada quando o componente é desmontado.
    return () => {
      if (rainControllerRef.current) {
        rainControllerRef.current.stopRain();
        console.log("☀️ Sistema de chuva parado e limpo.");
      }
    };
  }, [k]);

  return null; // Este componente não renderiza nada na tela
};
