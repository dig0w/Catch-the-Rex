import { FloatingText } from "./floatingText.js";

export class Bird {
    #engine = null;

    #width = 64 / 1.25;
    #height = 57 / 1.25;
    #x = 0;
    #y = 10;

    #birdImgOpen = new Image();
    #birdImgClosed = new Image();
    static defaultAnimTimer = 10 / 60;
    #animState = false;
    #animTimer = Bird.defaultAnimTimer;

    #jumpForce = 6;

    #gotTarget = false
    #xTarget = null;
    #yTarget = null;
    #speedTarget = 1;

    static defaultImmuneTimer = .75;
    #immune = false;
    #immuneTimer = 0;
    #isHit = false;

    constructor(engine = null) {
        this.#engine = engine;

        this.#x = -((this.#engine.canvas.width / 2) - (this.#width / 2));

        this.#birdImgOpen.src = "assets/pterodactyl_open.png";
        this.#birdImgClosed.src = "assets/pterodactyl_closed.png";

        this.dx = 0;
        this.dy = 0;
    }

    get x() { return this.#x; }
    get y() { return this.#y; }
    get width() { return this.#width; }
    get height() { return this.#height; }
    get immune() { return this.#immune; }

    Begin() {

    }

    Tick(deltaTime) {
        if (!this.#gotTarget && this.#engine.isGameStarted && !this.#engine.isGameOver) {
            this.dy += (this.#engine.gravity / 2) * deltaTime * 60;
            this.#y += this.dy * deltaTime * 60;

            const floorY = this.#engine.canvas.height - this.#height - 10;
            if (this.#y > floorY) {
                this.#y = floorY;
                this.dy = 0;
            }
            if (this.#y < 0) { this.#y = 0; }
        }

        // Immunity
        if (this.#immune) {
            this.#immuneTimer -= deltaTime;
            if (this.#immuneTimer <= 0) {
                this.#immune = false;
            }
        }

        // Bird Anim
        this.#animTimer -= deltaTime;
        if (this.#animTimer <= 0) {
            this.#animState = !this.#animState;
            this.#animTimer += Bird.defaultAnimTimer;
        }

        // Move To
        if (this.#gotTarget) {
            if (this.#speedTarget == 0) {
                this.#x = this.#xTarget;
                this.#y = this.#yTarget;
            } else {
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
        }
    }

    Draw(ctx) {
        // Immunity
        if (this.#immune && !this.#engine.isGameOver) {
            ctx.globalAlpha = Math.sin(Date.now() / 50) > 0 ? 0.5 : 1.0;
        } else {
            ctx.globalAlpha = 1.0;
        }

        // Draw Bird
        ctx.drawImage(this.#animState ? this.#birdImgOpen : this.#birdImgClosed,
            (this.#x | 0), (this.#y | 0), (this.#width | 0), (this.#height | 0));

        ctx.globalAlpha = 1.0;
    }

    GameStart() {
        this.MoveTo(10, this.#y, 4);
    }

    GameOver() {

    }

    ResetGame() {
        this.#y = 10;
        this.dy = 0;

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
        this.#speedTarget = speed * (5 / this.#engine.defaultGameSpeed);
    }

    Hitted(boost = 0, duration = Bird.defaultImmuneTimer) {
        this.#immune = true;
        this.#immuneTimer = duration;

        this.dx += boost;
        this.#isHit = true;
        this.#animTimer = Bird.defaultAnimTimer;
    }

    Jump() {
        this.dy = -this.#jumpForce;
    }

    CrouchJump() {
        this.dy += this.#engine.gravity * 5; 
    }
}