import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Home, Loader2 } from 'lucide-react';
import { ButtonHomeBack } from "@/components/ButtonHomeBack";
import { AudioControl } from "@/components/AudioControl";
import { fetchChallengesFromBackend, FrontendChallenge } from "../../services/challengeService";
import { ChallengeCard } from "../../components/ChallengeCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

export const ApresentacaoDesafioPage = () => {
  const navigate = useNavigate();

  // Estados para gerenciar os desafios do backend
  const [availableChallenges, setAvailableChallenges] = useState<FrontendChallenge[]>([]);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [carregandoDesafios, setCarregandoDesafios] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [api, setApi] = useState<CarouselApi>();

  // Estados para seleção de carga
  const [selectedCargoAmount, setSelectedCargoAmount] = useState(100); // Em percentual (100% = carga completa)
  const [customCargoInput, setCustomCargoInput] = useState("100");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const currentChallenge = availableChallenges[currentChallengeIndex];


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

  // Sincronizar o carrossel com o índice atual
  useEffect(() => {
    if (api) {
      api.scrollTo(currentChallengeIndex);
    }
  }, [api, currentChallengeIndex]);

  // Sincronizar o índice quando o carrossel mudar
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentChallengeIndex(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

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

        <div className="pt-8   pb-8 px-4 flex flex-col justify-center items-center min-h-screen z-10">
          {/* Carrossel de desafios */}
          <div className="relative w-full max-w-[1200px] px-4 sm:px-16">
            <Carousel
              setApi={setApi}
              className="w-full"
              opts={{
                align: "center",
                loop: true,
              }}
            >
              <CarouselContent className="ml-2 justify-center items-center sm:-ml-4 py-6 px-4 mb-4">
                {availableChallenges.map((challenge) => (
                  <CarouselItem key={challenge.id} className="basis-full pl-2 sm:pl-4">
                    <ChallengeCard
                      challenge={challenge}
                      selectedCargoAmount={selectedCargoAmount}
                      onCargoAmountChange={handleCargoAmountChange}
                      onCustomCargoSubmit={handleCustomCargoSubmit}
                      customCargoInput={customCargoInput}
                      setCustomCargoInput={setCustomCargoInput}
                      showCustomInput={showCustomInput}
                      setShowCustomInput={setShowCustomInput}
                      onAcceptChallenge={handleAceitarDesafio}
                      isLoading={carregando}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious className="hidden md:flex opacity-100 -left-16 h-14 w-14 bg-[#e3922a] hover:bg-[#d4831f] transition-all duration-300 ease-in-out hover:scale-110 text-white border-2 border-black rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
              <CarouselNext className="hidden transition-all duration-300 ease-in-out hover:scale-110 md:flex opacity-100 -right-16 h-14 w-14 bg-[#e3922a] hover:bg-[#d4831f] text-white border-2 border-black rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
            </Carousel>
          </div>

          {/* Indicadores na parte de baixo */}
          {/* {availableChallenges.length > 1 && (
            <div className="flex justify-center space-x-2 mt-6">
              {availableChallenges.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentChallengeIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentChallengeIndex === index
                      ? 'bg-[#e3922a] scale-125'
                      : 'bg-gray-400 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default ApresentacaoDesafioPage;