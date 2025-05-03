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

  useEffect(() => {
    if (!canvasRef.current) return;

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

    scene("main", () => {
      const speed = 12000;

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

      const obstacles: Obstacle[] = [];

      for (let i = 0; i < 3; i++) {
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
      }

      onUpdate(() => {
        if (gamePaused.current) return;

        if (isKeyDown("right")) {
          const moveAmount = -speed * dt();

          bg1.move(moveAmount, 0);
          bg2.move(moveAmount, 0);

          for (const obs of obstacles) {
            obs.move(moveAmount, 0);

            if (obs.pos.x < -obs.width) {
              obs.pos.x = width() + Math.random() * 400;
              obs.collided = false;
            }

            if (car.isColliding(obs) && !obs.collided && !gamePaused.current) {
              obs.collided = true;
              gamePaused.current = true;
              collidedObstacle.current = obs;

              console.log(obs);

              setTimeout(() => {
                setShowPopup(true);
              }, 150);
            }
          }

          if (bg1.pos.x + bg1.width <= 0) {
            bg1.pos.x = bg2.pos.x + bg2.width;
          }
          if (bg2.pos.x + bg2.width <= 0) {
            bg2.pos.x = bg1.pos.x + bg1.width;
          }
        }
      });
    });

    go("main");
  }, []);

  const handleOptionClick = (choice: string) => {
    setPlayerChoice(choice);
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

      {showPopup && (
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "30px",
            background: "rgba(0, 0, 0, 0.85)",
            color: "white",
            fontSize: "20px",
            borderRadius: "15px",
            zIndex: 10,
            textAlign: "center",
            minWidth: "300px",
          }}
        >
          <p>💥 Você bateu!</p>
          <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
            <button
              onClick={() => handleOptionClick("opcao1")}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#00A8E8",
                color: "white",
                cursor: "pointer",
              }}
            >
              Opção 1
            </button>
            <button
              onClick={() => handleOptionClick("opcao2")}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#FF595E",
                color: "white",
                cursor: "pointer",
              }}
            >
              Opção 2
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
