const ball = document.getElementById('ball');
const gameContainer = document.getElementById('game-container');
const startButton = document.getElementById('startButton');
const hpLabel = document.getElementById('hp');

let obstacles = [];
let coins = [];

let currentLevel = 0;
let isGameRunning = false;

let hitPoints = 5;
updateHitPoints();

// Set the initial position of the ball to the center of the game container
let ballX;
let ballY;

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
    }
});

function loadLevel(levelIndex) {
    fetch('jsons/levels.json')
        .then(response => response.json())
        .then(data => {
            const level = data.levels[levelIndex];

            if (level && level.obstacles) {
                level.obstacles.forEach((obstacleData) => {
                    createObstacle(obstacleData);
                });
            } else {
                console.error('Invalid level or obstacle data:', level);
            }

            if (level && level.coins) {
                level.coins.forEach((coinData) => {
                    createCoin(coinData);
                });
            } else {
                console.error('Invalid level or coin data:', level);
            }

            ballX = (level.spawn[0].x / 100) * gameContainer.clientWidth;
            ballY = (level.spawn[0].y / 100) * gameContainer.clientHeight;
        })
        .catch(error => console.error('Error loading data:', error));
}


function createCoin(coinData) {
    const newCoin = document.createElement('div');
    newCoin.className = 'coin'; // You can add additional classes or styling for coins

    const diameter = coinData.radius * 2 + 'px';

    newCoin.style.width = diameter;
    newCoin.style.height = diameter;
    newCoin.style.borderRadius = '50%';  // Set border-radius to create a circle
    newCoin.style.backgroundColor = 'gold'; // Default to gold if color is not provided

    newCoin.style.position = 'absolute';
    newCoin.style.left = coinData.position.x + '%';
    newCoin.style.top = coinData.position.y + '%';
    coins.push(newCoin);
    document.getElementById('game-container').appendChild(newCoin);
}



function updateHitPoints() {
    const hpLabel = document.getElementById('hpLabel');

    // Clear the content of hpLabel
    hpLabel.innerHTML = "";

    // Add text node
    const textNode = document.createTextNode("Remaining hitpoints: ");
    hpLabel.appendChild(textNode);

    // Add heart icons based on the remaining hit points
    for (let i = 0; i < hitPoints; i++) {
        const heartIcon = document.createElement('i');
        heartIcon.classList.add('fas', 'fa-heart');
        hpLabel.appendChild(heartIcon);
    }

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

function showWinnerModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';

    const winnerModal = document.createElement('div');
    winnerModal.className = 'winner-modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const modalText = document.createElement('p');
    modalText.textContent = 'Congratulations! You collected all the coins.';

    const tryAgainButton = document.createElement('button');
    tryAgainButton.textContent = 'Try Again';
    tryAgainButton.addEventListener('click', resetGame);

    const continueButton = document.createElement('button');
    continueButton.textContent = 'Continue';
    continueButton.addEventListener('click', nextLevel);
    
    modalContent.appendChild(modalText);
    modalContent.appendChild(tryAgainButton);
    modalContent.appendChild(continueButton);

    winnerModal.appendChild(modalContent);
    modalOverlay.appendChild(winnerModal);
    document.body.appendChild(modalOverlay);
}

function showGameRules() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';

    const gameRulesModal = document.createElement('div');
    gameRulesModal.className = 'game-rules-modal';

    const modalContent = document.createElement('div');
    modalContent.textContent = 'GAME RULES GAME RULES GAME RULES';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', hideGameRules);

    gameRulesModal.appendChild(modalContent);
    gameRulesModal.appendChild(closeButton);

    modalOverlay.appendChild(gameRulesModal);
    document.body.appendChild(modalOverlay);
}


function hideGameRules() {
    const modalOverlay = document.querySelector('.modal-overlay');
    modalOverlay.remove();
}


function resetGame() {
    const modalOverlay = document.querySelector('.modal-overlay');
    modalOverlay.remove();

    isGameRunning = false;
    hitPoints = 5;
    coins = [];
    updateHitPoints();

    ballX = (gameContainer.clientWidth - ball.clientWidth) / 2;
    ballY = (gameContainer.clientHeight - ball.clientHeight) / 2;

    obstacles.forEach(obstacle => obstacle.remove());
    obstacles = [];

    loadLevel(currentLevel);

    ballSpeedX = 0;
    ballSpeedY = 0;

    updateBallPosition();
}

function nextLevel(){
    ballX = (gameContainer.clientWidth - ball.clientWidth) / 2;
    ballY = (gameContainer.clientHeight - ball.clientHeight) / 2;

    ballSpeedX = 0;
    ballSpeedY = 0;

    isGameRunning = true;
    currentLevel++;

    const modalOverlay = document.querySelector('.modal-overlay');
    modalOverlay.remove();

    obstacles.forEach(obstacle => obstacle.remove());
    obstacles = [];
    
    loadLevel(currentLevel);
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
            handleCollision(obstacle);
        }
    });

    coins.forEach(coin => {
        const coinSphere = coin.getBoundingClientRect();

        if (
            ballRect.left < coinSphere.right &&
            ballRect.right > coinSphere.left &&
            ballRect.top < coinSphere.bottom &&
            ballRect.bottom > coinSphere.top
        ) {
            handleCollision(coin);
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

function handleCollision(collisionObject) {

    if (collisionObject.classList.contains('coin')) {
        collectCoin(collisionObject);
        return;
    }

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

function collectCoin(coin) {
    console.log('Collected coin:', coin);

    const gameContainer = document.getElementById('game-container');
    gameContainer.removeChild(coin);

    const coinIndex = coins.indexOf(coin);

    coins.splice(coinIndex, 1);

    if (coins.length === 0) {
        isGameRunning = false;
        showWinnerModal();
    }
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

loadLevel(currentLevel);

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
