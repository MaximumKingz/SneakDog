// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;

class SneakDog {
    constructor() {
        console.log('Game initializing...');
        
        // Initialize Telegram WebApp
        tg.ready();
        tg.expand();
        
        // Initialize game elements
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.gameState = 'menu';
        this.score = 0;
        this.coins = 0;
        
        // Debug info
        console.log('Canvas size:', this.canvas.width, this.canvas.height);
        
        // Initialize game
        this.init();
    }
    
    init() {
        console.log('Initializing game...');
        
        // Set canvas size
        this.resizeCanvas();
        
        // Set up event listeners
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Set up controls
        this.setupControls();
        
        // Start game loop
        this.gameLoop();
    }
    
    resizeCanvas() {
        const container = document.getElementById('gameContainer');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        // Set ground level
        this.groundLevel = this.canvas.height - 100;
        
        console.log('Canvas resized:', this.canvas.width, this.canvas.height);
    }
    
    setupControls() {
        console.log('Setting up controls...');
        
        // Touch controls
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            console.log('Touch event detected');
            this.handleInput();
        });
        
        // Mouse controls
        this.canvas.addEventListener('click', () => {
            console.log('Click event detected');
            this.handleInput();
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                console.log('Keyboard event detected');
                this.handleInput();
            }
        });
    }
    
    handleInput() {
        console.log('Input handled, game state:', this.gameState);
        if (this.gameState === 'menu') {
            this.startGame();
        } else if (this.gameState === 'playing') {
            this.jump();
        } else if (this.gameState === 'gameover') {
            this.resetGame();
        }
    }
    
    startGame() {
        console.log('Starting game...');
        this.gameState = 'playing';
        this.score = 0;
        this.coins = 0;
        
        // Initialize player
        this.player = {
            x: this.canvas.width / 4,
            y: this.groundLevel - 50,
            width: 50,
            height: 50,
            speed: 5,
            isJumping: false,
            jumpForce: 15,
            gravity: 0.8,
            velocityY: 0
        };
    }
    
    jump() {
        if (!this.player.isJumping) {
            console.log('Jump!');
            this.player.velocityY = -this.player.jumpForce;
            this.player.isJumping = true;
        }
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Update player
        this.player.velocityY += this.player.gravity;
        this.player.y += this.player.velocityY;
        
        // Ground collision
        if (this.player.y > this.groundLevel - this.player.height) {
            this.player.y = this.groundLevel - this.player.height;
            this.player.velocityY = 0;
            this.player.isJumping = false;
        }
        
        // Update score
        this.score++;
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background (simple rectangle for now)
        this.ctx.fillStyle = '#87CEEB'; // Sky blue
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw ground
        this.ctx.fillStyle = '#8B4513'; // Saddle brown
        this.ctx.fillRect(0, this.groundLevel, this.canvas.width, this.canvas.height - this.groundLevel);
        
        if (this.gameState === 'menu') {
            // Draw menu screen
            this.ctx.fillStyle = '#000';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Tap to Start', this.canvas.width / 2, this.canvas.height / 2);
            
        } else if (this.gameState === 'playing') {
            // Draw player
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillRect(
                this.player.x,
                this.player.y,
                this.player.width,
                this.player.height
            );
            
            // Draw score
            this.ctx.fillStyle = '#000';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`Score: ${this.score}`, 20, 30);
            
        } else if (this.gameState === 'gameover') {
            // Draw game over screen
            this.ctx.fillStyle = '#000';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
            this.ctx.fillText('Tap to Restart', this.canvas.width / 2, this.canvas.height / 2 + 80);
        }
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    resetGame() {
        console.log('Resetting game...');
        this.gameState = 'menu';
        this.score = 0;
    }
}

// Initialize game when document is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Document ready, initializing game...');
    window.game = new SneakDog();
});
