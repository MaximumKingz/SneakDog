class AchievementManager {
    constructor(game) {
        this.game = game;
        this.achievements = this.initializeAchievements();
        this.stats = this.initializeStats();
        this.setupUI();
    }

    initializeAchievements() {
        return {
            firstHeist: {
                id: 'firstHeist',
                name: 'First Heist',
                description: 'Complete your first heist',
                icon: '🎯',
                reward: 100,
                condition: () => this.stats.totalHeists >= 1,
                completed: false
            },
            coinCollector: {
                id: 'coinCollector',
                name: 'Coin Collector',
                description: 'Collect 1000 coins in total',
                icon: '💰',
                reward: 200,
                condition: () => this.stats.totalCoins >= 1000,
                completed: false
            },
            speedDemon: {
                id: 'speedDemon',
                name: 'Speed Demon',
                description: 'Reach maximum speed in a single run',
                icon: '⚡',
                reward: 300,
                condition: () => this.game.settings.gameSpeed >= this.game.settings.maxGameSpeed,
                completed: false
            },
            upgradeMaster: {
                id: 'upgradeMaster',
                name: 'Upgrade Master',
                description: 'Max out any upgrade',
                icon: '⭐',
                reward: 500,
                condition: () => Object.values(this.game.store.items.upgrades)
                    .some(upgrade => upgrade.level >= upgrade.maxLevel),
                completed: false
            },
            characterCollector: {
                id: 'characterCollector',
                name: 'Character Collector',
                description: 'Unlock all characters',
                icon: '👥',
                reward: 1000,
                condition: () => Object.values(this.game.store.items.characters)
                    .every(char => char.unlocked),
                completed: false
            },
            distanceRunner: {
                id: 'distanceRunner',
                name: 'Distance Runner',
                description: 'Travel 10000 meters in total',
                icon: '🏃',
                reward: 400,
                condition: () => this.stats.totalDistance >= 10000,
                completed: false
            },
            powerupPro: {
                id: 'powerupPro',
                name: 'Powerup Pro',
                description: 'Use each type of powerup at least once',
                icon: '🌟',
                reward: 300,
                condition: () => Object.values(this.stats.powerupsUsed).every(count => count > 0),
                completed: false
            }
        };
    }

    initializeStats() {
        return {
            totalHeists: 0,
            totalCoins: 0,
            totalDistance: 0,
            highScore: 0,
            powerupsUsed: {
                magnet: 0,
                shield: 0,
                slowTime: 0
            },
            charactersUnlocked: 0
        };
    }

    setupUI() {
        // Create achievements panel
        const achievementsPanel = document.createElement('div');
        achievementsPanel.id = 'achievementsPanel';
        achievementsPanel.className = 'achievements-panel';
        achievementsPanel.style.display = 'none';

        achievementsPanel.innerHTML = `
            <div class="achievements-header">
                <h2>Achievements</h2>
                <button id="closeAchievements" class="close-button">×</button>
            </div>
            <div class="achievements-content">
                <div class="stats-section">
                    <h3>Statistics</h3>
                    <div class="stats-grid"></div>
                </div>
                <div class="achievements-section">
                    <h3>Achievements</h3>
                    <div class="achievements-grid"></div>
                </div>
            </div>
        `;

        document.body.appendChild(achievementsPanel);

        // Add event listeners
        document.getElementById('closeAchievements').addEventListener('click', 
            () => this.hideAchievements()
        );

        this.updateUI();
    }

    updateStats(gameStats) {
        // Update stats after each game
        this.stats.totalHeists++;
        this.stats.totalCoins += gameStats.coinsCollected;
        this.stats.totalDistance += gameStats.distance;
        this.stats.highScore = Math.max(this.stats.highScore, gameStats.score);

        // Check for new achievements
        this.checkAchievements();
        this.updateUI();
    }

    checkAchievements() {
        Object.values(this.achievements).forEach(achievement => {
            if (!achievement.completed && achievement.condition()) {
                this.unlockAchievement(achievement);
            }
        });
    }

    unlockAchievement(achievement) {
        achievement.completed = true;
        this.game.coins += achievement.reward;
        
        // Show achievement notification
        this.showAchievementNotification(achievement);
        
        // Play sound
        this.game.audio.playSound('unlock');
        
        // Update UI
        this.updateUI();
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <h4>${achievement.name}</h4>
                <p>+${achievement.reward} coins</p>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate notification
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }, 100);
    }

    updateUI() {
        const statsGrid = document.querySelector('.stats-grid');
        statsGrid.innerHTML = `
            <div class="stat-item">
                <div class="stat-label">Total Heists</div>
                <div class="stat-value">${this.stats.totalHeists}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Total Coins</div>
                <div class="stat-value">${this.stats.totalCoins}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Distance Traveled</div>
                <div class="stat-value">${this.stats.totalDistance}m</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">High Score</div>
                <div class="stat-value">${this.stats.highScore}</div>
            </div>
        `;

        const achievementsGrid = document.querySelector('.achievements-grid');
        achievementsGrid.innerHTML = Object.values(this.achievements)
            .map(achievement => `
                <div class="achievement-item ${achievement.completed ? 'completed' : ''}">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-info">
                        <h4>${achievement.name}</h4>
                        <p>${achievement.description}</p>
                        <div class="achievement-reward">
                            ${achievement.completed ? 'Completed' : `Reward: ${achievement.reward} 🪙`}
                        </div>
                    </div>
                </div>
            `).join('');
    }

    showAchievements() {
        document.getElementById('achievementsPanel').style.display = 'block';
        this.updateUI();
    }

    hideAchievements() {
        document.getElementById('achievementsPanel').style.display = 'none';
    }

    // Save/Load progress
    saveProgress() {
        const saveData = {
            stats: this.stats,
            achievements: Object.fromEntries(
                Object.entries(this.achievements)
                    .map(([key, ach]) => [key, ach.completed])
            )
        };
        localStorage.setItem('sneakDogAchievements', JSON.stringify(saveData));
    }

    loadProgress() {
        const saveData = localStorage.getItem('sneakDogAchievements');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.stats = {...this.stats, ...data.stats};
            Object.entries(data.achievements).forEach(([key, completed]) => {
                if (this.achievements[key]) {
                    this.achievements[key].completed = completed;
                }
            });
            this.updateUI();
        }
    }
}
