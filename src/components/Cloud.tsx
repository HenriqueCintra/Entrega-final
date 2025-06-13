import React from 'react';

interface CloudProps {
  className?: string;
  position: string;
}
// Essas nuvens são usadas para criar um efeito visual de nuvens pixeladas no fundo do jogo. 
// são menores e mais simples que as nuvens do jogo, mas nao exclui a possibilidade de serem usadas no jogo, mas atualmente 
//eelas não estão sendo utilizadas.

const Cloud: React.FC<CloudProps> = ({ className, position }) => {
  return (
    <div className={`pixel-cloud ${position} ${className}`}>
      <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="20" width="20" height="20" fill="#B8B5FF" />
        <rect x="40" y="20" width="20" height="20" fill="#B8B5FF" />
        <rect x="60" y="20" width="20" height="20" fill="#B8B5FF" />
        <rect x="0" y="40" width="20" height="20" fill="#B8B5FF" />
        <rect x="20" y="40" width="20" height="20" fill="#B8B5FF" />
        <rect x="40" y="40" width="20" height="20" fill="#B8B5FF" />
        <rect x="60" y="40" width="20" height="20" fill="#B8B5FF" />
        <rect x="80" y="40" width="20" height="20" fill="#B8B5FF" />
        <rect x="100" y="40" width="20" height="20" fill="#B8B5FF" />
      </svg>
    </div>
  );
};

export default Cloud;