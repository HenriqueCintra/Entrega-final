// src/hooks/useRanking.ts

import { useQuery } from '@tanstack/react-query';
import { TeamData, RankingApiResponse } from '../types/ranking';
import api from '../api/config';
import { useAuth } from '../contexts/AuthContext'; // ✅ IMPORTAÇÃO ADICIONADA

export const useRanking = () => {
  // ✅ HOOK DO AUTH PARA VERIFICAR ESTADO DE CARREGAMENTO
  const { user, loading: authLoading } = useAuth();

  // Busca os dados brutos da API usando react-query
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<RankingApiResponse>({
    queryKey: ['ranking'],
    queryFn: async () => {
      const response = await api.get('/jogo1/ranking/');
      return response.data;
    },
    initialData: [],
    // ✅ Atualização automática e agressiva para manter o ranking fresco
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
    refetchOnReconnect: 'always',
    // ✅ Polling periódico (15s) mesmo em background para telas abertas
    refetchInterval: 15_000,
    refetchIntervalInBackground: true,
    // ✅ Dados ficam "stale" rapidamente para permitir refetch em foco
    staleTime: 10_000,
    retry: 2,
    // ✅ Só busca dados quando o auth terminou de carregar E o usuário existe
    enabled: !authLoading && !!user,
  });

  // Garantir que data é sempre um array de TeamData
  const teamData: TeamData[] = Array.isArray(data) ? data : [];

  // Função para encontrar a posição de uma equipe pelo nome
  const getUserPosition = (teamName: string): number | null => {
    const index = teamData.findIndex((team: TeamData) => team.nome === teamName);
    return index !== -1 ? index + 1 : null;
  };

  // Função para obter os dados completos de uma equipe pelo nome
  const getUserTeamData = (teamName: string): TeamData | null => {
    return teamData.find((team: TeamData) => team.nome === teamName) || null;
  };

  return {
    teamData,
    // ✅ O loading agora reflete o estado real: auth loading OU query loading
    loading: authLoading || isLoading,
    error: isError ? (error as Error).message : null,
    refetch,
    getUserPosition,
    getUserTeamData,
  };
};