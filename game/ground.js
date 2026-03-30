export class Ground {
    #engine = null;

    static sheet = Object.assign(new Image(), { src: "assets/grounds.webp" });
    static tileSize = 32;
    static weights = [0, 0, 0, 0, 1, 2];
    #groundY = 0;

    #groundCanvas = null;
    #xOffset = 0;

    constructor(engine = null) {
        this.#engine = engine;

        this.#groundY = this.#engine.canvas.height - Ground.tileSize + 10;
    }

    Begin() {
        Ground.sheet.onload = () => {
            this.#groundCanvas = document.createElement("canvas");
            this.#groundCanvas.width = this.#engine.canvas.width + Ground.tileSize;
            this.#groundCanvas.height = Ground.tileSize;
            const gCtx = this.#groundCanvas.getContext("2d");

            for (let i = 0; i < (this.#groundCanvas.width / Ground.tileSize); i++) {
                const frame = Ground.weights[Math.floor(Math.random() * Ground.weights.length)];
                let frameCoords = { x: (frame % 2) * Ground.tileSize, y: Math.floor(frame / 2) * Ground.tileSize };

                gCtx.drawImage(Ground.sheet, (frameCoords.x | 0), (frameCoords.y | 0), Ground.tileSize, Ground.tileSize, i * Ground.tileSize, 0, Ground.tileSize, Ground.tileSize);
            }
        }
    }

    Tick(deltaTime) {
        if (!this.#groundCanvas) return;

        this.#xOffset += this.#engine.gameSpeed * deltaTime * 60;

        if (this.#xOffset >= this.#groundCanvas.width) {
            this.#xOffset = 0;
        }
    }

    Draw(ctx) {
        if (!this.#groundCanvas) return;

        const x = (-this.#xOffset) | 0;
        const y = this.#groundY | 0;

        ctx.drawImage(this.#groundCanvas, x, y);
        ctx.drawImage(this.#groundCanvas, x + this.#groundCanvas.width, y);
    }

    GameStart() {
        
    }

    GameOver() {

    }

    ResetGame() {
        
    }
}