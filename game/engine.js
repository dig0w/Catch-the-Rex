import { Ground } from "./ground.js";
import { Cube } from "./cube.js";
import { Dino } from "./dino.js";
import { Bird } from "./bird.js";
import { Cactus } from "./cactus.js";
import { Cloud } from "./cloud.js";

export class RunnerEngine {
    constructor(gameSpeed = 5) {
        this.isGameStarted = false;
        this.isGameOver = false;

        this.defaultGameOverTimer = 30;
        this.gameOverTimer = 0;

        this.score = 0;
        this.highScore = localStorage.getItem("highScore") || 0;

        this.defaultGameSpeed = gameSpeed;
        this.gameSpeed = 0;
        this.gravity = 0.6;

        this.canvas = null;
        this.ctx = null;

        this.objects = [];

        this.upInput = false;
        this.downInput = false;

        this.startCube = null;
        this.dino = null;
        this.bird = null;
        this.cactus = null;
    }

    Begin() {
        this.canvas = document.getElementById('runner-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.objects.push(new Ground(this));

        const bodyStyle = window.getComputedStyle(document.body);
        const bgColor = bodyStyle.backgroundColor;
        this.startCube = new Cube(this, this.canvas.width, this.canvas.height, bgColor, this.canvas.width / 9);
        this.objects.push(this.startCube);

        this.dino = new Dino(this);
        this.objects.push(this.dino);

        this.bird = new Bird(this);
        this.objects.push(this.bird);

        this.cactus = new Cactus(this);
        this.objects.push(this.cactus);

        this.objects.push(new Cloud(this));

        this.objects.forEach(object => {
            object.Begin();
        });
    }

    Tick() {
        if (this.upInput) {
            this.upInput = false;

            if (this.isGameOver) {
                this.ResetGame();
            } else if (!this.isGameStarted) {
                this.GameStart();
            } else {
                this.bird.Jump();
            }
        }
        if (this.downInput) {
            this.downInput = false;

            if (this.isGameOver) {
                this.ResetGame();
            } else if (!this.isGameStarted) {
                this.GameStart();
            } else {
                this.bird.CrouchJump();
            }
        }

        if (this.isGameOver) {
            this.gameOverTimer--;
            return;
        };

        if (this.isGameStarted && !this.isGameOver) {
            if (this.score > 0) this.gameSpeed += 0.00015;

            if (this.score > 99999) this.score = 99999
        }

        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.font = "25px 'Micro 5'";
        this.ctx.textAlign = "right";

        const padding = 20;
        const xPos = this.canvas.width - padding;
        const yPos = 35;

        const bodyStyle = window.getComputedStyle(document.body);
        const bgColor = bodyStyle.backgroundColor;
        this.ctx.strokeStyle = bgColor;
        this.ctx.lineWidth = 10;

        // High Score (Greyed out)
        this.ctx.filter = "none";
        this.ctx.strokeText(`HI ${this.highScore.toString().padStart(5, '0')}`, xPos - 70, yPos);
        this.ctx.filter = "invert(.46)";
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        this.ctx.fillText(`HI ${this.highScore.toString().padStart(5, '0')}`, xPos - 70, yPos);

        // Current Score
        this.ctx.filter = "none";
        this.ctx.strokeText(this.score.toString().padStart(5, '0'), xPos, yPos);
        this.ctx.filter = "invert(.46)";
        this.ctx.fillStyle = "black";
        this.ctx.fillText(this.score.toString().padStart(5, '0'), xPos, yPos);

        this.objects.forEach(object => {
            object.Tick();
        });

        if (this.isGameOver) {
            this.ctx.textAlign = "center";

            const bodyStyle = window.getComputedStyle(document.body);
            const bgColor = bodyStyle.backgroundColor;
            this.ctx.strokeStyle = bgColor;
            this.ctx.lineWidth = 10;
            this.ctx.fillStyle = "black";

            this.ctx.font = "bold 50px 'Micro 5'";

            this.ctx.filter = "none";
            this.ctx.strokeText("G A M E  O V E R", this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.filter = "invert(.46)";
            this.ctx.fillText("G A M E  O V E R", this.canvas.width / 2, this.canvas.height / 2);
            
            this.ctx.font = "20px 'Micro 5'";
            this.ctx.lineWidth = 4;

            this.ctx.filter = "none";
            this.ctx.strokeText("PRESS SPACE TO RESTART", this.canvas.width / 2, this.canvas.height / 2 + 30);
            this.ctx.filter = "invert(.46)";
            this.ctx.fillText("PRESS SPACE TO RESTART", this.canvas.width / 2, this.canvas.height / 2 + 30);
        }
    }

    GameStart() {
        this.objects.forEach(object => {
            object.GameStart();
        });

        this.startCube.MoveTo(this.canvas.width, 0, 20);

        this.gameSpeed = this.defaultGameSpeed;
        this.score = 0;

        this.isGameStarted = true;
    }

    GameOver() {
        this.isGameOver = true;
        this.gameOverTimer = this.defaultGameOverTimer;

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem("highScore", this.highScore);
        }
    }

    ResetGame() {
        if (this.gameOverTimer > 0) return;

        this.objects.forEach(object => {
            object.ResetGame();
        });

        this.gameSpeed = this.defaultGameSpeed;
        this.score = 0;
        this.isGameOver = false;
    }

    CheckCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y;
    }

    AddBonusPoints(amount) {
        this.score += amount;
        this.gameSpeed += amount * 0.0015;
    }
}