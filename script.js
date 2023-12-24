const ball = document.getElementById('ball');
const gameContainer = document.getElementById('game-container');
const obstacle = document.getElementById('obstacle');

// Set the initial position of the ball to the center of the game container
let ballX = (gameContainer.clientWidth - ball.clientWidth) / 2;
let ballY = (gameContainer.clientHeight - ball.clientHeight) / 2;

let ballSpeedX = 0;
let ballSpeedY = 0;

const acceleration = 0.2;   //higher number higher speed
const maxSpeed = 20;        //max speed
const deceleration = 0.02;  //inertia

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

function checkCollision() {
    const ballRect = ball.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    return (
        ballRect.left < obstacleRect.right &&
        ballRect.right > obstacleRect.left &&
        ballRect.top < obstacleRect.bottom &&
        ballRect.bottom > obstacleRect.top
    );
}

function moveBall() {
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

    if (checkCollision()) {
        // Adjust the ball's position to avoid overlap with the obstacle
        ballX -= 2 * ballSpeedX;
        ballY -= 2 * ballSpeedY;

        // Invert the ball's speed components to simulate a bounce effect
        ballSpeedX = -ballSpeedX;
        ballSpeedY = -ballSpeedY;

        // Optionally, reduce the bounce effect by applying deceleration
        ballSpeedX *= 1 - deceleration;
        ballSpeedY *= 1 - deceleration;

        updateBallPosition();
        console.log('Collision with obstacle detected!');
    } else {
        ballX = Math.max(0, Math.min(ballX, gameContainer.clientWidth - ball.clientWidth));
        ballY = Math.max(0, Math.min(ballY, gameContainer.clientHeight - ball.clientHeight));

        updateBallPosition();
    }
}


document.addEventListener('keydown', handleKeydown);
document.addEventListener('keyup', handleKeyup);

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
