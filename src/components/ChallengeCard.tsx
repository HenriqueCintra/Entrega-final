import React from 'react';
import { FrontendChallenge } from '../services/challengeService';
import { Trophy, Clock, Truck, Car, Package, Minus, Plus } from 'lucide-react';
import { Button } from './ui/button';

interface ChallengeCardProps {
  challenge: FrontendChallenge;
  selectedCargoAmount: number;
  onCargoAmountChange: (amount: number) => void;
  onCustomCargoSubmit: () => void;
  customCargoInput: string;
  setCustomCargoInput: (value: string) => void;
  showCustomInput: boolean;
  setShowCustomInput: (show: boolean) => void;
  onAcceptChallenge: () => void;
  isLoading: boolean;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  selectedCargoAmount,
  onCargoAmountChange,
  onCustomCargoSubmit,
  customCargoInput,
  setCustomCargoInput,
  showCustomInput,
  setShowCustomInput,
  onAcceptChallenge,
  isLoading
}) => {
  // Opções predefinidas de carga
  const cargoOptions = [
    { value: 25, label: "25% - Carga Leve", description: "Menor consumo, maior velocidade" },
    { value: 50, label: "50% - Carga Média", description: "Equilibrio entre eficiência e lucro" },
    { value: 75, label: "75% - Carga Pesada", description: "Maior lucro, menor eficiência" },
    { value: 100, label: "100% - Carga Máxima", description: "Lucro máximo, maior desafio" }
  ];

  const getCargoImpact = (cargoAmount: number) => {
    if (cargoAmount <= 25) return { fuel: "Baixo", speed: "Alta", profit: "Baixo", color: "text-green-600" };
    if (cargoAmount <= 50) return { fuel: "Médio", speed: "Média", profit: "Médio", color: "text-yellow-600" };
    if (cargoAmount <= 75) return { fuel: "Alto", speed: "Baixa", profit: "Alto", color: "text-orange-600" };
    return { fuel: "Muito Alto", speed: "Muito Baixa", profit: "Muito Alto", color: "text-red-600" };
  };

  const getChallengeImage = (challengeId: string) => {
    return "/desafio.png";
  };

  const cargoImpact = getCargoImpact(selectedCargoAmount);

  return (
    <div className="bg-white rounded-[18px] border-2 border-solid border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full max-w-[1000px] max-h-[85vh] overflow-hidden flex flex-col">
      <div className="overflow-y-auto p-4 flex-1">
        {/* Imagem do desafio */}
        <div className="border-2 border-black rounded-lg overflow-hidden h-[200px] mb-4 relative">
          <img 
            src={getChallengeImage(challenge.id)} 
            alt={`Desafio ${challenge.name}`} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-3xl [font-family:'Silkscreen',Helvetica] font-bold mb-2">
                JUAZEIRO → {challenge.destination.split(',')[0].toUpperCase()}
              </h2>
              <p className="text-lg [font-family:'Silkscreen',Helvetica]">
                {challenge.routes.length} rota{challenge.routes.length > 1 ? 's' : ''} disponível{challenge.routes.length > 1 ? 'is' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Seleção de Carga */}
        <div className="border-2 border-black rounded-lg p-4 bg-blue-50 mb-4">
          <div className="flex items-center mb-3">
            <Package size={20} className="text-blue-600 mr-2" />
            <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-[18px] text-blue-600">
              QUANTIDADE DE CARGA: {selectedCargoAmount}%
            </h3>
          </div>

          {/* Botões de seleção rápida */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {cargoOptions.map((option) => (
              <Button
                key={option.value}
                onClick={() => onCargoAmountChange(option.value)}
                className={`p-3 text-left border-2 border-black rounded-md transition-all text-sm ${
                  selectedCargoAmount === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-black hover:bg-blue-100'
                }`}
              >
                <div>
                  <div className="[font-family:'Silkscreen',Helvetica] font-bold text-[14px]">
                    {option.label}
                  </div>
                  <div className="[font-family:'Silkscreen',Helvetica] text-[12px] opacity-80">
                    {option.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>

          {/* Controles personalizados */}
          <div className="flex items-center gap-3 mb-4">
            <Button
              onClick={() => onCargoAmountChange(selectedCargoAmount - 5)}
              className="p-2 bg-gray-300 border border-black rounded text-black hover:bg-gray-400"
              disabled={selectedCargoAmount <= 5}
            >
              <Minus size={16} />
            </Button>
            
            <div className="flex-1 bg-gray-200 rounded-full h-4 border border-black">
              <div 
                className={`h-full rounded-full transition-all ${cargoImpact.color.includes('green') ? 'bg-green-500' : 
                  cargoImpact.color.includes('yellow') ? 'bg-yellow-500' : 
                  cargoImpact.color.includes('orange') ? 'bg-orange-500' : 'bg-red-500'}`}
                style={{ width: `${selectedCargoAmount}%` }}
              ></div>
            </div>
            
            <Button
              onClick={() => onCargoAmountChange(selectedCargoAmount + 5)}
              className="p-2 bg-gray-300 border border-black rounded text-black hover:bg-gray-400"
              disabled={selectedCargoAmount >= 100}
            >
              <Plus size={16} />
            </Button>
          </div>

          {/* Input customizado */}
          <div className="flex items-center gap-2 mb-3">
            {showCustomInput ? (
              <div className="flex gap-2 flex-1">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={customCargoInput}
                  onChange={(e) => setCustomCargoInput(e.target.value)}
                  className="flex-1 p-2 border-2 border-black rounded text-center [font-family:'Silkscreen',Helvetica] text-base"
                  placeholder="1-100"
                />
                <Button
                  onClick={onCustomCargoSubmit}
                  className="px-3 py-2 bg-green-600 text-white border border-black rounded text-sm"
                >
                  OK
                </Button>
                <Button
                  onClick={() => setShowCustomInput(false)}
                  className="px-3 py-2 bg-gray-600 text-white border border-black rounded text-sm"
                >
                  ✕
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowCustomInput(true)}
                className="w-full py-3 bg-gray-200 border-2 border-black rounded [font-family:'Silkscreen',Helvetica] text-black text-sm hover:bg-gray-300"
              >
                INSERIR VALOR PERSONALIZADO
              </Button>
            )}
          </div>

          {/* Impacto da carga */}
          <div className="mt-3 p-3 bg-white border border-black rounded">
            <h4 className="[font-family:'Silkscreen',Helvetica] font-bold text-[14px] mb-2">IMPACTO:</h4>
            <div className="grid grid-cols-3 gap-2 text-[13px] [font-family:'Silkscreen',Helvetica]">
              <div>Combustível: <span className={cargoImpact.color}>{cargoImpact.fuel}</span></div>
              <div>Velocidade: <span className={cargoImpact.color}>{cargoImpact.speed}</span></div>
              <div>Lucro: <span className={cargoImpact.color}>{cargoImpact.profit}</span></div>
            </div>
          </div>
        </div>

        {/* Descrição */}
        <div className="border-2 border-black rounded-lg p-4 bg-gray-50 mb-4">
          <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-[18px] mb-3">DESCRIÇÃO:</h3>
          <p className="[font-family:'Silkscreen',Helvetica] text-[15px] leading-relaxed">{challenge.description}</p>
        </div>

        {/* Detalhes */}
        <div className="border-2 border-black rounded-lg p-4 bg-gray-50 mb-4">
          <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-[18px] mb-3">DETALHES:</h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center">
              <Trophy size={18} className="text-[#e3922a] mr-3 flex-shrink-0" />
              <span className="[font-family:'Silkscreen',Helvetica] text-[14px]">DIFICULDADE: {challenge.difficulty}</span>
            </div>
            <div className="flex items-center">
              <Clock size={18} className="text-[#e3922a] mr-3 flex-shrink-0" />
              <span className="[font-family:'Silkscreen',Helvetica] text-[14px]">TEMPO: {challenge.estimatedDuration}</span>
            </div>
            <div className="flex items-center">
              <Truck size={18} className="text-[#e3922a] mr-3 flex-shrink-0" />
              <span className="[font-family:'Silkscreen',Helvetica] text-[14px]">DESTINO: {challenge.destination}</span>
            </div>
          </div>
        </div>

        {/* Objetivo */}
        <div className="border-2 border-black rounded-lg p-4 bg-gray-50 mb-4">
          <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-[18px] mb-3 text-green-600">OBJETIVO:</h3>
          <p className="[font-family:'Silkscreen',Helvetica] text-[15px] font-bold text-green-600 leading-relaxed">
            {challenge.objective || `Transportar carga de Juazeiro para ${challenge.destination} escolhendo a melhor rota considerando custos, tempo e segurança.`}
          </p>
        </div>

        {/* Ferramentas (se disponível)
        {challenge.tools && challenge.tools.length > 0 && (
          <div className="border-2 border-black rounded-lg p-4 bg-blue-50 mb-4">
            <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-[18px] mb-3 text-blue-600">FERRAMENTAS DISPONÍVEIS:</h3>
            <div className="space-y-3">
              {challenge.tools.map((tool, index) => (
                <div key={index} className="flex items-start">
                  <Car size={16} className="text-blue-600 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <span className="[font-family:'Silkscreen',Helvetica] text-[14px] font-bold block text-blue-600">
                      {tool.type}
                    </span>
                    <span className="[font-family:'Silkscreen',Helvetica] text-[13px] text-gray-700">
                      {tool.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}

        {/* Rotas disponíveis */}
        <div className="border-2 border-dashed border-[#e3922a] rounded-lg p-4 bg-yellow-50 mb-4">
          <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-[18px] mb-3">ROTAS DISPONÍVEIS:</h3>
          <div className="space-y-3">
            {challenge.routes.slice(0, 3).map((route, index) => (
              <div key={route.routeId} className="flex items-start">
                <Truck size={16} className="text-[#e3922a] mr-3 flex-shrink-0 mt-1" />
                <div>
                  <span className="[font-family:'Silkscreen',Helvetica] text-[14px] font-bold block">
                    Rota {route.routeId}: {route.distance}km
                  </span>
                  <span className="[font-family:'Silkscreen',Helvetica] text-[13px] text-gray-700">
                    {route.estimatedTime} - {route.roadConditions} - {route.safety.robberyRisk} risco
                  </span>
                </div>
              </div>
            ))}
            {challenge.routes.length > 3 && (
              <p className="[font-family:'Silkscreen',Helvetica] text-[13px] text-gray-600 text-center">
                +{challenge.routes.length - 3} rota{challenge.routes.length - 3 > 1 ? 's' : ''} adicional{challenge.routes.length - 3 > 1 ? 'is' : ''}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t-2 flex justify-center border-black bg-gray-50">
        <Button 
          onClick={onAcceptChallenge}
          disabled={isLoading}
          className="w-1/2 py-4 bg-[#29D8FF] border-2 border-black rounded-md [font-family:'Silkscreen',Helvetica] font-bold text-black text-[18px] hover:bg-[#20B4D2] transform transition-transform duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-black mr-3"></div>
              CARREGANDO...
            </>
          ) : (
            <>
              <Trophy className="mr-3" size={24} />
              ACEITAR DESAFIO ({selectedCargoAmount}%)
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
