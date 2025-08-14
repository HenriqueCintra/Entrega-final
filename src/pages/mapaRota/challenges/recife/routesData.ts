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
    roadConditions: 'Boa'
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
    ]
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
        limit: "60 km/h",
        value: 60,
        coordinates: [-9.5, -40.2]
      },
      {
        road: "BA-233",
        limit: "80 km/h",
        value: 80,
        coordinates: [-10.2, -39.8]
      },
      {
        road: "BR-101",
        limit: "100 km/h",
        value: 100,
        coordinates: [-12.5, -38.5]
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
    fuelCostPerKm: 5.20, // Maior custo devido à baixa eficiência em estradas ruins
    dangerZonesDetails: "Rota muito longa com múltiplas áreas de risco, estradas precárias e isolamento"
  }
];