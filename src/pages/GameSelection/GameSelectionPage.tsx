import React from 'react';
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import GameCard from './components/GameCard';
import PixelHeading from './components/PixelHeading';
import Footer from './components/Footer';
import { ArrowLeft, ImageIcon, Loader, AlertTriangle } from 'lucide-react';
import { ButtonHomeBack } from '@/components/ButtonHomeBack';
import { GameService } from '@/api/gameService';
import { Map as GameMap } from '@/types';

const GameSelectionPage = () => {
  const navigate = useNavigate();

  // Buscando os dados da API
  const { data: maps, isLoading, isError } = useQuery<GameMap[]>({
    queryKey: ['maps'],
    queryFn: GameService.getMaps,
  });

  // Lógica de navegação baseada no NOME do mapa
  const handleGameClick = (map: GameMap) => {
    // Se o mapa for "ENTREGA EFICIENTE"
    if (map.nome === "ENTREGA EFICIENTE") {
      navigate('/tutorial'); // Leva para a tela de tutorial
    } else {
      // Para outros jogos, mostra alerta de "em desenvolvimento"
      alert(`O jogo "${map.nome}" ainda está em desenvolvimento!`);
      // navigate('/desafio', { state: { map } }); // Descomente quando a lógica estiver pronta
    }
  };

  // Função de configuração que usa o NOME do mapa vindo da API
  const getGameConfig = (mapName: string) => {
    // Mapeia o NOME do mapa para a configuração visual
    switch (mapName) {
      case "ENTREGA EFICIENTE":
        return {
          borderColor: 'border-yellow-500',
          buttonBgColor: 'bg-yellow-500',
          buttonHoverColor: 'hover:bg-yellow-600',
          isActive: true, // Este jogo está ATIVO
        };
      case "Centro de Distribuição":
        return {
          borderColor: 'border-green-400',
          buttonBgColor: 'bg-green-300',
          buttonHoverColor: 'hover:bg-green-400',
          isActive: false, // Este jogo está INATIVO
        };
      case "Gestão de Estoque":
        return {
          borderColor: 'border-blue-400',
          buttonBgColor: 'bg-blue-300',
          buttonHoverColor: 'hover:bg-blue-400',
          isActive: false, // Este jogo está INATIVO
        };
      // Configuração padrão para qualquer outro mapa que possa existir
      default:
        return {
          borderColor: 'border-gray-400',
          buttonBgColor: 'bg-gray-300',
          buttonHoverColor: 'hover:bg-gray-400',
          isActive: false,
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-800 flex items-center justify-center">
        <div className="text-white text-center text-2xl flex items-center" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          <Loader className="mr-4 animate-spin" />
          Carregando Jogos...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-800 flex items-center justify-center">
        <div className="text-red-500 text-center text-2xl flex items-center" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          <AlertTriangle className="mr-2" />
          Erro ao carregar os jogos.
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-800 flex flex-col items-center justify-between py-12 px-4"
      style={{ fontFamily: "'Press Start 2P', cursive" }}
    >
      <div className="flex gap-5 absolute top-14 left-[33px]">
        <ButtonHomeBack onClick={() => navigate(-1)}><ArrowLeft /></ButtonHomeBack>
      </div>

      <div className="w-full max-w-6xl flex flex-col items-center">
        <PixelHeading text="ESCOLHA SEU JOGO" className="mb-12 mt-8" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {maps?.map((map) => {
            // Passa o NOME do mapa para a função de configuração
            const config = getGameConfig(map.nome);
            return (
              <GameCard
                key={map.id}
                title={map.nome}
                description={map.descricao}
                isActive={config.isActive}
                onClick={() => config.isActive && handleGameClick(map)}
                borderColor={config.borderColor}
                buttonBgColor={config.buttonBgColor}
                buttonHoverColor={config.buttonHoverColor}
                icon={<ImageIcon className="w-12 h-12" />}
              />
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GameSelectionPage;