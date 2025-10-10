// Serviço para buscar dados dos desafios do backend
import api from '../api/config';
import AuthService from '../api/authService';

// Interface para os dados do backend
export interface BackendMapa {
  id: number;
  nome: string;
  descricao: string;
  objetivo: string;
  ferramentas: Array<{
    tipo: string;
    descricao: string;
  }>;
  dificuldade: string;
  tempo_limite: string;
  min_jogadores: number;
  max_jogadores: number;
  imagem: string;
  rotas: BackendRota[];
}

export interface BackendRota {
  id: number;
  mapa: number;
  nome: string;
  descricao: string;
  distancia_km: number;
  tempo_estimado_horas: number;
  tipo_estrada: 'asfalto' | 'terra' | 'mista';
  risco_eventos_positivos: number;
  risco_eventos_negativos: number;
  velocidade_media_kmh: number;
  danger_zones_data: Array<{
    location: string;
    startKm: number;
    description: string;
    coordinates: [number, number];
    riskLevel: string;
  }>;
  dirt_segments_data: Array<{
    startKm: number;
    endKm: number;
    condition: string;
    eventChance: number;
    speedFactor: number;
    description: string;
  }>;
}

// Interface para o formato usado no frontend
export interface FrontendChallenge {
  id: string;
  backendId?: number; // ID real do backend
  name: string;
  description: string;
  destination: string;
  destinationCoordinates: [number, number];
  routes: FrontendRoute[];
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  estimatedDuration: string;
  objective?: string;
  tools?: Array<{
    type: string;
    description: string;
  }>;
}

export interface FrontendRoute {
  routeId: number;
  challengeId: string;
  name: string;
  distance: number;
  estimatedTime: string;
  estimatedTimeHours: number;
  cities: string[];
  roads: string[];
  startCoordinates: [number, number];
  endCoordinates: [number, number];
  pathCoordinates?: [number, number][];
  safety: {
    robberyRisk: string;
    roadHazards: string;
  };
  dirtRoad: boolean;
  dirtRoadDetails?: string;
  roadConditions: string;
  tollBooths?: Array<{
    location: string;
    costPerAxle: number;
    totalCostExample4Axles: number;
    coordinates: [number, number];
    totalCost: number;
  }>;
  speedLimits?: Array<{
    road: string;
    limit: string;
    value: number;
    coordinates: [number, number];
  }>;
  dangerZones?: Array<{
    location: string;
    startKm: number;
    description: string;
    coordinates: [number, number];
    riskLevel: string;
  }>;
  dirtSegments?: Array<{
    startKm: number;
    endKm: number;
    condition: string;
    eventChance: number;
    speedFactor: number;
    description: string;
  }>;
  fuelCostPerKm?: number;
  dangerZonesDetails?: string;
}

// Coordenadas de referência
const REFERENCE_COORDINATES = {
  JUAZEIRO: [-9.4111, -40.4969] as [number, number],
  SALVADOR: [-12.9714, -38.5014] as [number, number],
  RECIFE: [-8.0476, -34.8770] as [number, number],
  FORTALEZA: [-3.7319, -38.5267] as [number, number],
};

// Função para mapear dificuldade do backend para frontend
const mapDifficulty = (backendDifficulty: string): 'Fácil' | 'Médio' | 'Difícil' => {
  switch (backendDifficulty.toUpperCase()) {
    case 'FÁCIL':
    case 'FACIL':
      return 'Fácil';
    case 'MÉDIO':
    case 'MEDIO':
      return 'Médio';
    case 'DIFÍCIL':
    case 'DIFICIL':
      return 'Difícil';
    default:
      return 'Médio';
  }
};

// Função para determinar o destino baseado no nome do desafio
const getDestinationFromName = (nome: string): { destination: string; coordinates: [number, number] } => {
  const nomeUpper = nome.toUpperCase();
  
  if (nomeUpper.includes('SALVADOR')) {
    return { destination: 'Salvador, BA', coordinates: REFERENCE_COORDINATES.SALVADOR };
  } else if (nomeUpper.includes('RECIFE')) {
    return { destination: 'Recife, PE', coordinates: REFERENCE_COORDINATES.RECIFE };
  } else if (nomeUpper.includes('FORTALEZA')) {
    return { destination: 'Fortaleza, CE', coordinates: REFERENCE_COORDINATES.FORTALEZA };
  }
  
  // Default para Salvador se não conseguir identificar
  return { destination: 'Salvador, BA', coordinates: REFERENCE_COORDINATES.SALVADOR };
};

// Função para gerar ID do desafio baseado no destino
const getChallengeId = (nome: string): string => {
  const nomeUpper = nome.toUpperCase();
  
  if (nomeUpper.includes('SALVADOR')) {
    return 'salvador';
  } else if (nomeUpper.includes('RECIFE')) {
    return 'recife';
  } else if (nomeUpper.includes('FORTALEZA')) {
    return 'fortaleza';
  }
  
  return 'salvador'; // Default
};

