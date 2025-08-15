// Desafio: Juazeiro → Salvador
// Dados das rotas para o desafio Salvador

import { salvadorRoute1Path } from './paths/route1Path';
import { salvadorRoute2Path } from './paths/route2Path';
import { salvadorRoute3Path } from './paths/route3Path';
import { salvadorRoute4Path } from './paths/route4Path';
import { Route, REFERENCE_COORDINATES, parseEstimatedTime } from '../../constants';

export const salvadorRoutes: Route[] = [
  // ROTA 1: Padrão/Eficiente
  {
    routeId: 1,
    challengeId: 'salvador',
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
    startCoordinates: REFERENCE_COORDINATES.JUAZEIRO,
    endCoordinates: REFERENCE_COORDINATES.SALVADOR,
    waypoints: [[-12.2667, -38.9667]],

    tollBooths: [
      {
        location: "BR-324 - Pedágio 02 - Via Bahia (Amélia Rodrigues)",
        costPerAxle: 3.50,
        totalCostExample4Axles: 14.00,
        coordinates: [-12.447111365070798, -38.71353301661456],
        totalCost: 14.00
      },
      {
        location: "BR-324 - BASE DE APOIO - VIA BAHIA",
        costPerAxle: 3.50,
        totalCostExample4Axles: 14.00,
        coordinates: [-12.51369524173777, -38.62460652443481],
        totalCost: 14.00
      },
      {
        location: "BR-324 - Pedágio 01 - Via Bahia (Simões Filho)",
        costPerAxle: 3.50,
        totalCostExample4Axles: 14.00,
        coordinates: [-12.751127634778944, -38.43194853442343],
        totalCost: 14.00
      },
      {
        location: "BR-324 - BASE DE APOIO - VIA BAHIA",
        costPerAxle: 3.50,
        totalCostExample4Axles: 14.00,
        coordinates: [-12.825310059845428, -38.40966558167229],
        totalCost: 14.00
      },
      {
        location: "Pedágio da Rodovia CIA",
        costPerAxle: 3.50,
        totalCostExample4Axles: 14.00,
        coordinates: [-12.847055107561344, -38.36165344035957],
        totalCost: 14.00
      }
    ],

    speedLimits: [
      {
        road: "BR-407",
        limit: "80 km/h",
        value: 80,
        coordinates: [-9.990413, -40.239591]
      },
      {
        road: "BR-407",
        limit: "80 km/h",
        value: 80,
        coordinates: [-11.817558, -39.375948]
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

    restStops: [
      {
        location: "Limite de velocidade de 50km/h",
        description: "radares pela rodovia de 50km/h",
        coordinates: [-12.447111365070798, -38.71353301661456],
        type: "gas"
      }
    ],

    fuelCostPerKm: 4.50,
    dangerZonesDetails: "BR-324 (Feira-Salvador): alto fluxo. BR-407: animais, fadiga.",

    dangerZones: [
      {
        location: "Estradas secundárias em Nova Fátima",
        startKm: 121,
        description: "Vias isoladas e pouco policiadas",
        coordinates: [-11.6049, -39.6301],
        riskLevel: "Médio"
      },
      {
        location: "BR-324 próximo a Feira de Santana",
        startKm: 454,
        description: "Alto fluxo de veículos e histórico de roubos de carga",
        coordinates: [-12.2267, -38.9648],
        riskLevel: "Alto"
      },
      {
        location: "BR-407 trecho Jaguarari",
        startKm: 121,
        description: "Área isolada com histórico de assaltos",
        coordinates: [-10.2550, -40.1924],
        riskLevel: "Médio"
      }
    ],

    dirtSegments: [
      {
        startKm: 180,
        endKm: 195,
        condition: 'leve',
        eventChance: 0.05,
        speedFactor: 0.85,
        description: "Trecho da BR-407 com pavimento deteriorado/em transição para terra."
      }
    ],

    pathCoordinates: salvadorRoute1Path,
    actualDistance: 505.7681,
    actualDuration: 24512.5
  },

  // ROTA 2: Alternativa (Evitando Rodovias Expressas)
  {
    routeId: 2,
    challengeId: 'salvador',
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
    startCoordinates: REFERENCE_COORDINATES.JUAZEIRO,
    endCoordinates: REFERENCE_COORDINATES.SALVADOR,

    tollBooths: [
      {
        location: "BR-324 - Pedágio 01 - Via Bahia (Simões Filho)",
        costPerAxle: 3.50,
        totalCostExample4Axles: 14.00,
        coordinates: [-12.751127634778944, -38.43194853442343],
        totalCost: 14.00
      },
      {
        location: "BR-324 - BASE DE APOIO - VIA BAHIA",
        costPerAxle: 3.50,
        totalCostExample4Axles: 14.00,
        coordinates: [-12.825310059845428, -38.40966558167229],
        totalCost: 14.00
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
        coordinates: [-12.193182, -38.418788]
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
        coordinates: [-12.398770, -38.763810],
        type: "rest"
      }
    ],

    fuelCostPerKm: 4.65,
    dangerZonesDetails: "Vias alternativas com menor manutenção, sinalização precária.",

    dangerZones: [
      {
        location: "BR-235 após Uauá",
        startKm: 90,
        description: "Área deserta e com pouco policiamento",
        coordinates: [-9.8367, -39.4890],
        riskLevel: "Médio"
      },
      {
        location: "Estradas secundárias em Canché",
        startKm: 200,
        description: "Vias isoladas e pouco policiadas",
        coordinates: [-9.906043261891755, -38.78612677041902],
        riskLevel: "Médio"
      },
      {
        location: "Trecho entre xuqyê e Bjo. Grande",
        startKm: 350,
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

    pathCoordinates: salvadorRoute2Path,
    actualDistance: 658.2524000000001,
    actualDuration: 32789.1
  },

  // ROTA 3: Econômica (Evitando Pedágios)
  {
    routeId: 3,
    challengeId: 'salvador',
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
    startCoordinates: REFERENCE_COORDINATES.JUAZEIRO,
    endCoordinates: REFERENCE_COORDINATES.SALVADOR,

    tollBooths: [
      {
        location: "BR-324 - BASE DE APOIO - VIA BAHIA",
        costPerAxle: 3.50,
        totalCostExample4Axles: 14.00,
        coordinates: [-12.825310059845428, -38.40966558167229],
        totalCost: 14.00
      }
    ],

    speedLimits: [
      {
        road: "BR-407",
        limit: "80 km/h",
        value: 80,
        coordinates: [-9.990413, -40.239591]
      },
      {
        road: "BR-407",
        limit: "80 km/h",
        value: 80,
        coordinates: [-11.817558, -39.375948]
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
      robberyRisk: "Alto",
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
        coordinates: [-12.398770, -38.763810],
        type: "rest"
      }
    ],

    fuelCostPerKm: 4.80,
    dangerZonesDetails: "Desvios por vias não pavimentadas/mal conservadas, isoladas.",

    dangerZones: [
      {
        location: "Estradas secundárias em Nova Fátima",
        startKm: 121,
        description: "Vias isoladas e pouco policiadas",
        coordinates: [-11.6049, -39.6301],
        riskLevel: "Médio"
      },
      {
        location: "BR-324 próximo a Feira de Santana",
        startKm: 454,
        description: "Alto fluxo de veículos e histórico de roubos de carga",
        coordinates: [-12.2267, -38.9648],
        riskLevel: "Alto"
      },
      {
        location: "BR-407 trecho Jaguarari",
        startKm: 121,
        description: "Área isolada com histórico de assaltos",
        coordinates: [-10.2550, -40.1924],
        riskLevel: "Médio"
      },
      {
        location: "Desvio em Santanópolis",
        startKm: 479,
        description: "Estrada secundária com pouca iluminação e fluxo",
        coordinates: [-12.5025, -39.0013],
        riskLevel: "Alto"
      },
      {
        location: "Entrada para Candeias",
        startKm: 502,
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

    pathCoordinates: salvadorRoute3Path,
    actualDistance: 547.4595,
    actualDuration: 28439.700000000004
  },

  // ROTA 4: Via Uauá
  {
    routeId: 4,
    challengeId: 'salvador',
    name: "Rota via Uauá: Juazeiro-Salvador (BR-235, BR-116, BR-324)",
    distance: 558,
    estimatedTime: "8h28min",
    estimatedTimeHours: parseEstimatedTime("8h28min"),
    cities: [
      "Juazeiro", "Uauá", "Euclides da Cunha", "Teofilândia",
      "Serrinha", "Feira de Santana", "Simões Filho", "Salvador"
    ],
    roads: ["BR-235", "BR-116", "BR-324"],
    startCoordinates: REFERENCE_COORDINATES.JUAZEIRO,
    endCoordinates: REFERENCE_COORDINATES.SALVADOR,
    waypoints: [[-9.8364, -39.4831]],

    tollBooths: [
      {
        location: "BR-324 - Pedágio 02 - Via Bahia (Amélia Rodrigues)",
        costPerAxle: 3.50,
        totalCostExample4Axles: 14.00,
        coordinates: [-12.447111365070798, -38.71353301661456],
        totalCost: 14.00
      },
      {
        location: "BR-324 - BASE DE APOIO - VIA BAHIA",
        costPerAxle: 3.50,
        totalCostExample4Axles: 14.00,
        coordinates: [-12.51369524173777, -38.62460652443481],
        totalCost: 14.00
      },
      {
        location: "BR-324 - Pedágio 01 - Via Bahia (Simões Filho)",
        costPerAxle: 3.50,
        totalCostExample4Axles: 14.00,
        coordinates: [-12.751127634778944, -38.43194853442343],
        totalCost: 14.00
      },
      {
        location: "BR-324 - BASE DE APOIO - VIA BAHIA",
        costPerAxle: 3.50,
        totalCostExample4Axles: 14.00,
        coordinates: [-12.825310059845428, -38.40966558167229],
        totalCost: 14.00
      },
      {
        location: "Pedágio da Rodovia CIA",
        costPerAxle: 3.50,
        totalCostExample4Axles: 14.00,
        coordinates: [-12.847055107561344, -38.36165344035957],
        totalCost: 14.00
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
        coordinates: [-12.398770, -38.763810],
        type: "rest"
      }
    ],

    fuelCostPerKm: 4.85,
    dangerZonesDetails: "Isolamento e má conservação em trechos da BR-235. BR-116: pontos de acidente/roubo.",

    dangerZones: [
      {
        location: "BR-235 após Uauá",
        startKm: 90,
        description: "Área deserta e com pouco policiamento",
        coordinates: [-9.8367, -39.4890],
        riskLevel: "Médio"
      },
      {
        location: "BR-116 próximo a Serrinha",
        startKm: 341,
        description: "Região com histórico de roubos de carga",
        coordinates: [-11.6664, -39.0009],
        riskLevel: "Alto"
      },
      {
        location: "BR-324 próximo a Feira de Santana",
        startKm: 453,
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

    pathCoordinates: salvadorRoute4Path,
    actualDistance: 552.2648,
    actualDuration: 25854.400000000005
  }
];