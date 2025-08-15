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
} from 'lucide-react';
import { Button } from "@/components/ui/button";

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


// O componente VehicleCard permanece o mesmo
const VehicleCard: React.FC<{
  vehicle: Vehicle;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ vehicle, isSelected, onSelect }) => (
  <div
    className={`
      relative min-w-[280px] max-w-[320px] mx-4 cursor-pointer transition-transform duration-300
      ${isSelected ? 'scale-105 border-4 border-orange-500' : 'hover:scale-105 border border-gray-200'}
      bg-white p-4 rounded-xl shadow-md flex flex-col justify-between
    `}
    onClick={onSelect}
  >
    <div>
      <div className="flex justify-center mb-2">
        <img src={vehicle.image} alt={vehicle.name} className="h-48 object-contain" />
      </div>

      <h3 className="font-['Silkscreen'] text-center text-xl font-bold mb-2">{vehicle.name}</h3>
      <ul className="text-sm space-y-1">
        <li>🧱 Capacidade: {vehicle.capacity} Kg</li>
        <li>🛢️ Tanque: {vehicle.maxCapacity} L</li>
        <li>🚗 Asfalto: {vehicle.consumption.asphalt} KM/L</li>
      </ul>
    </div>

    <p className="font-['Silkscreen'] text-orange-600 font-bold text-center mt-3 text-lg">
      R$ {vehicle.cost.toLocaleString()}
    </p>
  </div>
);

