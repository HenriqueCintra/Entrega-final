import React from 'react';
import './PixelProgressBar.css'; // Vamos criar este arquivo de estilo a seguir

interface PixelProgressBarProps {
  progress: number; // Progresso de 0 a 100
  className?: string;
}

export const PixelProgressBar: React.FC<PixelProgressBarProps> = ({
  progress,
  className = ''
}) => {
  // Garante que o progresso não passe de 100% ou seja menor que 0
  const cappedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`pixel-progress-bar-container ${className}`}>
      {/* Container externo que dá o visual da "caixa" */}
      <div className="pixel-progress-bar">
        {/* Barra interna que representa o preenchimento */}
        <div
          className="pixel-progress-bar-inner"
          style={{ width: `${cappedProgress}%` }}
        ></div>
      </div>
      {/* Texto de porcentagem */}
      <span className="pixel-progress-bar-text">
        {Math.floor(cappedProgress)}%
      </span>
    </div>
  );
};