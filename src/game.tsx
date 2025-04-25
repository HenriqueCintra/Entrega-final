import { useEffect, useRef, useState } from "react";
import kaboom from "kaboom";

export function GameScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const k = kaboom({
      canvas: canvasRef.current,
      width: 640,
      height: 480,
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
    } = k;
    
    loadSprite("background", "/assets/background.png");
    loadSprite("car", "/assets/truck.png");
    loadSprite("obstacle", "/assets/obstacle.png");
    
    scene("main", () => {
      const speed = 1200;
    
      // Fundo parallax
      const bg = add([
        sprite("background", { width: width(), height: height() }),
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
        z(2), // na frente do obstáculo
      ]);
    
      // Obstáculo (parte da camada do mundo)
      const obstacle = add([
        sprite("obstacle"),
        pos(width(), height() - 250),
        area(),
        body(),
        z(1), // na frente do fundo
        "obstacle",
      ]);
    
      onUpdate(() => {
        // Movimento de fundo (parallax mais lento)
        if (isKeyDown("right")) {
          bg.move(-speed * 0.3 * dt(), 0);     // fundo move mais devagar
          obstacle.move(-speed * dt(), 0);     // obstáculo move normal
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