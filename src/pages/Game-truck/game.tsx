// src/pages/Game-truck/game.tsx 
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import kaboom from "kaboom";

import './game.css';
import { PartidaData } from "../../types/ranking";
import { Vehicle } from "../../types/vehicle";
import { GameMiniMap } from "./GameMiniMap";
import { MapComponent } from "../mapaRota/MapComponent";
import { PauseMenu } from "../PauseMenu/PauseMenu";
import { GameService } from "../../api/gameService";
import { PixelProgressBar } from "../../components/PixelProgressBar/PixelProgressBar";
import '../../components/PixelProgressBar/PixelProgressBar.css';
import type {
  GameObj,
  KaboomCtx
} from "kaboom";
import { setupRainSystem } from "@/components/rainSystem";
import { RainEffect } from "@/components/RainEffect";
import { EventResultModal } from './EventResultModal';
import { QuizModal } from "../../components/QuizModal"; // Componente do Quiz
import { PerguntaQuiz, ResponderQuizPayload, RespostaQuizResult } from "../../api/gameService"; // Tipos e serviços
import RadioToggle from '@/components/RadioToggle';
import TruckRadio from '@/components/TruckRadio';
import { AudioControl } from "../../components/AudioControl";
import { AudioManager } from "../../components/AudioManager";

