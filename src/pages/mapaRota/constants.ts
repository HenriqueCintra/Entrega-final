// Constantes e tipos compartilhados do sistema de rotas

// ==================== COORDENADAS DE REFERÊNCIA ====================

export const REFERENCE_COORDINATES = {
  JUAZEIRO: [-9.449771, -40.524226] as [number, number],
  SALVADOR: [-12.954121, -38.471283] as [number, number],
  RECIFE: [-8.058010135275913, -34.883122118554674] as [number, number],
  FORTALEZA: [-3.731862, -38.526669] as [number, number]
};

// Mapeamento de desafios para coordenadas de destino
export const CHALLENGE_DESTINATIONS = {
  salvador: REFERENCE_COORDINATES.SALVADOR,
  recife: REFERENCE_COORDINATES.RECIFE,
  fortaleza: REFERENCE_COORDINATES.FORTALEZA
} as const;

// ==================== TIPOS ====================

export type ChallengeId = 'salvador' | 'recife' | 'fortaleza';

// Interface para segmentos de estrada de terra
export interface DirtSegment {
  startKm: number;
  endKm: number;
  condition: 'leve' | 'moderada' | 'severa';
  eventChance: number;
  speedFactor: number;
  description?: string;
}

// Interface principal para rotas
export interface Route {
  routeId: number;
  challengeId: ChallengeId;
  name: string;
  distance: number;
  estimatedTime: string;
  estimatedTimeHours: number;
  cities: string[];
  roads: string[];
  startCoordinates: [number, number];
  endCoordinates: [number, number];
  waypoints?: [number, number][];
  
  // Informações de pedágios
  tollBooths?: {
    totalCost: number;
    location: string;
    costPerAxle: number;
    totalCostExample4Axles: number;
    coordinates: [number, number];
  }[];

  // Limites de velocidade
  speedLimits?: {
    road: string;
    limit: string;
    value?: number;
    coordinates?: [number, number];
  }[];

  // Informações de segurança
  safety?: {
    robberyRisk: 'Baixo' | 'Médio' | 'Alto';
    roadHazards: string;
  };

  // Condições da estrada
  dirtRoad?: boolean;
  dirtRoadDetails?: string;
  roadConditions?: 'Boa' | 'Regular' | 'Ruim';
  constructionZones?: string;

  // Pontos de interesse
  pois?: {
    type: 'construction' | 'danger' | 'rest' | 'gas';
    location: string;
    description: string;
    coordinates: [number, number];
  }[];

  restStops?: {
    location: string;
    description: string;
    coordinates: [number, number];
    type: 'rest' | 'construction' | 'gas' | 'toll' | 'danger';
  }[];

  // Postos de gasolina
  fuelStop?:{
    locationName: string;
    coordinates:[number, number]
  }[];

  // Custos e coordenadas do percurso
  fuelCostPerKm?: number;
  dangerZonesDetails?: string;
  pathCoordinates?: number[][];
  actualDistance?: number;
  actualDuration?: number;

  // Zonas de perigo
  dangerZones?: {
    location: string;
    startKm: number;
    description: string;
    coordinates: [number, number];
    riskLevel: 'Baixo' | 'Médio' | 'Alto';
  }[];

  dirtSegments?: DirtSegment[];
}

// ==================== UTILITÁRIOS ====================

// Função para converter string de tempo em horas decimais
export const parseEstimatedTime = (timeStr: string): number => {
  // Formato "7h30min" ou "7H30"
  const timeMatch = timeStr.match(/(\d+)[hH]?(\d+)?m?i?n?/);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    return hours + minutes / 60;
  }

  // Formato "7-8h" (range)
  const parts = timeStr.match(/(\d+)\s*-\s*(\d+)?h/i);
  if (parts) {
    const minHours = parseInt(parts[1], 10);
    const maxHours = parts[2] ? parseInt(parts[2], 10) : minHours;
    return (minHours + maxHours) / 2;
  }

  // Formato simples "7h"
  const singleHourMatch = timeStr.match(/(\d+)h/i);
  if (singleHourMatch) {
    return parseInt(singleHourMatch[1], 10);
  }

  return 0;
};