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
    #tiles = [];
    #groundY = 0;

    constructor(engine = null) {
        this.#engine = engine;

        this.#groundY = this.#engine.canvas.height - Ground.tileSize + 10;
    }

    Begin() {
        for (const asset of Ground.assets) {
            const img = new Image();
            img.src = asset;

            this.#images.push(img);
        }

        // Fill the screen
        for (let i = 0; i <= this.#engine.canvas.width / Ground.tileSize + 1; i++) {
            this.#tiles.push({
                x: i * Ground.tileSize,
                img: this.#images[Math.floor(Math.random() * this.#images.length)]
            });
        }
    }

    Tick(deltaTime) {
        for (const tile of this.#tiles) {
            tile.x -= this.#engine.gameSpeed * deltaTime * 60;
        }

        if (this.#tiles[0].x <= -Ground.tileSize) {
            this.#tiles.shift();

            // Add a new random tile at the end of the line
            let lastTileX = this.#tiles[this.#tiles.length - 1].x;
            this.#tiles.push({
                x: lastTileX + Ground.tileSize,
                img: this.#images[Math.floor(Math.random() * this.#images.length)]
            });
        }
    }

    Draw(ctx) {
        this.#tiles.forEach(tile => {
            ctx.drawImage(tile.img, tile.x, this.#groundY, Ground.tileSize, Ground.tileSize);
        });
    }

    GameStart() {
        
    }

    GameOver() {

    }

    ResetGame() {
        
    }
}