// Interface para eventos vindos da API
interface EventData {
  id: number;
  partida: number;
  evento: {
    id: number;
    nome: string;
    descricao: string;
    tipo: 'positivo' | 'negativo';
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
}

export function GameScene() {

  const [isMainEventActive, setIsMainEventActive] = useState(false);
  const quizTimerRef = useRef(0);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<PerguntaQuiz | null>(null);
  const isQuizActiveRef = useRef(false);

  // REFs DE CONTROLE DE EVENTOS
  const activeGameIdRef = useRef<number | null>(null);
  const isFinishing = useRef(false);

  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gamePaused = useRef(false);
  const collidedObstacle = useRef<GameObj | null>(null);
  const destroyRef = useRef<((obj: GameObj) => void) | null>(null);

  // ESTADOS PARA INTEGRAÇÃO COM API
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

  //CONTROLE DE VELOCIDADE
  const [speedLevel, setSpeedLevel] = useState(1); // 1 = 1x, 2 = 1.5x, 3 = 2x
  const speedMultiplierRef = useRef(1);
  const MAX_SPEED_LEVEL = 3;

  // LÓGICA DE TEMPO CORRIGIDA
  const [gameTime, setGameTime] = useState(0);
  const FATOR_ACELERACAO_TEMPO = 24;
  const lastFrameTimeRef = useRef(performance.now());
  const tickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [finalGameResults, setFinalGameResults] = useState<PartidaData | null>(null);
  const [currentFuel, setCurrentFuel] = useState<number>(location.state?.selectedVehicle?.currentFuel || 0);
  const [totalDistance, setTotalDistance] = useState<number>(500);

  const [showMapModal, setShowMapModal] = useState(false);

  // Estados para o modal de resultados
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [resultModalContent, setResultModalContent] = useState({
    title: '',
    description: '',
    consequences: [] as any[],
  });

  // ✅ ADIÇÃO: Estados para sistema de background da versão antiga
  const currentBg = useRef<'cidade' | 'terra'>('cidade');
  const nextBg = useRef<'cidade' | 'terra' | null>(null);
  const backgroundSwitchTimer = useRef(0);
  const transitionProgress = useRef(0);
  const isTransitioning = useRef(false);
  const transitionCooldown = useRef(0);
  const TRANSITION_DURATION = 5;
  const COOLDOWN_DURATION = 0.1;

  // ✅ ADIÇÃO: Sistema de zoom cinematográfico
  const ZOOM_CONFIG = {
    MAX_ZOOM: 1.5,
    LEAD_IN_TIME: 0.5,
    LEAD_OUT_TIME: 1.0,
  };
  const ZOOM_TOTAL_DURATION = ZOOM_CONFIG.LEAD_IN_TIME + TRANSITION_DURATION + ZOOM_CONFIG.LEAD_OUT_TIME;

  const zoomEffect = useRef({
    isActive: false,
    progress: 0,
    duration: ZOOM_TOTAL_DURATION,
    maxZoom: ZOOM_CONFIG.MAX_ZOOM,
    originalZoom: 1.0,
  });

  //estados CHuva
   const rainCycleTimerRef = useRef<number>(0);
   const rainControllerRef = useRef<any>(null);
   const isRainActiveRef = useRef(false);

  
  // Estados vindos dos parâmetros de navegação
  const [vehicle] = useState<Vehicle>(() => {
    console.log("Estado recebido no jogo:", location.state);

    if (location.state && location.state.selectedVehicle) {
      console.log("Veículo encontrado:", location.state.selectedVehicle);
      return location.state.selectedVehicle;
    }

    console.warn("Nenhum veículo encontrado, redirecionando...");
    navigate('/select-vehicle');
    return { id: 'default', name: 'Caminhão Padrão', capacity: 1000, consumption: { asphalt: 3, dirt: 2 }, image: '/assets/truck.png', maxCapacity: 100, currentFuel: 0, cost: 1000 };
  });

  const [money, setMoney] = useState(() => {
    const money = location.state?.availableMoney;
    console.log("Dinheiro recebido:", money);
    return money !== undefined ? money : 1000;
  });

  const [selectedRoute] = useState(() => {
    const route = location.state?.selectedRoute;
    console.log("Rota recebida:", route);
    return route || null;
  });

  useEffect(() => {
    console.log("🎮 GameScene montado com estado:", {
      vehicle: location.state?.selectedVehicle?.name,
      route: location.state?.selectedRoute?.name,
      hasPathCoordinates: !!location.state?.selectedRoute?.pathCoordinates,
      pathCoordinatesLength: location.state?.selectedRoute?.pathCoordinates?.length || 0,
      money: location.state?.availableMoney,
      savedProgress: !!location.state?.savedProgress
    });
  }, []);

  // ============= MUTAÇÕES PARA COMUNICAÇÃO COM A API =============

  // Mutação para criar o jogo no backend
  const createGameMutation = useMutation({
    mutationFn: (gameData: {
      mapa: number;
      rota: number;
      veiculo: number;
      saldo_inicial?: number;
      combustivel_inicial?: number
    }) => GameService.createGame(gameData),
    onSuccess: (partida) => {
      console.log('🎮 Partida criada com sucesso no backend, ID:', partida.id);

      setActiveGameId(partida.id);
      activeGameIdRef.current = partida.id;
      setMoney(partida.saldo);
      setCurrentFuel(partida.combustivel_atual);

      console.log('💰 Estado sincronizado - Saldo:', partida.saldo, 'Combustível:', partida.combustivel_atual);
      console.log('🔗 activeGameIdRef definido como:', activeGameIdRef.current);
    },
    onError: (error) => {
      console.error('❌ Erro ao criar partida:', error);
      alert('Não foi possível iniciar o jogo. Tente novamente.');
      navigate('/routes');
    }
  });

  // MUTAÇÃO DE TICK ATUALIZADA - AGORA LIDA COM EVENTOS
  const partidaTickMutation = useMutation({
    mutationFn: (data: { distancia_percorrida: number }) => GameService.partidaTick(data),
    onSuccess: (tickResult) => {
      // Sincroniza dados financeiros e combustível
      setMoney(tickResult.saldo);
      setCurrentFuel(tickResult.combustivel_atual);

      // ✅ VERIFICAÇÃO DE GAME OVER APÓS TICK DO BACKEND
      console.log("🔍 Verificando Game Over no tick - Combustível:", tickResult.combustivel_atual, "Saldo:", tickResult.saldo);

      if (tickResult.combustivel_atual <= 0) {
        console.log("🚨 Game Over detectado pelo backend: Combustível esgotado");
        gamePaused.current = true;
        setGameEnded(true);

        // Finalizar jogo via backend para obter resultados
        const tempoFinal = Math.max(0, gameTime);
        console.log("🔄 Finalizando jogo por combustível via tick...");
        syncGameMutation.mutate({ tempo_decorrido_segundos: tempoFinal });
        return;
      }

      if (tickResult.saldo <= 0) {
        console.log("🚨 Game Over detectado pelo backend: Sem recursos financeiros");
        gamePaused.current = true;
        setGameEnded(true);

        // Finalizar jogo via backend para obter resultados
        const tempoFinal = Math.max(0, gameTime);
        console.log("🔄 Finalizando jogo por saldo via tick...");
        syncGameMutation.mutate({ tempo_decorrido_segundos: tempoFinal });
        return;
      }

      // Verifica se há evento pendente retornado pelo tick
      if (tickResult.evento_pendente && !activeEvent && !showPopup) {
        console.log('🎲 Evento pendente detectado no tick:', tickResult.evento_pendente.evento.nome);
        // Adapta o formato do evento para o EventData esperado
        const eventData: EventData = {
          ...tickResult.evento_pendente,
          partida: tickResult.id // Adiciona o ID da partida
        };

        console.log("🚨 Evento principal ativado, quizzes serão suprimidos.");
        setIsMainEventActive(true); // INFORMA QUE UM EVENTO PRINCIPAL ESTÁ ATIVO

        setActiveEvent(eventData);
        setShowPopup(true);
        gamePaused.current = true;
        processingEvent.current = true;
      }

      console.log(`💰 Tick processado - Saldo: ${tickResult.saldo}, Combustível: ${tickResult.combustivel_atual}`);
    },
    onError: (error) => {
      console.error("Erro no tick:", error);
    }
  });

// Função que chama a API para sortear um quiz
  const handleTriggerQuiz = async () => {
    try {
      const quizQuestion = await GameService.sortearQuiz();
      if (quizQuestion) {
        setCurrentQuiz(quizQuestion);
        setIsQuizActive(true);
      }
    } catch (error) {
      console.error("Não foi possível carregar uma pergunta do quiz.", error);
    }
  };

  // Função passada para o modal para enviar a resposta
  const handleAnswerSubmit = async (payload: ResponderQuizPayload): Promise<RespostaQuizResult> => {
    try {
      const result = await GameService.responderQuiz(payload);
      // Atualizar o saldo se a resposta deu dinheiro
      if (result.saldo_atual !== undefined) {
        setMoney(result.saldo_atual);
      }
      return result;
    } catch (error) {
      console.error("Erro ao submeter resposta do quiz", error);
      // Retornar um resultado de erro para o modal poder exibir
      return { correta: false, detail: "Erro ao conectar com o servidor." };
    }
  };

  // Função para fechar o modal do quiz
  const handleCloseQuiz = () => {
    setIsQuizActive(false);
    setCurrentQuiz(null);
  };



  // MUTAÇÃO PARA RESPONDER EVENTO - MANTÉM sincronização de tempo apenas aqui
  const respondToEventMutation = useMutation({
    mutationFn: (data: { optionId: number; distancia: number }) =>
      GameService.respondToEvent(data.optionId, data.distancia),
    onSuccess: (data) => {
      const updatedPartida = data.partida;
      console.log('✅ Resposta processada pelo backend:', data.detail);

      // Sincronizar estado financeiro e combustível
      setMoney(updatedPartida.saldo);
      setCurrentFuel(updatedPartida.combustivel_atual);

      // Sincronizar tempo (para penalidades e bônus de eventos)
      if (updatedPartida.tempo_jogo !== undefined) {
        const tempoSegundos = Math.round(updatedPartida.tempo_jogo * 60);
        setGameTime(tempoSegundos);
        console.log(`⏱️ TEMPO ATUALIZADO APÓS EVENTO: ${tempoSegundos}s (${Math.floor(tempoSegundos / 60)}min)`);
      }

      // ✅ CORREÇÃO: Sincronizar distância se houve mudança (bônus de distância)
      if (updatedPartida.distancia_percorrida !== undefined && totalDistance > 0) {
        const novoProgresso = Math.min(100, (updatedPartida.distancia_percorrida / totalDistance) * 100);

        const progressoAnterior = progressRef.current;
        progressRef.current = novoProgresso;
        setProgress(novoProgresso);
        distanceTravelled.current = updatedPartida.distancia_percorrida;

        console.log(`📍 PROGRESSO ATUALIZADO APÓS EVENTO:`);
        console.log(`   Anterior: ${progressoAnterior.toFixed(2)}%`);
        console.log(`   Novo: ${novoProgresso.toFixed(2)}%`);
        console.log(`   Distância: ${updatedPartida.distancia_percorrida}km/${totalDistance}km`);

        if (novoProgresso - progressoAnterior > 1) {
          console.log(`🚀 BÔNUS DE DISTÂNCIA APLICADO: +${(novoProgresso - progressoAnterior).toFixed(2)}% de progresso!`);
        }
      }


      // Mostrar modal de resultado ao invés de alert
      setResultModalContent({
        title: activeEvent?.evento.nome || 'Evento Concluído',
        description: data.detail,
        consequences: data.efeitos_aplicados || [],
      });
      setIsResultModalOpen(true);

      // NOTA: A limpeza do estado será feita no handleCloseResultModal

      obstacleTimerRef.current = -8;
      collisionCooldownRef.current = 3.0;

      setTimeout(() => {
        obstacleSystemLockedRef.current = false;
        console.log('🔓 Sistema de obstáculos destravado após evento');
      }, 8000);
    },
    onError: (error) => {
      console.error('❌ Erro ao responder evento:', error);
      alert('Erro ao processar sua resposta. O jogo continuará.');
      setIsResponding(false);
      gamePaused.current = false;
      processingEvent.current = false;
    }
  });

  // Função de finalização
  const syncGameMutation = useMutation({
    mutationFn: (progressData: { tempo_decorrido_segundos: number }) => {
      console.log("🔄 Executando syncGameProgress com dados:", progressData);
      return GameService.syncGameProgress(progressData);
    },
    onSuccess: (updatedPartida: PartidaData) => {
      console.log("✅ Progresso sincronizado! Status:", updatedPartida.status);
      console.log("📊 Dados da partida finalizada:", {
        resultado: updatedPartida.resultado,
        motivo: updatedPartida.motivo_finalizacao,
        combustivel: updatedPartida.combustivel_atual,
        saldo: updatedPartida.saldo
      });

      if (updatedPartida.status === 'concluido') {
        console.log("🏁 PARTIDA FINALIZADA! Mostrando modal de resultados...");
        setFinalGameResults(updatedPartida);
        setGameEnded(true);
        setShowEndMessage(true);
        gamePaused.current = true;
      } else {
        console.warn("⚠️ Partida não foi marcada como concluída. Status:", updatedPartida.status);
      }
    },
    onError: (error) => {
      console.error("❌ Erro ao sincronizar jogo:", error);
      alert("Houve um erro ao finalizar a partida. Tente novamente.");
    }
  });

  // ✅ ADIÇÃO: Funções do sistema de zoom
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

      console.log("🎬 Efeito de zoom de transição finalizado!");
      return;
    }

