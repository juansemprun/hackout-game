class Ball {
  constructor(
    ctx,
    ballPosX,
    ballPosY,
    ballW,
    ballH,
    canvasSize,
    scaleFactor = 1
  ) {
    this.ctx = ctx;
    this.ballPos = {
      x: ballPosX,
      y: ballPosY,
    };
    this.ballSize = {
      w: ballW,
      h: ballH,
    };
    this.ballRadius = this.ballSize.w / 2;

    // Scale velocity based on screen size - smaller screens = slower ball
    const baseVelX = 5;
    const baseVelY = 10;
    this.ballVel = {
      x: Math.max(baseVelX * scaleFactor, 2), // Minimum speed of 2
      y: Math.max(baseVelY * scaleFactor, 3), // Minimum speed of 3
    };
    this.canvasSize = canvasSize;
  }

  draw() {
    this.move();

    this.ctx.fillStyle = 'red';
    this.ctx.beginPath();
    this.ctx.arc(
      this.ballPos.x,
      this.ballPos.y,
      this.ballRadius,
      0,
      Math.PI * 2
    );
    this.ctx.closePath();
    this.ctx.fill();
  }

  move() {
    this.ballPos.x += this.ballVel.x;
    this.ballPos.y += this.ballVel.y;
  }
}
