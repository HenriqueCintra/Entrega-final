// src/api/gameService.ts
import api from './config';
import { Map } from '../types';

export const GameService = {
  async getMaps(): Promise<Map[]> {
    const response = await api.get('/jogo1/mapas/');
    return response.data;
  }
};