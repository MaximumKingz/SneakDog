class PetManager {
    constructor(game) {
        this.game = game;
        this.activePet = null;
        this.pets = this.initializePets();
        this.unlockedPets = new Set(['basic_puppy']);
        this.setupUI();
        this.loadProgress();
    }

    initializePets() {
        return {
            basic_puppy: {
                id: 'basic_puppy',
                name: 'Basic Puppy',
                description: 'A loyal companion who helps find coins',
                level: 1,
                maxLevel: 10,
                experience: 0,
                cost: 0,
                icon: '🐕',
                abilities: {
                    coin_finder: {
                        name: 'Coin Finder',
                        description: 'Increases coin spawn rate by {value}%',
                        baseValue: 10,
                        levelMultiplier: 5
                    }
                }
            },
            speed_cat: {
                id: 'speed_cat',
                name: 'Speed Cat',
                description: 'A quick feline that boosts your running speed',
                level: 1,
                maxLevel: 10,
                experience: 0,
                cost: 1000,
                icon: '🐱',
                abilities: {
                    speed_boost: {
                        name: 'Speed Boost',
                        description: 'Increases movement speed by {value}%',
                        baseValue: 5,
                        levelMultiplier: 3
                    }
                }
            },
            shield_turtle: {
                id: 'shield_turtle',
                name: 'Shield Turtle',
                description: 'A protective turtle that helps avoid damage',
                level: 1,
                maxLevel: 10,
                experience: 0,
                cost: 2000,
                icon: '🐢',
                abilities: {
                    damage_shield: {
                        name: 'Damage Shield',
                        description: 'Reduces damage taken by {value}%',
                        baseValue: 10,
                        levelMultiplier: 4
                    }
                }
            },
            lucky_rabbit: {
                id: 'lucky_rabbit',
                name: 'Lucky Rabbit',
                description: 'A fortunate rabbit that brings better rewards',
                level: 1,
                maxLevel: 10,
                experience: 0,
                cost: 3000,
                icon: '🐰',
                abilities: {
                    luck_boost: {
                        name: 'Luck Boost',
                        description: 'Increases rare item drop rate by {value}%',
                        baseValue: 5,
                        levelMultiplier: 3
                    }
                }
            },
            power_hamster: {
                id: 'power_hamster',
                name: 'Power Hamster',
                description: 'A strong hamster that enhances power-ups',
                level: 1,
                maxLevel: 10,
                experience: 0,
                cost: 4000,
                icon: '🐹',
                abilities: {
                    powerup_boost: {
                        name: 'Power-up Master',
                        description: 'Increases power-up duration by {value}%',
                        baseValue: 10,
                        levelMultiplier: 5
                    }
                }
            }
        };
    }

    setupUI() {
        // Create pets panel
        const petsPanel = document.createElement('div');
        petsPanel.id = 'petsPanel';
        petsPanel.className = 'pets-panel';
        petsPanel.style.display = 'none';

        petsPanel.innerHTML = `
            <div class="pets-header">
                <h2>Pet Companions</h2>
                <button id="closePets" class="close-button">×</button>
            </div>
            <div class="pets-content">
                <div class="active-pet">
                    ${this.activePet ? this.generateActivePetHTML() : '<p>No active pet</p>'}
                </div>
                <div class="pets-list">
                    ${this.generatePetsListHTML()}
                </div>
            </div>
        `;

        document.body.appendChild(petsPanel);

        // Add event listeners
        document.getElementById('closePets').addEventListener('click', 
            () => this.hidePets()
        );

        // Add pet button to game UI
        const petButton = document.createElement('button');
        petButton.id = 'petButton';
        petButton.className = 'game-button';
        petButton.innerHTML = '🐾';
        petButton.addEventListener('click', () => this.showPets());
        document.body.appendChild(petButton);

        this.updateUI();
    }

    generateActivePetHTML() {
        const pet = this.pets[this.activePet];
        if (!pet) return '<p>No active pet</p>';

        return `
            <div class="active-pet-card">
                <div class="pet-icon">${pet.icon}</div>
                <div class="pet-info">
                    <h3>${pet.name}</h3>
                    <p>${pet.description}</p>
                    <div class="pet-level">
                        Level ${pet.level}/${pet.maxLevel}
                        <div class="experience-bar">
                            <div class="experience-fill" style="width: ${this.getExperiencePercentage(pet)}%"></div>
                        </div>
                    </div>
                    <div class="pet-abilities">
                        ${this.generateAbilitiesHTML(pet)}
                    </div>
                </div>
            </div>
        `;
    }

    generatePetsListHTML() {
        return Object.values(this.pets).map(pet => `
            <div class="pet-list-item ${this.unlockedPets.has(pet.id) ? 'unlocked' : 'locked'} ${pet.id === this.activePet ? 'active' : ''}">
                <div class="pet-icon">${pet.icon}</div>
                <div class="pet-info">
                    <h4>${pet.name}</h4>
                    <p>${pet.description}</p>
                    ${this.unlockedPets.has(pet.id) ? 
                        `<button onclick="petManager.selectPet('${pet.id}')" class="select-pet-btn">
                            ${pet.id === this.activePet ? 'Active' : 'Select'}
                        </button>` :
                        `<button onclick="petManager.unlockPet('${pet.id}')" class="unlock-pet-btn">
                            Unlock (${pet.cost} 🪙)
                        </button>`
                    }
                </div>
            </div>
        `).join('');
    }

    generateAbilitiesHTML(pet) {
        return Object.values(pet.abilities).map(ability => `
            <div class="ability-item">
                <h4>${ability.name}</h4>
                <p>${this.formatAbilityDescription(ability, pet.level)}</p>
            </div>
        `).join('');
    }

    formatAbilityDescription(ability, level) {
        const value = ability.baseValue + (level - 1) * ability.levelMultiplier;
        return ability.description.replace('{value}', value);
    }

    getExperiencePercentage(pet) {
        const levelExp = this.getExperienceForLevel(pet.level);
        const nextLevelExp = this.getExperienceForLevel(pet.level + 1);
        const currentExp = pet.experience - levelExp;
        const requiredExp = nextLevelExp - levelExp;
        return (currentExp / requiredExp) * 100;
    }

    getExperienceForLevel(level) {
        return Math.floor(100 * Math.pow(level, 1.5));
    }

    selectPet(petId) {
        if (this.unlockedPets.has(petId)) {
            this.activePet = petId;
            this.updateUI();
            this.saveProgress();
        }
    }

    unlockPet(petId) {
        const pet = this.pets[petId];
        if (pet && !this.unlockedPets.has(petId) && this.game.coins >= pet.cost) {
            this.game.coins -= pet.cost;
            this.unlockedPets.add(petId);
            this.showUnlockAnimation(pet);
            this.updateUI();
            this.saveProgress();
        }
    }

    showUnlockAnimation(pet) {
        const unlockAnimation = document.createElement('div');
        unlockAnimation.className = 'pet-unlock-animation';
        unlockAnimation.innerHTML = `
            <div class="unlock-content">
                <div class="pet-icon">${pet.icon}</div>
                <h3>New Pet Unlocked!</h3>
                <p>${pet.name}</p>
            </div>
        `;

        document.body.appendChild(unlockAnimation);
        setTimeout(() => unlockAnimation.remove(), 3000);
    }

    gainExperience(amount) {
        if (!this.activePet) return;

        const pet = this.pets[this.activePet];
        if (pet.level >= pet.maxLevel) return;

        pet.experience += amount;

        // Check for level up
        while (pet.level < pet.maxLevel && 
               pet.experience >= this.getExperienceForLevel(pet.level + 1)) {
            pet.level++;
            this.showLevelUpAnimation(pet);
        }

        this.updateUI();
        this.saveProgress();
    }

    showLevelUpAnimation(pet) {
        const levelUpAnimation = document.createElement('div');
        levelUpAnimation.className = 'pet-level-up-animation';
        levelUpAnimation.innerHTML = `
            <div class="level-up-content">
                <div class="pet-icon">${pet.icon}</div>
                <h3>${pet.name} Level Up!</h3>
                <p>Level ${pet.level}</p>
            </div>
        `;

        document.body.appendChild(levelUpAnimation);
        setTimeout(() => levelUpAnimation.remove(), 3000);
    }

    getActiveAbilityValue(abilityName) {
        if (!this.activePet) return 0;

        const pet = this.pets[this.activePet];
        const ability = pet.abilities[abilityName];
        if (!ability) return 0;

        return ability.baseValue + (pet.level - 1) * ability.levelMultiplier;
    }

    showPets() {
        document.getElementById('petsPanel').style.display = 'block';
        this.updateUI();
    }

    hidePets() {
        document.getElementById('petsPanel').style.display = 'none';
    }

    updateUI() {
        const petsPanel = document.getElementById('petsPanel');
        if (!petsPanel) return;

        const activePetSection = petsPanel.querySelector('.active-pet');
        const petsListSection = petsPanel.querySelector('.pets-list');

        activePetSection.innerHTML = this.generateActivePetHTML();
        petsListSection.innerHTML = this.generatePetsListHTML();
    }

    saveProgress() {
        const saveData = {
            activePet: this.activePet,
            unlockedPets: Array.from(this.unlockedPets),
            pets: this.pets
        };
        localStorage.setItem('sneakDogPets', JSON.stringify(saveData));
    }

    loadProgress() {
        const saveData = localStorage.getItem('sneakDogPets');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.activePet = data.activePet;
            this.unlockedPets = new Set(data.unlockedPets);
            this.pets = data.pets;
        }
        this.updateUI();
    }
}
