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

  // MOBILE SUPPORT SYSTEM
  isMobile: false,
  touchStartPos: { x: 0, y: 0 },
  isMovingLeft: false,
  isMovingRight: false,
  touchInterval: null,
  mobileOverride: null, // For manual testing: true = force mobile, false = force desktop, null = auto-detect

  // RESPONSIVE SCALING SYSTEM
  baseWidth: 1000, // Reference width for scaling calculations
  baseHeight: 600, // Reference height for scaling calculations
  scaleFactor: 1,

  // BASE SIZES (will be scaled based on screen size)
  basePaddleSize: { w: 200, h: 20 },
  baseBallSize: { w: 30, h: 30 },
  baseBrickSize: { w: 105, h: 30 },
  basePowerUpSize: { w: 35, h: 35 },

  // TESTING FUNCTIONS - Can be called from browser console
  // Usage: breakOutGame.setMobileMode(true) or breakOutGame.setMobileMode(false)
  setMobileMode(forceMobile) {
    this.mobileOverride = forceMobile;
    this.detectMobileDevice();
    console.log(
      `Mobile mode ${
        forceMobile ? 'ENABLED' : 'DISABLED'
      } for testing`
    );
  },

  resetMobileDetection() {
    this.mobileOverride = null;
    this.detectMobileDevice();
    console.log('Mobile detection reset to auto-detect');
  },

  // RESPONSIVE SCALING CALCULATIONS
  calculateResponsiveScaling() {
    // Calculate scale factor based on screen size vs base dimensions
    const widthScale = this.canvasSize.w / this.baseWidth;
    const heightScale = this.canvasSize.h / this.baseHeight;

    // Use the smaller scale to ensure everything fits
    this.scaleFactor = Math.min(widthScale, heightScale);

    // Minimum scale factor to prevent elements becoming too small
    this.scaleFactor = Math.max(this.scaleFactor, 0.4);

    // Maximum scale factor to prevent elements becoming too large on big screens
    this.scaleFactor = Math.min(this.scaleFactor, 1.5);

    // Update all element sizes based on scale factor
    this.paddleSize = {
      w: Math.round(this.basePaddleSize.w * this.scaleFactor),
      h: Math.round(this.basePaddleSize.h * this.scaleFactor),
    };

    this.ballSize = {
      w: Math.round(this.baseBallSize.w * this.scaleFactor),
      h: Math.round(this.baseBallSize.h * this.scaleFactor),
    };

    this.brickSize = {
      w: Math.round(this.baseBrickSize.w * this.scaleFactor),
      h: Math.round(this.baseBrickSize.h * this.scaleFactor),
    };

    this.powerUpSize = {
      w: Math.round(this.basePowerUpSize.w * this.scaleFactor),
      h: Math.round(this.basePowerUpSize.h * this.scaleFactor),
    };

    // Update ball radius
    this.ballRadius = this.ballSize.w / 2;

    console.log('Responsive scaling applied:', {
      scaleFactor: this.scaleFactor,
      canvasSize: this.canvasSize,
      paddleSize: this.paddleSize,
      ballSize: this.ballSize,
      brickSize: this.brickSize,
    });
  },

  // HAPTIC FEEDBACK FOR MOBILE
  triggerHapticFeedback(pattern = 'light') {
    if (this.isMobile && navigator.vibrate) {
      switch (pattern) {
        case 'light':
          navigator.vibrate(50);
          break;
        case 'medium':
          navigator.vibrate(100);
          break;
        case 'heavy':
          navigator.vibrate([100, 50, 100]);
          break;
        default:
          navigator.vibrate(50);
      }
    }
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
    this.detectMobileDevice();
    this.setupMobileControls();
    this.handleMobileErrors();
  },

  // MOBILE DEVICE DETECTION
  detectMobileDevice() {
    // Check for manual override first (useful for testing)
    if (this.mobileOverride !== null) {
      this.isMobile = this.mobileOverride;
      console.log(
        'Mobile Detection: Using manual override:',
        this.isMobile
      );
    } else {
      const userAgent =
        navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

      // Get device characteristics
      const hasTouchPoints = navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768; // More conservative screen size
      const userAgentIsMobile = mobileRegex.test(
        userAgent.toLowerCase()
      );

      // Check for coarse pointer (primary input is touch)
      const hasCoarsePointer =
        window.matchMedia &&
        window.matchMedia('(pointer: coarse)').matches;

      // Check if device has any fine pointer capability (mouse, trackpad, etc.)
      const hasAnyFinePointer =
        window.matchMedia &&
        window.matchMedia('(any-pointer: fine)').matches;

      // Very conservative mobile detection:
      // 1. User agent explicitly identifies as mobile device, OR
      // 2. Primary pointer is coarse AND device doesn't have any fine pointer input AND screen is mobile-sized
      this.isMobile =
        userAgentIsMobile ||
        (hasCoarsePointer && !hasAnyFinePointer && isSmallScreen);

      console.log('Mobile Detection Results:', {
        userAgent: userAgent.substring(0, 100) + '...',
        userAgentIsMobile: userAgentIsMobile,
        hasTouchPoints: hasTouchPoints,
        isSmallScreen: isSmallScreen,
        hasCoarsePointer: hasCoarsePointer,
        hasAnyFinePointer: hasAnyFinePointer,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        finalResult: this.isMobile,
      });
    }

    // Show/hide appropriate controls and instructions
    const desktopInstructions = document.getElementById(
      'desktop-instructions'
    );
    const mobileInstructions = document.getElementById(
      'mobile-instructions'
    );
    const mobileControls = document.getElementById('mobile-controls');

    if (this.isMobile) {
      desktopInstructions?.classList.add('hidden');
      mobileInstructions?.classList.remove('hidden');
      mobileControls?.classList.remove('hidden');
      console.log('Showing mobile controls');
    } else {
      desktopInstructions?.classList.remove('hidden');
      mobileInstructions?.classList.add('hidden');
      mobileControls?.classList.add('hidden');
      console.log('Hiding mobile controls');
    }
  },

  // SETUP MOBILE TOUCH CONTROLS
  setupMobileControls() {
    if (!this.isMobile) return;

    const startPauseBtn = document.getElementById('start-pause-btn');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');

    // Start/Pause button
    startPauseBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (!this.isPlaying) {
        this.start();
        this.isPlaying = true;
        startPauseBtn.textContent = 'PAUSE';
      } else {
        this.pause();
        this.isPlaying = false;
        startPauseBtn.textContent = 'START';
      }
      this.triggerHapticFeedback('medium');
    });

    // Left paddle movement
    leftBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.isMovingLeft = true;
      this.startContinuousMovement('left');
      this.triggerHapticFeedback('light');
    });

    leftBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.isMovingLeft = false;
      this.stopContinuousMovement();
    });

    leftBtn.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      this.isMovingLeft = false;
      this.stopContinuousMovement();
    });

    // Right paddle movement
    rightBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.isMovingRight = true;
      this.startContinuousMovement('right');
      this.triggerHapticFeedback('light');
    });

    rightBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.isMovingRight = false;
      this.stopContinuousMovement();
    });

    rightBtn.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      this.isMovingRight = false;
      this.stopContinuousMovement();
    });

    // Prevent default touch behaviors on mobile controls
    const mobileControls = document.getElementById('mobile-controls');
    mobileControls.addEventListener('touchstart', (e) => {
      e.stopPropagation();
    });
    mobileControls.addEventListener('touchmove', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    // Handle window resize for mobile orientation changes
    window.addEventListener('resize', () => {
      // Delay to allow resize to complete
      setTimeout(
        () => {
          this.setDimensions(); // This will also recalculate responsive scaling
          if (this.paddle && this.ball) {
            // Recalculate positions for new canvas size and scaling
            this.paddle.paddlePos.x = Math.min(
              this.paddle.paddlePos.x,
              this.canvasSize.w - this.paddle.paddleSize.w
            );
            this.ball.ballPos.x = Math.min(
              Math.max(this.ball.ballPos.x, this.ball.ballRadius),
              this.canvasSize.w - this.ball.ballRadius
            );
            this.ball.ballPos.y = Math.min(
              Math.max(this.ball.ballPos.y, this.ball.ballRadius),
              this.canvasSize.h - this.ball.ballRadius
            );

            // Update object sizes
            this.paddle.paddleSize = this.paddleSize;
            this.ball.ballSize = this.ballSize;
            this.ball.ballRadius = this.ballRadius;
          }
        },
        this.isMobile ? 500 : 250
      ); // Longer delay for mobile orientation changes
    });
  },

  // CONTINUOUS MOVEMENT FOR MOBILE
  startContinuousMovement(direction) {
    this.stopContinuousMovement(); // Clear any existing interval

    this.touchInterval = setInterval(() => {
      if (
        (direction === 'left' && this.isMovingLeft) ||
        (direction === 'right' && this.isMovingRight)
      ) {
        this.paddle.movePaddle(direction);
      }
    }, 16); // ~60fps for smooth movement
  },

  stopContinuousMovement() {
    if (this.touchInterval) {
      clearInterval(this.touchInterval);
      this.touchInterval = null;
    }
  },

  // ENHANCED MOBILE ERROR HANDLING AND EDGE CASES
  handleMobileErrors() {
    // Prevent accidental page refresh on mobile
    window.addEventListener('beforeunload', (e) => {
      if (this.isPlaying && this.isMobile) {
        e.preventDefault();
        e.returnValue = '';
        return 'Game in progress. Are you sure you want to leave?';
      }
    });

    // Handle visibility change (app switching on mobile)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.isPlaying && this.isMobile) {
        this.pause();
        this.isPlaying = false;
        if (document.getElementById('start-pause-btn')) {
          document.getElementById('start-pause-btn').textContent =
            'START';
        }
      }
    });

    // Handle mobile keyboard appearing/disappearing
    if (this.isMobile) {
      const initialViewportHeight = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;

      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
          const currentHeight = window.visualViewport.height;
          if (currentHeight < initialViewportHeight * 0.75) {
            // Keyboard is likely open - pause game
            if (this.isPlaying) {
              this.pause();
              this.isPlaying = false;
              if (document.getElementById('start-pause-btn')) {
                document.getElementById(
                  'start-pause-btn'
                ).textContent = 'START';
              }
            }
          }
        });
      }
    }
  },

  // DIMENSIONS FOR THE CANVAS
  setDimensions() {
    const divSize = document.querySelector('#game-board');
    const canvas = document.getElementById(this.canvasId);

    // Responsive canvas sizing for mobile and small screens
    let canvasWidth = 1000;
    let canvasHeight = window.innerHeight;

    if (this.isMobile || window.innerWidth < 768) {
      // Mobile sizing - fit to screen width with aspect ratio
      const maxWidth = Math.min(window.innerWidth - 40, 500); // 20px padding each side
      const aspectRatio = 1000 / window.innerHeight;

      canvasWidth = maxWidth;
      canvasHeight = Math.min(
        maxWidth / aspectRatio,
        window.innerHeight - 200
      ); // Leave space for controls
    } else if (window.innerWidth < 1200) {
      // Tablet/small desktop sizing
      canvasWidth = Math.min(window.innerWidth - 100, 800);
      canvasHeight = Math.min(window.innerHeight - 100, 600);
    }

    canvas.setAttribute('width', canvasWidth);
    canvas.setAttribute('height', canvasHeight);

    // Set CSS dimensions for proper scaling
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';

    this.canvasSize = {
      w: canvasWidth,
      h: canvasHeight,
    };

    // Calculate and apply responsive scaling for all game elements
    this.calculateResponsiveScaling();
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
    const centerY = this.canvasSize.h - 50 * this.scaleFactor; // Scale paddle distance from bottom

    this.paddle = new Paddle(
      this.ctx,
      centerX,
      centerY,
      this.paddleSize.w,
      this.paddleSize.h,
      this.canvasSize,
      this.scaleFactor
    );
    this.ball = new Ball(
      this.ctx,
      centerX + this.paddleSize.w / 2,
      this.canvasSize.h / 2,
      this.ballSize.w,
      this.ballSize.h,
      this.canvasSize,
      this.scaleFactor
    );
    this.powerUp = new PowerUps(
      this.ctx,
      this.paddleSize.w,
      this.paddleSize.h,
      this.ballSize.w,
      this.ballSize.h,
      this.canvasSize,
      this.powerUpSize,
      this.scaleFactor
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
    // Calculate responsive spacing based on canvas width and brick count
    const totalBricksWidth = this.brickColumns * this.brickSize.w;
    const availableSpace = this.canvasSize.w - totalBricksWidth;
    const horizontalSpacing = Math.max(
      availableSpace / (this.brickColumns + 1),
      5
    );

    // Responsive vertical spacing
    const verticalSpacing = Math.max(this.brickSize.h * 0.3, 5);

    for (let c = 0; c < this.brickColumns; c++) {
      for (let r = 1; r < this.brickRows; r++) {
        if (this.bricks[c][r].status) {
          // Responsive positioning - center the brick grid
          this.brickPos.x =
            horizontalSpacing +
            c * (this.brickSize.w + horizontalSpacing);
          this.brickPos.y =
            50 + r * (this.brickSize.h + verticalSpacing);

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
          this.ctx.lineWidth = Math.max(1, this.scaleFactor); // Scale border width
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
        this.triggerHapticFeedback('medium');
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
            this.triggerHapticFeedback('light');
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
        this.triggerHapticFeedback('heavy');
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

      // Responsive banner dimensions
      const bannerWidth = Math.max(300 * this.scaleFactor, 200);
      const bannerHeight = Math.max(80 * this.scaleFactor, 60);
      const bannerX = this.canvasSize.w / 2 - bannerWidth / 2;
      const bannerY = this.canvasSize.h / 2 - bannerHeight / 2;

      // Banner background
      this.ctx.save();
      this.ctx.globalAlpha = alpha * 0.8;
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(bannerX, bannerY, bannerWidth, bannerHeight);

      // Banner border
      this.ctx.globalAlpha = alpha;
      this.ctx.strokeStyle = '#FFFFFF';
      this.ctx.lineWidth = Math.max(2 * this.scaleFactor, 1);
      this.ctx.strokeRect(
        bannerX,
        bannerY,
        bannerWidth,
        bannerHeight
      );

      // Responsive font size
      const fontSize = Math.max(
        Math.round(18 * this.scaleFactor),
        12
      );

      // Banner text
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = '#00FF00';
      this.ctx.font = `bold ${fontSize}px "Press Start 2P", monospace`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        this.powerUpBanner.message,
        this.canvasSize.w / 2,
        this.canvasSize.h / 2 + fontSize / 4
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

    // Clean up mobile touch intervals
    this.stopContinuousMovement();

    setTimeout(() => {
      document.location.reload();
    }, 4000);
  },

  // CLEAR SCREEN
  clearScreen() {
    this.ctx.clearRect(0, 0, this.canvasSize.w, this.canvasSize.h);
  },
};