    if (zoomEffect.current.progress < 0.5) {
      const t = zoomEffect.current.progress / 0.5;
      currentZoom = zoomEffect.current.originalZoom + (zoomEffect.current.maxZoom - zoomEffect.current.originalZoom) * easeInOutCubic(t);
    } else {
      const t = (zoomEffect.current.progress - 0.5) / 0.5;
      currentZoom = zoomEffect.current.maxZoom - (zoomEffect.current.maxZoom - zoomEffect.current.originalZoom) * easeInOutCubic(t);
    }

    k.camScale(k.vec2(currentZoom));

    const centerX = k.width() / 2;
    const centerY = k.height() / 2;
    const yOffset = (centerY * 0.5) * (currentZoom - 1);
    const xOffset = (centerX * -0.9) * (currentZoom - 1);

    k.camPos(centerX + xOffset, centerY + yOffset);
  };

  const startZoomEffect = () => {
    console.log("🎬 Iniciando efeito de zoom cinematográfico!");
    zoomEffect.current.isActive = true;
    zoomEffect.current.progress = 0;
  };

  // ✅ ADIÇÃO: Sistema de background modular da versão antiga
  const updateBackgroundSystem = (k: any, deltaTime: number, moveAmount: number) => {
    // Aplicar efeito de zoom
    applyZoomEffect(k, deltaTime);

    // Movimento dos backgrounds
    k.get("bg_cidade").forEach((bg: any) => bg.move(moveAmount, 0));
    k.get("bg_terra").forEach((bg: any) => bg.move(moveAmount, 0));

    // Gerenciar cooldown
    if (transitionCooldown.current > 0) {
      transitionCooldown.current -= deltaTime;
    }

    // Garantir que sempre temos um background visível quando não há transição
    if (!isTransitioning.current && !nextBg.current && transitionProgress.current === 0 && transitionCooldown.current <= 0) {
      k.get(`bg_${currentBg.current}`).forEach((bg: any) => {
        if (bg.opacity !== 1) bg.opacity = 1;
      });
      const otherBg = currentBg.current === 'cidade' ? 'terra' : 'cidade';
      k.get(`bg_${otherBg}`).forEach((bg: any) => {
        if (bg.opacity !== 0) bg.opacity = 0;
      });
    }

    // Reposicionamento dos backgrounds
    const bgWidth = 2048 * Math.max(k.width() / 2048, k.height() / 762);
    const backgrounds = k.get("bg_cidade").concat(k.get("bg_terra"));

    backgrounds.forEach((bg: any, index: number) => {
      if (index % 2 === 0) { // bg1 de cada tipo
        const otherBg = backgrounds[index + 1];
        if (otherBg && bg.pos.x + bgWidth <= 0) {
          bg.pos.x = otherBg.pos.x + bgWidth;
        }
      } else { // bg2 de cada tipo
        const otherBg = backgrounds[index - 1];
        if (otherBg && bg.pos.x + bgWidth <= 0) {
          bg.pos.x = otherBg.pos.x + bgWidth;
        }
      }
    });

    // Sistema de transição suave com opacity
    if (isTransitioning.current && nextBg.current) {
      transitionProgress.current += deltaTime / TRANSITION_DURATION;

      if (transitionProgress.current >= 1) {
        transitionProgress.current = 0;
        isTransitioning.current = false;

        const newCurrentBg = nextBg.current;
        const oldBg = currentBg.current;

        k.get(`bg_${newCurrentBg}`).forEach((bg: any) => { bg.opacity = 1; });
        k.get(`bg_${oldBg}`).forEach((bg: any) => { bg.opacity = 0; });

        currentBg.current = newCurrentBg;
        nextBg.current = null;
        transitionCooldown.current = COOLDOWN_DURATION;

        console.log(`Transição suave completa! Novo cenário é ${currentBg.current}`);
      }

      if (isTransitioning.current && nextBg.current) {
        const easedProgress = easeInOutCubic(transitionProgress.current);
        const currentOpacity = 1 - easedProgress;
        const nextOpacity = easedProgress;

        k.get(`bg_${currentBg.current}`).forEach((bg: any) => { bg.opacity = currentOpacity; });
        k.get(`bg_${nextBg.current}`).forEach((bg: any) => { bg.opacity = nextOpacity; });
      }
    }

    // Timer para mudança de background
    backgroundSwitchTimer.current -= deltaTime;
    if (backgroundSwitchTimer.current <= 0 && !nextBg.current && !isTransitioning.current) {
      const shouldSwitchToTerra = (currentBg.current === 'cidade' && k.rand() < 0.3);
      const shouldSwitchToCidade = (currentBg.current === 'terra' && k.rand() < 0.8);

      if (shouldSwitchToTerra || shouldSwitchToCidade) {
        startZoomEffect();

        k.wait(ZOOM_CONFIG.LEAD_IN_TIME, () => {
          const bgWidth = 2048 * Math.max(k.width() / 2048, k.height() / 762);

          if (shouldSwitchToTerra) {
            nextBg.current = 'terra';
            const bgTerra = k.get("bg_terra");
            if (bgTerra.length >= 2) {
              bgTerra[0].pos.x = 0;
              bgTerra[1].pos.x = bgWidth;
            }
            console.log("🎬 Iniciando FADE: cidade → terra");
          } else if (shouldSwitchToCidade) {
            nextBg.current = 'cidade';
            const bgCidade = k.get("bg_cidade");
            if (bgCidade.length >= 2) {
              bgCidade[0].pos.x = 0;
              bgCidade[1].pos.x = bgWidth;
            }
            console.log("🎬 Iniciando FADE: terra → cidade");
          }

          isTransitioning.current = true;
          transitionProgress.current = 0;
        });

        backgroundSwitchTimer.current = k.rand(15, 25);
      }
    }
  };
  
  //Função para aumentar a velocidade
  const handleSpeedUp = () => {
    if (gamePaused.current || showPopup) return; // Não muda velocidade se pausado ou em evento

    setSpeedLevel(prevLevel => {
      const nextLevel = prevLevel >= MAX_SPEED_LEVEL ? 1 : prevLevel + 1;
      
      let newMultiplier = 1;
      if (nextLevel === 2) newMultiplier = 1.5;
      if (nextLevel === 3) newMultiplier = 2.0;

      speedMultiplierRef.current = newMultiplier;

      console.log(`🚀 Velocidade alterada para nível ${nextLevel} (Multiplicador: ${newMultiplier}x)`);
      return nextLevel;
    });
  };

  const togglePause = () => {
    const nextPausedState = !gamePaused.current;
    gamePaused.current = nextPausedState;
    setIsPaused(nextPausedState);
    console.log(`Jogo ${nextPausedState ? "pausado" : "despausado"}`);
  };

  const handleRestart = () => {
    window.location.reload();
  };

  const handleGoToProfile = () => {
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
      activeGameId: activeGameIdRef.current
    };
    localStorage.setItem('savedGameProgress', JSON.stringify(gameProgress));
    navigate('/perfil');
  };

  const handleSaveAndPause = () => {
    console.log("💾 Salvando progresso e pausando o jogo...");
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
      activeGameId: activeGameIdRef.current
    };
    localStorage.setItem('savedGameProgress', JSON.stringify(gameProgress));
    togglePause();
  };

  const handleOptionClick = (optionId: number) => {
    if (isResponding) return;

    console.log("🎯 Processando escolha do evento - Opção ID:", optionId);
    setIsResponding(true);
    const distanciaAtual = (progressRef.current / 100) * totalDistance;
    respondToEventMutation.mutate({ optionId, distancia: distanciaAtual });
  };

  // ============= INICIALIZAÇÃO DO JOGO =============

  const initializeGame = (savedProgress?: any) => {
    if (!vehicle || !vehicle.name) {
      console.error("Dados do veículo não encontrados");
      return;
    }

    if (!canvasRef.current) {
      console.error("Canvas não encontrado, tentando novamente...");
      setTimeout(() => initializeGame(savedProgress), 100);
      return;
    }

    console.log("Canvas encontrado:", canvasRef.current);

    if (!document.contains(canvasRef.current)) {
      console.error("Canvas não está no DOM, aguardando...");
      setTimeout(() => initializeGame(savedProgress), 100);
      return;
    }

    if ((window as any).__kaboom_initiated__) {
      (window as any).__kaboom_initiated__ = false;
    }

    console.log("Inicializando jogo com veículo:", vehicle.name, "Imagem:", vehicle.image);
    console.log("Combustível atual no início:", currentFuel);

    handleResizeRef.current = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    try {
      setGameLoaded(false);
      setLoadingError(null);

      const testContext = canvasRef.current!.getContext('webgl') || canvasRef.current!.getContext('experimental-webgl');
      if (!testContext) {
        throw new Error("WebGL não suportado neste navegador");
      }

      const k = kaboom({
        canvas: canvasRef.current!,
        width: window.innerWidth,
        height: window.innerHeight,
        background: [0, 0, 0],
        crisp: true,
      });

      window.addEventListener('resize', handleResizeRef.current!);
      (window as any).__kaboom_initiated__ = true;

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
        onSceneLeave
      } = k;

       k.loadSound("rain", "audio/rainSound.mp3");

      destroyRef.current = destroy;

      try {
        console.log("Tentando carregar sprites...");

        // ✅ CORREÇÃO: Carregamento correto dos backgrounds
        loadSprite("background_cidade", "/assets/background-cidade.png");
        loadSprite("background_terra", "/assets/background-terra.png");

        const vehicleImageUrl = getVehicleImageUrl(vehicle.spriteSheet || vehicle.image);
        console.log("Imagem original do veículo:", vehicle.image);
        console.log("URL convertida para kaboom:", vehicleImageUrl);

        loadSprite("car", vehicleImageUrl, {
          sliceX: 2,
          sliceY: 1,
          anims: {
            run: { from: 0, to: 1, loop: true, speed: 8 },
          },
        });

        // veiculos do trafego
        loadSprite("carro_1", "/assets/carro_trafego_1.png");
        loadSprite("carro_2", "/assets/carro_trafego_2.png");
        loadSprite("carro_3", "/assets/carro_trafego_3.png");
        loadSprite("carro_4", "/assets/carro_trafego_4.png");
        loadSprite("carro_5", "/assets/carro_trafego_5.png");
        loadSprite("carro_6", "/assets/carro_trafego_6.png");
        loadSprite("carro_7", "/assets/carro_trafego_7.png");
        loadSprite("carro_8", "/assets/carro_trafego_8.png");
        loadSprite("moto_1", "/assets/moto_trafego_1.png");

       


        console.log("Todos os sprites carregados com sucesso");
      } catch (error) {
        console.error("Erro ao carregar sprites:", error);
      }


      scene("main", () => {
        const speed = 5000;

        // ✅ CORREÇÃO: Uso das dimensões corretas
        const LARGURA_ORIGINAL_BG = 2048;
        const ALTURA_ORIGINAL_BG = 762;

        const bgScaleX = width() / LARGURA_ORIGINAL_BG;
        const bgScaleY = height() / ALTURA_ORIGINAL_BG;
        const bgScale = Math.max(bgScaleX, bgScaleY);
        const bgWidth = LARGURA_ORIGINAL_BG * bgScale;

        const bgOffsetY = -height() * 0.05;

        // ✅ ADIÇÃO: Sistema de background completo da versão antiga
        const bg_cidade_1 = add([sprite("background_cidade"), pos(0, bgOffsetY), scale(bgScale), z(0), "bg_cidade", opacity(1)]);
        const bg_cidade_2 = add([sprite("background_cidade"), pos(bgWidth, bgOffsetY), scale(bgScale), z(0), "bg_cidade", opacity(1)]);
        const bg_terra_1 = add([sprite("background_terra"), pos(0, bgOffsetY), scale(bgScale), z(0), "bg_terra", opacity(0)]);
        const bg_terra_2 = add([sprite("background_terra"), pos(bgWidth, bgOffsetY), scale(bgScale), z(0), "bg_terra", opacity(0)]);

        // Inicializar timer de transição
        backgroundSwitchTimer.current = rand(2, 4);

        const roadYPosition = height() * 0.48;
        const baseWidth = 600;
        const scaleFactor = (width() / baseWidth) * 0.3;

        const car = add([
          sprite("car", { anim: "run" }),
          pos(width() * 0.08, roadYPosition),
          area(),
          body(),
          z(2),
          scale(scaleFactor),
        ]);

        const lane_contramao = height() * 0.60;
        const lane_mesmo_sentido = height() * 0.68;
        const trafficCarSprites = ["carro_1", "carro_2", "carro_3", "carro_4", "carro_5", "carro_6", "carro_7", "carro_8", "moto_1"];

        loop(rand(4, 7), () => {
          if (gamePaused.current || get("traffic_car").length > 0) {
            return;
          }
          const carSprite = choose(trafficCarSprites);
          const carType = choose(["ultrapassagem", "contramao"]);

          if (carType === "contramao") {
            const startX = width() + 150;
            const carSpeed = speed * rand(0.2, 0.3);
            add([
              sprite(carSprite, { flipX: true }),
              pos(startX, lane_contramao),
              scale(scaleFactor * 1.6),
              move(LEFT, carSpeed),
              "traffic_car",
              z(1),
              { behavior: "contramao" },
            ]);
          } else {
            const startX = -250;
            const carSpeed = speed * rand(0.05, 0.1);
            add([
              sprite(carSprite, { flipX: false }),
              pos(startX, lane_contramao),
              scale(scaleFactor * 1.7),
              move(RIGHT, carSpeed),
              "traffic_car",
              z(1),
              { isChangingLane: false, behavior: "ultrapassagem" },
            ]);
          }
        });

        //chuva
        rainControllerRef.current = setupRainSystem(k)

        onUpdate("traffic_car", (trafficCar) => {
          if (trafficCar.behavior === "ultrapassagem" && !trafficCar.isChangingLane && trafficCar.pos.x > (car.pos.x + car.width - 150)) {
            trafficCar.isChangingLane = true;
            tween(
              trafficCar.pos.y,
              lane_mesmo_sentido,
              0.9,
              (newY) => (trafficCar.pos.y = newY),
              easings.easeInOutQuad
            );
          }
          if (trafficCar.pos.x < -trafficCar.width || trafficCar.pos.x > width() + trafficCar.width) {
            destroy(trafficCar);
          }
        });

        onUpdate(() => {
          // ✅ MANTÉM: Proteção de pausa da versão atual
          if (gamePaused.current) {
            return;
          }
          const deltaTime = dt();

          // --- LÓGICA DO TIMER DO QUIZ ---
          quizTimerRef.current += deltaTime; // Modifica o ref diretamente

          // A cada 10 segundos para teste (ou 60 para a versão final)
          if (quizTimerRef.current >= 10) { // Verificamos o valor atual do ref
            quizTimerRef.current = 0; // Resetamos o ref
            // CONDIÇÃO FUNDAMENTAL: Só dispara o quiz se um evento principal NÃO estiver ativo
            if (!isMainEventActive && !isQuizActiveRef.current) {
              console.log("⏰ Timer do quiz disparado! Solicitando pergunta...");
              handleTriggerQuiz();
            } else {
              console.log("⏰ Quiz adiado, pois um evento principal ou outro quiz já está ativo.");
            }
          }

          // ✅ VERIFICAÇÃO DE GAME OVER - COMBUSTÍVEL E DINHEIRO
          if (checkGameOver()) {
            return;
          }

          // ✅ MANTÉM: Sistema de cooldown da versão atual
          if (collisionCooldownRef.current > 0) {
            collisionCooldownRef.current = Math.max(0, collisionCooldownRef.current - deltaTime);
          }

          //Aplica o multiplicador de velocidade
          const moveAmount = -speed * speedMultiplierRef.current * deltaTime;

          // ✅ ADIÇÃO: Chamada para o sistema de background modular
          updateBackgroundSystem(k, deltaTime, moveAmount);

          // ✅ MANTÉM: Toda a lógica da versão atual
          const progressPercent = calculatePathProgress(deltaTime);
          const previousProgress = progressRef.current;
          progressRef.current = progressPercent;

          if (Math.abs(progressPercent - progress) > 0.05) {
            setProgress(progressPercent);
          }

          const routeDistance = totalDistance || 500;
          const progressDelta = progressPercent - previousProgress;
          const distanceInKm = (progressDelta / 100) * routeDistance;

          if (distanceInKm > 0) {
            // ✅ CONSUMO DE COMBUSTÍVEL AGORA É CONTROLADO PELO BACKEND VIA TICK
            // A atualização da UI do combustível acontece via partidaTickMutation.onSuccess
            const newGasolinePercent = (currentFuel / vehicle.maxCapacity) * 100;
            setGasoline(newGasolinePercent);
          }

          // ✅ EVENTOS AGORA SÃO TRATADOS AUTOMATICAMENTE NO TICK
          // Não precisamos mais verificar eventos separadamente
        });
      });

      go("main");

      setCurrentPathIndex(0);
      currentPathIndexRef.current = 0;
      pathProgressRef.current = 0;
      progressRef.current = 0;
      setProgress(0);
      distanceTravelled.current = 0;

      obstacleTimerRef.current = 0;
      gamePaused.current = false;

      setGameLoaded(true);

      console.log("✅ Jogo inicializado com sucesso!");

    } catch (error) {
      console.error("Erro ao inicializar o jogo:", error);
      setLoadingError(`Erro ao carregar o jogo: ${error}`);
      setGameLoaded(false);
      (window as any).__kaboom_initiated__ = false;
    }
  };

  // ============= USEEFFECT PRINCIPAL =============

  useEffect(() => {
    if (gameInitialized.current) {
      return;
    }
    gameInitialized.current = true;

    console.log("🚀 Lógica de inicialização única está rodando...");

    const { selectedVehicle, selectedRoute: route, savedProgress } = location.state || {};

    if (!selectedVehicle || !route?.id || !route?.mapaId) {
      console.error("❌ Dados insuficientes para criar partida. Redirecionando...");
      alert("Erro: Dados do veículo ou rota incompletos.");
      navigate('/routes');
      return;
    }

    if (savedProgress && savedProgress.activeGameId) {
      console.log("🟢 Restaurando partida existente com ID:", savedProgress.activeGameId);
      setActiveGameId(savedProgress.activeGameId);
      activeGameIdRef.current = savedProgress.activeGameId;

      initializeGame(savedProgress);
      return;
    }

    createGameMutation.mutateAsync({
      mapa: route.mapaId,
      rota: route.id,
      veiculo: parseInt(selectedVehicle.id, 10) || 1,
      saldo_inicial: money, // Passa o saldo da tela de abastecimento
      combustivel_inicial: vehicle.currentFuel // Passa o combustível da tela de abastecimento
    }).then(() => {
      initializeGame(savedProgress);
    }).catch(error => {
      console.error("❌ Falha crítica na criação da partida, não inicializando Kaboom", error);
    });

    return () => {
      console.log("🧹 Limpando GameScene ao sair da página...");
      if ((window as any).__kaboom_initiated__) {
        const k = (window as any).k;
        if (k?.destroy) k.destroy();
        (window as any).__kaboom_initiated__ = false;
      }
      if (handleResizeRef.current) {
        window.removeEventListener('resize', handleResizeRef.current);
      }
    };
  }, []);

  // ============= LISTENERS DE EVENTOS =============

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!activeEvent && !gameEnded) {
          togglePause();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeEvent, gameEnded]);

  // Inicializar estados
  useEffect(() => {
    const { savedProgress } = location.state || {};

    if (savedProgress) {
      console.log("📄 Restaurando progresso salvo...");
      setCurrentFuel(savedProgress.currentFuel);
      setProgress(savedProgress.progress);
      setCurrentPathIndex(savedProgress.currentPathIndex);
      setGameTime(Math.max(0, savedProgress.gameTime || 0));

      progressRef.current = savedProgress.progress;
      currentPathIndexRef.current = savedProgress.currentPathIndex;
      pathProgressRef.current = savedProgress.pathProgress;
    } else {
      console.log("✨ Iniciando um novo jogo...");
      setCurrentFuel(vehicle?.currentFuel || 0);
      setGameTime(0);
    }

    if (selectedRoute) {
      const routeDistance = selectedRoute.actualDistance || selectedRoute.distance;
      setTotalDistance(routeDistance);

      const estimatedHours = selectedRoute.estimatedTimeHours || 7.5;
      const targetGameDurationMinutes = 20;
      gameSpeedMultiplier.current = (estimatedHours * 60) / targetGameDurationMinutes;
    }
  }, [vehicle, selectedRoute, location.state]);

  const [gasoline, setGasoline] = useState(() => {
    const fuelPercent = (currentFuel / vehicle.maxCapacity) * 100;
    console.log("Inicializando gasoline com:", fuelPercent, "%");
    return fuelPercent;
  });

  // Validação de dados essenciais
  useEffect(() => {
    if (!vehicle || !vehicle.name || !vehicle.image) {
      console.error("ERRO: Dados do veículo incompletos!");
      console.log("Redirecionando para seleção de veículo...");
      setTimeout(() => {
        navigate('/select-vehicle');
      }, 1000);
    }
  }, []);
  

  // Sistema de ticks periódicos
  useEffect(() => {
    tickTimerRef.current = setInterval(() => {
      if (!gamePaused.current && !gameEnded && gameLoaded && activeGameIdRef.current) {
        const distanciaAtual = (progressRef.current / 100) * totalDistance;
        partidaTickMutation.mutate({ distancia_percorrida: distanciaAtual });
      }
    }, 2000);

    return () => {
      if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    };
  }, [gameEnded, gameLoaded, totalDistance]);

  // ✅ SISTEMA DE TEMPO CORRIGIDO - ACELERA SEMPRE NO FRONTEND
  useEffect(() => {
    let animationFrameId: number;

    const animateClock = (now: number) => {
      if (!gamePaused.current && !gameEnded) {
        const deltaTime = (now - lastFrameTimeRef.current) / 1000;

        // ✅ TEMPO ACELERA CONSTANTEMENTE NO FRONTEND
        setGameTime(prevTime => prevTime + (deltaTime * FATOR_ACELERACAO_TEMPO));
      }
      lastFrameTimeRef.current = now;
      animationFrameId = requestAnimationFrame(animateClock);
    };

    animationFrameId = requestAnimationFrame(animateClock);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameEnded]);

  // Finalização do jogo
  useEffect(() => {
    if (progress >= 100 && !isFinishing.current) {
      isFinishing.current = true;

      console.log("🏁 Finalizando jogo - progresso 100% (CHAMADA ÚNICA)");

      const tempoFinal = Math.max(0, gameTime);
      console.log(`⏱️ Tempo enviado para sincronização: ${tempoFinal} segundos`);

      syncGameMutation.mutate({ tempo_decorrido_segundos: tempoFinal });
    }
  }, [progress, gameTime]);

  const checkGameOver = () => {
    if (!gameLoaded || gameEnded) {
      return false;
    }

    console.log("🔍 Verificando Game Over - Combustível:", currentFuel, "Dinheiro:", money);

    if (currentFuel <= 0) {
      console.log("🚨 Game Over: Combustível esgotado - currentFuel:", currentFuel);
      gamePaused.current = true;
      setGameEnded(true);

      // Finalizar jogo via backend para obter resultados
      const tempoFinal = Math.max(0, gameTime);
      console.log("🔄 Chamando syncGameMutation para finalizar por combustível...");
      syncGameMutation.mutate({ tempo_decorrido_segundos: tempoFinal });
      return true;
    }

    if (money <= 0) {
      console.log("🚨 Game Over: Sem recursos financeiros - money:", money);
      gamePaused.current = true;
      setGameEnded(true);

      // Finalizar jogo via backend para obter resultados
      const tempoFinal = Math.max(0, gameTime);
      console.log("🔄 Chamando syncGameMutation para finalizar por dinheiro...");
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
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMapModalToggle = () => {
    setShowMapModal(!showMapModal);
  };

  const calculatePathProgress = (deltaTime: number) => {
    if (!selectedRoute?.pathCoordinates || selectedRoute.pathCoordinates.length < 2) {
      console.log("Usando fallback - sem pathCoordinates");
      return calculateFallbackProgress(deltaTime);
    }

    const pathCoords = selectedRoute.pathCoordinates;
    const totalSegments = pathCoords.length - 1;

    const targetDurationSeconds = 600;
    const segmentsPerSecond = totalSegments / targetDurationSeconds;
    //Aplica o multiplicador de velocidade ao progresso
    const segmentSpeed = segmentsPerSecond * speedMultiplierRef.current * deltaTime;

    pathProgressRef.current += segmentSpeed;

    if (pathProgressRef.current >= 1.0 && currentPathIndexRef.current < totalSegments - 1) {
      currentPathIndexRef.current += 1;
      setCurrentPathIndex(currentPathIndexRef.current);
      pathProgressRef.current = 0;
    }

    const totalProgress = (currentPathIndexRef.current + pathProgressRef.current) / totalSegments;
    const progressPercent = Math.min(100, Math.max(0, totalProgress * 100));

    return progressPercent;
  };

  const calculateFallbackProgress = (deltaTime: number) => {
    const routeDistance = totalDistance || 500;
    //Aplica o multiplicador de velocidade ao progresso
    distanceTravelled.current += deltaTime * gameSpeedMultiplier.current * 0.2 * speedMultiplierRef.current;
    const progressKm = (distanceTravelled.current * routeDistance) / 5000;
    return Math.min(100, Math.max(0, (progressKm / routeDistance) * 100));
  };

  const getVehicleImageUrl = (vehicleImage: string) => {
    console.log("Convertendo imagem do veículo:", vehicleImage);

    if (vehicleImage.startsWith('/assets/')) {
      console.log("Já é uma URL pública:", vehicleImage);
      return vehicleImage;
    }

    if (vehicleImage.startsWith('/src/assets/')) {
      const fileName = vehicleImage.replace('/src/assets/', '');
      console.log("Nome do arquivo extraído de /src/assets/:", fileName);
      return `/assets/${fileName}`;
    }

    const fileName = vehicleImage.split('/').pop()?.split('?')[0];
    console.log("Nome do arquivo extraído da URL:", fileName);

    const imageMap: { [key: string]: string } = {
      'caminhao_medio.png': '/assets/caminhao_medio.png',
      'caminhao_pequeno.png': '/assets/caminhao_pequeno.png',
      'caminhonete.png': '/assets/caminhonete.png',
      'carreta.png': '/assets/carreta.png',
      'truck.png': '/assets/truck.png'
    };

    if (fileName && imageMap[fileName]) {
      console.log("URL encontrada no mapeamento:", imageMap[fileName]);
      return imageMap[fileName];
    }

    console.log("Usando fallback truck.png");
    return '/assets/truck.png';
  };

  const handleCloseResultModal = () => {
    setIsResultModalOpen(false);

    // Limpar e continuar o jogo (movido do onSuccess)
    setShowPopup(false);
    setActiveEvent(null);
    setIsResponding(false);
    processingEvent.current = false;
    gamePaused.current = false;
    collidedObstacle.current = null;

    obstacleTimerRef.current = -8;
    collisionCooldownRef.current = 3.0;

    console.log("✅ Evento principal concluído, liberando quizzes.");
    setIsMainEventActive(false); // ✅ ADICIONE A LINHA AQUI

    setTimeout(() => {
      obstacleSystemLockedRef.current = false;
      console.log('🔓 Sistema de obstáculos destravado após evento');
    }, 8000);
  };

  useEffect(() => {
    if (gameEnded) {
      console.log("Jogo finalizado. Mostrando mensagem final.");
      localStorage.removeItem('savedGameProgress');
      setShowEndMessage(true);
    }
  }, [gameEnded]);

  useEffect(() => {
    isQuizActiveRef.current = isQuizActive;
  }, [isQuizActive]);
  // 6. ADICIONE UM `useEffect` PARA GARANTIR A PRIORIDADE DOS EVENTOS PRINCIPAIS
  useEffect(() => {
    // COMPORTAMENTO CRÍTICO: Se um evento principal se torna ativo, o quiz deve ser fechado IMEDIATAMENTE
    // NOTE: Será que não seria melhor esperar a resposta do quiz para aparecer o evento? (com delay de algusn segundos)
    if (isMainEventActive && isQuizActive) {
      console.warn("🚨 Evento principal tem prioridade! Fechando o quiz ativo.");
      handleCloseQuiz();
    }
  }, [isMainEventActive, isQuizActive]);

  // ============= RENDER DO COMPONENTE =============

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

      {/* Indicador de carregamento */}
      {!gameLoaded && !loadingError && (
        <div style={{
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
          fontSize: "18px"
        }}>
          <div>🎮 Carregando jogo...</div>
          <div style={{ fontSize: "14px", marginTop: "10px" }}>
            Veículo: {vehicle.name}
          </div>
          {createGameMutation.isPending && (
            <div style={{ fontSize: "12px", marginTop: "5px", color: "#00ff00" }}>
              📄 Criando partida no servidor...
            </div>
          )}
        </div>
      )}

      {/* Indicador de erro */}
      {loadingError && (
        <div style={{
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
          fontSize: "16px"
        }}>
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
              cursor: "pointer"
            }}
          >
            Recarregar
          </button>
        </div>
      )}

      {/* Botão de pausa e salvamento */}
      <div style={{
        position: "fixed",
        top: "2vh",
        left: "2vw",
        zIndex: 1000
      }}>
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
            height: "min(6vh, 50px)"
          }}
          title="Pausar e Salvar Progresso"
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#FFC06F"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#E3922A"}
        >
          <img
            src="src/assets/pausa.png"
            alt="Pausar"
            style={{
              width: 'min(3vh, 24px)',
              height: 'min(3vh, 24px)'
            }}
          />
        </button>
        <RadioToggle
          onClick={() => setIsRadioOpen(!isRadioOpen)}
          isRadioOpen={isRadioOpen}
        />
        <div style={{ 
            position: 'fixed', 
            top: '7.8rem',  
            left: '1.7rem' 
          }}>
            <AudioControl popupAlign="left"/>
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
            outline: "2px solid #000"
          }}
        >
          <TruckRadio
            isOpen={isRadioOpen}
            onClose={() => setIsRadioOpen(false)}
          />
        </div>
      )}
      

      {/* Barra de progresso */}
      <div style={{
        position: "fixed",
        top: "2vh",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
      }}>
        <PixelProgressBar progress={progress} />
      </div>

      {/* Container para minimapa e informações */}
      <div style={{
        position: "fixed",
        top: "2vh",
        right: "2vw",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: "1vh",
        alignItems: "flex-end",
        fontFamily: "'Silkscreen', monospace"
      }}>
        {/* Minimapa */}
        {selectedRoute?.pathCoordinates && (
          <div
            style={{
              width: "min(12vw, 180px)",
              height: "min(12vw, 180px)",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              borderRadius: "50%",
              overflow: "hidden",
              fontFamily: "'Silkscreen', monospace"
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

        {/* Informações do jogo */}
        <div style={{
          padding: "min(2vh, 15px)",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: "12px",
          width: "min(18vw, 220px)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          fontSize: "min(2vw, 16px)",
          fontFamily: "'Silkscreen', monospace"
        }}>
          <div style={{ fontSize: "16px", marginBottom: "10px", color: "#333" }}>
            💰 <strong>R$ {money.toFixed(2)}</strong>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "4px"
            }}>
              <span style={{ fontSize: "16px" }}>⛽</span>
              <div style={{
                height: "10px",
                width: "120px",
                backgroundColor: "#ddd",
                borderRadius: "5px",
                overflow: "hidden"
              }}>
                <div style={{
                  width: `${gasoline}%`,
                  height: "100%",
                  backgroundColor: gasoline > 30 ? "#00cc66" : gasoline > 15 ? "#ffaa00" : "#cc3300",
                  transition: "width 0.3s ease"
                }}></div>
              </div>
            </div>
            <div style={{ fontSize: "12px", color: "#666", paddingLeft: "24px" }}>
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
            <div style={{ fontSize: "12px", color: "#666", marginTop: "8px", borderTop: "1px solid #eee", paddingTop: "8px" }}>
              <div>{selectedRoute.name}</div>
              <div>{selectedRoute.distance} km</div>
            </div>
          )}

          {/* Indicador de partida ativa */}
          {activeGameId && (
            <div style={{ fontSize: "10px", color: "#0077cc", marginTop: "5px", textAlign: "center" }}>
              🎮 Partida #{activeGameId}
            </div>
          )}
        </div>
      </div>

      {/* ✅ MODIFICAÇÃO: PAINEL DE CONTROLE REMOVIDO, FICANDO APENAS O BOTÃO */}
      {gameLoaded && !showPopup && !isPaused && (
        <div style={{
          position: 'fixed',
          bottom: '4vh', // Ajuste na posição para compensar a falta do painel
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <button
            onClick={handleSpeedUp}
            style={{
              background: 'linear-gradient(180deg, #6fd250 0%, #3a9c1e 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 25px',
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: 'inset 0px -6px 0px rgba(0,0,0,0.3), 0px 4px 0px 0px #2a6f18',
              transition: 'all 0.1s ease-out',
              textShadow: '2px 2px 0px rgba(0,0,0,0.4)',
              letterSpacing: '1px',
              position: 'relative',
              outline: 'none',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(2px)';
              e.currentTarget.style.boxShadow = 'inset 0px -2px 0px rgba(0,0,0,0.3), 0px 2px 0px 0px #2a6f18';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = 'inset 0px -6px 0px rgba(0,0,0,0.3), 0px 4px 0px 0px #2a6f18';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = 'inset 0px -6px 0px rgba(0,0,0,0.3), 0px 4px 0px 0px #2a6f18';
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'linear-gradient(180deg, #87e96b 0%, #4cb82d 100%)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'linear-gradient(180deg, #6fd250 0%, #3a9c1e 100%)';
            }}
            title="Alterar Velocidade"
          >
            <span style={{ fontSize: '28px', lineHeight: '1', transform: 'translateY(-2px)' }}>▶️</span>
            <span>{speedMultiplierRef.current.toFixed(1)}x</span>
          </button>
        </div>
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
          zIndex: 1
        }}
      />

      {gameLoaded && (window as any).__kaboom_initiated__ && <RainEffect k={(window as any).k} />}

      {/* Modal de evento */}
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
            fontFamily: "'Silkscreen', monospace"
          }}
        >
          <div style={{
            backgroundColor: activeEvent.evento.categoria === 'perigo' ? '#ff4444' :
              activeEvent.evento.categoria === 'terreno' ? '#ff8800' : '#0077cc',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '10px',
            display: 'inline-block'
          }}>
            {activeEvent.evento.categoria === 'perigo' ? '⚠️ ZONA DE PERIGO' :
              activeEvent.evento.categoria === 'terreno' ? '🌄 ESTRADA DE TERRA' : '🛣️ EVENTO GERAL'}
          </div>

          <div className="font-[Silkscreen]" style={{ marginBottom: "10px" }}>
            <p style={{
              fontSize: "28px",
              color: "#333",
              marginBottom: "5px",
              fontWeight: "bold"
            }}>
              {activeEvent.evento.nome}
            </p>
            <p style={{
              fontSize: "16px",
              color: "#555"
            }}>
              {activeEvent.evento.descricao}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              flexWrap: "wrap",
              marginTop: "20px"
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
                  backgroundColor: index % 2 === 0 ? "#0077cc" : "#e63946",
                  color: "white",
                  fontSize: "14px",
                  cursor: isResponding ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  minWidth: "200px",
                  textAlign: "center",
                  lineHeight: "1.4",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  opacity: isResponding ? 0.6 : 1
                }}
                onMouseOver={(e) => {
                  if (!isResponding) {
                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#005fa3" : "#c92a2a";
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.3)";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isResponding) {
                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#0077cc" : "#e63946";
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
                  }
                }}
              >
                {isResponding && respondToEventMutation.isPending ? (
                  "⏳ Processando..."
                ) : (
                  opcao.descricao
                )}
              </button>
            ))}
          </div>

          {isResponding && (
            <div style={{
              marginTop: "15px",
              fontSize: "14px",
              color: "#666",
              fontStyle: "italic"
            }}>
              📄 Enviando sua escolha para o servidor...
            </div>
          )}
        </div>
      )}

      {/* Mensagem de fim de jogo */}
      {showEndMessage && finalGameResults && (
        <div
          className="endMessage"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            border: '3px solid #000',
            borderRadius: '15px',
            padding: '30px',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            zIndex: 2000,
            maxWidth: '500px',
            width: '90%'
          }}
        >
          <h2 style={{
            color: finalGameResults.resultado === 'vitoria' ? "#00cc66" : "#cc3300",
            marginBottom: "20px",
            fontFamily: "'Silkscreen', monospace"
          }}>
            {finalGameResults.resultado === 'vitoria' ? '🏁 Viagem Concluída! 🏁' : '❌ Fim de Jogo ❌'}
          </h2>

          <p style={{ fontSize: "16px", marginBottom: "25px", fontWeight: "bold" }}>
            {finalGameResults.motivo_finalizacao}
          </p>

          <div style={{
            backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "10px",
            marginBottom: "25px", textAlign: "left", border: "2px solid #e9ecef"
          }}>
            <h3 style={{ margin: "0 0 15px 0", color: "#333", textAlign: "center", fontFamily: "'Silkscreen', monospace" }}>
              📊 Resultados Finais
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div><strong>🎯 Eficiência:</strong><br /><span style={{ fontSize: "18px", color: "#0066cc" }}>{finalGameResults.eficiencia?.toFixed(1) || '0.0'}%</span></div>
              <div><strong>💯 Pontuação:</strong><br /><span style={{ fontSize: "18px", color: "#0066cc" }}>{finalGameResults.pontuacao} pts</span></div>
              <div><strong>💰 Saldo Final:</strong><br /><span style={{ fontSize: "16px" }}>R$ {finalGameResults.saldo.toFixed(2)}</span></div>
              <div><strong>📦 Carga:</strong><br /><span style={{ fontSize: "16px" }}>{finalGameResults.quantidade_carga} / {finalGameResults.quantidade_carga_inicial} un.</span></div>
            </div>
            <div style={{ marginTop: "15px", textAlign: "center" }}>
              <strong>⏱️ Tempo Total:</strong> {formatTime(finalGameResults.tempo_real * 60)}
            </div>
          </div>

          <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate('/ranking')}
              style={{
                padding: "12px 24px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold"
              }}
            >
              🏆 Ver Ranking
            </button>
            <button
              onClick={() => navigate('/game-selection')}
              style={{
                padding: "12px 24px",
                backgroundColor: "#0077cc",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold"
              }}
            >
              🚚 Nova Viagem
            </button>
            <button
              onClick={() => navigate('/perfil')}
              style={{
                padding: "12px 24px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              👤 Perfil
            </button>
          </div>
        </div>
      )}

      {/* Overlay de carregamento durante finalização */}
      {syncGameMutation.isPending && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            border: '2px solid #000'
          }}>
            <div style={{ marginBottom: '10px', fontSize: '24px' }}>⏳</div>
            <p style={{ margin: 0, fontSize: '16px' }}>Finalizando partida...</p>
          </div>
        </div>
      )}

      {/* Modal do Mapa Completo */}
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
            padding: "20px"
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
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                padding: '15px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxSizing: 'border-box',
                zIndex: 9999,
              }}
            >
              <div
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  padding: '10px 15px',
                  borderRadius: '5px',
                  fontFamily: '"Silkscreen", monospace',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              >
                🗺️ {selectedRoute.name}
              </div>
              <button
                onClick={handleMapModalToggle}
                style={{
                  backgroundColor: '#e63946',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  height: '45px',
                  width: '45px', // Corrigido para ser um círculo perfeito
                  fontSize: '20px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  flexShrink: 0,
                  marginLeft: '15px',
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
                  totalProgress: progress
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Menu de pausa */}
      <PauseMenu
        isVisible={isPaused}
        onResume={togglePause}
        onRestart={handleRestart}
        onGoToProfile={handleGoToProfile}
      />

      {/* Modal de resultado do evento */}
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
