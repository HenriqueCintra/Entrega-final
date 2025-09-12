import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Home, Trophy, Clock, Users, Truck, Car, ChevronLeft, ChevronRight, Loader2, Package, Minus, Plus } from 'lucide-react';
import { ButtonHomeBack } from "@/components/ButtonHomeBack";
import { AudioControl } from "@/components/AudioControl";
import { fetchChallengesFromBackend, FrontendChallenge } from "../../services/challengeService";

export const ApresentacaoDesafioPage = () => {
  const navigate = useNavigate();

  // Estados para gerenciar os desafios do backend
  const [availableChallenges, setAvailableChallenges] = useState<FrontendChallenge[]>([]);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [carregandoDesafios, setCarregandoDesafios] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Estados para seleção de carga
  const [selectedCargoAmount, setSelectedCargoAmount] = useState(100); // Em percentual (100% = carga completa)
  const [customCargoInput, setCustomCargoInput] = useState("100");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const currentChallenge = availableChallenges[currentChallengeIndex];

  // Opções predefinidas de carga
  const cargoOptions = [
    { value: 25, label: "25% - Carga Leve", description: "Menor consumo, maior velocidade" },
    { value: 50, label: "50% - Carga Média", description: "Equilibrio entre eficiência e lucro" },
    { value: 75, label: "75% - Carga Pesada", description: "Maior lucro, menor eficiência" },
    { value: 100, label: "100% - Carga Máxima", description: "Lucro máximo, maior desafio" }
  ];

  // Carregar desafios do backend ao montar o componente
  useEffect(() => {
    const loadChallenges = async () => {
      try {
        setCarregandoDesafios(true);
        setErro(null);
        
        console.log("🔍 Iniciando carregamento de desafios...");
        
        const challenges = await fetchChallengesFromBackend();
        
        console.log("🔍 Challenges recebidos:", challenges);
        
        if (challenges.length === 0) {
          setErro("Nenhum desafio encontrado no backend. Verifique se as seeds foram executadas.");
          return;
        }
        
        setAvailableChallenges(challenges);
        console.log("🎯 Desafios carregados com sucesso:", challenges);
      } catch (error) {
        console.error("❌ Erro ao carregar desafios:", error);
        
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        
        // Se for erro de autenticação, redirecionar para login
        if (errorMessage.includes('não autenticado') || errorMessage.includes('Sessão expirada')) {
          navigate('/login', { 
            state: { from: { pathname: '/desafios' } },
            replace: true 
          });
          return;
        }
        
        setErro(errorMessage);
      } finally {
        setCarregandoDesafios(false);
      }
    };

    loadChallenges();
  }, []);

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

  const handleCargoAmountChange = (amount: number) => {
    setSelectedCargoAmount(Math.max(1, Math.min(100, amount)));
    setCustomCargoInput(amount.toString());
    setShowCustomInput(false);
  };

  const handleCustomCargoSubmit = () => {
    const amount = parseInt(customCargoInput);
    if (!isNaN(amount) && amount >= 1 && amount <= 100) {
      setSelectedCargoAmount(amount);
      setShowCustomInput(false);
    } else {
      alert("Por favor, insira um valor entre 1% e 100%");
    }
  };

  const getCargoImpact = (cargoAmount: number) => {
    if (cargoAmount <= 25) return { fuel: "Baixo", speed: "Alta", profit: "Baixo", color: "text-green-600" };
    if (cargoAmount <= 50) return { fuel: "Médio", speed: "Média", profit: "Médio", color: "text-yellow-600" };
    if (cargoAmount <= 75) return { fuel: "Alto", speed: "Baixa", profit: "Alto", color: "text-orange-600" };
    return { fuel: "Muito Alto", speed: "Muito Baixa", profit: "Muito Alto", color: "text-red-600" };
  };

  const handleAceitarDesafio = () => {
    if (!currentChallenge) return;

    console.log("🎯 DEBUG ApresentacaoDesafio - Desafio selecionado:", currentChallenge.id);
    console.log("🎯 DEBUG ApresentacaoDesafio - Backend ID:", currentChallenge.backendId);
    console.log("🎯 DEBUG ApresentacaoDesafio - Quantidade de carga:", selectedCargoAmount);
    console.log("🎯 DEBUG ApresentacaoDesafio - Dados enviados:", {
      desafio: currentChallenge,
      challengeId: currentChallenge.backendId || currentChallenge.id,
      cargoAmount: selectedCargoAmount
    });

    setCarregando(true);
    setTimeout(() => {
      setCarregando(false);
      // Passa o desafio selecionado e a quantidade de carga para a próxima tela
      navigate("/select-vehicle", { state: { 
        desafio: currentChallenge,
        challengeId: currentChallenge.backendId || currentChallenge.id,
        cargoAmount: selectedCargoAmount
      } });
    }, 1500);
  };

  const getChallengeImage = (challengeId: string) => {
    // Usando a mesma imagem de fundo, mas poderia ser personalizada por desafio
    return "/desafio.png";
  };

  // Tela de carregamento
  if (carregandoDesafios) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-purple-600 to-blue-600 text-center p-4">
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <Loader2 className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h1 className="[font-family:'Silkscreen',Helvetica] text-purple-600 text-2xl mb-2">
            Carregando Desafios...
          </h1>
          <p className="[font-family:'Silkscreen',Helvetica] text-gray-600 text-base">
            Buscando dados do servidor
          </p>
        </div>
      </div>
    );
  }

  // Tela de erro
  if (erro || !currentChallenge) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-red-400 to-red-600 text-center p-4">
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <h1 className="[font-family:'Silkscreen',Helvetica] text-red-600 text-2xl mb-4">
            {erro || "Nenhum desafio disponível."}
          </h1>
          <div className="space-y-2">
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white mr-2 text-base px-4 py-2"
            >
              Tentar Novamente
            </Button>
            <Button 
              onClick={() => navigate('/game-selection')} 
              className="bg-gray-600 text-white text-base px-4 py-2"
            >
              Voltar para Seleção de Jogos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const cargoImpact = getCargoImpact(selectedCargoAmount);

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="w-full min-h-screen [background:linear-gradient(180deg,rgba(32,2,89,1)_0%,rgba(121,70,213,1)_100%)] relative overflow-hidden z-10">
        <div className="flex gap-5 absolute top-4 left-4 z-10">
          <ButtonHomeBack onClick={() => navigate(-1)}><ArrowLeft/></ButtonHomeBack>
          <ButtonHomeBack onClick={() => navigate("/perfil")}><Home/></ButtonHomeBack>
        </div>

        <div className="absolute top-4 right-4 z-10">
          <AudioControl />
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
                <ChevronLeft size={24} className="text-white" />
              </Button>
              
              <div className="text-center flex-1">
                <h1 className="text-[28px] [font-family:'Silkscreen',Helvetica] font-bold text-[#e3922a]">
                  {currentChallenge.name}
                </h1>
                <p className="text-[16px] [font-family:'Silkscreen',Helvetica] text-gray-600 mt-1">
                  {currentChallengeIndex + 1} de {availableChallenges.length}
                </p>
              </div>
              
              <Button
                onClick={handleNextChallenge}
                className="p-2 bg-[#e3922a] border-2 border-black rounded-md hover:bg-[#d4831f] transition-colors"
                disabled={availableChallenges.length <= 1}
              >
                <ChevronRight size={24} className="text-white" />
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
                    <h2 className="text-3xl [font-family:'Silkscreen',Helvetica] font-bold mb-2">
                      JUAZEIRO → {currentChallenge.destination.split(',')[0].toUpperCase()}
                    </h2>
                    <p className="text-lg [font-family:'Silkscreen',Helvetica]">
                      {currentChallenge.routes.length} rota{currentChallenge.routes.length > 1 ? 's' : ''} disponível{currentChallenge.routes.length > 1 ? 'is' : ''}
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
                      onClick={() => handleCargoAmountChange(option.value)}
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
                    onClick={() => handleCargoAmountChange(selectedCargoAmount - 5)}
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
                    onClick={() => handleCargoAmountChange(selectedCargoAmount + 5)}
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
                        onClick={handleCustomCargoSubmit}
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
                <p className="[font-family:'Silkscreen',Helvetica] text-[15px] leading-relaxed">{currentChallenge.description}</p>
              </div>

              {/* Detalhes */}
              <div className="border-2 border-black rounded-lg p-4 bg-gray-50 mb-4">
                <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-[18px] mb-3">DETALHES:</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center">
                    <Trophy size={18} className="text-[#e3922a] mr-3 flex-shrink-0" />
                    <span className="[font-family:'Silkscreen',Helvetica] text-[14px]">DIFICULDADE: {currentChallenge.difficulty}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={18} className="text-[#e3922a] mr-3 flex-shrink-0" />
                    <span className="[font-family:'Silkscreen',Helvetica] text-[14px]">TEMPO: {currentChallenge.estimatedDuration}</span>
                  </div>
                  <div className="flex items-center">
                    <Truck size={18} className="text-[#e3922a] mr-3 flex-shrink-0" />
                    <span className="[font-family:'Silkscreen',Helvetica] text-[14px]">DESTINO: {currentChallenge.destination}</span>
                  </div>
                </div>
              </div>

              {/* Objetivo */}
              <div className="border-2 border-black rounded-lg p-4 bg-gray-50 mb-4">
                <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-[18px] mb-3 text-green-600">OBJETIVO:</h3>
                <p className="[font-family:'Silkscreen',Helvetica] text-[15px] font-bold text-green-600 leading-relaxed">
                  {currentChallenge.objective || `Transportar carga de Juazeiro para ${currentChallenge.destination} escolhendo a melhor rota considerando custos, tempo e segurança.`}
                </p>
              </div>

              {/* Ferramentas (se disponível) */}
              {currentChallenge.tools && currentChallenge.tools.length > 0 && (
                <div className="border-2 border-black rounded-lg p-4 bg-blue-50 mb-4">
                  <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-[18px] mb-3 text-blue-600">FERRAMENTAS DISPONÍVEIS:</h3>
                  <div className="space-y-3">
                    {currentChallenge.tools.map((tool, index) => (
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
              )}

              {/* Rotas disponíveis */}
              <div className="border-2 border-dashed border-[#e3922a] rounded-lg p-4 bg-yellow-50 mb-4">
                <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-[18px] mb-3">ROTAS DISPONÍVEIS:</h3>
                <div className="space-y-3">
                  {currentChallenge.routes.slice(0, 3).map((route, index) => (
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
                  {currentChallenge.routes.length > 3 && (
                    <p className="[font-family:'Silkscreen',Helvetica] text-[13px] text-gray-600 text-center">
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
                className="w-1/2 py-4 bg-[#29D8FF] border-2 border-black rounded-md [font-family:'Silkscreen',Helvetica] font-bold text-black text-[18px] hover:bg-[#20B4D2] transform transition-transform duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {carregando ? (
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
        </div>
      </div>
    </div>
  );
};

export default ApresentacaoDesafioPage;