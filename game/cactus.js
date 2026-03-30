export class Cactus {
    #engine = null;

    static images = [
        Object.assign(new Image(), { src: "assets/cactus0.webp" }),
        Object.assign(new Image(), { src: "assets/cactus1.webp" }),
        Object.assign(new Image(), { src: "assets/cactus2.webp" })
    ];

    #cacti = [];
    static minSpawnTime = 50 / 60;
    static maxSpawnTime = 100 / 60;
    #spawnTimer = 0;

    constructor(engine = null) {
        this.#engine = engine;
    }

    get cacti() { return this.#cacti; }

    Begin() {

    }

    Tick(deltaTime) {
        this.#spawnTimer += deltaTime;

        if (this.#spawnTimer > (Math.random() * (Cactus.maxSpawnTime - Cactus.minSpawnTime) + Cactus.minSpawnTime) 
                            * (this.#engine.defaultGameSpeed / this.#engine.gameSpeed)) {
            let randomImg = Cactus.images[Math.floor(Math.random() * Cactus.images.length)];
            
            this.#cacti.push({
                x: this.#engine.canvas.width,
                y: this.#engine.canvas.height - randomImg.height,
                width: randomImg.width,
                height: randomImg.height,
                img: randomImg
            });

            this.#spawnTimer = 0;
        }

        for (let i = this.#cacti.length - 1; i >= 0; i--) {
            this.#cacti[i].x -= this.#engine.gameSpeed * deltaTime * 60;

            if (this.#cacti[i].x + this.#cacti[i].width < 0) {
                this.#cacti.splice(i, 1);
            }
        }
    }

    Draw(ctx) {
        for (let i = 0; i < this.#cacti.length; i++) {
            const cactus = this.#cacti[i];
            ctx.drawImage(cactus.img, (cactus.x | 0), (cactus.y | 0), (cactus.width | 0), (cactus.height | 0));
        }
    }

    GameStart() {
        
    }

    GameOver() {

    }

    ResetGame() {
        this.#cacti = [];
    }
}