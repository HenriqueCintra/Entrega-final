import { useEffect, useRef, useState } from "react";
import kaboom from "kaboom";

const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const setShowPopupRef = useRef(setShowPopup);

  useEffect(() => {
    setShowPopupRef.current = setShowPopup;

    if (!canvasRef.current) return;

    const k = kaboom({
      canvas: canvasRef.current,
      width: 800,
      height: 600,
      background: [135, 206, 235],
    });

    const {
      add,
      pos,
      area,
      move,
      RIGHT,
      onKeyDown,
      sprite,
      anchor,
      destroyAll,
      onCollide,
    } = k;

    Promise.all([
      k.loadSprite("truck", "./src/assets/truck.png"),
      k.loadSprite("obstacle", "./src/assets/obstacle.png"),
    ]).then(() => {
      k.scene("main", () => {
        const truck = add([
          sprite("truck"),
          pos(100, 400),
          area(),
          move(RIGHT, 0),
          anchor("center"),
          "truck",
        ]);

        const obstacle = add([
          sprite("obstacle"),
          pos(500, 400),
          area(),
          anchor("center"),
          "obstacle",
        ]);

        onKeyDown("right", () => {
          truck.move(200, 0);
        });

        truck.onCollide("obstacle", () => {
          destroyAll("truck");
          destroyAll("obstacle");

          // Exibir pop-up usando React state
          setShowPopupRef.current(true);
        });
      });

      k.go("main");
    });

    return () => {
      k.destroyAll("truck");
      k.destroyAll("obstacle");
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} />

      {showPopup && (
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "30%",
            background: "white",
            padding: "2rem",
            borderRadius: "1rem",
            boxShadow: "0 0 10px rgba(0,0,0,0.3)",
            color: "black",
            zIndex: 999,
          }}
        >
          <h2>🚧 Colisão detectada!</h2>
          <button onClick={() => setShowPopup(false)}>Fechar</button>
        </div>
      )}
    </>
  );
};

export default Game;
