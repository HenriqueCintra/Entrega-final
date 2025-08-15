// Gerenciador central dos desafios do jogo
// Coordena os três desafios: Salvador, Recife e Fortaleza

import { salvadorRoutes } from './challenges/salvador/routesData';
import { recifeRoutes } from './challenges/recife/routesData';
import { fortalezaRoutes } from './challenges/fortaleza/routesData';
import { Route, REFERENCE_COORDINATES, ChallengeId } from './constants';

// ChallengeId agora é importado de constants.ts

export interface Challenge {
  id: ChallengeId;
  name: string;
  description: string;
  destination: string;
  destinationCoordinates: [number, number];
  routes: Route[];
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  estimatedDuration: string;
}

export const challenges: Challenge[] = [
  {
    id: 'salvador',
    name: 'Desafio Salvador',
    description: 'Transporte de carga de Juazeiro para Salvador',
    destination: 'Salvador, BA',
    destinationCoordinates: REFERENCE_COORDINATES.SALVADOR,
    routes: salvadorRoutes,
    difficulty: 'Fácil',
    estimatedDuration: '7-8 horas'
  },
  {
    id: 'recife',
    name: 'Desafio Recife',
    description: 'Transporte de carga de Juazeiro para Recife',
    destination: 'Recife, PE',
    destinationCoordinates: REFERENCE_COORDINATES.RECIFE,
    routes: recifeRoutes,
    difficulty: 'Médio',
    estimatedDuration: '8-10 horas'
  },
  {
    id: 'fortaleza',
    name: 'Desafio Fortaleza',
    description: 'Transporte de carga de Juazeiro para Fortaleza',
    destination: 'Fortaleza, CE',
    destinationCoordinates: REFERENCE_COORDINATES.FORTALEZA,
    routes: fortalezaRoutes,
    difficulty: 'Difícil',
    estimatedDuration: '10-12 horas'
  }
];

// Função para obter um desafio específico
export const getChallenge = (challengeId: ChallengeId): Challenge | undefined => {
  return challenges.find(challenge => challenge.id === challengeId);
};

// Função para obter todas as rotas de um desafio
export const getChallengeRoutes = (challengeId: ChallengeId) => {
  const challenge = getChallenge(challengeId);
  return challenge?.routes || [];
};

// Função para obter coordenadas de destino
export const getDestinationCoordinates = (challengeId: ChallengeId): [number, number] => {
  const challenge = getChallenge(challengeId);
  return challenge?.destinationCoordinates || REFERENCE_COORDINATES.JUAZEIRO;
};

// Função de debug para testar as rotas
export const debugChallenges = () => {
  console.log("🔍 DEBUG - Testando todos os desafios:");
  challenges.forEach(challenge => {
    console.log(`- ${challenge.id}: ${challenge.name} (${challenge.routes.length} rotas)`);
    challenge.routes.forEach(route => {
      console.log(`  - ${route.name} (${route.distance}km)`);
    });
  });
};