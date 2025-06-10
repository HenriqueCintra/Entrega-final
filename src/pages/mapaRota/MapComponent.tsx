// src/MapComponent.tsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { routes, Route, parseEstimatedTime } from './routesData';
import { useLocation, useNavigate } from 'react-router-dom';
import { FuelModal } from './FuelModal';
import { Vehicle } from '../../types/vehicle';
import { ArrowLeft} from 'lucide-react';
// --- Correção para o ícone padrão do Leaflet --- aa
import defaultIcon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: defaultIcon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;
// --- Fim da Correção do Ícone ---

// --- Ícone Personalizado do Caminhão ---
import truckIconSvg from '@/assets/truck-solid.svg'; // Caminho para o ícone SVG do caminhão

const truckIcon = L.icon({
  iconUrl: truckIconSvg,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});
 // rest, construction, gas, toll, danger
// --- Ícones de POI ---
const tollIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/2297/2297592.png', iconSize: [30, 30], iconAnchor: [15, 15] });
const dangerIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/1008/1008928.png', iconSize: [30, 30], iconAnchor: [15, 15] });
const restStopIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/6807/6807796.png', iconSize: [30, 30], iconAnchor: [15, 15] });
const constructionIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/4725/4725077.png', iconSize: [30, 30], iconAnchor: [15, 15] });
const gasStationIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/465/465090.png', iconSize: [30, 30], iconAnchor: [15, 15] });


// --- Ícones para áreas de risco ---
const lowRiskIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/6276/6276686.png', iconSize: [30, 30], iconAnchor: [15, 15] });
const mediumRiskIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/4751/4751259.png', iconSize: [30, 30], iconAnchor: [15, 15] });
const highRiskIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/900/900532.png', iconSize: [30, 30], iconAnchor: [15, 15] });
const theftRiskIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/4751/4751259.png', iconSize: [30, 30], iconAnchor: [15, 15] });

// --- Ícones de velocidade ---
 const speedLimitIcon20 = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/1670/1670172.png', iconSize: [30, 30], iconAnchor: [15, 15] });
 const speedLimitIcon40 = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/5124/5124881.png', iconSize: [30, 30], iconAnchor: [15, 15] });
 const speedLimitIcon50 = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/752/752738.png', iconSize: [30, 30], iconAnchor: [15, 15] });
 const speedLimitIcon60 = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/15674/15674424.png', iconSize: [30, 30], iconAnchor: [15, 15] });
 const speedLimitIcon80 = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/3897/3897785.png', iconSize: [30, 30], iconAnchor: [15, 15] });
 const speedLimitIcon100 = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/10392/10392769.png', iconSize: [30, 30], iconAnchor: [15, 15] });

 // Componente para animar o caminhão
interface TruckAnimationProps {
  routePath: [number, number][];
  speed: number; // Velocidade média em km/h
  playing: boolean;
  onTripEnd: () => void;
  onFuelEmpty: () => void;
  vehicle: Vehicle;
  routeDistance: number;
  setCurrentFuel: (fuel: number) => void;
  isDirtRoad: boolean;
}

