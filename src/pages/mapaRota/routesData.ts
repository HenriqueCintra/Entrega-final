// src/pages/mapaRota/routesData.ts

// Importações dos caminhos das rotas
import { route1Path } from './paths/route1Path';
import { route2Path } from './paths/route2Path';
import { route3Path } from './paths/route3Path';
import { route4Path } from './paths/route4Path';

// ==================== INTERFACES ====================

// Interface para segmentos de estrada de terra
export interface DirtSegment {
  startKm: number;        // Km inicial do trecho de terra (relativo ao início da rota)
  endKm: number;          // Km final do trecho de terra
  condition: 'leve' | 'moderada' | 'severa';  // Qualidade do trecho de terra
  eventChance: number;    // Probabilidade de um evento ocorrer (0.0 a 1.0)
  speedFactor: number;    // Fator de redução de velocidade (ex: 0.7 para 70% da velocidade normal)
  description?: string;   // Descrição opcional do trecho
}

// Interface principal para definição de rotas
export interface Route {
  routeId: number;
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
  tollBooths: {
    totalCost: number;
    location: string;
    costPerAxle: number;
    totalCostExample4Axles: number;
    coordinates: [number, number];
  }[];

  // Limites de velocidade por estrada
   speedLimits: { 
    road: string; 
    limit: string, 
     value?: number, 
     coordinates?: [number,number] 
    }[];



  // Informações de segurança
  safety: {
    robberyRisk: 'Baixo' | 'Médio' | 'Alto';
    roadHazards: string;
  };

  // Condições da estrada
  dirtRoad: boolean;
  dirtRoadDetails?: string;
  roadConditions: 'Boa' | 'Regular' | 'Ruim';
  constructionZones?: string;

  // Pontos de interesse e paradas
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

  // Custos e coordenadas
  fuelCostPerKm: number;
  dangerZonesDetails?: string;
  pathCoordinates?: [number, number][];
  actualDistance?: number;
  actualDuration?: number;

  // Zonas de perigo
  dangerZones?: {
    location: string;
    description: string;
    coordinates: [number, number];
    riskLevel: 'Baixo' | 'Médio' | 'Alto';
  }[];

  dirtSegments?: DirtSegment[];
}

// ==================== FUNÇÕES UTILITÁRIAS ====================

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

// ==================== DEFINIÇÃO DAS ROTAS ====================

