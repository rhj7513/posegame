function runGame() {
    let canvas = document.getElementById("game-canvas");
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight - 350
    let game = canvas.getContext("2d");
    let lastTimestamp = 0;
    let score = document.getElementById("player-score");
    let health = document.getElementById("health");
    const maxHealthEl = document.getElementById('max-health')
    let running = false;
    let maxHealth = parseInt(maxHealthEl.value)
    health.innerText = maxHealth

    maxHealthEl.addEventListener("change", function () {
        if (!running) {
            maxHealth = parseInt(maxHealthEl.value)
            health.innerText = maxHealth
        }
    })

    const FRAME_RATE = 60;
    const FRAME_DURATION = 1000 / FRAME_RATE;

    let fallers = [];

    let DEFAULT_DESCENT = 0.0001; // This is per millisecond.
    let Faller = function (x, y, width, height, dx = 0, dy = 0, ax = 0, ay = DEFAULT_DESCENT) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        // Velocity.
        this.dx = dx;
        this.dy = dy;

        // Acceleration.
        this.ax = ax;
        this.ay = ay;
    };

    Faller.prototype.draw = function () {
        game.fillStyle = "blue";
        game.fillRect(this.x, this.y, this.width, this.height);
    };

    Faller.prototype.move = function (millisecondsElapsed) {
        this.x += this.dx * millisecondsElapsed;
        this.y += this.dy * millisecondsElapsed;

        this.dx += this.ax * millisecondsElapsed;
        this.dy += this.ay * millisecondsElapsed;
    };

    const DEFAULT_PLAYER_WIDTH = 250;
    const DEFAULT_PLAYER_HEIGHT = 15;
    const DEFAULT_PLAYER_Y = canvas.height - DEFAULT_PLAYER_HEIGHT;
    let Player = function (x, y = DEFAULT_PLAYER_Y, width = DEFAULT_PLAYER_WIDTH, height = DEFAULT_PLAYER_HEIGHT) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.score = 0
        this.health = parseInt(maxHealthEl.value)
        this.alive = true
    };

    Player.prototype.draw = function () {
        game.fillStyle = "darkred";
        game.beginPath();
        game.moveTo(this.x, this.y);
        game.lineTo(this.x + this.width, this.y)
        game.lineTo(this.x + this.width, this.y + this.height)
        game.lineTo(this.x, this.y + this.height)
        game.lineTo(this.x, this.y)
        game.closePath();
        game.fill();
    };

    let player = new Player(canvas.width / 2);

    let draw = (millisecondsElapsed) => {
        game.clearRect(0, 0, canvas.width, canvas.height);

        fallers.forEach((faller) => {
            faller.draw();
            faller.move(millisecondsElapsed);
        });

        player.draw();

        // Remove fallers that have hit the ground.
        fallers = fallers.filter((faller) => {
            const isAboveTheGround = faller.y < canvas.height;

            if (!isAboveTheGround) {
                if (collides(player, faller)) {
                    player.score++
                } else {
                    player.health--
                }
            }

            updateResults(player)
            return isAboveTheGround;
        });
    };

    function collides(player, faller)  {
        return player.x <= faller.x && player.x + player.width > faller.x + faller.width
    }

    function updateResults(player) {
        score.innerText = player.score
        health.innerText = player.health

        if (player.health <= 0 && player.alive) {
            player.alive = false
            stopFallerGenerator()
            running = false;
            alert("You lose! Score: " + player.score + "!")
        }
    }

// It is responsible for generating falling objects at random.
    const MIN_WIDTH = 10;
    const WIDTH_RANGE = 20;
    const MIN_HEIGHT = 10;
    const HEIGHT_RANGE = 20;
    const MILLISECONDS_BETWEEN_FALLERS = 2800;

    let fallerGenerator;
    let startFallerGenerator = () => {
        fallerGenerator = setInterval(() => {

            let fallerWidth = Math.floor(Math.random() * WIDTH_RANGE) + MIN_WIDTH;
            fallers.push(new Faller(
                Math.floor(Math.random() * (canvas.width - fallerWidth)), 0,
                fallerWidth, Math.floor(Math.random() * HEIGHT_RANGE) + MIN_HEIGHT
            ));
        }, MILLISECONDS_BETWEEN_FALLERS);
    };

    let stopFallerGenerator = () => clearInterval(fallerGenerator);

    const actionSpan = document.getElementById("action")

    let lastDirection, direction
    let playerXVelocity = 0


// This section is responsible for moving the "player" around based on mouse movement
    let updatePlayerPosition = () => {
        direction = actionSpan.innerText

        if (lastDirection === direction && playerXVelocity !== 0) {
            playerXVelocity = playerXVelocity * 1.5
        } else {
            if (direction === "left(엄지)") {
                playerXVelocity = -15
            } else if (direction === "right(브이)") {
                playerXVelocity = +15
            } else {
                playerXVelocity = 0
            }
        }

        const newPlayerX = player.x + playerXVelocity
        if (newPlayerX >= 0 && newPlayerX + player.width <= document.body.clientWidth) {
            player.x = newPlayerX
        }

        lastDirection = direction
    };

    actionSpan.addEventListener("DOMSubtreeModified", updatePlayerPosition)

    let nextFrame = (timestamp) => {
        if (!lastTimestamp) {
            lastTimestamp = timestamp;
        }

        if (timestamp - lastTimestamp < FRAME_DURATION) {
            if (running) {
                window.requestAnimationFrame(nextFrame);
            }

            return;
        }

        draw(timestamp - lastTimestamp);

        lastTimestamp = timestamp;
        if (running) {
            window.requestAnimationFrame(nextFrame);
        }
    };

    document.getElementById("start-button").addEventListener("click", () => {
        running = true;
        lastTimestamp = 0;
        startFallerGenerator();
        window.requestAnimationFrame(nextFrame);
        score.innerText = "0"
        health.innerText = "0"
        player.health = parseInt(maxHealthEl.value)
        player.score = 0
    });

    document.getElementById("stop-button").addEventListener("click", () => {
        stopFallerGenerator();
        running = false;
    });
}
