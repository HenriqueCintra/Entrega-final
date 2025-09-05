import React from 'react';
import { Team } from '../types';
import { Users, Trophy, Truck, ListChecks } from 'lucide-react';
import clsx from 'clsx';

interface TeamCardProps {
  team: Team;
  onClick?: () => void;
  selected?: boolean;
}

const TeamCard = ({ team, onClick, selected }: TeamCardProps) => {
  return (
    <div 
      className={clsx(
        'p-4 border-2 border-black transition-all cursor-pointer bg-white',
        'hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
        'hover:-translate-x-[2px] hover:-translate-y-[2px]',
        selected ? 'ring-4 ring-yellow-400' : ''
      )}
      onClick={onClick}
    >
      
      <div className="flex items-start">
        {/* Main Team Info */}
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gray-300 border-2 border-black"></div>
          <div className="flex-1">
            <h3 className="font-pixel text-xl font-bold">{team.nome}</h3>
            <div className="flex space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <Users size={18} />
                <span className="font-pixel">{team.stats.people}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Trophy size={18} />
                <span className="font-pixel">{team.stats.trophy}</span>
              </div>
              
              {team.stats.trucks && (
                <div className="flex items-center space-x-1">
                  <Truck size={18} />
                  <span className="font-pixel">{team.stats.trucks}</span>
                </div>
              )}
              
              {team.stats.tasks && (
                <div className="flex items-center space-x-1">
                  <ListChecks size={18} />
                  <span className="font-pixel">{team.stats.tasks}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Cards */}
        {team.history && (
          <div className="flex ml-auto gap-2 w-[850px]">
            {team.history.map((historyItem) => (
              <div
                key={historyItem.id}
                className={clsx(
                  'p-2 border-2 border-black flex-1',
                  historyItem.color
                )}
              >
                <h4 className="font-pixel text-sm font-bold mb-2">{historyItem.name}</h4>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center space-x-1">
                    <Users size={14} />
                    <span className="font-pixel text-sm">{historyItem.stats.people}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Trophy size={14} />
                    <span className="font-pixel text-sm">{historyItem.stats.trophy}</span>
                  </div>
                  {historyItem.stats.tasks && (
                    <div className="flex items-center space-x-1">
                      <ListChecks size={14} />
                      <span className="font-pixel text-sm">{historyItem.stats.tasks}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamCard;