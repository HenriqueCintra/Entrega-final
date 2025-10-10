import api from './config';
import { Map as Desafio } from '../types';
import { TeamData, RankingApiResponse } from '../types/ranking';

interface PartidaResponse {
  id: number;
  saldo: number;
  combustivel_atual: number;
  quantidade_carga: number;
  condicao_veiculo: number;
  estresse_motorista: number;
  tempo_real: number;
  pontuacao: number;
  distancia_percorrida: number;
  status: "concluido" | "em_andamento" | "pausado" | "cancelada";
  tempo_jogo?: number;
  tempo_jogo_segundos?: number; // ✅ ADICIONADO
  resultado?: "vitoria" | "derrota";
  motivo_finalizacao?: string;
  eficiencia?: number;
  saldo_inicial?: number;
  quantidade_carga_inicial?: number;
  progresso?: number;
  
  // ✅ NOVOS CAMPOS: IDs das relações
  mapa: number;
  rota: number;
  veiculo: number;
  
  // ✅ NOVOS CAMPOS: Dados completos aninhados
  veiculo_detalhes?: {
    id: number;
    modelo: string;
    capacidade_carga: number;
    capacidade_combustivel: number;
    velocidade: number;
    preco: number;
    autonomia: number;
  };
  
  rota_detalhes?: {
    id: number;
    nome: string;
    descricao: string;
    distancia_km: number;
    tempo_estimado_horas: number;
    tipo_estrada: string;
    velocidade_media_kmh: number;
    danger_zones_data: any[];
    dirt_segments_data: any[];
    fuelStop: any[];
    pathCoordinates: any[];
  };
  
  mapa_detalhes?: {
    id: number;
    nome: string;
    descricao: string;
    objetivo: string;
    ferramentas: any[];
    dificuldade: string;
    tempo_limite: string;
    min_jogadores: number;
    max_jogadores: number;
    imagem: string;
    peso_carga_kg: number;
  };
  
  eventos_ocorridos?: Array<{
    id: number;
    evento: {
      id: number;
      nome: string;
      descricao: string;
      tipo: 'positivo' | 'negativo';
      categoria: string;
      opcoes: Array<{
        id: number;
        descricao: string;
        efeitos: any;
      }>;
    };
    momento: string;
    ordem: number;
    opcao_escolhida: null | any;
  }>;
}

interface RespondResponse {
  efeitos_aplicados: never[];
  detail: string;
  partida: PartidaResponse;
}

interface VehicleResponse {
  id: number;
  modelo: string;
  capacidade_carga: number;
  capacidade_combustivel: number;
  velocidade: number;
  preco: number;
  autonomia: number;
}

interface RouteResponse {
  id: number;
  nome: string;
  descricao: string;
  distancia_km: number;
  tempo_estimado_horas: number;
  tipo_estrada: string;
  velocidade_media_kmh: number;
  danger_zones_data: any[];
  dirt_segments_data: any[];
}

interface MapResponse {
  id: number;
  nome: string;
  descricao: string;
  objetivo: string;
  ferramentas: any[];
  dificuldade: string;
  tempo_limite: string;
  min_jogadores: number;
  max_jogadores: number;
  imagem: string;
  rotas: RouteResponse[];
}

// ✅ INTERFACE ATUALIZADA PARA O TICK COM INTENÇÃO DE ABASTECIMENTO
interface TickData {
  distancia_percorrida: number;
  quer_abastecer?: boolean; // ✅ NOVO CAMPO: Intenção do jogador
}

// ✅ INTERFACE PARA RESULTADO DO TICK COM EVENTOS ESPECIAIS DE ABASTECIMENTO
interface TickResult extends PartidaResponse {
  evento_pendente?: {
    id: number;
    evento: {
      id: number;
      nome: string;
      descricao: string;
      tipo: 'positivo' | 'negativo' | 'neutro';
      categoria: string;
      opcoes: Array<{
        id: number;
        descricao: string;
        efeitos: any;
      }>;
    };
    momento: string;
    ordem: number;
    opcao_escolhida: null;
    posto_info?: any; // ✅ NOVO CAMPO: Dados específicos do posto para eventos de abastecimento
  };
}

export interface OpcaoQuiz {
  id: number;
  texto: string;
}

export interface PerguntaQuiz {
  id: number;
  texto: string;
  dificuldade: string;
  opcoes: OpcaoQuiz[];
}

export interface ResponderQuizPayload {
  pergunta_id: number;
  opcao_id: number;
}

export interface RespostaQuizResult {
  correta: boolean;
  detail: string;
  saldo_atual?: number;
  correta_id?: number;
}

