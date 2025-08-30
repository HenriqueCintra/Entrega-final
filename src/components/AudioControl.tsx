import React from 'react';
import { useAudio } from '../contexts/AudioContext';
import { Volume2, VolumeX } from 'lucide-react';

interface AudioControlProps {
  className?: string;
}

export const AudioControl: React.FC<AudioControlProps> = ({ className = '' }) => {
  const { isPlaying, volume, toggleMusic, setVolume } = useAudio();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={toggleMusic}
        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        title={isPlaying ? 'Pausar música' : 'Tocar música'}
      >
        {isPlaying ? (
          <Volume2 className="w-5 h-5 text-white" />
        ) : (
          <VolumeX className="w-5 h-5 text-white" />
        )}
      </button>
      
      {isPlaying && (
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-20 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
          title="Volume"
        />
      )}
    </div>
  );
};
