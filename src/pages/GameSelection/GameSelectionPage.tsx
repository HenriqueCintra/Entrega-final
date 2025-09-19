// arquivo: src/pages/GameSelection/GameSelectionPage.tsx

import React, { useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import GameCard from './components/GameCard';
import PixelHeading from './components/PixelHeading';
import Footer from './components/Footer';
import { ArrowLeft, ImageIcon, Loader, AlertTriangle } from 'lucide-react';
import { ButtonHomeBack } from '@/components/ButtonHomeBack';
import { AudioControl } from '@/components/AudioControl';
import { GameService } from '@/api/gameService';
import { Map as Desafio } from '@/types'; // O tipo Map representa um Desafio
import { useAuth } from '@/contexts/AuthContext'; 

const gamesData = [
  {
    id: 'entrega_eficiente', // ID para controle interno
    title: "ENTREGA EFICIENTE", // Título do JOGO que será exibido
    description: "GERENCIE SUA FROTA DE CAMINHÕES, ESCOLHA AS MELHORES ROTAS E FAÇA ENTREGAS COM EFICIÊNCIA.",
    borderColor: 'border-yellow-500',
    buttonBgColor: 'bg-yellow-500',
    buttonHoverColor: 'hover:bg-yellow-600',
    isActive: true,
  },
  {
    id: 'centro_distribuicao',
    title: "Centro de Distribuição",
    description: "Gerencie o fluxo de produtos em seu centro de distribuição, otimizando a logística e reduzindo custos.",
    borderColor: 'border-green-400',
    buttonBgColor: 'bg-green-300',
    buttonHoverColor: 'hover:bg-green-400',
    isActive: false,
  },
  {
    id: 'gestao_estoque',
    title: "Gestão de Estoque",
    description: "Gerencie o estoque de produtos, otimizando a distribuição e reduzindo custos.",
    borderColor: 'border-blue-400',
    buttonBgColor: 'bg-blue-300',
    buttonHoverColor: 'hover:bg-blue-400',
    isActive: false,
  },
];

const GameSelectionPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const hasRedirected = useRef(false); // 2. CRIAR A "BANDEIRA" DE CONTROLE

  const { data: desafios, isLoading, isError } = useQuery<Desafio[]>({
    queryKey: ['mapas'],
    queryFn: GameService.getMaps,
    enabled: !authLoading && !!user?.equipe,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } 
      // 3. ADICIONAR A VERIFICAÇÃO DA BANDEIRA
      else if (!user.equipe && !hasRedirected.current) {
        hasRedirected.current = true; // Marca que o redirecionamento foi iniciado
        alert("Você precisa fazer parte de uma equipe para jogar!");
        navigate('/choose-team');
      }
    }
  }, [user, authLoading, navigate]);

  const handleGameClick = (gameId: string) => {
    if (gameId === 'entrega_eficiente') {
      if (desafios && desafios.length > 0) {
        const primeiroDesafio = desafios[0];
        navigate('/tutorial', { state: { mapaId: primeiroDesafio.id } });
      } else if (!isLoading) {
         alert("Nenhum desafio encontrado para este jogo. Verifique o backend.");
      }
    } else {
      const game = gamesData.find(g => g.id === gameId);
      alert(`O jogo "${game?.title}" ainda está em desenvolvimento!`);
    }
  };

  if (authLoading) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-800 flex flex-col items-center justify-center">
            <Loader className="animate-spin text-white mb-4" size={48} />
            <p className="text-white [font-family:'Silkscreen',Helvetica]">Verificando sua equipe...</p>
        </div>
    );
  }

  if (!user?.equipe) {
    return null;
  }
  
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-800 flex flex-col items-center justify-between py-12 px-4"
      style={{ fontFamily: "'Press Start 2P', cursive" }}
    >
      <div className="flex gap-5 absolute top-14 left-[33px]">
        <ButtonHomeBack onClick={() => navigate(-1)}><ArrowLeft /></ButtonHomeBack>
      </div>
      
      <div className="absolute top-14 right-[33px]">
        <AudioControl />
      </div>

      <div className="w-full max-w-6xl flex flex-col items-center">
        <PixelHeading text="ESCOLHA SEU JOGO" className="mb-12 mt-8" />

        {isLoading && (
            <div className="text-white text-lg flex items-center">
                <Loader className="mr-2 animate-spin" /> Carregando desafios...
            </div>
        )}

        {isError && (
            <div className="text-red-400 text-lg flex items-center">
                <AlertTriangle className="mr-2" /> Erro ao carregar desafios.
            </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {gamesData.map((game) => (
            <GameCard
              key={game.id}
              title={game.title}
              description={game.description}
              isActive={game.isActive}
              onClick={() => game.isActive && handleGameClick(game.id)}
              borderColor={game.borderColor}
              buttonBgColor={game.buttonBgColor}
              buttonHoverColor={game.buttonHoverColor}
              icon={<ImageIcon className="w-12 h-12" />}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GameSelectionPage;
