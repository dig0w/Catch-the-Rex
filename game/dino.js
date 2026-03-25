import { Cube } from "./cube.js";

export class Dino {
    #engine = null;
    #cube = null;

    #width = 54 / 1.25;
    #height = 60 / 1.25;
    #x = 10;
    #y = 0;

    #dinoImg = new Image();
    #dinoDeadImg = new Image();
    #dinoRunLImg = new Image();
    #dinoRunRImg = new Image();
    static defaultAnimTimer = 5 / 60;
    #animState = false;
    #animTimer = Dino.defaultAnimTimer;

    static friction = 0.95;
    #jumpForce = 11;
    #grounded = false;

    #gotTarget = false
    #xTarget = null;
    #yTarget = null;
    #speedTarget = 1;

    static defaultImmuneTimer = 1;
    #immune = false;
    #immuneTimer = 0;
    #isHit = false;

    constructor(engine = null) {
        this.#engine = engine;

        this.#y = this.#engine.canvas.height - this.#height;

        this.#dinoImg.src = "../assets/rex.png";
        this.#dinoDeadImg.src = "../assets/rex_dead.png";
        this.#dinoRunLImg.src = "../assets/rex_left_up.png";
        this.#dinoRunRImg.src = "../assets/rex_right_up.png";

        this.dx = 0;
        this.dy = 0;

        const bodyStyle = window.getComputedStyle(document.body);
        const bgColor = bodyStyle.backgroundColor;
        this.#cube = new Cube(this.#engine, (this.#width / 3) * 2, this.#height / 2, bgColor, this.#x + (this.#width / 3) * .5 - 2, this.#y + (this.#height / 2));
    }

    get x() { return this.#x; }
    get y() { return this.#y; }
    get width() { return this.#width; }
    get height() { return this.#height; }
    get immune() { return this.#immune; }

    get cube() { return this.#cube; }

    Begin() {

    }

    Tick(deltaTime) {
        // Velocities
        this.#x += this.dx * deltaTime * 60;
        this.dx *= Math.pow(Dino.friction, deltaTime * 60);

        if (!this.#grounded) {
            this.dy += this.#engine.gravity * deltaTime * 60;
            this.#y += this.dy * deltaTime * 60;
        }

        const floorY = this.#engine.canvas.height - this.#height;
        if (this.#y > floorY) {
            this.#y = floorY;
            this.dy = 0;
            this.#grounded = true;
        }

        this.#cube.MoveTo(this.#x + (this.#width / 3) * .5 - 2, this.#y + (this.#height / 2), 0);

        // Immunity
        if (this.#immune) {
            this.#immuneTimer -= deltaTime;
            if (this.#immuneTimer <= 0) {
                this.#immune = false;
            }
        }

        // AI
        if (this.#engine.isGameStarted && !this.#engine.isGameOver) {
            this.AI();
        }

        // Dino Anim
        this.#animTimer -= deltaTime;
        if (this.#animTimer <= 0) {
            this.#animState = !this.#animState;
            this.#animTimer += Dino.defaultAnimTimer;
            this.#isHit = false;
        }

        // Move To
        if (this.#gotTarget) {
            const dx = this.#xTarget - this.#x;
            const dy = this.#yTarget - this.#y;

            if (Math.abs(dx) < this.#speedTarget) {
                this.#x = this.#xTarget;
            } else {
                this.#x += Math.sign(dx) * this.#speedTarget * deltaTime * 60;
            }

            if (Math.abs(dy) < this.#speedTarget) {
                this.#y = this.#yTarget;
            } else {
                this.#y += Math.sign(dy) * this.#speedTarget * deltaTime * 60;
            }

            if (this.#x === this.#xTarget && this.#y === this.#yTarget) {
                this.#gotTarget = false;
            }
        }

        // Canvas Limits
        if (this.#x < 10) this.#x = 10;
        if (this.#x > this.#engine.canvas.width - this.#width - 10) this.#x = this.#engine.canvas.width - this.#width - 10;
    }

    Draw(ctx) {
        // Immunity
        if (this.#immune && !this.#engine.isGameOver) {
            ctx.globalAlpha = Math.sin(Date.now() / 50) > 0 ? 0.5 : 1.0;
        } else {
            ctx.globalAlpha = 1.0;
        }

        // Draw Dino
        ctx.drawImage(
            this.#isHit ? this.#dinoDeadImg : this.dy != 0 || this.#engine.gameSpeed == 0 ? this.#dinoImg : (this.#animState ? this.#dinoRunLImg : this.#dinoRunRImg),
                    this.#x, this.#y, this.#width, this.#height);

        ctx.globalAlpha = 1.0;
    }

    GameStart() {
        this.MoveTo((this.#engine.canvas.width / 2) - (this.#width / 2), this.#y, 2);
    }

    GameOver() {

    }

    ResetGame() {
        this.#x = (this.#engine.canvas.width / 2) - (this.#width / 2);
        this.#y = this.#engine.canvas.height - this.#height;
        this.dx = 0;
        this.dy = 0;
        this.#grounded = true;

        this.#immune = false;
        this.#immuneTimer = 0;
        this.#isHit = false;

        this.#gotTarget = false;
        this.#xTarget = null;
        this.#yTarget = null;
        this.#speedTarget = 1;
    }

    MoveTo(x = 0, y = 0, speed = 1) {
        this.#gotTarget = true;
        this.#xTarget = x;
        this.#yTarget = y;
        this.#speedTarget = speed;
    }

    Hitted(boost = 0, duration = Dino.defaultImmuneTimer) {
        this.#immune = true;
        this.#immuneTimer = duration;

        this.dx += boost;
        this.#isHit = true;
        this.#animTimer = Dino.defaultAnimTimer;
    }

    Jump() {
        this.dy = -this.#jumpForce;
        this.#grounded = false;
    }

    CrouchJump() {
        this.dy += this.#engine.gravity * 5; 
    }

    AI() {
        if (!this.#grounded) return;

        const nearestCactus = this.#engine.cactus.cacti.find(c => c.x > this.#x);

        if (nearestCactus) {
            const jumpThreshold = (this.#engine.gameSpeed + this.dx) * (this.#jumpForce / this.#engine.gravity);
            const distance = nearestCactus.x - this.#x;

            if (distance < jumpThreshold && Math.random() > .4) {
                this.Jump();
            }
        }
    }
}