// Desafio: Juazeiro → Fortaleza
// Dados das rotas para o desafio Fortaleza

import { fortalezaRoute1Path } from './paths/route1Path';
import { fortalezaRoute2Path } from './paths/route2Path';
import { fortalezaRoute3Path } from './paths/route3Path';
import { Route, REFERENCE_COORDINATES } from '../../constants';

export const fortalezaRoutes: Route[] = [
  {
    routeId: 1,
    challengeId: 'fortaleza',
    name: "Rota Padrão: Juazeiro-Fortaleza via BR-407 e BR-116",
    distance: 750,
    estimatedTime: "10h30min",
    estimatedTimeHours: 10.5,
    cities: [
      "Juazeiro", "Petrolina", "Salgueiro", "Picos", 
      "Iguatu", "Quixadá", "Fortaleza"
    ],
    roads: ["BR-407", "BR-116"],
    startCoordinates: REFERENCE_COORDINATES.JUAZEIRO,
    endCoordinates: REFERENCE_COORDINATES.FORTALEZA,
    pathCoordinates: fortalezaRoute1Path,
    safety: {
      robberyRisk: 'Médio',
      roadHazards: 'Tráfego moderado, alguns trechos com animais na pista'
    },
    dirtRoad: false,
    roadConditions: 'Boa',
    tollBooths: [
      {
        location: "BR-116 - Pedágio Picos",
        costPerAxle: 4.20,
        totalCostExample4Axles: 16.80,
        coordinates: [-3.733377, -38.531648], // Coordenada real do path próxima ao destino
        totalCost: 16.80
      }
    ]
  },
  {
    routeId: 2,
    challengeId: 'fortaleza',
    name: "Rota Alternativa: Juazeiro-Fortaleza via Litoral",
    distance: 820,
    estimatedTime: "11h15min",
    estimatedTimeHours: 11.25,
    cities: [
      "Juazeiro", "Paulo Afonso", "Glória", "Rodelas", "Belém do São Francisco",
      "Floresta", "Petrolândia", "Itacuruba", "Cabrobó", "Orocó",
      "Santa Maria da Boa Vista", "Lagoa Grande", "Petrolina", "Dormentes",
      "Afrânio", "Cabrobó", "Belém do São Francisco", "Floresta",
      "Carnaubeira da Penha", "Calumbi", "Serra Talhada", "Triunfo",
      "Santa Cruz da Baixa Verde", "Afogados da Ingazeira", "Tabira",
      "Ingazeira", "São José do Egito", "Itapetim", "Tupanatinga",
      "Águas Belas", "Iati", "Buíque", "Pedra", "Venturosa", "Alagoinha",
      "Brejão", "Canhotinho", "Lajedo", "São Bento do Una", "Belo Jardim",
      "Tacaimbó", "Sanharó", "Pesqueira", "Poção", "Alagoinha", "Garanhuns",
      "Bom Conselho", "Correntes", "Jucati", "Palmeirina", "Calçado",
      "São João", "Caetés", "Fortaleza"
    ],
    roads: ["BA-210", "PE-360", "BR-232", "CE-060"],
    startCoordinates: REFERENCE_COORDINATES.JUAZEIRO,
    endCoordinates: REFERENCE_COORDINATES.FORTALEZA,
    pathCoordinates: fortalezaRoute2Path,
    safety: {
      robberyRisk: 'Alto',
      roadHazards: 'Rota longa com muitas estradas secundárias e áreas isoladas'
    },
    dirtRoad: true,
    dirtRoadDetails: "Vários trechos não pavimentados em estradas secundárias",
    roadConditions: 'Regular',
    tollBooths: [
      {
        location: "BR-232 - Pedágio Caruaru",
        costPerAxle: 3.80,
        totalCostExample4Axles: 15.20,
        coordinates: [-7.876140, -40.075550], // Coordenada real do path da rota 2
        totalCost: 15.20
      },
      {
        location: "CE-060 - Pedágio Fortaleza",
        costPerAxle: 4.50,
        totalCostExample4Axles: 18.00,
        coordinates: [-7.873028, -40.071953], // Coordenada real do path da rota 2
        totalCost: 18.00
      }
    ],
    dirtSegments: [
      {
        startKm: 150,
        endKm: 180,
        condition: 'moderada',
        eventChance: 0.18,
        speedFactor: 0.70,
        description: "Estradas vicinais entre Paulo Afonso e Glória"
      },
      {
        startKm: 400,
        endKm: 430,
        condition: 'leve',
        eventChance: 0.12,
        speedFactor: 0.80,
        description: "Trechos secundários próximo a Serra Talhada"
      }
    ],
    dangerZones: [
      {
        location: "Estradas isoladas próximo a Paulo Afonso",
        startKm: 160,
        description: "Área com pouco policiamento e histórico de assaltos",
        coordinates: [-7.875894, -40.075264], // Coordenada real do path da rota 2
        riskLevel: 'Alto'
      },
      {
        location: "Região de Serra Talhada",
        startKm: 420,
        description: "Área conhecida por roubos de carga",
        coordinates: [-7.874101, -40.073192], // Coordenada real do path da rota 2
        riskLevel: 'Alto'
      }
    ]
  },
  {
    routeId: 3,
    challengeId: 'fortaleza',
    name: "Rota Econômica: Juazeiro-Fortaleza (Evitando Pedágios)",
    distance: 890,
    estimatedTime: "13h45min",
    estimatedTimeHours: 13.75,
    cities: [
      "Juazeiro", "Curaçá", "Uauá", "Canudos", "Monte Santo",
      "Euclides da Cunha", "Tucano", "Araci", "Serrinha",
      "Conceição do Coité", "Valente", "Retirolândia", "São Domingos",
      "Nordestina", "Filadélfia", "Pindobaçu", "Senhor do Bonfim",
      "Campo Formoso", "Sento Sé", "Sobradinho", "Casa Nova",
      "Pilão Arcado", "Remanso", "Petrolina", "Dormentes", "Afrânio",
      "Cabrobó", "Belém do São Francisco", "Floresta", "Betânia",
      "Custódia", "Ibimirim", "Inajá", "Manari", "Arcoverde",
      "Pesqueira", "Sanharó", "Belo Jardim", "Caruaru", "Bezerros",
      "Gravatá", "Vitória de Santo Antão", "Pombos", "Primavera",
      "Chã de Alegria", "Glória do Goitá", "Paudalho", "Carpina",
      "Nazaré da Mata", "Tracunhaém", "Goiana", "Itaquitinga",
      "Igarassu", "Abreu e Lima", "Paulista", "Olinda", "Recife",
      "Jaboatão dos Guararapes", "Moreno", "Cabo de Santo Agostinho",
      "Ipojuca", "Escada", "Ribeirão", "Amaraji", "Primavera",
      "Chã Grande", "São Lourenço da Mata", "Camaragibe", "Recife",
      "Fortaleza"
    ],
    roads: ["BA-233", "BA-052", "PE-320", "PE-160", "BR-101", "CE-040"],
    startCoordinates: REFERENCE_COORDINATES.JUAZEIRO,
    endCoordinates: REFERENCE_COORDINATES.FORTALEZA,
    pathCoordinates: fortalezaRoute3Path,
    safety: {
      robberyRisk: 'Alto',
      roadHazards: 'Rota muito longa com múltiplas estradas secundárias, áreas isoladas e menor policiamento'
    },
    dirtRoad: true,
    dirtRoadDetails: "Extensos trechos não pavimentados e estradas vicinais para evitar pedágios",
    roadConditions: 'Ruim',
    tollBooths: [], // Rota econômica sem pedágios
    speedLimits: [
      {
        road: "BA-233",
        limit: "60 km/h",
        value: 60,
        coordinates: [-10.0, -39.5]
      },
      {
        road: "PE-320",
        limit: "80 km/h",
        value: 80,
        coordinates: [-8.5, -36.5]
      },
      {
        road: "BR-101",
        limit: "100 km/h",
        value: 100,
        coordinates: [-8.0, -35.0]
      }
    ],
    dirtSegments: [
      {
        startKm: 100,
        endKm: 150,
        condition: 'severa',
        eventChance: 0.30,
        speedFactor: 0.45,
        description: "Estradas de terra entre Curaçá e Uauá"
      },
      {
        startKm: 250,
        endKm: 290,
        condition: 'moderada',
        eventChance: 0.22,
        speedFactor: 0.65,
        description: "Trechos não pavimentados próximo a Monte Santo"
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
        endKm: 700,
        condition: 'moderada',
        eventChance: 0.20,
        speedFactor: 0.70,
        description: "Desvios por estradas municipais para evitar pedágios"
      },
      {
        startKm: 780,
        endKm: 820,
        condition: 'severa',
        eventChance: 0.25,
        speedFactor: 0.50,
        description: "Estradas vicinais precárias no final do percurso"
      }
    ],
    dangerZones: [
      {
        location: "Região de Canudos",
        startKm: 180,
        description: "Área histórica com estradas precárias e isolamento",
        coordinates: [-7.299925, -38.886066], // Coordenada real do path da rota 3
        riskLevel: 'Alto'
      },
      {
        location: "Estradas isoladas próximo a Monte Santo",
        startKm: 270,
        description: "Área deserta com pouco policiamento",
        coordinates: [-7.298938, -38.883579], // Coordenada real do path da rota 3
        riskLevel: 'Alto'
      },
      {
        location: "Desvios próximo a Arcoverde",
        startKm: 520,
        description: "Estradas secundárias com risco de roubos",
        coordinates: [-7.297987, -38.881189], // Coordenada real do path da rota 3
        riskLevel: 'Médio'
      },
      {
        location: "Região metropolitana alternativa",
        startKm: 750,
        description: "Desvios por áreas periféricas com maior criminalidade",
        coordinates: [-7.294548, -38.874150], // Coordenada real do path da rota 3
        riskLevel: 'Alto'
      }
    ],
    fuelCostPerKm: 5.50, // Maior custo devido à baixa eficiência em estradas ruins
    dangerZonesDetails: "Rota extremamente longa com múltiplas áreas de alto risco, estradas precárias e isolamento"
  }
];