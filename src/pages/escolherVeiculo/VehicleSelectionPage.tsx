import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Vehicle } from '../../types/vehicle';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CalendarDays,
  MapPin,
  DollarSign,
  ArrowLeft,
  Home,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ButtonHomeBack } from "@/components/ButtonHomeBack";

// TODO: Ajustar imagens, (adicionar imagens ao banco?)
import caminhaoMedioPng from '@/assets/caminhao_medio.png';
import camihaoPequenoPng from '@/assets/caminhao_pequeno.png';
import carretaPng from '@/assets/carreta.png';
import camhionetePng from '@/assets/caminhonete.png';

// FIXME: Ajustar imagens para cada tipo de veiculo (permitir o envio de imagens ou ter um conjunto de imagens selecionaveis via admin?)
const getSpriteName = (modelName: string) => {
  switch (modelName.toLowerCase()) {
    case 'caminhonete':
      return 'caminhonete';
    case 'caminhão pequeno':
      return 'caminhao_pequeno';
    case 'caminhão médio':
      return 'caminhao_medio';
    case 'carreta':
      return 'carreta';
    default:
      return 'caminhao_medio';
  }
};

// Componente VehicleCard atualizado com novo design
interface VehicleCardProps {
  vehicle: Vehicle;
  isSelected: boolean;
  onSelect: () => void;
  isEnabled: boolean;
  requiredCapacity: number | null;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ 
  vehicle, 
  isSelected, 
  onSelect, 
  isEnabled, 
  requiredCapacity 
}) => (
  <div
    className={`
      relative min-w-[280px] max-w-[320px] mx-2 sm:mx-4 transition-all duration-300
      ${isSelected ? 'scale-105 border-4 border-[#e3922a] shadow-[0_0_20px_rgba(227,146,42,0.3)]' : 'border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}
      bg-white p-4 rounded-xl flex flex-col justify-between
      ${isEnabled ? 'cursor-pointer hover:scale-105 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' : 'opacity-50 cursor-not-allowed bg-gray-200'}
    `}
    onClick={isEnabled ? onSelect : undefined}
  >
    {!isEnabled && requiredCapacity && (
      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold p-2 rounded-md border-2 border-black z-10 [font-family:'Silkscreen',Helvetica]">
        CARGA ALTA (Req: {requiredCapacity}kg)
      </div>
    )}
    
    <div>
      <div className="flex justify-center mb-4">
        <img src={vehicle.image} alt={vehicle.name} className="h-32 sm:h-48 object-contain" />
      </div>

      <h3 className="[font-family:'Silkscreen',Helvetica] text-center text-lg sm:text-xl font-bold mb-3 text-gray-800">
        {vehicle.name}
      </h3>
      
      <div className="space-y-2 text-sm">
        <div className={`flex items-center justify-between p-2 rounded border ${!isEnabled && requiredCapacity && vehicle.capacity < requiredCapacity ? 'bg-red-100 border-red-400' : 'bg-gray-50'}`}>
          <span className="[font-family:'Silkscreen',Helvetica] text-xs">🧱 Capacidade:</span>
          <span className="[font-family:'Silkscreen',Helvetica] text-xs font-bold">{vehicle.capacity} Kg</span>
        </div>
        <div className="flex items-center justify-between bg-gray-50 p-2 rounded border">
          <span className="[font-family:'Silkscreen',Helvetica] text-xs">🛢️ Tanque:</span>
          <span className="[font-family:'Silkscreen',Helvetica] text-xs font-bold">{vehicle.maxCapacity} L</span>
        </div>
        <div className="flex items-center justify-between bg-gray-50 p-2 rounded border">
          <span className="[font-family:'Silkscreen',Helvetica] text-xs">🚗 Asfalto:</span>
          <span className="[font-family:'Silkscreen',Helvetica] text-xs font-bold">{vehicle.consumption.asphalt} KM/L</span>
        </div>
      </div>
    </div>

    <div className={`mt-4 p-3 rounded-lg border-2 border-black ${isEnabled ? 'bg-[#e3922a]' : 'bg-gray-400'}`}>
      <p className="[font-family:'Silkscreen',Helvetica] text-white font-bold text-center text-lg">
        R$ {vehicle.cost.toLocaleString()}
      </p>
    </div>
  </div>
);


