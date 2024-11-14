class SneakDog {
    constructor() {
        // Initialize Telegram WebApp
        this.tg = window.Telegram.WebApp;
        this.tg.ready();
        this.tg.expand();

        // Set up canvas
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.gameState = 'menu';
        this.score = 0;
        this.highScore = localStorage.getItem('highScore') || 0;
        
        // Game settings
        this.settings = {
            gravity: 0.8,
            jumpForce: -15,
            gameSpeed: 5,
            obstacleInterval: 1500,
            groundHeight: 100
        };
        
        // Initialize game elements
        this.player = {
            x: 0,
            y: 0,
            width: 50,
            height: 50,
            velocityY: 0,
            isJumping: false,
            sprite: new Image()
        };
        this.player.sprite.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyBAMAAADsEZWCAAAAG1BMVEUAAAAnJSU2MzNGQ0NVUVFkYGBza2uCfX2RjIy4PjLzAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAQklEQVQ4jWNgQAX8DAzMDKhgAQMDEwM6YELXwshAHBCBaoABQQwxKMAMxAJBqAaYQBTDAkGYQBTDAkGYQBTDAkEA8xw50eBN9SkAAAAASUVORK5CYII=';
        
        this.obstacles = [];
        this.lastObstacleTime = 0;
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start game loop
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
        
        // Initial resize
        this.resizeCanvas();
    }
    
    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleInput();
        });
        
        // Mouse events
        this.canvas.addEventListener('click', () => this.handleInput());
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.handleInput();
            }
        });
    }
    
    resizeCanvas() {
        const container = document.getElementById('gameContainer');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        // Update ground level
        this.groundY = this.canvas.height - this.settings.groundHeight;
        
        // Update player position
        if (this.gameState === 'menu') {
            this.resetPlayerPosition();
        }
    }
    
    resetPlayerPosition() {
        this.player.x = this.canvas.width / 4;
        this.player.y = this.groundY - this.player.height;
    }
    
    handleInput() {
        switch (this.gameState) {
            case 'menu':
                this.startGame();
                break;
            case 'playing':
                this.jump();
                break;
            case 'gameover':
                this.resetGame();
                break;
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.obstacles = [];
        this.resetPlayerPosition();
        this.settings.gameSpeed = 5;
    }
    
    jump() {
        if (!this.player.isJumping) {
            this.player.velocityY = this.settings.jumpForce;
            this.player.isJumping = true;
        }
    }
    
    spawnObstacle() {
        const currentTime = performance.now();
        if (currentTime - this.lastObstacleTime > this.settings.obstacleInterval) {
            const obstacle = {
                x: this.canvas.width,
                y: this.groundY - 40,
                width: 30,
                height: 40
            };
            this.obstacles.push(obstacle);
            this.lastObstacleTime = currentTime;
        }
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Update player
        this.player.velocityY += this.settings.gravity;
        this.player.y += this.player.velocityY;
        
        // Ground collision
        if (this.player.y > this.groundY - this.player.height) {
            this.player.y = this.groundY - this.player.height;
            this.player.velocityY = 0;
            this.player.isJumping = false;
        }
        
        // Spawn and update obstacles
        this.spawnObstacle();
        
        // Update obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.x -= this.settings.gameSpeed;
            
            // Check collision
            if (this.checkCollision(this.player, obstacle)) {
                this.gameOver();
                return;
            }
            
            // Remove off-screen obstacles
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(i, 1);
                this.score++;
                
                // Update high score
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    localStorage.setItem('highScore', this.highScore);
                }
            }
        }
        
        // Increase game speed
        this.settings.gameSpeed += 0.001;
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw ground
        this.drawGround();
        
        // Draw player
        this.ctx.drawImage(
            this.player.sprite,
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height
        );
        
        // Draw obstacles
        this.obstacles.forEach(obstacle => {
            this.ctx.fillStyle = '#ff4444';
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
        
        // Draw UI
        this.drawUI();
    }
    
    drawBackground() {
        this.ctx.fillStyle = '#1e1e1e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add some parallax background elements
        this.ctx.fillStyle = '#2a2a2a';
        for (let i = 0; i < 3; i++) {
            const x = (this.canvas.width / 4) * i;
            const y = this.groundY - 100 - (i * 20);
            this.ctx.fillRect(x, y, 60, 100 + (i * 20));
        }
    }
    
    drawGround() {
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);
    }
    
    drawUI() {
        // Update score display
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('highScore').textContent = `High Score: ${this.highScore}`;
        
        if (this.gameState === 'menu') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Tap to Start', this.canvas.width / 2, this.canvas.height / 2);
            
        } else if (this.gameState === 'gameover') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2 - 30);
            this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
            this.ctx.font = '20px Arial';
            this.ctx.fillText('Tap to Restart', this.canvas.width / 2, this.canvas.height / 2 + 50);
        }
    }
    
    gameLoop(timestamp) {
        // Calculate delta time
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // Update and draw
        this.update(deltaTime);
        this.draw();
        
        // Continue loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    gameOver() {
        this.gameState = 'gameover';
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
        }
    }
    
    resetGame() {
        this.gameState = 'menu';
        this.resetPlayerPosition();
        this.obstacles = [];
        this.score = 0;
        this.settings.gameSpeed = 5;
    }
}

// Initialize game when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new SneakDog();
});
