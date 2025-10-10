import { createRain } from "@/components/rain";
import { KaboomCtx } from "kaboom";

let rainController: any = null;
let rainSound: any = null;

export function setupRainSystem(k: KaboomCtx, options?: { rainTime?: number; dryTime?: number }) {
    //const { rainTime = 10, dryTime = 20 } = options || {};
    
    function startRain() {
        if (rainController) return;
        
        rainController = createRain(k, {
            density: 700,
            speed: 1000,
            wind: -250,
            width: 1,
            length: 12,
            opacity: 0.70,
            z: 999,
            areaX: [-k.width() * 0.5, k.width()],
        });

        rainSound = k.play("rain", { loop: true, volume: 0.5 });
        console.log("🌧️ começou a chover!");
    }

    function stopRain() {
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

    return { startRain, stopRain };
}
