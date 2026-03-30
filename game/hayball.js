export class Hayball {
    #engine = null;

    static images = [
        Object.assign(new Image(), { src: "assets/hayball0.webp" }),
        Object.assign(new Image(), { src: "assets/hayball1.webp" })
    ];

    #hayballs = [];
    static minSpawnTime = 400 / 60;
    static maxSpawnTime = 600 / 60;
    #spawnTimer = 0;

    constructor(engine = null) {
        this.#engine = engine;
    }

    get hayballs() { return this.#hayballs; }

    Begin() {

    }

    Tick(deltaTime) {
        this.#spawnTimer += deltaTime;

        if (this.#engine.score >= 400 && this.#spawnTimer > (Math.random() * (Hayball.maxSpawnTime - Hayball.minSpawnTime) + Hayball.minSpawnTime) 
                                                        * (this.#engine.defaultGameSpeed / this.#engine.gameSpeed)) {
            let randomImg = Hayball.images[Math.floor(Math.random() * Hayball.images.length)];

            this.#hayballs.push({
                x: this.#engine.canvas.width,
                y: this.#engine.canvas.height - randomImg.height - 5,
                width: randomImg.width * 1.25,
                height: randomImg.height * 1.25,
                img: randomImg,
                dx: 0,
                dy: 0,
                angle: 0,
                rotationSpeed: Math.random() * 0.2 + 0.1,
                speedFactor: Math.random() * 0.4 + 1.2,
                friction: 0.98,
                bounciness: 3 + (Math.random() * 0.2),
                grounded: false
            });

            this.#spawnTimer = 0;
        }

        for (let i = this.#hayballs.length - 1; i >= 0; i--) {
            let hayball = this.#hayballs[i];

            hayball.x -= this.#engine.gameSpeed * hayball.speedFactor * deltaTime * 60;
            hayball.x += hayball.dx * deltaTime * 60;
            hayball.dx *= Math.pow(hayball.friction, deltaTime * 60);

            hayball.dy += this.#engine.gravity / 4 * deltaTime * 60;
            hayball.y += hayball.dy * deltaTime * 60;

            const floorY = this.#engine.canvas.height - hayball.height - 5;
            if (hayball.y > floorY) {
                hayball.y = floorY;
                hayball.dy = -hayball.bounciness * hayball.friction;
            }

            hayball.angle += hayball.rotationSpeed * deltaTime * 60;

            if (hayball.x + hayball.width < -100) {
                this.#hayballs.splice(i, 1);
            }
        }
    }

    Draw(ctx) {
        for (let i = 0; i < this.#hayballs.length; i++) {
            const hayball = this.#hayballs[i];

            ctx.save();
            ctx.translate(((hayball.x + hayball.width / 2) | 0), ((hayball.y + hayball.height / 2) | 0));
            ctx.rotate(-hayball.angle);
            ctx.drawImage(hayball.img, ((-hayball.width / 2) | 0), ((-hayball.height / 2) | 0),(hayball.width | 0), (hayball.height | 0));
            ctx.restore();
        }
    }

    GameStart() {
        
    }

    GameOver() {

    }

    ResetGame() {
        this.#hayballs = [];
    }
}