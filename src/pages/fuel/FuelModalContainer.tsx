import React, { useState } from 'react';
import { FuelPage } from './FuelPage'; // Ajuste o caminho conforme necessário
import { MinigameScreen } from './MinigameScreen'; // Ajuste o caminho conforme necessário

interface FuelModalContainerProps {
  vehicle: any;
  currentMoney: number;
  selectedRoute: any;
  onComplete: (newMoney: number, newFuel: number) => void;
  onCancel: () => void;
}

export const FuelModalContainer: React.FC<FuelModalContainerProps> = ({
  vehicle,
  currentMoney,
  selectedRoute,
  onComplete,
  onCancel
}) => {
  const [currentScreen, setCurrentScreen] = useState<'fuel' | 'minigame'>('fuel');
  const [modalState, setModalState] = useState(() => {
    // Gera preços dinâmicos como no código original
    const basePrices = { DIESEL: 6.89, GASOLINA: 7.29, ALCOOL: 5.99 };
    const variation = 1 + (Math.random() - 0.5) * 0.3; // Variação de +/- 15%
    const dynamicPrices: Record<string, number> = {};
    for (const fuel in basePrices) {
      dynamicPrices[fuel] = parseFloat((basePrices[fuel] * variation).toFixed(2));
    }

    return {
      selectedVehicle: {
        ...vehicle,
        currentFuel: vehicle.currentFuel || 0 // ✅ CORRIGIDO - era currentMoney antes!
      },
      availableMoney: currentMoney,
      selectedRoute,
      fromGame: true, // Marca que veio do jogo
      stationPrices: dynamicPrices,
      gasStationName: "POSTO NA ESTRADA"
    };
  });

  // Mock do useNavigate - intercepta navegação e gerencia internamente
  const mockNavigate = (path: string, options?: { state?: any }) => {
    console.log(`🔄 Navegação interceptada no modal: ${path}`, options?.state);

    if (path === '/fuel-minigame') {
      // Transição do FuelPage para MinigameScreen
      setModalState(prevState => ({
        ...prevState,
        ...options?.state,
        fromGame: true // Mantém o marcador
      }));
      setCurrentScreen('minigame');

    } else if (path === '/game') {
      // Retorno ao jogo - determina se foi abastecimento ou cancelamento
      const state = options?.state;

      if (state?.resumeAfterRefuel) {
        // Abastecimento completo - extrai valores finais
        const finalMoney = state.updatedMoney;
        const finalFuel = state.updatedVehicle?.currentFuel || vehicle.currentFuel;

        console.log(`✅ Abastecimento completo via modal - Dinheiro: R$${finalMoney}, Combustível: ${finalFuel}L`);
        onComplete(finalMoney, finalFuel);
      } else {
        // Cancelamento ou início normal de jogo
        console.log("❌ Abastecimento cancelado via modal");
        onCancel();
      }

    } else if (path === '/routes' || path === '/fuel') {
      // Cancelamento direto (botão voltar, etc.)
      console.log("❌ Abastecimento cancelado - navegação para:", path);
      onCancel();
    } else {
      // Rota não reconhecida - trata como cancelamento
      console.warn(`⚠️ Rota não reconhecida no modal: ${path} - tratando como cancelamento`);
      onCancel();
    }
  };

  // Mock do useLocation
  const mockLocation = {
    state: modalState
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.8)', // ✅ OVERLAY MAIS SUAVE
      zIndex: 5000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Container principal do modal */}
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent', // ✅ REMOVE FUNDO EXTRA PARA EVITAR LAG
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Renderização condicional dos componentes */}
        {currentScreen === 'fuel' && (
          <FuelPage
            mockNavigate={mockNavigate}
            mockLocation={mockLocation}
          />
        )}

        {currentScreen === 'minigame' && (
          <MinigameScreen
            mockNavigate={mockNavigate}
            mockLocation={mockLocation}
          />
        )}

        {/* Botão de escape (fechar modal) - sempre visível */}
        <button
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            fontSize: '24px',
            fontWeight: 'bold',
            cursor: 'pointer',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'all 0.2s ease'
          }}
          title="Fechar e voltar ao jogo"
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#b91c1c';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#dc2626';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ×
        </button>

        {/* Indicador visual de que é um modal */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontFamily: "'Silkscreen', monospace",
          zIndex: 9999,
          pointerEvents: 'none'
        }}>
          🚛 PARADA PARA ABASTECIMENTO
        </div>
      </div>
    </div>
  );
};