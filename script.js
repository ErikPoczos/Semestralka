const ball = document.getElementById('ball');
        const gameContainer = document.getElementById('game-container');

        let ballX = 0;
        let ballY = 0;
        const ballSpeed = 5;

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
            if (keys['w']) ballY -= ballSpeed;
            if (keys['s']) ballY += ballSpeed;
            if (keys['a']) ballX -= ballSpeed;
            if (keys['d']) ballX += ballSpeed;

            // Ensure the ball stays within the game container
            ballX = Math.max(0, Math.min(ballX, gameContainer.clientWidth - ball.clientWidth));
            ballY = Math.max(0, Math.min(ballY, gameContainer.clientHeight - ball.clientHeight));

            updateBallPosition();
        }

        document.addEventListener('keydown', handleKeydown);
        document.addEventListener('keyup', handleKeyup);

        // Update ball position continuously
        setInterval(moveBall, 16); // Adjust the interval as needed
