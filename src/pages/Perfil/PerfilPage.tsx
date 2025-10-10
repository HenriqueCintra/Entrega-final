import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { TeamService } from "../../api/teamService";
import { GameService } from "../../api/gameService";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
} from "../../components/ui/card";
import { AudioControl } from "../../components/AudioControl";
import { PlayIcon, Trophy, TruckIcon, MapPin, DollarSign } from 'lucide-react';

export const PerfilPage = () => {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  // Buscar dados da equipe se o usuário estiver em uma
  const { data: teamData } = useQuery({
    queryKey: ['teamDetails', user?.equipe],
    queryFn: () => TeamService.getTeamDetails(user!.equipe!),
    enabled: !!user?.equipe, // Só busca se o usuário estiver em uma equipe
  });

  // Derivar estatísticas dos dados da equipe
  const userStats = {
    deliveries: teamData?.stats?.partidas_concluidas ?? 0,
    distance: teamData?.stats?.distance ?? 0,
    earnings: teamData?.stats?.earnings ?? 0,
    victories: teamData?.stats?.vitorias ?? 0,
  };

  // ✅ VERIFICAR SE HÁ PARTIDA ATIVA/PAUSADA NO BACKEND
  const { data: partidaAtiva } = useQuery({
    queryKey: ['partidaAtiva', user?.equipe],
    queryFn: async () => {
      console.log('🔄 Buscando partida ativa do backend (sem cache)...');
      try {
        return await GameService.getActiveGame();
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.log('ℹ️ Nenhuma partida ativa encontrada');
          return null; // Sem partida ativa
        }
        throw error;
      }
    },
    enabled: !!user?.equipe,
    retry: false, // Não retentar se não houver partida
    staleTime: 0, // ✅ SEMPRE considerar dados como obsoletos
    gcTime: 0, // ✅ NÃO manter cache (era cacheTime em versões antigas)
    refetchOnMount: 'always', // ✅ SEMPRE buscar ao montar o componente
    refetchOnWindowFocus: true, // ✅ Buscar quando a janela receber foco
  });

  // ✅ LIMPAR CACHE AO MONTAR O COMPONENTE
  useEffect(() => {
    console.log('🔄 PerfilPage montado - invalidando cache de partidas...');
    queryClient.invalidateQueries({ queryKey: ['partidaAtiva'] });
  }, [queryClient]);


  const handlePlayNow = () => {
    // ✅ LIMPAR CACHE ANTES DE INICIAR NOVO JOGO
    console.log('🆕 Iniciando novo jogo - limpando cache...');
    queryClient.invalidateQueries({ queryKey: ['partidaAtiva'] });
    localStorage.removeItem('savedGameProgress');

    if (user?.equipe) {
      navigate("/desafio");
    } else {
      alert("Você precisa estar em uma equipe para iniciar um novo jogo.");
      navigate("/choose-team");
    }
  };

  const handleContinueGame = async () => {
    console.log('🔄 Buscando partida ativa/pausada do backend...');

    try {
      // ✅ BUSCAR PARTIDA DO BACKEND
      const partida = await GameService.getActiveGame();

      console.log('✅ Partida encontrada no backend:', partida);
      console.log('📊 Status da partida:', partida.status);
      console.log('🚛 Veículo:', partida.veiculo_detalhes);
      console.log('🗺️ Rota:', partida.rota_detalhes);

      // ✅ VALIDAR DADOS DO BACKEND
      if (!partida.veiculo_detalhes || !partida.rota_detalhes) {
        console.error('❌ Dados incompletos na partida do backend');
        console.error('veiculo_detalhes:', partida.veiculo_detalhes);
        console.error('rota_detalhes:', partida.rota_detalhes);
        alert('Erro: Dados da partida estão incompletos. Iniciando novo jogo...');
        navigate("/desafio");
        return;
      }

      // Type assertion para satisfazer TypeScript
      const veiculo = partida.veiculo_detalhes!;
      const rota = partida.rota_detalhes!;

      // ✅ MAPEAMENTO DE MODELOS PARA IMAGENS (case-insensitive)
      const getVehicleImage = (modelo: string): string => {
        const modeloLower = modelo.toLowerCase().trim();

        const imageMap: { [key: string]: string } = {
          'caminhonete': '/assets/caminhonete.png',
          'caminhão pequeno': '/assets/caminhao_pequeno.png',
          'caminhao pequeno': '/assets/caminhao_pequeno.png',
          'caminhão médio': '/assets/caminhao_medio.png',
          'caminhao medio': '/assets/caminhao_medio.png',
          'carreta': '/assets/carreta.png',
        };

        const image = imageMap[modeloLower] || '/assets/truck.png';
        console.log('🖼️ Mapeando veículo:', modelo, '→', image);
        return image;
      };

      const vehicleImage = getVehicleImage(veiculo.modelo);

      // ✅ CONVERTER DADOS DO BACKEND PARA O FORMATO DO FRONTEND
      const vehicleData = {
        id: partida.veiculo?.toString() || veiculo.id.toString(),
        name: veiculo.modelo,
        capacity: veiculo.capacidade_carga,
        consumption: {
          asphalt: veiculo.autonomia / veiculo.capacidade_combustivel,
          dirt: veiculo.autonomia / veiculo.capacidade_combustivel * 0.7
        },
        image: vehicleImage,
        // ✅ NÃO definir spriteSheet - deixar undefined para carregar como imagem simples
        maxCapacity: veiculo.capacidade_combustivel,
        currentFuel: partida.combustivel_atual,
        cost: veiculo.preco,
        speed: veiculo.velocidade,
        autonomy: veiculo.autonomia
      };

      const routeData = {
        id: partida.rota || rota.id,
        mapaId: partida.mapa || 0,
        name: rota.nome,
        description: rota.descricao,
        distance: rota.distancia_km,
        actualDistance: rota.distancia_km,
        estimatedTimeHours: rota.tempo_estimado_horas,
        roadType: rota.tipo_estrada,
        averageSpeed: rota.velocidade_media_kmh,
        pathCoordinates: rota.pathCoordinates || [],
        fuelStop: rota.fuelStop || [],
        danger_zones_data: rota.danger_zones_data || [],
        dirt_segments_data: rota.dirt_segments_data || []
      };

      console.log('✅ Dados convertidos, navegando para o jogo...');

      // ✅ NAVEGAR PARA O JOGO COM DADOS DO BACKEND
      navigate('/game', {
        state: {
          selectedVehicle: vehicleData,
          availableMoney: partida.saldo,
          selectedRoute: routeData,
          savedProgress: {
            currentFuel: partida.combustivel_atual,
            progress: partida.progresso || 0,
            currentPathIndex: 0, // Backend não salva isso ainda
            pathProgress: 0, // Backend não salva isso ainda
            gameTime: partida.tempo_jogo_segundos || (partida.tempo_jogo ? partida.tempo_jogo * 60 : 0),
            activeGameId: partida.id,
            distanceTravelled: partida.distancia_percorrida,
            triggeredGasStations: [] // Backend não salva isso ainda
          }
        }
      });

      // ✅ LIMPAR LOCALSTORAGE APÓS CARREGAR DO BACKEND
      localStorage.removeItem('savedGameProgress');

    } catch (error: any) {
      console.error('❌ Erro ao buscar partida:', error);

      // Se não encontrar partida no backend (404), oferece iniciar novo jogo
      if (error.response?.status === 404) {
        const startNewGame = window.confirm('Não há jogo salvo. Deseja iniciar um novo jogo?');
        if (startNewGame) {
          if (user?.equipe) {
            navigate("/desafio");
          } else {
            alert("Você precisa estar em uma equipe para iniciar um novo jogo.");
            navigate("/choose-team");
          }
        }
      } else {
        alert('Erro ao carregar partida do servidor. Tente novamente.');
      }
    }
  };

  const handleCheckRanking = () => {
    navigate("/ranking", { state: { from: 'profile' } });
  };

  const handleEditProfile = () => {
    navigate("/perfil/editar");
  };

  const handleChangePassword = () => {
    navigate("/mudar-senha");
  };

  const handleGetOutTeam = async () => {
    if (!user?.equipe) return;
    try {
      await TeamService.leaveTeam();
      await refreshUser();
      alert("Você saiu da equipe com sucesso!");
    } catch (error) {
      alert("Erro ao sair da equipe. Tente novamente.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleManageTeam = () => {
    if (user?.equipe) {
      navigate("/perfil/editar-equipe");
    } else {
      navigate("/choose-team");
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  const displayName = user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.nickname || user.username;

  const teamDisplayName = teamData?.nome || "SEM EQUIPE";

  const titleStyle = {
    color: "#E3922A",
    textShadow: "2px 3px 0.6px #000"
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="w-full min-h-screen [background:linear-gradient(180deg,rgba(57,189,248,1)_0%,rgba(154,102,248,1)_100%)] relative overflow-hidden">
        {/* Nuvens decorativas */}
        <img
          className="w-[375px] h-[147px] absolute top-[120px] left-[157px] object-cover animate-float-right"
          alt="Cloud decoration"
          src="/nuvemleft.png"
        />
        <img
          className="w-[436px] h-[170px] absolute bottom-[30px] right-[27px] object-cover animate-float-left opacity-75 scale-110"
          alt="Cloud decoration"
          src="/nuvemright.png"
        />

        {/* Controle de áudio */}
        <div className="absolute top-14 right-8 z-20">
          <AudioControl />
        </div>

        {/* Conteúdo principal */}
        <div className="max-w-5xl mx-auto pt-20 px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Coluna esquerda - Informações do perfil */}
            <div className="space-y-4">
              <Card className="border-2 border-solid border-black rounded-lg overflow-hidden">
                <CardContent className="p-4">
                  <div className="text-center">
                    <h2 className="[font-family:'Silkscreen',Helvetica] font-bold text-2xl pb-1 border-b-2 border-black" style={titleStyle}>
                      SEU PERFIL
                    </h2>

                    {/* === SEÇÃO DO AVATAR SIMPLIFICADA - APENAS EXIBIÇÃO === */}
                    <div className="mt-3 flex justify-center">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-teal-100 border-4 border-teal-500 flex items-center justify-center overflow-hidden">
                          <img
                            src={user.avatar || "/assets/avatars/perfil_caminhao.png"} // === USAR AVATAR DO USUÁRIO ===
                            alt="Avatar"
                            className="w-20 h-20 object-cover rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                    {/* ========================================================= */}

                    {/* Nome do usuário - usando dados reais */}
                    <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-center text-xl mt-2">
                      {displayName.toUpperCase()}
                    </h3>

                    {/* Informações da equipe - usando dados reais do backend */}
                    <div
                      className="mt-4 [font-family:'Silkscreen',Helvetica] cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors flex items-center gap-2"
                      onClick={handleManageTeam}
                    >
                      <span className="font-bold">EQUIPE: </span>
                      <span className={`font-bold ${user.equipe ? 'text-orange-500' : 'text-gray-500'}`}>
                        {teamDisplayName}
                      </span>
                      {user.equipe && (
                        <>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="ml-2 px-2 py-1 text-xs border-2 border-black"
                            onClick={e => { e.stopPropagation(); handleGetOutTeam(); }}
                          >
                            SAIR
                          </Button>

                        </>
                      )}
                      <div className="text-xs text-gray-600 mt-1">
                        {user.equipe ? 'Clique para gerenciar' : 'Clique para entrar em uma equipe'}
                      </div>
                    </div>

                    {/* Botões de ação */}
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <Button
                        variant="outline"
                        className="flex flex-col items-center justify-center h-16 border-2 border-black"
                        onClick={handleEditProfile}
                      >
                        <span className="text-2xl">👤</span>
                        <span className="text-xs [font-family:'Silkscreen',Helvetica]">EDITAR PERFIL</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex flex-col items-center justify-center h-16 border-2 border-black"
                        onClick={handleChangePassword}
                      >
                        <span className="text-2xl">🔒</span>
                        <span className="text-xs [font-family:'Silkscreen',Helvetica]">SENHA</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex flex-col items-center justify-center h-16 border-2 border-black"
                        onClick={handleLogout}
                      >
                        <span className="text-2xl">↪️</span>
                        <span className="text-xs [font-family:'Silkscreen',Helvetica]">SAIR</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coluna direita - Informações do jogo e estatísticas */}
            <div className="space-y-4">
              {/* Card de jogar */}
              <Card className="border-2 border-solid border-black rounded-lg overflow-hidden">
                <CardContent className="p-4">
                  {/* Título do jogo e botão de jogar */}
                  <div className="flex justify-between items-center">
                    {/* Informações do jogo */}
                    <div>
                      <h2 className="[font-family:'Silkscreen',Helvetica] font-bold text-2xl" style={titleStyle}>
                        ENTREGA EFICIENTE
                      </h2>
                      <p className="[font-family:'Silkscreen',Helvetica] text-sm mt-1">
                        CONTINUE SUA JORNADA DE ENTREGAS!
                      </p>
                    </div>

                    {/* Botão de jogar */}
                    <Button
                      onClick={handlePlayNow}
                      className="bg-orange-400 text-black hover:bg-orange-500 h-12 flex items-center justify-between px-4 rounded border-2 border-black [font-family:'Silkscreen',Helvetica] font-bold"
                    >
                      <span>JOGAR AGORA</span>
                      <PlayIcon className="ml-2" />
                    </Button>
                  </div>

                  {/* Link para outros jogos */}
                  <div className="text-center mt-1">
                    <button
                      onClick={() => navigate("/game-selection")}
                      className="text-xs underline [font-family:'Silkscreen',Helvetica] text-blue-500"
                    >
                      JOGAR OUTRO JOGO!
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Grid de estatísticas */}
              <div className="grid grid-cols-4 gap-3">
                {/* Entregas */}
                <Card className="border-2 border-solid border-black rounded-lg overflow-hidden">
                  <CardContent className="py-3 px-4 flex flex-col items-center">
                    <TruckIcon size={24} />
                    <div className="[font-family:'Silkscreen',Helvetica] text-center mt-1">
                      <span className="text-xs">ENTREGAS</span>
                      <div className="font-bold">{userStats.deliveries}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Distância */}
                <Card className="border-2 border-solid border-black rounded-lg overflow-hidden">
                  <CardContent className="py-3 px-4 flex flex-col items-center">
                    <MapPin size={24} color="#4ade80" />
                    <div className="[font-family:'Silkscreen',Helvetica] text-center mt-1">
                      <span className="text-xs">DISTÂNCIA</span>
                      <div className="font-bold">{userStats.distance.toFixed(2)} km</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ganhos */}
                <Card className="border-2 border-solid border-black rounded-lg overflow-hidden">
                  <CardContent className="py-3 px-4 flex flex-col items-center">
                    <DollarSign size={24} color="#eab308" />
                    <div className="[font-family:'Silkscreen',Helvetica] text-center mt-1">
                      <span className="text-xs">GANHOS</span>
                      <div className="font-bold">R$ {userStats.earnings.toFixed(2)}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Vitórias */}
                <Card className="border-2 border-solid border-black rounded-lg overflow-hidden">
                  <CardContent className="py-3 px-4 flex flex-col items-center">
                    <span className="text-2xl">🏆</span>
                    <div className="[font-family:'Silkscreen',Helvetica] text-center mt-1">
                      <span className="text-xs">VITÓRIAS</span>
                      <div className="font-bold">{userStats.victories}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cards de ação */}
              <div className="grid grid-cols-2 gap-3">
                {/* Card de ranking */}
                <Card className="border-2 border-solid border-black rounded-lg overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="p-4" onClick={handleCheckRanking}>
                    <div className="flex items-center">
                      <Trophy size={32} className="text-yellow-500" />
                      <div className="ml-3">
                        <h3 className="[font-family:'Silkscreen',Helvetica] font-bold" style={titleStyle}>
                          RANKING
                        </h3>
                        <p className="[font-family:'Silkscreen',Helvetica] text-xs">
                          VEJA OS MELHORES JOGADORES
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card de continuar jogo */}
                <Card className="border-2 border-solid border-black rounded-lg overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="p-4" onClick={handleContinueGame}>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center">
                        <span className="text-white text-2xl">{partidaAtiva ? '⏱️' : '🎮'}</span>
                      </div>
                      <div className="ml-3">
                        <h3 className="[font-family:'Silkscreen',Helvetica] font-bold" style={titleStyle}>
                          {partidaAtiva ? 'CONTINUAR' : 'NOVO JOGO'}
                        </h3>
                        <p className="[font-family:'Silkscreen',Helvetica] text-xs">
                          {partidaAtiva
                            ? `RETOMAR ${(partidaAtiva as any)?.status === 'pausado' ? 'JOGO PAUSADO' : 'PARTIDA'}`
                            : 'INICIAR NOVA AVENTURA'}
                        </p>
                        {partidaAtiva && (partidaAtiva as any)?.progresso !== undefined && (
                          <p className="[font-family:'Silkscreen',Helvetica] text-xs text-purple-600 mt-1">
                            {(partidaAtiva as any).progresso.toFixed(0)}% completo
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilPage;
