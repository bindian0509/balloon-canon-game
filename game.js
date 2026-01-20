// ====================================
// BALLOON SHOOTER GAME
// ====================================

// Constants
const BALLOON_TYPES = {
    red: { color: '#FF4444', speed: 25, health: 1, score: 100 },
    blue: { color: '#4444FF', speed: 30, health: 1, score: 150 },
    yellow: { color: '#FFDD44', speed: 20, health: 2, score: 200 },
    green: { color: '#44FF44', speed: 22, health: 1, score: 250, powerup: true },
    purple: { color: '#AA44FF', speed: 35, health: 1, score: 300, zigzag: true },
    rainbow: { color: 'rainbow', speed: 28, health: 3, score: 500 }
};

// ====================================
// IMPACT EFFECT CLASS
// ====================================
class ImpactEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.maxRadius = 25;
        this.lifetime = 0.3;
        this.maxLifetime = 0.3;
        this.rings = [
            { radius: 0, alpha: 1 },
            { radius: 0, alpha: 0.7 },
            { radius: 0, alpha: 0.4 }
        ];
    }

    update(delta) {
        this.lifetime -= delta;
        const progress = 1 - (this.lifetime / this.maxLifetime);

        this.rings.forEach((ring, index) => {
            ring.radius = progress * this.maxRadius * (1 + index * 0.3);
            ring.alpha = (1 - progress) * (1 - index * 0.3);
        });
    }

    draw(ctx) {
        ctx.save();

        this.rings.forEach(ring => {
            ctx.globalAlpha = ring.alpha;
            ctx.strokeStyle = '#FFE66D';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(this.x, this.y, ring.radius, 0, Math.PI * 2);
            ctx.stroke();

            // Inner glow
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // Flash at center
        const centerAlpha = (this.lifetime / this.maxLifetime) * 0.8;
        ctx.globalAlpha = centerAlpha;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    isDead() {
        return this.lifetime <= 0;
    }
}

// ====================================
// PARTICLE CLASS
// ====================================
class Particle {
    constructor(x, y, vx, vy, color, size = 3) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.alpha = 1;
        this.lifetime = 0.5;
        this.maxLifetime = 0.5;
        this.gravity = 200;
    }

    update(delta) {
        this.x += this.vx * delta;
        this.y += this.vy * delta;
        this.vy += this.gravity * delta;
        this.lifetime -= delta;
        this.alpha = Math.max(0, this.lifetime / this.maxLifetime);
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.lifetime <= 0;
    }
}

// ====================================
// BULLET CLASS (CANNONBALL)
// ====================================
class Bullet {
    constructor(x, y, angle, speed = 600) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.radius = 8;
        this.lifetime = 2;
        this.rotation = 0;
    }

    update(delta) {
        this.x += this.vx * delta;
        this.y += this.vy * delta;
        this.lifetime -= delta;
        this.rotation += delta * 10;
    }

    draw(ctx) {
        ctx.save();

        // Draw cannonball shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(this.x + 2, this.y + 2, this.radius * 0.8, this.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw cannonball with 3D effect
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3,
            this.y - this.radius * 0.3,
            this.radius * 0.2,
            this.x,
            this.y,
            this.radius
        );
        gradient.addColorStop(0, '#555');
        gradient.addColorStop(0.6, '#222');
        gradient.addColorStop(1, '#000');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Add highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    isDead() {
        return this.lifetime <= 0;
    }
}

