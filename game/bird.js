export class Bird {
    constructor(engine = null) {
        this.engine = engine;

        this.birdImgOpen = new Image();
        this.birdImgOpen.src = 'assets/pterodactyl_open.png';
        this.birdImgClosed = new Image();
        this.birdImgClosed.src = 'assets/pterodactyl_closed.png';

        this.animState = false;
        this.defaultAnimTimer = 10;
        this.animTimer = this.defaultAnimTimer;

        this.width = 64 / 1.25; // birdImgOpen.width / 1.25
        this.height = 57 / 1.25; // birdImgOpen.height / 1.25

        this.x = -((this.engine.canvas.width / 2) - (this.width / 2));
        this.y = 10;

        this.dx = 0;
        this.friction = 0.95;

        this.dy = 0;
        this.jumpForce = 6;

        this.gotTarget = false;
        this.xTarget = null;
        this.yTarget = null;
        this.speedTarget = 1;
    }

    Begin() {

    }

    Tick() {
        if (!this.gotTarget && this.engine.isGameStarted && !this.engine.isGameOver) {
            this.dy += this.engine.gravity / 2;
            this.y += this.dy;

            const floorY = this.engine.canvas.height - this.height - 10;
            if (this.y > floorY) {
                this.y = floorY;
                this.dy = 0;
            }
            if (this.y < 0) { this.y = 0; }
            
            const heightPercent = this.y / floorY; 

            // Dino Moves
            if (heightPercent > 0.6) {
                this.engine.dino.dx -= .05;
            } else if (heightPercent < 0.4) {
                this.engine.dino.dx += .025;
            }

            const minX = this.x + 20;
            const maxX = this.engine.canvas.width - 60;

            if (this.engine.dino.x < minX) this.engine.dino.x = minX;
            if (this.engine.dino.x > maxX) this.engine.dino.x = maxX;

            if (this.engine.CheckCollision(
                { x: this.x + 5, y: this.y + 5, width: this.width - 10, height: this.height - 10 },
                { x: this.engine.dino.x + 5, y: this.engine.dino.y + 5, width: this.engine.dino.width - 10, height: this.engine.dino.height - 10 }
            ) && !this.engine.dino.immune) {
                // Dino collision - boost
                this.engine.dino.dx += 20;
                this.engine.dino.StartImmunity(100);
                this.engine.AddBonusPoints(100);
            }
        }

        this.engine.ctx.filter = "invert(.46)";

        // Draw Bird
        this.engine.ctx.drawImage(this.animState ? this.birdImgOpen : this.birdImgClosed,
                                  this.x, this.y, this.width, this.height);
        this.animTimer--
        if (this.animTimer == 0) {
            this.animState = !this.animState;
            this.animTimer = this.defaultAnimTimer;
        }

        // Move To
        if (this.gotTarget) {
            const dx = this.xTarget - this.x;
            const dy = this.yTarget - this.y;

            if (Math.abs(dx) < this.speedTarget) {
                this.x = this.xTarget;
            } else {
                this.x += Math.sign(dx) * this.speedTarget;
            }

            if (Math.abs(dy) < this.speedTarget) {
                this.y = this.yTarget;
            } else {
                this.y += Math.sign(dy) * this.speedTarget;
            }

            if (this.x === this.xTarget && this.y === this.yTarget) {
                this.gotTarget = false;
            }
        }
    }

    GameStart() {
        this.MoveTo(10, this.y, 4);
    }

    GameOver() {

    }

    ResetGame() {
        this.y = 10;
        this.dy = 0;

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

    Jump() {
        this.dy = -this.jumpForce;
    }

    CrouchJump() {
        this.dy += this.engine.gravity * 5; 
    }
}