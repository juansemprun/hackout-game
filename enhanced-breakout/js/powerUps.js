class PowerUps {

    constructor(ctx, paddleSizeW, paddleSizeH, ballSizeW, ballSizeH, canvasSize) {

        this.ctx = ctx
        this.paddleSize = {
            w: paddleSizeW,
            h: paddleSizeH
        }
        this.ballSize = {
            w: ballSizeW,
            h: ballSizeH
        }
        this.powerUpPos = {
            x: undefined,
            y: undefined
        }
        this.powerUpSize = {
            w: 30,
            h: 30
        }
        this.powerUpVel = {
            x: 0,
            y: 5
        }
        this.gravity = 5
        this.canvasSize = canvasSize

        this.imageName = 'box.png'
        this.imageInstance = undefined 

        this.init()
        
    }

    init() {

       this.imageInstance = new Image()
       this.imageInstance.src = `./img/${this.imageName}`

    }

    draw(x, y) {
        
        this.ctx.drawImage(this.imageInstance, x, y, this.powerUpSize.w, this.powerUpSize.h)
        
    }

}   