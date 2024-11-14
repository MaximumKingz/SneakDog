class SpriteManager {
    constructor(game) {
        this.game = game;
        this.sprites = {};
        this.loaded = false;
    }

    async loadSprites() {
        const spritePromises = [
            this.loadSprite('dog_run', 'static/assets/sprites/dog_run.png'),
            this.loadSprite('dog_jump', 'static/assets/sprites/dog_jump.png'),
            this.loadSprite('coin', 'static/assets/sprites/coin.png'),
            this.loadSprite('guard', 'static/assets/sprites/guard.png'),
            this.loadSprite('camera', 'static/assets/sprites/camera.png')
        ];

        try {
            await Promise.all(spritePromises);
            this.loaded = true;
        } catch (error) {
            console.error('Error loading sprites:', error);
            // Fall back to rectangle shapes if sprites fail to load
            this.loaded = false;
        }
    }

    loadSprite(name, src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.sprites[name] = img;
                resolve();
            };
            img.onerror = () => {
                console.warn(`Failed to load sprite: ${name}`);
                reject();
            };
            img.src = src;
        });
    }

    drawSprite(name, x, y, width, height, frame = 0, frameWidth = null, frameHeight = null) {
        if (!this.loaded || !this.sprites[name]) {
            // Fallback to colored rectangles if sprites aren't loaded
            this.game.ctx.fillStyle = this.getFallbackColor(name);
            this.game.ctx.fillRect(x, y, width, height);
            return;
        }

        const sprite = this.sprites[name];
        frameWidth = frameWidth || sprite.width;
        frameHeight = frameHeight || sprite.height;

        this.game.ctx.drawImage(
            sprite,
            frame * frameWidth, 0,
            frameWidth, frameHeight,
            x, y,
            width, height
        );
    }

    getFallbackColor(spriteName) {
        const colors = {
            dog_run: '#4CAF50',
            dog_jump: '#4CAF50',
            coin: '#FFD700',
            guard: '#FF0000',
            camera: '#808080'
        };
        return colors[spriteName] || '#000000';
    }
}