export const routes: Route[] = [
  // ROTA 1: Padrão/Eficiente
  {
    routeId: 1,
    name: "Rota Padrão: Juazeiro-Salvador via BR-407 e BR-324 (Eficiente)",
    distance: 513,
    estimatedTime: "7h30min",
    estimatedTimeHours: parseEstimatedTime("7h30min"),

    cities: [
      "Juazeiro", "Jaguarari", "Senhor do Bonfim", "Ponto Novo",
      "Capim Grosso", "Riachão do Jacuípe", "Feira de Santana",
      "Amélia Rodrigues", "Simões Filho", "Salvador"
    ],

    roads: ["BR-407", "BR-324"],
    startCoordinates: [-9.449771, -40.524226],
    endCoordinates: [-12.954121, -38.471283],
    waypoints: [[-12.2667, -38.9667]],

    tollBooths: [
      {
        location: "BR-324 - Pedágio 02 - Via Bahia (Amélia Rodrigues)",
        costPerAxle: 3.50,
        totalCostExample4Axles: 14.00,
        coordinates: [-12.447111365070798, -38.71353301661456],
        totalCost: 0
      },
      {
        location: "BR-324 - BASE DE APOIO - VIA BAHIA",
        costPerAxle: 3.50,
        totalCostExample4Axles: 14.00,
        coordinates: [-12.51369524173777, -38.62460652443481],
        totalCost: 0
      },
      {
        location: "BR-324 - Pedágio 01 - Via Bahia (Simões Filho)",
        costPerAxle: 3.50,
        totalCostExample4Axles: 14.00,
        coordinates: [-12.751127634778944, -38.43194853442343],
        totalCost: 0
      },
      {
        location: "BR-324 - BASE DE APOIO - VIA BAHIA",
        costPerAxle: 3.50,
        totalCostExample4Axles: 14.00,
        coordinates: [-12.825310059845428, -38.40966558167229],
        totalCost: 0
      },
      {
        location: "Pedágio da Rodovia CIA",
        costPerAxle: 3.50,
        totalCostExample4Axles: 14.00,
        coordinates: [-12.847055107561344, -38.36165344035957],
        totalCost: 0
      }
    ],

   speedLimits: [
      { 
        road: "BR-407", 
        limit: "80 km/h",
        value: 80,
        coordinates:[-9.990413, -40.239591],
      },
      { 
        road: "BR-407", 
        limit: "80 km/h",
        value: 80,
        coordinates:[-11.817558, -39.375948],
      },
      { 
        road: "BR-407", 
        limit: "60 km/h",
        value: 60,
        coordinates: [-10.517028, -40.142195]
      },
      { 
        road: "BR-324", 
        limit: "100 km/h",
        value: 100,
        coordinates: [-12.743087, -38.437596]
      },
      { 
        road: "BR-324", 
        limit: "50 km/h",
        value: 50,
        coordinates: [-12.447111365070798, -38.71353301661456]
      }
    ],

    safety: {
      robberyRisk: "Médio",
      roadHazards: "Tráfego intenso na BR-324 (Feira-Salvador). Risco de animais na BR-407. Pequeno trecho não pavimentado."
    },

    dirtRoad: true,
    dirtRoadDetails: "Pequeno trecho não pavimentado na BR-407 próximo a áreas rurais.",
    roadConditions: "Boa",
    constructionZones: "Manutenção pontual na BR-324.",

    restStops: [{
         location: "Limite de velocidade de 50km/h",
         description: "radares pela rodovia de 50km/h",
      coordinates: [-12.447111365070798, -38.71353301661456],
      type: "gas"
    }],

    fuelCostPerKm: 4.50,
    dangerZonesDetails: "BR-324 (Feira-Salvador): alto fluxo. BR-407: animais, fadiga.",

    dangerZones: [
      {
        location: "Estradas secundárias em Nova Fátima",
        description: "Vias isoladas e pouco policiadas",
        coordinates: [-11.6049, -39.6301],
        riskLevel: "Médio"
      },
      {
        location: "BR-324 próximo a Feira de Santana",
        description: "Alto fluxo de veículos e histórico de roubos de carga",
        coordinates: [-12.2267, -38.9648],
        riskLevel: "Alto"
      },
      {
        location: "BR-407 trecho Jaguarari",
        description: "Área isolada com histórico de assaltos",
        coordinates: [-10.2550, -40.1924],
        riskLevel: "Médio"
      }
    ],

    dirtSegments: [{
      startKm: 180,
      endKm: 195,
      condition: 'leve',
      eventChance: 0.05,
      speedFactor: 0.85,
      description: "Trecho da BR-407 com pavimento deteriorado/em transição para terra."
    }],

    pathCoordinates: route1Path,
    actualDistance: 505.7681,
    actualDuration: 24512.5
  },

  // ROTA 2: Alternativa (Evitando Rodovias Expressas)
  {
    routeId: 2,
    name: "Rota Alternativa: Juazeiro-Salvador (Evitando Rodovias Expressas)",
    distance: 529,
    estimatedTime: "7h50min",
    estimatedTimeHours: parseEstimatedTime("7h50min"),

    cities: [
      "Juazeiro", "Jaguarari", "Senhor do Bonfim", "Filadélfia",
      "Ponto Novo", "Capim Grosso", "Nova Fátima", "Riachão do Jacuípe",
      "Tanquinho", "Feira de Santana", "Amélia Rodrigues", "Simões Filho", "Salvador"
    ],

    roads: ["BR-407 (ou paralelas)", "BR-324 (ou paralelas/vias locais)"],
    startCoordinates: [-9.449771, -40.524226],
    endCoordinates: [-12.954121, -38.471283],

    tollBooths: [
      {
        location: "BR-324 - Pedágio 01 - Via Bahia (Simões Filho)",
        costPerAxle: 3.50,
        totalCostExample4Axles: 14.00,
        coordinates: [-12.751127634778944, -38.43194853442343],
        totalCost: 0
      },
      {
        location: "BR-324 - BASE DE APOIO - VIA BAHIA",
        costPerAxle: 3.50,
        totalCostExample4Axles: 14.00,
        coordinates: [-12.825310059845428, -38.40966558167229],
        totalCost: 0
      }
    ],

    speedLimits: [
      { 
        road: "BR-235", 
        limit: "80 km/h",
        value: 80,
        coordinates: [-9.460458, -40.429308]
      },
      { 
        road: "BR-235", 
        limit: "40 km/h",
        value: 40,
        coordinates:  [-12.193182, -38.418788]
      },
      { 
        road: "BR-110", 
        limit: "60 km/h",
        value: 60,
        coordinates: [-11.225797, -38.485761]
      },
      { 
        road: "BR-324", 
        limit: "100 km/h",
        value: 100,
        coordinates: [-12.5778, -38.5405]
      }
    ],

    safety: {
      robberyRisk: "Médio",
      roadHazards: "Qualidade variável em trechos alternativos, travessias urbanas frequentes."
    },

    dirtRoad: true,
    dirtRoadDetails: "Vários trechos não pavimentados ou com asfalto ruim ao passar por Filadélfia e em desvios de cidades maiores.",
    roadConditions: "Regular",
    constructionZones: "Menos provável, mas vias alternativas podem ter má conservação.",

    restStops: [
      {
        location: "BR-324 - Praça Amélia Rodrigues",
        description: "Boa disponibilidade ao longo das BRs, especialmente Feira de Santana.",
        coordinates: [-38.763810, -12.398770],
        type: "rest"
      },
      {
        location: "BR-324 - Praça Amélia Rodrigues",
        description: "Boa disponibilidade ao longo das BRs, especialmente Feira de Santana.",
        coordinates: [-38.763810, -12.398770],
        type: "rest"
      }
    ],

    fuelCostPerKm: 4.65,
    dangerZonesDetails: "Vias alternativas com menor manutenção, sinalização precária.",

    dangerZones: [
      {
        location: "BR-235 após Uauá",
        description: "Área deserta e com pouco policiamento",
        coordinates: [-9.8367, -39.4890],
        riskLevel: "Médio"
      },
      {
        location: "Estradas secundárias em Canché",
        description: "Vias isoladas e pouco policiadas",
        coordinates: [-9.906043261891755, -38.78612677041902],
        riskLevel: "Médio"
      },
      {
        location: "Trecho entre xuqyê e Bjo. Grande",
        description: "Áreas de vegetação densa facilitam emboscadas",
        coordinates: [-10.024041044108136, -38.51265879186026],
        riskLevel: "Alto"
      }
    ],

    dirtSegments: [
      {
        startKm: 150,
        endKm: 170,
        condition: 'moderada',
        eventChance: 0.15,
        speedFactor: 0.70,
        description: "Estrada vicinal não pavimentada na região de Filadélfia."
      },
      {
        startKm: 350,
        endKm: 365,
        condition: 'leve',
        eventChance: 0.10,
        speedFactor: 0.80,
        description: "Trecho alternativo com pavimento irregular para evitar centro urbano."
      }
    ],

    pathCoordinates: route2Path,
    actualDistance: 658.2524000000001,
    actualDuration: 32789.1
  },

  // ROTA 3: Econômica (Evitando Pedágios)
  {
    routeId: 3,
    name: "Rota Econômica: Juazeiro-Salvador (Evitando Pedágios)",
    distance: 533,
    estimatedTime: "8h20min",
    estimatedTimeHours: parseEstimatedTime("8h20min"),

    cities: [
      "Juazeiro", "Jaguarari", "Senhor do Bonfim", "Capim Grosso",
      "Riachão do Jacuípe", "Feira de Santana", "Santanópolis",
      "Conceição da Feira", "Candeias", "Simões Filho", "Salvador"
    ],

    roads: ["BR-407", "BR-324 (trechos)", "BA-504", "BA-506", "Estradas Municipais"],
    startCoordinates: [-9.449771, -40.524226],
    endCoordinates: [-12.954121, -38.471283],

    tollBooths: [{
      location: "BR-324 - BASE DE APOIO - VIA BAHIA",
      costPerAxle: 3.50,
      totalCostExample4Axles: 14.00,
      coordinates: [-12.825310059845428, -38.40966558167229],
      totalCost: 0
    }],

   speedLimits: [
      { 
        road: "BR-407", 
        limit: "80 km/h",
        value: 80,
        coordinates:[-9.990413, -40.239591],
      },
      { 
        road: "BR-407", 
        limit: "80 km/h",
        value: 80,
        coordinates:[-11.817558, -39.375948],
      },
      { 
        road: "BR-407", 
        limit: "60 km/h",
        value: 60,
        coordinates: [-10.517028, -40.142195]
      },
      { 
        road: "BR-324", 
        limit: "100 km/h",
        value: 100,
        coordinates: [-12.743087, -38.437596]
      },
      { 
        road: "BR-324", 
        limit: "40 km/h",
        value: 40,
        coordinates: [-12.630725, -38.622729]
      }
    ],

    safety: {
      robberyRisk: "Médio",
      roadHazards: "Desvios por estradas locais com baixa manutenção, má sinalização."
    },

    dirtRoad: true,
    dirtRoadDetails: "Extensos trechos de estradas de terra ou mal conservadas nos desvios para evitar pedágios, especialmente entre Santanópolis e Candeias.",
    roadConditions: "Ruim",
    constructionZones: "Improvável em desvios, mas vias podem estar danificadas.",

    restStops: [
      {
        location: "BR-324 - Praça Amélia Rodrigues",
        description: "Boa disponibilidade ao longo das BRs, especialmente Feira de Santana.",
        coordinates: [-38.763810, -12.398770],
        type: "rest"
      },
      {
        location: "BR-324 - Praça Amélia Rodrigues",
        description: "Boa disponibilidade ao longo das BRs, especialmente Feira de Santana.",
        coordinates: [-38.763810, -12.398770],
        type: "rest"
      }
    ],

    fuelCostPerKm: 4.80,
    dangerZonesDetails: "Desvios por vias não pavimentadas/mal conservadas, isoladas.",

    dangerZones: [
      {
        location: "Estradas secundárias em Nova Fátima",
        description: "Vias isoladas e pouco policiadas",
        coordinates: [-11.6049, -39.6301],
        riskLevel: "Médio"
      },
      {
        location: "BR-324 próximo a Feira de Santana",
        description: "Alto fluxo de veículos e histórico de roubos de carga",
        coordinates: [-12.2267, -38.9648],
        riskLevel: "Alto"
      },
      {
        location: "BR-407 trecho Jaguarari",
        description: "Área isolada com histórico de assaltos",
        coordinates: [-10.2550, -40.1924],
        riskLevel: "Médio"
      },
      {
        location: "Desvio em Santanópolis",
        description: "Estrada secundária com pouca iluminação e fluxo",
        coordinates: [-12.5025, -39.0013],
        riskLevel: "Alto"
      },
      {
        location: "Entrada para Candeias",
        description: "Ponto conhecido de abordagens a caminhões",
        coordinates: [-12.6737, -38.5514],
        riskLevel: "Alto"
      }
    ],

    dirtSegments: [
      {
        startKm: 250,
        endKm: 280,
        condition: 'severa',
        eventChance: 0.25,
        speedFactor: 0.50,
        description: "Estrada municipal de terra em péssimas condições como parte do desvio de pedágio."
      },
      {
        startKm: 400,
        endKm: 420,
        condition: 'moderada',
        eventChance: 0.20,
        speedFactor: 0.65,
        description: "Trecho de BA não pavimentada ou com muitos buracos."
      }
    ],

    pathCoordinates: route3Path,
    actualDistance: 547.4595,
    actualDuration: 28439.700000000004
  },

  // ROTA 4: Via Uauá
  {
    routeId: 4,
    name: "Rota via Uauá: Juazeiro-Salvador (BR-235, BR-116, BR-324)",
    distance: 558,
    estimatedTime: "8h28min",
    estimatedTimeHours: parseEstimatedTime("8h28min"),

    cities: [
      "Juazeiro", "Uauá", "Euclides da Cunha", "Teofilândia",
      "Serrinha", "Feira de Santana", "Simões Filho", "Salvador"
    ],

    roads: ["BR-235", "BR-116", "BR-324"],
    startCoordinates: [-9.449771, -40.524226],
    endCoordinates: [-12.954121, -38.471283],
    waypoints: [[-9.8364, -39.4831]],

    tollBooths: [
      {
        location: "BR-324 - Pedágio 02 - Via Bahia (Amélia Rodrigues)",
        costPerAxle: 3.50,
        totalCostExample4Axles: 14.00,
        coordinates: [-12.447111365070798, -38.71353301661456],
        totalCost: 0
      },
      {
        location: "BR-324 - BASE DE APOIO - VIA BAHIA",
        costPerAxle: 3.50,
        totalCostExample4Axles: 14.00,
        coordinates: [-12.51369524173777, -38.62460652443481],
        totalCost: 0
      },
      {
        location: "BR-324 - Pedágio 01 - Via Bahia (Simões Filho)",
        costPerAxle: 3.50,
        totalCostExample4Axles: 14.00,
        coordinates: [-12.751127634778944, -38.43194853442343],
        totalCost: 0
      },
      {
        location: "BR-324 - BASE DE APOIO - VIA BAHIA",
        costPerAxle: 3.50,
        totalCostExample4Axles: 14.00,
        coordinates: [-12.825310059845428, -38.40966558167229],
        totalCost: 0
      },
      {
        location: "Pedágio da Rodovia CIA",
        costPerAxle: 3.50,
        totalCostExample4Axles: 14.00,
        coordinates: [-12.847055107561344, -38.36165344035957],
        totalCost: 0
      }
    ],

   speedLimits: [
      { 
        road: "BR-324", 
        limit: "100 km/h",
        value: 100,
        coordinates: [-9.961578, -39.228228]
      },
      { 
        road: "BR-324", 
        limit: "100 km/h",
        value: 100,
        coordinates: [-10.961665, -38.791498]
      },
      { 
        road: "BR-324", 
        limit: "80 km/h",
        value: 80,
        coordinates: [-12.5778, -38.5405]
      },
      { 
        road: "BR-324", 
        limit: "50 km/h",
        value: 50,
        coordinates: [-12.7905, -38.4055]
      }
    ],

    safety: {
      robberyRisk: "Médio",
      roadHazards: "BR-235: trechos com pavimento irregular/obras. BR-116: tráfego intenso."
    },

    dirtRoad: true,
    dirtRoadDetails: "Trechos significativos da BR-235 antes de Euclides da Cunha com pavimento ruim ou em obras, podendo incluir desvios por terra.",
    roadConditions: "Regular",
    constructionZones: "Obras na BR-235. Manutenção pontual BR-116/324.",

    restStops: [
      {
        location: "BR-324 - Praça Amélia Rodrigues",
        description: "Boa disponibilidade ao longo das BRs, especialmente Feira de Santana.",
        coordinates: [-38.763810, -12.398770],
        type: "rest"
      },
      {
        location: "BR-324 - Praça Amélia Rodrigues",
        description: "Boa disponibilidade ao longo das BRs, especialmente Feira de Santana.",
        coordinates: [-38.763810, -12.398770],
        type: "rest"
      }
    ],

    fuelCostPerKm: 4.85,
    dangerZonesDetails: "Isolamento e má conservação em trechos da BR-235. BR-116: pontos de acidente/roubo.",

    dangerZones: [
      {
        location: "BR-235 após Uauá",
        description: "Área deserta e com pouco policiamento",
        coordinates: [-9.8367, -39.4890],
        riskLevel: "Médio"
      },
      {
        location: "BR-116 próximo a Serrinha",
        description: "Região com histórico de roubos de carga",
        coordinates: [-11.6664, -39.0009],
        riskLevel: "Alto"
      },
      {
        location: "BR-324 próximo a Feira de Santana",
        description: "Alto fluxo de veículos e histórico de roubos de carga",
        coordinates: [-12.2267, -38.9648],
        riskLevel: "Alto"
      }
    ],

    dirtSegments: [
      {
        startKm: 80,
        endKm: 120,
        condition: 'moderada',
        eventChance: 0.20,
        speedFactor: 0.70,
        description: "Longo trecho da BR-235 com obras e pavimento irregular, com possíveis desvios por terra."
      },
      {
        startKm: 180,
        endKm: 190,
        condition: 'leve',
        eventChance: 0.10,
        speedFactor: 0.80,
        description: "Pequeno trecho da BR-235 com manutenção pendente."
      }
    ],

    pathCoordinates: route4Path,
    actualDistance: 552.2648,
    actualDuration: 25854.400000000005
  }
];

