// Constants
const acceleration = 0.2;
const maxSpeed = 20;
const deceleration = 0.01;
const sensitivity = 0.15;

// Elements
const ball = document.getElementById("ball");
const gameContainer = document.getElementById("game-container");
const startButton = document.getElementById("startButton");
const hpLabel = document.getElementById("hp");

// Game state
let obstacles = [];
let coins = [];
let currentLevel = 0;
let isGameRunning = false;
let hitPoints = 5;
let initialBallX, ballX;
let initialBallY, ballY;
let ballSpeedX = 0;
let ballSpeedY = 0;

let gyroscopeActive = false;
let beta;
let gamma;

// Keyboard state
const keys = { w: false, s: false, a: false, d: false };

// Event listeners
document.addEventListener("keydown", handleKeydown);
document.addEventListener("keyup", handleKeyup);
startButton.addEventListener("click", () => {
  if (isGameRunning) {
    resetGame();
  } else {
    isGameRunning = true;
    document.body.style.backgroundColor = "lightgray";
    gameContainer.style.backgroundColor = "#f0f0f0";
  }
});

// Gyroscope
if (window.DeviceOrientationEvent) {
  window.addEventListener("deviceorientation", handleOrientation);
  gyroscopeActive = true;
} else {
  alert("Device orientation not supported on this browser");
}

function handleOrientation(event) {
  beta = event.beta;
  gamma = event.gamma;

  moveBall();
}

// Key input
function handleKeydown(event) {
  keys[event.key] = true;
}

function handleKeyup(event) {
  keys[event.key] = false;
}

function moveBall() {
  if (!isGameRunning) {
    return;
  }

  if (
    gyroscopeActive &&
    typeof gamma === "number" &&
    typeof beta === "number"
  ) {
    ballX += sensitivity * gamma;
    ballY += sensitivity * beta;

    updateBallPosition();
  }

  const targetSpeedX = calculateTargetSpeed("a", "d");
  const targetSpeedY = calculateTargetSpeed("w", "s");

  applyDeceleration();

  ballSpeedX = clampSpeed(ballSpeedX + targetSpeedX);
  ballSpeedY = clampSpeed(ballSpeedY + targetSpeedY);

  ballX += ballSpeedX;
  ballY += ballSpeedY;

  checkCollisions();
  ballX = Math.max(
    0,
    Math.min(ballX, gameContainer.clientWidth - ball.clientWidth)
  );
  ballY = Math.max(
    0,
    Math.min(ballY, gameContainer.clientHeight - ball.clientHeight)
  );

  if (ballY <= 0 || ballY >= gameContainer.clientHeight - ball.clientHeight) {
    ballSpeedY = 0;
  }

  if (ballX <= 0 || ballX >= gameContainer.clientWidth - ball.clientWidth) {
    ballSpeedX = 0;
  }

  updateBallPosition();
}

function clampSpeed(speed) {
  return Math.max(-maxSpeed, Math.min(speed, maxSpeed));
}

function calculateTargetSpeed(negativeKey, positiveKey) {
  let targetSpeed = 0;
  if (keys[negativeKey]) targetSpeed -= acceleration;
  if (keys[positiveKey]) targetSpeed += acceleration;
  return targetSpeed;
}

function applyDeceleration() {
  ballSpeedX *= 1 - deceleration;
  ballSpeedY *= 1 - deceleration;
}

function updateBallPosition() {
  ball.style.transform = `translate(${ballX}px, ${ballY}px)`;
}

function reverseBallDirection() {
  ballSpeedX = -ballSpeedX;
  ballSpeedY = -ballSpeedY;
}

setInterval(moveBall, 16);

function resetGame() {
  const modalOverlay = document.querySelector(".modal-overlay");
  modalOverlay.remove();

  isGameRunning = false;
  hitPoints = 5;

  clearElements(coins);
  coins = [];

  clearElements(obstacles);
  obstacles = [];

  updateHitPoints();
  loadLevel(currentLevel);

  resetBall();
  document.body.style.backgroundColor = "white";
}

function resetBall() {
  ballSpeedX = 0;
  ballSpeedY = 0;

  ballX = initialBallX;
  ballY = initialBallY;

  updateBallPosition();
}

function clearElements(elements) {
  elements.forEach((element) => element.remove());
}

function resetKeys() {
  keys["w"] = false;
  keys["s"] = false;
  keys["a"] = false;
  keys["d"] = false;
}

