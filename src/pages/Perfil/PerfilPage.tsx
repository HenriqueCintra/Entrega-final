import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { TeamService } from "../../api/teamService";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
} from "../../components/ui/card";
import { AudioControl } from "../../components/AudioControl";
import { PlayIcon, Trophy, TruckIcon, MapPin, DollarSign, X } from 'lucide-react';

interface UserStats {
  deliveries: number;
  distance: number;
  earnings: number;
  victories: number;
}

export const PerfilPage = () => {
  const navigate = useNavigate();
  // Removido o useRef para o input de arquivo
  const { user, logout, refreshUser } = useAuth();

  // Buscar dados da equipe se o usuário estiver em uma
  const { data: teamData } = useQuery({
    queryKey: ['teamDetails', user?.equipe],
    queryFn: () => TeamService.getTeamDetails(user!.equipe!),
    enabled: !!user?.equipe, // Só busca se o usuário estiver em uma equipe
  });

  // Stats ainda estáticos (podem ser implementados depois)
  const [userStats] = useState<UserStats>({
    deliveries: 12,
    distance: 12,
    earnings: 12,
    victories: 12
  });

  // Lista de avatares predefinidos
  const presetAvatars = [
    "/assets/avatars/perfil_caminhao.png",
    "/assets/avatars/perfil_volante.png",
    "/assets/avatars/perfil1.png",
    "/assets/avatars/perfil2.png",
    "/assets/avatars/perfil3.png",
    "/assets/avatars/perfil4.png",
    "/assets/avatars/perfil5.png",
  ];

  // Estado para controlar a visibilidade do seletor de avatares
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  // Estado para o avatar local, inicializado com o primeiro da lista de presets
  const [localAvatar, setLocalAvatar] = useState<string>(presetAvatars[0]);

  // Função para lidar com a seleção de um avatar predefinido
  const handleSelectAvatar = (avatarUrl: string) => {
    setLocalAvatar(avatarUrl);
    setShowAvatarPicker(false); // Fecha o seletor após a escolha
  };

  const handlePlayNow = () => {
    navigate("/desafio");
  };

  const handleContinueGame = () => {
    const savedProgress = localStorage.getItem('savedGameProgress');

    if (savedProgress) {
      try {
        const gameProgress = JSON.parse(savedProgress);
        console.log('Carregando progresso salvo:', gameProgress);

        navigate('/game', {
          state: {
            selectedVehicle: gameProgress.vehicle,
            availableMoney: gameProgress.money,
            selectedRoute: gameProgress.selectedRoute,
            savedProgress: {
              currentFuel: gameProgress.currentFuel,
              progress: gameProgress.progress,
              currentPathIndex: gameProgress.currentPathIndex,
              pathProgress: gameProgress.pathProgress,
              gameTime: gameProgress.gameTime,
              activeGameId: gameProgress.activeGameId
            }
          }
        });
      } catch (error) {
        console.error('Erro ao carregar progresso:', error);
        alert('Erro ao carregar o jogo salvo. Iniciando novo jogo...');
        navigate("/select-vehicle");
      }
    } else {
      const startNewGame = window.confirm('Não há jogo salvo. Deseja iniciar um novo jogo?');
      if (startNewGame) {
        navigate("/desafio");
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

        {/* Modal de seleção de avatar - Adicionado para substituir o upload */}
        {showAvatarPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <Card className="p-6 w-11/12 md:w-1/2 lg:w-1/3 border-2 border-black">
              <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-2">
                <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-xl" style={titleStyle}>
                  ESCOLHA SEU AVATAR
                </h3>
                <Button variant="ghost" onClick={() => setShowAvatarPicker(false)} className="text-white hover:text-gray-300 p-1">
                  <X size={24} />
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                {presetAvatars.map((avatar, index) => (
                  <img
                    key={index}
                    src={avatar}
                    alt={`Avatar ${index + 1}`}
                    // CORREÇÃO: Adicionada a classe object-cover aqui
                    className={`w-16 h-16 rounded-full cursor-pointer transition-transform duration-200 transform hover:scale-110 border-2 object-cover ${localAvatar === avatar ? 'border-orange-500 shadow-lg' : 'border-black'}`}
                    onClick={() => handleSelectAvatar(avatar)}
                  />
                ))}
              </div>
            </Card>
          </div>
        )}

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

                    {/* Seção do avatar - Agora clica para abrir o seletor */}
                    <div className="mt-3 flex justify-center">
                      <div className="relative">
                        <div
                          className="w-24 h-24 rounded-full bg-teal-100 border-4 border-teal-500 flex items-center justify-center overflow-hidden relative group cursor-pointer"
                          onClick={() => setShowAvatarPicker(true)}
                        >
                          <img
                            src={localAvatar}
                            alt="Avatar"
                            className="w-20 h-20 object-cover rounded-full"
                          />
                        </div>
                      </div>
                    </div>

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
                        <span className="text-2xl">🔑</span>
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
                      <div className="font-bold">{userStats.distance}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ganhos */}
                <Card className="border-2 border-solid border-black rounded-lg overflow-hidden">
                  <CardContent className="py-3 px-4 flex flex-col items-center">
                    <DollarSign size={24} color="#eab308" />
                    <div className="[font-family:'Silkscreen',Helvetica] text-center mt-1">
                      <span className="text-xs">GANHOS</span>
                      <div className="font-bold">{userStats.earnings}</div>
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
                        <span className="text-white text-2xl">{localStorage.getItem('savedGameProgress') ? '⏱️' : '🎮'}</span>
                      </div>
                      <div className="ml-3">
                        <h3 className="[font-family:'Silkscreen',Helvetica] font-bold" style={titleStyle}>
                          {localStorage.getItem('savedGameProgress') ? 'CONTINUAR' : 'NOVO JOGO'}
                        </h3>
                        <p className="[font-family:'Silkscreen',Helvetica] text-xs">
                          {localStorage.getItem('savedGameProgress')
                            ? 'RETOMAR A ÚLTIMA PARTIDA'
                            : 'INICIAR NOVA AVENTURA'}
                        </p>
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
