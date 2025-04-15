import { useEffect, useRef } from "react";
import kaboom from "kaboom";

const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const k = kaboom({
      canvas: canvasRef.current,
      background: [135, 206, 235],
    });

    const {
      add,
      pos,
      rect,
      color,
      area,
      body,
      move,
      RIGHT,
      LEFT,
      text,
      onKeyDown,
    } = k;

    const player = add([
      rect(40, 20),
      pos(50, 100),
      color(255, 0, 0),
      area(),
      body(),
      move(RIGHT, 0),
      "player",
    ]);

    add([
      rect(30, 30),
      pos(300, 100),
      color(0, 0, 255),
      area(),
      body({ isStatic: true }),
      "obstacle",
    ]);

    onKeyDown("right", () => {
      player.move(100, 0);
    });

    onKeyDown("left", () => {
      player.move(-100, 0);
    });

    player.onCollide("obstacle", () => {
      add([
        text("Colidiu!"),
        pos(150, 50),
        color(0, 0, 0),
      ]);
    });

    return () => {
      // Limpeza se necessário
    };
  }, []);

  return (
    <div style={{ border: "2px solid #000", display: "inline-block" }}>
      <canvas ref={canvasRef} width={640} height={240} />
    </div>
  );
};

export default Game;