// Função para converter dados do backend para o formato do frontend
const convertBackendToFrontend = (backendMapa: BackendMapa): FrontendChallenge => {
  const { destination, coordinates } = getDestinationFromName(backendMapa.nome);
  const challengeId = getChallengeId(backendMapa.nome);
  
  const routes: FrontendRoute[] = backendMapa.rotas.map((rota, index) => ({
    routeId: index + 1,
    challengeId,
    name: rota.nome,
    distance: rota.distancia_km,
    estimatedTime: `${Math.floor(rota.tempo_estimado_horas)}h${Math.round((rota.tempo_estimado_horas % 1) * 60).toString().padStart(2, '0')}min`,
    estimatedTimeHours: rota.tempo_estimado_horas,
    cities: [], // Será preenchido com dados estáticos se necessário
    roads: [], // Será preenchido com dados estáticos se necessário
    startCoordinates: REFERENCE_COORDINATES.JUAZEIRO,
    endCoordinates: coordinates,
    safety: {
      robberyRisk: rota.danger_zones_data.length > 2 ? 'Alto' : rota.danger_zones_data.length > 0 ? 'Médio' : 'Baixo',
      roadHazards: rota.tipo_estrada === 'terra' ? 'Estradas de terra, condições precárias' : 
                   rota.tipo_estrada === 'mista' ? 'Condições variáveis, alguns trechos ruins' : 
                   'Condições boas, tráfego normal'
    },
    dirtRoad: rota.tipo_estrada === 'terra' || rota.dirt_segments_data.length > 0,
    dirtRoadDetails: rota.dirt_segments_data.length > 0 ? 
      `${rota.dirt_segments_data.length} trecho(s) de terra identificado(s)` : undefined,
    roadConditions: rota.tipo_estrada === 'asfalto' ? 'Boa' : 
                   rota.tipo_estrada === 'mista' ? 'Regular' : 'Ruim',
    dangerZones: rota.danger_zones_data,
    dirtSegments: rota.dirt_segments_data,
    fuelCostPerKm: 4.50 + (rota.tipo_estrada === 'terra' ? 1.0 : rota.tipo_estrada === 'mista' ? 0.5 : 0),
    dangerZonesDetails: rota.danger_zones_data.length > 0 ? 
      `${rota.danger_zones_data.length} zona(s) de risco identificada(s)` : undefined
  }));

  return {
    id: `${challengeId}-${backendMapa.id}`, // ID único combinando destino e ID do backend
    backendId: backendMapa.id, // Adiciona o ID real do backend
    name: backendMapa.nome,
    description: backendMapa.descricao,
    destination,
    destinationCoordinates: coordinates,
    routes,
    difficulty: mapDifficulty(backendMapa.dificuldade),
    estimatedDuration: backendMapa.tempo_limite,
    objective: backendMapa.objetivo,
    tools: backendMapa.ferramentas?.map(ferramenta => ({
      type: ferramenta.tipo,
      description: ferramenta.descricao
    }))
  };
};

// Função para testar conectividade com o backend
export const testBackendConnection = async (): Promise<boolean> => {
  try {
    // Usa a instância api que já tem interceptors configurados
    const response = await api.get('/jogo1/veiculos/', { timeout: 5000 });
    console.log('✅ Conexão com backend OK');
    return response.status === 200;
  } catch (error) {
    console.error('❌ Erro ao testar conexão com backend:', error);
    return false;
  }
};

// Função principal para buscar desafios do backend
export const fetchChallengesFromBackend = async (): Promise<FrontendChallenge[]> => {
  try {
    // Verificar se o usuário está autenticado
    if (!AuthService.isAuthenticated()) {
      throw new Error('Usuário não autenticado. Faça login para acessar os desafios.');
    }
    
    // Usar a instância api que já tem interceptors configurados
    const response = await api.get('/jogo1/mapas/', { timeout: 10000 });

    if (!response.data) {
      return [];
    }

    if (!Array.isArray(response.data)) {
      return [];
    }

    if (response.data.length === 0) {
      return [];
    }

    const challenges: FrontendChallenge[] = response.data.map((mapa) => {
      return convertBackendToFrontend(mapa);
    });
    
    return challenges;

  } catch (error: any) {
    console.error('❌ Erro ao buscar desafios:', error);
    
    // Se for erro de autenticação, propagar a mensagem
    if (error.response?.status === 401) {
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    
    if (error.message?.includes('não autenticado')) {
      throw error;
    }
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    }
    
    throw new Error('Erro ao carregar desafios. Tente novamente.');
  }
};

// Função para buscar um desafio específico por ID
export const fetchChallengeById = async (challengeId: string): Promise<FrontendChallenge | null> => {
  try {
    const challenges = await fetchChallengesFromBackend();
    return challenges.find(challenge => challenge.id === challengeId) || null;
  } catch (error) {
    console.error('❌ Erro ao buscar desafio específico:', error);
    throw error;
  }
};
