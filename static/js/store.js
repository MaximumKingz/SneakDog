class GameStore {
    constructor(game) {
        this.game = game;
        this.isOpen = false;
        this.currentTab = 'powerups';
        this.items = this.initializeItems();
        this.setupStoreUI();
    }

    initializeItems() {
        return {
            powerups: {
                magnet: {
                    name: 'Coin Magnet',
                    description: 'Automatically attracts nearby coins',
                    basePrice: 100,
                    level: 1,
                    maxLevel: 5,
                    duration: 5000,
                    active: false,
                    icon: '🧲',
                    getPrice: (level) => Math.floor(100 * Math.pow(1.5, level - 1)),
                    getEffect: (level) => ({
                        radius: 50 + (level * 20),
                        duration: 5000 + (level * 1000)
                    })
                },
                shield: {
                    name: 'Shield',
                    description: 'Protects from one hit',
                    basePrice: 150,
                    level: 1,
                    maxLevel: 3,
                    duration: 8000,
                    active: false,
                    icon: '🛡️',
                    getPrice: (level) => Math.floor(150 * Math.pow(1.8, level - 1)),
                    getEffect: (level) => ({
                        duration: 8000 + (level * 2000),
                        hits: level
                    })
                },
                slowTime: {
                    name: 'Time Slow',
                    description: 'Slows down obstacles',
                    basePrice: 200,
                    level: 1,
                    maxLevel: 4,
                    duration: 6000,
                    active: false,
                    icon: '⏰',
                    getPrice: (level) => Math.floor(200 * Math.pow(1.6, level - 1)),
                    getEffect: (level) => ({
                        slowFactor: 0.7 - (level * 0.1),
                        duration: 6000 + (level * 1000)
                    })
                }
            },
            upgrades: {
                jumpBoost: {
                    name: 'Jump Boost',
                    description: 'Increases jump height',
                    basePrice: 300,
                    level: 1,
                    maxLevel: 5,
                    icon: '⬆️',
                    getPrice: (level) => Math.floor(300 * Math.pow(1.7, level - 1)),
                    getEffect: (level) => ({
                        jumpForce: 15 + (level * 2)
                    })
                },
                coinValue: {
                    name: 'Coin Value',
                    description: 'Increases coins value',
                    basePrice: 250,
                    level: 1,
                    maxLevel: 5,
                    icon: '💰',
                    getPrice: (level) => Math.floor(250 * Math.pow(1.6, level - 1)),
                    getEffect: (level) => ({
                        multiplier: 1 + (level * 0.2)
                    })
                },
                speedMaster: {
                    name: 'Speed Master',
                    description: 'Better control at high speeds',
                    basePrice: 400,
                    level: 1,
                    maxLevel: 3,
                    icon: '🏃',
                    getPrice: (level) => Math.floor(400 * Math.pow(2, level - 1)),
                    getEffect: (level) => ({
                        controlBonus: level * 0.2
                    })
                }
            },
            characters: {
                ninja: {
                    name: 'Ninja Dog',
                    description: 'Stealthy and quick',
                    price: 1000,
                    unlocked: false,
                    icon: '🥷',
                    effects: {
                        jumpBonus: 1.2,
                        speedBonus: 1.1
                    }
                },
                spy: {
                    name: 'Spy Dog',
                    description: 'Better at collecting coins',
                    price: 1500,
                    unlocked: false,
                    icon: '🕵️',
                    effects: {
                        coinBonus: 1.3
                    }
                },
                robot: {
                    name: 'Robo Dog',
                    description: 'More durable',
                    price: 2000,
                    unlocked: false,
                    icon: '🤖',
                    effects: {
                        shieldBonus: 1.5
                    }
                }
            }
        };
    }

    setupStoreUI() {
        // Create store container
        const storeContainer = document.createElement('div');
        storeContainer.id = 'storeContainer';
        storeContainer.className = 'store-container';
        storeContainer.style.display = 'none';

        // Create store content
        storeContainer.innerHTML = `
            <div class="store-header">
                <h2>Store</h2>
                <button id="closeStore" class="close-button">×</button>
            </div>
            <div class="store-tabs">
                <button class="tab-button active" data-tab="powerups">Power-ups</button>
                <button class="tab-button" data-tab="upgrades">Upgrades</button>
                <button class="tab-button" data-tab="characters">Characters</button>
            </div>
            <div class="store-content">
                <div id="powerupsTab" class="tab-content active"></div>
                <div id="upgradesTab" class="tab-content"></div>
                <div id="charactersTab" class="tab-content"></div>
            </div>
        `;

        document.body.appendChild(storeContainer);

        // Add event listeners
        document.getElementById('closeStore').addEventListener('click', () => this.closeStore());
        
        // Tab switching
        const tabs = document.querySelectorAll('.tab-button');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        this.updateStoreContent();
    }

    updateStoreContent() {
        // Update powerups tab
        const powerupsTab = document.getElementById('powerupsTab');
        powerupsTab.innerHTML = this.generatePowerupsHTML();

        // Update upgrades tab
        const upgradesTab = document.getElementById('upgradesTab');
        upgradesTab.innerHTML = this.generateUpgradesHTML();

        // Update characters tab
        const charactersTab = document.getElementById('charactersTab');
        charactersTab.innerHTML = this.generateCharactersHTML();

        // Add purchase event listeners
        this.setupPurchaseButtons();
    }

    generatePowerupsHTML() {
        return Object.entries(this.items.powerups).map(([id, item]) => `
            <div class="store-item">
                <div class="item-icon">${item.icon}</div>
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <p>Level: ${item.level}/${item.maxLevel}</p>
                </div>
                <button class="buy-button" data-type="powerup" data-id="${id}"
                    ${item.level >= item.maxLevel ? 'disabled' : ''}>
                    ${item.level >= item.maxLevel ? 'MAX' : `${item.getPrice(item.level)} 🪙`}
                </button>
            </div>
        `).join('');
    }

    generateUpgradesHTML() {
        return Object.entries(this.items.upgrades).map(([id, item]) => `
            <div class="store-item">
                <div class="item-icon">${item.icon}</div>
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <p>Level: ${item.level}/${item.maxLevel}</p>
                </div>
                <button class="buy-button" data-type="upgrade" data-id="${id}"
                    ${item.level >= item.maxLevel ? 'disabled' : ''}>
                    ${item.level >= item.maxLevel ? 'MAX' : `${item.getPrice(item.level)} 🪙`}
                </button>
            </div>
        `).join('');
    }

    generateCharactersHTML() {
        return Object.entries(this.items.characters).map(([id, item]) => `
            <div class="store-item">
                <div class="item-icon">${item.icon}</div>
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                </div>
                <button class="buy-button" data-type="character" data-id="${id}"
                    ${item.unlocked ? 'disabled' : ''}>
                    ${item.unlocked ? 'OWNED' : `${item.price} 🪙`}
                </button>
            </div>
        `).join('');
    }

    setupPurchaseButtons() {
        const buttons = document.querySelectorAll('.buy-button');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                const id = e.target.dataset.id;
                this.purchaseItem(type, id);
            });
        });
    }

    purchaseItem(type, id) {
        let item;
        let price;

        switch(type) {
            case 'powerup':
                item = this.items.powerups[id];
                price = item.getPrice(item.level);
                if (this.game.coins >= price && item.level < item.maxLevel) {
                    this.game.coins -= price;
                    item.level++;
                    this.game.updateUI();
                }
                break;

            case 'upgrade':
                item = this.items.upgrades[id];
                price = item.getPrice(item.level);
                if (this.game.coins >= price && item.level < item.maxLevel) {
                    this.game.coins -= price;
                    item.level++;
                    this.applyUpgrade(id);
                    this.game.updateUI();
                }
                break;

            case 'character':
                item = this.items.characters[id];
                price = item.price;
                if (this.game.coins >= price && !item.unlocked) {
                    this.game.coins -= price;
                    item.unlocked = true;
                    this.game.updateUI();
                }
                break;
        }

        this.updateStoreContent();
    }

    applyUpgrade(id) {
        const upgrade = this.items.upgrades[id];
        const effect = upgrade.getEffect(upgrade.level);

        switch(id) {
            case 'jumpBoost':
                this.game.player.jumpForce = effect.jumpForce;
                break;
            case 'coinValue':
                this.game.coinMultiplier = effect.multiplier;
                break;
            case 'speedMaster':
                this.game.player.controlBonus = effect.controlBonus;
                break;
        }
    }

    activatePowerup(id) {
        const powerup = this.items.powerups[id];
        if (powerup.active) return;

        powerup.active = true;
        const effect = powerup.getEffect(powerup.level);

        switch(id) {
            case 'magnet':
                this.game.magnetRadius = effect.radius;
                setTimeout(() => {
                    this.game.magnetRadius = 0;
                    powerup.active = false;
                }, effect.duration);
                break;

            case 'shield':
                this.game.player.shield = effect.hits;
                setTimeout(() => {
                    this.game.player.shield = 0;
                    powerup.active = false;
                }, effect.duration);
                break;

            case 'slowTime':
                this.game.timeSlowFactor = effect.slowFactor;
                setTimeout(() => {
                    this.game.timeSlowFactor = 1;
                    powerup.active = false;
                }, effect.duration);
                break;
        }
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tab);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tab}Tab`);
        });
    }

    openStore() {
        this.isOpen = true;
        this.game.pause();
        document.getElementById('storeContainer').style.display = 'block';
        this.updateStoreContent();
    }

    closeStore() {
        this.isOpen = false;
        document.getElementById('storeContainer').style.display = 'none';
        this.game.resume();
    }
}
