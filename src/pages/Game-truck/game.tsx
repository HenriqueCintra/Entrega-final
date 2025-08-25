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
  const [currentFuel, setCurrentFuel] = useState<number>(location.state?.selectedVehicle?.currentFuel || 0);
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

      // Sincronizar estados do frontend com os valores iniciais do backend
      setMoney(partida.saldo);
      updateCurrentFuel(partida.combustivel_atual);

      console.log('💰 Estado sincronizado - Saldo:', partida.saldo, 'Combustível:', partida.combustivel_atual);
      console.log('🔗 activeGameIdRef definido como:', activeGameIdRef.current);
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
    mutationFn: (progressData: { tempo_decorrido_segundos: number }) =>
      GameService.syncGameProgress(progressData),
    onSuccess: (updatedPartida: PartidaData) => {
      console.log("✅ Progresso sincronizado!", updatedPartida);

      if (updatedPartida.status === 'concluido') {
        console.log("🏁 PARTIDA FINALIZADA! Resultados:", updatedPartida);
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
    console.log("⛽ Enviando combustível atual com resposta do evento:", combustivelAtual);
    
    respondToEventMutation.mutate({ 
      optionId, 
      combustivelAtual 
    });
  };

  // ============= USEEFFECT PRINCIPAL COM PROTEÇÃO CONTRA STRICTMODE =============

  // ============= FUNÇÃO INITIALIZEGAME MOVIDA PARA FORA =============

  const initializeGame = (savedProgress?: any) => {
    // REMOVIDO: verificações de gameInitialized - isso é controlado no useEffect!

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
      } = k;

      destroyRef.current = destroy;

      try {
        console.log("Tentando carregar sprites...");
        loadSprite("background", "/assets/backgroundd.png");

        const vehicleImageUrl = getVehicleImageUrl(vehicle.spriteSheet);
        console.log("Imagem original do veículo:", vehicle.image);
        console.log("URL convertida para kaboom:", vehicleImageUrl);

        loadSprite("car", vehicleImageUrl, {
          sliceX: 2, // número de colunas (quadros) no spritesheet
          sliceY: 1, // geralmente 1 linha
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

        //loadSprite("carro_vermelho", "/assets/carro_vermelho.png");
        //loadSprite("van_branca", "/assets/van_branca.png");

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

        const roadYPosition = height() * 0.48;
        const baseWidth = 600; // largura de um frame do caminhão
        const scaleFactor = (width() / baseWidth) * 0.3; // ajusta pelo tamanho da tela mantendo proporção

        const car = add([
          sprite("car", { anim: "run" }),
          pos(width() * 0.08, roadYPosition),
          area(),
          body(),
          z(2),
          scale(scaleFactor),
        ]);


        // ========== INICIO TRAFEGO VEICULOS ========== I
        const lane_contramao = height() * 0.60;
        const lane_mesmo_sentido = height() * 0.68;

        // Lista de sprites de carros disponíveis para o tráfego
        const trafficCarSprites = ["carro_1", "carro_2", "carro_3", "carro_4", "carro_5", "carro_6", "carro_7", "carro_8", "moto_1"];

        // Gerador de carros de tráfego
        k.loop(k.rand(4, 7), () => {
            if (gamePaused.current) return;

            if (k.get("traffic_car").length > 0) {
                return; 
            }

            const carSprite = k.choose(trafficCarSprites);
            
            const carType = k.choose(["ultrapassagem", "contramao"]);

            if (carType === "contramao") {
                const startX = width() + 150; // Começa fora da tela, à DIREITA
                const carSpeed = speed * k.rand(0.2, 0.3); // Velocidade alta, somada à do cenário
                
                add([
                    sprite(carSprite, { flipX: true }), 
                    pos(startX, lane_contramao), // Anda na faixa da contramão
                    scale(scaleFactor * 1.6), // Um pouco menor por estar mais "distante"
                    k.move(k.LEFT, carSpeed), // Move para a ESQUERDA
                    "traffic_car",
                    z(1),
                    // Propriedade para identificar o comportamento
                    { behavior: "contramao" }, 
                ]);

            } else { // carType === "ultrapassagem"

                const startX = -250; // Começa fora da tela, à ESQUERDA
                const carSpeed = speed * k.rand(0.05, 0.1);
                
                add([
                    sprite(carSprite, { flipX: false }), // Aponta para a direita (correto)
                    pos(startX, lane_contramao), // Começa na contramão para ultrapassar
                    scale(scaleFactor * 1.7),
                    k.move(k.RIGHT, carSpeed), // Move para a DIREITA
                    "traffic_car",
                    z(1),
                    // Propriedades para controlar o estado
                    { 
                        isChangingLane: false,
                        behavior: "ultrapassagem", // Identifica o comportamento
                    }, 
                ]);
            }
        });

        // Lógica de atualização e limpeza
        onUpdate("traffic_car", (trafficCar) => {
            
            // a lógica de mudança de faixa agora SÓ se aplica ao carro de ultrapassagem
            if (trafficCar.behavior === "ultrapassagem" && !trafficCar.isChangingLane && trafficCar.pos.x > (car.pos.x + car.width - 150)) {
                
                trafficCar.isChangingLane = true;
                
                k.tween(
                    trafficCar.pos.y,
                    lane_mesmo_sentido,
                    0.9,
                    (newY) => trafficCar.pos.y = newY,
                    k.easings.easeInOutQuad
                );
            }

            // limpeza de carros que saíram da tela
            if (trafficCar.pos.x < -trafficCar.width || trafficCar.pos.x > width() + trafficCar.width) {
                destroy(trafficCar);
            }
        });
        
        // ========== FIM TRAFEGO VEICULOS ========== I

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

          // Atualizar progresso mais frequentemente para sincronização suave
          if (Math.abs(progressPercent - progress) > 0.05) {
            setProgress(progressPercent);
          }

          const routeDistance = totalDistance || 500;
          const progressDelta = progressPercent - previousProgress;
          const distanceInKm = (progressDelta / 100) * routeDistance;

          // ✅ CORREÇÃO: Melhor controle do consumo de combustível usando ref
          if (distanceInKm > 0) {
            const consumptionRate = vehicle.consumption?.asphalt || 10;
            const fuelConsumption = distanceInKm / consumptionRate;

            const currentFuelValue = currentFuelRef.current; // ✅ Usar ref em vez do estado
            const updatedFuel = Math.max(0, currentFuelValue - fuelConsumption);
            
            // ✅ CORREÇÃO: Atualizar tanto estado quanto ref
            updateCurrentFuel(updatedFuel);

            const newGasolinePercent = (updatedFuel / vehicle.maxCapacity) * 100;
            setGasoline(newGasolinePercent);

            console.log(`⛽ Combustível: ${currentFuelValue.toFixed(1)}L → ${updatedFuel.toFixed(1)}L (consumiu ${fuelConsumption.toFixed(2)}L em ${distanceInKm.toFixed(2)}km)`);

            // ✅ NOVO: Aviso visual quando combustível baixo
            const fuelPercent = (updatedFuel / vehicle.maxCapacity) * 100;
            if (fuelPercent <= 20 && fuelPercent > 10) {
              console.log("⚠️ COMBUSTÍVEL BAIXO! Restam apenas " + updatedFuel.toFixed(1) + "L");
              setFuelWarning("⚠️ COMBUSTÍVEL BAIXO!");
            } else if (fuelPercent <= 10 && fuelPercent > 0) {
              console.log("🚨 COMBUSTÍVEL CRÍTICO! Restam apenas " + updatedFuel.toFixed(1) + "L");
              setFuelWarning("🚨 COMBUSTÍVEL CRÍTICO!");
            } else if (fuelPercent > 20) {
              setFuelWarning(null); // Limpar aviso quando combustível estiver ok
            }

            // ✅ NOVO: Sincronizar combustível com backend periodicamente
            const shouldSyncProgress = (
              Math.floor(progressPercent / 10) !== Math.floor((progressPercent - progressDelta) / 10) || // A cada 10% de progresso
              updatedFuel <= 0 || // Quando combustível acabar
              updatedFuel <= vehicle.maxCapacity * 0.1 // Quando combustível crítico (<10%)
            );

            if (shouldSyncProgress && activeGameIdRef.current && !updateProgressMutation.isPending) {
              const distanciaAtualKm = (progressPercent / 100) * totalDistance;
              updateProgressMutation.mutate({
                distancia_percorrida: distanciaAtualKm,
                combustivel_atual: updatedFuel,
                tempo_jogo_segundos: gameTime
              });
            }

            // ✅ CORREÇÃO: Verificar game over com delay para evitar setState durante render
            if (currentFuelValue > 0 && updatedFuel <= 0) {
              console.log("🚨 COMBUSTÍVEL ACABOU! Finalizando jogo...");
              requestAnimationFrame(() => {
                checkGameOver();
              });
            }
          }

          // ============= LÓGICA CORRIGIDA DE GATILHO DE EVENTOS =============

          // ✅ CORREÇÃO: Configurações de evento mais robustas
          const EVENT_CHECK_INTERVAL_KM = 10 // Aumentado para dar mais espaço

          // ✅ CORREÇÃO: Use progressPercent (valor atualizado) consistentemente
          const distanciaAtualKm = (progressPercent / 100) * totalDistance;

          // ====== VALIDAÇÕES EXTRAS PARA EVITAR REQUESTS DUPLICADOS ======
          const canTriggerEvent = (
            activeGameIdRef.current && // ✅ Partida deve existir no backend
            !processingEvent.current && // ✅ Não pode haver outro evento sendo processado
            !gamePaused.current && // ✅ O jogo não pode estar pausado
            !activeEvent && // ✅ Não pode haver evento ativo no estado React
            !showPopup && // ✅ Não pode haver popup sendo exibido
            !fetchNextEventMutation.isPending && // ✅ NOVA: Não pode haver request em andamento
            distanciaAtualKm - lastEventCheckKm.current >= EVENT_CHECK_INTERVAL_KM // ✅ Distância suficiente
          );

          if (canTriggerEvent) {
            lastEventCheckKm.current = distanciaAtualKm;

            console.log(`📍 Checkpoint em ${distanciaAtualKm.toFixed(2)}km. Perguntando ao backend por eventos...`);

            processingEvent.current = true;
            gamePaused.current = true;
            fetchNextEventMutation.mutate(distanciaAtualKm);
          }
          // ================================================================

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

    // Se há savedProgress com activeGameId, reutiliza a partida sem criar nova
    if (savedProgress && savedProgress.activeGameId) {
      console.log("🟢 Restaurando partida existente com ID:", savedProgress.activeGameId);
      setActiveGameId(savedProgress.activeGameId);
      activeGameIdRef.current = savedProgress.activeGameId;

      // opcional: notificar backend que estamos retomando
      // await GameService.resumeGame(savedProgress.activeGameId);

      // Agora só inicializa o kaboom com o progresso salvo
      initializeGame(savedProgress);
      return;
    }

    // ✅ CORREÇÃO: Inicia a criação da partida no backend com saldo e combustível corretos
    createGameMutation.mutateAsync({
      mapa: route.mapaId,
      rota: route.id,
      veiculo: parseInt(selectedVehicle.id, 10) || 1,
      saldo_inicial: money,  // ✅ Enviar saldo atual (já com desconto do combustível)
      combustivel_inicial: currentFuel  // ✅ Enviar combustível atual
    }).then(() => {
      // Apenas após o sucesso da criação, inicializa o Kaboom.js,
      // passando os dados do jogo salvo (se existirem).
      initializeGame(savedProgress);
    }).catch(error => {
      console.error("❌ Falha crítica na criação da partida, não inicializando Kaboom", error);
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeEvent, gameEnded]);

  // Inicializar estados baseados nos dados recebidos
  useEffect(() => {
    const { savedProgress } = location.state || {};

    if (savedProgress) {
      console.log("🔄 Restaurando progresso salvo...");
      updateCurrentFuel(savedProgress.currentFuel);
      setProgress(savedProgress.progress);
      setCurrentPathIndex(savedProgress.currentPathIndex);
      setGameTime(Math.max(0, savedProgress.gameTime || 0));

      progressRef.current = savedProgress.progress;
      currentPathIndexRef.current = savedProgress.currentPathIndex;
      pathProgressRef.current = savedProgress.pathProgress;
    } else {
      console.log("✨ Iniciando um novo jogo...");
      updateCurrentFuel(vehicle?.currentFuel || 0); // O combustível vem do backend
      setGameTime(0);
    }

    if (selectedRoute) {
      const routeDistance = selectedRoute.actualDistance || selectedRoute.distance;
      setTotalDistance(routeDistance);

      const estimatedHours = selectedRoute.estimatedTimeHours || 7.5;
      const targetGameDurationMinutes = 20; // O jogo deve durar 3 minutos
      gameSpeedMultiplier.current = (estimatedHours * 60) / targetGameDurationMinutes;
    }
  }, [vehicle, selectedRoute, location.state]); // Dependências corretas

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
  // Timer do jogo (VERSÃO CORRIGIDA E SIMPLIFICADA)
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
      syncGameMutation.mutate({ tempo_decorrido_segundos: tempoFinal });
    }
  }, [progress, gameTime]);

  const checkGameOver = () => {
    if (!gameLoaded) {
      console.log("Game Over check skipped - jogo não carregado ainda");
      return false;
    }

    // REMOVEMOS O IF QUE USAVA gameStartTime

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

    const targetDurationSeconds = 1200;
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
