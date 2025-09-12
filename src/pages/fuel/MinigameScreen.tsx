// src/RefuelScreen/MinigameScreen.tsx

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// Removido GameContext inexistente; usaremos somente dados vindos via state

const FILL_RATE = 0.35; // Velocidade mais rápida e responsiva
const TOLERANCE = 8.0; // Margem mais generosa para resultado "Perfeito"
const GOOD_TOLERANCE = 15.0; // Margem mais generosa para "Bom"

const formatCurrency = (value: number): string => {
  return `R$ ${value.toFixed(2)}`;
};

interface RefuelInfo {
  fuelType: string;
  fraction: number;
  cost: number;
  liters: number;
}

export const MinigameScreen: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const locationState = state as any;
  const vehicle = locationState?.selectedVehicle ?? locationState?.vehicle;
  const selectedRoute = locationState?.selectedRoute;
  const [playerBalance, setPlayerBalance] = useState<number>(locationState?.availableMoney ?? 0);

  const refuelInfo = state?.refuelInfo as RefuelInfo | undefined;
  const targetLevel = refuelInfo ? refuelInfo.fraction * 100 : 0;

  const [currentLevel, setCurrentLevel] = useState(0);
  const [isPouring, setIsPouring] = useState(false);
  const [hasOverflowed, setHasOverflowed] = useState(false);
  const [result, setResult] = useState<{
    message: string;
    detail: string;
  } | null>(null);

  useEffect(() => {
    if (!refuelInfo || !vehicle) {
      alert("Erro: Dados de abastecimento ou do veículo não encontrados.");
      navigate("/fuel", { state: { selectedVehicle: vehicle, availableMoney: playerBalance, selectedRoute } });
    }
  }, [refuelInfo, vehicle, navigate]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isPouring) {
      intervalId = setInterval(() => {
        setCurrentLevel((prev) => {
          const newLevel = Math.min(prev + FILL_RATE, 100);
          
          // Detectar overflow durante o preenchimento
          if (newLevel >= 100 && !hasOverflowed) {
            setHasOverflowed(true);
            setIsPouring(false);
            // Mostrar resultado de overflow imediatamente
            setTimeout(() => {
              checkResult(100);
            }, 100);
            return 100;
          }
          
          return newLevel;
        });
      }, 20); // 50 FPS - balance entre suavidade e responsividade
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPouring, hasOverflowed]);

  const handleInteractionStart = () => {
    if (!result && !hasOverflowed) {
      setIsPouring(true);
    }
  };

  const handleInteractionEnd = () => {
    if (isPouring) {
      setIsPouring(false);
      // Pequeno delay para permitir que o último frame seja processado
      setTimeout(() => {
        checkResult(currentLevel);
      }, 50);
    }
  };

  const checkResult = (finalLevel: number) => {
    if (!refuelInfo || !vehicle) return;

    const deviation = Math.abs(finalLevel - targetLevel);

    if (finalLevel >= 100 || finalLevel > targetLevel + GOOD_TOLERANCE) {
      // Derramou ou ultrapassou o limite
      setPlayerBalance(playerBalance - refuelInfo.cost);
      setResult({
        message: "DERRAMOU!",
        detail: `Combustível perdido! Custo: ${formatCurrency(
          refuelInfo.cost
        )}`,
      });
    } else {
      // Abastecimento bem-sucedido
      const successRatio = Math.min(finalLevel / targetLevel, 1);
      const finalCost = refuelInfo.cost * successRatio;
      const litersAdded = refuelInfo.liters * successRatio;

      const newBalance = playerBalance - finalCost;

      setPlayerBalance(newBalance);
      // como não temos contexto global aqui, só navegamos levando estado atualizado
      // vehicle.currentFuel será atualizado indiretamente ao continuar

      if (deviation <= TOLERANCE) {
        setResult({
          message: "PERFEITO!",
          detail: `R$ ${finalCost.toFixed(2)}`,
        });
      } else if (deviation <= GOOD_TOLERANCE) {
        setResult({
          message: "BOM!",
          detail: `R$ ${finalCost.toFixed(2)}`,
        });
      } else {
        setResult({
          message: "OK!",
          detail: `R$ ${finalCost.toFixed(2)}`,
        });
      }
    }
  };

  const handleContinue = () => {
    // Continua para o jogo carregando o estado atualizado localmente
    const updatedVehicle = vehicle
      ? { ...vehicle, currentFuel: Math.min(vehicle.currentFuel + (refuelInfo?.liters || 0), vehicle.maxCapacity) }
      : vehicle;
    navigate("/game", { state: { selectedVehicle: updatedVehicle, availableMoney: playerBalance, selectedRoute } });
  };

  if (!refuelInfo || !vehicle) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 font-['Press_Start_2P'] text-white flex items-center justify-center">
      <div className="w-full h-full flex flex-col items-center justify-center">
        {!result ? (
          <div
            className="text-center cursor-pointer select-none flex flex-col items-center justify-center"
            onMouseDown={handleInteractionStart}
            onMouseUp={handleInteractionEnd}
            onTouchStart={handleInteractionStart}
            onTouchEnd={handleInteractionEnd}
          >
            {/* Title */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-cyan-400 mb-2 tracking-wider">
                ABASTECIMENTO
              </h1>
              <p className="text-xs text-gray-300">SEGURE E SOLTE NA META</p>
            </div>

            {/* Fuel Nozzle with Animation */}
            <div className="mb-6 flex justify-center relative">
              <div className="relative">
                <img
                  src="/noozle.png"
                  alt="Bico de abastecimento"
                  className={`w-20 h-20 transition-all duration-200 ${
                    isPouring
                      ? "animate-bounce scale-110 brightness-125"
                      : "scale-100 brightness-100"
                  }`}
                  style={{
                    filter: isPouring
                      ? "drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))"
                      : "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                  }}
                />
                {/* Animated fuel stream when pouring */}
                {isPouring && (
                  <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
                    <div className="w-1 h-8 bg-gradient-to-b from-emerald-400 via-blue-400 to-transparent animate-pulse opacity-80"></div>
                    <div className="w-0.5 h-6 bg-gradient-to-b from-emerald-300 to-transparent animate-ping ml-0.25"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Fuel Tank - Melhorado e mais visível */}
            <div className="relative flex items-center justify-center">
              <div className="w-56 h-96 bg-gradient-to-b from-slate-800 to-gray-900 border-4 border-slate-500 relative overflow-hidden shadow-2xl rounded-lg ring-2 ring-slate-400/30">
                {/* Good Zone (Yellow) - Zona maior e mais visível */}
                <div
                  className="absolute left-0 right-0 bg-amber-400 bg-opacity-40 border-t-2 border-b-2 border-amber-300 z-19"
                  style={{
                    bottom: `${Math.max(0, targetLevel - GOOD_TOLERANCE)}%`,
                    height: `${GOOD_TOLERANCE * 2}%`,
                  }}
                />

                {/* Perfect Zone (Green) - Zona central mais destacada */}
                <div
                  className="absolute left-0 right-0 bg-emerald-400 bg-opacity-60 border-t-2 border-b-2 border-emerald-300 z-20 animate-pulse"
                  style={{
                    bottom: `${Math.max(0, targetLevel - TOLERANCE)}%`,
                    height: `${TOLERANCE * 2}%`,
                  }}
                />

                {/* Target Line - Mais visível */}
                <div
                  className="absolute left-0 right-0 bg-red-400 h-2 z-30 shadow-lg animate-pulse"
                  style={{ bottom: `${targetLevel}%` }}
                >
                  <div className="absolute inset-0 bg-white opacity-30 animate-ping"></div>
                </div>

                {/* Current Fuel Level - Animação melhorada */}
                <div
                  className={`absolute bottom-0 left-0 right-0 transition-all duration-100 z-10 shadow-inner rounded-b-lg ${
                    hasOverflowed || currentLevel >= 100
                      ? "bg-gradient-to-t from-red-500 to-red-400"
                      : Math.abs(currentLevel - targetLevel) <= TOLERANCE
                      ? "bg-gradient-to-t from-emerald-500 to-green-400 animate-pulse"
                      : Math.abs(currentLevel - targetLevel) <= GOOD_TOLERANCE
                      ? "bg-gradient-to-t from-amber-500 to-yellow-400"
                      : currentLevel > targetLevel + GOOD_TOLERANCE
                      ? "bg-gradient-to-t from-red-500 to-red-400"
                      : refuelInfo.fuelType === "Diesel"
                      ? "bg-gradient-to-t from-orange-600 to-yellow-500"
                      : refuelInfo.fuelType === "Gasolina"
                      ? "bg-gradient-to-t from-yellow-500 to-amber-400"
                      : refuelInfo.fuelType === "Alcool"
                      ? "bg-gradient-to-t from-purple-600 to-indigo-500"
                      : "bg-gradient-to-t from-gray-600 to-gray-400"
                  }`}
                  style={{
                    height: `${currentLevel}%`,
                    boxShadow:
                      "inset 0 0 25px rgba(0,0,0,0.4), 0 0 10px rgba(34, 197, 94, 0.2)",
                  }}
                >
                  {/* Efeito de ondas na superfície do combustível */}
                  {currentLevel > 5 && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-white opacity-30 animate-pulse"></div>
                  )}
                </div>

                {/* Tank reflection effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-5 transform -skew-x-12 pointer-events-none z-40" />
              </div>

              {/* Target Label - Melhorado */}
              <div
                className="absolute left-60 bg-red-500 text-white px-3 py-2 text-sm font-bold rounded-lg shadow-xl animate-bounce"
                style={{ bottom: `${targetLevel}%` }}
              >
                META: {targetLevel.toFixed(0)}%
              </div>

              {/* Zone indicators */}
              <div className="absolute left-60 top-4 space-y-2 text-xs">
                <div className="flex items-center space-x-2 bg-black/50 px-2 py-1 rounded">
                  <div className="w-3 h-3 bg-emerald-400 border border-emerald-300 rounded"></div>
                  <span className="text-emerald-300">PERFEITO</span>
                </div>
                <div className="flex items-center space-x-2 bg-black/50 px-2 py-1 rounded">
                  <div className="w-3 h-3 bg-amber-400 border border-amber-300 rounded"></div>
                  <span className="text-amber-300">BOM</span>
                </div>
              </div>
            </div>

            {/* Progress Display - Melhorado */}
            <div className="mt-8 text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-4 tracking-wider">
                {currentLevel.toFixed(1)}%
              </div>

              {/* Status indicator com feedback visual */}
              <div className="mb-4">
                {isPouring ? (
                  <div className="bg-red-500/20 border-2 border-red-400 rounded-lg px-4 py-2 animate-pulse">
                    <span className="text-red-400 text-sm font-bold">
                      🛑 SOLTE PARA PARAR
                    </span>
                  </div>
                ) : (
                  <div className="bg-green-500/20 border-2 border-green-400 rounded-lg px-4 py-2 hover:bg-green-500/30 transition-all">
                    <span className="text-green-400 text-sm font-bold">
                      ▶️ SEGURE PARA ENCHER
                    </span>
                  </div>
                )}
              </div>

              {/* Feedback em tempo real */}
              {(isPouring || hasOverflowed) && (
                <div className="text-sm font-bold">
                  {hasOverflowed || currentLevel >= 100 ? (
                    <div className="text-red-400 bg-red-500/20 rounded px-3 py-1">
                      💥 DERRAMOU! COMBUSTÍVEL PERDIDO!
                    </div>
                  ) : Math.abs(currentLevel - targetLevel) <= TOLERANCE ? (
                    <div className="text-emerald-400 bg-emerald-500/20 rounded px-3 py-1 animate-pulse">
                      🎯 ZONA PERFEITA!
                    </div>
                  ) : Math.abs(currentLevel - targetLevel) <= GOOD_TOLERANCE ? (
                    <div className="text-amber-400 bg-amber-500/20 rounded px-3 py-1">
                      👍 ZONA BOA!
                    </div>
                  ) : currentLevel > targetLevel + GOOD_TOLERANCE ? (
                    <div className="text-red-400 bg-red-500/20 rounded px-3 py-1">
                      ⚠️ MUITO ALTO!
                    </div>
                  ) : (
                    <div className="text-blue-400 bg-blue-500/20 rounded px-3 py-1">
                      📈 CONTINUE...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Result Screen - Simplified */
          <div className="text-center">
            <div className="bg-gradient-to-br from-slate-700 to-gray-800 border-4 border-slate-600 p-8 max-w-sm rounded-lg shadow-2xl">
              {/* Noozle Image */}
              <div className="mb-4 flex justify-center">
                <img
                  src="/noozle.png"
                  alt="Bico de abastecimento"
                  className="w-12 h-12 opacity-70"
                />
              </div>

              {/* Result Message */}
              <div className="mb-6">
                <div
                  className={`inline-block px-6 py-3 font-bold text-2xl rounded-lg shadow-lg ${
                    result.message === "PERFEITO!"
                      ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                      : result.message === "BOM!"
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black"
                      : result.message === "OK!"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                      : "bg-gradient-to-r from-red-500 to-red-600 text-white"
                  }`}
                >
                  {result.message}
                </div>
              </div>

              {/* Result Detail */}
              <p className="text-lg text-cyan-300 mb-6 font-bold">
                {result.detail}
              </p>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-8 border-2 border-slate-400 text-sm rounded-lg shadow-lg transition-all hover:scale-105"
              >
                CONTINUAR
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
