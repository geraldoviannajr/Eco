class PUPHP extends PowerUp {
    caption = 'HP';
    text = 'HP';
    description = game.language.getResource('powerup_hp_desc');
    increase = 50;

    constructor(x, y) {
        super(x, y);
        this.name = 'PUPHP';
        this.radius = 1;
        this.createCircleHitbox(0, 0, this.radius +5);
        this._echoEmittedThisCycle = false;
    }

    update() {
        super.update();
        if (this.visible === false) return;

        const fadeDuration = 1000;
        const visibleDuration = 200;
        const hiddenDuration = 2000;
        const cycleDuration = fadeDuration + visibleDuration + fadeDuration + hiddenDuration;

        const now = window.game.gameTime;
        const t = now % cycleDuration;

        // Sincroniza eco com início da fase visível
        if (t >= fadeDuration && t < fadeDuration + visibleDuration) {
            if (!this._echoEmittedThisCycle) {
                this.emitEcho();
                this._echoEmittedThisCycle = true;
            }
        } else {
            this._echoEmittedThisCycle = false;
        }
    }

    emitEcho() {
        const lineCount = (typeof config.ECHO_LINE_COUNT !== 'undefined') ? config.ECHO_LINE_COUNT : 24;
        const orange = [255, 180, 60, 1]; // laranja suave
        for (let i = 0; i < lineCount; i++) {
            const angle = ((Math.PI * 2) / lineCount) * i;
            if (isWallColliding(this.x, this.y, this.radius)) continue;
            const line = new EchoLine(this.x, this.y, angle, "powerup", null, 3);
            line.color = orange;
            line.lineWidth = 1; // mais fina
            game.lines.push(line);
        }
        this.playSound();
    }

    draw() {
        super.draw();
        if (this.visible === false) return;
        const ctx = game.ctx;
        const camX = this.x - game.camera.x;
        const camY = this.y - game.camera.y;

        const fadeDuration = 1000;
        const visibleDuration = 200;
        const hiddenDuration = 2000;
        const cycleDuration = fadeDuration + visibleDuration + fadeDuration + hiddenDuration;

        const now = window.game.gameTime;
        const t = now % cycleDuration;
        let alpha = 0;
        if (t < fadeDuration) {
            alpha = t / fadeDuration;
        } else if (t < fadeDuration + visibleDuration) {
            alpha = 1;
        } else if (t < fadeDuration + visibleDuration + fadeDuration) {
            alpha = 1 - ((t - fadeDuration - visibleDuration) / fadeDuration);
        } else {
            alpha = 0;
        }
        if (alpha <= 0.01) return;

        ctx.save();
        ctx.globalAlpha = 0.18 + 0.82 * alpha;
        ctx.beginPath();
        ctx.arc(camX, camY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,180,60,1)';
        ctx.shadowColor = '#ffdca0';
        ctx.shadowBlur = 18 + 8 * alpha;
        ctx.fill();
        // Halo externo
        ctx.beginPath();
        ctx.arc(camX, camY, this.radius + 7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,180,60,0.13)';
        ctx.shadowColor = '#ffdca0';
        ctx.shadowBlur = 24 * alpha;
        ctx.fill();
        ctx.restore();
    }    

    useIt() {
        super.useIt();
        if (this.player != null) {
            this.player.hp += this.increase;
        }
    }
}
