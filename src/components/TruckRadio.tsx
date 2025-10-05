import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, SkipForward, SkipBack, List, X, Radio } from 'lucide-react';

interface RadioStation {
  changeuuid: string;
  name: string;
  url_resolved: string;
  country: string;
  language: string;
  tags: string;
}

interface TruckRadioProps {
  isOpen: boolean;
  onClose: () => void;
}

const TruckRadio: React.FC<TruckRadioProps> = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [showStationList, setShowStationList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchRadioStations();
  }, []);

  // Aplica o volume inicial quando o componente monta
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const fetchSpecificStationByUrl = async (streamUrl: string): Promise<RadioStation | null> => {
    try {
      const encodedUrl = encodeURIComponent(streamUrl);
      const response = await fetch(`https://de1.api.radio-browser.info/json/stations/byurl?url=${encodedUrl}`);
      const data = await response.json();
      if (data && data.length > 0) {
        return data[0];
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar estação específica:', error);
      return null;
    }
  };

  const fetchRadioStations = async () => {
    setLoading(true);
    try {
      // 2. ALTERAÇÃO PARA TESTAR: Agora vamos buscar a Studio Flashback
      const flashbackUrl = 'https://stream-163.zeno.fm/6gv76f1xruquv?zs=SvdWy-tsTtCXPZ9IZC0ASA';
      const specificStation = await fetchSpecificStationByUrl(flashbackUrl);

      const response = await fetch(
        'https://de1.api.radio-browser.info/json/stations/search?limit=20&countrycode=BR&tag=flashback&order=clickcount&reverse=true'
      );
      const generalStations = await response.json();
      
      let combinedStations = generalStations;

      if (specificStation) {
        const filteredGeneralStations = generalStations.filter(
          (station: RadioStation) => station.changeuuid !== specificStation.changeuuid
        );
        combinedStations = [specificStation, ...filteredGeneralStations];
      }

      setStations(combinedStations);
      if (combinedStations.length > 0) {
        setCurrentStation(combinedStations[0]);
      }
    } catch (error) {
      console.error('Erro ao buscar estações de rádio:', error);
      const mockStations: RadioStation[] = [
        {
          changeuuid: '2',
          name: 'Rádio Studio Flashback',
          url_resolved: 'https://stream-163.zeno.fm/6gv76f1xruquv?zs=SvdWy-tsTtCXPZ9IZC0ASA',
          country: 'Brasil',
          language: 'portuguese',
          tags: 'flashback',
        },
        {
          changeuuid: '3',
          name: 'Smooth Jazz Lounge',
          url_resolved: 'https://radio4.vip-radios.fm:18060/stream-128kmp3-SmoothJazzLounge',
          country: 'Brasil',
          language: 'portuguese',
          tags: 'flashback',
        },
        {
          changeuuid: '4',
          name: 'Máquina do Tempo (MPB Brasil)',
          url_resolved: 'http://servidor28.brlogic.com:8032/live',
          country: 'Brasil',
          language: 'portuguese',
          tags: 'flashback',
        },
        {
          changeuuid: 'jovempop-mock',
          name: 'Rádio Jovem POP',
          url_resolved: 'https://stm01.virtualcast.com.br:8000/live',
          country: 'Brasil',
          language: 'portuguese',
          tags: 'pop',
        },
      ];
      setStations(mockStations);
      if (mockStations.length > 0) {
        setCurrentStation(mockStations[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = () => {
    if (audioRef.current && currentStation) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Garantir que a URL está correta antes de tocar
        if (audioRef.current.src !== currentStation.url_resolved) {
          audioRef.current.src = currentStation.url_resolved;
        }
        audioRef.current.play().catch(error => {
          console.error("Erro ao tentar tocar o áudio:", error);
          // AQUI você verá o erro de CORS se ele ocorrer
        });
      }
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleNext = () => {
    if (stations.length > 0) {
      const nextIndex = (currentStationIndex + 1) % stations.length;
      setCurrentStationIndex(nextIndex);
      setCurrentStation(stations[nextIndex]);
    }
  };

  const handlePrevious = () => {
    if (stations.length > 0) {
      const prevIndex = (currentStationIndex - 1 + stations.length) % stations.length;
      setCurrentStationIndex(prevIndex);
      setCurrentStation(stations[prevIndex]);
    }
  };
  
  // Toca a rádio automaticamente quando a estação muda E isPlaying é true
  useEffect(() => {
    if (isPlaying && currentStation && audioRef.current) {
      audioRef.current.src = currentStation.url_resolved;
      audioRef.current.play().catch(error => console.error("Erro ao trocar de estação:", error));
    }
  }, [currentStation, isPlaying]);


  // 1. CORREÇÃO DE BUG: A lógica do volume foi corrigida
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const selectStation = (station: RadioStation, index: number) => {
    setCurrentStation(station);
    setCurrentStationIndex(index);
    setShowStationList(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed left-4 top-1/2 -translate-y-3/4 z-50">
      <div className="relative">
        {/* Rádio Principal */}
        <div 
          className="pixel-radio bg-gray-800 border-4 border-gray-600 rounded-lg p-4 w-64"
          style={{
            boxShadow: 'inset -2px -2px 0px #555, inset 2px 2px 0px #999, 4px 4px 8px rgba(0,0,0,0.3)',
            imageRendering: 'pixelated'
          }}
        >
           {/* Header do Rádio */}
           <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Radio size={16} className="text-green-400" />
              <span className="text-green-400 font-mono text-xs font-bold">TRUCK RADIO</span>
            </div>
            <button
              onClick={onClose}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Display da Estação */}
          <div 
            className="bg-black border-2 border-gray-500 p-2 mb-3 h-12 flex items-center justify-center"
            style={{ imageRendering: 'pixelated' }}
          >
            <div className="text-green-400 font-mono text-xs text-center overflow-hidden">
              {loading ? (
                <div className="animate-pulse">CARREGANDO...</div>
              ) : currentStation ? (
                <div className="truncate">{currentStation.name}</div>
              ) : (
                <div>SEM SINAL</div>
              )}
            </div>
          </div>

          {/* Controles Principais */}
          <div className="grid grid-cols-5 gap-2 mb-3">
            <button
              onClick={handlePrevious}
              disabled={!currentStation}
              className="pixel-button bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 border-2 border-gray-500 p-2 transition-colors"
              style={{ imageRendering: 'pixelated' }}
            >
              <SkipBack size={12} className="text-white mx-auto" />
            </button>
            
            <button
              onClick={handlePlay}
              disabled={!currentStation}
              className="pixel-button bg-green-700 hover:bg-green-600 disabled:bg-gray-800 border-2 border-gray-500 p-2 transition-colors col-span-1"
              style={{ imageRendering: 'pixelated' }}
            >
              {isPlaying ? (
                <Pause size={12} className="text-white mx-auto" />
              ) : (
                <Play size={12} className="text-white mx-auto" />
              )}
            </button>

            <button
              onClick={handleStop}
              disabled={!currentStation}
              className="pixel-button bg-red-700 hover:bg-red-600 disabled:bg-gray-800 border-2 border-gray-500 p-2 transition-colors"
              style={{ imageRendering: 'pixelated' }}
            >
              <Square size={12} className="text-white mx-auto" />
            </button>

            <button
              onClick={handleNext}
              disabled={!currentStation}
              className="pixel-button bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 border-2 border-gray-500 p-2 transition-colors"
              style={{ imageRendering: 'pixelated' }}
            >
              <SkipForward size={12} className="text-white mx-auto" />
            </button>

            <button
              onClick={() => setShowStationList(!showStationList)}
              className="pixel-button bg-blue-700 hover:bg-blue-600 border-2 border-gray-500 p-2 transition-colors"
              style={{ imageRendering: 'pixelated' }}
            >
              <List size={12} className="text-white mx-auto" />
            </button>
          </div>

          {/* Controle de Volume */}
          <div className="mb-2">
            <div className="flex items-center gap-2">
              <span className="text-white font-mono text-xs">VOL</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none pixel-slider"
                style={{ imageRendering: 'pixelated' }}
              />
              <span className="text-white font-mono text-xs w-8">
                {Math.round(volume * 100)}
              </span>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-center gap-2">
            <div 
              className={`w-2 h-2 rounded-full ${
                isPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
              }`}
            />
            <span className="text-gray-400 font-mono text-xs">
              {isPlaying ? 'ON AIR' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Lista de Estações */}
        {showStationList && (
          <div 
            className="absolute left-full ml-2 top-0 bg-gray-800 border-4 border-gray-600 rounded-lg p-3 w-56 max-h-64 overflow-y-auto"
            style={{
              boxShadow: 'inset -2px -2px 0px #555, inset 2px 2px 0px #999, 4px 4px 8px rgba(0,0,0,0.3)',
              imageRendering: 'pixelated'
            }}
          >
            <h3 className="text-green-400 font-mono text-xs font-bold mb-2">ESTAÇÕES</h3>
            <div className="space-y-1">
              {stations.map((station, index) => (
                <button
                  key={station.changeuuid}
                  onClick={() => selectStation(station, index)}
                  className={`w-full text-left p-2 text-xs font-mono transition-colors border ${
                    currentStation?.changeuuid === station.changeuuid
                      ? 'bg-green-700 border-green-500 text-white'
                      : 'bg-gray-700 border-gray-500 text-gray-300 hover:bg-gray-600'
                  }`}
                  style={{ imageRendering: 'pixelated' }}
                >
                  <div className="truncate font-bold">{station.name}</div>
                  <div className="truncate text-gray-400">
                    {station.country}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default TruckRadio;