export const VehicleSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Recebe o desafio selecionado da página anterior
  const selectedChallenge = location.state?.desafio;
  const challengeId = location.state?.challengeId;

  // Estados para guardar os veículos da API, o estado de loading e possíveis erros.
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cargoWeight, setCargoWeight] = useState<number | null>(null);

  // Estados para os dados do desafio
  const [challengeData, setChallengeData] = useState<{
    nome: string;
    descricao: string;
    objetivo?: string;
    dificuldade?: string;
  } | null>(null);

  // Debug: verificar se os dados estão sendo recebidos
  console.log("🚗 DEBUG VehicleSelection - challengeId recebido:", challengeId);
  console.log("🚗 DEBUG VehicleSelection - selectedChallenge:", selectedChallenge);
  console.log("🚗 DEBUG VehicleSelection - location.state:", location.state);
  console.log("🚗 DEBUG VehicleSelection - challengeData state:", challengeData);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null); // Inicia como nulo
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [availableMoney] = useState(10000);
  const [api, setApi] = useState<CarouselApi>();

  // useEffect para buscar os dados da API quando o componente for montado.
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar veículos
        const vehiclesUrl = `${import.meta.env.VITE_API_URL}/jogo1/veiculos/`;
        const vehiclesResponse = await fetch(vehiclesUrl);
        if (!vehiclesResponse.ok) {
          throw new Error(`HTTP error! status: ${vehiclesResponse.status}`);
        }
        const vehiclesData = await vehiclesResponse.json();

        const formattedVehicles: Vehicle[] = vehiclesData.map((apiVehicle: any) => ({
          id: String(apiVehicle.id),
          name: apiVehicle.modelo,
          capacity: apiVehicle.capacidade_carga,
          consumption: {
            asphalt: parseFloat((apiVehicle.autonomia / apiVehicle.capacidade_combustivel).toFixed(2)),
            dirt: parseFloat(((apiVehicle.autonomia / apiVehicle.capacidade_combustivel) * 0.8).toFixed(2))
          },
          image: `/assets/${getSpriteName(apiVehicle.modelo)}.png`,
          spriteSheet: `/assets/${getSpriteName(apiVehicle.modelo)}_sheet.png`,
          spriteName: getSpriteName(apiVehicle.modelo),
          maxCapacity: apiVehicle.capacidade_combustivel,
          currentFuel: 0, // Tanque sempre vazio - usuário deve abastecer
          cost: parseFloat(apiVehicle.preco),
        }));

        setVehicles(formattedVehicles);
        if (formattedVehicles.length > 0) {
          setSelectedIndex(0); // Define o primeiro veículo como selecionado por padrão
        }

        let finalChallengeData = selectedChallenge;

        if (challengeId) {
          console.log("🔍 DEBUG - Tentando buscar desafio com ID:", challengeId);
          const challengeUrl = `${import.meta.env.VITE_API_URL}/jogo1/mapas/${challengeId}/`;
          const challengeResponse = await fetch(challengeUrl);

          if (challengeResponse.ok) {
            const apiData = await challengeResponse.json();
            console.log("🎯 DEBUG - Dados brutos da API:", apiData);
            setChallengeData(apiData);
            finalChallengeData = apiData; // Prioriza dados frescos da API
          } else {
            // Se a busca da API falhar, usa o que veio do state
            console.error("❌ Erro ao carregar desafio da API, usando dados do state como fallback.");
            setChallengeData(selectedChallenge);
          }
        }
        
        // Esta é a parte crucial que estava faltando:
        if (finalChallengeData?.peso_carga_kg) {
            setCargoWeight(finalChallengeData.peso_carga_kg);
            console.log(`⚖️ Peso da carga definido: ${finalChallengeData.peso_carga_kg}kg`);
        } else {
            console.warn("⚠️ Não foi possível determinar o peso da carga do desafio.");
        }

      } catch (e) {
        if (e instanceof Error) {
          setError(`Falha ao buscar dados: ${e.message}`);
        } else {
          setError("Ocorreu um erro desconhecido.");
        }
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [challengeId]);

  useEffect(() => {
    if (!api || selectedIndex === null) return;
    api.scrollTo(selectedIndex);
    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api, selectedIndex]);

  const handleVehicleSelect = (index: number) => {
    setSelectedIndex(index);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (selectedIndex === null) return;
    const selectedVehicle = vehicles[selectedIndex];

    const isEnabled = cargoWeight ? selectedVehicle.capacity >= cargoWeight : true;
    if (!isEnabled) {
      alert("Este veículo não suporta o peso da carga!");
      return;
    }

    if (selectedVehicle.cost <= availableMoney) {
      navigate('/routes', {
        state: {
          selectedVehicle: selectedVehicle,
          availableMoney: availableMoney - selectedVehicle.cost,
          selectedChallenge: challengeData || selectedChallenge,
          challengeId: challengeId
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="[background:linear-gradient(180deg,rgba(32,2,89,1)_0%,rgba(121,70,213,1)_100%)] min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg border-2 border-black">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#e3922a] border-t-transparent mx-auto mb-4"></div>
          <p className="[font-family:'Silkscreen',Helvetica] text-[#e3922a] text-xl text-center">
            Carregando desafio e veículos...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="[background:linear-gradient(180deg,rgba(32,2,89,1)_0%,rgba(121,70,213,1)_100%)] min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 shadow-lg border-2 border-black max-w-md w-full">
          <h1 className="[font-family:'Silkscreen',Helvetica] text-red-600 text-xl mb-4 text-center">
            Erro ao carregar dados
          </h1>
          <p className="[font-family:'Silkscreen',Helvetica] text-sm text-gray-600 mb-4 text-center">
            {error}
          </p>
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-[#e3922a] hover:bg-[#d4831f] text-white border-2 border-black [font-family:'Silkscreen',Helvetica]"
            >
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const selectedVehicle = selectedIndex !== null ? vehicles[selectedIndex] : null;

  return (
    <div className="bg-white flex flex-row justify-center w-full min-h-screen">
      <div className="w-full min-h-screen [background:linear-gradient(180deg,rgba(32,2,89,1)_0%,rgba(121,70,213,1)_100%)] relative overflow-hidden flex flex-col">
        
        {/* Header com botões de navegação e saldo */}
        <div className="flex justify-between items-center p-4 relative z-10">
          <div className="absolute top-4 left-4">
            <Button
              onClick={() => navigate('/desafio')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 border border-black rounded-md shadow-md font-['Silkscreen'] h-10"
            >
              ← Voltar
            </Button>
          </div>

          {/* Saldo disponível */}
          <div className="absolute top-4 right-4 font-['Silkscreen'] bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 border border-black rounded-md shadow-md flex items-center justify-center h-10">
            R$ {availableMoney.toLocaleString()}
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="px-4 pb-8 flex flex-col items-center min-h-0 flex-1">
          
          {/* Informações do desafio */}
          <div className="bg-white rounded-[18px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full max-w-4xl p-4 sm:p-6 mb-4 mt-2">
            <h2 className="[font-family:'Silkscreen',Helvetica] text-xl sm:text-2xl text-[#e3922a] font-bold text-center mb-2">
              {challengeData?.nome || "DESAFIO DE ENTREGA: JUAZEIRO A SALVADOR!"}
            </h2>
            
            {challengeData?.descricao && (
              <div className="[font-family:'Silkscreen',Helvetica] text-sm sm:text-base text-gray-700 text-center max-w-3xl mx-auto mb-2">
                {challengeData.descricao}
              </div>
            )}

            {challengeData?.dificuldade && (
              <div className="[font-family:'Silkscreen',Helvetica] text-xs sm:text-sm text-[#e3922a] text-center mb-2">
                📊 Dificuldade: {challengeData.dificuldade}
              </div>
            )}
            
            {!challengeData?.descricao && (
              <div className="flex items-center justify-center gap-2 text-sm sm:text-lg text-gray-700 [font-family:'Silkscreen',Helvetica]">
                <span role="img" aria-label="carga">🧱</span> 1100kg
              </div>
            )}
          </div>

          {/* Título da seleção de veículos */}
          <h1 className="[font-family:'Silkscreen',Helvetica] text-2xl sm:text-3xl mb-4 text-center text-white font-bold">
            ESCOLHA UM CAMINHÃO
          </h1>

          {/* Carrossel de veículos */}
          <div className="relative w-full max-w-[1200px] px-4 sm:px-16 mb-4">
            <Carousel
              setApi={setApi}
              className="w-full"
              opts={{
                align: "center",
                loop: true,
              }}
            >
              <CarouselContent className="-ml-2 sm:-ml-4 py-6">
                {vehicles.map((vehicle, index) => {
                  const isEnabled = cargoWeight ? vehicle.capacity >= cargoWeight : true;
                  
                  return (
                    <CarouselItem key={vehicle.id} className="basis-full sm:basis-auto md:basis-1/2 lg:basis-1/3 pl-2 sm:pl-4">
                      <VehicleCard
                        vehicle={vehicle}
                        isSelected={selectedIndex === index}
                        onSelect={() => handleVehicleSelect(index)}
                        // PROPS FALTANTES: Passar a informação para o card
                        isEnabled={isEnabled}
                        requiredCapacity={cargoWeight}
                      />
                    </CarouselItem>
                  );
                })}
              </CarouselContent>

              <CarouselPrevious className="hidden md:flex opacity-100 -left-4 h-14 w-14 bg-[#e3922a] hover:bg-[#d4831f] transition-all duration-300 ease-in-out hover:scale-110 text-white border-2 border-black rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
              <CarouselNext className="hidden transition-all duration-300 ease-in-out hover:scale-110 md:flex opacity-100 -right-4 h-14 w-14 bg-[#e3922a] hover:bg-[#d4831f] text-white border-2 border-black rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
            </Carousel>
          </div>

          {/* Indicadores para mobile */}
          {vehicles.length > 1 && (
            <div className="flex gap-2 mt-2 mb-4 md:hidden">
              {vehicles.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    selectedIndex === index ? 'bg-[#e3922a]' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modal de confirmação */}
        {selectedVehicle && (
          <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
            <DialogContent className="sm:max-w-md [font-family:'Silkscreen',Helvetica] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <DialogHeader>
                <DialogTitle className="[font-family:'Silkscreen',Helvetica] flex items-center gap-2 text-xl text-[#e3922a]">
                  Veículo Selecionado
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 text-sm">
                <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                  <div className="flex items-center gap-4 mb-3">
                    <img src={selectedVehicle.image} className="h-16 w-16 object-contain border rounded" />
                    <div>
                      <p className="[font-family:'Silkscreen',Helvetica] font-bold text-base text-gray-800">
                        {selectedVehicle.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2 rounded border">
                      <span className="text-gray-600">Capacidade:</span>
                      <span className="font-bold ml-1">{selectedVehicle.capacity} Kg</span>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <span className="text-gray-600">Tanque:</span>
                      <span className="font-bold ml-1">{selectedVehicle.maxCapacity} L</span>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <span className="text-gray-600">Asfalto:</span>
                      <span className="font-bold ml-1">{selectedVehicle.consumption.asphalt} KM/L</span>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <span className="text-gray-600">Terra:</span>
                      <span className="font-bold ml-1">{selectedVehicle.consumption.dirt} KM/L</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#e3922a]/10 p-4 rounded-lg border-2 border-[#e3922a]/20">
                  <h4 className="font-semibold mb-2 text-base text-[#e3922a]">Detalhes da Compra</h4>
                  <div className="text-sm space-y-2">
                    <p className="flex items-center gap-2">
                      <CalendarDays size={16} className="text-[#e3922a]" /> 
                      <span>Data/Hora: Agora</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin size={16} className="text-[#e3922a]" /> 
                      <span>Local de Retirada: Base</span>
                    </p>
                    <div className="bg-[#e3922a] text-white p-2 rounded border-2 border-black mt-3">
                      <p className="[font-family:'Silkscreen',Helvetica] flex items-center justify-center gap-2 text-lg font-bold">
                        <DollarSign size={16} /> 
                        Total: R$ {selectedVehicle.cost.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="pt-4 gap-2">
                <Button 
                  onClick={handleConfirm} 
                  className="bg-green-600 hover:bg-green-700 [font-family:'Silkscreen',Helvetica] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" 
                  disabled={availableMoney < selectedVehicle.cost}
                >
                  {availableMoney < selectedVehicle.cost ? "Dinheiro Insuficiente" : "Confirmar"}
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowConfirmation(false)} 
                  className="[font-family:'Silkscreen',Helvetica] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  Cancelar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};
