// Sistema de Rotas - Versão Limpa
// Gerencia todas as rotas dos desafios do jogo

import { challenges, getChallengeRoutes } from './challengesManager';
import { Route, ChallengeId, REFERENCE_COORDINATES, CHALLENGE_DESTINATIONS } from './constants';

// Re-exportar tipos e constantes para compatibilidade
export type { Route, ChallengeId, DirtSegment } from './constants';
export { REFERENCE_COORDINATES, CHALLENGE_DESTINATIONS } from './constants';

// ==================== FUNÇÕES PRINCIPAIS ====================

// Obter todas as rotas de um desafio específico
export const getRoutesByChallenge = (challengeId: ChallengeId): Route[] => {
  return getChallengeRoutes(challengeId);
};

// Obter rota específica por ID e desafio
export const getRoute = (challengeId: ChallengeId, routeId: number): Route | undefined => {
  const routes = getRoutesByChallenge(challengeId);
  return routes.find(route => route.routeId === routeId);
};

// Obter todas as rotas de todos os desafios
export const getAllRoutes = (): Route[] => {
  const allRoutes: Route[] = [];
  challenges.forEach(challenge => {
    allRoutes.push(...getChallengeRoutes(challenge.id));
  });
  return allRoutes;
};

// Obter informações do desafio
export const getChallengeInfo = (challengeId: ChallengeId) => {
  return challenges.find(challenge => challenge.id === challengeId);
};

// Validar se uma rota tem coordenadas válidas
export const validateRoute = (route: Route): boolean => {
  return !!(
    route.pathCoordinates &&
    route.pathCoordinates.length > 0 &&
    route.startCoordinates &&
    route.endCoordinates
  );
};

// Obter estatísticas de um desafio
export const getChallengeStats = (challengeId: ChallengeId) => {
  const routes = getRoutesByChallenge(challengeId);
  const challenge = getChallengeInfo(challengeId);

  return {
    challengeName: challenge?.name,
    totalRoutes: routes.length,
    averageDistance: routes.reduce((sum, route) => sum + route.distance, 0) / routes.length,
    averageTime: routes.reduce((sum, route) => sum + route.estimatedTimeHours, 0) / routes.length,
    destination: challenge?.destination,
    difficulty: challenge?.difficulty
  };
};

// ==================== UTILITÁRIOS ====================

// Função para converter string de tempo em horas decimais
export const parseEstimatedTime = (timeStr: string): number => {
  const timeMatch = timeStr.match(/(\d+)[hH]?(\d+)?m?i?n?/);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    return hours + minutes / 60;
  }

  const parts = timeStr.match(/(\d+)\s*-\s*(\d+)?h/i);
  if (parts) {
    const minHours = parseInt(parts[1], 10);
    const maxHours = parts[2] ? parseInt(parts[2], 10) : minHours;
    return (minHours + maxHours) / 2;
  }

  const singleHourMatch = timeStr.match(/(\d+)h/i);
  if (singleHourMatch) {
    return parseInt(singleHourMatch[1], 10);
  }

  return 0;
};

// ==================== COMPATIBILIDADE ====================

// Importação direta para evitar dependência circular
import { salvadorRoutes } from './challenges/salvador/routesData';

// Exportação para compatibilidade com RoutesPage
// Por padrão, retorna as rotas de Salvador (desafio principal)
export const routes = salvadorRoutes;