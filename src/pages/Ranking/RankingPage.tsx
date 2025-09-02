// src/pages/Ranking/RankingPage.tsx

import { useNavigate, useLocation } from "react-router-dom";
import { useState, useMemo } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  Package,
  Target,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRanking } from '../../hooks/useRanking';
import { TeamRanking, UserStats, RankingTab, TeamData } from "../../types/ranking";

export const RankingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Hook do ranking
  const { teamData, loading, error, refetch, getUserPosition, getUserTeamData } = useRanking();

  const [activeTab, setActiveTab] = useState<RankingTab>('EFICIENCIA');
  const cameFromProfile = location.state?.from === 'profile';

  // Converte dados da API para o formato que a UI precisa
  const teamRankings = useMemo((): TeamRanking[] => {
    return teamData.map((team: TeamData, index: number) => ({
      position: index + 1,
      name: team.nome,
      points: Math.round(team.eficiencia_media * 10),
      victories: team.stats.vitorias,
      efficiency: Math.round(team.eficiencia_media * 100) / 100,
    }));
  }, [teamData]);

  // Calcula as estatísticas da equipe do usuário logado
  const userStats = useMemo((): UserStats | null => {
    // Pegamos o ID da equipe do usuário logado
    const userTeamId = user?.equipe;
    if (!userTeamId) return null;

    // Encontramos o objeto completo da equipe nos dados do ranking
    const userTeamObject = teamData.find((team: TeamData) => team.id === userTeamId);
    if (!userTeamObject) return null;

    // Usamos o nome do objeto para buscar a posição
    const position = getUserPosition(userTeamObject.nome);
    if (!position) return null;

    return {
      position,
      points: Math.round(userTeamObject.eficiencia_media * 10),
      victories: userTeamObject.stats.vitorias,
      efficiency: Math.round(userTeamObject.eficiencia_media * 100) / 100,
    };
  }, [user, teamData, getUserPosition]);

  // Funções de navegação corrigidas
  const handleNavigateBack = () => {
    if (cameFromProfile) {
      navigate("/perfil");
    } else {
      navigate(-1);
    }
  };

  const handleOkClick = () => {
    if (cameFromProfile) {
      navigate("/perfil");
    } else {
      if (user?.equipe) {
        navigate("/game-selection");
      } else {
        navigate("/choose-team");
      }
    }
  };

  const getPositionIcon = (position: number): string => {
    if (position <= 3) {
      const icons = ['🏆', '🥈', '🥉'];
      return icons[position - 1];
    }
    return `${position}°`;
  };

  const getRowColor = (position: number): string => {
    if (position === 1) return "bg-yellow-100 border-yellow-300";
    if (position === 2) return "bg-gray-100 border-gray-300";
    if (position === 3) return "bg-orange-100 border-orange-300";
    return "bg-white border-gray-200";
  };

  const sortedData = useMemo(() => {
    const data = [...teamRankings];
    switch (activeTab) {
      case 'VITORIAS':
        return data.sort((a, b) => b.victories - a.victories);
      case 'PONTOS':
        return data.sort((a, b) => b.points - a.points);
      case 'EFICIENCIA':
      default:
        return data; // A API já envia ordenado por eficiência
    }
  }, [activeTab, teamRankings]);

  // ESTADOS DE CARREGAMENTO E ERRO
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center font-['Silkscreen'] bg-gradient-to-b from-blue-400 to-purple-500">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-white" size={32} />
          <p className="text-white text-xl">Carregando Ranking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center font-['Silkscreen'] bg-gradient-to-b from-blue-400 to-purple-500">
        <div className="text-center">
          <div className="bg-white p-6 rounded-lg border-2 border-black shadow-lg">
            <p className="text-red-600 text-lg mb-4">Erro ao carregar ranking</p>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <Button onClick={() => refetch()} className="bg-blue-500 text-white">
              <RefreshCw className="mr-2" size={16} />
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const silkscreenFont = "[font-family:'Silkscreen',Helvetica]";
  const buttonBaseStyle = `${silkscreenFont} border-2 border-black rounded-md px-4 py-2 text-xs font-bold flex items-center justify-center transition-all`;

  return (
    <div className="bg-white w-full h-screen overflow-hidden">
      <div className={`w-full h-full [background:linear-gradient(180deg,rgba(57,189,248,1)_0%,rgba(154,102,248,1)_100%)] relative overflow-hidden ${silkscreenFont}`}>
        {/* Botões de navegação */}
        <div className="absolute top-4 left-4 z-20">
          <Button
            onClick={handleNavigateBack}
            variant="outline"
            className="p-2 bg-white border-2 border-black rounded-md hover:bg-gray-200"
          >
            <ArrowLeft size={24} className="text-black" />
          </Button>
        </div>
        <div className="absolute top-4 right-4 z-20">
          <Button
            onClick={() => refetch()}
            disabled={loading}
            variant="outline"
            className="p-2 bg-white border-2 border-black rounded-md hover:bg-gray-200"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
          </Button>
        </div>

        <div className="h-full flex items-center justify-center px-4 relative z-10">
          <div className="max-w-4xl w-full">
            <Card className="border-2 border-solid border-black rounded-lg overflow-hidden bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardContent className="p-4">
                <div className="text-center mb-4">
                  <h1
                    className={`${silkscreenFont} text-xl font-bold text-[#E3922A]`}
                    style={{ textShadow: "2px 3px 0.6px #000" }}
                  >
                    RANKING DE EFICIÊNCIA
                  </h1>
                  <p className={`${silkscreenFont} text-xs text-gray-600 mt-1`}>
                    Baseado na média de desempenho logístico
                  </p>
                </div>

                {userStats ? (
                  // Se userStats existir, renderiza o card completo
                  <div className="mb-4">
                    <Card className="bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-400 border-2 border-black rounded-full flex items-center justify-center">
                              <Trophy size={20} className="text-black" />
                            </div>
                            <div>
                              <p className={`${silkscreenFont} text-xs text-gray-600 mb-1`}>SUA POSIÇÃO</p>
                              <p className={`${silkscreenFont} text-lg font-bold text-black`}>{userStats.position}°</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                              <p className={`${silkscreenFont} text-xs text-gray-600 mb-1`}>PONTOS</p>
                              <p className={`${silkscreenFont} text-sm font-bold`}>{userStats.points}</p>
                            </div>
                            <div>
                              <p className={`${silkscreenFont} text-xs text-gray-600 mb-1`}>VITÓRIAS</p>
                              <p className={`${silkscreenFont} text-sm font-bold`}>{userStats.victories}</p>
                            </div>
                            <div>
                              <p className={`${silkscreenFont} text-xs text-gray-600 mb-1`}>EFICIÊNCIA</p>
                              <p className={`${silkscreenFont} text-sm font-bold`}>{userStats.efficiency}%</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  // Se userStats for nulo, renderiza a mensagem de fallback
                  <div className="mb-4">
                    <Card className="bg-gray-50 border-2 border-gray-300 rounded-lg">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className={`${silkscreenFont} text-sm text-gray-700`}>
                            Sua equipe ainda não está no ranking.
                          </p>
                          <p className={`${silkscreenFont} text-xs text-gray-500 mt-1`}>
                            Complete uma partida para ver suas estatísticas aqui!
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Tabs */}
                <div className="flex justify-center mb-4">
                  <div className="flex border-2 border-black rounded-md overflow-hidden">
                    <Button
                      onClick={() => setActiveTab('EFICIENCIA')}
                      className={`${buttonBaseStyle} rounded-none ${activeTab === 'EFICIENCIA' ? 'bg-blue-500 text-white' : 'bg-white text-black'
                        }`}
                    >
                      <Target size={12} className="mr-1" />
                      EFICIÊNCIA
                    </Button>
                    <Button
                      onClick={() => setActiveTab('PONTOS')}
                      className={`${buttonBaseStyle} rounded-none border-x-2 border-black ${activeTab === 'PONTOS' ? 'bg-blue-500 text-white' : 'bg-white text-black'
                        }`}
                    >
                      <TrendingUp size={12} className="mr-1" />
                      PONTOS
                    </Button>
                    <Button
                      onClick={() => setActiveTab('VITORIAS')}
                      className={`${buttonBaseStyle} rounded-none ${activeTab === 'VITORIAS' ? 'bg-blue-500 text-white' : 'bg-white text-black'
                        }`}
                    >
                      <Package size={12} className="mr-1" />
                      VITÓRIAS
                    </Button>
                  </div>
                </div>

                {/* Info sobre o sistema de eficiência */}
                <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
                  <p className={`${silkscreenFont} text-xs text-blue-800 text-center`}>
                    📊 Eficiência = Carga Entregue (50%) + Tempo (30%) + Economia (20%)
                  </p>
                </div>

                {/* Tabela de ranking */}
                <div className="overflow-hidden border-2 border-black rounded-lg mb-4">
                  <div className="grid grid-cols-4 bg-gray-200 border-b-2 border-black">
                    <div className={`${silkscreenFont} p-2 text-center border-r-2 border-black text-xs font-bold`}>#</div>
                    <div className={`${silkscreenFont} p-2 text-center border-r-2 border-black text-xs font-bold`}>EQUIPE</div>
                    <div className={`${silkscreenFont} p-2 text-center border-r-2 border-black text-xs font-bold`}>
                      {activeTab}
                    </div>
                    <div className={`${silkscreenFont} p-2 text-center text-xs font-bold`}>
                      {activeTab === 'PONTOS' ? 'VITÓRIAS' : activeTab === 'VITORIAS' ? 'EFICIÊNCIA' : 'PONTOS'}
                    </div>
                  </div>

                  {sortedData.map((team) => (
                    <div
                      key={team.name}
                      className={`grid grid-cols-4 border-b last:border-b-0 ${getRowColor(team.position)} ${user?.equipe && teamData.find(t => t.id === user.equipe)?.nome === team.name
                        ? 'ring-2 ring-yellow-400 ring-inset'
                        : ''
                        }`}
                    >
                      <div className={`${silkscreenFont} p-2 text-center border-r flex items-center justify-center`}>
                        <span className="text-lg">{getPositionIcon(team.position)}</span>
                      </div>
                      <div className={`${silkscreenFont} p-2 border-r flex items-center`}>
                        {team.name}
                        {user?.equipe && teamData.find(t => t.id === user.equipe)?.nome === team.name && ' 👤'}
                      </div>
                      <div className={`${silkscreenFont} p-2 text-center border-r flex items-center justify-center`}>
                        {activeTab === 'PONTOS' ? team.points :
                          activeTab === 'VITORIAS' ? team.victories :
                            `${team.efficiency}%`}
                      </div>
                      <div className={`${silkscreenFont} p-2 text-center flex items-center justify-center`}>
                        {activeTab === 'PONTOS' ? team.victories :
                          activeTab === 'VITORIAS' ? `${team.efficiency}%` :
                            team.points}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={handleOkClick}
                    className={`${buttonBaseStyle} px-6 py-2 bg-[#E3922A] text-white hover:bg-[#D4821A] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]`}
                  >
                    OK
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};