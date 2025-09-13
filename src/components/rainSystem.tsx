// rainManager.ts
import { createRain } from "@/components/rain";
import { KaboomCtx } from "kaboom";

let rainController: any = null;
let rainSound: any = null;
let rainWaitTimer: any = null;

export function setupRainSystem(k: KaboomCtx, options?: { rainTime?: number; dryTime?: number }) {
  const { rainTime = 10, dryTime = 20 } = options || {};

  if (rainController) {
    // Já existe uma chuva rodando
    return { stopRain: stopRain };
  }

  function startRain() {
    if (rainController) return;

    rainController = createRain(k, {
      density: 500,
      speed: 1100,
      wind: -200,
      width: 1,
      length: 12,
      opacity: 0.55,
      z: 999,
      areaX: [-k.width() * 0.5, k.width()],
    });

    rainSound = k.play("rain", { loop: true, volume: 0.5 });
    console.log("🌧️ começou a chover!");
  }

  function stopRain() {
    if (rainWaitTimer) {
      rainWaitTimer.cancel();
      rainWaitTimer = null;
    }
    if (rainController) {
      rainController.stop();
      rainController = null;
    }
    if (rainSound) {
      rainSound.stop();
      console.log("🔇 som de chuva parado");
      rainSound = null;
    }
    console.log("☀️ parou de chover!");
  }

  function rainCycle() {
    startRain();
    rainWaitTimer = k.wait(rainTime, () => {
      stopRain();
      rainWaitTimer = k.wait(dryTime, rainCycle);
    });
  }

  k.onSceneLeave(() => stopRain());
  rainCycle();

  return { stopRain };
}
