import { Ground } from "./ground.js";
import { Cube } from "./cube.js";
import { Dino } from "./dino.js";
import { Bird } from "./bird.js";
import { Cactus } from "./cactus.js";
import { Cloud } from "./cloud.js";
import { Hayball } from "./hayball.js";
import { Leaderboard } from "./leaderboard.js";
import { FloatingText } from "./floatingText.js";

export class RunnerEngine {
    #isGameStarted = false;
    #isGameOver = false;
    static defaultGameOverTimer = 30 / 60;
    #gameOverTimer = 0;

    #score = 0;
    #highScore = localStorage.getItem("highScore") || 0;

    #defaultGameSpeed = 5;
    #gameSpeed = 0;
    static gravity = 0.6;

    #canvas = null;
    #ctx = null;
    #objects = [];

    #startCube = null;
    #dino = null;
    #bird = null;
    #cactus = null;
    #hayball = null;

    #leaderboard = new Leaderboard(this);

    #pointSound = new Audio("../assets/point.wav");
    #points1000Sound = new Audio("../assets/1000pts.wav");
    #highScoreSound = new Audio("../assets/highscore.wav");
    #stunSound = new Audio("../assets/stun.wav");
    #gameoverSound = new Audio("../assets/gameover.wav");
    #bgMusic = new Audio("../assets/catchtherex_theme_v2.wav");

    constructor(gameSpeed = 5) {
        this.#defaultGameSpeed = gameSpeed;

        this.upInput = false;
        this.downInput = false;

        this.#pointSound.volume = 0.5;
        this.#points1000Sound.volume = 0.5;
        this.#highScoreSound.volume = 0.5;
        this.#stunSound.volume = 0.5;
        this.#gameoverSound.volume = 0.5;
        this.#bgMusic.volume = 0.3;
        this.#bgMusic.loop = true;
    }

