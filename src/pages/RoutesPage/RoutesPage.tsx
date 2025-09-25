import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { GameService } from '../../api/gameService';
import { MapComponent } from '../mapaRota/MapComponent';
import { routes as staticRoutesData, getRoutesByChallenge } from '../mapaRota/routesData';
import { ChallengeId } from '../mapaRota/constants';
import { debugChallenges } from '../mapaRota/challengesManager';
import { AudioControl } from '../../components/AudioControl';

interface ApiRoute {
  id: number;
  nome: string;
  descricao: string;
  distancia_km: number;
  tempo_estimado_horas: number;
  tipo_estrada: string;
  velocidade_media_kmh: number;
  danger_zones_data: any[];
  dirt_segments_data: any[];
  mapaId: number;
  routeId: number;
  name: string;
  distance: number;
  estimatedTime: string;
  estimatedTimeHours: number;
  dirtRoad: boolean;
  safety: { robberyRisk: 'Baixo' | 'Médio' | 'Alto'; };
  tollBooths: any[];
  speedLimits: any[];
  roadConditions: string;
  pathCoordinates?: [number, number][];
  actualDistance?: number;
  actualDuration?: number;
  dirtSegments?: any[];
  dangerZones?: any[];
  fuelStop?: any[];
}

export const RoutesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const vehicle = location.state?.selectedVehicle || {
    id: 'carreta', name: 'Carreta', capacity: 60,
    consumption: { asphalt: 2, dirt: 1.5 },
    image: '/carreta.png', maxCapacity: 495, currentFuel: 0, cost: 4500
  };
  const availableMoney = location.state?.availableMoney || 5500;
  const selectedChallenge = location.state?.selectedChallenge;
  const backendChallengeId = location.state?.challengeId;
  const cargoAmount = location.state?.cargoAmount;
  
  // Função para mapear ID numérico do backend para ChallengeId string
  const mapBackendIdToChallengeId = (backendId: number | string): ChallengeId => {
    // Se já for string, usar diretamente
    if (typeof backendId === 'string') {
      return backendId as ChallengeId;
    }
    
    // Mapear ID numérico para string baseado nos dados do selectedChallenge
    if (selectedChallenge?.name) {
      const name = selectedChallenge.name.toUpperCase();
      if (name.includes('SALVADOR')) return 'salvador';
      if (name.includes('RECIFE')) return 'recife';
      if (name.includes('FORTALEZA')) return 'fortaleza';
    }
    
    // Fallback baseado no ID numérico
    switch (Number(backendId)) {
      case 1: return 'salvador';
      case 2: return 'recife';
      case 3: return 'fortaleza';
      default: return 'salvador';
    }
  };
  
  const challengeId = mapBackendIdToChallengeId(backendChallengeId) || 'salvador';
  
  // Debug: verificar se o challengeId está correto
  console.log("🎯 DEBUG RoutesPage - backendChallengeId recebido:", backendChallengeId);
  console.log("🎯 DEBUG RoutesPage - challengeId convertido:", challengeId);
  console.log("🎯 DEBUG RoutesPage - selectedChallenge:", selectedChallenge);
  console.log("🎯 DEBUG RoutesPage - location.state:", location.state);
  
  // Debug: testar todos os desafios
  debugChallenges();

  const [selectedRoute, setSelectedRoute] = useState<ApiRoute | null>(null);

  // Como agora usamos apenas dados estáticos dos desafios, não precisamos da API
  const isLoading = false;
  const isError = false;
  const error = null;
  const refetch = () => {};

  // 🔧 USANDO APENAS AS ROTAS DO DESAFIO SELECIONADO
  const allRoutes = useMemo(() => {
    // Usar diretamente as rotas do desafio selecionado
    const challengeRoutes = getRoutesByChallenge(challengeId);
    console.log(`🗺️ Usando rotas do desafio: ${challengeId}`);
    console.log("📍 Rotas disponíveis:", challengeRoutes.map(r => r.name));
    console.log("📍 Quantidade de rotas:", challengeRoutes.length);
    console.log("📍 Detalhes das rotas:", challengeRoutes);

    // Converter as rotas do desafio para o formato esperado pela interface
    const formattedRoutes = challengeRoutes.map(route => ({
      id: route.routeId,
      nome: route.name,
      descricao: route.name,
      distancia_km: route.distance,
      tempo_estimado_horas: route.estimatedTimeHours,
      tipo_estrada: route.roadConditions || 'Boa',
      velocidade_media_kmh: Math.round(route.distance / route.estimatedTimeHours),
      danger_zones_data: route.dangerZones || [],
      dirt_segments_data: route.dirtSegments || [],
      mapaId: 1,
      routeId: route.routeId,
      name: route.name,
      distance: route.distance,
      estimatedTime: route.estimatedTime,
      estimatedTimeHours: route.estimatedTimeHours,
      dirtRoad: route.dirtRoad || false,
      safety: route.safety || { robberyRisk: 'Médio' },
      tollBooths: route.tollBooths || [],
      speedLimits: route.speedLimits || [],
      roadConditions: route.roadConditions || 'Boa',
      pathCoordinates: route.pathCoordinates,
      actualDistance: route.actualDistance || route.distance,
      actualDuration: route.actualDuration || (route.estimatedTimeHours * 3600),
      dirtSegments: route.dirtSegments || [],
      dangerZones: route.dangerZones || [],
      fuelStop: route.fuelStop || []
    }));

    console.log(`✅ ${formattedRoutes.length} rotas formatadas para o desafio ${challengeId}`);
    return formattedRoutes;
  }, [challengeId]);

  const handleSelectRoute = (routeId: number) => {
    const routeToSelect = allRoutes.find(r => r.id === routeId);
    if (routeToSelect) {
      console.log("🗺️ Rota selecionada:", routeToSelect.name);
      console.log("📍 PathCoordinates disponíveis:", !!routeToSelect.pathCoordinates);
      console.log("📊 Dados completos da rota:", {
        id: routeToSelect.id,
        nome: routeToSelect.name,
        pathCoordinates: routeToSelect.pathCoordinates?.length || 0,
        dirtSegments: routeToSelect.dirtSegments?.length || 0,
        tollBooths: routeToSelect.tollBooths?.length || 0,
        dangerZones: routeToSelect.dangerZones?.length || 0,
        fuelStop: routeToSelect.fuelStop?.length || 0
      });
      setSelectedRoute(routeToSelect);
    }
  };

  const handleContinue = () => {
    if (selectedRoute) {
      // VALIDAÇÃO CRÍTICA: Verificar se temos pathCoordinates
      if (!selectedRoute.pathCoordinates || selectedRoute.pathCoordinates.length === 0) {
        console.error("❌ Rota sem coordenadas! Dados da rota:", selectedRoute);
        alert("Erro: Esta rota não possui dados de mapa. Por favor, escolha outra rota.");
        return;
      }

      // ✅ CORREÇÃO: Logs detalhados antes de navegar
      console.log("✅ Continuando com a rota:", selectedRoute.name);
      console.log("📋 Dados completos enviados:", {
        vehicle: vehicle.name,
        money: availableMoney,
        route: {
          id: selectedRoute.id,
          routeId: selectedRoute.routeId,
          mapaId: selectedRoute.mapaId,
          name: selectedRoute.name,
          pathCoordinatesLength: selectedRoute.pathCoordinates.length
        }
      });

      // Garantir que TODOS os dados necessários sejam passados
      navigate('/fuel', {
        state: {
          vehicle,
          availableMoney,
          selectedRoute: {
            ...selectedRoute,
            // Garantir explicitamente que pathCoordinates seja incluído
            pathCoordinates: selectedRoute.pathCoordinates
          },
          selectedChallenge,
          challengeId,
          cargoAmount
        }
      });
    }
  };

  const goBack = () => {
    navigate('/select-vehicle');
  };

  // ✅ CORREÇÃO: Melhor tratamento de estados de loading/erro
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#200259] font-['Silkscreen'] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#E3922A] text-3xl mb-4">🚛 Carregando rotas...</div>
          <div className="text-white text-lg">Buscando dados atualizados do servidor</div>
          <button
            onClick={() => refetch()}
            className="mt-4 bg-[#E3922A] text-black font-bold px-6 py-3 rounded-md hover:bg-[#FFC06F] text-lg"
          >
            🔄 Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#200259] font-['Silkscreen'] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-3xl mb-4">❌ Erro ao carregar rotas</div>
          <div className="text-white mb-4 text-lg">
            {error instanceof Error ? error.message : 'Erro desconhecido'}
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => refetch()}
              className="bg-[#E3922A] text-black font-bold px-8 py-4 rounded-md hover:bg-[#FFC06F] text-lg"
            >
              🔄 Recarregar Dados
            </button>
            <button
              onClick={() => navigate('/select-vehicle')}
              className="bg-gray-600 text-white font-bold px-8 py-4 rounded-md hover:bg-gray-700 text-lg"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#200259] font-['Silkscreen']">
      {/* Header */}
      <div className="bg-[#200259] border-b-2 border-[#E3922A] px-4 py-3">
        <div className="flex items-center justify-between mx-auto">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#E3922A] text-black font-bold text-base rounded-md shadow-lg
                     hover:bg-[#FFC06F] transition-all duration-200 border-2 border-black"
            onClick={goBack}
          >
            <ArrowLeft size={20} /> VOLTAR
          </button>

          <h1 className="text-2xl lg:text-3xl font-bold text-[#E3922A] text-center">
            ESCOLHA SUA ROTA
          </h1>

          <div className="flex items-center gap-3">
            <AudioControl />
            <div className="bg-[#E3922A] text-black text-lg lg:text-xl font-bold px-4 py-2 rounded-md shadow-lg border-2 border-black">
              R$ {availableMoney.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-col lg:flex-row gap-4 p-4 h-[calc(100vh-70px)] max-h-[calc(100vh-70px)] overflow-hidden">

        {/* 🗺️ MAPA */}
        <div className="lg:w-2/3 h-full lg:h-full flex flex-col min-h-[300px] lg:min-h-0">
          <div className="flex-1 min-h-0 overflow-hidden rounded-lg border-2 border-gray-300">
            {selectedRoute ? (
              <div className="w-full h-full max-h-full overflow-hidden">
                <div className="w-full h-full">
                  <MapComponent
                    preSelectedRoute={selectedRoute}
                    preSelectedVehicle={vehicle}
                    preAvailableMoney={availableMoney}
                    showControls={false}
                  />
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center text-gray-600 font-['Silkscreen'] p-6">
                  <div className="text-6xl mb-4">🗺️</div>
                  <p className="text-2xl font-bold mb-2 text-gray-700">Selecione uma rota</p>
                  <p className="text-lg text-gray-500">para visualizar no mapa</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Rotas */}
        <div className="lg:w-2/5 flex flex-col h-full lg:h-full min-h-[400px] lg:min-h-0">
          <div className="bg-[#E3922A] text-black p-3 rounded-t-lg border-2 border-black mb-0 flex-shrink-0">
            <h2 className="text-xl font-['Silkscreen'] font-bold text-center">
              ROTAS DISPONÍVEIS ({allRoutes.length})
            </h2>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto bg-gray-100 border-x-2 border-black p-3 space-y-3">
            {allRoutes.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <div className="text-4xl mb-3">🚫</div>
                <p className="text-xl">Nenhuma rota encontrada</p>
                <button
                  onClick={() => refetch()}
                  className="mt-3 bg-[#E3922A] text-black font-bold px-6 py-3 rounded-md hover:bg-[#FFC06F] text-base"
                >
                  🔄 Recarregar
                </button>
              </div>
            ) : (
              allRoutes.map((route) => (
                <div
                  key={route.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border-2
                    ${selectedRoute?.id === route.id
                      ? 'bg-yellow-300 border-yellow-600 shadow-lg'
                      : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'}
                    `}
                  onClick={() => handleSelectRoute(route.id)}
                >
                  <h3 className="font-['Silkscreen'] font-bold text-base text-black mb-3 border-b border-gray-300 pb-2">
                    {route.nome}
                  </h3>

                  <div className="space-y-1">
                    <p className="font-['Silkscreen'] text-black text-sm">
                      <span>⏱️ TEMPO:</span> {route.estimatedTime}
                    </p>
                    <p className="font-['Silkscreen'] text-black text-sm">
                      <span>📏 DISTÂNCIA:</span> {route.distance.toFixed(0)} km
                    </p>
                    {route.dirtRoad && (
                      <p className="font-['Silkscreen'] text-black text-sm">
                        <span>🛤️ TERRENO:</span> <span className="text-yellow-700 whitespace-nowrap">Estrada de Terra</span>
                      </p>
                    )}
                    <p className="font-['Silkscreen'] text-black text-sm flex items-center">
                      <span>🛡️ RISCO:</span>
                      <span className={`${route.safety.robberyRisk === 'Baixo' ? 'text-green-700' : 'text-red-700'} ml-2`}>
                        {route.safety.robberyRisk} {route.safety.robberyRisk === 'Baixo' ? '✅' : '⚠️'}
                      </span>
                    </p>
                    {/* 🔍 INDICADOR DE MAPA */}
                    {route.pathCoordinates && route.pathCoordinates.length > 0 ? (
                      <p className="font-['Silkscreen'] text-green-600 text-sm">
                        🗺️ Mapa disponível ({route.pathCoordinates.length} pontos)
                      </p>
                    ) : (
                      <p className="font-['Silkscreen'] text-red-600 text-sm">
                        ⚠️ Mapa indisponível
                      </p>
                    )}
                  </div>

                  {selectedRoute?.id === route.id && (
                    <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-md">
                      <h4 className="font-bold text-blue-800 mb-2 text-sm">📋 DETALHES:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                        <p>🗺️ Mapa: {route.mapaId}</p>
                        <p>🆔 Rota: {route.id}</p>
                        {route.danger_zones_data.length > 0 && (
                          <p>⚠️ Perigos: {route.danger_zones_data.length}</p>
                        )}
                        {route.dirt_segments_data.length > 0 && (
                          <p>🌄 Terra: {route.dirt_segments_data.length}</p>
                        )}
                        <p>🚦 Velocidade: {route.velocidade_media_kmh} km/h</p>
                        <p>🛣️ Tipo: {route.tipo_estrada}</p>
                        {route.pathCoordinates ? (
                          <p className="text-green-700">📍 Coordenadas: {route.pathCoordinates.length} pontos</p>
                        ) : (
                          <p className="text-red-700">📍 Sem coordenadas!</p>
                        )}
                        {route.dirtSegments && route.dirtSegments.length > 0 && (
                          <p>🏜️ Trechos terra: {route.dirtSegments.length}</p>
                        )}
                      </div>
                      {route.descricao && (
                        <p className="text-sm text-gray-600 mt-2 italic">{route.descricao}</p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="bg-[#E3922A] border-2 border-black rounded-b-lg p-3 flex-shrink-0">
            {selectedRoute ? (
              <button
                onClick={handleContinue}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 text-base rounded-md 
                         shadow-lg border-2 border-green-800 transition-all duration-200"
              >
                🚛 CONTINUAR COM ESTA ROTA
              </button>
            ) : (
              <div className="text-center text-black font-bold py-3 text-base">
                👆 Selecione uma rota para continuar
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};