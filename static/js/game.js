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
        this.coins = 0;
        
        // Game settings
        this.settings = {
            gravity: 1.5,
            jumpForce: -20,
            gameSpeed: 8,
            groundHeight: 100,
            obstacleInterval: 1500
        };
        
        // Initialize player
        this.player = {
            x: 100,
            y: 0,
            width: 50,
            height: 50,
            velocityY: 0,
            isJumping: false
        };
        
        // Initialize game objects
        this.obstacles = [];
        this.lastObstacleTime = 0;
        
        // Set up event listeners
        window.addEventListener('resize', () => this.resizeCanvas());
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.handleInput();
            }
        });
        this.canvas.addEventListener('click', () => this.handleInput());
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleInput();
        });
        
        // Start game loop
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
        
        // Initial setup
        this.resizeCanvas();
        this.resetGame();
    }
    
    resizeCanvas() {
        const container = document.getElementById('gameContainer');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        // Update ground level
        this.groundY = this.canvas.height - this.settings.groundHeight;
        
        // Reset player position
        if (this.player) {
            this.player.y = this.groundY - this.player.height;
        }
    }
    
    handleInput() {
        if (this.gameState === 'menu') {
            this.startGame();
        } else if (this.gameState === 'playing' && !this.player.isJumping) {
            this.jump();
        } else if (this.gameState === 'gameover') {
            this.resetGame();
        }
    }
    
    jump() {
        this.player.velocityY = this.settings.jumpForce;
        this.player.isJumping = true;
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.obstacles = [];
        this.settings.gameSpeed = 8;
        this.player.y = this.groundY - this.player.height;
        this.player.velocityY = 0;
    }
    
    resetGame() {
        this.gameState = 'menu';
        this.player.y = this.groundY - this.player.height;
        this.player.velocityY = 0;
        this.obstacles = [];
        this.score = 0;
    }
    
    spawnObstacle() {
        const currentTime = performance.now();
        if (currentTime - this.lastObstacleTime > this.settings.obstacleInterval) {
            const obstacle = {
                x: this.canvas.width,
                width: 50,
                height: 50
            };
            
            // Randomly choose between ground and air obstacles
            if (Math.random() < 0.3) {  // 30% chance for air obstacle
                obstacle.y = this.groundY - this.player.height - 100;  // Above jump height
                obstacle.height = 40;
            } else {
                obstacle.y = this.groundY - obstacle.height;
            }
            
            this.obstacles.push(obstacle);
            this.lastObstacleTime = currentTime;
            
            // Decrease interval as score increases (make game harder)
            this.settings.obstacleInterval = Math.max(800, 1500 - this.score * 10);
        }
    }
    
    update() {
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
        
        // Update obstacles and check collisions
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.x -= this.settings.gameSpeed;
            
            // Check collision
            if (this.checkCollision(this.player, obstacle)) {
                this.gameState = 'gameover';
                return;
            }
            
            // Remove off-screen obstacles and increase score
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(i, 1);
                this.score++;
                
                // Increase game speed with score
                this.settings.gameSpeed = Math.min(15, 8 + this.score * 0.1);
            }
        }
    }
    
    checkCollision(player, obstacle) {
        return player.x < obstacle.x + obstacle.width &&
               player.x + player.width > obstacle.x &&
               player.y < obstacle.y + obstacle.height &&
               player.y + player.height > obstacle.y;
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw sky
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw ground
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);
        
        // Draw player
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw obstacles
        this.ctx.fillStyle = '#333';
        this.obstacles.forEach(obstacle => {
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
        
        // Draw score
        this.ctx.fillStyle = '#000';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 20, 40);
        
        // Draw game state messages
        if (this.gameState === 'menu') {
            this.ctx.fillStyle = '#000';
            this.ctx.font = '36px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Tap to Start', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Jump over obstacles!', this.canvas.width / 2, this.canvas.height / 2 + 40);
        } else if (this.gameState === 'gameover') {
            this.ctx.fillStyle = '#000';
            this.ctx.font = '36px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
            this.ctx.fillText('Tap to Play Again', this.canvas.width / 2, this.canvas.height / 2 + 80);
        }
        
        // Reset text alignment
        this.ctx.textAlign = 'left';
    }
    
    gameLoop(timestamp) {
        // Calculate delta time
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}

// Initialize game when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new SneakDog();
});
