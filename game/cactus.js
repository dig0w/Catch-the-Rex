export class Cactus {
    #engine = null;

    static assets = [
        "../assets/cactus0.png",
        "../assets/cactus1.png",
        "../assets/cactus2.png"
    ];
    #images = [];
    #cacti = [];

    static minSpawnTime = 50 / 60;
    static maxSpawnTime = 100 / 60;
    #spawnTimer = 0;

    constructor(engine = null) {
        this.#engine = engine;
    }

    get cacti() { return this.#cacti; }

    Begin() {
        for (const asset of Cactus.assets) {
            const img = new Image();
            img.src = asset;

            this.#images.push(img);
        }
    }

    Tick(deltaTime) {
        this.#spawnTimer += deltaTime;

        if (this.#spawnTimer > (Math.random() * (Cactus.maxSpawnTime - Cactus.minSpawnTime) + Cactus.minSpawnTime) 
                            * (this.#engine.defaultGameSpeed / this.#engine.gameSpeed)) {
            let randomImg = this.#images[Math.floor(Math.random() * this.#images.length)];
            
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

        // Collisions
        this.#cacti.forEach(cactus => {
            // Dino collision - slow down
            if (this.#engine.CheckCollision(
                { x: this.#engine.dino.x + 5, y: this.#engine.dino.y + 5, width: this.#engine.dino.width - 10, height: this.#engine.dino.height - 10 },
                cactus
            ) && !this.#engine.dino.immune) {
                this.#engine.dino.Hitted(-8, 50 / 60);
                this.#engine.stunSound.play();
            }

            // Bird collision - game over
            if (this.#engine.CheckCollision(
                { x: this.#engine.bird.x + 5, y: this.#engine.bird.y + 5, width: this.#engine.bird.width - 10, height: this.#engine.bird.height - 10 },
                cactus
            )) {
                this.#engine.GameOver();
            }
        });
    }

    Draw(ctx) {
        ctx.filter = "invert(.46)";

        this.#cacti.forEach(cactus => {
            ctx.drawImage(cactus.img, cactus.x, cactus.y, cactus.width, cactus.height);
        });

        ctx.filter = "none";
    }

    GameStart() {
        
    }

    GameOver() {

    }

    ResetGame() {
        this.#cacti = [];
    }
}