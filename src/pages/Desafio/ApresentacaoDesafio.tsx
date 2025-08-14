import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Home, Trophy, Clock, Users, Truck, Car, ChevronLeft, ChevronRight } from 'lucide-react';
import { ButtonHomeBack } from "@/components/ButtonHomeBack";
import { challenges, Challenge } from "../mapaRota/challengesManager";
import { ChallengeId } from "../mapaRota/constants";

export const ApresentacaoDesafioPage = () => {
  const navigate = useNavigate();

  // Todos os desafios disponíveis: Salvador, Recife e Fortaleza
  const availableChallenges = challenges;

  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [carregando, setCarregando] = useState(false);

  const currentChallenge = availableChallenges[currentChallengeIndex];

  const handlePreviousChallenge = () => {
    setCurrentChallengeIndex((prev) => 
      prev === 0 ? availableChallenges.length - 1 : prev - 1
    );
  };

  const handleNextChallenge = () => {
    setCurrentChallengeIndex((prev) => 
      prev === availableChallenges.length - 1 ? 0 : prev + 1
    );
  };

  const handleAceitarDesafio = () => {
    if (!currentChallenge) return;

    console.log("🎯 DEBUG ApresentacaoDesafio - Desafio selecionado:", currentChallenge.id);
    console.log("🎯 DEBUG ApresentacaoDesafio - Dados enviados:", {
      desafio: currentChallenge,
      challengeId: currentChallenge.id
    });

    setCarregando(true);
    setTimeout(() => {
      setCarregando(false);
      // Passa o desafio selecionado para a próxima tela
      navigate("/select-vehicle", { state: { 
        desafio: currentChallenge,
        challengeId: currentChallenge.id 
      } });
    }, 1500);
  };

  const getChallengeImage = (challengeId: ChallengeId) => {
    // Usando a mesma imagem de fundo, mas poderia ser personalizada por desafio
    return "/api/placeholder/800/200";
  };

  if (!currentChallenge) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-red-400 to-red-600 text-center p-4">
        <div>
          <h1 className="[font-family:'Silkscreen',Helvetica] text-white text-xl mb-4">
            Nenhum desafio disponível.
          </h1>
          <Button onClick={() => navigate('/game-selection')} className="bg-white text-black">
            Voltar para Seleção de Jogos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="w-full min-h-screen [background:linear-gradient(180deg,rgba(32,2,89,1)_0%,rgba(121,70,213,1)_100%)] relative overflow-hidden z-10">
        <div className="flex gap-5 absolute top-4 left-4 z-10">
          <ButtonHomeBack onClick={() => navigate(-1)}><ArrowLeft/></ButtonHomeBack>
          <ButtonHomeBack onClick={() => navigate("/perfil")}><Home/></ButtonHomeBack>
        </div>

        <div className="pt-16 pb-8 px-4 flex justify-center items-center min-h-screen z-10">
          <div className="bg-white rounded-[18px] border-2 border-solid border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full max-w-[1000px] max-h-[85vh] overflow-hidden flex flex-col">
            
            {/* Header com navegação do carrossel */}
            <div className="p-4 border-b-2 border-black bg-gray-50 flex items-center justify-between">
              <Button
                onClick={handlePreviousChallenge}
                className="p-2 bg-[#e3922a] border-2 border-black rounded-md hover:bg-[#d4831f] transition-colors"
                disabled={availableChallenges.length <= 1}
              >
                <ChevronLeft size={20} className="text-white" />
              </Button>
              
              <div className="text-center flex-1">
                <h1 className="text-[22px] [font-family:'Silkscreen',Helvetica] font-bold text-[#e3922a]">
                  {currentChallenge.name}
                </h1>
                <p className="text-[12px] [font-family:'Silkscreen',Helvetica] text-gray-600 mt-1">
                  {currentChallengeIndex + 1} de {availableChallenges.length}
                </p>
              </div>
              
              <Button
                onClick={handleNextChallenge}
                className="p-2 bg-[#e3922a] border-2 border-black rounded-md hover:bg-[#d4831f] transition-colors"
                disabled={availableChallenges.length <= 1}
              >
                <ChevronRight size={20} className="text-white" />
              </Button>
            </div>
            
            <div className="overflow-y-auto p-4 flex-1">
              {/* Imagem do desafio */}
              <div className="border-2 border-black rounded-lg overflow-hidden h-[200px] mb-4 relative">
                <img 
                  src={getChallengeImage(currentChallenge.id)} 
                  alt={`Desafio ${currentChallenge.name}`} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h2 className="text-2xl [font-family:'Silkscreen',Helvetica] font-bold mb-2">
                      JUAZEIRO → {currentChallenge.destination.split(',')[0].toUpperCase()}
                    </h2>
                    <p className="text-sm [font-family:'Silkscreen',Helvetica]">
                      {currentChallenge.routes.length} rota{currentChallenge.routes.length > 1 ? 's' : ''} disponível{currentChallenge.routes.length > 1 ? 'is' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div className="border-2 border-black rounded-lg p-3 bg-gray-50 mb-4">
                <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-[14px] mb-2">DESCRIÇÃO:</h3>
                <p className="[font-family:'Silkscreen',Helvetica] text-[12px]">{currentChallenge.description}</p>
              </div>

              {/* Detalhes */}
              <div className="border-2 border-black rounded-lg p-3 bg-gray-50 mb-4">
                <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-[14px] mb-2">DETALHES:</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <Trophy size={16} className="text-[#e3922a] mr-2 flex-shrink-0" />
                    <span className="[font-family:'Silkscreen',Helvetica] text-[11px]">DIFICULDADE: {currentChallenge.difficulty}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="text-[#e3922a] mr-2 flex-shrink-0" />
                    <span className="[font-family:'Silkscreen',Helvetica] text-[11px]">TEMPO: {currentChallenge.estimatedDuration}</span>
                  </div>
                  <div className="flex items-center col-span-2">
                    <Truck size={16} className="text-[#e3922a] mr-2 flex-shrink-0" />
                    <span className="[font-family:'Silkscreen',Helvetica] text-[11px]">DESTINO: {currentChallenge.destination}</span>
                  </div>
                </div>
              </div>

              {/* Objetivo */}
              <div className="border-2 border-black rounded-lg p-3 bg-gray-50 mb-4">
                <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-[14px] mb-2 text-green-600">OBJETIVO:</h3>
                <p className="[font-family:'Silkscreen',Helvetica] text-[12px] font-bold text-green-600">
                  Transportar carga de Juazeiro para {currentChallenge.destination} escolhendo a melhor rota considerando custos, tempo e segurança.
                </p>
              </div>

              {/* Rotas disponíveis */}
              <div className="border-2 border-dashed border-[#e3922a] rounded-lg p-3 bg-yellow-50 mb-4">
                <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-[14px] mb-2">ROTAS DISPONÍVEIS:</h3>
                <div className="space-y-2">
                  {currentChallenge.routes.slice(0, 3).map((route, index) => (
                    <div key={route.routeId} className="flex items-start">
                      <Truck size={14} className="text-[#e3922a] mr-2 flex-shrink-0 mt-1" />
                      <div>
                        <span className="[font-family:'Silkscreen',Helvetica] text-[11px] font-bold block">
                          Rota {route.routeId}: {route.distance}km
                        </span>
                        <span className="[font-family:'Silkscreen',Helvetica] text-[10px] text-gray-700">
                          {route.estimatedTime} - {route.roads.join(', ')}
                        </span>
                      </div>
                    </div>
                  ))}
                  {currentChallenge.routes.length > 3 && (
                    <p className="[font-family:'Silkscreen',Helvetica] text-[10px] text-gray-600 text-center">
                      +{currentChallenge.routes.length - 3} rota{currentChallenge.routes.length - 3 > 1 ? 's' : ''} adicional{currentChallenge.routes.length - 3 > 1 ? 'is' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t-2 flex justify-center border-black bg-gray-50">
              <Button 
                onClick={handleAceitarDesafio}
                disabled={carregando}
                className="w-1/2 py-3 bg-[#29D8FF] border-2 border-black rounded-md [font-family:'Silkscreen',Helvetica] font-bold text-black text-[16px] hover:bg-[#20B4D2] transform transition-transform duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {carregando ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-4 border-white border-t-black mr-2"></div>
                    CARREGANDO...
                  </>
                ) : (
                  <>
                    <Trophy className="mr-2" size={20} />
                    ACEITAR DESAFIO
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApresentacaoDesafioPage;