// ====================================
// BALLOON CLASS
// ====================================
class Balloon {
    constructor(x, y, type, level = 1) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.config = BALLOON_TYPES[type];
        this.radius = 25;
        this.speed = this.config.speed + (level * 2);
        this.health = this.config.health;
        this.maxHealth = this.config.health;
        this.score = this.config.score;
        this.color = this.config.color;
        this.wobbleOffset = Math.random() * Math.PI * 2;
        this.floatOffset = 0;
        this.zigzagOffset = 0;
    }

    update(delta) {
        this.y += this.speed * delta;
        this.floatOffset += delta * 2;

        if (this.config.zigzag) {
            this.zigzagOffset += delta * 3;
            this.x += Math.sin(this.zigzagOffset) * 2;
        } else {
            this.x += Math.sin(this.floatOffset + this.wobbleOffset) * 0.5;
        }
    }

    draw(ctx) {
        ctx.save();

        if (this.type === 'rainbow') {
            this.drawRainbowBalloon(ctx);
        } else {
            this.drawRegularBalloon(ctx);
        }

        this.drawString(ctx);
        ctx.restore();
    }

    drawRegularBalloon(ctx) {
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3,
            this.y - this.radius * 0.3,
            this.radius * 0.1,
            this.x,
            this.y,
            this.radius
        );

        const lightColor = this.lightenColor(this.color, 40);
        const darkColor = this.darkenColor(this.color, 20);

        gradient.addColorStop(0, lightColor);
        gradient.addColorStop(0.7, this.color);
        gradient.addColorStop(1, darkColor);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        this.drawShine(ctx);
    }

    drawRainbowBalloon(ctx) {
        const colors = ['#FF6B6B', '#FFE66D', '#4ECDC4', '#A8DADC', '#AA44FF'];
        const stripeHeight = (this.radius * 2) / colors.length;

        for (let i = 0; i < colors.length; i++) {
            const gradient = ctx.createRadialGradient(
                this.x - this.radius * 0.3,
                this.y - this.radius * 0.3,
                this.radius * 0.1,
                this.x,
                this.y,
                this.radius
            );

            gradient.addColorStop(0, this.lightenColor(colors[i], 40));
            gradient.addColorStop(0.7, colors[i]);
            gradient.addColorStop(1, this.darkenColor(colors[i], 20));

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius - i * 3, 0, Math.PI * 2);
            ctx.fill();
        }

        this.drawShine(ctx);
    }

    drawShine(ctx) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(
            this.x - this.radius * 0.4,
            this.y - this.radius * 0.4,
            this.radius * 0.3,
            this.radius * 0.5,
            -0.5,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    drawString(ctx) {
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.radius);
        ctx.quadraticCurveTo(
            this.x + 5,
            this.y + this.radius + 15,
            this.x,
            this.y + this.radius + 30
        );
        ctx.stroke();

        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.radius + 30, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    lightenColor(color, amount) {
        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.min(255, ((num >> 16) & 0xFF) + amount);
        const g = Math.min(255, ((num >> 8) & 0xFF) + amount);
        const b = Math.min(255, (num & 0xFF) + amount);
        return `rgb(${r}, ${g}, ${b})`;
    }

    darkenColor(color, amount) {
        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.max(0, ((num >> 16) & 0xFF) - amount);
        const g = Math.max(0, ((num >> 8) & 0xFF) - amount);
        const b = Math.max(0, (num & 0xFF) - amount);
        return `rgb(${r}, ${g}, ${b})`;
    }
}

// ====================================
// CANNON CLASS
// ====================================
class Cannon {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 70;
        this.height = 40;
        this.angle = -Math.PI / 2;
        this.barrelLength = 60;
        this.barrelWidth = 24;
        this.moveSpeed = 300;
    }

    move(direction, delta, canvasWidth) {
        this.x += direction * this.moveSpeed * delta;
        this.x = Math.max(this.width / 2, Math.min(canvasWidth - this.width / 2, this.x));
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Draw base platform
        ctx.fillStyle = '#4A4A4A';
        ctx.fillRect(-this.width / 2, -5, this.width, 10);
        ctx.strokeStyle = '#2A2A2A';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width / 2, -5, this.width, 10);

        // Draw cannon mount (rounded base)
        const mountGradient = ctx.createRadialGradient(0, -5, 5, 0, -5, 25);
        mountGradient.addColorStop(0, '#666');
        mountGradient.addColorStop(1, '#333');
        ctx.fillStyle = mountGradient;
        ctx.beginPath();
        ctx.arc(0, -5, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw wheel details
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6;
            const wx = Math.cos(angle) * 18;
            const wy = -5 + Math.sin(angle) * 18;
            ctx.fillStyle = '#555';
            ctx.beginPath();
            ctx.arc(wx, wy, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw barrel (pointing upward)
        ctx.save();
        ctx.rotate(this.angle);

        // Barrel body with metallic gradient
        const barrelGradient = ctx.createLinearGradient(
            -this.barrelWidth / 2, 0,
            this.barrelWidth / 2, 0
        );
        barrelGradient.addColorStop(0, '#3A3A3A');
        barrelGradient.addColorStop(0.3, '#555');
        barrelGradient.addColorStop(0.5, '#666');
        barrelGradient.addColorStop(0.7, '#555');
        barrelGradient.addColorStop(1, '#3A3A3A');

        ctx.fillStyle = barrelGradient;
        ctx.beginPath();
        ctx.roundRect(-this.barrelWidth / 2, -this.barrelLength, this.barrelWidth, this.barrelLength, 4);
        ctx.fill();
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Barrel rings for detail
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 3;
        for (let i = 1; i <= 3; i++) {
            const ringY = -this.barrelLength + (i * this.barrelLength / 4);
            ctx.beginPath();
            ctx.moveTo(-this.barrelWidth / 2, ringY);
            ctx.lineTo(this.barrelWidth / 2, ringY);
            ctx.stroke();
        }

        // Barrel opening (dark circle at the end)
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(0, -this.barrelLength, this.barrelWidth / 2 - 2, 0, Math.PI * 2);
        ctx.fill();

        // Inner barrel highlight
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Muzzle rim
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, -this.barrelLength, this.barrelWidth / 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
        ctx.restore();
    }
}

