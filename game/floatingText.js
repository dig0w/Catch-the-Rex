export class FloatingText {
    constructor(engine = null, x = 0, y = 0, text = "Text") {
        this.engine = engine;

        this.x = x;
        this.y = y;

        this.text = text;

        this.dy = -1;
        this.alpha = 1;
        this.life = 60 / 60;
    }

    Begin() {

    }

    Tick(deltaTime) {
        this.y += this.dy * deltaTime * 60;
        this.alpha -= deltaTime / this.life;

        if (this.alpha <= 0) {
            this.alpha = 0;
            this.engine.DestroyObject(this);
        }
    }

    Draw() {
        this.engine.ctx.save();

        this.engine.ctx.globalAlpha = this.alpha;
        this.engine.ctx.font = "20px 'Micro 5'";
        this.engine.ctx.textAlign = "center";

        const bodyStyle = window.getComputedStyle(document.body);
        const bgColor = bodyStyle.backgroundColor;
        this.engine.ctx.strokeStyle = bgColor;
        this.engine.ctx.lineWidth = 4;

        this.engine.ctx.filter = "none";
        this.engine.ctx.strokeText(this.text, this.x, this.y);
        this.engine.ctx.filter = "invert(.46)";
        this.engine.ctx.fillStyle = "black";
        this.engine.ctx.fillText(this.text, this.x, this.y);

        this.engine.ctx.restore();
    }

    GameStart() {

    }

    GameOver() {

    }

    ResetGame() {
        this.engine.DestroyObject(this);
    }
}