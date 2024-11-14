class LevelManager {
    constructor(game) {
        this.game = game;
        this.currentLevel = 1;
        this.currentTheme = null;
        this.environments = this.initializeEnvironments();
        this.events = this.initializeEvents();
        this.bosses = this.initializeBosses();
        this.difficultyMultiplier = 1;
        this.lastEventDistance = 0;
        this.eventFrequency = 1000; // Distance between events
        this.bossFrequency = 5000; // Distance between boss encounters
        this.lastBossDistance = 0;
    }

    initializeEnvironments() {
        return {
            city: {
                name: 'City Streets',
                background: '#87CEEB',
                groundColor: '#808080',
                obstacles: [
                    {
                        type: 'hydrant',
                        width: 30,
                        height: 40,
                        color: '#FF0000',
                        frequency: 0.3
                    },
                    {
                        type: 'trash',
                        width: 40,
                        height: 35,
                        color: '#8B4513',
                        frequency: 0.4
                    },
                    {
                        type: 'camera',
                        width: 25,
                        height: 25,
                        color: '#000000',
                        frequency: 0.3
                    }
                ],
                collectibles: ['bone', 'coin', 'hydrant_key'],
                backgroundElements: [
                    {
                        type: 'building',
                        minHeight: 100,
                        maxHeight: 300,
                        width: 80,
                        frequency: 0.2
                    }
                ]
            },
            park: {
                name: 'City Park',
                background: '#90EE90',
                groundColor: '#228B22',
                obstacles: [
                    {
                        type: 'bush',
                        width: 45,
                        height: 35,
                        color: '#228B22',
                        frequency: 0.4
                    },
                    {
                        type: 'bench',
                        width: 60,
                        height: 30,
                        color: '#8B4513',
                        frequency: 0.3
                    },
                    {
                        type: 'squirrel',
                        width: 25,
                        height: 25,
                        color: '#8B4513',
                        frequency: 0.3,
                        moving: true
                    }
                ],
                collectibles: ['bone', 'coin', 'tennis_ball'],
                backgroundElements: [
                    {
                        type: 'tree',
                        minHeight: 150,
                        maxHeight: 250,
                        width: 60,
                        frequency: 0.3
                    }
                ]
            },
            mall: {
                name: 'Shopping Mall',
                background: '#F5F5F5',
                groundColor: '#D3D3D3',
                obstacles: [
                    {
                        type: 'cart',
                        width: 50,
                        height: 40,
                        color: '#C0C0C0',
                        frequency: 0.3
                    },
                    {
                        type: 'guard',
                        width: 30,
                        height: 60,
                        color: '#000080',
                        frequency: 0.3,
                        moving: true
                    },
                    {
                        type: 'plant',
                        width: 35,
                        height: 45,
                        color: '#228B22',
                        frequency: 0.4
                    }
                ],
                collectibles: ['bone', 'coin', 'mall_key'],
                backgroundElements: [
                    {
                        type: 'store',
                        minHeight: 120,
                        maxHeight: 200,
                        width: 100,
                        frequency: 0.25
                    }
                ]
            }
        };
    }

    initializeEvents() {
        return {
            sale_rush: {
                name: 'Mall Sale Rush',
                duration: 20000,
                effects: {
                    coinMultiplier: 2,
                    obstacleSpeed: 1.5
                },
                condition: (env) => env === 'mall'
            },
            squirrel_party: {
                name: 'Squirrel Party',
                duration: 15000,
                effects: {
                    extraObstacles: 'squirrel',
                    coinMultiplier: 1.5
                },
                condition: (env) => env === 'park'
            },
            police_chase: {
                name: 'Police Chase',
                duration: 25000,
                effects: {
                    obstacleSpeed: 2,
                    scoreMultiplier: 3
                },
                condition: (env) => env === 'city'
            }
        };
    }

    initializeBosses() {
        return {
            guard_captain: {
                name: 'Guard Captain',
                health: 100,
                attacks: [
                    {
                        name: 'whistle',
                        damage: 20,
                        pattern: 'summon_guards'
                    },
                    {
                        name: 'chase',
                        damage: 30,
                        pattern: 'direct_pursuit'
                    }
                ],
                rewards: {
                    coins: 500,
                    special_item: 'master_key'
                }
            },
            park_ranger: {
                name: 'Park Ranger',
                health: 120,
                attacks: [
                    {
                        name: 'net_throw',
                        damage: 25,
                        pattern: 'projectile'
                    },
                    {
                        name: 'call_animals',
                        damage: 15,
                        pattern: 'summon_squirrels'
                    }
                ],
                rewards: {
                    coins: 600,
                    special_item: 'ranger_badge'
                }
            },
            security_robot: {
                name: 'Security Robot',
                health: 150,
                attacks: [
                    {
                        name: 'laser_scan',
                        damage: 30,
                        pattern: 'beam'
                    },
                    {
                        name: 'drone_deploy',
                        damage: 20,
                        pattern: 'summon_drones'
                    }
                ],
                rewards: {
                    coins: 750,
                    special_item: 'robot_core'
                }
            }
        };
    }

    generateLevel() {
        // Determine environment based on level
        const environments = Object.keys(this.environments);
        const envIndex = (this.currentLevel - 1) % environments.length;
        this.currentTheme = environments[envIndex];
        const environment = this.environments[this.currentTheme];

        // Calculate difficulty
        this.difficultyMultiplier = 1 + (this.currentLevel - 1) * 0.1;

        return {
            theme: this.currentTheme,
            background: environment.background,
            groundColor: environment.groundColor,
            obstacles: this.generateObstacles(environment),
            collectibles: environment.collectibles,
            backgroundElements: environment.backgroundElements,
            difficulty: this.difficultyMultiplier
        };
    }

    generateObstacles(environment) {
        return environment.obstacles.map(obstacle => ({
            ...obstacle,
            frequency: obstacle.frequency * this.difficultyMultiplier
        }));
    }

    checkForEvent(distance) {
        if (distance - this.lastEventDistance >= this.eventFrequency) {
            const possibleEvents = Object.values(this.events)
                .filter(event => event.condition(this.currentTheme));
            
            if (possibleEvents.length > 0) {
                const event = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
                this.lastEventDistance = distance;
                return event;
            }
        }
        return null;
    }

    checkForBoss(distance) {
        if (distance - this.lastBossDistance >= this.bossFrequency) {
            const bosses = Object.values(this.bosses);
            const boss = bosses[Math.floor(Math.random() * bosses.length)];
            this.lastBossDistance = distance;
            return boss;
        }
        return null;
    }

    startBossFight(boss) {
        this.game.pause();
        // Create boss UI
        const bossUI = document.createElement('div');
        bossUI.className = 'boss-fight';
        bossUI.innerHTML = `
            <div class="boss-header">
                <h2>${boss.name}</h2>
                <div class="boss-health-bar">
                    <div class="health-fill" style="width: 100%"></div>
                </div>
            </div>
            <div class="boss-arena">
                <!-- Boss and player will be rendered here -->
            </div>
        `;
        document.body.appendChild(bossUI);

        // Initialize boss fight mechanics
        this.initializeBossFight(boss);
    }

    initializeBossFight(boss) {
        let bossHealth = boss.health;
        let currentPhase = 0;
        const phases = boss.attacks;

        const bossFightLoop = setInterval(() => {
            // Update boss position and attacks
            this.updateBossFight(boss, currentPhase);

            // Check for hit detection
            if (this.checkBossHit()) {
                bossHealth -= 10;
                this.updateBossHealth(bossHealth, boss.health);
            }

            // Check for phase change
            if (bossHealth <= boss.health * (1 - (currentPhase + 1) / phases.length)) {
                currentPhase++;
            }

            // Check for fight end
            if (bossHealth <= 0) {
                this.endBossFight(boss, true);
                clearInterval(bossFightLoop);
            }
        }, 1000 / 60);
    }

    updateBossFight(boss, phase) {
        const attack = boss.attacks[phase];
        // Implement attack pattern
        switch (attack.pattern) {
            case 'summon_guards':
                this.spawnGuards();
                break;
            case 'direct_pursuit':
                this.pursueBoss();
                break;
            case 'projectile':
                this.throwProjectile();
                break;
            // Add more attack patterns
        }
    }

    updateBossHealth(current, max) {
        const healthBar = document.querySelector('.boss-health-bar .health-fill');
        const percentage = (current / max) * 100;
        healthBar.style.width = `${percentage}%`;
    }

    endBossFight(boss, victory) {
        if (victory) {
            // Give rewards
            this.game.coins += boss.rewards.coins;
            this.game.inventory.addItem(boss.rewards.special_item);
            
            // Show victory screen
            this.showBossRewards(boss.rewards);
        }

        // Clean up boss fight UI
        document.querySelector('.boss-fight').remove();
        this.game.resume();
    }

    showBossRewards(rewards) {
        const rewardScreen = document.createElement('div');
        rewardScreen.className = 'reward-screen';
        rewardScreen.innerHTML = `
            <div class="reward-content">
                <h2>Victory!</h2>
                <div class="rewards-list">
                    <div class="reward-item">
                        <span class="reward-icon">🪙</span>
                        <span class="reward-value">+${rewards.coins}</span>
                    </div>
                    <div class="reward-item">
                        <span class="reward-icon">🎁</span>
                        <span class="reward-value">${rewards.special_item}</span>
                    </div>
                </div>
                <button class="continue-button">Continue</button>
            </div>
        `;

        document.body.appendChild(rewardScreen);
        rewardScreen.querySelector('.continue-button').addEventListener('click', () => {
            rewardScreen.remove();
        });
    }

    // Helper methods for boss fight mechanics
    spawnGuards() {
        // Implement guard spawning logic
    }

    pursueBoss() {
        // Implement boss pursuit logic
    }

    throwProjectile() {
        // Implement projectile throwing logic
    }

    checkBossHit() {
        // Implement hit detection logic
        return Math.random() < 0.1; // Temporary random hit detection
    }
}
