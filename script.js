const defaultGameSpeed = 5;
let gameSpeed = 5;

const canvas = document.getElementById('runner-canvas');
const ctx = canvas.getContext('2d');

// Ground
const groundTile0 = new Image();
groundTile0.src = 'assets/ground0.png';
const groundTile1 = new Image();
groundTile1.src = 'assets/ground1.png';
const groundTile2 = new Image();
groundTile2.src = 'assets/ground2.png';

const tileImages = [groundTile0, groundTile0, groundTile0, groundTile0, groundTile1, groundTile2];
const TILE_SIZE = 32;
const GROUND_Y = canvas.height - TILE_SIZE + 10;
let groundTiles = [];

// Fill the screen initially
for (let i = 0; i <= canvas.width / TILE_SIZE + 1; i++) {
    groundTiles.push({
        x: i * TILE_SIZE,
        img: tileImages[Math.floor(Math.random() * tileImages.length)]
    });
}

function updateGround() {
    for (let i = 0; i < groundTiles.length; i++) {
        // Move tile left
        groundTiles[i].x -= gameSpeed;
    }

    // 1. Remove the first tile if it's off-screen
    if (groundTiles[0].x <= -TILE_SIZE) {
        groundTiles.shift();

        // 2. Add a new random tile at the end of the line
        let lastTileX = groundTiles[groundTiles.length - 1].x;
        groundTiles.push({
            x: lastTileX + TILE_SIZE,
            img: tileImages[Math.floor(Math.random() * tileImages.length)]
        });
    }
}

// Dino
const dinoImg = new Image();
dinoImg.src = 'assets/rex.png';
const dinoDeadImg = new Image();
dinoDeadImg.src = 'assets/rex_dead.png';
const dinoRunLImg = new Image();
dinoRunLImg.src = 'assets/rex_left_up.png';
const dinoRunRImg = new Image();
dinoRunRImg.src = 'assets/rex_right_up.png';
let isRightUp = false;
const defaultFeetTimer = 5;
let feetTimer = defaultFeetTimer;

let dino = {
    x: 10,
    y: 10,
    width: 54 / 1.25, // dinoImg.width / 1.25,
    height: 60 / 1.25, // dinoImg.height / 1.25,
    dy: 0,
    jumpForce: 11,
    gravity: 0.6,
    grounded: false
};

// Bird
const birdImgOpen = new Image();
birdImgOpen.src = 'assets/pterodactyl_open.png';
const birdImgClosed = new Image();
birdImgClosed.src = 'assets/pterodactyl_closed.png';
let isWingOpen = false;
const defaultWingTimer = 5;
let wingTimer = defaultWingTimer;

let bird = {
    x: 10,
    y: 10,
    width: 64 / 1.25, // birdImgOpen.width / 1.25,
    height: 57 / 1.25, // birdImgOpen.height / 1.25,
    dy: 0,
    jumpForce: 11,
    gravity: 0.6,
    grounded: false
};

// Cactus
const cactusImg0 = new Image();
cactusImg0.src = 'assets/cactus0.png';
const cactusImg1 = new Image();
cactusImg1.src = 'assets/cactus1.png';
const cactusImg2 = new Image();
cactusImg2.src = 'assets/cactus2.png';

const cactusImages = [cactusImg0, cactusImg1, cactusImg2];
let obstacles = [];
let spawnTimer = 0;

function handleObstacles() {
    spawnTimer++;

    // Spawn a new cactus every 75-150 frames (roughly 1.5 to 2.5 seconds)
    if (spawnTimer > (Math.random() * 75 + 75) * (defaultGameSpeed / gameSpeed)) {
        let randomImg = cactusImages[Math.floor(Math.random() * cactusImages.length)];
        
        obstacles.push({
            x: canvas.width,    // Start at the right edge
            y: canvas.height - randomImg.height, // Adjust based on your cactus height
            width: randomImg.width,
            height: randomImg.height,
            img: randomImg
        });
        
        spawnTimer = 0; // Reset timer
    }

    // Move and filter out old obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= gameSpeed; // Use the same speed as the ground

        // Remove if it goes off-screen to save memory
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}


let isGameOver = false;

function update() {
    if (isGameOver) return;

    // 1. Apply Gravity
    if (!dino.grounded) {
        dino.dy += dino.gravity;
        dino.y += dino.dy;
    }

    // 2. Ground Collision
    if (dino.y + dino.height > canvas.height) {
        dino.y = canvas.height - dino.height;
        dino.dy = 0;
        dino.grounded = true;
    }

    updateGround();
    handleObstacles();

    // Check every obstacle
    obstacles.forEach(cactus => {
        if (checkCollision({ x: dino.x + 5, y: dino.y + 5, width: dino.width - 10, height: dino.height - 10 }, cactus)) {
            gameOver();
        }
    });

    gameSpeed += 0.005;

    draw();
    requestAnimationFrame(update);
}

function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Color
    ctx.filter = "invert(.46)";

    // Draw Ground
    groundTiles.forEach(tile => {
        ctx.drawImage(tile.img, tile.x, GROUND_Y, TILE_SIZE, TILE_SIZE);
    });

    ctx.filter = "none";

    ctx.fillStyle = "rgb(247, 247, 247)";
    ctx.fillRect(dino.x + (dino.width / 3) * .5 - 2, dino.y + (dino.height / 2), (dino.width / 3) * 2, dino.height / 2);

    ctx.filter = "invert(.46)";

    // Draw Dino
    ctx.drawImage(isGameOver ? dinoDeadImg : (dino.dy != 0 ? dinoImg : (isRightUp ? dinoRunLImg : dinoRunRImg)),
                  dino.x, dino.y, dino.width, dino.height);
    feetTimer--
    if (feetTimer == 0) {
        isRightUp = !isRightUp;
        feetTimer = defaultFeetTimer;
    }

    // Draw Bird
    ctx.drawImage(isWingOpen ? birdImgOpen : birdImgClosed,
                  bird.x, bird.y, bird.width, bird.height);
    wingTimer--
    if (wingTimer == 0) {
        isWingOpen = !isWingOpen;
        wingTimer = defaultWingTimer;
    }

    // Draw each obstacle in the array
    obstacles.forEach(cactus => {
        ctx.drawImage(cactus.img, cactus.x, cactus.y, cactus.width, cactus.height);
    });

    if (isGameOver) {
        ctx.font = "bold 50px 'Micro 5'";
        ctx.textAlign = "center";
        ctx.fillText("G A M E  O V E R", canvas.width / 2, canvas.height / 2);

        ctx.font = "15px 'Micro 5'";
        ctx.fillText("PRESS SPACE TO RESTART", canvas.width / 2, canvas.height / 2 + 30);
    }
}

// Input Handling
window.addEventListener('keydown', (e) => {
    if (e.code === "Space" && dino.grounded) {
        if (isGameOver) {
            resetGame();
        } else if (dino.grounded) {
            dino.dy = -dino.jumpForce;
            dino.grounded = false;
        }
    }
});

function gameOver() {
    isGameOver = true;
}

function resetGame() {
    // Reset Dino
    dino.y = canvas.height - dino.height;
    dino.dy = 0;
    dino.grounded = true;

    // Reset World
    obstacles = [];
    gameSpeed = defaultGameSpeed;
    spawnTimer = 0;
    isGameOver = false;

    // Restart the loop
    update();
}

// Start the loop
update();