// ====================================
// SOUND MANAGER CLASS
// ====================================
class SoundManager {
    constructor() {
        this.enabled = true;
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            this.enabled = false;
        }
    }

    play(soundName) {
        if (!this.enabled || !this.context) return;

        try {
            if (soundName === 'pop') this.createPopSound();
            else if (soundName === 'shoot') this.createShootSound();
        } catch (e) {
            console.warn('Sound playback failed:', e);
        }
    }

    createPopSound() {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.connect(gain);
        gain.connect(this.context.destination);

        osc.frequency.setValueAtTime(800, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.context.currentTime + 0.1);

        gain.gain.setValueAtTime(0.2, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);

        osc.start(this.context.currentTime);
        osc.stop(this.context.currentTime + 0.1);
    }

    createShootSound() {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.connect(gain);
        gain.connect(this.context.destination);

        osc.type = 'square';
        osc.frequency.value = 440;

        gain.gain.setValueAtTime(0.1, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05);

        osc.start(this.context.currentTime);
        osc.stop(this.context.currentTime + 0.05);
    }
}

// ====================================
// LEADERBOARD MANAGER CLASS
// ====================================
class LeaderboardManager {
    constructor() {
        this.storageKey = 'balloonShooterLeaderboard';
        this.maxEntries = 10;
    }

    getScores() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
    }

    addScore(name, score, level) {
        const scores = this.getScores();
        const timestamp = new Date().toISOString();

        scores.push({
            name: name.trim() || 'PLAYER',
            score: score,
            level: level,
            timestamp: timestamp
        });

        scores.sort((a, b) => b.score - a.score);

        const trimmed = scores.slice(0, this.maxEntries);
        localStorage.setItem(this.storageKey, JSON.stringify(trimmed));

        return trimmed.findIndex(s => s.score === score && s.timestamp === timestamp) + 1;
    }

    isHighScore(score) {
        const scores = this.getScores();
        if (scores.length < this.maxEntries) return true;
        return score > scores[scores.length - 1].score;
    }

    getRank(score) {
        const scores = this.getScores();
        let rank = 1;
        for (const entry of scores) {
            if (score > entry.score) break;
            rank++;
        }
        return rank;
    }
}

