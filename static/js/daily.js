class DailyRewardsManager {
    constructor(game) {
        this.game = game;
        this.currentStreak = 0;
        this.lastClaimDate = null;
        this.claimedToday = false;
        this.rewards = this.initializeRewards();
        this.setupUI();
        this.loadProgress();
        this.checkDailyReset();
    }

    initializeRewards() {
        return {
            day1: {
                coins: 100,
                items: [{ id: 'energy_crystal', count: 1 }],
                icon: '🪙'
            },
            day2: {
                coins: 200,
                items: [{ id: 'swift_feather', count: 1 }],
                icon: '🪶'
            },
            day3: {
                coins: 300,
                items: [{ id: 'protection_gem', count: 1 }],
                icon: '💎'
            },
            day4: {
                coins: 400,
                items: [{ id: 'magic_essence', count: 2 }],
                icon: '✨'
            },
            day5: {
                coins: 500,
                skillPoints: 1,
                items: [{ id: 'rainbow_shard', count: 1 }],
                icon: '🌟'
            },
            day6: {
                coins: 600,
                items: [
                    { id: 'fortune_crystal', count: 1 },
                    { id: 'magnetic_ore', count: 2 }
                ],
                icon: '🎁'
            },
            day7: {
                coins: 1000,
                skillPoints: 2,
                items: [
                    { id: 'rainbow_shard', count: 2 },
                    { id: 'magic_essence', count: 3 }
                ],
                icon: '🏆'
            }
        };
    }

    setupUI() {
        // Create daily rewards panel
        const dailyPanel = document.createElement('div');
        dailyPanel.id = 'dailyPanel';
        dailyPanel.className = 'daily-panel';
        dailyPanel.style.display = 'none';

        dailyPanel.innerHTML = `
            <div class="daily-header">
                <h2>Daily Rewards</h2>
                <div class="streak-counter">
                    Streak: ${this.currentStreak} days
                </div>
                <button id="closeDaily" class="close-button">×</button>
            </div>
            <div class="daily-content">
                <div class="rewards-grid">
                    ${this.generateRewardsHTML()}
                </div>
                ${this.claimedToday ? `
                    <div class="next-reward">
                        <h3>Next Reward Available In:</h3>
                        <div class="countdown" id="dailyCountdown"></div>
                    </div>
                ` : ''}
            </div>
        `;

        document.body.appendChild(dailyPanel);

        // Add event listeners
        document.getElementById('closeDaily').addEventListener('click', 
            () => this.hideDaily()
        );

        // Add daily button to game UI
        const dailyButton = document.createElement('button');
        dailyButton.id = 'dailyButton';
        dailyButton.className = 'game-button';
        dailyButton.innerHTML = '📅';
        dailyButton.addEventListener('click', () => this.showDaily());
        document.body.appendChild(dailyButton);

        if (!this.claimedToday) {
            dailyButton.classList.add('has-reward');
        }

        this.updateUI();
        this.startCountdown();
    }

    generateRewardsHTML() {
        return Object.entries(this.rewards).map(([day, reward], index) => {
            const dayNumber = index + 1;
            const isCurrent = dayNumber === (this.currentStreak % 7) + 1;
            const isPast = dayNumber < (this.currentStreak % 7) + 1;
            const isToday = isCurrent && !this.claimedToday;

            return `
                <div class="reward-item ${isPast ? 'claimed' : ''} ${isCurrent ? 'current' : ''} ${isToday ? 'available' : ''}">
                    <div class="reward-day">Day ${dayNumber}</div>
                    <div class="reward-icon">${reward.icon}</div>
                    <div class="reward-details">
                        ${reward.coins ? `<div class="reward-coins">${reward.coins} 🪙</div>` : ''}
                        ${reward.skillPoints ? `<div class="reward-sp">${reward.skillPoints} SP</div>` : ''}
                        ${reward.items.map(item => `
                            <div class="reward-item-entry">
                                ${this.game.craftingManager.getItemIcon(item.id)} × ${item.count}
                            </div>
                        `).join('')}
                    </div>
                    ${isToday ? `
                        <button onclick="dailyRewards.claim()" class="claim-button">
                            Claim
                        </button>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    checkDailyReset() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (this.lastClaimDate) {
            const lastClaim = new Date(this.lastClaimDate);
            const lastClaimDay = new Date(lastClaim.getFullYear(), lastClaim.getMonth(), lastClaim.getDate());
            
            // Check if more than one day has passed
            const daysDiff = Math.floor((today - lastClaimDay) / (1000 * 60 * 60 * 24));
            
            if (daysDiff > 1) {
                // Reset streak if more than one day missed
                this.currentStreak = 0;
            }
        }

        // Reset claimed status for new day
        if (!this.lastClaimDate || today > new Date(this.lastClaimDate)) {
            this.claimedToday = false;
            const dailyButton = document.getElementById('dailyButton');
            if (dailyButton) {
                dailyButton.classList.add('has-reward');
            }
        }

        this.updateUI();
        this.saveProgress();
    }

    claim() {
        if (this.claimedToday) return;

        const currentDay = (this.currentStreak % 7) + 1;
        const reward = this.rewards[`day${currentDay}`];

        // Grant rewards
        if (reward.coins) {
            this.game.addCoins(reward.coins);
        }
        if (reward.skillPoints) {
            this.game.skillManager.addSkillPoints(reward.skillPoints);
        }
        if (reward.items) {
            reward.items.forEach(item => {
                this.game.craftingManager.addItem(item.id, item.count);
            });
        }

        // Update streak and claim status
        this.currentStreak++;
        this.claimedToday = true;
        this.lastClaimDate = new Date().toISOString();

        // Update UI
        document.getElementById('dailyButton').classList.remove('has-reward');
        this.showClaimAnimation(reward);
        this.updateUI();
        this.saveProgress();
        this.startCountdown();
    }

    showClaimAnimation(reward) {
        const animation = document.createElement('div');
        animation.className = 'daily-claim-animation';
        animation.innerHTML = `
            <div class="claim-content">
                <h3>Daily Reward Claimed!</h3>
                <div class="reward-summary">
                    ${reward.coins ? `<div class="reward-coins">${reward.coins} 🪙</div>` : ''}
                    ${reward.skillPoints ? `<div class="reward-sp">${reward.skillPoints} SP</div>` : ''}
                    ${reward.items.map(item => `
                        <div class="reward-item-entry">
                            ${this.game.craftingManager.getItemIcon(item.id)} × ${item.count}
                        </div>
                    `).join('')}
                </div>
                <div class="streak-bonus">
                    ${this.currentStreak} Day Streak! 🔥
                </div>
            </div>
        `;

        document.body.appendChild(animation);
        setTimeout(() => animation.remove(), 3000);
    }

    startCountdown() {
        if (!this.claimedToday) return;

        const countdownElement = document.getElementById('dailyCountdown');
        if (!countdownElement) return;

        const updateCountdown = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const diff = tomorrow - now;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            countdownElement.textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            if (diff <= 0) {
                this.checkDailyReset();
            }
        };

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    showDaily() {
        document.getElementById('dailyPanel').style.display = 'block';
        this.updateUI();
    }

    hideDaily() {
        document.getElementById('dailyPanel').style.display = 'none';
    }

    updateUI() {
        const dailyPanel = document.getElementById('dailyPanel');
        if (!dailyPanel) return;

        const streakCounter = dailyPanel.querySelector('.streak-counter');
        const rewardsGrid = dailyPanel.querySelector('.rewards-grid');

        streakCounter.textContent = `Streak: ${this.currentStreak} days`;
        rewardsGrid.innerHTML = this.generateRewardsHTML();
    }

    saveProgress() {
        const saveData = {
            currentStreak: this.currentStreak,
            lastClaimDate: this.lastClaimDate,
            claimedToday: this.claimedToday
        };
        localStorage.setItem('sneakDogDaily', JSON.stringify(saveData));
    }

    loadProgress() {
        const saveData = localStorage.getItem('sneakDogDaily');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.currentStreak = data.currentStreak;
            this.lastClaimDate = data.lastClaimDate;
            this.claimedToday = data.claimedToday;
        }
    }
}
