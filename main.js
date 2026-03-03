import { RunnerEngine } from "./game/engine.js";

const engine = new RunnerEngine();

engine.Begin();

// Tick
function Tick() {
    engine.Tick();

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