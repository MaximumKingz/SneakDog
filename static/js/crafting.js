class CraftingManager {
    constructor(game) {
        this.game = game;
        this.inventory = new Map();
        this.recipes = this.initializeRecipes();
        this.setupUI();
        this.loadProgress();
    }

    initializeRecipes() {
        return {
            speed_boost: {
                name: 'Speed Boost',
                description: 'Temporarily increases movement speed',
                icon: '⚡',
                ingredients: [
                    { item: 'energy_crystal', count: 2 },
                    { item: 'swift_feather', count: 1 }
                ],
                result: {
                    type: 'powerup',
                    duration: 15000,
                    effect: 'speed',
                    multiplier: 1.5
                }
            },
            shield_potion: {
                name: 'Shield Potion',
                description: 'Provides temporary invincibility',
                icon: '🛡️',
                ingredients: [
                    { item: 'protection_gem', count: 2 },
                    { item: 'magic_essence', count: 1 }
                ],
                result: {
                    type: 'powerup',
                    duration: 10000,
                    effect: 'shield',
                    multiplier: 1
                }
            },
            coin_magnet: {
                name: 'Coin Magnet',
                description: 'Attracts nearby coins',
                icon: '🧲',
                ingredients: [
                    { item: 'magnetic_ore', count: 2 },
                    { item: 'gold_dust', count: 1 }
                ],
                result: {
                    type: 'powerup',
                    duration: 20000,
                    effect: 'magnet',
                    range: 100
                }
            },
            double_jump: {
                name: 'Double Jump Boots',
                description: 'Allows performing a double jump',
                icon: '👢',
                ingredients: [
                    { item: 'cloud_essence', count: 2 },
                    { item: 'spring_core', count: 1 }
                ],
                result: {
                    type: 'equipment',
                    slot: 'boots',
                    effect: 'double_jump'
                }
            },
            lucky_charm: {
                name: 'Lucky Charm',
                description: 'Increases rare item drop rate',
                icon: '🍀',
                ingredients: [
                    { item: 'fortune_crystal', count: 2 },
                    { item: 'rainbow_shard', count: 1 }
                ],
                result: {
                    type: 'equipment',
                    slot: 'accessory',
                    effect: 'luck',
                    multiplier: 1.25
                }
            }
        };
    }

    setupUI() {
        // Create crafting panel
        const craftingPanel = document.createElement('div');
        craftingPanel.id = 'craftingPanel';
        craftingPanel.className = 'crafting-panel';
        craftingPanel.style.display = 'none';

        craftingPanel.innerHTML = `
            <div class="crafting-header">
                <h2>Crafting</h2>
                <button id="closeCrafting" class="close-button">×</button>
            </div>
            <div class="crafting-content">
                <div class="inventory-section">
                    <h3>Inventory</h3>
                    <div class="inventory-grid">
                        ${this.generateInventoryHTML()}
                    </div>
                </div>
                <div class="recipes-section">
                    <h3>Recipes</h3>
                    <div class="recipes-list">
                        ${this.generateRecipesHTML()}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(craftingPanel);

        // Add event listeners
        document.getElementById('closeCrafting').addEventListener('click', 
            () => this.hideCrafting()
        );

        // Add crafting button to game UI
        const craftingButton = document.createElement('button');
        craftingButton.id = 'craftingButton';
        craftingButton.className = 'game-button';
        craftingButton.innerHTML = '⚒️';
        craftingButton.addEventListener('click', () => this.showCrafting());
        document.body.appendChild(craftingButton);

        this.updateUI();
    }

    generateInventoryHTML() {
        if (this.inventory.size === 0) {
            return '<div class="empty-inventory">No items in inventory</div>';
        }

        return Array.from(this.inventory.entries()).map(([item, count]) => `
            <div class="inventory-slot" data-item="${item}">
                <div class="item-icon">${this.getItemIcon(item)}</div>
                <div class="item-count">${count}</div>
                <div class="item-tooltip">
                    <h4>${this.getItemName(item)}</h4>
                    <p>${this.getItemDescription(item)}</p>
                </div>
            </div>
        `).join('');
    }

    generateRecipesHTML() {
        return Object.entries(this.recipes).map(([id, recipe]) => `
            <div class="recipe-item ${this.canCraft(recipe) ? 'available' : 'unavailable'}">
                <div class="recipe-icon">${recipe.icon}</div>
                <div class="recipe-info">
                    <h4>${recipe.name}</h4>
                    <p>${recipe.description}</p>
                    <div class="recipe-ingredients">
                        ${recipe.ingredients.map(ing => `
                            <div class="ingredient ${this.hasIngredient(ing) ? 'has' : 'missing'}">
                                <span class="ingredient-icon">${this.getItemIcon(ing.item)}</span>
                                <span class="ingredient-count">${this.getInventoryCount(ing.item)}/${ing.count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <button 
                    onclick="craftingManager.craft('${id}')"
                    class="craft-button"
                    ${this.canCraft(recipe) ? '' : 'disabled'}
                >
                    Craft
                </button>
            </div>
        `).join('');
    }

    getItemIcon(itemId) {
        const icons = {
            energy_crystal: '💎',
            swift_feather: '🪶',
            protection_gem: '💠',
            magic_essence: '✨',
            magnetic_ore: '🧲',
            gold_dust: '✨',
            cloud_essence: '☁️',
            spring_core: '🔩',
            fortune_crystal: '💎',
            rainbow_shard: '🌈'
        };
        return icons[itemId] || '❓';
    }

    getItemName(itemId) {
        const names = {
            energy_crystal: 'Energy Crystal',
            swift_feather: 'Swift Feather',
            protection_gem: 'Protection Gem',
            magic_essence: 'Magic Essence',
            magnetic_ore: 'Magnetic Ore',
            gold_dust: 'Gold Dust',
            cloud_essence: 'Cloud Essence',
            spring_core: 'Spring Core',
            fortune_crystal: 'Fortune Crystal',
            rainbow_shard: 'Rainbow Shard'
        };
        return names[itemId] || 'Unknown Item';
    }

    getItemDescription(itemId) {
        const descriptions = {
            energy_crystal: 'A crystal pulsing with pure energy',
            swift_feather: 'A feather that grants incredible speed',
            protection_gem: 'A gem that provides magical protection',
            magic_essence: 'Pure magical energy in crystalline form',
            magnetic_ore: 'Ore with powerful magnetic properties',
            gold_dust: 'Magical dust that attracts valuable items',
            cloud_essence: 'The essence of clouds, light as air',
            spring_core: 'A mechanical core with bouncy properties',
            fortune_crystal: 'A crystal that brings good fortune',
            rainbow_shard: 'A shard containing prismatic energy'
        };
        return descriptions[itemId] || 'A mysterious item';
    }

    addItem(itemId, count = 1) {
        const currentCount = this.inventory.get(itemId) || 0;
        this.inventory.set(itemId, currentCount + count);
        this.showItemAnimation(itemId, count);
        this.updateUI();
        this.saveProgress();
    }

    removeItem(itemId, count = 1) {
        const currentCount = this.inventory.get(itemId) || 0;
        if (currentCount >= count) {
            this.inventory.set(itemId, currentCount - count);
            if (this.inventory.get(itemId) === 0) {
                this.inventory.delete(itemId);
            }
            this.updateUI();
            this.saveProgress();
            return true;
        }
        return false;
    }

    showItemAnimation(itemId, count) {
        const animation = document.createElement('div');
        animation.className = 'item-pickup-animation';
        animation.innerHTML = `
            <div class="pickup-content">
                <div class="item-icon">${this.getItemIcon(itemId)}</div>
                <div class="pickup-text">+${count}</div>
            </div>
        `;

        document.body.appendChild(animation);
        setTimeout(() => animation.remove(), 2000);
    }

    canCraft(recipe) {
        return recipe.ingredients.every(ing => 
            (this.inventory.get(ing.item) || 0) >= ing.count
        );
    }

    hasIngredient(ingredient) {
        return (this.inventory.get(ingredient.item) || 0) >= ingredient.count;
    }

    getInventoryCount(itemId) {
        return this.inventory.get(itemId) || 0;
    }

    craft(recipeId) {
        const recipe = this.recipes[recipeId];
        if (!recipe || !this.canCraft(recipe)) return;

        // Remove ingredients
        recipe.ingredients.forEach(ing => {
            this.removeItem(ing.item, ing.count);
        });

        // Add crafted item to game
        if (recipe.result.type === 'powerup') {
            this.game.addPowerup(recipe.result);
        } else if (recipe.result.type === 'equipment') {
            this.game.equipItem(recipe.result);
        }

        this.showCraftAnimation(recipe);
        this.updateUI();
    }

    showCraftAnimation(recipe) {
        const animation = document.createElement('div');
        animation.className = 'craft-animation';
        animation.innerHTML = `
            <div class="craft-content">
                <div class="recipe-icon">${recipe.icon}</div>
                <h3>Item Crafted!</h3>
                <p>${recipe.name}</p>
            </div>
        `;

        document.body.appendChild(animation);
        setTimeout(() => animation.remove(), 3000);
    }

    showCrafting() {
        document.getElementById('craftingPanel').style.display = 'block';
        this.updateUI();
    }

    hideCrafting() {
        document.getElementById('craftingPanel').style.display = 'none';
    }

    updateUI() {
        const craftingPanel = document.getElementById('craftingPanel');
        if (!craftingPanel) return;

        const inventoryGrid = craftingPanel.querySelector('.inventory-grid');
        const recipesList = craftingPanel.querySelector('.recipes-list');

        inventoryGrid.innerHTML = this.generateInventoryHTML();
        recipesList.innerHTML = this.generateRecipesHTML();
    }

    saveProgress() {
        const saveData = {
            inventory: Array.from(this.inventory.entries())
        };
        localStorage.setItem('sneakDogCrafting', JSON.stringify(saveData));
    }

    loadProgress() {
        const saveData = localStorage.getItem('sneakDogCrafting');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.inventory = new Map(data.inventory);
        }
        this.updateUI();
    }
}