export const GameService = {

  async sortearQuiz(): Promise<PerguntaQuiz> {
    console.log('🧠 Buscando nova pergunta do quiz...');
    try {
      const response = await api.get<PerguntaQuiz>('/jogo1/quizzes/sortear/');
      console.log('✅ Pergunta recebida:', response.data.texto);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao sortear quiz:', error);
      throw error;
    }
  },

  async responderQuiz(payload: ResponderQuizPayload): Promise<RespostaQuizResult> {
    console.log('🙋‍♂️ Enviando resposta do quiz:', payload);
    try {
      const response = await api.post<RespostaQuizResult>('/jogo1/quizzes/responder/', payload);
      console.log('✅ Resposta do quiz processada:', response.data.detail);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao responder quiz:', error);
      throw error;
    }
  },

  async getMaps(): Promise<Desafio[]> {
    console.log('🗺️ Buscando mapas da API...');
    try {
      const response = await api.get('/jogo1/mapas/');
      console.log('✅ Mapas recebidos:', response.data.length, 'mapas');
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar mapas:', error);
      throw error;
    }
  },

  async getMapById(id: number): Promise<MapResponse> {
    console.log(`🗺️ Buscando desafio específico com ID: ${id}...`);
    try {
      const response = await api.get<MapResponse>(`/jogo1/mapas/${id}/`);
      console.log('✅ Desafio recebido:', response.data.nome);
      return response.data;
    } catch (error) {
      console.error(`❌ Erro ao buscar desafio ${id}:`, error);
      throw error;
    }
  },

  async getRanking(): Promise<RankingApiResponse> {
    console.log('🏆 Buscando ranking de eficiência da API...');
    try {
      const response = await api.get('/jogo1/ranking/');
      console.log('✅ Ranking recebido:', response.data.length, 'equipes');
      if (Array.isArray(response.data)) {
        response.data.forEach((equipe: TeamData) => {
          console.log(`🏅 ${equipe.nome}: ${equipe.eficiencia_media.toFixed(1)}% eficiência, ${equipe.stats.vitorias} vitórias`);
        });
      }
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar ranking:', error);
      throw error;
    }
  },

  async getTeamById(teamId: number): Promise<TeamData | null> {
    console.log('🔍 Buscando equipe por ID:', teamId);
    try {
      const ranking = await this.getRanking();
      const team = ranking.find(t => t.id === teamId) || null;
      if (team) {
        console.log('✅ Equipe encontrada:', team.nome);
      } else {
        console.log('❌ Equipe não encontrada para ID:', teamId);
      }
      return team;
    } catch (error) {
      console.error('❌ Erro ao buscar equipe por ID:', error);
      throw error;
    }
  },

  async getTeamPosition(teamName: string): Promise<number | null> {
    console.log('🔍 Buscando posição da equipe:', teamName);
    try {
      const ranking = await this.getRanking();
      const index = ranking.findIndex(t => t.nome === teamName);
      const position = index !== -1 ? index + 1 : null;

      if (position) {
        console.log('✅ Posição encontrada:', position);
      } else {
        console.log('❌ Equipe não encontrada no ranking:', teamName);
      }

      return position;
    } catch (error) {
      console.error('❌ Erro ao buscar posição da equipe:', error);
      throw error;
    }
  },

  async getVehicles(): Promise<VehicleResponse[]> {
    console.log('🚛 Buscando veículos da API...');
    try {
      const response = await api.get('/jogo1/veiculos/');
      console.log('✅ Veículos recebidos:', response.data.length, 'veículos');
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar veículos:', error);
      throw error;
    }
  },

  async respondToEvent(optionId: number, distancia_percorrida: number): Promise<RespondResponse> {
    console.log(`✋ Respondendo evento com opção ${optionId} na distância ${distancia_percorrida.toFixed(2)}km`);
    try {
      const response = await api.post<RespondResponse>('/jogo1/eventos/responder/', {
        opcao_id: optionId,
        distancia_percorrida: distancia_percorrida
      });
      console.log('✅ Resposta do evento processada:', response.data.detail);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao responder evento:', error);
      throw error;
    }
  },

  async getActiveGame(): Promise<PartidaResponse> {
    console.log('🎮 Buscando partida ativa...');
    try {
      const response = await api.get<PartidaResponse>('/jogo1/partidas/ativa/');
      console.log('✅ Partida ativa encontrada:', response.data.id);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar partida ativa:', error);
      throw error;
    }
  },

  async getPartida(id: number): Promise<PartidaResponse> {
    console.log(`🎮 Buscando partida com ID: ${id}...`);
    try {
      const response = await api.get<PartidaResponse>(`/jogo1/partidas/${id}/`);
      console.log('✅ Partida encontrada:', response.data.id);
      return response.data;
    } catch (error) {
      console.error(`❌ Erro ao buscar partida ${id}:`, error);
      throw error;
    }
  },

  async createGame(gameData: {
    mapa: number;
    rota: number;
    veiculo: number;
    saldo_inicial?: number;
    combustivel_inicial?: number
  }): Promise<PartidaResponse> {
    console.log('🚀 Criando nova partida com dados:', gameData);
    if (!gameData.mapa || !gameData.rota || !gameData.veiculo) {
      const error = new Error('Dados inválidos para criar partida');
      console.error('❌ Dados incompletos:', gameData);
      throw error;
    }
    if (typeof gameData.mapa !== 'number' || typeof gameData.rota !== 'number' || typeof gameData.veiculo !== 'number') {
      const error = new Error('IDs devem ser números válidos');
      console.error('❌ Tipos inválidos:', { mapa: typeof gameData.mapa, rota: typeof gameData.rota, veiculo: typeof gameData.veiculo });
      throw error;
    }
    try {
      const response = await api.post<PartidaResponse>('/jogo1/partidas/nova/', gameData);
      console.log('✅ Partida criada com sucesso! ID:', response.data.id);
      console.log('💰 Saldo inicial:', response.data.saldo);
      console.log('⛽ Combustível inicial:', response.data.combustivel_atual);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao criar partida:', error);
      if (error.response) {
        console.error('📋 Status do erro:', error.response.status);
        console.error('📋 Dados do erro:', error.response.data);
        if (error.response.status === 400) {
          throw new Error(`IDs inválidos: ${JSON.stringify(error.response.data)}`);
        }
      }
      throw error;
    }
  },

  // ✅✅✅ FUNÇÃO DE TICK ATUALIZADA COM SUPORTE A ABASTECIMENTO ✅✅✅
  async partidaTick(data: TickData): Promise<TickResult> {
    const logQueuer = data.quer_abastecer ? ' (🔍 PROCURANDO POSTO)' : '';
    console.log(`⏱️ Enviando tick: ${data.distancia_percorrida.toFixed(2)}km${logQueuer}`);

    try {
      const response = await api.post<PartidaResponse>('/jogo1/partidas/tick/', data);
      console.log('✅ Tick processado - Tempo oficial:', response.data.tempo_jogo?.toFixed(2), 'min');

      // ✅ VERIFICA SE O BACKEND RETORNOU UM EVENTO_PENDENTE
      if (response.data.eventos_ocorridos) {
        const eventoPendente = response.data.eventos_ocorridos.find(evento => evento.opcao_escolhida === null);

        if (eventoPendente) {
          const categoria = eventoPendente.evento.categoria;
          const isAbastecimento = categoria === 'abastecimento';

          console.log(`🎲 Evento pendente detectado: "${eventoPendente.evento.nome}" (${categoria})`);

          if (isAbastecimento) {
            console.log('⛽ Evento de ABASTECIMENTO detectado - Frontend deve mostrar modal de posto');
          } else {
            console.log('🎭 Evento NORMAL detectado - Frontend deve mostrar modal de evento');
          }

          return {
            ...response.data,
            evento_pendente: eventoPendente
          };
        }
      }

      // ✅ VERIFICA SE HÁ EVENTO_PENDENTE DIRETO NA RESPOSTA (PARA EVENTOS DE ABASTECIMENTO)
      if ((response as any).data.evento_pendente) {
        const eventoPendente = (response as any).data.evento_pendente;
        console.log(`⛽ Evento de abastecimento retornado diretamente: "${eventoPendente.evento.nome}"`);

        return {
          ...response.data,
          evento_pendente: eventoPendente
        };
      }

      // Sem eventos pendentes
      console.log('✅ Tick processado sem eventos pendentes');
      return response.data;

    } catch (error) {
      console.error('❌ Erro no tick:', error);
      throw error;
    }
  },

  // ✅✅✅ NOVA FUNÇÃO DE ABASTECIMENTO ✅✅✅
  async processarAbastecimento(data: { litros: number; custo: number }): Promise<PartidaResponse> {
    console.log('⛽ Processando abastecimento:', data);
    try {
      const response = await api.post<PartidaResponse>('/jogo1/partidas/abastecer/', data);
      console.log('✅ Abastecimento processado pelo backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao processar abastecimento:', error);
      throw error;
    }
  },

  async pauseGame(): Promise<{ detail: string }> {
    console.log('⏸️ Pausando jogo...');
    try {
      const response = await api.post<{ detail: string }>('/jogo1/partidas/pausar/');
      console.log('✅ Jogo pausado:', response.data.detail);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao pausar jogo:', error);
      throw error;
    }
  },

  async resumeGame(): Promise<{ detail: string }> {
    console.log('▶️ Retomando jogo...');
    try {
      const response = await api.post<{ detail: string }>('/jogo1/partidas/continuar/');
      console.log('✅ Jogo retomado:', response.data.detail);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao retomar jogo:', error);
      throw error;
    }
  },

  async syncGameProgress(progressData: { tempo_decorrido_segundos: number }): Promise<PartidaResponse> {
    console.log('🔄 Sincronizando progresso do jogo...', progressData);
    try {
      const response = await api.post<PartidaResponse>('/jogo1/partidas/sincronizar/', progressData);
      console.log('✅ Progresso sincronizado');
      if (response.data.status === 'concluido') {
        console.log('🏁 Partida finalizada!');
        console.log('🏆 Resultado:', response.data.resultado);
        if (response.data.eficiencia !== undefined) {
          console.log('📊 Eficiência calculada:', response.data.eficiencia + '%');
        }
        console.log('💯 Pontuação final:', response.data.pontuacao);
      }
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao sincronizar progresso:', error);
      throw error;
    }
  },

  async saveGameState(gameState: any) {
    return await api.post('/game/save-state/', gameState);
  },

  async loadGameState(matchId: string) {
    return await api.get(`/game/load-state/${matchId}/`);
  }
};