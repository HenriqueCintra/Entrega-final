import React from 'react';

interface SelectTeamButtonProps {
  onClick: () => void;
}

const SelectTeamButton: React.FC<SelectTeamButtonProps> = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="w-[500px] mx-auto bg-orange-500 text-black font-bold py-2 px-6 border-2 border-black mb-2
        hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all 
        hover:-translate-x-[2px] hover:-translate-y-[2px] text-xl"
    >
      ESCOLHER ESSA EQUIPE
    </button>

  );
};

export default SelectTeamButton;