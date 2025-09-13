import { Color, KaboomCtx } from "kaboom";

// rain.ts
type RainOptions = {
  density?: number;     // gotas por segundo
  speed?: number;       // pixels/seg
  wind?: number;        // desvio em X (px/seg), negativo = vento p/ esquerda
  width?: number;       // largura da gota
  length?: number;      // comprimento da gota
  color?: Color;        // k.rgb(r,g,b) ou k.Color.fromArray
  opacity?: number;     // 0..1
  z?: number;           // profundidade (para layers)
  areaX?: [number, number]; // faixa horizontal de spawn (px)
};

export function createRain(k: KaboomCtx, opts: RainOptions = {}) {
  const {
    density = 400,              // gotas/s (ajuste pra performance)
    speed = 900,
    wind = -250,                // negativo inclina pra esquerda
    width = 1,
    length = 10,
    color = k.rgb(150, 180, 255),
    opacity = 0.55,
    z = 1000,                   // bem na frente; ajuste se quiser
    areaX = [0, k.width()],
  } = opts;

  // timer interno para rate-control
  let carry = 0;
  const perFrame = (dt: number) => {
    // quantas gotas criar neste frame
    const want = density * dt + carry;
    const count = Math.floor(want);
    carry = want - count;

    for (let i = 0; i < count; i++) {
        const x = k.rand(areaX[0], areaX[1]);
        const y = k.rand(-length * 5, 0); // até um pouco acima do topo

      // Cada gota é um retângulo fino com pequena rotação
      const angle = Math.atan2(speed, Math.abs(wind)) * (wind < 0 ? -1 : 1);

      const drop = k.add([
        k.rect(width, length),
        k.color(color),
        k.opacity(opacity),
        k.pos(x, y),
        k.rotate(angle), // inclina no sentido do "vento"
        k.move(wind, speed), // dx, dy por segundo
        k.z(z),
        "raindrop",
        {
          // vida útil máx (fallback caso não destrua por sair da tela)
          life: 3,
        },
      ]);

      drop.onUpdate(() => {
        // destrói ao sair da tela (considerando inclinação)
        if (drop.pos.y > k.height() + length || drop.pos.x < -50 || drop.pos.x > k.width() + 50) {
          drop.destroy();
        }
      });

      // kill-switch se algo ficar perdido
      drop.onUpdate(() => {
        (drop as any).life -= k.dt();
        if ((drop as any).life <= 0) drop.destroy();
      });
    }
  };

  // hook global para criar continuamente
  const unbind = k.onUpdate(() => perFrame(k.dt()));

  // retorna um controlador para poder desligar/alterar depois
  return {
    stop() { unbind.cancel(); },
    setDensity(d: number) { (opts as any).density = d; },
  };
}