const TruckAnimation: React.FC<TruckAnimationProps> = ({ 
  routePath, 
  speed, 
  playing, 
  onTripEnd,
  onFuelEmpty,
  vehicle,
  routeDistance,
  setCurrentFuel,
  isDirtRoad
}) => {
  const truckRef = useRef<L.Marker>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentSegment = useRef<number>(0);
  const segmentProgress = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const totalDistanceTraveledRef = useRef<number>(0);
  const lastFuelUpdateRef = useRef<number>(0);
  const currentFuelRef = useRef<number>(vehicle.currentFuel);
  const visualizationSpeedFactor = 300; // Fator de aceleração da visualização
  
  // Criar ícone personalizado para o veículo
  const vehicleIcon = useMemo(() => {
    return L.icon({
      iconUrl: vehicle.image,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });
  }, [vehicle.image]);

  // Calcular consumo de combustível com base no tipo de estrada
  const calculateFuelConsumption = useCallback((distanceTraveled: number) => {
    const consumption = isDirtRoad ? vehicle.consumption.dirt : vehicle.consumption.asphalt;
    return distanceTraveled / consumption;
  }, [isDirtRoad, vehicle.consumption]);

  // Atualizar o combustível do veículo
  const updateFuel = useCallback((distanceTraveled: number) => {
    const fuelConsumed = calculateFuelConsumption(distanceTraveled);
    const newFuel = Math.max(0, currentFuelRef.current - fuelConsumed);
    
    currentFuelRef.current = newFuel;
    setCurrentFuel(newFuel);
    
    // Se o combustível acabou, parar o caminhão
    if (newFuel <= 0) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      onFuelEmpty();
      return true;
    }
    return false;
  }, [calculateFuelConsumption, onFuelEmpty, setCurrentFuel]);

  const animateTruck = useCallback(() => {
    if (!playing || !truckRef.current || !routePath || routePath.length < 2) {
      return;
    }

    // Se estamos no final da rota
    if (currentSegment.current >= routePath.length - 1) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      onTripEnd();
      return;
    }

    const now = performance.now();
    
    // Para a primeira execução ou após resumir de uma pausa
    if (startTimeRef.current === 0) {
      startTimeRef.current = now;
      lastTimeRef.current = now;
    }

    const elapsed = now - startTimeRef.current;
    const deltaTime = now - lastTimeRef.current;
    lastTimeRef.current = now;
    
    // Pontos do segmento atual
    const startPoint = routePath[currentSegment.current];
    const endPoint = routePath[currentSegment.current + 1];
    
    // Calcular distância em metros do segmento (usando a fórmula de Haversine)
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = startPoint[0] * Math.PI / 180;
    const φ2 = endPoint[0] * Math.PI / 180;
    const Δφ = (endPoint[0] - startPoint[0]) * Math.PI / 180;
    const Δλ = (endPoint[1] - startPoint[1]) * Math.PI / 180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const segmentDistanceMeters = R * c;
    const segmentDistanceKm = segmentDistanceMeters / 1000;
    
    // Tempo para percorrer este segmento em milissegundos (considerando a velocidade)
    const timeToCompleteMsec = (segmentDistanceKm / speed) * 3600 * 1000;
    
    // Ajustar para uma velocidade de visualização acelerada
    const adjustedTimeToCompleteMsec = timeToCompleteMsec / visualizationSpeedFactor;
    
    // Calcular progresso neste segmento (0 a 1)
    segmentProgress.current = Math.min(elapsed / adjustedTimeToCompleteMsec, 1);
    
    // Calcular distância percorrida neste frame
    const previousProgress = (elapsed - deltaTime) / adjustedTimeToCompleteMsec;
    const previousDistanceFraction = Math.min(previousProgress, 1);
    const currentDistanceFraction = segmentProgress.current;
    const distanceDiff = currentDistanceFraction - previousDistanceFraction;
    const distanceThisFrameKm = segmentDistanceKm * distanceDiff;
    
    // Atualizar a distância total percorrida
    totalDistanceTraveledRef.current += distanceThisFrameKm;
    
    // Atualizar o combustível a cada 1km ou quando o combustível estiver abaixo de 10%
    if (totalDistanceTraveledRef.current - lastFuelUpdateRef.current >= 1 || 
        currentFuelRef.current <= (vehicle.maxCapacity * 0.1)) {
      const distanceSinceLastUpdate = totalDistanceTraveledRef.current - lastFuelUpdateRef.current;
      lastFuelUpdateRef.current = totalDistanceTraveledRef.current;
      
      // Se o combustível acabou, parar a animação
      if (updateFuel(distanceSinceLastUpdate)) {
        return;
      }
    }
    
    // Se completou este segmento, avançar para o próximo
    if (segmentProgress.current >= 1) {
      currentSegment.current += 1;
      segmentProgress.current = 0;
      startTimeRef.current = now;
      
      // Se ainda tem segmentos a percorrer, continua a animação
      if (currentSegment.current < routePath.length - 1) {
        animationFrameRef.current = requestAnimationFrame(animateTruck);
      } else {
        onTripEnd();
      }
      return;
    }

    const newLat = startPoint[0] + (endPoint[0] - startPoint[0]) * segmentProgress.current;
    const newLng = startPoint[1] + (endPoint[1] - startPoint[1]) * segmentProgress.current;
    const newPosition = L.latLng(newLat, newLng);

    truckRef.current.setLatLng(newPosition);
    animationFrameRef.current = requestAnimationFrame(animateTruck);
  }, [playing, routePath, speed, onTripEnd, vehicleIcon, updateFuel, vehicle.maxCapacity, onFuelEmpty]);

  // Iniciar ou reiniciar a animação quando o estado de playing mudar
  useEffect(() => {
    if (playing && routePath && routePath.length > 1) {
      // Só inicialize a posição do caminhão uma única vez, quando é a primeira execução
      if (!truckRef.current || (currentSegment.current === 0 && segmentProgress.current === 0)) {
        truckRef.current?.setLatLng(L.latLng(routePath[0][0], routePath[0][1]));
      }
      
      // Só resetar os contadores se estivermos iniciando uma nova viagem
      if (currentSegment.current === 0 && segmentProgress.current === 0) {
        totalDistanceTraveledRef.current = 0;
        lastFuelUpdateRef.current = 0;
        currentFuelRef.current = vehicle.currentFuel;
      }
      
      // Não resetar o tempo se estivermos apenas despausando no meio de um segmento
      if (segmentProgress.current === 0) {
        startTimeRef.current = 0;
      }
      
      animationFrameRef.current = requestAnimationFrame(animateTruck);
    } else if (!playing && animationFrameRef.current) {
      // Quando pausamos, apenas cancelamos o frame de animação, mas mantemos o estado
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [playing, routePath, animateTruck, vehicle.currentFuel]);

  if (!routePath || routePath.length === 0) return null;

  return (
    <Marker
      position={L.latLng(routePath[0][0], routePath[0][1])} // Posição inicial
      icon={vehicleIcon}
      ref={truckRef}
    >
      <Popup>
        <div className="text-sm">
          <p className="font-bold">{vehicle.name}</p>
          <p>Combustível: {Math.round(currentFuelRef.current)} de {vehicle.maxCapacity}L</p>
        </div>
      </Popup>
    </Marker>
  );
};

export const MapComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const juazeiroCoordinates: [number, number] = [-9.44977115369502, -40.52422616182216];
  const salvadorCoordinates: [number, number] = [-12.954121960174133, -38.47128319030249];

  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [routesList] = useState<Route[]>(routes);
  
  // Estado para veículo e saldo
  const [vehicle, setVehicle] = useState<Vehicle>(() => {
    // Verificar se há um veículo no state da rota
    if (location.state && location.state.selectedVehicle) {
      return location.state.selectedVehicle;
    }
    
    // Se não tiver veículo no state, redirecionar para a página de seleção
    navigate('/select-vehicle');
    
    // Retornar um veículo padrão enquanto redireciona
    return {
      id: 'carreta',
      name: 'Carreta',
      capacity: 60,
      consumption: {
        asphalt: 2,
        dirt: 1.5
      },
      image: '/carreta.png',
      maxCapacity: 495,
      currentFuel: 120,
      cost: 4500
    };
  });
  
  // Estado para o saldo disponível
  const [availableMoney, setAvailableMoney] = useState<number>(() => {
    if (location.state && location.state.availableMoney !== undefined) {
      return location.state.availableMoney;
    }
    return 5500; // Valor padrão (10000 - 4500 da carreta)
  });
  
  // Estado para controlar a exibição do modal de abastecimento
  const [showFuelModal, setShowFuelModal] = useState(false);

  // Estado para controlar a exibição do modal de fim de jogo
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [gameOverReason, setGameOverReason] = useState('');
  
  // Variável para controlar se o mapa deve ser ajustado automaticamente
  const [initialMapViewSet, setInitialMapViewSet] = useState(false);

  // Centraliza o mapa nos pontos inicial e final da rota selecionada
  function MapViewControl({ route }: { route: Route | null }) {
    const map = useMapEvents({});

    useEffect(() => {
      // Só ajuste o mapa automaticamente quando uma rota for selecionada pela primeira vez
      // ou quando isPlaying for false (não está em execução)
      if (route && route.pathCoordinates && route.pathCoordinates.length > 1 && (!initialMapViewSet || !isPlaying)) {
        const bounds = L.latLngBounds(route.pathCoordinates);
        map.fitBounds(bounds, { padding: [50, 50] }); // Ajusta o zoom para caber a rota
        setInitialMapViewSet(true);
      } else if (!route && !initialMapViewSet) {
        // Se nenhuma rota estiver selecionada, centraliza em Juazeiro/Salvador
        const bounds = L.latLngBounds(juazeiroCoordinates, salvadorCoordinates);
        map.fitBounds(bounds, { padding: [100, 100] });
        setInitialMapViewSet(true);
      }
    }, [map, route]);
    
    return null;
  }

  const handleSelectRoute = useCallback((routeId: number) => {
    const routeToSelect = routesList.find(r => r.routeId === routeId);
    if (routeToSelect) {
      setSelectedRoute(routeToSelect);
      setIsPlaying(false); // Stop any ongoing animation when a new route is selected
      setInitialMapViewSet(false); // Reset para permitir ajuste do mapa para a nova rota
    }
  }, [routesList]);

  const handleTripEnd = useCallback(() => {
    setIsPlaying(false);
    alert('Viagem concluída!');
  }, []);

  // Calcula o custo total da rota (pedágios + combustível)
  const calculateTotalCost = (route: Route): number => {
    const totalToll = route.tollBooths.reduce((sum, toll) => sum + toll.totalCost, 0);
    // Usa a distância atualizada pela API se disponível, senão a distância estática
    const dist = route.actualDistance || route.distance;
    const totalFuelCost = dist * route.fuelCostPerKm;
    return totalToll + totalFuelCost;
  };

  // Determinar a cor da rota com base nas condições
  const getRouteColor = (route: Route, isSelected: boolean): string => {
    if (isSelected) {
      return '#1e40af'; // Azul escuro mais forte
    }
    return '#94a3b8'; // Cinza claro para rotas não selecionadas
  };

  // Ícone para POI
  const getPoiIcon = (type: 'construction' | 'danger' | 'rest' | 'gas'): L.Icon => {
    switch (type) {
      case 'construction': return constructionIcon;
      case 'danger': return dangerIcon;
      case 'rest': return restStopIcon;
      case 'gas': return gasStationIcon;
      default: return DefaultIcon; // Fallback
    }
  };
  
  // Ícone para áreas de risco
  const getRiskIcon = (riskLevel: 'Baixo' | 'Médio' | 'Alto'): L.Icon => {
    switch (riskLevel) {
      case 'Baixo': return lowRiskIcon;
      case 'Médio': return mediumRiskIcon;
      case 'Alto': return highRiskIcon;
      default: return mediumRiskIcon; // Fallback
    }
  };
  
  // Ícone para limites de velocidade
  const getSpeedLimitIcon = (speed: number): L.Icon => {
    switch (speed) {
      case 20: return speedLimitIcon20;
      case 40: return speedLimitIcon40;
      case 50: return speedLimitIcon50;
      case 60: return speedLimitIcon60;
      case 80: return speedLimitIcon80;
      case 100: return speedLimitIcon100;
      default: return speedLimitIcon60; // ícone padrão caso a velocidade não corresponda
    }
  };
  
  // Voltar para a tela de seleção de veículos
  const handleChangeVehicle = () => {
    navigate('/select-vehicle');
  };
  
  // Handler para abrir o modal de abastecimento
  const handleOpenFuelModal = () => {
    setShowFuelModal(true);
  };
  
  // Handler para o abastecimento
  const handleRefuel = (updatedVehicle: Vehicle, newBalance: number) => {
    setVehicle(updatedVehicle);
    setAvailableMoney(newBalance);
  };

  // Handler para quando o combustível acabar
  const handleFuelEmpty = useCallback(() => {
    setIsPlaying(false);
    setGameOverReason('combustível');
    setShowGameOverModal(true);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-screen p-4 font-['Silkscreen'] bg-[#200259]">
      {/* Cabeçalho superior - "Rotas Disponíveis" e Saldo */}
      <div className="absolute top-0 left-0 w-full flex items-center justify-between px-8 py-4 z-40">
        {/* Botão TROCAR VEÍCULO */}
        <button
          className="flex items-center px-6 py-2 bg-[#E3922A] text-black font-bold text-lg rounded-md shadow-lg
                   hover:bg-[#FFC06F] transition-all duration-200 border-2 border-black"
          onClick={handleChangeVehicle}
        >
          <ArrowLeft/> TROCAR VEÍCULOS
        </button>

        {/* Título Rotas Disponíveis */}
        <h1 className="text-3xl font-bold text-[#E3922A] text-center flex-1 -ml-16">
          ROTAS DISPONÍVEIS
        </h1>

        {/* Saldo */}
        <div className="bg-[#E3922A] text-black text-2xl font-bold px-6 py-2 rounded-md shadow-lg border-2 border-black">
          R$ {availableMoney.toFixed(2)}
        </div>
      </div>

      {/* Área do Mapa e Detalhes da Rota Selecionada */}
      <div className="flex-1 w-full relative bg-gray-200 rounded-lg shadow-inner border-4 border-black mt-20">
        {/* Botões de controle da simulação - Posicionados no canto superior direito do mapa com z-index alto */}
        {selectedRoute && (
          <div className="absolute top-4 right-4 flex space-x-2 z-[1000]">
            <button
              className="px-4 py-2 bg-green-500 text-white font-bold text-md rounded-md shadow-lg hover:bg-green-600 transition-all duration-200 border-2 border-black"
              onClick={() => setIsPlaying(true)}
              disabled={isPlaying || !selectedRoute.pathCoordinates || selectedRoute.pathCoordinates.length < 2 || vehicle.currentFuel <= 0}
            >
              {isPlaying ? 'EM ANDAMENTO' : 'INICIAR'}
            </button>
            <button
              className="px-4 py-2 bg-yellow-500 text-black font-bold text-md rounded-md shadow-lg hover:bg-yellow-600 transition-all duration-200 border-2 border-black"
              onClick={() => setIsPlaying(false)}
              disabled={!isPlaying}
            >
              PAUSAR
            </button>
          </div>
        )}
        
        <MapContainer
          center={juazeiroCoordinates} // Centraliza em Juazeiro por padrão
          zoom={7} // Zoom inicial para ver uma área maior
          scrollWheelZoom={true}
          className="w-full h-full rounded-lg"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Controle de Visão do Mapa - ajusta o zoom e centraliza a rota selecionada */}
          <MapViewControl route={selectedRoute} />

          {selectedRoute && selectedRoute.pathCoordinates && selectedRoute.pathCoordinates.length > 1 && (
            <Polyline
              key={`selected-${selectedRoute.routeId}`}
              positions={selectedRoute.pathCoordinates}
              color={getRouteColor(selectedRoute, true)}
              weight={6}
              opacity={1}
              dashArray={selectedRoute.dirtRoad ? '5, 10' : undefined}
            >
              <Popup>
                <div className="font-bold text-blue-700">{selectedRoute.name}</div>
                <div>Distância: {selectedRoute.actualDistance ? `${selectedRoute.actualDistance.toFixed(0)}` : selectedRoute.distance} km</div>
                <div>Tempo: {parseEstimatedTime(selectedRoute.estimatedTime)} horas</div>
                <div>Risco: {selectedRoute.safety.robberyRisk}</div>
                <div>Condição: {selectedRoute.roadConditions}</div>
                {selectedRoute.dirtRoad && <div className="text-red-600">Estrada de Terra</div>}
              </Popup>
            </Polyline>
          )}

          {/* Renderizar TODAS as rotas para contexto, mas destacar a selecionada */}
          {routesList.map((route) => {
            if (route.routeId === selectedRoute?.routeId || !route.pathCoordinates || route.pathCoordinates.length < 2) {
              return null;
            }

            return (
              <Polyline
                key={route.routeId}
                positions={route.pathCoordinates}
                color={getRouteColor(route, false)}
                weight={3}
                opacity={0.3}
                dashArray={route.dirtRoad ? '5, 10' : undefined}
              >
                <Popup>
                  <div className="font-bold text-blue-700">{route.name}</div>
                  <div>Distância: {route.actualDistance ? `${route.actualDistance.toFixed(0)}` : route.distance} km</div>
                  <div>Tempo: {parseEstimatedTime(route.estimatedTime)} horas</div>
                  <div>Risco: {route.safety.robberyRisk}</div>
                  <div>Condição: {route.roadConditions}</div>
                  {route.dirtRoad && <div className="text-red-600">Estrada de Terra</div>}
                </Popup>
              </Polyline>
            );
          })}

          {/* Marcadores de Pedágio para a Rota Selecionada */}
          {selectedRoute?.tollBooths.map((toll, index) => (
            <Marker key={`toll-${selectedRoute.routeId}-${index}`} position={toll.coordinates} icon={tollIcon}>
              <Popup>
                <span className="font-bold">Pedágio:</span> {toll.location}<br />
                Custo por eixo: R$ {toll.costPerAxle.toFixed(2)}
              </Popup>
            </Marker>
          ))}

          {/* Marcadores de Áreas de Risco para a Rota Selecionada */}
          {selectedRoute?.dangerZones && selectedRoute.dangerZones.map((zone, index) => (
            <Marker 
              key={`danger-${selectedRoute.routeId}-${index}`} 
              position={zone.coordinates} 
              icon={getRiskIcon(zone.riskLevel)}
            >
              <Popup>
                <span className="font-bold text-red-600">Área de risco: {zone.location}</span><br />
                Nível de risco: {zone.riskLevel}<br />
                {zone.description}
              </Popup>
            </Marker>
          ))}

          {/* Marcadores de POIs para a Rota Selecionada */}
          {selectedRoute?.pois && selectedRoute.pois.map((poi, index) => (
            <Marker key={`poi-${selectedRoute.routeId}-${index}`} position={poi.coordinates} icon={getPoiIcon(poi.type)}>
              <Popup>
                <span className="font-bold">{poi.location} ({poi.type === 'construction' ? 'Obra' : poi.type === 'danger' ? 'Perigo' : poi.type === 'rest' ? 'Descanso' : 'Combustível'})</span><br />
                {poi.description}
              </Popup>
            </Marker>
          ))}

          {/* Marcadores de Velocidade para a Rota Selecionada */}
          {selectedRoute?.speedLimits.map((speedLimit, index) => (
            speedLimit.coordinates && (
              <Marker
                key={`speed-${selectedRoute.routeId}-${index}`}
                position={speedLimit.coordinates}
                icon={getSpeedLimitIcon(speedLimit.value ?? 60)}
              >
                <Popup>
                  <span className="font-bold">Limite de Velocidade:</span><br />
                  {speedLimit.limit} na {speedLimit.road}
                </Popup>
              </Marker>
            )
          ))}

          {/* Marcadores de Início e Fim (sempre visíveis) */}
          <Marker position={juazeiroCoordinates}>
            <Popup><span className="font-bold">Juazeiro</span><br />(Ponto de Partida)</Popup>
          </Marker>
          <Marker position={salvadorCoordinates}>
            <Popup><span className="font-bold">Salvador</span><br />(Destino)</Popup>
          </Marker>

          {/* Animação do Caminhão na Rota Selecionada */}
          {selectedRoute && selectedRoute.pathCoordinates && selectedRoute.pathCoordinates.length > 1 && (
            <TruckAnimation
              routePath={selectedRoute.pathCoordinates}
              // Use a duração real (em segundos) se disponível, senão a estimada em horas
              speed={(selectedRoute.actualDistance || selectedRoute.distance) / (selectedRoute.actualDuration ? selectedRoute.actualDuration / 3600 : parseEstimatedTime(selectedRoute.estimatedTime))} // Velocidade média em km/h
              playing={isPlaying}
              onTripEnd={handleTripEnd}
              onFuelEmpty={handleFuelEmpty}
              vehicle={vehicle}
              routeDistance={selectedRoute.actualDistance || selectedRoute.distance}
              setCurrentFuel={(fuel) => setVehicle(prev => ({ ...prev, currentFuel: fuel }))}
              isDirtRoad={selectedRoute.dirtRoad || false}
            />
          )}
        </MapContainer>
      </div>

      {/* Menu Lateral (Painel de Combustível e Seleção de Rotas) */}
      <div className="lg:w-1/4 w-full p-4 rounded-lg shadow-lg overflow-y-auto mb-4 lg:mb-0 lg:ml-4 mt-20">
        {/* Painel de Combustível */}
        <div className="bg-[#FFC06F] p-4 rounded-lg shadow-md border-2 border-black mb-6">
          <h2 className="text-xl font-['Silkscreen'] font-bold mb-3 text-black text-center border-b-2 border-black pb-2">
            COMBUSTÍVEL
          </h2>
          <p className="font-sans text-black text-lg mb-2">
            <span className="font-bold">PREÇO DO DIESEL:</span> R$ 5,50 por litro
          </p>
          <div className="bg-black h-px my-2"></div>
          <h3 className="font-['Silkscreen'] text-lg font-bold text-black mb-2">VEÍCULO: {vehicle.name.toUpperCase()}</h3>
          <p className="font-sans text-black text-md mb-1">- ASFALTO: {vehicle.consumption.asphalt}KM/L</p>
          <p className="font-sans text-black text-md mb-3">- TERRA: {vehicle.consumption.dirt}KM/L</p>

          <button 
            className="bg-[#E3922A] text-black font-bold py-2 px-4 rounded-md w-full mb-3 shadow-md border-2 border-black hover:bg-[#FFC06F]"
            onClick={handleOpenFuelModal}
          >
            ABASTECER
          </button>

          <p className="font-sans text-black text-md mb-2">NÍVEL DO TANQUE</p>
          <div className="w-full bg-gray-300 rounded-full h-6 border-2 border-black">
            <div
              className="bg-green-500 h-full rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ width: `${(vehicle.currentFuel / vehicle.maxCapacity) * 100}%` }}
            >
              {vehicle.currentFuel}/{vehicle.maxCapacity}
            </div>
          </div>
        </div>

        {/* Título "ESCOLHA UMA ROTA" */}
        <h2 className="text-2xl font-['Silkscreen'] font-bold mb-4 text-white text-center border-b-2 border-white pb-2">
          ESCOLHA UMA ROTA
        </h2>

        {/* Lista de Rotas - Restaurado para o estilo anterior */}
        {routesList.map((route) => (
          <div
            key={route.routeId}
            className={`p-4 mb-3 rounded-lg cursor-pointer transition-all duration-200
              ${selectedRoute?.routeId === route.routeId ? 'bg-yellow-400 border-4 border-black ring-4 ring-yellow-500' : 'bg-white border-2 border-black hover:bg-gray-200'}
              shadow-md`}
            onClick={() => handleSelectRoute(route.routeId)}
          >
            <h3 className="font-['Silkscreen'] font-bold text-2xl text-black mb-1">{route.name}</h3>
            <p className="font-sans text-black text-lg">
              <span className="font-bold">TEMPO ESTIMADO:</span> {route.estimatedTime}
            </p>
            <p className="font-sans text-black text-lg">
              <span className="font-bold">DISTÂNCIA:</span>{" "}
              {route.actualDistance ? `${route.actualDistance.toFixed(0)}` : route.distance} km
            </p>
            <p className="font-sans text-black text-lg flex items-center">
              <span className="font-bold">RISCO ENVOLVIDO:</span>{" "}
              <span className={`${route.safety.robberyRisk == 'Baixo' ? 'text-green-800' : 'text-red-800'} ml-1`}>
                {route.safety.robberyRisk} {route.safety.robberyRisk =='Baixo' ? '✅': '⚠️'}
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* Modal de Fim de Jogo */}
      {showGameOverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] p-4">
          <div className="bg-[#200259] rounded-lg shadow-2xl border-4 border-red-500 max-w-md w-full p-6">
            <h1 className="text-2xl font-['Silkscreen'] font-bold text-red-500 text-center mb-4">
              FIM DE JOGO!
            </h1>
            <p className="text-xl font-['Silkscreen'] text-white text-center mb-6">
              {gameOverReason === 'combustível' 
                ? 'Seu combustível acabou no meio do caminho!' 
                : 'Viagem interrompida!'}
            </p>
            
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => {
                  setShowGameOverModal(false);
                  navigate('/select-vehicle');
                }}
                className="px-6 py-3 bg-red-500 text-white font-bold rounded-md shadow-lg border-2 border-black hover:bg-red-600 transition-all duration-200"
              >
                VOLTAR AO INÍCIO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Abastecimento */}
      {showFuelModal && (
        <FuelModal
          vehicle={vehicle}
          availableMoney={availableMoney}
          onRefuel={handleRefuel}
          onClose={() => setShowFuelModal(false)}
        />
      )}
    </div>
  );
};