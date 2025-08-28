// src/pages/Game-truck/game.tsx - ARQUIVO COMPLETO CORRIGIDO
import { useCallback, useEffect, useRef, useState } from "react";
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
  SpriteComp,
  PosComp,
  ZComp,
  AreaComp,
  BodyComp,
  ScaleComp
} from "kaboom";

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

  // 🔥 PROTEÇÃO CONTRA DUPLA EXECUÇÃO E STRICTMODE

  // REFs DE CONTROLE DE EVENTOS
  const lastEventCheckKm = useRef(0);
  const activeGameIdRef = useRef<number | null>(null);
  const isFinishing = useRef(false);// REF PARA STALE CLOSURE

  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [playerChoice, setPlayerChoice] = useState<string | null>(null);
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

  const [gameTime, setGameTime] = useState(0);
  const [finalGameResults, setFinalGameResults] = useState<PartidaData | null>(null);
  const [currentFuel, setCurrentFuel] = useState<number>(() => {
    const fuel = location.state?.selectedVehicle?.currentFuel || 0;
    return fuel;
  });
  // ✅ CORREÇÃO: Ref para manter valor atual do combustível no loop do Kaboom
  const currentFuelRef = useRef<number>(location.state?.selectedVehicle?.currentFuel || 0);
  const [totalDistance, setTotalDistance] = useState<number>(500);

  // ✅ CORREÇÃO: Função helper para atualizar combustível (estado + ref)
  const updateCurrentFuel = useCallback((newFuel: number) => {
    setCurrentFuel(newFuel);
    currentFuelRef.current = newFuel;
  }, []);

  const [showMapModal, setShowMapModal] = useState(false);
  const [fuelWarning, setFuelWarning] = useState<string | null>(null);

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
    console.log("💰 Inicializando dinheiro - valor recebido:", money);
    console.log("💰 Tipo do valor:", typeof money);
    console.log("💰 Valor final usado:", money !== undefined ? money : 1000);
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
      vehicleFuel: location.state?.selectedVehicle?.currentFuel,
      route: location.state?.selectedRoute?.name,
      hasPathCoordinates: !!location.state?.selectedRoute?.pathCoordinates,
      pathCoordinatesLength: location.state?.selectedRoute?.pathCoordinates?.length || 0,
      money: location.state?.availableMoney,
      savedProgress: !!location.state?.savedProgress
    });

    console.log("=== ESTADO COMPLETO RECEBIDO NO GAME ===");
    console.log("location.state completo:", location.state);
    console.log("selectedVehicle:", location.state?.selectedVehicle);
    console.log("availableMoney:", location.state?.availableMoney);
    console.log("selectedRoute:", location.state?.selectedRoute);
    console.log("=======================================");
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

      // ATUALIZE AMBOS, O ESTADO E A REF
      setActiveGameId(partida.id);           // Atualiza o estado para a UI do React
      activeGameIdRef.current = partida.id;  // Atualiza a ref para o loop do Kaboom

      // ✅ CORREÇÃO: Sincronizar apenas se os valores do frontend forem inválidos
      
      // Só atualizar se os valores do frontend forem inválidos (0 ou undefined)
      if (money === 0 || money === undefined || money === 1000) {
        setMoney(partida.saldo);
      }

      if (currentFuelRef.current === 0 || currentFuelRef.current === undefined) {
        updateCurrentFuel(partida.combustivel_atual);
      }

      console.log('🔗 activeGameIdRef definido como:', activeGameIdRef.current);

      // ✅ CORREÇÃO CRÍTICA: Verificar se combustível é zero após criar partida
      if (currentFuelRef.current <= 0) {
        // Pausar o jogo imediatamente
        gamePaused.current = true;
        
        // Aguardar um pequeno delay para garantir que a partida foi criada
        setTimeout(() => {
          if (!isFinishing.current) {
            checkGameOver();
          }
        }, 500); // 500ms de delay para garantir que a partida foi completamente criada
      }
    },
    onError: (error) => {
      console.error('❌ Erro ao criar partida:', error);
      alert('Não foi possível iniciar o jogo. Tente novamente.');
      navigate('/routes');
    }
  });

  // ✅ NOVA MUTAÇÃO: Para atualizar progresso durante o jogo
  const updateProgressMutation = useMutation({
    mutationFn: (progressData: { 
      distancia_percorrida?: number; 
      combustivel_atual?: number; 
      tempo_jogo_segundos?: number 
    }) => GameService.updateGameProgress(progressData),
    onSuccess: (partida) => {
      console.log('📊 Progresso sincronizado com backend:', {
        distancia: partida.distancia_percorrida,
        combustivel: partida.combustivel_atual,
        tempo: partida.tempo_jogo
      });
    },
    onError: (error) => {
      console.error('❌ Erro ao sincronizar progresso:', error);
      // Não interromper o jogo por erro de sincronização
    }
  });

  // ============= MUTAÇÃO CORRIGIDA PARA BUSCAR EVENTOS =============
  const fetchNextEventMutation = useMutation({
    mutationFn: (distancia: number) => GameService.getNextEvent(distancia),
    onSuccess: (data) => {
      // onSuccess agora só é chamado para eventos reais (HTTP 200 com dados válidos)
      if (data && data.evento) {
        console.log('🎲 Evento recebido do backend:', data.evento.nome, '(categoria:', data.evento.categoria + ')');
        setActiveEvent(data);
        setShowPopup(true);
        // O jogo permanece pausado até o jogador responder
        // processingEvent.current permanece true até a resposta
      } else {
        // Caso de segurança - não deveria acontecer com a nova lógica
        console.warn('⚠️ onSuccess chamado com dados inválidos, resetando estado');
        processingEvent.current = false;
        gamePaused.current = false;
      }
    },
    onError: (error: any) => {
      console.warn('⚠️ Erro ao buscar evento:', error);

      // ✅ CORREÇÃO CRÍTICA: Trata 'NO_EVENT_AVAILABLE' como um caso normal
      if (error.message === 'NO_EVENT_AVAILABLE') {
        console.log('ℹ️ Nenhum evento desta vez (NORMAL) - continuando jogo');

        // ====== LIMPEZA COMPLETA DE ESTADO (crítico para continuar o jogo) ======
        setActiveEvent(null);
        setShowPopup(false);
        setIsResponding(false);
        gamePaused.current = false;
        processingEvent.current = false;
        collidedObstacle.current = null;

        // Reset do sistema de obstáculos para dar tempo ao jogador
        obstacleTimerRef.current = -3;
        collisionCooldownRef.current = 1.5;
        // =====================================================================

        return; // ✅ IMPORTANTE: Return aqui para não executar a lógica de erro
      }

      // ====== TRATAMENTO DE ERROS REAIS ======
      console.error('❌ Erro real detectado:', error.message);

      // Limpeza padrão para todos os erros reais
      setActiveEvent(null);
      setShowPopup(false);
      setIsResponding(false);
      gamePaused.current = false;
      processingEvent.current = false;
      collidedObstacle.current = null;

      // ✅ CORREÇÃO: Diferentes estratégias baseadas no tipo de erro
      if (error.message === 'INVALID_REQUEST') {
        console.warn('⚠️ Request inválido, aguardando próximo checkpoint');
        lastEventCheckKm.current += 10; // Pula 10km para evitar spam
      } else if (error.message === 'SERVER_ERROR' || error.message === 'NETWORK_ERROR') {
        console.error('💥 Erro de servidor/rede, aguardando recuperação');
        lastEventCheckKm.current += 30; // Pula 30km para dar tempo ao servidor
      } else if (error.message === 'INVALID_API_RESPONSE') {
        console.error('💥 API retornou dados inválidos');
        lastEventCheckKm.current += 15; // Pula 15km
      } else {
        console.error('❌ Erro não categorizado:', error.message);
        lastEventCheckKm.current += 15; // Pula 15km por segurança
      }

      // Reset de segurança do sistema de obstáculos
      obstacleTimerRef.current = -5;
      collisionCooldownRef.current = 2.0;

      // ✅ IMPORTANTE: Destravar sistema após tempo mais curto para erros reais
      setTimeout(() => {
        obstacleSystemLockedRef.current = false;
        console.log('🔓 Sistema de obstáculos destravado após erro de evento');
      }, 3000); // ✅ Reduzido para 3 segundos
    }
  });

  // Mutação para responder ao evento
  const respondToEventMutation = useMutation({
    mutationFn: ({ optionId, combustivelAtual }: { optionId: number; combustivelAtual?: number }) => 
      GameService.respondToEvent(optionId, combustivelAtual),
    onSuccess: (data) => {
      const updatedPartida = data.partida;
      console.log('✅ Resposta processada pelo backend:', data.detail);
      console.log('📊 Partida atualizada:', {
        saldo: updatedPartida.saldo,
        combustivel: updatedPartida.combustivel_atual,
        tempo: updatedPartida.tempo_real
      });

      // Sincronizar estado do frontend com a resposta do backend
      setMoney(updatedPartida.saldo);
      updateCurrentFuel(updatedPartida.combustivel_atual);

      // Atualizar outros estados se necessário
      if (updatedPartida.tempo_jogo !== undefined) {
        // O backend nos envia 'tempo_jogo' em minutos.
        // Convertemos para segundos e garantimos que seja no mínimo 0.
        const newTimeInSeconds = Math.max(0, Math.round(updatedPartida.tempo_jogo * 60));
        setGameTime(newTimeInSeconds);
        console.log(`⏱️ Tempo da partida atualizado pelo servidor para: ${formatTime(newTimeInSeconds)}`);
      }

      // Mostrar resultado do evento
      if (data.detail && data.detail !== "Sua decisão foi processada.") {
        alert(`📋 Resultado: ${data.detail}`);
      }

      // Limpar e continuar o jogo
      setShowPopup(false);
      setActiveEvent(null);
      setIsResponding(false);
      processingEvent.current = false;
      gamePaused.current = false;
      collidedObstacle.current = null;

      // Resetar timer de obstáculos para dar tempo ao jogador
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

  // ============= FUNÇÕES ORIGINAIS MANTIDAS =============
  const syncGameMutation = useMutation({
    mutationFn: (progressData: { 
      tempo_decorrido_segundos: number;
      combustivel_atual?: number;
      saldo_atual?: number;
      distancia_percorrida?: number;
      forcar_game_over?: boolean;
    }) => GameService.syncGameProgress(progressData),
    onSuccess: (updatedPartida: PartidaData) => {
      console.log("✅ Progresso sincronizado!", updatedPartida);
      console.log("📊 Status da partida:", updatedPartida.status);
      console.log("🏆 Resultado da partida:", updatedPartida.resultado);
      console.log("💾 Partida salva no banco com ID:", updatedPartida.id);

      if (updatedPartida.status === 'concluido') {
        console.log("🏁 PARTIDA FINALIZADA! Resultados:", updatedPartida);
        console.log("🎯 Motivo da finalização:", updatedPartida.motivo_finalizacao);
        setFinalGameResults(updatedPartida);
        setGameEnded(true);
        setShowEndMessage(true);
        gamePaused.current = true;
      }
    },
    onError: (error) => {
      console.error("❌ Erro ao sincronizar jogo:", error);
      alert("Houve um erro ao finalizar a partida. Tente novamente.");
    }
  });

  const togglePause = () => {
    const nextPausedState = !gamePaused.current;
    gamePaused.current = nextPausedState;
    setIsPaused(nextPausedState);
    console.log(`Jogo ${nextPausedState ? "pausado" : "despausado"}`);
    
    // ✅ NOVO: Sincronizar com backend quando pausar o jogo
    if (nextPausedState && activeGameIdRef.current && !updateProgressMutation.isPending) {
      const distanciaAtualKm = (progressRef.current / 100) * totalDistance;
      console.log("🔄 Sincronizando progresso devido à pausa do jogo");
      updateProgressMutation.mutate({
        distancia_percorrida: distanciaAtualKm,
        combustivel_atual: currentFuelRef.current,
        tempo_jogo_segundos: gameTime
      });
    }
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
      // manualTimeAdjustment REMOVIDO
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
      // manualTimeAdjustment REMOVIDO
      timestamp: Date.now(),
      activeGameId: activeGameIdRef.current
    };
    localStorage.setItem('savedGameProgress', JSON.stringify(gameProgress));
    togglePause();
  };

  // ============= FUNÇÃO PARA RESPONDER EVENTOS =============

  const handleOptionClick = (optionId: number) => {
    if (isResponding) return;

    console.log("🎯 Processando escolha do evento - Opção ID:", optionId);
    setIsResponding(true);
    
    // ✅ CORREÇÃO: Enviar combustível atual para evitar dessincronia
    const combustivelAtual = currentFuelRef.current;
    
    respondToEventMutation.mutate({ 
      optionId, 
      combustivelAtual 
    });
  };


  const initializeGame = async (savedProgress?: any) => {
    // Verificações iniciais para garantir que o ambiente está pronto
    if (!vehicle || !vehicle.name || !vehicle.spriteSheet) {
      console.error("Dados do veículo incompletos ou não encontrados. Verifique o fallback e a navegação.", vehicle);
      setLoadingError("Dados do veículo incompletos para iniciar o jogo.");
      return;
    }
    if (!canvasRef.current) {
      setTimeout(() => initializeGame(savedProgress), 100);
      return;
    }
    if ((window as any).__kaboom_initiated__) {
      (window as any).__kaboom_initiated__ = false;
    }

    console.log("Iniciando jogo com veículo:", vehicle.name, "Sprite Sheet:", vehicle.spriteSheet);

    handleResizeRef.current = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    try {
      // A tela de loading já está ativa, aqui preparamos a instância do Kaboom
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
        loadSprite, scene, go, add, sprite, pos, area, body, width,
        height, dt, onUpdate, z, scale, destroy, get, loop, rand, choose,
        move, tween, easings, LEFT, RIGHT, camScale, camPos, vec2, opacity
      } = k;

      destroyRef.current = destroy;

      // ---- CARREGAMENTO SEGURO DE TODOS OS SPRITES ----
      console.log("Iniciando carregamento de todos os sprites...");

      await Promise.all([
        loadSprite("background_cidade", "/assets/background-cidade.png"),
        loadSprite("background_terra", "/assets/background-terra.png"),
        loadSprite("car", vehicle.spriteSheet, {
          sliceX: 2,
          sliceY: 1,
          anims: { run: { from: 0, to: 1, loop: true, speed: 8 } },
        }),
        loadSprite("carro_1", "/assets/carro_trafego_1.png"),
        loadSprite("carro_2", "/assets/carro_trafego_2.png"),
        loadSprite("carro_3", "/assets/carro_trafego_3.png"),
        loadSprite("carro_4", "/assets/carro_trafego_4.png"),
        loadSprite("carro_5", "/assets/carro_trafego_5.png"),
        loadSprite("carro_6", "/assets/carro_trafego_6.png"),
        loadSprite("carro_7", "/assets/carro_trafego_7.png"),
        loadSprite("carro_8", "/assets/carro_trafego_8.png"),
        loadSprite("moto_1", "/assets/moto_trafego_1.png"),
      ]);

      console.log("✅ Todos os sprites foram COMPLETAMENTE carregados.");

      // ---- DEFINIÇÃO DA CENA PRINCIPAL ----
      scene("main", () => {
        const speed = 5000;

        const LARGURA_ORIGINAL_BG = 2048; // Largura correta da sua imagem
        const ALTURA_ORIGINAL_BG = 762;   // Altura correta

        const bgScaleX = width() / LARGURA_ORIGINAL_BG;
        const bgScaleY = height() / ALTURA_ORIGINAL_BG;
        const bgScale = Math.max(bgScaleX, bgScaleY);

        const bgOffsetY = -height() * 0.05;
        const bgWidth = LARGURA_ORIGINAL_BG * bgScale; // Usa a variável correta

        let currentBg = 'cidade';
        let nextBg: 'cidade' | 'terra' | null = null;
        let backgroundSwitchTimer = rand(2, 4);
        let transitionProgress = 0; // 0 = apenas atual, 1 = apenas próximo
        let isTransitioning = false;
        let transitionCooldown = 0; // Pequena pausa após transição para estabilizar
        const TRANSITION_DURATION = 5; // segundos para completar a transição
        const COOLDOWN_DURATION = 0.1; // 100ms de pausa após transição

        const ZOOM_CONFIG = {
          MAX_ZOOM: 1.5,      // AJUSTE AQUI: O nível máximo de zoom (1.5 = 150%)
          LEAD_IN_TIME: 0.5,  // AJUSTE AQUI: Segundos que o zoom começa ANTES do fade
          LEAD_OUT_TIME: 1.0, // AJUSTE AQUI: Segundos que o zoom continua DEPOIS do fade
        };
        const ZOOM_TOTAL_DURATION = ZOOM_CONFIG.LEAD_IN_TIME + TRANSITION_DURATION + ZOOM_CONFIG.LEAD_OUT_TIME;

        // Função para suavizar a transição (ease-in-out)
        const easeInOutCubic = (t: number): number => {
          return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        };

        // ========== SISTEMA DE ZOOM CINEMATOGRÁFICO ==========
        let zoomEffect = {
          isActive: false,
          progress: 0,
          // ✅ MUDANÇA: Usa a nova duração total calculada
          duration: ZOOM_TOTAL_DURATION,
          // ✅ MUDANÇA: Usa o novo nível de zoom da configuração
          maxZoom: ZOOM_CONFIG.MAX_ZOOM,
          originalZoom: 1.0,
        };

        // Função para aplicar zoom cinematográfico CORRIGIDA
        const applyZoomEffect = () => {
          if (!zoomEffect.isActive) return;

          zoomEffect.progress += dt() / zoomEffect.duration;
          let currentZoom = zoomEffect.originalZoom;

          // Atingimos o final do efeito
          if (zoomEffect.progress >= 1.0) {
            zoomEffect.isActive = false;
            zoomEffect.progress = 0;

            // Restaura a câmera para o estado padrão
            camScale(vec2(1.0));
            camPos(k.center());

            console.log("🎬 Efeito de zoom de transição finalizado!");
            return;
          }

          // ✅ NOVA LÓGICA DE ZOOM: Sem pausa no meio
          if (zoomEffect.progress < 0.5) {
            // FASE 1: ZOOM IN (da metade 0% a 50% do tempo)
            // 't' vai de 0 a 1 durante a primeira metade do progresso
            const t = zoomEffect.progress / 0.5;
            currentZoom = zoomEffect.originalZoom + (zoomEffect.maxZoom - zoomEffect.originalZoom) * easeInOutCubic(t);
          } else {
            // FASE 2: ZOOM OUT (da metade 50% a 100% do tempo)
            // 't' vai de 0 a 1 durante a segunda metade do progresso
            const t = (zoomEffect.progress - 0.5) / 0.5;
            currentZoom = zoomEffect.maxZoom - (zoomEffect.maxZoom - zoomEffect.originalZoom) * easeInOutCubic(t);
          }

          // Aplica o zoom
          camScale(vec2(currentZoom));

          // Calcula a posição correta da câmera para focar embaixo (mesma lógica de antes)
          const centerX = width() / 2;
          const centerY = height() / 2;
          const yOffset = (centerY * 0.5) * (currentZoom - 1);
          // NOVO: Calcula o deslocamento horizontal para a esquerda
          const xOffset = (centerX * -0.9) * (currentZoom - 1);

          // MUDANÇA: Define a nova posição da câmera com AMBOS os deslocamentos
          camPos(centerX + xOffset, centerY + yOffset);
        };


        // Função para iniciar o efeito de zoom
        const startZoomEffect = () => {
          console.log("🎬 Iniciando efeito de zoom cinematográfico!");
          zoomEffect.isActive = true;
          zoomEffect.progress = 0;
        };

        // Criar backgrounds com opacity inicial
        const bg_cidade_1 = add([sprite("background_cidade"), pos(0, bgOffsetY), scale(bgScale), z(0), "bg_cidade", opacity(1)]);
        const bg_cidade_2 = add([sprite("background_cidade"), pos(bgWidth, bgOffsetY), scale(bgScale), z(0), "bg_cidade", opacity(1)]);
        const bg_terra_1 = add([sprite("background_terra"), pos(0, bgOffsetY), scale(bgScale), z(0), "bg_terra", opacity(0)]);
        const bg_terra_2 = add([sprite("background_terra"), pos(bgWidth, bgOffsetY), scale(bgScale), z(0), "bg_terra", opacity(0)]);

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
          if (gamePaused.current) return;
          if (get("traffic_car").length > 0) return;

          const carSprite = choose(trafficCarSprites);
          const carType = choose(["ultrapassagem", "contramao"]);

          if (carType === "contramao") {
            const startX = width() + 150;
            const carSpeed = speed * rand(0.2, 0.3);
            add([sprite(carSprite, { flipX: true }), pos(startX, lane_contramao), scale(scaleFactor * 1.6), move(LEFT, carSpeed), "traffic_car", z(1), { behavior: "contramao" }]);
          } else {
            const startX = -250;
            const carSpeed = speed * rand(0.05, 0.1);
            add([sprite(carSprite, { flipX: false }), pos(startX, lane_contramao), scale(scaleFactor * 1.7), move(RIGHT, carSpeed), "traffic_car", z(1), { isChangingLane: false, behavior: "ultrapassagem" }]);
          }
        });

        onUpdate("traffic_car", (trafficCar: any) => {
          if (trafficCar.behavior === "ultrapassagem" && !trafficCar.isChangingLane && trafficCar.pos.x > (car.pos.x + car.width - 150)) {
            trafficCar.isChangingLane = true;
            tween(trafficCar.pos.y, lane_mesmo_sentido, 0.9, (newY) => trafficCar.pos.y = newY, easings.easeInOutQuad);
          }
          if (trafficCar.pos.x < -trafficCar.width || trafficCar.pos.x > width() + trafficCar.width) {
            destroy(trafficCar);
          }
        });

        onUpdate(() => {
          if (gamePaused.current) return;
          const deltaTime = dt();
          const moveAmount = -speed * deltaTime;

          // ✨ APLICAR EFEITO DE ZOOM
          applyZoomEffect();

          get("bg_cidade").forEach((bg) => bg.move(moveAmount, 0));
          get("bg_terra").forEach((bg) => bg.move(moveAmount, 0));

          // Gerenciar cooldown
          if (transitionCooldown > 0) {
            transitionCooldown -= deltaTime;
          }

          // Garantir que sempre temos um background visível quando não há transição (apenas na inicialização)
          if (!isTransitioning && !nextBg && transitionProgress === 0 && transitionCooldown <= 0) {
            get(`bg_${currentBg}`).forEach(bg => {
              if (bg.opacity !== 1) bg.opacity = 1;
            });
            const otherBg = currentBg === 'cidade' ? 'terra' : 'cidade';
            get(`bg_${otherBg}`).forEach(bg => {
              if (bg.opacity !== 0) bg.opacity = 0;
            });
          }

          if (bg_cidade_1.pos.x + bgWidth <= 0) if (nextBg !== 'cidade') bg_cidade_1.pos.x = bg_cidade_2.pos.x + bgWidth;
          if (bg_cidade_2.pos.x + bgWidth <= 0) if (nextBg !== 'cidade') bg_cidade_2.pos.x = bg_cidade_1.pos.x + bgWidth;
          if (bg_terra_1.pos.x + bgWidth <= 0) if (nextBg !== 'terra') bg_terra_1.pos.x = bg_terra_2.pos.x + bgWidth;
          if (bg_terra_2.pos.x + bgWidth <= 0) if (nextBg !== 'terra') bg_terra_2.pos.x = bg_terra_1.pos.x + bgWidth;

          // Sistema de transição suave com opacity
          if (isTransitioning && nextBg) {
            transitionProgress += deltaTime / TRANSITION_DURATION;

            if (transitionProgress >= 1) {
              // Transição completa - aplicar estado final de uma só vez
              transitionProgress = 0; // Reset para próxima transição
              isTransitioning = false;

              // Trocar os backgrounds de forma direta
              const newCurrentBg = nextBg;
              const oldBg = currentBg;

              // Aplicar opacities finais
              get(`bg_${newCurrentBg}`).forEach(bg => { bg.opacity = 1; });
              get(`bg_${oldBg}`).forEach(bg => { bg.opacity = 0; });

              currentBg = newCurrentBg;
              nextBg = null;
              transitionCooldown = COOLDOWN_DURATION; // Iniciar cooldown

              console.log(`Transição suave completa! Novo cenário é ${currentBg}`);
              console.log("Estado final - Cidade opacity:", get("bg_cidade")[0]?.opacity, "Terra opacity:", get("bg_terra")[0]?.opacity);
            }

            // Aplicar opacity gradual com curva suave (apenas se ainda estivermos transitioning)
            if (isTransitioning && nextBg) {
              const easedProgress = easeInOutCubic(transitionProgress);
              const currentOpacity = 1 - easedProgress;
              const nextOpacity = easedProgress;

              get(`bg_${currentBg}`).forEach(bg => { bg.opacity = currentOpacity; });
              get(`bg_${nextBg}`).forEach(bg => { bg.opacity = nextOpacity; });
            }
          }

          backgroundSwitchTimer -= deltaTime;
          if (backgroundSwitchTimer <= 0 && !nextBg && !isTransitioning) {
            const shouldSwitchToTerra = (currentBg === 'cidade' && rand() < 0.3);
            const shouldSwitchToCidade = (currentBg === 'terra' && rand() < 0.8);

            if (shouldSwitchToTerra || shouldSwitchToCidade) {

              // ✅ PASSO 1: Inicia o zoom IMEDIATAMENTE
              startZoomEffect();

              // ✅ PASSO 2: Espera o tempo de "LEAD_IN" para iniciar o FADE do background
              k.wait(ZOOM_CONFIG.LEAD_IN_TIME, () => {
                if (shouldSwitchToTerra) {
                  nextBg = 'terra';
                  // ... código para posicionar o background de terra ...
                  bg_terra_1.pos.x = 0;
                  bg_terra_2.pos.x = bgWidth;
                  console.log("🎬 Iniciando FADE: cidade → terra");
                } else if (shouldSwitchToCidade) {
                  nextBg = 'cidade';
                  // ... código para posicionar o background de cidade ...
                  bg_cidade_1.pos.x = 0;
                  bg_cidade_2.pos.x = bgWidth;
                  console.log("🎬 Iniciando FADE: terra → cidade");
                }

                isTransitioning = true;
                transitionProgress = 0;
              });

              backgroundSwitchTimer = rand(15, 25);
            }
          }
          // Lógica de progresso, combustível e eventos...
          const progressPercent = calculatePathProgress(deltaTime);
          const previousProgress = progressRef.current;
          progressRef.current = progressPercent;
          if (Math.abs(progressPercent - progress) > 0.05) { setProgress(progressPercent); }
          const routeDistance = totalDistance || 500;
          const progressDelta = progressPercent - previousProgress;
          const distanceInKm = (progressDelta / 100) * routeDistance;

          // ✅ VERIFICAÇÃO ADICIONAL: Game over por combustível esgotado
          if (currentFuelRef.current <= 0 && !isFinishing.current && !gameEnded && activeGameIdRef.current) {
            gamePaused.current = true;
            requestAnimationFrame(() => {
              checkGameOver();
            });
            return; // Parar o loop se o combustível acabou
          }

          // ✅ CORREÇÃO: Melhor controle do consumo de combustível usando ref
          if (distanceInKm > 0) {
            const consumptionRate = (currentBg === 'cidade' ? vehicle.consumption.asphalt : vehicle.consumption.dirt) || 10;
            const fuelConsumption = distanceInKm / consumptionRate;

            const currentFuelValue = currentFuelRef.current; // ✅ Usar ref em vez do estado
            const calculatedFuel = currentFuelValue - fuelConsumption;
            const updatedFuel = Math.max(0, calculatedFuel);
            
            // ✅ CORREÇÃO: Atualizar tanto estado quanto ref
            updateCurrentFuel(updatedFuel);

            const newGasolinePercent = (updatedFuel / vehicle.maxCapacity) * 100;
            setGasoline(newGasolinePercent);

            // ✅ NOVO: Aviso visual quando combustível baixo
            const fuelPercent = (updatedFuel / vehicle.maxCapacity) * 100;
            if (fuelPercent <= 0) {
              setFuelWarning("💀 SEM COMBUSTÍVEL!");
            } else if (fuelPercent <= 5) {
              setFuelWarning("🚨 COMBUSTÍVEL ACABANDO!");
            } else if (fuelPercent <= 15 && fuelPercent > 5) {
              setFuelWarning("🚨 COMBUSTÍVEL CRÍTICO!");
            } else if (fuelPercent <= 25 && fuelPercent > 15) {
              setFuelWarning("⚠️ COMBUSTÍVEL BAIXO!");
            } else if (fuelPercent > 25) {
              setFuelWarning(null); // Limpar aviso quando combustível estiver ok
            }

            // ✅ OTIMIZADO: Sincronizar apenas a cada 10% de progresso (reduz carga no backend)
            const shouldSyncProgress = Math.floor(progressPercent / 10) !== Math.floor((progressPercent - progressDelta) / 10);

            if (shouldSyncProgress && activeGameIdRef.current && !updateProgressMutation.isPending) {
              const distanciaAtualKm = (progressPercent / 100) * totalDistance;
              console.log(`🔄 Sincronizando progresso a cada 10% - Atual: ${progressPercent.toFixed(1)}%`);
              updateProgressMutation.mutate({
                distancia_percorrida: distanciaAtualKm,
                combustivel_atual: updatedFuel,
                tempo_jogo_segundos: gameTime
              });
            }

            // ✅ CORREÇÃO: Verificar game over quando combustível acaba
            if (updatedFuel <= 0 && !isFinishing.current) {
              // Pausar o jogo imediatamente
              gamePaused.current = true;
              
              // Chamar checkGameOver com delay para evitar setState durante render
              requestAnimationFrame(() => {
                checkGameOver();
              });
            }
          }
          const EVENT_CHECK_INTERVAL_KM = 10;
          const distanciaAtualKm = (progressPercent / 100) * totalDistance;
          const canTriggerEvent = (activeGameIdRef.current && !processingEvent.current && !gamePaused.current && !activeEvent && !showPopup && !fetchNextEventMutation.isPending && distanciaAtualKm - lastEventCheckKm.current >= EVENT_CHECK_INTERVAL_KM);
          if (canTriggerEvent) {
            lastEventCheckKm.current = distanciaAtualKm;

            console.log(`📍 Checkpoint em ${distanciaAtualKm.toFixed(2)}km. Perguntando ao backend por eventos...`);

            // ✅ NOVO: Sincronizar progresso antes de buscar evento
            if (activeGameIdRef.current && !updateProgressMutation.isPending) {
              console.log("🔄 Sincronizando progresso antes de buscar evento");
              updateProgressMutation.mutate({
                distancia_percorrida: distanciaAtualKm,
                combustivel_atual: currentFuelRef.current,
                tempo_jogo_segundos: gameTime
              });
            }

            processingEvent.current = true;
            gamePaused.current = true;
            fetchNextEventMutation.mutate(distanciaAtualKm);
          }
        });
      });

      go("main");

      // ✅ CORREÇÃO: Aplicar progresso salvo ou valores padrão
      if (savedProgress) {
        console.log("🔄 Aplicando progresso salvo na inicialização...");
        console.log("🔄 Progresso salvo:", savedProgress.progress);
        
        setCurrentPathIndex(savedProgress.currentPathIndex || 0);
        currentPathIndexRef.current = savedProgress.currentPathIndex || 0;
        pathProgressRef.current = savedProgress.pathProgress || 0;
        progressRef.current = savedProgress.progress || 0;
        setProgress(savedProgress.progress || 0);
        distanceTravelled.current = ((savedProgress.progress || 0) / 100) * (totalDistance || 500) / gameSpeedMultiplier.current / 0.2 * 5000;
        
        console.log("✅ Progresso aplicado:", savedProgress.progress, "%");
      } else {
        console.log("✨ Iniciando jogo do zero...");
        
        setCurrentPathIndex(0);
        currentPathIndexRef.current = 0;
        pathProgressRef.current = 0;
        progressRef.current = 0;
        setProgress(0);
        distanceTravelled.current = 0;
      }
      
      obstacleTimerRef.current = 0;
      gamePaused.current = false;
      setGameLoaded(true);

      console.log("✅ Jogo inicializado com sucesso!");
      console.log("🔍 gameLoaded agora está:", true);
      console.log("✅ Jogo inicializado e cena 'main' iniciada.");

    } catch (error) {
      console.error("❌ Erro fatal durante a inicialização ou carregamento de sprites:", error);
      setLoadingError(`Falha ao carregar recursos do jogo. Verifique se todos os arquivos existem na pasta public/assets e se os nomes estão corretos.`);
      setGameLoaded(false);
      if ((window as any).__kaboom_initiated__) {
        (window as any).__kaboom_initiated__ = false;
      }
    }
  };
  // ============= USEEFFECT PRINCIPAL SIMPLIFICADO =============

  useEffect(() => {
    // Se o jogo já foi inicializado nesta montagem, não faz absolutamente nada.
    if (gameInitialized.current) {
      return;
    }
    // Tranca o portão para sempre na primeira execução.
    gameInitialized.current = true;

    console.log("🚀 Lógica de inicialização única está rodando...");

    const { selectedVehicle, selectedRoute: route, savedProgress } = location.state || {};

    // Validação de dados de entrada
    if (!selectedVehicle || !route?.id || !route?.mapaId) {
      console.error("❌ Dados insuficientes para criar partida. Redirecionando...");
      alert("Erro: Dados do veículo ou rota incompletos.");
      navigate('/routes');
      return;
    }

    // 1. Inicia o jogo Kaboom IMEDIATAMENTE.
    // A promessa de 'initializeGame' é resolvida e o jogo começa a carregar.
    initializeGame(savedProgress).then(() => {
      console.log("✅ Kaboom.js inicializado com sucesso.");

      // 2. SÓ DEPOIS que o Kaboom estiver pronto, tentamos criar a partida no backend.
      // Isso acontece em paralelo, sem travar a tela.
      if (savedProgress && savedProgress.activeGameId) {
        console.log("🟢 Restaurando partida existente com ID:", savedProgress.activeGameId);
        setActiveGameId(savedProgress.activeGameId);
        activeGameIdRef.current = savedProgress.activeGameId;
      } else {
        console.log("📡 Enviando requisição para criar partida no backend...");
        console.log("📡 Dados que serão enviados:", {
          mapa: route.mapaId,
          rota: route.id,
          veiculo: parseInt(selectedVehicle.id, 10) || 1,
          saldo_inicial: money,
          combustivel_inicial: currentFuelRef.current
        });

        // ✅ VERIFICAÇÃO: Se combustível for zero desde o início
        if (currentFuelRef.current <= 0) {
          // Mostrar aviso visual imediatamente
          setFuelWarning("💀 SEM COMBUSTÍVEL! GAME OVER IMINENTE!");
        }
        
        createGameMutation.mutate({
          mapa: route.mapaId,
          rota: route.id,
          veiculo: parseInt(selectedVehicle.id, 10) || 1,
          saldo_inicial: money,
          combustivel_inicial: currentFuelRef.current
        });
      }
    }).catch(error => {
      console.error("❌ Falha crítica na inicialização do Kaboom", error);
      setLoadingError(`Falha ao iniciar o motor gráfico do jogo: ${error.message}`);
    });

    // Função de limpeza quando o componente é desmontado
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
  // ============= LISTENERS E EFFECTS ORIGINAIS =============

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!activeEvent && !gameEnded) {
          togglePause();
        }
      }
      
      // ✅ DEBUG: Tecla F para forçar fim do combustível
      if (e.key === 'f' || e.key === 'F') {
        updateCurrentFuel(0);
        
        // Forçar verificação de game over
        setTimeout(() => {
          if (!isFinishing.current) {
            checkGameOver();
          }
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeEvent, gameEnded, updateCurrentFuel]);

  // ✅ CORREÇÃO: UseEffect simplificado - apenas para configurações que não são do progresso
  useEffect(() => {
    const { savedProgress } = location.state || {};

    // ✅ CORREÇÃO: Apenas configurar combustível e tempo aqui, o progresso já foi configurado na initializeGame
    if (savedProgress) {
      updateCurrentFuel(savedProgress.currentFuel);
      setGameTime(Math.max(0, savedProgress.gameTime || 0));
    } else {
      updateCurrentFuel(vehicle?.currentFuel || 0); // O combustível vem do backend
      setGameTime(0);
    }

    // Configurar rota e velocidade do jogo
    if (selectedRoute) {
      const routeDistance = selectedRoute.actualDistance || selectedRoute.distance;
      setTotalDistance(routeDistance);

      const estimatedHours = selectedRoute.estimatedTimeHours || 7.5;
      const targetGameDurationMinutes = 20; // O jogo deve durar 20 minutos
      gameSpeedMultiplier.current = (estimatedHours * 60) / targetGameDurationMinutes;
    }
  }, [vehicle, selectedRoute, location.state, updateCurrentFuel]); // Dependências corretas

  const [gasoline, setGasoline] = useState(() => {
    const fuelPercent = (currentFuel / vehicle.maxCapacity) * 100;
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

  useEffect(() => {
    const interval = setInterval(() => {
      if (!gamePaused.current && !gameEnded && !processingEvent.current) {
        // Simplesmente adiciona 1 segundo ao estado de tempo existente
        setGameTime(prevTime => Math.max(0, prevTime + 1));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameEnded]);

  // useEffect para finalizar o jogo quando atingir 100%
  useEffect(() => {
    // A condição agora verifica o progresso E a trava de finalização
    if (progress >= 100 && !isFinishing.current) {

      // 1. Tranca a porta para impedir qualquer chamada futura.
      isFinishing.current = true;

      console.log("🏁 Finalizando jogo - progresso 100% (CHAMADA ÚNICA)");

      const tempoFinal = Math.max(0, gameTime);
      console.log(`⏱️ Tempo enviado para sincronização: ${tempoFinal} segundos`);

      // 2. Chama a mutação. Se falhar, a trava impede que seja chamada de novo.
      const distanciaAtual = (progress / 100) * totalDistance;
      
      syncGameMutation.mutate({ 
        tempo_decorrido_segundos: tempoFinal,
        combustivel_atual: currentFuelRef.current,
        saldo_atual: money,
        distancia_percorrida: distanciaAtual
      });
    }
  }, [progress, gameTime]);

  const checkGameOver = () => {
    // ✅ CORREÇÃO: Permitir game over mesmo se jogo não está totalmente carregado
    // O importante é que o combustível acabou, não se todos os assets carregaram

    if (currentFuelRef.current <= 0) {
      gamePaused.current = true;
      
      // ✅ CORREÇÃO: Usar syncGameMutation para finalizar a partida no backend
      console.log(`🔍 Condições para finalizar: activeGameId=${!!activeGameIdRef.current}, syncPending=${syncGameMutation.isPending}, isFinishing=${isFinishing.current}`);
      
      if (activeGameIdRef.current && !syncGameMutation.isPending && !isFinishing.current) {
        isFinishing.current = true; // Prevenir múltiplas chamadas
        const tempoFinal = Math.max(0, gameTime);
        const distanciaAtual = (progressRef.current / 100) * totalDistance;
        
        syncGameMutation.mutate({ 
          tempo_decorrido_segundos: tempoFinal,
          combustivel_atual: currentFuelRef.current,
          saldo_atual: money,
          distancia_percorrida: distanciaAtual,
          forcar_game_over: true // Indicar que é um game over forçado
        });
        
        // A mensagem e redirecionamento serão tratados no onSuccess do syncGameMutation
        return true;
      } else if (!activeGameIdRef.current) {
        // Se não há activeGameId ainda, aguardar um pouco e tentar novamente
        setTimeout(() => {
          if (activeGameIdRef.current && !isFinishing.current) {
            checkGameOver();
          } else if (!activeGameIdRef.current) {
            // Usar fallback manual se ainda não há ID
            const resultadoManual = {
              id: 0,
              status: 'concluido' as const,
              resultado: 'derrota' as const,
              motivo_finalizacao: "Fim de jogo! O veículo ficou sem combustível.",
              saldo: money,
              combustivel_atual: 0,
              pontuacao: 0,
              eficiencia: 0,
              tempo_real: gameTime / 60,
              distancia_percorrida: (progressRef.current / 100) * totalDistance,
              quantidade_carga: 0,
              quantidade_carga_inicial: 40,
              condicao_veiculo: 50,
              estresse_motorista: 100
            };
            
            setFinalGameResults(resultadoManual);
            setGameEnded(true);
            setShowEndMessage(true);
          }
        }, 2000); // Aguardar 2 segundos para a criação da partida
        
        return true;
      } else {
        // ✅ FALLBACK: Criar resultado manual e mostrar tela de derrota
        const resultadoManual = {
          id: activeGameIdRef.current || 0,
          status: 'concluido' as const,
          resultado: 'derrota' as const,
          motivo_finalizacao: "Fim de jogo! O veículo ficou sem combustível.",
          saldo: money,
          combustivel_atual: 0,
          pontuacao: 0,
          eficiencia: 0,
          tempo_real: gameTime / 60, // converter para minutos
          distancia_percorrida: (progressRef.current / 100) * totalDistance,
          quantidade_carga: 0,
          quantidade_carga_inicial: 40,
          condicao_veiculo: 50,
          estresse_motorista: 100
        };
        
        setFinalGameResults(resultadoManual);
        setGameEnded(true);
        setShowEndMessage(true);
        return true;
      }
    }

    if (money <= 0) {
              gamePaused.current = true;
        
        // ✅ CORREÇÃO: Usar syncGameMutation para finalizar a partida no backend
        if (activeGameIdRef.current && !syncGameMutation.isPending && !isFinishing.current) {
          isFinishing.current = true; // Prevenir múltiplas chamadas
          
          const tempoFinal = Math.max(0, gameTime);
          const distanciaAtual = (progressRef.current / 100) * totalDistance;
        
        syncGameMutation.mutate({ 
          tempo_decorrido_segundos: tempoFinal,
          combustivel_atual: currentFuelRef.current,
          saldo_atual: money,
          distancia_percorrida: distanciaAtual,
          forcar_game_over: true // Indicar que é um game over forçado
        });
        
        // A mensagem e redirecionamento serão tratados no onSuccess do syncGameMutation
        return true;
              } else {
          // ✅ FALLBACK: Criar resultado manual e mostrar tela de derrota
        const resultadoManual = {
          id: activeGameIdRef.current || 0,
          status: 'concluido' as const,
          resultado: 'derrota' as const,
          motivo_finalizacao: "Fim de jogo! Recursos financeiros esgotados.",
          saldo: 0,
          combustivel_atual: currentFuelRef.current,
          pontuacao: 0,
          eficiencia: 0,
          tempo_real: gameTime / 60, // converter para minutos
          distancia_percorrida: (progressRef.current / 100) * totalDistance,
          quantidade_carga: 0,
          quantidade_carga_inicial: 40,
          condicao_veiculo: 50,
          estresse_motorista: 100
        };
        
        setFinalGameResults(resultadoManual);
        setGameEnded(true);
        setShowEndMessage(true);
        return true;
      }
    }

    return false;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMapModalToggle = () => {
    setShowMapModal(!showMapModal);
  };

  // Calcular progresso baseado nos pontos reais do caminho
  const calculatePathProgress = (deltaTime: number) => {
    if (!selectedRoute?.pathCoordinates || selectedRoute.pathCoordinates.length < 2) {
      console.log("Usando fallback - sem pathCoordinates");
      return calculateFallbackProgress(deltaTime);
    }

    const pathCoords = selectedRoute.pathCoordinates;
    const totalSegments = pathCoords.length - 1;

    const targetDurationSeconds = 120;
    const segmentsPerSecond = totalSegments / targetDurationSeconds;
    const segmentSpeed = segmentsPerSecond * deltaTime;

    pathProgressRef.current += segmentSpeed;

    // Atualizar currentPathIndex em tempo real
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
    distanceTravelled.current += deltaTime * gameSpeedMultiplier.current * 0.2;
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

  useEffect(() => {
    if (gameEnded) {
      console.log("Jogo finalizado. Mostrando mensagem final.");
      localStorage.removeItem('savedGameProgress');
      setShowEndMessage(true);
    }
  }, [gameEnded]);

  // ============= RENDER DO COMPONENTE =============

  return (
    <div style={{ position: "relative" }}>
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
              🔄 Criando partida no servidor...
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
      </div>

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
            {/* ✅ NOVO: Aviso de combustível baixo */}
            {fuelWarning && (
              <div style={{ 
                fontSize: "11px", 
                color: fuelWarning.includes("CRÍTICO") ? "#cc3300" : "#ff6600", 
                paddingLeft: "24px",
                fontWeight: "bold",
                animation: "blink 1s infinite"
              }}>
                {fuelWarning}
              </div>
            )}
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

      {/* ============= MODAL DE EVENTO ATUALIZADO ============= */}
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
          {/* Indicador de categoria do evento */}
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

          {/* Texto e descrição */}
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

          {/* Botões das opções */}
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

          {/* Indicador de processamento */}
          {isResponding && (
            <div style={{
              marginTop: "15px",
              fontSize: "14px",
              color: "#666",
              fontStyle: "italic"
            }}>
              🔄 Enviando sua escolha para o servidor...
            </div>
          )}
        </div>
      )}

      {/* Mensagem de fim de jogo */}
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
          {/* Título dinâmico */}
          <h2 style={{
            color: finalGameResults.resultado === 'vitoria' ? "#00cc66" : "#cc3300",
            marginBottom: "20px",
            fontFamily: "'Silkscreen', monospace"
          }}>
            {finalGameResults.resultado === 'vitoria' ? '🏁 Viagem Concluída! 🏁' : '❌ Fim de Jogo ❌'}
          </h2>

          {/* Mensagem dinâmica */}
          <p style={{ fontSize: "16px", marginBottom: "25px", fontWeight: "bold" }}>
            {finalGameResults.motivo_finalizacao}
          </p>

          {/* Box de resultados */}
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

          {/* Botões de ação */}
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
                justifyContent: 'space-between', // Alinha itens nas extremidades
                alignItems: 'center',             // Alinha itens verticalmente
                boxSizing: 'border-box',          // Garante que o padding não quebre o layout
                zIndex: 9999,                     // Mantém o cabeçalho na frente
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
                  width: '25px',
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
    </div>
  );
}
