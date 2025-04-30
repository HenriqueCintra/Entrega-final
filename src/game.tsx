import { useEffect, useRef, useState } from "react";
import kaboom from "kaboom";

export function GameScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showPopup, setShowPopup] = useState(false);

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
    } = k;
    
    loadSprite("background", "/assets/backgroundd.png");
    loadSprite("car", "/assets/truck.png");
    loadSprite("obstacle", "/assets/obstaclee.png");
    
    scene("main", () => {
      const speed = 12000;
    
      // Fundo parallax
      const bg = add([
        sprite("background"),
        pos(0, 0),
        z(0), // camada mais ao fundo
        { speed },
      ]);
    
      // Caminhão
      const car = add([
        sprite("car"),
        pos(10, height() - 250),
        area(),
        body(),
        z(2),
        scale(0.75), // na frente do obstáculo
      ]);
    
      // Obstáculo (parte da camada do mundo)
      const obstacle = add([
        sprite("obstacle"),
        pos(width(), height() - 220),
        area(),
        body(),
        z(1),
        scale(0.1), // na frente do fundo
        "obstacle",
      ]);
    
      onUpdate(() => {
        // Movimento de fundo (parallax mais lento)
        if (isKeyDown("right")) {
          const moveAmount = -speed * dt();
          bg.move(moveAmount, 0);
          obstacle.move(moveAmount, 0); // mesma velocidade do fundo
        }
    
        if (obstacle.pos.x < -obstacle.width) {
          obstacle.pos.x = width() + Math.random() * 200;
        }
    
        if (car.isColliding(obstacle)) {
          setShowPopup(true);
        }
      });
    });
    
    go("main");
    
  })

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