// Object creation
function createCoin(coinData) {
  const newCoin = document.createElement("div");
  newCoin.className = "coin";

  const diameter = coinData.radius * 2 + "px";

  Object.assign(newCoin.style, {
    width: diameter,
    height: diameter,
    borderRadius: "50%",
    backgroundColor: "gold",
    position: "absolute",
    left: coinData.position.x + "%",
    top: coinData.position.y + "%",
  });

  console.log(
    "Coin created:",
    newCoin,
    "at",
    `${coinData.position.x}%`,
    `${coinData.position.y}%`
  );

  coins.push(newCoin);
  document.getElementById("game-container").appendChild(newCoin);
}

function createObstacle(obstacleData) {
  const newObstacle = document.createElement("div");
  newObstacle.className = "obstacle";

  const { x, y, width, height } = obstacleData;

  Object.assign(newObstacle.style, {
    left: `${x}%`,
    top: `${y}%`,
    width: `${width}%`,
    height: `${height}%`,
  });

  gameContainer.appendChild(newObstacle);
  obstacles.push(newObstacle);

  console.log("Obstacle created:", obstacleData);
}

// Collision handling
function checkCollisions() {
  if (!isGameRunning) {
    return;
  }

  const ballRect = ball.getBoundingClientRect();

  checkElementsCollisions(obstacles, ballRect);
  checkElementsCollisions(coins, ballRect);
}

function checkElementsCollisions(elements, ballRect) {
  elements.forEach((element) => {
    const elementRect = element.getBoundingClientRect();

    if (
      ballRect.left < elementRect.right &&
      ballRect.right > elementRect.left &&
      ballRect.top < elementRect.bottom &&
      ballRect.bottom > elementRect.top
    ) {
      handleCollision(element);
    }
  });
}

function handleCollision(collisionObject) {
  if (collisionObject.classList.contains("coin")) {
    collectCoin(collisionObject);
    return;
  }

  hitPoints--;

  updateHitPoints();

  ballX -= 2 * ballSpeedX;
  ballY -= 2 * ballSpeedY;

  reverseBallDirection();
  applyDeceleration();

  updateBallPosition();
  console.log("Collision with obstacle detected!");
}

function collectCoin(coin) {
  console.log("Collected coin:", coin);

  const gameContainer = document.getElementById("game-container");
  gameContainer.removeChild(coin);

  const coinIndex = coins.indexOf(coin);
  coins.splice(coinIndex, 1);

  if (coins.length === 0) {
    isGameRunning = false;
    showWinnerModal();
  }
}

// Health update system
function updateHitPoints() {
  const hpLabel = document.getElementById("hpLabel");
  hpLabel.innerHTML = "";

  const textNode = document.createTextNode("Remaining hitpoints: ");
  hpLabel.appendChild(textNode);

  for (let i = 0; i < hitPoints; i++) {
    const heartIcon = document.createElement("i");
    heartIcon.classList.add("fas", "fa-heart");
    hpLabel.appendChild(heartIcon);
  }

  if (hitPoints <= 0) {
    isGameRunning = false;
    showDeathModal();
  }
}

// Level loading handling
function loadLevel(levelIndex) {
  const storedLevel = localStorage.getItem("currentLevel");
  const initialLevel = storedLevel ? parseInt(storedLevel, 10) : 0;
  const levelToLoad = levelIndex || initialLevel;
  currentLevel = levelToLoad;

  fetch("jsons/levels.json")
    .then((response) => response.json())
    .then(({ levels }) => {
      const level = levels[currentLevel];

      if (level && level.obstacles) {
        level.obstacles.forEach(createObstacle);
      } else {
        console.error("Invalid level or obstacle data:", level);
      }

      if (level && level.coins) {
        level.coins.forEach(createCoin);
      } else {
        console.error("Invalid level or coin data:", level);
      }

      const spawn = level && level.spawn && level.spawn[0];
      if (spawn) {
        initialBallX = (spawn.x / 100) * gameContainer.clientWidth;
        initialBallY = (spawn.y / 100) * gameContainer.clientHeight;
      }

      const levelIndicator = document.getElementById("levelIndicator");
      levelIndicator.textContent = `Level ${currentLevel + 1}`;

      resetBall();
      updateHitPoints();
    })
    .catch((error) => console.error("Error loading data:", error));
}

function nextLevel() {
  localStorage.removeItem("currentLevel", currentLevel);

  currentLevel++;
  hitPoints = 5;
  localStorage.setItem("currentLevel", currentLevel);

  resetKeys();
  removeModal();

  obstacles.forEach((obstacle) => obstacle.remove());
  obstacles = [];

  if (currentLevel == 5) {
    winnerLastModal();
    return;
  }

  loadLevel(currentLevel);
  document.body.style.backgroundColor = "white";

  isGameRunning = false;
}

