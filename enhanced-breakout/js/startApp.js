const breakOutGame = {
  name: 'hackout enhanced',
  originalAuthors: 'Ana Bermúdez, Cecilia Moreira, Juan Semprún',
  enhancedBy: 'Juan Semprun',
  version: '2.0.0',
  license: undefined,
  description:
    'Enhanced Breakout Game with improved collision system, powerup notifications, and visual upgrades',
  canvasId: undefined,
  ctx: undefined,
  lifes: 3,
  score: 0,
  canvasSize: {
    w: undefined,
    h: undefined,
  },
  keycode: {
    left: 37,
    right: 39,
    enter: 13,
  },
  isPlaying: false,
  paddle: undefined,
  paddleSize: {
    w: 200,
    h: 20,
  },
  paddlePos: {
    x: undefined,
    y: undefined,
  },
  ball: undefined,
  ballSize: {
    w: 30,
    h: 30,
  },
  ballRadius: undefined,
  brickSize: {
    w: 105,
    h: 30,
  },
  brickPos: {
    x: 0,
    y: 0,
  },
  bricks: [],
  brickRows: 5,
  brickColumns: 9,
  powerUp: undefined,
  powerUpsArray: [
    {
      x: undefined,
      y: undefined,
      type: undefined,
    },
  ],
  powerUpSize: {
    w: 35,
    h: 35,
  },
  powerUpType: ['smallPaddle', 'bigPaddle', 'fastBall', 'crazyKeys'],

  // POWERUP BANNER SYSTEM
  powerUpBanner: {
    isVisible: false,
    message: '',
    timer: 0,
    duration: 2000, // 2 seconds
  },
  powerUpMessages: {
    smallPaddle: 'SMALL PADDLE!',
    bigPaddle: 'BIG PADDLE!',
    fastBall: 'FAST BALL!',
    crazyKeys: 'CRAZY KEYS!',
  },

  // INITIALIZE THE GAME
  init(id) {
    this.canvasId = id;
    this.ctx = document
      .getElementById(this.canvasId)
      .getContext('2d');
    this.setDimensions();
    this.createBricksArray();
    this.reset();
    this.setEventListener();
    this.soundManagement();
  },

  // DIMENSIONS FOR THE CANVAS
  setDimensions() {
    const divSize = document.querySelector('#game-board');

    document
      .getElementById(this.canvasId)
      .setAttribute('width', 1000);
    document
      .getElementById(this.canvasId)
      .setAttribute('height', window.innerHeight);

    this.canvasSize = {
      w: 1000,
      h: window.innerHeight,
    };
  },

  // COMMANDS
  setEventListener() {
    document.onkeydown = (e) => {
      e.keyCode === this.keycode.left
        ? this.paddle.movePaddle('left')
        : null;
      e.keyCode === this.keycode.right
        ? this.paddle.movePaddle('right')
        : null;

      // PAUSE / START
      if (
        e.keyCode === this.keycode.enter &&
        this.isPlaying === false
      ) {
        this.start();
        this.isPlaying = true;
      } else if (
        e.keyCode === this.keycode.enter &&
        this.isPlaying === true
      ) {
        this.pause();

        this.isPlaying = false;
      }
    };
  },

  // RESET THE GAME
  reset() {
    this.drawBackground();

    const centerX = this.canvasSize.w / 2 - this.paddleSize.w / 2;
    const centerY = this.canvasSize.h - 50;

    this.paddle = new Paddle(
      this.ctx,
      centerX,
      centerY,
      this.paddleSize.w,
      this.paddleSize.h,
      this.canvasSize
    );
    this.ball = new Ball(
      this.ctx,
      centerX + this.paddleSize.w / 2,
      this.canvasSize.h / 2,
      this.ballSize.w,
      this.ballSize.h,
      this.canvasSize
    );
    this.powerUp = new PowerUps(
      this.ctx,
      this.paddleSize.w,
      this.paddleSize.h,
      this.ballSize.w,
      this.ballSize.h,
      this.canvasSize
    );

    this.ball.draw();
    this.paddle.draw();
    this.drawBricks();
  },

  // START THE GAME
  start() {
    this.setEventListener();

    this.interval = setInterval(() => {
      this.clearScreen();
      this.drawAll();
      this.drawBricks();
      this.isCollision();
    }, 20);
  },

  // PAUSE THE GAME
  pause() {
    clearInterval(this.interval);
  },

  // SOUND MANAGEMENT
  soundManagement() {
    const soundNode = document.querySelector('#sound');

    soundNode.addEventListener('click', audioManager);

    function audioManager() {
      let imgSrc = soundNode.getAttribute('src');

      let soundImg =
        imgSrc == './img/volume-on.png'
          ? './img/volume-off.png'
          : './img/volume-on.png';

      soundNode.setAttribute('src', soundImg);

      // MUTE AND UNMUTE SOUNDS
      wall_hit.muted = wall_hit.muted ? false : true;
      paddle_hit.muted = paddle_hit.muted ? false : true;
      brick_hit.muted = brick_hit.muted ? false : true;
      life_lost.muted = life_lost.muted ? false : true;
      power_up.muted = power_up.muted ? false : true;
      win.muted = win.muted ? false : true;
      lose.muted = lose.muted ? false : true;
    }
  },

  setScore() {
    let scoreNode = document.querySelector('.score span');

    this.score += 10;
    this.score < 100
      ? (scoreNode.innerText = '0' + this.score)
      : (scoreNode.innerText = this.score);

    if (this.lifes === 0) {
      this.score = 0;
      scoreNode.innerText = '000';
    }
  },

  // BACKGROUND
  drawBackground() {
    this.ctx.lineWidth = 5;
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvasSize.w, this.canvasSize.h);
    this.ctx.strokeStyle = 'white';
    this.ctx.strokeRect(0, 0, this.canvasSize.w, this.canvasSize.h);
  },

  // CREATE ARRAY OF BRICKS
  createBricksArray() {
    for (let c = 0; c < this.brickColumns; c++) {
      this.bricks[c] = [];

      for (let r = 0; r < this.brickRows; r++) {
        this.bricks[c][r] = {
          x: 0,
          y: 0,
          status: true,
          power: false,
        };
      }
    }

    // Generate random powerups location
    for (let i = 0; i < this.brickColumns; i++) {
      let columnIndex = Math.floor(
        Math.random() * (this.brickColumns - 1)
      );
      let rowIndex =
        Math.floor(Math.random() * (this.brickRows - 1)) + 1;

      if (this.bricks[columnIndex][rowIndex].power === true) {
        null;
      } else {
        this.bricks[columnIndex][rowIndex].power = true;
      }
    }
  },

  // DRAW BRICKS WALL
  drawBricks() {
    for (let c = 0; c < this.brickColumns; c++) {
      for (let r = 1; r < this.brickRows; r++) {
        if (this.bricks[c][r].status) {
          this.brickPos.x = c * (this.brickSize.h + 80) + 7; // Add space between columns
          this.brickPos.y = r * (this.brickSize.w - 70); // Add space between rows
          this.bricks[c][r].x = this.brickPos.x;
          this.bricks[c][r].y = this.brickPos.y;

          switch (r) {
            case 1:
              this.ctx.fillStyle = '#FF6B6B'; // Soft Red - Top row (highest value)
              break;
            case 2:
              this.ctx.fillStyle = '#4ECDC4'; // Teal - Second row
              break;
            case 3:
              this.ctx.fillStyle = '#45B7D1'; // Sky Blue - Third row
              break;
            case 4:
              this.ctx.fillStyle = '#96CEB4'; // Mint Green - Bottom row
              break;
          }

          this.ctx.strokeStyle = '#FFFFFF'; // White borders for retro look
          this.ctx.lineWidth = 2; // Thicker borders
          this.ctx.strokeRect(
            this.brickPos.x,
            this.brickPos.y,
            this.brickSize.w,
            this.brickSize.h
          );
          this.ctx.fillRect(
            this.brickPos.x,
            this.brickPos.y,
            this.brickSize.w,
            this.brickSize.h
          );
        }
      }
    }
  },

  // DRAW POWER-UPS
  drawPowerUps() {
    for (let i = this.powerUpsArray.length - 1; i >= 1; i--) {
      let powerUpPosX =
        this.powerUpsArray[i].x +
        (this.brickSize.w / 2 - this.powerUpSize.w / 2);
      let powerUpPosY = this.powerUpsArray[i].y + this.brickSize.h;

      this.powerUp.draw(powerUpPosX, powerUpPosY);

      this.powerUpsArray[i].y += this.powerUp.gravity;

      // Check if powerup should be removed (fell off screen)
      if (powerUpPosY > this.canvasSize.h) {
        this.powerUpsArray.splice(i, 1);
      }
    }
  },

  // DRAW THE BOARD
  drawAll() {
    this.drawBackground();
    this.paddle.draw();
    this.ball.draw();
    this.drawPowerUps();
    this.checkPowerUpCollisions();
    this.updatePowerUpBanner();
    this.drawPowerUpBanner();
  },

  // CHECK BOUNDERIES
  setBounderies() {
    // Up boundary
    if (this.ball.ballPos.y - this.ball.ballRadius < 0) {
      wall_hit.play();
      this.ball.ballVel.y = Math.abs(this.ball.ballVel.y); // Ensure downward movement
      this.ball.ballPos.y = this.ball.ballRadius; // Position ball at boundary
    }

    // Bottom boundary (lose life)
    if (
      this.ball.ballPos.y - this.ball.ballRadius >
      this.canvasSize.h
    ) {
      this.lifeCounter();
    }

    // Left boundary
    if (this.ball.ballPos.x - this.ball.ballRadius < 0) {
      wall_hit.play();
      this.ball.ballVel.x = Math.abs(this.ball.ballVel.x); // Ensure rightward movement
      this.ball.ballPos.x = this.ball.ballRadius; // Position ball at boundary
    }

    // Right boundary
    if (
      this.ball.ballPos.x + this.ball.ballRadius >
      this.canvasSize.w
    ) {
      wall_hit.play();
      this.ball.ballVel.x = -Math.abs(this.ball.ballVel.x); // Ensure leftward movement
      this.ball.ballPos.x = this.canvasSize.w - this.ball.ballRadius; // Position ball at boundary
    }
  },

  // CHECK COLLISIONS
  isPaddleCollision() {
    if (
      this.ball.ballPos.y + this.ball.ballRadius >
        this.paddle.paddlePos.y &&
      this.ball.ballPos.y - this.ball.ballRadius <
        this.paddle.paddlePos.y + this.paddle.paddleSize.h &&
      this.ball.ballPos.x + this.ball.ballRadius >
        this.paddle.paddlePos.x &&
      this.ball.ballPos.x - this.ball.ballRadius <
        this.paddle.paddlePos.x + this.paddle.paddleSize.w
    ) {
      // Only reverse if ball is moving downward to avoid double collision
      if (this.ball.ballVel.y > 0) {
        // Position ball above paddle to prevent sticking
        this.ball.ballPos.y =
          this.paddle.paddlePos.y - this.ball.ballRadius;

        // Calculate where ball hit paddle for angle variation
        const hitPos =
          (this.ball.ballPos.x - this.paddle.paddlePos.x) /
          this.paddle.paddleSize.w;
        const angle = ((hitPos - 0.5) * Math.PI) / 3; // Max 60 degree angle

        const speed = Math.sqrt(
          this.ball.ballVel.x * this.ball.ballVel.x +
            this.ball.ballVel.y * this.ball.ballVel.y
        );
        this.ball.ballVel.x = speed * Math.sin(angle);
        this.ball.ballVel.y = -Math.abs(speed * Math.cos(angle)); // Always upward

        paddle_hit.play();
      }
    }
  },

  isBrickCollision() {
    for (let c = 0; c < this.brickColumns; c++) {
      for (let r = 1; r < this.brickRows; r++) {
        let b = this.bricks[c][r];

        if (b.status) {
          if (
            this.ball.ballPos.y + this.ball.ballRadius > b.y &&
            this.ball.ballPos.y - this.ball.ballRadius <
              b.y + this.brickSize.h &&
            this.ball.ballPos.x + this.ball.ballRadius > b.x &&
            this.ball.ballPos.x - this.ball.ballRadius <
              b.x + this.brickSize.w
          ) {
            // Calculate overlap on each axis
            const overlapX = Math.min(
              this.ball.ballPos.x + this.ball.ballRadius - b.x,
              b.x +
                this.brickSize.w -
                (this.ball.ballPos.x - this.ball.ballRadius)
            );
            const overlapY = Math.min(
              this.ball.ballPos.y + this.ball.ballRadius - b.y,
              b.y +
                this.brickSize.h -
                (this.ball.ballPos.y - this.ball.ballRadius)
            );

            // Reverse ball direction based on smallest overlap
            if (overlapX < overlapY) {
              // Hit from left or right
              this.ball.ballVel.x *= -1;
              // Move ball out of brick
              if (this.ball.ballPos.x < b.x + this.brickSize.w / 2) {
                this.ball.ballPos.x = b.x - this.ball.ballRadius;
              } else {
                this.ball.ballPos.x =
                  b.x + this.brickSize.w + this.ball.ballRadius;
              }
            } else {
              // Hit from top or bottom
              this.ball.ballVel.y *= -1;
              // Move ball out of brick
              if (this.ball.ballPos.y < b.y + this.brickSize.h / 2) {
                this.ball.ballPos.y = b.y - this.ball.ballRadius;
              } else {
                this.ball.ballPos.y =
                  b.y + this.brickSize.h + this.ball.ballRadius;
              }
            }

            b.status = false;
            brick_hit.play();
            this.setScore();
            this.isWin();

            if (b.power) {
              // Assign powerup type immediately when brick is destroyed
              let randomType = Math.floor(
                Math.random() * this.powerUpType.length
              );
              let powerUpType = this.powerUpType[randomType];

              this.powerUpsArray.push({
                x: b.x,
                y: b.y,
                type: powerUpType,
              });
            }

            // Exit loops to prevent multiple brick hits in same frame
            return;
          }
        }
      }
    }
  },

  // CHECK POWERUP COLLISIONS SEPARATELY
  checkPowerUpCollisions() {
    for (let i = this.powerUpsArray.length - 1; i >= 1; i--) {
      let powerUpPosX =
        this.powerUpsArray[i].x +
        (this.brickSize.w / 2 - this.powerUpSize.w / 2);
      let powerUpPosY = this.powerUpsArray[i].y + this.brickSize.h;

      if (
        powerUpPosX + this.powerUpSize.w > this.paddle.paddlePos.x &&
        powerUpPosX <
          this.paddle.paddlePos.x + this.paddle.paddleSize.w &&
        powerUpPosY + this.powerUpSize.h > this.paddle.paddlePos.y &&
        powerUpPosY <
          this.paddle.paddlePos.y + this.paddle.paddleSize.h
      ) {
        power_up.play();
        this.setPowerUp(this.powerUpsArray[i].type);
        this.showPowerUpBanner(this.powerUpsArray[i].type);
        this.powerUpsArray.splice(i, 1);
      }
    }
  },

  setPowerUp(type) {
    const paddleRealSize = this.paddleSize.w;
    const ballRealSpeed = Math.sqrt(
      this.ball.ballVel.x * this.ball.ballVel.x +
        this.ball.ballVel.y * this.ball.ballVel.y
    );

    switch (type) {
      case 'bigPaddle':
        this.paddle.paddleSize.w *= 2;
        break;
      case 'smallPaddle':
        // Prevent paddle from becoming too small
        if (this.paddle.paddleSize.w > 50) {
          this.paddle.paddleSize.w /= 2;
        }
        break;
      case 'fastBall':
        this.ball.ballVel.x *= 1.5;
        this.ball.ballVel.y *= 1.5;
        break;
      case 'crazyKeys':
        this.keycode.left = 39;
        this.keycode.right = 37;
    }

    setTimeout(() => {
      this.paddle.paddleSize.w = paddleRealSize;

      // For fastBall, restore original speed while maintaining current direction
      if (type === 'fastBall') {
        const currentSpeed = Math.sqrt(
          this.ball.ballVel.x * this.ball.ballVel.x +
            this.ball.ballVel.y * this.ball.ballVel.y
        );
        if (currentSpeed > 0) {
          const speedRatio = ballRealSpeed / currentSpeed;
          this.ball.ballVel.x *= speedRatio;
          this.ball.ballVel.y *= speedRatio;
        }
      }

      this.keycode.left = 37;
      this.keycode.right = 39;
    }, 5000);
  },

  // POWERUP BANNER FUNCTIONS
  showPowerUpBanner(type) {
    this.powerUpBanner.isVisible = true;
    this.powerUpBanner.message =
      this.powerUpMessages[type] || 'POWER UP!';
    this.powerUpBanner.timer = Date.now();
  },

  updatePowerUpBanner() {
    if (this.powerUpBanner.isVisible) {
      const elapsed = Date.now() - this.powerUpBanner.timer;
      if (elapsed >= this.powerUpBanner.duration) {
        this.powerUpBanner.isVisible = false;
      }
    }
  },

  drawPowerUpBanner() {
    if (this.powerUpBanner.isVisible) {
      const elapsed = Date.now() - this.powerUpBanner.timer;
      const progress = elapsed / this.powerUpBanner.duration;

      // Fade effect: full opacity for first half, then fade out
      let alpha = progress < 0.5 ? 1 : 2 - progress * 2;
      alpha = Math.max(0, Math.min(1, alpha));

      // Banner background
      this.ctx.save();
      this.ctx.globalAlpha = alpha * 0.8;
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(
        this.canvasSize.w / 2 - 200,
        this.canvasSize.h / 2 - 60,
        400,
        120
      );

      // Banner border
      this.ctx.globalAlpha = alpha;
      this.ctx.strokeStyle = '#FFFFFF';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(
        this.canvasSize.w / 2 - 200,
        this.canvasSize.h / 2 - 60,
        400,
        120
      );

      // Banner text
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = '#00FF00';
      this.ctx.font = 'bold 24px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        this.powerUpBanner.message,
        this.canvasSize.w / 2,
        this.canvasSize.h / 2 + 10
      );
      this.ctx.restore();
    }
  },

  isCollision() {
    this.setBounderies();
    this.isBrickCollision();
    this.isPaddleCollision();
  },

  // LOSE LIFE
  isLose() {
    if (this.lifes > 0) {
      life_lost.play();

      this.ball.ballPos.x = this.canvasSize.w / 2;
      this.ball.ballPos.y = this.canvasSize.h / 2;

      this.paddle.paddlePos.x =
        this.canvasSize.w / 2 - this.paddleSize.w / 2;
      this.paddle.paddlePos.y = this.canvasSize.h - 70;
    } else {
      this.gameOver('lose');
    }
  },

  // LIFE COUNTER
  lifeCounter() {
    this.lifes--;
    this.isLose();

    // Update HTML deleting the heart
    const lifeNode = document.querySelectorAll('.life');
    if (lifeNode[this.lifes]) {
      lifeNode[this.lifes].style.opacity = '0';
    }
  },

  // WIN
  isWin() {
    let unifiedBricksArray = this.bricks.flat();
    let trueBricks = unifiedBricksArray.filter(
      (element) => element.status === true && element.y > 0
    );

    if (trueBricks.length === 0) {
      this.gameOver('win');
    }
  },

  // POP UPS GAME OVER/WIN
  banner(status) {
    const gameOverNode = document.querySelector('.gameover');

    if (status === 'win') {
      const youWinNode = document.querySelector('.you-win');

      // If win
      gameOverNode.classList.add('visible');
      youWinNode.classList.remove('hide');
      win.play();
    } else {
      const youLoseNode = document.querySelector('.you-lose');

      // If lose
      gameOverNode.classList.add('visible');
      youLoseNode.classList.remove('hide');
      lose.play();
    }
  },

  // GAMEOVER
  gameOver(status) {
    this.banner(status);

    clearInterval(this.interval);

    setTimeout(() => {
      document.location.reload();
    }, 4000);
  },

  // CLEAR SCREEN
  clearScreen() {
    this.ctx.clearRect(0, 0, this.canvasSize.w, this.canvasSize.h);
  },
};
