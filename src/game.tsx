import { useEffect, useRef, useState } from "react";
import kaboom from "kaboom";
import type {
  GameObj,
  SpriteComp,
  PosComp,
  ZComp,
  AreaComp,
  BodyComp,
  ScaleComp
} from "kaboom";

export function GameScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [playerChoice, setPlayerChoice] = useState<string | null>(null);
  const gamePaused = useRef(false);
  const collidedObstacle = useRef<GameObj | null>(null);
  const destroyRef = useRef<((obj: GameObj) => void) | null>(null); // <-- Aqui
  const [eventoAtual, setEventoAtual] = useState<{ texto: string; opcoes: string[] } | null>(null);

  useEffect(() => {
  if (!canvasRef.current) return;

  // Previna múltiplas instâncias
  if ((window as any).__kaboom_initiated__) return;
  (window as any).__kaboom_initiated__ = true;

  const k = kaboom({
    canvas: canvasRef.current,
    width: 1365,
    height: 762,
    background: [0, 0, 0],
  });

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

    // Armazena a função destroy fora do useEffect
    destroyRef.current = destroy;

    loadSprite("background", "/assets/backgroundd.png");
    loadSprite("car", "/assets/truck.png");
    loadSprite("obstacle", "/assets/obstaclee.png");

    const eventos = [
      {texto: "Pneu Furado 🚛💥", 
      desc:"Você precisa chamar o borracheiro!" , 
      opcoes: ["Borracheiro mais próximo: custo = R$300, tempo: 1h", "Borracheiro de confiança: custo = R$100, tempo: 3h"]},
      
      {texto: "Greve dos caminhoeiro 🚧🚛", 
      desc:"Alguns caminhoneiros iniciaram uma paralisação e estão bloqueando está rota!" , 
      opcoes: ["Contrate motoristas extras: custo = R$300, tempo: 0h", "Espere a manifestação acabar: custo = R$0, tempo: 7h"]},

      {texto: "Aumento de pedágio 💸🛣️", 
      desc:"Ouve um ajuste inesperado para o pedágio da rota!" , 
      opcoes: ["Manter a rota e pagar o pedagio: custo = R$100, tempo: 0h", "Mudar a rota: custo = R$0, tempo: 2h"]},

      {texto: "Combustível adulterado ⚠️⛽", 
      desc:"O caminhão foi abastecido com combustível adulterado e apresentou falhas mecânicas!" , 
      opcoes: ["Parar no mecânico e esperar consertar: custo = R$800, tempo: 8h", "Colocar outro veículo: custo = R$700, tempo: 4h"]},
    ];


scene("main", () => {
  const speed = 5000;

  const bg1 = add([
    sprite("background"),
    pos(0, 0),
    z(0),
    { speed },
  ]);

  const bg2 = add([
    sprite("background"),
    pos(width(), 0),
    z(0),
    { speed },
  ]);

  const car = add([
    sprite("car"),
    pos(10, height() - 250),
    area(),
    body(),
    z(2),
    scale(0.75),
  ]);

  type Obstacle = GameObj<
    SpriteComp |
    PosComp |
    ZComp |
    AreaComp |
    BodyComp |
    ScaleComp
  > & { collided: boolean };

  // Declarar o array de obstáculos fora da lógica de criação
  const obstacles: Obstacle[] = [];

  // Criar obstáculos apenas uma vez
  for (let i = 0; i < 4; i++) {
    const obs = add([
      sprite("obstacle"),
      pos(width() + i * 400, height() - 220),
      area(),
      body(),
      z(1),
      scale(0.1),
      "obstacle",
      { collided: false },
    ]) as Obstacle;

    obstacles.push(obs);
    console.log("Obstáculo criado com ID:", obs.id);
  }

  onUpdate(() => {
    console.log("Quantidade de obstáculos no update:", obstacles.length);

    if (gamePaused.current) return; // Não processar se o jogo estiver pausado

    const moveAmount = -speed * dt();

    bg1.move(moveAmount, 0);
    bg2.move(moveAmount, 0);

    for (const obs of obstacles) {
      obs.move(moveAmount, 0);

      // Redefinir o estado do obstáculo quando ele sair da tela
      if (obs.pos.x < -obs.width) {
        obs.pos.x = width() + Math.random() * 400;
        obs.collided = false;
      }

      // Ignorar obstáculos fora da tela
      if (obs.pos.x + obs.width < 0 || obs.pos.x > width()) {
        continue;
      }

      // Verificar colisão e garantir que só ocorra uma vez
      if (!obs.collided && car.isColliding(obs)) {

        const eventoSorteado = eventos[Math.floor(Math.random() * eventos.length)];
        setEventoAtual(eventoSorteado);


        obs.collided = true; // Marcar como colidido
        gamePaused.current = true; // Pausar o jogo
        collidedObstacle.current = obs; // Armazenar o obstáculo colidido

        console.log("Colisão detectada com ID:", obs.id);

        setShowPopup(true); // Mostrar o popup
        break; // Sair do loop após detectar a colisão
      }
    }

    // Reposicionar os fundos para criar o efeito de loop
    if (bg1.pos.x + bg1.width <= 0) {
      bg1.pos.x = bg2.pos.x + bg2.width;
    }
    if (bg2.pos.x + bg2.width <= 0) {
      bg2.pos.x = bg1.pos.x + bg1.width;
    }
  });
});


    go("main");
  }, []);

  const handleOptionClick = (choice: string) => {
    setPlayerChoice(choice);
    setEventoAtual(null);
    setShowPopup(false);

    if (collidedObstacle.current && destroyRef.current) {
      destroyRef.current(collidedObstacle.current);
      collidedObstacle.current = null;
    }

    gamePaused.current = false;
  };

  return (
    <div style={{ position: "relative" }}>
      <canvas ref={canvasRef} />
  
      {eventoAtual && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#f9f9f9",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            textAlign: "center",
            maxWidth: "600px",
            width: "90%",
            zIndex: 10,
          }}
        >
          <p
            style={{
              fontSize: "18px",
              marginBottom: "20px",
              color: "#333",
            }}
          >
            {eventoAtual.texto}
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            {eventoAtual.opcoes.map((opcao, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(opcao)}
                style={{
                  padding: "12px 24px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: index % 2 === 0 ? "#0077cc" : "#e63946",
                  color: "white",
                  fontSize: "16px",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    index % 2 === 0 ? "#005fa3" : "#c92a2a")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    index % 2 === 0 ? "#0077cc" : "#e63946")
                }
              >
                {opcao}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}