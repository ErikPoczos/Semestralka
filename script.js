const ball = document.getElementById('ball');
const gameContainer = document.getElementById('game-container');

// Set the initial position of the ball to the center of the game container
let ballX = (gameContainer.clientWidth - ball.clientWidth) / 2;
let ballY = (gameContainer.clientHeight - ball.clientHeight) / 2;

let ballSpeedX = 0;
let ballSpeedY = 0;
const acceleration = 0.2; // Acceleration factor
const maxSpeed = 20; // Maximum speed
const deceleration = 0.02; // Deceleration factor
const slowdown = 0.05; // Slowdown factor

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

function moveBall() {
    // Accelerate in the direction of the pressed keys
    let targetSpeedX = 0;
    let targetSpeedY = 0;

    if (keys['w']) targetSpeedY -= acceleration;
    if (keys['s']) targetSpeedY += acceleration;
    if (keys['a']) targetSpeedX -= acceleration;
    if (keys['d']) targetSpeedX += acceleration;

    // Apply deceleration when changing direction
    if ((targetSpeedX > 0 && ballSpeedX < 0) || (targetSpeedX < 0 && ballSpeedX > 0)) {
        ballSpeedX *= 1 - deceleration;
    }

    if ((targetSpeedY > 0 && ballSpeedY < 0) || (targetSpeedY < 0 && ballSpeedY > 0)) {
        ballSpeedY *= 1 - deceleration;
    }

    // Always apply deceleration when no input is pressed
    ballSpeedX *= 1 - deceleration;
    ballSpeedY *= 1 - deceleration;

    // Update ball speed
    ballSpeedX = Math.max(-maxSpeed, Math.min(ballSpeedX + targetSpeedX, maxSpeed));
    ballSpeedY = Math.max(-maxSpeed, Math.min(ballSpeedY + targetSpeedY, maxSpeed));

    // Update ball position
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Ensure the ball stays within the game container
    ballX = Math.max(0, Math.min(ballX, gameContainer.clientWidth - ball.clientWidth));
    ballY = Math.max(0, Math.min(ballY, gameContainer.clientHeight - ball.clientHeight));

    // Apply slowdown effect when the ball stops moving
    if (!keys['w'] && !keys['s'] && !keys['a'] && !keys['d'] && Math.abs(ballSpeedX) < 0.1 && Math.abs(ballSpeedY) < 0.1) {
        ballSpeedX *= 1 - slowdown;
        ballSpeedY *= 1 - slowdown;
    }

    updateBallPosition();
}

document.addEventListener('keydown', handleKeydown);
document.addEventListener('keyup', handleKeyup);

// Update ball position continuously
setInterval(moveBall, 16); // Adjust the interval as needed

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(function(registration) {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(function(error) {
            console.error('Service Worker registration failed:', error);
        });
}
