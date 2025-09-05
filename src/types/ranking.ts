// src/types/ranking.ts - VERSÃO CORRIGIDA COM PartidaData

/**
 * Dados brutos de uma equipe como vêm da API de ranking.
 */
export interface TeamData {
  id: number;
  nome: string;
  eficiencia_media: number;
  partidas_contabilizadas: number;
  soma_eficiencia: number;
  stats: {
    partidas_total: number;
    partidas_concluidas: number;
    vitorias: number;
    derrotas: number;
    taxa_vitoria: number;
    eficiencia_media: number;
    partidas_contabilizadas: number;
    soma_eficiencia: number;
  };
}

/**
 * Dados formatados de uma equipe para uso na interface.
 */
export interface TeamRanking {
  position: number;
  name: string;
  points: number;
  victories: number;
  efficiency: number;
}

/**
 * Estatísticas resumidas da equipe do usuário logado.
 */
export interface UserStats {
  position: number;
  points: number;
  victories: number;
  efficiency: number;
}

/**
 * ✅ NOVA INTERFACE: Dados de uma partida finalizada
 */
export interface PartidaData {
  id: number;
  saldo: number;
  combustivel_atual: number;
  quantidade_carga: number;
  condicao_veiculo: number;
  estresse_motorista: number;
  tempo_real: number;
  pontuacao: number;
  distancia_percorrida: number;
  status: 'em_andamento' | 'pausado' | 'cancelada' | 'concluido';
  resultado?: 'vitoria' | 'derrota';
  motivo_finalizacao?: string;
  // Campos do sistema de eficiência
  eficiencia?: number;
  saldo_inicial?: number;
  quantidade_carga_inicial?: number;
  // Campos de tempo
  tempo_jogo?: number;
  ultima_atualizacao?: string;
  progresso?: number;
}

/**
 * Tabs disponíveis no ranking
 */
export type RankingTab = 'EFICIENCIA' | 'PONTOS' | 'VITORIAS';

/**
 * Resposta da API de ranking
 */
export type RankingApiResponse = TeamData[];