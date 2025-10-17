// src/pages/Game-truck/game.tsx
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import kaboom from "kaboom";

import "./game.css";
import { PartidaData } from "../../types/ranking";
import { Vehicle } from "../../types/vehicle";
import { GameMiniMap } from "./GameMiniMap";
import { MapComponent } from "../mapaRota/MapComponent";
import { PauseMenu } from "../PauseMenu/PauseMenu";
import { GameService } from "../../api/gameService";
import { PixelProgressBar } from "../../components/PixelProgressBar/PixelProgressBar";
import "../../components/PixelProgressBar/PixelProgressBar.css";
import type { GameObj, KaboomCtx } from "kaboom";
import { setupRainSystem } from "@/components/rainSystem";
import { RainEffect } from "@/components/RainEffect";
import { EventResultModal } from "./EventResultModal";
import { QuizModal } from "../../components/QuizModal";
import {
  PerguntaQuiz,
  ResponderQuizPayload,
  RespostaQuizResult,
} from "../../api/gameService";
import RadioToggle from "@/components/RadioToggle";
import TruckRadio from "@/components/TruckRadio";
import { AudioControl } from "../../components/AudioControl";
import { AudioManager } from "../../components/AudioManager";
import { FuelModalContainer } from "../fuel/FuelModalContainer";
import { useGameProgressSaver } from "../../hooks/useGameProgressSaver";

// Interface para eventos vindos da API
interface EventData {
  id: number;
  partida: number;
  evento: {
    id: number;
    nome: string;
    descricao: string;
    tipo: "positivo" | "negativo" | "neutro";
    categoria: string;
    opcoes: Array<{
      id: number;
      descricao: string;
      efeitos: any;
    }>;
  };
  momento: string;
  ordem: number;
  opcao_escolhida: null;
  posto_info?: any;
}

