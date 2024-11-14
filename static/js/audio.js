class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.isMuted = false;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;
        this.currentMusic = '';
        
        // Initialize audio context
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create master volume node
        this.masterGain = this.context.createGain();
        this.masterGain.connect(this.context.destination);
        
        this.loadSounds();
    }

    async loadSounds() {
        const soundFiles = {
            jump: 'static/assets/sounds/jump.mp3',
            coin: 'static/assets/sounds/coin.mp3',
            hit: 'static/assets/sounds/hit.mp3',
            powerup: 'static/assets/sounds/powerup.mp3',
            gameOver: 'static/assets/sounds/gameover.mp3',
            purchase: 'static/assets/sounds/purchase.mp3',
            unlock: 'static/assets/sounds/unlock.mp3',
            click: 'static/assets/sounds/click.mp3',
            background: 'static/assets/sounds/background.mp3'
        };

        try {
            const loadPromises = Object.entries(soundFiles).map(([name, path]) => 
                this.loadSound(name, path)
            );
            await Promise.all(loadPromises);
            console.log('All sounds loaded successfully');
        } catch (error) {
            console.error('Error loading sounds:', error);
        }
    }

    async loadSound(name, path) {
        try {
            const response = await fetch(path);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
            
            this.sounds[name] = audioBuffer;
        } catch (error) {
            console.error(`Error loading sound ${name}:`, error);
        }
    }

    playSound(name, options = {}) {
        if (this.isMuted || !this.sounds[name]) return;

        const source = this.context.createBufferSource();
        source.buffer = this.sounds[name];

        // Create gain node for this sound
        const gainNode = this.context.createGain();
        gainNode.gain.value = (options.volume || 1) * this.sfxVolume;

        // Connect nodes
        source.connect(gainNode);
        gainNode.connect(this.masterGain);

        // Optional looping
        if (options.loop) {
            source.loop = true;
        }

        // Play the sound
        source.start(0);

        // If it's background music, store the source
        if (options.isMusic) {
            if (this.music) {
                this.music.stop();
            }
            this.music = source;
            this.currentMusic = name;
        }

        return source;
    }

    playMusic(name) {
        if (this.currentMusic === name) return;
        
        this.playSound(name, {
            isMusic: true,
            loop: true,
            volume: this.musicVolume
        });
    }

    stopMusic() {
        if (this.music) {
            this.music.stop();
            this.music = null;
            this.currentMusic = '';
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.masterGain.gain.value = this.isMuted ? 0 : 1;
        return this.isMuted;
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.music) {
            this.music.gainNode.gain.value = this.musicVolume;
        }
    }

    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
}
