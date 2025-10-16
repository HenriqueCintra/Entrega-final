import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Home, Loader2 } from 'lucide-react';
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

const STORAGE_KEY = 'challenge_flow_data';

const saveToSessionStorage = (data: any) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error("Erro ao salvar no sessionStorage:", error);
  }
};

export const ApresentacaoDesafioPage = () => {
  const navigate = useNavigate();

  const [availableChallenges, setAvailableChallenges] = useState<FrontendChallenge[]>([]);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [carregandoDesafios, setCarregandoDesafios] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [api, setApi] = useState<CarouselApi>();

  const [selectedCargoAmount, setSelectedCargoAmount] = useState(100);
  const [customCargoInput, setCustomCargoInput] = useState("100");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const currentChallenge = availableChallenges[currentChallengeIndex];
  const canInteract = !carregandoDesafios && !erro && !isNavigating && !!currentChallenge;

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        setCarregandoDesafios(true);
        setErro(null);

        const challenges = await fetchChallengesFromBackend();

        if (challenges.length === 0) {
          setErro("Nenhum desafio encontrado no backend. Verifique se as seeds foram executadas.");
          return;
        }

        setAvailableChallenges(challenges);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

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
  }, [navigate]);

  useEffect(() => {
    if (api) {
      api.scrollTo(currentChallengeIndex);
    }
  }, [api, currentChallengeIndex]);

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
    if (!canInteract) return;

    if (currentChallengeIndex < 0 || currentChallengeIndex >= availableChallenges.length) {
      alert("Erro ao selecionar desafio. Tente recarregar a página.");
      return;
    }

    const challengeToNavigate = availableChallenges[currentChallengeIndex];

    if (!challengeToNavigate) {
      alert("Erro ao carregar dados do desafio. Tente novamente.");
      return;
    }

    if (!challengeToNavigate.id) {
      alert("Erro: Desafio inválido (sem ID). Por favor, selecione outro desafio.");
      return;
    }

    const requiredFields = ['name', 'routes'];
    const missingFields = requiredFields.filter(field => !challengeToNavigate[field]);

    if (missingFields.length > 0) {
      alert(`Erro: Desafio incompleto (faltam: ${missingFields.join(', ')}). Tente outro desafio.`);
      return;
    }

    setIsNavigating(true);

    const navigationData = {
      desafio: challengeToNavigate,
      challengeId: challengeToNavigate.backendId || challengeToNavigate.id,
      cargoAmount: selectedCargoAmount,
      navigatedAt: new Date().toISOString(),
      sourceScreen: 'ApresentacaoDesafio'
    };

    saveToSessionStorage(navigationData);

    navigate("/select-vehicle", {
      state: navigationData,
      replace: false
    });
  };

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

  if (erro || !currentChallenge) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-red-400 to-red-600 text-center p-4">
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <h1 className="[font-family:'Silkscreen',Helvetica] text-red-600 text-2xl mb-4">
            {erro || "Nenhum desafio disponível."}
          </h1>
          <div className="space-y-2">
            <Button
              onClick={() => navigate('/tutorial')}
              className="bg-[#e3922a] hover:bg-[#d4831f] text-black px-4 py-2 border-2 border-black rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-['Silkscreen'] h-12 flex items-center gap-2 transform transition-transform duration-300 hover:scale-105"
            >
              <ArrowLeft size={20} />
              Voltar
            </Button>
            <Button
              onClick={() => navigate("/perfil")}
              className="bg-[#e3922a] hover:bg-[#d4831f] text-black px-4 py-2 border-2 border-black rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-['Silkscreen'] h-12 flex items-center gap-2 transform transition-transform duration-300 hover:scale-105"
            >
              <Home size={20} />
              Perfil
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="w-full min-h-screen [background:linear-gradient(180deg,rgba(32,2,89,1)_0%,rgba(121,70,213,1)_100%)] relative overflow-hidden z-10">
        <div className="flex gap-4 absolute top-4 left-4 z-10">
          <Button
            onClick={() => navigate(-1)}
            disabled={!canInteract}
            className="bg-[#e3922a] hover:bg-[#d4831f] text-black px-4 py-2 border-2 border-black rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-['Silkscreen'] h-12 flex items-center gap-2 transform transition-transform duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={20} />
            Voltar
          </Button>
          <Button
            onClick={() => navigate("/perfil")}
            disabled={!canInteract}
            className="bg-[#e3922a] hover:bg-[#d4831f] text-black px-4 py-2 border-2 border-black rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-['Silkscreen'] h-12 flex items-center gap-2 transform transition-transform duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Home size={20} />
            Perfil
          </Button>
        </div>

        <div className="absolute top-4 right-4 z-10">
          <AudioControl />
        </div>

        <div className="pt-8 pb-8 px-4 flex flex-col justify-center items-center min-h-screen z-10">
          <div className="relative w-full max-w-[1000px] mx-auto px-8 md:px-16">
            <Carousel
              setApi={setApi}
              className="w-full"
              opts={{
                align: "center",
                loop: true,
                containScroll: "trimSnaps",
                slidesToScroll: 1,
              }}
            >
              <CarouselContent className="-ml-2 md:-ml-4 py-6 px-2 mb-4">
                {availableChallenges.map((challenge) => (
                  <CarouselItem key={challenge.id} className="pl-2 md:pl-4 basis-full">
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
                      isLoading={isNavigating}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious
                className="hidden md:flex opacity-100 -left-12 h-12 w-12 bg-[#e3922a] hover:bg-[#d4831f] transition-all duration-300 ease-in-out hover:scale-110 text-white border-2 border-black rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!canInteract}
              />
              <CarouselNext
                className="hidden transition-all duration-300 ease-in-out hover:scale-110 md:flex opacity-100 -right-12 h-12 w-12 bg-[#e3922a] hover:bg-[#d4831f] text-white border-2 border-black rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!canInteract}
              />
            </Carousel>
          </div>
        </div>
      </div>
    </div>
  );
};