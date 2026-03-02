export class Ground {
    constructor(engine = null) {
        this.engine = engine;

        this.assets = [
            '../assets/ground0.png',
            '../assets/ground0.png',
            '../assets/ground0.png',
            '../assets/ground0.png',
            '../assets/ground1.png',
            '../assets/ground2.png'
        ]
        this.images = [];

        this.tileSize = 32;
        this.tiles = [];

        this.groundY = this.engine.canvas.height - this.tileSize + 10;
    }

    Begin() {
        for (const asset of this.assets) {
            const img = new Image();
            img.src = asset;

            this.images.push(img);
        }

        // Fill the screen
        for (let i = 0; i <= this.engine.canvas.width / this.tileSize + 1; i++) {
            this.tiles.push({
                x: i * this.tileSize,
                img: this.images[Math.floor(Math.random() * this.images.length)]
            });
        }
    }

    Tick() {
        for (const tile of this.tiles) {
            tile.x -= this.engine.gameSpeed;
        }

        if (this.tiles[0].x <= -this.tileSize) {
            this.tiles.shift();

            // 2. Add a new random tile at the end of the line
            let lastTileX = this.tiles[this.tiles.length - 1].x;
            this.tiles.push({
                x: lastTileX + this.tileSize,
                img: this.images[Math.floor(Math.random() * this.images.length)]
            });
        }

        // Color
        this.engine.ctx.filter = "invert(.46)";

        // Draw Ground
        this.tiles.forEach(tile => {
            this.engine.ctx.drawImage(tile.img, tile.x, this.groundY, this.tileSize, this.tileSize);
        });

        // Reset Filter
        this.engine.ctx.filter = "none";
    }

    GameStart() {
        
    }

    GameOver() {

    }

    ResetGame() {
        
    }
}