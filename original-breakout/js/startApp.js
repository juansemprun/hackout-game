const breakOutGame = {
    name: 'break out game',
    authors:  'Ana Bermúdez, Cecilia Moreira, Juan Semprún',
    version: '1.0.0',
    license: undefined,
    description: 'Proyecto 1, Canvas game',
    canvasId: undefined,
    ctx: undefined,
    lifes: 3,
    score: 0,
    canvasSize: {
        w: undefined,
        h: undefined
    },
    keycode : {
        left: 37,
        right: 39,
        enter: 13
    },
    isPlaying: false,
    paddle: undefined,
    paddleSize :{
        w: 200,
        h: 20
    },
    paddlePos : {
        x: undefined,
        y: undefined
    },
    ball: undefined, 
    ballSize : {
        w: 30,
        h: 30
    },
    ballRadius: undefined,
    brickSize: {
        w: 105,
        h: 30
    },
    brickPos : {
        x: 0,
        y: 0
    },
    bricks: [],
    brickRows: 7,
    brickColumns: 9,
    powerUp: undefined,
    powerUpsArray: [{  
        x: undefined, 
        y: undefined,
        type: undefined
    }], 
    powerUpSize: {
        w: 35,
        h: 35
    },
    powerUpType: ['smallPaddle', 'bigPaddle','fastBall', 'crazyKeys'],

    // INITIALIZE THE GAME
    init(id){
        this.canvasId = id
        this.ctx = document.getElementById(this.canvasId).getContext('2d')
        this.setDimensions()
        this.createBricksArray()
        this.reset()
        this.setEventListener()  
        this.soundManagement()
    },

    // DIMENSIONS FOR THE CANVAS
    setDimensions() {

        const divSize = document.querySelector('#game-board')
        
        document.getElementById(this.canvasId).setAttribute('width', 1000)
        document.getElementById(this.canvasId).setAttribute('height', window.innerHeight)

        this.canvasSize = {
            w: 1000,
            h: window.innerHeight
        } 

    },

    // COMMANDS
    setEventListener() {
                
        document.onkeydown = e => {
            
            e.keyCode === this.keycode.left ? this.paddle.movePaddle('left') : null
            e.keyCode === this.keycode.right ? this.paddle.movePaddle('right') : null

            // PAUSE / START
            if (e.keyCode === this.keycode.enter && this.isPlaying === false) {
                this.start()
                this.isPlaying = true
            } else if (e.keyCode === this.keycode.enter && this.isPlaying === true) {
                
                this.pause()

                this.isPlaying = false
            } 

        }
    },

    // RESET THE GAME
    reset() {

        this.drawBackground()

        const centerX = (this.canvasSize.w / 2) - (this.paddleSize.w / 2)
        const centerY = (this.canvasSize.h - 50)

        this.paddle = new Paddle(this.ctx, centerX, centerY, this.paddleSize.w, this.paddleSize.h, this.canvasSize)
        this.ball = new Ball(this.ctx, centerX + (this.paddleSize.w / 2), this.canvasSize.h / 2, this.ballSize.w, this.ballSize.h, this.canvasSize)
        this.powerUp = new PowerUps(this.ctx, this.paddleSize.w, this.paddleSize.h, this.ballSize.w, this.ballSize.h,this.canvasSize )

        this.ball.draw()
        this.paddle.draw()
        this.drawBricks()
    },
 
    // START THE GAME
    start(){

        this.setEventListener()

        this.interval = setInterval(() => {

            this.clearScreen()
            this.drawAll()
            this.drawBricks()
            this.isCollision()
            
         }, 20)
        
    },

     // PAUSE THE GAME
    pause() {

        clearInterval(this.interval)
        
    },
    
    // SOUND MANAGEMENT
    soundManagement() {

        const soundNode = document.querySelector('#sound')

        soundNode.addEventListener('click', audioManager)

        function audioManager() {

            let imgSrc = soundNode.getAttribute('src')

            let soundImg = imgSrc == './img/volume-on.png' ? './img/volume-off.png' : './img/volume-on.png'

            soundNode.setAttribute('src', soundImg)
            
            // MUTE AND UNMUTE SOUNDS
            wall_hit.muted = wall_hit.muted ? false : true
            paddle_hit.muted = paddle_hit.muted ? false : true
            brick_hit.muted = brick_hit.muted ? false : true
            life_lost.muted = life_lost.muted ? false : true
            power_up.muted = power_up.muted ? false : true
            win.muted = win.muted ? false : true
            lose.muted = lose.muted ? false : true
            
        }

    },

    setScore() {

        let scoreNode = document.querySelector('.score span')
           
        this.score += 10
        this.score < 100 ? scoreNode.innerText = '0' + this.score : scoreNode.innerText = this.score
        
        if (this.lifes === 0) {

            this.score = 0
            scoreNode.innerText = '000'

        }
        
    },

    // BACKGROUND
    drawBackground() {
        
        this.ctx.lineWidth = 5
        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(0, 0, this.canvasSize.w, this.canvasSize.h)
        this.ctx.strokeStyle = "white"
        this.ctx.strokeRect(0, 0, this.canvasSize.w, this.canvasSize.h)
        
    },

    // CREATE ARRAY OF BRICKS
    createBricksArray() {

        for (let c = 0; c < this.brickColumns; c++) {
            
            this.bricks[c] = []
    
            for (let r = 0; r < this.brickRows; r++) {

               this.bricks[c][r] = {x: 0, y: 0, status: true, power: false}
               
            }
           
        }
        
        // Generate random powerups location
        for (let i = 0; i < this.brickColumns; i++) {
             
            let columnIndex = Math.floor(Math.random() * (this.brickColumns - 1))
            let rowIndex = Math.floor(Math.random() * (this.brickRows - 1)) + 1
            
           if (this.bricks[columnIndex][rowIndex].power === true) {
              
                null
              
           } else {
               
                this.bricks[columnIndex][rowIndex].power = true
                 
           }
        }
    },

    // DRAW BRICKS WALL
    drawBricks() {
        
        for (let c = 0; c < this.brickColumns; c++) {

            for (let r = 1; r < this.brickRows; r++) {
                  
                if (this.bricks[c][r].status) {

                    this.brickPos.x = c * (this.brickSize.h + 80) + 7  // Add space between columns
                    this.brickPos.y = r * (this.brickSize.w - 70)  // Add space between rows
                    this.bricks[c][r].x = this.brickPos.x
                    this.bricks[c][r].y =  this.brickPos.y

                    switch (r) {
                        case 1:
                            this.ctx.fillStyle = '#FF00BF'
                        break
                        case 2: 
                            this.ctx.fillStyle = '#ffff00'
                        break
                        case 3: 
                            this.ctx.fillStyle = '#0000ff'
                        break
                        case 4:
                            this.ctx.fillStyle = '#FF0000'
                        break
                        case 5:
                            this.ctx.fillStyle = '#00FF00'
                            break
                        case 6:
                                this.ctx.fillStyle = '#ff8000'
                        break
                    }

                    this.ctx.strokeStyle = "black"
                    this.ctx.strokeRect(this.brickPos.x, this.brickPos.y, this.brickSize.w, this.brickSize.h)
                    this.ctx.fillRect(this.brickPos.x, this.brickPos.y, this.brickSize.w, this.brickSize.h)
                
                }
                
            }
        }
        
    },

    // DRAW POWER-UPS
    drawPowerUps() {

        for (let i = 0; i < this.powerUpsArray.length; i++) {
            
            if (i === 0) {

                null

            } else {
                  
                let powerUpPosX = this.powerUpsArray[i].x + (this.brickSize.w / 2 - this.powerUpSize.w/2)
                let powerUpPosY = this.powerUpsArray[i].y + this.brickSize.h
                let randomType = Math.floor(Math.random() * this.powerUpType.length)
                
                this.powerUpsArray[i].type = this.powerUpType[randomType]

                this.powerUp.draw(powerUpPosX, powerUpPosY)
                
                this.powerUpsArray[i].y += this.powerUp.gravity

                this.isPowerUpCollision(powerUpPosX, powerUpPosY)
            } 
        }
       
    },

    // DRAW THE BOARD
    drawAll() {

        this.drawBackground()
        this.paddle.draw()
        this.ball.draw()
        this.drawPowerUps()
        
    },

    // CHECK BOUNDERIES
    setBounderies() {

        // Up and down bounderies
        if (this.ball.ballPos.y - this.ball.ballRadius < 0) {

            wall_hit.play()
            this.ball.ballVel.y *= -1

        } else if (this.ball.ballPos.y + this.ball.ballRadius >= this.canvasSize.h) {

            this.lifeCounter()

        }

        // Right and left boundaries
        if (this.ball.ballPos.x - this.ball.ballRadius < this.canvasSize.w - this.canvasSize.w || this.ball.ballPos.x + this.ball.ballRadius > this.canvasSize.w) {

            wall_hit.play()
            this.ball.ballVel.x *= -1

        } else {

            null

        }

    },

    // CHECK COLLISIONS
    isPaddleCollision() {

        if (this.ball.ballPos.y + this.ball.ballRadius > this.paddle.paddlePos.y &&
            this.ball.ballPos.y - this.ball.ballRadius < this.paddle.paddlePos.y + this.paddle.paddleSize.h &&
            this.ball.ballPos.x + this.ball.ballRadius > this.paddle.paddlePos.x &&
            this.ball.ballPos.x - this.ball.ballRadius < this.paddle.paddlePos.x + this.paddle.paddleSize.w) {

                if (this.ball.ballPos.y + this.ball.ballRadius > this.paddle.paddlePos.y + this.paddle.paddleSize.h) {
                    this.ball.ballVel.y *= 2
                    
                }
   
            this.ball.ballVel.y *= -1
            paddle_hit.play()
            
        } 
        
    },

    isBrickCollision() {
        
        for(let c = 0; c < this.brickColumns; c++) {

            for(let r = 1; r < this.brickRows; r++) {

             let b = this.bricks[c][r]

              if (b.status) { 

                if (this.ball.ballPos.y + this.ball.ballRadius > b.y &&
                    this.ball.ballPos.y - this.ball.ballRadius < b.y + this.brickSize.h &&
                    this.ball.ballPos.x + this.ball.ballRadius > b.x &&
                    this.ball.ballPos.x - this.ball.ballRadius < b.x + this.brickSize.w) {

                    this.ball.ballVel.y *= -1
                    b.status = false
                    
                    brick_hit.play()
                    this.setScore()
                    this.isWin()
                    
                    if (b.power) {
                                                  
                        this.powerUpsArray.push({x: b.x, y: b.y})
                        
                    }
                }

              }
            
            }
        }
    },

    isPowerUpCollision(powerUpPosX, powerUpPosY) {

        for (let i = 0; i < this.powerUpsArray.length; i++) {

            if (i === 0) {

                null

            } else {
        
                if (powerUpPosX + this.powerUpSize.w > this.paddle.paddlePos.x &&
                    powerUpPosX < this.paddle.paddlePos.x + this.paddle.paddleSize.w &&
                    powerUpPosY + this.powerUpSize.h > this.paddle.paddlePos.y) {

                    power_up.play()
                    this.setPowerUp(this.powerUpsArray[i].type)
                    this.powerUpsArray.splice(i, 1)
                    
                } else if ( powerUpPosY + this.powerUpSize.h > this.canvasSize.h) {
                    
                    this.powerUpsArray.splice(i, 1)
                    
                }
            }
        } 
    },

    setPowerUp(type) {

        const paddleRealSize = this.paddleSize.w
        const ballRealVel = this.ball.ballVel.y
       
        switch (type) {
          case 'bigPaddle':
            this.paddle.paddleSize.w *= 2
            break
            case 'smallPaddle':
            this.paddle.paddleSize.w /= 2
            break
          case 'fastBall':
            this.ball.ballVel.y *= 2
            break
          case 'crazyKeys':
              this.keycode.left = 39
              this.keycode.right = 37
        }
        
        setTimeout(() => {
            
            this.paddle.paddleSize.w = paddleRealSize
            this.ball.ballVel.y = ballRealVel
            this.keycode.left = 37
            this.keycode.right = 39

        }, 5000)
    
    },

    isCollision() {

        this.setBounderies()
        this.isPaddleCollision()
        this.isBrickCollision()

    },
 
    // LOSE LIFE
    isLose() {

        if (this.lifes > 0) {
            
            life_lost.play()
            
            this.ball.ballPos.x = (this.canvasSize.w / 2)
            this.ball.ballPos.y = (this.canvasSize.h / 2)

            this.paddle.paddlePos.x = (this.canvasSize.w / 2) - (this.paddleSize.w / 2)
            this.paddle.paddlePos.y = (this.canvasSize.h - 70)

        } else {

            this.gameOver('lose')

        }

    },

    // LIFE COUNTER
    lifeCounter() {

        this.lifes--
        this.isLose()

        // Update HTML deleting the heart
        const lifeNode = document.querySelectorAll('.life')
        lifeNode[this.lifes].style.opacity = '0'

    },

    // WIN
    isWin() { 

        let unifiedBricksArray = this.bricks.flat()
        let trueBricks = unifiedBricksArray.filter(element => element.status === true && element.y > 0)

        if (trueBricks.length === 0) {

            this.gameOver('win')

        }

    },
    
    // POP UPS GAME OVER/WIN
    banner(status) {

        const gameOverNode = document.querySelector('.gameover')

        if (status === 'win') {

            const youWinNode = document.querySelector('.you-win')
            
            // If win
            gameOverNode.classList.add('visible')
            youWinNode.classList.remove('hide')   
            win.play()

        } else {

            const youLoseNode = document.querySelector('.you-lose')
            
            // If lose
            gameOverNode.classList.add('visible')
            youLoseNode.classList.remove('hide') 
            lose.play()

        }

    },

    // GAMEOVER
    gameOver(status) {
                
        this.banner(status)

        clearInterval(this.interval)
        
        setTimeout(() => {
            
            document.location.reload()

        }, 4000)
        
    },

    // CLEAR SCREEN 
    clearScreen() {
        
        this.ctx.clearRect(0, 0, this.canvasSize.w, this.canvasSize.h)
        
    },

}
