class SneakDog {
    constructor() {
        // Initialize Telegram WebApp
        this.tg = window.Telegram.WebApp;
        this.tg.ready();
        this.tg.expand();

        // Set up canvas
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Load assets
        this.loadAssets();
        
        // Game state
        this.gameState = 'menu';
        this.score = 0;
        this.coins = parseInt(localStorage.getItem('coins')) || 0;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        
        // Game settings
        this.settings = {
            gravity: 0.8,
            jumpForce: -15,
            gameSpeed: 5,
            obstacleInterval: 1500,
            groundHeight: 100,
            maxSpeed: 12
        };
        
        // Initialize game elements
        this.initializeGameElements();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start game loop
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
        
        // Initial resize
        this.resizeCanvas();
        
        // Show main menu
        this.showMainMenu();
    }
    
    loadAssets() {
        // Load images
        this.sprites = {
            dog: {
                idle: new Image(),
                run: new Image(),
                jump: new Image()
            },
            background: new Image(),
            obstacle: new Image()
        };
        
        this.sprites.dog.idle.src = 'static/images/dog_idle.gif';
        // Add more sprite loading here
    }
    
    initializeGameElements() {
        // Initialize player
        this.player = {
            x: 0,
            y: 0,
            width: 80,
            height: 80,
            velocityY: 0,
            isJumping: false,
            currentSprite: this.sprites.dog.idle
        };
        
        // Initialize game objects
        this.obstacles = [];
        this.coins = [];
        this.powerUps = [];
        
        // Initialize timers
        this.lastObstacleTime = 0;
        this.lastCoinTime = 0;
        
        // Reset player position
        this.resetPlayerPosition();
    }
    
    setupEventListeners() {
        // Menu buttons
        document.getElementById('playButton').addEventListener('click', () => this.startGame());
        document.getElementById('shopButton').addEventListener('click', () => this.showShop());
        document.getElementById('settingsButton').addEventListener('click', () => this.showSettings());
        document.getElementById('restartButton').addEventListener('click', () => this.startGame());
        document.getElementById('menuButton').addEventListener('click', () => this.showMainMenu());
        
        // Game controls
        window.addEventListener('resize', () => this.resizeCanvas());
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleInput();
        });
        this.canvas.addEventListener('click', () => this.handleInput());
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.handleInput();
            }
        });
    }
    
    showMainMenu() {
        this.gameState = 'menu';
        document.getElementById('mainMenu').classList.remove('hidden');
        document.getElementById('gameUI').classList.add('hidden');
        document.getElementById('gameOver').classList.add('hidden');
        
        // Update stats
        document.getElementById('highScore').textContent = this.highScore;
        document.getElementById('coins').textContent = this.coins;
    }
    
    startGame() {
        this.gameState = 'playing';
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('gameUI').classList.remove('hidden');
        document.getElementById('gameOver').classList.add('hidden');
        
        // Reset game state
        this.score = 0;
        this.obstacles = [];
        this.coins = [];
        this.powerUps = [];
        this.settings.gameSpeed = 5;
        
        // Reset player
        this.resetPlayerPosition();
        this.player.velocityY = 0;
        this.player.isJumping = false;
    }
    
    gameOver() {
        this.gameState = 'gameover';
        document.getElementById('gameOver').classList.remove('hidden');
        
        // Update final score
        document.getElementById('finalScore').textContent = this.score;
        
        // Check for new high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
            document.querySelector('.new-highscore').classList.remove('hidden');
        } else {
            document.querySelector('.new-highscore').classList.add('hidden');
        }
    }
    
    resetPlayerPosition() {
        this.player.x = this.canvas.width / 4;
        this.player.y = this.canvas.height - this.settings.groundHeight - this.player.height;
    }
    
    handleInput() {
        if (this.gameState === 'playing' && !this.player.isJumping) {
            this.jump();
        }
    }
    
    jump() {
        this.player.velocityY = this.settings.jumpForce;
        this.player.isJumping = true;
        // Add jump sound here
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Update player
        this.player.velocityY += this.settings.gravity;
        this.player.y += this.player.velocityY;
        
        // Ground collision
        if (this.player.y > this.canvas.height - this.settings.groundHeight - this.player.height) {
            this.player.y = this.canvas.height - this.settings.groundHeight - this.player.height;
            this.player.velocityY = 0;
            this.player.isJumping = false;
        }
        
        // Update obstacles
        this.updateObstacles();
        
        // Update score
        this.score++;
        document.getElementById('currentScore').textContent = this.score;
        
        // Increase difficulty
        this.settings.gameSpeed = Math.min(
            this.settings.maxSpeed,
            5 + (this.score / 1000)
        );
    }
    
    updateObstacles() {
        // Spawn new obstacles
        const currentTime = performance.now();
        if (currentTime - this.lastObstacleTime > this.settings.obstacleInterval) {
            this.obstacles.push({
                x: this.canvas.width,
                y: this.canvas.height - this.settings.groundHeight - 40,
                width: 40,
                height: 40
            });
            this.lastObstacleTime = currentTime;
        }
        
        // Update and check collisions
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
            }
        }
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
        
        // Draw obstacles
        this.obstacles.forEach(obstacle => {
            this.ctx.fillStyle = '#ff4444';
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
        
        // Draw player
        this.ctx.drawImage(
            this.player.currentSprite,
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height
        );
    }
    
    drawBackground() {
        // Draw sky
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw parallax elements
        this.ctx.fillStyle = '#2a2a2a';
        for (let i = 0; i < 3; i++) {
            const x = (this.canvas.width / 4) * i;
            const y = this.canvas.height - this.settings.groundHeight - 100 - (i * 20);
            this.ctx.fillRect(x, y, 60, 100 + (i * 20));
        }
    }
    
    drawGround() {
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(
            0,
            this.canvas.height - this.settings.groundHeight,
            this.canvas.width,
            this.settings.groundHeight
        );
    }
    
    resizeCanvas() {
        const container = document.getElementById('gameContainer');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        // Update ground level and player position
        if (this.player) {
            this.resetPlayerPosition();
        }
    }
    
    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}

// Initialize game when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new SneakDog();
});
