export class Cloud {
    #engine = null;

    static assets = [
        "../assets/cloud0.png",
        "../assets/cloud1.png",
        "../assets/cloud2.png",
        "../assets/cloud3.png"
    ];
    #images = [];
    #clouds = [];

    static minSpawnTime = 150 / 60;
    static maxSpawnTime = 600 / 60;
    #spawnTimer = 0;

    constructor(engine = null) {
        this.#engine = engine;
    }

    Begin() {
        for (const asset of Cloud.assets) {
            const img = new Image();
            img.src = asset;

            this.#images.push(img);
        }
    }

    Tick(deltaTime) {
        this.#spawnTimer += deltaTime;

        if (this.#spawnTimer > (Math.random() * (Cloud.maxSpawnTime - Cloud.minSpawnTime) + Cloud.minSpawnTime) 
                                                      * (this.#engine.defaultGameSpeed / this.#engine.gameSpeed)) {
            let randomImg = this.#images[Math.floor(Math.random() * this.#images.length)];

            const maxY = 100;
            const minY = 20;

            const randomY = Math.random() * (maxY - minY) + minY;

            const scale = Math.random() * 0.6 + 0.8;
            const w = randomImg.width * scale;
            const h = randomImg.height * scale;

            const speedMult = (randomY / maxY) * 0.3 + 0.2;

            this.#clouds.push({
                x: this.#engine.canvas.width + 100,
                y: randomY,
                width: w,
                height: h,
                img: randomImg,
                speedFactor: speedMult
            });

            this.#spawnTimer = 0;
        }

        for (let i = this.#clouds.length - 1; i >= 0; i--) {
            this.#clouds[i].x -= this.#engine.gameSpeed * this.#clouds[i].speedFactor * deltaTime * 60;

            if (this.#clouds[i].x + this.#clouds[i].width < -50) {
                this.#clouds.splice(i, 1);
            }
        }
    }

    Draw(ctx) {
        ctx.filter = "invert(.46)";
        ctx.globalAlpha = 0.5;

        this.#clouds.forEach(cloud => {
            ctx.drawImage(cloud.img, cloud.x, cloud.y, cloud.width, cloud.height);
        });

        ctx.filter = "none";
        ctx.globalAlpha = 1;
    }

    GameStart() {
        
    }

    GameOver() {

    }

    ResetGame() {
        this.#clouds = [];
    }
}