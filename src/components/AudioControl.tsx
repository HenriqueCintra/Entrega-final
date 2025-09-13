import React, { useState } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { Music, Volume2, VolumeX, Play, Pause } from 'lucide-react';

interface AudioControlProps {
  className?: string;
  popupAlign?: 'left' | 'right';
}

export const AudioControl: React.FC<AudioControlProps> = ({ className = '', 
popupAlign = 'right' }) => {
  const { isPlaying, volume, toggleMusic, setVolume } = useAudio();
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const handleVolumeChange = (value: number) => {
    setVolume(value / 100); // Converte para 0-1
    setIsMuted(false);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      setVolume(0);
    } else {
      setVolume(0.5); // Restaura para 50%
    }
  };

  const displayVolume = Math.round(volume * 100);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Container */}
      <div className={`relative ${className}`}>
        {/* Botão principal */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-white border-2 border-purple-500 hover:border-purple-600 rounded-xl shadow-lg hover:scale-105 transition-all flex items-center justify-center"
          title="Configurações de áudio"
        >
          <Music size={24} className="text-purple-500" />
        </button>

        {/* Popup */}
        {isOpen && (
          <div className={`absolute top-16 ${popupAlign === 'right' ? 'right-0' : 'left-0'} z-50 bg-white rounded-2xl shadow-2xl p-6 w-72 border border-gray-200`}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Configurações de Áudio</h3>

            {/* Volume da Música */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleMuteToggle}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={isMuted || volume === 0 ? 'Ativar som' : 'Desativar som'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX size={20} className="text-gray-600" />
                  ) : (
                    <Volume2 size={20} className="text-gray-600" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : displayVolume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="flex-1 accent-purple-500"
                  title="Volume da música"
                />
                <span className="text-sm text-gray-600 w-10 text-right">
                  {isMuted ? 0 : displayVolume}
                </span>
              </div>
            </div>

            {/* Controles de Reprodução */}
            <div className="flex justify-center gap-2">
              <button 
                onClick={toggleMusic}
                className="p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full transition-colors"
                title={isPlaying ? 'Pausar música' : 'Tocar música'}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};