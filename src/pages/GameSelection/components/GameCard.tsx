import React from 'react';

interface GameCardProps {
  title: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
  borderColor: string;
  buttonBgColor: string;
  buttonHoverColor: string;
  icon: React.ReactNode;
}

const GameCard: React.FC<GameCardProps> = ({ 
  title, 
  description, 
  isActive, 
  onClick,
  borderColor,
  buttonBgColor,
  buttonHoverColor,
  icon
}) => {
  return (
    <div 
      className={`
        bg-white overflow-hidden transition-all duration-300 flex flex-col hover:opacity-100 hover:scale-100
        border-t-4 ${borderColor} 
        ${isActive ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}
      `}
      onClick={onClick}
      style={{ fontFamily: "'Press Start 2P', cursive" }}
    >
      <div className="bg-gray-300 aspect-video flex items-center justify-center">
        <div className={`${isActive ? 'text-gray-700' : 'text-gray-400'}`}>
          {icon}
        </div>
      </div>
      
      <div className="p-6 flex-grow">
        <h3 className={`text-center font-bold text-sm mb-4 leading-relaxed ${isActive ? 'text-black' : 'text-gray-400'}`}>
          {title}
        </h3>
        
        <p className={`text-center text-[8px] leading-relaxed ${isActive ? 'text-black' : 'text-gray-400'}`}>
          {description}
        </p>
      </div>
      
      <div className="p-4">
        <button 
          className={`
            w-full py-3 text-center text-sm
            transition-colors duration-200
            ${buttonBgColor} ${buttonHoverColor}
            ${isActive ? 'text-black' : 'text-gray-500'}
          `}
        >
          JOGAR
        </button>
      </div>
    </div>
  );
};

export default GameCard;