//Level loading
loadLevel(currentLevel);

// Service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("service-worker.js")
    .then(function (registration) {
      console.log("Service Worker registered with scope:", registration.scope);
    })
    .catch(function (error) {
      console.error("Service Worker registration failed:", error);
    });
}

//Modal related function
function createModal(title, buttonText, buttonCallback) {
  const modalOverlay = document.createElement("div");
  modalOverlay.className = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = "custom-modal";

  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";

  const modalText = document.createElement("p");
  modalText.textContent = title;

  const actionButton = document.createElement("button");
  actionButton.textContent = buttonText;
  actionButton.addEventListener("click", buttonCallback);

  modalContent.appendChild(modalText);
  modalContent.appendChild(actionButton);

  modal.appendChild(modalContent);
  modalOverlay.appendChild(modal);
  document.body.appendChild(modalOverlay);
}

function removeModal() {
  const modalOverlay = document.querySelector(".modal-overlay");
  modalOverlay && modalOverlay.remove();
}

function hideGameRules() {
  isGameRunning = true;
  removeModal();
}

function showDeathModal() {
  createModal("You died!", "Try Again", resetGame);
}

function showWinnerModal() {
  createModal(
    "Congratulations! You collected all the coins.",
    "Try Again",
    resetGame
  );
  const continueButton = document.createElement("button");
  continueButton.textContent = "Continue";
  continueButton.addEventListener("click", nextLevel);
  document.querySelector(".modal-content").appendChild(continueButton);
}

function winnerLastModal() {
  const modalOverlay = document.createElement("div");
  modalOverlay.className = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = "custom-modal";

  const winnerModal = document.createElement("div");
  winnerModal.className = "winner-modal";

  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";

  const modalText = document.createElement("p");
  modalText.textContent = "Congratulations! You won the game.";

  const resetButton = document.createElement("button");
  resetButton.textContent = "Reset to Level 1";
  resetButton.addEventListener("click", resetToLevel1);

  modalContent.appendChild(modalText);
  modalContent.appendChild(resetButton);

  winnerModal.appendChild(modalContent);
  modalOverlay.appendChild(winnerModal);
  document.body.appendChild(modalOverlay);
}

function resetToLevel1() {
  localStorage.removeItem("currentLevel");
  currentLevel = 0;
  resetGame();
}

function showGameRules() {
  isGameRunning = false;

  const modalOverlay = document.createElement("div");
  modalOverlay.className = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = "custom-modal";

  const modalContent = document.createElement("div");
  modalContent.className = "modal-content game-rules-modal";

  modalContent.innerHTML = `
        <h2>GAME RULES</h2>

        <h3>Objective:</h3>
        <p>Navigate through the levels, collect gold coins, and complete every single level.</p>
        
        <h3>How to Play:</h3>
        <ul>
            <li>Click "Start Game" to begin your rolling ball adventure.</li>
            <li>After clicking on "Start Game" background of the game will change to Grey and that means that your ball is now moving.</li>
            <li>PC: Use the arrow keys (W, A, S, D) to control the movement of the ball.</li>
            <li>Mobile device: Tilt your mobile device to control the movement of the ball.</li>
        <ul>

        <h3>Game Elements:</h3>
        <ul>
            <li>Gold Coins: Collect gold coins and progress through the levels.</li>
            <li>Hearts: You start the game with 5 hearts. Each time you hit a wall, you lose 1 heart. If you run out of hearts, the game ends.</li>
            <li>Walls: Avoid colliding with walls to prevent losing hearts.</li>
        </ul>
        
        <h3>Levels:</h3>
        <p>The game consists of 5 levels, each with increasing difficulty. Reach the end of each level to unlock the next one.</p>

        <h3>Winning:</h3>
        <p>Finish all 5 levels to win the game.</p>
        
        <p>Good luck on your Rolling Ball Adventure!</p>
        
    `;

  const actionButton = document.createElement("button");
  actionButton.textContent = "Close";
  actionButton.addEventListener("click", hideGameRules);

  modalContent.appendChild(actionButton);
  modal.appendChild(modalContent);
  modalOverlay.appendChild(modal);
  document.body.appendChild(modalOverlay);
}

window.onbeforeprint = beforePrintHandler;
window.onafterprint = afterPrintHandler;
function beforePrintHandler() {
  showGameRules();
}

function afterPrintHandler() {
  hideGameRules();
}