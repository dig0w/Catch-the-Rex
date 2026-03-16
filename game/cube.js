export class Cube {
    #engine = null;

    #width = 0;
    #height = 0;
    #color = 0;
    #x = 0;
    #y = 0;

    #gotTarget = false
    #xTarget = null;
    #yTarget = null;
    #speedTarget = 1;

    constructor(engine = null, width = 32, height = 32, color = "#ffffff", x = 0, y = 0) {
        this.#engine = engine;

        this.#width = width;
        this.#height = height;

        this.#color = color;

        this.#x = x;
        this.#y = y;
    }

    Begin() {

    }

    Tick(deltaTime) {
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
    }

    Draw(ctx) {
        ctx.filter = "none";
        ctx.fillStyle = this.#color;
        ctx.fillRect(this.#x, this.#y, this.#width, this.#height);
    }

    GameStart() {
        
    }

    GameOver() {

    }

    ResetGame() {
        
    }

    MoveTo(x = 0, y = 0, speed = 1) {
        this.#gotTarget = true;
        this.#xTarget = x;
        this.#yTarget = y;
        this.#speedTarget = speed;
    }
}