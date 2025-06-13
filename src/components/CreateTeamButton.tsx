import React from 'react';
import { Plus } from 'lucide-react';

interface CreateTeamButtonProps {
  onClick: () => void;
}

const CreateTeamButton: React.FC<CreateTeamButtonProps> = ({ onClick }) => {
  return (
    <div 
      onClick={onClick} 
      className=" bg-white border-2 border-black rounded-lg p-6 flex flex-col items-center justify-center h-22 cursor-pointer 
        hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px]"
    >
      <div className="w-8 h-8 rounded-full border-2 border-cyan-400 flex items-center justify-center">
        <Plus size={32} className="text-cyan-400" />
      </div>
      <span className="font-pixel text-cyan-400 text-center mt-4">CRIAR NOVA EQUIPE</span>
    </div>
  );
};

export default CreateTeamButton;