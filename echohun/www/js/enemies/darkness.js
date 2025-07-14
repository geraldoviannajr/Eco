class Darkness extends Enemy {
    speed = 0.3;
    duration = 1300; // Duração do eco
    expansionSpeed = 4;
    lineCount = 24;
    _soundChasing = null;
    _soundChasingId = null;
    _soundVisible = null;
    _soundEcho = "step"; // Som tocado ao emitir eco  
    _attackRadiusOffset = 3; 
    _attackForce = 10; 
    _hasEcho = true;
    
    constructor(x, y, name, radius = 5, speed = 0.8) { super(x, y, name, false, radius, speed); }

    /*
    draw() {
        if (!this.visible && !config.DEBUG) return;

        const ctx = game.ctx;
        const cx = this.x - game.camera.x;
        const cy = this.y - game.camera.y;
        const lineCount = 20;
        const groupSize = Math.floor(lineCount / 4);
        const maxRadius = this.radius * 14;
        const now = performance.now() * 0.001;

        ctx.save();

        // Define grupos com tempos de início diferentes
        for (let g = 0; g < 4; g++) {
            // Cada grupo começa com um pequeno atraso
            const groupStart = (now + g * 0.7) % 3;
            for (let i = 0; i < groupSize; i++) {
                // Ângulo da linha
                const idx = g * groupSize + i;
                const angle = (2 * Math.PI * idx) / lineCount;
                // Velocidade aleatória para cada linha
                const speed = 0.7 + Math.random() * 0.8;
                // Progresso da linha (0 a 1)
                let t = (groupStart * speed + i * 0.1) % 1;
                // Faz o grupo aparecer um pouco antes do anterior terminar
                if (groupStart > 0.8) t = (groupStart * speed + i * 0.1 + 0.5) % 1;
                const r = this.radius + t * (maxRadius - this.radius);
                const alpha = 0.7 * (1 - t);

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
        }

        ctx.restore();

        if (config.DEBUG) super.draw();
    }
    */
}