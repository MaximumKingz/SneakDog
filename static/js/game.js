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
        this.coins = parseInt(localStorage.getItem('coins')) || 0;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        
        // Upgrades
        this.upgrades = {
            jump: {
                level: parseInt(localStorage.getItem('jumpLevel')) || 1,
                cost: 50,
                maxLevel: 5
            },
            doubleJump: {
                level: parseInt(localStorage.getItem('doubleJumpLevel')) || 0,
                cost: 100,
                maxLevel: 1
            },
            magnet: {
                level: parseInt(localStorage.getItem('magnetLevel')) || 0,
                cost: 150,
                maxLevel: 3
            }
        };
        
        // Game settings
        this.settings = {
            gravity: 1.5,
            jumpForce: -20,
            gameSpeed: 8,
            groundHeight: 100,
            obstacleInterval: 1500,
            coinInterval: 1000
        };
        
        // Initialize player
        this.player = {
            x: 100,
            y: 0,
            width: 50,
            height: 50,
            velocityY: 0,
            isJumping: false,
            canDoubleJump: true
        };
        
        // Initialize game objects
        this.obstacles = [];
        this.gameCoins = [];
        this.lastObstacleTime = 0;
        this.lastCoinTime = 0;
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start game loop
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
        
        // Initial setup
        this.resizeCanvas();
        this.updateUpgradeDisplay();
    }
    
    setupEventListeners() {
        // Game controls
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

        // Menu controls
        document.getElementById('menuButton').addEventListener('click', () => {
            if (this.gameState === 'playing') {
                this.gameState = 'paused';
                showMenu();
            }
        });

        document.getElementById('closeMenu').addEventListener('click', () => {
            hideMenu();
            if (this.gameState === 'paused') {
                this.gameState = 'playing';
            }
        });

        // Upgrade buttons
        document.getElementById('jumpUpgrade').addEventListener('click', () => this.purchaseUpgrade('jump'));
        document.getElementById('doubleJumpUpgrade').addEventListener('click', () => this.purchaseUpgrade('doubleJump'));
        document.getElementById('magnetUpgrade').addEventListener('click', () => this.purchaseUpgrade('magnet'));
    }
    
    purchaseUpgrade(type) {
        const upgrade = this.upgrades[type];
        if (this.coins >= upgrade.cost && upgrade.level < upgrade.maxLevel) {
            this.coins -= upgrade.cost;
            upgrade.level++;
            localStorage.setItem('coins', this.coins);
            localStorage.setItem(`${type}Level`, upgrade.level);
            
            // Apply upgrade effects
            if (type === 'jump') {
                this.settings.jumpForce = -20 - (upgrade.level * 2);
            }
            
            this.updateUpgradeDisplay();
        }
    }
    
    updateUpgradeDisplay() {
        // Update coins display
        document.getElementById('coins').textContent = this.coins;
        document.getElementById('highScore').textContent = this.highScore;
        
        // Update upgrade levels
        document.getElementById('jumpLevel').textContent = this.upgrades.jump.level;
        document.getElementById('doubleJumpLevel').textContent = this.upgrades.doubleJump.level;
        document.getElementById('magnetLevel').textContent = this.upgrades.magnet.level;
        
        // Update button states
        const jumpButton = document.getElementById('jumpUpgrade');
        const doubleJumpButton = document.getElementById('doubleJumpUpgrade');
        const magnetButton = document.getElementById('magnetUpgrade');
        
        jumpButton.disabled = this.coins < this.upgrades.jump.cost || this.upgrades.jump.level >= this.upgrades.jump.maxLevel;
        doubleJumpButton.disabled = this.coins < this.upgrades.doubleJump.cost || this.upgrades.doubleJump.level >= this.upgrades.doubleJump.maxLevel;
        magnetButton.disabled = this.coins < this.upgrades.magnet.cost || this.upgrades.magnet.level >= this.upgrades.magnet.maxLevel;
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
        } else if (this.gameState === 'playing') {
            if (!this.player.isJumping) {
                this.jump();
            } else if (this.upgrades.doubleJump.level > 0 && this.player.canDoubleJump) {
                this.jump();
                this.player.canDoubleJump = false;
            }
        } else if (this.gameState === 'gameover') {
            this.resetGame();
        }
    }
    
    jump() {
        this.player.velocityY = this.settings.jumpForce;
        this.player.isJumping = true;
    }
    
    startGame() {
        hideGameOver();
        hideMenu();
        this.gameState = 'playing';
        this.score = 0;
        this.obstacles = [];
        this.gameCoins = [];
        this.settings.gameSpeed = 8;
        this.player.y = this.groundY - this.player.height;
        this.player.velocityY = 0;
        this.player.isJumping = false;
        this.player.canDoubleJump = true;
        document.getElementById('score').textContent = '0';
    }
    
    resetGame() {
        this.gameState = 'menu';
        this.player.y = this.groundY - this.player.height;
        this.player.velocityY = 0;
        this.obstacles = [];
        this.gameCoins = [];
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
    
    spawnCoin() {
        const currentTime = performance.now();
        if (currentTime - this.lastCoinTime > this.settings.coinInterval) {
            const coin = {
                x: this.canvas.width,
                y: this.groundY - this.player.height - Math.random() * 150,
                width: 20,
                height: 20
            };
            
            this.gameCoins.push(coin);
            this.lastCoinTime = currentTime;
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
            this.player.canDoubleJump = true;
        }
        
        // Spawn and update obstacles
        this.spawnObstacle();
        this.spawnCoin();
        
        // Update obstacles and check collisions
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
                document.getElementById('score').textContent = this.score;
                
                // Increase game speed with score
                this.settings.gameSpeed = Math.min(15, 8 + this.score * 0.1);
            }
        }
        
        // Update coins and check collection
        for (let i = this.gameCoins.length - 1; i >= 0; i--) {
            const coin = this.gameCoins[i];
            coin.x -= this.settings.gameSpeed;
            
            // Check coin collection
            const magnetRange = this.upgrades.magnet.level * 50;  // Magnet upgrade effect
            if (this.checkCollision(this.player, coin, magnetRange)) {
                this.gameCoins.splice(i, 1);
                this.coins++;
                localStorage.setItem('coins', this.coins);
                this.updateUpgradeDisplay();
                continue;
            }
            
            // Remove off-screen coins
            if (coin.x + coin.width < 0) {
                this.gameCoins.splice(i, 1);
            }
        }
    }
    
    checkCollision(rect1, rect2, extraRange = 0) {
        return (rect1.x - extraRange) < (rect2.x + rect2.width) &&
               (rect1.x + rect1.width + extraRange) > rect2.x &&
               (rect1.y - extraRange) < (rect2.y + rect2.height) &&
               (rect1.y + rect1.height + extraRange) > rect2.y;
    }
    
    gameOver() {
        this.gameState = 'gameover';
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
            document.getElementById('highScore').textContent = this.highScore;
        }
        showGameOver(this.score);
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
        
        // Draw coins
        this.ctx.fillStyle = '#FFD700';
        this.gameCoins.forEach(coin => {
            this.ctx.beginPath();
            this.ctx.arc(
                coin.x + coin.width/2,
                coin.y + coin.height/2,
                coin.width/2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        });
        
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
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}

function showMenu() {
    document.getElementById('upgradeMenu').classList.add('visible');
}

function hideMenu() {
    document.getElementById('upgradeMenu').classList.remove('visible');
}

function showGameOver(score) {
    const gameMessage = document.getElementById('gameMessage');
    document.getElementById('finalScore').textContent = score;
    gameMessage.classList.remove('hidden');
}

function hideGameOver() {
    document.getElementById('gameMessage').classList.add('hidden');
}

// Initialize game when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new SneakDog();
});
