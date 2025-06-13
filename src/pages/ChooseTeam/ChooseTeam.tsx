// src/pages/ChooseTeam/ChooseTeam.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TeamService } from '../../api/teamService';
import { Team } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import TeamCard from '../../components/TeamCard';
import CreateTeamButton from '../../components/CreateTeamButton';
import SelectTeamButton from '../../components/SelectTeamButton';
import { ButtonHomeBack } from '@/components/ButtonHomeBack';
import { ArrowLeft, House } from 'lucide-react';

export const ChooseTeam = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  // Busca as equipes da API
  const { data: teams, isLoading, isError } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: TeamService.getTeams,
  });

  // Mutação para entrar em uma equipe (caso precise dessa lógica aqui)
  const joinTeamMutation = useMutation({
    mutationFn: (code: string) => TeamService.joinTeam(code),
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      alert("Você entrou na equipe!");
      navigate("/game-selection");
    },
    onError: (err: any) => alert(`Erro: ${err.response?.data?.detail || "Código inválido"}`),
  });

  const handleTeamClick = (id: number) => {
    setSelectedTeamId(id);
  };

  const handleCreateTeam = () => {
    navigate("/perfil/criar-equipe");
  };

  const handleSelectTeam = () => {
    const team = teams?.find(t => t.id === selectedTeamId);
    if (team) {
      // A lógica de "entrar" na equipe deve ser feita aqui se o usuário ainda não tiver uma
      // Por simplicidade, vamos assumir que o backend associa o usuário ao selecionar
      // ou que isso será feito em outra tela. Apenas navegamos.
      // Para uma integração completa, poderíamos chamar joinTeamMutation.mutate(team.codigo);
      navigate("/game-selection");
    }
  };

  if (isLoading) return <div className="text-white text-center">Carregando equipes...</div>;
  if (isError) return <div className="text-red-500 text-center">Erro ao carregar equipes.</div>;

  return (
    <div className="h-screen bg-gradient-to-b from-indigo-900 to-purple-700 font-pixel relative overflow-hidden flex flex-col">
      <img className="w-[375px] h-[147px] absolute top-[120px] left-[157px] object-cover animate-float-right z-0" alt="Nuvem" src="/nuvemleft.png" />
      <img className="w-[436px] h-[170px] absolute bottom-[30px] right-[27px] object-cover animate-float-left opacity-75 scale-110 z-0" alt="Nuvem" src="/nuvemright.png" />

      {/* <<< MUDANÇA: Adicionamos 'relative' e 'z-10' a este contêiner para colocá-lo na frente das nuvens */}
      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex gap-5 absolute top-14 left-[33px]">
          <ButtonHomeBack onClick={() => navigate(-1)}><ArrowLeft /></ButtonHomeBack>
          <ButtonHomeBack onClick={() => navigate("/perfil")}><House /></ButtonHomeBack>
        </div>
        <div className="flex-1 overflow-auto container mx-auto px-4 py-4">
          <h1 className="text-2xl md:text-2xl text-yellow-300 font-bold text-center mt-2 mb-8 tracking-wide" style={{ textShadow: '2px 3px 2px black' }}>
            ESCOLHA SUA EQUIPE
          </h1>
          <div className="bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-lg p-2.5 mb-2">
            <CreateTeamButton onClick={handleCreateTeam} />
          </div>
          <div className="mb-6">
            <h2 className="text-2xl text-center text-yellow-300 font-bold mb-4 z-10" style={{ textShadow: '2px 3px 2px black' }}>EQUIPES</h2>
            <div className="space-y-4">
              {teams?.map(team => (
                <TeamCard
                  key={team.id}
                  // Corrigindo a adaptação para o componente esperar `name` enquanto a API envia `nome`
                  team={{ ...team, name: team.nome || 'Nome da Equipe' }}
                  onClick={() => handleTeamClick(team.id)}
                  selected={team.id === selectedTeamId}
                />
              ))}
            </div>
          </div>
          <div className="justify-center flex">
            <SelectTeamButton onClick={handleSelectTeam} />
          </div>
        </div>
      </div>
    </div>
  );
};