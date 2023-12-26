const ball = document.getElementById('ball');
const gameContainer = document.getElementById('game-container');
const startButton = document.getElementById('startButton');
const hpLabel = document.getElementById('hp');

let obstacles = [];
let isGameRunning = false;

let hitPoints = 5;
updateHitPoints();
// Set the initial position of the ball to the center of the game container
let ballX = (gameContainer.clientWidth - ball.clientWidth) / 2;
let ballY = (gameContainer.clientHeight - ball.clientHeight) / 2;

let ballSpeedX = 0;
let ballSpeedY = 0;

const acceleration = 0.2;
const maxSpeed = 20;
const deceleration = 0.01;

const keys = {
    w: false,
    s: false,
    a: false,
    d: false,
};

function updateBallPosition() {
    ball.style.transform = `translate(${ballX}px, ${ballY}px)`;
}

function handleKeydown(event) {
    keys[event.key] = true;
}

function handleKeyup(event) {
    keys[event.key] = false;
}

document.addEventListener('keydown', handleKeydown);
document.addEventListener('keyup', handleKeyup);

startButton.addEventListener('click', () => {
    if (isGameRunning) {
        resetGame();
    } else {
        isGameRunning = true;

        gameContainer.style.display = 'block';
        
        document.addEventListener('keydown', handleKeydown);
        document.addEventListener('keyup', handleKeyup);
    }
});

// Function to load obstacles for a specific level
function loadObstacles(levelIndex) {
    fetch('jsons/levels.json')
        .then(response => response.json())
        .then(obstaclesData => {
            const level = obstaclesData.levels[levelIndex];

            if (level && level.obstacles) {
                level.obstacles.forEach((obstacleData) => {
                    createObstacle(obstacleData);
                });
            } else {
                console.error('Invalid level or obstacle data:', level);
            }
            console.log(obstaclesData);
        })
        .catch(error => console.error('Error loading obstacles:', error));
}

function updateHitPoints() {
    hpLabel.innerHTML = "Remaining hitpoints: " + hitPoints;

    if (hitPoints <= 0) {
        // Pause the game
        isGameRunning = false;

        // Display death modal
        showDeathModal();
    }
  }

function showDeathModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';

    const deathModal = document.createElement('div');
    deathModal.className = 'death-modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const modalText = document.createElement('p');
    modalText.textContent = 'You died!';

    const tryAgainButton = document.createElement('button');
    tryAgainButton.textContent = 'Try Again';
    tryAgainButton.addEventListener('click', resetGame);

    modalContent.appendChild(modalText);
    modalContent.appendChild(tryAgainButton);

    deathModal.appendChild(modalContent);
    modalOverlay.appendChild(deathModal);
    document.body.appendChild(modalOverlay);
}

function resetGame() {
    const modalOverlay = document.querySelector('.modal-overlay');
    modalOverlay.remove();

    isGameRunning = false;
    hitPoints = 5;
    updateHitPoints();

    ballX = (gameContainer.clientWidth - ball.clientWidth) / 2;
    ballY = (gameContainer.clientHeight - ball.clientHeight) / 2;

    obstacles.forEach(obstacle => obstacle.remove());
    obstacles = [];

    loadObstacles(0);

    ballSpeedX = 0;
    ballSpeedY = 0;

    updateBallPosition();
}

function checkCollisions() {
    const ballRect = ball.getBoundingClientRect();

    obstacles.forEach(obstacle => {
        const obstacleRect = obstacle.getBoundingClientRect();

        if (
            ballRect.left < obstacleRect.right &&
            ballRect.right > obstacleRect.left &&
            ballRect.top < obstacleRect.bottom &&
            ballRect.bottom > obstacleRect.top
        ) {
            handleCollision();
        }
    });
}

function moveBall() {
    if (!isGameRunning) {
        return; // Return early if the game is not running (modal is shown)
    }
    let targetSpeedX = 0;
    let targetSpeedY = 0;

    if (keys['w']) targetSpeedY -= acceleration;
    if (keys['s']) targetSpeedY += acceleration;
    if (keys['a']) targetSpeedX -= acceleration;
    if (keys['d']) targetSpeedX += acceleration;

    if ((targetSpeedX > 0 && ballSpeedX < 0) || (targetSpeedX < 0 && ballSpeedX > 0)) {
        ballSpeedX *= 1 - deceleration;
    }

    if ((targetSpeedY > 0 && ballSpeedY < 0) || (targetSpeedY < 0 && ballSpeedY > 0)) {
        ballSpeedY *= 1 - deceleration;
    }

    ballSpeedX *= 1 - deceleration;
    ballSpeedY *= 1 - deceleration;

    ballSpeedX = Math.max(-maxSpeed, Math.min(ballSpeedX + targetSpeedX, maxSpeed));
    ballSpeedY = Math.max(-maxSpeed, Math.min(ballSpeedY + targetSpeedY, maxSpeed));

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (checkCollisions()) {
        
    } else {
        ballX = Math.max(0, Math.min(ballX, gameContainer.clientWidth - ball.clientWidth));
        ballY = Math.max(0, Math.min(ballY, gameContainer.clientHeight - ball.clientHeight));

        updateBallPosition();
    }
}

function handleCollision() {
    hitPoints--;

    updateHitPoints();

    ballX -= 2 * ballSpeedX;
    ballY -= 2 * ballSpeedY;

    ballSpeedX = -ballSpeedX;
    ballSpeedY = -ballSpeedY;

    ballSpeedX *= 1 - deceleration;
    ballSpeedY *= 1 - deceleration;

    updateBallPosition();
    console.log('Collision with obstacle detected!');
}

// Function to create obstacle element
function createObstacle(obstacleData) {
    const newObstacle = document.createElement('div');
    newObstacle.className = 'obstacle';

    newObstacle.style.left = obstacleData.x + '%';
    newObstacle.style.top = obstacleData.y + '%';
    newObstacle.style.width = obstacleData.width + '%';
    newObstacle.style.height = obstacleData.height + '%';

    gameContainer.appendChild(newObstacle);
    obstacles.push(newObstacle);
    console.log('Obstacle created:', obstacleData);
}

loadObstacles(0);

setInterval(moveBall, 16);

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(function(registration) {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(function(error) {
            console.error('Service Worker registration failed:', error);
        });
}
