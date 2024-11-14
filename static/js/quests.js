class QuestManager {
    constructor(game) {
        this.game = game;
        this.activeQuests = new Map();
        this.completedQuests = new Set();
        this.questProgress = new Map();
        this.quests = this.initializeQuests();
        this.setupUI();
        this.loadProgress();
    }

    initializeQuests() {
        return {
            // Tutorial Quests
            tutorial_move: {
                id: 'tutorial_move',
                name: 'First Steps',
                description: 'Learn basic movement controls',
                type: 'tutorial',
                chapter: 'Tutorial',
                objective: 'Move 100 units',
                targetProgress: 100,
                rewards: {
                    coins: 50,
                    items: [{ id: 'energy_crystal', count: 1 }]
                }
            },
            tutorial_jump: {
                id: 'tutorial_jump',
                name: 'Getting Higher',
                description: 'Master jumping mechanics',
                type: 'tutorial',
                chapter: 'Tutorial',
                objective: 'Perform 10 jumps',
                targetProgress: 10,
                rewards: {
                    coins: 75,
                    items: [{ id: 'swift_feather', count: 1 }]
                }
            },

            // Story Quests - Chapter 1: The Beginning
            story_ch1_start: {
                id: 'story_ch1_start',
                name: 'A New Adventure',
                description: 'Begin your journey as a sneaky dog',
                type: 'story',
                chapter: 'Chapter 1',
                objective: 'Complete the first level',
                targetProgress: 1,
                rewards: {
                    coins: 200,
                    skillPoints: 1,
                    items: [{ id: 'magic_essence', count: 2 }]
                }
            },
            story_ch1_collect: {
                id: 'story_ch1_collect',
                name: 'Treasure Hunter',
                description: 'Collect valuable items in the neighborhood',
                type: 'story',
                chapter: 'Chapter 1',
                objective: 'Collect 50 coins',
                targetProgress: 50,
                rewards: {
                    coins: 300,
                    items: [{ id: 'fortune_crystal', count: 1 }]
                }
            },

            // Daily Quests
            daily_distance: {
                id: 'daily_distance',
                name: 'Daily Runner',
                description: 'Cover a set distance in one day',
                type: 'daily',
                objective: 'Run 1000 units',
                targetProgress: 1000,
                rewards: {
                    coins: 150,
                    items: [{ id: 'energy_crystal', count: 1 }]
                },
                resetsDaily: true
            },
            daily_coins: {
                id: 'daily_coins',
                name: 'Coin Collector',
                description: 'Collect coins throughout the day',
                type: 'daily',
                objective: 'Collect 100 coins',
                targetProgress: 100,
                rewards: {
                    coins: 200,
                    items: [{ id: 'magnetic_ore', count: 1 }]
                },
                resetsDaily: true
            },

            // Challenge Quests
            challenge_speed: {
                id: 'challenge_speed',
                name: 'Speed Demon',
                description: 'Complete a level within the time limit',
                type: 'challenge',
                objective: 'Complete level in 60 seconds',
                targetProgress: 1,
                rewards: {
                    coins: 500,
                    skillPoints: 1,
                    items: [{ id: 'rainbow_shard', count: 1 }]
                }
            },
            challenge_perfect: {
                id: 'challenge_perfect',
                name: 'Perfect Run',
                description: 'Complete a level without taking damage',
                type: 'challenge',
                objective: 'Complete level without damage',
                targetProgress: 1,
                rewards: {
                    coins: 750,
                    skillPoints: 2,
                    items: [{ id: 'protection_gem', count: 2 }]
                }
            }
        };
    }

    setupUI() {
        // Create quests panel
        const questsPanel = document.createElement('div');
        questsPanel.id = 'questsPanel';
        questsPanel.className = 'quests-panel';
        questsPanel.style.display = 'none';

        questsPanel.innerHTML = `
            <div class="quests-header">
                <h2>Quests</h2>
                <div class="quest-filters">
                    <button class="filter-button active" data-type="all">All</button>
                    <button class="filter-button" data-type="story">Story</button>
                    <button class="filter-button" data-type="daily">Daily</button>
                    <button class="filter-button" data-type="challenge">Challenges</button>
                </div>
                <button id="closeQuests" class="close-button">×</button>
            </div>
            <div class="quests-content">
                <div class="quests-list">
                    ${this.generateQuestsHTML('all')}
                </div>
            </div>
        `;

        document.body.appendChild(questsPanel);

        // Add event listeners
        document.getElementById('closeQuests').addEventListener('click', 
            () => this.hideQuests()
        );

        // Filter switching
        questsPanel.querySelectorAll('.filter-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchFilter(e.target.dataset.type);
            });
        });

        // Add quests button to game UI
        const questsButton = document.createElement('button');
        questsButton.id = 'questsButton';
        questsButton.className = 'game-button';
        questsButton.innerHTML = '📜';
        questsButton.addEventListener('click', () => this.showQuests());
        document.body.appendChild(questsButton);

        this.updateUI();
    }

    generateQuestsHTML(filter) {
        const quests = Object.values(this.quests)
            .filter(quest => filter === 'all' || quest.type === filter);

        if (quests.length === 0) {
            return '<div class="no-quests">No quests available</div>';
        }

        // Group quests by chapter/type
        const groupedQuests = quests.reduce((groups, quest) => {
            const group = quest.chapter || quest.type.charAt(0).toUpperCase() + quest.type.slice(1);
            if (!groups[group]) groups[group] = [];
            groups[group].push(quest);
            return groups;
        }, {});

        return Object.entries(groupedQuests).map(([group, groupQuests]) => `
            <div class="quest-group">
                <h3 class="group-title">${group}</h3>
                ${groupQuests.map(quest => this.generateQuestItemHTML(quest)).join('')}
            </div>
        `).join('');
    }

    generateQuestItemHTML(quest) {
        const isActive = this.activeQuests.has(quest.id);
        const isCompleted = this.completedQuests.has(quest.id);
        const progress = this.questProgress.get(quest.id) || 0;
        const progressPercent = (progress / quest.targetProgress) * 100;

        return `
            <div class="quest-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}">
                <div class="quest-info">
                    <h4>${quest.name}</h4>
                    <p>${quest.description}</p>
                    <div class="quest-objective">
                        ${quest.objective}: ${progress}/${quest.targetProgress}
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                </div>
                <div class="quest-rewards">
                    ${quest.rewards.coins ? `<div class="reward-coins">${quest.rewards.coins} 🪙</div>` : ''}
                    ${quest.rewards.skillPoints ? `<div class="reward-sp">${quest.rewards.skillPoints} SP</div>` : ''}
                    ${quest.rewards.items.map(item => `
                        <div class="reward-item">
                            ${this.game.craftingManager.getItemIcon(item.id)} × ${item.count}
                        </div>
                    `).join('')}
                </div>
                ${isCompleted ? `
                    <div class="quest-complete-mark">✓</div>
                ` : !isActive ? `
                    <button onclick="questManager.startQuest('${quest.id}')" class="start-quest-btn">
                        Start Quest
                    </button>
                ` : ''}
            </div>
        `;
    }

    startQuest(questId) {
        if (!this.activeQuests.has(questId) && !this.completedQuests.has(questId)) {
            this.activeQuests.set(questId, true);
            this.questProgress.set(questId, 0);
            this.showQuestStartAnimation(this.quests[questId]);
            this.updateUI();
            this.saveProgress();
        }
    }

    updateQuestProgress(questId, progress) {
        if (!this.activeQuests.has(questId)) return;

        const quest = this.quests[questId];
        const currentProgress = this.questProgress.get(questId) || 0;
        const newProgress = Math.min(currentProgress + progress, quest.targetProgress);

        this.questProgress.set(questId, newProgress);

        if (newProgress >= quest.targetProgress) {
            this.completeQuest(questId);
        }

        this.updateUI();
        this.saveProgress();
    }

    completeQuest(questId) {
        const quest = this.quests[questId];
        
        // Grant rewards
        if (quest.rewards.coins) {
            this.game.addCoins(quest.rewards.coins);
        }
        if (quest.rewards.skillPoints) {
            this.game.skillManager.addSkillPoints(quest.rewards.skillPoints);
        }
        if (quest.rewards.items) {
            quest.rewards.items.forEach(item => {
                this.game.craftingManager.addItem(item.id, item.count);
            });
        }

        // Update quest status
        this.activeQuests.delete(questId);
        if (!quest.resetsDaily) {
            this.completedQuests.add(questId);
        }

        this.showQuestCompleteAnimation(quest);
        this.updateUI();
        this.saveProgress();
    }

    showQuestStartAnimation(quest) {
        const animation = document.createElement('div');
        animation.className = 'quest-start-animation';
        animation.innerHTML = `
            <div class="quest-animation-content">
                <h3>New Quest Started!</h3>
                <div class="quest-name">${quest.name}</div>
                <p>${quest.description}</p>
            </div>
        `;

        document.body.appendChild(animation);
        setTimeout(() => animation.remove(), 3000);
    }

    showQuestCompleteAnimation(quest) {
        const animation = document.createElement('div');
        animation.className = 'quest-complete-animation';
        animation.innerHTML = `
            <div class="quest-animation-content">
                <h3>Quest Completed!</h3>
                <div class="quest-name">${quest.name}</div>
                <div class="rewards-summary">
                    ${quest.rewards.coins ? `<div class="reward-coins">${quest.rewards.coins} 🪙</div>` : ''}
                    ${quest.rewards.skillPoints ? `<div class="reward-sp">${quest.rewards.skillPoints} SP</div>` : ''}
                    ${quest.rewards.items.map(item => `
                        <div class="reward-item">
                            ${this.game.craftingManager.getItemIcon(item.id)} × ${item.count}
                        </div>
                    `).join('')}
                </div>
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

        // Update quests list
        document.querySelector('.quests-list').innerHTML = this.generateQuestsHTML(filter);
    }

    showQuests() {
        document.getElementById('questsPanel').style.display = 'block';
        this.updateUI();
    }

    hideQuests() {
        document.getElementById('questsPanel').style.display = 'none';
    }

    updateUI() {
        const questsPanel = document.getElementById('questsPanel');
        if (!questsPanel) return;

        const activeFilter = questsPanel.querySelector('.filter-button.active').dataset.type;
        document.querySelector('.quests-list').innerHTML = this.generateQuestsHTML(activeFilter);

        // Update quest button notification
        const questsButton = document.getElementById('questsButton');
        const hasCompletedQuests = Array.from(this.activeQuests.keys())
            .some(questId => (this.questProgress.get(questId) || 0) >= this.quests[questId].targetProgress);
        
        questsButton.classList.toggle('has-completed', hasCompletedQuests);
    }

    saveProgress() {
        const saveData = {
            activeQuests: Array.from(this.activeQuests.entries()),
            completedQuests: Array.from(this.completedQuests),
            questProgress: Array.from(this.questProgress.entries())
        };
        localStorage.setItem('sneakDogQuests', JSON.stringify(saveData));
    }

    loadProgress() {
        const saveData = localStorage.getItem('sneakDogQuests');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.activeQuests = new Map(data.activeQuests);
            this.completedQuests = new Set(data.completedQuests);
            this.questProgress = new Map(data.questProgress);
        }
        this.updateUI();
    }

    resetDailyQuests() {
        // Reset progress for daily quests
        Object.values(this.quests)
            .filter(quest => quest.resetsDaily)
            .forEach(quest => {
                this.activeQuests.delete(quest.id);
                this.completedQuests.delete(quest.id);
                this.questProgress.delete(quest.id);
            });

        this.updateUI();
        this.saveProgress();
    }
}
