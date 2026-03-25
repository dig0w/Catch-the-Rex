export class Ground {
    #engine = null;

    static assets = [
        "../assets/ground0.png",
        "../assets/ground0.png",
        "../assets/ground0.png",
        "../assets/ground0.png",
        "../assets/ground1.png",
        "../assets/ground2.png"
    ];
    static tileSize = 32;
    #images = [];
    #groundY = 0;

    #groundCanvas = null;
    #xOffset = 0;

    constructor(engine = null) {
        this.#engine = engine;

        this.#groundY = this.#engine.canvas.height - Ground.tileSize + 10;
    }

    async Begin() {
        const loadPromises = Ground.assets.map(asset => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.src = asset;
            });
        });

        this.#images = await Promise.all(loadPromises);

        this.#groundCanvas = document.createElement("canvas");
        this.#groundCanvas.width = this.#engine.canvas.width + Ground.tileSize;
        this.#groundCanvas.height = Ground.tileSize;
        const gCtx = this.#groundCanvas.getContext("2d");

        for (let i = 0; i < (this.#groundCanvas.width / Ground.tileSize); i++) {
            const img = this.#images[Math.floor(Math.random() * this.#images.length)];
            gCtx.drawImage(img, i * Ground.tileSize, 0);
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