// ==================== COORDENADAS DE REFERÊNCIA ====================
// Coordenadas comentadas para referência das rotas (comentários originais mantidos)

/* ROTA 1 - Coordenadas principais:
[-40.524226, -9.449771],     // Juazeiro, BA
[-40.19235517511953, -10.255016465477025], // Jaguarari, BA
[-40.1827195646563, -10.452630276902312],  // Senhor do Bonfim, BA
[-40.11148486357506, -10.86341165864542],  // Ponto Novo, BA
[-40.01159638752269, -11.379139470679446], // Capim Grosso, BA
[-39.38642607361227, -11.811744075350651], // Riachão do Jacuípe, BA
[-38.9648952037257, -12.226149840077687],  // Feira de Santana, BA
[-38.76160923261481,-12.399765572679026],  // Amélia Rodrigues, BA
[-38.40554149637575, -12.790457469442282], // Simões Filho, BA
[-38.471283, -12.954121]     // Salvador, BA
*/

/* ROTA 2 - Coordenadas principais:
[-40.524226, -9.449771],     // Juazeiro, BA
[-39.48895352884815, -9.8367178609971],    // Uauá
[-39.030031433610205, -9.893492609800445], // Canudos
[-38.31968694052241, -10.091972274402044], // Jeremoabo
[-38.531984239515374, -10.834185129812898], // Ribeira do Pombal
[-38.32864850143622, -11.362384601650396], // Olindina
[-38.54051707214044, -12.577808594195744], // Rotatória
[-38.471283, -12.954121]     // Salvador, BA
*/