export const VehicleSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Recebe o desafio selecionado da página anterior
  const selectedChallenge = location.state?.desafio;
  const challengeId = location.state?.challengeId;

  // NOVO: Estados para guardar os veículos da API, o estado de loading e possíveis erros.
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // NOVO: Estados para os dados do desafio
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

  // NOVO: useEffect para buscar os dados da API quando o componente for montado.
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

        // Buscar dados do desafio se challengeId estiver disponível
        if (challengeId) {
          console.log("🔍 DEBUG - Tentando buscar desafio com ID:", challengeId);
          const challengeUrl = `${import.meta.env.VITE_API_URL}/jogo1/mapas/${challengeId}/`;
          console.log("🔍 DEBUG - URL da requisição:", challengeUrl);

          const challengeResponse = await fetch(challengeUrl);
          console.log("🔍 DEBUG - Status da resposta:", challengeResponse.status);

          if (challengeResponse.ok) {
            const challengeDataFromApi = await challengeResponse.json();
            console.log("🎯 DEBUG - Dados brutos da API:", challengeDataFromApi);

            const formattedChallengeData = {
              nome: challengeDataFromApi.nome,
              descricao: challengeDataFromApi.descricao,
              objetivo: challengeDataFromApi.objetivo,
              dificuldade: challengeDataFromApi.dificuldade
            };

            console.log("🎯 DEBUG - Dados formatados:", formattedChallengeData);
            setChallengeData(formattedChallengeData);
          } else {
            console.error("❌ Erro ao carregar desafio - Status:", challengeResponse.status);
            const errorText = await challengeResponse.text();
            console.error("❌ Erro detalhado:", errorText);

            // Se falhar com o ID numérico, tenta usar os dados do selectedChallenge
            if (selectedChallenge) {
              console.log("🔄 DEBUG - Usando dados do selectedChallenge como fallback");
              setChallengeData({
                nome: selectedChallenge.name,
                descricao: selectedChallenge.description,
                objetivo: selectedChallenge.objective,
                dificuldade: selectedChallenge.difficulty
              });
            }
          }
        } else if (selectedChallenge) {
          // Se não tiver challengeId, usa os dados do selectedChallenge diretamente
          console.log("🔄 DEBUG - Usando dados do selectedChallenge diretamente");
          setChallengeData({
            nome: selectedChallenge.name,
            descricao: selectedChallenge.description,
            objetivo: selectedChallenge.objective,
            dificuldade: selectedChallenge.difficulty
          });
        } else {
          console.warn("⚠️ Nem challengeId nem selectedChallenge estão disponíveis");
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
  }, [challengeId]); // Dependência do challengeId para recarregar quando mudar

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
    if (selectedIndex === null) return; // Proteção extra
    const selectedVehicle = vehicles[selectedIndex];
    if (selectedVehicle.cost <= availableMoney) {
      navigate('/routes', {
        state: {
          selectedVehicle: selectedVehicle,
          availableMoney: availableMoney - selectedVehicle.cost,
          selectedChallenge: selectedChallenge,
          challengeId: challengeId
        }
      });
    }
  };

  if (isLoading) {
    return <div className="bg-sky-100 min-h-screen flex items-center justify-center font-['Silkscreen'] text-2xl">Carregando desafio e veículos...</div>;
  }

  if (error) {
    return <div className="bg-red-100 min-h-screen flex items-center justify-center font-['Silkscreen'] text-2xl text-red-700">{error}</div>;
  }

  const selectedVehicle = selectedIndex !== null ? vehicles[selectedIndex] : null;

  return (
    <div className="bg-sky-100 min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Botão de Voltar */}
      <div className="absolute top-4 left-4">
        <Button
          onClick={() => navigate(-1)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 border border-black rounded-md shadow-md font-['Silkscreen'] h-10"
        >
          ← Voltar
        </Button>
      </div>

      {/* Saldo disponível */}
      <div className="absolute top-4 right-4 font-['Silkscreen'] bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 border border-black rounded-md shadow-md flex items-center justify-center h-10">
        R$ {availableMoney.toLocaleString()}
      </div>

      {/* Desafio de Entrega */}
      <div className="flex flex-col items-center mb-2">
        <h2 className="font-['Silkscreen'] text-2xl text-orange-700 font-bold text-center mb-1">
          {challengeData?.nome || "DESAFIO DE ENTREGA: JUAZEIRO A SALVADOR!"}
        </h2>
        {challengeData?.descricao && (
          <div className="text-lg text-gray-700 font-['Silkscreen'] text-center max-w-4xl px-4 mb-2">
            {challengeData.descricao}
          </div>
        )}

        {challengeData?.dificuldade && (
          <div className="text-sm text-orange-600 font-['Silkscreen'] text-center mb-1">
            📊 Dificuldade: {challengeData.dificuldade}
          </div>
        )}
        {!challengeData?.descricao && (
          <div className="flex items-center gap-2 text-lg text-gray-700 font-['Silkscreen']">
            <span role="img" aria-label="carga">🧱</span> 1100kg
          </div>
        )}
      </div>

      <h1 className="font-['Silkscreen'] text-3xl mb-8 text-center">
        ESCOLHA UM CAMINHÃO
      </h1>

      <div className="relative w-full max-w-[1200px] px-16">
        <Carousel
          setApi={setApi}
          className="w-full"
          opts={{
            align: "center",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-4 py-4 font-['Silkscreen'] ">
            {vehicles.map((vehicle, index) => (
              <CarouselItem key={vehicle.id} className="basis-auto md:basis-1/2 lg:basis-1/3 pl-4">
                <VehicleCard
                  vehicle={vehicle}
                  isSelected={selectedIndex === index}
                  onSelect={() => handleVehicleSelect(index)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="hidden md:flex opacity-100 -left-4 h-14 w-14 bg-orange-500 hover:bg-orange-600 transition-all duration-300 ease-in-out hover:scale-110 text-white border-none rounded-sm" />
          <CarouselNext className="hidden transition-all duration-300 ease-in-out hover:scale-110 md:flex opacity-100 -right-4 h-14 w-14 bg-orange-500 hover:bg-orange-600 text-white border-none rounded-sm" />
        </Carousel>
      </div>

      {selectedVehicle && (
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="sm:max-w-md font-['Silkscreen']">
            <DialogHeader>
              <DialogTitle className="font-['Silkscreen'] flex items-center gap-2 text-xl">
                Veículo Selecionado
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <div>
                <div className="flex items-center gap-4">
                  <img src={selectedVehicle.image} className="h-16 w-16 object-contain" />
                  <div>
                    <p className="font-['Silkscreen'] font-bold text-base">{selectedVehicle.name}</p>
                    <ul className="text-xs">
                      <li>Capacidade: {selectedVehicle.capacity} Kg</li>
                      <li>Tanque: {selectedVehicle.maxCapacity} L</li>
                      <li>Asfalto: {selectedVehicle.consumption.asphalt} KM/L</li>
                      <li>Terra: {selectedVehicle.consumption.dirt} KM/L</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-base">Detalhes da Compra</h4>
                <div className="text-sm space-y-1">
                  <p className="flex items-center gap-2">
                    <CalendarDays size={16} /> Data/Hora: Agora
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin size={16} /> Local de Retirada: Base
                  </p>
                  <p className="font-['Silkscreen'] flex items-center gap-2 text-lg font-bold">
                    <DollarSign size={16} /> Total: R$ {selectedVehicle.cost.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter className="pt-4 font-['Silkscreen']">
              <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700 font-['Silkscreen']" disabled={availableMoney < selectedVehicle.cost}>
                {availableMoney < selectedVehicle.cost ? "Dinheiro Insuficiente" : "Confirmar"}
              </Button>
              <Button variant="destructive" onClick={() => setShowConfirmation(false)} className="font-['Silkscreen']">
                Cancelar
              </Button>
            </DialogFooter >
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
