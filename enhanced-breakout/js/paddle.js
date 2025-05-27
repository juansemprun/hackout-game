class Paddle {
  constructor(
    ctx,
    paddlePosX,
    paddlePosY,
    paddleW,
    paddleH,
    canvasSize,
    scaleFactor = 1
  ) {
    this.ctx = ctx;
    this.paddlePos = {
      x: paddlePosX,
      y: paddlePosY,
    };
    this.paddleSize = {
      w: paddleW,
      h: paddleH,
    };
    // Scale paddle velocity based on screen size
    this.paddleVel = Math.max(50 * scaleFactor, 20); // Minimum velocity of 20
    this.canvasSize = canvasSize;
  }

  draw() {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(
      this.paddlePos.x,
      this.paddlePos.y,
      this.paddleSize.w,
      this.paddleSize.h
    );

    this.movePaddle();
  }

  movePaddle(dir) {
    dir === 'left' && this.paddlePos.x > 0
      ? (this.paddlePos.x -= this.paddleVel)
      : null;
    dir === 'right' &&
    this.paddlePos.x < this.canvasSize.w - this.paddleSize.w
      ? (this.paddlePos.x += this.paddleVel)
      : null;
  }
}
