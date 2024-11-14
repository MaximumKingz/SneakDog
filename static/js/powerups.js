class PowerupManager {
    constructor(game) {
        this.game = game;
        this.activePowerups = new Map();
        this.cooldowns = new Map();
        this.powerups = this.initializePowerups();
        this.setupUI();
        this.startUpdateLoop();
    }

    initializePowerups() {
        return {
            speed_boost: {
                id: 'speed_boost',
                name: 'Speed Boost',
                description: 'Temporarily increases movement speed',
                icon: '⚡',
                duration: 10000, // 10 seconds
                cooldown: 30000, // 30 seconds
                effect: {
                    type: 'speed',
                    multiplier: 1.5
                },
                color: '#FFC107'
            },
            double_jump: {
                id: 'double_jump',
                name: 'Double Jump',
                description: 'Enables double jumping',
                icon: '🦘',
                duration: 15000,
                cooldown: 45000,
                effect: {
                    type: 'jump',
                    count: 2
                },
                color: '#4CAF50'
            },
            magnet: {
                id: 'magnet',
                name: 'Coin Magnet',
                description: 'Attracts nearby coins',
                icon: '🧲',
                duration: 8000,
                cooldown: 25000,
                effect: {
                    type: 'attract',
                    radius: 100
                },
                color: '#2196F3'
            },
            shield: {
                id: 'shield',
                name: 'Shield',
                description: 'Protects from damage',
                icon: '🛡️',
                duration: 12000,
                cooldown: 40000,
                effect: {
                    type: 'invincible',
                    hits: 1
                },
                color: '#9C27B0'
            },
            time_slow: {
                id: 'time_slow',
                name: 'Time Slow',
                description: 'Slows down time',
                icon: '⏰',
                duration: 5000,
                cooldown: 35000,
                effect: {
                    type: 'time',
                    multiplier: 0.5
                },
                color: '#FF5722'
            },
            ghost: {
                id: 'ghost',
                name: 'Ghost Mode',
                description: 'Pass through obstacles',
                icon: '👻',
                duration: 6000,
                cooldown: 50000,
                effect: {
                    type: 'phase',
                    collision: false
                },
                color: '#607D8B'
            }
        };
    }

    setupUI() {
        const powerupContainer = document.querySelector('.powerup-container');
        
        // Create powerup buttons
        Object.values(this.powerups).forEach(powerup => {
            const button = document.createElement('button');
            button.id = `powerup-${powerup.id}`;
            button.className = 'powerup-button';
            button.innerHTML = `
                <div class="powerup-icon">${powerup.icon}</div>
                <div class="powerup-cooldown"></div>
                <div class="powerup-duration"></div>
            `;
            button.style.setProperty('--powerup-color', powerup.color);
            
            // Tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'powerup-tooltip';
            tooltip.innerHTML = `
                <h4>${powerup.name}</h4>
                <p>${powerup.description}</p>
                <div class="powerup-stats">
                    <div>Duration: ${powerup.duration / 1000}s</div>
                    <div>Cooldown: ${powerup.cooldown / 1000}s</div>
                </div>
            `;
            button.appendChild(tooltip);

            button.addEventListener('click', () => this.activatePowerup(powerup.id));
            powerupContainer.appendChild(button);
        });
    }

    activatePowerup(powerupId) {
        const powerup = this.powerups[powerupId];
        const now = Date.now();

        // Check cooldown
        if (this.cooldowns.has(powerupId)) {
            const cooldownEnd = this.cooldowns.get(powerupId);
            if (now < cooldownEnd) return;
        }

        // Start powerup
        this.activePowerups.set(powerupId, {
            startTime: now,
            endTime: now + powerup.duration
        });

        // Set cooldown
        this.cooldowns.set(powerupId, now + powerup.cooldown);

        // Apply effect
        this.applyPowerupEffect(powerup);

        // Show activation animation
        this.showActivationAnimation(powerup);

        // Update UI
        this.updatePowerupButton(powerupId);
    }

    deactivatePowerup(powerupId) {
        const powerup = this.powerups[powerupId];
        this.activePowerups.delete(powerupId);
        
        // Remove effect
        this.removePowerupEffect(powerup);

        // Update UI
        this.updatePowerupButton(powerupId);
    }

    applyPowerupEffect(powerup) {
        switch (powerup.effect.type) {
            case 'speed':
                this.game.player.speed *= powerup.effect.multiplier;
                break;
            case 'jump':
                this.game.player.maxJumps = powerup.effect.count;
                break;
            case 'attract':
                this.game.player.attractRadius = powerup.effect.radius;
                break;
            case 'invincible':
                this.game.player.shield = powerup.effect.hits;
                break;
            case 'time':
                this.game.timeScale = powerup.effect.multiplier;
                break;
            case 'phase':
                this.game.player.collision = powerup.effect.collision;
                break;
        }
    }

    removePowerupEffect(powerup) {
        switch (powerup.effect.type) {
            case 'speed':
                this.game.player.speed /= powerup.effect.multiplier;
                break;
            case 'jump':
                this.game.player.maxJumps = 1;
                break;
            case 'attract':
                this.game.player.attractRadius = 0;
                break;
            case 'invincible':
                this.game.player.shield = 0;
                break;
            case 'time':
                this.game.timeScale = 1;
                break;
            case 'phase':
                this.game.player.collision = true;
                break;
        }
    }

    updatePowerupButton(powerupId) {
        const button = document.getElementById(`powerup-${powerupId}`);
        const powerup = this.powerups[powerupId];
        const now = Date.now();

        // Update cooldown display
        if (this.cooldowns.has(powerupId)) {
            const cooldownEnd = this.cooldowns.get(powerupId);
            if (now < cooldownEnd) {
                const remaining = (cooldownEnd - now) / powerup.cooldown;
                button.querySelector('.powerup-cooldown').style.height = `${remaining * 100}%`;
                button.classList.add('on-cooldown');
            } else {
                button.querySelector('.powerup-cooldown').style.height = '0%';
                button.classList.remove('on-cooldown');
            }
        }

        // Update duration display
        if (this.activePowerups.has(powerupId)) {
            const { endTime } = this.activePowerups.get(powerupId);
            const remaining = (endTime - now) / powerup.duration;
            button.querySelector('.powerup-duration').style.width = `${remaining * 100}%`;
            button.classList.add('active');
        } else {
            button.querySelector('.powerup-duration').style.width = '0%';
            button.classList.remove('active');
        }
    }

    showActivationAnimation(powerup) {
        const animation = document.createElement('div');
        animation.className = 'powerup-activation';
        animation.innerHTML = `
            <div class="activation-content" style="--powerup-color: ${powerup.color}">
                <div class="powerup-icon">${powerup.icon}</div>
                <h3>${powerup.name} Activated!</h3>
            </div>
        `;

        document.body.appendChild(animation);
        setTimeout(() => animation.remove(), 2000);
    }

    startUpdateLoop() {
        setInterval(() => {
            const now = Date.now();

            // Check active powerups
            this.activePowerups.forEach((timing, powerupId) => {
                if (now >= timing.endTime) {
                    this.deactivatePowerup(powerupId);
                }
                this.updatePowerupButton(powerupId);
            });

            // Update cooldowns
            this.cooldowns.forEach((endTime, powerupId) => {
                this.updatePowerupButton(powerupId);
            });
        }, 100); // Update every 100ms
    }

    // Helper method to check if a powerup is active
    isPowerupActive(powerupId) {
        return this.activePowerups.has(powerupId);
    }

    // Helper method to get remaining duration
    getRemainingDuration(powerupId) {
        if (!this.activePowerups.has(powerupId)) return 0;
        const { endTime } = this.activePowerups.get(powerupId);
        return Math.max(0, endTime - Date.now());
    }

    // Helper method to get remaining cooldown
    getRemainingCooldown(powerupId) {
        if (!this.cooldowns.has(powerupId)) return 0;
        return Math.max(0, this.cooldowns.get(powerupId) - Date.now());
    }
}
