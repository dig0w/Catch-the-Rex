import { RunnerEngine } from "./game/engine.js";

const targetFPS = 30;
const frameDuration = 1000 / targetFPS;

let lastTime = performance.now();
let accumulator = 0;

const engine = new RunnerEngine();

engine.Begin();

// Tick
function Tick() {
    let now = performance.now();
    let deltaTime = (now - lastTime) / 1000;
    lastTime = now;

    if (deltaTime > 0.1) deltaTime = 0.016;

    engine.Tick(deltaTime);

    engine.Draw();

    requestAnimationFrame(Tick);
}

// Start loop
requestAnimationFrame(Tick);

// Input Handling
window.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "ArrowUp") {
        engine.upInput = true;
    }
    if (e.code === "ArrowDown") {
        engine.downInput = true;
    }
});

window.addEventListener("pointerdown", (e) => {
    if (e.target.id == "runner-canvas") {
        engine.upInput = true;
    }
});