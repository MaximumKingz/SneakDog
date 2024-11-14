class MultiplayerManager {
    constructor(game) {
        this.game = game;
        this.challenges = [];
        this.activeChallenges = new Map();
        this.leaderboard = [];
        this.playerData = {
            id: null,
            name: null,
            highScore: 0,
            totalCoins: 0,
            achievements: []
        };
        this.setupUI();
        this.initializeTelegramFeatures();
    }

    initializeTelegramFeatures() {
        // Initialize Telegram WebApp features
        this.webapp = window.Telegram.WebApp;
        if (this.webapp) {
            this.playerData.id = this.webapp.initDataUnsafe?.user?.id;
            this.playerData.name = this.webapp.initDataUnsafe?.user?.username;
            
            // Setup MainButton for challenge invites
            this.webapp.MainButton.setText('Challenge Friends');
            this.webapp.MainButton.onClick(() => this.inviteFriends());
        }
    }

    setupUI() {
        // Create multiplayer panel
        const multiplayerPanel = document.createElement('div');
        multiplayerPanel.id = 'multiplayerPanel';
        multiplayerPanel.className = 'multiplayer-panel';
        multiplayerPanel.style.display = 'none';

        multiplayerPanel.innerHTML = `
            <div class="multiplayer-header">
                <h2>Multiplayer</h2>
                <button id="closeMultiplayer" class="close-button">×</button>
            </div>
            <div class="multiplayer-tabs">
                <button class="tab-button active" data-tab="challenges">Challenges</button>
                <button class="tab-button" data-tab="leaderboard">Leaderboard</button>
                <button class="tab-button" data-tab="friends">Friends</button>
            </div>
            <div class="multiplayer-content">
                <div id="challengesTab" class="tab-content active"></div>
                <div id="leaderboardTab" class="tab-content"></div>
                <div id="friendsTab" class="tab-content"></div>
            </div>
        `;

        document.body.appendChild(multiplayerPanel);

        // Add event listeners
        document.getElementById('closeMultiplayer').addEventListener('click', 
            () => this.hideMultiplayer()
        );

        // Tab switching
        const tabs = multiplayerPanel.querySelectorAll('.tab-button');
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

        // Load content based on tab
        switch(tab) {
            case 'challenges':
                this.loadChallenges();
                break;
            case 'leaderboard':
                this.loadLeaderboard();
                break;
            case 'friends':
                this.loadFriends();
                break;
        }
    }

    loadChallenges() {
        const challengesTab = document.getElementById('challengesTab');
        challengesTab.innerHTML = `
            <div class="challenges-header">
                <h3>Active Challenges</h3>
                <button class="create-challenge-btn" onclick="multiplayerManager.createChallenge()">
                    Create Challenge
                </button>
            </div>
            <div class="challenges-list">
                ${this.generateChallengesHTML()}
            </div>
        `;
    }

    loadLeaderboard() {
        const leaderboardTab = document.getElementById('leaderboardTab');
        leaderboardTab.innerHTML = `
            <div class="leaderboard-header">
                <h3>Global Rankings</h3>
                <div class="leaderboard-filters">
                    <button class="filter-btn active" data-filter="all">All Time</button>
                    <button class="filter-btn" data-filter="weekly">Weekly</button>
                    <button class="filter-btn" data-filter="daily">Daily</button>
                </div>
            </div>
            <div class="leaderboard-list">
                ${this.generateLeaderboardHTML()}
            </div>
        `;

        // Add filter event listeners
        leaderboardTab.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.updateLeaderboardFilter(e.target.dataset.filter);
            });
        });
    }

    loadFriends() {
        const friendsTab = document.getElementById('friendsTab');
        friendsTab.innerHTML = `
            <div class="friends-header">
                <h3>Friends</h3>
                <button class="invite-btn" onclick="multiplayerManager.inviteFriends()">
                    Invite Friends
                </button>
            </div>
            <div class="friends-list">
                ${this.generateFriendsHTML()}
            </div>
        `;
    }

    generateChallengesHTML() {
        if (this.challenges.length === 0) {
            return '<div class="no-challenges">No active challenges</div>';
        }

        return this.challenges.map(challenge => `
            <div class="challenge-item ${challenge.status}">
                <div class="challenge-info">
                    <h4>${challenge.type} Challenge</h4>
                    <p>${challenge.description}</p>
                    <div class="challenge-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(challenge.progress / challenge.target) * 100}%"></div>
                        </div>
                        <span class="progress-text">${challenge.progress}/${challenge.target}</span>
                    </div>
                </div>
                <div class="challenge-participants">
                    ${this.generateParticipantsHTML(challenge.participants)}
                </div>
                <div class="challenge-reward">
                    Reward: ${challenge.reward} 🪙
                </div>
            </div>
        `).join('');
    }

    generateParticipantsHTML(participants) {
        return participants.map(participant => `
            <div class="participant">
                <div class="participant-avatar">
                    ${participant.name.charAt(0)}
                </div>
                <span class="participant-score">${participant.score}</span>
            </div>
        `).join('');
    }

    generateLeaderboardHTML() {
        if (this.leaderboard.length === 0) {
            return '<div class="no-scores">No scores yet</div>';
        }

        return this.leaderboard.map((entry, index) => `
            <div class="leaderboard-item ${entry.id === this.playerData.id ? 'current-player' : ''}">
                <div class="rank">${index + 1}</div>
                <div class="player-info">
                    <div class="player-avatar">${entry.name.charAt(0)}</div>
                    <span class="player-name">${entry.name}</span>
                </div>
                <div class="score">${entry.score}</div>
            </div>
        `).join('');
    }

    generateFriendsHTML() {
        // This would be populated with actual friend data from Telegram
        return '<div class="no-friends">Use the Invite button to add friends!</div>';
    }

    createChallenge() {
        const challengeModal = document.createElement('div');
        challengeModal.className = 'challenge-modal';
        challengeModal.innerHTML = `
            <div class="challenge-modal-content">
                <h3>Create Challenge</h3>
                <div class="challenge-options">
                    <select id="challengeType">
                        <option value="score">High Score</option>
                        <option value="coins">Coin Collection</option>
                        <option value="distance">Distance</option>
                    </select>
                    <input type="number" id="challengeDuration" placeholder="Duration (hours)">
                    <input type="number" id="challengeReward" placeholder="Reward (coins)">
                </div>
                <div class="challenge-buttons">
                    <button onclick="multiplayerManager.cancelChallenge()">Cancel</button>
                    <button onclick="multiplayerManager.confirmChallenge()">Create</button>
                </div>
            </div>
        `;

        document.body.appendChild(challengeModal);
    }

    cancelChallenge() {
        document.querySelector('.challenge-modal').remove();
    }

    confirmChallenge() {
        const type = document.getElementById('challengeType').value;
        const duration = document.getElementById('challengeDuration').value;
        const reward = document.getElementById('challengeReward').value;

        // Create new challenge
        const challenge = {
            id: Date.now(),
            type: type,
            duration: duration * 3600000, // Convert hours to milliseconds
            reward: parseInt(reward),
            participants: [{
                id: this.playerData.id,
                name: this.playerData.name,
                score: 0
            }],
            status: 'active',
            startTime: Date.now(),
            progress: 0,
            target: this.getChallengeTarget(type)
        };

        this.challenges.push(challenge);
        this.updateUI();
        this.cancelChallenge();
    }

    getChallengeTarget(type) {
        switch(type) {
            case 'score':
                return 10000;
            case 'coins':
                return 1000;
            case 'distance':
                return 5000;
            default:
                return 1000;
        }
    }

    inviteFriends() {
        if (this.webapp) {
            this.webapp.switchInlineQuery('Join me in Sneak Dog! 🐕', ['gaming']);
        }
    }

    updateLeaderboardFilter(filter) {
        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        // Update leaderboard data based on filter
        this.loadLeaderboardData(filter);
    }

    loadLeaderboardData(filter) {
        // This would fetch leaderboard data from the server
        // For now, we'll use mock data
        this.leaderboard = [
            { id: 1, name: 'Player 1', score: 10000 },
            { id: 2, name: 'Player 2', score: 8500 },
            { id: 3, name: 'Player 3', score: 7200 }
        ];
        document.querySelector('.leaderboard-list').innerHTML = this.generateLeaderboardHTML();
    }

    updateChallengeProgress(type, value) {
        this.challenges.forEach(challenge => {
            if (challenge.type === type && challenge.status === 'active') {
                const participant = challenge.participants.find(p => p.id === this.playerData.id);
                if (participant) {
                    participant.score = Math.max(participant.score, value);
                    challenge.progress = Math.max(challenge.progress, value);

                    if (challenge.progress >= challenge.target) {
                        this.completeChallenge(challenge);
                    }
                }
            }
        });

        this.updateUI();
    }

    completeChallenge(challenge) {
        challenge.status = 'completed';
        const winner = challenge.participants.reduce((prev, current) => 
            (prev.score > current.score) ? prev : current
        );

        if (winner.id === this.playerData.id) {
            this.game.coins += challenge.reward;
            this.showChallengeVictory(challenge);
        }
    }

    showChallengeVictory(challenge) {
        const notification = document.createElement('div');
        notification.className = 'challenge-victory';
        notification.innerHTML = `
            <div class="victory-content">
                <h3>Challenge Complete!</h3>
                <p>You won the ${challenge.type} challenge!</p>
                <div class="reward-amount">+${challenge.reward} 🪙</div>
            </div>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    showMultiplayer() {
        document.getElementById('multiplayerPanel').style.display = 'block';
        this.updateUI();
    }

    hideMultiplayer() {
        document.getElementById('multiplayerPanel').style.display = 'none';
    }

    updateUI() {
        this.loadChallenges();
        this.loadLeaderboard();
        this.loadFriends();
    }
}