/* ROTA 3 - Coordenadas principais:
[-40.524226, -9.449771],     // Juazeiro, BA
[-40.19235517511953, -10.255016465477025], // Jaguarari, BA
[-40.1827195646563, -10.452630276902312],  // Senhor do Bonfim, BA
[-40.12199139370722, -10.734602645529307], // Filadélfia, BA
[-40.11148486357506, -10.86341165864542],  // Ponto Novo, BA
[-40.01159638752269, -11.379139470679446], // Capim Grosso, BA
[-39.63012308333791, -11.604910604561683], // Nova Fátima, BA
[-39.386016513740714, -11.812002334906955], // Riachão do Jacuípe, BA
[-39.105426135815016, -11.977888372700807], // Tanquinho, BA
[-38.96489118234495, -12.226633662941902], // Feira de Santana, BA
[-39.00125451098019, -12.502498182414648], // Conceição da Feira, BA
[-38.93928270420547,-12.559478928789718],  // Belém da Cachoeira
[-38.551409899588734, -12.673743454857682], // Candeias, BA
[-38.40554149637575, -12.790457469442282], // Simões Filho, BA
[-38.471283, -12.954121]     // Salvador, BA
*/

/* ROTA 4 - Coordenadas principais:
[-40.524226, -9.449771],     // Juazeiro, BA
[-39.48895352884815, -9.8367178609971],    // Uauá
[-39.01174091970563, -10.501687409845562], // Euclides da Cunha, BA
[-38.99623833743285, -11.482162269661481], // Teofilândia, BA
[-39.000897603993025, -11.666422677129212], // Serrinha, BA
[-38.96489118234495, -12.226633662941902], // Feira de Santana, BA
[-38.40554149637575, -12.790457469442282], // Simões Filho, BA
[-38.471283, -12.954121]     // Salvador, BA
*/