import { Cube } from "./cube.js";

export class Dino {
    constructor(engine = null, cube = null) {
        this.engine = engine;
        this.cube = cube;

        this.dinoImg = new Image();
        this.dinoImg.src = '../assets/rex.png';
        this.dinoDeadImg = new Image();
        this.dinoDeadImg.src = '../assets/rex_dead.png';
        this.dinoRunLImg = new Image();
        this.dinoRunLImg.src = '../assets/rex_left_up.png';
        this.dinoRunRImg = new Image();
        this.dinoRunRImg.src = '../assets/rex_right_up.png';

        this.animState = false;
        this.defaultAnimTimer = 0.0833;
        this.animTimer = this.defaultAnimTimer;

        this.width = 54 / 1.25; // dinoImg.width / 1.25
        this.height = 60 / 1.25; // dinoImg.height / 1.25

        this.immune = false;
        this.defaultImmuneTimer = 1;
        this.immuneTimer = 0;
        this.isHit = false;

        this.x = 10;
        this.y = this.engine.canvas.height - this.height;

        this.dx = 0;
        this.friction = 0.95;

        this.dy = 0;
        this.jumpForce = 11;
        this.grounded = false;

        this.gotTarget = false;
        this.xTarget = null;
        this.yTarget = null;
        this.speedTarget = 1;
    }

    Begin() {
        this.cube.width = (this.width / 3) * 2;
        this.cube.height = this.height / 2;
        this.cube.x = this.x + (this.width / 3) * .5 - 2;
        this.cube.y = this.y + (this.height / 2);
    }

    Tick(deltaTime) {
        this.cube.x = this.x + (this.width / 3) * .5 - 2;
        this.cube.y = this.y + (this.height / 2);

        // Velocities
        this.x += this.dx * deltaTime * 60;
        this.dx *= Math.pow(this.friction, deltaTime * 60);

        if (!this.grounded) {
            this.dy += this.engine.gravity * deltaTime * 60;
            this.y += this.dy * deltaTime * 60;
        }

    const floorY = this.engine.canvas.height - this.height;
        if (this.y > floorY) {
            this.y = floorY;
            this.dy = 0;
            this.grounded = true;
        }

        // Immunity
        if (this.immune) {
            this.immuneTimer -= deltaTime;
            if (this.immuneTimer <= 0) {
                this.immune = false;
            }
        }

        // AI
        if (this.engine.isGameStarted && !this.engine.isGameOver) {
            this.AI();
        }

        // Dino Anim
        this.animTimer -= deltaTime;
        if (this.animTimer <= 0) {
            this.animState = !this.animState;
            this.animTimer += this.defaultAnimTimer;
            this.isHit = false;
        }

        // Move To
        if (this.gotTarget) {
            const dx = this.xTarget - this.x;
            const dy = this.yTarget - this.y;

            if (Math.abs(dx) < this.speedTarget) {
                this.x = this.xTarget;
            } else {
                this.x += Math.sign(dx) * this.speedTarget * deltaTime * 60;
            }

            if (Math.abs(dy) < this.speedTarget) {
                this.y = this.yTarget;
            } else {
                this.y += Math.sign(dy) * this.speedTarget * deltaTime * 60;
            }

            if (this.x === this.xTarget && this.y === this.yTarget) {
                this.gotTarget = false;
            }
        }
    }

    Draw() {
        this.engine.ctx.filter = "invert(.46)";

        // Immunity
        if (this.immune && !this.engine.isGameOver) {
            this.engine.ctx.globalAlpha = Math.sin(Date.now() / 50) > 0 ? 0.5 : 1.0;
        } else {
            this.engine.ctx.globalAlpha = 1.0;
        }

        // Draw Dino
        this.engine.ctx.drawImage(
            this.isHit ? this.dinoDeadImg : this.dy != 0 || this.engine.gameSpeed == 0 ? this.dinoImg : (this.animState ? this.dinoRunLImg : this.dinoRunRImg),
                    this.x, this.y, this.width, this.height);

        this.engine.ctx.filter = "none";
        this.engine.ctx.globalAlpha = 1.0;
    }

    GameStart() {
        this.MoveTo((this.engine.canvas.width / 2) - (this.engine.dino.width / 2), this.engine.dino.y, 2);
    }

    GameOver() {

    }

    ResetGame() {
        this.x = (this.engine.canvas.width / 2) - (this.engine.dino.width / 2);
        this.y = this.engine.canvas.height - this.height;
        this.dx = 0;
        this.dy = 0;
        this.grounded = true;

        this.immune = false;
        this.immuneTimer = 0;
        this.isHit = false;

        this.gotTarget = false;
        this.xTarget = null;
        this.yTarget = null;
        this.speedTarget = 1;
    }

    MoveTo(x = 0, y = 0, speed = 1) {
        this.gotTarget = true;
        this.xTarget = x;
        this.yTarget = y;
        this.speedTarget = speed;
    }

    Hitted(boost = 0, duration = this.defaultImmuneTimer) {
        this.immune = true;
        this.immuneTimer = duration;

        this.dx += boost;
        this.isHit = true;
        this.animTimer = this.defaultAnimTimer;
    }

    Jump() {
        this.dy = -this.jumpForce;
        this.grounded = false;
    }

    CrouchJump() {
        this.dy += this.engine.gravity * 5; 
    }

    AI() {
        if (!this.grounded) return;

        const nearestCactus = this.engine.cactus.cacti.find(c => c.x > this.x);

        if (nearestCactus) {
            const jumpThreshold = 100 + (this.engine.gameSpeed * 5); 

            const distance = nearestCactus.x - this.x;

            if (distance < jumpThreshold) {
                if (Math.random() > 0) {
                    this.Jump();
                }
            }
        }
    }
}