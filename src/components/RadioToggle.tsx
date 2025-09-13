import React from 'react';
import { Radio } from 'lucide-react';

interface RadioToggleProps {
  onClick: () => void;
  isRadioOpen: boolean;
}

const RadioToggle: React.FC<RadioToggleProps> = ({ onClick, isRadioOpen }) => {
  return (
    <button
      onClick={onClick}
      className={`absolute top-14 left-0 z-50 p-3 rounded-lg border-2 transition-all duration-300 ${
        isRadioOpen 
          ? 'bg-green-600 border-green-500 text-white shadow-lg scale-110' 
          : 'bg-gray-800 border-gray-600 text-green-400 hover:bg-gray-700 hover:scale-105'
      }`}
      style={{
        boxShadow: isRadioOpen 
          ? 'inset -2px -2px 0px #059669, inset 2px 2px 0px #10b981, 0 4px 12px rgba(34, 197, 94, 0.4)'
          : 'inset -2px -2px 0px #374151, inset 2px 2px 0px #6b7280, 0 2px 8px rgba(0,0,0,0.3)',
        imageRendering: 'pixelated'
      }}
      title="Abrir/Fechar Rádio do Caminhão"
    >
      <Radio size={20} />
      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
        isRadioOpen ? 'bg-white animate-pulse' : 'hidden'
      }`} />
    </button>
  );
};

export default RadioToggle;