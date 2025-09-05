/**
 * Calcula a distância em km entre duas coordenadas geográficas.
 * @param coords1 - [latitude, longitude] do ponto 1
 * @param coords2 - [latitude, longitude] do ponto 2
 * @returns A distância em quilômetros.
 */
const haversineDistance = (coords1: [number, number], coords2: [number, number]): number => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Raio da Terra em km

  const dLat = toRad(coords2[0] - coords1[0]);
  const dLon = toRad(coords2[1] - coords1[1]);
  const lat1 = toRad(coords1[0]);
  const lat2 = toRad(coords2[0]);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Calcula a coordenada exata em uma rota com base na porcentagem de progresso total.
 * @param pathCoordinates - O array completo de coordenadas da rota.
 * @param progress - O progresso total da viagem (0 a 100).
 * @returns A coordenada [latitude, longitude] exata correspondente ao progresso.
 */
export const calculatePositionFromProgress = (
  pathCoordinates: [number, number][],
  progress: number
): [number, number] => {
  if (!pathCoordinates || pathCoordinates.length < 2) {
    return pathCoordinates?.[0] || [0, 0];
  }

  // 1. Calcula os comprimentos de cada segmento e a distância total
  const segmentLengths: number[] = [];
  let totalDistance = 0;
  for (let i = 0; i < pathCoordinates.length - 1; i++) {
    const segmentLength = haversineDistance(pathCoordinates[i], pathCoordinates[i + 1]);
    segmentLengths.push(segmentLength);
    totalDistance += segmentLength;
  }

  if (totalDistance === 0) {
    return pathCoordinates[0];
  }

  // 2. Determina a distância alvo com base no progresso
  const targetDistance = totalDistance * (progress / 100);

  // 3. Encontra o segmento correto e o fator de interpolação
  let distanceCovered = 0;
  for (let i = 0; i < segmentLengths.length; i++) {
    const currentSegmentLength = segmentLengths[i];

    // Verifica se a distância alvo está dentro deste segmento
    if (distanceCovered + currentSegmentLength >= targetDistance) {
      const distanceIntoSegment = targetDistance - distanceCovered;
      const progressInSegment = currentSegmentLength === 0 ? 0 : distanceIntoSegment / currentSegmentLength;

      const startPoint = pathCoordinates[i];
      const endPoint = pathCoordinates[i + 1];

      // 4. Interpola para encontrar as coordenadas exatas
      const lat = startPoint[0] + (endPoint[0] - startPoint[0]) * progressInSegment;
      const lng = startPoint[1] + (endPoint[1] - startPoint[1]) * progressInSegment;

      return [lat, lng];
    }
    distanceCovered += currentSegmentLength;
  }

  // Fallback para o último ponto se o progresso for 100% ou mais
  return pathCoordinates[pathCoordinates.length - 1];
};

/**
 * Retorna um array de coordenadas representando o caminho percorrido com base no progresso.
 * @param pathCoordinates - O array completo de coordenadas da rota.
 * @param progress - O progresso total da viagem (0 a 100).
 * @returns Um novo array de coordenadas representando o caminho concluído.
 */
export const calculatePathFromProgress = (
  pathCoordinates: [number, number][],
  progress: number
): [number, number][] => {
  if (!pathCoordinates || pathCoordinates.length < 2 || progress <= 0) {
    return [];
  }
  if (progress >= 100) {
    return pathCoordinates;
  }

  const segmentLengths: number[] = [];
  let totalDistance = 0;
  for (let i = 0; i < pathCoordinates.length - 1; i++) {
    const segmentLength = haversineDistance(pathCoordinates[i], pathCoordinates[i + 1]);
    segmentLengths.push(segmentLength);
    totalDistance += segmentLength;
  }

  if (totalDistance === 0) {
    return [];
  }

  const targetDistance = totalDistance * (progress / 100);
  const newPath: [number, number][] = [];
  let distanceCovered = 0;

  for (let i = 0; i < segmentLengths.length; i++) {
    const currentSegmentLength = segmentLengths[i];
    newPath.push(pathCoordinates[i]);

    if (distanceCovered + currentSegmentLength >= targetDistance) {
      const distanceIntoSegment = targetDistance - distanceCovered;
      const progressInSegment = currentSegmentLength === 0 ? 0 : distanceIntoSegment / currentSegmentLength;
      const startPoint = pathCoordinates[i];
      const endPoint = pathCoordinates[i + 1];
      const lat = startPoint[0] + (endPoint[0] - startPoint[0]) * progressInSegment;
      const lng = startPoint[1] + (endPoint[1] - startPoint[1]) * progressInSegment;
      newPath.push([lat, lng]);
      return newPath;
    }
    distanceCovered += currentSegmentLength;
  }

  return pathCoordinates;
};