    get isGameStarted() { return this.#isGameStarted; }
    get isGameOver() { return this.#isGameOver; }

    get score() { return this.#score; }

    get defaultGameSpeed() { return this.#defaultGameSpeed; }
    get gameSpeed() { return this.#gameSpeed; }
    get gravity() { return RunnerEngine.gravity; }

    get canvas() { return this.#canvas; }

    get cactus() { return this.#cactus; }

    Begin() {
        this.#canvas = document.getElementById("runner-canvas");
        this.#ctx = this.#canvas.getContext("2d");

        this.#objects.push(new Cloud(this));

        this.#objects.push(new Ground(this));

        this.#cactus = new Cactus(this);
        this.#objects.push(this.#cactus);

        this.#hayball = new Hayball(this)
        this.#objects.push(this.#hayball);

        this.#dino = new Dino(this);
        this.#objects.push(this.#dino.cube);
        this.#objects.push(this.#dino);

        this.#bird = new Bird(this);
        this.#objects.push(this.#bird);

        const bodyStyle = window.getComputedStyle(document.body);
        const bgColor = bodyStyle.backgroundColor;
        this.#startCube = new Cube(this, this.#canvas.width, this.#canvas.height, bgColor, this.#canvas.width / 9);
        this.#startCube.Begin();

        for (let i = 0; i < this.#objects.length; i++) {
            this.#objects[i].Begin();
        }

        this.UpdateVolume(localStorage.getItem("audio") || 0.5, 0);
        this.UpdateVolume(localStorage.getItem("music") || 0.5, 1);

        this.#leaderboard.FetchScores();
    }

    Tick(deltaTime) {
        if (this.upInput) {
            this.upInput = false;

            if (this.#isGameOver) {
                this.ResetGame();
            } else if (!this.#isGameStarted) {
                this.GameStart();
            } else {
                this.#bird.Jump();
            }
        }
        if (this.downInput) {
            this.downInput = false;

            if (this.#isGameOver) {
                this.ResetGame();
            } else if (!this.#isGameStarted) {
                this.GameStart();
            } else {
                this.#bird.CrouchJump();
            }
        }

        if (this.#isGameOver) {
            this.#gameOverTimer--;
            return;
        };

        if (this.#isGameStarted && !this.#isGameOver) {
            if (this.#score > 99999) this.#score = 99999;

            // Move Dino depending on Bird's height
            const floorY = this.#canvas.height - this.#bird.height - 10;
            const heightPercent = this.#bird.y / floorY;
            if (heightPercent > 0.6) {
                this.#dino.dx -= .15 * deltaTime * 60;
            } else if (heightPercent < 0.4) {
                this.#dino.dx += .12 * deltaTime * 60;
            }

            // Bird Dino collision = boost Dino, +100 pts
            if (this.CheckCollision(
                { x: this.#bird.x + 5, y: this.#bird.y + 5, width: this.#bird.width - 10, height: this.#bird.height - 10 },
                { x: this.#dino.x + 5, y: this.#dino.y + 5, width: this.#dino.width - 10, height: this.#dino.height - 10 }
            )) {
                this.#dino.Hitted(20, 100 / 60);
                this.#AddBonusPoints();
                this.#objects.push(new FloatingText(this, this.#dino.x, this.#dino.y, "+100"));
            }

            // Cactus Collision
            for (let i = 0; i < this.#cactus.cacti.length; i++) {
                const cactus = this.#cactus.cacti[i];
                // Dino collision = slow down
                if (this.CheckCollision(
                    { x: this.#dino.x + 5, y: this.#dino.y + 5, width: this.#dino.width - 10, height: this.#dino.height - 10 },
                    cactus
                ) && !this.#dino.immune) {
                    this.#dino.Hitted(-8, 50 / 60);
                    this.#stunSound.play();
                }

                // Bird collision = game over
                if (this.CheckCollision(
                    { x: this.#bird.x + 5, y: this.#bird.y + 5, width: this.#bird.width - 10, height: this.#bird.height - 10 },
                    cactus
                )) {
                    this.GameOver();
                }
            }

            // Hayball Collision
            for (let i = 0; i < this.#hayball.hayballs.length; i++) {
                const hayball = this.#hayball.hayballs[i];
                // Bird collision = boosts dino
                if (this.CheckCollision(
                    { x: this.#bird.x + 5, y: this.#bird.y + 5, width: this.#bird.width - 10, height: this.#bird.height - 10 },
                    hayball
                )) {
                    this.#dino.dx += 2 * deltaTime * 60;
                    this.#bird.Hitted(0, 100 / 60);
                    this.#stunSound.play();
                }
            }
        }

        for (let i = this.#objects.length - 1; i >= 0; i--) {
            this.#objects[i].Tick(deltaTime);
        }

        this.#startCube.Tick(deltaTime);
    }

    Draw() {
        // Clear the canvas
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

        for (let i = 0; i < this.#objects.length; i++) {
            this.#objects[i].Draw(this.#ctx);
        }

        this.#ctx.font = "25px 'Micro 5'";
        this.#ctx.textAlign = "right";

        const padding = 20;
        const xPos = this.#canvas.width - padding;
        const yPos = 35;

        const bodyStyle = window.getComputedStyle(document.body);
        const bgColor = bodyStyle.backgroundColor;
        this.#ctx.strokeStyle = bgColor;
        this.#ctx.lineWidth = 6;

        // High Score (Greyed out)
        if (this.#highScore > 0) {
            this.#ctx.strokeText(`HI ${this.#highScore.toString().padStart(5, "0")}`, ((xPos - 70) | 0), (yPos | 0));
            this.#ctx.fillStyle = "#B6B6B6";
            this.#ctx.fillText(`HI ${this.#highScore.toString().padStart(5, "0")}`, ((xPos - 70) | 0), (yPos | 0));
        }

        // Current Score
        this.#ctx.strokeText(this.#score.toString().padStart(5, "0"), (xPos | 0), (yPos | 0));
        this.#ctx.fillStyle = "#757575";
        this.#ctx.fillText(this.#score.toString().padStart(5, "0"), (xPos | 0), (yPos | 0));

        this.#startCube.Draw(this.#ctx);

        if (this.#isGameOver) {
            this.#ctx.textAlign = "center";

            const bodyStyle = window.getComputedStyle(document.body);
            const bgColor = bodyStyle.backgroundColor;
            this.#ctx.lineWidth = 10;
            this.#ctx.font = "bold 50px 'Micro 5'";

            this.#ctx.strokeStyle = bgColor;
            this.#ctx.strokeText("G A M E  O V E R", ((this.#canvas.width) / 2 | 0), ((this.#canvas.height / 2) | 0));
            this.#ctx.fillStyle = "#757575";
            this.#ctx.fillText("G A M E  O V E R", ((this.#canvas.width / 2) | 0), ((this.#canvas.height / 2) | 0));

            this.#ctx.font = "20px 'Micro 5'";
            this.#ctx.lineWidth = 4;

            this.#ctx.strokeText("PRESS SPACE TO RESTART", ((this.#canvas.width / 2) | 0), ((this.#canvas.height / 2 + 30) | 0));
            this.#ctx.fillText("PRESS SPACE TO RESTART", ((this.#canvas.width / 2) | 0), ((this.#canvas.height / 2 + 30) | 0));
        }
    }

    GameStart() {
        for (let i = 0; i < this.#objects.length; i++) {
            this.#objects[i].GameStart();
        }

        this.#startCube.MoveTo(this.#canvas.width, 0, 20);

        this.#gameSpeed = this.#defaultGameSpeed;
        this.#score = 0;

        this.#bgMusic.play();

        this.#isGameStarted = true;
    }

    GameOver() {
        this.#isGameOver = true;
        this.#gameOverTimer = RunnerEngine.defaultGameOverTimer;

        this.#bgMusic.pause();
        this.#bgMusic.currentTime = 0;

        if (this.#score > this.#highScore) {
            this.#highScore = this.#score;
            localStorage.setItem("highScore", this.#highScore);

            this.#highScoreSound.play();

            let name = prompt("Please enter your name:", "-106");
            this.#leaderboard.SubmitScore(name);
        } else {
            this.#gameoverSound.play();
        }
    }

    ResetGame() {
        if (this.#gameOverTimer > 0) return;

        for (let i = 0; i < this.#objects.length; i++) {
            this.#objects[i].ResetGame();
        }

        this.#gameSpeed = this.#defaultGameSpeed;
        this.#score = 0;
        this.#isGameOver = false;

        this.#bgMusic.play();
    }

    DestroyObject(obj) {
        const index = this.#objects.indexOf(obj);
        if (index !== -1) {
            this.#objects[index] = null;
            this.#objects.splice(index, 1);
        }
    }

    CheckCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y;
    }

    #AddBonusPoints() {
        const amount = 100;
        this.#score += amount;
        this.#gameSpeed += amount * 0.0015;

        if (Math.floor(this.#score / 1000) > Math.floor((this.#score - amount) / 1000)) {
            this.#points1000Sound.play();
        } else {
            this.#pointSound.play();
        }
    }

    UpdateVolume(vol = 0.5, type = 0) {
        switch (type) {
            default:
            case 0:
                this.#pointSound.volume = vol;
                this.#points1000Sound.volume = vol;
                this.#highScoreSound.volume = vol;
                this.#stunSound.volume = vol;
                this.#gameoverSound.volume = vol;
                break;
            case 1:
                this.#bgMusic.volume = vol;
                break;
        }

        localStorage.setItem(type == 0 ? "audio" : "music", vol);
    }
}