// ====================================
// MAIN GAME CLASS
// ====================================
class BalloonGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.gameState = 'menu';
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.combo = 1;
        this.comboTimer = 0;

        this.cannon = null;
        this.balloons = [];
        this.bullets = [];
        this.particles = [];
        this.impacts = [];

        this.keys = {};
        this.lastShot = 0;
        this.fireRate = 250;

        this.spawnTimer = 0;
        this.spawnInterval = 1500;
        this.baseSpeed = 20;

        this.lastTime = 0;
        this.animationId = null;

        this.soundManager = new SoundManager();
        this.leaderboard = new LeaderboardManager();

        this.init();
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    init() {
        this.setupInput();
        this.setupButtons();
        this.gameLoop(0);
    }

    setupInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            if (e.code === 'Escape' && this.gameState === 'playing') {
                this.pause();
            }

            if (e.code === 'Space') e.preventDefault();
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    setupButtons() {
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('resume-btn').addEventListener('click', () => this.resume());
        document.getElementById('menu-btn').addEventListener('click', () => this.showMenu());
        document.getElementById('restart-btn').addEventListener('click', () => this.startGame());
        document.getElementById('menu-btn-2').addEventListener('click', () => this.showMenu());
        document.getElementById('view-leaderboard-btn').addEventListener('click', () => this.showLeaderboard());
        document.getElementById('submit-score-btn').addEventListener('click', () => this.submitHighScore());
        document.getElementById('back-to-menu-btn').addEventListener('click', () => this.showMenu());

        // Allow Enter key to submit name
        document.getElementById('player-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitHighScore();
            }
        });
    }

    startGame() {
        this.reset();
        this.transitionTo('playing');
    }

    pause() {
        if (this.gameState === 'playing') {
            this.transitionTo('paused');
        }
    }

    resume() {
        if (this.gameState === 'paused') {
            this.transitionTo('playing');
            this.lastTime = performance.now();
        }
    }

    showMenu() {
        this.transitionTo('menu');
    }

    gameOver() {
        // Check if this is a high score
        if (this.leaderboard.isHighScore(this.score)) {
            document.getElementById('entry-score').textContent = this.score;
            const rank = this.leaderboard.getRank(this.score);
            document.getElementById('entry-rank').textContent = `#${rank}`;
            document.getElementById('player-name').value = '';
            this.transitionTo('highscore-entry');

            // Focus on name input
            setTimeout(() => {
                document.getElementById('player-name').focus();
            }, 100);
        } else {
            document.getElementById('final-score').textContent = this.score;
            document.getElementById('final-level').textContent = this.level;
            this.transitionTo('gameover');
        }
    }

    transitionTo(newState) {
        // Hide current state
        if (this.gameState === 'menu') {
            document.getElementById('menu-screen').classList.add('hidden');
        } else if (this.gameState === 'paused') {
            document.getElementById('pause-screen').classList.add('hidden');
        } else if (this.gameState === 'gameover') {
            document.getElementById('gameover-screen').classList.add('hidden');
        } else if (this.gameState === 'highscore-entry') {
            document.getElementById('highscore-entry-screen').classList.add('hidden');
        } else if (this.gameState === 'leaderboard') {
            document.getElementById('leaderboard-screen').classList.add('hidden');
        } else if (this.gameState === 'playing') {
            document.getElementById('hud').classList.add('hidden');
        }

        this.gameState = newState;

        // Show new state
        if (newState === 'menu') {
            document.getElementById('menu-screen').classList.remove('hidden');
        } else if (newState === 'paused') {
            document.getElementById('pause-screen').classList.remove('hidden');
        } else if (newState === 'gameover') {
            document.getElementById('gameover-screen').classList.remove('hidden');
        } else if (newState === 'highscore-entry') {
            document.getElementById('highscore-entry-screen').classList.remove('hidden');
        } else if (newState === 'leaderboard') {
            document.getElementById('leaderboard-screen').classList.remove('hidden');
            this.renderLeaderboard();
        } else if (newState === 'playing') {
            document.getElementById('hud').classList.remove('hidden');
        }
    }

    reset() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.combo = 1;
        this.comboTimer = 0;
        this.cannon = new Cannon(this.canvas.width / 2, this.canvas.height - 80);
        this.balloons = [];
        this.bullets = [];
        this.particles = [];
        this.impacts = [];
        this.spawnTimer = 0;
        this.spawnInterval = 1500;
        this.updateDifficulty();
        this.updateHUD();
    }

    gameLoop(timestamp) {
        const delta = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();

        if (this.gameState === 'playing') {
            this.update(delta);
            this.render();
        } else if (this.gameState === 'paused') {
            this.render();
        }

        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    update(delta) {
        this.handleInput(delta);
        this.updateSpawning(delta);

        this.balloons.forEach(b => b.update(delta));
        this.bullets.forEach(b => b.update(delta));
        this.particles.forEach(p => p.update(delta));
        this.impacts.forEach(i => i.update(delta));

        this.checkCollisions();
        this.cleanup();
        this.checkLevelUp();
        this.updateCombo(delta);
    }

    handleInput(delta) {
        if (!this.cannon) return;

        if (this.keys['ArrowLeft']) {
            this.cannon.move(-1, delta, this.canvas.width);
        }
        if (this.keys['ArrowRight']) {
            this.cannon.move(1, delta, this.canvas.width);
        }
        if (this.keys['Space']) {
            this.shoot();
        }
    }

    shoot() {
        if (!this.cannon) return;

        const now = Date.now();
        if (now - this.lastShot < this.fireRate) return;
        this.lastShot = now;

        const bullet = new Bullet(
            this.cannon.x,
            this.cannon.y - this.cannon.barrelLength,
            this.cannon.angle
        );
        this.bullets.push(bullet);
        this.soundManager.play('shoot');

        this.createMuzzleFlash(this.cannon.x, this.cannon.y - this.cannon.barrelLength);
    }

    createMuzzleFlash(x, y) {
        // Smoke particles
        for (let i = 0; i < 8; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
            const speed = 80 + Math.random() * 60;
            const gray = Math.floor(100 + Math.random() * 100);
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                `rgb(${gray}, ${gray}, ${gray})`,
                4 + Math.random() * 3
            ));
        }

        // Fire/flash particles
        for (let i = 0; i < 6; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
            const speed = 100 + Math.random() * 80;
            const colors = ['#FF6B00', '#FFD700', '#FFA500', '#FFFF00'];
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                colors[Math.floor(Math.random() * colors.length)],
                3 + Math.random() * 2
            ));
        }
    }

    updateSpawning(delta) {
        this.spawnTimer += delta * 1000;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnBalloon();
            this.spawnTimer = 0;
        }
    }

    spawnBalloon() {
        const type = this.selectBalloonType();
        const x = 50 + Math.random() * (this.canvas.width - 100);
        const balloon = new Balloon(x, -50, type, this.level);
        this.balloons.push(balloon);
    }

    selectBalloonType() {
        const weights = this.getBalloonWeights();
        const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;

        for (const [type, weight] of Object.entries(weights)) {
            random -= weight;
            if (random <= 0) return type;
        }
        return 'red';
    }

    getBalloonWeights() {
        if (this.level < 3) {
            return { red: 0.6, blue: 0.3, yellow: 0.1 };
        } else if (this.level < 6) {
            return { red: 0.3, blue: 0.2, yellow: 0.2, green: 0.15, purple: 0.15 };
        } else {
            return { red: 0.2, blue: 0.2, yellow: 0.15, green: 0.15, purple: 0.15, rainbow: 0.15 };
        }
    }

    checkCollisions() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];

            for (let j = this.balloons.length - 1; j >= 0; j--) {
                const balloon = this.balloons[j];

                if (Math.abs(bullet.x - balloon.x) > balloon.radius + 10) continue;
                if (Math.abs(bullet.y - balloon.y) > balloon.radius + 10) continue;

                const dx = bullet.x - balloon.x;
                const dy = bullet.y - balloon.y;
                const distSq = dx * dx + dy * dy;
                const radiusSum = bullet.radius + balloon.radius;

                if (distSq < radiusSum * radiusSum) {
                    this.handleBalloonHit(balloon, j);
                    this.bullets.splice(i, 1);
                    break;
                }
            }
        }

        for (let i = this.balloons.length - 1; i >= 0; i--) {
            const balloon = this.balloons[i];
            if (balloon.y - balloon.radius > this.canvas.height) {
                this.handleBalloonMissed(balloon, i);
            }
        }
    }

    handleBalloonHit(balloon, index) {
        balloon.health--;

        // Create impact effect on hit
        this.impacts.push(new ImpactEffect(balloon.x, balloon.y));

        if (balloon.health <= 0) {
            this.createPopEffect(balloon.x, balloon.y, balloon.color, balloon.type);
            this.score += balloon.score * this.combo;
            this.combo = Math.min(10, this.combo + 1);
            this.comboTimer = 3;
            this.balloons.splice(index, 1);
            this.soundManager.play('pop');
            this.updateHUD();
        }
    }

    handleBalloonMissed(balloon, index) {
        this.balloons.splice(index, 1);
        this.lives--;
        this.combo = 1;
        this.comboTimer = 0;
        this.updateHUD();

        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    createPopEffect(x, y, color, type) {
        const particleCount = type === 'rainbow' ? 30 : 20;
        const colors = type === 'rainbow'
            ? ['#FF6B6B', '#FFE66D', '#4ECDC4', '#A8DADC', '#AA44FF']
            : [color];

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 100 + Math.random() * 100;
            const particleColor = colors[Math.floor(Math.random() * colors.length)];

            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 50,
                particleColor,
                3 + Math.random() * 3
            ));
        }
    }

    updateCombo(delta) {
        if (this.comboTimer > 0) {
            this.comboTimer -= delta;
            if (this.comboTimer <= 0) {
                this.combo = Math.max(1, this.combo - 1);
                if (this.combo > 1) {
                    this.comboTimer = 3;
                }
                this.updateHUD();
            }
        }
    }

    cleanup() {
        this.bullets = this.bullets.filter(b => !b.isDead() && this.isOnScreen(b));
        this.balloons = this.balloons.filter(b => b.y < this.canvas.height + 100);
        this.particles = this.particles.filter(p => !p.isDead());
        this.impacts = this.impacts.filter(i => !i.isDead());
    }

    isOnScreen(obj) {
        return obj.x >= -50 && obj.x <= this.canvas.width + 50 &&
               obj.y >= -50 && obj.y <= this.canvas.height + 50;
    }

    checkLevelUp() {
        const scoreThreshold = this.level * 1000;
        if (this.score >= scoreThreshold) {
            this.level++;
            this.updateDifficulty();
            this.showLevelUpNotification();
            this.updateHUD();
        }
    }

    updateDifficulty() {
        this.spawnInterval = Math.max(500, 1500 - (this.level * 80));
        this.baseSpeed = 20 + (this.level * 3);
        this.fireRate = Math.max(150, 250 - (this.level * 5));
    }

    showLevelUpNotification() {
        const notification = document.getElementById('levelup-notification');
        notification.classList.remove('hidden');
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 200);
        }, 2000);
    }

    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;

        const comboEl = document.getElementById('combo');
        comboEl.textContent = `x${this.combo}`;
        if (this.combo > 1) {
            comboEl.classList.add('pulse');
            setTimeout(() => comboEl.classList.remove('pulse'), 200);
        }

        const livesContainer = document.getElementById('lives-container');
        livesContainer.innerHTML = '';
        for (let i = 0; i < this.lives; i++) {
            const heart = document.createElement('span');
            heart.className = 'life';
            heart.textContent = '❤️';
            livesContainer.appendChild(heart);
        }
    }

    render() {
        if (this.cannon) this.cannon.draw(this.ctx);
        this.bullets.forEach(b => b.draw(this.ctx));
        this.balloons.forEach(b => b.draw(this.ctx));
        this.impacts.forEach(i => i.draw(this.ctx));
        this.particles.forEach(p => p.draw(this.ctx));
    }

    submitHighScore() {
        const nameInput = document.getElementById('player-name');
        const playerName = nameInput.value.trim() || 'PLAYER';

        this.leaderboard.addScore(playerName, this.score, this.level);

        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-level').textContent = this.level;
        this.transitionTo('gameover');
    }

    showLeaderboard() {
        this.transitionTo('leaderboard');
    }

    renderLeaderboard() {
        const listContainer = document.getElementById('leaderboard-list');
        const scores = this.leaderboard.getScores();

        if (scores.length === 0) {
            listContainer.innerHTML = '<div class="leaderboard-empty">No high scores yet!<br>Be the first to set a record!</div>';
            return;
        }

        listContainer.innerHTML = '';

        scores.forEach((entry, index) => {
            const row = document.createElement('div');
            row.className = 'leaderboard-entry';

            const rank = document.createElement('span');
            rank.className = 'lb-rank';
            if (index === 0) {
                rank.className += ' medal';
                rank.textContent = '🥇';
            } else if (index === 1) {
                rank.className += ' medal';
                rank.textContent = '🥈';
            } else if (index === 2) {
                rank.className += ' medal';
                rank.textContent = '🥉';
            } else {
                rank.textContent = `#${index + 1}`;
            }

            const name = document.createElement('span');
            name.className = 'lb-name';
            name.textContent = entry.name;

            const score = document.createElement('span');
            score.className = 'lb-score';
            score.textContent = entry.score.toLocaleString();

            const level = document.createElement('span');
            level.className = 'lb-level';
            level.textContent = entry.level;

            row.appendChild(rank);
            row.appendChild(name);
            row.appendChild(score);
            row.appendChild(level);

            listContainer.appendChild(row);
        });
    }

    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#8B7355';
        this.ctx.fillRect(0, this.canvas.height - 60, this.canvas.width, 60);
        this.ctx.fillStyle = '#6B9F3E';
        this.ctx.fillRect(0, this.canvas.height - 60, this.canvas.width, 10);
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new BalloonGame();
});
