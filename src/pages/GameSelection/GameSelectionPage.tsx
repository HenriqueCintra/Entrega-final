// arquivo: src/pages/GameSelection/GameSelectionPage.tsx

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import GameCard from './components/GameCard';
import PixelHeading from './components/PixelHeading';
import Footer from './components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ImageIcon, Loader, AlertTriangle } from 'lucide-react';
import { AudioControl } from '@/components/AudioControl';
import { GameService } from '@/api/gameService';
import { Map as Desafio } from '@/types'; // O tipo Map representa um Desafio
import { useAuth } from '@/contexts/AuthContext';
import { ContinueGameModal } from '@/components/ContinueGameModal/ContinueGameModal';

const gamesData = [
  {
    id: 'entrega_eficiente', // ID para controle interno
    title: "ENTREGA EFICIENTE", // Título do JOGO que será exibido
    description: "GERENCIE SUA FROTA DE CAMINHÕES, ESCOLHA AS MELHORES ROTAS E FAÇA ENTREGAS COM EFICIÊNCIA.",
    borderColor: 'border-yellow-500',
    buttonBgColor: 'bg-yellow-500',
    buttonHoverColor: 'hover:bg-yellow-600',
    isActive: true,
  },
  {
    id: 'centro_distribuicao',
    title: "Centro de Distribuição",
    description: "Gerencie o fluxo de produtos em seu centro de distribuição, otimizando a logística e reduzindo custos.",
    borderColor: 'border-green-400',
    buttonBgColor: 'bg-green-300',
    buttonHoverColor: 'hover:bg-green-400',
    isActive: false,
  },
  {
    id: 'gestao_estoque',
    title: "Gestão de Estoque",
    description: "Gerencie o estoque de produtos, otimizando a distribuição e reduzindo custos.",
    borderColor: 'border-blue-400',
    buttonBgColor: 'bg-blue-300',
    buttonHoverColor: 'hover:bg-blue-400',
    isActive: false,
  },
];

const GameSelectionPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const hasRedirected = useRef(false); // 2. CRIAR A "BANDEIRA" DE CONTROLE
  const [showContinueModal, setShowContinueModal] = useState(false);

  const { data: desafios, isLoading, isError } = useQuery<Desafio[]>({
    queryKey: ['mapas'],
    queryFn: GameService.getMaps,
    enabled: !authLoading && !!user?.equipe,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      }
      // 3. ADICIONAR A VERIFICAÇÃO DA BANDEIRA
      else if (!user.equipe && !hasRedirected.current) {
        hasRedirected.current = true; // Marca que o redirecionamento foi iniciado
        alert("Você precisa fazer parte de uma equipe para jogar!");
        navigate('/choose-team');
      }
    }
  }, [user, authLoading, navigate]);

  const handleGameClick = async (gameId: string) => {
    if (gameId === 'entrega_eficiente') {
      try {
        // Verifica se há uma partida ativa ou pausada
        const partidaAtiva = await GameService.getActiveGame();

        // Se encontrou uma partida ativa ou pausada, mostra o modal
        if (partidaAtiva && (partidaAtiva.status === 'pausado' || partidaAtiva.status === 'em_andamento')) {
          console.log('✅ Partida pausada/ativa encontrada. Mostrando modal...');
          setShowContinueModal(true);
          return;
        }
      } catch (error) {
        // Se não houver partida ativa (erro 404), continua o fluxo normal
        console.log('ℹ️ Nenhuma partida ativa encontrada. Iniciando fluxo normal do jogo...');
      }

      // Se não há partida ativa, segue o fluxo normal do jogo (tutorial)
      if (desafios && desafios.length > 0) {
        const primeiroDesafio = desafios[0];
        navigate('/tutorial', { state: { mapaId: primeiroDesafio.id } });
      } else if (!isLoading) {
        alert("Nenhum desafio encontrado para este jogo. Verifique o backend.");
      }
    } else {
      const game = gamesData.find(g => g.id === gameId);
      alert(`O jogo "${game?.title}" ainda está em desenvolvimento!`);
    }
  };

  const handleContinueGame = async () => {
    setShowContinueModal(false);

    try {
      // Busca a partida ativa do backend
      const partidaAtiva = await GameService.getActiveGame();

      // Busca os detalhes completos da partida
      const partidaCompleta = await GameService.getPartida(partidaAtiva.id);

      console.log('🎮 Continuando partida:', partidaCompleta);

      // ✅ Mapeia o ID do veículo para a imagem correta
      // IDs do banco: 1=Caminhonete, 2=Caminhão Pequeno, 3=Caminhão Médio, 4=Carreta
      const vehicleImageByIdMap: { [key: number]: string } = {
        1: '/assets/caminhonete.png',
        2: '/assets/caminhao_pequeno.png',
        3: '/assets/caminhao_medio.png',
        4: '/assets/carreta.png'
      };

      // Fallback: mapeia por nome do modelo caso o ID não funcione
      const vehicleImageByNameMap: { [key: string]: string } = {
        'Caminhonete': '/assets/caminhonete.png',
        'Caminhão Pequeno': '/assets/caminhao_pequeno.png',
        'Caminhão Médio': '/assets/caminhao_medio.png',
        'Carreta': '/assets/carreta.png'
      };

      const vehicleModel = partidaCompleta.veiculo_detalhes?.modelo || 'Caminhão Médio';
      const vehicleId = partidaCompleta.veiculo;

      // Tenta primeiro por ID, depois por nome
      const vehicleImage = vehicleImageByIdMap[vehicleId] ||
        vehicleImageByNameMap[vehicleModel] ||
        '/assets/caminhao_medio.png';

      console.log('🚗 Veículo ID:', vehicleId, 'Modelo:', vehicleModel, '→ Imagem:', vehicleImage);

      // Reconstrói o estado do jogo a partir dos dados do backend
      const selectedVehicle = {
        id: String(partidaCompleta.veiculo), // ✅ Converte para string
        name: vehicleModel,
        capacity: partidaCompleta.veiculo_detalhes?.capacidade_carga || 1000,
        maxCapacity: partidaCompleta.veiculo_detalhes?.capacidade_combustivel || 100,
        currentFuel: partidaCompleta.combustivel_atual,
        cost: partidaCompleta.veiculo_detalhes?.preco || 0,
        consumption: {
          asphalt: 3,
          dirt: 2
        },
        image: vehicleImage, // ✅ Usa a imagem correta baseada no modelo
        spriteSheet: undefined
      };

      const selectedRoute = {
        id: partidaCompleta.rota,
        mapaId: partidaCompleta.mapa, // ✅ ADICIONA mapaId para compatibilidade
        name: partidaCompleta.rota_detalhes?.nome || 'Rota',
        description: partidaCompleta.rota_detalhes?.descricao || '',
        distance: partidaCompleta.rota_detalhes?.distancia_km || 500,
        actualDistance: partidaCompleta.rota_detalhes?.distancia_km || 500, // ✅ ADICIONA actualDistance
        estimatedTime: partidaCompleta.rota_detalhes?.tempo_estimado_horas || 8,
        estimatedTimeHours: partidaCompleta.rota_detalhes?.tempo_estimado_horas || 8, // ✅ ADICIONA estimatedTimeHours
        roadType: partidaCompleta.rota_detalhes?.tipo_estrada || 'asfalto',
        averageSpeed: partidaCompleta.rota_detalhes?.velocidade_media_kmh || 60,
        dangerZones: partidaCompleta.rota_detalhes?.danger_zones_data || [],
        dirtSegments: partidaCompleta.rota_detalhes?.dirt_segments_data || [],
        fuelStop: partidaCompleta.rota_detalhes?.fuelStop || [],
        pathCoordinates: partidaCompleta.rota_detalhes?.pathCoordinates || []
      };

      console.log('🚗 Veículo reconstruído:', selectedVehicle);
      console.log('🗺️ Rota reconstruída:', selectedRoute);

      // Calcula o progresso atual
      const progressPercentage = partidaCompleta.progresso ||
        ((partidaCompleta.distancia_percorrida / (partidaCompleta.rota_detalhes?.distancia_km || 500)) * 100);

      console.log('📊 Progresso calculado:', {
        progresso_backend: partidaCompleta.progresso,
        distancia_percorrida: partidaCompleta.distancia_percorrida,
        distancia_total: partidaCompleta.rota_detalhes?.distancia_km,
        progressPercentage: progressPercentage
      });

      const navigationState = {
        selectedVehicle,
        selectedRoute,
        availableMoney: partidaCompleta.saldo,
        mapaId: partidaCompleta.mapa,
        savedProgress: {
          activeGameId: partidaCompleta.id,
          distanceTravelled: partidaCompleta.distancia_percorrida,
          progress: progressPercentage,
          gameTime: partidaCompleta.tempo_jogo_segundos || 0,
          currentFuel: partidaCompleta.combustivel_atual
        }
      };

      console.log('🚀 Navegando para /game com estado:', navigationState);

      // Navega para o jogo com o estado restaurado
      navigate('/game', { state: navigationState });

    } catch (error) {
      console.error('❌ Erro ao continuar jogo:', error);
      alert('Erro ao carregar o jogo. Tente novamente.');
    }
  };

  const handleNewGame = () => {
    setShowContinueModal(false);
    localStorage.removeItem('savedGameProgress');
    localStorage.removeItem('activeGameId');

    // Inicia novo jogo seguindo o fluxo normal (tutorial)
    if (desafios && desafios.length > 0) {
      const primeiroDesafio = desafios[0];
      navigate('/tutorial', { state: { mapaId: primeiroDesafio.id } });
    } else {
      alert("Nenhum desafio encontrado para este jogo.");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-800 flex flex-col items-center justify-center">
        <Loader className="animate-spin text-white mb-4" size={48} />
        <p className="text-white [font-family:'Silkscreen',Helvetica]">Verificando sua equipe...</p>
      </div>
    );
  }

  if (!user?.equipe) {
    return null;
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-800 flex flex-col items-center justify-between py-12 px-4"
      style={{ fontFamily: "'Press Start 2P', cursive" }}
    >
      {/* ================================================================ */}
      {/* ======================= BOTÃO DE VOLTAR ======================== */}
      {/* ================================================================ */}
      <div className="absolute top-14 left-[33px]">
        <Button
          onClick={() => navigate(-1)}
          className="bg-[#e3922a] hover:bg-[#d4831f] text-black px-4 py-2 border-2 border-black rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-['Silkscreen'] h-12 flex items-center gap-2 transform transition-transform duration-300 hover:scale-105"
        >
          <ArrowLeft size={20} />
          Voltar
        </Button>
      </div>
      {/* ================================================================ */}
      {/* ================================================================ */}

      <div className="absolute top-14 right-[33px]">
        <AudioControl />
      </div>

      {/* Modal de continuar jogo */}
      <ContinueGameModal
        isOpen={showContinueModal}
        onContinue={handleContinueGame}
        onNewGame={handleNewGame}
      />

      <div className="w-full max-w-6xl flex flex-col items-center">
        <PixelHeading text="ESCOLHA SEU JOGO" className="mb-12 mt-8" />

        {isLoading && (
          <div className="text-white text-lg flex items-center">
            <Loader className="mr-2 animate-spin" /> Carregando desafios...
          </div>
        )}

        {isError && (
          <div className="text-red-400 text-lg flex items-center">
            <AlertTriangle className="mr-2" /> Erro ao carregar desafios.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {gamesData.map((game) => (
            <GameCard
              key={game.id}
              title={game.title}
              description={game.description}
              isActive={game.isActive}
              onClick={() => game.isActive && handleGameClick(game.id)}
              borderColor={game.borderColor}
              buttonBgColor={game.buttonBgColor}
              buttonHoverColor={game.buttonHoverColor}
              icon={<ImageIcon className="w-12 h-12" />}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GameSelectionPage;