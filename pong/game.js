// Canvas and Context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game Objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;

// Player Paddle (Left)
const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 5
};

// Computer Paddle (Right)
const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    radius: ballSize,
    speed: 5
};

// Score
let playerScore = 0;
let computerScore = 0;

// Game State
let gameRunning = false;
let gamePaused = false;
let mouseY = canvas.height / 2;

// Input Handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse movement for player paddle
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Buttons
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('resetBtn').addEventListener('click', resetScore);

// Start Game
function startGame() {
    gameRunning = true;
    gamePaused = false;
    document.getElementById('startBtn').textContent = 'Start Game';
    document.getElementById('pauseBtn').disabled = false;
    gameLoop();
}

// Toggle Pause
function togglePause() {
    if (!gameRunning) return;
    gamePaused = !gamePaused;
    document.getElementById('pauseBtn').textContent = gamePaused ? 'Resume' : 'Pause';
    if (!gamePaused) gameLoop();
}

// Reset Score
function resetScore() {
    playerScore = 0;
    computerScore = 0;
    updateScore();
    resetBall();
}

// Update Score Display
function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Reset Ball Position
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 4;
}

// Draw Functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawNet() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.height; i += 20) {
        ctx.strokeRect(canvas.width / 2 - 50, i, 100, 10);
    }
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw decorative elements
    drawNet();
    drawCenterLine();

    // Draw paddles and ball
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();
}

// Update Functions
function updatePlayerPaddle() {
    // Arrow Keys Control
    if (keys['ArrowUp']) {
        player.y = Math.max(0, player.y - player.speed);
    }
    if (keys['ArrowDown']) {
        player.y = Math.min(canvas.height - player.height, player.y + player.speed);
    }

    // Mouse Control - smooth following
    const paddleCenter = player.y + player.height / 2;
    const diff = mouseY - paddleCenter;
    if (Math.abs(diff) > 5) {
        player.y += diff * 0.1;
    }

    // Boundary checking
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
}

function updateComputerPaddle() {
    const computerCenter = computer.y + computer.height / 2;
    const diff = ball.y - computerCenter;

    // AI difficulty - tracks ball position with slight delay
    if (Math.abs(diff) > 35) {
        computer.y += diff > 0 ? computer.speed : -computer.speed;
    }

    // Boundary checking
    computer.y = Math.max(0, Math.min(canvas.height - computer.height, computer.y));
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top and bottom wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }

    // Left wall (Computer scores)
    if (ball.x - ball.radius < 0) {
        computerScore++;
        updateScore();
        resetBall();
        return;
    }

    // Right wall (Player scores)
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        updateScore();
        resetBall();
        return;
    }

    // Paddle collision - Player (Left)
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height &&
        ball.dx < 0
    ) {
        ball.dx = -ball.dx * 1.05; // Slight speed increase
        ball.x = player.x + player.width + ball.radius;

        // Angle change based on where ball hits paddle
        const hitPos = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.dy += hitPos * 4;
    }

    // Paddle collision - Computer (Right)
    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height &&
        ball.dx > 0
    ) {
        ball.dx = -ball.dx * 1.05; // Slight speed increase
        ball.x = computer.x - ball.radius;

        // Angle change based on where ball hits paddle
        const hitPos = (ball.y - (computer.y + computer.height / 2)) / (computer.height / 2);
        ball.dy += hitPos * 4;
    }

    // Speed cap
    const maxSpeed = 8;
    ball.dx = Math.max(-maxSpeed, Math.min(maxSpeed, ball.dx));
    ball.dy = Math.max(-maxSpeed, Math.min(maxSpeed, ball.dy));
}

// Game Loop
function gameLoop() {
    if (!gameRunning) return;
    if (gamePaused) {
        requestAnimationFrame(gameLoop);
        return;
    }

    updatePlayerPaddle();
    updateComputerPaddle();
    updateBall();
    drawGame();

    requestAnimationFrame(gameLoop);
}

// Initialize
updateScore();
