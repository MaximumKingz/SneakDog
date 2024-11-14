class CustomizationManager {
    constructor(game) {
        this.game = game;
        this.equippedItems = new Map();
        this.unlockedItems = new Set();
        this.items = this.initializeItems();
        this.setupUI();
        this.loadProgress();
    }

    initializeItems() {
        return {
            // Hats
            party_hat: {
                id: 'party_hat',
                name: 'Party Hat',
                description: 'A festive party hat',
                type: 'hat',
                icon: '🎉',
                cost: 500,
                rarity: 'common',
                effects: {
                    coin_bonus: 5
                }
            },
            crown: {
                id: 'crown',
                name: 'Royal Crown',
                description: 'A majestic golden crown',
                type: 'hat',
                icon: '👑',
                cost: 2000,
                rarity: 'rare',
                effects: {
                    exp_bonus: 10
                }
            },

            // Accessories
            bowtie: {
                id: 'bowtie',
                name: 'Fancy Bowtie',
                description: 'A stylish bowtie',
                type: 'accessory',
                icon: '🎀',
                cost: 300,
                rarity: 'common',
                effects: {
                    charm: 5
                }
            },
            glasses: {
                id: 'glasses',
                name: 'Cool Shades',
                description: 'Trendy sunglasses',
                type: 'accessory',
                icon: '😎',
                cost: 800,
                rarity: 'uncommon',
                effects: {
                    style: 10
                }
            },

            // Outfits
            ninja_suit: {
                id: 'ninja_suit',
                name: 'Ninja Suit',
                description: 'Stealthy ninja outfit',
                type: 'outfit',
                icon: '🥷',
                cost: 1500,
                rarity: 'rare',
                effects: {
                    stealth: 15,
                    speed: 10
                }
            },
            space_suit: {
                id: 'space_suit',
                name: 'Space Suit',
                description: 'Cosmic space explorer suit',
                type: 'outfit',
                icon: '👨‍🚀',
                cost: 2500,
                rarity: 'epic',
                effects: {
                    jump_height: 20,
                    style: 15
                }
            },

            // Effects
            sparkles: {
                id: 'sparkles',
                name: 'Sparkle Trail',
                description: 'Leave a trail of sparkles',
                type: 'effect',
                icon: '✨',
                cost: 1000,
                rarity: 'uncommon',
                effects: {
                    charm: 10
                }
            },
            rainbow: {
                id: 'rainbow',
                name: 'Rainbow Aura',
                description: 'Emit a rainbow aura',
                type: 'effect',
                icon: '🌈',
                cost: 3000,
                rarity: 'legendary',
                effects: {
                    luck: 20,
                    charm: 15
                }
            }
        };
    }

    setupUI() {
        // Create customization panel
        const customPanel = document.createElement('div');
        customPanel.id = 'customPanel';
        customPanel.className = 'custom-panel';
        customPanel.style.display = 'none';

        customPanel.innerHTML = `
            <div class="custom-header">
                <h2>Character Customization</h2>
                <div class="custom-filters">
                    <button class="filter-button active" data-type="all">All</button>
                    <button class="filter-button" data-type="hat">Hats</button>
                    <button class="filter-button" data-type="accessory">Accessories</button>
                    <button class="filter-button" data-type="outfit">Outfits</button>
                    <button class="filter-button" data-type="effect">Effects</button>
                </div>
                <button id="closeCustom" class="close-button">×</button>
            </div>
            <div class="custom-content">
                <div class="preview-section">
                    <div class="character-preview">
                        <div class="preview-character">
                            🐕
                            ${this.generatePreviewHTML()}
                        </div>
                        <div class="preview-effects">
                            ${this.getEquippedEffect()}
                        </div>
                    </div>
                    <div class="stats-summary">
                        ${this.generateStatsHTML()}
                    </div>
                </div>
                <div class="items-section">
                    <div class="items-grid">
                        ${this.generateItemsHTML('all')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(customPanel);

        // Add event listeners
        document.getElementById('closeCustom').addEventListener('click', 
            () => this.hideCustomization()
        );

        // Filter switching
        customPanel.querySelectorAll('.filter-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchFilter(e.target.dataset.type);
            });
        });

        // Add customization button to game UI
        const customButton = document.createElement('button');
        customButton.id = 'customButton';
        customButton.className = 'game-button';
        customButton.innerHTML = '👔';
        customButton.addEventListener('click', () => this.showCustomization());
        document.body.appendChild(customButton);

        this.updateUI();
    }

    generatePreviewHTML() {
        return ['hat', 'accessory', 'outfit'].map(type => {
            const equippedItem = this.equippedItems.get(type);
            return equippedItem ? `<div class="preview-item ${type}">${this.items[equippedItem].icon}</div>` : '';
        }).join('');
    }

    getEquippedEffect() {
        const effectId = this.equippedItems.get('effect');
        return effectId ? this.items[effectId].icon : '';
    }

    generateStatsHTML() {
        const stats = this.calculateTotalStats();
        return Object.entries(stats).map(([stat, value]) => `
            <div class="stat-item">
                <span class="stat-name">${this.formatStatName(stat)}</span>
                <span class="stat-value">+${value}%</span>
            </div>
        `).join('');
    }

    formatStatName(stat) {
        return stat.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    calculateTotalStats() {
        const stats = {};
        this.equippedItems.forEach(itemId => {
            const item = this.items[itemId];
            Object.entries(item.effects).forEach(([stat, value]) => {
                stats[stat] = (stats[stat] || 0) + value;
            });
        });
        return stats;
    }

    generateItemsHTML(filter) {
        const items = Object.values(this.items)
            .filter(item => filter === 'all' || item.type === filter);

        return items.map(item => {
            const isUnlocked = this.unlockedItems.has(item.id);
            const isEquipped = this.equippedItems.get(item.type) === item.id;

            return `
                <div class="custom-item ${item.rarity} ${isUnlocked ? 'unlocked' : ''} ${isEquipped ? 'equipped' : ''}">
                    <div class="item-icon">${item.icon}</div>
                    <div class="item-info">
                        <h4>${item.name}</h4>
                        <p>${item.description}</p>
                        <div class="item-effects">
                            ${Object.entries(item.effects).map(([stat, value]) => `
                                <div class="effect-item">
                                    ${this.formatStatName(stat)}: +${value}%
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ${isUnlocked ? `
                        <button onclick="customization.toggleItem('${item.id}')"
                                class="equip-button">
                            ${isEquipped ? 'Unequip' : 'Equip'}
                        </button>
                    ` : `
                        <button onclick="customization.unlockItem('${item.id}')"
                                class="unlock-button"
                                ${this.game.coins < item.cost ? 'disabled' : ''}>
                            Unlock (${item.cost} 🪙)
                        </button>
                    `}
                </div>
            `;
        }).join('');
    }

    unlockItem(itemId) {
        const item = this.items[itemId];
        if (!this.unlockedItems.has(itemId) && this.game.coins >= item.cost) {
            this.game.coins -= item.cost;
            this.unlockedItems.add(itemId);
            this.showUnlockAnimation(item);
            this.updateUI();
            this.saveProgress();
        }
    }

    toggleItem(itemId) {
        const item = this.items[itemId];
        const currentEquipped = this.equippedItems.get(item.type);

        if (currentEquipped === itemId) {
            this.equippedItems.delete(item.type);
        } else {
            this.equippedItems.set(item.type, itemId);
        }

        this.updateUI();
        this.saveProgress();
    }

    showUnlockAnimation(item) {
        const animation = document.createElement('div');
        animation.className = 'unlock-animation';
        animation.innerHTML = `
            <div class="unlock-content">
                <div class="item-icon">${item.icon}</div>
                <h3>Item Unlocked!</h3>
                <p>${item.name}</p>
            </div>
        `;

        document.body.appendChild(animation);
        setTimeout(() => animation.remove(), 3000);
    }

    switchFilter(filter) {
        // Update active button
        document.querySelectorAll('.filter-button').forEach(button => {
            button.classList.toggle('active', button.dataset.type === filter);
        });

        // Update items grid
        document.querySelector('.items-grid').innerHTML = this.generateItemsHTML(filter);
    }

    showCustomization() {
        document.getElementById('customPanel').style.display = 'block';
        this.updateUI();
    }

    hideCustomization() {
        document.getElementById('customPanel').style.display = 'none';
    }

    updateUI() {
        const customPanel = document.getElementById('customPanel');
        if (!customPanel) return;

        const previewCharacter = customPanel.querySelector('.preview-character');
        const previewEffects = customPanel.querySelector('.preview-effects');
        const statsSummary = customPanel.querySelector('.stats-summary');
        const itemsGrid = customPanel.querySelector('.items-grid');
        const activeFilter = customPanel.querySelector('.filter-button.active').dataset.type;

        previewCharacter.innerHTML = `🐕${this.generatePreviewHTML()}`;
        previewEffects.innerHTML = this.getEquippedEffect();
        statsSummary.innerHTML = this.generateStatsHTML();
        itemsGrid.innerHTML = this.generateItemsHTML(activeFilter);
    }

    saveProgress() {
        const saveData = {
            equippedItems: Array.from(this.equippedItems.entries()),
            unlockedItems: Array.from(this.unlockedItems)
        };
        localStorage.setItem('sneakDogCustomization', JSON.stringify(saveData));
    }

    loadProgress() {
        const saveData = localStorage.getItem('sneakDogCustomization');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.equippedItems = new Map(data.equippedItems);
            this.unlockedItems = new Set(data.unlockedItems);
        }
        this.updateUI();
    }
}
