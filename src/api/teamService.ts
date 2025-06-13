// src/api/teamService.ts
import api from './config';
import { Team, TeamCreationData } from '../types';

export const TeamService = {
  // Busca a lista de todas as equipes
  async getTeams(): Promise<Team[]> {
    const response = await api.get('/equipes/');
    return response.data;
  },

  // Cria uma nova equipe
  async createTeam(data: TeamCreationData): Promise<Team> {
    const response = await api.post('/equipes/', data);
    return response.data;
  },

  // Faz o usuário atual entrar em uma equipe via código
  async joinTeam(code: string): Promise<{ detail: string }> {
    const response = await api.post('/equipes/entrar/', { codigo: code });
    return response.data;
  }
};