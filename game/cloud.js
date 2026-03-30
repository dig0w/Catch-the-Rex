export class Cloud {
    #engine = null;

    static sheet = Object.assign(new Image(), { src: "assets/clouds.webp" });
    static frameSize = 32;

    #clouds = [];
    static minSpawnTime = 150 / 60;
    static maxSpawnTime = 600 / 60;
    #spawnTimer = 0;

    constructor(engine = null) {
        this.#engine = engine;
    }

    Begin() {

    }

    Tick(deltaTime) {
        this.#spawnTimer += deltaTime;

        if (this.#spawnTimer > (Math.random() * (Cloud.maxSpawnTime - Cloud.minSpawnTime) + Cloud.minSpawnTime) 
                                * (this.#engine.defaultGameSpeed / this.#engine.gameSpeed)) {
            const maxY = 100;
            const minY = 20;

            const randomY = Math.random() * (maxY - minY) + minY;

            const scale = Math.random() * 0.6 + 0.8;
            const w = Cloud.frameSize * scale;
            const h = Cloud.frameSize * scale;

            const speedMult = (randomY / maxY) * 0.3 + 0.2;

            this.#clouds.push({
                x: this.#engine.canvas.width + 100,
                y: randomY,
                width: w,
                height: h,
                frame: Math.floor(Math.random() * 4),
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
        for (let i = 0; i < this.#clouds.length; i++) {
            const cloud = this.#clouds[i];
            let frameCoords = { x: (cloud.frame % 2) * Cloud.frameSize, y: Math.floor(cloud.frame / 2) * Cloud.frameSize };

            ctx.drawImage(Cloud.sheet, (frameCoords.x | 0), (frameCoords.y | 0), (Cloud.frameSize | 0), (Cloud.frameSize | 0), (cloud.x | 0), (cloud.y | 0), (cloud.width | 0), (cloud.height | 0));
        }
    }

    GameStart() {
        
    }

    GameOver() {

    }

    ResetGame() {
        this.#clouds = [];
    }
}