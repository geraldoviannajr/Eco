class RollDarkness extends Enemy {
    duration = 500; // Duração do eco
    expansionSpeed = 4;
    lineCount = 24;
    _soundChasing = null;
    _soundChasingId = null;
    _soundVisible = null;
    _soundEcho = "step"; // Som tocado ao emitir eco  
    _attackRadiusOffset = 3; 
    _attackForce = 10; 
    _hasEcho = false;
    
    constructor(x, y, name, radius = 5, speed = 0.8) {
        super(x, y, name, false, radius, speed);
    }

    draw() {
        if (!this.visible && !config.DEBUG) return;
        
        if (this.visible) 
        {
            const ctx = game.ctx;
            const cx = this.x - game.camera.x;
            const cy = this.y - game.camera.y;
            const time = performance.now() * 0.002;
            const lineCount = 18;
            const maxRadius = this.radius * 18;
            const rotation = (time / 2) * 0.1; // velocidade de rotação

            ctx.save();

            for (let i = 0; i < lineCount; i++) {
                // Ângulo base + rotação do conjunto
                const angle = (2 * Math.PI * i) / lineCount + rotation;
                // Raio da linha expandindo com o tempo
                const t = ((time + i * 0.13) % 1);
                const r = this.radius + t * (maxRadius - this.radius);
                const alpha = 0.8 * (1 - t);

                ctx.beginPath();
                ctx.moveTo(
                    cx + Math.cos(angle) * this.radius,
                    cy + Math.sin(angle) * this.radius
                );
                ctx.lineTo(
                    cx + Math.cos(angle) * r,
                    cy + Math.sin(angle) * r
                );
                ctx.strokeStyle = `rgba(255,0,0,${alpha})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            ctx.restore();                 
        }
        if (config.DEBUG) super.draw();
    }
}