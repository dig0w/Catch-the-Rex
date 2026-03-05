import { RunnerEngine } from "./game/engine.js";

const engine = new RunnerEngine();
engine.Begin();

// Tick
let lastTime = performance.now();
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


// Settings
const settingsTrigger = document.querySelector('.settings-trigger');
const settingsPopup = document.querySelector('.settings-popup');

settingsTrigger.addEventListener("click", () => {
    if (settingsPopup.classList.contains("hidden")) {
        settingsPopup.classList.remove("hidden");
    } else {
        settingsPopup.classList.add("hidden");
    }
});

document.querySelectorAll(".setting").forEach((container, i) => {
    const slider = container.querySelector("input");
    const btn = container.querySelector(".mute-btn");
    const icon = btn.querySelector(".material-symbols-outlined");
    slider.value = localStorage.getItem(i == 0 ? "volume" : "music") || 0.5;
    let lastValue = slider.value;

    const iconType = (i === 0) ? "volume_up" : "music_note";
    const muteType = (i === 0) ? "volume_off" : "music_off";

    const Update = () => {
        const val = parseFloat(slider.value);
        icon.textContent = (val > 0) ? iconType : muteType;
        engine.UpdateVolume(val, i);
        localStorage.setItem(i == 0 ? "volume" : "music", val);
    };

    btn.addEventListener("click", () => {
        if (slider.value > 0) {
            lastValue = slider.value;
            slider.value = 0;
        } else {
            slider.value = lastValue || 0.5;
        }

        Update();
    });

    slider.addEventListener("input", Update);
});


// Input Handling
window.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        engine.upInput = true;
    }
    if (e.code === "ArrowDown") {
        e.preventDefault();
        engine.downInput = true;
    }
});

window.addEventListener("pointerdown", (e) => {
    if (e.target.id == "runner-canvas") {
        engine.upInput = true;
    }


    const elements = [e.target, e.target.parentNode, e.target.parentNode.parentNode, e.target.parentNode.parentNode.parentNode];
    let isPopup = false;

    elements.forEach(el => {
        if (el != document && (el.classList.contains("settings-popup") || el.classList.contains("settings-trigger"))) {
            isPopup = true;
        }
    });

    if (!isPopup) {
        settingsPopup.classList.add('hidden');
    }
});