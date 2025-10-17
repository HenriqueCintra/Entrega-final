// src/hooks/useGameProgressSaver.ts
import { useMutation } from "@tanstack/react-query";
import { GameService } from "../api/gameService";

interface UseGameProgressSaverProps {
  distanceTravelled: React.MutableRefObject<number>;
  autoStopAtNextStation: boolean;
  moneyRef: React.MutableRefObject<number>;
  currentFuelRef: React.MutableRefObject<number>;
  gameTimeRef: React.MutableRefObject<number>;
  gamePaused: React.MutableRefObject<boolean>;
  gameEnded: boolean;
  gameLoaded: boolean;
  showFuelModal: boolean;
}

export const useGameProgressSaver = ({
  distanceTravelled,
  autoStopAtNextStation,
  moneyRef,
  currentFuelRef,
  gameTimeRef,
  gamePaused,
  gameEnded,
  gameLoaded,
  showFuelModal,
}: UseGameProgressSaverProps) => {
  const partidaTickMutation = useMutation({
    mutationFn: (data: {
      distancia_percorrida: number;
      quer_abastecer: boolean;
      saldo?: number;
      combustivel_atual?: number;
      tempo_jogo_segundos?: number;
    }) => GameService.partidaTick(data),
    onSuccess: (tickResult) => {
      console.log("✅ Progresso salvo no backend com sucesso");
    },
    onError: (error) => {
      console.error("❌ Erro ao salvar progresso no backend:", error);
    },
  });

  const saveProgressToBackend = (context: string = "evento") => {
    if (!gamePaused.current && !gameEnded && gameLoaded && !showFuelModal) {
      console.log(`💾 Salvando progresso no backend após ${context}...`);

      partidaTickMutation.mutate({
        distancia_percorrida: distanceTravelled.current,
        quer_abastecer: autoStopAtNextStation,
        saldo: moneyRef.current,
        combustivel_atual: currentFuelRef.current,
        tempo_jogo_segundos: gameTimeRef.current,
      });
    } else {
      console.log(
        `⚠️ Salvamento após ${context} ignorado - jogo pausado/finalizado`
      );
    }
  };

  return {
    saveProgressToBackend,
    isSaving: partidaTickMutation.isPending,
  };
};
