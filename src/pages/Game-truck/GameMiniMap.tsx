import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Vehicle } from '../../types/vehicle';
import { calculatePositionFromProgress, calculatePathFromProgress } from '../../utils/mapUtils';
// Configuração do ícone padrão do Leaflet
import defaultIcon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: defaultIcon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface GameMiniMapProps {
  pathCoordinates: [number, number][];
  // currentPathIndex: number;
  // pathProgress: number; // 0-1 progresso dentro do segmento atual
  vehicle: Vehicle;
  progress: number; // Progresso total em porcentagem
  className?: string;
}

// Componente para atualizar a posição do caminhão
const TruckMarker: React.FC<{
  pathCoordinates: [number, number][];
  progress: number;
  vehicle: Vehicle;
}> = ({ pathCoordinates, progress, vehicle }) => {
  const markerRef = useRef<L.Marker>(null);

  const vehicleIcon = useMemo(() => {
    let imageUrl = vehicle.image;
    if (imageUrl.startsWith('/src/assets/')) {
      imageUrl = imageUrl.replace('/src/assets/', '/assets/');
    }
    if (!imageUrl.startsWith('/assets/') && !imageUrl.startsWith('http')) {
      imageUrl = `/assets/${imageUrl.split('/').pop()}`;
    }
    return L.icon({
      iconUrl: imageUrl,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });
  }, [vehicle.image]);

  // Apenas a nova lógica de cálculo deve existir aqui
  const currentPosition = useMemo(() => {
    return calculatePositionFromProgress(pathCoordinates, progress);
  }, [pathCoordinates, progress]);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng(currentPosition);
    }
  }, [currentPosition]);

  return (
    <Marker
      position={currentPosition}
      icon={vehicleIcon}
      ref={markerRef}
    />
  );
};

// Componente para mostrar a direção do caminhão
const TruckDirection: React.FC<{
  pathCoordinates: [number, number][];
  progress: number;
}> = ({ pathCoordinates, progress }) => {
    
  const directionPosition = useMemo(() => {
    if (!pathCoordinates || pathCoordinates.length < 2) {
      return null;
    }
    
    // Calcula a posição atual e uma posição um pouco à frente usando a mesma lógica
    const current = calculatePositionFromProgress(pathCoordinates, progress);
    const direction = calculatePositionFromProgress(pathCoordinates, Math.min(progress + 2, 100)); // 2% à frente

    return { current, direction };
  }, [pathCoordinates, progress]);

  if (!directionPosition) return null;

  return (
    <Polyline
      positions={[directionPosition.current, directionPosition.direction]}
      pathOptions={{
        color: '#ff6b35',
        weight: 3,
        opacity: 0.8,
        dashArray: '5,5'
      }}
    />
  );
};


// Componente para ajustar automaticamente o zoom do mapa
const MapViewAdjuster: React.FC<{ pathCoordinates: [number, number][] }> = ({ pathCoordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (pathCoordinates && pathCoordinates.length > 1) {
      const bounds = L.latLngBounds(pathCoordinates);
      map.fitBounds(bounds, { padding: [10, 10] });
    }
  }, [map, pathCoordinates]);

  return null;
};

export const GameMiniMap: React.FC<GameMiniMapProps> = ({
  pathCoordinates,
  // currentPathIndex,
  // pathProgress,
  vehicle,
  progress,
  className = ""
}) => {
  const completedPath = useMemo(() => calculatePathFromProgress(pathCoordinates, progress), [pathCoordinates, progress]);
  // Se não há coordenadas da rota, não renderizar o mapa
  if (!pathCoordinates || pathCoordinates.length < 2) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-800 text-white text-sm`}>
        <div className="text-center">
          <div>📍 Mapa</div>
          <div>Indisponível</div>
        </div>
      </div>
    );
  }

  // Coordenadas de início e fim
  const startCoord = pathCoordinates[0];
  const endCoord = pathCoordinates[pathCoordinates.length - 1];

  return (
    <div className={className} style={{ position: 'relative' }}>

      <MapContainer
        center={startCoord}
        zoom={10}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        style={{ width: '100%', height: '100%', borderRadius: '50%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Ajustar visualização automaticamente */}
        <MapViewAdjuster pathCoordinates={pathCoordinates} />
        
        {/* Desenhar a rota completa */}
        <Polyline
          positions={pathCoordinates}
          pathOptions={{
            color: '#0077cc',
            weight: 4,
            opacity: 0.7
          }}
        />
        
        {/* Parte da rota já percorrida */}
        {completedPath.length > 0 && (
        <Polyline
          positions={completedPath}
          pathOptions={{
            color: '#00cc66',
            weight: 5,
            opacity: 0.9
          }}
        />
      )}
        
        {/* Marcadores de início e fim */}
        <Marker
          position={startCoord}
          icon={L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })}
        />
        
        <Marker
          position={endCoord}
          icon={L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684879.png',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })}
        />
        
        {/* Caminhão na posição atual */}
        <TruckMarker
          pathCoordinates={pathCoordinates}
          progress={progress}
          vehicle={vehicle}
        />

        {/* Direção do caminhão */}
        <TruckDirection
          pathCoordinates={pathCoordinates}
          progress={progress}
        />
      </MapContainer>
    </div>
  );
}; 