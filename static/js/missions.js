class MissionManager {
    constructor(game) {
        this.game = game;
        this.missions = [];
        this.dailyMissions = [];
        this.weeklyMissions = [];
        this.activeMission = null;
        this.lastDailyRefresh = 0;
        this.lastWeeklyRefresh = 0;
        this.setupUI();
        this.loadProgress();
    }

    initializeMissionPool() {
        return {
            daily: [
                {
                    id: 'quick_heist',
                    type: 'daily',
                    name: 'Quick Heist',
                    description: 'Complete a heist in under 60 seconds',
                    icon: '⚡',
                    reward: 50,
                    condition: (stats) => stats.time <= 60,
                    progress: 0,
                    target: 1
                },
                {
                    id: 'coin_rush',
                    type: 'daily',
                    name: 'Coin Rush',
                    description: 'Collect 100 coins in a single run',
                    icon: '💰',
                    reward: 75,
                    condition: (stats) => stats.coinsCollected >= 100,
                    progress: 0,
                    target: 1
                },
                {
                    id: 'perfect_run',
                    type: 'daily',
                    name: 'Perfect Run',
                    description: 'Complete a run without getting hit',
                    icon: '✨',
                    reward: 100,
                    condition: (stats) => stats.hitsTaken === 0 && stats.distance > 1000,
                    progress: 0,
                    target: 1
                }
            ],
            weekly: [
                {
                    id: 'marathon_runner',
                    type: 'weekly',
                    name: 'Marathon Runner',
                    description: 'Travel a total of 10000 meters',
                    icon: '🏃',
                    reward: 300,
                    condition: (stats) => stats.totalDistance >= 10000,
                    progress: 0,
                    target: 10000
                },
                {
                    id: 'treasure_hunter',
                    type: 'weekly',
                    name: 'Treasure Hunter',
                    description: 'Collect 1000 coins total',
                    icon: '🗺️',
                    reward: 250,
                    condition: (stats) => stats.totalCoins >= 1000,
                    progress: 0,
                    target: 1000
                },
                {
                    id: 'powerup_master',
                    type: 'weekly',
                    name: 'Powerup Master',
                    description: 'Use 50 powerups',
                    icon: '⭐',
                    reward: 400,
                    condition: (stats) => stats.powerupsUsed >= 50,
                    progress: 0,
                    target: 50
                }
            ],
            story: [
                {
                    id: 'rookie_thief',
                    type: 'story',
                    chapter: 1,
                    name: 'Rookie Thief',
                    description: 'Complete your first successful heist',
                    icon: '🎯',
                    reward: 100,
                    condition: (stats) => stats.heistsCompleted >= 1,
                    progress: 0,
                    target: 1
                },
                {
                    id: 'master_thief',
                    type: 'story',
                    chapter: 2,
                    name: 'Master Thief',
                    description: 'Complete 10 heists with perfect runs',
                    icon: '👑',
                    reward: 500,
                    condition: (stats) => stats.perfectHeists >= 10,
                    progress: 0,
                    target: 10
                }
            ]
        };
    }

    setupUI() {
        // Create missions panel
        const missionsPanel = document.createElement('div');
        missionsPanel.id = 'missionsPanel';
        missionsPanel.className = 'missions-panel';
        missionsPanel.style.display = 'none';

        missionsPanel.innerHTML = `
            <div class="missions-header">
                <h2>Missions</h2>
                <button id="closeMissions" class="close-button">×</button>
            </div>
            <div class="missions-tabs">
                <button class="tab-button active" data-tab="daily">Daily</button>
                <button class="tab-button" data-tab="weekly">Weekly</button>
                <button class="tab-button" data-tab="story">Story</button>
            </div>
            <div class="missions-content">
                <div id="dailyTab" class="tab-content active"></div>
                <div id="weeklyTab" class="tab-content"></div>
                <div id="storyTab" class="tab-content"></div>
            </div>
        `;

        document.body.appendChild(missionsPanel);

        // Add event listeners
        document.getElementById('closeMissions').addEventListener('click', 
            () => this.hideMissions()
        );

        // Tab switching
        const tabs = missionsPanel.querySelectorAll('.tab-button');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        this.updateUI();
    }

    switchTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tab);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tab}Tab`);
        });
    }

    updateUI() {
        // Update daily missions
        const dailyTab = document.getElementById('dailyTab');
        dailyTab.innerHTML = this.generateMissionsHTML(this.dailyMissions);

        // Update weekly missions
        const weeklyTab = document.getElementById('weeklyTab');
        weeklyTab.innerHTML = this.generateMissionsHTML(this.weeklyMissions);

        // Update story missions
        const storyTab = document.getElementById('storyTab');
        storyTab.innerHTML = this.generateMissionsHTML(this.missions.filter(m => m.type === 'story'));
    }

    generateMissionsHTML(missions) {
        if (missions.length === 0) {
            return '<div class="no-missions">No missions available</div>';
        }

        return missions.map(mission => `
            <div class="mission-item ${mission.completed ? 'completed' : ''}">
                <div class="mission-icon">${mission.icon}</div>
                <div class="mission-info">
                    <h4>${mission.name}</h4>
                    <p>${mission.description}</p>
                    <div class="mission-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(mission.progress / mission.target) * 100}%"></div>
                        </div>
                        <span class="progress-text">${mission.progress}/${mission.target}</span>
                    </div>
                </div>
                <div class="mission-reward">
                    ${mission.completed ? 'Completed' : `${mission.reward} 🪙`}
                </div>
            </div>
        `).join('');
    }

    showMissions() {
        document.getElementById('missionsPanel').style.display = 'block';
        this.updateUI();
    }

    hideMissions() {
        document.getElementById('missionsPanel').style.display = 'none';
    }

    refreshDailyMissions() {
        const now = Date.now();
        const dayInMs = 24 * 60 * 60 * 1000;
        
        if (now - this.lastDailyRefresh >= dayInMs) {
            const missionPool = this.initializeMissionPool().daily;
            this.dailyMissions = this.getRandomMissions(missionPool, 3);
            this.lastDailyRefresh = now;
            this.saveProgress();
        }
    }

    refreshWeeklyMissions() {
        const now = Date.now();
        const weekInMs = 7 * 24 * 60 * 60 * 1000;
        
        if (now - this.lastWeeklyRefresh >= weekInMs) {
            const missionPool = this.initializeMissionPool().weekly;
            this.weeklyMissions = this.getRandomMissions(missionPool, 3);
            this.lastWeeklyRefresh = now;
            this.saveProgress();
        }
    }

    getRandomMissions(pool, count) {
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    updateProgress(stats) {
        // Update all mission types
        [...this.dailyMissions, ...this.weeklyMissions, ...this.missions].forEach(mission => {
            if (!mission.completed) {
                if (mission.condition(stats)) {
                    this.completeMission(mission);
                } else if (mission.progress < mission.target) {
                    // Update progress based on stats
                    switch(mission.id) {
                        case 'marathon_runner':
                            mission.progress = Math.min(stats.totalDistance, mission.target);
                            break;
                        case 'treasure_hunter':
                            mission.progress = Math.min(stats.totalCoins, mission.target);
                            break;
                        case 'powerup_master':
                            mission.progress = Math.min(stats.powerupsUsed, mission.target);
                            break;
                        // Add more cases for other mission types
                    }
                }
            }
        });

        this.updateUI();
        this.saveProgress();
    }

    completeMission(mission) {
        mission.completed = true;
        this.game.coins += mission.reward;
        
        // Show completion notification
        this.showMissionNotification(mission);
        
        // Play sound
        this.game.audio.playSound('unlock');
    }

    showMissionNotification(mission) {
        const notification = document.createElement('div');
        notification.className = 'mission-notification';
        notification.innerHTML = `
            <div class="mission-icon">${mission.icon}</div>
            <div class="mission-info">
                <h4>${mission.name} Completed!</h4>
                <p>+${mission.reward} coins</p>
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

    saveProgress() {
        const saveData = {
            dailyMissions: this.dailyMissions,
            weeklyMissions: this.weeklyMissions,
            missions: this.missions,
            lastDailyRefresh: this.lastDailyRefresh,
            lastWeeklyRefresh: this.lastWeeklyRefresh
        };
        localStorage.setItem('sneakDogMissions', JSON.stringify(saveData));
    }

    loadProgress() {
        const saveData = localStorage.getItem('sneakDogMissions');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.dailyMissions = data.dailyMissions;
            this.weeklyMissions = data.weeklyMissions;
            this.missions = data.missions;
            this.lastDailyRefresh = data.lastDailyRefresh;
            this.lastWeeklyRefresh = data.lastWeeklyRefresh;
        } else {
            // Initialize with default missions
            const missionPool = this.initializeMissionPool();
            this.missions = missionPool.story;
            this.refreshDailyMissions();
            this.refreshWeeklyMissions();
        }

        this.updateUI();
    }
}
