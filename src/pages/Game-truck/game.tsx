import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import kaboom from "kaboom";
import './game.css'
import { Vehicle } from "../../types/vehicle";
import { GameMiniMap } from "./GameMiniMap";
import { MapComponent } from "../mapaRota/MapComponent";
import { PauseMenu } from "../PauseMenu/PauseMenu";
import { GameService } from "../../api/gameService";

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

  // 🔥 NOVA PROTEÇÃO MELHORADA CONTRA DUPLA EXECUÇÃO
  const gameCreationPromise = useRef<Promise<any> | null>(null);
  const gameInitCompleted = useRef(false);

  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [playerChoice, setPlayerChoice] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const gamePaused = useRef(false);
  const collidedObstacle = useRef<GameObj | null>(null);
  const destroyRef = useRef<((obj: GameObj) => void) | null>(null);

  // NOVOS ESTADOS PARA INTEGRAÇÃO COM API
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
  const gameStartTime = useRef<number>(Date.now());
  const manualTimeAdjustment = useRef<number>(0);
  const [currentFuel, setCurrentFuel] = useState<number>(() => {
    const vehicleData = location.state?.selectedVehicle || location.state?.vehicle;
    return vehicleData?.currentFuel || 0;
  });
  const [totalDistance, setTotalDistance] = useState<number>(500);

  const [showMapModal, setShowMapModal] = useState(false);

  // Estados vindos dos parâmetros de navegação
  const [vehicle, setVehicle] = useState<Vehicle>(() => {
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

  const [selectedRoute, setSelectedRoute] = useState(() => {
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
    mutationFn: (gameData: { mapa: number; rota: number; veiculo: number }) =>
      GameService.createGame(gameData),
    onSuccess: (partida) => {
      console.log('🎮 Partida criada com sucesso no backend, ID:', partida.id);
      setActiveGameId(partida.id);

      // Sincronizar estados do frontend com os valores iniciais do backend
      setMoney(partida.saldo);
      setCurrentFuel(partida.combustivel_atual);

      console.log('💰 Estado sincronizado - Saldo:', partida.saldo, 'Combustível:', partida.combustivel_atual);
    },
    onError: (error) => {
      console.error('❌ Erro ao criar partida:', error);
      alert('Não foi possível iniciar o jogo. Tente novamente.');
      navigate('/routes');
    }
  });

  // Mutação para buscar o próximo evento
  const fetchNextEventMutation = useMutation({
    mutationFn: (distancia: number) => GameService.getNextEvent(distancia),
    onSuccess: (data) => {
      if (data && data.evento) {
        console.log('🎲 Evento recebido do backend:', data.evento.nome, '(categoria:', data.evento.categoria + ')');
        setActiveEvent(data);
        setShowPopup(true);
      } else {
        console.log('ℹ️ Nenhum evento disponível, continuando jogo');
        gamePaused.current = false;
        processingEvent.current = false;
      }
    },
    onError: (error) => {
      console.warn('⚠️ Erro ao buscar evento:', error);
      gamePaused.current = false;
      processingEvent.current = false;
    }
  });

  // Mutação para responder ao evento
  const respondToEventMutation = useMutation({
    mutationFn: (optionId: number) => GameService.respondToEvent(optionId),
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
      setCurrentFuel(updatedPartida.combustivel_atual);

      // Atualizar outros estados se necessário
      if (updatedPartida.tempo_real !== undefined) {
        const newGameTime = updatedPartida.tempo_real * 60; // Converter de minutos para segundos
        setGameTime(newGameTime);
        manualTimeAdjustment.current += (newGameTime - gameTime);
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
      manualTimeAdjustment: manualTimeAdjustment.current,
      timestamp: Date.now()
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
      manualTimeAdjustment: manualTimeAdjustment.current,
      timestamp: Date.now()
    };
    localStorage.setItem('savedGameProgress', JSON.stringify(gameProgress));
    togglePause();
  };

  // ============= NOVA FUNÇÃO PARA RESPONDER EVENTOS =============

  const handleOptionClick = (optionId: number) => {
    if (isResponding) return;

    console.log("🎯 Processando escolha do evento - Opção ID:", optionId);
    setIsResponding(true);
    respondToEventMutation.mutate(optionId);
  };

  // ============= CRIAÇÃO DA PARTIDA COM PROTEÇÃO ROBUSTA =============

  useEffect(() => {
    // Proteção IMEDIATA contra dupla execução
    if (gameCreationPromise.current || activeGameId) {
      console.log("⚠️ Criação de partida já em andamento ou partida já criada, ignorando execução duplicada");
      return;
    }

    const { selectedVehicle, selectedRoute: route } = location.state || {};

    if (selectedVehicle && route && route.id && route.mapaId) {
      console.log("🚀 Iniciando partida no backend (proteção ativada)...");
      console.log("Dados:", {
        mapa: route.mapaId,
        rota: route.id,
        veiculo: parseInt(selectedVehicle.id, 10) || 1
      });

      // Cria e armazena a Promise IMEDIATAMENTE
      gameCreationPromise.current = createGameMutation.mutateAsync({
        mapa: route.mapaId,
        rota: route.id,
        veiculo: parseInt(selectedVehicle.id, 10) || 1
      }).catch(error => {
        console.error("❌ Erro ao criar partida:", error);
        gameCreationPromise.current = null; // Reset em caso de erro
        throw error;
      });
    } else {
      console.error("❌ Dados insuficientes para criar partida:", {
        selectedVehicle,
        route,
        hasRouteId: route?.id,
        hasMapaId: route?.mapaId
      });
      alert("Erro: Dados do veículo ou rota incompletos. Redirecionando...");
      navigate('/routes');
    }
  }, []); // Dependências vazias para executar apenas na montagem

  // ============= LISTENERS E EFFECTS ORIGINAIS =============

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

  // Inicializar estados baseados nos dados recebidos
  useEffect(() => {
    console.log("Inicializando currentFuel com:", vehicle.currentFuel);

    const savedProgressData = location.state?.savedProgress;

    if (savedProgressData) {
      setCurrentFuel(savedProgressData.currentFuel);
      setProgress(savedProgressData.progress);
      setCurrentPathIndex(savedProgressData.currentPathIndex);
      setGameTime(savedProgressData.gameTime);

      progressRef.current = savedProgressData.progress;
      currentPathIndexRef.current = savedProgressData.currentPathIndex;
      pathProgressRef.current = savedProgressData.pathProgress;

      gameStartTime.current = Date.now() - (savedProgressData.gameTime * 1000);
      manualTimeAdjustment.current = savedProgressData.manualTimeAdjustment || 0;

      console.log("Estados restaurados do save:", {
        currentFuel: savedProgressData.currentFuel,
        progress: savedProgressData.progress,
        currentPathIndex: savedProgressData.currentPathIndex,
        gameTime: savedProgressData.gameTime,
        manualTimeAdjustment: manualTimeAdjustment.current
      });
    } else {
      setCurrentFuel(vehicle.currentFuel || vehicle.maxCapacity);
    }

    if (selectedRoute) {
      console.log("Definindo distância total:", selectedRoute.actualDistance || selectedRoute.distance);
      setTotalDistance(selectedRoute.actualDistance || selectedRoute.distance);

      const estimatedHours = selectedRoute.estimatedTimeHours || 7.5;
      const targetGameDurationMinutes = 3;
      gameSpeedMultiplier.current = (estimatedHours * 60) / targetGameDurationMinutes;

      console.log("Rota estimada:", estimatedHours, "horas");
      console.log("Multiplicador de velocidade:", gameSpeedMultiplier.current);
      console.log("PathCoordinates disponíveis:", selectedRoute.pathCoordinates?.length, "pontos");
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

  // Timer do jogo
  useEffect(() => {
    const interval = setInterval(() => {
      if (!gamePaused.current && !gameEnded && !processingEvent.current) {
        const currentTime = Date.now();
        const baseElapsedSeconds = Math.floor((currentTime - gameStartTime.current) / 1000);
        const finalElapsedSeconds = baseElapsedSeconds + manualTimeAdjustment.current;

        if (finalElapsedSeconds % 30 === 0 && finalElapsedSeconds > 0) {
          console.log(`🕐 Timer: ${formatTime(finalElapsedSeconds)} (base: ${baseElapsedSeconds}s + ajuste: ${manualTimeAdjustment.current}s)`);
        }

        setGameTime(finalElapsedSeconds);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameEnded]);

  // Verificar condições de game over
  const checkGameOver = () => {
    if (!gameLoaded || !gameInitialized.current) {
      console.log("Game Over check skipped - jogo não carregado ainda");
      return false;
    }

    if (Date.now() - gameStartTime.current < 1000) {
      console.log("Game Over check skipped - aguardando estabilização");
      return false;
    }

    if (currentFuel <= 0) {
      console.log("Game Over: Combustível esgotado - currentFuel:", currentFuel);
      gamePaused.current = true;
      alert("Combustível esgotado! Jogo encerrado.");
      navigate('/routes');
      return true;
    }

    if (money <= 0) {
      console.log("Game Over: Sem recursos financeiros - money:", money);
      gamePaused.current = true;
      alert("Sem recursos financeiros! Jogo encerrado.");
      navigate('/routes');
      return true;
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

    const targetDurationSeconds = 180;
    const segmentsPerSecond = totalSegments / targetDurationSeconds;
    const segmentSpeed = segmentsPerSecond * deltaTime;

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
    distanceTravelled.current += deltaTime * gameSpeedMultiplier.current * 0.1;
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

  // ============= INICIALIZAÇÃO DO JOGO KABOOM =============

  useEffect(() => {
    if (!vehicle || !vehicle.name) {
      console.error("Dados do veículo não encontrados");
      return;
    }

    if (gameInitialized.current || gameInitCompleted.current) {
      console.log("Jogo já foi inicializado, pulando...");
      return;
    }

    const initializeGame = () => {
      if (!canvasRef.current) {
        console.error("Canvas não encontrado, tentando novamente...");
        setTimeout(initializeGame, 100);
        return;
      }

      console.log("Canvas encontrado:", canvasRef.current);

      if (!document.contains(canvasRef.current)) {
        console.error("Canvas não está no DOM, aguardando...");
        setTimeout(initializeGame, 100);
        return;
      }

      gameInitialized.current = true;
      gameInitCompleted.current = true;

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
        } = k;

        destroyRef.current = destroy;

        try {
          console.log("Tentando carregar sprites...");
          loadSprite("background", "/assets/backgroundd.png");

          const vehicleImageUrl = getVehicleImageUrl(vehicle.image);
          console.log("Imagem original do veículo:", vehicle.image);
          console.log("URL convertida para kaboom:", vehicleImageUrl);
          loadSprite("car", vehicleImageUrl);

          loadSprite("obstacle", "/assets/obstaclee.png");

          console.log("Todos os sprites carregados com sucesso");
        } catch (error) {
          console.error("Erro ao carregar sprites:", error);
        }

        scene("main", () => {
          const speed = 5000;

          const bgScaleX = width() / 1365;
          const bgScaleY = height() / 762;
          const bgScale = Math.max(bgScaleX, bgScaleY);

          const bgOffsetY = -height() * 0.15;

          const bg1 = add([
            sprite("background"),
            pos(0, bgOffsetY),
            scale(bgScale),
            z(0),
            { speed },
          ]);

          const bg2 = add([
            sprite("background"),
            pos(1365 * bgScale, bgOffsetY),
            scale(bgScale),
            z(0),
            { speed },
          ]);

          const roadYPosition = height() * 0.68;
          const carScale = Math.min(width() / 1365, height() / 762) * 0.6;

          const car = add([
            sprite("car"),
            pos(width() * 0.08, roadYPosition),
            area(),
            body(),
            z(2),
            scale(carScale),
          ]);

          type Obstacle = GameObj<
            SpriteComp |
            PosComp |
            ZComp |
            AreaComp |
            BodyComp |
            ScaleComp
          > & { collided: boolean; };

          const obstacles: Obstacle[] = [];
          const maxObstacles = 1;
          const obstacleSpawnInterval = 10;
          let lastObstacleCreatedTime = 0;

          const createObstacle = () => {
            const currentTime = Date.now();

            if (obstacles.length >= maxObstacles) {
              console.log("🚫 Limite de obstáculos atingido:", obstacles.length);
              return;
            }

            if (currentTime - lastObstacleCreatedTime < 3000) {
              console.log("🚫 Muito cedo para criar obstáculo:", currentTime - lastObstacleCreatedTime, "ms");
              return;
            }

            const roadYPosition = height() * 0.68;
            const obstacleScale = Math.min(width() / 1365, height() / 762) * 0.12;
            const safeDistance = width() + 300;

            const obs = add([
              sprite("obstacle"),
              pos(safeDistance + Math.random() * 200, roadYPosition + Math.random() * 40 - 20),
              area(),
              body(),
              z(1),
              scale(obstacleScale),
              "obstacle",
              { collided: false },
            ]) as Obstacle;

            obstacles.push(obs);
            lastObstacleCreatedTime = Date.now();
            console.log("🔴 Novo obstáculo criado. Total:", obstacles.length, "Posição:", obs.pos.x, obs.pos.y);
          };

          onUpdate(() => {
            if (gamePaused.current) {
              return;
            }

            const deltaTime = dt();

            if (collisionCooldownRef.current > 0) {
              collisionCooldownRef.current = Math.max(0, collisionCooldownRef.current - deltaTime);
            }

            const moveAmount = -speed * deltaTime;

            bg1.move(moveAmount, 0);
            bg2.move(moveAmount, 0);

            obstacleTimerRef.current += deltaTime;

            const canCreateObstacle = (
              obstacleTimerRef.current >= obstacleSpawnInterval &&
              obstacles.length === 0 &&
              !activeEvent &&
              !processingEvent.current &&
              !obstacleSystemLockedRef.current &&
              collisionCooldownRef.current === 0
            );

            if (canCreateObstacle) {
              obstacleSystemLockedRef.current = true;
              console.log("⏰ Condições atendidas - TRAVANDO sistema e criando obstáculo");

              createObstacle();
              obstacleTimerRef.current = -10;

              setTimeout(() => {
                obstacleSystemLockedRef.current = false;
                console.log("🔓 Sistema destravado após criação de obstáculo");
              }, 2000);
            }

            for (let i = obstacles.length - 1; i >= 0; i--) {
              const obs = obstacles[i];

              obs.move(moveAmount, 0);

              if (obs.pos.x < -obs.width - 100) {
                obs.destroy();
                obstacles.splice(i, 1);
                console.log("🗑️ Obstáculo removido da tela. Total restante:", obstacles.length);
                continue;
              }

              const obstacleInGameArea = obs.pos.x > 0 && obs.pos.x < width() - 50;
              const obstacleVisible = obs.pos.x > -obs.width && obs.pos.x < width();

              // ============= NOVA LÓGICA DE COLISÃO COM EVENTOS DA API =============

              if (
                collisionCooldownRef.current === 0 &&
                obstacleVisible &&
                obstacleInGameArea &&
                !obs.collided &&
                !activeEvent &&
                !processingEvent.current &&
                !fetchNextEventMutation.isPending &&
                activeGameId && // Garantir que a partida foi criada
                car.isColliding(obs)
              ) {
                // Calcular distância atual para enviar à API
                const distanciaAtual = (progressRef.current / 100) * totalDistance;

                console.log("💥 COLISÃO DETECTADA! Buscando evento do backend...");
                console.log("📍 Distância atual:", distanciaAtual.toFixed(2), "km");

                obstacleSystemLockedRef.current = true;
                processingEvent.current = true;
                gamePaused.current = true;
                obs.collided = true;
                collidedObstacle.current = obs;

                // Remover o obstáculo imediatamente
                obs.destroy();
                obstacles.splice(i, 1);

                // Buscar evento da API com a localização atual
                fetchNextEventMutation.mutate(distanciaAtual);
                break;
              }
            }

            const bgWidth = bg1.width * bgScale;

            if (bg1.pos.x + bgWidth <= 0) {
              bg1.pos.x = bg2.pos.x + bgWidth;
            }
            if (bg2.pos.x + bgWidth <= 0) {
              bg2.pos.x = bg1.pos.x + bgWidth;
            }

            const progressPercent = calculatePathProgress(deltaTime);
            const previousProgress = progressRef.current;
            progressRef.current = progressPercent;
            setProgress(progressPercent);

            const routeDistance = totalDistance || 500;
            const progressDelta = progressPercent - previousProgress;
            const distanceInKm = (progressDelta / 100) * routeDistance;
            const consumptionRate = vehicle.consumption?.asphalt || 10;
            const fuelConsumption = Math.abs(distanceInKm) / consumptionRate;

            if (fuelConsumption > 0.001) {
              setCurrentFuel((prevFuel) => {
                const updatedFuel = Math.max(0, prevFuel - fuelConsumption);
                setGasoline((updatedFuel / vehicle.maxCapacity) * 100);

                if (prevFuel > 0 && updatedFuel <= 0) {
                  setTimeout(() => checkGameOver(), 100);
                }

                return updatedFuel;
              });
            }

            if (progressPercent >= 100) {
              setGameEnded(true);
              gamePaused.current = true;
            }

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

        if (!location.state?.savedProgress) {
          gameStartTime.current = Date.now();
          manualTimeAdjustment.current = 0;
          console.log("🕐 gameStartTime inicializado para novo jogo:", new Date(gameStartTime.current).toLocaleTimeString());
        } else {
          console.log("🕐 gameStartTime mantido do save carregado:", new Date(gameStartTime.current).toLocaleTimeString());
        }

        console.log("✅ Jogo inicializado com sucesso!");

      } catch (error) {
        console.error("Erro ao inicializar o jogo:", error);
        setLoadingError(`Erro ao carregar o jogo: ${error}`);
        setGameLoaded(false);
        (window as any).__kaboom_initiated__ = false;
      }
    };

    setTimeout(initializeGame, 50);

    return () => {
      console.log("🧹 Limpando GameScene completamente...");

      // RESETAR TODAS AS TRAVAS E PROMESSAS
      gameCreationPromise.current = null;
      gameInitCompleted.current = false;
      gameInitialized.current = false;

      // Resetar estados críticos
      setGameLoaded(false);
      setActiveGameId(null);
      setActiveEvent(null);
      setIsResponding(false);

      // Resetar refs de controle
      processingEvent.current = false;
      gamePaused.current = false;
      obstacleSystemLockedRef.current = false;

      // Limpar Kaboom
      (window as any).__kaboom_initiated__ = false;

      // Remover listener de resize
      if (handleResizeRef.current) {
        window.removeEventListener('resize', handleResizeRef.current);
      }

      console.log("✅ Limpeza completa realizada - pronto para novo jogo");
    };

  }, [vehicle.image, vehicle.name, vehicle.id]);

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
        width: "min(60vw, 800px)",
        height: "min(4vh, 30px)",
        backgroundColor: "#eee",
        zIndex: 1000,
        overflow: "hidden",
        borderRadius: "20px",
        padding: "2px"
      }}>
        <div style={{
          width: `${progress}%`,
          height: "100%",
          backgroundColor: "#0077cc",
          borderRadius: "20px 20px"
        }}></div>

        {[25, 50, 75].map((p) => (
          <div key={p} style={{
            position: "absolute",
            left: `${p}%`,
            top: "15%",
            transform: "translateX(-50%)",
            width: "20px",
            height: "20px",
            backgroundColor: "#fff",
            border: "2px solid #999",
            borderRadius: "50%",
            zIndex: 101,
          }}></div>
        ))}

        <span style={{
          position: "absolute",
          right: "10px",
          top: "7px",
          fontSize: "12px",
          fontWeight: "bold",
          color: "#333",
          zIndex: 102,
          display: "flex",
          alignItems: "center"
        }}>
          {Math.floor(progress)}%
        </span>
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
        alignItems: "flex-end"
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
              overflow: "hidden"
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
              currentPathIndex={currentPathIndex}
              pathProgress={pathProgressRef.current}
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
          fontFamily: "monospace",
          width: "min(18vw, 220px)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          fontSize: "min(2vw, 16px)"
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
            border: "3px solid #333"
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
          <div className="tittle" style={{ marginBottom: "10px" }}>
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
      {showEndMessage && (
        <div className="endMessage"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "15px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
            zIndex: 2000,
            textAlign: "center",
            maxWidth: "400px",
            minWidth: "350px"
          }}
        >
          <h2 style={{ color: "#00cc66", marginBottom: "20px" }}>🏁 Parabéns!</h2>
          <p style={{ fontSize: "18px", marginBottom: "20px" }}>Você completou a viagem com sucesso!</p>

          <div style={{
            backgroundColor: "#f8f9fa",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            textAlign: "left"
          }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Resultados Finais:</h3>
            <p style={{ margin: "5px 0" }}>🚛 Veículo: <strong>{vehicle.name}</strong></p>
            {selectedRoute && (
              <p style={{ margin: "5px 0" }}>🗺️ Rota: <strong>{selectedRoute.name}</strong></p>
            )}
            <p style={{ margin: "5px 0" }}>⏱️ Tempo total: <strong>{formatTime(gameTime)}</strong></p>
            <p style={{ margin: "5px 0" }}>💰 Dinheiro final: <strong>R$ {money.toFixed(2)}</strong></p>
            <p style={{ margin: "5px 0" }}>⛽ Combustível restante: <strong>{currentFuel.toFixed(1)}L ({gasoline.toFixed(1)}%)</strong></p>
            {activeGameId && (
              <p style={{ margin: "5px 0" }}>🎮 Partida: <strong>#{activeGameId}</strong></p>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button
              onClick={() => navigate('/routes')}
              style={{
                padding: "12px 20px",
                backgroundColor: "#0077cc",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold"
              }}
            >
              Nova Viagem
            </button>
            <button
              onClick={() => navigate('/select-vehicle')}
              style={{
                padding: "12px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px"
              }}
            >
              Trocar Veículo
            </button>
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
            <button
              onClick={handleMapModalToggle}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                zIndex: 3001,
                backgroundColor: "#e63946",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                fontSize: "20px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              title="Fechar mapa"
            >
              ×
            </button>

            <div
              style={{
                position: "absolute",
                top: "15px",
                left: "15px",
                zIndex: 3001,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                color: "white",
                padding: "10px 15px",
                borderRadius: "5px",
                fontFamily: '"Silkscreen", monospace',
                fontSize: "16px",
                fontWeight: "bold"
              }}
            >
              🗺️ {selectedRoute.name} - Posição Atual do Caminhão
            </div>

            <div style={{ width: "100%", height: "100%" }}>
              <MapComponent
                preSelectedRoute={selectedRoute}
                preSelectedVehicle={vehicle}
                preAvailableMoney={money}
                showControls={false}
                externalProgress={{
                  currentPathIndex: currentPathIndex,
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