class SkillManager {
    constructor(game) {
        this.game = game;
        this.skillPoints = 0;
        this.unlockedSkills = new Set();
        this.skillLevels = new Map();
        this.skillTree = this.initializeSkillTree();
        this.setupUI();
        this.loadProgress();
    }

    initializeSkillTree() {
        return {
            // Movement Skills
            agility: {
                name: 'Agility',
                description: 'Increase movement speed by {value}%',
                icon: '🏃',
                maxLevel: 5,
                baseValue: 5,
                levelMultiplier: 3,
                cost: 1,
                requirements: [],
                category: 'movement'
            },
            double_jump: {
                name: 'Double Jump',
                description: 'Perform a second jump in mid-air',
                icon: '⬆️',
                maxLevel: 1,
                baseValue: 1,
                levelMultiplier: 0,
                cost: 2,
                requirements: ['agility'],
                category: 'movement'
            },
            wall_slide: {
                name: 'Wall Slide',
                description: 'Slide down walls slowly',
                icon: '↙️',
                maxLevel: 1,
                baseValue: 1,
                levelMultiplier: 0,
                cost: 2,
                requirements: ['double_jump'],
                category: 'movement'
            },

            // Combat Skills
            strength: {
                name: 'Strength',
                description: 'Increase damage dealt by {value}%',
                icon: '💪',
                maxLevel: 5,
                baseValue: 10,
                levelMultiplier: 5,
                cost: 1,
                requirements: [],
                category: 'combat'
            },
            dash_attack: {
                name: 'Dash Attack',
                description: 'Perform a quick dash attack',
                icon: '⚡',
                maxLevel: 3,
                baseValue: 20,
                levelMultiplier: 10,
                cost: 2,
                requirements: ['strength'],
                category: 'combat'
            },
            counter: {
                name: 'Counter',
                description: 'Counter enemy attacks with perfect timing',
                icon: '↩️',
                maxLevel: 1,
                baseValue: 1,
                levelMultiplier: 0,
                cost: 3,
                requirements: ['dash_attack'],
                category: 'combat'
            },

            // Collection Skills
            treasure_hunter: {
                name: 'Treasure Hunter',
                description: 'Increase coin collection range by {value}%',
                icon: '🪙',
                maxLevel: 5,
                baseValue: 10,
                levelMultiplier: 5,
                cost: 1,
                requirements: [],
                category: 'collection'
            },
            magnet_field: {
                name: 'Magnet Field',
                description: 'Automatically attract nearby coins',
                icon: '🧲',
                maxLevel: 3,
                baseValue: 50,
                levelMultiplier: 25,
                cost: 2,
                requirements: ['treasure_hunter'],
                category: 'collection'
            },
            lucky_find: {
                name: 'Lucky Find',
                description: 'Chance to find rare items',
                icon: '🍀',
                maxLevel: 3,
                baseValue: 5,
                levelMultiplier: 5,
                cost: 2,
                requirements: ['magnet_field'],
                category: 'collection'
            },

            // Survival Skills
            vitality: {
                name: 'Vitality',
                description: 'Increase max health by {value}%',
                icon: '❤️',
                maxLevel: 5,
                baseValue: 10,
                levelMultiplier: 5,
                cost: 1,
                requirements: [],
                category: 'survival'
            },
            regeneration: {
                name: 'Regeneration',
                description: 'Slowly regenerate health over time',
                icon: '💗',
                maxLevel: 3,
                baseValue: 1,
                levelMultiplier: 0.5,
                cost: 2,
                requirements: ['vitality'],
                category: 'survival'
            },
            shield_master: {
                name: 'Shield Master',
                description: 'Chance to block incoming damage',
                icon: '🛡️',
                maxLevel: 3,
                baseValue: 10,
                levelMultiplier: 5,
                cost: 2,
                requirements: ['regeneration'],
                category: 'survival'
            }
        };
    }

