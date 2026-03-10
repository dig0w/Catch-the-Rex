export class Hayball {
    constructor(engine = null) {
        this.engine = engine;

        this.assets = [
            '../assets/hayball0.png',
            '../assets/hayball1.png'
        ]
        this.images = [];

        this.hayballs = [];

        this.spawnTimer = 0;
        this.minSpawnTime = 400 / 60;
        this.maxSpawnTime = 600 / 60;
    }

    Begin() {
        for (const asset of this.assets) {
            const img = new Image();
            img.src = asset;

            this.images.push(img);
        }
    }

    Tick(deltaTime) {
        this.spawnTimer += deltaTime;

        if (this.engine.score >= 400 && this.spawnTimer > (Math.random() * (this.maxSpawnTime - this.minSpawnTime) + this.minSpawnTime) 
                                                        * (this.engine.defaultGameSpeed / this.engine.gameSpeed)) {
            let randomImg = this.images[Math.floor(Math.random() * this.images.length)];

            this.hayballs.push({
                x: this.engine.canvas.width,
                y: this.engine.canvas.height - randomImg.height - 5,
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

            this.spawnTimer = 0;
        }

        for (let i = this.hayballs.length - 1; i >= 0; i--) {
            let hayball = this.hayballs[i];

            hayball.x -= this.engine.gameSpeed * hayball.speedFactor * deltaTime * 60;
            hayball.x += hayball.dx * deltaTime * 60;
            hayball.dx *= Math.pow(hayball.friction, deltaTime * 60);

            hayball.dy += this.engine.gravity / 4 * deltaTime * 60;
            hayball.y += hayball.dy * deltaTime * 60;

            const floorY = this.engine.canvas.height - hayball.height - 5;
            if (hayball.y > floorY) {
                hayball.y = floorY;
                hayball.dy = -hayball.bounciness * hayball.friction;
            }

            hayball.angle += hayball.rotationSpeed * deltaTime * 60;

            if (hayball.x + hayball.width < -100) {
                this.hayballs.splice(i, 1);
            }
        }

        // Collisions
        this.hayballs.forEach(hayball => {
            // // Dino collision - throw to bird
            // if (this.engine.CheckCollision(
            //     { x: this.engine.dino.x + 5, y: this.engine.dino.y + 5, width: this.engine.dino.width - 10, height: this.engine.dino.height - 10 },
            //     hayball
            // ) && !this.engine.dino.immune) {
                
            // }

            // Bird collision - boosts dino
            if (this.engine.CheckCollision(
                { x: this.engine.bird.x + 5, y: this.engine.bird.y + 5, width: this.engine.bird.width - 10, height: this.engine.bird.height - 10 },
                hayball
            )) {
                this.engine.dino.dx += 2 * deltaTime * 60;
                this.engine.bird.Hitted(0, 100 / 60);
                this.engine.stunSound.play();
            }
        });
    }

    Draw() {
        this.engine.ctx.filter = "invert(.46)";

        this.hayballs.forEach(hayball => {
            this.engine.ctx.save();
            this.engine.ctx.translate(hayball.x + hayball.width / 2, hayball.y + hayball.height / 2);
            this.engine.ctx.rotate(-hayball.angle);
            this.engine.ctx.drawImage(hayball.img, -hayball.width / 2, -hayball.height / 2, hayball.width, hayball.height);
            this.engine.ctx.restore();
        });

        this.engine.ctx.filter = "none";
    }

    GameStart() {
        
    }

    GameOver() {

    }

    ResetGame() {
        this.hayballs = [];
    }
}