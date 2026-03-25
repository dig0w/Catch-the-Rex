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

    Draw(ctx) {
        ctx.save();

        ctx.globalAlpha = this.alpha;
        ctx.font = "20px 'Micro 5'";
        ctx.textAlign = "center";

        const bodyStyle = window.getComputedStyle(document.body);
        const bgColor = bodyStyle.backgroundColor;
        ctx.strokeStyle = bgColor;
        ctx.lineWidth = 4;

        ctx.strokeText(this.text, this.x, this.y);
        ctx.fillStyle = "#757575";
        ctx.fillText(this.text, this.x, this.y);

        ctx.restore();
    }

    GameStart() {

    }

    GameOver() {

    }

    ResetGame() {
        this.engine.DestroyObject(this);
    }
}