    setupUI() {
        // Create skills panel
        const skillsPanel = document.createElement('div');
        skillsPanel.id = 'skillsPanel';
        skillsPanel.className = 'skills-panel';
        skillsPanel.style.display = 'none';

        skillsPanel.innerHTML = `
            <div class="skills-header">
                <h2>Skills</h2>
                <div class="skill-points">
                    Skill Points: <span id="skillPointsDisplay">${this.skillPoints}</span>
                </div>
                <button id="closeSkills" class="close-button">×</button>
            </div>
            <div class="skills-content">
                <div class="skill-categories">
                    <button class="category-button active" data-category="movement">Movement</button>
                    <button class="category-button" data-category="combat">Combat</button>
                    <button class="category-button" data-category="collection">Collection</button>
                    <button class="category-button" data-category="survival">Survival</button>
                </div>
                <div class="skill-tree">
                    ${this.generateSkillTreeHTML('movement')}
                </div>
            </div>
        `;

        document.body.appendChild(skillsPanel);

        // Add event listeners
        document.getElementById('closeSkills').addEventListener('click', 
            () => this.hideSkills()
        );

        // Category switching
        skillsPanel.querySelectorAll('.category-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchCategory(e.target.dataset.category);
            });
        });

        // Add skills button to game UI
        const skillsButton = document.createElement('button');
        skillsButton.id = 'skillsButton';
        skillsButton.className = 'game-button';
        skillsButton.innerHTML = '🌟';
        skillsButton.addEventListener('click', () => this.showSkills());
        document.body.appendChild(skillsButton);

        this.updateUI();
    }

    generateSkillTreeHTML(category) {
        const skills = Object.entries(this.skillTree)
            .filter(([_, skill]) => skill.category === category);

        return `
            <div class="skill-tree-container">
                ${skills.map(([id, skill]) => this.generateSkillNodeHTML(id, skill)).join('')}
                ${this.generateSkillConnections(skills)}
            </div>
        `;
    }

    generateSkillNodeHTML(id, skill) {
        const level = this.skillLevels.get(id) || 0;
        const unlocked = this.unlockedSkills.has(id);
        const available = this.isSkillAvailable(id);
        const maxed = level >= skill.maxLevel;

        return `
            <div class="skill-node ${unlocked ? 'unlocked' : ''} ${available ? 'available' : ''}"
                 data-skill="${id}" style="--skill-level: ${level}">
                <div class="skill-icon">${skill.icon}</div>
                <div class="skill-info">
                    <h4>${skill.name}</h4>
                    <p>${this.formatSkillDescription(skill, level)}</p>
                    <div class="skill-level">
                        Level: ${level}/${skill.maxLevel}
                    </div>
                    ${!maxed && available ? `
                        <button onclick="skillManager.upgradeSkill('${id}')"
                                class="upgrade-button"
                                ${this.skillPoints < skill.cost ? 'disabled' : ''}>
                            Upgrade (${skill.cost} SP)
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    generateSkillConnections(skills) {
        let connections = '';
        skills.forEach(([id, skill]) => {
            skill.requirements.forEach(reqId => {
                const reqSkill = this.skillTree[reqId];
                if (reqSkill.category === skill.category) {
                    connections += `
                        <div class="skill-connection ${
                            this.unlockedSkills.has(id) && this.unlockedSkills.has(reqId) ? 'active' : ''
                        }" data-from="${reqId}" data-to="${id}"></div>
                    `;
                }
            });
        });
        return connections;
    }

    formatSkillDescription(skill, level) {
        if (skill.levelMultiplier === 0) return skill.description;
        const value = skill.baseValue + level * skill.levelMultiplier;
        return skill.description.replace('{value}', value);
    }

    switchCategory(category) {
        // Update active button
        document.querySelectorAll('.category-button').forEach(button => {
            button.classList.toggle('active', button.dataset.category === category);
        });

        // Update skill tree
        const skillTree = document.querySelector('.skill-tree');
        skillTree.innerHTML = this.generateSkillTreeHTML(category);
    }

    isSkillAvailable(skillId) {
        const skill = this.skillTree[skillId];
        return skill.requirements.every(reqId => this.unlockedSkills.has(reqId));
    }

    upgradeSkill(skillId) {
        const skill = this.skillTree[skillId];
        const currentLevel = this.skillLevels.get(skillId) || 0;

        if (this.skillPoints >= skill.cost && 
            currentLevel < skill.maxLevel && 
            this.isSkillAvailable(skillId)) {
            
            this.skillPoints -= skill.cost;
            this.unlockedSkills.add(skillId);
            this.skillLevels.set(skillId, currentLevel + 1);

            this.showUpgradeAnimation(skill);
            this.updateUI();
            this.saveProgress();
        }
    }

    showUpgradeAnimation(skill) {
        const animation = document.createElement('div');
        animation.className = 'skill-upgrade-animation';
        animation.innerHTML = `
            <div class="upgrade-content">
                <div class="skill-icon">${skill.icon}</div>
                <h3>${skill.name} Upgraded!</h3>
                <p>Level ${this.skillLevels.get(skill.id)}</p>
            </div>
        `;

        document.body.appendChild(animation);
        setTimeout(() => animation.remove(), 3000);
    }

    addSkillPoints(amount) {
        this.skillPoints += amount;
        this.updateUI();
        this.saveProgress();

        // Show skill point gain animation
        const animation = document.createElement('div');
        animation.className = 'skill-points-animation';
        animation.innerHTML = `
            <div class="points-content">
                <span class="points-icon">🌟</span>
                <span class="points-value">+${amount} Skill Points</span>
            </div>
        `;

        document.body.appendChild(animation);
        setTimeout(() => animation.remove(), 2000);
    }

    getSkillValue(skillId) {
        const skill = this.skillTree[skillId];
        const level = this.skillLevels.get(skillId) || 0;
        if (!this.unlockedSkills.has(skillId)) return 0;
        return skill.baseValue + level * skill.levelMultiplier;
    }

    showSkills() {
        document.getElementById('skillsPanel').style.display = 'block';
        this.updateUI();
    }

    hideSkills() {
        document.getElementById('skillsPanel').style.display = 'none';
    }

    updateUI() {
        const skillsPanel = document.getElementById('skillsPanel');
        if (!skillsPanel) return;

        // Update skill points display
        document.getElementById('skillPointsDisplay').textContent = this.skillPoints;

        // Update active category
        const activeCategory = document.querySelector('.category-button.active').dataset.category;
        document.querySelector('.skill-tree').innerHTML = this.generateSkillTreeHTML(activeCategory);
    }

    saveProgress() {
        const saveData = {
            skillPoints: this.skillPoints,
            unlockedSkills: Array.from(this.unlockedSkills),
            skillLevels: Array.from(this.skillLevels.entries())
        };
        localStorage.setItem('sneakDogSkills', JSON.stringify(saveData));
    }

    loadProgress() {
        const saveData = localStorage.getItem('sneakDogSkills');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.skillPoints = data.skillPoints;
            this.unlockedSkills = new Set(data.unlockedSkills);
            this.skillLevels = new Map(data.skillLevels);
        }
        this.updateUI();
    }
}
