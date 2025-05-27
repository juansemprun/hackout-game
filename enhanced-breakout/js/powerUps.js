class PowerUps {
  constructor(
    ctx,
    paddleSizeW,
    paddleSizeH,
    ballSizeW,
    ballSizeH,
    canvasSize,
    powerUpSize = { w: 30, h: 30 },
    scaleFactor = 1
  ) {
    this.ctx = ctx;
    this.paddleSize = {
      w: paddleSizeW,
      h: paddleSizeH,
    };
    this.ballSize = {
      w: ballSizeW,
      h: ballSizeH,
    };
    this.powerUpPos = {
      x: undefined,
      y: undefined,
    };
    this.powerUpSize = powerUpSize;
    this.powerUpVel = {
      x: 0,
      y: Math.max(5 * scaleFactor, 2), // Scale gravity/velocity
    };
    this.gravity = Math.max(5 * scaleFactor, 2); // Scale gravity
    this.canvasSize = canvasSize;

    this.imageName = 'box.png';
    this.imageInstance = undefined;

    this.init();
  }

  init() {
    this.imageInstance = new Image();
    this.imageInstance.src = `./img/${this.imageName}`;
  }

  draw(x, y) {
    this.ctx.drawImage(
      this.imageInstance,
      x,
      y,
      this.powerUpSize.w,
      this.powerUpSize.h
    );
  }
}
