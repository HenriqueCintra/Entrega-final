// src/api/teamService.ts
import api from './config';
import { Team, TeamCreationData, TeamDetails } from '../types';

export const TeamService = {
  // Busca a lista de todas as equipes
  async getTeams(): Promise<Team[]> {
    const response = await api.get('/equipes/');
    return response.data;
  },

  // Cria uma nova equipe
  async createTeam(data: TeamCreationData): Promise<TeamDetails> {
    const response = await api.post<TeamDetails>('/equipes/', data);
    return response.data;
  },

  // Busca detalhes de uma equipe específica
  async getTeamDetails(teamId: number): Promise<TeamDetails> {
    const response = await api.get<TeamDetails>(`/equipes/${teamId}/`);
    return response.data;
  },

  // Atualiza dados da equipe
  async updateTeam(teamId: number, data: { nome: string }): Promise<TeamDetails> {
    const response = await api.patch<TeamDetails>(`/equipes/${teamId}/`, data);
    return response.data;
  },

  // Regenera código de convite
  async regenerateCode(teamId: number): Promise<{ detail: string; novo_codigo: string }> {
    const response = await api.post<{ detail: string; novo_codigo: string }>(`/equipes/${teamId}/regenerate-code/`);
    return response.data;
  },

  // Exclui a equipe
  async deleteTeam(teamId: number): Promise<void> {
    await api.delete(`/equipes/${teamId}/`);
  },

  // Faz o usuário atual entrar em uma equipe via código
  async joinTeam(code: string): Promise<{ detail: string }> {
    const response = await api.post<{ detail: string }>('/equipes/entrar/', { codigo: code });
    return response.data;
  },

  // Faz o usuário atual sair da equipe
  async leaveTeam(): Promise<{ detail: string }> {
    const response = await api.post<{ detail: string }>('/equipes/sair/');
    return response.data;
  }
};