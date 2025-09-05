// Componente para seleção de desafios
import React, { useState } from 'react';
import { challenges, Challenge } from './challengesManager';
import { ChallengeId } from './constants';

interface ChallengeSelectorProps {
  onChallengeSelect: (challengeId: ChallengeId) => void;
  selectedChallenge?: ChallengeId;
}

export const ChallengeSelector: React.FC<ChallengeSelectorProps> = ({
  onChallengeSelect,
  selectedChallenge
}) => {
  return (
    <div className="bg-[#FFC06F] p-4 rounded-lg shadow-md border-2 border-black mb-6">
      <h2 className="text-xl font-['Silkscreen'] font-bold mb-3 text-black text-center border-b-2 border-black pb-2">
        SELECIONE O DESAFIO
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className={`
              p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
              ${selectedChallenge === challenge.id
                ? 'bg-green-500 border-green-700 text-white'
                : 'bg-white border-gray-300 hover:bg-gray-100'
              }
            `}
            onClick={() => onChallengeSelect(challenge.id)}
          >
            <h3 className="font-['Silkscreen'] font-bold text-lg mb-2">
              {challenge.name}
            </h3>
            <p className="text-sm mb-2">{challenge.description}</p>
            <div className="text-xs">
              <p><strong>Destino:</strong> {challenge.destination}</p>
              <p><strong>Dificuldade:</strong> {challenge.difficulty}</p>
              <p><strong>Duração:</strong> {challenge.estimatedDuration}</p>
              <p><strong>Rotas:</strong> {challenge.routes.length} disponíveis</p>
            </div>
          </div>
        ))}
      </div>

      {selectedChallenge && (
        <div className="mt-4 p-3 bg-green-100 border-2 border-green-500 rounded-lg">
          <p className="font-['Silkscreen'] text-green-800 text-center">
            ✅ Desafio selecionado: {challenges.find(c => c.id === selectedChallenge)?.name}
          </p>
        </div>
      )}
    </div>
  );
};