export function GameScene() {
  const [isMainEventActive, setIsMainEventActive] = useState(false);
  const quizTimerRef = useRef(0);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<PerguntaQuiz | null>(null);
  const isQuizActiveRef = useRef(false);
  const isMainEventActiveRef = useRef(false);

  const activeGameIdRef = useRef<number | null>(null);
  const isFinishing = useRef(false);

  const [showFuelModal, setShowFuelModal] = useState(false);

  const [autoStopAtNextStation, setAutoStopAtNextStation] = useState(false);
  const triggeredGasStations = useRef<number[]>([]);

  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gamePaused = useRef(false);
  const collidedObstacle = useRef<GameObj | null>(null);
  const destroyRef = useRef<((obj: GameObj) => void) | null>(null);

  const [activeEvent, setActiveEvent] = useState<EventData | null>(null);
  const [isResponding, setIsResponding] = useState(false);
  const [activeGameId, setActiveGameId] = useState<number | null>(null);

  const processingEvent = useRef(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [showEndMessage, setShowEndMessage] = useState(false);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const gameInitialized = useRef(false);
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);

  const distanceTravelled = useRef(0);

  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const pathProgressRef = useRef(0);
  const currentPathIndexRef = useRef(0);
  const gameSpeedMultiplier = useRef(1);
  const obstacleTimerRef = useRef(0);
  const collisionCooldownRef = useRef(0);
  const obstacleSystemLockedRef = useRef(false);
  const handleResizeRef = useRef<(() => void) | null>(null);
  const [isRadioOpen, setIsRadioOpen] = useState(false);

  const backgroundTransitionsDone = useRef<number[]>([]);
  const quizMilestonesTriggered = useRef<number[]>([]);

  const [speedLevel, setSpeedLevel] = useState(1);
  const speedMultiplierRef = useRef(1);
  const MAX_SPEED_LEVEL = 3;

  const [gameTime, setGameTime] = useState(0);
  const FATOR_ACELERACAO_TEMPO = 24;
  const lastFrameTimeRef = useRef(performance.now());
  const tickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [finalGameResults, setFinalGameResults] = useState<PartidaData | null>(
    null
  );
  const [currentFuel, setCurrentFuel] = useState<number>(
    location.state?.selectedVehicle?.currentFuel || 0
  );
  const [totalDistance, setTotalDistance] = useState<number>(500);

  const [showMapModal, setShowMapModal] = useState(false);

  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [resultModalContent, setResultModalContent] = useState({
    title: "",
    description: "",
    consequences: [] as any[],
  });

  const currentBg = useRef<"cidade" | "terra">("cidade");
  const nextBg = useRef<"cidade" | "terra" | null>(null);
  const backgroundSwitchTimer = useRef(0);
  const transitionProgress = useRef(0);
  const isTransitioning = useRef(false);
  const transitionCooldown = useRef(0);
  const TRANSITION_DURATION = 5;
  const COOLDOWN_DURATION = 0.1;

  const ZOOM_CONFIG = {
    MAX_ZOOM: 1.5,
    LEAD_IN_TIME: 0.5,
    LEAD_OUT_TIME: 1.0,
  };
  const ZOOM_TOTAL_DURATION =
    ZOOM_CONFIG.LEAD_IN_TIME + TRANSITION_DURATION + ZOOM_CONFIG.LEAD_OUT_TIME;

  const zoomEffect = useRef({
    isActive: false,
    progress: 0,
    duration: ZOOM_TOTAL_DURATION,
    maxZoom: ZOOM_CONFIG.MAX_ZOOM,
    originalZoom: 1.0,
  });

  const rainCycleTimerRef = useRef<number>(0);
  const rainControllerRef = useRef<any>(null);
  const isRainActiveRef = useRef(false);

  const [vehicle] = useState<Vehicle>(() => {
    if (location.state && location.state.selectedVehicle) {
      return location.state.selectedVehicle;
    }
    navigate("/select-vehicle");
    return {
      id: "default",
      name: "Caminhão Padrão",
      capacity: 1000,
      consumption: { asphalt: 3, dirt: 2 },
      image: "/assets/truck.png",
      maxCapacity: 100,
      currentFuel: 0,
      cost: 1000,
    };
  });

  const [money, setMoney] = useState(() => {
    const money = location.state?.availableMoney;
    return money !== undefined ? money : 1000;
  });

  // ✅✅✅ INÍCIO DA CORREÇÃO: REFS PARA EVITAR STALE STATE ✅✅✅
  const moneyRef = useRef(money);
  const currentFuelRef = useRef(currentFuel);
  const gameTimeRef = useRef(gameTime);

  useEffect(() => {
    moneyRef.current = money;
  }, [money]);
  useEffect(() => {
    currentFuelRef.current = currentFuel;
  }, [currentFuel]);
  useEffect(() => {
    gameTimeRef.current = gameTime;
  }, [gameTime]);
  // ✅✅✅ FIM DA CORREÇÃO ✅✅✅

  // Hook para salvamento de progresso
  const { saveProgressToBackend } = useGameProgressSaver({
    distanceTravelled,
    autoStopAtNextStation,
    moneyRef,
    currentFuelRef,
    gameTimeRef,
    gamePaused,
    gameEnded,
    gameLoaded,
    showFuelModal,
  });

  const [selectedRoute] = useState(() => {
    const route = location.state?.selectedRoute;
    return route || null;
  });

  useEffect(() => {
    console.log("🎮 GameScene montado com estado:", {
      vehicle: location.state?.selectedVehicle?.name,
      route: location.state?.selectedRoute?.name,
      hasPathCoordinates: !!location.state?.selectedRoute?.pathCoordinates,
      pathCoordinatesLength:
        location.state?.selectedRoute?.pathCoordinates?.length || 0,
      money: location.state?.availableMoney,
      savedProgress: !!location.state?.savedProgress,
    });
  }, []);

  const createGameMutation = useMutation({
    mutationFn: (gameData: {
      mapa: number;
      rota: number;
      veiculo: number;
      saldo_inicial?: number;
      combustivel_inicial?: number;
      quantidade_carga_inicial?: number;
      revisao_preventiva_feita?: boolean;
    }) => GameService.createGame(gameData),
    onSuccess: (partida) => {
      setActiveGameId(partida.id);
      activeGameIdRef.current = partida.id;
      setMoney(partida.saldo);
      setCurrentFuel(partida.combustivel_atual);
      localStorage.setItem("activeGameId", partida.id.toString());
    },
    onError: (error) => {
      console.error("❌ Erro ao criar partida:", error);
      alert("Não foi possível iniciar o jogo. Tente novamente.");
      navigate("/routes");
    },
  });

  const partidaTickMutation = useMutation({
    mutationFn: (data: {
      distancia_percorrida: number;
      quer_abastecer: boolean;
      saldo?: number;
      combustivel_atual?: number;
      tempo_jogo_segundos?: number;
    }) => GameService.partidaTick(data),
    onSuccess: (tickResult) => {
      setMoney(tickResult.saldo);
      setCurrentFuel(tickResult.combustivel_atual);

      if (tickResult.progresso !== undefined) {
        setProgress(tickResult.progresso);
        progressRef.current = tickResult.progresso;
      }

      if (tickResult.combustivel_atual <= 0) {
        gamePaused.current = true;
        setGameEnded(true);
        const tempoFinal = Math.max(0, gameTimeRef.current);
        syncGameMutation.mutate({ tempo_decorrido_segundos: tempoFinal });
        return;
      }

      if (tickResult.saldo <= 0) {
        gamePaused.current = true;
        setGameEnded(true);
        const tempoFinal = Math.max(0, gameTimeRef.current);
        syncGameMutation.mutate({ tempo_decorrido_segundos: tempoFinal });
        return;
      }

      if (tickResult.evento_pendente && !activeEvent && !showPopup) {
        if (isQuizActiveRef.current) {
          handleCloseQuiz();
        }

        const eventoPendente = tickResult.evento_pendente;

        if (eventoPendente.evento.categoria === "abastecimento") {
          setAutoStopAtNextStation(false);
        } else {
          setIsMainEventActive(true);
        }

        const eventData: EventData = {
          id: eventoPendente.id,
          partida: activeGameIdRef.current || 0,
          evento: eventoPendente.evento,
          momento: eventoPendente.momento,
          ordem: eventoPendente.ordem,
          opcao_escolhida: eventoPendente.opcao_escolhida,
          posto_info: eventoPendente.posto_info,
        };

        setActiveEvent(eventData);
        setShowPopup(true);
        gamePaused.current = true;
        processingEvent.current = true;
      }
    },
    onError: (error) => {
      console.error("Erro no tick:", error);
    },
  });

  const abastecerMutation = useMutation({
    mutationFn: GameService.processarAbastecimento,
    onSuccess: (partidaAtualizada) => {
      setMoney(partidaAtualizada.saldo);
      setCurrentFuel(partidaAtualizada.combustivel_atual);
      setShowFuelModal(false);
      gamePaused.current = false;

      // Salvar progresso imediatamente após abastecimento
      saveProgressToBackend("abastecimento");
      console.log("💾 Progresso salvo no backend após abastecimento.");
    },
    onError: (error) => {
      console.error("❌ Erro no abastecimento:", error);
      alert("Erro ao processar abastecimento. Tente novamente.");
      setShowFuelModal(false);
      gamePaused.current = false;
    },
  });

  const handleTriggerQuiz = async () => {
    try {
      const quizQuestion = await GameService.sortearQuiz();
      if (quizQuestion && !isMainEventActiveRef.current) {
        setCurrentQuiz(quizQuestion);
        setIsQuizActive(true);
      } else if (isMainEventActiveRef.current) {
        console.log(
          "❓ Quiz da API foi descartado porque um evento principal se tornou ativo."
        );
      }
    } catch (error) {
      console.error("Não foi possível carregar uma pergunta do quiz.", error);
    }
  };

  // ✅✅✅ INÍCIO DA CORREÇÃO: Salva o progresso após responder o quiz ✅✅✅
  const handleAnswerSubmit = async (
    payload: ResponderQuizPayload
  ): Promise<RespostaQuizResult> => {
    try {
      const result = await GameService.responderQuiz(payload);
      if (result.saldo_atual !== undefined) {
        setMoney(result.saldo_atual);
      }

      // Força o salvamento do estado atual no backend usando o hook
      saveProgressToBackend("resposta do quiz");
      console.log("💾 Progresso salvo no backend após resposta do quiz.");

      return result;
    } catch (error) {
      console.error("Erro ao submeter resposta do quiz", error);
      return { correta: false, detail: "Erro ao conectar com o servidor." };
    }
  };
  // ✅✅✅ FIM DA CORREÇÃO ✅✅✅

  const handleCloseQuiz = () => {
    setIsQuizActive(false);
    setCurrentQuiz(null);
  };

  const handleInitiateRefuel = (gasStation: any) => {
    setShowFuelModal(true);
  };

  const handleFuelComplete = (newMoney: number, newFuel: number) => {
    const custoTotal = money - newMoney;
    const litrosAdicionados = newFuel - currentFuel;

    abastecerMutation.mutate({
      custo: custoTotal,
      litros: litrosAdicionados,
    });
  };

  const handleFuelCancel = () => {
    setShowFuelModal(false);
    gamePaused.current = false;
  };

  const respondToEventMutation = useMutation({
    mutationFn: (data: { optionId: number; distancia: number }) =>
      GameService.respondToEvent(data.optionId, data.distancia),
    onSuccess: (data) => {
      const updatedPartida = data.partida;
      setMoney(updatedPartida.saldo);
      setCurrentFuel(updatedPartida.combustivel_atual);

      if (updatedPartida.tempo_jogo !== undefined) {
        const tempoSegundos = Math.round(updatedPartida.tempo_jogo * 60);
        setGameTime(tempoSegundos);
      }

      if (
        updatedPartida.distancia_percorrida !== undefined &&
        totalDistance > 0
      ) {
        distanceTravelled.current = updatedPartida.distancia_percorrida;
        const novoProgresso = Math.min(
          100,
          (updatedPartida.distancia_percorrida / totalDistance) * 100
        );
        progressRef.current = novoProgresso;
        setProgress(novoProgresso);
      }

      setResultModalContent({
        title: activeEvent?.evento.nome || "Evento Concluído",
        description: data.detail,
        consequences: [],
      });
      setIsResultModalOpen(true);

      // Salvar progresso imediatamente após processar evento
      saveProgressToBackend("resposta de evento");
      console.log("💾 Progresso salvo no backend após resposta de evento.");

      obstacleTimerRef.current = -8;
      collisionCooldownRef.current = 3.0;

      setTimeout(() => {
        obstacleSystemLockedRef.current = false;
      }, 8000);
    },
    onError: (error) => {
      console.error("❌ Erro ao responder evento:", error);
      alert("Erro ao processar sua resposta. O jogo continuará.");
      setIsResponding(false);
      gamePaused.current = false;
      processingEvent.current = false;
    },
  });

  const syncGameMutation = useMutation({
    mutationFn: (progressData: { tempo_decorrido_segundos: number }) => {
      return GameService.syncGameProgress(progressData);
    },
    onSuccess: (updatedPartida: PartidaData) => {
      localStorage.removeItem("savedGameProgress");
      if (updatedPartida.status === "concluido") {
        setFinalGameResults(updatedPartida);
        setGameEnded(true);
        setShowEndMessage(true);
        gamePaused.current = true;
        localStorage.removeItem("activeGameId");
      }
    },
    onError: (error) => {
      console.error("❌ Erro ao sincronizar jogo:", error);
      alert("Houve um erro ao finalizar a partida. Tente novamente.");
    },
  });

  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  };

  const applyZoomEffect = (k: any, deltaTime: number) => {
    if (!zoomEffect.current.isActive) return;

    zoomEffect.current.progress += deltaTime / zoomEffect.current.duration;
    let currentZoom = zoomEffect.current.originalZoom;

    if (zoomEffect.current.progress >= 1.0) {
      zoomEffect.current.isActive = false;
      zoomEffect.current.progress = 0;
      k.camScale(k.vec2(1.0));
      k.camPos(k.center());
      return;
    }

    if (zoomEffect.current.progress < 0.5) {
      const t = zoomEffect.current.progress / 0.5;
      currentZoom =
        zoomEffect.current.originalZoom +
        (zoomEffect.current.maxZoom - zoomEffect.current.originalZoom) *
          easeInOutCubic(t);
    } else {
      const t = (zoomEffect.current.progress - 0.5) / 0.5;
      currentZoom =
        zoomEffect.current.maxZoom -
        (zoomEffect.current.maxZoom - zoomEffect.current.originalZoom) *
          easeInOutCubic(t);
    }

    k.camScale(k.vec2(currentZoom));
    const centerX = k.width() / 2;
    const centerY = k.height() / 2;
    const yOffset = centerY * 0.5 * (currentZoom - 1);
    const xOffset = centerX * -0.9 * (currentZoom - 1);
    k.camPos(centerX + xOffset, centerY + yOffset);
  };

  const startZoomEffect = () => {
    zoomEffect.current.isActive = true;
    zoomEffect.current.progress = 0;
  };

  const updateBackgroundSystem = (
    k: any,
    deltaTime: number,
    moveAmount: number
  ) => {
    applyZoomEffect(k, deltaTime);
    k.get("bg_cidade").forEach((bg: any) => bg.move(moveAmount, 0));
    k.get("bg_terra").forEach((bg: any) => bg.move(moveAmount, 0));

    if (transitionCooldown.current > 0) {
      transitionCooldown.current -= deltaTime;
    }
    if (
      !isTransitioning.current &&
      !nextBg.current &&
      transitionProgress.current === 0 &&
      transitionCooldown.current <= 0
    ) {
      k.get(`bg_${currentBg.current}`).forEach((bg: any) => {
        if (bg.opacity !== 1) bg.opacity = 1;
      });
      const otherBg = currentBg.current === "cidade" ? "terra" : "cidade";
      k.get(`bg_${otherBg}`).forEach((bg: any) => {
        if (bg.opacity !== 0) bg.opacity = 0;
      });
    }

    const bgWidth = 2048 * Math.max(k.width() / 2048, k.height() / 762);
    const cidadeBackgrounds = k.get("bg_cidade");
    cidadeBackgrounds.forEach((bg: any, index: number) => {
      if (bg.pos.x + bgWidth <= 0) {
        const otherIndex = index === 0 ? 1 : 0;
        bg.pos.x = cidadeBackgrounds[otherIndex].pos.x + bgWidth;
      }
    });

    const terraBackgrounds = k.get("bg_terra");
    terraBackgrounds.forEach((bg: any, index: number) => {
      if (bg.pos.x + bgWidth <= 0) {
        const otherIndex = index === 0 ? 1 : 0;
        bg.pos.x = terraBackgrounds[otherIndex].pos.x + bgWidth;
      }
    });

    if (isTransitioning.current && nextBg.current) {
      transitionProgress.current += deltaTime / TRANSITION_DURATION;

      if (transitionProgress.current >= 1) {
        transitionProgress.current = 0;
        isTransitioning.current = false;

        const newCurrentBg = nextBg.current;
        k.get(`bg_${newCurrentBg}`).forEach((bg: any) => {
          bg.opacity = 1;
        });
        k.get(`bg_${currentBg.current}`).forEach((bg: any) => {
          bg.opacity = 0;
        });

        currentBg.current = newCurrentBg;
        nextBg.current = null;
        transitionCooldown.current = COOLDOWN_DURATION;
      }

      if (isTransitioning.current && nextBg.current) {
        const easedProgress = easeInOutCubic(transitionProgress.current);
        k.get(`bg_${currentBg.current}`).forEach((bg: any) => {
          bg.opacity = 1 - easedProgress;
        });
        k.get(`bg_${nextBg.current}`).forEach((bg: any) => {
          bg.opacity = easedProgress;
        });
      }
    }

    const progress = progressRef.current;
    const transitionMilestones = [25, 50, 75];

    for (const milestone of transitionMilestones) {
      if (
        progress >= milestone &&
        !backgroundTransitionsDone.current.includes(milestone)
      ) {
        if (
          !isTransitioning.current &&
          !nextBg.current &&
          transitionCooldown.current <= 0
        ) {
          backgroundTransitionsDone.current.push(milestone);
          startZoomEffect();
          k.wait(ZOOM_CONFIG.LEAD_IN_TIME, () => {
            const bgWidth = 2048 * Math.max(k.width() / 2048, k.height() / 762);
            const targetBg =
              currentBg.current === "cidade" ? "terra" : "cidade";
            nextBg.current = targetBg;

            const bgToActivate = k.get(`bg_${targetBg}`);
            if (bgToActivate.length >= 2) {
              bgToActivate[0].pos.x = 0;
              bgToActivate[1].pos.x = bgWidth;
            }
            isTransitioning.current = true;
            transitionProgress.current = 0;
          });
          break;
        }
      }
    }
  };

  const handleSpeedUp = () => {
    if (gamePaused.current || showPopup) return;

    setSpeedLevel((prevLevel) => {
      const nextLevel = prevLevel >= MAX_SPEED_LEVEL ? 1 : prevLevel + 1;
      let newMultiplier = 1;
      if (nextLevel === 2) newMultiplier = 1.5;
      if (nextLevel === 3) newMultiplier = 2.0;
      speedMultiplierRef.current = newMultiplier;
      return nextLevel;
    });
  };

  const togglePause = () => {
    const nextPausedState = !gamePaused.current;
    gamePaused.current = nextPausedState;
    setIsPaused(nextPausedState);
  };

  const handleResume = async () => {
    try {
      await GameService.resumeGame();
      togglePause();
    } catch (error) {
      console.error("❌ Erro ao retomar jogo no backend:", error);
      togglePause();
    }
  };

  const handleRestart = () => {
    window.location.reload();
  };

  const handleGoToProfile = async () => {
    const gameProgress = {
      vehicle,
      money,
      selectedRoute,
      currentFuel,
      progress: (distanceTravelled.current / totalDistance) * 100,
      currentPathIndex,
      pathProgress: pathProgressRef.current,
      gameTime,
      timestamp: Date.now(),
      activeGameId: activeGameIdRef.current,
      distanceTravelled: distanceTravelled.current,
    };
    localStorage.setItem("savedGameProgress", JSON.stringify(gameProgress));

    if (!isPaused) {
      try {
        await GameService.pauseGame();
      } catch (error) {
        console.error("❌ Erro ao pausar jogo:", error);
      }
    }

    if (activeGameIdRef.current) {
      localStorage.setItem("activeGameId", activeGameIdRef.current.toString());
    }
    navigate("/perfil");
  };

  const handleSaveAndPause = async () => {
    const gameProgress = {
      vehicle,
      money,
      selectedRoute,
      currentFuel,
      progress: (distanceTravelled.current / totalDistance) * 100,
      currentPathIndex,
      pathProgress: pathProgressRef.current,
      gameTime,
      timestamp: Date.now(),
      activeGameId: activeGameIdRef.current,
      distanceTravelled: distanceTravelled.current,
    };
    localStorage.setItem("savedGameProgress", JSON.stringify(gameProgress));

    try {
      await GameService.pauseGame();
    } catch (error) {
      console.error("❌ Erro ao pausar jogo no backend:", error);
    }
    togglePause();
  };

  const handleOptionClick = (optionId: number) => {
    if (isResponding) return;
    if (!activeEvent) return;

    if (activeEvent.evento.categoria === "abastecimento") {
      if (optionId === -1) {
        handleInitiateRefuel(activeEvent.posto_info || {});
      } else {
        gamePaused.current = false;
      }
      setShowPopup(false);
      setActiveEvent(null);
      processingEvent.current = false;
      return;
    }

    setIsResponding(true);
    respondToEventMutation.mutate({
      optionId,
      distancia: distanceTravelled.current,
    });
  };

  const initializeGame = (
    initialVehicle: Vehicle,
    initialMoney: number,
    initialRoute: any,
    restoredState?: any
  ) => {
    if (initialRoute) {
      const routeDistance =
        initialRoute.actualDistance || initialRoute.distance;
      setTotalDistance(routeDistance);

      const estimatedHours =
        initialRoute.estimatedTimeHours || initialRoute.estimatedTime || 7.5;
      const targetGameDurationMinutes = 20;
      gameSpeedMultiplier.current =
        (estimatedHours * 60) / targetGameDurationMinutes;
    }

    if (!initialVehicle || !initialVehicle.name) return;
    if (!canvasRef.current || !document.contains(canvasRef.current)) {
      setTimeout(
        () =>
          initializeGame(
            initialVehicle,
            initialMoney,
            initialRoute,
            restoredState
          ),
        100
      );
      return;
    }
    if ((window as any).__kaboom_initiated__) {
      try {
        const k = (window as any).k;
        if (k?.destroy) k.destroy();
        (window as any).__kaboom_initiated__ = false;
        (window as any).k = null;
      } catch (error) {
        console.error("❌ Erro ao limpar Kaboom:", error);
      }
    }

    if (restoredState) {
      const routeDistance =
        initialRoute?.actualDistance || initialRoute?.distance || totalDistance;
      distanceTravelled.current = restoredState.distanceTravelled || 0;
      progressRef.current =
        routeDistance > 0
          ? (distanceTravelled.current / routeDistance) * 100
          : 0;
      setGameTime(restoredState.gameTime || 0);
      triggeredGasStations.current = restoredState.triggeredGasStations || [];
      activeGameIdRef.current = restoredState.activeGameId;
      setProgress(progressRef.current);
      setMoney(initialMoney);
      setCurrentFuel(initialVehicle.currentFuel);
    } else {
      distanceTravelled.current = 0;
      progressRef.current = 0;
      setProgress(0);
    }

    handleResizeRef.current = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    try {
      setGameLoaded(false);
      setLoadingError(null);

      const testContext =
        canvasRef.current!.getContext("webgl") ||
        canvasRef.current!.getContext("experimental-webgl");
      if (!testContext) throw new Error("WebGL não suportado neste navegador");

      const k = kaboom({
        canvas: canvasRef.current!,
        width: window.innerWidth,
        height: window.innerHeight,
        background: [0, 0, 0],
        crisp: true,
      });

      window.addEventListener("resize", handleResizeRef.current!);
      (window as any).__kaboom_initiated__ = true;
      (window as any).k = k;

      const {
        loadSprite,
        scene,
        go,
        add,
        sprite,
        pos,
        area,
        body,
        isKeyDown,
        width,
        height,
        dt,
        onUpdate,
        z,
        scale,
        destroy,
        loop,
        rand,
        choose,
        move,
        tween,
        easings,
        LEFT,
        RIGHT,
        get,
        wait,
        opacity,
      } = k;

      k.loadSound("rain", "audio/rainSound.mp3");
      destroyRef.current = destroy;

      const isSpriteSheet = initialVehicle.spriteSheet !== undefined;

      try {
        loadSprite("background_cidade", "/assets/background-cidade.png");
        loadSprite("background_terra", "/assets/background-terra.png");

        const vehicleImageUrl = getVehicleImageUrl(
          initialVehicle.spriteSheet || initialVehicle.image
        );
        if (isSpriteSheet) {
          loadSprite("car", vehicleImageUrl, {
            sliceX: 2,
            sliceY: 1,
            anims: { run: { from: 0, to: 1, loop: true, speed: 8 } },
          });
        } else {
          loadSprite("car", vehicleImageUrl);
        }

        loadSprite("carro_1", "/assets/carro_trafego_1.png");
        loadSprite("carro_2", "/assets/carro_trafego_2.png");
        loadSprite("carro_3", "/assets/carro_trafego_3.png");
        loadSprite("carro_4", "/assets/carro_trafego_4.png");
        loadSprite("carro_5", "/assets/carro_trafego_5.png");
        loadSprite("carro_6", "/assets/carro_trafego_6.png");
        loadSprite("carro_7", "/assets/carro_trafego_7.png");
        loadSprite("carro_8", "/assets/carro_trafego_8.png");
        loadSprite("moto_1", "/assets/moto_trafego_1.png");
      } catch (error) {
        console.error("Erro ao carregar sprites:", error);
      }

      scene("main", () => {
        const speed = 5000;
        const bgScale = Math.max(width() / 2048, height() / 762);
        const bgWidth = 2048 * bgScale;
        const bgOffsetY = -height() * 0.05;

        add([
          sprite("background_cidade"),
          pos(0, bgOffsetY),
          scale(bgScale),
          z(0),
          "bg_cidade",
          opacity(1),
        ]);
        add([
          sprite("background_cidade"),
          pos(bgWidth, bgOffsetY),
          scale(bgScale),
          z(0),
          "bg_cidade",
          opacity(1),
        ]);
        add([
          sprite("background_terra"),
          pos(0, bgOffsetY),
          scale(bgScale),
          z(0),
          "bg_terra",
          opacity(0),
        ]);
        add([
          sprite("background_terra"),
          pos(bgWidth, bgOffsetY),
          scale(bgScale),
          z(0),
          "bg_terra",
          opacity(0),
        ]);

        const roadYPosition = height() * 0.48;
        const scaleFactor = (width() / 600) * 0.3;
        const carSprite = isSpriteSheet
          ? sprite("car", { anim: "run" })
          : sprite("car");
        const car = add([
          carSprite,
          pos(width() * 0.08, roadYPosition),
          area(),
          body(),
          z(2),
          scale(scaleFactor),
        ]);
        const lane_contramao = height() * 0.6;
        const lane_mesmo_sentido = height() * 0.68;
        const trafficCarSprites = [
          "carro_1",
          "carro_2",
          "carro_3",
          "carro_4",
          "carro_5",
          "carro_6",
          "carro_7",
          "carro_8",
          "moto_1",
        ];

        loop(rand(4, 7), () => {
          if (gamePaused.current || get("traffic_car").length > 0) return;
          const carSprite = choose(trafficCarSprites);
          const carType = choose(["ultrapassagem", "contramao"]);

          if (carType === "contramao") {
            add([
              sprite(carSprite, { flipX: true }),
              pos(width() + 150, lane_contramao),
              scale(scaleFactor * 1.6),
              move(LEFT, speed * rand(0.2, 0.3)),
              "traffic_car",
              z(1),
              { behavior: "contramao" },
            ]);
          } else {
            add([
              sprite(carSprite, { flipX: false }),
              pos(-250, lane_contramao),
              scale(scaleFactor * 1.7),
              move(RIGHT, speed * rand(0.05, 0.1)),
              "traffic_car",
              z(1),
              { isChangingLane: false, behavior: "ultrapassagem" },
            ]);
          }
        });

        rainControllerRef.current = setupRainSystem(k);

        onUpdate("traffic_car", (trafficCar) => {
          if (
            trafficCar.behavior === "ultrapassagem" &&
            !trafficCar.isChangingLane &&
            trafficCar.pos.x > car.pos.x + car.width - 150
          ) {
            trafficCar.isChangingLane = true;
            tween(
              trafficCar.pos.y,
              lane_mesmo_sentido,
              0.9,
              (newY) => (trafficCar.pos.y = newY),
              easings.easeInOutQuad
            );
          }
          if (
            trafficCar.pos.x < -trafficCar.width ||
            trafficCar.pos.x > width() + trafficCar.width
          ) {
            destroy(trafficCar);
          }
        });

        onUpdate(() => {
          if (gamePaused.current || gameEnded) return;
          const deltaTime = dt();
          const progress = progressRef.current;
          const quizMilestones = [10, 20, 30, 40, 50, 60, 70, 80, 90];

          for (const milestone of quizMilestones) {
            if (
              progress >= milestone &&
              !quizMilestonesTriggered.current.includes(milestone)
            ) {
              quizMilestonesTriggered.current.push(milestone);
              if (!isMainEventActive && !isQuizActiveRef.current) {
                handleTriggerQuiz();
              }
              break;
            }
          }

          if (checkGameOver()) return;

          if (collisionCooldownRef.current > 0) {
            collisionCooldownRef.current = Math.max(
              0,
              collisionCooldownRef.current - deltaTime
            );
          }

          const distanceThisFrame =
            0.025 *
            speedMultiplierRef.current *
            deltaTime *
            gameSpeedMultiplier.current;
          distanceTravelled.current += distanceThisFrame;

          const newProgress = Math.min(
            100,
            (distanceTravelled.current / totalDistance) * 100
          );
          if (Math.abs(newProgress - progress) > 0.05) {
            progressRef.current = newProgress;
            setProgress(newProgress);
          }

          const moveAmount = -speed * speedMultiplierRef.current * deltaTime;
          updateBackgroundSystem(k, deltaTime, moveAmount);
        });
      });
      go("main");
      setCurrentPathIndex(0);
      currentPathIndexRef.current = 0;
      pathProgressRef.current = 0;
      obstacleTimerRef.current = 0;
      gamePaused.current = false;
      setGameLoaded(true);
    } catch (error) {
      console.error("Erro ao inicializar o jogo:", error);
      setLoadingError(`Erro ao carregar o jogo: ${error}`);
      setGameLoaded(false);
      (window as any).__kaboom_initiated__ = false;
    }
  };

  useEffect(() => {
    if (gameInitialized.current) return;
    gameInitialized.current = true;

    const {
      selectedVehicle,
      selectedRoute: route,
      savedProgress,
      cargoAmount,
      selectedChallenge,
      revisaoFeita,
    } = location.state || {};

    if (
      savedProgress &&
      savedProgress.activeGameId &&
      selectedVehicle &&
      route
    ) {
      setActiveGameId(savedProgress.activeGameId);
      activeGameIdRef.current = savedProgress.activeGameId;
      localStorage.setItem(
        "activeGameId",
        savedProgress.activeGameId.toString()
      );
      const restoredMoney = location.state?.availableMoney || money;

      GameService.resumeGame()
        .then(() => GameService.getActiveGame())
        .then((partidaAtualizada) => {
          const progressoAtualizado = {
            ...savedProgress,
            distanceTravelled: partidaAtualizada.distancia_percorrida,
            progress: partidaAtualizada.progresso || savedProgress.progress,
            gameTime:
              partidaAtualizada.tempo_jogo_segundos || savedProgress.gameTime,
            currentFuel: partidaAtualizada.combustivel_atual,
          };
          const vehicleAtualizado = {
            ...selectedVehicle,
            currentFuel: partidaAtualizada.combustivel_atual,
          };
          initializeGame(
            vehicleAtualizado,
            partidaAtualizada.saldo,
            route,
            progressoAtualizado
          );
        })
        .catch((error) => {
          console.error("❌ Erro ao retomar partida:", error);
          initializeGame(selectedVehicle, restoredMoney, route, savedProgress);
        });
      return;
    }

    if (!selectedVehicle || !route?.id || !route?.mapaId) {
      navigate("/routes");
      return;
    }

    let quantidade_carga_inicial = undefined;
    if (cargoAmount && selectedChallenge?.peso_carga_kg) {
      quantidade_carga_inicial = Math.round(
        selectedChallenge.peso_carga_kg * (cargoAmount / 100)
      );
    }
    localStorage.removeItem("savedGameProgress");

    createGameMutation
      .mutateAsync({
        mapa: route.mapaId,
        rota: route.id,
        veiculo: parseInt(selectedVehicle.id, 10) || 1,
        saldo_inicial: money,
        combustivel_inicial: vehicle.currentFuel,
        quantidade_carga_inicial: quantidade_carga_inicial,
        revisao_preventiva_feita: !!revisaoFeita,
      })
      .then(() => {
        initializeGame(vehicle, money, route);
      })
      .catch((error) => {
        console.error(
          "❌ Falha crítica na criação da partida, não inicializando Kaboom",
          error
        );
      });

    return () => {
      if ((window as any).__kaboom_initiated__) {
        try {
          const k = (window as any).k;
          if (k?.destroy) k.destroy();
          (window as any).__kaboom_initiated__ = false;
          (window as any).k = null;
        } catch (error) {
          console.error("❌ Erro ao limpar Kaboom:", error);
        }
      }
      if (handleResizeRef.current) {
        window.removeEventListener("resize", handleResizeRef.current);
      }
      gameInitialized.current = false;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!activeEvent && !gameEnded) {
          togglePause();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeEvent, gameEnded]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (gameLoaded && !gameEnded && activeGameIdRef.current) {
        const gameProgress = {
          vehicle,
          money,
          selectedRoute,
          currentFuel,
          progress,
          currentPathIndex,
          pathProgress: pathProgressRef.current,
          gameTime,
          timestamp: Date.now(),
          activeGameId: activeGameIdRef.current,
          distanceTravelled: distanceTravelled.current,
        };
        localStorage.setItem("savedGameProgress", JSON.stringify(gameProgress));
        if (activeGameIdRef.current) {
          localStorage.setItem(
            "activeGameId",
            activeGameIdRef.current.toString()
          );
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [
    gameLoaded,
    gameEnded,
    vehicle,
    money,
    selectedRoute,
    currentFuel,
    progress,
    currentPathIndex,
    gameTime,
  ]);

  // Este useEffect agora apenas salva o progresso no localStorage para segurança extra.
  // O salvamento principal e confiável é feito via 'tick' para o backend.
  useEffect(() => {
    if (!gameLoaded || gameEnded || !activeGameIdRef.current) return;
    const saveInterval = setInterval(() => {
      const gameProgress = {
        vehicle,
        money,
        selectedRoute,
        currentFuel,
        progress,
        currentPathIndex,
        pathProgress: pathProgressRef.current,
        gameTime,
        timestamp: Date.now(),
        activeGameId: activeGameIdRef.current,
        distanceTravelled: distanceTravelled.current,
      };
      localStorage.setItem("savedGameProgress", JSON.stringify(gameProgress));
      if (activeGameIdRef.current) {
        localStorage.setItem(
          "activeGameId",
          activeGameIdRef.current.toString()
        );
      }
    }, 5000); // Salva localmente a cada 5 segundos
    return () => clearInterval(saveInterval);
  }, [
    gameLoaded,
    gameEnded,
    vehicle,
    money,
    selectedRoute,
    currentFuel,
    progress,
    currentPathIndex,
    gameTime,
  ]);

  const [gasoline, setGasoline] = useState(() => {
    const fuelPercent = (currentFuel / vehicle.maxCapacity) * 100;
    return fuelPercent;
  });

  useEffect(() => {
    const newGasolinePercent = (currentFuel / vehicle.maxCapacity) * 100;
    setGasoline(newGasolinePercent);
  }, [currentFuel, vehicle.maxCapacity]);

  useEffect(() => {
    if (!vehicle || !vehicle.name || !vehicle.image) {
      setTimeout(() => {
        navigate("/select-vehicle");
      }, 1000);
    }
  }, []);

  // ✅✅✅ INÍCIO DA CORREÇÃO: Sistema de tick periódico que salva o progresso completo no backend ✅✅✅
  useEffect(() => {
    tickTimerRef.current = setInterval(() => {
      if (
        !gamePaused.current &&
        !gameEnded &&
        gameLoaded &&
        activeGameIdRef.current &&
        !showFuelModal
      ) {
        partidaTickMutation.mutate({
          distancia_percorrida: distanceTravelled.current,
          quer_abastecer: autoStopAtNextStation,
          // Enviando dados atualizados usando refs para evitar stale state
          saldo: moneyRef.current,
          combustivel_atual: currentFuelRef.current,
          tempo_jogo_segundos: gameTimeRef.current,
        });
      }
    }, 2000); // Salva a cada 2 segundos

    return () => {
      if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    };
    // Dependências otimizadas para não recriar o intervalo desnecessariamente
  }, [gameEnded, gameLoaded, autoStopAtNextStation, showFuelModal]);
  // ✅✅✅ FIM DA CORREÇÃO ✅✅✅

  useEffect(() => {
    let animationFrameId: number;
    const animateClock = (now: number) => {
      if (!gamePaused.current && !gameEnded) {
        const deltaTime = (now - lastFrameTimeRef.current) / 1000;
        setGameTime(
          (prevTime) => prevTime + deltaTime * FATOR_ACELERACAO_TEMPO
        );
      }
      lastFrameTimeRef.current = now;
      animationFrameId = requestAnimationFrame(animateClock);
    };

    animationFrameId = requestAnimationFrame(animateClock);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameEnded]);

  useEffect(() => {
    if (progress >= 100 && !isFinishing.current) {
      isFinishing.current = true;
      const tempoFinal = Math.max(0, gameTime);
      syncGameMutation.mutate({ tempo_decorrido_segundos: tempoFinal });
    }
  }, [progress, gameTime]);

  const checkGameOver = () => {
    if (!gameLoaded || gameEnded) return false;

    if (currentFuel <= 0 || money <= 0) {
      gamePaused.current = true;
      setGameEnded(true);
      const tempoFinal = Math.max(0, gameTime);
      syncGameMutation.mutate({ tempo_decorrido_segundos: tempoFinal });
      return true;
    }
    return false;
  };

  const formatTime = (totalSeconds: number) => {
    const totalSecondsInt = Math.floor(totalSeconds);
    const hours = Math.floor(totalSecondsInt / 3600);
    const minutes = Math.floor((totalSecondsInt % 3600) / 60);
    const secs = totalSecondsInt % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMapModalToggle = () => {
    setShowMapModal(!showMapModal);
  };

  const getVehicleImageUrl = (vehicleImage: string) => {
    if (vehicleImage.startsWith("/assets/")) {
      return vehicleImage;
    }
    if (vehicleImage.startsWith("/src/assets/")) {
      const fileName = vehicleImage.replace("/src/assets/", "");
      return `/assets/${fileName}`;
    }
    const fileName = vehicleImage.split("/").pop()?.split("?")[0];
    const imageMap: { [key: string]: string } = {
      "caminhao_medio.png": "/assets/caminhao_medio.png",
      "caminhao_pequeno.png": "/assets/caminhao_pequeno.png",
      "caminhonete.png": "/assets/caminhonete.png",
      "carreta.png": "/assets/carreta.png",
      "truck.png": "/assets/truck.png",
    };
    if (fileName && imageMap[fileName]) {
      return imageMap[fileName];
    }
    return "/assets/truck.png";
  };

  const handleCloseResultModal = () => {
    setIsResultModalOpen(false);
    setShowPopup(false);
    setActiveEvent(null);
    setIsResponding(false);
    processingEvent.current = false;
    gamePaused.current = false;
    collidedObstacle.current = null;
    obstacleTimerRef.current = -8;
    collisionCooldownRef.current = 3.0;
    setIsMainEventActive(false);

    setTimeout(() => {
      obstacleSystemLockedRef.current = false;
    }, 8000);
  };

  useEffect(() => {
    if (gameEnded) {
      localStorage.removeItem("savedGameProgress");
      setShowEndMessage(true);
    }
  }, [gameEnded]);

  useEffect(() => {
    isQuizActiveRef.current = isQuizActive;
  }, [isQuizActive]);

  useEffect(() => {
    isMainEventActiveRef.current = isMainEventActive;
  }, [isMainEventActive]);

  useEffect(() => {
    if (isMainEventActive && isQuizActive) {
      handleCloseQuiz();
    }
  }, [isMainEventActive, isQuizActive]);

  return (
    <div style={{ position: "relative" }}>
      {currentQuiz && (
        <QuizModal
          isOpen={isQuizActive}
          question={currentQuiz}
          onAnswerSubmit={handleAnswerSubmit}
          onClose={handleCloseQuiz}
        />
      )}

      {!gameLoaded && !loadingError && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 2000,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "center",
            fontSize: "18px",
          }}
        >
          <div>🎮 Carregando jogo...</div>
          <div style={{ fontSize: "14px", marginTop: "10px" }}>
            Veículo: {vehicle.name}
          </div>
          {createGameMutation.isPending && (
            <div
              style={{ fontSize: "12px", marginTop: "5px", color: "#00ff00" }}
            >
              📄 Criando partida no servidor...
            </div>
          )}
        </div>
      )}

      {loadingError && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 2000,
            backgroundColor: "rgba(220, 20, 60, 0.9)",
            color: "white",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "center",
            fontSize: "16px",
          }}
        >
          <div>❌ Erro ao carregar o jogo</div>
          <div style={{ fontSize: "12px", marginTop: "10px" }}>
            {loadingError}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "15px",
              padding: "8px 16px",
              backgroundColor: "white",
              color: "red",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Recarregar
          </button>
        </div>
      )}

      <div
        style={{
          position: "fixed",
          top: "2vh",
          left: "2vw",
          zIndex: 1000,
        }}
      >
        <button
          onClick={handleSaveAndPause}
          style={{
            backgroundColor: "#E3922A",
            border: "2px solid #000",
            borderRadius: "8px",
            padding: "min(1.5vh, 10px)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            transition: "all 0.2s ease",
            width: "min(6vh, 50px)",
            height: "min(6vh, 50px)",
          }}
          title="Pausar e Salvar Progresso"
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#FFC06F")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#E3922A")
          }
        >
          <img
            src="src/assets/pausa.png"
            alt="Pausar"
            style={{
              width: "min(3vh, 24px)",
              height: "min(3vh, 24px)",
            }}
          />
        </button>
        <RadioToggle
          onClick={() => setIsRadioOpen(!isRadioOpen)}
          isRadioOpen={isRadioOpen}
        />
        <div
          style={{
            position: "fixed",
            top: "7.8rem",
            left: "1.7rem",
          }}
        >
          <AudioControl popupAlign="left" />
        </div>
        <AudioManager />
      </div>
      {isRadioOpen && (
        <div
          style={{
            position: "fixed",
            top: "5vh",
            left: "2vw",
            zIndex: 1000,
            outline: "2px solid #000",
          }}
        >
          <TruckRadio
            isOpen={isRadioOpen}
            onClose={() => setIsRadioOpen(false)}
          />
        </div>
      )}

      <div
        style={{
          position: "fixed",
          top: "2vh",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
        }}
      >
        <PixelProgressBar progress={progress} />
      </div>

      <div
        style={{
          position: "fixed",
          top: "2vh",
          right: "2vw",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: "1vh",
          alignItems: "flex-end",
          fontFamily: "'Silkscreen', monospace",
        }}
      >
        {selectedRoute?.pathCoordinates && (
          <div
            style={{
              width: "min(12vw, 180px)",
              height: "min(12vw, 180px)",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              borderRadius: "50%",
              overflow: "hidden",
              fontFamily: "'Silkscreen', monospace",
            }}
            onClick={handleMapModalToggle}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
            title="Clique para abrir o mapa completo"
          >
            <GameMiniMap
              pathCoordinates={selectedRoute.pathCoordinates}
              vehicle={vehicle}
              progress={progress}
              className="w-full h-full border-2 border-white rounded-full overflow-hidden"
            />
          </div>
        )}

        <div
          style={{
            padding: "min(2vh, 15px)",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "12px",
            width: "min(18vw, 220px)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            fontSize: "min(2vw, 16px)",
            fontFamily: "'Silkscreen', monospace",
          }}
        >
          <div
            style={{ fontSize: "16px", marginBottom: "10px", color: "#333" }}
          >
            💰 <strong>R$ {money.toFixed(2)}</strong>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              <span style={{ fontSize: "16px" }}>⛽</span>
              <div
                style={{
                  height: "10px",
                  width: "120px",
                  backgroundColor: "#ddd",
                  borderRadius: "5px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${gasoline}%`,
                    height: "100%",
                    backgroundColor:
                      gasoline > 30
                        ? "#00cc66"
                        : gasoline > 15
                        ? "#ffaa00"
                        : "#cc3300",
                    transition: "width 0.3s ease",
                  }}
                ></div>
              </div>
            </div>
            <div
              style={{ fontSize: "12px", color: "#666", paddingLeft: "24px" }}
            >
              {currentFuel.toFixed(1)}L / {vehicle.maxCapacity}L
            </div>
          </div>

          <div style={{ fontSize: "14px", color: "#333" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px" }}>⏱️</span>
              <strong>{formatTime(gameTime)}</strong>
            </div>
          </div>

          {selectedRoute && (
            <div
              style={{
                fontSize: "12px",
                color: "#666",
                marginTop: "8px",
                borderTop: "1px solid #eee",
                paddingTop: "8px",
              }}
            >
              <div>{selectedRoute.name}</div>
              <div>{selectedRoute.distance} km</div>
            </div>
          )}

          {activeGameId && (
            <div
              style={{
                fontSize: "10px",
                color: "#0077cc",
                marginTop: "5px",
                textAlign: "center",
              }}
            >
              🎮 Partida #{activeGameId}
            </div>
          )}
        </div>
      </div>

      {gameLoaded && !isPaused && !showPopup && (
        <>
          <div
            style={{
              position: "fixed",
              bottom: "3vh",
              left: "3vw",
              zIndex: 1001,
            }}
          >
            <button
              onClick={() => setAutoStopAtNextStation(!autoStopAtNextStation)}
              style={{
                padding: "10px 15px",
                fontFamily: "'Silkscreen', monospace",
                fontSize: "14px",
                border: "2px solid black",
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor: autoStopAtNextStation ? "#28a745" : "#f0f0f0",
                color: autoStopAtNextStation ? "white" : "black",
                boxShadow: "3px 3px 0px black",
                transition: "all 0.1s ease-in-out",
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "translateY(2px)";
                e.currentTarget.style.boxShadow = "1px 1px 0px black";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "3px 3px 0px black";
              }}
            >
              ⛽ Parar no Próximo Posto:{" "}
              {autoStopAtNextStation ? "LIGADO" : "DESLIGADO"}
            </button>
          </div>

          <div
            style={{
              position: "fixed",
              bottom: "4vh",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1001,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <button
              onClick={handleSpeedUp}
              style={{
                background: "linear-gradient(180deg, #6fd250 0%, #3a9c1e 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                padding: "10px 25px",
                fontFamily: "'Press Start 2P', cursive",
                fontSize: "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxShadow:
                  "inset 0px -6px 0px rgba(0,0,0,0.3), 0px 4px 0px 0px #2a6f18",
                transition: "all 0.1s ease-out",
                textShadow: "2px 2px 0px rgba(0,0,0,0.4)",
                letterSpacing: "1px",
                position: "relative",
                outline: "none",
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "translateY(2px)";
                e.currentTarget.style.boxShadow =
                  "inset 0px -2px 0px rgba(0,0,0,0.3), 0px 2px 0px 0px #2a6f18";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "translateY(0px)";
                e.currentTarget.style.boxShadow =
                  "inset 0px -6px 0px rgba(0,0,0,0.3), 0px 4px 0px 0px #2a6f18";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0px)";
                e.currentTarget.style.boxShadow =
                  "inset 0px -6px 0px rgba(0,0,0,0.3), 0px 4px 0px 0px #2a6f18";
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(180deg, #87e96b 0%, #4cb82d 100%)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(180deg, #6fd250 0%, #3a9c1e 100%)";
              }}
              title="Alterar Velocidade"
            >
              <span
                style={{
                  fontSize: "28px",
                  lineHeight: "1",
                  transform: "translateY(-2px)",
                }}
              >
                ▶️
              </span>
              <span>{speedMultiplierRef.current.toFixed(1)}x</span>
            </button>
          </div>
        </>
      )}

      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{
          display: "block",
          width: "100vw",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      />

      {showPopup && activeEvent && !gameEnded && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#f9f9f9",
            padding: "30px",
            borderRadius: "15px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
            textAlign: "center",
            minWidth: "400px",
            maxWidth: "600px",
            zIndex: 2000,
            border: "3px solid #333",
            fontFamily: "'Silkscreen', monospace",
          }}
        >
          <div
            style={{
              backgroundColor:
                activeEvent.evento.categoria === "abastecimento"
                  ? "#28a745"
                  : activeEvent.evento.categoria === "perigo"
                  ? "#ff4444"
                  : activeEvent.evento.categoria === "terreno"
                  ? "#ff8800"
                  : "#0077cc",
              color: "white",
              padding: "5px 10px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "bold",
              marginBottom: "10px",
              display: "inline-block",
            }}
          >
            {activeEvent.evento.categoria === "abastecimento"
              ? "⛽ POSTO DE COMBUSTÍVEL"
              : activeEvent.evento.categoria === "perigo"
              ? "⚠️ ZONA DE PERIGO"
              : activeEvent.evento.categoria === "terreno"
              ? "🌄 ESTRADA DE TERRA"
              : "🛣️ EVENTO GERAL"}
          </div>
          <div className="font-[Silkscreen]" style={{ marginBottom: "10px" }}>
            <p
              style={{
                fontSize: "28px",
                color: "#333",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              {activeEvent.evento.nome}
            </p>
            <p style={{ fontSize: "16px", color: "#555" }}>
              {activeEvent.evento.descricao}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              flexWrap: "wrap",
              marginTop: "20px",
            }}
          >
            {activeEvent.evento.opcoes.map((opcao, index) => (
              <button
                key={opcao.id}
                onClick={() => handleOptionClick(opcao.id)}
                disabled={isResponding}
                style={{
                  padding: "15px 20px",
                  borderRadius: "10px",
                  border: "2px solid #fff",
                  backgroundColor:
                    activeEvent.evento.categoria === "abastecimento"
                      ? opcao.id === -1
                        ? "#28a745"
                        : "#6c757d"
                      : index % 2 === 0
                      ? "#0077cc"
                      : "#e63946",
                  color: "white",
                  fontSize: "14px",
                  cursor: isResponding ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  minWidth: "200px",
                  textAlign: "center",
                  lineHeight: "1.4",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  opacity: isResponding ? 0.6 : 1,
                }}
                onMouseOver={(e) => {
                  if (!isResponding) {
                    if (activeEvent.evento.categoria === "abastecimento") {
                      e.currentTarget.style.backgroundColor =
                        opcao.id === -1 ? "#218838" : "#5a6268";
                    } else {
                      e.currentTarget.style.backgroundColor =
                        index % 2 === 0 ? "#005fa3" : "#c92a2a";
                    }
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 8px rgba(0,0,0,0.3)";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isResponding) {
                    if (activeEvent.evento.categoria === "abastecimento") {
                      e.currentTarget.style.backgroundColor =
                        opcao.id === -1 ? "#28a745" : "#6c757d";
                    } else {
                      e.currentTarget.style.backgroundColor =
                        index % 2 === 0 ? "#0077cc" : "#e63946";
                    }
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 4px rgba(0,0,0,0.2)";
                  }
                }}
              >
                {isResponding && respondToEventMutation.isPending
                  ? "⏳ Processando..."
                  : opcao.descricao}
              </button>
            ))}
          </div>
          {isResponding && (
            <div
              style={{
                marginTop: "15px",
                fontSize: "14px",
                color: "#666",
                fontStyle: "italic",
              }}
            >
              📄 Enviando sua escolha para o servidor...
            </div>
          )}
        </div>
      )}

      {showFuelModal && (
        <FuelModalContainer
          vehicle={{ ...vehicle, currentFuel }}
          currentMoney={money}
          selectedRoute={selectedRoute}
          onComplete={handleFuelComplete}
          onCancel={handleFuelCancel}
        />
      )}

      {showEndMessage && finalGameResults && (
        <div
          className="endMessage"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            border: "3px solid #000",
            borderRadius: "15px",
            padding: "30px",
            textAlign: "center",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            zIndex: 2000,
            maxWidth: "500px",
            width: "90%",
          }}
        >
          <h2
            style={{
              color:
                finalGameResults.resultado === "vitoria"
                  ? "#00cc66"
                  : "#cc3300",
              marginBottom: "20px",
              fontFamily: "'Silkscreen', monospace",
            }}
          >
            {finalGameResults.resultado === "vitoria"
              ? "🏁 Viagem Concluída! 🏁"
              : "❌ Fim de Jogo ❌"}
          </h2>
          <p
            style={{
              fontSize: "16px",
              marginBottom: "25px",
              fontWeight: "bold",
            }}
          >
            {finalGameResults.motivo_finalizacao}
          </p>
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "25px",
              textAlign: "left",
              border: "2px solid #e9ecef",
            }}
          >
            <h3
              style={{
                margin: "0 0 15px 0",
                color: "#333",
                textAlign: "center",
                fontFamily: "'Silkscreen', monospace",
              }}
            >
              📊 Resultados Finais
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <div>
                <strong>🎯 Eficiência:</strong>
                <br />
                <span style={{ fontSize: "18px", color: "#0066cc" }}>
                  {finalGameResults.eficiencia?.toFixed(1) || "0.0"}%
                </span>
              </div>
              <div>
                <strong>💯 Pontuação:</strong>
                <br />
                <span style={{ fontSize: "18px", color: "#0066cc" }}>
                  {finalGameResults.pontuacao} pts
                </span>
              </div>
              <div>
                <strong>💰 Saldo Final:</strong>
                <br />
                <span style={{ fontSize: "16px" }}>
                  R$ {finalGameResults.saldo.toFixed(2)}
                </span>
              </div>
              <div>
                <strong>📦 Carga:</strong>
                <br />
                <span style={{ fontSize: "16px" }}>
                  {finalGameResults.quantidade_carga} /{" "}
                  {finalGameResults.quantidade_carga_inicial} un.
                </span>
              </div>
            </div>
            <div style={{ marginTop: "15px", textAlign: "center" }}>
              <strong>⏱️ Tempo Total:</strong>{" "}
              {formatTime(finalGameResults.tempo_real * 60)}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: "15px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => navigate("/ranking")}
              style={{
                padding: "12px 24px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              🏆 Ver Ranking
            </button>
            <button
              onClick={() => navigate("/game-selection")}
              style={{
                padding: "12px 24px",
                backgroundColor: "#0077cc",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              🚚 Nova Viagem
            </button>
            <button
              onClick={() => navigate("/perfil")}
              style={{
                padding: "12px 24px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              👤 Perfil
            </button>
          </div>
        </div>
      )}

      {syncGameMutation.isPending && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1999,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center",
              border: "2px solid #000",
            }}
          >
            <div style={{ marginBottom: "10px", fontSize: "24px" }}>⏳</div>
            <p style={{ margin: 0, fontSize: "16px" }}>
              Finalizando partida...
            </p>
          </div>
        </div>
      )}

      {showMapModal && selectedRoute && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            zIndex: 3000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
          }}
          onClick={handleMapModalToggle}
        >
          <div
            style={{
              width: "95%",
              height: "95%",
              backgroundColor: "white",
              borderRadius: "10px",
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                padding: "15px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxSizing: "border-box",
                zIndex: 9999,
              }}
            >
              <div
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  padding: "10px 15px",
                  borderRadius: "5px",
                  fontFamily: '"Silkscreen", monospace',
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                🗺️ {selectedRoute.name}
              </div>
              <button
                onClick={handleMapModalToggle}
                style={{
                  backgroundColor: "#e63946",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  height: "45px",
                  width: "45px",
                  fontSize: "20px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                  flexShrink: 0,
                  marginLeft: "15px",
                }}
                title="Fechar mapa"
              >
                ×
              </button>
            </div>
            <div style={{ width: "100%", height: "100%" }}>
              <MapComponent
                preSelectedRoute={selectedRoute}
                preSelectedVehicle={vehicle}
                preAvailableMoney={money}
                showControls={false}
                externalProgress={{
                  currentPathIndex: currentPathIndexRef.current,
                  pathProgress: pathProgressRef.current,
                  totalProgress: progress,
                }}
              />
            </div>
          </div>
        </div>
      )}

      <PauseMenu
        isVisible={isPaused}
        onResume={handleResume}
        onRestart={handleRestart}
        onGoToProfile={handleGoToProfile}
      />

      <EventResultModal
        isOpen={isResultModalOpen}
        onClose={handleCloseResultModal}
        title={resultModalContent.title}
        description={resultModalContent.description}
        consequences={resultModalContent.consequences}
      />
    </div>
  );
}
