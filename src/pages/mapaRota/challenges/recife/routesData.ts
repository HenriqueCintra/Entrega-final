// Desafio: Juazeiro → Recife
// Dados das rotas para o desafio Recife

import { recifeRoute1Path } from './paths/route1Path';
import { recifeRoute2Path } from './paths/route2Path';
import { recifeRoute3Path } from './paths/route3Path';
import { Route, REFERENCE_COORDINATES } from '../../constants';

export const recifeRoutes: Route[] = [
  {
    routeId: 1,
    challengeId: 'recife',
    name: "Rota Padrão: Juazeiro-Recife via BR-407 e BR-232",
    distance: 650,
    estimatedTime: "9h00min",
    estimatedTimeHours: 9.0,
    cities: [
      "Juazeiro", "Petrolina", "Salgueiro", "Serra Talhada",
      "Arcoverde", "Caruaru", "Recife"
    ],
    roads: ["BR-407", "BR-232"],
    startCoordinates: REFERENCE_COORDINATES.JUAZEIRO,
    endCoordinates: REFERENCE_COORDINATES.RECIFE,
    pathCoordinates: recifeRoute1Path,
    safety: {
      robberyRisk: 'Médio',
      roadHazards: 'Tráfego moderado, alguns trechos com animais na pista'
    },
    dirtRoad: false,
    roadConditions: 'Boa',
    tollBooths: [
      {
        location: "BR-232 - Pedágio Caruaru",
        costPerAxle: 4.10,
        totalCostExample4Axles: 16.40,
        coordinates: [-8.2836, -35.9758], // Coordenada do trajeto próxima a Caruaru
        totalCost: 16.40
      }
    ],
    speedLimits: [
      {
        road: "BR-407",
        limit: "80 km/h",
        value: 80,
        coordinates: [-8.939850787450604, -40.14336317640412] // Coordenada do trajeto na BR-407
      },
      {
        road: "BR-407",
        limit: "60 km/h",
        value: 60,
        coordinates: [-8.786861122364149, -39.85974409160066] // Coordenada do trajeto próxima a Salgueiro
      },
      {
        road: "BR-232",
        limit: "100 km/h",
        value: 100,
        coordinates: [-8.372357437844236, -36.64430169393451] // Coordenada do trajeto na BR-232
      },
      {
        road: "BR-232",
        limit: "60 km/h",
        value: 60,
        coordinates: [-8.11369016197662, -35.213640052121924] // Coordenada do trajeto próxima a Recife
      }
    ],

    fuelStop: [
      {
        locationName: "Posto de Combustível BR-428 Lagoa Grande",
        coordinates: [-8.990769147116964, -40.267255831665864]
      },
      {
        locationName: "Posto de Combustível BR-428 - Cabrobó",
        coordinates: [-8.510823117424199, -39.30245492934792]
      },{
        locationName: "Posto de Combustível BR-232 - Arcoverde",
        coordinates: [-8.423505107867827, -37.05310323521806]
      },{
        locationName: "Posto de Combustível BR-322 - Caruaru",
        coordinates: [-8.30305034168899, -35.9764853919906]
      }
    ],
    
    fuelCostPerKm: 4.80
  },
  {
    routeId: 2,
    challengeId: 'recife',
    name: "Rota Alternativa: Juazeiro-Recife via Caminhos Secundários",
    distance: 680,
    estimatedTime: "9h30min",
    estimatedTimeHours: 9.5,
    cities: [
      "Juazeiro", "Casa Nova", "Remanso", "Pilão Arcado",
      "Sento Sé", "Campo Formoso", "Jacobina", "Capim Grosso",
      "Feira de Santana", "Caruaru", "Recife"
    ],
    roads: ["BA-210", "BA-052", "BR-324", "BR-232"],
    startCoordinates: REFERENCE_COORDINATES.JUAZEIRO,
    endCoordinates: REFERENCE_COORDINATES.RECIFE,
    pathCoordinates: recifeRoute2Path,
    safety: {
      robberyRisk: 'Alto',
      roadHazards: 'Estradas secundárias, menor policiamento, trechos isolados'
    },
    dirtRoad: true,
    dirtRoadDetails: "Alguns trechos não pavimentados entre cidades menores",
    roadConditions: 'Regular',
    tollBooths: [
      {
        location: "BR-324 - Pedágio Feira de Santana",
        costPerAxle: 3.50,
        totalCostExample4Axles: 14.00,
        coordinates: [-8.371177, -36.709669], // Coordenada real do path da rota 2
        totalCost: 14.00
      }
    ],
    dirtSegments: [
      {
        startKm: 120,
        endKm: 140,
        condition: 'moderada',
        eventChance: 0.15,
        speedFactor: 0.70,
        description: "Trecho de estrada vicinal entre Campo Formoso e Jacobina"
      }
    ],
    speedLimits: [
      {
        road: "BA-210",
        limit: "60 km/h",
        value: 60,
        coordinates: [-8.814991684780777, -40.1878314168901] // Coordenada do trajeto na BA-210
      },
      {
        road: "BR-324",
        limit: "100 km/h",
        value: 100,
        coordinates: [-8.323695442558508, -36.10502135433297] // Coordenada do trajeto na BR-324
      },
      {
        road: "BR-232",
        limit: "80 km/h",
        value: 80,
        coordinates: [-8.013715638574816, -38.95097302183023] // Coordenada do trajeto na BR-232
      }
    ],
    dangerZones: [
      {
        location: "Trecho isolado próximo a Salgueiro",
        startKm: 180,
        description: "Área com pouco policiamento e risco de assaltos",
        coordinates: [-8.049067993631283, -39.07860922424029], // Coordenada do trajeto próxima a Salgueiro
        riskLevel: 'Médio'
      },
      {
        location: "Região de Serra Talhada",
        startKm: 280,
        description: "Área conhecida por roubos de carga",
        coordinates: [-8.000248458902554, -38.36852373352307], // Coordenada do trajeto próxima a Serra Talhada
        riskLevel: 'Médio'
      }
    ],

    fuelStop: [
      {
        locationName: "Posto de Combustível BR-316 Parnamirim",
        coordinates: [-8.093787736755141, -39.571817974204855]
      },
      {
        locationName: "Posto de Combustível BR-232 Serra Talhada",
        coordinates: [-7.983431157981043, -38.28121554426697]
      },{
        locationName: "Posto de Combustível BR-232 - Arcoverde",
        coordinates: [-8.423505107867827, -37.05310323521806]
      },{
        locationName: "Posto de Combustível BR-322 - Caruaru",
        coordinates: [-8.30305034168899, -35.9764853919906]
      }
    ],

    fuelCostPerKm: 5.10
  },
  {
    routeId: 3,
    challengeId: 'recife',
    name: "Rota Econômica: Juazeiro-Recife (Evitando Pedágios)",
    distance: 863, // Baseado no actualDistance fornecido
    estimatedTime: "12h22min", // Baseado no actualDuration (44525.1 segundos ≈ 12h22min)
    estimatedTimeHours: 12.37, // 44525.1 / 3600
    cities: [
      "Juazeiro", "Curaçá", "Uauá", "Canudos", "Euclides da Cunha",
      "Monte Santo", "Tucano", "Ribeira do Pombal", "Alagoinhas",
      "Feira de Santana", "Santo Antônio de Jesus", "Cruz das Almas",
      "Cachoeira", "São Félix", "Muritiba", "Governador Mangabeira",
      "Sapeaçu", "São Felipe", "Cabaceiras do Paraguaçu", "Maragogipe",
      "Nazaré", "Jaguaripe", "Aratuípe", "Laje", "São Miguel das Matas",
      "Castro Alves", "Conceição do Almeida", "Santo Antônio de Jesus",
      "Varzedo", "Elísio Medrado", "Milagres", "Amargosa", "Brejões",
      "São Miguel das Matas", "Recife"
    ],
    roads: ["BA-210", "BA-233", "BA-052", "BA-026", "BR-101", "BR-232"],
    startCoordinates: REFERENCE_COORDINATES.JUAZEIRO,
    endCoordinates: REFERENCE_COORDINATES.RECIFE,
    pathCoordinates: recifeRoute3Path,
    actualDistance: 863.3978,
    actualDuration: 44525.1,
    safety: {
      robberyRisk: 'Alto',
      roadHazards: 'Rota muito longa com muitas estradas secundárias, áreas isoladas e menor policiamento'
    },
    dirtRoad: true,
    dirtRoadDetails: "Vários trechos não pavimentados e estradas vicinais para evitar pedágios",
    roadConditions: 'Ruim',
    tollBooths: [], // Rota econômica sem pedágios
    speedLimits: [
      {
        road: "BA-210",
        limit: "100 km/h",
        value: 100,
        coordinates: [-9.294453094374571, -40.18335121107101] // Coordenada do trajeto na BA-210 próxima a Uauá
      },
      {
        road: "BA-233",
        limit: "100 km/h",
        value: 100,
        coordinates: [-8.960314501480394, -39.85574483728204] // Coordenada do trajeto na BA-233 próxima a Monte Santo
      },
      {
        road: "BR-101",
        limit: "100 km/h",
        value: 100,
        coordinates: [-9.39823428423036, -38.173247303864635] // Coordenada do trajeto na BR-101 próxima a Feira de Santana
      }
    ],
    dirtSegments: [
      {
        startKm: 80,
        endKm: 120,
        condition: 'severa',
        eventChance: 0.25,
        speedFactor: 0.50,
        description: "Estradas vicinais não pavimentadas entre Curaçá e Uauá"
      },
      {
        startKm: 200,
        endKm: 240,
        condition: 'moderada',
        eventChance: 0.20,
        speedFactor: 0.65,
        description: "Trechos de terra entre Monte Santo e Tucano"
      },
      {
        startKm: 450,
        endKm: 480,
        condition: 'leve',
        eventChance: 0.15,
        speedFactor: 0.75,
        description: "Estradas secundárias com pavimento irregular"
      },
      {
        startKm: 650,
        endKm: 690,
        condition: 'moderada',
        eventChance: 0.18,
        speedFactor: 0.70,
        description: "Desvios por estradas municipais para evitar pedágios"
      }
    ],
    dangerZones: [
      {
        location: "Estradas isoladas entre Curaçá e Uauá",
        startKm: 90,
        description: "Área deserta com pouco policiamento e histórico de assaltos",
        coordinates: [-8.746400, -36.431418], // Coordenada real do path da rota 3
        riskLevel: 'Alto'
      },
      {
        location: "Região de Canudos",
        startKm: 180,
        description: "Área histórica com estradas precárias e isolamento",
        coordinates: [-8.744331, -36.431223], // Coordenada real do path da rota 3
        riskLevel: 'Médio'
      },
      {
        location: "Desvios próximo a Feira de Santana",
        startKm: 520,
        description: "Estradas secundárias com risco de roubos de carga",
        coordinates: [-8.740447, -36.430714], // Coordenada real do path da rota 3
        riskLevel: 'Alto'
      }
    ],
    fuelStop: [
      {
        locationName: "Posto de Combustível BR-210 Curaçá",
        coordinates: [-8.996053994082077, -39.891206384410026]
      },
      {
        locationName: "Posto de Combustível BR-316 Belém do São Francisco",
        coordinates: [-8.746924816077652, -38.95351772288374]
      },{
        locationName: "Posto de Combustível BR-423 Águas Belas",
        coordinates: [-9.129879204614392, -37.108644218193405]
      },{
        locationName: "Posto de Combustível BR-432 Garanhuns",
        coordinates: [-8.871632279165526, -36.466459320747575]
      },{
        locationName: "Posto de Combustível BR-322 - Caruaru",
        coordinates: [-8.30305034168899, -35.9764853919906]
      }
    ],
    fuelCostPerKm: 5.20, // Maior custo devido à baixa eficiência em estradas ruins
    dangerZonesDetails: "Rota muito longa com múltiplas áreas de risco, estradas precárias e isolamento"
  }
];